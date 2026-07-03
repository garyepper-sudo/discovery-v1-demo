import { InvestigationInput, Observation, Signal } from "../../types";

export function extractSignals(
  observations: Observation[],
  input: InvestigationInput
): Signal[] {
  return observations.slice(0, 5).map((observation, index) => ({
    title: `Signal ${index + 1}: ${observation.description.slice(0, 80)}`,
    category: inferCategory(observation.description),
    importance: 70 - index * 5,
    evidence: observation.sourceText,
    whyItMatters: `This may matter because it connects the investigation question — "${input.question}" — to the available context.`,
  }));
}

function inferCategory(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes("risk") || lower.includes("threat")) return "Risk";
  if (lower.includes("customer") || lower.includes("user")) return "Customer";
  if (lower.includes("competitor") || lower.includes("market")) return "Market";
  if (lower.includes("revenue") || lower.includes("sales")) return "Commercial";
  if (lower.includes("ai") || lower.includes("technology")) return "Technology";

  return "Strategic Signal";
}