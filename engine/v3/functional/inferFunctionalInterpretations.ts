import type {
  FunctionalInterpretation,
  FunctionalInterpretationState,
} from "./functionalInterpretation";

type UnderstandingLike = {
  id: string;
  statement?: string;
  summary?: string;
  description?: string;
  confidence?: number;
  strength?: number;
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function inferCategory(text: string): FunctionalInterpretation["category"] {
  if (includesAny(text, ["approval", "authority", "permission", "executive"])) {
    return "authority";
  }

  if (includesAny(text, ["coordinate", "handoff", "alignment", "department"])) {
    return "coordination";
  }

  if (includesAny(text, ["knowledge", "documentation", "memory", "retained"])) {
    return "knowledge";
  }

  if (includesAny(text, ["execute", "execution", "delivery", "process"])) {
    return "execution";
  }

  if (includesAny(text, ["decision", "decide", "prioritize"])) {
    return "decision";
  }

  if (includesAny(text, ["owner", "ownership", "accountable", "responsible"])) {
    return "ownership";
  }

  return "unknown";
}

function inferStatement(text: string): string {
  if (includesAny(text, ["approval", "permission", "executive"])) {
    return "Decision authority appears centralized.";
  }

  if (includesAny(text, ["coordinate", "handoff", "alignment"])) {
    return "Coordination appears dependent on fragile handoffs.";
  }

  if (includesAny(text, ["knowledge", "documentation", "memory", "retained"])) {
    return "Knowledge does not appear consistently retained by the organization.";
  }

  if (includesAny(text, ["process", "execute", "execution", "delivery"])) {
    return "Execution appears inconsistent across operating contexts.";
  }

  if (includesAny(text, ["owner", "ownership", "responsible", "accountable"])) {
    return "Ownership appears unclear or weakly enforced.";
  }

  return "An organizational dynamic is implied but not yet clearly classified.";
}

export function inferFunctionalInterpretations(params: {
  understandings: UnderstandingLike[];
  existingState?: FunctionalInterpretationState;
  now?: string;
}): FunctionalInterpretationState {
  const { understandings, existingState } = params;
  const now = params.now ?? new Date().toISOString();

  const existing = existingState?.interpretations ?? [];
  const nextInterpretations = [...existing];

  for (const understanding of understandings) {
    const text = [
      understanding.statement,
      understanding.summary,
      understanding.description,
    ]
      .map(normalizeText)
      .filter(Boolean)
      .join(" ");

    if (!text) continue;

    const statement = inferStatement(text);
    const category = inferCategory(text);

    const existingMatch = nextInterpretations.find(
      (interpretation) => interpretation.statement === statement
    );

    if (existingMatch) {
      existingMatch.strength = Math.min(1, existingMatch.strength + 0.08);
      existingMatch.confidence = Math.min(
        1,
        existingMatch.confidence + 0.05
      );
      existingMatch.status =
        existingMatch.strength >= 0.75 ? "stable" : "reinforced";
      existingMatch.updatedAt = now;

      if (!existingMatch.supportingUnderstandingIds.includes(understanding.id)) {
        existingMatch.supportingUnderstandingIds.push(understanding.id);
      }

      continue;
    }

    nextInterpretations.push({
      id: `functional-interpretation-${nextInterpretations.length + 1}`,
      statement,
      category,
      description:
        "A reusable organizational dynamic inferred from accumulated understanding.",
      confidence: Math.max(0.45, understanding.confidence ?? 0.55),
      strength: Math.max(0.35, understanding.strength ?? 0.45),
      status: "new",
      supportingUnderstandingIds: [understanding.id],
      createdAt: now,
      updatedAt: now,
    });
  }

  return {
    interpretations: nextInterpretations,
    lastUpdatedAt: now,
  };
}