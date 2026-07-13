import type {
  OrganizationalPrediction,
  OrganizationalPredictionSeverity,
  OrganizationalPredictionStatus,
  OrganizationalPredictionType,
} from "./organizationalPrediction";

export type PredictionReflectionEvidence = {
  id: string;
  label: string;
  rationale: string;
  confidence?: number;
};

export type CompetingPrediction = {
  predictionId: string;
  statement: string;
  predictionType: OrganizationalPredictionType;
  confidence: number;
  likelihood: number;
  reasonItWasConsidered: string;
  reasonItWasNotSelected: string;
};

export type PredictionReflection = {
  /**
   * Stable identity for the reflection.
   */
  id: string;

  /**
   * Prediction selected as the most important future-state signal.
   */
  primaryPredictionId: string | null;

  /**
   * Concise future-state statement.
   */
  primaryPrediction: string | null;

  /**
   * Type of prediction selected.
   */
  predictionType: OrganizationalPredictionType | null;

  /**
   * Current lifecycle state of the prediction.
   */
  status: OrganizationalPredictionStatus | null;

  /**
   * Estimated seriousness of the predicted outcome.
   */
  severity: OrganizationalPredictionSeverity | null;

  /**
   * Discovery's confidence in the reasoning behind the prediction.
   */
  confidence: number;

  /**
   * Discovery's estimate of how likely the outcome is.
   */
  likelihood: number;

  /**
   * Why Discovery selected this prediction.
   */
  whyDiscoveryPredictsThis: string;

  /**
   * Conditions supporting the prediction.
   */
  supportingConditions: PredictionReflectionEvidence[];

  /**
   * Concepts supporting the prediction.
   */
  supportingConcepts: PredictionReflectionEvidence[];

  /**
   * Beliefs supporting the prediction.
   */
  supportingBeliefs: PredictionReflectionEvidence[];

  /**
   * Theories supporting the prediction.
   */
  supportingTheories: PredictionReflectionEvidence[];

  /**
   * Ordered causal path supporting the predicted future state.
   */
  causalPath: string[];

  /**
   * Other predictions that remain plausible.
   */
  competingPredictions: CompetingPrediction[];

  /**
   * Assumptions that must remain true.
   */
  assumptions: string[];

  /**
   * Factors limiting confidence.
   */
  confidenceLimiters: string[];

  /**
   * Evidence that would weaken or falsify the prediction.
   */
  falsifyingEvidence: string[];

  /**
   * Executive-facing confidence explanation.
   */
  calibratedConfidenceExplanation: string;

  /**
   * Highest-value executive response.
   */
  executiveRecommendation: string;
};

export type PredictionReflectionLabelMaps = {
  conditionLabels?: Record<string, string>;
  conceptLabels?: Record<string, string>;
  beliefLabels?: Record<string, string>;
  theoryLabels?: Record<string, string>;
};

export type BuildPredictionReflectionInput = {
  predictions?: OrganizationalPrediction[];

  /**
   * Optional labels used to replace cognitive object IDs with
   * human-readable names.
   */
  labels?: PredictionReflectionLabelMaps;

  /**
   * Optional list of condition IDs that currently receive the
   * highest executive priority.
   */
  priorityConditionIds?: string[];
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function unique(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function labelForId(
  id: string,
  labels?: Record<string, string>,
): string {
  return labels?.[id] ?? humanizeId(id);
}

function humanizeId(value: string): string {
  const withoutPrefix = value
    .replace(
      /^(condition|concept|belief|theory|prediction)[-:]/,
      "",
    )
    .replace(/[-_:]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();

  return withoutPrefix
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function severityScore(
  severity: OrganizationalPredictionSeverity,
): number {
  switch (severity) {
    case "critical":
      return 1;
    case "high":
      return 0.8;
    case "medium":
      return 0.55;
    case "low":
      return 0.3;
  }
}

function statusScore(
  status: OrganizationalPredictionStatus,
): number {
  switch (status) {
    case "confirmed":
      return 1;
    case "strengthening":
      return 0.9;
    case "active":
      return 0.75;
    case "proposed":
      return 0.55;
    case "weakening":
      return 0.4;
    case "falsified":
      return 0.1;
    case "expired":
    case "retired":
      return 0;
  }
}

function predictionTypeScore(
  type: OrganizationalPredictionType,
): number {
  switch (type) {
    case "deterioration":
      return 1;
    case "propagation":
      return 0.85;
    case "continuation":
      return 0.7;
    case "improvement":
      return 0.55;
  }
}

function executivePriorityScore(params: {
  prediction: OrganizationalPrediction;
  priorityConditionIds: Set<string>;
}): number {
  const { prediction, priorityConditionIds } =
    params;

  const priorityMatch =
    prediction.sourceConditionIds.some((id) =>
      priorityConditionIds.has(id),
    )
      ? 1
      : 0;

  return clamp01(
    prediction.confidence * 0.22 +
      prediction.likelihood * 0.22 +
      severityScore(prediction.severity) * 0.18 +
      statusScore(prediction.status) * 0.14 +
      predictionTypeScore(
        prediction.predictionType,
      ) *
        0.14 +
      priorityMatch * 0.1,
  );
}

function rankPredictions(params: {
  predictions: OrganizationalPrediction[];
  priorityConditionIds?: string[];
}): OrganizationalPrediction[] {
  const priorityConditionIds = new Set(
    params.priorityConditionIds ?? [],
  );

  return params.predictions
    .filter(
      (prediction) =>
        prediction.status !== "falsified" &&
        prediction.status !== "expired" &&
        prediction.status !== "retired",
    )
    .slice()
    .sort(
      (a, b) =>
        executivePriorityScore({
          prediction: b,
          priorityConditionIds,
        }) -
        executivePriorityScore({
          prediction: a,
          priorityConditionIds,
        }),
    );
}

function buildSupportingEvidence(params: {
  ids: string[];
  labels?: Record<string, string>;
  rationale: string;
  confidence?: number;
}): PredictionReflectionEvidence[] {
  const {
    ids,
    labels,
    rationale,
    confidence,
  } = params;

  return unique(ids).map((id) => ({
    id,
    label: labelForId(id, labels),
    rationale,
    confidence,
  }));
}

function overlapCount(
  first: string[],
  second: string[],
): number {
  const secondSet = new Set(second);

  return first.filter((value) =>
    secondSet.has(value),
  ).length;
}

function competingReason(params: {
  primary: OrganizationalPrediction;
  competing: OrganizationalPrediction;
}): string {
  const { primary, competing } = params;

  const sharedConditions = overlapCount(
    primary.sourceConditionIds,
    competing.sourceConditionIds,
  );

  if (sharedConditions > 0) {
    return `This prediction draws from ${sharedConditions} condition signal${
      sharedConditions === 1 ? "" : "s"
    } also supporting the primary prediction.`;
  }

  if (
    primary.predictionType ===
    competing.predictionType
  ) {
    return `This prediction represents another plausible ${competing.predictionType} outcome within the current organizational system.`;
  }

  return `This prediction represents a different plausible future-state pathway supported by current organizational cognition.`;
}

function competingLossReason(params: {
  primary: OrganizationalPrediction;
  competing: OrganizationalPrediction;
}): string {
  const { primary, competing } = params;

  if (
    competing.confidence <
    primary.confidence - 0.08
  ) {
    return "It has materially lower reasoning confidence than the primary prediction.";
  }

  if (
    competing.likelihood <
    primary.likelihood - 0.08
  ) {
    return "Discovery currently considers the outcome less likely than the primary prediction.";
  }

  if (
    severityScore(competing.severity) <
    severityScore(primary.severity)
  ) {
    return "It currently carries lower executive severity than the primary prediction.";
  }

  if (
    statusScore(competing.status) <
    statusScore(primary.status)
  ) {
    return "It has less longitudinal support or maturity than the primary prediction.";
  }

  return "It ranked slightly below the primary prediction across confidence, likelihood, severity, maturity, and executive relevance.";
}

function buildCompetingPredictions(
  primary: OrganizationalPrediction,
  predictions: OrganizationalPrediction[],
): CompetingPrediction[] {
  return predictions
    .filter(
      (prediction) =>
        prediction.id !== primary.id,
    )
    .slice(0, 4)
    .map((prediction) => ({
      predictionId: prediction.id,
      statement: prediction.statement,
      predictionType:
        prediction.predictionType,
      confidence: prediction.confidence,
      likelihood: prediction.likelihood,
      reasonItWasConsidered:
        competingReason({
          primary,
          competing: prediction,
        }),
      reasonItWasNotSelected:
        competingLossReason({
          primary,
          competing: prediction,
        }),
    }));
}

function confidenceExplanation(
  prediction: OrganizationalPrediction,
): string {
  const confidencePercent = Math.round(
    prediction.confidence * 100,
  );

  const likelihoodPercent = Math.round(
    prediction.likelihood * 100,
  );

  const maturityExplanation =
    prediction.status === "proposed"
      ? "The prediction remains provisional because Discovery has limited longitudinal evidence."
      : prediction.status === "strengthening"
        ? "The prediction is strengthening because new evidence continues to support the expected outcome."
        : prediction.status === "weakening"
          ? "The prediction is weakening because recent evidence has reduced support for the expected outcome."
          : prediction.status === "confirmed"
            ? "The prediction has been confirmed by subsequent organizational evidence."
            : "The prediction remains active and supported by current organizational cognition.";

  const limiterExplanation =
    prediction.confidenceLimiters.length > 0
      ? ` Confidence is limited by ${prediction.confidenceLimiters.length} identified uncertainty factor${
          prediction.confidenceLimiters.length ===
          1
            ? ""
            : "s"
        }.`
      : "";

  return `Discovery assigns ${confidencePercent}% confidence to the reasoning behind this prediction and estimates the outcome at ${likelihoodPercent}% likelihood. ${maturityExplanation}${limiterExplanation}`;
}

function recommendationForPrediction(
  prediction: OrganizationalPrediction,
): string {
  const primaryCondition =
    prediction.sourceConditionIds[0]
      ? humanizeId(
          prediction.sourceConditionIds[0],
        )
      : "the predicted condition";

  switch (prediction.predictionType) {
    case "deterioration":
      return `Treat ${primaryCondition} as an emerging future risk. Prioritize evidence and intervention that could prevent further deterioration while monitoring the prediction's falsifying signals.`;

    case "propagation":
      return `Monitor the downstream conditions in the causal path and identify where leadership can interrupt propagation before the predicted pressure compounds.`;

    case "improvement":
      return `Protect the conditions supporting improvement and continue collecting evidence to determine whether the positive trajectory is durable.`;

    case "continuation":
      return `Treat the current condition as likely to persist unless meaningful intervention occurs. Collect the evidence required to confirm, weaken, or falsify this prediction.`;
  }
}

function emptyPredictionReflection(): PredictionReflection {
  return {
    id: "prediction-reflection-none",

    primaryPredictionId: null,
    primaryPrediction: null,
    predictionType: null,
    status: null,
    severity: null,

    confidence: 0,
    likelihood: 0,

    whyDiscoveryPredictsThis:
      "Discovery does not currently have a sufficiently supported organizational prediction.",

    supportingConditions: [],
    supportingConcepts: [],
    supportingBeliefs: [],
    supportingTheories: [],

    causalPath: [],
    competingPredictions: [],
    assumptions: [],
    confidenceLimiters: [],
    falsifyingEvidence: [],

    calibratedConfidenceExplanation:
      "Discovery needs additional longitudinal organizational evidence before selecting a primary prediction.",

    executiveRecommendation:
      "Continue collecting longitudinal evidence before making a future-state judgment.",
  };
}

export function buildPredictionReflection(
  input: BuildPredictionReflectionInput,
): PredictionReflection {
  const rankedPredictions = rankPredictions({
    predictions: input.predictions ?? [],
    priorityConditionIds:
      input.priorityConditionIds,
  });

  const primaryPrediction =
    rankedPredictions[0];

  if (!primaryPrediction) {
    return emptyPredictionReflection();
  }

  const conditionLabels =
    input.labels?.conditionLabels;
  const conceptLabels =
    input.labels?.conceptLabels;
  const beliefLabels =
    input.labels?.beliefLabels;
  const theoryLabels =
    input.labels?.theoryLabels;

  const supportingConditions =
    buildSupportingEvidence({
      ids: primaryPrediction.sourceConditionIds,
      labels: conditionLabels,
      rationale:
        "This condition is a direct source of the predicted future state.",
      confidence:
        primaryPrediction.confidence,
    });

  const supportingConcepts =
    buildSupportingEvidence({
      ids: primaryPrediction.sourceConceptIds,
      labels: conceptLabels,
      rationale:
        "This concept contributes reusable organizational meaning supporting the prediction.",
    });

  const supportingBeliefs =
    buildSupportingEvidence({
      ids: primaryPrediction.sourceBeliefIds,
      labels: beliefLabels,
      rationale:
        "This organizational belief supports the expected future-state trajectory.",
    });

  const supportingTheories =
    buildSupportingEvidence({
      ids: primaryPrediction.sourceTheoryIds,
      labels: theoryLabels,
      rationale:
        "This organizational theory helps explain why the predicted outcome may occur.",
    });

  const sourceSummary = [
    supportingConditions.length > 0
      ? `${supportingConditions.length} condition${
          supportingConditions.length === 1
            ? ""
            : "s"
        }`
      : "",
    supportingConcepts.length > 0
      ? `${supportingConcepts.length} concept${
          supportingConcepts.length === 1
            ? ""
            : "s"
        }`
      : "",
    supportingBeliefs.length > 0
      ? `${supportingBeliefs.length} belief${
          supportingBeliefs.length === 1
            ? ""
            : "s"
        }`
      : "",
    supportingTheories.length > 0
      ? `${supportingTheories.length} theor${
          supportingTheories.length === 1
            ? "y"
            : "ies"
        }`
      : "",
  ]
    .filter(Boolean)
    .join(", ");

  const whyDiscoveryPredictsThis =
    `${primaryPrediction.explanation} ` +
    `Discovery selected this as the primary prediction because it ranked highest across confidence, likelihood, severity, maturity, and executive relevance.` +
    (sourceSummary
      ? ` It is supported by ${sourceSummary}.`
      : "");

  return {
    id: `prediction-reflection-${primaryPrediction.id}`,

    primaryPredictionId:
      primaryPrediction.id,

    primaryPrediction:
      primaryPrediction.statement,

    predictionType:
      primaryPrediction.predictionType,

    status:
      primaryPrediction.status,

    severity:
      primaryPrediction.severity,

    confidence:
      primaryPrediction.confidence,

    likelihood:
      primaryPrediction.likelihood,

    whyDiscoveryPredictsThis,

    supportingConditions,
    supportingConcepts,
    supportingBeliefs,
    supportingTheories,

    causalPath:
      primaryPrediction.causalPath,

    competingPredictions:
      buildCompetingPredictions(
        primaryPrediction,
        rankedPredictions,
      ),

    assumptions:
      unique(primaryPrediction.assumptions),

    confidenceLimiters:
      unique(
        primaryPrediction.confidenceLimiters,
      ),

    falsifyingEvidence:
      unique(
        primaryPrediction.falsifyingEvidence,
      ),

    calibratedConfidenceExplanation:
      confidenceExplanation(
        primaryPrediction,
      ),

    executiveRecommendation:
      recommendationForPrediction(
        primaryPrediction,
      ),
  };
}