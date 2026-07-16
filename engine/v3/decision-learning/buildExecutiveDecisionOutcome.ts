import type {
  ExecutiveDecision,
} from "../model/simulate/executiveDecision";

import type {
  OrganizationalIntervention,
} from "../model/simulate/organizationalIntervention";

import type {
  OrganizationalCondition,
  OrganizationalState,
} from "../model/state/inferOrganizationalConditions";

import type {
  OrganizationalPrediction,
} from "../model/predictions/organizationalPrediction";

import type {
  ExecutiveDecisionOutcome,
} from "../model/decision-learning/executiveDecisionOutcome";

import type {
  ExecutiveScenarioResult,
} from "../scenarios/runExecutiveScenario";

export type DecisionAssumptionEvaluation = {
  assumption: string;

  status:
    | "validated"
    | "invalidated"
    | "unresolved";

  explanation?: string;
};

export type BuildExecutiveDecisionOutcomeInput = {
  executiveDecision:
    ExecutiveDecision;

  intervention:
    OrganizationalIntervention;

  expectedScenario:
    ExecutiveScenarioResult;

  observedOrganizationalState:
    OrganizationalState;

  observedConditions:
    OrganizationalCondition[];

  observedPredictions:
    OrganizationalPrediction[];

  executionStatus:
    ExecutiveDecisionOutcome["executionStatus"];

  assumptionEvaluations?:
    DecisionAssumptionEvaluation[];

  unexpectedEffects?:
    string[];

  evaluatedAt?: string;
};

type ObservedConditionChange =
  | "improved"
  | "worsened"
  | "unchanged";

const CONDITION_CHANGE_THRESHOLD =
  0.01;

function clamp01(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(1, value),
  );
}

function unique(
  values: string[],
): string[] {
  return Array.from(
    new Set(
      values
        .map((value) =>
          value.trim(),
        )
        .filter(Boolean),
    ),
  );
}

function conditionStatusScore(
  status:
    OrganizationalCondition["status"],
): number {
  switch (status) {
    case "stable":
      return 1;
    case "improving":
      return 0.9;
    case "emerging":
      return 0.65;
    case "unresolved":
      return 0.5;
    case "weak":
      return 0.4;
    case "constrained":
      return 0.25;
    case "deteriorating":
      return 0;
  }

    throw new Error(
    `Unsupported organizational condition status: ${status}`,
  );
}

function classifyObservedConditionChange(
  previousStrength: number,
  previousStatus:
    OrganizationalCondition["status"],
  observed:
    OrganizationalCondition,
): ObservedConditionChange {
  const strengthDelta =
    observed.strength -
    previousStrength;

  const statusDelta =
    conditionStatusScore(
      observed.status,
    ) -
    conditionStatusScore(
      previousStatus,
    );

  if (
    strengthDelta <=
      -CONDITION_CHANGE_THRESHOLD ||
    statusDelta > 0
  ) {
    return "improved";
  }

  if (
    strengthDelta >=
      CONDITION_CHANGE_THRESHOLD ||
    statusDelta < 0
  ) {
    return "worsened";
  }

  return "unchanged";
}

function evaluateObservedConditions(params: {
  expectedScenario:
    ExecutiveScenarioResult;

  observedConditions:
    OrganizationalCondition[];
}): {
  improvedConditionIds: string[];
  worsenedConditionIds: string[];
  unchangedConditionIds: string[];
  observedChangeByConditionId:
    Map<string, ObservedConditionChange>;
} {
  const observedById =
    new Map(
      params.observedConditions.map(
        (condition) => [
          condition.id,
          condition,
        ],
      ),
    );

  const observedChangeByConditionId =
    new Map<
      string,
      ObservedConditionChange
    >();

  for (
    const expectedChange of
    params.expectedScenario
      .comparison
      .conditionChanges
  ) {
    const observed =
      observedById.get(
        expectedChange.conditionId,
      );

    if (!observed) {
      continue;
    }

    observedChangeByConditionId.set(
      expectedChange.conditionId,
      classifyObservedConditionChange(
        expectedChange.previousStrength,
        expectedChange.previousStatus,
        observed,
      ),
    );
  }

  const entries =
    Array.from(
      observedChangeByConditionId,
    );

  return {
    improvedConditionIds:
      entries
        .filter(
          ([, change]) =>
            change ===
            "improved",
        )
        .map(
          ([conditionId]) =>
            conditionId,
        ),

    worsenedConditionIds:
      entries
        .filter(
          ([, change]) =>
            change ===
            "worsened",
        )
        .map(
          ([conditionId]) =>
            conditionId,
        ),

    unchangedConditionIds:
      entries
        .filter(
          ([, change]) =>
            change ===
            "unchanged",
        )
        .map(
          ([conditionId]) =>
            conditionId,
        ),

    observedChangeByConditionId,
  };
}

function evaluateSuccessMetrics(params: {
  executiveDecision:
    ExecutiveDecision;

  observedConditions:
    OrganizationalCondition[];

  observedChangeByConditionId:
    Map<string, ObservedConditionChange>;
}): {
  achievedSuccessMetrics: string[];
  missedSuccessMetrics: string[];
} {
  const observedById =
    new Map(
      params.observedConditions.map(
        (condition) => [
          condition.id,
          condition,
        ],
      ),
    );

  const achievedSuccessMetrics:
    string[] = [];

  const missedSuccessMetrics:
    string[] = [];

  for (
    const metric of
    params.executiveDecision
      .successMetrics
  ) {
    if (!metric.targetConditionId) {
      missedSuccessMetrics.push(
        metric.name,
      );
      continue;
    }

    const observed =
      observedById.get(
        metric.targetConditionId,
      );

    if (!observed) {
      missedSuccessMetrics.push(
        metric.name,
      );
      continue;
    }

    if (
      typeof metric.target ===
        "number" &&
      typeof metric.baseline ===
        "number"
    ) {
      const targetReached =
        metric.target >=
        metric.baseline
          ? observed.strength >=
            metric.target
          : observed.strength <=
            metric.target;

      (
        targetReached
          ? achievedSuccessMetrics
          : missedSuccessMetrics
      ).push(metric.name);

      continue;
    }

    const observedChange =
      params
        .observedChangeByConditionId
        .get(
          metric.targetConditionId,
        );

    (
      observedChange ===
        "improved"
        ? achievedSuccessMetrics
        : missedSuccessMetrics
    ).push(metric.name);
  }

  return {
    achievedSuccessMetrics:
      unique(
        achievedSuccessMetrics,
      ),

    missedSuccessMetrics:
      unique(
        missedSuccessMetrics,
      ),
  };
}

function predictionDirectionMatches(
  prediction:
    OrganizationalPrediction,

  observedConditions:
    Map<
      string,
      OrganizationalCondition
    >,

  observedChangeByConditionId:
    Map<string, ObservedConditionChange>,
): boolean {
  if (
    prediction
      .predictedConditionChanges
      .length === 0
  ) {
    return false;
  }

  return prediction
    .predictedConditionChanges
    .every((expectedChange) => {
      const observed =
        observedConditions.get(
          expectedChange.conditionId,
        );

      const observedChange =
        observedChangeByConditionId.get(
          expectedChange.conditionId,
        );

      if (
        !observed ||
        !observedChange
      ) {
        return false;
      }

      switch (
        expectedChange.direction
      ) {
        case "improving":
          return (
            observedChange ===
              "improved" ||
            observed.status ===
              "improving"
          );

        case "deteriorating":
          return (
            observedChange ===
              "worsened" ||
            observed.status ===
              "deteriorating"
          );

        case "stable":
          return (
            observedChange ===
              "unchanged" ||
            observed.status ===
              "stable"
          );

        case "constrained":
          return [
            "constrained",
            "weak",
            "deteriorating",
          ].includes(
            observed.status,
          );

        case "uncertain":
          return (
            observed.status ===
              "unresolved"
          );
      }
    });
}

function evaluatePredictions(params: {
  expectedScenario:
    ExecutiveScenarioResult;

  observedConditions:
    OrganizationalCondition[];

  observedPredictions:
    OrganizationalPrediction[];

  observedChangeByConditionId:
    Map<string, ObservedConditionChange>;
}): {
  validatedPredictionIds: string[];
  invalidatedPredictionIds: string[];
} {
  const observedPredictionById =
    new Map(
      params.observedPredictions.map(
        (prediction) => [
          prediction.id,
          prediction,
        ],
      ),
    );

  const observedConditionById =
    new Map(
      params.observedConditions.map(
        (condition) => [
          condition.id,
          condition,
        ],
      ),
    );

  const validatedPredictionIds:
    string[] = [];

  const invalidatedPredictionIds:
    string[] = [];

  for (
    const expectedPrediction of
    params.expectedScenario
      .simulatedOrganizationState
      .projectedPredictions
  ) {
    const observedPrediction =
      observedPredictionById.get(
        expectedPrediction.id,
      );

    if (
      observedPrediction?.status ===
      "confirmed"
    ) {
      validatedPredictionIds.push(
        expectedPrediction.id,
      );
      continue;
    }

    if (
      observedPrediction?.status ===
      "falsified"
    ) {
      invalidatedPredictionIds.push(
        expectedPrediction.id,
      );
      continue;
    }

    if (
      predictionDirectionMatches(
        expectedPrediction,
        observedConditionById,
        params
          .observedChangeByConditionId,
      )
    ) {
      validatedPredictionIds.push(
        expectedPrediction.id,
      );
      continue;
    }

    invalidatedPredictionIds.push(
      expectedPrediction.id,
    );
  }

  return {
    validatedPredictionIds:
      unique(
        validatedPredictionIds,
      ),

    invalidatedPredictionIds:
      unique(
        invalidatedPredictionIds,
      ),
  };
}

function evaluateAssumptions(params: {
  executiveDecision:
    ExecutiveDecision;

  intervention:
    OrganizationalIntervention;

  assumptionEvaluations:
    DecisionAssumptionEvaluation[];
}): {
  validatedAssumptions: string[];
  invalidatedAssumptions: string[];
} {
  const relevantAssumptions =
    unique([
      ...params.executiveDecision
        .assumptions,
      ...params.intervention
        .assumptions,
    ]);

  const evaluationByAssumption =
    new Map(
      params.assumptionEvaluations.map(
        (evaluation) => [
          evaluation
            .assumption
            .trim(),
          evaluation,
        ],
      ),
    );

  const validatedAssumptions:
    string[] = [];

  const invalidatedAssumptions:
    string[] = [];

  for (
    const assumption of
    relevantAssumptions
  ) {
    const evaluation =
      evaluationByAssumption.get(
        assumption,
      );

    if (
      evaluation?.status ===
      "validated"
    ) {
      validatedAssumptions.push(
        assumption,
      );
    }

    if (
      evaluation?.status ===
      "invalidated"
    ) {
      invalidatedAssumptions.push(
        assumption,
      );
    }
  }

  return {
    validatedAssumptions:
      unique(
        validatedAssumptions,
      ),

    invalidatedAssumptions:
      unique(
        invalidatedAssumptions,
      ),
  };
}

function determineOutcome(params: {
  executionStatus:
    ExecutiveDecisionOutcome["executionStatus"];

  achievedMetricCount: number;
  missedMetricCount: number;
  improvedConditionCount: number;
  worsenedConditionCount: number;
  validatedPredictionCount: number;
  invalidatedPredictionCount: number;
}): ExecutiveDecisionOutcome["outcome"] {
  if (
    params.executionStatus ===
      "planned" ||
    params.executionStatus ===
      "abandoned"
  ) {
    return "unknown";
  }

  const positiveSignals =
    params.achievedMetricCount +
    params.improvedConditionCount +
    params.validatedPredictionCount;

  const negativeSignals =
    params.missedMetricCount +
    params.worsenedConditionCount +
    params.invalidatedPredictionCount;

  if (
    positiveSignals === 0 &&
    negativeSignals === 0
  ) {
    return "unknown";
  }

  if (
    params.missedMetricCount ===
      0 &&
    params.worsenedConditionCount ===
      0 &&
    positiveSignals >
      negativeSignals
  ) {
    return "successful";
  }

  if (
    negativeSignals >
    positiveSignals
  ) {
    return "unsuccessful";
  }

  return "partially-successful";
}

function buildConfidence(params: {
  executiveDecision:
    ExecutiveDecision;

  intervention:
    OrganizationalIntervention;

  expectedScenario:
    ExecutiveScenarioResult;

  observedOrganizationalState:
    OrganizationalState;

  observedConditionCoverage: number;
  predictionEvaluationCoverage: number;
  assumptionEvaluationCoverage: number;
}): number {
  return clamp01(
    params.executiveDecision
      .confidence *
      0.1 +
    params.intervention
      .confidence *
      0.1 +
    params.expectedScenario
      .comparison
      .confidence *
      0.15 +
    params
      .observedOrganizationalState
      .confidence *
      0.25 +
    params
      .observedConditionCoverage *
      0.2 +
    params
      .predictionEvaluationCoverage *
      0.15 +
    params
      .assumptionEvaluationCoverage *
      0.05,
  );
}

function buildSummary(params: {
  executiveDecision:
    ExecutiveDecision;

  intervention:
    OrganizationalIntervention;

  executionStatus:
    ExecutiveDecisionOutcome["executionStatus"];

  outcome:
    ExecutiveDecisionOutcome["outcome"];

  improvedConditionIds:
    string[];

  worsenedConditionIds:
    string[];

  achievedSuccessMetrics:
    string[];

  missedSuccessMetrics:
    string[];

  validatedPredictionIds:
    string[];

  invalidatedPredictionIds:
    string[];
}): string {
  const sentences: string[] = [
    `${params.intervention.title} was evaluated as ${params.executionStatus}.`,
    `The observed executive decision outcome is ${params.outcome}.`,
  ];

  if (
    params.improvedConditionIds
      .length > 0
  ) {
    sentences.push(
      `${params.improvedConditionIds.length} organizational condition(s) improved.`,
    );
  }

  if (
    params.worsenedConditionIds
      .length > 0
  ) {
    sentences.push(
      `${params.worsenedConditionIds.length} organizational condition(s) worsened.`,
    );
  }

  if (
    params.achievedSuccessMetrics
      .length > 0 ||
    params.missedSuccessMetrics
      .length > 0
  ) {
    sentences.push(
      `${params.achievedSuccessMetrics.length} success metric(s) were achieved and ${params.missedSuccessMetrics.length} were missed.`,
    );
  }

  if (
    params.validatedPredictionIds
      .length > 0 ||
    params.invalidatedPredictionIds
      .length > 0
  ) {
    sentences.push(
      `${params.validatedPredictionIds.length} projected prediction(s) were validated and ${params.invalidatedPredictionIds.length} were invalidated.`,
    );
  }

  sentences.push(
    `This outcome evaluates the decision "${params.executiveDecision.title}" against observed organizational evidence.`,
  );

  return sentences.join(" ");
}

function buildOutcomeId(params: {
  executiveDecisionId: string;
  interventionId: string;
  evaluatedAt: string;
}): string {
  return [
    "executive-decision-outcome",
    params.executiveDecisionId,
    params.interventionId,
    params.evaluatedAt,
  ].join("-");
}

/**
 * Constructs the canonical observed outcome of one executive decision.
 *
 * This producer performs no simulation, intervention generation,
 * executive assessment synthesis, or new prediction generation.
 *
 * It compares the expected scenario with observed organizational
 * conditions and evaluated predictions, then records the result as an
 * ExecutiveDecisionOutcome for downstream reflection and learning.
 */
export function buildExecutiveDecisionOutcome({
  executiveDecision,
  intervention,
  expectedScenario,
  observedOrganizationalState,
  observedConditions,
  observedPredictions,
  executionStatus,
  assumptionEvaluations = [],
  unexpectedEffects = [],
  evaluatedAt =
    new Date().toISOString(),
}: BuildExecutiveDecisionOutcomeInput): ExecutiveDecisionOutcome {
  if (
    executiveDecision.organizationId !==
    intervention.organizationId
  ) {
    throw new Error(
      "Executive Decision and Organizational Intervention must belong to the same organization.",
    );
  }

  if (
    expectedScenario
      .intervention
      .id !==
    intervention.id
  ) {
    throw new Error(
      "Expected scenario must correspond to the implemented intervention.",
    );
  }

  if (
    expectedScenario
      .simulatedOrganizationState
      .organizationId !==
    executiveDecision.organizationId
  ) {
    throw new Error(
      "Expected scenario must use the same organization as the Executive Decision.",
    );
  }

  const conditionEvaluation =
    evaluateObservedConditions({
      expectedScenario,
      observedConditions,
    });

  const metricEvaluation =
    evaluateSuccessMetrics({
      executiveDecision,
      observedConditions,
      observedChangeByConditionId:
        conditionEvaluation
          .observedChangeByConditionId,
    });

  const predictionEvaluation =
    evaluatePredictions({
      expectedScenario,
      observedConditions,
      observedPredictions,
      observedChangeByConditionId:
        conditionEvaluation
          .observedChangeByConditionId,
    });

  const assumptionEvaluation =
    evaluateAssumptions({
      executiveDecision,
      intervention,
      assumptionEvaluations,
    });

  const outcome =
    determineOutcome({
      executionStatus,

      achievedMetricCount:
        metricEvaluation
          .achievedSuccessMetrics
          .length,

      missedMetricCount:
        metricEvaluation
          .missedSuccessMetrics
          .length,

      improvedConditionCount:
        conditionEvaluation
          .improvedConditionIds
          .length,

      worsenedConditionCount:
        conditionEvaluation
          .worsenedConditionIds
          .length,

      validatedPredictionCount:
        predictionEvaluation
          .validatedPredictionIds
          .length,

      invalidatedPredictionCount:
        predictionEvaluation
          .invalidatedPredictionIds
          .length,
    });

  const expectedConditionCount =
    expectedScenario
      .comparison
      .conditionChanges
      .length;

  const observedConditionCoverage =
    expectedConditionCount === 0
      ? 0
      : clamp01(
          conditionEvaluation
            .observedChangeByConditionId
            .size /
            expectedConditionCount,
        );

  const expectedPredictionCount =
    expectedScenario
      .simulatedOrganizationState
      .projectedPredictions
      .length;

  const predictionEvaluationCoverage =
    expectedPredictionCount === 0
      ? 0
      : clamp01(
          (
            predictionEvaluation
              .validatedPredictionIds
              .length +
            predictionEvaluation
              .invalidatedPredictionIds
              .length
          ) /
            expectedPredictionCount,
        );

  const relevantAssumptionCount =
    unique([
      ...executiveDecision
        .assumptions,
      ...intervention
        .assumptions,
    ]).length;

  const assumptionEvaluationCoverage =
    relevantAssumptionCount === 0
      ? 1
      : clamp01(
          (
            assumptionEvaluation
              .validatedAssumptions
              .length +
            assumptionEvaluation
              .invalidatedAssumptions
              .length
          ) /
            relevantAssumptionCount,
        );

  const confidence =
    buildConfidence({
      executiveDecision,
      intervention,
      expectedScenario,
      observedOrganizationalState,
      observedConditionCoverage,
      predictionEvaluationCoverage,
      assumptionEvaluationCoverage,
    });

  return {
    id:
      buildOutcomeId({
        executiveDecisionId:
          executiveDecision.id,
        interventionId:
          intervention.id,
        evaluatedAt,
      }),

    executiveDecisionId:
      executiveDecision.id,

    organizationId:
      executiveDecision.organizationId,

    interventionId:
      intervention.id,

    evaluatedAt,

    executionStatus,

    outcome,

    improvedConditionIds:
      conditionEvaluation
        .improvedConditionIds,

    worsenedConditionIds:
      conditionEvaluation
        .worsenedConditionIds,

    unchangedConditionIds:
      conditionEvaluation
        .unchangedConditionIds,

    achievedSuccessMetrics:
      metricEvaluation
        .achievedSuccessMetrics,

    missedSuccessMetrics:
      metricEvaluation
        .missedSuccessMetrics,

    validatedPredictionIds:
      predictionEvaluation
        .validatedPredictionIds,

    invalidatedPredictionIds:
      predictionEvaluation
        .invalidatedPredictionIds,

    validatedAssumptions:
      assumptionEvaluation
        .validatedAssumptions,

    invalidatedAssumptions:
      assumptionEvaluation
        .invalidatedAssumptions,

    unexpectedEffects:
      unique(
        unexpectedEffects,
      ),

    confidence,

    summary:
      buildSummary({
        executiveDecision,
        intervention,
        executionStatus,
        outcome,

        improvedConditionIds:
          conditionEvaluation
            .improvedConditionIds,

        worsenedConditionIds:
          conditionEvaluation
            .worsenedConditionIds,

        achievedSuccessMetrics:
          metricEvaluation
            .achievedSuccessMetrics,

        missedSuccessMetrics:
          metricEvaluation
            .missedSuccessMetrics,

        validatedPredictionIds:
          predictionEvaluation
            .validatedPredictionIds,

        invalidatedPredictionIds:
          predictionEvaluation
            .invalidatedPredictionIds,
      }),
  };
}
