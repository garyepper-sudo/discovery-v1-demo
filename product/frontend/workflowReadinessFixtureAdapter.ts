import { createHash } from "node:crypto";
import { selectMaterialInformationAcquisition } from "../acquisition/shadow/selectMaterialInformationAcquisition";
import type { MaterialAcquisitionCandidate, MaterialAcquisitionCandidateEnvelope, MaterialInformationAcquisitionInput, MaterialInformationAcquisitionResult } from "../acquisition";
import type { ProductConfidenceImprovementOutcomeObservation, ProductConfidenceImprovementReceipt, ProductLocalInformationOperationResult } from "../improvements";
import type { ProductObjectiveContextResolution, ProductOptimizationContext, ProductOrganizationalObjective } from "../objectives";
import { buildFrontendReadyProductQuestionWorkspace, productQuestionWorkspaceV2Digest, type ProductQuestionWorkspaceV2, type ProductQuestionWorkspaceV2ProjectionInput, type ProductWorkflowActionId, type ProductWorkflowBlockedReason, type ProductWorkflowStage, type ProductWorkflowStageId } from "../workflow";
import { fixtureProductWorkspaceAdapter } from "./fixtureProductWorkspaceAdapter";

export const FRONTEND_WORKFLOW_FIXTURE_VERSION = "1" as const;
const AT = "2026-08-01T18:00:00.000Z";
const LATER = "2026-08-01T18:01:00.000Z";
const ORG = "onb-dev-frontend-readiness-fixture";
const QUESTION = "fixture-question";
const UNKNOWN = "fixture-unknown";
const UNKNOWN_REF = "fixture-unknown:v1";
const UNDERSTANDING_REF = `organization:${ORG}:understanding:1`;
const OBJECTIVE_REF = `organization:${ORG}:objective:fixture-objective:v1`;
const CONTEXT_REF = `organization:${ORG}:optimization-context:fixture-context:v1`;
const AUTHORITY_REF = `organization:${ORG}:authority:fixture:v1`;
const GOVERNANCE_REF = `organization:${ORG}:governance:fixture:v1`;
const EVIDENCE_ID = "fixture-evidence:ownership";

export type FrontendWorkflowFixture = { fixtureVersion: typeof FRONTEND_WORKFLOW_FIXTURE_VERSION; id: string; description: string; deterministicTimestamp: string; organizationId: string; workspace: ProductQuestionWorkspaceV2; expectedStage: ProductWorkflowStageId; expectedTransition: string; resetSeed: string; seedHash: string; workspaceDigest: string };
export type FrontendWorkflowFixtureAdapter = { contractVersion: "2"; list(): FrontendWorkflowFixture[]; read(id: string): FrontendWorkflowFixture; reset(id: string): FrontendWorkflowFixture };

const estimate = <T>(value: T) => ({ state: "available" as const, value, sourceRef: "fixture:governed", qualification: "Controlled frontend fixture.", maturity: "fixture-backed" as const });
function candidate(id: string, values: { information: "low" | "moderate" | "high"; governance?: boolean; authorization?: boolean; actionType?: MaterialAcquisitionCandidate["actionType"] }): MaterialAcquisitionCandidate {
  return { candidateId: id, actionType: values.actionType ?? "inspect-existing-evidence", actionOwnerRef: "product-confidence-improvement", target: { kind: "existing-evidence-set", targetRef: `fixture:${id}`, organizationId: ORG }, uncertaintyRef: UNKNOWN_REF, materialEffectTargets: ["unknown", "answer"], eligibility: { ownerAvailable: true, targetAccessible: values.authorization !== false, executionAvailable: true, authorizationSatisfied: values.authorization !== false, governanceAllowed: values.governance !== false, consentState: "not-required", reasonCodes: values.governance === false ? ["governance-prohibited"] : values.authorization === false ? ["authorization-denied"] : ["material-effect-confirmed"] }, expectedInformationContribution: estimate(values.information), expectedOrganizationalRelevance: estimate(values.information), expectedDiscriminationGain: estimate(values.information), burden: estimate("low"), cost: estimate("none"), delay: estimate("immediate"), reliability: estimate("high"), existingEvidenceQuality: estimate("high"), reversibility: estimate("reversible"), stoppingCondition: "Stop when the exact competing explanations are distinguished.", expectedEvidenceLineage: { sourceKind: "canonical-evidence", sourceScopeRef: `organization:${ORG}:evidence-scope:admitted`, admissionRequired: true } };
}

function selection(kind: "selected" | "tie" | "stop" | "abstain" | "governance" | "revoked"): MaterialInformationAcquisitionResult {
  const candidates = kind === "tie" ? [candidate("candidate-a", { information: "high" }), candidate("candidate-b", { information: "high" })] : kind === "governance" ? [candidate("candidate-a", { information: "high", governance: false })] : kind === "revoked" ? [candidate("candidate-a", { information: "high", authorization: false })] : kind === "stop" ? [{ ...candidate("candidate-stop", { information: "low", actionType: "stop" }), eligibility: { ...candidate("candidate-stop", { information: "low", actionType: "stop" }).eligibility, reasonCodes: ["understanding-sufficient"] } }] : [candidate("candidate-a", { information: "high" }), candidate("candidate-b", { information: "moderate" })];
  const input: MaterialInformationAcquisitionInput = { contractVersion: "1", organizationId: ORG, questionId: QUESTION, understandingRevisionRef: UNDERSTANDING_REF, materialUncertainty: { unknownId: UNKNOWN, unknownVersionRef: UNKNOWN_REF, status: "open", investigationOpportunityRef: "fixture-opportunity" }, purpose: "improve-understanding", candidates, budgetContext: { maxBurden: "moderate", maxCost: "low", maxDelay: "short", irreversibleActionAllowed: false, materialPreferencesComplete: kind !== "abstain", budgetExhausted: false, userDeclined: false }, authorizationContextRef: AUTHORITY_REF, governanceContextRefs: [GOVERNANCE_REF], evaluatedAt: AT };
  return selectMaterialInformationAcquisition(input);
}

const objective: ProductOrganizationalObjective = { contractVersion: "1", objectiveId: "fixture-objective", organizationId: ORG, scope: { kind: "question", questionId: QUESTION }, statement: "Reduce handoff delay without shifting burden.", desiredChange: { target: "handoff delay", direction: "decrease" }, successCriteria: [{ criterionId: "fixture-criterion", statement: "Reduce median handoff delay.", indicatorRef: "fixture:handoff-delay", target: { kind: "quantitative", value: 2, unit: "days" } }], horizon: { startsAt: AT, targetBy: null, reviewAt: LATER }, status: "active", epistemicConfidence: null, authority: { sourceKind: "authorized-user", sourceRef: "fixture-user", authorityScopeRef: AUTHORITY_REF, authorityBasis: "Controlled fixture authority.", authorizedToEstablish: true }, ancestry: { evidenceRefs: [], questionRefs: [QUESTION], decisionRefs: [], sourceRefs: ["fixture:objective"] }, parentObjectiveVersionRef: null, constraintRefs: [], version: 1, supersedesObjectiveVersionRef: null, establishedAt: AT };
const context: ProductOptimizationContext = { contractVersion: "1", optimizationContextId: "fixture-context", organizationId: ORG, objectiveVersionRef: OBJECTIVE_REF, priorityMode: "maximize-learning", timePreference: { horizon: "near-term", urgency: "moderate", delayTolerance: "moderate" }, riskPreference: { downsideTolerance: "low", uncertaintyTolerance: "moderate", irreversibleActionTolerance: "low", riskCapacityAssessmentRef: null }, resourceConstraintRefs: [], governanceConstraintRefs: [GOVERNANCE_REF], tradeoffPreferences: [{ preferenceId: "fixture-preference", criterion: "discrimination", direction: "increase", precedence: "primary" }], minimumEvidenceStandard: "directional", alternativesRequirement: { minimumMeaningfulAlternatives: 2, includeStatusQuo: true }, source: "explicit", sourceRef: "fixture-user", authorityScopeRef: AUTHORITY_REF, assumptions: [], version: 1, supersedesOptimizationContextVersionRef: null };
const objectiveResolution = (status: ProductObjectiveContextResolution["status"]): ProductObjectiveContextResolution => ({ status, objective: status === "missing-objective" ? null : objective, objectiveVersionRef: status === "missing-objective" ? null : OBJECTIVE_REF, optimizationContext: ["resolved", "stale-context", "governance-prohibited", "missing-authority"].includes(status) ? context : null, optimizationContextVersionRef: ["resolved", "stale-context", "governance-prohibited", "missing-authority"].includes(status) ? CONTEXT_REF : null, eligibleForObjectiveRecommendation: status === "resolved", clarificationQuestion: status === "resolved" ? null : status === "missing-objective" ? "What outcome should this Question advance?" : status === "missing-context" ? "Which tradeoffs should govern the next action?" : "What authorization or clarification would permit progress?", limitations: status === "resolved" ? [] : [`fixture:${status}`] });

const selected = selection("selected");
if (selected.kind !== "selected-action") throw new Error("Controlled selected fixture did not select an action.");
const selectedCandidate = selected.selected;
const CANDIDATE_ENVELOPE_DIGEST = "fixture-envelope-digest:v1";
const envelope: MaterialAcquisitionCandidateEnvelope = { schemaVersion: "1", envelopeId: "fixture-envelope:v1", organizationId: ORG, actionOwner: { ownerRef: "product-confidence-improvement", contractVersion: "3", authorityRef: AUTHORITY_REF }, candidate: selectedCandidate, question: { questionId: QUESTION, revision: 1 }, unknown: { unknownId: UNKNOWN, unknownVersionRef: UNKNOWN_REF }, understandingRevisionRef: UNDERSTANDING_REF, objectiveVersionRef: OBJECTIVE_REF, optimizationContextVersionRef: CONTEXT_REF, expectedInformationClass: "existing-admitted-evidence-inspection", relevanceToUnknown: estimate("high"), requiredSourceAccess: [{ sourceScopeRef: `organization:${ORG}:evidence-scope:admitted`, authorizationRef: AUTHORITY_REF, state: "authorized" }], privacyConstraints: ["organization-only"], humanBurden: estimate("low"), organizationalBurden: estimate("low"), cancellation: { supported: true, characteristics: "Read-only inspection can stop before completion." }, resourceConstraintRefs: [], governanceContextRefs: [GOVERNANCE_REF], assumptions: [], lineage: ["fixture:proposal", `unknown:${UNKNOWN_REF}`], unavailableFields: [], withheldFields: [], projectedAt: AT };

function receipt(disposition: "authorized" | "declined" | "deferred"): ProductConfidenceImprovementReceipt {
  const eventType = disposition === "authorized" ? "improvement-authorized" : disposition === "declined" ? "improvement-declined" : "improvement-deferred";
  return { eventType, eventId: `fixture-choice:${disposition}:v1`, operationId: `fixture-operation:${disposition}`, organizationId: ORG, questionId: QUESTION, unknownId: UNKNOWN, proposalId: selectedCandidate.candidateId, actionType: "inspect-existing-evidence", actionTarget: { kind: "existing-evidence-set", evidenceIds: [EVIDENCE_ID] }, actorRef: "fixture-user", occurredAt: AT, resultEvidenceIds: [], resultSourceRefs: [], limitationCode: null, reason: disposition === "authorized" ? "Authorized exact local inspection." : disposition === "declined" ? "Human declined this improvement." : "Human deferred this improvement." };
}

const authorized = receipt("authorized");
const operationResult: ProductLocalInformationOperationResult = { kind: "product-local-information-operation-result", schemaVersion: "1", resultId: "fixture-operation-result:v1", operationId: authorized.operationId, organizationId: ORG, questionId: QUESTION, questionRevision: 1, unknownId: UNKNOWN, unknownRevisionRef: UNKNOWN_REF, understandingRevisionRef: UNDERSTANDING_REF, objectiveVersionRef: OBJECTIVE_REF, optimizationContextVersionRef: CONTEXT_REF, proposalId: authorized.proposalId, candidateEnvelopeId: envelope.envelopeId, candidateEnvelopeDigest: CANDIDATE_ENVELOPE_DIGEST, humanChoiceEventId: authorized.eventId, completionEventId: "fixture-completion:v1", executionAuthorization: "execute-existing-local-read-only-operation", operationType: "inspect-existing-evidence", actorRef: "fixture-user", authorityRef: AUTHORITY_REF, sourceEvidenceIds: [EVIDENCE_ID], sourceDigests: ["fixture-source-digest:v1"], information: [{ informationId: "fixture-information:v1", informationClass: "existing-admitted-evidence-inspection", sourceEvidenceId: EVIDENCE_ID, sourceDigest: "fixture-source-digest:v1", summary: "The admitted Evidence was inspected against the current Unknown." }], informationProduced: true, evidenceCandidateRefs: [], admittedEvidenceIds: [], limitations: [], unavailableFields: [], withheldFields: [], startedAt: AT, completedAt: LATER, status: "completed", requestDigest: "fixture-request-digest:v1", resultDigest: "fixture-result-digest:v1" };

function outcome(kind: "no-admission" | "admitted-unchanged" | "changed"): ProductConfidenceImprovementOutcomeObservation {
  const admitted = kind !== "no-admission";
  const changed = kind === "changed";
  return { kind: "product-question-improvement-outcome-event", schemaVersion: "1", observationId: `fixture-outcome:${kind}:v1`, observationVersion: 1, supersedesObservationId: null, operationId: operationResult.operationId, operationEventId: operationResult.completionEventId, organizationId: ORG, questionId: QUESTION, unknownId: UNKNOWN, proposalId: operationResult.proposalId, state: "completed", completedAt: LATER, actualBurden: "low", actualDirectCost: { state: "not-applicable" }, actualDelay: "immediate", resultArtifactRefs: [operationResult.resultId], informationRefs: [operationResult.information[0]!.informationId], evidenceCandidateRefs: admitted ? ["fixture-evidence-candidate:v1"] : [], admittedEvidenceIds: admitted ? ["fixture-evidence:admitted:v1"] : [], evidenceAdmissionDisposition: admitted ? "admitted" : "not-evaluated", before: { unknownVersionRef: UNKNOWN_REF, answerVersionRef: "answer-high:v1", understandingRevisionRef: UNDERSTANDING_REF }, after: { unknownVersionRef: UNKNOWN_REF, answerVersionRef: changed ? "answer-high:v2" : "answer-high:v1", understandingRevisionRef: changed ? `organization:${ORG}:understanding:2` : UNDERSTANDING_REF }, observedChange: { unknown: "unchanged", answer: changed ? "changed" : "unchanged", understanding: changed ? "changed" : "unchanged" }, limitations: changed ? [] : [admitted ? "Admitted Evidence did not resolve the current Unknown." : "Information was not admitted as Evidence."], observationSourceRef: operationResult.resultId, observerRef: "fixture-observer", observerAuthorityRef: AUTHORITY_REF, occurredAt: LATER, operationFingerprint: "fixture-operation-fingerprint:v1" };
}

type FixtureSpec = { id: string; description: string; base: string; expectedStage: ProductWorkflowStageId; expectedTransition: string; objectiveContext?: ProductObjectiveContextResolution | null; recommendation?: MaterialInformationAcquisitionResult | null; humanDecision?: ProductConfidenceImprovementReceipt | null; operationResult?: ProductLocalInformationOperationResult | null; outcome?: ProductConfidenceImprovementOutcomeObservation | null; operationEligible?: boolean; unavailable?: string[]; withheld?: string[]; terminal?: "recommendation" | "declined" | "deferred" | "blocked"; history?: "changed" | "superseded" };

const catalog: FixtureSpec[] = [
  { id: "question-created-insufficient-evidence", description: "Question exists before sufficient Evidence.", base: "new-question", expectedStage: "understanding", expectedTransition: "add-authorized-evidence" },
  { id: "supported-answer", description: "A supported Answer is current.", base: "high-confidence-answer", expectedStage: "objective-and-context", expectedTransition: "create-objective" },
  { id: "truthful-unknown", description: "The exact Question remains unknown.", base: "answer-abstention", expectedStage: "understanding", expectedTransition: "add-authorized-evidence" },
  { id: "missing-objective", description: "Objective is actually absent.", base: "high-confidence-answer", expectedStage: "objective-and-context", expectedTransition: "create-objective", objectiveContext: objectiveResolution("missing-objective") },
  { id: "missing-optimization-context", description: "Objective exists and Optimization Context is absent.", base: "high-confidence-answer", expectedStage: "objective-and-context", expectedTransition: "create-optimization-context", objectiveContext: objectiveResolution("missing-context") },
  { id: "stale-context", description: "Objective and stale Optimization Context are retained.", base: "high-confidence-answer", expectedStage: "objective-and-context", expectedTransition: "reaffirm-optimization-context", objectiveContext: objectiveResolution("stale-context") },
  { id: "recommendation-selected", description: "Resolved prerequisites produce one selected action and pending human choice.", base: "high-confidence-answer", expectedStage: "human-decision", expectedTransition: "authorize-improvement", objectiveContext: objectiveResolution("resolved"), recommendation: selected },
  { id: "recommendation-material-tie", description: "Materially tied actions remain tied.", base: "high-confidence-answer", expectedStage: "recommendation", expectedTransition: "clarify-material-comparison", objectiveContext: objectiveResolution("resolved"), recommendation: selection("tie"), terminal: "recommendation" },
  { id: "recommendation-stop", description: "Understanding is sufficient; selection stops.", base: "high-confidence-answer", expectedStage: "recommendation", expectedTransition: "return-to-question", objectiveContext: objectiveResolution("resolved"), recommendation: selection("stop"), terminal: "recommendation" },
  { id: "recommendation-abstain", description: "Material comparison inputs are missing.", base: "high-confidence-answer", expectedStage: "recommendation", expectedTransition: "supply-material-input", objectiveContext: objectiveResolution("resolved"), recommendation: selection("abstain"), terminal: "recommendation" },
  { id: "recommendation-governance-prohibited", description: "Canonical selection abstains because governance prohibits the candidate.", base: "high-confidence-answer", expectedStage: "recommendation", expectedTransition: "governance-change", objectiveContext: objectiveResolution("resolved"), recommendation: selection("governance"), terminal: "recommendation" },
  { id: "recommendation-authorization-revoked", description: "Canonical selection abstains because action authorization is unavailable.", base: "high-confidence-answer", expectedStage: "recommendation", expectedTransition: "request-authority", objectiveContext: objectiveResolution("resolved"), recommendation: selection("revoked"), terminal: "recommendation" },
  { id: "human-decision-pending", description: "A selected action requires an explicit human disposition.", base: "high-confidence-answer", expectedStage: "human-decision", expectedTransition: "record-human-disposition", objectiveContext: objectiveResolution("resolved"), recommendation: selected },
  { id: "human-authorized-operation-pending", description: "Immutable authorization exists and the exact local operation is eligible.", base: "high-confidence-answer", expectedStage: "operation", expectedTransition: "execute-existing-local-read-only-operation", objectiveContext: objectiveResolution("resolved"), recommendation: selected, humanDecision: authorized, operationEligible: true },
  { id: "human-declined", description: "Immutable decline terminates the current action without execution.", base: "high-confidence-answer", expectedStage: "human-decision", expectedTransition: "return-to-question", objectiveContext: objectiveResolution("resolved"), recommendation: selected, humanDecision: receipt("declined"), terminal: "declined" },
  { id: "human-deferred", description: "Immutable defer prevents execution until a future governed transition.", base: "high-confidence-answer", expectedStage: "human-decision", expectedTransition: "await-future-transition", objectiveContext: objectiveResolution("resolved"), recommendation: selected, humanDecision: receipt("deferred"), terminal: "deferred" },
  { id: "operation-complete-outcome-unmeasured", description: "Immutable operation result exists while Outcome remains absent.", base: "high-confidence-answer", expectedStage: "outcome", expectedTransition: "record-outcome-reference", objectiveContext: objectiveResolution("resolved"), recommendation: selected, humanDecision: authorized, operationResult },
  { id: "information-produced-evidence-not-admitted", description: "Inspection produced information, no Evidence candidate/admission, and truthful no-change Learning.", base: "high-confidence-answer", expectedStage: "learning", expectedTransition: "return-to-question", objectiveContext: objectiveResolution("resolved"), recommendation: selected, humanDecision: authorized, operationResult, outcome: outcome("no-admission") },
  { id: "evidence-admitted-unknown-unchanged", description: "Outcome admits Evidence while the Unknown and Understanding remain unchanged.", base: "answer-no-material-change", expectedStage: "learning", expectedTransition: "add-authorized-evidence", objectiveContext: objectiveResolution("resolved"), recommendation: selected, humanDecision: authorized, operationResult, outcome: outcome("admitted-unchanged") },
  { id: "evidence-admitted-understanding-changed", description: "Admitted Evidence produces an exact changed Answer and Understanding lineage.", base: "answer-revised", expectedStage: "learning", expectedTransition: "review-change", objectiveContext: objectiveResolution("resolved"), recommendation: selected, humanDecision: authorized, operationResult, outcome: outcome("changed"), history: "changed" },
  { id: "longitudinal-what-changed", description: "Previous and current Answer revisions remain distinct and addressable.", base: "answer-revised", expectedStage: "learning", expectedTransition: "view-lineage", objectiveContext: objectiveResolution("resolved"), recommendation: selected, humanDecision: authorized, operationResult, outcome: outcome("changed"), history: "changed" },
  { id: "withheld-and-unavailable", description: "Withheld identity is absent while unavailable state remains explicit.", base: "answer-abstention", expectedStage: "understanding", expectedTransition: "request-authorized-input", unavailable: ["outcome"], withheld: ["restricted-source-content"] },
  { id: "historical-revision-supersession", description: "Two immutable Answer revisions preserve supersession and fail-closed source lineage.", base: "answer-revised", expectedStage: "learning", expectedTransition: "view-lineage", objectiveContext: objectiveResolution("resolved"), recommendation: selected, humanDecision: authorized, operationResult, outcome: outcome("changed"), history: "superseded" },
  { id: "fully-blocked-clarification", description: "No state-advancing mutation is permitted until exact authority or clarification changes.", base: "answer-abstention", expectedStage: "objective-and-context", expectedTransition: "await-authority-or-clarification", objectiveContext: objectiveResolution("missing-authority"), terminal: "blocked" },
];

function setStage(workspace: ProductQuestionWorkspaceV2, id: ProductWorkflowStageId, update: Partial<ProductWorkflowStage>): void {
  const stage = workspace.stages.find((item) => item.id === id);
  if (!stage) throw new Error(`Missing fixture stage: ${id}`);
  Object.assign(stage, update);
  stage.available = stage.status !== "not-started" && stage.status !== "unavailable";
  stage.complete = stage.status === "complete";
  stage.blocked = stage.status === "blocked";
}

function deriveOrientation(workspace: ProductQuestionWorkspaceV2, expectedStage: ProductWorkflowStageId, next: ProductWorkflowActionId | null = null): void {
  const current = workspace.stages.find((item) => item.id === expectedStage)!;
  const enabledNext = next ? workspace.actions.find((item) => item.id === next && item.enabled) : null;
  workspace.orientation = { currentStage: current.id, currentStatus: current.status, currentUserTask: current.summary, nextPermittedAction: enabledNext?.id ?? null, primaryBlockedReason: current.blockedReason, secondaryBlockedReasons: [...new Set(workspace.stages.flatMap((item) => item.blockedReason ? [item.blockedReason] : []))].sort(), authorityRequired: enabledNext?.requiredAuthority ?? null, sourceRefs: [...new Set(current.sourceRefs)].sort() };
}

function produce(item: FixtureSpec): FrontendWorkflowFixture {
  const base = fixtureProductWorkspaceAdapter.getFixture(item.base).workspace;
  base.question.organizationId = ORG;
  base.question.id = QUESTION;
  base.question.text = base.question.title;
  if (item.history) {
    base.question.answerHistory = [
      { answerId: "answer-high:v1", canonicalSource: "fixture:retained-answer:v1", revision: 1, reasonForChange: "Initial supported Answer.", changeReceiptId: "fixture-change:v1", timestamp: AT, confidence: { level: "moderate", score: 0.62, meaning: "Confidence in this exact historical Answer.", principalLimiter: "Discriminating Evidence remained limited.", authoritativeSource: "fixture:retained-answer:v1" } },
      { answerId: "answer-high:v2", canonicalSource: item.history === "superseded" ? "fixture:unavailable-exact-source:v2" : "fixture:retained-answer:v2", revision: 2, reasonForChange: "Admitted Evidence changed the supported explanation.", changeReceiptId: "fixture-change:v2", timestamp: LATER, confidence: { level: "high", score: 0.82, meaning: "Confidence in this exact current Answer.", principalLimiter: "One segment remains sparsely observed.", authoritativeSource: "fixture:retained-answer:v2" } },
    ];
    base.question.revision = 2;
    base.question.currentAnswerId = "answer-high:v2";
    base.question.timeline.push({ id: "fixture-timeline:superseded", type: "answer_recorded", timestamp: LATER, label: "Answer revision 2 superseded revision 1 without deleting it.", referenceId: "answer-high:v2" });
  }
  const input: ProductQuestionWorkspaceV2ProjectionInput = { workspace: base, objectiveContext: item.objectiveContext, recommendation: item.recommendation, humanDecision: item.humanDecision, operationResult: item.operationResult, outcome: item.outcome, operationOwnerAvailable: Boolean(item.operationEligible || item.operationResult), operationEligibility: item.operationEligible ? { operationType: "inspect-existing-evidence", status: "eligible", blockedReason: null } : item.humanDecision ? { operationType: "inspect-existing-evidence", status: "blocked", blockedReason: "execution-not-authorized" } : null, unavailableFields: item.unavailable, withheldFields: item.withheld };
  const workspace = buildFrontendReadyProductQuestionWorkspace(input);

  if (item.humanDecision) {
    setStage(workspace, "recommendation", { nextAction: null });
    setStage(workspace, "human-decision", { nextAction: item.humanDecision.eventType === "improvement-authorized" && !item.operationResult ? "execute-existing-local-read-only-operation" : null });
  }

  if (item.terminal === "recommendation") {
    const reason: ProductWorkflowBlockedReason | null = item.id.includes("governance") ? "governance-prohibited" : item.id.includes("authorization") ? "authorization-required" : item.id.includes("abstain") ? "material-comparison-unavailable" : null;
    const nextAction: ProductWorkflowActionId | null = item.id === "recommendation-stop" ? "return-to-question" : item.id === "recommendation-abstain" ? "add-authorized-evidence" : null;
    setStage(workspace, "recommendation", { status: reason ? "blocked" : "active", blockedReason: reason, summary: `Recommendation disposition: ${workspace.recommendation?.kind}.`, nextAction, requiredHumanAction: null });
  }
  if (item.terminal === "declined" || item.terminal === "deferred") {
    setStage(workspace, "human-decision", { status: "active", blockedReason: null, summary: item.terminal === "declined" ? "The human declined this improvement; no operation is authorized." : "The human deferred this improvement; execution remains unavailable until a future governed transition.", nextAction: "return-to-question", requiredHumanAction: null });
    setStage(workspace, "operation", { status: "not-started", blockedReason: "no-authorized-human-choice", summary: "No authorized operation may execute from this human disposition.", nextAction: null });
    const execute = workspace.actions.find((action) => action.id === "execute-existing-local-read-only-operation")!;
    execute.enabled = false; execute.blockedReason = "no-authorized-human-choice";
    workspace.communication.requestedDecision = null;
    workspace.communication.summary = workspace.stages.find((stage) => stage.id === "human-decision")!.summary;
  }
  if (item.terminal === "blocked") {
    setStage(workspace, "objective-and-context", { status: "blocked", blockedReason: "authorization-required", summary: "Progress requires exact organization-scoped authority or a governed clarification.", nextAction: null, requiredHumanAction: null });
    for (const action of workspace.actions) if (action.writesRuntime) { action.enabled = false; action.blockedReason = "authorization-required"; }
    workspace.communication.summary = "No state-advancing mutation is permitted until exact authority or clarification changes.";
    workspace.communication.whatWouldChange = "A governed authority grant or answered clarification.";
  }
  if (item.id === "recommendation-governance-prohibited" || item.id === "recommendation-authorization-revoked") {
    for (const action of workspace.actions.filter((action) => action.id.endsWith("improvement") || action.executesOperation)) { action.enabled = false; action.blockedReason = item.id.includes("governance") ? "governance-prohibited" : "authorization-required"; }
  }
  if (item.id === "withheld-and-unavailable") {
    const serialized = JSON.stringify(workspace);
    if (serialized.includes("restricted-source-identity") || serialized.includes("restricted-source-value")) throw new Error("Withheld fixture leaked a restricted identity or value.");
  }
  if (item.id === "evidence-admitted-unknown-unchanged") setStage(workspace, "learning", { nextAction: "add-authorized-evidence" });
  if (["evidence-admitted-understanding-changed", "longitudinal-what-changed", "historical-revision-supersession"].includes(item.id)) setStage(workspace, "learning", { nextAction: "view-lineage" });

  const transitionAction: Partial<Record<string, ProductWorkflowActionId>> = {
    "record-human-disposition": "authorize-improvement",
    "return-to-question": "return-to-question",
    "await-future-transition": "return-to-question",
    "supply-material-input": "add-authorized-evidence",
    "request-authorized-input": "add-authorized-evidence",
    "review-change": "view-lineage",
  };
  const primaryAction = workspace.actions.some((action) => action.id === item.expectedTransition)
    ? item.expectedTransition as ProductWorkflowActionId
    : transitionAction[item.expectedTransition] ?? null;
  deriveOrientation(workspace, item.expectedStage, primaryAction);
  workspace.auditRefs = [...new Set([...workspace.auditRefs, ...(item.humanDecision ? [item.humanDecision.eventId] : []), ...(item.operationResult ? [item.operationResult.resultId] : []), ...(item.outcome ? [item.outcome.observationId] : []), ...base.question.answerHistory.map((entry) => `answer:${entry.answerId}`)])].sort();
  workspace.communication.auditRefs = [...workspace.auditRefs];
  const resetSeed = JSON.stringify({ fixtureVersion: FRONTEND_WORKFLOW_FIXTURE_VERSION, id: item.id, deterministicTimestamp: AT });
  return { fixtureVersion: FRONTEND_WORKFLOW_FIXTURE_VERSION, id: item.id, description: item.description, deterministicTimestamp: AT, organizationId: ORG, workspace, expectedStage: item.expectedStage, expectedTransition: item.expectedTransition, resetSeed, seedHash: createHash("sha256").update(resetSeed).digest("hex"), workspaceDigest: productQuestionWorkspaceV2Digest(workspace) };
}

const fixtures = catalog.map(produce);
const byId = new Map(fixtures.map((fixture) => [fixture.id, fixture]));
export const workflowReadinessFixtureAdapter: FrontendWorkflowFixtureAdapter = { contractVersion: "2", list: () => structuredClone(fixtures), read: (id) => { const fixture = byId.get(id); if (!fixture) throw new Error(`Unknown frontend-readiness fixture: ${id}`); return structuredClone(fixture); }, reset: (id) => { if (!byId.has(id)) throw new Error(`Unknown frontend-readiness fixture: ${id}`); return produce(catalog.find((item) => item.id === id)!); } };
