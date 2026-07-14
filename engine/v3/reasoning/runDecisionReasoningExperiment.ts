import {
  aggregateOrganizationalInfluence,
  type AggregatedOrganizationalInfluence,
} from "../model/causal/aggregateOrganizationalInfluence";

import type {
  OrganizationalCausalModel,
} from "../model/causal/organizationalCausalModel";

import {
  propagateOrganizationalInfluence,
  type OrganizationalInfluencePropagationResult,
} from "../model/causal/propagateOrganizationalInfluence";

import type {
  OrganizationalCondition,
} from "../model/state/inferOrganizationalConditions";

import type {
  ExecutiveDecision,
} from "../model/simulate/executiveDecision";

import type {
  InterventionOption,
} from "../model/simulate/interventionOption";

import {
  mapInterventionToCausalChanges,
  type InterventionCausalChange,
} from "../model/simulate/mapInterventionToCausalChanges";

import type {
  OrganizationalIntervention,
} from "../model/simulate/organizationalIntervention";

import {
  convertInterventionOptionToIntervention,
} from "./convertInterventionOptionToIntervention";

import {
  generateInterventionOptions,
} from "./generateInterventionOptions";

export type RunDecisionReasoningExperimentInput = {
  executiveDecision: ExecutiveDecision;

  causalModel: OrganizationalCausalModel;

  conditions: OrganizationalCondition[];
};

export type DecisionReasoningResult = {
  executiveDecision: ExecutiveDecision;

  interventionOptions: InterventionOption[];

  selectedInterventionOption?: InterventionOption;

  selectedIntervention?: OrganizationalIntervention;

  mappedChanges: InterventionCausalChange[];

  propagationResults:
    OrganizationalInfluencePropagationResult[];

  aggregatedInfluence:
    AggregatedOrganizationalInfluence[];

  reasoningStages: string[];
};

function selectInterventionOption(
  interventionOptions: InterventionOption[],
): InterventionOption | undefined {
  return interventionOptions.find(
    (option) =>
      option.title ===
      "Remove one approval layer",
  );
}

export function runDecisionReasoningExperiment({
  executiveDecision,
  causalModel,
  conditions,
}: RunDecisionReasoningExperimentInput): DecisionReasoningResult {
  const interventionOptions =
    generateInterventionOptions({
      executiveDecision,
    });

  const selectedInterventionOption =
    selectInterventionOption(
      interventionOptions,
    );

  const selectedIntervention =
    selectedInterventionOption
      ? convertInterventionOptionToIntervention(
          selectedInterventionOption,
        )
      : undefined;

  const mappedChanges =
    selectedIntervention
      ? mapInterventionToCausalChanges({
          intervention:
            selectedIntervention,

          causalModel,

          conditions,
        })
      : [];

  const propagationResults =
    mappedChanges.map((change) =>
      propagateOrganizationalInfluence({
        causalModel,

        changedEntityId:
          change.entityId,

        delta:
          change.delta,
      }),
    );

  const aggregatedInfluence =
    aggregateOrganizationalInfluence({
      propagationResults,
    });

  const reasoningStages = [
    "Executive Decision",
    "Intervention Generation",
    "Intervention Selection",
    "Organizational Intervention",
    "Intervention Mapping",
    "Causal Propagation",
    "Influence Aggregation",
  ];

  return {
    executiveDecision,
    interventionOptions,
    selectedInterventionOption,
    selectedIntervention,
    mappedChanges,
    propagationResults,
    aggregatedInfluence,
    reasoningStages,
  };
}