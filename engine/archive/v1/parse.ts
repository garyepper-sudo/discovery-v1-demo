import { InvestigationInput, ParsedInput } from "../../types";
import { atomize } from "./atomize";

export function parse(input: InvestigationInput): ParsedInput {
  const rawText = `
Company: ${input.company}
Website: ${input.website}
Industry: ${input.industry}
Question: ${input.question}

Context:
${input.context}
`;

  const questions = rawText
    .split("\n")
    .filter((line) => line.includes("?"))
    .map((line) => line.trim());

  const atoms = atomize(rawText);

  return {
    rawText,
    facts: [],
    assumptions: [],
    questions,
    entities: [input.company, input.industry].filter(Boolean),
    atoms,
    evidence: [],
  };
}