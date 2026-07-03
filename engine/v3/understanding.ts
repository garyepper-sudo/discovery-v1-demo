import {
  V3Belief,
  V3CausalChain,
  V3Contradiction,
  V3ExecutiveUnderstanding,
  V3Explanation,
  V3Theme,
  V3Understanding,
} from "./types";

export function buildUnderstanding(
  themes: V3Theme[],
  explanations: V3Explanation[],
  causalChains: V3CausalChain[]
): V3Understanding[] {
  const sortedExplanations = [...explanations].sort(
    (a, b) => b.confidence - a.confidence
  );

  return sortedExplanations.map((explanation, index) => {
    const linkedThemes = themes.filter((theme) =>
      theme.evidenceIds.some((id) =>
        explanation.supportingEvidenceIds.includes(id)
      )
    );

    const linkedCausalChains = causalChains.filter((chain) =>
      chain.evidenceIds.some((id) =>
        explanation.supportingEvidenceIds.includes(id)
      )
    );

    const hasWeakeningEvidence = explanation.weakeningEvidenceIds.length > 0;
    const hasCausalSupport = linkedCausalChains.length > 0;
    const hasThemeSupport = linkedThemes.length > 0;

    const supportScore =
      explanation.supportingEvidenceIds.length +
      linkedThemes.length +
      linkedCausalChains.length;

    const contradictionScore = explanation.weakeningEvidenceIds.length;

    const noveltyScore = calculateNoveltyScore(
      hasWeakeningEvidence,
      hasCausalSupport,
      hasThemeSupport
    );

    return {
      id: `U${index + 1}`,
      title: explanation.title,
      summary: explanation.explanation,
      confidence: explanation.confidence,
      supportScore,
      contradictionScore,
      noveltyScore,
      evidenceIds: [
        ...explanation.supportingEvidenceIds,
        ...explanation.weakeningEvidenceIds,
      ],
      themeIds: linkedThemes.map((theme) => theme.id),
      explanationIds: [explanation.id],
      causalChainIds: linkedCausalChains.map((chain) => chain.id),
      supportingReasons: buildSupportingReasons(
        explanation,
        linkedThemes,
        linkedCausalChains
      ),
      contradictions: buildContradictionReasons(explanation),
      unknowns: buildUnknowns(explanation, hasThemeSupport, hasCausalSupport),
      implications: buildImplications(
        explanation,
        hasWeakeningEvidence,
        hasCausalSupport
      ),
      recommendations: buildRecommendations(
        explanation,
        hasWeakeningEvidence,
        hasCausalSupport
      ),
    };
  });
}

function calculateNoveltyScore(
  hasWeakeningEvidence: boolean,
  hasCausalSupport: boolean,
  hasThemeSupport: boolean
): number {
  let score = 0.4;

  if (hasWeakeningEvidence) score += 0.2;
  if (hasCausalSupport) score += 0.2;
  if (!hasThemeSupport) score += 0.1;

  return Math.min(score, 1);
}

function buildSupportingReasons(
  explanation: V3Explanation,
  linkedThemes: V3Theme[],
  linkedCausalChains: V3CausalChain[]
): string[] {
  const reasons: string[] = [];

  reasons.push(
    `${explanation.supportingEvidenceIds.length} evidence item(s) support this explanation.`
  );

  if (linkedThemes.length > 0) {
    reasons.push(
      `It is connected to ${linkedThemes.length} broader theme(s): ${linkedThemes
        .map((theme) => theme.title)
        .join(", ")}.`
    );
  }

  if (linkedCausalChains.length > 0) {
    reasons.push(
      `It is reinforced by ${linkedCausalChains.length} causal chain(s).`
    );
  }

  return reasons;
}

function buildContradictionReasons(explanation: V3Explanation): string[] {
  if (explanation.weakeningEvidenceIds.length === 0) {
    return [];
  }

  return [
    `${explanation.weakeningEvidenceIds.length} evidence item(s) weaken or complicate this explanation.`,
  ];
}

function buildUnknowns(
  explanation: V3Explanation,
  hasThemeSupport: boolean,
  hasCausalSupport: boolean
): string[] {
  const unknowns: string[] = [];

  if (!hasThemeSupport) {
    unknowns.push(
      "This understanding is not yet connected to a broader recurring theme."
    );
  }

  if (!hasCausalSupport) {
    unknowns.push(
      "The mechanism behind this understanding is not yet fully explained by a causal chain."
    );
  }

  if (explanation.weakeningEvidenceIds.length > 0) {
    unknowns.push(
      "Leadership should clarify whether the weakening evidence is an exception or a true challenge to the explanation."
    );
  }

  if (unknowns.length === 0) {
    unknowns.push(
      "The next unknown is whether this pattern holds across additional evidence."
    );
  }

  return unknowns;
}

function buildImplications(
  explanation: V3Explanation,
  hasWeakeningEvidence: boolean,
  hasCausalSupport: boolean
): string[] {
  const implications: string[] = [];

  if (explanation.confidence >= 0.75 && hasCausalSupport) {
    implications.push(
      "This may be strong enough to guide near-term leadership attention."
    );
  }

  if (hasWeakeningEvidence) {
    implications.push(
      "The explanation is promising but should not be treated as settled."
    );
  }

  if (explanation.confidence < 0.6) {
    implications.push(
      "This should be treated as an emerging possibility rather than a firm conclusion."
    );
  }

  if (implications.length === 0) {
    implications.push(
      "This understanding is directionally useful but needs more evidence before major decisions are made."
    );
  }

  return implications;
}

function buildRecommendations(
  explanation: V3Explanation,
  hasWeakeningEvidence: boolean,
  hasCausalSupport: boolean
): string[] {
  const recommendations: string[] = [];

  if (hasWeakeningEvidence) {
    recommendations.push(
      "Investigate the evidence that weakens this explanation before acting on it."
    );
  }

  if (!hasCausalSupport) {
    recommendations.push(
      "Look for evidence that explains why this pattern is happening, not just that it is happening."
    );
  }

  if (explanation.confidence >= 0.75 && hasCausalSupport) {
    recommendations.push(
      "Use this understanding as a candidate focus area for the executive brief."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Collect more targeted evidence to test whether this understanding strengthens or fades."
    );
  }

  return recommendations;
}

export function buildExecutiveUnderstanding(
  explanations: V3Explanation[],
  contradictions: V3Contradiction[],
  understanding: V3Understanding[] = [],
  beliefs: V3Belief[] = []
): V3ExecutiveUnderstanding {
  const primaryBelief = [...beliefs].sort(
    (a, b) => b.confidence - a.confidence
  )[0];

  const primaryUnderstanding = [...understanding].sort(
    (a, b) => b.confidence - a.confidence
  )[0];

  const fallbackExplanation = [...explanations].sort(
    (a, b) => b.confidence - a.confidence
  )[0];

  return {
    headline:
      primaryBelief?.headline ??
      primaryUnderstanding?.title ??
      fallbackExplanation?.title ??
      "No dominant strategic understanding has emerged.",

    explanation:
      primaryBelief?.explanation ??
      primaryUnderstanding?.summary ??
      fallbackExplanation?.explanation ??
      "Additional evidence is required before forming a reliable executive understanding.",

    confidence:
      primaryBelief?.confidence ??
      primaryUnderstanding?.confidence ??
      fallbackExplanation?.confidence ??
      0.5,

    evidenceSummary:
      primaryBelief?.supportingReasons?.length
        ? primaryBelief.supportingReasons
        : primaryUnderstanding?.supportingReasons ??
          explanations.slice(0, 3).map((e) => e.title),

    contradictions:
      primaryBelief?.concerns?.length
        ? primaryBelief.concerns
        : primaryUnderstanding?.contradictions?.length
          ? primaryUnderstanding.contradictions
          : contradictions.map((c) => c.title),

    openQuestions:
      primaryBelief?.nextQuestions?.length
        ? primaryBelief.nextQuestions
        : primaryUnderstanding?.unknowns?.length
          ? primaryUnderstanding.unknowns
          : [
              "Which explanation would change if new customer evidence arrived?",
              "What evidence would falsify the leading explanation?",
              "Which contradiction should leadership investigate first?",
            ],

    nextMoves:
      primaryUnderstanding?.recommendations?.length
        ? primaryUnderstanding.recommendations
        : [
            "Collect evidence that directly challenges the leading belief.",
            "Identify what evidence would weaken the current belief.",
            "Compare the current belief against alternative explanations.",
          ],
  };
}