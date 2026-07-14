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

export type EvaluateInterventionOptionInput = {
  option: InterventionOption;

  causalModel: OrganizationalCausalModel;

  conditions: OrganizationalCondition[];
};

export type EvaluatedInterventionOption = {
  option: InterventionOption;

  intervention: OrganizationalIntervention;

  mappedChanges: InterventionCausalChange[];

  propagationResults:
    OrganizationalInfluencePropagationResult[];

  aggregatedInfluence:
    AggregatedOrganizationalInfluence[];
};

/**
 * Evaluates one generated intervention option through the canonical
 * intervention-mapping and causal-propagation pipeline.
 *
 * This function does not generate options, compare options, rank outcomes,
 * or select a recommendation.
 */
export function evaluateInterventionOption({
  option,
  causalModel,
  conditions,
}: EvaluateInterventionOptionInput): EvaluatedInterventionOption {
  const intervention =
    convertInterventionOptionToIntervention(
      option,
    );

  const mappedChanges =
    mapInterventionToCausalChanges({
      intervention,
      causalModel,
      conditions,
    });

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

  return {
    option,
    intervention,
    mappedChanges,
    propagationResults,
    aggregatedInfluence,
  };
}