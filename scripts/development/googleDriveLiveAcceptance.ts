import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import { join } from "node:path";

import {
  FileGoogleDriveMetadataRepository,
  assessGoogleDriveQuestionFreshness,
} from "../../product/connectors/google-drive";
import { GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE } from "../../product/connectors/google-drive/developmentEligibility";
import { redactGoogleDriveOAuthLogValue } from "../../product/connectors/google-drive/logRedaction";
import { createDevelopmentGoogleDriveOAuthService } from "../../product/connectors/google-drive/liveOAuthService";
import { withLiveSandboxProductAdapter } from "../../product/frontend/liveSandboxProductWorkspaceService";
import { stableId } from "../../product/workflow/text";
import { deriveProductUnknownCandidate } from "../../product/unknowns";
import { resetSandboxGoogleDriveSynchronizationState, synchronizeSandboxDriveCorpus } from "../../product/simulations/living-organization-sandbox/googleDriveCorpus";
import { SANDBOX_ORGANIZATION_ID, sandboxManifest, type SandboxBatchId } from "../../product/simulations/living-organization-sandbox/manifest";

type Arguments = Record<string, string>;

const command = process.argv[2] ?? "";
const values = process.argv.slice(3).reduce<Arguments>((result, value, index, all) => {
  if (!value.startsWith("--")) return result;
  const next = all[index + 1];
  if (!next || next.startsWith("--")) throw new Error(`Missing value for ${value}.`);
  result[value.slice(2)] = next;
  return result;
}, {});
const userId = values["user-id"] ?? "";
const organizationId = values["organization-id"] ?? "";
const sourceId = values["source-id"] ?? "";
const storageRoot = join(process.cwd(), ".discovery-runtime", "onboarding-google-drive");
const metadataRepository = new FileGoogleDriveMetadataRepository(join(storageRoot, "metadata.json"));
const receiptPath = join(storageRoot, "live-acceptance-receipt.json");

function googleDriveService(adapter?: Parameters<typeof createDevelopmentGoogleDriveOAuthService>[0]) {
  return createDevelopmentGoogleDriveOAuthService(adapter, {
    purpose: organizationId === SANDBOX_ORGANIZATION_ID
      ? GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE
      : undefined,
  });
}

function requireExact(value: string, name: string): string {
  if (!value.trim()) throw new Error(`Exact ${name} is required.`);
  return value.trim();
}

function requiredScope() {
  return {
    userId: requireExact(userId, "Clerk development user ID"),
    organizationId: requireExact(organizationId, "development organization ID"),
    sourceId: requireExact(sourceId, "connected source ID"),
  };
}

async function persistReceipt(operation: string, result: unknown) {
  const receipt = redactGoogleDriveOAuthLogValue({
    diagnosticVersion: "1",
    operation,
    recordedAt: new Date().toISOString(),
    result,
  });
  await writeFile(receiptPath, JSON.stringify(receipt, null, 2), { mode: 0o600 });
  console.log(JSON.stringify(receipt, null, 2));
}

async function status() {
  const scope = requiredScope();
  const folders = await googleDriveService().listAuthorizedFolders({
    ...scope,
    exactFolderName: values["folder-name"],
  });
  const metadata = await metadataRepository.read();
  const source = metadata.sources.find((item) => item.id === scope.sourceId);
  await persistReceipt("status", {
    environment: "development",
    organizationId: scope.organizationId,
    sourceId: scope.sourceId,
    connected: source?.status === "connected" && !source.revokedAt,
    accountLabel: source?.accountLabel ?? null,
    exactFolderMatches: folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      selected: folder.selected,
      sharedDrive: Boolean(folder.driveId),
    })),
  });
}

async function listFolders() {
  const scope = requiredScope();
  const exactFolderName = requireExact(values["folder-name"] ?? "", "folder name");
  const folders = await googleDriveService().listAuthorizedFolders({
    ...scope,
    exactFolderName,
  });
  await persistReceipt("list-folders", {
    organizationId: scope.organizationId,
    sourceId: scope.sourceId,
    exactFolderName,
    folderCount: folders.length,
    folders: folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      selected: folder.selected,
      parentCount: folder.parentIds.length,
      sharedDrive: Boolean(folder.driveId),
    })),
  });
}

async function connectFolder() {
  const scope = requiredScope();
  const googleFolderId = requireExact(values["folder-id"] ?? "", "Google folder ID");
  if (googleFolderId.includes("?") || googleFolderId.includes("&")) {
    throw new Error("Google folder ID must be the opaque identifier without URL query parameters.");
  }
  const folder = await googleDriveService().connectFolder({
    ...scope,
    googleFolderId,
    includeNested: values["include-nested"] === "true",
  });
  await persistReceipt("connect-folder", {
    id: folder.id,
    sourceId: folder.sourceId,
    organizationId: folder.organizationId,
    displayName: folder.displayName,
    includeNested: folder.includeNested,
    connectedAt: folder.connectedAt,
    limitations: folder.limitations,
  });
}

async function verifyFolder() {
  const scope = requiredScope();
  const googleFolderId = requireExact(values["folder-id"] ?? "", "Google folder ID");
  if (googleFolderId.includes("?") || googleFolderId.includes("&")) {
    throw new Error("Google folder ID must be the opaque identifier without URL query parameters.");
  }
  const folder = await googleDriveService().inspectAuthorizedFolder({
    ...scope,
    googleFolderId,
  });
  await persistReceipt("verify-folder", {
    id: folder.id,
    name: folder.name,
    selected: folder.selected,
    parentCount: folder.parentIds.length,
    sharedDrive: Boolean(folder.driveId),
  });
}

async function syncFolder() {
  const scope = requiredScope();
  const folderId = requireExact(values["folder-id"] ?? "", "connected folder ID");
  const receipt = await googleDriveService().synchronizeFolder({
    ...scope,
    folderId,
  });
  const metadata = await metadataRepository.read();
  const files = metadata.files.filter((file) => file.folderId === folderId);
  const passages = metadata.passages.filter((passage) =>
    files.some((file) => file.googleFileId === passage.googleFileId)
  );
  const duplicateContentCandidates = [...new Map(
    passages.map((passage) => [passage.contentDigest, passages.filter(
      (candidate) => candidate.contentDigest === passage.contentDigest,
    ).map((candidate) => candidate.googleFileId)]),
  ).entries()].filter(([, ids]) => new Set(ids).size > 1).map(([digest, ids]) => ({
    digest,
    sourceCount: new Set(ids).size,
  }));
  await persistReceipt("sync-folder", {
    receipt,
    files: files.map((file) => ({
      googleFileId: file.googleFileId,
      name: file.name,
      mimeType: file.mimeType,
      revisionId: file.revisionId,
      modifiedAt: file.modifiedAt,
      extractedAt: file.extractedAt,
      extractionDigest: file.extractionDigest,
      passageCount: file.passageCount,
      status: file.status,
    })),
    passageLocations: passages.map((passage) => ({
      googleFileId: passage.googleFileId,
      revisionId: passage.revisionId,
      location: passage.location,
      contentDigest: passage.contentDigest,
    })),
    duplicateContentCandidates,
  });
}

async function syncSandboxCorpus() {
  const scope = requiredScope();
  if (scope.organizationId !== SANDBOX_ORGANIZATION_ID) {
    throw new Error("Living Organization corpus synchronization requires the exact sandbox organization.");
  }
  const connectedFolderId = requireExact(
    process.env.DISCOVERY_SANDBOX_GOOGLE_DRIVE_CONNECTED_FOLDER_ID ?? "",
    "DISCOVERY_SANDBOX_GOOGLE_DRIVE_CONNECTED_FOLDER_ID configuration",
  );
  const googleFolderId = requireExact(
    process.env.DISCOVERY_SANDBOX_GOOGLE_DRIVE_FOLDER_ID ?? "",
    "DISCOVERY_SANDBOX_GOOGLE_DRIVE_FOLDER_ID configuration",
  );
  const throughBatch = requireExact(values["through-batch"] ?? "", "manifest batch") as SandboxBatchId;
  if (!sandboxManifest.batchOrder.includes(throughBatch)) throw new Error("Unknown sandbox corpus batch.");
  const service = googleDriveService();
  const metadataBefore = await metadataRepository.read();
  const folder = metadataBefore.folders.find(item => item.id === connectedFolderId);
  if (!folder || folder.sourceId !== scope.sourceId || folder.organizationId !== scope.organizationId || folder.revokedAt) {
    throw new Error("Exact connected sandbox folder access denied.");
  }
  if (folder.googleFolderId !== googleFolderId || folder.includeNested) {
    throw new Error("Sandbox folder must match the configured non-recursive Google folder exactly.");
  }
  const receipt = await service.synchronizeFolder({
    ...scope,
    folderId: connectedFolderId,
    limits: {
      maxFiles: 32,
      maxTotalExtractedBytes: 2 * 1024 * 1024,
      allowedMimeTypes: ["application/vnd.google-apps.document", "text/markdown", "text/plain"],
    },
  });
  const metadata = await metadataRepository.read();
  const transportFiles = metadata.files.filter(file => file.folderId === connectedFolderId && file.status === "accessible").map(file => {
    const passages = metadata.passages.filter(passage => passage.googleFileId === file.googleFileId).sort((a,b) => a.location.localeCompare(b.location));
    if (passages.length !== 1) throw new Error(`Strict sandbox corpus file must extract to exactly one bounded passage: ${file.name}.`);
    return { driveFileId:file.googleFileId, driveRevisionId:file.revisionId, name:file.name, mimeType:file.mimeType, retrievedAt:file.extractedAt ?? receipt.synchronizedAt, content:passages[0]!.content };
  });
  const sandboxRoot = await mkdtemp(join(os.tmpdir(), "discovery-living-organization-sandbox-drive-live-"));
  let oracleRoot: string | null = null;
  try {
    oracleRoot = await mkdtemp(join(os.tmpdir(), "discovery-living-organization-sandbox-drive-oracle-"));
    const result = await synchronizeSandboxDriveCorpus({
      environment: process.env.DISCOVERY_ENV ?? "", ...scope,
      configuredFolderId: googleFolderId, requestedFolderId: googleFolderId,
      connectedFolderId, includeNested:false, throughBatch, files:transportFiles,
      sandboxRoot, localOracleRoot:oracleRoot,
      owner:{ synchronizeFolder: async () => receipt },
    });
    await persistReceipt("sync-sandbox-corpus", result);
  } finally {
    await rm(sandboxRoot,{recursive:true,force:true});
    if (oracleRoot) await rm(oracleRoot,{recursive:true,force:true});
  }
}

async function resetSandboxCorpusState() {
  const scope=requiredScope();
  const folderId=requireExact(process.env.DISCOVERY_SANDBOX_GOOGLE_DRIVE_CONNECTED_FOLDER_ID??"","DISCOVERY_SANDBOX_GOOGLE_DRIVE_CONNECTED_FOLDER_ID configuration");
  const googleFolderId=requireExact(process.env.DISCOVERY_SANDBOX_GOOGLE_DRIVE_FOLDER_ID??"","DISCOVERY_SANDBOX_GOOGLE_DRIVE_FOLDER_ID configuration");
  const result=await resetSandboxGoogleDriveSynchronizationState({environment:process.env.DISCOVERY_ENV??"",...scope,folderId,googleFolderId,metadata:metadataRepository});
  const { resetOrganizationRuntimeState } = await import("../../engine/v3/runtime/organizationStateStore");
  resetOrganizationRuntimeState(SANDBOX_ORGANIZATION_ID);
  await persistReceipt("reset-sandbox-corpus-state",{...result,runtimeReset:true,semanticCheckpointCleared:true});
}

async function createQuestion() {
  const scope = requiredScope();
  const question = requireExact(values.question ?? "", "Question");
  const createdAt = new Date().toISOString();
  const idempotencyKey = stableId("google-drive-live-question", scope.organizationId, question);
  await withLiveSandboxProductAdapter({
    userId: scope.userId,
    organizationId: scope.organizationId,
    operation: async (adapter) => {
      const result = await adapter.createQuestion({
        userId: scope.userId,
        organizationId: scope.organizationId,
        question,
        createdAt,
        idempotencyKey,
        operation: {
          requestId: idempotencyKey,
          operatorId: scope.userId,
        },
      });
      await persistReceipt("create-question", {
        organizationId: result.workspace.question.organizationId,
        questionId: result.workspace.question.id,
        question: result.workspace.question.title,
        status: result.workspace.question.status,
        contractVersion: result.workspace.contractVersion,
        runtimeRevisionPresent: Boolean(result.runtimeRevision),
      });
    },
  });
}

async function listQuestions() {
  const scope = requiredScope();
  await withLiveSandboxProductAdapter({
    userId: scope.userId,
    organizationId: scope.organizationId,
    operation: async (adapter) => {
      const questions = await adapter.listQuestions({
        userId: scope.userId,
        organizationId: scope.organizationId,
        includeArchived: false,
      });
      await persistReceipt("list-questions", {
        organizationId: scope.organizationId,
        questions: questions.map((question) => ({
          id: question.id,
          title: question.title,
          status: question.status,
          currentSupport: question.currentSupport,
        })),
      });
    },
  });
}

async function searchQuestion() {
  const scope = requiredScope();
  const folderId = requireExact(values["folder-id"] ?? "", "connected folder ID");
  const questionId = requireExact(values["question-id"] ?? "", "durable Question ID");
  await withLiveSandboxProductAdapter({
    userId: scope.userId,
    organizationId: scope.organizationId,
    operation: async (adapter) => {
      const result = await googleDriveService(adapter).searchFolder({
        ...scope,
        folderIds: [folderId],
        questionId,
      });
      const metadata = await metadataRepository.read();
      const folder = metadata.folders.find((item) => item.id === folderId);
      const relevantFileIds = [...new Set(result.rankedResults.map(
        (item) => item.passage.googleFileId,
      ))];
      const freshness = folder
        ? assessGoogleDriveQuestionFreshness({
            folder,
            files: metadata.files.filter((file) => file.folderId === folderId),
            relevantFileIds,
            now: new Date().toISOString(),
          })
        : null;
      await persistReceipt("search-question", {
        receipt: result.receipt,
        rankedResults: result.rankedResults.map((item) => ({
          googleFileId: item.passage.googleFileId,
          fileName: item.passage.fileName,
          revisionId: item.passage.revisionId,
          modifiedAt: item.passage.modifiedAt,
          extractedAt: item.passage.extractedAt,
          location: item.passage.location,
          contentDigest: item.passage.contentDigest,
          score: item.score,
          matchedTerms: item.matchedTerms,
        })),
        admittedSourceIds: result.admittedSourceIds,
        workspace: {
          contractVersion: result.workspace.contractVersion,
          organizationId: result.workspace.question.organizationId,
          question: result.workspace.question,
          answer: result.workspace.answer,
          confidence: result.workspace.answer?.kind === "answer"
            ? result.workspace.answer.confidence
            : null,
          improvement: result.workspace.improvementPlan,
        },
        freshness,
      });
    },
  });
}

async function refreshAnswer() {
  const scope = requiredScope();
  const questionId = requireExact(values["question-id"] ?? "", "durable Question ID");
  const operationId = requireExact(values["operation-id"] ?? "", "Answer operation ID");
  const occurredAt = requireExact(values["occurred-at"] ?? "", "operation time");
  await withLiveSandboxProductAdapter({
    userId: scope.userId,
    organizationId: scope.organizationId,
    operation: async (adapter) => {
      const refreshed = await adapter.createOrRefreshAnswer({
        userId: scope.userId,
        organizationId: scope.organizationId,
        questionId,
        operationId,
        occurredAt,
        operation: {
          requestId: operationId,
          operatorId: scope.userId,
        },
      });
      await persistReceipt("refresh-answer", {
        organizationId: scope.organizationId,
        questionId,
        result: refreshed.result,
        receipt: refreshed.receipt,
        runtimeRevisionPresent: Boolean(refreshed.runtimeRevision),
      });
    },
  });
}

function unknownCandidate() {
  const scope = requiredScope();
  const questionId = requireExact(values["question-id"] ?? "", "durable Question ID");
  const left = requireExact(values["left-explanation-id"] ?? "", "left explanation ID");
  const right = requireExact(values["right-explanation-id"] ?? "", "right explanation ID");
  const answerOperationId = requireExact(
    values["answer-operation-id"] ?? "",
    "source Answer operation ID",
  );
  const evidenceIds = requireExact(values["evidence-ids"] ?? "", "comma-separated Evidence IDs")
    .split(",").map((value) => value.trim()).filter(Boolean);
  if (evidenceIds.length === 0) throw new Error("At least one exact Evidence ID is required.");
  return deriveProductUnknownCandidate({
    organizationId: scope.organizationId,
    questionId,
    category: "competing-explanation-discrimination",
    target: {
      kind: "relationship",
      subjectRef: left,
      predicate: "versus",
      objectRef: right,
    },
    summary: requireExact(values.summary ?? "", "bounded Unknown summary"),
    whyItMatters: requireExact(values["why-it-matters"] ?? "", "bounded Unknown importance"),
    sourceAncestry: [
      { kind: "answer-operation", id: answerOperationId },
      ...evidenceIds.map((id) => ({ kind: "evidence" as const, id })),
    ],
  });
}

async function projectUnknownCandidate() {
  const scope = requiredScope();
  const candidate = unknownCandidate();
  await withLiveSandboxProductAdapter({
    userId: scope.userId,
    organizationId: scope.organizationId,
    operation: async (adapter) => {
      await adapter.getQuestionWorkspace({
        userId: scope.userId,
        organizationId: scope.organizationId,
        questionId: candidate.questionId,
      });
      await persistReceipt("project-unknown-candidate", {
        candidate,
        runtimeMutation: false,
      });
    },
  });
}

async function openUnknown() {
  const scope = requiredScope();
  const candidate = unknownCandidate();
  const operationId = requireExact(values["operation-id"] ?? "", "Unknown operation ID");
  const occurredAt = requireExact(values["occurred-at"] ?? "", "operation time");
  await withLiveSandboxProductAdapter({
    userId: scope.userId,
    organizationId: scope.organizationId,
    operation: async (adapter) => {
      const result = await adapter.mutateUnknown({
        userId: scope.userId,
        organizationId: scope.organizationId,
        questionId: candidate.questionId,
        operationId,
        occurredAt,
        actorRef: scope.userId,
        candidate,
        transition: { type: "open" },
        reason: requireExact(values.reason ?? "", "Unknown opening reason"),
        operation: { requestId: operationId, operatorId: scope.userId },
      });
      await persistReceipt("open-unknown", {
        unknown: result.unknown,
        receipt: result.receipt,
        runtimeRevisionPresent: Boolean(result.runtimeRevision),
      });
    },
  });
}

async function listUnknowns() {
  const scope = requiredScope();
  const questionId = requireExact(values["question-id"] ?? "", "durable Question ID");
  await withLiveSandboxProductAdapter({
    userId: scope.userId,
    organizationId: scope.organizationId,
    operation: async (adapter) => {
      const result = await adapter.listUnknowns({
        userId: scope.userId,
        organizationId: scope.organizationId,
        questionId,
        currentOnly: values["current-only"] !== "false",
      });
      await persistReceipt("list-unknowns", {
        organizationId: scope.organizationId,
        questionId,
        unknowns: result.unknowns,
        runtimeRevisionPresent: Boolean(result.runtimeRevision),
      });
    },
  });
}

async function showReceipt() {
  const scope = requiredScope();
  const receipt = JSON.parse(await readFile(receiptPath, "utf8")) as {
    diagnosticVersion?: unknown;
    operation?: unknown;
    recordedAt?: unknown;
    result?: unknown;
  };
  console.log(JSON.stringify({
    diagnosticVersion: receipt.diagnosticVersion,
    operation: receipt.operation,
    recordedAt: receipt.recordedAt,
    organizationId: scope.organizationId,
    sourceId: scope.sourceId,
    result: receipt.result,
  }, null, 2));
}

async function revoke() {
  const scope = requiredScope();
  if (values.confirm !== "REVOKE") {
    throw new Error("Revocation requires --confirm REVOKE.");
  }
  const receipt = await googleDriveService().disconnectFolder(scope);
  await persistReceipt("revoke", receipt);
}

const operations: Record<string, () => Promise<void>> = {
  status,
  "list-folders": listFolders,
  "verify-folder": verifyFolder,
  "connect-folder": connectFolder,
  "sync-folder": syncFolder,
  "sync-sandbox-corpus": syncSandboxCorpus,
  "reset-sandbox-corpus-state": resetSandboxCorpusState,
  "create-question": createQuestion,
  "list-questions": listQuestions,
  "search-question": searchQuestion,
  "refresh-answer": refreshAnswer,
  "project-unknown-candidate": projectUnknownCandidate,
  "open-unknown": openUnknown,
  "list-unknowns": listUnknowns,
  "show-receipt": showReceipt,
  revoke,
};

async function main() {
  const operation = operations[command];
  if (!operation) throw new Error(`Unsupported Google Drive diagnostic command: ${command}.`);
  await operation();
}

void main().catch((error) => {
  console.error(JSON.stringify(redactGoogleDriveOAuthLogValue({
    status: "failed",
    operation: command,
    message: error instanceof Error ? error.message : "Google Drive diagnostic failed.",
  })));
  process.exitCode = 1;
});
