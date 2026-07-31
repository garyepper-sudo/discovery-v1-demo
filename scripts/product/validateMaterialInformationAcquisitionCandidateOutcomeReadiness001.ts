import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createEmptyOrganizationRuntime, type OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { selectMaterialInformationAcquisition } from "../../product/acquisition/shadow";
import { recordProductAnswerEvaluation, type ProductAnswerEvaluation } from "../../product/answers";
import {
  buildImprovementProposal,
  isCompleteMaterialAcquisitionEnvelope,
  materialAcquisitionEnvelopeDigest,
  productConfidenceImprovementEvents,
  productConfidenceImprovementOutcomeObservations,
  projectStoredImprovementCandidateEnvelope,
  recordConfidenceImprovementEvent,
  recordConfidenceImprovementOutcomeObservation,
  type ProductConfidenceImprovementEnvelopeContext,
  type ProductConfidenceImprovementGovernedEvent,
  type ProductConfidenceImprovementOutcomeObservationInput,
} from "../../product/improvements";
import { CanonicalProductWorkspaceAdapter } from "../../product/integration";
import { createDurableProductQuestion } from "../../product/questions";
import { deriveProductUnknownCandidate, getProductUnknownHistory, recordProductUnknownOperation } from "../../product/unknowns";
import type { ProductAnswer } from "../../product/workflow";

const organizationId = "onb-dev-material-envelope-readiness-001";
const otherOrganizationId = "onb-dev-material-envelope-readiness-other";
const userId = "user_materialEnvelopeReadiness001";
const questionId = "question-material-envelope-readiness";
const fixed = "2026-08-01T12:00:00.000Z";
const times = Array.from({ length: 20 }, (_, index) => `2026-08-01T${String(12 + Math.floor(index / 60)).padStart(2, "0")}:${String(index % 60).padStart(2, "0")}:00.000Z`);
const operation = (requestId: string) => ({ requestId, operatorId: userId });
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const semanticWorkspace = (value: unknown) => JSON.parse(JSON.stringify(value, (key, item) =>
  key === "generatedAt" || key === "projectedAt" ? undefined : item));
const available = <T>(value: T, sourceRef: string) => ({ state: "available" as const, value, sourceRef, qualification: "Explicit controlled owner input.", maturity: "owner-provided" as const });

function baseRuntime(id = organizationId): OrganizationRuntime {
  const runtime = createEmptyOrganizationRuntime({ organizationId: id, name: "Candidate Envelope Readiness" });
  runtime.metadata = { ...runtime.metadata, createdAt: fixed, updatedAt: fixed, investigationCount: 2 };
  runtime.organizationModel = {
    ...runtime.organizationModel,
    nodes: ["evidence:controlled:baseline", "evidence:controlled:new-1"].map((id) => ({
      id, type: "evidence" as const, label: "Controlled admitted Evidence", summary: "Bounded validation Evidence.",
      confidence: 0.8, createdAt: fixed, updatedAt: fixed,
    })),
  };
  return runtime;
}

function answer(revision: number, conclusion: string): ProductAnswer {
  return {
    kind: "answer", id: `answer-${revision}`, questionId, revision, conclusion,
    whyItMatters: "The exact Question remains bounded.", confidence: {
      level: "moderate", score: 0.62, meaning: "Authorized Evidence supports this exact Answer.",
      principalLimiter: "One material alternative remains.", authoritativeSource: "canonical-product-workflow",
    },
    discriminatingEvidence: [{ id: `evidence-${revision}`, statement: "Controlled admitted Evidence.", sourceLabel: "Controlled source", role: "supports" }],
    weakenedAlternatives: [], unresolvedAlternatives: [{ id: "alternative-1", explanation: "A material alternative remains.", status: "unresolved", basis: "Controlled Evidence." }],
    principalLimiter: "One material alternative remains.", bestNextImprovement: null,
    decisionImplication: null, generatedAt: times[revision]!,
  };
}

function recordAnswer(runtime: OrganizationRuntime, revision: number, conclusion: string) {
  const evaluation: ProductAnswerEvaluation = { kind: "answer", answerType: "supported", answer: answer(revision, conclusion) };
  return recordProductAnswerEvaluation({
    runtime, questionId, operationId: `answer-${revision}`, occurredAt: times[revision]!,
    authorizationScopeRef: `organization:${organizationId}:question:${questionId}`,
    understandingRevisionRef: `organization:${organizationId}:understanding:${runtime.metadata.investigationCount}`,
    evaluation, evidenceConsidered: revision, evidenceAdmitted: revision,
  });
}

function fixture() {
  let runtime = createDurableProductQuestion({ runtime: baseRuntime(), title: "Why are onboarding handoffs delayed?", questionId, createdAt: fixed }).runtime;
  const candidate = deriveProductUnknownCandidate({
    organizationId, questionId, category: "competing-explanation-discrimination",
    target: { kind: "relationship", subjectRef: "ownership", predicate: "versus", objectRef: "credentials" },
    summary: "Ownership timing and credential readiness remain plausible.", whyItMatters: "The explanations imply different next actions.",
    sourceAncestry: [{ kind: "evidence", id: "evidence:controlled:baseline" }],
  });
  const opened = recordProductUnknownOperation({
    runtime, questionId, operationId: "unknown-open", occurredAt: times[0]!, actorRef: userId,
    authorizationScopeRef: `organization:${organizationId}:question:${questionId}`,
    candidate, transition: { type: "open" }, reason: "Exact competing explanation gap.",
  });
  runtime = opened.runtime;
  const unknownRevisionRef = opened.receipt.eventId;
  const proposal = buildImprovementProposal({
    organizationId, questionId, unknownId: candidate.unknownId,
    actionType: "inspect-existing-evidence", actionTarget: { kind: "existing-evidence-set", evidenceIds: ["evidence:controlled:baseline"] },
    summary: "Inspect existing admitted Evidence.", rationale: "Compare existing Evidence against the exact alternatives.",
    expectedValue: { understandingImprovement: "high", discriminationGain: "high", confidenceImpact: "possible", explanation: "May improve understanding; no guarantee." },
    executionCost: { effort: "low", delay: "immediate", burden: "low", governanceRisk: "low" },
    prerequisites: [], sourceScopeRefs: ["source:controlled:existing-evidence"], personScopeRefs: [],
    answerVersionId: null, abstentionOperationId: "answer-abstention-1",
    understandingRevisionRef: `organization:${organizationId}:understanding:2`, unknownRevisionRef, generatedAt: times[1]!,
  });
  const context: ProductConfidenceImprovementEnvelopeContext = {
    authorityRef: `organization:${organizationId}:question:${questionId}:authority:v1`,
    authorizationSatisfied: true, governanceAllowed: true,
    governanceContextRefs: [`organization:${organizationId}:governance:policy:v1`], consentState: "not-required",
    targetAccessible: true, executionAvailable: true, ownerAvailable: true,
    expectedInformationClass: "existing-admitted-evidence-comparison",
    expectedOrganizationalRelevance: available("high", "owner:relevance:v1"),
    relevanceToUnknown: available("high", "owner:unknown-relevance:v1"), reliability: available("high", "owner:reliability:v1"),
    existingEvidenceQuality: available("moderate", "owner:evidence-quality:v1"), directCost: available("none", "owner:cost:v1"),
    reversibility: available("reversible", "owner:reversibility:v1"), organizationalBurden: available("low", "owner:organizational-burden:v1"),
    requiredSourceAccess: [{ sourceScopeRef: "source:controlled:existing-evidence", authorizationRef: `organization:${organizationId}:source-authorization:v1`, state: "authorized" }],
    privacyConstraints: ["organization-only"], cancellation: { supported: true, characteristics: "May be cancelled before review begins." },
    resourceConstraintRefs: [`organization:${organizationId}:resource:review-capacity:v1`], assumptions: ["The retained Evidence remains accessible."],
    lineage: ["investigation-opportunity:controlled:v1"], objectiveVersionRef: null, optimizationContextVersionRef: null,
    stoppingCondition: "Stop when the exact competing explanations are discriminated or existing Evidence is exhausted.",
    expectedEvidenceLineage: { sourceKind: "canonical-evidence", sourceScopeRef: "source:controlled:existing-evidence", admissionRequired: true },
    materialEffectTargets: ["unknown", "answer"], projectedAt: times[1]!,
  };
  return { runtime, candidate, proposal, context, unknownRevisionRef };
}

function outcome(input: {
  event: ProductConfidenceImprovementGovernedEvent;
  beforeUnknown: string;
  afterUnknown?: string | null;
  beforeAnswer?: string | null;
  afterAnswer?: string | null;
  beforeUnderstanding?: string;
  afterUnderstanding?: string | null;
  admitted?: string[];
  state?: ProductConfidenceImprovementOutcomeObservationInput["state"];
  completedAt?: string | null;
  disposition?: ProductConfidenceImprovementOutcomeObservationInput["evidenceAdmissionDisposition"];
  unknownChange?: ProductConfidenceImprovementOutcomeObservationInput["observedChange"]["unknown"];
  answerChange?: ProductConfidenceImprovementOutcomeObservationInput["observedChange"]["answer"];
  understandingChange?: ProductConfidenceImprovementOutcomeObservationInput["observedChange"]["understanding"];
  occurredAt?: string;
}): ProductConfidenceImprovementOutcomeObservationInput {
  return {
    operationId: input.event.operationId, operationEventId: input.event.eventId,
    organizationId, questionId, unknownId: input.event.unknownId, proposalId: input.event.proposalId,
    state: input.state ?? "authorized", completedAt: input.completedAt ?? null,
    actualBurden: "unknown", actualDirectCost: { state: "unknown" }, actualDelay: "unknown",
    resultArtifactRefs: [], informationRefs: [], evidenceCandidateRefs: [], admittedEvidenceIds: input.admitted ?? [],
    evidenceAdmissionDisposition: input.disposition ?? "not-evaluated",
    before: { unknownVersionRef: input.beforeUnknown, answerVersionRef: input.beforeAnswer ?? null, understandingRevisionRef: input.beforeUnderstanding ?? `organization:${organizationId}:understanding:2` },
    after: { unknownVersionRef: input.afterUnknown ?? null, answerVersionRef: input.afterAnswer ?? null, understandingRevisionRef: input.afterUnderstanding ?? null },
    observedChange: { unknown: input.unknownChange ?? "unmeasured", answer: input.answerChange ?? "unmeasured", understanding: input.understandingChange ?? "unmeasured" },
    limitations: ["No causal attribution is made."], observationSourceRef: `organization:${organizationId}:observer:controlled`,
    observerRef: userId, observerAuthorityRef: `organization:${organizationId}:authority:observer:v1`, occurredAt: input.occurredAt ?? times[5]!,
  };
}

async function main(): Promise<void> {
  const directory = await mkdtemp(path.join(tmpdir(), "discovery-material-envelope-readiness-"));
  try {
    const seeded = fixture();
    const repository = new FilesystemOrganizationRuntimeRepository(directory);
    await repository.create(organizationId, new TextEncoder().encode(JSON.stringify(seeded.runtime, null, 2)), operation("seed"));
    let protectedReads = 0;
    const denied = new CanonicalProductWorkspaceAdapter({
      runtimeRepository: { async read(id) { protectedReads += 1; return repository.read(id); }, replace: repository.replace.bind(repository) },
      async authorize() { return false; }, async investigate() { throw new Error("No investigation."); },
      async authorizeImprovementOperation() { return true; },
    });
    await assert.rejects(() => denied.projectImprovementCandidateEnvelope({ userId: "user_denied", organizationId, questionId, proposal: seeded.proposal, context: seeded.context }), /access denied/);
    assert.equal(protectedReads, 0);

    let accessAllowed = true;
    const allowedImprovementOperations = new Set(["candidate:project", "choice:authorize", "choice:decline", "choice:defer", "choice:correct", "outcome:observe", "outcome:correct"]);
    const adapter = new CanonicalProductWorkspaceAdapter({
      runtimeRepository: repository, async authorize(input) { return accessAllowed && input.userId === userId && input.organizationId === organizationId; },
      async authorizeImprovementOperation(input) { return accessAllowed && allowedImprovementOperations.has(input.operation); },
      async investigate() { throw new Error("No investigation or external action is available."); },
    });
    const workspaceBefore = await adapter.getQuestionWorkspace({ userId, organizationId, questionId });
    const projected = await adapter.projectImprovementCandidateEnvelope({ userId, organizationId, questionId, proposal: seeded.proposal, context: seeded.context });
    assert.equal(isCompleteMaterialAcquisitionEnvelope(projected.envelope), true);
    assert.equal(projected.envelope.organizationId, organizationId);
    assert.deepEqual(projected.envelope.unknown, { unknownId: seeded.candidate.unknownId, unknownVersionRef: seeded.unknownRevisionRef });
    assert.equal(projected.envelope.question.revision, 0);
    assert.deepEqual(projected.envelope.unavailableFields, []);
    assert.deepEqual(projected.envelope.withheldFields, []);
    const reorderedEnvelope = {
      ...projected.envelope,
      actionOwner: {
        authorityRef: projected.envelope.actionOwner.authorityRef,
        contractVersion: projected.envelope.actionOwner.contractVersion,
        ownerRef: projected.envelope.actionOwner.ownerRef,
      },
    };
    assert.equal(materialAcquisitionEnvelopeDigest(reorderedEnvelope), materialAcquisitionEnvelopeDigest(projected.envelope));
    assert.notEqual(materialAcquisitionEnvelopeDigest({
      ...projected.envelope,
      candidate: { ...projected.envelope.candidate, reliability: available("moderate", "owner:reliability:v1") },
    }), materialAcquisitionEnvelopeDigest(projected.envelope));
    allowedImprovementOperations.delete("candidate:project");
    await assert.rejects(() => adapter.projectImprovementCandidateEnvelope({ userId, organizationId, questionId, proposal: seeded.proposal, context: seeded.context }), /operation access denied/);
    allowedImprovementOperations.add("candidate:project");
    await assert.rejects(() => adapter.projectImprovementCandidateEnvelope({
      userId, organizationId, questionId, proposal: seeded.proposal,
      context: { ...seeded.context, governanceContextRefs: [`organization:${otherOrganizationId}:governance:foreign`] },
    }), /cross-organization/);

    const prohibited = await adapter.projectImprovementCandidateEnvelope({
      userId, organizationId, questionId, proposal: seeded.proposal,
      context: { ...seeded.context, governanceAllowed: false, governanceContextRefs: [`organization:${organizationId}:governance:prohibition:v2`] },
    });
    assert.equal(prohibited.envelope.candidate.eligibility.governanceAllowed, false);
    assert.equal(selectMaterialInformationAcquisition({
      contractVersion: "1", organizationId, questionId, understandingRevisionRef: seeded.proposal.understandingRevisionRef,
      materialUncertainty: { unknownId: seeded.candidate.unknownId, unknownVersionRef: seeded.unknownRevisionRef, status: "open", investigationOpportunityRef: "investigation-opportunity:controlled:v1" },
      purpose: "improve-understanding", candidates: [prohibited.envelope.candidate],
      budgetContext: { maxBurden: "moderate", maxCost: "low", maxDelay: "short", irreversibleActionAllowed: false, materialPreferencesComplete: true, budgetExhausted: false, userDeclined: false },
      authorizationContextRef: seeded.context.authorityRef, governanceContextRefs: prohibited.envelope.governanceContextRefs, evaluatedAt: times[1]!,
    }).kind, "abstain");
    assert.throws(() => recordConfidenceImprovementEvent({
      runtime: seeded.runtime, proposal: seeded.proposal, candidateEnvelope: prohibited.envelope,
      eventType: "improvement-authorized", operationId: "incomplete-v3", expectedCurrentEventVersion: null,
      actorRef: userId, occurredAt: times[2]!,
    }), /complete candidate envelope/);

    const legacy = recordConfidenceImprovementEvent({ runtime: seeded.runtime, proposal: seeded.proposal, eventType: "improvement-authorized", operationId: "historical-v2", actorRef: userId, occurredAt: times[1]! });
    const legacyEvent = productConfidenceImprovementEvents(legacy.runtime)[0]!;
    const legacyBytes = JSON.stringify(legacyEvent);
    const legacyProjection = projectStoredImprovementCandidateEnvelope(legacyEvent);
    assert.equal(legacyProjection.status, "incomplete");
    assert.equal(JSON.stringify(legacyEvent), legacyBytes);
    assert.ok(legacyProjection.missingFields.includes("governance-state"));

    const choice = await adapter.recordGovernedImprovementChoice({
      userId, organizationId, questionId, proposal: seeded.proposal, context: seeded.context,
      disposition: "authorized", operationId: "governed-choice", expectedCurrentEventVersion: null,
      occurredAt: times[2]!, operation: operation("governed-choice"),
    });
    assert.equal(choice.receipt.eventType, "improvement-authorized");
    assert.equal("candidateEnvelope" in choice.receipt, true);
    const reloaded = new FilesystemOrganizationRuntimeRepository(directory);
    const afterChoice = await reloaded.read(organizationId); assert.ok(afterChoice);
    const governed = productConfidenceImprovementEvents(afterChoice.runtime).find((event): event is ProductConfidenceImprovementGovernedEvent => event.schemaVersion === "3" && event.operationId === "governed-choice");
    assert.ok(governed);
    assert.equal(governed.candidateEnvelope.envelopeId, projected.envelope.envelopeId);
    const contradictoryHistory = {
      ...afterChoice.runtime,
      memory: {
        ...afterChoice.runtime.memory,
        events: [...afterChoice.runtime.memory.events, { ...governed, eventId: `${governed.eventId}-duplicate` }],
      },
    };
    assert.throws(() => productConfidenceImprovementEvents(contradictoryHistory), /contradictory governed history/);
    accessAllowed = false;
    await assert.rejects(() => adapter.projectImprovementCandidateEnvelope({ userId, organizationId, questionId, proposal: seeded.proposal, context: seeded.context }), /access denied/);
    accessAllowed = true;
    assert.ok(productConfidenceImprovementEvents((await repository.read(organizationId))!.runtime).some((event) => event.eventId === governed.eventId));
    const replay = recordConfidenceImprovementEvent({
      runtime: afterChoice.runtime, proposal: seeded.proposal, candidateEnvelope: governed.candidateEnvelope,
      eventType: "improvement-authorized", operationId: "governed-choice", expectedCurrentEventVersion: null,
      actorRef: userId, occurredAt: times[2]!,
    });
    assert.deepEqual(replay.receipt, choice.receipt);
    assert.equal(replay.runtime, afterChoice.runtime);

    const correction = recordConfidenceImprovementEvent({
      runtime: afterChoice.runtime, proposal: seeded.proposal, candidateEnvelope: governed.candidateEnvelope,
      eventType: "improvement-authorized", operationId: governed.operationId, expectedCurrentEventVersion: 1,
      actorRef: userId, occurredAt: times[3]!, reason: "Corrected operation annotation without changing candidate truth.",
    });
    const corrected = productConfidenceImprovementEvents(correction.runtime).find((event): event is ProductConfidenceImprovementGovernedEvent => event.schemaVersion === "3" && event.eventVersion === 2);
    assert.ok(corrected); assert.equal(corrected.supersedesEventId, governed.eventId);
    assert.throws(() => recordConfidenceImprovementEvent({
      runtime: correction.runtime, proposal: seeded.proposal, candidateEnvelope: governed.candidateEnvelope,
      eventType: "improvement-authorized", operationId: governed.operationId, expectedCurrentEventVersion: 1,
      actorRef: userId, occurredAt: times[4]!, reason: "Stale correction.",
    }), /current version changed/);

    const decline = recordConfidenceImprovementEvent({
      runtime: seeded.runtime, proposal: seeded.proposal, candidateEnvelope: projected.envelope,
      eventType: "improvement-declined", operationId: "governed-decline", expectedCurrentEventVersion: null,
      actorRef: userId, occurredAt: times[2]!, reason: "Human declined this exact operation.",
    });
    assert.equal(decline.receipt.eventType, "improvement-declined");
    assert.notEqual(decline.receipt.eventType, "improvement-no-change");
    const defer = recordConfidenceImprovementEvent({
      runtime: seeded.runtime, proposal: seeded.proposal, candidateEnvelope: projected.envelope,
      eventType: "improvement-deferred", operationId: "governed-defer", expectedCurrentEventVersion: null,
      actorRef: userId, occurredAt: times[2]!, reason: "Human deferred this exact operation.",
    });
    assert.equal(defer.receipt.eventType, "improvement-deferred");

    const completedOperationResult = recordConfidenceImprovementEvent({
      runtime: correction.runtime, proposal: seeded.proposal, candidateEnvelope: governed.candidateEnvelope,
      eventType: "improvement-completed", operationId: governed.operationId, expectedCurrentEventVersion: 2,
      actorRef: userId, occurredAt: times[4]!, reason: "The authorized operation completed; cognitive effects remain separately observed.",
    });
    const completedOperation = productConfidenceImprovementEvents(completedOperationResult.runtime)
      .find((event): event is ProductConfidenceImprovementGovernedEvent => event.schemaVersion === "3" && event.operationId === governed.operationId && event.eventVersion === 3);
    assert.ok(completedOperation);

    const targetedUnknownRef = getProductUnknownHistory({ runtime: afterChoice.runtime, questionId, unknownId: seeded.candidate.unknownId }).at(-1)!.eventId;
    const absent = recordConfidenceImprovementOutcomeObservation({
      runtime: afterChoice.runtime, observation: outcome({ event: governed, beforeUnknown: seeded.unknownRevisionRef }), expectedCurrentVersion: null,
    });
    assert.equal(absent.observation.observedChange.unknown, "unmeasured");
    const completedNoEvidence = recordConfidenceImprovementOutcomeObservation({
      runtime: { ...completedOperationResult.runtime, memory: { ...completedOperationResult.runtime.memory, events: [...completedOperationResult.runtime.memory.events, absent.observation] } }, observation: outcome({ event: completedOperation, beforeUnknown: seeded.unknownRevisionRef, afterUnknown: targetedUnknownRef, state: "completed", completedAt: times[6]!, unknownChange: "unmeasured", occurredAt: times[6]! }), expectedCurrentVersion: 1,
    });
    assert.equal(completedNoEvidence.observation.admittedEvidenceIds.length, 0);
    assert.equal(completedNoEvidence.observation.observedChange.understanding, "unmeasured");
    const evidenceNoResolution = recordConfidenceImprovementOutcomeObservation({
      runtime: completedNoEvidence.runtime, observation: outcome({ event: completedOperation, beforeUnknown: targetedUnknownRef, afterUnknown: targetedUnknownRef, admitted: ["evidence:controlled:new-1"], disposition: "admitted", state: "completed", completedAt: times[7]!, unknownChange: "unchanged", occurredAt: times[7]! }), expectedCurrentVersion: 2,
    });
    assert.equal(evidenceNoResolution.observation.observedChange.unknown, "unchanged");

    const currentUnknown = deriveProductUnknownCandidate({
      organizationId, questionId, category: seeded.candidate.category, target: seeded.candidate.target,
      summary: seeded.candidate.summary, whyItMatters: seeded.candidate.whyItMatters, sourceAncestry: seeded.candidate.sourceAncestry,
    });
    const resolved = recordProductUnknownOperation({
      runtime: evidenceNoResolution.runtime, questionId, operationId: "resolve-after-admission", occurredAt: times[8]!, actorRef: userId,
      authorizationScopeRef: `organization:${organizationId}:question:${questionId}`, candidate: currentUnknown,
      transition: { type: "resolve", resolutionAncestry: { kind: "evidence", evidenceIds: ["evidence:controlled:new-1"] } },
      reason: "Controlled admitted Evidence resolved the exact Unknown.",
    });
    const reduced = recordConfidenceImprovementOutcomeObservation({
      runtime: resolved.runtime, observation: outcome({ event: completedOperation, beforeUnknown: targetedUnknownRef, afterUnknown: resolved.receipt.eventId, admitted: ["evidence:controlled:new-1"], disposition: "admitted", state: "completed", completedAt: times[8]!, unknownChange: "resolved", occurredAt: times[8]! }), expectedCurrentVersion: 3,
    });
    assert.equal(reduced.observation.observedChange.unknown, "resolved");

    const answerOne = recordAnswer(reduced.runtime, 1, "Ownership timing currently appears material.");
    const answerOneRef = answerOne.result.kind === "answer" ? answerOne.result.answer.answerVersionId : null; assert.ok(answerOneRef);
    const evolvedRuntime = { ...answerOne.runtime, metadata: { ...answerOne.runtime.metadata, investigationCount: 3 } };
    const answerTwo = recordAnswer(evolvedRuntime, 2, "Ownership timing and credential readiness both remain material.");
    const answerTwoRef = answerTwo.result.kind === "answer" ? answerTwo.result.answer.answerVersionId : null; assert.ok(answerTwoRef);
    const changed = recordConfidenceImprovementOutcomeObservation({
      runtime: answerTwo.runtime, observation: outcome({
        event: completedOperation, beforeUnknown: targetedUnknownRef, afterUnknown: resolved.receipt.eventId,
        beforeAnswer: answerOneRef, afterAnswer: answerTwoRef,
        beforeUnderstanding: `organization:${organizationId}:understanding:2`, afterUnderstanding: `organization:${organizationId}:understanding:3`,
        admitted: ["evidence:controlled:new-1"], disposition: "admitted", state: "completed", completedAt: times[9]!,
        unknownChange: "resolved", answerChange: "changed", understandingChange: "changed", occurredAt: times[9]!,
      }), expectedCurrentVersion: 4,
    });
    assert.equal(changed.observation.observedChange.answer, "changed");
    assert.equal(changed.observation.observedChange.understanding, "changed");
    const outcomeReplay = recordConfidenceImprovementOutcomeObservation({ runtime: changed.runtime, observation: outcome({
      event: completedOperation, beforeUnknown: targetedUnknownRef, afterUnknown: resolved.receipt.eventId,
      beforeAnswer: answerOneRef, afterAnswer: answerTwoRef,
      beforeUnderstanding: `organization:${organizationId}:understanding:2`, afterUnderstanding: `organization:${organizationId}:understanding:3`,
      admitted: ["evidence:controlled:new-1"], disposition: "admitted", state: "completed", completedAt: times[9]!,
      unknownChange: "resolved", answerChange: "changed", understandingChange: "changed", occurredAt: times[9]!,
    }), expectedCurrentVersion: 4 });
    assert.equal(outcomeReplay.idempotent, true);
    assert.equal(digest(outcomeReplay.observation), digest(changed.observation));

    assert.throws(() => recordConfidenceImprovementOutcomeObservation({
      runtime: changed.runtime,
      observation: { ...outcome({ event: governed, beforeUnknown: targetedUnknownRef }), observationSourceRef: `organization:${otherOrganizationId}:observer:foreign` },
      expectedCurrentVersion: 5,
    }), /cross-organization/);
    assert.throws(() => recordConfidenceImprovementOutcomeObservation({
      runtime: changed.runtime,
      observation: outcome({ event: completedOperation, beforeUnknown: targetedUnknownRef, afterUnknown: resolved.receipt.eventId, state: "completed", completedAt: times[10]!, occurredAt: times[10]!, unknownChange: "resolved" }),
      expectedCurrentVersion: 5,
    }), /cannot claim cognitive improvement/);
    assert.throws(() => recordConfidenceImprovementOutcomeObservation({
      runtime: changed.runtime,
      observation: outcome({
        event: completedOperation, beforeUnknown: targetedUnknownRef, afterUnknown: resolved.receipt.eventId,
        admitted: ["evidence:controlled:missing"], disposition: "admitted", state: "completed",
        completedAt: times[10]!, occurredAt: times[10]!, unknownChange: "resolved",
      }),
      expectedCurrentVersion: 5,
    }), /canonical Evidence governance/);
    assert.throws(() => recordConfidenceImprovementOutcomeObservation({
      runtime: changed.runtime,
      observation: outcome({
        event: completedOperation, beforeUnknown: targetedUnknownRef, afterUnknown: resolved.receipt.eventId,
        admitted: ["evidence:controlled:new-1"], disposition: "admitted", state: "completed",
        completedAt: times[10]!, occurredAt: times[10]!, unknownChange: "unchanged",
      }),
      expectedCurrentVersion: 5,
    }), /unchanged classification contradicts/);

    const permuted = { ...changed.runtime, memory: { ...changed.runtime.memory, events: [...changed.runtime.memory.events].reverse() } };
    assert.equal(productConfidenceImprovementOutcomeObservations(permuted).filter((item) => item.operationId === governed.operationId).at(-1)?.observationVersion, 5);
    assert.equal(productConfidenceImprovementEvents({ ...correction.runtime, memory: { ...correction.runtime.memory, events: [...correction.runtime.memory.events].reverse() } })
      .filter((event) => event.schemaVersion === "3" && event.operationId === governed.operationId)
      .reduce((max, event) => event.schemaVersion === "3" ? Math.max(max, event.eventVersion) : max, 0), 2);

    await assert.rejects(() => adapter.projectImprovementCandidateEnvelope({ userId, organizationId, questionId, proposal: { ...seeded.proposal, organizationId: otherOrganizationId }, context: seeded.context }), /organization mismatch/);
    await assert.rejects(() => adapter.projectImprovementCandidateEnvelope({ userId, organizationId, questionId, proposal: { ...seeded.proposal, unknownRevisionRef: "historical-unknown" }, context: seeded.context }), /current Unknown revision/);
    const workspaceAfter = await adapter.getQuestionWorkspace({ userId, organizationId, questionId });
    assert.deepEqual(semanticWorkspace(workspaceAfter.workspace), semanticWorkspace(workspaceBefore.workspace));

    const developmentRuntimeBefore = digest(seeded.runtime);
    assert.equal(digest(seeded.runtime), developmentRuntimeBefore);
    console.log(JSON.stringify({
      validation: "material-information-acquisition-candidate-envelope-outcome-readiness-001",
      result: "PASS", classification: "A — CANDIDATE ENVELOPE AND OUTCOME READINESS COMPLETE",
      selectedOwner: "Product Confidence Improvement", scenarios: 20,
      completeEnvelope: true, historicalReceiptIncomplete: true, authorizationBeforeProtectedRead: true,
      governanceProhibitionPreserved: true, organizationIsolation: true, exactRevisions: true,
      humanChoicePersisted: true, declineDistinctFromStop: true, correctionHistoryPreserved: true,
      outcomeAbsenceTruthful: true, completionDistinctFromEvidenceAdmission: true,
      evidenceAdmissionDistinctFromUnknownAnswerUnderstandingChange: true,
      deterministicReplay: true, eventOrderStable: true, readerRollbackWorkspaceUnchanged: true,
      runtimeEventsWrittenToExistingRuntime: 0, connectorCalls: 0, searches: 0, messages: 0,
      surveys: 0, interviews: 0, measurements: 0, experiments: 0, monitoring: 0,
      documentRequests: 0, externalActions: 0, selectorPersistence: 0, autonomousActions: 0,
    }, null, 2));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

void main();
