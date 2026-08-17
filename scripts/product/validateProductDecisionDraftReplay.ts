import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createEmptyOrganizationRuntime, type OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import {
  productDecisionDraftHistory,
  type CreateProductDecisionDraftRequestV1,
  type ProductDecisionDraftAuthorityGrantV1,
  type ProductDecisionDraftOperation,
  type ReviseProductDecisionDraftRequestV1,
} from "../../product/decisions";
import { ProductDecisionDraftService } from "../../product/integration/productDecisionDraftService";
import { appendProductQuestionEvent, createDurableProductQuestion } from "../../product/questions/questionLifecycle";
import { createProductArtifactBodyRefV1, productArtifactBodyDigest, type ProductArtifactBodyRefV1, type ProductArtifactBodyStageRequestV1, type ProductArtifactBodyStageReceiptV1 } from "../../product/persistence/productArtifactBodyContracts";
import type { ProductArtifactBodyRepository } from "../../product/persistence/productArtifactBodyRepository";
import { createOwnerBackedDraftDependencies } from "./validateCanonicalMutationProductMaterializationAtomicity";

const fixed = "2026-08-06T13:00:00.000Z";
const revisedAt = "2026-08-06T13:05:00.000Z";
const organizationId = "sandbox-northstar-implementation-services-001";
let questionId: string;
const answerId = "answer-replay";
const prefix = "discovery-northstar-preparation-lineage-draft-replay-";

const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`;
  return JSON.stringify(value);
};
const digest = (value: unknown): string => createHash("sha256").update(canonical(value)).digest("hex");

const draftContent = (title = "Prepare owner assignment") => ({
  title, intervention: "Assign an owner before kickoff.", rationale: "Reduce waiting.",
  assumptions: ["Timing is material."], risks: [], expectedOutcomes: [], measures: [],
  intendedDecisionMakerRef: null, intendedDecisionMakerLabel: null, proposedReviewDate: null,
});

const createRequest = (): CreateProductDecisionDraftRequestV1 => ({
  contractVersion: "1", organizationId, questionId, sourceAnswerId: answerId, draftId: null,
  expectedQuestionRevision: 1, expectedCurrentRevision: null, predecessorRevisionId: null,
  originatingProposalRef: "proposal:deterministic", recordedAt: fixed,
  idempotencyKey: "replay-create-key", content: draftContent(),
});

function authority(operation: ProductDecisionDraftOperation, at: string): ProductDecisionDraftAuthorityGrantV1 {
  return {
    contractVersion: "1", operation, organizationId, questionId,
    scope: { type: "product-question", id: questionId },
    purpose: operation === "product-decision-draft:create" ? "create-product-decision-draft"
      : operation === "product-decision-draft:revise" ? "revise-product-decision-draft" : "read-product-decision-draft",
    sensitivity: "standard", actorRef: "actor-replay", authorityRef: "authority-replay",
    policyRef: "policy-replay", authorized: true, status: "active", validFrom: fixed, authorizedAt: at,
  };
}

class ReplayBodyRepository implements ProductArtifactBodyRepository {
  readonly backend="filesystem" as const;constructor(private readonly root:string){}
  private target(ref:Pick<ProductArtifactBodyRefV1,"exactBodyDigest">){return path.join(this.root,`${ref.exactBodyDigest}.blob`);}
  async stage(input:ProductArtifactBodyStageRequestV1):Promise<ProductArtifactBodyStageReceiptV1>{const body=createProductArtifactBodyRefV1({organizationId:input.organizationId,semanticOwner:input.semanticOwner,artifactType:input.artifactType,artifactId:input.artifactId,artifactRevision:input.artifactRevision,exactBodyDigest:productArtifactBodyDigest(input.bytes),byteLength:input.bytes.byteLength,mediaType:"application/json",schemaRef:input.schemaRef});await mkdir(this.root,{recursive:true,mode:0o700});let disposition:"staged"|"exact-replay"="staged";try{await writeFile(this.target(body),input.bytes,{flag:"wx",mode:0o600});}catch(error){if((error as NodeJS.ErrnoException).code!=="EEXIST")throw error;disposition="exact-replay";assert.deepEqual(new Uint8Array(await readFile(this.target(body))),input.bytes);}return{contractVersion:"1",body,disposition,receiptDigest:productArtifactBodyDigest({body,disposition})};}
  async readStagedExact(ref:ProductArtifactBodyRefV1):Promise<Uint8Array>{const bytes=new Uint8Array(await readFile(this.target(ref)));if(bytes.byteLength!==ref.byteLength||productArtifactBodyDigest(bytes)!==ref.exactBodyDigest)throw new Error("body unavailable");return bytes;}
}

async function service(repository: FilesystemOrganizationRuntimeRepository,root:string): Promise<ProductDecisionDraftService> {
  const ownerBacked=await createOwnerBackedDraftDependencies(root);
  questionId=ownerBacked.questionId;
  return new ProductDecisionDraftService({
    runtimeRepository: repository,
    ...ownerBacked,
    authorize: async (input) => authority(input.operation, input.evaluatedAt),
  });
}

function fixtureRuntime(): OrganizationRuntime {
  let runtime = createEmptyOrganizationRuntime({ organizationId, name: "Decision Draft Replay", now: fixed });
  runtime = createDurableProductQuestion({ runtime, questionId, title: "Which intervention should be prepared?", createdAt: fixed }).runtime;
  return appendProductQuestionEvent(runtime, {
    type: "answer_recorded", organizationId, questionId, occurredAt: fixed,
    answer: { answerId, canonicalSource: "product-answer", revision: 1, reasonForChange: "Supported",
      changeReceiptId: "answer-receipt", timestamp: fixed,
      confidence: { level: "moderate", score: 0.7, meaning: "Supported", principalLimiter: "Time", authoritativeSource: "canonical-product-workflow" } },
  });
}

function safeRoot(value: string): string {
  const resolved = path.resolve(value);
  if (path.dirname(resolved) !== path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith(prefix)) {
    throw new Error("Replay root binding is invalid.");
  }
  return resolved;
}

async function roleA(root: string): Promise<unknown> {
  console.info = () => undefined;
  const repository = new FilesystemOrganizationRuntimeRepository(path.join(root,"draft-runtime"));
  const api=await service(repository,root);
  await repository.create(organizationId, new TextEncoder().encode(JSON.stringify(fixtureRuntime(), null, 2)), { requestId: "fixture-create", operatorId: "validator" });
  const created = await api.create({ userId: "authorized", request: createRequest(), storageOperation: { requestId: "draft-create", operatorId: "actor-replay" } });
  return { role: "A", questionId, revision: created.revision, receipt: created.receipt, runtimeRevision: created.runtimeRevision };
}

async function roleB(root: string): Promise<unknown> {
  console.info = () => undefined;
  const repository = new FilesystemOrganizationRuntimeRepository(path.join(root,"draft-runtime"));
  const api = await service(repository,root);
  const before = await api.read({ userId: "authorized", request: { contractVersion: "1", organizationId, questionId, evaluatedAt: fixed } });
  assert.equal(before.status, "available");
  const replay = await api.create({ userId: "authorized", request: createRequest(), storageOperation: { requestId: "draft-replay", operatorId: "actor-replay" } });
  const request: ReviseProductDecisionDraftRequestV1 = {
    ...createRequest(), draftId: before.current.revision.draftId, expectedCurrentRevision: 1,
    predecessorRevisionId: before.current.revision.revisionId, recordedAt: revisedAt,
    idempotencyKey: "replay-revise-key", content: draftContent("Prepare accountable owner assignment"),
  };
  const revised = await api.revise({ userId: "authorized", request, storageOperation: { requestId: "draft-revise", operatorId: "actor-replay" } });
  return { role: "B", before, replay, revised };
}

async function roleC(root: string): Promise<unknown> {
  console.info = () => undefined;
  const repository = new FilesystemOrganizationRuntimeRepository(path.join(root,"draft-runtime"));
  const api = await service(repository,root);
  const read = await api.read({ userId: "authorized", request: { contractVersion: "1", organizationId, questionId, evaluatedAt: revisedAt } });
  assert.equal(read.status, "available");
  const stale: ReviseProductDecisionDraftRequestV1 = {
    ...createRequest(), draftId: read.current.revision.draftId, expectedCurrentRevision: 1,
    predecessorRevisionId: read.history[0]!.revision.revisionId, recordedAt: "2026-08-06T13:06:00.000Z",
    idempotencyKey: "stale-key", content: draftContent("Stale"),
  };
  let staleRejected = false;
  try { await api.revise({ userId: "authorized", request: stale, storageOperation: { requestId: "stale", operatorId: "actor-replay" } }); } catch { staleRejected = true; }
  let wrongPredecessorRejected = false;
  try { await api.revise({ userId: "authorized", request: { ...stale, expectedCurrentRevision: 2, predecessorRevisionId: "wrong", idempotencyKey: "wrong-key" }, storageOperation: { requestId: "wrong", operatorId: "actor-replay" } }); } catch { wrongPredecessorRejected = true; }
  const stored = await repository.read(organizationId); assert.ok(stored);
  return {
    role: "C", read, staleRejected, wrongPredecessorRejected,
    decisionCount: stored.runtime.memory.executiveDecisionRecords.length,
    outcomeCount: stored.runtime.memory.executiveReviews.length,
    evidenceDigest: digest(stored.runtime.memory.understandingState),
    cognitionDigest: digest({ ...stored.runtime.memory, events: undefined, executiveDecisionRecords: undefined, executiveReviews: undefined }),
    eventCount: productDecisionDraftHistory(stored.runtime, questionId).length,
  };
}

function parseChild(bytes: Buffer, role: "A" | "B" | "C"): Record<string, unknown> {
  assert.ok(bytes.byteLength > 0 && bytes.byteLength < 65_536);
  const parsed = JSON.parse(bytes.toString("utf8")) as Record<string, unknown>;
  assert.equal(parsed.role, role);
  return parsed;
}

async function main(): Promise<void> {
  const role = process.argv[2];
  if (role === "A" || role === "B" || role === "C") {
    const root = safeRoot(process.argv[3] ?? "");
    const output = role === "A" ? await roleA(root) : role === "B" ? await roleB(root) : await roleC(root);
    process.stdout.write(JSON.stringify(output));
    return;
  }
  const runSuite = async (): Promise<{ a: Record<string, unknown>; b: Record<string, unknown>; c: Record<string, unknown> }> => {
    const root = await mkdtemp(path.join(os.tmpdir(), prefix));
    const script = path.resolve(process.argv[1]!);
    const run = (childRole: "A" | "B" | "C"): Record<string, unknown> => parseChild(execFileSync(
      process.execPath, ["--conditions=react-server", ...process.execArgv, script, childRole, root],
      { cwd: process.cwd(), env: { NODE_ENV: "test", TZ: "UTC", TMPDIR: os.tmpdir() }, timeout: 15_000, maxBuffer: 65_536, shell: false },
    ), childRole);
    try {
      return { a: run("A"), b: run("B"), c: run("C") };
    } finally {
      await rm(root, { recursive: true, force: true });
      await assert.rejects(() => readFile(root), /ENOENT/);
    }
  };
  const first = await runSuite();
  const second = await runSuite();
  assert.deepEqual(first, second);
  questionId=String(first.a.questionId);
  const firstRevision = (first.a.revision as Record<string, unknown>);
  const firstReceipt = (first.a.receipt as Record<string, unknown>);
  const replay = (first.b.replay as Record<string, unknown>);
  const replayReceipt = replay.receipt as Record<string, unknown>;
  const revised = first.b.revised as Record<string, unknown>;
  const revisedRevision = revised.revision as Record<string, unknown>;
  assert.equal(firstRevision.revision, 1);
  assert.equal(revisedRevision.revision, 2);
  assert.equal(revisedRevision.predecessorRevisionId, firstRevision.revisionId);
  assert.equal(replay.idempotent, true);
  assert.equal(replayReceipt.receiptId, firstReceipt.receiptId);
  assert.equal(replayReceipt.receiptDigest, firstReceipt.receiptDigest);
  assert.equal(first.c.staleRejected, true);
  assert.equal(first.c.wrongPredecessorRejected, true);
  assert.equal(first.c.eventCount, 2);
  assert.equal(first.c.decisionCount, 0);
  assert.equal(first.c.outcomeCount, 0);
  const expectedDraftId = `product-decision-draft:${digest({ organizationId, questionId, sourceAnswerId: answerId, keyDigest: digest("replay-create-key") })}`;
  assert.equal(firstRevision.draftId, expectedDraftId);
  assert.match(String(firstRevision.revisionId), /^product-decision-draft-revision:[a-f0-9]{64}$/);
  assert.match(String(firstReceipt.receiptId), /^product-decision-draft-receipt:[a-f0-9]{64}$/);
  assert.match(String(firstReceipt.receiptDigest), /^[a-f0-9]{64}$/);
  assert.match(String(firstReceipt.resultDigest), /^[a-f0-9]{64}$/);
  console.log("Product Decision Draft persisted replay PASS (6 fresh processes; roles A/B/C repeated; roots removed)");
}

void main();
