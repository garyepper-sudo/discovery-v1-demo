import {
  V3Evidence,
  V3Theme,
  V3ThemeRelationship,
} from "./types";

export function buildThemeRelationships(
  themes: V3Theme[],
  evidence: V3Evidence[]
): V3ThemeRelationship[] {
  const relationships: V3ThemeRelationship[] = [];

  for (let i = 0; i < themes.length; i++) {
    for (let j = i + 1; j < themes.length; j++) {
      const source = themes[i];
      const target = themes[j];

      const sharedEvidenceIds = getSharedEvidenceIds(source, target);
      const relationship = inferRelationship(source, target, sharedEvidenceIds);

      if (!relationship) continue;

      relationships.push({
        id: `TR${relationships.length + 1}`,
        sourceThemeId: source.id,
        targetThemeId: target.id,
        relationship: relationship.type,
        confidence: relationship.confidence,
        explanation: buildExplanation(source, target, relationship.type),
        sharedEvidenceIds,
      });
    }
  }

  return relationships
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);
}

function getSharedEvidenceIds(source: V3Theme, target: V3Theme): string[] {
  return source.evidenceIds.filter((id) => target.evidenceIds.includes(id));
}

function inferRelationship(
  source: V3Theme,
  target: V3Theme,
  sharedEvidenceIds: string[]
):
  | {
      type: V3ThemeRelationship["relationship"];
      confidence: number;
    }
  | null {
  const sharedSignals = getSharedSignals(source, target);
  const sourceTitle = source.title.toLowerCase();
  const targetTitle = target.title.toLowerCase();

  if (source.polarity && target.polarity && source.polarity !== target.polarity) {
    return {
      type: "contradicts",
      confidence: clamp(0.52 + sharedEvidenceIds.length * 0.08),
    };
  }

  if (sharedEvidenceIds.length > 0 || sharedSignals.length > 0) {
    return {
      type: "reinforces",
      confidence: clamp(
        0.55 +
          sharedEvidenceIds.length * 0.08 +
          sharedSignals.length * 0.06
      ),
    };
  }

  if (
    sourceTitle.includes("demand") &&
    targetTitle.includes("technology")
  ) {
    return {
      type: "supports",
      confidence: 0.72,
    };
  }

  if (
    sourceTitle.includes("technology") &&
    targetTitle.includes("demand")
  ) {
    return {
      type: "supports",
      confidence: 0.72,
    };
  }

  if (
    sourceTitle.includes("customer") &&
    targetTitle.includes("leadership")
  ) {
    return {
      type: "contradicts",
      confidence: 0.76,
    };
  }

  if (
    sourceTitle.includes("leadership") &&
    targetTitle.includes("customer")
  ) {
    return {
      type: "contradicts",
      confidence: 0.76,
    };
  }

  if (
    sourceTitle.includes("competitive") ||
    targetTitle.includes("competitive")
  ) {
    return {
      type: "correlates",
      confidence: 0.62,
    };
  }

  return null;
}

function getSharedSignals(source: V3Theme, target: V3Theme): string[] {
  const sourceSignals = source.signalIds ?? [];
  const targetSignals = target.signalIds ?? [];

  return sourceSignals.filter((id) => targetSignals.includes(id));
}

function buildExplanation(
  source: V3Theme,
  target: V3Theme,
  relationship: V3ThemeRelationship["relationship"]
): string {
  if (relationship === "contradicts") {
    return `${source.title} and ${target.title} appear to be pulling the understanding in different directions.`;
  }

  if (relationship === "reinforces") {
    return `${source.title} and ${target.title} appear to reinforce the same underlying pattern.`;
  }

  if (relationship === "supports") {
    return `${source.title} appears to support or strengthen ${target.title}.`;
  }

  if (relationship === "depends_on") {
    return `${source.title} may depend on ${target.title}.`;
  }

  if (relationship === "causes") {
    return `${source.title} may be contributing causally to ${target.title}.`;
  }

  return `${source.title} and ${target.title} appear related in the current evidence.`;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}