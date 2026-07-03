import { buildBeliefs } from "./archive/v1/beliefs";
import {
  detectReasoningPatterns,
  buildCausalChains,
  generateCompetingExplanations,
} from "./archive/v1/reasoning";
import { extractEvidence } from "./archive/v1/extractEvidence";
import { detectTensions } from "./archive/v1/tensions";
import { generateHypotheses } from "./archive/v1/hypotheses";
import { buildGraph } from "./archive/v1/graph";
import { InvestigationInput, EngineResult } from "./types";
import { parse } from "./archive/v1/parse";
import { createObservations } from "./archive/v1/observations";
import { buildWorkspace } from "./archive/v1/workspace";
import { extractSignals } from "./archive/v1/signals";
import { createUnderstandings } from "./archive/v1/understanding";
import { createBrief } from "./archive/v1/brief";
import { detectSurprises } from "./archive/v1/surprise";

export async function runDiscovery(
  input: InvestigationInput
): Promise<EngineResult> {
  const parsed = parse(input);
  const evidence = extractEvidence(parsed, input);
  parsed.evidence = evidence;
  console.log("Evidence:", evidence);

  const observations = createObservations(parsed);
  const workspace = buildWorkspace(observations);
  const patterns = detectReasoningPatterns(workspace);
  const causalChains = buildCausalChains(workspace);
  const explanations = generateCompetingExplanations(workspace, causalChains);
  const signals = extractSignals(observations, input);
  const graph = buildGraph(parsed.atoms);

  console.log("Discovery graph:", graph);

  const tensions = detectTensions(graph);
  console.log("Strategic tensions:", tensions);

  const surprises = detectSurprises(observations, signals);
  console.log("Surprises:", surprises);

  const hypotheses = generateHypotheses(tensions);
  console.log("Hypotheses:", hypotheses);

  const beliefs = buildBeliefs(parsed.atoms);
  console.log("Beliefs:", beliefs);

  const understandings = createUnderstandings({
  workspace,
  hypotheses,
  signals,
  surprises,
});

  const brief = createBrief(
    input,
    understandings,
    signals,
    surprises,
    hypotheses,
    beliefs
  );

  return {
    input,
    parsed,
    observations,
    workspace,
    patterns,
    causalChains,
    explanations,
    tensions,
    hypotheses,
    beliefs,
    signals,
    surprises,
    understandings,
    brief,
  };
}