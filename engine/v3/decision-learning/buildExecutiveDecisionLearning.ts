import type {
  ExecutiveDecision,
} from "../model/simulate/executiveDecision";

import type {
  OrganizationalIntervention,
} from "../model/simulate/organizationalIntervention";

import type {
  ExecutiveDecisionReflection,
} from "../model/decision-learning/executiveDecisionReflection";

import type {
  ExecutiveDecisionLearning,
  ExecutiveDecisionLearningType,
} from "../model/decision-learning/executiveDecisionLearning";

export type BuildExecutiveDecisionLearningInput = {
  executiveDecision:
    ExecutiveDecision;

  intervention:
    OrganizationalIntervention;

  reflection:
    ExecutiveDecisionReflection;

  createdAt?: string;

  existingSupportCount?: number;
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

function determineLearningType(
  reflection:
    ExecutiveDecisionReflection,
): ExecutiveDecisionLearningType {
  if (
    reflection
      .invalidatedAssumptions
      .length > 0
  ) {
    return "assumption-quality";
  }

  if (
    reflection
      .invalidatedPredictions
      .length > 0
  ) {
    return "prediction-quality";
  }

  if (
    reflection
      .weakenedMechanismIds
      .length > 0 ||
    reflection
      .reinforcedMechanismIds
      .length > 0
  ) {
    return "mechanism-validity";
  }

  if (
    reflection
      .weakenedTheoryIds
      .length > 0 ||
    reflection
      .reinforcedTheoryIds
      .length > 0
  ) {
    return "theory-validity";
  }

  return "intervention-effectiveness";
}

function buildStatement(params: {
  reflection:
    ExecutiveDecisionReflection;

  intervention:
    OrganizationalIntervention;
}): string {
  const {
    reflection,
    intervention,
  } = params;

  switch (
    reflection.assessment
  ) {
    case "validated":
      return `${intervention.title} is a supported intervention pattern under organizational conditions similar to those represented by this decision.`;

    case "partially-validated":
      return `${intervention.title} may be useful under similar conditions, but its effectiveness depends on resolving the assumptions, predictions, or trade-offs that did not fully validate.`;

    case "invalidated":
      return `${intervention.title} should not be reused under similar conditions without revising the underlying assumptions, causal explanation, or implementation design.`;
  }
}

function buildRationale(params: {
  reflection:
    ExecutiveDecisionReflection;

  intervention:
    OrganizationalIntervention;
}): string {
  const {
    reflection,
    intervention,
  } = params;

  const parts: string[] = [
    reflection.keyLearning,
    reflection.rationale,
  ];

  if (
    reflection
      .reinforcedMechanismIds
      .length > 0
  ) {
    parts.push(
      `${reflection.reinforcedMechanismIds.length} mechanism(s) were reinforced by the observed outcome.`,
    );
  }

  if (
    reflection
      .weakenedMechanismIds
      .length > 0
  ) {
    parts.push(
      `${reflection.weakenedMechanismIds.length} mechanism(s) were weakened by the observed outcome.`,
    );
  }

  if (
    reflection
      .reinforcedTheoryIds
      .length > 0
  ) {
    parts.push(
      `${reflection.reinforcedTheoryIds.length} theory or theories were reinforced.`,
    );
  }

  if (
    reflection
      .weakenedTheoryIds
      .length > 0
  ) {
    parts.push(
      `${reflection.weakenedTheoryIds.length} theory or theories were weakened.`,
    );
  }

  parts.push(
    `This learning applies to the ${intervention.type} intervention category represented by "${intervention.title}".`,
  );

  return unique(
    parts,
  ).join(" ");
}

function confidenceAdjustment(
  reflection:
    ExecutiveDecisionReflection,
): number {
  const baseMagnitude =
    clamp01(
      reflection.confidence,
    ) *
    0.2;

  switch (
    reflection.assessment
  ) {
    case "validated":
      return baseMagnitude;

    case "partially-validated":
      return 0;

    case "invalidated":
      return -baseMagnitude;
  }
}

function determineStatus(params: {
  reflection:
    ExecutiveDecisionReflection;

  supportCount: number;
}): ExecutiveDecisionLearning["status"] {
  const {
    reflection,
    supportCount,
  } = params;

  if (
    reflection.assessment ===
      "invalidated" &&
    supportCount > 1
  ) {
    return "weakened";
  }

  if (
    supportCount >= 3 &&
    reflection.confidence >=
      0.8
  ) {
    return "canonical";
  }

  if (
    supportCount >= 2 &&
    reflection.confidence >=
      0.65
  ) {
    return "supported";
  }

  return "provisional";
}

function buildLearningId(params: {
  organizationId: string;

  executiveDecisionId: string;

  reflectionId: string;

  createdAt: string;
}): string {
  return [
    "executive-decision-learning",
    params.organizationId,
    params.executiveDecisionId,
    params.reflectionId,
    params.createdAt,
  ].join("-");
}

/**
 * Converts one Executive Decision Reflection into reusable decision learning.
 *
 * This producer does not re-evaluate the decision outcome, rerun simulation,
 * alter mechanisms or theories, or update persistent memory.
 *
 * It classifies the lesson, preserves where it applies, records confidence
 * effects, and produces one canonical ExecutiveDecisionLearning object for
 * downstream memory and playbook synthesis.
 */
export function buildExecutiveDecisionLearning({
  executiveDecision,
  intervention,
  reflection,
  createdAt =
    new Date().toISOString(),
  existingSupportCount = 0,
}: BuildExecutiveDecisionLearningInput): ExecutiveDecisionLearning {
  if (
    executiveDecision.organizationId !==
    intervention.organizationId
  ) {
    throw new Error(
      "Executive Decision and Organizational Intervention must belong to the same organization.",
    );
  }

  if (
    !Number.isInteger(
      existingSupportCount,
    ) ||
    existingSupportCount < 0
  ) {
    throw new Error(
      "existingSupportCount must be a non-negative integer.",
    );
  }

  const supportCount =
    existingSupportCount + 1;

  const type =
    determineLearningType(
      reflection,
    );

  return {
    id:
      buildLearningId({
        organizationId:
          executiveDecision.organizationId,

        executiveDecisionId:
          executiveDecision.id,

        reflectionId:
          reflection.id,

        createdAt,
      }),

    organizationId:
      executiveDecision.organizationId,

    executiveDecisionReflectionId:
      reflection.id,

    executiveDecisionId:
      executiveDecision.id,

    type,

    statement:
      buildStatement({
        reflection,
        intervention,
      }),

    rationale:
      buildRationale({
        reflection,
        intervention,
      }),

    applicableInterventionTypes: [
      intervention.type,
    ],

    applicableConditionIds:
      unique([
        ...executiveDecision
          .targetConditionIds,

        ...intervention
          .affectedConditionIds,
      ]),

    applicableConstraintTypes:
      unique(
        executiveDecision
          .constraints
          .map(
            (constraint) =>
              constraint.type,
          ),
      ),

    reinforcedMechanismIds:
      unique(
        reflection
          .reinforcedMechanismIds,
      ),

    weakenedMechanismIds:
      unique(
        reflection
          .weakenedMechanismIds,
      ),

    reinforcedTheoryIds:
      unique(
        reflection
          .reinforcedTheoryIds,
      ),

    weakenedTheoryIds:
      unique(
        reflection
          .weakenedTheoryIds,
      ),

    confidenceAdjustment:
      confidenceAdjustment(
        reflection,
      ),

    confidence:
      clamp01(
        reflection.confidence,
      ),

    supportCount,

    status:
      determineStatus({
        reflection,
        supportCount,
      }),

    createdAt,

    updatedAt:
      createdAt,
  };
}
