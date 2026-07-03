import { Evidence, InvestigationInput, ParsedInput } from "./types";

function classifyEvidence(text: string): Evidence["type"] {
  const lower = text.toLowerCase();

  if (lower.includes("?")) return "question";
  if (lower.includes("risk") || lower.includes("concern")) return "risk";
  if (lower.includes("opportunity") || lower.includes("could")) return "opportunity";
  if (lower.includes("complain") || lower.includes("says") || lower.includes("mentions")) return "claim";
  if (/\d/.test(text)) return "metric";

  return "observation";
}

export function extractEvidence(
  parsed: ParsedInput,
  input: InvestigationInput
): Evidence[] {
  const lines = parsed.rawText
    .split(/[.\n]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 12)
    .filter((line) => !line.startsWith("Company:"))
    .filter((line) => !line.startsWith("Website:"))
    .filter((line) => !line.startsWith("Industry:"))
    .filter((line) => !line.startsWith("Context:"));

  return lines.map((line, index) => ({
    id: `evidence-${index + 1}`,
    text: line,
    type: classifyEvidence(line),
    source: input.company || "investigation-input",
    confidence: 70,
    entities: [input.company, input.industry].filter(Boolean),
    tags: [],
  }));
}