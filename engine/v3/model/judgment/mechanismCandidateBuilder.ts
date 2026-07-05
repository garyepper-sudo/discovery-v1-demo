import { mechanismProfiles } from "./mechanismProfiles";
import type {
  InferOrganizationalMechanismsInput,
  MechanismCandidate,
} from "./mechanismInferenceTypes";
import {
  average,
  clamp01,
  countMatches,
  extractSharedTerms,
  normalizeText,
  unique,
} from "./mechanismUtils";

function allProfileTerms(): {
  behaviors: string[];
  capabilities: string[];
  consequences: string[];
} {
  const profiles = Object.values(mechanismProfiles);

  return {
    behaviors: unique(profiles.flatMap((profile) => profile.behaviors)),
    capabilities: unique(profiles.flatMap((profile) => profile.capabilities)),
    consequences: unique(profiles.flatMap((profile) => profile.consequences)),
  };
}

export function buildMechanismCandidates({
  explanations,
  reasoningPaths = [],
  capabilities = [],
  understandingClusters = [],
  judgments = [],
}: InferOrganizationalMechanismsInput): MechanismCandidate[] {
  if (!Array.isArray(explanations) || explanations.length === 0) {
    return [];
  }

  const vocabulary = allProfileTerms();

  const explanationSignals = explanations.map((explanation) => ({
    id: explanation.id,
    text: normalizeText(
      explanation.summary,
      explanation.interpretation,
      explanation.executiveImplication,
      explanation.type,
    ),
    confidence:
      typeof explanation.confidence === "number" ? explanation.confidence : 0.65,
  }));

  const candidates: MechanismCandidate[] = [];

  explanationSignals.forEach((signal, index) => {
    const relatedSignals = explanationSignals.filter((other) => {
      if (other.id === signal.id) return true;

      const sharedBehaviorCount = extractSharedTerms(
        [signal.text, other.text],
        vocabulary.behaviors,
      ).length;

      const sharedCapabilityCount = extractSharedTerms(
        [signal.text, other.text],
        vocabulary.capabilities,
      ).length;

      const sharedConsequenceCount = extractSharedTerms(
        [signal.text, other.text],
        vocabulary.consequences,
      ).length;

      return (
        sharedBehaviorCount +
          sharedCapabilityCount +
          sharedConsequenceCount >
        0
      );
    });

    const sourceTexts = unique(relatedSignals.map((item) => item.text));

    const sharedBehaviors = extractSharedTerms(
      sourceTexts,
      vocabulary.behaviors,
    );

    const sharedCapabilities = extractSharedTerms(
      sourceTexts,
      vocabulary.capabilities,
    );

    const sharedConsequences = extractSharedTerms(
      sourceTexts,
      vocabulary.consequences,
    );

    const reasoningPathIds = reasoningPaths
      .filter((path) => {
        const pathText = normalizeText(
          path.sourceLabel,
          path.targetLabel,
          path.reasoningType,
          path.directness,
          path.summary,
        );

        return (
          countMatches(pathText, sharedBehaviors) +
            countMatches(pathText, sharedCapabilities) +
            countMatches(pathText, sharedConsequences) >
          0
        );
      })
      .map((path) => path.id);

    const capabilityIds = capabilities
      .filter((capability) => {
        const capabilityText = normalizeText(
          capability.name,
          capability.title,
          capability.summary,
          capability.description,
          capability.status,
        );

        return (
          countMatches(capabilityText, sharedBehaviors) +
            countMatches(capabilityText, sharedCapabilities) +
            countMatches(capabilityText, sharedConsequences) >
          0
        );
      })
      .map((capability) => capability.id);

    const clusterIds = understandingClusters
      .filter((cluster) => {
        const clusterText = normalizeText(
          cluster.title,
          cluster.summary,
          cluster.description,
        );

        return (
          countMatches(clusterText, sharedBehaviors) +
            countMatches(clusterText, sharedCapabilities) +
            countMatches(clusterText, sharedConsequences) >
          0
        );
      })
      .map((cluster) => cluster.id);

    const judgmentIds = judgments
      .filter((judgment) => {
        if (
          judgment.explanationId &&
          relatedSignals.some((item) => item.id === judgment.explanationId)
        ) {
          return true;
        }

        const judgmentText = normalizeText(judgment.summary);

        return (
          countMatches(judgmentText, sharedBehaviors) +
            countMatches(judgmentText, sharedCapabilities) +
            countMatches(judgmentText, sharedConsequences) >
          0
        );
      })
      .map((judgment) => judgment.id);

    const supportCount =
      relatedSignals.length +
      reasoningPathIds.length +
      capabilityIds.length +
      clusterIds.length +
      judgmentIds.length;

    const totalSignalCount =
      explanations.length +
      reasoningPaths.length +
      capabilities.length +
      understandingClusters.length +
      judgments.length;

    const sharedTermCount =
      sharedBehaviors.length +
      sharedCapabilities.length +
      sharedConsequences.length;

    candidates.push({
      id: `mechanism-candidate-${index + 1}`,
      explanationIds: unique(relatedSignals.map((item) => item.id)),
      reasoningPathIds: unique(reasoningPathIds),
      capabilityIds: unique(capabilityIds),
      clusterIds: unique(clusterIds),
      judgmentIds: unique(judgmentIds),
      sourceTexts,
      sharedBehaviors,
      sharedCapabilities,
      sharedConsequences,
      convergenceScore: clamp01(supportCount / Math.max(1, totalSignalCount)),
      noveltyScore: clamp01(
        sharedTermCount === 0 ? 0.75 : 0.25 / Math.max(1, sharedTermCount),
      ),
      confidence: clamp01(
        average(relatedSignals.map((item) => item.confidence)) ||
          Math.min(0.95, 0.55 + supportCount * 0.05),
      ),
    });
  });

  const deduped = new Map<string, MechanismCandidate>();

  for (const candidate of candidates) {
    const key = [
      [...candidate.explanationIds].sort().join("|"),
      [...candidate.reasoningPathIds].sort().join("|"),
      [...candidate.capabilityIds].sort().join("|"),
      [...candidate.clusterIds].sort().join("|"),
    ].join("::");

    const existing = deduped.get(key);

    if (!existing || candidate.convergenceScore > existing.convergenceScore) {
      deduped.set(key, candidate);
    }
  }

  return Array.from(deduped.values()).sort((a, b) => {
    const aScore = a.convergenceScore * 0.6 + a.confidence * 0.4;
    const bScore = b.convergenceScore * 0.6 + b.confidence * 0.4;

    return bScore - aScore;
  });
}