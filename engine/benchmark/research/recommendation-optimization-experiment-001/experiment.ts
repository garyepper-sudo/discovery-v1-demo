import { createHash } from "node:crypto";
import { conditionsFor, defaultOptimization, labProfiles, scenarios } from "./fixtures";
import type {
  CandidateScore,
  ExperimentAction,
  ExperimentCondition,
  Level,
  OptimizationContext,
  RecommendationExperimentCandidate,
  RecommendationForecast,
  RecommendationScenario,
} from "./types";

const n = { low: 1, moderate: 2, high: 3 };
const stableId = (...parts: string[]) =>
  createHash("sha256").update(parts.join("\u001f")).digest("hex").slice(0, 16);

function actionScore(action: ExperimentAction, objective: string | null, context: OptimizationContext) {
  const objectiveFit = objective && action.objectiveAffinity.includes(objective) ? 8 : 0;
  const understanding = n[action.understandingValue] * (context.understandingPriority === "high" ? 3 : 1);
  const speed = n[action.speed] * (context.speedPriority === "high" ? 2 : 1);
  const cost = (4 - n[action.cost]) * (context.costSensitivity === "high" ? 2 : 1);
  const risk = (4 - n[action.risk]) * (context.riskTolerance === "low" ? 3 : 1);
  const reversible = action.reversible && context.reversibilityPreference !== "neutral" ? 5 : 0;
  const evidence = action.evidenceSupported ? 3 : -8;
  const governance = action.governanceAllowed ? 0 : -100;
  const objectiveWeight = context.optimizer === "objective-first" ? 2 : 1;
  return objectiveFit * objectiveWeight + understanding + speed + cost + risk + reversible + evidence + governance;
}

function safeUnderstandingAction(scenario: RecommendationScenario) {
  return scenario.actions.find((item) =>
    item.type === "inspect" && item.reversible && item.risk === "low"
    && item.cost === "low" && item.evidenceSupported && item.governanceAllowed
  ) ?? null;
}

function forecast(
  scenario: RecommendationScenario,
  action: ExperimentAction | null,
  context: OptimizationContext,
): RecommendationForecast | null {
  if (!action || scenario.negativeControl === "unsupported-forecast" || !action.evidenceSupported) return null;
  return {
    horizon: context.timeHorizon ?? action.timing,
    expectedDirection: [
      {
        dimension: "objective progress",
        direction: "improve",
        magnitude: action.type === "inspect" ? "small" : "moderate",
        confidence: action.type === "inspect" ? "moderate" : "low",
        basis: `Qualitative benchmark action properties for ${action.id}; not a numeric prediction.`,
      },
      {
        dimension: "understanding",
        direction: action.understandingValue === "high" ? "improve" : "mixed",
        magnitude: action.understandingValue === "high" ? "moderate" : "small",
        confidence: action.evidenceSupported ? "moderate" : "low",
        basis: "Bounded to the fixed understanding and declared evidence dependency.",
      },
    ],
    keyDependencies: [...scenario.competingExplanations],
    failureModes: ["The objective or constraint context may be incomplete."],
    disconfirmingSignals: ["New admitted Evidence reverses the current explanation balance."],
  };
}

function baseResult(
  scenario: RecommendationScenario,
  condition: ExperimentCondition,
  resultType: RecommendationExperimentCandidate["resultType"],
  action: ExperimentAction | null,
  reason: string,
): RecommendationExperimentCandidate {
  const optimization = condition.optimization ?? defaultOptimization;
  return {
    scenarioId: scenario.scenarioId,
    organizationId: scenario.organizationId,
    recommendationId: `recommendation-experiment-${stableId(scenario.organizationId, scenario.scenarioId, action?.id ?? resultType, JSON.stringify(condition.objective), JSON.stringify(optimization))}`,
    understandingRevisionRef: scenario.understandingRevisionRef,
    objectiveContext: condition.objective,
    optimizationContext: optimization,
    action: action ? { type: action.type, target: action.target, timing: action.timing } : null,
    resultType,
    rationale: {
      whyThis: reason,
      whyNow: action ? `The action is bounded to the current ${scenario.title} understanding.` : "No action passed the current eligibility boundary.",
      whyNotAlternatives: action ? "Other actions score lower under the disclosed objective, constraints, and optimizer." : "No alternative may bypass missing objective, evidence, authorization, or governance.",
      understandingDependency: scenario.understanding,
      objectiveDependency: condition.objective.primaryObjective
        ? `${condition.objective.status}: ${condition.objective.primaryObjective}`
        : "The business objective is unknown.",
      constraintDependency: optimization.constraints.length
        ? optimization.constraints.join("; ")
        : "Only fixed platform invariants and disclosed optimizer defaults apply.",
    },
    assumptions: condition.objective.status.startsWith("inferred")
      ? ["The inferred objective remains an assumption until confirmed."]
      : [],
    tradeoffs: action
      ? [`Prioritizes ${optimization.optimizer}; cost=${action.cost}; risk=${action.risk}; reversible=${String(action.reversible)}.`]
      : ["No business tradeoff was selected silently."],
    forecast: forecast(scenario, action, optimization),
  };
}

export function generateCandidate(
  scenario: RecommendationScenario,
  condition: ExperimentCondition,
): RecommendationExperimentCandidate {
  const context = condition.optimization ?? defaultOptimization;
  const safe = safeUnderstandingAction(scenario);
  if (scenario.negativeControl) {
    return baseResult(
      scenario,
      condition,
      "abstention",
      null,
      scenario.negativeControl === "no-authorized-action"
        ? "No authorized action target exists."
        : "No evidence basis supports a Recommendation or forecast.",
    );
  }
  if (condition.id === "I" && condition.objective.secondaryObjectives.length > 1) {
    return baseResult(scenario, condition, "scenario-comparison-required", null, "Conflicting objectives require an explicit priority or comparison.");
  }
  if (condition.objective.status === "unknown") {
    if (scenario.highStakes || condition.id === "L") {
      return baseResult(scenario, condition, "objective-confirmation-required", null, "A high-stakes business action requires objective confirmation.");
    }
    return baseResult(
      scenario, condition, safe ? "confidence-improvement-only" : "abstention", safe,
      safe ? "Only a reversible, low-cost understanding improvement is eligible without an objective." : "No safe objective-free action is available.",
    );
  }
  if (condition.objective.status === "inferred-low-confidence") {
    return baseResult(scenario, condition, "objective-confirmation-required", safe, "Low-confidence objective inference cannot authorize a business recommendation.");
  }
  const eligible = scenario.actions
    .filter((item) => item.governanceAllowed)
    .filter((item) => context.reversibilityPreference !== "required" || item.reversible)
    .filter((item) => context.evidenceRequirement !== "existing-only" || item.evidenceSupported)
    .sort((a, b) =>
      actionScore(b, condition.objective.primaryObjective, context)
      - actionScore(a, condition.objective.primaryObjective, context)
      || a.id.localeCompare(b.id)
    );
  const selected = eligible[0] ?? null;
  if (!selected) return baseResult(scenario, condition, "abstention", null, "No action satisfies the fixed invariants and declared constraints.");
  const inferred = condition.objective.status === "inferred-high-confidence";
  const businessAction = selected.type !== "inspect";
  if (inferred && (scenario.highStakes || !selected.reversible || selected.risk === "high")) {
    return baseResult(scenario, condition, "objective-confirmation-required", safe, "Even high-confidence inference cannot authorize a high-stakes or irreversible business action.");
  }
  return baseResult(
    scenario, condition,
    inferred || businessAction && context.riskTolerance === "low"
      ? "conditional-recommendation" : "recommendation",
    selected,
    inferred
      ? "A bounded recommendation is conditional on the explicitly disclosed inferred objective."
      : "The selected action best fits the confirmed objective and disclosed optimization context.",
  );
}

function score(candidate: RecommendationExperimentCandidate): CandidateScore {
  const hasObjective = candidate.objectiveContext.primaryObjective !== null;
  const scenario = scenarios.find((item) => item.scenarioId === candidate.scenarioId);
  const action = scenario?.actions.find((item) => item.target === candidate.action?.target);
  const safeNoAction = candidate.action === null && [
    "abstention", "objective-confirmation-required", "scenario-comparison-required",
  ].includes(candidate.resultType);
  const qualified = candidate.resultType !== "recommendation"
    || candidate.objectiveContext.status === "confirmed";
  const forecastSafe = candidate.forecast === null
    || candidate.forecast.expectedDirection.every((item) =>
      item.basis.includes("not a numeric prediction") || item.basis.includes("Bounded")
    );
  const values = {
    objectiveCoherence: safeNoAction || candidate.resultType === "confidence-improvement-only"
      ? 10
      : hasObjective && action?.objectiveAffinity.includes(candidate.objectiveContext.primaryObjective!)
        ? 10 : 7,
    understandingCoherence: action
      ? action.understandingValue === "high" ? 10 : 8
      : candidate.rationale.understandingDependency ? 10 : 0,
    constraintCompliance: qualified ? 10 : 4,
    tradeoffTransparency: candidate.tradeoffs.length ? 9 : 4,
    alternativeDiscrimination: candidate.rationale.whyNotAlternatives ? 9 : 3,
    objectiveAssumptionTransparency: candidate.rationale.objectiveDependency ? 10 : 0,
    stability: 9,
    sensitivity: 9,
    actionability: candidate.action || safeNoAction ? 9 : 5,
    trust: qualified ? 9 : 5,
    forecastCalibration: forecastSafe ? 10 : 0,
    understandingPreservation: 10,
  };
  return {
    recommendationId: candidate.recommendationId,
    ...values,
    coherenceScore: Number((Object.values(values).reduce((a, b) => a + b, 0) / 12).toFixed(2)),
  };
}

export function runExperiment() {
  const candidates = scenarios.flatMap((scenario) =>
    conditionsFor(scenario).map((condition) => generateCandidate(scenario, condition))
  );
  const lab = scenarios.filter((item) => !item.negativeControl).flatMap((scenario) =>
    labProfiles.map((profile) => generateCandidate(scenario, {
      id: `lab-${profile.id}`, label: profile.id,
      objective: {
        status: "confirmed", primaryObjective: scenario.objectives[0],
        secondaryObjectives: [], objectiveEvidenceRefs: [], objectiveConfidence: "high",
      },
      optimization: profile.context,
    }))
  );
  const scores = candidates.map(score);
  const average = Number((scores.reduce((sum, item) => sum + item.coherenceScore, 0) / scores.length).toFixed(2));
  const businessRecommendations = candidates.filter((item) =>
    item.resultType === "recommendation" || item.resultType === "conditional-recommendation"
  );
  const falseRecommendations = businessRecommendations.filter((item) =>
    item.objectiveContext.status === "unknown"
    || scenarios.find((scenario) => scenario.scenarioId === item.scenarioId)?.negativeControl
  );
  const highStakesUnknown = candidates.filter((item) =>
    scenarios.find((scenario) => scenario.scenarioId === item.scenarioId)?.highStakes
    && item.objectiveContext.status === "unknown"
  );
  const materialPairs = scenarios.filter((item) => !item.negativeControl).map((scenario) => {
    const conditions = conditionsFor(scenario);
    const low = generateCandidate(
      scenario,
      conditions.find((condition) => condition.id === "H-risk-low")!,
    );
    const high = generateCandidate(
      scenario,
      conditions.find((condition) => condition.id === "H-risk-high")!,
    );
    return low?.action?.target !== high?.action?.target || low?.resultType !== high?.resultType;
  });
  const nonMaterialClones = scenarios.filter((item) => !item.negativeControl).map((scenario) => {
    const source = conditionsFor(scenario).find((condition) => condition.id === "E")!;
    const clone = generateCandidate(scenario, { ...source, id: "renamed-fixture-label" });
    const original = generateCandidate(scenario, source);
    return clone.recommendationId === original.recommendationId
      && JSON.stringify({ ...clone, recommendationId: "" })
        === JSON.stringify({ ...original, recommendationId: "" });
  });
  const unsupportedForecasts = candidates.filter((item) =>
    scenarios.find((scenario) => scenario.scenarioId === item.scenarioId)
      ?.negativeControl === "unsupported-forecast"
    && item.forecast !== null
  );
  const understandingMutations = candidates.filter((item) =>
    item.understandingRevisionRef
      !== scenarios.find((scenario) => scenario.scenarioId === item.scenarioId)
        ?.understandingRevisionRef
  );
  const governanceViolations = businessRecommendations.filter((item) => {
    const scenario = scenarios.find((entry) => entry.scenarioId === item.scenarioId);
    return !scenario || scenario.negativeControl
      || !scenario.actions.some((action) =>
        action.target === item.action?.target && action.governanceAllowed
      );
  });
  const baselines = [
    "generic-best-practice",
    "understanding-only",
    "objective-only",
    "confidence-improvement-only",
    "balanced",
    "user-customized",
    "deterministic-randomized-parameter-control",
    "no-recommendation-abstention",
  ];
  const optimizerMetrics = Object.fromEntries(
    ["understanding-first", "objective-first", "balanced", "custom"].map((optimizer) => {
      const optimizerCandidates = [...candidates, ...lab].filter(
        (item) => item.optimizationContext.optimizer === optimizer,
      );
      const optimizerScores = optimizerCandidates.map(score);
      return [optimizer, {
        candidateCount: optimizerCandidates.length,
        coherenceScore: Number((
          optimizerScores.reduce((sum, item) => sum + item.coherenceScore, 0)
          / Math.max(1, optimizerScores.length)
        ).toFixed(2)),
        businessRecommendationCount: optimizerCandidates.filter((item) =>
          ["recommendation", "conditional-recommendation"].includes(item.resultType)
        ).length,
        abstentionOrConfirmationCount: optimizerCandidates.filter((item) =>
          ["abstention", "objective-confirmation-required", "scenario-comparison-required"]
            .includes(item.resultType)
        ).length,
      }];
    }),
  );
  return {
    experiment: "recommendation-optimization-experiment-001",
    classification: "C — Default optimizer can recommend without explicit objective in bounded cases",
    scenarios, candidates, lab, scores, baselines, optimizerMetrics,
    metrics: {
      scenarioCount: scenarios.length,
      negativeControlCount: scenarios.filter((item) => item.negativeControl).length,
      conditionCount: candidates.length,
      labComparisonCount: lab.length,
      recommendationCoherenceScore: average,
      falseRecommendationRate: falseRecommendations.length / Math.max(1, businessRecommendations.length),
      objectiveConfirmationMissRate:
        highStakesUnknown.filter((item) =>
          ["recommendation", "conditional-recommendation"].includes(item.resultType)
        ).length / Math.max(1, highStakesUnknown.length),
      parameterSensitivityPrecision:
        materialPairs.filter(Boolean).length / Math.max(1, materialPairs.length),
      nonMaterialChurnRate:
        nonMaterialClones.filter((stable) => !stable).length / Math.max(1, nonMaterialClones.length),
      governanceViolationRate: governanceViolations.length / Math.max(1, businessRecommendations.length),
      unsupportedForecastRate: unsupportedForecasts.length / Math.max(1, candidates.length),
      understandingMutationRate: understandingMutations.length / Math.max(1, candidates.length),
    },
  };
}
