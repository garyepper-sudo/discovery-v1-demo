import { heldOutFutures, scoringTruth } from "./fixtures";
import type { EvidenceConfiguration, EmergenceScore } from "./types";
import type { GeneratedCognition } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";

const lower = (value: string) => value.toLowerCase();
const includes = (value: string, terms: string[]) =>
  terms.every((term) => lower(value).includes(term));

export function scoreEmergence(
  configuration: EvidenceConfiguration,
  cognition: GeneratedCognition,
): EmergenceScore {
  const truth = scoringTruth[configuration.familyId];
  const future = heldOutFutures[configuration.familyId];
  const mechanism = cognition.mechanisms.find(
    (item) => item.crossSilo && !item.explicitInSingleSource,
  );
  const explanation = mechanism
    ? `${mechanism.cause} ${mechanism.mechanism} ${mechanism.effect}`
    : "";
  const recommendation = JSON.stringify(
    cognition.executiveRecommendation ?? "",
  );
  const prediction = `${mechanism?.effect ?? ""} ${JSON.stringify(
    cognition.predictions,
  )}`;
  const criteria = {
    nonLocality: Boolean(mechanism && mechanism.silos.length >= 3),
    relationalNovelty: Boolean(mechanism && !mechanism.explicitInSingleSource),
    crossSiloNecessity: Boolean(
      mechanism && configuration.bridgeSourceId,
    ),
    mechanisticCompleteness: includes(
      explanation,
      truth.expectedMechanismTerms,
    ),
    discriminability:
      Boolean(mechanism) && cognition.mechanisms.length <= 2,
    predictiveUtility:
      includes(prediction, truth.expectedOutcomeTerms) &&
      future.outcomeTerms.some((term) => lower(prediction).includes(term)),
    interventionUtility:
      includes(recommendation, truth.expectedInterventionTerms) &&
      future.effectiveInterventionTerms.some((term) =>
        lower(recommendation).includes(term),
      ),
    groundedness: Boolean(
      mechanism &&
        mechanism.evidenceIds.length > 0 &&
        mechanism.sourceIds.length > 0,
    ),
    counterfactualSensitivity: Boolean(configuration.bridgeSourceId),
  };
  const passedCriteria = Object.values(criteria).filter(Boolean).length;
  return {
    criteria,
    passedCriteria,
    emerged: Object.values(criteria).every(Boolean),
    explanationScore: includes(
      explanation,
      truth.expectedMechanismTerms,
    )
      ? 1
      : 0,
    confidence: mechanism?.confidence ?? 0,
  };
}
