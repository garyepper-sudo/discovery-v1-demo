import type {
  OrganizationalUncertainty,
} from "../epistemic/organizationalUncertainty";

import type {
  InvestigationOpportunity,
} from "./buildInvestigationOpportunities";

export type RefineInvestigationOpportunitiesInput = {
  opportunities:
    InvestigationOpportunity[];

  organizationalUncertainty:
    OrganizationalUncertainty;
};

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.max(
    minimum,
    Math.min(
      maximum,
      value,
    ),
  );
}

function normalize(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase();
}

function includesAny(
  values: string[],
  searchTerms: string[],
): boolean {
  const normalizedValues =
    values.map(normalize);

  return searchTerms.some(
    (searchTerm) =>
      normalizedValues.some(
        (value) =>
          value.includes(
            normalize(searchTerm),
          ),
      ),
  );
}

function topicMatchesRecommendedEvidence(
  opportunity:
    InvestigationOpportunity,

  recommendedEvidenceAreas:
    string[],
): boolean {
  const opportunityText =
    [
      opportunity.topic,
      opportunity.reason,
      opportunity.suggestedExecutiveQuestion,
      ...opportunity.missingEvidence,
    ]
      .join(" ")
      .toLowerCase();

  return recommendedEvidenceAreas.some(
    (area) =>
      opportunityText.includes(
        area.toLowerCase(),
      ) ||
      area
        .toLowerCase()
        .includes(
          opportunity.topic
            .toLowerCase(),
        ),
  );
}

function uncertaintyPriorityBoost(
  opportunity:
    InvestigationOpportunity,

  uncertainty:
    OrganizationalUncertainty,
): {
  boost: number;
  reasons: string[];
} {
  let boost = 0;

  const reasons:
    string[] = [];

  if (
    uncertainty
      .evidenceCompleteness <
    0.6
  ) {
    boost +=
      (
        1 -
        uncertainty
          .evidenceCompleteness
      ) *
      0.25;

    reasons.push(
      "Priority increased because the current investigation has limited evidence coverage.",
    );
  }

  if (
    uncertainty
      .evidenceAgreement <
    0.75
  ) {
    const contradictionTerms = [
      "contradiction",
      "conflict",
      "disagreement",
      "different perspectives",
      "alternative explanation",
      "competing explanation",
      "validation",
      "decision data",
      "outcome data",
      "behavioral evidence",
    ];

    const opportunitySignals = [
      opportunity.topic,
      opportunity.reason,
      opportunity
        .suggestedExecutiveQuestion,
      ...opportunity
        .missingEvidence,
    ];

    if (
      includesAny(
        opportunitySignals,
        contradictionTerms,
      )
    ) {
      boost +=
        (
          1 -
          uncertainty
            .evidenceAgreement
        ) *
        0.35;

      reasons.push(
        "Priority increased because this investigation could help resolve contradictory evidence.",
      );
    }
  }

  if (
    uncertainty
      .ambiguityScore >=
    0.35
  ) {
    const ambiguityTerms = [
      "cause",
      "mechanism",
      "why",
      "alternative",
      "explanation",
      "driver",
      "root cause",
      "persistence",
    ];

    const opportunitySignals = [
      opportunity.topic,
      opportunity.reason,
      opportunity
        .suggestedExecutiveQuestion,
      ...opportunity
        .missingEvidence,
    ];

    if (
      includesAny(
        opportunitySignals,
        ambiguityTerms,
      )
    ) {
      boost +=
        uncertainty
          .ambiguityScore *
        0.25;

      reasons.push(
        "Priority increased because this investigation could distinguish among competing explanations.",
      );
    }
  }

  if (
    topicMatchesRecommendedEvidence(
      opportunity,
      uncertainty
        .recommendedEvidenceAreas,
    )
  ) {
    boost += 0.15;

    reasons.push(
      "Priority increased because the Epistemic Operating System identified this as a recommended evidence area.",
    );
  }

  boost +=
    uncertainty
      .investigationUrgency *
    0.15;

  if (
    uncertainty
      .investigationUrgency >=
    0.6
  ) {
    reasons.push(
      "Priority increased because the overall urgency of additional investigation is high.",
    );
  }

  return {
    boost:
      clamp(
        boost,
        0,
        0.45,
      ),

    reasons,
  };
}

function refineOpportunity(
  opportunity:
    InvestigationOpportunity,

  uncertainty:
    OrganizationalUncertainty,
): InvestigationOpportunity {
  const {
    boost,
    reasons,
  } =
    uncertaintyPriorityBoost(
      opportunity,
      uncertainty,
    );

  const confidenceGainBoost =
    Math.round(
      boost * 15,
    );

  const expectedConfidenceGain =
    clamp(
      opportunity
        .expectedConfidenceGain +
        confidenceGainBoost,
      4,
      20,
    );

  const executiveLeverage =
    expectedConfidenceGain >=
    14
      ? "high"
      : expectedConfidenceGain >=
          9
        ? "medium"
        : "low";

  const refinementReason =
    reasons.join(" ");

  return {
    ...opportunity,

    expectedConfidenceGain,

    executiveLeverage,

    reason:
      refinementReason
        ? [
            opportunity.reason,
            refinementReason,
          ]
            .filter(Boolean)
            .join(" ")
        : opportunity.reason,
  };
}

/**
 * Refines already-generated investigation opportunities using the
 * canonical Organizational Uncertainty object.
 *
 * This capability does not discover new condition-level evidence gaps.
 * It reprioritizes existing opportunities based on evidence completeness,
 * evidence disagreement, ambiguity, investigation urgency, and canonical
 * recommended evidence areas.
 */
export function refineInvestigationOpportunities({
  opportunities,
  organizationalUncertainty,
}: RefineInvestigationOpportunitiesInput):
  InvestigationOpportunity[] {
  return opportunities
    .map(
      (opportunity) =>
        refineOpportunity(
          opportunity,
          organizationalUncertainty,
        ),
    )
    .sort(
      (
        first,
        second,
      ) => {
        if (
          second
            .expectedConfidenceGain !==
          first
            .expectedConfidenceGain
        ) {
          return (
            second
              .expectedConfidenceGain -
            first
              .expectedConfidenceGain
          );
        }

        if (
          second
            .affectedConditions
            .length !==
          first
            .affectedConditions
            .length
        ) {
          return (
            second
              .affectedConditions
              .length -
            first
              .affectedConditions
              .length
          );
        }

        return first.topic.localeCompare(
          second.topic,
        );
      },
    );
}