import {
  V3Belief,
  V3Contradiction,
  V3Mechanism,
  V3Understanding,
} from "./types";

export function buildBeliefs(
  understanding: V3Understanding[],
  mechanisms: V3Mechanism[] = [],
  contradictions: V3Contradiction[] = []
): V3Belief[] {
  return [...understanding]
    .sort(
      (a, b) =>
        scoreUnderstanding(b, mechanisms) - scoreUnderstanding(a, mechanisms)
    )
    .map((item, index) => {
      const relatedMechanisms = mechanismsForUnderstanding(item, mechanisms);
      const relatedContradictions = contradictionsForUnderstanding(
        item,
        contradictions
      );

      const confidence = scoreUnderstanding(item, relatedMechanisms);

      return {
        id: `B${index + 1}`,
        headline: item.title,
        confidence,
        explanation: buildBeliefExplanation(
          item,
          relatedMechanisms,
          relatedContradictions,
          confidence
        ),
        understandingId: item.id,

        supportingEvidenceIds: collectSupportingEvidenceIds(
          item,
          relatedMechanisms
        ),
        contradictingEvidenceIds: collectContradictingEvidenceIds(
          item,
          relatedMechanisms,
          relatedContradictions
        ),

        mechanismIds: relatedMechanisms.map((mechanism) => mechanism.id),
        themeIds: item.themeIds,
        contradictionIds: relatedContradictions.map(
          (contradiction) => contradiction.id
        ),

        supportingReasons: buildSupportingReasons(item, relatedMechanisms),
        concerns: buildConcerns(item, relatedMechanisms, relatedContradictions),
        nextQuestions: buildNextQuestions(
          item,
          relatedMechanisms,
          relatedContradictions
        ),

        signalIds: item.signalIds,
        causalChainIds: item.causalChainIds,
        stability: calculateStability(
          item,
          relatedMechanisms,
          relatedContradictions
        ),
        utility: calculateUtility(item, relatedMechanisms),
      };
    })
    .slice(0, 5);
}

function mechanismsForUnderstanding(
  item: V3Understanding,
  mechanisms: V3Mechanism[]
): V3Mechanism[] {
  return mechanisms
    .filter((mechanism) => {
      const sharesTheme = mechanism.themeIds.some((id) =>
        item.themeIds.includes(id)
      );

      const sharesEvidence = mechanism.evidenceIds.some((id) =>
        item.evidenceIds.includes(id)
      );

      return sharesTheme || sharesEvidence;
    })
    .sort((a, b) => b.confidence - a.confidence);
}

function contradictionsForUnderstanding(
  item: V3Understanding,
  contradictions: V3Contradiction[]
): V3Contradiction[] {
  return contradictions.filter((contradiction) =>
    contradiction.evidenceIds.some((id) => item.evidenceIds.includes(id))
  );
}

function scoreUnderstanding(
  item: V3Understanding,
  mechanisms: V3Mechanism[] = []
): number {
  const supportWeight = Math.min(item.supportScore * 0.08, 0.3);
  const contradictionPenalty = Math.min(item.contradictionScore * 0.08, 0.25);
  const mechanismBonus = mechanisms.length > 0 ? 0.12 : 0;
  const mechanismStrengthBonus = Math.min(
    average(mechanisms.map((mechanism) => mechanism.strength)) * 0.12,
    0.12
  );
  const causalBonus = item.causalChainIds.length > 0 ? 0.06 : 0;
  const noveltyBonus = item.noveltyScore * 0.1;
  const recommendationBonus = item.recommendations.length > 0 ? 0.05 : 0;

  return clamp(
    item.confidence +
      supportWeight +
      mechanismBonus +
      mechanismStrengthBonus +
      causalBonus +
      noveltyBonus +
      recommendationBonus -
      contradictionPenalty
  );
}

function buildBeliefExplanation(
  item: V3Understanding,
  mechanisms: V3Mechanism[],
  contradictions: V3Contradiction[],
  confidence: number
): string {
  const confidenceLanguage =
    confidence >= 0.78
      ? "strong belief"
      : confidence >= 0.58
      ? "working belief"
      : "early belief";

  const topMechanism = mechanisms[0];
  const tensionLanguage =
    contradictions.length > 0
      ? ` The main caution is that ${contradictions.length} unresolved tension${
          contradictions.length === 1 ? "" : "s"
        } still complicate this belief.`
      : "";

  if (!topMechanism) {
    return `Discovery treats this as a ${confidenceLanguage}: ${item.summary}${tensionLanguage}`;
  }

  return [
    `Discovery treats this as a ${confidenceLanguage}: ${item.summary}`,
    `It is primarily explained by this mechanism: ${topMechanism.cause} → ${topMechanism.effect}.`,
    tensionLanguage,
  ]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectSupportingEvidenceIds(
  item: V3Understanding,
  mechanisms: V3Mechanism[]
): string[] {
  const ids = new Set<string>(item.evidenceIds);

  for (const mechanism of mechanisms) {
    for (const id of mechanism.supportingEvidenceIds) {
      ids.add(id);
    }
  }

  return Array.from(ids);
}

function collectContradictingEvidenceIds(
  item: V3Understanding,
  mechanisms: V3Mechanism[],
  contradictions: V3Contradiction[]
): string[] {
  const ids = new Set<string>();

  if (item.contradictionScore > 0) {
    for (const id of item.evidenceIds.slice(0, Math.ceil(item.contradictionScore))) {
      ids.add(id);
    }
  }

  for (const mechanism of mechanisms) {
    for (const id of mechanism.contradictingEvidenceIds) {
      ids.add(id);
    }
  }

  for (const contradiction of contradictions) {
    for (const id of contradiction.evidenceIds) {
      ids.add(id);
    }

    for (const id of contradiction.opposingEvidenceIds ?? []) {
      ids.add(id);
    }
  }

  return Array.from(ids);
}

function buildSupportingReasons(
  item: V3Understanding,
  mechanisms: V3Mechanism[]
): string[] {
  const reasons: string[] = [...item.supportingReasons];

  for (const mechanism of mechanisms.slice(0, 3)) {
    reasons.push(`Mechanism: ${mechanism.cause} → ${mechanism.effect}`);
    reasons.push(`Why it matters: ${mechanism.mechanism}`);
  }

  return unique(reasons).slice(0, 6);
}

function buildConcerns(
  item: V3Understanding,
  mechanisms: V3Mechanism[],
  contradictions: V3Contradiction[]
): string[] {
  const concerns: string[] = [];

  if (item.contradictionScore > 0 || contradictions.length > 0) {
    concerns.push(
      "Some evidence weakens or complicates this belief, so it should not be treated as fully settled."
    );
  }

  if (mechanisms.length === 0) {
    concerns.push(
      "This belief does not yet have a clear explanatory mechanism attached to it."
    );
  }

  for (const mechanism of mechanisms.slice(0, 2)) {
    concerns.push(...mechanism.risks);
  }

  if (mechanisms.some((mechanism) => mechanism.type === "tension")) {
    concerns.push("At least one attached mechanism contains unresolved tension.");
  }

  if (item.supportScore < 3) {
    concerns.push("This belief is supported by a limited amount of evidence.");
  }

  if (item.unknowns.length > 0) {
    concerns.push("There are still open questions attached to this belief.");
  }

  if (concerns.length === 0) {
    concerns.push(
      "No major concerns detected, but Discovery should still look for disconfirming evidence."
    );
  }

  return unique(concerns).slice(0, 5);
}

function buildNextQuestions(
  item: V3Understanding,
  mechanisms: V3Mechanism[],
  contradictions: V3Contradiction[]
): string[] {
  const questions: string[] = [];

  questions.push(...item.unknowns);

  for (const mechanism of mechanisms.slice(0, 2)) {
    questions.push(...mechanism.openQuestions);
  }

  for (const contradiction of contradictions.slice(0, 2)) {
    if (contradiction.unresolvedQuestion) {
      questions.push(contradiction.unresolvedQuestion);
    }
  }

  if (questions.length === 0) {
    questions.push(
      "What evidence would disconfirm this belief?",
      "Which assumption has the greatest impact on confidence?",
      "What would change this understanding over the next 30 days?"
    );
  }

  return unique(questions).slice(0, 4);
}

function calculateStability(
  item: V3Understanding,
  mechanisms: V3Mechanism[],
  contradictions: V3Contradiction[]
): number {
  const support = Math.min(0.45, item.supportScore * 0.08);
  const mechanismStability =
    mechanisms.length > 0
      ? average(mechanisms.map((mechanism) => mechanism.stability)) * 0.22
      : 0;
  const contradictionPenalty =
    Math.min(0.3, item.contradictionScore * 0.08) +
    Math.min(0.2, contradictions.length * 0.06);

  return clamp(
    item.confidence * 0.48 + support + mechanismStability - contradictionPenalty
  );
}

function calculateUtility(
  item: V3Understanding,
  mechanisms: V3Mechanism[]
): number {
  const implications = Math.min(0.25, item.implications.length * 0.06);
  const recommendations = Math.min(0.35, item.recommendations.length * 0.08);
  const mechanismBonus = mechanisms.length > 0 ? 0.18 : 0;

  return clamp(
    item.confidence * 0.35 + implications + recommendations + mechanismBonus
  );
}

function average(values: number[]): number {
  if (values.length === 0) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}