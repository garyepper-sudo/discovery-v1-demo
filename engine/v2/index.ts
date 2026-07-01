import { InvestigationInput } from "../types";
import { createEvidence } from "./evidence";
import { buildEvidenceGraph } from "./graph";
import { detectThemes } from "./themes";
import {
  detectTensionsFromThemes,
  generateExplanationsFromReasoning,
} from "./reasoning";
import { createExecutiveBriefV2 } from "./executive";

export function runDiscoveryV2(input: InvestigationInput) {
  const rawText = `
Company: ${input.company}
Website: ${input.website}
Industry: ${input.industry}
Question: ${input.question}

Context:
${input.context}
`;

  const evidence = createEvidence(rawText);
  const graph = buildEvidenceGraph(evidence);
  const themes = detectThemes(graph);
  const tensions = detectTensionsFromThemes(themes, graph);
  const explanations = generateExplanationsFromReasoning(themes, tensions);
  const executiveBrief = createExecutiveBriefV2({
    themes,
    tensions,
    explanations,
  });

  return {
    evidence,
    graph,
    themes,
    tensions,
    explanations,
    executiveBrief,
  };
}