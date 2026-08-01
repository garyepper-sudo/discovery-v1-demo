import type { MaterialInformationAcquisitionResult } from "../acquisition";
import type { ProductConfidenceImprovementActionType, ProductConfidenceImprovementOutcomeObservation, ProductConfidenceImprovementReceipt, ProductLocalInformationOperationResult } from "../improvements";
import type { ProductObjectiveContextResolution } from "../objectives";
import type { ProductQuestionWorkspace } from "./contracts";

export const PRODUCT_QUESTION_WORKSPACE_FRONTEND_VERSION = "2" as const;

export type ProductWorkflowStageId = "question" | "understanding" | "answer-or-unknown" | "objective-and-context" | "recommendation" | "human-decision" | "operation" | "outcome" | "learning";
export type ProductWorkflowStageStatus = "not-started" | "available" | "active" | "complete" | "blocked" | "unavailable";
export type ProductWorkflowActionId = "revise-question" | "add-authorized-evidence" | "create-objective" | "revise-objective" | "create-optimization-context" | "revise-optimization-context" | "reaffirm-optimization-context" | "authorize-improvement" | "decline-improvement" | "defer-improvement" | "execute-existing-local-read-only-operation" | "record-outcome-reference" | "view-lineage" | "return-to-question";
export type ProductWorkflowBlockedReason = "missing-evidence" | "missing-objective" | "missing-optimization-context" | "stale-optimization-context" | "material-comparison-unavailable" | "governance-prohibited" | "authorization-required" | "human-decision-required" | "no-authorized-human-choice" | "execution-not-authorized" | "operation-owner-unimplemented" | "operation-type-not-implemented" | "stale-receipt" | "source-access-unavailable" | "operation-already-completed" | "outcome-pending" | "outcome-unmeasured" | "evidence-not-admitted" | "no-canonical-change";

export type ProductWorkflowStage = {
  id: ProductWorkflowStageId;
  status: ProductWorkflowStageStatus;
  sourceRefs: string[];
  summary: string;
  available: boolean;
  complete: boolean;
  blocked: boolean;
  blockedReason: ProductWorkflowBlockedReason | null;
  containsUnavailable: boolean;
  containsWithheld: boolean;
  requiredHumanAction: ProductWorkflowActionId | null;
  nextAction: ProductWorkflowActionId | null;
  auditRefs: string[];
};

export type ProductWorkflowAction = {
  id: ProductWorkflowActionId;
  owner: string;
  enabled: boolean;
  requiredAuthority: string;
  requestContract: string;
  idempotency: "required" | "read-only";
  blockedReason: ProductWorkflowBlockedReason | null;
  writesRuntime: boolean;
  executesOperation: boolean;
  mayAccessExternalSystem: boolean;
  confirmationRequired: boolean;
  expectedResultClass?: string | null;
};

export type ProductWorkflowOperationEligibility = {
  operationType: ProductConfidenceImprovementActionType;
  status: "eligible" | "blocked";
  blockedReason: ProductWorkflowBlockedReason | null;
};

export type ProductWorkflowOrientation = {
  currentStage: ProductWorkflowStageId;
  currentStatus: ProductWorkflowStageStatus;
  currentUserTask: string;
  nextPermittedAction: ProductWorkflowActionId | null;
  primaryBlockedReason: ProductWorkflowBlockedReason | null;
  secondaryBlockedReasons: ProductWorkflowBlockedReason[];
  authorityRequired: string | null;
  sourceRefs: string[];
};

export type ProductWorkflowCommunication = {
  headline: string;
  summary: string;
  rationale: string | null;
  alternatives: string[];
  uncertainty: string[];
  requestedDecision: string | null;
  whatWouldChange: string | null;
  auditRefs: string[];
  deterministicPresentation: string | null;
};

export type ProductQuestionWorkspaceV2 = {
  contractVersion: typeof PRODUCT_QUESTION_WORKSPACE_FRONTEND_VERSION;
  organizationId: string;
  questionId: string;
  base: ProductQuestionWorkspace;
  orientation: ProductWorkflowOrientation;
  stages: ProductWorkflowStage[];
  actions: ProductWorkflowAction[];
  objectiveContext: ProductObjectiveContextResolution | null;
  recommendation: MaterialInformationAcquisitionResult | null;
  humanDecision: ProductConfidenceImprovementReceipt | null;
  outcome: ProductConfidenceImprovementOutcomeObservation | null;
  operationResult?: ProductLocalInformationOperationResult | null;
  communication: ProductWorkflowCommunication;
  unavailableFields: string[];
  withheldFields: string[];
  auditRefs: string[];
};

export type ProductQuestionWorkspaceV2ProjectionInput = {
  workspace: ProductQuestionWorkspace;
  objectiveContext?: ProductObjectiveContextResolution | null;
  recommendation?: MaterialInformationAcquisitionResult | null;
  humanDecision?: ProductConfidenceImprovementReceipt | null;
  outcome?: ProductConfidenceImprovementOutcomeObservation | null;
  operationResult?: ProductLocalInformationOperationResult | null;
  operationEligibility?: ProductWorkflowOperationEligibility | null;
  operationOwnerAvailable?: boolean;
  unavailableFields?: string[];
  withheldFields?: string[];
};
