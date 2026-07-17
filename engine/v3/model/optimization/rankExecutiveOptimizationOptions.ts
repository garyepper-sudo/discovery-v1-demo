import type {
  ExecutiveOptimizationOptionScore,
  ExecutiveOptimizationScoreSet,
} from "./executiveOptimizationScoreTypes";

import type {
  ExecutiveOptimizationRankedOption,
  ExecutiveOptimizationRanking,
} from "./executiveOptimizationRankingTypes";

export type RankExecutiveOptimizationOptionsInput = {
  scoreSet:
    ExecutiveOptimizationScoreSet;

  now?:
    string;
};

function compareScores(
  left:
    ExecutiveOptimizationOptionScore,

  right:
    ExecutiveOptimizationOptionScore,
): number {
  if (
    left.feasible !==
    right.feasible
  ) {
    return left.feasible
      ? -1
      : 1;
  }

  if (
    right.finalScore !==
    left.finalScore
  ) {
    return (
      right.finalScore -
      left.finalScore
    );
  }

  const leftOption =
    left
      .optionConstraintResult
      .option;

  const rightOption =
    right
      .optionConstraintResult
      .option;

  if (
    right.baseScore !==
    left.baseScore
  ) {
    return (
      right.baseScore -
      left.baseScore
    );
  }

  if (
    right
      .optionConstraintResult
      .feasibilityScore !==
    left
      .optionConstraintResult
      .feasibilityScore
  ) {
    return (
      right
        .optionConstraintResult
        .feasibilityScore -
      left
        .optionConstraintResult
        .feasibilityScore
    );
  }

  if (
    leftOption
      .implementationRisk !==
    rightOption
      .implementationRisk
  ) {
    return (
      leftOption
        .implementationRisk -
      rightOption
        .implementationRisk
    );
  }

  return leftOption.title.localeCompare(
    rightOption.title,
  );
}

function buildReason(
  score:
    ExecutiveOptimizationOptionScore,

  nextScore?:
    ExecutiveOptimizationOptionScore,
): string {
  const option =
    score
      .optionConstraintResult
      .option;

  if (
    !score.feasible
  ) {
    const violationCount =
      score
        .optionConstraintResult
        .violatedConstraintIds
        .length;

    return `${option.title} ranks below all feasible options because it violates ${violationCount} required constraint${violationCount === 1 ? "" : "s"} and receives an infeasibility penalty.`;
  }

  if (
    !nextScore
  ) {
    return `${option.title} is feasible and retains its position based on its transparent optimization score.`;
  }

  const nextOption =
    nextScore
      .optionConstraintResult
      .option;

  if (
    !nextScore.feasible
  ) {
    return `${option.title} outranks ${nextOption.title} because feasible options are preferred over options that violate required constraints.`;
  }

  const scoreDifference =
    score.finalScore -
    nextScore.finalScore;

  if (
    scoreDifference >
    0
  ) {
    return `${option.title} outranks ${nextOption.title} by ${scoreDifference.toFixed(3)} because its combined value, feasibility, risk, reversibility, confidence, and uncertainty profile is stronger under current preferences.`;
  }

  return `${option.title} is ordered ahead of ${nextOption.title} through deterministic tie-breaking using base score, feasibility, implementation risk, and title.`;
}

export function rankExecutiveOptimizationOptions(
  input:
    RankExecutiveOptimizationOptionsInput,
): ExecutiveOptimizationRanking {
  const now =
    input.now ??
    new Date()
      .toISOString();

  const scoreSet =
    input.scoreSet;

  const orderedScores =
    [
      ...scoreSet.scores,
    ].sort(
      compareScores,
    );

  const rankedOptions:
    ExecutiveOptimizationRankedOption[] =
    orderedScores.map(
      (
        score,
        index,
      ) => {
        const lowerRankedScores =
          orderedScores.slice(
            index + 1,
          );

        const nextScore =
          lowerRankedScores[0];

        return {
          rank:
            index + 1,

          score,

          feasible:
            score.feasible,

          reason:
            buildReason(
              score,
              nextScore,
            ),

          outranksOptionIds:
            lowerRankedScores.map(
              (lowerScore) =>
                lowerScore
                  .optionConstraintResult
                  .option
                  .id,
            ),
        };
      },
    );

  const preferredOption =
    rankedOptions.find(
      (rankedOption) =>
        rankedOption.feasible,
    ) ??
    null;

  const rationale =
    preferredOption
      ? `${preferredOption.score.optionConstraintResult.option.title} is the preferred optimized option because it is the highest-scoring feasible alternative under the current constraints, preferences, confidence, and uncertainty.`
      : "No option is currently preferred because all options violate required constraints.";

  return {
    id:
      `executive-optimization-ranking-${scoreSet.id}`,

    scoreSet,

    rankedOptions,

    preferredOption,

    rationale,

    boundaries: {
      doesNotRecordExecutiveDecision:
        true,

      doesNotSimulate:
        true,

      doesNotExecuteIntervention:
        true,
    },

    createdAt:
      now,
  };
}
