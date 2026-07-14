import type {
  ExecutiveScenarioResult,
} from "../scenarios/runExecutiveScenario";

type ScenarioRecommendation =
  ExecutiveScenarioResult["comparison"]["recommendation"];

type ConditionChange =
  ExecutiveScenarioResult["comparison"]["conditionChanges"][number];

type PredictionChange =
  ExecutiveScenarioResult["comparison"]["predictionChanges"][number];

export type ExecutiveScenarioComparisonEntry = {
  interventionId: string;

  interventionTitle: string;

  scenarioId: string;

  targetConditionChanges: ConditionChange[];

  improvedConditionIds: string[];

  worsenedConditionIds: string[];

  unchangedConditionIds: string[];

  addedPredictionIds: string[];

  removedPredictionIds: string[];

  unchangedPredictionIds: string[];

  executiveRecommendation:
    ScenarioRecommendation;

  scenarioConfidence: number;

  interventionConfidence: number;

  assumptions: string[];

  executiveSummary: string;
};

export type ExecutiveScenarioComparisonSet = {
  baselineOrganizationId: string;

  scenarioComparisons:
    ExecutiveScenarioComparisonEntry[];

  sharedImprovedConditionIds: string[];

  sharedWorsenedConditionIds: string[];

  sharedAssumptions: string[];

  differentiatingConditionIds: string[];

  differentiatingRecommendations: boolean;

  generatedAt: string;
};

export type CompareExecutiveScenariosInput = {
  scenarios: ExecutiveScenarioResult[];

  generatedAt?: string;
};

function intersection(
  collections: string[][],
): string[] {
  if (collections.length === 0) {
    return [];
  }

  const [first, ...rest] =
    collections;

  return first.filter((value) =>
    rest.every((collection) =>
      collection.includes(value),
    ),
  );
}

function unique(
  values: string[],
): string[] {
  return Array.from(
    new Set(values),
  );
}

function buildComparisonEntry(
  scenario: ExecutiveScenarioResult,
): ExecutiveScenarioComparisonEntry {
  const conditionChanges =
    scenario.comparison.conditionChanges;

  const predictionChanges =
    scenario.comparison.predictionChanges;

  return {
    interventionId:
      scenario.intervention.id,

    interventionTitle:
      scenario.intervention.title,

    scenarioId:
      scenario.simulatedOrganizationState.id,

    targetConditionChanges:
      conditionChanges.filter((change) =>
        scenario.intervention
          .affectedConditionIds.includes(
            change.conditionId,
          ),
      ),

    improvedConditionIds:
      conditionChanges
        .filter(
          (change) =>
            change.change ===
            "improved",
        )
        .map(
          (change) =>
            change.conditionId,
        ),

    worsenedConditionIds:
      conditionChanges
        .filter(
          (change) =>
            change.change ===
            "worsened",
        )
        .map(
          (change) =>
            change.conditionId,
        ),

    unchangedConditionIds:
      conditionChanges
        .filter(
          (change) =>
            change.change ===
            "unchanged",
        )
        .map(
          (change) =>
            change.conditionId,
        ),

    addedPredictionIds:
      predictionChanges
        .filter(
          (change) =>
            change.change ===
            "added",
        )
        .map(
          (change) =>
            change.predictionId,
        ),

    removedPredictionIds:
      predictionChanges
        .filter(
          (change) =>
            change.change ===
            "removed",
        )
        .map(
          (change) =>
            change.predictionId,
        ),

    unchangedPredictionIds:
      predictionChanges
        .filter(
          (change) =>
            change.change ===
            "unchanged",
        )
        .map(
          (change) =>
            change.predictionId,
        ),

    executiveRecommendation:
      scenario.comparison
        .recommendation,

    scenarioConfidence:
      scenario.comparison
        .confidence,

    interventionConfidence:
      scenario.intervention
        .confidence,

    assumptions:
      scenario.intervention
        .assumptions,

    executiveSummary:
      scenario.comparison
        .executiveSummary,
  };
}

/**
 * Compares completed executive scenarios without ranking them.
 *
 * This producer preserves the result of each scenario, identifies shared
 * outcomes, and surfaces the factors that differentiate the available
 * interventions.
 */
export function compareExecutiveScenarios({
  scenarios,
  generatedAt =
    new Date().toISOString(),
}: CompareExecutiveScenariosInput): ExecutiveScenarioComparisonSet {
  if (scenarios.length === 0) {
    throw new Error(
      "At least one executive scenario is required for comparison.",
    );
  }

  const organizationIds =
    unique(
      scenarios.map(
        (scenario) =>
          scenario
            .simulatedOrganizationState
            .organizationId,
      ),
    );

  if (organizationIds.length !== 1) {
    throw new Error(
      "All executive scenarios must use the same baseline organization.",
    );
  }

  const scenarioComparisons =
    scenarios.map(
      buildComparisonEntry,
    );

  const sharedImprovedConditionIds =
    intersection(
      scenarioComparisons.map(
        (comparison) =>
          comparison
            .improvedConditionIds,
      ),
    );

  const sharedWorsenedConditionIds =
    intersection(
      scenarioComparisons.map(
        (comparison) =>
          comparison
            .worsenedConditionIds,
      ),
    );

  const sharedAssumptions =
    intersection(
      scenarioComparisons.map(
        (comparison) =>
          comparison.assumptions,
      ),
    );

  const allConditionIds =
    unique(
      scenarioComparisons.flatMap(
        (comparison) => [
          ...comparison
            .improvedConditionIds,

          ...comparison
            .worsenedConditionIds,

          ...comparison
            .unchangedConditionIds,
        ],
      ),
    );

  const differentiatingConditionIds =
    allConditionIds.filter(
      (conditionId) => {
        const outcomes =
          unique(
            scenarioComparisons.map(
              (comparison) => {
                if (
                  comparison
                    .improvedConditionIds
                    .includes(
                      conditionId,
                    )
                ) {
                  return "improved";
                }

                if (
                  comparison
                    .worsenedConditionIds
                    .includes(
                      conditionId,
                    )
                ) {
                  return "worsened";
                }

                return "unchanged";
              },
            ),
          );

        return outcomes.length > 1;
      },
    );

  const differentiatingRecommendations =
    unique(
      scenarioComparisons.map(
        (comparison) =>
          comparison
            .executiveRecommendation,
      ),
    ).length > 1;

  return {
    baselineOrganizationId:
      organizationIds[0],

    scenarioComparisons,

    sharedImprovedConditionIds,

    sharedWorsenedConditionIds,

    sharedAssumptions,

    differentiatingConditionIds,

    differentiatingRecommendations,

    generatedAt,
  };
}