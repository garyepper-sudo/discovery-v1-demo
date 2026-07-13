import type {
  OrganizationalPrediction,
  OrganizationalPredictionSeverity,
  OrganizationalPredictionStatus,
} from "./organizationalPrediction";

import type {
  PredictionCondition,
  PredictionContext,
  PredictionInferenceResult,
} from "./predictionTypes";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function severityFromCondition(
  condition: PredictionCondition,
): OrganizationalPredictionSeverity {
  if (condition.priority === "critical") {
    return "critical";
  }

  if (condition.priority === "high") {
    return "high";
  }

  if (condition.priority === "medium") {
    return "medium";
  }

  return "low";
}

function predictionStatusForCondition(
  condition: PredictionCondition,
): OrganizationalPredictionStatus {
  if (condition.trend === "new") {
    return "proposed";
  }

  if (
    condition.trend === "strengthening" ||
    condition.status === "deteriorating"
  ) {
    return "strengthening";
  }

  if (condition.trend === "weakening") {
    return "weakening";
  }

  return "active";
}

function confidenceForCondition(
  condition: PredictionCondition,
): number {
  const longitudinalMultiplier =
    condition.trend === "new"
      ? 0.65
      : condition.trend === "weakening"
        ? 0.8
        : 1;

  return clamp01(
    condition.confidence * longitudinalMultiplier,
  );
}

function likelihoodForCondition(
  condition: PredictionCondition,
): number {
  const baseLikelihood = Math.max(
    condition.confidence,
    condition.strength,
  );

  const longitudinalMultiplier =
    condition.trend === "new"
      ? 0.75
      : condition.trend === "weakening"
        ? 0.85
        : 1;

  return clamp01(
    baseLikelihood * longitudinalMultiplier,
  );
}

function previousPredictionById(
  context: PredictionContext,
): Map<string, OrganizationalPrediction> {
  return new Map(
    (context.previousPredictions ?? []).map(
      (prediction) => [
        prediction.id,
        prediction,
      ],
    ),
  );
}

export function inferOrganizationalPredictions(
  context: PredictionContext,
): PredictionInferenceResult {
  const predictions: OrganizationalPrediction[] = [];

  const previousPredictions =
    previousPredictionById(context);

  for (const condition of context.conditions) {
    const isConstrained =
      condition.status === "constrained" ||
      condition.status === "deteriorating";

    const status =
      predictionStatusForCondition(condition);

    const confidence =
      confidenceForCondition(condition);

    const likelihood =
      likelihoodForCondition(condition);

    //
    // Continuation
    //
    if (isConstrained) {
      const id =
        `prediction-${condition.id}-continuation`;

      const previousPrediction =
        previousPredictions.get(id);

      predictions.push({
        id,

        statement:
          `${condition.name} is likely to remain constrained.`,

        summary:
          condition.trend === "new"
            ? `${condition.name} may continue limiting organizational performance if the current signal persists. This is a provisional prediction because Discovery has limited longitudinal evidence.`
            : `${condition.name} is expected to continue limiting organizational performance unless meaningful intervention occurs.`,

        predictionType: "continuation",

        confidence,

        likelihood,

        severity:
          severityFromCondition(condition),

        timeHorizon: "near-term",

        status,

        sourceConditionIds: [
          condition.id,
        ],

        sourceConceptIds:
          condition.supportingConceptIds,

        sourceTheoryIds:
          condition.supportingTheoryIds,

        sourceBeliefIds:
          condition.supportingBeliefIds,

        predictedConditionChanges: [
          {
            conditionId: condition.id,

            direction:
              condition.status === "deteriorating"
                ? "deteriorating"
                : "constrained",

            predictedStatus:
              condition.status === "deteriorating"
                ? "deteriorating"
                : "constrained",

            confidence,

            explanation:
              condition.trend === "new"
                ? `${condition.name} is currently constrained, but Discovery has not yet observed enough history to determine whether the condition will persist.`
                : `${condition.name} remains supported by current and longitudinal organizational evidence.`,
          },
        ],

        causalPath: [
          condition.id,
        ],

        assumptions: [
          "Current organizational conditions remain materially unchanged.",
          "No meaningful intervention alters the condition.",
          "The current condition reflects persistent organizational behavior rather than a temporary signal.",
        ],

        confidenceLimiters: [
          ...condition.confidenceLimiters,

          ...(condition.trend === "new"
            ? [
                "This prediction is based on a newly observed condition and has not yet been validated through longitudinal evidence.",
              ]
            : []),
        ],

        falsifyingEvidence: [
          ...condition.missingEvidence,
          `Evidence that ${condition.name} improves or resolves without meaningful intervention.`,
        ],

        explanation:
          condition.trend === "new"
            ? "Discovery formed this provisional continuation prediction because the condition is currently constrained, while reducing confidence because no longitudinal condition history is yet available."
            : "Discovery formed this continuation prediction because the condition remains constrained and has stable or strengthening longitudinal support.",

        createdAt:
          previousPrediction?.createdAt ??
          context.now,

        lastEvaluatedAt:
          context.now,
      });
    }

    //
    // Deterioration
    //
    if (
      condition.status === "deteriorating" ||
      (
        condition.status === "constrained" &&
        condition.trend === "strengthening"
      )
    ) {
      const id =
        `prediction-${condition.id}-deterioration`;

      const previousPrediction =
        previousPredictions.get(id);

      predictions.push({
        id,

        statement:
          `${condition.name} is at risk of further deterioration.`,

        summary:
          `${condition.name} may become a more serious organizational constraint if current pressure continues increasing.`,

        predictionType: "deterioration",

        confidence: clamp01(
          confidence * 0.95,
        ),

        likelihood: clamp01(
          likelihood * 0.95,
        ),

        severity:
          severityFromCondition(condition),

        timeHorizon: "near-term",

        status,

        sourceConditionIds: [
          condition.id,
        ],

        sourceConceptIds:
          condition.supportingConceptIds,

        sourceTheoryIds:
          condition.supportingTheoryIds,

        sourceBeliefIds:
          condition.supportingBeliefIds,

        predictedConditionChanges: [
          {
            conditionId: condition.id,

            direction: "deteriorating",

            predictedStatus: "deteriorating",

            confidence: clamp01(
              confidence * 0.95,
            ),

            explanation:
              `${condition.name} is already deteriorating or becoming more strongly supported as an active constraint.`,
          },
        ],

        causalPath: [
          condition.id,
        ],

        assumptions: [
          "Current weakening forces continue.",
          "No effective intervention reduces the condition.",
        ],

        confidenceLimiters:
          condition.confidenceLimiters,

        falsifyingEvidence: [
          ...condition.missingEvidence,
          `Evidence that ${condition.name} stabilizes or improves while current organizational conditions remain unchanged.`,
        ],

        explanation:
          "Discovery formed this deterioration prediction because the condition is deteriorating or strengthening as an active organizational constraint.",

        createdAt:
          previousPrediction?.createdAt ??
          context.now,

        lastEvaluatedAt:
          context.now,
      });
    }

    //
    // Improvement
    //
    if (
      condition.status === "improving" ||
      condition.trend === "weakening"
    ) {
      const id =
        `prediction-${condition.id}-improvement`;

      const previousPrediction =
        previousPredictions.get(id);

      predictions.push({
        id,

        statement:
          `${condition.name} may continue improving.`,

        summary:
          `${condition.name} is showing evidence of reduced organizational constraint and may continue improving if current positive signals persist.`,

        predictionType: "improvement",

        confidence,

        likelihood,

        severity: "low",

        timeHorizon: "medium-term",

        status:
          condition.trend === "new"
            ? "proposed"
            : "active",

        sourceConditionIds: [
          condition.id,
        ],

        sourceConceptIds:
          condition.supportingConceptIds,

        sourceTheoryIds:
          condition.supportingTheoryIds,

        sourceBeliefIds:
          condition.supportingBeliefIds,

        predictedConditionChanges: [
          {
            conditionId: condition.id,

            direction: "improving",

            predictedStatus: "improving",

            confidence,

            explanation:
              `${condition.name} currently shows improving or weakening constraint signals.`,
          },
        ],

        causalPath: [
          condition.id,
        ],

        assumptions: [
          "Current positive organizational signals continue.",
          "No new constraints reverse the current trajectory.",
        ],

        confidenceLimiters:
          condition.confidenceLimiters,

        falsifyingEvidence: [
          ...condition.missingEvidence,
          `Evidence that ${condition.name} becomes more constrained or deteriorates.`,
        ],

        explanation:
          "Discovery formed this improvement prediction because current evidence suggests the organizational constraint is weakening or improving.",

        createdAt:
          previousPrediction?.createdAt ??
          context.now,

        lastEvaluatedAt:
          context.now,
      });
    }

    //
    // Propagation
    //
    if (
      isConstrained &&
      condition.downstreamConditionIds.length > 0
    ) {
      const id =
        `prediction-${condition.id}-propagation`;

      const previousPrediction =
        previousPredictions.get(id);

      const propagationConfidence =
        clamp01(confidence * 0.85);

      predictions.push({
        id,

        statement:
          `${condition.name} may increase pressure on connected organizational conditions.`,

        summary:
          `${condition.name} may propagate into ${condition.downstreamConditionIds.length} downstream organizational condition${condition.downstreamConditionIds.length === 1 ? "" : "s"} if current pressure persists.`,

        predictionType: "propagation",

        confidence:
          propagationConfidence,

        likelihood: clamp01(
          condition.strength * 0.9,
        ),

        severity:
          severityFromCondition(condition),

        timeHorizon: "near-term",

        status,

        sourceConditionIds: [
          condition.id,
        ],

        sourceConceptIds:
          condition.supportingConceptIds,

        sourceTheoryIds:
          condition.supportingTheoryIds,

        sourceBeliefIds:
          condition.supportingBeliefIds,

        predictedConditionChanges:
          condition.downstreamConditionIds.map(
            (conditionId) => ({
              conditionId,

              direction: "deteriorating",

              confidence:
                propagationConfidence,

              explanation:
                `Continued pressure in ${condition.name} may increase constraint in this downstream condition.`,
            }),
          ),

        causalPath: [
          condition.id,
          ...condition.downstreamConditionIds,
        ],

        assumptions: [
          "Current organizational system relationships remain valid.",
          "The source condition remains active.",
          "No intervention interrupts downstream propagation.",
        ],

        confidenceLimiters: [
          ...condition.confidenceLimiters,

          ...(condition.trend === "new"
            ? [
                "The source condition is newly observed, so downstream propagation remains provisional.",
              ]
            : []),
        ],

        falsifyingEvidence: [
          ...condition.missingEvidence,
          "Evidence that downstream conditions improve or remain unaffected while the source condition persists.",
        ],

        explanation:
          "Discovery formed this propagation prediction by following the condition's explicitly modeled downstream organizational relationships.",

        createdAt:
          previousPrediction?.createdAt ??
          context.now,

        lastEvaluatedAt:
          context.now,
      });
    }
  }

  return {
    predictions,

    candidates: [],

    generatedAt:
      context.now,
  };
}