import { leadershipDigest, leadershipStableSerialize } from "./determinism";
import type { ProductArtifactBodyRefV1 } from "../../persistence/productArtifactBodyContracts";

export const CANONICAL_PRODUCT_MATERIALIZATION_CONTRACT_VERSION = "1" as const;

type ContractV1 = { contractVersion: "1" };

export type CanonicalMutationProductMaterializationStageV1 =
  | "pre-commit-rejected"
  | "canonical-conflict"
  | "canonical-committed-draft-pending"
  | "canonical-committed-draft-materialized-product-workflow-pending"
  | "canonical-committed-product-materialized"
  | "canonical-replayed-product-materialized"
  | "canonical-committed-terminal-integrity-failure";

export type CanonicalProductDecisionDraftMaterializationStatusV1 =
  | "not-applicable"
  | "pending"
  | "materialized"
  | "integrity-failure";

export type CanonicalProductDecisionDraftMaterializationRequestV1 = ContractV1 &
  (
    | {
        required: false;
        draftId: null;
        draftEnvelopeDigest: null;
        requestFingerprint: null;
        idempotencyKeyDigest: null;
        payload: null;
      }
    | {
        required: true;
        draftId: string;
        draftEnvelopeDigest: string;
        requestFingerprint: string;
        idempotencyKeyDigest: string;
        payload: CanonicalProductDecisionDraftMaterializationPayloadV1;
      }
  );

export type CanonicalProductDecisionDraftMaterializationPayloadV1 = {
  sourceAnswerId: string;
  expectedQuestionRevision: number;
  expectedCurrentRevision: number | null;
  predecessorRevisionId: string | null;
  originatingProposalRef: string;
  title: string;
  intervention: string;
  rationale: string;
  assumptions: string[];
  risks: string[];
  expectedOutcomes: Array<{ id: string; description: string; timeHorizon: string | null }>;
  measures: Array<{ id: string; name: string; baseline: number | null; target: number | null; unit: string | null }>;
  intendedDecisionMakerRef: string | null;
  intendedDecisionMakerLabel: string | null;
  proposedReviewDate: string | null;
};

export type CanonicalProductMaterializationCandidatePreflightV1 = ContractV1 & {
  organizationId: string;
  questionId: string;
  expectedRuntimeRevision: string;
  evaluatedAt: string;
  authorityRevisionRefs: string[];
  policyRevisionRefs: string[];
  governedProductInputDigest: string;
  materialEnvelopeDigest: string;
  disposition: "approved" | "rejected";
  preflightDigest: string;
};

export type CanonicalProductMaterializationInstructionV1 = ContractV1 & {
  instructionId: string;
  organizationId: string;
  questionId: string;
  conversationId: string;
  proposalId: string;
  canonicalOperationId: string;
  requestFingerprint: string;
  idempotencyKeyDigest: string;
  actorRef: string;
  evaluatedAt: string;
  authorityRevisionRefs: string[];
  policyRevisionRefs: string[];
  expectedRuntimeRevision: string;
  committedRuntimeStateDigest: string;
  canonicalUnderstandingBeforeRef: string;
  canonicalUnderstandingAfterRef: string;
  canonicalChangeResultId: string;
  canonicalChangeResultDigest: string;
  governedProductInputDigest: string;
  lineagePolicyVersion: string;
  materialReferences: string[];
  materialEnvelopeDigest: string;
  whatChangedIntent: "materialize";
  whatChangedArtifactId: string;
  whatChangedEnvelope: CanonicalProductWhatChangedEnvelopeV1;
  whatChangedEnvelopeDigest: string;
  draftMaterialization: CanonicalProductDecisionDraftMaterializationRequestV1;
  targetProductWorkflowId: string;
  instructionDigest: string;
};

export type CanonicalProductWhatChangedEnvelopeV1 = {
  integrationReceiptId: string;
  artifactRevision: string;
  productWorkflowId: string;
  creationEnvelopeDigest: string;
  materialReferencesDigest: string;
  protectedBody: ProductArtifactBodyRefV1;
  ownerStageReceiptDigest: string;
  headerDigest: string;
};

export type CanonicalProductDecisionDraftMaterializationReceiptV1 = ContractV1 & {
  receiptId: string;
  canonicalOperationId: string;
  instructionDigest: string;
  draftId: string;
  draftRevisionId: string;
  draftEnvelopeDigest: string;
  draftOperationReceiptDigest: string;
  draftEventId: string;
  runtimeRevisionBefore: string;
  draftMutationDigest: string;
  receiptDigest: string;
};

export type CanonicalProductDecisionDraftMutationV1 = ContractV1 & {
  organizationId: string;
  canonicalOperationId: string;
  instructionDigest: string;
  draftId: string;
  draftRevisionId: string;
  predecessorDraftRevisionId: string | null;
  operation: "create" | "revise";
  draftEnvelopeDigest: string;
  materialReferenceDigest: string;
  actorRef: string;
  evaluatedAt: string;
  authorityRevisionRef: string;
  policyRevisionRef: string;
  expectedRuntimeRevision: string;
  requestFingerprint: string;
  idempotencyKeyDigest: string;
  draftOperationReceiptId: string;
  draftOperationReceiptCandidateDigest: string;
  draftEventId: string;
  draftEventPayloadDigest: string;
  disposition: "created" | "revised";
  lineagePolicyVersion: string;
  draftMutationDigest: string;
};

export type CanonicalProductDecisionDraftMaterializationResultV1 = ContractV1 & {
  status: CanonicalProductDecisionDraftMaterializationStatusV1;
  canonicalOperationId: string;
  instructionDigest: string;
  receipt: CanonicalProductDecisionDraftMaterializationReceiptV1 | null;
  resultDigest: string;
};

export type CanonicalProductMaterializationReceiptV1 = ContractV1 & {
  receiptId: string;
  canonicalOperationId: string;
  instructionDigest: string;
  stage: CanonicalMutationProductMaterializationStageV1;
  productWorkflowRevisionBefore: string;
  productWorkflowRevisionAfter: string;
  whatChangedArtifactId: string;
  canonicalDraftReference: {
    draftId: string;
    draftRevisionId: string;
    draftStageReceiptDigest: string;
    draftMutationDigest: string;
    draftEnvelopeDigest: string;
    canonicalOperationId: string;
    instructionDigest: string;
  } | null;
  eventIds: string[];
  receiptDigest: string;
};

export type LeadershipConversationProductMaterializationRecordV1 = ContractV1 & {
  materializationRecordId: string;
  organizationId: string;
  questionId: string;
  conversationId: string;
  canonicalOperationId: string;
  instructionDigest: string;
  requestFingerprint: string;
  whatChangedArtifactId: string;
  canonicalDraftReference: CanonicalProductMaterializationReceiptV1["canonicalDraftReference"];
  receiptDigest: string;
  recordDigest: string;
};

export type CanonicalProductMaterializationRecoveryResultV1 = ContractV1 & {
  canonicalOperationId: string;
  instructionDigest: string;
  stage: CanonicalMutationProductMaterializationStageV1;
  draftResult: CanonicalProductDecisionDraftMaterializationResultV1;
  productReceipt: CanonicalProductMaterializationReceiptV1 | null;
  retryable: boolean;
  resultDigest: string;
};

export type LeadershipConversationCanonicalRoutingResultV1 = ContractV1 & {
  stage: CanonicalMutationProductMaterializationStageV1;
  canonicalOperationId: string | null;
  instructionDigest: string | null;
  draftStageReceiptDigest: string | null;
  productMaterializationReceiptDigest: string | null;
  retryable: boolean;
  resultDigest: string;
};

const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9:._/-]*$/;
const DIGEST = /^[a-f0-9]{64}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const STAGES: readonly CanonicalMutationProductMaterializationStageV1[] = [
  "pre-commit-rejected", "canonical-conflict", "canonical-committed-draft-pending",
  "canonical-committed-draft-materialized-product-workflow-pending",
  "canonical-committed-product-materialized", "canonical-replayed-product-materialized",
  "canonical-committed-terminal-integrity-failure",
];
const DRAFT_STATUSES: readonly CanonicalProductDecisionDraftMaterializationStatusV1[] = [
  "not-applicable", "pending", "materialized", "integrity-failure",
];

function fail(message: string): never {
  throw new Error(`Canonical Product materialization integrity failed: ${message}`);
}

function assertClosedKeys(value: object, allowed: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const expected = [...allowed].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    fail(`${label} contains missing or unknown fields`);
  }
}

function assertIdentifier(value: string, label: string): void {
  if (!IDENTIFIER.test(value)) fail(`${label} is malformed`);
}

function assertDigestValue(value: string, label: string): void {
  if (!DIGEST.test(value)) fail(`${label} is malformed`);
}

function assertUniqueIdentifiers(values: readonly string[], label: string): void {
  if (values.length === 0) fail(`${label} is empty`);
  values.forEach((value) => assertIdentifier(value, label));
  if (new Set(values).size !== values.length) fail(`${label} contains duplicates`);
}

function assertStage(value: CanonicalMutationProductMaterializationStageV1): void {
  if (!STAGES.includes(value)) fail("materialization stage is invalid");
}

function requireV1(value: ContractV1): void {
  if (value.contractVersion !== CANONICAL_PRODUCT_MATERIALIZATION_CONTRACT_VERSION) {
    fail("unsupported contract version");
  }
}

function digestSemanticValue(value: unknown): string {
  return leadershipDigest(leadershipStableSerialize(value));
}

function sorted(values: readonly string[]): string[] {
  return [...values].sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
}

function withoutKey<T extends object, K extends keyof T>(value: T, key: K): Omit<T, K> {
  const copy = { ...value };
  delete copy[key];
  return copy;
}

function assertDeterministicDigest<T extends ContractV1, K extends keyof T>(
  value: T,
  key: K,
  label: string,
): void {
  requireV1(value);
  const supplied = value[key];
  if (typeof supplied !== "string") fail(`${label} is missing`);
  assertDigestValue(supplied, label);
  if (supplied !== digestSemanticValue(withoutKey(value, key))) fail(`${label} does not match`);
}

export function createCanonicalProductMaterializationInstructionDigestV1(
  value: Omit<CanonicalProductMaterializationInstructionV1, "instructionDigest">,
): string {
  requireV1(value);
  return digestSemanticValue({
    ...value,
    authorityRevisionRefs: sorted(value.authorityRevisionRefs),
    policyRevisionRefs: sorted(value.policyRevisionRefs),
    materialReferences: sorted(value.materialReferences),
    whatChangedEnvelope: value.whatChangedEnvelope,
  });
}

export function createCanonicalProductMaterializationCandidatePreflightDigestV1(
  value: Omit<CanonicalProductMaterializationCandidatePreflightV1, "preflightDigest">,
): string {
  requireV1(value);
  return digestSemanticValue({
    ...value,
    authorityRevisionRefs: sorted(value.authorityRevisionRefs),
    policyRevisionRefs: sorted(value.policyRevisionRefs),
  });
}

export function createCanonicalProductMaterializationReceiptDigestV1(
  value: Omit<CanonicalProductMaterializationReceiptV1, "receiptDigest">,
): string {
  requireV1(value);
  return digestSemanticValue({ ...value, eventIds: sorted(value.eventIds) });
}

export function createCanonicalProductMaterializationRecoveryResultDigestV1(
  value: Omit<CanonicalProductMaterializationRecoveryResultV1, "resultDigest">,
): string {
  requireV1(value);
  return digestSemanticValue(value);
}

export function createLeadershipConversationCanonicalRoutingResultDigestV1(
  value: Omit<LeadershipConversationCanonicalRoutingResultV1, "resultDigest">,
): string {
  requireV1(value);
  return digestSemanticValue(value);
}

export function createLeadershipConversationProductMaterializationRecordDigestV1(
  value: Omit<LeadershipConversationProductMaterializationRecordV1, "recordDigest">,
): string {
  requireV1(value);
  return digestSemanticValue(value);
}

export function createCanonicalProductDecisionDraftMaterializationReceiptDigestV1(
  value: Omit<CanonicalProductDecisionDraftMaterializationReceiptV1, "receiptDigest">,
): string {
  requireV1(value);
  return digestSemanticValue(value);
}

export function createCanonicalProductDecisionDraftMutationDigestV1(
  value: Omit<CanonicalProductDecisionDraftMutationV1, "draftMutationDigest">,
): string {
  requireV1(value);
  return digestSemanticValue(value);
}

export function createCanonicalProductDecisionDraftMaterializationResultDigestV1(
  value: Omit<CanonicalProductDecisionDraftMaterializationResultV1, "resultDigest">,
): string {
  requireV1(value);
  return digestSemanticValue(value);
}

export function assertCanonicalProductMaterializationInstructionIntegrityV1(
  value: CanonicalProductMaterializationInstructionV1,
): void {
  assertClosedKeys(value, [
    "contractVersion", "instructionId", "organizationId", "questionId", "conversationId",
    "proposalId", "canonicalOperationId", "requestFingerprint", "idempotencyKeyDigest",
    "actorRef", "evaluatedAt", "authorityRevisionRefs", "policyRevisionRefs",
    "expectedRuntimeRevision", "committedRuntimeStateDigest", "canonicalUnderstandingBeforeRef",
    "canonicalUnderstandingAfterRef", "canonicalChangeResultId", "canonicalChangeResultDigest",
    "governedProductInputDigest", "lineagePolicyVersion", "materialReferences",
    "materialEnvelopeDigest", "whatChangedIntent", "whatChangedArtifactId",
    "whatChangedEnvelope", "whatChangedEnvelopeDigest", "draftMaterialization", "targetProductWorkflowId",
    "instructionDigest",
  ], "instruction");
  requireV1(value);
  [
    [value.instructionId, "instructionId"], [value.organizationId, "organizationId"],
    [value.questionId, "questionId"], [value.conversationId, "conversationId"],
    [value.proposalId, "proposalId"], [value.canonicalOperationId, "canonicalOperationId"],
    [value.actorRef, "actorRef"], [value.expectedRuntimeRevision, "expectedRuntimeRevision"],
    [value.canonicalUnderstandingBeforeRef, "canonicalUnderstandingBeforeRef"],
    [value.canonicalUnderstandingAfterRef, "canonicalUnderstandingAfterRef"],
    [value.canonicalChangeResultId, "canonicalChangeResultId"],
    [value.lineagePolicyVersion, "lineagePolicyVersion"],
    [value.whatChangedArtifactId, "whatChangedArtifactId"],
    [value.targetProductWorkflowId, "targetProductWorkflowId"],
  ].forEach(([field, label]) => assertIdentifier(field, label));
  if (!ISO_DATE.test(value.evaluatedAt)) fail("evaluatedAt is malformed");
  assertUniqueIdentifiers(value.authorityRevisionRefs, "authorityRevisionRefs");
  assertUniqueIdentifiers(value.policyRevisionRefs, "policyRevisionRefs");
  assertUniqueIdentifiers(value.materialReferences, "materialReferences");
  [value.requestFingerprint, value.idempotencyKeyDigest, value.committedRuntimeStateDigest, value.canonicalChangeResultDigest,
    value.governedProductInputDigest, value.materialEnvelopeDigest, value.whatChangedEnvelopeDigest]
    .forEach((field) => assertDigestValue(field, "instruction digest field"));
  if (value.whatChangedIntent !== "materialize") fail("What Changed intent is invalid");
  assertClosedKeys(value.whatChangedEnvelope, ["integrationReceiptId", "artifactRevision", "productWorkflowId", "creationEnvelopeDigest", "materialReferencesDigest", "protectedBody", "ownerStageReceiptDigest", "headerDigest"], "What Changed envelope");
  assertIdentifier(value.whatChangedEnvelope.integrationReceiptId, "What Changed integrationReceiptId");
  [value.whatChangedEnvelope.artifactRevision,value.whatChangedEnvelope.productWorkflowId].forEach(field=>assertIdentifier(field,"What Changed header identifier"));[value.whatChangedEnvelope.creationEnvelopeDigest,value.whatChangedEnvelope.materialReferencesDigest,value.whatChangedEnvelope.ownerStageReceiptDigest,value.whatChangedEnvelope.headerDigest].forEach(field=>assertDigestValue(field,"What Changed header digest"));const body=value.whatChangedEnvelope.protectedBody;if(body.organizationId!==value.organizationId||body.semanticOwner!=="leadership-conversation"||body.artifactType!=="what-changed"||body.artifactId!==value.whatChangedArtifactId||body.artifactRevision!==value.whatChangedEnvelope.artifactRevision)fail("What Changed body reference is invalid");const{headerDigest,...header}=value.whatChangedEnvelope;if(digestSemanticValue(header)!==headerDigest)fail("What Changed header digest does not match");
  if (digestSemanticValue(value.whatChangedEnvelope) !== value.whatChangedEnvelopeDigest) fail("What Changed envelope digest does not match");
  assertDraftRequest(value.draftMaterialization);
  if (value.instructionDigest !== createCanonicalProductMaterializationInstructionDigestV1(withoutKey(value, "instructionDigest"))) fail("instructionDigest does not match");
}

function assertDraftRequest(value: CanonicalProductDecisionDraftMaterializationRequestV1): void {
  requireV1(value);
  if (!value.required) {
    assertClosedKeys(value, ["contractVersion", "required", "draftId", "draftEnvelopeDigest", "requestFingerprint", "idempotencyKeyDigest", "payload"], "Draft request");
    if ([value.draftId, value.draftEnvelopeDigest, value.requestFingerprint, value.idempotencyKeyDigest, value.payload].some((field) => field !== null)) fail("non-required Draft request carries an envelope");
    return;
  }
  assertClosedKeys(value, ["contractVersion", "required", "draftId", "draftEnvelopeDigest", "requestFingerprint", "idempotencyKeyDigest", "payload"], "Draft request");
  assertIdentifier(value.draftId, "draftId");
  [value.draftEnvelopeDigest, value.requestFingerprint, value.idempotencyKeyDigest]
    .forEach((field) => assertDigestValue(field, "Draft request digest"));
  const payload = value.payload;
  assertClosedKeys(payload, ["sourceAnswerId", "expectedQuestionRevision", "expectedCurrentRevision", "predecessorRevisionId", "originatingProposalRef", "title", "intervention", "rationale", "assumptions", "risks", "expectedOutcomes", "measures", "intendedDecisionMakerRef", "intendedDecisionMakerLabel", "proposedReviewDate"], "Draft payload");
  assertIdentifier(payload.sourceAnswerId, "Draft sourceAnswerId");
  assertIdentifier(payload.originatingProposalRef, "Draft originatingProposalRef");
  if (!Number.isInteger(payload.expectedQuestionRevision) || payload.expectedQuestionRevision < 1) fail("Draft expectedQuestionRevision is invalid");
  if (payload.expectedCurrentRevision !== null && (!Number.isInteger(payload.expectedCurrentRevision) || payload.expectedCurrentRevision < 1)) fail("Draft expectedCurrentRevision is invalid");
  if ((payload.expectedCurrentRevision === null) !== (payload.predecessorRevisionId === null)) fail("Draft predecessor state conflicts");
  if (payload.predecessorRevisionId !== null) assertIdentifier(payload.predecessorRevisionId, "Draft predecessorRevisionId");
  if (![payload.title, payload.intervention, payload.rationale].every((field) => typeof field === "string" && field.length > 0)) fail("Draft text is invalid");
  if (![payload.assumptions, payload.risks, payload.expectedOutcomes, payload.measures].every(Array.isArray)) fail("Draft collections are invalid");
  if (digestSemanticValue(payload) !== value.draftEnvelopeDigest) fail("Draft payload does not match its envelope digest");
}

export function assertCanonicalProductMaterializationCandidatePreflightIntegrityV1(
  value: CanonicalProductMaterializationCandidatePreflightV1,
): void {
  assertClosedKeys(value, ["contractVersion", "organizationId", "questionId", "expectedRuntimeRevision", "evaluatedAt", "authorityRevisionRefs", "policyRevisionRefs", "governedProductInputDigest", "materialEnvelopeDigest", "disposition", "preflightDigest"], "candidate preflight");
  [value.organizationId, value.questionId, value.expectedRuntimeRevision].forEach((field) => assertIdentifier(field, "preflight identifier"));
  if (!ISO_DATE.test(value.evaluatedAt)) fail("preflight evaluatedAt is malformed");
  assertUniqueIdentifiers(value.authorityRevisionRefs, "preflight authorityRevisionRefs");
  assertUniqueIdentifiers(value.policyRevisionRefs, "preflight policyRevisionRefs");
  assertDigestValue(value.governedProductInputDigest, "governedProductInputDigest");
  assertDigestValue(value.materialEnvelopeDigest, "materialEnvelopeDigest");
  if (!["approved", "rejected"].includes(value.disposition)) fail("preflight disposition is invalid");
  if (value.preflightDigest !== createCanonicalProductMaterializationCandidatePreflightDigestV1(withoutKey(value, "preflightDigest"))) fail("preflightDigest does not match");
}

export function assertCanonicalProductDecisionDraftMaterializationReceiptIntegrityV1(
  value: CanonicalProductDecisionDraftMaterializationReceiptV1,
): void {
  assertClosedKeys(value, ["contractVersion", "receiptId", "canonicalOperationId", "instructionDigest", "draftId", "draftRevisionId", "draftEnvelopeDigest", "draftOperationReceiptDigest", "draftEventId", "runtimeRevisionBefore", "draftMutationDigest", "receiptDigest"], "Draft receipt");
  [value.receiptId, value.canonicalOperationId, value.draftId, value.draftRevisionId, value.draftEventId, value.runtimeRevisionBefore].forEach((field) => assertIdentifier(field, "Draft receipt identifier"));
  [value.instructionDigest, value.draftEnvelopeDigest, value.draftOperationReceiptDigest, value.draftMutationDigest].forEach((field) => assertDigestValue(field, "Draft receipt digest"));
  if (value.receiptDigest !== createCanonicalProductDecisionDraftMaterializationReceiptDigestV1(withoutKey(value, "receiptDigest"))) fail("Draft receiptDigest does not match");
}

export function assertCanonicalProductDecisionDraftMutationIntegrityV1(
  value: CanonicalProductDecisionDraftMutationV1,
): void {
  assertClosedKeys(value, ["contractVersion", "organizationId", "canonicalOperationId", "instructionDigest", "draftId", "draftRevisionId", "predecessorDraftRevisionId", "operation", "draftEnvelopeDigest", "materialReferenceDigest", "actorRef", "evaluatedAt", "authorityRevisionRef", "policyRevisionRef", "expectedRuntimeRevision", "requestFingerprint", "idempotencyKeyDigest", "draftOperationReceiptId", "draftOperationReceiptCandidateDigest", "draftEventId", "draftEventPayloadDigest", "disposition", "lineagePolicyVersion", "draftMutationDigest"], "Draft mutation");
  requireV1(value);
  [value.organizationId, value.canonicalOperationId, value.draftId, value.draftRevisionId, value.actorRef, value.authorityRevisionRef, value.policyRevisionRef, value.expectedRuntimeRevision, value.draftOperationReceiptId, value.draftEventId, value.lineagePolicyVersion].forEach((field) => assertIdentifier(field, "Draft mutation identifier"));
  if (value.predecessorDraftRevisionId !== null) assertIdentifier(value.predecessorDraftRevisionId, "Draft predecessor revision");
  [value.instructionDigest, value.draftEnvelopeDigest, value.materialReferenceDigest, value.requestFingerprint, value.idempotencyKeyDigest, value.draftOperationReceiptCandidateDigest, value.draftEventPayloadDigest].forEach((field) => assertDigestValue(field, "Draft mutation digest field"));
  if (!ISO_DATE.test(value.evaluatedAt)) fail("Draft mutation evaluatedAt is malformed");
  if (!["create", "revise"].includes(value.operation) || !["created", "revised"].includes(value.disposition)) fail("Draft mutation disposition is invalid");
  if ((value.operation === "create") !== (value.disposition === "created")) fail("Draft mutation operation and disposition conflict");
  if (value.operation === "create" && value.predecessorDraftRevisionId !== null) fail("Draft create mutation has a predecessor");
  if (value.operation === "revise" && value.predecessorDraftRevisionId === null) fail("Draft revise mutation lacks a predecessor");
  if (value.draftMutationDigest !== createCanonicalProductDecisionDraftMutationDigestV1(withoutKey(value, "draftMutationDigest"))) fail("draftMutationDigest does not match");
}

export function assertCanonicalProductMaterializationReceiptIntegrityV1(
  value: CanonicalProductMaterializationReceiptV1,
): void {
  assertClosedKeys(value, ["contractVersion", "receiptId", "canonicalOperationId", "instructionDigest", "stage", "productWorkflowRevisionBefore", "productWorkflowRevisionAfter", "whatChangedArtifactId", "canonicalDraftReference", "eventIds", "receiptDigest"], "Product receipt");
  [value.receiptId, value.canonicalOperationId, value.productWorkflowRevisionBefore, value.productWorkflowRevisionAfter, value.whatChangedArtifactId].forEach((field) => assertIdentifier(field, "Product receipt identifier"));
  assertDigestValue(value.instructionDigest, "Product receipt instructionDigest");
  assertStage(value.stage);
  assertUniqueIdentifiers(value.eventIds, "Product receipt eventIds");
  if (!isCompletedStage(value.stage)) fail("Product receipt is not complete");
  if (value.canonicalDraftReference) assertDraftReference(value.canonicalDraftReference, value);
  if (value.receiptDigest !== createCanonicalProductMaterializationReceiptDigestV1(withoutKey(value, "receiptDigest"))) fail("Product receiptDigest does not match");
}

function assertDraftReference(reference: NonNullable<CanonicalProductMaterializationReceiptV1["canonicalDraftReference"]>, receipt: CanonicalProductMaterializationReceiptV1): void {
  assertClosedKeys(reference, ["draftId", "draftRevisionId", "draftStageReceiptDigest", "draftMutationDigest", "draftEnvelopeDigest", "canonicalOperationId", "instructionDigest"], "Draft reference");
  [reference.draftId, reference.draftRevisionId, reference.canonicalOperationId].forEach((field) => assertIdentifier(field, "Draft reference identifier"));
  [reference.draftStageReceiptDigest, reference.draftMutationDigest, reference.draftEnvelopeDigest, reference.instructionDigest].forEach((field) => assertDigestValue(field, "Draft reference digest"));
  if (reference.canonicalOperationId !== receipt.canonicalOperationId || reference.instructionDigest !== receipt.instructionDigest) fail("Draft reference belongs to another operation");
}

export function assertLeadershipConversationProductMaterializationRecordIntegrityV1(
  value: LeadershipConversationProductMaterializationRecordV1,
): void {
  assertClosedKeys(value, ["contractVersion", "materializationRecordId", "organizationId", "questionId", "conversationId", "canonicalOperationId", "instructionDigest", "requestFingerprint", "whatChangedArtifactId", "canonicalDraftReference", "receiptDigest", "recordDigest"], "materialization record");
  [value.materializationRecordId, value.organizationId, value.questionId, value.conversationId, value.canonicalOperationId, value.whatChangedArtifactId].forEach((field) => assertIdentifier(field, "materialization record identifier"));
  [value.instructionDigest, value.requestFingerprint, value.receiptDigest].forEach((field) => assertDigestValue(field, "materialization record digest field"));
  if (value.canonicalDraftReference) {
    const receipt = { canonicalOperationId: value.canonicalOperationId, instructionDigest: value.instructionDigest } as CanonicalProductMaterializationReceiptV1;
    assertDraftReference(value.canonicalDraftReference, receipt);
  }
  assertDeterministicDigest(value, "recordDigest", "recordDigest");
}

export function assertCanonicalProductMaterializationRecoveryResultIntegrityV1(
  value: CanonicalProductMaterializationRecoveryResultV1,
): void {
  assertClosedKeys(value, ["contractVersion", "canonicalOperationId", "instructionDigest", "stage", "draftResult", "productReceipt", "retryable", "resultDigest"], "recovery result");
  assertIdentifier(value.canonicalOperationId, "recovery canonicalOperationId");
  assertDigestValue(value.instructionDigest, "recovery instructionDigest");
  assertStage(value.stage);
  assertDraftResult(value.draftResult, value.canonicalOperationId, value.instructionDigest);
  if (value.productReceipt) {
    assertCanonicalProductMaterializationReceiptIntegrityV1(value.productReceipt);
    if (value.productReceipt.canonicalOperationId !== value.canonicalOperationId || value.productReceipt.instructionDigest !== value.instructionDigest) fail("recovery receipt belongs to another operation");
  }
  assertStageCompleteness(value.stage, value.draftResult, value.productReceipt, value.retryable);
  assertDeterministicDigest(value, "resultDigest", "recovery resultDigest");
}

export function assertLeadershipConversationCanonicalRoutingResultIntegrityV1(
  value: LeadershipConversationCanonicalRoutingResultV1,
): void {
  assertClosedKeys(value, ["contractVersion", "stage", "canonicalOperationId", "instructionDigest", "draftStageReceiptDigest", "productMaterializationReceiptDigest", "retryable", "resultDigest"], "routing result");
  assertStage(value.stage);
  if (value.canonicalOperationId === null || value.instructionDigest === null) {
    if (!isPreCommitStage(value.stage) || value.draftStageReceiptDigest !== null || value.productMaterializationReceiptDigest !== null) fail("routing result lacks a committed instruction");
  } else {
    assertIdentifier(value.canonicalOperationId, "routing canonicalOperationId");
    assertDigestValue(value.instructionDigest, "routing instructionDigest");
  }
  if (value.draftStageReceiptDigest !== null) assertDigestValue(value.draftStageReceiptDigest, "routing Draft receipt digest");
  if (value.productMaterializationReceiptDigest !== null) assertDigestValue(value.productMaterializationReceiptDigest, "routing Product receipt digest");
  if (isCompletedStage(value.stage) && value.productMaterializationReceiptDigest === null) fail("complete routing result lacks Product receipt");
  if (!isCompletedStage(value.stage) && value.productMaterializationReceiptDigest !== null) fail("pending routing result carries Product completion");
  assertDeterministicDigest(value, "resultDigest", "routing resultDigest");
}

function assertDraftResult(value: CanonicalProductDecisionDraftMaterializationResultV1, operationId: string, instructionDigest: string): void {
  assertClosedKeys(value, ["contractVersion", "status", "canonicalOperationId", "instructionDigest", "receipt", "resultDigest"], "Draft result");
  requireV1(value);
  if (!DRAFT_STATUSES.includes(value.status)) fail("Draft result status is invalid");
  if (value.canonicalOperationId !== operationId || value.instructionDigest !== instructionDigest) fail("Draft result belongs to another operation");
  if (value.receipt) {
    assertCanonicalProductDecisionDraftMaterializationReceiptIntegrityV1(value.receipt);
    if (value.status !== "materialized" || value.receipt.canonicalOperationId !== operationId || value.receipt.instructionDigest !== instructionDigest) fail("Draft receipt is inconsistent");
  } else if (value.status === "materialized") fail("materialized Draft result lacks a receipt");
  if (value.resultDigest !== createCanonicalProductDecisionDraftMaterializationResultDigestV1(withoutKey(value, "resultDigest"))) fail("Draft resultDigest does not match");
}

export function assertCanonicalProductDecisionDraftMaterializationResultIntegrityV1(
  value: CanonicalProductDecisionDraftMaterializationResultV1,
): void {
  assertIdentifier(value.canonicalOperationId, "Draft result canonicalOperationId");
  assertDigestValue(value.instructionDigest, "Draft result instructionDigest");
  assertDraftResult(value, value.canonicalOperationId, value.instructionDigest);
}

function isPreCommitStage(stage: CanonicalMutationProductMaterializationStageV1): boolean {
  return stage === "pre-commit-rejected" || stage === "canonical-conflict";
}

function isCompletedStage(stage: CanonicalMutationProductMaterializationStageV1): boolean {
  return stage === "canonical-committed-product-materialized" || stage === "canonical-replayed-product-materialized";
}

function assertStageCompleteness(stage: CanonicalMutationProductMaterializationStageV1, draft: CanonicalProductDecisionDraftMaterializationResultV1, product: CanonicalProductMaterializationReceiptV1 | null, retryable: boolean): void {
  if (isPreCommitStage(stage)) fail("recovery result cannot describe an uncommitted operation");
  if (stage === "canonical-committed-draft-pending" && !["pending", "integrity-failure"].includes(draft.status)) fail("Draft-pending stage has an invalid Draft result");
  if (stage === "canonical-committed-draft-materialized-product-workflow-pending" && !["materialized", "not-applicable"].includes(draft.status)) fail("Workflow-pending stage lacks its Draft prerequisite");
  if (isCompletedStage(stage) && product === null) fail("complete recovery result lacks Product receipt");
  if (!isCompletedStage(stage) && product !== null) fail("pending recovery result carries Product completion");
  if (stage === "canonical-committed-terminal-integrity-failure" && retryable) fail("terminal integrity failure is retryable");
}

export function assertCanonicalMutationProductMaterializationStageTransitionV1(
  from: CanonicalMutationProductMaterializationStageV1,
  to: CanonicalMutationProductMaterializationStageV1,
): void {
  assertStage(from);
  assertStage(to);
  const allowed: Record<CanonicalMutationProductMaterializationStageV1, readonly CanonicalMutationProductMaterializationStageV1[]> = {
    "pre-commit-rejected": [],
    "canonical-conflict": [],
    "canonical-committed-draft-pending": ["canonical-committed-draft-materialized-product-workflow-pending", "canonical-committed-terminal-integrity-failure"],
    "canonical-committed-draft-materialized-product-workflow-pending": ["canonical-committed-product-materialized", "canonical-committed-terminal-integrity-failure"],
    "canonical-committed-product-materialized": ["canonical-replayed-product-materialized"],
    "canonical-replayed-product-materialized": [],
    "canonical-committed-terminal-integrity-failure": [],
  };
  if (from === to || !allowed[from].includes(to)) fail(`illegal stage transition ${from} -> ${to}`);
}
