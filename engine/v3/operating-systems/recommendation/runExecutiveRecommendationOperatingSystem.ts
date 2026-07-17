import {
  buildExecutiveRecommendation,
} from "../../model/recommendation/buildExecutiveRecommendation";

import type {
  ExecutiveRecommendation,
} from "../../model/recommendation/executiveRecommendationTypes";

import type {
  ExecutiveAssessmentWithPrimaryJudgment,
} from "../../model/judgment/buildExecutiveAssessment";

import type {
  OrganizationalCondition,
  OrganizationalState,
} from "../../model/state/inferOrganizationalConditions";

import type {
  OrganizationRuntime,
} from "../../runtime/organizationRuntime";

export type ExecutiveRecommendationRuntimeMemory = {
  executiveAssessment?:
    ExecutiveAssessmentWithPrimaryJudgment;

  organizationalState?:
    OrganizationalState;

  organizationalConditions?:
    OrganizationalCondition[];

  executiveRecommendation?:
    ExecutiveRecommendation;
};

export type RunExecutiveRecommendationOperatingSystemInput = {
  runtime:
    OrganizationRuntime;

  now?:
    string;
};

export type RunExecutiveRecommendationOperatingSystemResult = {
  runtime:
    OrganizationRuntime;

  executiveRecommendation:
    ExecutiveRecommendation;
};

/**
 * Canonical Executive Recommendation Operating System.
 *
 * Responsibilities:
 *
 * Executive Assessment
 * → Recommended Executive Objective
 * → Recommended Executive Strategy
 * → Recommended Executive Intervention
 * → Executive Recommendation
 * → Runtime Memory
 *
 * This operating system introduces no new cognition.
 *
 * It composes the validated recommendation capabilities and stores the
 * resulting canonical ExecutiveRecommendation in runtime memory.
 *
 * Persistence remains owned by organizationStateStore.
 */
export function runExecutiveRecommendationOperatingSystem(
  input:
    RunExecutiveRecommendationOperatingSystemInput,
): RunExecutiveRecommendationOperatingSystemResult {
  const memory =
    input.runtime.memory as
      typeof input.runtime.memory &
      ExecutiveRecommendationRuntimeMemory;

  const executiveAssessment =
    memory.executiveAssessment;

  const organizationalState =
    memory.organizationalState;

  const organizationalConditions =
    memory.organizationalConditions ??
    [];

  if (
    !executiveAssessment
  ) {
    throw new Error(
      "Executive Recommendation Operating System requires runtime.memory.executiveAssessment.",
    );
  }

  if (
    !organizationalState
  ) {
    throw new Error(
      "Executive Recommendation Operating System requires runtime.memory.organizationalState.",
    );
  }

  if (
    organizationalConditions.length ===
    0
  ) {
    throw new Error(
      "Executive Recommendation Operating System requires runtime.memory.organizationalConditions.",
    );
  }

  const executiveRecommendation =
    buildExecutiveRecommendation({
      executiveAssessment,

      organizationalState,

      organizationalConditions,

      now:
        input.now,
    });

  const updatedRuntime:
    OrganizationRuntime = {
    ...input.runtime,

    metadata: {
      ...input.runtime.metadata,

      updatedAt:
        executiveRecommendation
          .createdAt,
    },

    memory: {
      ...input.runtime.memory,

      executiveRecommendation,
    },
  };

  return {
    runtime:
      updatedRuntime,

    executiveRecommendation,
  };
}
