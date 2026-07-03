import { InvestigationInput } from "../types";
import { buildBeliefs } from "./beliefs";
import { buildCausalChains } from "./causal";
import { propagateConfidence } from "./confidencePropagation";
import { detectContradictions } from "./contradictions";
import { buildInitialDelta } from "./delta";
import { buildEmergenceEvents } from "./emergence";
import { buildEvidence } from "./evidence";
import { buildEvidenceNetwork } from "./evidenceNetwork";
import { generateExplanations } from "./explanations";
import { buildHypotheses } from "./hypotheses";
import { buildMechanisms } from "./mechanism";
import { buildOrganismState } from "./organismState";
import {
  scoreBeliefs,
  scoreCausalChains,
  scoreContradictions,
  scoreSignals,
  scoreThemes,
} from "./priority";
import { buildReasoningGraph } from "./reasoningGraph";
import { detectSignals } from "./signals";
import { detectThemes } from "./themes";
import { DiscoveryV3Result } from "./types";
import { buildUnderstanding } from "./understanding";
import { runUnderstandingEngine } from "./understanding/index";
import { buildUnderstandingObject } from "./understandingObject";
import {
  createInvestigationWorkspace,
  workspaceToResult,
} from "./workspace";

export function runDiscoveryV3(input: InvestigationInput): DiscoveryV3Result {
  const rawText = `
Company: ${input.company}
Website: ${input.website}
Industry: ${input.industry}
Question: ${input.question}

Context:
${input.context}
`;

  const workspace = createInvestigationWorkspace(rawText);

  workspace.metadata.stage = "evidence";
  workspace.evidence = buildEvidence(workspace.rawText);

  workspace.metadata.stage = "evidenceNetwork";
  workspace.evidenceNetwork = buildEvidenceNetwork(workspace.evidence);
  workspace.evidenceRelationships = workspace.evidenceNetwork.relationships;

  workspace.metadata.stage = "signals";
  workspace.signals = scoreSignals(detectSignals(workspace.evidence));

  workspace.metadata.stage = "themes";
  workspace.themes = scoreThemes(
    detectThemes(workspace.evidence, workspace.signals)
  );

  workspace.metadata.stage = "contradictions";
  workspace.contradictions = scoreContradictions(
    detectContradictions(workspace.evidence, workspace.themes)
  );

  workspace.metadata.stage = "mechanisms";
  workspace.mechanisms = buildMechanisms(
    workspace.evidenceNetwork,
    workspace.themes,
    workspace.contradictions
  );

  workspace.metadata.stage = "causalChains";
  workspace.causalChains = scoreCausalChains(
    buildCausalChains(workspace.evidence, workspace.themes)
  );

  workspace.metadata.stage = "explanations";
  workspace.explanations = generateExplanations(
    workspace.themes,
    workspace.contradictions,
    workspace.causalChains
  );

  workspace.metadata.stage = "understanding";
  const draftUnderstanding = buildUnderstanding(
    workspace.themes,
    workspace.explanations,
    workspace.causalChains
  );

  workspace.metadata.stage = "beliefs";
  workspace.beliefs = scoreBeliefs(
    buildBeliefs(
      draftUnderstanding,
      workspace.mechanisms,
      workspace.contradictions
    )
  );

  workspace.metadata.stage = "confidencePropagation";
  const propagatedConfidence = propagateConfidence({
    evidence: workspace.evidence,
    evidenceNetwork: workspace.evidenceNetwork,
    mechanisms: workspace.mechanisms,
    beliefs: workspace.beliefs,
  });

  workspace.metadata.stage = "hypotheses";
  workspace.hypotheses = buildHypotheses({
    evidence: workspace.evidence,
    themes: workspace.themes,
    contradictions: workspace.contradictions,
    mechanisms: workspace.mechanisms,
    beliefs: workspace.beliefs,
    propagatedConfidence,
  });

  workspace.metadata.stage = "canonicalUnderstanding";
  const canonicalUnderstanding = buildUnderstandingObject({
    beliefs: workspace.beliefs,
    evidence: workspace.evidence,
    themes: workspace.themes,
    contradictions: workspace.contradictions,
  });

  workspace.understanding = [canonicalUnderstanding];

  workspace.metadata.stage = "executiveUnderstanding";
  workspace.executiveUnderstanding = runUnderstandingEngine({
    evidence: workspace.evidence,
    themes: workspace.themes,
    contradictions: workspace.contradictions,
    beliefs: workspace.beliefs,
    understanding: canonicalUnderstanding,
  });

  workspace.metadata.stage = "emergence";
  workspace.emergenceEvents = buildEmergenceEvents({
    evidence: workspace.evidence,
    themes: workspace.themes,
    contradictions: workspace.contradictions,
    beliefs: workspace.beliefs,
    understanding: canonicalUnderstanding,
  });

  workspace.metadata.stage = "organismState";
  workspace.organismState = buildOrganismState({
    evidence: workspace.evidence,
    themes: workspace.themes,
    contradictions: workspace.contradictions,
    mechanisms: workspace.mechanisms,
    hypotheses: workspace.hypotheses,
    beliefs: workspace.beliefs,
    understanding: canonicalUnderstanding,
  });

  workspace.metadata.stage = "delta";
  workspace.delta = buildInitialDelta({
    beliefs: workspace.beliefs,
    contradictions: workspace.contradictions,
    organismState: workspace.organismState,
  });

  workspace.metadata.stage = "reasoningGraph";
  workspace.reasoningGraph = buildReasoningGraph({
    evidence: workspace.evidence,
    signals: workspace.signals,
    themes: workspace.themes,
    contradictions: workspace.contradictions,
    causalChains: workspace.causalChains,
    explanations: workspace.explanations,
    understanding: workspace.understanding,
    beliefs: workspace.beliefs,
    executiveUnderstanding: workspace.executiveUnderstanding,
  });

  workspace.metadata.stage = "complete";

  return workspaceToResult(workspace);
}

export { buildUnderstandingObject } from "./understandingObject";
export { buildEmergenceEvents } from "./emergence";
export {
  createInvestigationWorkspace,
  workspaceToResult,
} from "./workspace";