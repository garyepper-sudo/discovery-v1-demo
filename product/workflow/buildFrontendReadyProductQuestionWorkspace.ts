import { createHash } from "node:crypto";
import type { ProductQuestionWorkspaceV2, ProductQuestionWorkspaceV2ProjectionInput, ProductWorkflowAction, ProductWorkflowBlockedReason, ProductWorkflowStage, ProductWorkflowStageId } from "./frontendReadinessContracts";
import { PRODUCT_QUESTION_WORKSPACE_FRONTEND_VERSION } from "./frontendReadinessContracts";

const stageOrder: ProductWorkflowStageId[] = ["question", "understanding", "answer-or-unknown", "objective-and-context", "recommendation", "human-decision", "operation", "outcome", "learning"];
const unique = (values: string[]) => [...new Set(values.filter(Boolean))].sort();
const ref = (value: unknown): string[] => value && typeof value === "object" && "selectionId" in value ? [String((value as { selectionId: unknown }).selectionId)] : [];

function stage(input: Omit<ProductWorkflowStage, "available" | "complete" | "blocked" | "containsUnavailable" | "containsWithheld"> & { unavailable?: boolean; withheld?: boolean }): ProductWorkflowStage {
  return { ...input, available: input.status !== "not-started" && input.status !== "unavailable", complete: input.status === "complete", blocked: input.status === "blocked", containsUnavailable: Boolean(input.unavailable), containsWithheld: Boolean(input.withheld) };
}

function action(id: ProductWorkflowAction["id"], enabled: boolean, blockedReason: ProductWorkflowBlockedReason | null): ProductWorkflowAction {
  const mutating = !["view-lineage", "return-to-question"].includes(id);
  const executes = id === "execute-existing-local-read-only-operation";
  return { id, owner: id.includes("objective") || id.includes("optimization") ? "Product Objective/Context lifecycle" : id.includes("improvement") || id === "execute-existing-local-read-only-operation" || id === "record-outcome-reference" ? "Product Confidence Improvement lifecycle" : "ProductQuestion lifecycle", enabled, requiredAuthority: mutating ? "exact organization-scoped product authority" : "authorized workspace read", requestContract: `product-workflow-action:${id}:v1`, idempotency: mutating ? "required" : "read-only", blockedReason, writesRuntime: mutating, executesOperation: executes, mayAccessExternalSystem: false, confirmationRequired: mutating, expectedResultClass: executes ? "existing-admitted-evidence-inspection" : null };
}

export function buildFrontendReadyProductQuestionWorkspace(input: ProductQuestionWorkspaceV2ProjectionInput): ProductQuestionWorkspaceV2 {
  const { workspace } = input;
  const answer = workspace.answer;
  const supported = answer?.kind === "answer";
  const unknown = answer?.kind === "abstention" || !answer;
  const objectiveStatus = input.objectiveContext?.status ?? "missing-objective";
  const objectiveReady = objectiveStatus === "resolved";
  const objectiveReason: ProductWorkflowBlockedReason = objectiveStatus === "stale-context" ? "stale-optimization-context" : objectiveStatus === "missing-context" ? "missing-optimization-context" : "missing-objective";
  const recommendation = input.recommendation ?? null;
  const decision = input.humanDecision ?? null;
  const outcome = input.outcome ?? null;
  const operationResult = input.operationResult ?? null;
  const operationEligibility = input.operationEligibility ?? null;
  const operationOwnerAvailable = input.operationOwnerAvailable ?? false;
  const operationEligible = operationEligibility?.status === "eligible"
    && operationEligibility.operationType === "inspect-existing-evidence"
    && decision?.eventType === "improvement-authorized"
    && operationOwnerAvailable;
  const operationBlockedReason: ProductWorkflowBlockedReason = !operationOwnerAvailable
    ? "operation-owner-unimplemented"
    : operationEligibility?.operationType && operationEligibility.operationType !== "inspect-existing-evidence"
      ? "operation-type-not-implemented"
      : operationEligibility?.blockedReason ?? (decision ? "execution-not-authorized" : "human-decision-required");
  const unavailable = unique(input.unavailableFields ?? []);
  const withheld = unique(input.withheldFields ?? []);
  const stages: ProductWorkflowStage[] = [
    stage({ id: "question", status: "complete", sourceRefs: [workspace.question.id, `question-revision:${workspace.question.revision}`], summary: workspace.question.title, blockedReason: null, requiredHumanAction: null, nextAction: "add-authorized-evidence", auditRefs: [workspace.question.id] }),
    stage({ id: "understanding", status: supported ? "complete" : "active", sourceRefs: workspace.latestChange ? [workspace.latestChange.questionId] : [], summary: supported ? answer.conclusion : "Current authorized information does not yet support a complete answer.", blockedReason: supported ? null : "missing-evidence", requiredHumanAction: supported ? null : "add-authorized-evidence", nextAction: supported ? "view-lineage" : "add-authorized-evidence", auditRefs: workspace.latestChange ? [workspace.latestChange.occurredAt] : [], unavailable: unknown }),
    stage({ id: "answer-or-unknown", status: answer ? "complete" : "active", sourceRefs: supported ? [answer.id] : [], summary: supported ? answer.conclusion : answer?.explanation ?? "No supported Answer exists.", blockedReason: null, requiredHumanAction: null, nextAction: unknown ? "add-authorized-evidence" : "view-lineage", auditRefs: supported ? [`answer:${answer.id}:v${answer.revision}`] : [workspace.question.id], unavailable: unknown }),
    stage({ id: "objective-and-context", status: objectiveReady ? "complete" : "blocked", sourceRefs: input.objectiveContext ? unique([input.objectiveContext.objectiveVersionRef ?? "", input.objectiveContext.optimizationContextVersionRef ?? ""]) : [], summary: objectiveReady ? "The exact Objective and Optimization Context are resolved." : "A governed Objective or Optimization Context requires attention.", blockedReason: objectiveReady ? null : objectiveReason, requiredHumanAction: objectiveReady ? null : objectiveReason === "missing-objective" ? "create-objective" : objectiveReason === "stale-optimization-context" ? "reaffirm-optimization-context" : "create-optimization-context", nextAction: objectiveReady ? null : objectiveReason === "missing-objective" ? "create-objective" : objectiveReason === "stale-optimization-context" ? "reaffirm-optimization-context" : "create-optimization-context", auditRefs: [], unavailable: !objectiveReady }),
    stage({ id: "recommendation", status: recommendation ? "complete" : "blocked", sourceRefs: ref(recommendation), summary: recommendation ? `Recommendation disposition: ${recommendation.kind}.` : "No current governed recommendation comparison is available.", blockedReason: recommendation ? null : "material-comparison-unavailable", requiredHumanAction: null, nextAction: recommendation?.kind === "selected-action" ? "authorize-improvement" : null, auditRefs: ref(recommendation), unavailable: !recommendation }),
    stage({ id: "human-decision", status: decision ? "complete" : recommendation?.kind === "selected-action" ? "available" : "not-started", sourceRefs: decision ? [decision.eventId] : [], summary: decision ? `Human disposition recorded: ${decision.eventType}.` : "No human disposition has been recorded.", blockedReason: decision || recommendation?.kind !== "selected-action" ? null : "human-decision-required", requiredHumanAction: decision ? null : recommendation?.kind === "selected-action" ? "authorize-improvement" : null, nextAction: decision ? "execute-existing-local-read-only-operation" : recommendation?.kind === "selected-action" ? "authorize-improvement" : null, auditRefs: decision ? [decision.eventId] : [] }),
    stage({ id: "operation", status: operationResult ? "complete" : operationEligible ? "available" : decision ? "blocked" : "not-started", sourceRefs: operationResult ? [operationResult.resultId, ...operationResult.sourceEvidenceIds] : decision ? [decision.operationId] : [], summary: operationResult ? "The authorized local read-only Evidence inspection completed." : operationEligible ? "The exact governed local Evidence inspection is eligible." : operationOwnerAvailable ? "The local operation is not currently eligible." : "No canonical local operation executor is implemented for this action.", blockedReason: operationResult ? null : operationEligible ? null : operationBlockedReason, requiredHumanAction: null, nextAction: operationEligible && !operationResult ? "execute-existing-local-read-only-operation" : null, auditRefs: operationResult ? [operationResult.resultId] : decision ? [decision.operationId] : [], unavailable: !operationOwnerAvailable && !operationResult }),
    stage({ id: "outcome", status: outcome ? "complete" : operationResult ? "available" : "not-started", sourceRefs: outcome ? [outcome.observationId, outcome.observationSourceRef] : operationResult ? [operationResult.resultId] : [], summary: outcome ? `Operation outcome state: ${outcome.state}.` : operationResult ? "The operation completed; canonical Outcome observation is pending." : "No canonical operation Outcome has been observed.", blockedReason: outcome ? null : operationResult ? "outcome-pending" : "outcome-unmeasured", requiredHumanAction: null, nextAction: outcome ? "view-lineage" : operationResult ? "record-outcome-reference" : null, auditRefs: outcome ? [outcome.observationId] : operationResult ? [operationResult.resultId] : [], unavailable: !outcome }),
    stage({ id: "learning", status: outcome?.observedChange.understanding === "changed" ? "complete" : outcome ? "available" : "not-started", sourceRefs: outcome ? [outcome.before.understandingRevisionRef, outcome.after.understandingRevisionRef ?? ""] : [], summary: outcome ? `Unknown ${outcome.observedChange.unknown}; Answer ${outcome.observedChange.answer}; Understanding ${outcome.observedChange.understanding}.` : "Learning remains unavailable until an Outcome and admitted Evidence produce canonical change.", blockedReason: outcome && outcome.evidenceAdmissionDisposition !== "admitted" ? "evidence-not-admitted" : outcome && outcome.observedChange.understanding !== "changed" ? "no-canonical-change" : null, requiredHumanAction: null, nextAction: "return-to-question", auditRefs: outcome ? [outcome.observationId] : [], unavailable: !outcome }),
  ];
  const current = [...stages].reverse().find((item) => item.status === "active" || item.status === "available" || item.status === "blocked") ?? stages[0];
  const actions = [
    action("revise-question", true, null), action("add-authorized-evidence", true, null), action("create-objective", !objectiveReady && objectiveReason === "missing-objective", objectiveReady ? null : objectiveReason === "missing-objective" ? null : objectiveReason), action("revise-objective", objectiveReady, objectiveReady ? null : objectiveReason), action("create-optimization-context", !objectiveReady && objectiveReason === "missing-optimization-context", objectiveReady ? null : objectiveReason === "missing-optimization-context" ? null : objectiveReason), action("revise-optimization-context", objectiveReady, objectiveReady ? null : objectiveReason), action("reaffirm-optimization-context", objectiveReason === "stale-optimization-context", objectiveReason === "stale-optimization-context" ? null : objectiveReason), action("authorize-improvement", recommendation?.kind === "selected-action" && !decision, recommendation?.kind === "selected-action" ? null : "material-comparison-unavailable"), action("decline-improvement", recommendation?.kind === "selected-action" && !decision, recommendation?.kind === "selected-action" ? null : "material-comparison-unavailable"), action("defer-improvement", recommendation?.kind === "selected-action" && !decision, recommendation?.kind === "selected-action" ? null : "material-comparison-unavailable"), action("execute-existing-local-read-only-operation", Boolean(operationEligible && !operationResult), operationResult ? "operation-already-completed" : operationEligible ? null : operationBlockedReason), action("record-outcome-reference", Boolean(operationResult && !outcome), outcome ? "operation-already-completed" : operationResult ? null : "outcome-pending"), action("view-lineage", true, null), action("return-to-question", true, null),
  ];
  const next = actions.find((item) => item.enabled && item.id === current.nextAction) ?? actions.find((item) => item.enabled) ?? null;
  const communication = { headline: supported ? answer.conclusion : `Discovery does not yet have a supported answer to “${workspace.question.title}”`, summary: supported ? answer.whyItMatters : answer?.explanation ?? "Additional authorized information is required.", rationale: recommendation?.explanation.rationale ?? null, alternatives: recommendation?.explanation.alternativeCandidateIds ?? [], uncertainty: unique([supported ? answer.principalLimiter : answer?.principalLimiter ?? "", ...unavailable.map((item) => `Unavailable: ${item}`)]), requestedDecision: recommendation?.kind === "selected-action" ? `Decide whether to authorize ${recommendation.selected.candidateId}; authorization does not execute it.` : null, whatWouldChange: recommendation?.explanation.stoppingCondition ?? null, auditRefs: unique(stages.flatMap((item) => item.auditRefs)), deterministicPresentation: null };
  return { contractVersion: PRODUCT_QUESTION_WORKSPACE_FRONTEND_VERSION, organizationId: workspace.question.organizationId, questionId: workspace.question.id, base: workspace, orientation: { currentStage: current.id, currentStatus: current.status, currentUserTask: current.summary, nextPermittedAction: next?.id ?? null, primaryBlockedReason: current.blockedReason, secondaryBlockedReasons: unique(stages.map((item) => item.blockedReason ?? "")) as ProductWorkflowBlockedReason[], authorityRequired: next?.requiredAuthority ?? null, sourceRefs: unique(current.sourceRefs) }, stages, actions, objectiveContext: input.objectiveContext ?? null, recommendation, humanDecision: decision, operationResult, outcome, communication, unavailableFields: unavailable, withheldFields: withheld, auditRefs: unique(stages.flatMap((item) => item.auditRefs)) };
}

export function productQuestionWorkspaceV2Digest(workspace: ProductQuestionWorkspaceV2): string {
  return createHash("sha256").update(serializeProductQuestionWorkspaceV2(workspace)).digest("hex");
}

export function serializeProductQuestionWorkspaceV2(workspace: ProductQuestionWorkspaceV2): string {
  const seen = new Set<object>();
  const canonical = (value: unknown): string => {
    if (value === undefined || typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") throw new Error("Unsupported Product workspace value.");
    if (typeof value === "number" && !Number.isFinite(value)) throw new Error("Unsupported non-finite Product workspace number.");
    if (value === null || typeof value !== "object") return JSON.stringify(value);
    if (seen.has(value)) throw new Error("Circular Product workspace value.");
    seen.add(value);
    const rendered = Array.isArray(value) ? `[${value.map(canonical).join(",")}]` : `{${Object.keys(value as object).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(",")}}`;
    seen.delete(value);
    return rendered;
  };
  return canonical(workspace);
}
