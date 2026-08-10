import type { ProductExpectedOutcome, ProductMeasure } from "../workflow/contracts";
import type { CanonicalProductDecisionDraftMaterializationReceiptV1, CanonicalProductDecisionDraftMutationV1 } from "../workflow/leadershipConversation/canonicalProductMaterializationContracts";
import type { ProductArtifactBodyRefV1 } from "../persistence/productArtifactBodyContracts";
import type { ProductArtifactInspectionMetadataV1 } from "../workflow/productArtifactInspectionMetadataContracts";

export const PRODUCT_DECISION_DRAFT_CONTRACT_VERSION = "1" as const;
export const PRODUCT_DECISION_DRAFT_EVENT_KIND = "product-decision-draft-revision-recorded" as const;

export type ProductDecisionDraftOperation =
  | "product-decision-draft:create"
  | "product-decision-draft:revise"
  | "product-decision-draft:read";

export type ProductDecisionDraftContentV1 = {
  title: string;
  intervention: string;
  rationale: string;
  assumptions: string[];
  risks: string[];
  expectedOutcomes: ProductExpectedOutcome[];
  measures: ProductMeasure[];
  intendedDecisionMakerRef: string | null;
  intendedDecisionMakerLabel: string | null;
  proposedReviewDate: string | null;
};

export type ProductDecisionDraftAuthorityGrantV1 = {
  contractVersion: typeof PRODUCT_DECISION_DRAFT_CONTRACT_VERSION;
  operation: ProductDecisionDraftOperation;
  organizationId: string;
  questionId: string;
  scope: { type: "product-question"; id: string };
  purpose: "create-product-decision-draft" | "revise-product-decision-draft" | "read-product-decision-draft";
  sensitivity: "standard";
  actorRef: string;
  authorityRef: string;
  policyRef: string;
  authorized: boolean;
  status: "active" | "revoked";
  validFrom: string;
  validUntil?: string;
  revokedAt?: string;
  authorizedAt: string;
};

export type ProductDecisionDraftRevisionV1 = ProductDecisionDraftContentV1 & {
  contractVersion: typeof PRODUCT_DECISION_DRAFT_CONTRACT_VERSION;
  organizationId: string;
  questionId: string;
  sourceAnswerId: string;
  draftId: string;
  revisionId: string;
  revision: number;
  predecessorRevisionId: string | null;
  originatingProposalRef: string | null;
  recordedAt: string;
  recordedByActorRef: string;
  authorityRef: string;
  policyRef: string;
  requestFingerprint: string;
  contentDigest: string;
  idempotencyKeyDigest: string;
  canonicalMaterializationInstructionDigest?: string;
  canonicalDraftEnvelopeDigest?: string;
  draftMutationDigest?: string;
  bodyStoredExternally?: true;
  protectedBody?: ProductArtifactBodyRefV1;
  bodyStageReceiptDigest?: string;
  inspectionMetadata?: ProductArtifactInspectionMetadataV1;
};

export type ProductDecisionDraftOperationReceiptV1 = {
  contractVersion: typeof PRODUCT_DECISION_DRAFT_CONTRACT_VERSION;
  receiptId: string;
  operationId: string;
  organizationId: string;
  questionId: string;
  sourceAnswerId: string;
  draftId: string;
  revisionId: string;
  revision: number;
  predecessorRevisionId: string | null;
  disposition: "created" | "revised";
  recordedAt: string;
  actorRef: string;
  authorityRef: string;
  policyRef: string;
  requestFingerprint: string;
  contentDigest: string;
  idempotencyKeyDigest: string;
  receiptDigest: string;
  resultDigest: string;
  canonicalMaterializationInstructionDigest?: string;
  canonicalDraftEnvelopeDigest?: string;
  draftMutationDigest?: string;
};

export type ProductDecisionDraftRevisionEventV1 = {
  kind: typeof PRODUCT_DECISION_DRAFT_EVENT_KIND;
  schemaVersion: typeof PRODUCT_DECISION_DRAFT_CONTRACT_VERSION;
  eventId: string;
  organizationId: string;
  questionId: string;
  draftId: string;
  revision: ProductDecisionDraftRevisionV1;
  receipt: ProductDecisionDraftOperationReceiptV1;
  occurredAt: string;
  materializationReceipt?: CanonicalProductDecisionDraftMaterializationReceiptV1;
  draftMutation?: CanonicalProductDecisionDraftMutationV1;
};

export type ProductDecisionDraftMaterializationBindingV1 = {
  contractVersion: "1";
  canonicalOperationId: string;
  instructionDigest: string;
  draftEnvelopeDigest: string;
  materialReferenceDigest: string;
  expectedRuntimeRevision: string;
  lineagePolicyVersion: string;
};

export type RecordProductDecisionDraftRequestV1 = {
  contractVersion: typeof PRODUCT_DECISION_DRAFT_CONTRACT_VERSION;
  organizationId: string;
  questionId: string;
  sourceAnswerId: string;
  draftId: string | null;
  expectedQuestionRevision: number;
  expectedCurrentRevision: number | null;
  predecessorRevisionId: string | null;
  originatingProposalRef: string | null;
  content: ProductDecisionDraftContentV1;
  recordedAt: string;
  idempotencyKey: string;
  materializationBinding?: ProductDecisionDraftMaterializationBindingV1;
};

export type CreateProductDecisionDraftRequestV1 = RecordProductDecisionDraftRequestV1 & {
  draftId: null;
  expectedCurrentRevision: null;
  predecessorRevisionId: null;
};

export type ReviseProductDecisionDraftRequestV1 = RecordProductDecisionDraftRequestV1 & {
  draftId: string;
  expectedCurrentRevision: number;
  predecessorRevisionId: string;
};

export type ReadProductDecisionDraftRequestV1 = {
  contractVersion: typeof PRODUCT_DECISION_DRAFT_CONTRACT_VERSION;
  organizationId: string;
  questionId: string;
  evaluatedAt: string;
};

export type ProductDecisionDraftRecordResultV1 = {
  revision: ProductDecisionDraftRevisionV1;
  receipt: ProductDecisionDraftOperationReceiptV1;
  idempotent: boolean;
  materializationReceipt?: CanonicalProductDecisionDraftMaterializationReceiptV1;
};

export type ProductDecisionDraftRevisionProjectionV1 = {
  lifecycle: "active" | "superseded";
  revision: ProductDecisionDraftRevisionV1;
};

export type ProductDecisionDraftReadResultV1 =
  | { status: "available"; current: ProductDecisionDraftRevisionProjectionV1; history: ProductDecisionDraftRevisionProjectionV1[] }
  | { status: "unavailable"; current: null; history: [] }
  | { status: "withheld"; current: null; history: [] };
