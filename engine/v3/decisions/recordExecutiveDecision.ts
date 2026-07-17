import type {
  ExecutiveDecisionCycle,
} from "./runExecutiveDecisionCycle";

import type {
  ExecutiveDecisionRecord,
  ExecutiveDecisionDisposition,
  ExecutiveDecisionExpectedOutcome,
  ExecutiveDecisionSuccessCriterion,
} from "./executiveDecisionRecord";

export type RecordExecutiveDecisionInput = {
  /**
   * Completed Discovery decision cycle being acted upon.
   */
  decisionCycle: ExecutiveDecisionCycle;

  /**
   * Client-generated identifier for this executive submission.
   *
   * Reusing the same value allows idempotent retries.
   */
  submissionId: string;

  /**
   * Strategy selected by the executive.
   *
   * This is the generated Intervention Option ID, not the
   * executable Organizational Intervention ID.
   *
   * Omit when the recommendation was rejected or deferred.
   */
  selectedOptionId?: string;

  /**
   * How the executive responded to Discovery's recommendation.
   */
  disposition: ExecutiveDecisionDisposition;

  /**
   * Final executive-readable decision.
   */
  decision: string;

  /**
   * Why the executive made the decision.
   */
  rationale: string;

  /**
   * Optional assumptions explicitly accepted by the executive.
   */
  acceptedAssumptions?: string[];

  /**
   * Optional risks explicitly accepted by the executive.
   */
  acceptedRisks?: string[];

  /**
   * Executive's own confidence in the final decision.
   */
  executiveConfidenceAtDecision?: number;

  /**
   * Optional expected outcomes.
   *
   * When omitted, they are inferred from the selected simulated future.
   */
  expectedOutcomes?: ExecutiveDecisionExpectedOutcome[];

  /**
   * Optional success criteria.
   *
   * When omitted, the optimization objective's targets are reused.
   */
  successCriteria?: ExecutiveDecisionSuccessCriterion[];

  /**
   * Person accountable for execution.
   */
  owner?: string;

  /**
   * Person authorizing the decision.
   */
  decisionMaker?: string;

  /**
   * Optional review timestamp.
   */
  reviewAt?: string;

  /**
   * Deterministic decision timestamp.
   */
  decidedAt?: string;
};

function clampConfidence(
  value:
    number | undefined,
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  return Math.max(
    0,
    Math.min(1, value),
  );
}

function requireSelectedOption(
  decisionCycle:
    ExecutiveDecisionCycle,

  selectedOptionId:
    string | undefined,

  disposition:
    ExecutiveDecisionDisposition,
): void {
  const requiresSelection =
    disposition ===
      "accepted-recommendation" ||
    disposition ===
      "modified-recommendation" ||
    disposition ===
      "selected-alternative";

  if (
    requiresSelection &&
    !selectedOptionId
  ) {
    throw new Error(
      "Recording this executive decision requires a selected intervention option.",
    );
  }

  if (!selectedOptionId) {
    return;
  }

  const optionExists =
    decisionCycle.generatedOptions.some(
      (option) =>
        option.id ===
        selectedOptionId,
    );

  if (!optionExists) {
    throw new Error(
      `Selected intervention option "${selectedOptionId}" does not exist in the Executive Decision Cycle.`,
    );
  }
}

function resolveRecommendedOptionId(
  decisionCycle:
    ExecutiveDecisionCycle,
): string | undefined {
  const recommendedInterventionId =
    decisionCycle
      .recommendation
      .recommendedInterventionId;

  if (!recommendedInterventionId) {
    return undefined;
  }

  return decisionCycle
    .evaluatedOptions
    .find(
      (evaluation) =>
        evaluation.intervention.id ===
        recommendedInterventionId,
    )
    ?.option.id;
}

function requireDispositionConsistency(
  decisionCycle:
    ExecutiveDecisionCycle,

  selectedOptionId:
    string | undefined,

  disposition:
    ExecutiveDecisionDisposition,
): void {
  const recommendedOptionId =
    resolveRecommendedOptionId(
      decisionCycle,
    );

  if (
    disposition ===
      "accepted-recommendation" &&
    !recommendedOptionId
  ) {
    throw new Error(
      "Discovery's recommended intervention could not be mapped back to a generated intervention option.",
    );
  }

  if (
    disposition ===
      "accepted-recommendation" &&
    selectedOptionId !==
      recommendedOptionId
  ) {
    throw new Error(
      "Accepted recommendations must select Discovery's recommended intervention option.",
    );
  }

  if (
    disposition ===
      "selected-alternative" &&
    selectedOptionId ===
      recommendedOptionId
  ) {
    throw new Error(
      "An alternative decision must select an option other than Discovery's recommended intervention.",
    );
  }

  if (
    (
      disposition === "deferred" ||
      disposition === "rejected"
    ) &&
    selectedOptionId
  ) {
    throw new Error(
      "Deferred or rejected decisions must not select an intervention option.",
    );
  }
}

function resolveSelectedInterventionId(
  decisionCycle:
    ExecutiveDecisionCycle,

  selectedOptionId:
    string | undefined,
): string | undefined {
  if (!selectedOptionId) {
    return undefined;
  }

  return decisionCycle
    .evaluatedOptions
    .find(
      (evaluation) =>
        evaluation.option.id ===
        selectedOptionId,
    )
    ?.intervention.id;
}

function resolveSelectedScenarioId(
  decisionCycle:
    ExecutiveDecisionCycle,

  selectedOptionId:
    string | undefined,
): string | undefined {
  const selectedInterventionId =
    resolveSelectedInterventionId(
      decisionCycle,
      selectedOptionId,
    );

  if (!selectedInterventionId) {
    return undefined;
  }

  return decisionCycle
    .rankedScenarios
    .find(
      (scenario) =>
        scenario.interventionId ===
        selectedInterventionId,
    )
    ?.scenarioId;
}

function inferExpectedOutcomes(
  decisionCycle:
    ExecutiveDecisionCycle,

  selectedOptionId:
    string | undefined,
): ExecutiveDecisionExpectedOutcome[] {
  const selectedInterventionId =
    resolveSelectedInterventionId(
      decisionCycle,
      selectedOptionId,
    );

  if (
    !selectedOptionId ||
    !selectedInterventionId
  ) {
    return [];
  }

  const scenario =
    decisionCycle.scenarios.find(
      (candidate) =>
        candidate.intervention.id ===
        selectedInterventionId,
    );

  if (!scenario) {
    return [];
  }

  const comparison =
    scenario.comparison;

  return comparison.conditionChanges
    .filter(
      (change) =>
        change.change !== "unchanged",
    )
    .map(
      (change) => ({
        id:
          `${selectedOptionId}-${change.conditionId}`,

        description:
          `${change.name} is expected to ${change.change}.`,

        conditionIds: [
          change.conditionId,
        ],

        timeHorizon:
          scenario.intervention.timeHorizon,

        confidence:
          comparison.confidence,
      }),
    );
}

function inferSuccessCriteria(
  decisionCycle:
    ExecutiveDecisionCycle,
): ExecutiveDecisionSuccessCriterion[] {
  const optimizationTargets =
    decisionCycle
      .optimizationObjective
      .successTargets;

  if (
    optimizationTargets.length >
    0
  ) {
    return optimizationTargets.map(
      (target) => ({
        id:
          `${decisionCycle.executiveDecision.id}-${target.conditionId}`,

        name:
          target.name,

        conditionId:
          target.conditionId,

        baseline:
          target.baseline,

        target:
          target.target,

        unit:
          target.unit,

        rationale:
          target.rationale,
      }),
    );
  }

  return decisionCycle
    .executiveDecision
    .successMetrics
    .map(
      (metric, index) => ({
        id:
          `${decisionCycle.executiveDecision.id}-success-metric-${index + 1}`,

        name:
          metric.name,

        baseline:
          metric.baseline,

        target:
          metric.target,

        unit:
          metric.unit,

        rationale:
          metric.rationale,
      }),
    );
}

function resolveTitle(
  decisionCycle:
    ExecutiveDecisionCycle,

  selectedOptionId:
    string | undefined,

  disposition:
    ExecutiveDecisionDisposition,
): string {
  const selectedOption =
    decisionCycle.generatedOptions.find(
      (option) =>
        option.id ===
        selectedOptionId,
    );

  if (selectedOption) {
    return selectedOption.title;
  }

  if (disposition === "deferred") {
    return `Deferred: ${decisionCycle.executiveDecision.title}`;
  }

  if (disposition === "rejected") {
    return `Rejected: ${decisionCycle.executiveDecision.title}`;
  }

  return decisionCycle
    .executiveDecision
    .title;
}

export function recordExecutiveDecision({
  decisionCycle,
  submissionId,
  selectedOptionId,
  disposition,
  decision,
  rationale,
  acceptedAssumptions = [],
  acceptedRisks = [],
  executiveConfidenceAtDecision,
  expectedOutcomes,
  successCriteria,
  owner,
  decisionMaker,
  reviewAt,
  decidedAt =
    new Date().toISOString(),
}: RecordExecutiveDecisionInput): ExecutiveDecisionRecord {
  requireSelectedOption(
    decisionCycle,
    selectedOptionId,
    disposition,
  );

  requireDispositionConsistency(
    decisionCycle,
    selectedOptionId,
    disposition,
  );

  const recommendedOptionId =
    resolveRecommendedOptionId(
      decisionCycle,
    );

  const selectedScenarioId =
    resolveSelectedScenarioId(
      decisionCycle,
      selectedOptionId,
    );

  const resolvedExpectedOutcomes =
    expectedOutcomes ??
    inferExpectedOutcomes(
      decisionCycle,
      selectedOptionId,
    );

  const resolvedSuccessCriteria =
    successCriteria ??
    inferSuccessCriteria(
      decisionCycle,
    );

  const id =
    `executive-decision-record-${decisionCycle.executiveDecision.id}-${decidedAt}`;

  return {
    id,

    submissionId,

    organizationId:
      decisionCycle
        .executiveDecision
        .organizationId,

    executiveDecisionId:
      decisionCycle
        .executiveDecision
        .id,

    decisionCycleId:
      decisionCycle
        .executiveDecision
        .id,

    status:
      disposition === "deferred"
        ? "draft"
        : disposition === "rejected"
          ? "cancelled"
          : "decided",

    disposition,

    selectedOptionId,

    selectedScenarioId,

    recommendedOptionId,

    title:
      resolveTitle(
        decisionCycle,
        selectedOptionId,
        disposition,
      ),

    decision,

    rationale,

    acceptedAssumptions,

    acceptedRisks,

    discoveryConfidenceAtDecision:
      clampConfidence(
        decisionCycle
          .confidenceCalibration
          .calibratedConfidence,
      ),

    executiveConfidenceAtDecision:
      clampConfidence(
        executiveConfidenceAtDecision,
      ),

    expectedOutcomes:
      resolvedExpectedOutcomes,

    successCriteria:
      resolvedSuccessCriteria,

    owner,

    decisionMaker,

    decidedAt,

    reviewAt,

    createdAt:
      decidedAt,

    updatedAt:
      decidedAt,

    outcomeStatus:
      "not-reviewed",
  };
}
