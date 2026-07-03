import {
  V3Evidence,
  V3EvidenceRelationship,
  V3EvidenceRelationshipType,
} from "./types";

const CONTRADICTION_TERMS = [
  ["increase", "decrease"],
  ["increased", "decreased"],
  ["growth", "decline"],
  ["growing", "shrinking"],
  ["positive", "negative"],
  ["improved", "worsened"],
  ["strong", "weak"],
  ["higher", "lower"],
  ["up", "down"],
  ["success", "failure"],
  ["profit", "loss"],
];

const EXPLANATION_TERMS = [
  "because",
  "due to",
  "caused by",
  "driven by",
  "as a result",
  "therefore",
  "leads to",
  "resulting in",
  "explains",
];

const DEPENDENCY_TERMS = [
  "requires",
  "depends on",
  "after",
  "before",
  "following",
  "based on",
  "enabled by",
  "blocked by",
];

export function buildEvidenceRelationships(
  evidence: V3Evidence[]
): V3EvidenceRelationship[] {
  const relationships: V3EvidenceRelationship[] = [];

  for (let i = 0; i < evidence.length; i++) {
    for (let j = i + 1; j < evidence.length; j++) {
      const a = evidence[i];
      const b = evidence[j];

      const relationship = detectRelationship(a, b);

      if (relationship) {
        relationships.push({
          id: `ER-${relationships.length + 1}`,
          ...relationship,
        });
      }
    }
  }

  return relationships;
}

function detectRelationship(
  a: V3Evidence,
  b: V3Evidence
): Omit<V3EvidenceRelationship, "id"> | null {
  const aText = getEvidenceText(a);
  const bText = getEvidenceText(b);

  const overlap = keywordOverlap(aText, bText);

  if (isDuplicate(aText, bText, overlap)) {
    return createRelationship(
      a,
      b,
      "duplicates",
      0.9,
      "These evidence items appear to describe the same underlying observation."
    );
  }

  if (isContradiction(aText, bText, overlap)) {
    return createRelationship(
      a,
      b,
      "contradicts",
      0.74,
      "These evidence items appear to describe opposing movement or conflicting interpretations."
    );
  }

  if (
    containsAny(aText, EXPLANATION_TERMS) ||
    containsAny(bText, EXPLANATION_TERMS)
  ) {
    if (overlap >= 0.18) {
      return createRelationship(
        a,
        b,
        "explains",
        0.7,
        "One evidence item appears to provide a possible explanation for the other."
      );
    }
  }

  if (
    containsAny(aText, DEPENDENCY_TERMS) ||
    containsAny(bText, DEPENDENCY_TERMS)
  ) {
    if (overlap >= 0.15) {
      return createRelationship(
        a,
        b,
        "depends_on",
        0.66,
        "One evidence item appears to depend on context or conditions described by the other."
      );
    }
  }

  if (overlap >= 0.42) {
    return createRelationship(
      a,
      b,
      "supports",
      0.78,
      "These evidence items reinforce the same theme or underlying pattern."
    );
  }

  if (overlap >= 0.25) {
    return createRelationship(
      a,
      b,
      "extends",
      0.62,
      "These evidence items appear related, with one adding useful detail or context to the other."
    );
  }

  return null;
}

function createRelationship(
  a: V3Evidence,
  b: V3Evidence,
  type: V3EvidenceRelationshipType,
  confidence: number,
  explanation: string
): Omit<V3EvidenceRelationship, "id"> {
  return {
    sourceEvidenceId: a.id,
    targetEvidenceId: b.id,
    type,
    confidence,
    explanation,
  };
}

function getEvidenceText(evidence: V3Evidence): string {
  return [
    getStringValue(evidence, "title"),
    getStringValue(evidence, "summary"),
    getStringValue(evidence, "content"),
    getStringValue(evidence, "text"),
    getStringValue(evidence, "claim"),
    getStringValue(evidence, "description"),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getStringValue(obj: unknown, key: string): string {
  if (!obj || typeof obj !== "object") return "";

  const value = (obj as Record<string, unknown>)[key];

  return typeof value === "string" ? value : "";
}

function keywordOverlap(a: string, b: string): number {
  const aWords = significantWords(a);
  const bWords = significantWords(b);

  if (aWords.length === 0 || bWords.length === 0) return 0;

  const bSet = new Set(bWords);
  const shared = aWords.filter((word) => bSet.has(word));

  return shared.length / Math.min(aWords.length, bWords.length);
}

function significantWords(text: string): string[] {
  const stopWords = new Set([
    "the",
    "and",
    "but",
    "for",
    "with",
    "from",
    "that",
    "this",
    "are",
    "was",
    "were",
    "has",
    "have",
    "had",
    "not",
    "into",
    "over",
    "under",
    "their",
    "they",
    "them",
    "its",
    "our",
    "you",
    "your",
  ]);

  return text
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length > 3 && !stopWords.has(word));
}

function containsAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function isDuplicate(a: string, b: string, overlap: number): boolean {
  return overlap >= 0.68 || normalize(a) === normalize(b);
}

function isContradiction(a: string, b: string, overlap: number): boolean {
  if (overlap < 0.12) return false;

  return CONTRADICTION_TERMS.some(([positive, negative]) => {
    return (
      (a.includes(positive) && b.includes(negative)) ||
      (a.includes(negative) && b.includes(positive))
    );
  });
}

function normalize(text: string): string {
  return text.replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}