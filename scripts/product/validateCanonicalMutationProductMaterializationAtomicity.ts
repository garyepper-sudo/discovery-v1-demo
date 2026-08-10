import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { ProductWorkflowArtifactRepository, ProductWorkflowStoreSnapshot } from "../../product/workflow/leadershipConversation/productWorkflowArtifactRepository";
import { LeadershipConversationProductOperations } from "../../product/workflow/leadershipConversation/operations";
import {
  assertCanonicalMutationProductMaterializationStageTransitionV1,
  assertCanonicalProductDecisionDraftMaterializationResultIntegrityV1,
  assertCanonicalProductMaterializationCandidatePreflightIntegrityV1,
  assertCanonicalProductMaterializationInstructionIntegrityV1,
  createCanonicalProductMaterializationCandidatePreflightDigestV1,
  createCanonicalProductDecisionDraftMaterializationResultDigestV1,
  createCanonicalProductMaterializationInstructionDigestV1,
  type CanonicalProductMaterializationInstructionV1,
} from "../../product/workflow/leadershipConversation/canonicalProductMaterializationContracts";
import { leadershipDigest, leadershipStableSerialize } from "../../product/workflow/leadershipConversation/determinism";
import type { LeadershipConversationArtifactStoreV1 } from "../../product/workflow/leadershipConversation/contracts";
import { createEmptyOrganizationRuntime, type OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type { StoredOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { appendProductQuestionEvent, createDurableProductQuestion } from "../../product/questions/questionLifecycle";
import { ProductDecisionDraftService } from "../../product/integration/productDecisionDraftService";
import { CanonicalLeadershipConversationProductMaterializer } from "../../product/integration/canonicalLeadershipConversationProductMaterializer";
import type { ProductDecisionDraftAuthorityGrantV1, ProductDecisionDraftOperation } from "../../product/decisions";
import { productDecisionDraftDigest } from "../../product/decisions";
import { pathToFileURL } from "node:url";
import { createProductArtifactBodyRefV1, productArtifactBodyDigest, type ProductArtifactBodyRefV1, type ProductArtifactBodyStageRequestV1, type ProductArtifactBodyStageReceiptV1 } from "../../product/persistence/productArtifactBodyContracts";
import type { ProductArtifactBodyRepository } from "../../product/persistence/productArtifactBodyRepository";
import { completeProductArtifactInspectionMetadataV1, validateProductArtifactInspectionMetadataV1, type ProductArtifactInspectionMetadataV1 } from "../../product/workflow/productArtifactInspectionMetadataContracts";

const sha = (value: string) => createHash("sha256").update(value).digest("hex");
export const organizationId = "sandbox-northstar-implementation-services-001";
export const questionId = "product-question:northstar-implementation-duration";
const conversationId = "conversation-1";

const emptyStore = (): LeadershipConversationArtifactStoreV1 => ({
  contractVersion: "1", organizationId, contexts: [], preparedWorkProducts: [], frozenSnapshots: [],
  uploadReceipts: [], proposals: [], dispositions: [], canonicalRoutingReceipts: [], routingLinks: [],
  changeLinks: [], futurePreparationLinks: [], productMaterializations: [], productMaterializationReceipts: [],
  events: [], idempotency: [], storeDigest: "",
});

export class MemoryWorkflowRepository implements ProductWorkflowArtifactRepository {
  replaceCount = 0;
  snapshot: ProductWorkflowStoreSnapshot = { store: emptyStore(), revision: null };
  async read(): Promise<ProductWorkflowStoreSnapshot> { return structuredClone(this.snapshot); }
  async replace(_organizationId: string, store: LeadershipConversationArtifactStoreV1, expected: string | null): Promise<ProductWorkflowStoreSnapshot> {
    assert.equal(expected, this.snapshot.revision); this.replaceCount += 1;
    this.snapshot = { store: structuredClone(store), revision: sha(leadershipStableSerialize(store)) };
    return structuredClone(this.snapshot);
  }
  async resetDevelopmentFixture(): Promise<boolean> { return false; }
}

export class MemoryBodyRepository implements ProductArtifactBodyRepository {
  readonly backend="filesystem" as const;
  private readonly bodies=new Map<string,Uint8Array>();
  async stage(input:ProductArtifactBodyStageRequestV1):Promise<ProductArtifactBodyStageReceiptV1>{const body=createProductArtifactBodyRefV1({organizationId:input.organizationId,semanticOwner:input.semanticOwner,artifactType:input.artifactType,artifactId:input.artifactId,artifactRevision:input.artifactRevision,exactBodyDigest:productArtifactBodyDigest(input.bytes),byteLength:input.bytes.byteLength,mediaType:"application/json",schemaRef:input.schemaRef}),existing=this.bodies.get(body.bodyId),disposition=existing?"exact-replay" as const:"staged" as const;if(existing)assert.deepEqual(existing,input.bytes);else this.bodies.set(body.bodyId,input.bytes.slice());return{contractVersion:"1",body,disposition,receiptDigest:productArtifactBodyDigest({body,disposition})};}
  async readStagedExact(ref:ProductArtifactBodyRefV1):Promise<Uint8Array>{const bytes=this.bodies.get(ref.bodyId);if(!bytes||productArtifactBodyDigest(bytes)!==ref.exactBodyDigest)throw new Error("body unavailable");return bytes.slice();}
}

export async function createOwnerBackedDraftDependencies(fixtureRoot:string):Promise<{bodyRepository:ProductArtifactBodyRepository;completeInspectionMetadata(input:{organizationId:string;questionId:string;draftId:string;draftRevisionId:string;creationOperationId:string;requestFingerprint:string;body:ProductArtifactBodyRefV1;stageReceiptDigest:string}):Promise<ProductArtifactInspectionMetadataV1>}>{
  const [{createProductArtifactBodyRepository},{provisionNorthstarPreparationLineageFixture,readNorthstarPreparationLineageSeed}]=await Promise.all([import("../../product/persistence/productArtifactBodyRepository"),import("../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner")]);
  const provisioned=await provisionNorthstarPreparationLineageFixture({environment:"test",fixtureRoot});
  const load=()=>readNorthstarPreparationLineageSeed({fixtureRoot,organizationId,fixtureId:"northstar-preparation-lineage-fixture-v1",provisioningKey:"northstar-preparation-lineage:v1",expectedSeedDigest:provisioned.seed.seedDigest});
  const seed=await load();assert.equal(seed.productQuestionId,questionId);assert.ok(seed.sourceBindings.length&&seed.sourceContentVersions.length&&seed.canonicalMaterial.length);
  return{bodyRepository:createProductArtifactBodyRepository({root:path.join(fixtureRoot,"product-artifact-bodies")}),completeInspectionMetadata:async input=>{const loaded=await load();assert.equal(input.organizationId,loaded.organizationId);assert.equal(input.questionId,loaded.productQuestionId);const metadata=completeProductArtifactInspectionMetadataV1({organizationId:input.organizationId,semanticOwner:"product-decision-draft",artifactType:"product-decision-draft",artifactId:input.draftId,artifactRevision:input.draftRevisionId,productQuestionId:input.questionId,productWorkflowId:null,creationEnvelopeDigest:productDecisionDraftDigest({creationOperationId:input.creationOperationId,requestFingerprint:input.requestFingerprint}),materialReferencesDigest:productDecisionDraftDigest(loaded.canonicalMaterial),protectedBody:input.body,ownerStageReceiptDigest:input.stageReceiptDigest,materialLineage:{...loaded,semanticOwner:"product-decision-draft",artifactType:"product-decision-draft",artifactId:input.draftId,artifactRevision:input.draftRevisionId,envelopeDigest:""}});validateProductArtifactInspectionMetadataV1(metadata);return metadata;}};
}

export function instruction(draftRequired = false): CanonicalProductMaterializationInstructionV1 {
  const protectedBody=createProductArtifactBodyRefV1({organizationId,semanticOwner:"leadership-conversation",artifactType:"what-changed",artifactId:"what-changed-1",artifactRevision:"1",exactBodyDigest:sha("what-changed-body"),byteLength:1,mediaType:"application/json",schemaRef:"discovery:product:what-changed-body:v1"});
  const whatChangedHeader={integrationReceiptId:"integration-receipt-1",artifactRevision:"1",productWorkflowId:"workflow-1",creationEnvelopeDigest:sha("creation"),materialReferencesDigest:sha("materials"),protectedBody,ownerStageReceiptDigest:sha("stage")};
  const whatChangedEnvelope={...whatChangedHeader,headerDigest:leadershipDigest(leadershipStableSerialize(whatChangedHeader))};
  const unsigned = {
    contractVersion: "1" as const, instructionId: "instruction-1", organizationId, questionId, conversationId,
    proposalId: "proposal-1", canonicalOperationId: "operation-1", requestFingerprint: sha("request"),
    idempotencyKeyDigest: sha("idempotency"), actorRef: "actor-1", evaluatedAt: "2026-08-09T12:00:00.000Z",
    authorityRevisionRefs: ["authority-1"], policyRevisionRefs: ["policy-1"], expectedRuntimeRevision: sha("runtime-before"),
    committedRuntimeStateDigest: sha("candidate-runtime"), canonicalUnderstandingBeforeRef: "understanding-before",
    canonicalUnderstandingAfterRef: "understanding-after", canonicalChangeResultId: "change-result-1",
    canonicalChangeResultDigest: sha("change"), governedProductInputDigest: sha("governed-input"),
    lineagePolicyVersion: "lineage-policy-1", materialReferences: ["material-1"], materialEnvelopeDigest: sha("materials"),
    whatChangedIntent: "materialize" as const, whatChangedArtifactId: "what-changed-1", whatChangedEnvelope,
    whatChangedEnvelopeDigest: leadershipDigest(leadershipStableSerialize(whatChangedEnvelope)),
    draftMaterialization: draftRequired ? (() => {
      const payload = { sourceAnswerId: "answer-1", expectedQuestionRevision: 1, expectedCurrentRevision: null, predecessorRevisionId: null, originatingProposalRef: "proposal-1", title: "Draft intervention", intervention: "Assign an owner.", rationale: "Reduce delay.", assumptions: [], risks: [], expectedOutcomes: [], measures: [], intendedDecisionMakerRef: null, intendedDecisionMakerLabel: null, proposedReviewDate: null };
      return { contractVersion: "1" as const, required: true as const, draftId: "draft-expected-1", draftEnvelopeDigest: leadershipDigest(leadershipStableSerialize(payload)), requestFingerprint: sha("draft-request"), idempotencyKeyDigest: productDecisionDraftDigest("canonical-materialization:operation-1:draft"), payload };
    })() : { contractVersion: "1" as const, required: false as const, draftId: null, draftEnvelopeDigest: null, requestFingerprint: null, idempotencyKeyDigest: null, payload: null },
    targetProductWorkflowId: "workflow-1",
  };
  return { ...unsigned, instructionDigest: createCanonicalProductMaterializationInstructionDigestV1(unsigned) };
}

const runtimeBytes = (runtime: OrganizationRuntime) => new TextEncoder().encode(JSON.stringify(runtime, null, 2));
export class MemoryRuntimeRepository {
  replaceCount = 0;
  current: StoredOrganizationRuntime;
  constructor(runtime: OrganizationRuntime) { const bytes = runtimeBytes(runtime); this.current = { runtime: structuredClone(runtime), bytes, revision: sha(Buffer.from(bytes).toString("utf8")) }; }
  async read(id: string) { return id === organizationId ? structuredClone(this.current) : null; }
  async replace(id: string, bytes: Uint8Array, expected: string) { assert.equal(id, organizationId); assert.equal(expected, this.current.revision); this.replaceCount += 1; const runtime = JSON.parse(Buffer.from(bytes).toString("utf8")) as OrganizationRuntime; this.current = { runtime, bytes, revision: sha(Buffer.from(bytes).toString("utf8")) }; return structuredClone(this.current); }
}
export function runtimeWithInstruction(value: CanonicalProductMaterializationInstructionV1): OrganizationRuntime {
  let runtime = createEmptyOrganizationRuntime({ organizationId, name: "Atomicity Validation", now: value.evaluatedAt });
  runtime = createDurableProductQuestion({ runtime, title: "What should change?", questionId, createdAt: value.evaluatedAt }).runtime;
  runtime = appendProductQuestionEvent(runtime, { type: "answer_recorded", organizationId, questionId, occurredAt: value.evaluatedAt, answer: { answerId: "answer-1", canonicalSource: "product-answer", revision: 1, reasonForChange: "Supported", changeReceiptId: "answer-change-1", timestamp: value.evaluatedAt, confidence: { level: "moderate", score: 0.7, meaning: "Supported", principalLimiter: "Time", authoritativeSource: "canonical-product-workflow" } } });
  runtime.memory.events.push({ contributionOperationId: value.canonicalOperationId, productMaterializationInstruction: value });
  return runtime;
}
function grant(operation: ProductDecisionDraftOperation, at: string): ProductDecisionDraftAuthorityGrantV1 { return { contractVersion: "1", operation, organizationId, questionId, scope: { type: "product-question", id: questionId }, purpose: operation === "product-decision-draft:create" ? "create-product-decision-draft" : operation === "product-decision-draft:revise" ? "revise-product-decision-draft" : "read-product-decision-draft", sensitivity: "standard", actorRef: "actor-1", authorityRef: "authority-1", policyRef: "policy-1", authorized: true, status: "active", validFrom: at, authorizedAt: at }; }

export async function runAtomicityValidation(): Promise<void> {
  const fixtureRoot=await mkdtemp(path.join(tmpdir(),"discovery-northstar-preparation-lineage-atomicity-"));
  try{
  const repository = new MemoryWorkflowRepository();
  const operations = new LeadershipConversationProductOperations({
    repository, clock: { now: () => "2026-08-09T12:00:00.000Z" }, authorize: async () => false,
    verifyCanonicalInstructionProvenance: async () => true,
    loadBase: async () => { throw new Error("frontend read must not occur"); },
    source: { write: async () => { throw new Error("source write must not occur"); }, readForProposal: async () => { throw new Error("source read must not occur"); }, readForEvidenceAdmission: async () => { throw new Error("source read must not occur"); } },
  });
  const canonicalInstruction = instruction();
  const unsignedInstruction = (value: CanonicalProductMaterializationInstructionV1): Omit<CanonicalProductMaterializationInstructionV1, "instructionDigest"> => {
    const { instructionDigest: _digest, ...unsigned } = value;
    void _digest;
    return unsigned;
  };
  const originalInstruction = structuredClone(canonicalInstruction);
  assertCanonicalProductMaterializationInstructionIntegrityV1(canonicalInstruction);
  assert.deepEqual(canonicalInstruction, originalInstruction);
  const reordered = { ...canonicalInstruction, authorityRevisionRefs: [...canonicalInstruction.authorityRevisionRefs].reverse(), policyRevisionRefs: [...canonicalInstruction.policyRevisionRefs].reverse(), materialReferences: [...canonicalInstruction.materialReferences].reverse() };
  assert.equal(createCanonicalProductMaterializationInstructionDigestV1(unsignedInstruction(reordered)), canonicalInstruction.instructionDigest);
  const changed = structuredClone(canonicalInstruction); changed.whatChangedEnvelope.creationEnvelopeDigest = sha("different-creation"); const {headerDigest:_headerDigest,...changedHeader}=changed.whatChangedEnvelope; changed.whatChangedEnvelope.headerDigest=leadershipDigest(leadershipStableSerialize(changedHeader)); changed.whatChangedEnvelopeDigest = leadershipDigest(leadershipStableSerialize(changed.whatChangedEnvelope)); changed.instructionDigest = createCanonicalProductMaterializationInstructionDigestV1(unsignedInstruction(changed));
  assert.notEqual(changed.instructionDigest, canonicalInstruction.instructionDigest);
  const openEnvelope = structuredClone(canonicalInstruction) as CanonicalProductMaterializationInstructionV1 & { whatChangedEnvelope: CanonicalProductMaterializationInstructionV1["whatChangedEnvelope"] & { fabricated?: boolean } }; openEnvelope.whatChangedEnvelope.fabricated = true; openEnvelope.instructionDigest = createCanonicalProductMaterializationInstructionDigestV1(unsignedInstruction(openEnvelope));
  assert.throws(() => assertCanonicalProductMaterializationInstructionIntegrityV1(openEnvelope), /missing or unknown fields/);
  const invalidPreflightBase = { contractVersion: "1" as const, organizationId, questionId, expectedRuntimeRevision: "runtime-1", evaluatedAt: canonicalInstruction.evaluatedAt, authorityRevisionRefs: ["authority-1"], policyRevisionRefs: ["policy-1"], governedProductInputDigest: sha("input"), materialEnvelopeDigest: sha("material"), disposition: "fabricated" as "approved" };
  const invalidPreflight = { ...invalidPreflightBase, preflightDigest: createCanonicalProductMaterializationCandidatePreflightDigestV1(invalidPreflightBase) };
  assert.throws(() => assertCanonicalProductMaterializationCandidatePreflightIntegrityV1(invalidPreflight), /disposition is invalid/);
  const unsignedDraft = { contractVersion: "1" as const, status: "not-applicable" as const, canonicalOperationId: canonicalInstruction.canonicalOperationId, instructionDigest: canonicalInstruction.instructionDigest, receipt: null };
  const draftResult = { ...unsignedDraft, resultDigest: createCanonicalProductDecisionDraftMaterializationResultDigestV1(unsignedDraft) };
  const invalidDraftBase = { ...unsignedDraft, status: "fabricated" as "not-applicable" }; const invalidDraft = { ...invalidDraftBase, resultDigest: createCanonicalProductDecisionDraftMaterializationResultDigestV1(invalidDraftBase) };
  assert.throws(() => assertCanonicalProductDecisionDraftMaterializationResultIntegrityV1(invalidDraft), /status is invalid/);
  assert.throws(() => assertCanonicalMutationProductMaterializationStageTransitionV1("canonical-committed-terminal-integrity-failure", "canonical-committed-draft-pending"), /illegal stage transition/);
  const first = await operations.materializeCanonicalProductInstruction({ instruction: canonicalInstruction, draftResult });
  assert.equal(repository.replaceCount, 1); assert.equal(first.idempotent, false);
  assert.equal(repository.snapshot.store.productMaterializations?.length, 1);
  assert.equal(repository.snapshot.store.productMaterializationReceipts?.length, 1);
  assert.equal(repository.snapshot.store.whatChangedPublications?.length, 1);
  assert.equal(repository.snapshot.store.changeLinks.length, 0);
  const replay = await operations.materializeCanonicalProductInstruction({ instruction: canonicalInstruction, draftResult });
  assert.equal(replay.idempotent, true); assert.equal(repository.replaceCount, 1);
  assert.equal(replay.receipt.receiptDigest, first.receipt.receiptDigest);
  const collision = { ...canonicalInstruction, instructionDigest: sha("collision") };
  await assert.rejects(() => operations.materializeCanonicalProductInstruction({ instruction: collision, draftResult }), /integrity failed/);
  assert.equal(repository.replaceCount, 1);
  const stagedInstruction = instruction(true);
  const runtimeRepository = new MemoryRuntimeRepository(runtimeWithInstruction(stagedInstruction));
  const stagedWorkflowRepository = new MemoryWorkflowRepository();
  const stagedOperations = new LeadershipConversationProductOperations({ repository: stagedWorkflowRepository, clock: { now: () => stagedInstruction.evaluatedAt }, authorize: async () => false, verifyCanonicalInstructionProvenance: async (candidate) => candidate.instructionDigest === stagedInstruction.instructionDigest, loadBase: async () => { throw new Error("frontend read must not occur"); }, source: { write: async () => { throw new Error("source write must not occur"); }, readForProposal: async () => { throw new Error("source read must not occur"); }, readForEvidenceAdmission: async () => { throw new Error("source read must not occur"); } } });
  const ownerBacked=await createOwnerBackedDraftDependencies(fixtureRoot);
  const draftService = new ProductDecisionDraftService({ runtimeRepository: runtimeRepository as never, ...ownerBacked, authorize: async (value) => grant(value.operation, value.evaluatedAt), authorizeMaterialization: async ({ operation }) => grant(operation, stagedInstruction.evaluatedAt) });
  const coordinator = new CanonicalLeadershipConversationProductMaterializer({ productDecisionDraftService: draftService, productWorkflowOperations: stagedOperations, storageOperation: () => ({ requestId: "draft-stage", operatorId: "system" }) });
  const completed = await coordinator.materialize({ contractVersion: "1", instruction: stagedInstruction, draftResult: null });
  assert.equal(completed.stage, "canonical-committed-product-materialized");
  assert.equal(runtimeRepository.replaceCount, 1); assert.equal(stagedWorkflowRepository.replaceCount, 1);
  const completedReplay = await coordinator.materialize({ contractVersion: "1", instruction: stagedInstruction, draftResult: null });
  assert.equal(completedReplay.stage, "canonical-replayed-product-materialized");
  assert.equal(runtimeRepository.replaceCount, 1); assert.equal(stagedWorkflowRepository.replaceCount, 1);
  console.log("Canonical mutation Product materialization atomicity validation PASS (19 checks)");
  }finally{await rm(fixtureRoot,{recursive:true,force:true});}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){if(!process.argv.includes("--react-server-child")){const child=spawnSync(process.execPath,["--conditions=react-server",...process.execArgv,process.argv[1]!,"--react-server-child"],{cwd:process.cwd(),encoding:"utf8",env:{...process.env,NODE_ENV:"test"}});if(child.stdout)process.stdout.write(child.stdout);if(child.stderr)process.stderr.write(child.stderr);if(child.status!==0)process.exitCode=child.status??1;}else void runAtomicityValidation();}
