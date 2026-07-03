import { Observation, ParsedInput } from "../../types";

export function createObservations(parsed: ParsedInput): Observation[] {
  // NEW: Build observations from extracted evidence first.
  if (parsed.evidence.length > 0) {
    return parsed.evidence.slice(0, 12).map((evidence, index) => ({
      title: `Observation ${index + 1}: ${capitalize(evidence.type)}`,
      description: evidence.text,
      sourceText: evidence.source,
      confidence: evidence.confidence,
    }));
  }

  // Fallback to cognitive atoms if no evidence exists.
  const atoms = parsed.atoms || [];

  const strategicAtoms = atoms.filter((atom) =>
    ["goal", "question", "risk", "opportunity"].includes(atom.kind)
  );

  const sourceAtoms = strategicAtoms.length > 0 ? strategicAtoms : atoms;

  const observations = sourceAtoms.slice(0, 8).map((atom, index) => ({
    title: `Observation ${index + 1}: ${labelKind(atom.kind)}`,
    description: atom.source,
    sourceText: atom.source,
    confidence: atom.confidence,
  }));

  if (observations.length === 0) {
    return [
      {
        title: "Initial Observation",
        description: "The engine received limited input and needs more context.",
        sourceText: parsed.rawText,
        confidence: 40,
      },
    ];
  }

  return observations;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function labelKind(kind: string): string {
  if (kind === "goal") return "Goal";
  if (kind === "question") return "Question";
  if (kind === "risk") return "Risk";
  if (kind === "opportunity") return "Opportunity";
  if (kind === "assumption") return "Assumption";
  if (kind === "decision") return "Decision";

  return "Observation";
}