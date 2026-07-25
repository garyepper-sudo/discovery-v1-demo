import type { GeneratedCognition } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import type { AuditedCausalChain } from "./types";

export function auditInterventionHandoff(
  cognition: GeneratedCognition,
  chains: AuditedCausalChain[],
) {
  const recommendation = cognition.executiveRecommendation as
    | {
        intervention?: Record<string, unknown>;
      }
    | null;
  const intervention = recommendation?.intervention;
  if (!intervention) return [];
  const text = JSON.stringify(intervention).toLowerCase();
  const chain = chains.find((item) =>
    [item.upstreamDriver, ...item.mediatingLinks, item.downstreamOutcome]
      .filter((item): item is string => Boolean(item))
      .some((item) => text.includes(item.toLowerCase())),
  );
  return [{
    interventionId: intervention.id ?? null,
    linkedMechanismId: chain?.mechanismId ?? null,
    causalLinkTargeted: Boolean(chain),
    targetType: chain ? "driver-or-mediator" : "organizational-condition",
    expectedEffectExplicit: Boolean(intervention.expectedEffect),
    scenarioSpecific: Boolean(chain),
    distinguishesAlternatives: false,
    successCriteriaDefined: Boolean(intervention.successCriteria),
    falsificationDefined: Boolean(intervention.falsificationCriteria),
    genericLibraryPlausible: !chain,
    action:
      intervention.executiveIntervention ??
      intervention.headline ??
      null,
    targetConditionId: intervention.targetConditionId ?? null,
  }];
}
