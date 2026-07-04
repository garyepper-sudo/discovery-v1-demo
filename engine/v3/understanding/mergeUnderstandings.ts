import type { CanonicalUnderstanding } from "./canonicalUnderstanding";

const GROUPS: Record<string, string[]> = {
  "centralized-decision-making": [
    "central",
    "authority",
    "approval",
    "leadership",
    "decision",
  ],
  "execution-friction": [
    "execution",
    "delivery",
    "implementation",
    "follow-through",
    "operational",
  ],
  "knowledge-retention-risk": [
    "knowledge",
    "memory",
    "retained",
    "individual",
    "systems",
  ],
  "coordination-fragmentation": [
    "coordination",
    "cross-functional",
    "ownership",
    "handoff",
    "fragmented",
  ],
  "planning-execution-gap": [
    "planning",
    "strategy",
    "execution",
    "changes",
    "faster",
  ],
};

function semanticKey(statement: string): string {
  const lower = statement.toLowerCase();

  for (const [key, terms] of Object.entries(GROUPS)) {
    const matches = terms.filter((term) => lower.includes(term)).length;
    if (matches >= 2) return key;
  }

  return lower
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6)
    .join("-");
}

export function mergeCanonicalUnderstandings(
  understandings: CanonicalUnderstanding[]
): CanonicalUnderstanding[] {
  const merged = new Map<string, CanonicalUnderstanding>();

  for (const understanding of understandings) {
    const key = semanticKey(understanding.statement);
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, understanding);
      continue;
    }

    merged.set(key, {
      ...existing,
      supportingEvidence: Array.from(
        new Set([
          ...existing.supportingEvidence,
          ...understanding.supportingEvidence,
        ])
      ),
      supportingDynamics: Array.from(
        new Set([
          ...existing.supportingDynamics,
          ...understanding.supportingDynamics,
        ])
      ),
      supportingCapabilities: Array.from(
        new Set([
          ...existing.supportingCapabilities,
          ...understanding.supportingCapabilities,
        ])
      ),
      contradictoryEvidence: Array.from(
        new Set([
          ...existing.contradictoryEvidence,
          ...understanding.contradictoryEvidence,
        ])
      ),
      investigationIds: Array.from(
        new Set([...existing.investigationIds, ...understanding.investigationIds])
      ),
      confidence: Math.max(existing.confidence, understanding.confidence),
      strength: Math.max(existing.strength, understanding.strength),
      stability: Math.max(existing.stability, understanding.stability),
      updatedAt: new Date().toISOString(),
    });
  }

  return Array.from(merged.values());
}