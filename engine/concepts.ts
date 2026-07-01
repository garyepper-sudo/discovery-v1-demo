import { CognitiveAtom } from "./types";

export type StrategicConcept = {
  id: string;
  label: string;
  category:
    | "Market"
    | "Product"
    | "Adoption"
    | "Strategy"
    | "Evidence"
    | "Unknown";
  source: string;
  confidence: number;
};

export function extractConcepts(atoms: CognitiveAtom[]): StrategicConcept[] {
  return atoms
    .map((atom, index) => {
      const label = inferConceptLabel(atom.source);
      const category = inferConceptCategory(atom.source);

      return {
        id: `concept-${index}-${normalize(label)}`,
        label,
        category,
        source: atom.source,
        confidence: atom.confidence,
      };
    })
    .filter((concept) => concept.label.length > 0);
}

function inferConceptLabel(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes("university")) return "Universities";
  if (lower.includes("government")) return "Government";
  if (lower.includes("consultant")) return "Strategy Consultants";
  if (lower.includes("ceo")) return "CEOs";
  if (lower.includes("investor")) return "Investors";

  if (lower.includes("organism")) return "Organism UI";
  if (lower.includes("executive os")) return "Executive OS";
  if (lower.includes("understanding engine")) return "Understanding Engine";
  if (lower.includes("ai research")) return "AI Research Platform";
  if (lower.includes("ai platform")) return "AI Platform";

  if (lower.includes("five minutes")) return "Five-Minute Value";
  if (lower.includes("immediate value")) return "Immediate Value";
  if (lower.includes("weekly") || lower.includes("every week") || lower.includes("monday")) return "Weekly Habit";
  if (lower.includes("memory")) return "Compounding Memory";

  if (lower.includes("wedge")) return "Smallest Wedge";
  if (lower.includes("differentiation")) return "Differentiation";
  if (lower.includes("positioning")) return "Positioning";
  if (lower.includes("messaging")) return "Messaging";

  if (lower.includes("talking to") || lower.includes("feedback")) return "Market Feedback";

  return text.replace(/[?.!]/g, "").slice(0, 60);
}

function inferConceptCategory(text: string): StrategicConcept["category"] {
  const lower = text.toLowerCase();

  if (
    lower.includes("university") ||
    lower.includes("government") ||
    lower.includes("consultant") ||
    lower.includes("ceo") ||
    lower.includes("market")
  ) {
    return "Market";
  }

  if (
    lower.includes("organism") ||
    lower.includes("executive os") ||
    lower.includes("understanding engine") ||
    lower.includes("ai research") ||
    lower.includes("ai platform")
  ) {
    return "Product";
  }

  if (
    lower.includes("five minutes") ||
    lower.includes("immediate value") ||
    lower.includes("weekly") ||
    lower.includes("every week") ||
    lower.includes("monday") ||
    lower.includes("return")
  ) {
    return "Adoption";
  }

  if (
    lower.includes("wedge") ||
    lower.includes("differentiation") ||
    lower.includes("positioning") ||
    lower.includes("messaging")
  ) {
    return "Strategy";
  }

  if (
    lower.includes("talking to") ||
    lower.includes("feedback") ||
    lower.includes("comments")
  ) {
    return "Evidence";
  }

  return "Unknown";
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}