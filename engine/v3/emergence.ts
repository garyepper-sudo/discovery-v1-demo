import {
  V3Belief,
  V3Contradiction,
  V3Evidence,
  V3EmergenceEvent,
  V3Theme,
  V3Understanding,
} from "./types";

export function buildEmergenceEvents(params: {
  evidence: V3Evidence[];
  themes: V3Theme[];
  contradictions: V3Contradiction[];
  beliefs: V3Belief[];
  understanding: V3Understanding;
}): V3EmergenceEvent[] {
  const events: V3EmergenceEvent[] = [];

  events.push({
    id: "EE-1",
    title: "Evidence entered the workspace",
    description: `${params.evidence.length} evidence objects were ingested and prepared for investigation.`,
    strength: Math.min(1, params.evidence.length / 10),
    evidenceIds: params.evidence.map((item) => item.id),
  });

  if (params.themes.length > 0) {
    events.push({
      id: "EE-2",
      title: "Themes began to stabilize",
      description: `${params.themes.length} recurring pattern${
        params.themes.length === 1 ? "" : "s"
      } emerged from the evidence.`,
      strength: averageConfidence(params.themes.map((theme) => theme.confidence)),
      evidenceIds: unique(params.themes.flatMap((theme) => theme.evidenceIds)),
    });
  }

  if (params.contradictions.length > 0) {
    events.push({
      id: "EE-3",
      title: "Tensions surfaced",
      description: `${params.contradictions.length} unresolved tension${
        params.contradictions.length === 1 ? "" : "s"
      } appeared and were preserved instead of being smoothed away.`,
      strength: averageConfidence(
        params.contradictions.map((contradiction) => contradiction.confidence)
      ),
      evidenceIds: unique(
        params.contradictions.flatMap(
          (contradiction) => contradiction.evidenceIds
        )
      ),
    });
  }

  if (params.beliefs.length > 0) {
    events.push({
      id: "EE-4",
      title: "A candidate belief formed",
      description: params.beliefs[0].headline,
      understandingId: params.understanding.id,
      strength: params.beliefs[0].confidence,
      evidenceIds: params.beliefs[0].supportingEvidenceIds,
    });
  }

  events.push({
    id: "EE-5",
    title: "Current understanding stabilized",
    description: params.understanding.title,
    understandingId: params.understanding.id,
    strength: params.understanding.confidence,
    evidenceIds: params.understanding.evidenceIds,
  });

  return events;
}

function averageConfidence(values: number[]): number {
  if (values.length === 0) return 0;

  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}