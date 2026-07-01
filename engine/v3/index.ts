import {
  buildExecutiveUnderstanding,
  buildUnderstanding,
} from "./understanding";
import { InvestigationInput } from "../types";
import { DiscoveryV3Result } from "./types";
import { buildEvidence } from "./evidence";
import { detectThemes } from "./themes";
import { detectContradictions } from "./contradictions";
import { buildCausalChains } from "./causal";
import { generateExplanations } from "./explanations";
;

export function runDiscoveryV3(input: InvestigationInput): DiscoveryV3Result {
  const rawText = `
Company: ${input.company}
Website: ${input.website}
Industry: ${input.industry}
Question: ${input.question}

Context:
${input.context}
`;

  const evidence = buildEvidence(rawText);
  const themes = detectThemes(evidence);
  const contradictions = detectContradictions(evidence, themes);
  const causalChains = buildCausalChains(evidence, themes);
  const explanations = generateExplanations(
    themes,
    contradictions,
    causalChains
  );
  const understanding = buildUnderstanding(
  themes,
  explanations,
  causalChains
  );
  const executiveUnderstanding = buildExecutiveUnderstanding(
  explanations,
  contradictions,
  understanding
  );

  return {
    evidence,
    themes,
    contradictions,
    causalChains,
    explanations,
    understanding,
    emergenceEvents: [],
    executiveUnderstanding,
  };
}