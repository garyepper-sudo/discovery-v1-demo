import {
  V3Belief,
  V3Contradiction,
  V3Evidence,
  V3Hypothesis,
  V3Mechanism,
  V3OrganismEmergingPattern,
  V3OrganismEvidenceCluster,
  V3OrganismParticle,
  V3OrganismState,
  V3Theme,
  V3Understanding,
} from "./types";

type BuildOrganismStateInput = {
  evidence: V3Evidence[];
  themes: V3Theme[];
  contradictions: V3Contradiction[];
  mechanisms?: V3Mechanism[];
  hypotheses?: V3Hypothesis[];
  beliefs: V3Belief[];
  understanding: V3Understanding;
};

export function buildOrganismState({
  evidence,
  themes,
  contradictions,
  mechanisms = [],
  hypotheses = [],
  beliefs,
  understanding,
}: BuildOrganismStateInput): V3OrganismState {
  const particles: V3OrganismParticle[] = [
    ...evidence.slice(0, 14).map((item) => ({
      id: `OP-${item.id}`,
      kind: "evidence" as const,
      label: item.text.slice(0, 80),
      sourceId: item.id,
      confidence: item.confidence,
      strength: strengthToNumber(item.strength),
      connections: [...(item.relatedEvidenceIds ?? []), ...(item.keywords ?? [])],
    })),

    ...themes.slice(0, 8).map((item) => ({
      id: `OP-${item.id}`,
      kind: "theme" as const,
      label: item.title,
      sourceId: item.id,
      confidence: item.confidence,
      strength: item.stability ?? strengthToNumber(item.strength),
      connections: item.evidenceIds,
    })),

    ...mechanisms.slice(0, 8).map((item) => ({
      id: `OP-${item.id}`,
      kind: "mechanism" as const,
      label: item.title,
      sourceId: item.id,
      confidence: item.confidence,
      strength: item.strength ?? item.confidence,
      connections: [
        ...item.evidenceIds,
        ...item.themeIds,
        ...item.beliefIds,
        ...item.relationshipIds,
        ...item.contradictionIds,
      ],
    })),

    ...contradictions.slice(0, 6).map((item) => ({
      id: `OP-${item.id}`,
      kind: "contradiction" as const,
      label: item.title,
      sourceId: item.id,
      confidence: item.confidence,
      strength: strengthToNumber(item.severity),
      connections: item.evidenceIds,
    })),

    ...hypotheses.slice(0, 6).map((item) => ({
      id: `OP-${item.id}`,
      kind: "belief" as const,
      label: item.title,
      sourceId: item.id,
      confidence: item.confidence,
      strength: hypothesisStatusToStrength(item.status),
      connections: [
        ...item.supportingEvidenceIds,
        ...item.weakeningEvidenceIds,
        ...item.mechanismIds,
        ...item.themeIds,
        ...item.contradictionIds,
      ],
    })),

    ...beliefs.slice(0, 6).map((item) => ({
      id: `OP-${item.id}`,
      kind: "belief" as const,
      label: item.headline,
      sourceId: item.id,
      confidence: item.confidence,
      strength: item.stability ?? item.utility ?? item.confidence,
      connections: [
        ...item.supportingEvidenceIds,
        ...item.contradictingEvidenceIds,
        ...item.mechanismIds,
        ...item.themeIds,
        ...item.contradictionIds,
      ],
    })),

    {
      id: `OP-${understanding.id}`,
      kind: "understanding",
      label: understanding.title,
      sourceId: understanding.id,
      confidence: understanding.confidence,
      strength: understanding.supportScore,
      connections: [
        ...understanding.evidenceIds,
        ...understanding.themeIds,
        ...understanding.causalChainIds,
        ...(understanding.mechanismIds ?? []),
        ...mechanisms.map((mechanism) => mechanism.id),
      ],
    },
  ];

  const evidenceClusters = buildEvidenceClusters({
    themes,
    contradictions,
  });

  const emergingPatterns = buildEmergingPatterns({
    themes,
    mechanisms,
    hypotheses,
    beliefs,
    understanding,
  });

  const tension = clamp(
    contradictions.length / Math.max(1, themes.length + contradictions.length)
  );

  const coherence = clamp(
    understanding.supportScore - understanding.contradictionScore * 0.35
  );

  const mechanismCoverage = Math.min(1, mechanisms.length / 4);
  const beliefCoverage = Math.min(1, beliefs.length / 5);
  const hypothesisCoverage = Math.min(1, hypotheses.length / 4);

  const uncertainty = clamp(
    1 -
      understanding.confidence * 0.42 -
      coherence * 0.24 -
      mechanismCoverage * 0.08 -
      beliefCoverage * 0.18 -
      hypothesisCoverage * 0.08
  );

  return {
    particles,
    centerId: `OP-${understanding.id}`,

    evidenceClusters,

    mechanisms,
    hypotheses,
    beliefs,
    contradictions,

    mechanismIds: mechanisms.map((mechanism) => mechanism.id),
    hypothesisIds: hypotheses.map((hypothesis) => hypothesis.id),
    beliefIds: beliefs.map((belief) => belief.id),
    contradictionIds: contradictions.map((contradiction) => contradiction.id),

    uncertainty,
    emergingPatterns,

    density: clamp(particles.length / 30),
    coherence,
    tension,
    maturity: clamp(
      understanding.confidence * 0.42 +
        understanding.supportScore * 0.24 +
        mechanismCoverage * 0.08 +
        beliefCoverage * 0.18 +
        hypothesisCoverage * 0.08
    ),
  };
}

function buildEvidenceClusters({
  themes,
  contradictions,
}: {
  themes: V3Theme[];
  contradictions: V3Contradiction[];
}): V3OrganismEvidenceCluster[] {
  return themes.slice(0, 8).map((theme) => {
    const relatedContradictions = contradictions.filter((contradiction) =>
      contradiction.evidenceIds.some((evidenceId) =>
        theme.evidenceIds.includes(evidenceId)
      )
    );

    return {
      id: `OC-${theme.id}`,
      label: theme.title,
      evidenceIds: theme.evidenceIds,
      confidence: theme.confidence,
      tension: clamp(
        relatedContradictions.length / Math.max(1, contradictions.length)
      ),
    };
  });
}

function buildEmergingPatterns({
  themes,
  mechanisms,
  hypotheses,
  beliefs,
  understanding,
}: {
  themes: V3Theme[];
  mechanisms: V3Mechanism[];
  hypotheses: V3Hypothesis[];
  beliefs: V3Belief[];
  understanding: V3Understanding;
}): V3OrganismEmergingPattern[] {
  const strongestThemes = [...themes]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  const mechanismPatterns = mechanisms.slice(0, 3).map((mechanism) => ({
    id: `EP-${mechanism.id}`,
    title: mechanism.title,
    description: mechanism.explanation,
    evidenceIds: mechanism.evidenceIds,
    confidence: mechanism.confidence,
    strength: mechanism.strength ?? mechanism.confidence,
  }));

  const hypothesisPatterns = hypotheses.slice(0, 2).map((hypothesis) => ({
    id: `EP-${hypothesis.id}`,
    title: hypothesis.title,
    description: hypothesis.explanation,
    evidenceIds: [
      ...hypothesis.supportingEvidenceIds,
      ...hypothesis.weakeningEvidenceIds,
    ],
    confidence: hypothesis.confidence,
    strength: hypothesisStatusToStrength(hypothesis.status),
  }));

  const beliefPatterns = beliefs.slice(0, 2).map((belief) => ({
    id: `EP-${belief.id}`,
    title: belief.headline,
    description: belief.explanation,
    evidenceIds: belief.supportingEvidenceIds,
    confidence: belief.confidence,
    strength: belief.stability ?? belief.utility ?? belief.confidence,
  }));

  const themePatterns = strongestThemes.map((theme) => ({
    id: `EP-${theme.id}`,
    title: theme.title,
    description: theme.description,
    evidenceIds: theme.evidenceIds,
    confidence: theme.confidence,
    strength: theme.stability ?? strengthToNumber(theme.strength),
  }));

  return [
    {
      id: `EP-${understanding.id}`,
      title: understanding.title,
      description: understanding.summary,
      evidenceIds: understanding.evidenceIds,
      confidence: understanding.confidence,
      strength: understanding.supportScore,
    },
    ...mechanismPatterns,
    ...hypothesisPatterns,
    ...beliefPatterns,
    ...themePatterns,
  ];
}

function hypothesisStatusToStrength(status: V3Hypothesis["status"]): number {
  if (status === "leading") return 0.9;
  if (status === "plausible") return 0.7;
  if (status === "weak") return 0.4;
  if (status === "challenged") return 0.3;
  return 0.5;
}

function strengthToNumber(strength?: "weak" | "moderate" | "strong"): number {
  if (strength === "strong") return 0.9;
  if (strength === "moderate") return 0.65;
  if (strength === "weak") return 0.35;
  return 0.5;
}

function clamp(value: number): number {
  return Number(Math.max(0, Math.min(1, value)).toFixed(2));
}