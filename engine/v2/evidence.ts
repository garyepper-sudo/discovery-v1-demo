export interface EvidenceNode {
  id: string;

  text: string;

  type:
    | "fact"
    | "claim"
    | "question"
    | "risk"
    | "goal"
    | "observation";

  confidence: number;

  entities: string[];

  keywords: string[];

  supports: string[];

  contradicts: string[];

  related: string[];
}

export function createEvidence(text: string): EvidenceNode[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => ({
    id: `ev-${index}`,
    text: line,
    type: classify(line),
    confidence: 70,
    entities: [],
    keywords: extractKeywords(line),
    supports: [],
    contradicts: [],
    related: [],
  }));
}

function classify(text: string): EvidenceNode["type"] {
  const lower = text.toLowerCase();

  if (lower.includes("?")) return "question";
  if (lower.includes("risk")) return "risk";
  if (lower.includes("goal")) return "goal";
  if (lower.includes("should")) return "claim";

  return "observation";
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 4);
}