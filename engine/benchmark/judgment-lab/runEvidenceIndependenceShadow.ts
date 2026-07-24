import type { InvestigationInput } from "../../types";
import { buildBeliefs } from "../../v3/beliefs";
import { buildCausalChains } from "../../v3/causal";
import { propagateConfidence } from "../../v3/confidencePropagation";
import { detectContradictions } from "../../v3/contradictions";
import { buildInitialDelta } from "../../v3/delta";
import { buildEmergenceEvents } from "../../v3/emergence";
import { buildEvidence } from "../../v3/evidence";
import { buildEvidenceNetwork } from "../../v3/evidenceNetwork";
import { generateExplanations } from "../../v3/explanations";
import { buildHypotheses } from "../../v3/hypotheses";
import { buildMechanisms } from "../../v3/mechanism";
import { buildObservations } from "../../v3/observations";
import { buildOrganismState } from "../../v3/organismState";
import {
  scoreBeliefs,
  scoreCausalChains,
  scoreContradictions,
  scoreSignals,
  scoreThemes,
} from "../../v3/priority";
import { buildReasoningGraph } from "../../v3/reasoningGraph";
import { detectSignals } from "../../v3/signals";
import { detectThemes } from "../../v3/themes";
import type {
  DiscoveryV3Result,
  V3Evidence,
  V3Signal,
  V3Theme,
} from "../../v3/types";
import { buildUnderstanding } from "../../v3/understanding";
import { runUnderstandingEngine } from "../../v3/understanding/index";
import { buildUnderstandingObject } from "../../v3/understandingObject";
import {
  createInvestigationWorkspace,
  workspaceToResult,
} from "../../v3/workspace";

const RECORD_SUPPORT_INCREMENT = 0.045;
const MAX_SUPPORT_BONUS = 0.18;
const THEME_EVIDENCE_INCREMENT = 0.09;
const THEME_MAX_EVIDENCE_WEIGHT = 0.35;
const THEME_STABILITY_INCREMENT = 0.12;
const THEME_MAX_STABILITY_SUPPORT = 0.55;

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function supportBonus(count: number): number {
  return Math.min(MAX_SUPPORT_BONUS, count * RECORD_SUPPORT_INCREMENT);
}

function contributingSourceCountForEvidenceIds(
  evidenceIds: string[],
  evidenceById: Map<string, V3Evidence>,
): number {
  const sourceIds = new Set<string>();

  for (const evidenceId of evidenceIds) {
    const evidence = evidenceById.get(evidenceId);
    if (!evidence) continue;

    // Absence of provenance is not evidence of shared origin. Conservatively
    // retain the production contribution for each unprovenanced record.
    sourceIds.add(evidence.sourceId ?? `unprovenanced:${evidence.id}`);
  }

  return sourceIds.size;
}

/**
 * Benchmark-only simulation of one prospective production change.
 *
 * Signal detection remains canonical. Only the raw-record support-bonus term
 * is replaced with a unique-sourceId support-bonus term. All evidence records,
 * semantic matching, specificity bonuses, and downstream production functions
 * remain unchanged.
 */
export function applyEvidenceIndependenceToSignals(
  signals: V3Signal[],
  evidence: V3Evidence[],
): V3Signal[] {
  const evidenceById = new Map(evidence.map((item) => [item.id, item]));

  return scoreSignals(
    signals
      .map((signal, originalIndex) => {
        const recordCount = signal.evidenceIds.length;
        const sourceCount = contributingSourceCountForEvidenceIds(
          signal.evidenceIds,
          evidenceById,
        );
        const confidence = clamp(
          signal.confidence -
            supportBonus(recordCount) +
            supportBonus(sourceCount),
        );

        return {
          ...signal,
          confidence: Number(confidence.toFixed(12)),
          priority: undefined,
          originalIndex,
        };
      })
      .sort(
        (left, right) =>
          right.confidence - left.confidence ||
          left.originalIndex - right.originalIndex,
      )
      .map(({ originalIndex: _originalIndex, ...signal }) => signal),
  );
}

function average(values: number[]): number {
  return values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Benchmark-only Theme composition policy.
 *
 * This reproduces the canonical Theme confidence and stability formulas while
 * replacing only their raw evidence-count terms with unique-sourceId counts.
 * Signal-derived Theme confidence remains owned by the already-adjusted Signal;
 * its Theme stability still receives the isolated source-aware composition.
 */
export function applyEvidenceIndependenceToThemes(
  themes: V3Theme[],
  evidence: V3Evidence[],
): V3Theme[] {
  const evidenceById = new Map(evidence.map((item) => [item.id, item]));

  return scoreThemes(
    themes
      .map((theme, originalIndex) => {
        const matchedEvidence = theme.evidenceIds
          .map((id) => evidenceById.get(id))
          .filter((item): item is V3Evidence => item !== undefined);
        if (matchedEvidence.length === 0) {
          return {
            ...theme,
            originalIndex,
          };
        }

        const sourceCount = contributingSourceCountForEvidenceIds(
          theme.evidenceIds,
          evidenceById,
        );
        const evidenceConfidence = average(
          matchedEvidence.map((item) => item.confidence),
        );
        const polarityConsistency =
          new Set(
            matchedEvidence.map((item) => item.polarity ?? "unknown"),
          ).size <= 2
            ? 0.1
            : 0;
        const stability = Number(
          Math.min(
            0.95,
            Math.min(
              THEME_MAX_STABILITY_SUPPORT,
              sourceCount * THEME_STABILITY_INCREMENT,
            ) +
              evidenceConfidence * 0.35 +
              polarityConsistency,
          ).toFixed(2),
        );

        if (theme.id.startsWith("ST")) {
          return {
            ...theme,
            stability,
            priority: undefined,
            originalIndex,
          };
        }

        const strongSignalBonus = matchedEvidence.some(
          (item) => item.strength === "strong",
        )
          ? 0.08
          : 0;
        const confidence = Number(
          Math.min(
            0.96,
            0.25 +
              Math.min(
                THEME_MAX_EVIDENCE_WEIGHT,
                sourceCount * THEME_EVIDENCE_INCREMENT,
              ) +
              evidenceConfidence * 0.45 +
              strongSignalBonus,
          ).toFixed(2),
        );

        return {
          ...theme,
          confidence,
          stability,
          priority: undefined,
          originalIndex,
        };
      })
      .sort(
        (left, right) =>
          right.confidence - left.confidence ||
          left.originalIndex - right.originalIndex,
      )
      .map(({ originalIndex: _originalIndex, ...theme }) => theme),
  );
}

/**
 * Benchmark-only copy of the canonical Discovery V3 orchestration.
 *
 * The sole behavioral difference is marked at the signals stage. This wrapper
 * is not a platform capability and must never be imported by production.
 */
export function runEvidenceIndependenceShadow(
  input: InvestigationInput,
  options: {
    themeEvidenceComposition?: "production" | "independent-source";
  } = {},
): DiscoveryV3Result {
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
  workspace.evidence = buildEvidence(workspace.rawText, input.evidenceSources);

  workspace.metadata.stage = "evidenceNetwork";
  workspace.evidenceNetwork = buildEvidenceNetwork(workspace.evidence);
  workspace.evidenceRelationships = workspace.evidenceNetwork.relationships;

  workspace.metadata.stage = "signals";
  workspace.signals = applyEvidenceIndependenceToSignals(
    detectSignals(workspace.evidence),
    workspace.evidence,
  );

  workspace.metadata.stage = "themes";
  const detectedThemes = detectThemes(
    workspace.evidence,
    workspace.signals,
    workspace.evidenceNetwork.relationships,
  );
  workspace.themes =
    options.themeEvidenceComposition === "independent-source"
      ? applyEvidenceIndependenceToThemes(
          detectedThemes,
          workspace.evidence,
        )
      : scoreThemes(detectedThemes);

  workspace.metadata.stage = "observations";
  workspace.observations = buildObservations({
    evidence: workspace.evidence,
    signals: workspace.signals,
    themes: workspace.themes,
  });

  workspace.metadata.stage = "contradictions";
  workspace.contradictions = scoreContradictions(
    detectContradictions(workspace.evidence, workspace.themes),
  );

  workspace.metadata.stage = "mechanisms";
  workspace.mechanisms = buildMechanisms(
    workspace.evidenceNetwork,
    workspace.themes,
    workspace.contradictions,
  );

  workspace.metadata.stage = "causalChains";
  workspace.causalChains = scoreCausalChains(
    buildCausalChains(workspace.evidence, workspace.themes),
  );

  workspace.metadata.stage = "explanations";
  workspace.explanations = generateExplanations(
    workspace.themes,
    workspace.contradictions,
    workspace.causalChains,
  );

  workspace.metadata.stage = "understanding";
  const draftUnderstanding = buildUnderstanding(
    workspace.themes,
    workspace.explanations,
    workspace.causalChains,
  );

  workspace.metadata.stage = "beliefs";
  workspace.beliefs = scoreBeliefs(
    buildBeliefs(
      draftUnderstanding,
      workspace.mechanisms,
      workspace.contradictions,
    ),
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
