import type {
  EvolutionExpectationResult,
  EvolutionFailure,
  EvolutionModelObject,
  EvolutionScorecard,
  ExpectedEvolution,
  OperatingModelEvolutionEvaluation,
  OperatingModelSnapshot,
  OrganizationTimeline,
} from "./contracts";

const scopeRank = {
  individual: 0,
  team: 1,
  department: 2,
  "business-unit": 3,
  "cross-functional": 4,
  organization: 5,
  enterprise: 6,
} as const;

function objects(snapshot: OperatingModelSnapshot): EvolutionModelObject[] {
  return [
    ...snapshot.entities,
    ...snapshot.beliefs,
    ...snapshot.conditions,
    ...snapshot.mechanisms,
    ...snapshot.concepts,
  ];
}

function findObject(snapshot: OperatingModelSnapshot, id: string) {
  return objects(snapshot).find((object) => object.id === id);
}

function evaluateExpectation(params: {
  expectation: ExpectedEvolution;
  eventId: string;
  before: OperatingModelSnapshot;
  after: OperatingModelSnapshot;
}): EvolutionExpectationResult {
  const { expectation, eventId, before, after } = params;
  const previous = findObject(before, expectation.targetId);
  const current = findObject(after, expectation.targetId);
  const previousRecommendation = before.recommendation;
  const currentRecommendation = after.recommendation;
  let passed = false;

  switch (expectation.type) {
    case "belief-strengthened":
    case "mechanism-confidence-increased":
    case "confidence-increased":
      passed = Boolean(previous && current && current.confidence > previous.confidence);
      break;
    case "belief-weakened":
    case "mechanism-confidence-decreased":
    case "confidence-decreased":
      passed = Boolean(previous && current && current.confidence < previous.confidence);
      break;
    case "belief-preserved":
      passed = Boolean(previous && current && previous.label === current.label && previous.confidence === current.confidence);
      break;
    case "condition-resolved":
      passed = Boolean(previous && current?.status === "resolved");
      break;
    case "condition-emerged":
      passed = Boolean(!previous && current);
      break;
    case "recommendation-evolved":
      passed = Boolean(previousRecommendation && currentRecommendation && currentRecommendation.strategy !== previousRecommendation.strategy && currentRecommendation.reasonEventIds.includes(eventId));
      break;
    case "recommendation-preserved":
      passed = Boolean(previousRecommendation && currentRecommendation && previousRecommendation.id === currentRecommendation.id && previousRecommendation.strategy === currentRecommendation.strategy && previousRecommendation.scope === currentRecommendation.scope);
      break;
    case "identity-preserved":
      passed = Boolean(previous && current && previous.id === current.id);
      break;
    case "decision-learning-recorded":
      passed = after.decisionLearning.some((record) => record.decisionId === expectation.targetId && record.outcomeEventIds.includes(eventId));
      break;
    case "scope-preserved":
      passed = Boolean(previous && current && previous.scope === current.scope && (!expectation.expectedScope || current.scope === expectation.expectedScope));
      break;
    case "scope-narrowed":
      passed = Boolean(previous && current && scopeRank[current.scope] < scopeRank[previous.scope]);
      break;
    case "scope-broadened":
      passed = Boolean(previous && current && scopeRank[current.scope] > scopeRank[previous.scope]);
      break;
    case "historical-truth-preserved":
      passed = after.historicalTruths.some((truth) => truth.objectId === expectation.targetId);
      break;
  }

  return {
    expectationId: expectation.id,
    eventId,
    passed,
    explanation: `${expectation.type} for ${expectation.targetId}: ${passed ? "observed" : "not observed"}`,
  };
}

function score(passed: number, total: number, rationale: string, evidence: string[]) {
  const value = total === 0 ? 5 : Math.round((passed / total) * 5);
  return { score: value, maxScore: 5 as const, passed: value >= 3, rationale, evidence };
}

function duplicateIds(snapshot: OperatingModelSnapshot): string[] {
  const seen = new Set<string>();
  return objects(snapshot).map((object) => object.id).filter((id) => seen.has(id) || !seen.add(id));
}

function stableConceptResults(timeline: OrganizationTimeline) {
  return timeline.steps.flatMap((step, index) => {
    const before = index === 0 ? timeline.initialSnapshot : timeline.steps[index - 1].snapshot;
    return step.event.expectedStableConceptIds.map((id) => {
      const previous = findObject(before, id);
      const current = findObject(step.snapshot, id);
      return { id, passed: Boolean(previous && current && previous.label === current.label) };
    });
  });
}

export function evaluateOperatingModelEvolution(
  timeline: OrganizationTimeline,
): OperatingModelEvolutionEvaluation {
  const expectationResults = timeline.steps.flatMap((step, index) => {
    const before = index === 0 ? timeline.initialSnapshot : timeline.steps[index - 1].snapshot;
    return step.event.expectedOrganizationalChanges.map((expectation) =>
      evaluateExpectation({ expectation, eventId: step.event.id, before, after: step.snapshot }),
    );
  });
  const stableResults = stableConceptResults(timeline);
  const snapshots = [timeline.initialSnapshot, ...timeline.steps.map((step) => step.snapshot)];
  const duplicates = snapshots.flatMap(duplicateIds);
  const invalidConfidence = snapshots.flatMap(objects).filter((object) => object.confidence < 0 || object.confidence > 1);
  const identityChecks = stableResults;
  const identityExpectationResults = expectationResults.filter((result) => {
    const expectation = timeline.steps.flatMap((step) => step.event.expectedOrganizationalChanges).find((item) => item.id === result.expectationId);
    return expectation?.type === "identity-preserved";
  });
  const scopeResults = expectationResults.filter((result) => {
    const expectation = timeline.steps.flatMap((step) => step.event.expectedOrganizationalChanges).find((item) => item.id === result.expectationId);
    return expectation?.type.startsWith("scope-");
  });
  const historicalResults = expectationResults.filter((result) => result.expectationId.includes("history"));
  const learningResults = expectationResults.filter((result) => !result.expectationId.includes("preserved"));
  const decisionEvents = timeline.steps.filter((step) => step.event.eventType === "decision");
  const outcomeEvents = timeline.steps.filter((step) => step.event.eventType === "outcome");
  const learnedDecisionIds = new Set(snapshots.flatMap((snapshot) => snapshot.decisionLearning.map((record) => record.decisionId)));
  const decisionLearningPassed = decisionEvents.filter((step) => learnedDecisionIds.has(step.event.eventType === "decision" ? step.event.decision.decisionId : "")).length;
  const recommendationResults = expectationResults.filter((result) => result.expectationId.includes("recommendation"));
  const decisionLearningResults = expectationResults.filter((result) => {
    const expectation = timeline.steps.flatMap((step) => step.event.expectedOrganizationalChanges).find((item) => item.id === result.expectationId);
    return expectation?.type === "decision-learning-recorded";
  });

  const scorecard: EvolutionScorecard = {
    learning: score(learningResults.filter((result) => result.passed).length, learningResults.length, "New evidence and outcomes should update the expected model objects.", learningResults.map((result) => result.explanation)),
    stability: score(stableResults.filter((result) => result.passed).length, stableResults.length, "Unrelated stable concepts should retain semantic identity.", stableResults.map((result) => `${result.id}: ${result.passed}`)),
    coherence: score(duplicates.length + invalidConfidence.length === 0 ? snapshots.length : 0, snapshots.length, "Snapshots should contain unique identities and bounded confidence.", [...duplicates, ...invalidConfidence.map((object) => object.id)]),
    identityContinuity: score(identityChecks.filter((result) => result.passed).length + identityExpectationResults.filter((result) => result.passed).length, identityChecks.length + identityExpectationResults.length, "Stable entities, mechanisms, conditions, and concepts should retain identity.", [...identityChecks.map((result) => result.id), ...identityExpectationResults.map((result) => result.explanation)]),
    scopePreservation: score(scopeResults.filter((result) => result.passed).length, scopeResults.length, "Localized organizational knowledge should retain its intended scope.", scopeResults.map((result) => result.explanation)),
    historicalTruth: score(historicalResults.filter((result) => result.passed).length, historicalResults.length, "Superseded beliefs should remain represented as historical truth.", historicalResults.map((result) => result.explanation)),
    decisionLearning: score(decisionLearningPassed + (outcomeEvents.length === 0 ? 0 : 1), decisionEvents.length + (outcomeEvents.length === 0 ? 0 : 1), "Completed decisions and observed outcomes should influence later model state.", [...learnedDecisionIds]),
    recommendationContinuity: score(recommendationResults.filter((result) => result.passed).length, recommendationResults.length, "Recommendation changes should be preserved or explained by declared events.", recommendationResults.map((result) => result.explanation)),
  };

  const failures: EvolutionFailure[] = [];
  const failureByDimension: Array<[keyof EvolutionScorecard, EvolutionFailure["type"], string]> = [
    ["learning", "failure-to-learn", "Operating Model evolution"],
    ["stability", "model-drift", "Operating Model continuity"],
    ["coherence", duplicates.length ? "duplicate-cognitive-objects" : "contradiction-persistence", "Operating Model coherence"],
    ["identityContinuity", "identity-fragmentation", "Cognitive identity continuity"],
    ["scopePreservation", "scope-expansion", "Organizational scope continuity"],
    ["historicalTruth", "historical-overwrite", "Historical memory"],
    ["decisionLearning", "failure-to-learn", "Decision learning"],
    ["recommendationContinuity", "unexplained-recommendation-drift", "Recommendation continuity"],
  ];
  const resultsByDimension: Partial<Record<keyof EvolutionScorecard, EvolutionExpectationResult[]>> = {
    learning: learningResults,
    identityContinuity: identityExpectationResults,
    scopePreservation: scopeResults,
    historicalTruth: historicalResults,
    decisionLearning: decisionLearningResults,
    recommendationContinuity: recommendationResults,
  };
  for (const [dimension, type, producerBoundary] of failureByDimension) {
    if (!scorecard[dimension].passed) {
      const failedExpectation = resultsByDimension[dimension]?.find((result) => !result.passed);
      const expectation = timeline.steps.flatMap((step) => step.event.expectedOrganizationalChanges).find((item) => item.id === failedExpectation?.expectationId);
      failures.push({ type, severity: dimension === "historicalTruth" || dimension === "identityContinuity" ? "high" : "medium", eventId: failedExpectation?.eventId ?? "timeline", objectIds: expectation ? [expectation.targetId] : scorecard[dimension].evidence, description: scorecard[dimension].rationale, producerBoundary });
    }
  }
  for (const result of expectationResults.filter((item) => !item.passed)) {
    const expectation = timeline.steps.flatMap((step) => step.event.expectedOrganizationalChanges).find((item) => item.id === result.expectationId);
    if (!expectation || !["belief-weakened", "mechanism-confidence-decreased", "confidence-decreased"].includes(expectation.type)) continue;
    failures.push({
      type: "confidence-stagnation",
      severity: "medium",
      eventId: result.eventId,
      objectIds: [expectation.targetId],
      description: expectation.rationale,
      producerBoundary: expectation.targetType === "belief" ? "Belief revision" : "Mechanism inference",
    });
  }
  if (failures.length === 0) failures.push({ type: "none", severity: "low", eventId: "timeline", objectIds: [], description: "All declared evolution invariants were preserved.", producerBoundary: "None" });

  const signaturePayload = { timelineId: timeline.id, expectationResults, scorecard, failures };
  return {
    timelineId: timeline.id,
    deterministicSignature: JSON.stringify(signaturePayload),
    expectationResults,
    scorecard,
    failures,
  };
}
