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

function inferFallbackTerms(text: string): {
  behaviors: string[];
  capabilities: string[];
  consequences: string[];
} {
  const behaviors: string[] = [];
  const capabilities: string[] = [];
  const consequences: string[] = [];

  if (countMatches(text, ["delay", "delays", "latency", "bottleneck", "stall", "approval"]) > 0) {
    behaviors.push("delay", "latency", "bottleneck");
    capabilities.push("decision", "execution", "coordination");
    consequences.push("slow execution", "missed timing");
  }

  if (countMatches(text, ["dashboard", "failure", "failures", "system", "platform", "process"]) > 0) {
    behaviors.push("process failure", "system breakdown");
    capabilities.push("execution", "coordination");
    consequences.push("operational drag", "execution risk");
  }

  if (countMatches(text, ["leadership", "manager", "managers", "ownership", "owns", "accountability"]) > 0) {
    behaviors.push("ownership ambiguity", "governance friction");
    capabilities.push("governance", "accountability", "decision");
    consequences.push("decision drag", "coordination risk");
  }

  if (countMatches(text, ["narrative", "communication", "alignment", "clarity", "friction"]) > 0) {
    behaviors.push("communication gap", "alignment gap");
    capabilities.push("communication", "alignment");
    consequences.push("coordination breakdown");
  }

  if (countMatches(text, ["customer", "support", "feedback"]) > 0) {
    behaviors.push("feedback failure", "customer signal loss");
    capabilities.push("customer responsiveness", "learning");
    consequences.push("customer friction");
  }

  if (countMatches(text, ["growth", "pressure", "burnout", "resource", "capacity"]) > 0) {
    behaviors.push("capacity strain", "resource constraint");
    capabilities.push("resource allocation", "planning", "adaptation");
    consequences.push("execution drag", "burnout risk");
  }

  return {
    behaviors: unique(behaviors),
    capabilities: unique(capabilities),
    consequences: unique(consequences),
  };
}

function mergeTerms(
  shared: {
    behaviors: string[];
    capabilities: string[];
    consequences: string[];
  },
  fallback: {
    behaviors: string[];
    capabilities: string[];
    consequences: string[];
  },
): {
  behaviors: string[];
  capabilities: string[];
  consequences: string[];
} {
  return {
    behaviors: unique([...shared.behaviors, ...fallback.behaviors]),
    capabilities: unique([...shared.capabilities, ...fallback.capabilities]),
    consequences: unique([...shared.consequences, ...fallback.consequences]),
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
      explanation.title,
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
    const fallbackForSignal = inferFallbackTerms(signal.text);

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

      const fallbackOverlap =
        countMatches(other.text, fallbackForSignal.behaviors) +
        countMatches(other.text, fallbackForSignal.capabilities) +
        countMatches(other.text, fallbackForSignal.consequences);

      return (
        sharedBehaviorCount +
          sharedCapabilityCount +
          sharedConsequenceCount +
          fallbackOverlap >
        0
      );
    });

    const sourceTexts = unique(relatedSignals.map((item) => item.text));

    const sharedTerms = {
      behaviors: extractSharedTerms(sourceTexts, vocabulary.behaviors),
      capabilities: extractSharedTerms(sourceTexts, vocabulary.capabilities),
      consequences: extractSharedTerms(sourceTexts, vocabulary.consequences),
    };

    const fallbackTerms = sourceTexts.reduce(
      (acc, text) => {
        const inferred = inferFallbackTerms(text);

        return {
          behaviors: unique([...acc.behaviors, ...inferred.behaviors]),
          capabilities: unique([...acc.capabilities, ...inferred.capabilities]),
          consequences: unique([...acc.consequences, ...inferred.consequences]),
        };
      },
      {
        behaviors: [] as string[],
        capabilities: [] as string[],
        consequences: [] as string[],
      },
    );

    const enrichedTerms = mergeTerms(sharedTerms, fallbackTerms);

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
          countMatches(pathText, enrichedTerms.behaviors) +
            countMatches(pathText, enrichedTerms.capabilities) +
            countMatches(pathText, enrichedTerms.consequences) >
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
          countMatches(capabilityText, enrichedTerms.behaviors) +
            countMatches(capabilityText, enrichedTerms.capabilities) +
            countMatches(capabilityText, enrichedTerms.consequences) >
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
          countMatches(clusterText, enrichedTerms.behaviors) +
            countMatches(clusterText, enrichedTerms.capabilities) +
            countMatches(clusterText, enrichedTerms.consequences) >
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
          countMatches(judgmentText, enrichedTerms.behaviors) +
            countMatches(judgmentText, enrichedTerms.capabilities) +
            countMatches(judgmentText, enrichedTerms.consequences) >
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
      enrichedTerms.behaviors.length +
      enrichedTerms.capabilities.length +
      enrichedTerms.consequences.length;

    candidates.push({
      id: `mechanism-candidate-${index + 1}`,
      explanationIds: unique(relatedSignals.map((item) => item.id)),
      reasoningPathIds: unique(reasoningPathIds),
      capabilityIds: unique(capabilityIds),
      clusterIds: unique(clusterIds),
      judgmentIds: unique(judgmentIds),
      sourceTexts,
      sharedBehaviors: enrichedTerms.behaviors,
      sharedCapabilities: enrichedTerms.capabilities,
      sharedConsequences: enrichedTerms.consequences,
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
      [...candidate.judgmentIds].sort().join("|"),
      [...candidate.sharedBehaviors].sort().join("|"),
      [...candidate.sharedCapabilities].sort().join("|"),
      [...candidate.sharedConsequences].sort().join("|"),
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