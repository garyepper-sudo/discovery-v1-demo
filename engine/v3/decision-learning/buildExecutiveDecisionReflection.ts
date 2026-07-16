import type {
  ExecutiveDecisionOutcome,
} from "../model/decision-learning/executiveDecisionOutcome";

import type {
  ExecutiveDecisionReflection,
} from "../model/decision-learning/executiveDecisionReflection";

import type {
  ExecutiveScenarioResult,
} from "../scenarios/runExecutiveScenario";

export type BuildExecutiveDecisionReflectionInput = {
  outcome:
    ExecutiveDecisionOutcome;

  expectedScenario:
    ExecutiveScenarioResult;

  createdAt?: string;
};

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
        .map(
          (value) =>
            value.trim(),
        )
        .filter(Boolean),
    ),
  );
}

function buildAssessment(
  outcome:
    ExecutiveDecisionOutcome,
): ExecutiveDecisionReflection["assessment"] {
  switch (outcome.outcome) {
    case "successful":
      return "validated";

    case "partially-successful":
    case "unknown":
      return "partially-validated";

    case "unsuccessful":
      return "invalidated";
  }
}

function buildRationale(
  outcome:
    ExecutiveDecisionOutcome,
): string {
  const parts: string[] = [];

  parts.push(
    `${outcome.improvedConditionIds.length} condition(s) improved, ${outcome.worsenedConditionIds.length} worsened, and ${outcome.unchangedConditionIds.length} remained unchanged.`,
  );

  parts.push(
    `${outcome.achievedSuccessMetrics.length} success metric(s) were achieved and ${outcome.missedSuccessMetrics.length} were missed.`,
  );

  parts.push(
    `${outcome.validatedPredictionIds.length} prediction(s) were validated and ${outcome.invalidatedPredictionIds.length} were invalidated.`,
  );

  parts.push(
    `${outcome.validatedAssumptions.length} assumption(s) were validated and ${outcome.invalidatedAssumptions.length} were invalidated.`,
  );

  return parts.join(" ");
}

function extractTheoryIds(
  expectedScenario:
    ExecutiveScenarioResult,
): string[] {
  return unique(
    expectedScenario
      .scenario
      .projectedUnderstandingCandidates
      .flatMap(
        (candidate) =>
          candidate.themeIds,
      )
      .filter(
        (id): id is string =>
          typeof id ===
          "string" &&
          id.trim().length > 0,
      ),
  );
}

function extractMechanismIds(
  expectedScenario:
    ExecutiveScenarioResult,
): string[] {
  return unique(
    [
      ...expectedScenario
        .intervention
        .expectedMechanismIds,

      ...expectedScenario
        .scenario
        .projectedUnderstandingCandidates
        .flatMap(
          (candidate) =>
            candidate.mechanismIds,
        ),
    ].filter(
      (id): id is string =>
        typeof id ===
        "string" &&
        id.trim().length > 0,
    ),
  );
}

function buildKeyLearning(
  outcome:
    ExecutiveDecisionOutcome,
  expectedScenario:
    ExecutiveScenarioResult,
): string {
  const interventionTitle =
    expectedScenario
      .intervention
      .title;

  if (
    outcome.outcome ===
    "successful"
  ) {
    return `${interventionTitle} produced an observed outcome consistent with the expected organizational direction and should be treated as a supported intervention pattern under similar conditions.`;
  }

  if (
    outcome.outcome ===
    "partially-successful"
  ) {
    return `${interventionTitle} produced mixed results. Future use should preserve the validated elements while addressing the missed metrics, invalidated predictions, and worsening conditions.`;
  }

  if (
    outcome.outcome ===
    "unsuccessful"
  ) {
    return `${interventionTitle} did not produce the expected organizational outcome and should not be reused without revising the underlying assumptions, causal model, or implementation conditions.`;
  }

  return `${interventionTitle} remains unresolved because the available observed evidence is not yet sufficient to determine whether the decision reasoning was correct.`;
}

function buildFutureRecommendation(
  outcome:
    ExecutiveDecisionOutcome,
  expectedScenario:
    ExecutiveScenarioResult,
): string {
  const interventionTitle =
    expectedScenario
      .intervention
      .title;

  switch (outcome.outcome) {
    case "successful":
      return `Consider ${interventionTitle} in future decisions with similar organizational conditions, while continuing to validate the assumptions and evidence that supported this result.`;

    case "partially-successful":
      return `Use ${interventionTitle} cautiously in similar decisions and explicitly mitigate the conditions, metrics, predictions, or assumptions that did not validate.`;

    case "unsuccessful":
      return `Do not reuse ${interventionTitle} as currently represented until Discovery identifies why observed reality diverged from the expected scenario.`;

    case "unknown":
      return `Collect additional post-decision evidence before using ${interventionTitle} as a reusable executive pattern.`;
  }
}

function buildConfidence(
  outcome:
    ExecutiveDecisionOutcome,
): number {
  const evaluatedReasoningCount =
    outcome.validatedPredictionIds.length +
    outcome.invalidatedPredictionIds.length +
    outcome.validatedAssumptions.length +
    outcome.invalidatedAssumptions.length;

  const agreementCount =
    outcome.validatedPredictionIds.length +
    outcome.validatedAssumptions.length;

  const reasoningAgreement =
    evaluatedReasoningCount === 0
      ? 0.5
      : agreementCount /
        evaluatedReasoningCount;

  return clamp01(
    outcome.confidence *
      0.7 +
    reasoningAgreement *
      0.3,
  );
}

function buildReflectionId(
  outcomeId: string,
  createdAt: string,
): string {
  return [
    "executive-decision-reflection",
    outcomeId,
    createdAt,
  ].join("-");
}

/**
 * Interprets one completed Executive Decision Outcome.
 *
 * This producer performs no new simulation, prediction generation,
 * intervention evaluation, or organizational-state synthesis.
 *
 * It converts observed outcome evidence into a structured reflection
 * that downstream Decision Learning can reuse.
 */
export function buildExecutiveDecisionReflection({
  outcome,
  expectedScenario,
  createdAt =
    new Date().toISOString(),
}: BuildExecutiveDecisionReflectionInput): ExecutiveDecisionReflection {
  if (
    outcome.organizationId !==
    expectedScenario
      .simulatedOrganizationState
      .organizationId
  ) {
    throw new Error(
      "Executive Decision Outcome and expected scenario must belong to the same organization.",
    );
  }

  if (
    outcome.interventionId !==
    expectedScenario
      .intervention
      .id
  ) {
    throw new Error(
      "Executive Decision Outcome must correspond to the expected scenario intervention.",
    );
  }

  const assessment =
    buildAssessment(
      outcome,
    );

  const mechanismIds =
    extractMechanismIds(
      expectedScenario,
    );

  const theoryIds =
    extractTheoryIds(
      expectedScenario,
    );

  const reasoningValidated =
    assessment ===
      "validated";

  const reasoningInvalidated =
    assessment ===
      "invalidated";

  return {
    id:
      buildReflectionId(
        outcome.id,
        createdAt,
      ),

    executiveDecisionOutcomeId:
      outcome.id,

    assessment,

    rationale:
      buildRationale(
        outcome,
      ),

    validatedPredictions:
      unique(
        outcome
          .validatedPredictionIds,
      ),

    invalidatedPredictions:
      unique(
        outcome
          .invalidatedPredictionIds,
      ),

    validatedAssumptions:
      unique(
        outcome
          .validatedAssumptions,
      ),

    invalidatedAssumptions:
      unique(
        outcome
          .invalidatedAssumptions,
      ),

    unexpectedFindings:
      unique(
        outcome
          .unexpectedEffects,
      ),

    reinforcedMechanismIds:
      reasoningValidated
        ? mechanismIds
        : [],

    weakenedMechanismIds:
      reasoningInvalidated
        ? mechanismIds
        : [],

    reinforcedTheoryIds:
      reasoningValidated
        ? theoryIds
        : [],

    weakenedTheoryIds:
      reasoningInvalidated
        ? theoryIds
        : [],

    keyLearning:
      buildKeyLearning(
        outcome,
        expectedScenario,
      ),

    futureRecommendation:
      buildFutureRecommendation(
        outcome,
        expectedScenario,
      ),

    confidence:
      buildConfidence(
        outcome,
      ),

    createdAt,
  };
}
