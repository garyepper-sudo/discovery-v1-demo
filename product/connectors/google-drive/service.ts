import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type {
  CanonicalEvidenceContribution,
  CanonicalWorkspaceReadResult,
} from "../../integration/contracts";
import type { ProductSearchReceipt } from "../../workflow";
import { stableId } from "../../workflow/text";
import {
  GOOGLE_DRIVE_SCOPES,
  type GoogleDriveAuthorizationRequest,
  type GoogleDriveConnectedFolder,
  type GoogleDriveConnectedSource,
  type GoogleDriveConnectorMetadata,
  type GoogleDriveDisconnectionReceipt,
  type GoogleDriveFolderSummary,
  type GoogleDriveQuestionSearchResult,
  type GoogleDriveRankedPassage,
  type GoogleDriveSynchronizationReceipt,
} from "./contracts";
import { GoogleDriveApi } from "./googleApi";
import type { GoogleDriveClient, GoogleDriveFile } from "./googleApi";
import type {
  GoogleDriveCredentialRepository,
  GoogleDriveAuthorizationStateRepository,
  GoogleDriveMetadataRepository,
} from "./repositories";
import { sha256 } from "./repositories";
import {
  googleDriveCanonicalEvidenceIdentity,
  googleDriveExternalSourceIdentity,
  googleDriveQuestionAdmissionIdentity,
  googleDriveSourceVersionIdentity,
} from "./identity";
import {
  GOOGLE_DRIVE_DEVELOPMENT_PURPOSE,
  GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE,
  type GoogleDriveDevelopmentPurpose,
} from "./developmentEligibility";

type OperationMetadata = {
  requestId: string;
  operatorId: string;
};

export type GoogleDriveProductAdapter = {
  getQuestionWorkspace(input: {
    userId: string;
    organizationId: string;
    questionId: string;
  }): Promise<CanonicalWorkspaceReadResult>;
  contributeEvidence(input: {
    userId: string;
    organizationId: string;
    questionId: string;
    contribution: CanonicalEvidenceContribution;
    operation: OperationMetadata;
  }): Promise<CanonicalWorkspaceReadResult>;
  recordSearch(input: {
    userId: string;
    organizationId: string;
    questionId: string;
    searchedAt: string;
    sourceIds: string[];
    scope: string;
    limitations: string[];
    changeProduced: boolean;
    operation: OperationMetadata;
  }): Promise<CanonicalWorkspaceReadResult>;
};

export type GoogleDriveConnectorDependencies = {
  api: GoogleDriveApi;
  credentials: GoogleDriveCredentialRepository;
  metadata: GoogleDriveMetadataRepository;
  productAdapter: GoogleDriveProductAdapter;
  authorize(input: {
    userId: string;
    organizationId: string;
    purpose: GoogleDriveDevelopmentPurpose;
  }): Promise<boolean>;
  authorizationPurpose?: GoogleDriveDevelopmentPurpose;
  stateSigningSecret: string;
  authorizationStates: GoogleDriveAuthorizationStateRepository;
  now(): string;
};

export type GoogleDriveOAuthStateReason =
  | "missing"
  | "encoding-invalid"
  | "signature-invalid"
  | "expired"
  | "user-mismatch"
  | "organization-mismatch"
  | "purpose-mismatch"
  | "already-consumed";

export class GoogleDriveOAuthStateError extends Error {
  constructor(readonly reason: GoogleDriveOAuthStateReason) {
    super(`Google Drive OAuth state rejected: ${reason}.`);
  }
}

export type GoogleDriveOAuthStateDiagnostic = {
  statePresent: boolean;
  encodingValid: boolean;
  signatureValid: boolean;
  expired: boolean;
  userMatch: boolean;
  organizationMatch: boolean;
  purposeMatch: boolean;
  alreadyConsumed: boolean;
  finalResult: "valid" | "invalid";
  reason: GoogleDriveOAuthStateReason | null;
};

const FILE_FIELDS =
  "nextPageToken,files(id,name,mimeType,modifiedTime,version,md5Checksum,parents,driveId,trashed,shortcutDetails)";
const STOP = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how",
  "in", "is", "it", "of", "on", "or", "the", "to", "what", "when", "where",
  "which", "why", "with",
]);

export function googleDriveSearchTerms(value: string): string[] {
  return [...new Set(
    value.toLowerCase().match(/[a-z0-9][a-z0-9-]{2,}/g)?.filter((term) => !STOP.has(term)) ?? [],
  )].sort();
}

export function rankGoogleDrivePassages(
  question: string,
  passages: import("./contracts").GoogleDrivePassage[],
): GoogleDriveRankedPassage[] {
  const questionTerms = googleDriveSearchTerms(question);
  return passages.map((passage) => {
    const content = new Set(googleDriveSearchTerms(`${passage.fileName} ${passage.content}`));
    const matchedTerms = questionTerms.filter((term) => content.has(term));
    return {
      passage,
      matchedTerms,
      score: questionTerms.length ? matchedTerms.length / questionTerms.length : 0,
    };
  }).filter((item) => item.score >= 0.34 && item.matchedTerms.length >= 2)
    .sort((a, b) => b.score - a.score || a.passage.id.localeCompare(b.passage.id));
}

function timingSafeState(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function validStateSignature(secret: string, payload: string, signature: string): boolean {
  const expected = Buffer.from(timingSafeState(secret, payload));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function assertExactScope(source: GoogleDriveConnectedSource, userId: string, organizationId: string) {
  if (
    source.organizationId !== organizationId
    || source.authorizingUserId !== userId
    || source.status !== "connected"
    || source.revokedAt
  ) throw new Error("Google Drive source access denied.");
}

export class GoogleDriveConnectorService {
  constructor(private readonly dependencies: GoogleDriveConnectorDependencies) {
    if (dependencies.stateSigningSecret.length < 32) {
      throw new Error("Google Drive OAuth state signing secret must contain at least 32 characters.");
    }
  }

  private authorizationPurpose(): GoogleDriveDevelopmentPurpose {
    return this.dependencies.authorizationPurpose ?? GOOGLE_DRIVE_DEVELOPMENT_PURPOSE;
  }

  private async authorized(input: { userId: string; organizationId: string }): Promise<void> {
    if (!await this.dependencies.authorize({
      ...input,
      purpose: this.authorizationPurpose(),
    })) {
      throw new Error("Google Drive connector access denied.");
    }
  }

  inspectAuthorizationState(stateValue: string): {
    userId: string;
    organizationId: string;
    purpose: GoogleDriveDevelopmentPurpose;
    expiresAt: string;
  } {
    const [payload, signature, ...additional] = stateValue.split(".");
    if (
      !payload
      || !signature
      || additional.length
      || !/^[A-Za-z0-9_-]+$/.test(payload)
      || !/^[A-Za-z0-9_-]+$/.test(signature)
    ) throw new GoogleDriveOAuthStateError("encoding-invalid");
    if (!validStateSignature(this.dependencies.stateSigningSecret, payload, signature)) {
      throw new GoogleDriveOAuthStateError("signature-invalid");
    }
    let state: { userId?: unknown; organizationId?: unknown; purpose?: unknown; expiresAt?: unknown };
    try {
      state = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as typeof state;
    } catch {
      throw new GoogleDriveOAuthStateError("encoding-invalid");
    }
    if (
      typeof state.userId !== "string"
      || typeof state.organizationId !== "string"
      || (state.purpose !== undefined && state.purpose !== GOOGLE_DRIVE_DEVELOPMENT_PURPOSE
        && state.purpose !== GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE)
      || typeof state.expiresAt !== "string"
    ) throw new GoogleDriveOAuthStateError("encoding-invalid");
    if (Date.parse(state.expiresAt) < Date.parse(this.dependencies.now())) {
      throw new GoogleDriveOAuthStateError("expired");
    }
    return {
      userId: state.userId,
      organizationId: state.organizationId,
      purpose: state.purpose ?? GOOGLE_DRIVE_DEVELOPMENT_PURPOSE,
      expiresAt: state.expiresAt,
    };
  }

  async diagnoseAuthorizationState(input: {
    userId: string;
    organizationId: string;
    state: string;
  }): Promise<GoogleDriveOAuthStateDiagnostic> {
    const baseline: GoogleDriveOAuthStateDiagnostic = {
      statePresent: Boolean(input.state),
      encodingValid: false,
      signatureValid: false,
      expired: false,
      userMatch: false,
      organizationMatch: false,
      purposeMatch: false,
      alreadyConsumed: false,
      finalResult: "invalid",
      reason: input.state ? "encoding-invalid" : "missing",
    };
    if (!input.state) return baseline;

    let state: ReturnType<GoogleDriveConnectorService["inspectAuthorizationState"]>;
    try {
      state = this.inspectAuthorizationState(input.state);
    } catch (error) {
      if (!(error instanceof GoogleDriveOAuthStateError)) throw error;
      return {
        ...baseline,
        encodingValid: error.reason !== "encoding-invalid",
        signatureValid: !["encoding-invalid", "signature-invalid"].includes(error.reason),
        expired: error.reason === "expired",
        reason: error.reason,
      };
    }

    const stored = await this.dependencies.authorizationStates.inspect(sha256(input.state));
    const userMatch = state.userId === input.userId
      && (!stored || stored.userId === input.userId);
    const organizationMatch = state.organizationId === input.organizationId
      && (!stored || stored.organizationId === input.organizationId);
    const purposeMatch = state.purpose === this.authorizationPurpose()
      && (!stored || (stored.purpose ?? GOOGLE_DRIVE_DEVELOPMENT_PURPOSE) === this.authorizationPurpose());
    const alreadyConsumed = Boolean(stored?.consumedAt);
    const reason: GoogleDriveOAuthStateReason | null = !userMatch
      ? "user-mismatch"
      : !organizationMatch
        ? "organization-mismatch"
        : !purposeMatch
          ? "purpose-mismatch"
        : !stored
          ? "missing"
          : alreadyConsumed
            ? "already-consumed"
            : null;
    return {
      statePresent: true,
      encodingValid: true,
      signatureValid: true,
      expired: false,
      userMatch,
      organizationMatch,
      purposeMatch,
      alreadyConsumed,
      finalResult: reason ? "invalid" : "valid",
      reason,
    };
  }

  async beginAuthorization(input: {
    userId: string;
    organizationId: string;
  }): Promise<GoogleDriveAuthorizationRequest> {
    await this.authorized(input);
    const expiresAt = new Date(Date.parse(this.dependencies.now()) + 10 * 60_000).toISOString();
    const payload = Buffer.from(JSON.stringify({
      userId: input.userId,
      organizationId: input.organizationId,
      purpose: this.authorizationPurpose(),
      expiresAt,
      nonce: randomBytes(18).toString("base64url"),
    })).toString("base64url");
    const state = `${payload}.${timingSafeState(this.dependencies.stateSigningSecret, payload)}`;
    await this.dependencies.authorizationStates.create({
      stateDigest: sha256(state),
      userId: input.userId,
      organizationId: input.organizationId,
      purpose: this.authorizationPurpose(),
      issuedAt: this.dependencies.now(),
      expiresAt,
      consumedAt: null,
    });
    return {
      authorizationUrl: this.dependencies.api.authorizationUrl(state, GOOGLE_DRIVE_SCOPES),
      state,
      expiresAt,
    };
  }

  async completeAuthorization(input: {
    userId: string;
    organizationId: string;
    state: string;
    code: string;
  }): Promise<GoogleDriveConnectedSource> {
    await this.authorized(input);
    const state = this.inspectAuthorizationState(input.state);
    if (state.userId !== input.userId) throw new GoogleDriveOAuthStateError("user-mismatch");
    if (state.organizationId !== input.organizationId) {
      throw new GoogleDriveOAuthStateError("organization-mismatch");
    }
    if (state.purpose !== this.authorizationPurpose()) {
      throw new GoogleDriveOAuthStateError("purpose-mismatch");
    }
    const stored = await this.dependencies.authorizationStates.inspect(sha256(input.state));
    if (!stored) throw new GoogleDriveOAuthStateError("missing");
    if (stored.userId !== input.userId) throw new GoogleDriveOAuthStateError("user-mismatch");
    if (stored.organizationId !== input.organizationId) {
      throw new GoogleDriveOAuthStateError("organization-mismatch");
    }
    if ((stored.purpose ?? GOOGLE_DRIVE_DEVELOPMENT_PURPOSE) !== this.authorizationPurpose()) {
      throw new GoogleDriveOAuthStateError("purpose-mismatch");
    }
    const consumption = await this.dependencies.authorizationStates.consume(
      sha256(input.state),
      this.dependencies.now(),
    );
    if (consumption !== "consumed") {
      throw new GoogleDriveOAuthStateError(consumption);
    }
    const credential = await this.dependencies.api.exchangeCode(input.code);
    const email = await this.dependencies.api.accountEmail(credential);
    const sourceId = stableId(
      "google-drive-source",
      input.organizationId,
      input.userId,
      email ?? "unknown-account",
    );
    const grantedScopes = credential.scopes;
    if (!GOOGLE_DRIVE_SCOPES.every((scope) => grantedScopes.includes(scope))) {
      throw new Error("Google Drive authorization did not grant the required exact scopes.");
    }
    await this.dependencies.credentials.write(sourceId, credential);
    const metadata = await this.dependencies.metadata.read();
    const source: GoogleDriveConnectedSource = {
      version: "1",
      id: sourceId,
      organizationId: input.organizationId,
      authorizingUserId: input.userId,
      accountLabel: email
        ? email.replace(/(^.).*(@.*$)/, "$1***$2")
        : "Google account",
      status: "connected",
      grantedScopes,
      authorizationExpiresAt: credential.expiresAt,
      connectedAt: this.dependencies.now(),
      revokedAt: null,
    };
    metadata.sources = [...metadata.sources.filter((item) => item.id !== sourceId), source]
      .sort((a, b) => a.id.localeCompare(b.id));
    await this.dependencies.metadata.replace(metadata);
    return source;
  }

  async rejectAuthorization(input: {
    userId: string;
    organizationId: string;
    state: string;
  }): Promise<void> {
    await this.authorized(input);
    const state = this.inspectAuthorizationState(input.state);
    if (state.userId !== input.userId) throw new GoogleDriveOAuthStateError("user-mismatch");
    if (state.organizationId !== input.organizationId) {
      throw new GoogleDriveOAuthStateError("organization-mismatch");
    }
    if (state.purpose !== this.authorizationPurpose()) {
      throw new GoogleDriveOAuthStateError("purpose-mismatch");
    }
    const stored = await this.dependencies.authorizationStates.inspect(sha256(input.state));
    if (!stored) throw new GoogleDriveOAuthStateError("missing");
    if (stored.userId !== input.userId) throw new GoogleDriveOAuthStateError("user-mismatch");
    if (stored.organizationId !== input.organizationId) {
      throw new GoogleDriveOAuthStateError("organization-mismatch");
    }
    if ((stored.purpose ?? GOOGLE_DRIVE_DEVELOPMENT_PURPOSE) !== this.authorizationPurpose()) {
      throw new GoogleDriveOAuthStateError("purpose-mismatch");
    }
    const consumption = await this.dependencies.authorizationStates.consume(
      sha256(input.state),
      this.dependencies.now(),
    );
    if (consumption !== "consumed") throw new GoogleDriveOAuthStateError(consumption);
  }

  private async source(input: {
    userId: string;
    organizationId: string;
    sourceId: string;
  }) {
    await this.authorized(input);
    const metadata = await this.dependencies.metadata.read();
    const source = metadata.sources.find((item) => item.id === input.sourceId);
    if (!source) throw new Error("Google Drive source was not found.");
    assertExactScope(source, input.userId, input.organizationId);
    const storedCredential = await this.dependencies.credentials.read(source.id);
    if (!storedCredential) throw new Error("Google Drive credential is unavailable.");
    const credential = await this.dependencies.api.refresh(storedCredential);
    if (credential !== storedCredential) {
      await this.dependencies.credentials.write(source.id, credential);
    }
    return { metadata, source, credential, drive: this.dependencies.api.drive(credential) };
  }

  async listAuthorizedFolders(input: {
    userId: string;
    organizationId: string;
    sourceId: string;
    exactFolderName?: string;
  }): Promise<GoogleDriveFolderSummary[]> {
    const { metadata, drive } = await this.source(input);
    const exactFolderName = input.exactFolderName?.trim();
    const nameConstraint = exactFolderName
      ? ` and name = '${exactFolderName.replace(/'/g, "\\'")}'`
      : "";
    const response = await drive.files.list({
      q: `mimeType = 'application/vnd.google-apps.folder' and trashed = false${nameConstraint}`,
      fields: FILE_FIELDS,
      spaces: "drive",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      orderBy: "name_natural",
    });
    return (response.data.files ?? []).map((folder) => ({
      id: folder.id!,
      name: folder.name ?? "Untitled folder",
      driveId: folder.driveId ?? null,
      parentIds: [...(folder.parents ?? [])].sort(),
      selected: metadata.folders.some((item) =>
        item.sourceId === input.sourceId && item.googleFolderId === folder.id && !item.revokedAt
      ),
    })).sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  }

  async connectFolder(input: {
    userId: string;
    organizationId: string;
    sourceId: string;
    googleFolderId: string;
    includeNested: boolean;
  }): Promise<GoogleDriveConnectedFolder> {
    const { metadata, folder: summary } = await this.accessibleFolder(input);
    const folder: GoogleDriveConnectedFolder = {
      id: stableId("google-drive-folder", input.organizationId, input.sourceId, input.googleFolderId),
      sourceId: input.sourceId,
      organizationId: input.organizationId,
      googleFolderId: input.googleFolderId,
      displayName: summary.name,
      driveId: summary.driveId,
      includeNested: input.includeNested,
      connectedAt: this.dependencies.now(),
      lastSynchronizedAt: null,
      synchronizationCursor: null,
      revokedAt: null,
      limitations: [
        "Shortcuts are not followed.",
        input.includeNested ? "Nested folders are included." : "Nested folders are excluded.",
        "Externally owned files are included only while Google reports them accessible.",
      ],
    };
    metadata.folders = [...metadata.folders.filter((item) => item.id !== folder.id), folder]
      .sort((a, b) => a.id.localeCompare(b.id));
    await this.dependencies.metadata.replace(metadata);
    return folder;
  }

  private async accessibleFolder(input: {
    userId: string;
    organizationId: string;
    sourceId: string;
    googleFolderId: string;
  }): Promise<{ metadata: GoogleDriveConnectorMetadata; folder: GoogleDriveFolderSummary }> {
    const { metadata, drive } = await this.source(input);
    const response = await drive.files.get({
      fileId: input.googleFolderId,
      fields: "id,name,mimeType,driveId,parents,trashed",
      supportsAllDrives: true,
    });
    if (
      response.data.mimeType !== "application/vnd.google-apps.folder"
      || response.data.trashed
    ) throw new Error("Selected Google Drive item is not an accessible folder.");
    return {
      metadata,
      folder: {
        id: response.data.id!,
        name: response.data.name ?? "Untitled folder",
        parentIds: [...(response.data.parents ?? [])].sort(),
        selected: metadata.folders.some((item) =>
          item.sourceId === input.sourceId
          && item.googleFolderId === input.googleFolderId
          && !item.revokedAt
        ),
        driveId: response.data.driveId ?? null,
      },
    };
  }

  async inspectAuthorizedFolder(input: {
    userId: string;
    organizationId: string;
    sourceId: string;
    googleFolderId: string;
  }): Promise<GoogleDriveFolderSummary> {
    const { folder } = await this.accessibleFolder(input);
    return folder;
  }

  private async folderFiles(
    drive: GoogleDriveClient,
    googleFolderId: string,
    includeNested: boolean,
    maxFiles?: number,
  ): Promise<GoogleDriveFile[]> {
    const result: GoogleDriveFile[] = [];
    const queue = [googleFolderId];
    while (queue.length) {
      const parent = queue.shift()!;
      let pageToken: string | undefined;
      do {
        const response = await drive.files.list({
          q: `'${parent.replace(/'/g, "\\'")}' in parents and trashed = false`,
          fields: FILE_FIELDS,
          spaces: "drive",
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
          pageToken,
          pageSize: maxFiles ? Math.min(1000, maxFiles + 1) : 1000,
        });
        for (const file of response.data.files ?? []) {
          if (file.mimeType === "application/vnd.google-apps.folder") {
            if (includeNested && file.id) queue.push(file.id);
          } else {
            result.push(file);
            if (maxFiles && result.length > maxFiles) {
              throw new Error("Google Drive synchronization file-count limit exceeded.");
            }
          }
        }
        pageToken = response.data.nextPageToken ?? undefined;
      } while (pageToken);
    }
    return result.sort((a, b) => (a.id ?? "").localeCompare(b.id ?? ""));
  }

  async synchronizeFolder(input: {
    userId: string;
    organizationId: string;
    sourceId: string;
    folderId: string;
    limits?: {
      maxFiles: number;
      maxTotalExtractedBytes: number;
      allowedMimeTypes: readonly string[];
    };
  }): Promise<GoogleDriveSynchronizationReceipt> {
    const { metadata, drive } = await this.source(input);
    const folder = metadata.folders.find((item) => item.id === input.folderId);
    if (!folder || folder.organizationId !== input.organizationId || folder.sourceId !== input.sourceId) {
      throw new Error("Google Drive folder access denied.");
    }
    if (folder.revokedAt) throw new Error("Google Drive folder is disconnected.");
    const synchronizedAt = this.dependencies.now();
    const files = await this.folderFiles(
      drive,
      folder.googleFolderId,
      folder.includeNested,
      input.limits?.maxFiles,
    );
    if (input.limits && files.length > input.limits.maxFiles) {
      throw new Error("Google Drive synchronization file-count limit exceeded.");
    }
    const previous = metadata.files.filter((item) => item.folderId === folder.id);
    const previousById = new Map(previous.map((item) => [item.googleFileId, item]));
    const globalById = new Map(metadata.files.map((item) => [item.googleFileId, item]));
    const seen = new Set<string>();
    const receipt: GoogleDriveSynchronizationReceipt = {
      sourceId: input.sourceId,
      folderId: folder.id,
      organizationId: input.organizationId,
      synchronizedAt,
      newFiles: [],
      changedFiles: [],
      unchangedContentRevisionFiles: [],
      changedContentRevisionFiles: [],
      extractedForComparisonFiles: [],
      unchangedFiles: [],
      movedFiles: [],
      removedFiles: [],
      inaccessibleFiles: [],
      unsupportedFiles: [],
      cursor: null,
      limitations: [...folder.limitations],
    };
    let nextFiles = metadata.files.filter((item) => item.folderId !== folder.id);
    const nextPassages = metadata.passages.filter((item) =>
      !previous.some((file) => file.googleFileId === item.googleFileId)
    );
    const nextSourceVersions = [...(metadata.sourceVersions ?? [])];
    let totalExtractedBytes = 0;
    for (const file of files) {
      if (!file.id) continue;
      seen.add(file.id);
      const revisionId = String(file.version ?? file.modifiedTime ?? "unknown");
      const sourceIdentity = googleDriveExternalSourceIdentity({
        organizationId: input.organizationId,
        connectedSourceId: input.sourceId,
        googleFileId: file.id,
      });
      const prior = previousById.get(file.id);
      const priorInAnotherFolder = !prior ? globalById.get(file.id) : undefined;
      if (priorInAnotherFolder && priorInAnotherFolder.folderId !== folder.id) {
        receipt.movedFiles.push(file.id);
        nextFiles = nextFiles.filter((item) => item.googleFileId !== file.id);
      }
      if (prior?.revisionId === revisionId && prior.status === "accessible") {
        receipt.unchangedFiles.push(file.id);
        nextFiles.push({ ...prior, sourceIdentity, lastSeenAt: synchronizedAt });
        nextPassages.push(...metadata.passages.filter((item) => item.googleFileId === file.id));
        continue;
      }
      if (input.limits && !input.limits.allowedMimeTypes.includes(file.mimeType ?? "")) {
        receipt.unsupportedFiles.push(file.id);
        nextFiles.push({
          sourceIdentity, googleFileId:file.id, folderId:folder.id,
          name:file.name ?? "Untitled", mimeType:file.mimeType ?? "application/octet-stream",
          revisionId, modifiedAt:file.modifiedTime ?? synchronizedAt,
          digest:file.md5Checksum ?? null, status:"unsupported", lastSeenAt:synchronizedAt,
          extractedAt:null, extractionDigest:null, passageCount:0,
        });
        continue;
      }
      try {
        if (file.mimeType === "application/vnd.google-apps.shortcut") {
          receipt.unsupportedFiles.push(file.id);
          nextFiles.push({
            sourceIdentity, googleFileId: file.id, folderId: folder.id, name: file.name ?? "Shortcut",
            mimeType: file.mimeType, revisionId, modifiedAt: file.modifiedTime ?? synchronizedAt,
            digest: file.md5Checksum ?? null, status: "unsupported", lastSeenAt: synchronizedAt,
            extractedAt: null, extractionDigest: null, passageCount: 0,
          });
          continue;
        }
        receipt.extractedForComparisonFiles.push(file.id);
        const { extractGoogleDriveFile } = await import("./extract");
        const extracted = await extractGoogleDriveFile({
          drive,
          file,
          extractedAt: synchronizedAt,
          sourceIdentity,
        });
        totalExtractedBytes += extracted.passages.reduce(
          (sum, passage) => sum + Buffer.byteLength(passage.content),
          0,
        );
        if (input.limits && totalExtractedBytes > input.limits.maxTotalExtractedBytes) {
          throw new Error("Google Drive synchronization total extracted-byte limit exceeded.");
        }
        const extractionDigest = sha256(
          extracted.passages.map((item) => item.contentDigest).join(":"),
        );
        const unchangedContentRevision = Boolean(
          prior
          && prior.status === "accessible"
          && prior.extractionDigest === extractionDigest,
        );
        if (extracted.limitation) receipt.limitations.push(`${file.name}: ${extracted.limitation}`);
        if (!extracted.passages.length) receipt.unsupportedFiles.push(file.id);
        else if (unchangedContentRevision) {
          receipt.unchangedContentRevisionFiles.push(file.id);
        }
        else if (prior) {
          receipt.changedFiles.push(file.id);
          receipt.changedContentRevisionFiles.push(file.id);
        }
        else receipt.newFiles.push(file.id);
        nextPassages.push(...extracted.passages);
        nextFiles.push({
          sourceIdentity,
          googleFileId: file.id,
          folderId: folder.id,
          name: file.name ?? "Untitled",
          mimeType: file.mimeType ?? "application/octet-stream",
          revisionId,
          modifiedAt: file.modifiedTime ?? synchronizedAt,
          digest: file.md5Checksum ?? null,
          status: extracted.passages.length ? "accessible" : "unsupported",
          lastSeenAt: synchronizedAt,
          extractedAt: synchronizedAt,
          extractionDigest,
          passageCount: extracted.passages.length,
        });
        const sourceVersion = {
          id: googleDriveSourceVersionIdentity({ sourceIdentity, revisionId }),
          sourceIdentity,
          googleFileId: file.id,
          revisionId,
          modifiedAt: file.modifiedTime ?? synchronizedAt,
          observedAt: synchronizedAt,
          extractionDigest: extracted.passages.length ? extractionDigest : null,
          passageIds: extracted.passages.map((item) => item.id).sort(),
          contentDisposition: (
            !extracted.passages.length
              ? "unsupported"
              : prior
                ? unchangedContentRevision
                  ? "unchanged"
                  : "changed"
                : "initial"
          ) as "initial" | "changed" | "unchanged" | "unsupported",
        };
        if (!nextSourceVersions.some((item) => item.id === sourceVersion.id)) {
          nextSourceVersions.push(sourceVersion);
        }
      } catch (error) {
        if ((error as Error).message === "Google Drive synchronization total extracted-byte limit exceeded.") {
          throw error;
        }
        receipt.inaccessibleFiles.push(file.id);
        nextFiles.push({
          sourceIdentity, googleFileId: file.id, folderId: folder.id, name: file.name ?? "Untitled",
          mimeType: file.mimeType ?? "application/octet-stream", revisionId,
          modifiedAt: file.modifiedTime ?? synchronizedAt, digest: file.md5Checksum ?? null,
          status: "inaccessible", lastSeenAt: synchronizedAt, extractedAt: null,
          extractionDigest: null, passageCount: 0,
        });
        receipt.limitations.push(`${file.name ?? file.id}: ${(error as Error).message}`);
      }
    }
    for (const prior of previous) {
      if (seen.has(prior.googleFileId)) continue;
      receipt.removedFiles.push(prior.googleFileId);
      nextFiles.push({ ...prior, status: "removed", lastSeenAt: synchronizedAt });
    }
    const updatedFolder = { ...folder, lastSynchronizedAt: synchronizedAt };
    metadata.folders = metadata.folders.map((item) => item.id === folder.id ? updatedFolder : item);
    metadata.files = nextFiles.sort((a, b) => a.googleFileId.localeCompare(b.googleFileId));
    metadata.passages = nextPassages.sort((a, b) => a.id.localeCompare(b.id));
    metadata.sourceVersions = nextSourceVersions.sort((left, right) =>
      left.sourceIdentity.localeCompare(right.sourceIdentity)
      || left.observedAt.localeCompare(right.observedAt)
      || left.id.localeCompare(right.id)
    );
    await this.dependencies.metadata.replace(metadata);
    return receipt;
  }

  async searchFolder(input: {
    userId: string;
    organizationId: string;
    sourceId: string;
    folderIds: string[];
    questionId: string;
  }): Promise<GoogleDriveQuestionSearchResult> {
    const { metadata } = await this.source(input);
    const initial = await this.dependencies.productAdapter.getQuestionWorkspace(input);
    const folderIds = [...new Set(input.folderIds)].sort();
    const folders = metadata.folders.filter((folder) => folderIds.includes(folder.id));
    if (
      folders.length !== folderIds.length
      || folders.some((folder) =>
        folder.organizationId !== input.organizationId
        || folder.sourceId !== input.sourceId
        || folder.revokedAt
      )
    ) throw new Error("Google Drive search folder scope denied.");
    const fileIds = new Set(metadata.files.filter((file) =>
      folderIds.includes(file.folderId) && file.status === "accessible"
    ).map((file) => file.googleFileId));
    const ranked = rankGoogleDrivePassages(
      initial.workspace.question.title,
      metadata.passages.filter((passage) => fileIds.has(passage.googleFileId)),
    );
    const unique = [...new Map(ranked.map((item) => [
      googleDriveCanonicalEvidenceIdentity({
        organizationId: input.organizationId,
        connectedSourceId: input.sourceId,
        contentDigest: item.passage.contentDigest,
      }),
      item,
    ])).values()]
      .slice(0, 5);
    let refreshed = initial;
    const newlyAdmittedSourceIds: string[] = [];
    const citations = unique.map((item) =>
      `google-drive:${item.passage.googleFileId}:${item.passage.revisionId}:${item.passage.id}`
    );
    for (const item of unique) {
      const beforeRevision = refreshed.runtimeRevision;
      const citation = `google-drive:${item.passage.googleFileId}:${item.passage.revisionId}:${item.passage.id}`;
      refreshed = await this.dependencies.productAdapter.contributeEvidence({
        ...input,
        contribution: {
          sourceId: citation,
          sourceType: "authorized_records",
          content: item.passage.content,
          contributedAt: this.dependencies.now(),
          idempotencyKey: googleDriveQuestionAdmissionIdentity({
            questionId: input.questionId,
            contentDigest: item.passage.contentDigest,
          }),
          ...(item.passage.legacyContentDigest
            ? {
                priorIdempotencyKeys: [
                  googleDriveQuestionAdmissionIdentity({
                    questionId: input.questionId,
                    contentDigest: item.passage.legacyContentDigest,
                  }),
                ],
              }
            : {}),
        },
        operation: {
          requestId: stableId("google-drive-admit", input.questionId, item.passage.id),
          operatorId: input.userId,
        },
      });
      if (refreshed.runtimeRevision !== beforeRevision) {
        newlyAdmittedSourceIds.push(citation);
      }
    }
    const searchedAt = this.dependencies.now();
    const limitations = unique.length
      ? []
      : ["No authorized passage met the exact Question relevance threshold."];
    refreshed = await this.dependencies.productAdapter.recordSearch({
      ...input,
      searchedAt,
      sourceIds: citations,
      scope: `Authorized Google Drive folders: ${folderIds.join(", ")}`,
      limitations,
      changeProduced: newlyAdmittedSourceIds.length > 0,
      operation: {
        requestId: stableId("google-drive-search", input.questionId, searchedAt),
        operatorId: input.userId,
      },
    });
    const receipt: ProductSearchReceipt = {
      questionId: input.questionId,
      searchedAt,
      sourceScopes: folderIds.map((folderId) => ({
        sourceId: folderId,
        sourceType: "google_drive_folder",
        organizationId: input.organizationId,
      })),
      recordsConsidered: ranked.length,
      evidenceAdmitted: newlyAdmittedSourceIds.length,
      limitations,
    };
    return {
      receipt,
      rankedResults: ranked,
      admittedSourceIds: newlyAdmittedSourceIds,
      workspace: refreshed.workspace,
    };
  }

  async disconnectFolder(input: {
    userId: string;
    organizationId: string;
    sourceId: string;
  }): Promise<GoogleDriveDisconnectionReceipt> {
    const { metadata, source, credential } = await this.source(input);
    try {
      await this.dependencies.api.revoke(credential);
    } catch {
      // Local revocation remains fail-closed even when Google's endpoint is unavailable.
    }
    const revokedAt = this.dependencies.now();
    metadata.sources = metadata.sources.map((item) =>
      item.id === source.id ? { ...item, status: "revoked", revokedAt } : item
    );
    metadata.folders = metadata.folders.map((item) =>
      item.sourceId === source.id ? { ...item, revokedAt } : item
    );
    metadata.files = metadata.files.map((item) => {
      const folder = metadata.folders.find((candidate) => candidate.id === item.folderId);
      return folder?.sourceId === source.id ? { ...item, status: "inaccessible" } : item;
    });
    await this.dependencies.metadata.replace(metadata);
    const credentialDeleted = await this.dependencies.credentials.delete(source.id);
    return {
      sourceId: source.id,
      organizationId: input.organizationId,
      revokedAt,
      credentialDeleted,
      historicalLineagePreserved: true,
    };
  }
}
