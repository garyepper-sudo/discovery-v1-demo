import { CognitiveAtom } from "./types";

export function atomize(text: string): CognitiveAtom[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => ({
    id: `atom-${index}`,
    source: line,
    kind: classify(line),
    subject: extractSubject(line),
    predicate: line,
    confidence: 0.7,
  }));
}

function classify(text: string): CognitiveAtom["kind"] {
  const lower = text.toLowerCase();

  if (lower.endsWith("?")) return "question";
  if (lower.includes("need")) return "goal";
  if (lower.includes("risk")) return "risk";
  if (lower.includes("opportunity")) return "opportunity";

  return "observation";
}

function extractSubject(text: string): string {
  const words = text.split(" ");
  return words.slice(0, 3).join(" ");
}