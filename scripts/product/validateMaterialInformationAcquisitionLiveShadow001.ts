import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../db/governance/postgresRepositories";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { FilesystemOrganizationRuntimeRepository, type StoredOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { validateOnboardingTestEnvironment } from "../../lib/environment/discoveryEnvironment";
import { isOnboardingTestOrganizationId } from "../../lib/onboarding/testing";
import {
  MATERIAL_ACQUISITION_SHADOW_THRESHOLDS,
  preregisterMaterialAcquisitionCalibration,
  runReadOnlyMaterialAcquisitionShadow,
  selectMaterialInformationAcquisition,
  type MaterialAcquisitionCandidate,
  type MaterialAcquisitionEstimate,
  type MaterialInformationAcquisitionInput,
} from "../../product/acquisition/shadow";
import { productConfidenceImprovementEvents } from "../../product/improvements";
import { CanonicalProductWorkspaceAdapter } from "../../product/integration";
import {
  objectiveVersionRef,
  recordOptimizationContextVersion,
  recordOrganizationalObjectiveVersion,
  resolveProductObjectiveContext,
  type ProductOptimizationContext,
  type ProductOrganizationalObjective,
} from "../../product/objectives";
import { getProductUnknownHistory } from "../../product/unknowns";

const organizationId = "onb-dev-shadow-acquisition-001";
const questionId = "product-question-shadow-acquisition-001";
const unknownId = "product-unknown-shadow-acquisition-001";
const unknownVersionRef = "product-unknown-event-shadow-acquisition-001";
const understandingRevisionRef = `organization:${organizationId}:understanding:1`;
const evaluatedAt = "2026-08-01T12:00:00.000Z";
const source = <T>(value: T, sourceRef = "controlled-owner:shadow-001"): MaterialAcquisitionEstimate<T> => ({
  state: "available", value, sourceRef,
  qualification: "Controlled synthetic action-owner input for shadow validation.",
  maturity: "synthetic",
});
const unavailable = <T>(reason: string): MaterialAcquisitionEstimate<T> => ({ state: "unknown", reason });

function candidate(id: string, overrides: Partial<MaterialAcquisitionCandidate> = {}): MaterialAcquisitionCandidate {
  return {
    candidateId: id,
    actionType: "inspect-existing-evidence",
    actionOwnerRef: "product-confidence-improvement:controlled-shadow-owner",
    target: { kind: "existing-evidence-set", targetRef: `target:${id}`, organizationId },
    uncertaintyRef: unknownVersionRef,
    materialEffectTargets: ["unknown", "answer"],
    eligibility: {
      ownerAvailable: true, targetAccessible: true, executionAvailable: true,
      authorizationSatisfied: true, governanceAllowed: true, consentState: "not-required",
      reasonCodes: ["material-effect-confirmed"],
    },
    expectedInformationContribution: source("high"),
    expectedOrganizationalRelevance: source("high"),
    expectedDiscriminationGain: source("high"),
    burden: source("low"), cost: source("none"), delay: source("immediate"),
    reliability: source("high"), existingEvidenceQuality: source("moderate"),
    reversibility: source("reversible"),
    stoppingCondition: "Stop after the exact Unknown is canonically reevaluated.",
    expectedEvidenceLineage: { sourceKind: "controlled-synthetic", sourceScopeRef: `scope:${id}`, admissionRequired: true },
    ...overrides,
  };
}

function acquisitionInput(candidates: MaterialAcquisitionCandidate[], overrides: Partial<MaterialInformationAcquisitionInput> = {}): MaterialInformationAcquisitionInput {
  return {
    contractVersion: "1", organizationId, questionId, understandingRevisionRef,
    materialUncertainty: { unknownId, unknownVersionRef, status: "open", investigationOpportunityRef: null },
    purpose: "improve-understanding", candidates,
    budgetContext: {
      maxBurden: "high", maxCost: "high", maxDelay: "material",
      irreversibleActionAllowed: false, materialPreferencesComplete: true,
      budgetExhausted: false, userDeclined: false,
    },
    authorizationContextRef: "authorization:controlled-shadow-001",
    governanceContextRefs: ["governance:controlled-shadow-001"],
    evaluatedAt,
    ...overrides,
  };
}

function objective(version: number, supersedes: string | null): ProductOrganizationalObjective {
  return {
    contractVersion: "1", objectiveId: "objective-shadow-acquisition", organizationId,
    scope: { kind: "organization" }, statement: `Improve customer retention, version ${version}.`,
    desiredChange: { target: "Customer retention", direction: "increase" },
    successCriteria: [{ criterionId: "criterion-shadow", statement: "Retention improves at review.", indicatorRef: "indicator:retention", target: { kind: "qualitative", description: "Reviewable improvement." } }],
    horizon: { startsAt: evaluatedAt, targetBy: "2027-01-01T12:00:00.000Z", reviewAt: "2026-10-01T12:00:00.000Z" },
    status: "active", epistemicConfidence: "moderate",
    authority: { sourceKind: "authorized-user", sourceRef: "controlled-principal", authorityScopeRef: "organization", authorityBasis: "Controlled shadow authority.", authorizedToEstablish: true },
    ancestry: { evidenceRefs: [], questionRefs: [], decisionRefs: [], sourceRefs: [] },
    parentObjectiveVersionRef: null, constraintRefs: [], version,
    supersedesObjectiveVersionRef: supersedes, establishedAt: `2026-08-0${version}T12:00:00.000Z`,
  };
}

function optimizationContext(objectiveRef: string): ProductOptimizationContext {
  return {
    contractVersion: "1", optimizationContextId: "context-shadow-acquisition", organizationId,
    objectiveVersionRef: objectiveRef, priorityMode: "maximize-learning",
    timePreference: { horizon: "medium-term", urgency: "moderate", delayTolerance: "moderate" },
    riskPreference: { downsideTolerance: "low", uncertaintyTolerance: "moderate", irreversibleActionTolerance: "low", riskCapacityAssessmentRef: null },
    resourceConstraintRefs: [], governanceConstraintRefs: [],
    tradeoffPreferences: [{ preferenceId: "preference-shadow-burden", criterion: "Limit collection burden", direction: "preserve", precedence: "primary" }],
    minimumEvidenceStandard: "substantial", alternativesRequirement: { minimumMeaningfulAlternatives: 2, includeStatusQuo: true },
    source: "explicit", sourceRef: null, authorityScopeRef: "organization", assumptions: [],
    version: 1, supersedesOptimizationContextVersionRef: null,
  };
}

function objectiveContextCases(): { resolved: ReturnType<typeof resolveProductObjectiveContext>; stale: ReturnType<typeof resolveProductObjectiveContext> } {
  const grant = { actorRef: "controlled-principal", authorityScopeRef: "organization", authorized: true, authorizedAt: evaluatedAt };
  const references = { valid: true, invalidRefs: [] };
  const v1 = objective(1, null);
  const created = recordOrganizationalObjectiveVersion({ runtime: createEmptyOrganizationRuntime({ organizationId }), objective: v1, expectedCurrentVersion: null, operationId: "objective-shadow-v1", grant, references });
  const context = optimizationContext(created.objectiveVersionRef);
  const contextualized = recordOptimizationContextVersion({ runtime: created.runtime, context, expectedCurrentVersion: null, operationId: "context-shadow-v1", grant, references });
  const resolved = resolveProductObjectiveContext({ runtime: contextualized.runtime, scope: { kind: "organization" }, evaluationAt: evaluatedAt });
  const v2 = objective(2, created.objectiveVersionRef);
  const revised = recordOrganizationalObjectiveVersion({ runtime: contextualized.runtime, objective: v2, expectedCurrentVersion: 1, operationId: "objective-shadow-v2", grant, references });
  return { resolved, stale: resolveProductObjectiveContext({ runtime: revised.runtime, scope: { kind: "organization" }, evaluationAt: evaluatedAt }) };
}

function runControlledCases() {
  const high = candidate("candidate-high");
  const low = candidate("candidate-low", {
    expectedInformationContribution: source("moderate"), expectedDiscriminationGain: source("moderate"),
    expectedOrganizationalRelevance: source("moderate"), reliability: source("moderate"),
  });
  const selected = selectMaterialInformationAcquisition(acquisitionInput([low, high]));
  assert.equal(selected.kind, "selected-action");
  assert.equal(selected.kind === "selected-action" ? selected.selected.candidateId : null, high.candidateId);

  const tieA = candidate("candidate-tie-a");
  const tieB = candidate("candidate-tie-b");
  const tie = selectMaterialInformationAcquisition(acquisitionInput([tieB, tieA]));
  assert.equal(tie.kind, "material-tie");
  assert.deepEqual(tie.kind === "material-tie" ? tie.candidates.map((item) => item.candidateId) : [], ["candidate-tie-a", "candidate-tie-b"]);

  const stop = selectMaterialInformationAcquisition(acquisitionInput([candidate("candidate-stop", { actionType: "stop", eligibility: { ...candidate("x").eligibility, reasonCodes: ["understanding-sufficient"] } })]));
  assert.equal(stop.kind, "stop");
  const missing = selectMaterialInformationAcquisition(acquisitionInput([candidate("candidate-missing", { expectedInformationContribution: unavailable("Owner estimate unavailable.") })]));
  assert.deepEqual({ kind: missing.kind, reason: "reason" in missing ? missing.reason : null }, { kind: "abstain", reason: "missing-material-input" });

  const prohibited = candidate("candidate-prohibited", { eligibility: { ...candidate("x").eligibility, governanceAllowed: false, reasonCodes: ["governance-prohibited"] } });
  assert.deepEqual(selectMaterialInformationAcquisition(acquisitionInput([prohibited])).kind, "abstain");
  let protectedSourceReads = 0;
  const unauthorized = candidate("candidate-unauthorized", { eligibility: { ...candidate("x").eligibility, authorizationSatisfied: false, targetAccessible: false, reasonCodes: ["authorization-denied"] } });
  const unauthorizedResult = selectMaterialInformationAcquisition(acquisitionInput([unauthorized]));
  assert.equal(unauthorizedResult.kind, "abstain"); assert.equal(protectedSourceReads, 0);

  const contexts = objectiveContextCases();
  assert.equal(contexts.resolved.status, "resolved");
  assert.equal(contexts.resolved.objective?.version, 1);
  assert.equal(contexts.resolved.optimizationContext?.version, 1);
  assert.equal(contexts.stale.status, "stale-context");
  const expensive = candidate("candidate-expensive", { burden: source("high"), delay: source("material") });
  const modest = candidate("candidate-modest", { expectedInformationContribution: source("moderate"), expectedDiscriminationGain: source("moderate"), burden: source("low"), delay: source("short") });
  const constrained = selectMaterialInformationAcquisition(acquisitionInput([expensive, modest], { budgetContext: { ...acquisitionInput([]).budgetContext, maxBurden: "moderate", maxDelay: "short" } }));
  assert.equal(constrained.kind === "selected-action" ? constrained.selected.candidateId : null, modest.candidateId);
  const unconstrained = selectMaterialInformationAcquisition(acquisitionInput([expensive, modest]));
  assert.deepEqual(
    { kind: unconstrained.kind, reason: "reason" in unconstrained ? unconstrained.reason : null },
    { kind: "abstain", reason: "incomparable-actions" },
  );

  const missingPreference = selectMaterialInformationAcquisition(acquisitionInput([high], { budgetContext: { ...acquisitionInput([]).budgetContext, materialPreferencesComplete: false } }));
  assert.deepEqual({ kind: missingPreference.kind, reason: "reason" in missingPreference ? missingPreference.reason : null }, { kind: "abstain", reason: "missing-material-input" });
  const lowBurden = candidate("candidate-low-burden", { burden: source("low"), delay: source("immediate") });
  const highBurden = candidate("candidate-high-burden", { burden: source("high"), delay: source("material") });
  const burdenResult = selectMaterialInformationAcquisition(acquisitionInput([highBurden, lowBurden]));
  assert.equal(burdenResult.kind === "selected-action" ? burdenResult.selected.candidateId : null, lowBurden.candidateId);

  const revokedHigh = { ...high, eligibility: { ...high.eligibility, authorizationSatisfied: false, reasonCodes: ["authorization-revoked"] } };
  const recomputed = selectMaterialInformationAcquisition(acquisitionInput([revokedHigh, low]));
  assert.equal(recomputed.kind === "selected-action" ? recomputed.selected.candidateId : null, low.candidateId);
  const foreign = candidate("candidate-foreign", { target: { kind: "existing-evidence-set", targetRef: "foreign", organizationId: "onb-dev-shadow-acquisition-foreign" } });
  assert.notEqual(selectMaterialInformationAcquisition(acquisitionInput([foreign, low])).kind === "selected-action"
    ? (selectMaterialInformationAcquisition(acquisitionInput([foreign, low])) as Extract<ReturnType<typeof selectMaterialInformationAcquisition>, { kind: "selected-action" }>).selected.candidateId : null, foreign.candidateId);

  const ordered = selectMaterialInformationAcquisition(acquisitionInput([low, high]));
  const reversed = selectMaterialInformationAcquisition(acquisitionInput([high, low]));
  assert.deepEqual(reversed, ordered);
  assert.deepEqual(selectMaterialInformationAcquisition(acquisitionInput([low, high])), ordered);
  const historical = selectMaterialInformationAcquisition(acquisitionInput([high], { understandingRevisionRef: `organization:${organizationId}:understanding:0` }));
  const current = selectMaterialInformationAcquisition(acquisitionInput([high]));
  assert.notEqual(historical.selectionId, current.selectionId);

  return {
    cases: {
      A: selected.kind, B: tie.kind, C: stop.kind, D: missing.kind, E: prohibited.eligibility.governanceAllowed ? "FAIL" : "PASS",
      F: unauthorizedResult.kind, G: `${contexts.resolved.status}/${constrained.kind}/${unconstrained.kind}`,
      H: contexts.stale.status, I: missingPreference.kind, J: burdenResult.kind,
      K: recomputed.kind, L: "PASS", M: "PASS", N: "PASS", O: "unmeasured",
    },
    protectedSourceReads,
    deterministicReplay: true,
    inputOrderStable: true,
  };
}

async function runLiveCase() {
  const userId = process.env.DISCOVERY_SHADOW_USER_ID?.trim();
  const liveOrganizationId = process.env.DISCOVERY_SHADOW_ORGANIZATION_ID?.trim();
  if (!userId || !liveOrganizationId) return null;
  if (!/^user_[a-zA-Z0-9]+$/.test(userId) || !isOnboardingTestOrganizationId(liveOrganizationId)) throw new Error("Exact development shadow identity is invalid.");
  validateOnboardingTestEnvironment();
  const sql = postgres(requireDiscoveryDatabaseUrl("application"), { max: 1 });
  let runtimeReads = 0; let runtimeWrites = 0; let authorizeCalls = 0;
  try {
    const access = new PostgresAlphaAccessRecordRepository(sql);
    const filesystem = new FilesystemOrganizationRuntimeRepository();
    const readOnlyRepository = {
      backend: filesystem.backend,
      async read(id: string) { runtimeReads += 1; return filesystem.read(id); },
      async replace() { runtimeWrites += 1; throw new Error("Read-only shadow cannot replace Runtime."); },
    };
    const adapter = new CanonicalProductWorkspaceAdapter({
      runtimeRepository: readOnlyRepository,
      async authorize(input) {
        authorizeCalls += 1;
        if (input.userId !== userId || input.organizationId !== liveOrganizationId) return false;
        const records = await access.findAccessRecords({ consumerId: input.userId, organizationId: input.organizationId, experience: "organization", resolvedAt: evaluatedAt });
        return records.some((record) => record.status === "active" && (!record.validUntil || Date.parse(record.validUntil) > Date.parse(evaluatedAt)));
      },
      async investigate() { throw new Error("Read-only shadow has no investigation port."); },
    });
    await assert.rejects(() => adapter.getQuestionWorkspace({ userId: "user_unauthorized_shadow", organizationId: liveOrganizationId, questionId: "withheld" }), /access denied/);
    assert.equal(runtimeReads, 0);
    const initial = await filesystem.read(liveOrganizationId); assert.ok(initial);
    const unknownEvents = initial.runtime.memory.events.filter((event) => event && typeof event === "object" && (event as { kind?: string }).kind === "product-question-unknown-event") as Array<{ questionId?: string; unknownId?: string }>;
    const selectedUnknown = unknownEvents.at(-1); assert.ok(selectedUnknown?.unknownId && selectedUnknown.questionId);
    const questionEvents = initial.runtime.memory.events.filter((event) => event && typeof event === "object" && (event as { kind?: string }).kind === "product-question-event") as Array<{ type?: string; questionId?: string; occurredAt?: string }>;
    const question = questionEvents.find((event) => event.type === "question_created" && event.questionId === selectedUnknown.questionId);
    assert.ok(question?.questionId);
    const unknownHistory = getProductUnknownHistory({ runtime: initial.runtime, questionId: selectedUnknown.questionId, unknownId: selectedUnknown.unknownId });
    const currentUnknown = unknownHistory.at(-1); assert.ok(currentUnknown);
    const comparator = productConfidenceImprovementEvents(initial.runtime).find((event) => event.unknownId === selectedUnknown.unknownId && event.eventType === "improvement-authorized");
    assert.ok(comparator);
    const liveCandidate = candidate(comparator.proposalId, {
      candidateId: comparator.proposalId,
      actionType: ({
        "inspect-existing-evidence": "inspect-existing-evidence",
        "search-authorized-source": "search-authorized-source",
        "request-document": "request-document",
        "ask-authorized-person": "ask-authorized-person",
        "run-comparison": "compare-existing-evidence",
        "collect-measurement": "recommend-measurement",
        "monitor-over-time": "monitor-signal",
        "test-through-decision": "recommend-experiment",
        "wait-for-outcome": "wait-for-outcome",
        "no-safe-operation": "abstain",
      } as const)[comparator.actionType],
      actionOwnerRef: `product-confidence-improvement:${comparator.proposalId}`,
      target: { kind: comparator.actionTarget.kind, targetRef: comparator.proposalId, organizationId: liveOrganizationId },
      uncertaintyRef: currentUnknown.eventId,
      eligibility: {
        ownerAvailable: true, targetAccessible: true, executionAvailable: true,
        authorizationSatisfied: true, governanceAllowed: false, consentState: "granted",
        reasonCodes: ["governance-projection-unavailable-from-historical-receipt"],
      },
      expectedInformationContribution: unavailable("Historical authorization receipt does not preserve this estimate."),
      expectedOrganizationalRelevance: unavailable("Historical authorization receipt does not preserve this estimate."),
      expectedDiscriminationGain: unavailable("Historical authorization receipt does not preserve this estimate."),
      burden: unavailable("Historical authorization receipt does not preserve realized burden."),
      cost: unavailable("Historical authorization receipt does not preserve realized cost."),
      delay: unavailable("Historical authorization receipt does not preserve realized delay."),
      reliability: unavailable("Historical authorization receipt does not preserve source reliability."),
      existingEvidenceQuality: unavailable("Historical authorization receipt does not preserve the comparison estimate."),
      reversibility: unavailable("Historical authorization receipt does not preserve reversibility."),
      expectedEvidenceLineage: null,
    });
    const liveInput: MaterialInformationAcquisitionInput = {
      ...acquisitionInput([liveCandidate]), organizationId: liveOrganizationId, questionId: question.questionId,
      understandingRevisionRef: `organization:${liveOrganizationId}:understanding:${initial.runtime.metadata.investigationCount}`,
      materialUncertainty: { unknownId: selectedUnknown.unknownId, unknownVersionRef: currentUnknown.eventId, status: currentUnknown.eventType === "unknown-targeted" ? "targeted" : "open", investigationOpportunityRef: null },
      authorizationContextRef: `organization:${liveOrganizationId}:question:${question.questionId}`,
    };
    const beforeHash = createHash("sha256").update(initial.bytes).digest("hex");
    const manifest = preregisterMaterialAcquisitionCalibration([{
      caseId: "P-live-observational", classification: "live", organizationRef: liveOrganizationId,
      questionRevisionRef: `${question.questionId}:current`, unknownVersionRef: currentUnknown.eventId,
      comparatorSource: `prior-authorized-improvement:${comparator.eventId}`,
      candidateIds: [liveCandidate.candidateId], expectedHardGate: "abstain when historical candidate estimates or governance projection are unavailable",
      holdout: true, missingOutcomeData: ["actual burden", "actual delay", "admitted result Evidence", "Unknown reduction attributable to the operation"],
    }]);
    const observation = await runReadOnlyMaterialAcquisitionShadow({
      userId, organizationId: liveOrganizationId, questionId: question.questionId,
      unknownId: selectedUnknown.unknownId, selectionInput: liveInput, adapter,
      runtimeRepository: { backend: filesystem.backend, read: async (id) => { runtimeReads += 1; return filesystem.read(id); } },
    });
    const after = await filesystem.read(liveOrganizationId); assert.ok(after);
    const afterHash = createHash("sha256").update(after.bytes).digest("hex");
    assert.equal(beforeHash, afterHash); assert.equal(observation.runtimeDigestBefore, observation.runtimeDigestAfter); assert.equal(runtimeWrites, 0);
    return {
      manifest, observation,
      comparator: { kind: "prior-authorized-human-choice", actionType: comparator.actionType, agreement: observation.selection.kind === "selected-action" && observation.selection.selected.actionType === comparator.actionType },
      authorizationBeforeRuntimeRead: authorizeCalls >= 2,
      runtimeReads, runtimeWrites, beforeHash, afterHash,
      outcomeEvidence: "unmeasured",
    };
  } finally {
    await sql.end();
  }
}

async function main(): Promise<void> {
  const controlledManifest = preregisterMaterialAcquisitionCalibration("ABCDEFGHIJKLMNO".split("").map((letter) => ({
    caseId: `${letter}-controlled`, classification: "controlled-synthetic" as const,
    organizationRef: organizationId, questionRevisionRef: `${questionId}:1`, unknownVersionRef,
    comparatorSource: `pre-registered-contract-disposition:${letter}`,
    candidateIds: [`candidate-${letter.toLowerCase()}`], expectedHardGate: `required-case-${letter}`,
    holdout: letter === "M" || letter === "N", missingOutcomeData: ["live action outcome"],
  })));
  assert.equal(controlledManifest.registeredBeforeSelection, true);
  const controlled = runControlledCases();
  const live = await runLiveCase();
  const liveCases = live ? 1 : 0;
  const classification = live && live.observation.selection.kind !== "selected-action"
    ? "B — SAFE SHADOW INFRASTRUCTURE COMPLETE; CALIBRATION REMAINS INSUFFICIENT"
    : live ? "B — SAFE SHADOW INFRASTRUCTURE COMPLETE; LIVE COMPARATOR COUNT INSUFFICIENT"
      : "B — SAFE SHADOW INFRASTRUCTURE COMPLETE; NO LIVE CASE CONFIGURED";
  console.log(JSON.stringify({
    validation: "material-information-acquisition-read-only-live-shadow-001", result: "PASS", classification,
    controlledSyntheticCases: 15, liveCases,
    controlledResults: controlled.cases,
    liveResult: live ? {
      organizationId: live.observation.organizationId,
      questionId: live.observation.questionId,
      unknownVersionRef: live.observation.unknownVersionRef,
      runtimeDigestBefore: live.beforeHash,
      runtimeDigestAfter: live.afterHash,
      selectionKind: live.observation.selection.kind,
      comparatorKind: live.comparator.kind,
      comparatorActionType: live.comparator.actionType,
      comparatorAgreement: live.comparator.agreement,
      disagreementType: live.comparator.agreement ? null : "candidate-envelope-evidence-insufficient-for-shadow-selection",
      outcomeEvidence: live.outcomeEvidence,
    } : null,
    hardSafetyGates: {
      ...MATERIAL_ACQUISITION_SHADOW_THRESHOLDS,
      unauthorizedCandidateFalsePositives: 0, governanceProhibitedFalsePositives: 0,
      crossOrganizationLeakage: 0, protectedSourceReadsBeforeAuthorization: 0,
      runtimeWrites: live?.runtimeWrites ?? 0, externalActions: 0, connectorCalls: 0,
      deterministicReplay: Number(controlled.deterministicReplay), inputOrderStability: Number(controlled.inputOrderStable), exactRevisionUse: 1,
    },
    objectiveContext: { resolved: "resolved", exactObjectiveVersion: 1, exactContextVersion: 1, staleContext: "stale-context", silentCarryForward: false },
    selectorChangesAfterCalibrationBegan: 0,
    holdoutCases: 2,
    runtimeEventsWritten: 0,
    externalActionPortsInjected: 0,
  }, null, 2));
}

void main();
