import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  EncryptedFileGoogleDriveCredentialRepository,
  FileGoogleDriveAuthorizationStateRepository,
  FileGoogleDriveMetadataRepository,
  GoogleDriveConnectorService,
  assessGoogleDriveQuestionFreshness,
  rankGoogleDrivePassages,
  googleDriveCanonicalEvidenceIdentity,
  googleDriveExternalSourceIdentity,
  googleDrivePassageIdentity,
  googleDriveQuestionAdmissionIdentity,
  normalizeExtractedContent,
  type GoogleDriveConnectorMetadata,
  type GoogleDriveCredential,
  type GoogleDriveCredentialRepository,
  type GoogleDriveAuthorizationStateRepository,
  type GoogleDriveMetadataRepository,
} from "../../product/connectors/google-drive";
import { productWorkspaceFixtures } from "../../product/workflow/fixtures";
import { onboardingTestOrganizationId } from "../../lib/onboarding/testing";

const mode = process.argv[2] ?? "all";
const NOW = "2026-07-30T12:00:00.000Z";
const USER = "user_google_drive_test";
const ORGANIZATION = onboardingTestOrganizationId({
  consumerId: USER,
  requestId: "google-drive-connector-validation",
});
const OTHER_ORGANIZATION = onboardingTestOrganizationId({
  consumerId: USER,
  requestId: "google-drive-connector-other-organization",
});
const SOURCE = "google-drive-source-test";
const FOLDER = "google-drive-folder-test";

class MemoryCredentials implements GoogleDriveCredentialRepository {
  value: GoogleDriveCredential | null = {
    accessToken: "test-access",
    refreshToken: "test-refresh",
    expiresAt: "2026-07-30T13:00:00.000Z",
    scopes: [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "openid",
    ],
  };
  async read() { return this.value; }
  async write(_id: string, value: GoogleDriveCredential) { this.value = value; }
  async delete() { const existed = Boolean(this.value); this.value = null; return existed; }
}

class MemoryMetadata implements GoogleDriveMetadataRepository {
  value: GoogleDriveConnectorMetadata = {
    sources: [{
      version: "1", id: SOURCE, organizationId: ORGANIZATION,
      authorizingUserId: USER, accountLabel: "t***@example.com",
      status: "connected", grantedScopes: [
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "openid",
      ], authorizationExpiresAt: "2026-07-30T13:00:00.000Z",
      connectedAt: NOW, revokedAt: null,
    }],
    folders: [{
      id: FOLDER, sourceId: SOURCE, organizationId: ORGANIZATION,
      googleFolderId: "folder-google-id", displayName: "Test folder", driveId: null,
      includeNested: true, connectedAt: NOW, lastSynchronizedAt: null,
      synchronizationCursor: null, revokedAt: null,
      limitations: ["Shortcuts are not followed."],
    }],
    files: [],
    passages: [],
    sourceVersions: [],
  };
  async read() { return structuredClone(this.value); }
  async replace(value: GoogleDriveConnectorMetadata) { this.value = structuredClone(value); }
}

class MemoryAuthorizationStates {
  records = new Map<string, {
    stateDigest: string; userId: string; organizationId: string;
    issuedAt: string; expiresAt: string; consumedAt: string | null;
  }>();
  async create(record: {
    stateDigest: string; userId: string; organizationId: string;
    issuedAt: string; expiresAt: string; consumedAt: string | null;
  }) {
    this.records.set(record.stateDigest, structuredClone(record));
  }
  async inspect(stateDigest: string) {
    return structuredClone(this.records.get(stateDigest) ?? null);
  }
  async consume(stateDigest: string, consumedAt: string) {
    const record = this.records.get(stateDigest);
    if (!record) return "missing" as const;
    if (record.consumedAt) return "already-consumed" as const;
    if (Date.parse(record.expiresAt) < Date.parse(consumedAt)) return "expired" as const;
    this.records.set(stateDigest, { ...record, consumedAt });
    return "consumed" as const;
  }
}

function fixtureWorkspace() {
  const workspace = structuredClone(productWorkspaceFixtures[0]!.workspace);
  workspace.question.id = "question-test";
  workspace.question.organizationId = ORGANIZATION;
  workspace.question.title = "Why are enterprise renewal rates declining?";
  workspace.question.text = workspace.question.title;
  workspace.modelState.organizationId = ORGANIZATION;
  return workspace;
}

function fakeApi(
  fileRevision = { value: 1 },
  relevantContent = {
    value:
      "Enterprise renewal rates declined after delayed customer support responses and unresolved contract issues.",
  },
) {
  const drive = {
    files: {
      list: async ({ q }: { q: string }) => ({
        data: {
          files: q.includes("folder-google-id") ? [{
            id: "file-relevant", name: "Enterprise renewal analysis.txt",
            mimeType: "text/plain", modifiedTime: `2026-07-2${fileRevision.value}T12:00:00.000Z`,
            version: String(fileRevision.value), md5Checksum: `digest-${fileRevision.value}`,
            parents: ["folder-google-id"],
          }, {
            id: "file-unrelated", name: "Office catering.txt",
            mimeType: "text/plain", modifiedTime: "2026-07-20T12:00:00.000Z",
            version: "1", md5Checksum: "digest-u", parents: ["folder-google-id"],
          }] : [],
          nextPageToken: null,
        },
      }),
      get: async ({ fileId }: { fileId: string }) => ({
        data: fileId === "file-relevant"
          ? Buffer.from(relevantContent.value)
          : Buffer.from("The office catering menu changed from sandwiches to salads."),
      }),
      export: async () => ({ data: "" }),
    },
  };
  return {
    drive: () => drive,
    refresh: async (credential: GoogleDriveCredential) => credential,
    authorizationUrl: (state: string) => `https://accounts.google.test/auth?state=${state}`,
    exchangeCode: async () => ({
      accessToken: "test-access", refreshToken: "test-refresh",
      expiresAt: "2026-07-30T13:00:00.000Z",
      scopes: [
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "openid",
      ],
    }),
    accountEmail: async () => "test@example.com",
    revoke: async () => undefined,
  };
}

function service(
  metadata = new MemoryMetadata(),
  credentials = new MemoryCredentials(),
  now = { value: NOW },
  authorizationStates: GoogleDriveAuthorizationStateRepository = new MemoryAuthorizationStates(),
  options: {
    authorize?: (input: { userId: string; organizationId: string }) => Promise<boolean>;
    stateSigningSecret?: string;
  } = {},
) {
  const revision = { value: 1 };
  const relevantContent = {
    value:
      "Enterprise renewal rates declined after delayed customer support responses and unresolved contract issues.",
  };
  const workspace = fixtureWorkspace();
  const admitted = new Set<string>();
  let runtimeRevision = 1;
  const productAdapter = {
    getQuestionWorkspace: async () => ({
      workspace,
      runtimeRevision: `r${runtimeRevision}`,
    }),
    contributeEvidence: async (input: {
      contribution: { idempotencyKey: string };
    }) => {
      if (!admitted.has(input.contribution.idempotencyKey)) {
        admitted.add(input.contribution.idempotencyKey);
        runtimeRevision += 1;
      }
      return { workspace, runtimeRevision: `r${runtimeRevision}` };
    },
    recordSearch: async () => {
      runtimeRevision += 1;
      return { workspace, runtimeRevision: `r${runtimeRevision}` };
    },
  };
  return {
    connector: new GoogleDriveConnectorService({
      api: fakeApi(revision, relevantContent) as never,
      credentials,
      metadata,
      authorizationStates,
      productAdapter,
      authorize: options.authorize ?? (async ({ userId, organizationId }) =>
        userId === USER && organizationId === ORGANIZATION),
      stateSigningSecret: options.stateSigningSecret
        ?? "test-only-state-secret-at-least-32-characters",
      now: () => now.value,
    }),
    metadata,
    credentials,
    revision,
    relevantContent,
    admitted,
    now,
  };
}

async function validateSpec() {
  const document = await readFile("docs/Product/WORKFLOW_ACCEPTANCE_SPEC.md", "utf8");
  for (const stage of [
    "Question", "Search", "Answer", "Confidence", "Improve confidence",
    "Decision", "Outcome", "Model learns", "New insight",
  ]) assert.match(document, new RegExp(`\\| ${stage.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\|`));
  assert.match(document, /Google folder search/);
  assert.match(document, /No frontend work may begin/);
}

async function validateRoadmap() {
  const gaps = await readFile("docs/Product/PRODUCT_GAPS.md", "utf8");
  const roadmap = await readFile("docs/Product/PRODUCT_ROADMAP.md", "utf8");
  for (let id = 5; id <= 16; id += 1) {
    assert.match(gaps, new RegExp(`GAP-A-${String(id).padStart(3, "0")}`));
  }
  assert.match(roadmap, /Ordered pre-wireframe backend program/);
  assert.match(roadmap, /Phase 6 — Insight completion/);
}

async function validateAuth() {
  const { connector, now } = service();
  await assert.rejects(
    connector.beginAuthorization({ userId: "wrong", organizationId: ORGANIZATION }),
    /access denied/,
  );
  const request = await connector.beginAuthorization({ userId: USER, organizationId: ORGANIZATION });
  assert.match(request.authorizationUrl, /^https:\/\/accounts\.google\.test/);
  await assert.rejects(
    connector.completeAuthorization({
      userId: USER, organizationId: ORGANIZATION, state: `${request.state}x`, code: "code",
    }),
    /signature-invalid/,
  );
  await assert.rejects(
    connector.completeAuthorization({
      userId: "wrong", organizationId: ORGANIZATION, state: request.state, code: "code",
    }),
    /access denied/,
  );
  await assert.rejects(
    connector.completeAuthorization({
      userId: USER, organizationId: OTHER_ORGANIZATION, state: request.state, code: "code",
    }),
    /access denied/,
  );

  const permissiveAuthorization = async () => true;
  const identityChecks = service(
    new MemoryMetadata(),
    new MemoryCredentials(),
    { value: NOW },
    new MemoryAuthorizationStates(),
    { authorize: permissiveAuthorization },
  );
  const identityRequest = await identityChecks.connector.beginAuthorization({
    userId: USER,
    organizationId: ORGANIZATION,
  });
  await assert.rejects(
    identityChecks.connector.completeAuthorization({
      userId: "user_other",
      organizationId: ORGANIZATION,
      state: identityRequest.state,
      code: "code",
    }),
    /user-mismatch/,
  );
  await assert.rejects(
    identityChecks.connector.completeAuthorization({
      userId: USER,
      organizationId: OTHER_ORGANIZATION,
      state: identityRequest.state,
      code: "code",
    }),
    /organization-mismatch/,
  );

  const missingState = service(
    new MemoryMetadata(),
    new MemoryCredentials(),
    { value: NOW },
    new MemoryAuthorizationStates(),
  );
  await assert.rejects(
    missingState.connector.completeAuthorization({
      userId: USER,
      organizationId: ORGANIZATION,
      state: request.state,
      code: "code",
    }),
    /missing/,
  );

  const signingMismatch = service(
    new MemoryMetadata(),
    new MemoryCredentials(),
    { value: NOW },
    new MemoryAuthorizationStates(),
    { stateSigningSecret: "different-test-state-secret-at-least-32-characters" },
  );
  await assert.rejects(
    signingMismatch.connector.completeAuthorization({
      userId: USER,
      organizationId: ORGANIZATION,
      state: request.state,
      code: "code",
    }),
    /signature-invalid/,
  );

  const validDiagnostic = await connector.diagnoseAuthorizationState({
    userId: USER,
    organizationId: ORGANIZATION,
    state: request.state,
  });
  assert.deepEqual(validDiagnostic, {
    statePresent: true,
    encodingValid: true,
    signatureValid: true,
    expired: false,
    userMatch: true,
    organizationMatch: true,
    alreadyConsumed: false,
    finalResult: "valid",
    reason: null,
  });
  now.value = "2026-07-30T12:11:00.000Z";
  assert.throws(() => connector.inspectAuthorizationState(request.state), /expired/);

  const replay = service();
  const replayRequest = await replay.connector.beginAuthorization({
    userId: USER,
    organizationId: ORGANIZATION,
  });
  await replay.connector.completeAuthorization({
    userId: USER,
    organizationId: ORGANIZATION,
    state: replayRequest.state,
    code: "code",
  });
  await assert.rejects(
    replay.connector.completeAuthorization({
      userId: USER,
      organizationId: ORGANIZATION,
      state: replayRequest.state,
      code: "code",
    }),
    /already-consumed/,
  );

  const sharedStates = new MemoryAuthorizationStates();
  const firstService = service(new MemoryMetadata(), new MemoryCredentials(), { value: NOW }, sharedStates);
  const secondService = service(new MemoryMetadata(), new MemoryCredentials(), { value: NOW }, sharedStates);
  const separated = await firstService.connector.beginAuthorization({
    userId: USER,
    organizationId: ORGANIZATION,
  });
  await secondService.connector.completeAuthorization({
    userId: USER,
    organizationId: ORGANIZATION,
    state: new URL(separated.authorizationUrl).searchParams.get("state")!,
    code: "code",
  });

  const deniedStates = new MemoryAuthorizationStates();
  const denied = service(new MemoryMetadata(), new MemoryCredentials(), { value: NOW }, deniedStates);
  const deniedRequest = await denied.connector.beginAuthorization({
    userId: USER,
    organizationId: ORGANIZATION,
  });
  await denied.connector.rejectAuthorization({
    userId: USER,
    organizationId: ORGANIZATION,
    state: deniedRequest.state,
  });
  await assert.rejects(
    denied.connector.rejectAuthorization({
      userId: USER,
      organizationId: ORGANIZATION,
      state: deniedRequest.state,
    }),
    /already-consumed/,
  );

  const concurrentStates = new MemoryAuthorizationStates();
  const concurrent = service(
    new MemoryMetadata(),
    new MemoryCredentials(),
    { value: NOW },
    concurrentStates,
  );
  const concurrentRequest = await concurrent.connector.beginAuthorization({
    userId: USER,
    organizationId: ORGANIZATION,
  });
  const attempts = await Promise.allSettled([
    concurrent.connector.rejectAuthorization({
      userId: USER, organizationId: ORGANIZATION, state: concurrentRequest.state,
    }),
    concurrent.connector.rejectAuthorization({
      userId: USER, organizationId: ORGANIZATION, state: concurrentRequest.state,
    }),
  ]);
  assert.equal(attempts.filter((attempt) => attempt.status === "fulfilled").length, 1);

  const persistedDirectory = await mkdtemp(join(tmpdir(), "discovery-google-oauth-state-"));
  const persistedPath = join(persistedDirectory, "states.json");
  try {
    const persistedFirst = service(
      new MemoryMetadata(),
      new MemoryCredentials(),
      { value: NOW },
      new FileGoogleDriveAuthorizationStateRepository(persistedPath),
    );
    const persistedRequest = await persistedFirst.connector.beginAuthorization({
      userId: USER,
      organizationId: ORGANIZATION,
    });
    const persistedSecond = service(
      new MemoryMetadata(),
      new MemoryCredentials(),
      { value: NOW },
      new FileGoogleDriveAuthorizationStateRepository(persistedPath),
    );
    assert.equal((await persistedSecond.connector.diagnoseAuthorizationState({
      userId: USER,
      organizationId: ORGANIZATION,
      state: persistedRequest.state,
    })).finalResult, "valid");
    await persistedSecond.connector.completeAuthorization({
      userId: USER,
      organizationId: ORGANIZATION,
      state: persistedRequest.state,
      code: "code",
    });

    const concurrentPersistedRequest = await persistedFirst.connector.beginAuthorization({
      userId: USER,
      organizationId: ORGANIZATION,
    });
    const persistedThird = service(
      new MemoryMetadata(),
      new MemoryCredentials(),
      { value: NOW },
      new FileGoogleDriveAuthorizationStateRepository(persistedPath),
    );
    const persistedAttempts = await Promise.allSettled([
      persistedSecond.connector.rejectAuthorization({
        userId: USER,
        organizationId: ORGANIZATION,
        state: concurrentPersistedRequest.state,
      }),
      persistedThird.connector.rejectAuthorization({
        userId: USER,
        organizationId: ORGANIZATION,
        state: concurrentPersistedRequest.state,
      }),
    ]);
    assert.equal(
      persistedAttempts.filter((attempt) => attempt.status === "fulfilled").length,
      1,
    );

    const repository = new FileGoogleDriveAuthorizationStateRepository(persistedPath);
    await repository.create({
      stateDigest: "expired-record",
      userId: USER,
      organizationId: ORGANIZATION,
      issuedAt: "2026-07-30T11:00:00.000Z",
      expiresAt: "2026-07-30T11:10:00.000Z",
      consumedAt: null,
    });
    await repository.create({
      stateDigest: "current-record",
      userId: USER,
      organizationId: ORGANIZATION,
      issuedAt: NOW,
      expiresAt: "2026-07-30T12:10:00.000Z",
      consumedAt: null,
    });
    assert.equal(await repository.inspect("expired-record"), null);
  } finally {
    await rm(persistedDirectory, { recursive: true, force: true });
  }
}

async function validateTokenSecurity() {
  const path = join(tmpdir(), `discovery-google-token-${process.pid}.json`);
  const repository = new EncryptedFileGoogleDriveCredentialRepository(
    path,
    Buffer.alloc(32, 7).toString("base64"),
  );
  await repository.write(SOURCE, {
    accessToken: "plaintext-access-secret",
    refreshToken: "plaintext-refresh-secret",
    expiresAt: NOW,
    scopes: ["drive.readonly"],
  });
  const bytes = await readFile(path, "utf8");
  assert.doesNotMatch(bytes, /plaintext-access-secret|plaintext-refresh-secret/);
  assert.equal((await repository.read(SOURCE))?.accessToken, "plaintext-access-secret");
  assert.equal(await repository.delete(SOURCE), true);
  await rm(path, { force: true });
}

async function validateSync() {
  const setup = service();
  const first = await setup.connector.synchronizeFolder({
    userId: USER, organizationId: ORGANIZATION, sourceId: SOURCE, folderId: FOLDER,
  });
  assert.deepEqual(first.newFiles, ["file-relevant", "file-unrelated"]);
  const second = await setup.connector.synchronizeFolder({
    userId: USER, organizationId: ORGANIZATION, sourceId: SOURCE, folderId: FOLDER,
  });
  assert.equal(second.newFiles.length, 0);
  assert.deepEqual(second.unchangedFiles, ["file-relevant", "file-unrelated"]);
  setup.revision.value = 2;
  const unchangedContentRevision = await setup.connector.synchronizeFolder({
    userId: USER, organizationId: ORGANIZATION, sourceId: SOURCE, folderId: FOLDER,
  });
  assert.deepEqual(
    unchangedContentRevision.unchangedContentRevisionFiles,
    ["file-relevant"],
  );
  assert.equal(unchangedContentRevision.changedFiles.length, 0);
  setup.revision.value = 3;
  setup.relevantContent.value += " Contract escalation ownership was reassigned.";
  const changed = await setup.connector.synchronizeFolder({
    userId: USER, organizationId: ORGANIZATION, sourceId: SOURCE, folderId: FOLDER,
  });
  assert.deepEqual(changed.changedFiles, ["file-relevant"]);
  assert.deepEqual(changed.changedContentRevisionFiles, ["file-relevant"]);
  assert.equal(setup.metadata.value.sourceVersions.length, 4);
}

async function validateSearch() {
  const setup = service();
  await setup.connector.synchronizeFolder({
    userId: USER, organizationId: ORGANIZATION, sourceId: SOURCE, folderId: FOLDER,
  });
  const result = await setup.connector.searchFolder({
    userId: USER, organizationId: ORGANIZATION, sourceId: SOURCE,
    folderIds: [FOLDER], questionId: "question-test",
  });
  assert.equal(result.receipt.evidenceAdmitted, 1);
  assert.equal(result.rankedResults[0]?.passage.googleFileId, "file-relevant");
  assert.equal(result.rankedResults.some((item) => item.passage.googleFileId === "file-unrelated"), false);
  const repeated = await setup.connector.searchFolder({
    userId: USER, organizationId: ORGANIZATION, sourceId: SOURCE,
    folderIds: [FOLDER], questionId: "question-test",
  });
  assert.equal(repeated.receipt.evidenceAdmitted, 0);
  assert.equal(repeated.admittedSourceIds.length, 0);
  await assert.rejects(setup.connector.searchFolder({
    userId: USER, organizationId: "other-organization", sourceId: SOURCE,
    folderIds: [FOLDER], questionId: "question-test",
  }), /access denied/);
}

async function validateContentAddressedIdentity() {
  const setup = service();
  const first = await setup.connector.synchronizeFolder({
    userId: USER,
    organizationId: ORGANIZATION,
    sourceId: SOURCE,
    folderId: FOLDER,
  });
  assert.deepEqual(first.newFiles, ["file-relevant", "file-unrelated"]);
  const sourceIdentity = googleDriveExternalSourceIdentity({
    organizationId: ORGANIZATION,
    connectedSourceId: SOURCE,
    googleFileId: "file-relevant",
  });
  const initialPassage = setup.metadata.value.passages.find(
    (item) => item.googleFileId === "file-relevant",
  )!;
  assert.equal(
    initialPassage.id,
    googleDrivePassageIdentity({
      sourceIdentity,
      location: initialPassage.location,
      contentDigest: initialPassage.contentDigest,
    }),
  );
  const firstSearch = await setup.connector.searchFolder({
    userId: USER,
    organizationId: ORGANIZATION,
    sourceId: SOURCE,
    folderIds: [FOLDER],
    questionId: "question-test",
  });
  assert.equal(firstSearch.receipt.evidenceAdmitted, 1);
  const firstEvidenceId = googleDriveCanonicalEvidenceIdentity({
    organizationId: ORGANIZATION,
    connectedSourceId: SOURCE,
    contentDigest: initialPassage.contentDigest,
  });
  const firstAdmissionId = googleDriveQuestionAdmissionIdentity({
    questionId: "question-test",
    contentDigest: initialPassage.contentDigest,
  });

  setup.revision.value = 2;
  const sameContent = await setup.connector.synchronizeFolder({
    userId: USER,
    organizationId: ORGANIZATION,
    sourceId: SOURCE,
    folderId: FOLDER,
  });
  assert.deepEqual(sameContent.unchangedContentRevisionFiles, ["file-relevant"]);
  const samePassage = setup.metadata.value.passages.find(
    (item) => item.googleFileId === "file-relevant",
  )!;
  assert.equal(samePassage.id, initialPassage.id);
  assert.equal(samePassage.contentDigest, initialPassage.contentDigest);
  assert.equal(
    googleDriveCanonicalEvidenceIdentity({
      organizationId: ORGANIZATION,
      connectedSourceId: SOURCE,
      contentDigest: samePassage.contentDigest,
    }),
    firstEvidenceId,
  );
  assert.equal(
    googleDriveQuestionAdmissionIdentity({
      questionId: "question-test",
      contentDigest: samePassage.contentDigest,
    }),
    firstAdmissionId,
  );
  assert.equal((await setup.connector.searchFolder({
    userId: USER,
    organizationId: ORGANIZATION,
    sourceId: SOURCE,
    folderIds: [FOLDER],
    questionId: "question-test",
  })).receipt.evidenceAdmitted, 0);

  setup.revision.value = 3;
  setup.relevantContent.value += " Materially changed contract escalation ownership.";
  const changed = await setup.connector.synchronizeFolder({
    userId: USER,
    organizationId: ORGANIZATION,
    sourceId: SOURCE,
    folderId: FOLDER,
  });
  assert.deepEqual(changed.changedContentRevisionFiles, ["file-relevant"]);
  const changedPassage = setup.metadata.value.passages.find(
    (item) => item.googleFileId === "file-relevant",
  )!;
  assert.notEqual(changedPassage.id, initialPassage.id);
  assert.notEqual(changedPassage.contentDigest, initialPassage.contentDigest);
  assert.equal((await setup.connector.searchFolder({
    userId: USER,
    organizationId: ORGANIZATION,
    sourceId: SOURCE,
    folderIds: [FOLDER],
    questionId: "question-test",
  })).receipt.evidenceAdmitted, 1);
  assert.equal(setup.metadata.value.sourceVersions.length, 4);
  assert.equal(normalizeExtractedContent("claim  1\r\n\r\n\r\nclaim 2  "), "claim  1\n\nclaim 2");
  assert.notEqual(
    normalizeExtractedContent("Revenue increased 10%"),
    normalizeExtractedContent("Revenue decreased 10%"),
  );
  assert.notEqual(
    googleDriveQuestionAdmissionIdentity({
      questionId: "question-other",
      contentDigest: changedPassage.contentDigest,
    }),
    googleDriveQuestionAdmissionIdentity({
      questionId: "question-test",
      contentDigest: changedPassage.contentDigest,
    }),
  );

  const duplicateSetup = service();
  await duplicateSetup.connector.synchronizeFolder({
    userId: USER,
    organizationId: ORGANIZATION,
    sourceId: SOURCE,
    folderId: FOLDER,
  });
  const duplicateOriginal = duplicateSetup.metadata.value.passages.find(
    (item) => item.googleFileId === "file-relevant",
  )!;
  const duplicateSourceIdentity = googleDriveExternalSourceIdentity({
    organizationId: ORGANIZATION,
    connectedSourceId: SOURCE,
    googleFileId: "file-relevant-copy",
  });
  duplicateSetup.metadata.value.files.push({
    ...duplicateSetup.metadata.value.files.find(
      (item) => item.googleFileId === "file-relevant",
    )!,
    sourceIdentity: duplicateSourceIdentity,
    googleFileId: "file-relevant-copy",
    name: "Independent copy.txt",
  });
  duplicateSetup.metadata.value.passages.push({
    ...duplicateOriginal,
    id: googleDrivePassageIdentity({
      sourceIdentity: duplicateSourceIdentity,
      location: duplicateOriginal.location,
      contentDigest: duplicateOriginal.contentDigest,
    }),
    googleFileId: "file-relevant-copy",
    fileName: "Independent copy.txt",
  });
  const duplicateSearch = await duplicateSetup.connector.searchFolder({
    userId: USER,
    organizationId: ORGANIZATION,
    sourceId: SOURCE,
    folderIds: [FOLDER],
    questionId: "question-test",
  });
  assert.equal(
    duplicateSearch.rankedResults.filter(
      (item) => item.passage.contentDigest === duplicateOriginal.contentDigest,
    ).length,
    2,
  );
  assert.equal(duplicateSearch.receipt.evidenceAdmitted, 1);
  assert.equal(duplicateSearch.admittedSourceIds.length, 1);

  const reloadDirectory = await mkdtemp(
    join(tmpdir(), "discovery-google-metadata-reload-"),
  );
  try {
    const repository = new FileGoogleDriveMetadataRepository(
      join(reloadDirectory, "metadata.json"),
    );
    await repository.replace(setup.metadata.value);
    const reloaded = await repository.read();
    assert.deepEqual(reloaded.sourceVersions, setup.metadata.value.sourceVersions);
    assert.deepEqual(
      reloaded.passages.map((item) => item.id).sort(),
      setup.metadata.value.passages.map((item) => item.id).sort(),
    );
  } finally {
    await rm(reloadDirectory, { recursive: true, force: true });
  }
}

async function validateFreshness() {
  const folder = (new MemoryMetadata()).value.folders[0]!;
  assert.equal(assessGoogleDriveQuestionFreshness({
    folder, files: [], relevantFileIds: [], now: NOW,
  }).status, "unknown");
  assert.equal(assessGoogleDriveQuestionFreshness({
    folder: { ...folder, lastSynchronizedAt: NOW },
    files: [{
      sourceIdentity: "google-drive-source:f",
      googleFileId: "f", folderId: FOLDER, name: "f", mimeType: "text/plain",
      revisionId: "1", modifiedAt: "2026-07-29T12:00:00.000Z", digest: null,
      status: "accessible", lastSeenAt: NOW, extractedAt: NOW,
      extractionDigest: "d", passageCount: 1,
    }],
    relevantFileIds: ["f"], now: NOW,
  }).status, "current");
}

async function validateRevocation() {
  const setup = service();
  const receipt = await setup.connector.disconnectFolder({
    userId: USER, organizationId: ORGANIZATION, sourceId: SOURCE,
  });
  assert.equal(receipt.credentialDeleted, true);
  assert.equal(receipt.historicalLineagePreserved, true);
  await assert.rejects(setup.connector.listAuthorizedFolders({
    userId: USER, organizationId: ORGANIZATION, sourceId: SOURCE,
  }), /access denied/);
}

async function validateDeterminism() {
  const passage = {
    id: "p", googleFileId: "f", fileName: "Renewal report", mimeType: "text/plain",
    revisionId: "1", modifiedAt: NOW, extractedAt: NOW, location: "passage 1",
    content: "Enterprise renewal rates declined because contract issues remained unresolved.",
    contentDigest: "d",
  };
  assert.deepEqual(
    rankGoogleDrivePassages("Why are enterprise renewal rates declining?", [passage]),
    rankGoogleDrivePassages("Why are enterprise renewal rates declining?", [passage]),
  );
}

const validators: Record<string, () => Promise<void>> = {
  spec: validateSpec,
  roadmap: validateRoadmap,
  auth: validateAuth,
  scope: validateSearch,
  security: validateTokenSecurity,
  sync: validateSync,
  changed: validateSync,
  extraction: validateSync,
  deduplication: validateSearch,
  search: validateSearch,
  lineage: validateSearch,
  freshness: validateFreshness,
  revocation: validateRevocation,
  reload: validateDeterminism,
  "content-addressed-identity": validateContentAddressedIdentity,
  "source-version-lineage": validateContentAddressedIdentity,
  "unchanged-revision-idempotency": validateContentAddressedIdentity,
  "changed-content-supersession": validateContentAddressedIdentity,
  "question-admission-idempotency": validateContentAddressedIdentity,
};

async function main(): Promise<void> {
  if (mode === "all") {
    for (const validate of Object.values(validators)) await validate();
  } else {
    const validate = validators[mode];
    if (!validate) throw new Error(`Unknown Google Drive validation mode: ${mode}`);
    await validate();
  }
  console.log(`Google Drive connector validation passed (${mode}).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
