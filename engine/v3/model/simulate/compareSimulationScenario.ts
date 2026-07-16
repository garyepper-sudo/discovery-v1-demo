import type {
  OrganizationalAssessment,
} from "../judgment/organizationalJudgment";
import type {
  OrganizationalPrediction,
} from "../predictions/organizationalPrediction";
import type {
  OrganizationalCondition,
} from "../state/inferOrganizationalConditions";
import type {
  SimulationScenario,
} from "./buildSimulationScenario";

const CONDITION_CHANGE_THRESHOLD = 0.01;
const PREDICTION_CHANGE_THRESHOLD = 0.03;

export type SimulationConditionChangeType =
  | "improved"
  | "worsened"
  | "unchanged";

export type SimulationPredictionChangeType =
  | "added"
  | "removed"
  | "strengthened"
  | "weakened"
  | "unchanged";

export type SimulationRecommendation =
  | "proceed"
  | "do-not-proceed"
  | "investigate-further";

export type SimulationConditionChange = {
  conditionId: string;
  name: string;

  change: SimulationConditionChangeType;

  previousStrength: number;
  projectedStrength: number;
  strengthDelta: number;

  previousConfidence: number;
  projectedConfidence: number;

  previousStatus: OrganizationalCondition["status"];
  projectedStatus: OrganizationalCondition["status"];

  previousTrend: OrganizationalCondition["trend"];
  projectedTrend: OrganizationalCondition["trend"];
};

export type SimulationPredictionChange = {
  predictionId: string;
  statement: string;

  change: SimulationPredictionChangeType;

  previousConfidence?: number;
  projectedConfidence?: number;

  previousLikelihood?: number;
  projectedLikelihood?: number;

  previousType?: OrganizationalPrediction["predictionType"];
  projectedType?: OrganizationalPrediction["predictionType"];
};

export type SimulationUnderstandingChange = {
  previous: string;

  projected: string;

  previousConfidence: number;

  projectedConfidence: number;

  dominantConditionChanged: boolean;

  dominantTheoryChanged: boolean;

  confidenceChanged: boolean;

  changed: boolean;
};

export type SimulationScenarioComparison = {
  scenario: SimulationScenario;

  conditionChanges: SimulationConditionChange[];

  predictionChanges: SimulationPredictionChange[];

  understandingChange: SimulationUnderstandingChange;

  executiveSummary: string;

  recommendation: SimulationRecommendation;

  confidence: number;
};

export type CompareSimulationScenarioInput = {
  currentConditions: OrganizationalCondition[];

  currentPredictions: OrganizationalPrediction[];

  currentExecutiveAssessment: OrganizationalAssessment;

  projectedScenario: SimulationScenario;
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function statusScore(
  status: OrganizationalCondition["status"],
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
}

function classifyConditionChange(params: {
  current: OrganizationalCondition;
  projected: OrganizationalCondition;
}): SimulationConditionChangeType {
  const { current, projected } = params;

  const strengthDelta =
    projected.strength - current.strength;

  const statusDelta =
    statusScore(projected.status) -
    statusScore(current.status);

  if (
    strengthDelta <= -CONDITION_CHANGE_THRESHOLD ||
    statusDelta > 0
  ) {
    return "improved";
  }

  if (
    strengthDelta >= CONDITION_CHANGE_THRESHOLD ||
    statusDelta < 0
  ) {
    return "worsened";
  }

  return "unchanged";
}

function compareConditions(params: {
  currentConditions: OrganizationalCondition[];
  projectedConditions: OrganizationalCondition[];
}): SimulationConditionChange[] {
  const projectedById = new Map(
    params.projectedConditions.map(
      (condition) => [
        condition.id,
        condition,
      ],
    ),
  );

  return params.currentConditions
    .map((current) => {
      const projected =
        projectedById.get(current.id);

      if (!projected) {
        return undefined;
      }

      return {
        conditionId:
          current.id,

        name:
          current.name,

        change:
          classifyConditionChange({
            current,
            projected,
          }),

        previousStrength:
          current.strength,

        projectedStrength:
          projected.strength,

        strengthDelta:
          round(
            projected.strength -
              current.strength,
          ),

        previousConfidence:
          current.confidence,

        projectedConfidence:
          projected.confidence,

        previousStatus:
          current.status,

        projectedStatus:
          projected.status,

        previousTrend:
          current.trend,

        projectedTrend:
          projected.trend,
      } satisfies SimulationConditionChange;
    })
    .filter(
      (
        change,
      ): change is SimulationConditionChange =>
        Boolean(change),
    );
}

function predictionSupportScore(
  prediction: OrganizationalPrediction,
): number {
  return (
    prediction.confidence +
    prediction.likelihood
  ) / 2;
}

function comparePredictions(params: {
  currentPredictions: OrganizationalPrediction[];
  projectedPredictions: OrganizationalPrediction[];
}): SimulationPredictionChange[] {
  const currentById = new Map(
    params.currentPredictions.map(
      (prediction) => [
        prediction.id,
        prediction,
      ],
    ),
  );

  const projectedById = new Map(
    params.projectedPredictions.map(
      (prediction) => [
        prediction.id,
        prediction,
      ],
    ),
  );

  const predictionIds = new Set([
    ...currentById.keys(),
    ...projectedById.keys(),
  ]);

  return Array.from(predictionIds).map(
    (predictionId) => {
      const current =
        currentById.get(predictionId);

      const projected =
        projectedById.get(predictionId);

      if (!current && projected) {
        return {
          predictionId,
          statement:
            projected.statement,
          change:
            "added",
          projectedConfidence:
            projected.confidence,
          projectedLikelihood:
            projected.likelihood,
          projectedType:
            projected.predictionType,
        };
      }

      if (current && !projected) {
        return {
          predictionId,
          statement:
            current.statement,
          change:
            "removed",
          previousConfidence:
            current.confidence,
          previousLikelihood:
            current.likelihood,
          previousType:
            current.predictionType,
        };
      }

      if (!current || !projected) {
        throw new Error(
          `Unable to compare prediction "${predictionId}".`,
        );
      }

      const supportDelta =
        predictionSupportScore(projected) -
        predictionSupportScore(current);

      const change: SimulationPredictionChangeType =
        supportDelta >=
        PREDICTION_CHANGE_THRESHOLD
          ? "strengthened"
          : supportDelta <=
              -PREDICTION_CHANGE_THRESHOLD
            ? "weakened"
            : "unchanged";

      return {
        predictionId,
        statement:
          projected.statement,
        change,
        previousConfidence:
          current.confidence,
        projectedConfidence:
          projected.confidence,
        previousLikelihood:
          current.likelihood,
        projectedLikelihood:
          projected.likelihood,
        previousType:
          current.predictionType,
        projectedType:
          projected.predictionType,
      };
    },
  );
}

function compareUnderstanding(params: {
  currentAssessment:
    OrganizationalAssessment;

  projectedAssessment:
    OrganizationalAssessment;
}): SimulationUnderstandingChange {
  const previousUnderstanding =
    params.currentAssessment
      .organizationalUnderstanding;

  const projectedUnderstanding =
    params.projectedAssessment
      .organizationalUnderstanding;

  const previous =
    previousUnderstanding.statement;

  const projected =
    projectedUnderstanding.statement;

  const previousDominantConditionId =
  previousUnderstanding
    .dominantCondition
    ?.id ??
  null;

const projectedDominantConditionId =
  projectedUnderstanding
    .dominantCondition
    ?.id ??
  null;

const dominantConditionChanged =
  previousDominantConditionId !==
  projectedDominantConditionId;

  const dominantTheoryChanged =
    previousUnderstanding
      .dominantTheory !==
    projectedUnderstanding
      .dominantTheory;

  const confidenceChanged =
    Math.abs(
      previousUnderstanding.confidence -
      projectedUnderstanding.confidence,
    ) >= 0.02;

  const statementChanged =
    previous.trim() !==
    projected.trim();

  return {
    previous,

    projected,

    previousConfidence:
      previousUnderstanding.confidence,

    projectedConfidence:
      projectedUnderstanding.confidence,

    dominantConditionChanged,

    dominantTheoryChanged,

    confidenceChanged,

    changed:
      statementChanged ||
      dominantConditionChanged ||
      dominantTheoryChanged ||
      confidenceChanged,
  };
}

function buildRecommendation(
  conditionChanges: SimulationConditionChange[],
): SimulationRecommendation {
  const improvedCount =
    conditionChanges.filter(
      (change) =>
        change.change === "improved",
    ).length;

  const worsenedCount =
    conditionChanges.filter(
      (change) =>
        change.change === "worsened",
    ).length;

  if (
    improvedCount > 0 &&
    worsenedCount === 0
  ) {
    return "proceed";
  }

  if (
    worsenedCount > improvedCount
  ) {
    return "do-not-proceed";
  }

  return "investigate-further";
}

function buildExecutiveSummary(params: {
  conditionChanges: SimulationConditionChange[];
  predictionChanges: SimulationPredictionChange[];
  understandingChange: SimulationUnderstandingChange;
  recommendation: SimulationRecommendation;
}): string {
  const improvedConditions =
    params.conditionChanges
      .filter(
        (change) =>
          change.change === "improved",
      )
      .map((change) => change.name);

  const worsenedConditions =
    params.conditionChanges
      .filter(
        (change) =>
          change.change === "worsened",
      )
      .map((change) => change.name);

  const addedPredictions =
    params.predictionChanges.filter(
      (change) =>
        change.change === "added",
    );

  const removedPredictions =
    params.predictionChanges.filter(
      (change) =>
        change.change === "removed",
    );

  const sentences: string[] = [];

  if (improvedConditions.length > 0) {
    sentences.push(
      `${improvedConditions.join(", ")} ${
        improvedConditions.length === 1
          ? "is"
          : "are"
      } projected to improve.`,
    );
  }

  if (worsenedConditions.length > 0) {
    sentences.push(
      `${worsenedConditions.join(", ")} ${
        worsenedConditions.length === 1
          ? "is"
          : "are"
      } projected to worsen.`,
    );
  }

  if (addedPredictions.length > 0) {
    sentences.push(
      `${addedPredictions.length} new future-state prediction${
        addedPredictions.length === 1
          ? ""
          : "s"
      } emerged from the simulated conditions.`,
    );
  }

  if (removedPredictions.length > 0) {
    sentences.push(
      `${removedPredictions.length} current prediction${
        removedPredictions.length === 1
          ? ""
          : "s"
      } no longer appears in the simulated future.`,
    );
  }

  if (params.understandingChange.changed) {
    sentences.push(
      "Discovery's leading executive understanding changes under this scenario.",
    );
  }

  switch (params.recommendation) {
    case "proceed":
      sentences.push(
        "The projected benefits outweigh the identified deterioration signals.",
      );
      break;

    case "do-not-proceed":
      sentences.push(
        "The scenario creates more deterioration than improvement.",
      );
      break;

    case "investigate-further":
      sentences.push(
        "The projected effects are mixed and require additional investigation before commitment.",
      );
      break;
  }

  return sentences.length > 0
    ? sentences.join(" ")
    : "The simulated scenario does not materially change the current organizational outlook.";
}

function comparisonConfidence(params: {
  currentAssessment: OrganizationalAssessment;
  projectedScenario: SimulationScenario;
}): number {
  return clamp01(
    (
      params.currentAssessment.confidence +
      params.projectedScenario
        .projectedExecutiveAssessment
        .confidence +
      params.projectedScenario
        .simulatedOrganizationState
        .confidence
    ) / 3,
  );
}

/**
 * Compares current organizational cognition with a projected simulation
 * scenario and produces a deterministic executive-facing difference.
 *
 * This function performs no new organizational reasoning. It compares
 * canonical current-state and projected-state cognitive objects.
 */
export function compareSimulationScenario({
  currentConditions,
  currentPredictions,
  currentExecutiveAssessment,
  projectedScenario,
}: CompareSimulationScenarioInput): SimulationScenarioComparison {
  const conditionChanges =
    compareConditions({
      currentConditions,
      projectedConditions:
        projectedScenario
          .simulatedOrganizationState
          .projectedConditions,
    });

  const predictionChanges =
    comparePredictions({
      currentPredictions,
      projectedPredictions:
        projectedScenario
          .simulatedOrganizationState
          .projectedPredictions,
    });

  const understandingChange =
    compareUnderstanding({
      currentAssessment:
        currentExecutiveAssessment,
      projectedAssessment:
        projectedScenario
          .projectedExecutiveAssessment,
    });

  const recommendation =
    buildRecommendation(
      conditionChanges,
    );

  const executiveSummary =
    buildExecutiveSummary({
      conditionChanges,
      predictionChanges,
      understandingChange,
      recommendation,
    });

  const confidence =
    comparisonConfidence({
      currentAssessment:
        currentExecutiveAssessment,
      projectedScenario,
    });

  return {
    scenario:
      projectedScenario,

    conditionChanges,

    predictionChanges,

    understandingChange,

    executiveSummary,

    recommendation,

    confidence,
  };
}
