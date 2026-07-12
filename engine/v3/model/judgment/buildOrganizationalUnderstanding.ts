import type {
  OrganizationalUnderstanding,
  TheoryValidation,
  TheoryValidationEvidence,
} from "./organizationalJudgment";

import type {
  InvestigationOpportunityLike,
  OrganizationalConditionLike,
  OrganizationalStateLike,
} from "./buildExecutivePriority";

import type { OrganizationalMechanism } from "./organizationalMechanism";

type BuildOrganizationalUnderstandingInput = {
  summary: string;
  narrative: string;
  confidence: number;

  organizationalState?: OrganizationalStateLike;
  primaryCondition: OrganizationalConditionLike | null;

  theoryValidation: TheoryValidation;

  primaryMechanisms: OrganizationalMechanism[];

  highestValueInvestigation: InvestigationOpportunityLike | null;
};

function mechanismToEvidence(
  mechanism: OrganizationalMechanism,
): TheoryValidationEvidence {
  return {
    label:
      mechanism.executiveName ||
      mechanism.title ||
      "Organizational mechanism",

    rationale:
      mechanism.executiveSummary ||
      mechanism.summary ||
      "This mechanism supports Discovery's current organizational understanding.",

    confidence: mechanism.confidence,
  };
}

export function buildOrganizationalUnderstanding({
  summary,
  narrative,
  confidence,
  organizationalState,
  primaryCondition,
  theoryValidation,
  primaryMechanisms,
  highestValueInvestigation,
}: BuildOrganizationalUnderstandingInput): OrganizationalUnderstanding {
  const dominantCondition = primaryCondition
    ? {
        id: primaryCondition.id ?? null,
        name: primaryCondition.name,
        status: primaryCondition.status ?? "unknown",
        summary:
          primaryCondition.summary ??
          "Discovery has identified this as the leading organizational condition.",
        confidence: primaryCondition.confidence ?? confidence,
      }
    : null;

  const state = organizationalState
    ? {
        status: organizationalState.status ?? "under assessment",
        summary:
          organizationalState.summary ??
          "Discovery is still forming an integrated assessment of the organization's current state.",
        confidence: organizationalState.confidence ?? confidence,
      }
    : null;

  const supportingMechanisms =
    theoryValidation.supportingMechanisms.length > 0
      ? theoryValidation.supportingMechanisms
      : primaryMechanisms.slice(0, 5).map(mechanismToEvidence);

  const statement = dominantCondition
    ? `${dominantCondition.name} is currently the primary condition shaping organizational performance.`
    : theoryValidation.dominantTheory
      ? theoryValidation.dominantTheory
      : summary;

  return {
    statement,

    summary,

    organizationalState: state,

    dominantCondition,

    dominantTheory: theoryValidation.dominantTheory,

    supportingMechanisms,

    supportingOrganizationalBeliefs:
      theoryValidation.supportingOrganizationalBeliefs,

    competingTheories:
      theoryValidation.competingTheoriesConsidered,

    contradictoryOrWeakeningEvidence:
      theoryValidation.contradictoryOrWeakeningEvidence,

    confidence,

    confidenceExplanation:
      theoryValidation.calibratedConfidenceExplanation,

    additionalEvidenceNeeded:
      theoryValidation.additionalEvidenceThatWouldIncreaseConfidence,

    falsifyingEvidence:
      theoryValidation.evidenceThatWouldFalsifyTheory,

    executiveRecommendation:
      theoryValidation.executiveRecommendation,

    nextInvestigation: highestValueInvestigation
      ? {
          id: highestValueInvestigation.id ?? null,
          topic: highestValueInvestigation.topic,
          reason: highestValueInvestigation.reason,
          suggestedExecutiveQuestion:
            highestValueInvestigation.suggestedExecutiveQuestion,
          expectedConfidenceGain:
            highestValueInvestigation.expectedConfidenceGain,
          affectedConditions:
            highestValueInvestigation.affectedConditions ?? [],
        }
      : null,

    narrative,
  };
}