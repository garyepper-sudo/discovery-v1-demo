import type {
  ExecutiveAssessmentWithPrimaryJudgment,
} from "../judgment/buildExecutiveAssessment";

import type {
  OrganizationalCondition,
  OrganizationalState,
} from "../state/inferOrganizationalConditions";

import {
  buildRecommendedExecutiveObjective,
} from "./buildRecommendedExecutiveObjective";

import {
  buildRecommendedExecutiveStrategy,
} from "./buildRecommendedExecutiveStrategy";

import {
  buildRecommendedExecutiveIntervention,
} from "./buildRecommendedExecutiveIntervention";

import type {
  ExecutiveRecommendation,
} from "./executiveRecommendationTypes";

type BuildExecutiveRecommendationInput = {
  executiveAssessment:
    ExecutiveAssessmentWithPrimaryJudgment;

  organizationalState:
    OrganizationalState;

  organizationalConditions:
    OrganizationalCondition[];

  now?:
    string;
};

function clamp01(
  value: number,
): number {
  return Math.max(
    0,
    Math.min(
      1,
      value,
    ),
  );
}

function unique(
  values: string[],
): string[] {
  return Array.from(
    new Set(
      values.filter(
        (value) =>
          value.trim().length >
          0,
      ),
    ),
  );
}

export function buildExecutiveRecommendation(
  input: BuildExecutiveRecommendationInput,
): ExecutiveRecommendation {
  const now =
    input.now ??
    new Date()
      .toISOString();

  const objective =
    buildRecommendedExecutiveObjective({
      executiveAssessment:
        input.executiveAssessment,

      organizationalState:
        input.organizationalState,

      organizationalConditions:
        input.organizationalConditions,

      now,
    });

  const strategy =
    buildRecommendedExecutiveStrategy({
      executiveAssessment:
        input.executiveAssessment,

      objective,

      organizationalConditions:
        input.organizationalConditions,

      now,
    });

  const intervention =
    buildRecommendedExecutiveIntervention({
      executiveAssessment:
        input.executiveAssessment,

      objective,

      strategy,

      organizationalConditions:
        input.organizationalConditions,

      now,
    });

  const supportingConditionIds =
    unique([
      ...objective
        .supportingConditionIds,

      ...intervention
        .supportingConditionIds,

      ...strategy
        .strategies
        .flatMap(
          (item) =>
            item.supportingConditionIds,
        ),
    ]);

  const confidence =
    clamp01(
      (
        objective.confidence +
        strategy.confidence +
        intervention.confidence
      ) / 3,
    );

  const rationale = [
    intervention.rationale,

    ...strategy.strategies.map(
      (item) =>
        item.rationale,
    ),

    objective.rationale,
  ]
    .filter(
      (
        value,
      ): value is string =>
        typeof value ===
          "string" &&
        value.trim().length >
          0,
    )
    .join(
      " ",
    );

  const executiveRecommendation =
    [
      intervention
        .executiveIntervention,

      ...intervention
        .supportingActions,
    ]
      .filter(
        (value) =>
          value.trim().length >
          0,
      )
      .join(
        " ",
      );

  return {
    id:
      `executive-recommendation-${intervention.id}`,

    headline:
      intervention.headline,

    executiveRecommendation,

    objective,

    strategy,

    intervention,

    rationale,

    supportingAssessmentId:
      objective
        .supportingAssessmentId,

    supportingConditionIds,

    confidence,

    uncertaintySummary:
      intervention
        .uncertaintySummary,

    boundaries: {
      doesNotOptimize:
        true,

      doesNotSimulate:
        true,

      doesNotProduceImplementationPlan:
        true,
    },

    createdAt:
      now,
  };
}

export type {
  BuildExecutiveRecommendationInput,
};