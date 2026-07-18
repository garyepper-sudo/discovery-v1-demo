import type {
  OrganizationRuntime,
} from "../../runtime/organizationRuntime";

import type {
  ExecutiveCommunication,
} from "../../communication/executiveCommunication";

import {
  synthesizeExecutiveCommunication,
} from "../../communication/synthesizeExecutiveCommunication";

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

export type ExecutiveCommunicationRuntimeMemory = {
  executiveAssessment?:
    ExecutiveAssessmentWithPrimaryJudgment;

  executiveRecommendation?:
    ExecutiveRecommendation;

  executiveExplanation?:
    unknown;

  organizationalState?:
    OrganizationalState;

  organizationalConditions?:
    OrganizationalCondition[];

  organizationalPredictions?:
    unknown[];

  predictionReflection?:
    unknown;

  organizationalLearningProfile?:
    unknown;

  organizationalUncertainty?:
    unknown;

  investigationOpportunities?:
    unknown[];

  organizationalBeliefs?:
    unknown[];

  organizationalTheories?:
    unknown[];

  organizationalMechanisms?:
    unknown[];

  executiveOptimization?:
    unknown;

  executiveSimulation?:
    unknown;

  executiveCommunication?:
    ExecutiveCommunication;
};

export type RunExecutiveCommunicationOperatingSystemInput = {
  runtime:
    OrganizationRuntime;

  now?:
    string;
};

export type RunExecutiveCommunicationOperatingSystemResult = {
  runtime:
    OrganizationRuntime;

  executiveCommunication:
    ExecutiveCommunication;
};

/**
 * Canonical Executive Communication Operating System.
 *
 * Responsibilities:
 *
 * Canonical Executive Cognition
 * → Executive Communication
 * → Runtime Memory
 *
 * This operating system introduces no new cognition.
 *
 * It validates required runtime inputs, calls the canonical communication
 * producer, and stores the resulting ExecutiveCommunication in runtime memory.
 *
 * Persistence remains owned by organizationStateStore.
 */
export function runExecutiveCommunicationOperatingSystem(
  input:
    RunExecutiveCommunicationOperatingSystemInput,
): RunExecutiveCommunicationOperatingSystemResult {
  const memory =
    input.runtime.memory as
      typeof input.runtime.memory &
      ExecutiveCommunicationRuntimeMemory;

  if (!memory.executiveAssessment) {
    throw new Error(
      "Executive Communication Operating System requires runtime.memory.executiveAssessment.",
    );
  }

  if (!memory.executiveRecommendation) {
    throw new Error(
      "Executive Communication Operating System requires runtime.memory.executiveRecommendation.",
    );
  }

  if (!memory.organizationalState) {
    throw new Error(
      "Executive Communication Operating System requires runtime.memory.organizationalState.",
    );
  }

  if (
    !memory.organizationalConditions ||
    memory.organizationalConditions.length === 0
  ) {
    throw new Error(
      "Executive Communication Operating System requires runtime.memory.organizationalConditions.",
    );
  }

  const executiveCommunication =
    synthesizeExecutiveCommunication({
      source: {
        organizationId:
          input.runtime.metadata.organizationId,

        executiveAssessment:
          memory.executiveAssessment,

        executiveRecommendation:
          memory.executiveRecommendation,

        executiveExplanation:
          memory.executiveExplanation,

        organizationalState:
          memory.organizationalState,

        organizationalConditions:
          memory.organizationalConditions,

        organizationalPredictions:
          memory.organizationalPredictions,

        predictionReflection:
          memory.predictionReflection,

        organizationalLearningProfile:
          memory.organizationalLearningProfile,

        organizationalUncertainty:
          memory.organizationalUncertainty,

        investigationOpportunities:
          memory.investigationOpportunities,

        organizationalBeliefs:
          memory.organizationalBeliefs,

        organizationalTheories:
          memory.organizationalTheories,

        organizationalMechanisms:
          memory.organizationalMechanisms,

        executiveOptimization:
          memory.executiveOptimization,

        executiveSimulation:
          memory.executiveSimulation,

        generatedAt:
          input.now,
      },
    });

  const updatedRuntime:
    OrganizationRuntime = {
    ...input.runtime,

    metadata: {
      ...input.runtime.metadata,

      updatedAt:
        executiveCommunication.generatedAt,
    },

    memory: {
      ...input.runtime.memory,

      executiveCommunication,
    },
  };

  return {
    runtime:
      updatedRuntime,

    executiveCommunication,
  };
}
