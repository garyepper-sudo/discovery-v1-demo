import { collectMechanismSignals } from "./mechanismSignals";
import { mechanismProfiles } from "./mechanismProfiles";
import type {
  InferOrganizationalMechanismsInput,
  MechanismCandidate,
} from "./mechanismInferenceTypes";
import {
  clamp01,
  countMatches,
  extractSharedTerms,
  normalizeText,
  unique,
} from "./mechanismUtils";

type MechanismProfileKey = keyof typeof mechanismProfiles;

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

  if (
    countMatches(text, [
      "delay",
      "delays",
      "latency",
      "bottleneck",
      "stall",
      "approval",
      "approvals",
      "waiting",
      "wait",
      "centralized",
      "centralised",
    ]) > 0
  ) {
    behaviors.push("delay", "latency", "bottleneck", "governance friction");
    capabilities.push("decision", "execution", "coordination", "governance");
    consequences.push("slow execution", "missed timing", "execution drag");
  }

  if (
    countMatches(text, [
      "dashboard",
      "failure",
      "failures",
      "system",
      "platform",
      "process",
    ]) > 0
  ) {
    behaviors.push("process failure", "system breakdown");
    capabilities.push("execution", "coordination");
    consequences.push("operational drag", "execution risk");
  }

  if (
    countMatches(text, [
      "leadership",
      "manager",
      "managers",
      "ownership",
      "owns",
      "accountability",
      "ceo",
      "executive",
      "review",
    ]) > 0
  ) {
    behaviors.push("ownership ambiguity", "governance friction");
    capabilities.push("governance", "accountability", "decision");
    consequences.push("decision drag", "coordination risk");
  }

  if (
    countMatches(text, [
      "narrative",
      "communication",
      "alignment",
      "clarity",
      "friction",
    ]) > 0
  ) {
    behaviors.push("communication gap", "alignment gap");
    capabilities.push("communication", "alignment");
    consequences.push("coordination breakdown");
  }

  if (
    countMatches(text, ["customer", "support", "feedback", "onboarding"]) > 0
  ) {
    behaviors.push("feedback failure", "customer signal loss");
    capabilities.push("customer responsiveness", "learning");
    consequences.push("customer friction");
  }

  if (
    countMatches(text, [
      "growth",
      "pressure",
      "burnout",
      "resource",
      "capacity",
    ]) > 0
  ) {
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

function mechanismTypeToProfileTerms(mechanismType: string): {
  behaviors: string[];
  capabilities: string[];
  consequences: string[];
} {
  const profile = mechanismProfiles[mechanismType as MechanismProfileKey];

  if (!profile) {
    return {
      behaviors: [],
      capabilities: [],
      consequences: [],
    };
  }

  return {
    behaviors: profile.behaviors,
    capabilities: profile.capabilities,
    consequences: profile.consequences,
  };
}

function textMatchesTerms(
  text: string,
  terms: {
    behaviors: string[];
    capabilities: string[];
    consequences: string[];
  },
): boolean {
  return (
    countMatches(text, terms.behaviors) +
      countMatches(text, terms.capabilities) +
      countMatches(text, terms.consequences) >
    0
  );
}

function phenomenonText(phenomenon: {
  label?: string;
  name?: string;
  title?: string;
  summary?: string;
  description?: string;
  evidence?: string;
}): string {
  return normalizeText(
    phenomenon.label,
    phenomenon.name,
    phenomenon.title,
    phenomenon.summary,
    phenomenon.description,
    phenomenon.evidence,
  );
}

function getCandidateKey(candidate: MechanismCandidate): string {
  return [
    [...candidate.phenomenonIds].sort().join("|"),
    [...candidate.patternIds].sort().join("|"),
    [...candidate.explanationIds].sort().join("|"),
    [...candidate.reasoningPathIds].sort().join("|"),
    [...candidate.capabilityIds].sort().join("|"),
    [...candidate.clusterIds].sort().join("|"),
    [...candidate.judgmentIds].sort().join("|"),
    [...candidate.sharedBehaviors].sort().join("|"),
    [...candidate.sharedCapabilities].sort().join("|"),
    [...candidate.sharedConsequences].sort().join("|"),
  ].join("::");
}

export function buildMechanismCandidates({
  phenomena = [],
  patterns = [],
  semanticConcepts = [],
  explanations = [],
  reasoningPaths = [],
  capabilities = [],
  understandingClusters = [],
  judgments = [],
}: InferOrganizationalMechanismsInput): MechanismCandidate[] {
  const hasPhenomena = Array.isArray(phenomena) && phenomena.length > 0;
  const hasPatterns = Array.isArray(patterns) && patterns.length > 0;
  const hasExplanations =
    Array.isArray(explanations) && explanations.length > 0;

  if (!hasPhenomena && !hasPatterns && !hasExplanations) {
    return [];
  }

  const vocabulary = allProfileTerms();

  const primarySignals = collectMechanismSignals({
    patterns,
    semanticConcepts,
    explanations,
  });

  const candidates: MechanismCandidate[] = [];

  phenomena.forEach((phenomenon, index) => {
    const possibleMechanismTypes = unique(
      phenomenon.possibleMechanismTypes ?? [],
    );

    possibleMechanismTypes.forEach((mechanismType) => {
      const profileTerms = mechanismTypeToProfileTerms(mechanismType);
      const sourceText = phenomenonText(phenomenon);

      const relatedSignals = primarySignals.filter((signal) =>
        textMatchesTerms(signal.text, profileTerms),
      );

      const sourceTexts = unique(
        [
          sourceText,
          ...relatedSignals.map((signal) => signal.text),
        ].filter(Boolean),
      );

      const fallbackTerms = sourceTexts.reduce(
        (acc, text) => {
          const inferred = inferFallbackTerms(text);

          return {
            behaviors: unique([...acc.behaviors, ...inferred.behaviors]),
            capabilities: unique([
              ...acc.capabilities,
              ...inferred.capabilities,
            ]),
            consequences: unique([
              ...acc.consequences,
              ...inferred.consequences,
            ]),
          };
        },
        {
          behaviors: [] as string[],
          capabilities: [] as string[],
          consequences: [] as string[],
        },
      );

      const enrichedTerms = mergeTerms(profileTerms, fallbackTerms);

      const explanationIds = explanations
        .filter((explanation) => {
          const explanationText = normalizeText(
            explanation.title,
            explanation.summary,
          );

          return textMatchesTerms(explanationText, enrichedTerms);
        })
        .map((explanation) => explanation.id);

      const patternIds = patterns
        .filter((pattern) => {
          const patternText = normalizeText(
            pattern.label,
            pattern.statement,
            pattern.description,
            pattern.reason,
          );

          return textMatchesTerms(patternText, enrichedTerms);
        })
        .map((pattern) => pattern.id);

      const reasoningPathIds = reasoningPaths
        .filter((path) => {
          const pathText = normalizeText(
            path.sourceLabel,
            path.targetLabel,
            path.reasoningType,
            path.directness,
            path.summary,
          );

          return textMatchesTerms(pathText, enrichedTerms);
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

          return textMatchesTerms(capabilityText, enrichedTerms);
        })
        .map((capability) => capability.id);

      const clusterIds = understandingClusters
        .filter((cluster) => {
          const clusterText = normalizeText(
            cluster.title,
            cluster.summary,
            cluster.description,
          );

          return textMatchesTerms(clusterText, enrichedTerms);
        })
        .map((cluster) => cluster.id);

      const judgmentIds = judgments
        .filter((judgment) => {
          if (
            judgment.explanationId &&
            explanationIds.includes(judgment.explanationId)
          ) {
            return true;
          }

          const judgmentText = normalizeText(judgment.summary);

          return textMatchesTerms(judgmentText, enrichedTerms);
        })
        .map((judgment) => judgment.id);

      const supportCount =
        1 +
        relatedSignals.length +
        explanationIds.length +
        patternIds.length +
        reasoningPathIds.length +
        capabilityIds.length +
        clusterIds.length +
        judgmentIds.length;

      const totalSignalCount =
        phenomena.length +
        primarySignals.length +
        explanations.length +
        reasoningPaths.length +
        capabilities.length +
        understandingClusters.length +
        judgments.length;

      const sharedTermCount =
        enrichedTerms.behaviors.length +
        enrichedTerms.capabilities.length +
        enrichedTerms.consequences.length;

      const convergenceScore = clamp01(
        supportCount / Math.max(1, totalSignalCount),
      );

      const noveltyScore = clamp01(sharedTermCount / 12);

      const confidence = clamp01(
        (phenomenon.confidence ?? 0.72) * 0.55 +
          convergenceScore * 0.25 +
          noveltyScore * 0.15 +
          Math.min(sourceTexts.length, 4) * 0.0125,
      );

      candidates.push({
        id: `mechanism-candidate-phenomenon-${index + 1}-${mechanismType}`,
        phenomenonIds: [phenomenon.id],
        patternIds,
        explanationIds,
        reasoningPathIds,
        mechanismType,
        capabilityIds,
        clusterIds,
        judgmentIds,
        semanticConceptIds: [],
        sourceTexts,
        sharedBehaviors: enrichedTerms.behaviors,
        sharedCapabilities: enrichedTerms.capabilities,
        sharedConsequences: enrichedTerms.consequences,
        convergenceScore,
        noveltyScore,
        confidence,
      });
    });
  });

  if (candidates.length === 0) {
    primarySignals.forEach((signal, index) => {
      const fallbackForSignal = inferFallbackTerms(signal.text);

      const relatedSignals = primarySignals.filter((other) => {
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
            capabilities: unique([
              ...acc.capabilities,
              ...inferred.capabilities,
            ]),
            consequences: unique([
              ...acc.consequences,
              ...inferred.consequences,
            ]),
          };
        },
        {
          behaviors: [] as string[],
          capabilities: [] as string[],
          consequences: [] as string[],
        },
      );

      const enrichedTerms = mergeTerms(sharedTerms, fallbackTerms);

      const explanationIds = primarySignals
        .filter((item) => item.source === "explanation")
        .filter((explanation) =>
          textMatchesTerms(explanation.text, enrichedTerms),
        )
        .map((explanation) => explanation.id);

      const patternIds = primarySignals
        .filter((item) => item.source === "pattern")
        .filter((pattern) => textMatchesTerms(pattern.text, enrichedTerms))
        .map((pattern) => pattern.id);

      const reasoningPathIds = reasoningPaths
        .filter((path) => {
          const pathText = normalizeText(
            path.sourceLabel,
            path.targetLabel,
            path.reasoningType,
            path.directness,
            path.summary,
          );

          return textMatchesTerms(pathText, enrichedTerms);
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

          return textMatchesTerms(capabilityText, enrichedTerms);
        })
        .map((capability) => capability.id);

      const clusterIds = understandingClusters
        .filter((cluster) => {
          const clusterText = normalizeText(
            cluster.title,
            cluster.summary,
            cluster.description,
          );

          return textMatchesTerms(clusterText, enrichedTerms);
        })
        .map((cluster) => cluster.id);

      const judgmentIds = judgments
        .filter((judgment) => {
          if (
            judgment.explanationId &&
            explanationIds.includes(judgment.explanationId)
          ) {
            return true;
          }

          const judgmentText = normalizeText(judgment.summary);

          return textMatchesTerms(judgmentText, enrichedTerms);
        })
        .map((judgment) => judgment.id);

      const supportCount =
        relatedSignals.length +
        explanationIds.length +
        patternIds.length +
        reasoningPathIds.length +
        capabilityIds.length +
        clusterIds.length +
        judgmentIds.length;

      const totalSignalCount =
        primarySignals.length +
        explanations.length +
        reasoningPaths.length +
        capabilities.length +
        understandingClusters.length +
        judgments.length;

      const sharedTermCount =
        enrichedTerms.behaviors.length +
        enrichedTerms.capabilities.length +
        enrichedTerms.consequences.length;

      const convergenceScore = clamp01(
        supportCount / Math.max(1, totalSignalCount),
      );

      const noveltyScore = clamp01(sharedTermCount / 12);

      const confidence = clamp01(
        0.25 +
          convergenceScore * 0.3 +
          noveltyScore * 0.15 +
          Math.min(sourceTexts.length, 4) * 0.0125,
      );

      candidates.push({
        id: `mechanism-candidate-fallback-${index + 1}`,
        phenomenonIds: [],
        patternIds,
        explanationIds,
        reasoningPathIds,
        capabilityIds,
        clusterIds,
        judgmentIds,
        semanticConceptIds: [],
        sourceTexts,
        sharedBehaviors: enrichedTerms.behaviors,
        sharedCapabilities: enrichedTerms.capabilities,
        sharedConsequences: enrichedTerms.consequences,
        convergenceScore,
        noveltyScore,
        confidence,
      });
    });
  }

  const deduped = new Map<string, MechanismCandidate>();

  for (const candidate of candidates) {
    const key = getCandidateKey(candidate);
    const existing = deduped.get(key);

    if (!existing || candidate.convergenceScore > existing.convergenceScore) {
      deduped.set(key, candidate);
    }
  }

  return Array.from(deduped.values()).sort((a, b) => {
    const aScore =
      a.phenomenonIds.length * 0.3 +
      a.convergenceScore * 0.4 +
      a.confidence * 0.3;

    const bScore =
      b.phenomenonIds.length * 0.3 +
      b.convergenceScore * 0.4 +
      b.confidence * 0.3;

    return bScore - aScore;
  });
}