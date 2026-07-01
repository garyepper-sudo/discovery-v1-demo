import { buildBeliefs } from "./beliefs";
import {
  detectReasoningPatterns,
  buildCausalChains,
  generateCompetingExplanations,
} from "./reasoning";
import { extractEvidence } from "./extractEvidence";
import { detectTensions } from "./tensions";
import { generateHypotheses } from "./hypotheses";
import { buildGraph } from "./graph";
import { InvestigationInput, EngineResult } from "./types";
import { parse } from "./parse";
import { createObservations } from "./observations";
import { buildWorkspace } from "./workspace";
import { extractSignals } from "./signals";
import { createUnderstandings } from "./understanding";
import { createBrief } from "./brief";
import { detectSurprises } from "./surprise";

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