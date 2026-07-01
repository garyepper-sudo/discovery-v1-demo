import { V3Evidence } from "./types";

function detectType(text: string): V3Evidence["type"] {
  const t = text.toLowerCase();

  if (t.includes("?")) return "question";

  if (
    t.includes("risk") ||
    t.includes("decline") ||
    t.includes("slow") ||
    t.includes("loss") ||
    t.includes("problem")
  ) {
    return "risk";
  }

  if (
    t.includes("opportunity") ||
    t.includes("growth") ||
    t.includes("expand")
  ) {
    return "opportunity";
  }

  if (
    t.includes("revenue") ||
    t.includes("%") ||
    /\d/.test(t)
  ) {
    return "metric";
  }

  if (
    t.includes("should") ||
    t.includes("plan") ||
    t.includes("decision")
  ) {
    return "decision";
  }

  if (
    t.includes("believes") ||
    t.includes("claims") ||
    t.includes("says")
  ) {
    return "claim";
  }

  return "fact";
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 4)
    .slice(0, 10);
}

function extractEntities(text: string): string[] {
  return text
    .split(/\s+/)
    .filter(word => /^[A-Z][a-zA-Z]+/.test(word))
    .map(word => word.replace(/[^\w]/g, ""));
}

export function buildEvidence(context: string): V3Evidence[] {
  return context
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map((text, i) => ({
      id: `E${i + 1}`,
      text,
      type: detectType(text),
      confidence: 0.8,
      keywords: extractKeywords(text),
      entities: extractEntities(text),
      source: "user"
    }));
}