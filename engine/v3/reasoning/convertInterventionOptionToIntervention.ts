import {
  buildOrganizationalIntervention,
} from "../model/simulate/buildOrganizationalIntervention";

import type {
  InterventionOption,
} from "../model/simulate/interventionOption";

import type {
  OrganizationalIntervention,
} from "../model/simulate/organizationalIntervention";

/**
 * Converts a generated executive intervention option into the canonical
 * Organizational Intervention object used by simulation and scenario
 * execution.
 *
 * This function performs no option selection and no causal reasoning.
 */
export function convertInterventionOptionToIntervention(
  option: InterventionOption,
): OrganizationalIntervention {
  return buildOrganizationalIntervention({
    organizationId:
      option.organizationId,

    type:
      option.type,

    title:
      option.title,

    description:
      option.description,

    rationale:
      option.rationale,

    scope:
      option.scope,

    timeHorizon:
      option.timeHorizon,

    status:
      "hypothetical",

    affectedConditionIds:
      option.targetConditionIds,

    expectedMechanismIds:
      option.expectedMechanismIds,

    assumptions:
      option.assumptions,

    confidence:
      option.confidence,

    createdAt:
      option.createdAt,
  });
}