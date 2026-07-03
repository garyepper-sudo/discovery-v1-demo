import {
  V3Belief,
  V3Contradiction,
  V3Evidence,
  V3OrganismParticle,
  V3OrganismState,
  V3Theme,
  V3Understanding,
} from "./types";

type BuildOrganismStateInput = {
  evidence: V3Evidence[];
  themes: V3Theme[];
  contradictions: V3Contradiction[];
  beliefs: V3Belief[];
  understanding: V3Understanding;
};

export function buildOrganismState({
  evidence,
  themes,
  contradictions,
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

    ...contradictions.slice(0, 6).map((item) => ({
      id: `OP-${item.id}`,
      kind: "contradiction" as const,
      label: item.title,
      sourceId: item.id,
      confidence: item.confidence,
      strength: strengthToNumber(item.severity),
      connections: item.evidenceIds,
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
      ],
    },
  ];

  return {
    particles,
    centerId: `OP-${understanding.id}`,
    density: clamp(particles.length / 30),
    coherence: clamp(understanding.supportScore - understanding.contradictionScore * 0.35),
    tension: clamp(
      contradictions.length / Math.max(1, themes.length + contradictions.length)
    ),
    maturity: clamp(
      understanding.confidence * 0.5 +
        understanding.supportScore * 0.3 +
        Math.min(1, beliefs.length / 4) * 0.2
    ),
  };
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