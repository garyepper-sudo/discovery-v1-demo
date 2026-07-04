/* =====================================================
   Sprint 21 — Semantic Similarity Layer
   Replaces brittle keyword overlap with concept-aware similarity.
   This is intentionally local/deterministic for now.
   Later it can be swapped for embeddings without changing callers.
   ===================================================== */

export type SemanticSimilarityResult = {
  score: number;
  sharedConcepts: string[];
  reason: string;
};

const CONCEPT_GROUPS: Record<string, string[]> = {
  hiring_capacity: [
    "hiring",
    "recruiting",
    "recruitment",
    "talent",
    "headcount",
    "staffing",
    "capacity",
    "open roles",
    "vacancies",
    "backfill",
  ],

  execution_speed: [
    "execution",
    "speed",
    "velocity",
    "slow",
    "slowing",
    "delayed",
    "delay",
    "bottleneck",
    "timeline",
    "progress",
    "delivery",
  ],

  financial_pressure: [
    "budget",
    "cash",
    "runway",
    "cost",
    "spend",
    "funding",
    "revenue",
    "margin",
    "financial",
    "burn",
  ],

  strategic_alignment: [
    "strategy",
    "alignment",
    "priority",
    "focus",
    "direction",
    "roadmap",
    "objective",
    "goal",
    "tradeoff",
  ],

  customer_signal: [
    "customer",
    "client",
    "market",
    "demand",
    "feedback",
    "usage",
    "retention",
    "churn",
    "adoption",
  ],

  organizational_risk: [
    "risk",
    "concern",
    "issue",
    "threat",
    "fragile",
    "dependency",
    "exposure",
    "uncertainty",
  ],
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function extractConcepts(text: string): string[] {
  const normalized = normalize(text);
  const concepts: string[] = [];

  for (const [concept, terms] of Object.entries(CONCEPT_GROUPS)) {
    if (terms.some((term) => normalized.includes(term))) {
      concepts.push(concept);
    }
  }

  return concepts;
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((word) => word.length > 3);
}

function overlapScore(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);

  const intersection = [...setA].filter((item) => setB.has(item)).length;
  const union = new Set([...a, ...b]).size;

  return union === 0 ? 0 : intersection / union;
}

export function semanticSimilarity(a: string, b: string): SemanticSimilarityResult {
  const conceptsA = extractConcepts(a);
  const conceptsB = extractConcepts(b);

  const sharedConcepts = conceptsA.filter((concept) => conceptsB.includes(concept));

  const conceptScore =
    sharedConcepts.length === 0
      ? 0
      : sharedConcepts.length / new Set([...conceptsA, ...conceptsB]).size;

  const tokenScore = overlapScore(tokenize(a), tokenize(b));

  const score = Math.min(1, conceptScore * 0.75 + tokenScore * 0.25);

  return {
    score,
    sharedConcepts,
    reason:
      sharedConcepts.length > 0
        ? `Shared semantic concepts: ${sharedConcepts.join(", ")}`
        : "No strong shared semantic concepts detected.",
  };
}

export function areSemanticallyRelated(a: string, b: string, threshold = 0.34): boolean {
  return semanticSimilarity(a, b).score >= threshold;
}