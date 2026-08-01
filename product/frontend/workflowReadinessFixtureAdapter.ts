import { createHash } from "node:crypto";
import { selectMaterialInformationAcquisition } from "../acquisition/shadow/selectMaterialInformationAcquisition";
import type { MaterialAcquisitionCandidate, MaterialInformationAcquisitionInput } from "../acquisition";
import { buildFrontendReadyProductQuestionWorkspace, productQuestionWorkspaceV2Digest, type ProductQuestionWorkspaceV2, type ProductWorkflowActionId, type ProductWorkflowBlockedReason, type ProductWorkflowStageId } from "../workflow";
import { fixtureProductWorkspaceAdapter } from "./fixtureProductWorkspaceAdapter";

export const FRONTEND_WORKFLOW_FIXTURE_VERSION = "1" as const;
const AT = "2026-08-01T18:00:00.000Z";
const ORG = "onb-dev-frontend-readiness-fixture";

export type FrontendWorkflowFixture = { fixtureVersion: typeof FRONTEND_WORKFLOW_FIXTURE_VERSION; id: string; description: string; deterministicTimestamp: string; organizationId: string; workspace: ProductQuestionWorkspaceV2; expectedStage: ProductWorkflowStageId; resetSeed: string; seedHash: string; workspaceDigest: string };
export type FrontendWorkflowFixtureAdapter = { contractVersion: "2"; list(): FrontendWorkflowFixture[]; read(id: string): FrontendWorkflowFixture; reset(id: string): FrontendWorkflowFixture };

const estimate = <T>(value: T) => ({ state: "available" as const, value, sourceRef: "fixture:governed", qualification: "Controlled frontend fixture.", maturity: "fixture-backed" as const });
function candidate(id: string, values: { information: "low" | "moderate" | "high"; governance?: boolean; authorization?: boolean }): MaterialAcquisitionCandidate { return { candidateId: id, actionType: "compare-existing-evidence", actionOwnerRef: "fixture:existing-evidence-owner", target: { kind: "existing-evidence-set", targetRef: `fixture:${id}`, organizationId: ORG }, uncertaintyRef: "fixture-unknown:v1", materialEffectTargets: ["unknown", "answer"], eligibility: { ownerAvailable: true, targetAccessible: values.authorization !== false, executionAvailable: true, authorizationSatisfied: values.authorization !== false, governanceAllowed: values.governance !== false, consentState: "not-required", reasonCodes: ["material-effect-confirmed"] }, expectedInformationContribution: estimate(values.information), expectedOrganizationalRelevance: estimate(values.information), expectedDiscriminationGain: estimate(values.information), burden: estimate("low"), cost: estimate("none"), delay: estimate("immediate"), reliability: estimate("high"), existingEvidenceQuality: estimate("high"), reversibility: estimate("reversible"), stoppingCondition: "Stop when the exact competing explanations are distinguished.", expectedEvidenceLineage: { sourceKind: "fixture", sourceScopeRef: `fixture:${id}`, admissionRequired: true } }; }
function selection(kind: "selected" | "tie" | "stop" | "abstain" | "governance" | "revoked") {
  const candidates = kind === "tie" ? [candidate("candidate-a", { information: "high" }), candidate("candidate-b", { information: "high" })] : kind === "governance" ? [candidate("candidate-a", { information: "high", governance: false })] : kind === "revoked" ? [candidate("candidate-a", { information: "high", authorization: false })] : kind === "stop" ? [{ ...candidate("candidate-stop", { information: "low" }), actionType: "stop" as const, eligibility: { ...candidate("candidate-stop", { information: "low" }).eligibility, reasonCodes: ["understanding-sufficient"] } }] : kind === "abstain" ? [candidate("candidate-a", { information: "high" })] : [candidate("candidate-a", { information: "high" }), candidate("candidate-b", { information: "moderate" })];
  const input: MaterialInformationAcquisitionInput = { contractVersion: "1", organizationId: ORG, questionId: "fixture-question", understandingRevisionRef: "fixture-understanding:v1", materialUncertainty: { unknownId: "fixture-unknown", unknownVersionRef: "fixture-unknown:v1", status: "open", investigationOpportunityRef: "fixture-opportunity" }, purpose: "improve-understanding", candidates, budgetContext: { maxBurden: "moderate", maxCost: "low", maxDelay: "short", irreversibleActionAllowed: false, materialPreferencesComplete: kind !== "abstain", budgetExhausted: false, userDeclined: false }, authorizationContextRef: "fixture-authority:v1", governanceContextRefs: ["fixture-governance:v1"], evaluatedAt: AT };
  return selectMaterialInformationAcquisition(input);
}

const catalog: Array<{ id: string; description: string; base: string; stage: ProductWorkflowStageId; recommendation?: ReturnType<typeof selection>; block?: ProductWorkflowBlockedReason; action?: ProductWorkflowActionId; unavailable?: string[]; withheld?: string[] }> = [
  { id: "question-created-insufficient-evidence", description: "Question exists before sufficient Evidence.", base: "new-question", stage: "understanding", block: "missing-evidence", action: "add-authorized-evidence" },
  { id: "supported-answer", description: "A supported Answer is current.", base: "high-confidence-answer", stage: "objective-and-context", block: "missing-objective", action: "create-objective" },
  { id: "truthful-unknown", description: "The exact Question remains unknown.", base: "answer-abstention", stage: "understanding", block: "missing-evidence", action: "add-authorized-evidence" },
  { id: "missing-objective", description: "Objective is missing.", base: "high-confidence-answer", stage: "objective-and-context", block: "missing-objective", action: "create-objective" },
  { id: "missing-optimization-context", description: "Optimization Context is missing.", base: "high-confidence-answer", stage: "objective-and-context", block: "missing-optimization-context", action: "create-optimization-context" },
  { id: "stale-context", description: "Context is stale after Objective revision.", base: "high-confidence-answer", stage: "objective-and-context", block: "stale-optimization-context", action: "reaffirm-optimization-context" },
  { id: "recommendation-selected", description: "One governed information action is selected.", base: "high-confidence-answer", stage: "human-decision", recommendation: selection("selected"), block: "human-decision-required", action: "authorize-improvement" },
  { id: "recommendation-material-tie", description: "Materially tied actions remain tied.", base: "high-confidence-answer", stage: "recommendation", recommendation: selection("tie") },
  { id: "recommendation-stop", description: "Understanding is sufficient; selection stops.", base: "high-confidence-answer", stage: "recommendation", recommendation: selection("stop") },
  { id: "recommendation-abstain", description: "Material comparison inputs are missing.", base: "high-confidence-answer", stage: "recommendation", recommendation: selection("abstain"), block: "material-comparison-unavailable" },
  { id: "recommendation-governance-prohibited", description: "Governance prohibits the candidate.", base: "high-confidence-answer", stage: "recommendation", recommendation: selection("governance"), block: "governance-prohibited" },
  { id: "recommendation-authorization-revoked", description: "Authorization is revoked without deleting history.", base: "high-confidence-answer", stage: "recommendation", recommendation: selection("revoked"), block: "authorization-required" },
  { id: "human-decision-pending", description: "A human disposition is required.", base: "high-confidence-answer", stage: "human-decision", recommendation: selection("selected"), block: "human-decision-required", action: "authorize-improvement" },
  { id: "human-authorized-operation-pending", description: "Authorization is recorded but no operation executor exists.", base: "high-confidence-answer", stage: "operation", block: "operation-owner-unimplemented" },
  { id: "human-declined", description: "Decline is distinct from stop.", base: "high-confidence-answer", stage: "human-decision" },
  { id: "human-deferred", description: "Defer is distinct from abstain.", base: "high-confidence-answer", stage: "human-decision" },
  { id: "operation-complete-outcome-unmeasured", description: "Completion does not fabricate an Outcome.", base: "high-confidence-answer", stage: "outcome", block: "outcome-unmeasured" },
  { id: "information-produced-evidence-not-admitted", description: "Information remains separate from admitted Evidence.", base: "high-confidence-answer", stage: "learning", block: "evidence-not-admitted" },
  { id: "evidence-admitted-unknown-unchanged", description: "Admission does not imply Unknown change.", base: "answer-no-material-change", stage: "learning", block: "no-canonical-change" },
  { id: "evidence-admitted-understanding-changed", description: "Canonical change is visible after admission.", base: "answer-revised", stage: "learning" },
  { id: "longitudinal-what-changed", description: "Before and after remain distinct.", base: "answer-revised", stage: "learning" },
  { id: "withheld-and-unavailable", description: "Withheld values stay absent and unavailable values remain explicit.", base: "answer-abstention", stage: "understanding", unavailable: ["outcome"], withheld: ["restricted-source"] },
  { id: "historical-revision-supersession", description: "Historical revision remains addressable.", base: "answer-revised", stage: "learning" },
  { id: "fully-blocked-clarification", description: "One deterministic clarification is primary.", base: "answer-abstention", stage: "objective-and-context", block: "missing-objective", action: "create-objective" },
];

function produce(item: typeof catalog[number]): FrontendWorkflowFixture {
  const base = fixtureProductWorkspaceAdapter.getFixture(item.base).workspace;
  base.question.organizationId = ORG;
  const workspace = buildFrontendReadyProductQuestionWorkspace({ workspace: base, recommendation: item.recommendation ?? null, unavailableFields: item.unavailable, withheldFields: item.withheld });
  const target = workspace.stages.find((stage) => stage.id === item.stage)!;
  workspace.orientation.currentStage = item.stage; workspace.orientation.currentStatus = target.status; workspace.orientation.currentUserTask = target.summary; workspace.orientation.primaryBlockedReason = item.block ?? target.blockedReason; workspace.orientation.nextPermittedAction = item.action ?? target.nextAction;
  const resetSeed = JSON.stringify({ fixtureVersion: FRONTEND_WORKFLOW_FIXTURE_VERSION, id: item.id, deterministicTimestamp: AT });
  return { fixtureVersion: FRONTEND_WORKFLOW_FIXTURE_VERSION, id: item.id, description: item.description, deterministicTimestamp: AT, organizationId: ORG, workspace, expectedStage: item.stage, resetSeed, seedHash: createHash("sha256").update(resetSeed).digest("hex"), workspaceDigest: productQuestionWorkspaceV2Digest(workspace) };
}
const fixtures = catalog.map(produce);
const byId = new Map(fixtures.map((fixture) => [fixture.id, fixture]));
export const workflowReadinessFixtureAdapter: FrontendWorkflowFixtureAdapter = { contractVersion: "2", list: () => structuredClone(fixtures), read: (id) => { const fixture = byId.get(id); if (!fixture) throw new Error(`Unknown frontend-readiness fixture: ${id}`); return structuredClone(fixture); }, reset: (id) => { const fixture = byId.get(id); if (!fixture) throw new Error(`Unknown frontend-readiness fixture: ${id}`); return produce(catalog.find((item) => item.id === id)!); } };
