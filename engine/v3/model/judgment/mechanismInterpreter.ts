import type {
  MechanismActionability,
  OrganizationalMechanism,
  OrganizationalMechanismType,
} from "./organizationalMechanism";
import { mechanismProfiles } from "./mechanismProfiles";
import type { MechanismCandidate } from "./mechanismInferenceTypes";
import { clamp01, countMatches, unique } from "./mechanismUtils";

type OrganizationalScope = OrganizationalMechanism["organizationalScope"];
type ExecutivePriority = OrganizationalMechanism["executivePriority"];

type MechanismProfileKey = keyof typeof mechanismProfiles;

function scoreToPriority(score: number): ExecutivePriority {
  if (score >= 0.85) return "critical";
  if (score >= 0.7) return "high";
  if (score >= 0.45) return "medium";
  return "low";
}

function scoreToActionability(score: number): MechanismActionability {
  if (score >= 0.75) return "high";
  if (score >= 0.45) return "medium";
  return "low";
}

function safeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeCandidate(candidate: MechanismCandidate): MechanismCandidate {
  return {
    ...candidate,

    sourceTexts: safeArray(candidate.sourceTexts),

    phenomenonIds: safeArray(candidate.phenomenonIds),
    patternIds: safeArray(candidate.patternIds),
    compressedThemeIds: safeArray(candidate.compressedThemeIds),
    explanationIds: safeArray(candidate.explanationIds),
    reasoningPathIds: safeArray(candidate.reasoningPathIds),
    capabilityIds: safeArray(candidate.capabilityIds),
    clusterIds: safeArray(candidate.clusterIds),
    judgmentIds: safeArray(candidate.judgmentIds),

    sharedBehaviors: safeArray(candidate.sharedBehaviors),
    sharedCapabilities: safeArray(candidate.sharedCapabilities),
    sharedConsequences: safeArray(candidate.sharedConsequences),
  };
}

function candidateMechanismType(
  candidate: MechanismCandidate,
): OrganizationalMechanismType | undefined {
  const maybeType = candidate.mechanismType as
    | OrganizationalMechanismType
    | undefined;

  if (maybeType && mechanismProfiles[maybeType as MechanismProfileKey]) {
    return maybeType;
  }

  return undefined;
}

function mechanismFitScore(
  candidate: MechanismCandidate,
  type: OrganizationalMechanismType,
): number {
  if (type === "unknown") return 0;

  const normalizedCandidate = normalizeCandidate(candidate);
  const profile = mechanismProfiles[type];
  const text = normalizedCandidate.sourceTexts.join(" ");

  return (
    countMatches(text, profile.behaviors ?? []) * 0.35 +
    countMatches(text, profile.capabilities ?? []) * 0.35 +
    countMatches(text, profile.consequences ?? []) * 0.3
  );
}

function chooseMechanismType(
  candidate: MechanismCandidate,
): OrganizationalMechanismType {
  const normalizedCandidate = normalizeCandidate(candidate);
  const directType = candidateMechanismType(normalizedCandidate);

  if (directType) return directType;

  let bestType: OrganizationalMechanismType = "unknown";
  let bestScore = 0;

  for (const type of Object.keys(
    mechanismProfiles,
  ) as OrganizationalMechanismType[]) {
    const score = mechanismFitScore(normalizedCandidate, type);

    if (score > bestScore) {
      bestType = type;
      bestScore = score;
    }
  }

  if (bestScore < 1.2 && (normalizedCandidate.noveltyScore ?? 0) > 0.45) {
    return "unknown";
  }

  return bestType;
}

function inferOrganizationalScope(
  candidate: MechanismCandidate,
): OrganizationalScope {
  const normalizedCandidate = normalizeCandidate(candidate);

  const phenomena = normalizedCandidate.phenomenonIds;
  const clusters = normalizedCandidate.clusterIds;
  const capabilities = normalizedCandidate.capabilityIds;
  const explanations = normalizedCandidate.explanationIds;

  if (
    phenomena.length >= 2 ||
    clusters.length >= 2 ||
    capabilities.length >= 2
  ) {
    return "systemic";
  }

  if (
    normalizedCandidate.reasoningPathIds.length >= 2 ||
    explanations.length >= 3
  ) {
    return "crossFunctional";
  }

  if (phenomena.length > 0 || explanations.length > 0) {
    return "local";
  }

  return "unknown";
}

function inferExecutivePriority(
  candidate: MechanismCandidate,
  type: OrganizationalMechanismType,
): ExecutivePriority {
  const normalizedCandidate = normalizeCandidate(candidate);
  const themeSupport = normalizedCandidate.compressedThemeIds.length;

  const score =
    (normalizedCandidate.confidence ?? 0) * 0.35 +
    (normalizedCandidate.convergenceScore ?? 0) * 0.35 +
    (type === "unknown" ? 0.05 : 0.15) +
    Math.min(0.15, normalizedCandidate.explanationIds.length * 0.03) +
    Math.min(0.15, normalizedCandidate.phenomenonIds.length * 0.05) +
    Math.min(0.08, themeSupport * 0.02);

  return scoreToPriority(score);
}

function inferStability(
  candidate: MechanismCandidate,
): OrganizationalMechanism["stability"] {
  const normalizedCandidate = normalizeCandidate(candidate);
  const themeSupport = normalizedCandidate.compressedThemeIds.length;

  if ((normalizedCandidate.convergenceScore ?? 0) >= 0.75) return "reinforced";

  if (themeSupport >= 2) return "reinforced";

  if (
    (normalizedCandidate.convergenceScore ?? 0) >= 0.45 ||
    normalizedCandidate.phenomenonIds.length > 0
  ) {
    return "emerging";
  }

  return "unknown";
}

function buildOrganizationalBehavior(
  candidate: MechanismCandidate,
  profileTitle: string,
): string {
  const normalizedCandidate = normalizeCandidate(candidate);
  const behaviors = normalizedCandidate.sharedBehaviors;
  const sliced = behaviors.slice(0, 3);
  return sliced.length > 0 ? sliced.join(", ") : profileTitle;
}

function buildExecutiveSummary(
  candidate: MechanismCandidate,
  type: OrganizationalMechanismType,
): string {
  const normalizedCandidate = normalizeCandidate(candidate);

  const phenomena = normalizedCandidate.phenomenonIds;
  const explanations = normalizedCandidate.explanationIds;
  const reasoning = normalizedCandidate.reasoningPathIds;
  const capabilities = normalizedCandidate.capabilityIds;

  const profile = mechanismProfiles[type];

  return `${profile.title} is supported by ${
    phenomena.length
  } phenomenon${phenomena.length === 1 ? "" : "a"}, ${
    explanations.length
  } explanation${explanations.length === 1 ? "" : "s"}, ${
    reasoning.length
  } reasoning path${reasoning.length === 1 ? "" : "s"}, and ${
    capabilities.length
  } capability signal${capabilities.length === 1 ? "" : "s"}.`;
}

function buildInterpretation(
  candidate: MechanismCandidate,
  type: OrganizationalMechanismType,
): string {
  const normalizedCandidate = normalizeCandidate(candidate);
  const profile = mechanismProfiles[type];

  if (type !== "unknown") return profile.interpretation;

  const sharedSignals = unique([
    ...normalizedCandidate.sharedBehaviors,
    ...normalizedCandidate.sharedCapabilities,
    ...normalizedCandidate.sharedConsequences,
  ]);

  return `${profile.interpretation} Shared signals include: ${
    sharedSignals.slice(0, 5).join(", ") ||
    "a repeated but unlabeled organizational pattern"
  }.`;
}

export function interpretMechanismCandidates(
  candidates: MechanismCandidate[] = [],
): OrganizationalMechanism[] {
  return safeArray(candidates)
    .map((rawCandidate, index): OrganizationalMechanism => {
      const candidate = normalizeCandidate(rawCandidate);

      const type = chooseMechanismType(candidate);
      const profile = mechanismProfiles[type];

      const themeSupport = candidate.compressedThemeIds.length;

      const confidence = clamp01(
        (candidate.confidence ?? 0) * 0.62 +
          (candidate.convergenceScore ?? 0) * 0.23 +
          Math.min(0.1, candidate.phenomenonIds.length * 0.05) +
          Math.min(0.08, themeSupport * 0.02),
      );

      const actionabilityScore = clamp01(
        type === "unknown"
          ? 0.5 +
              (candidate.convergenceScore ?? 0) * 0.2 +
              Math.min(0.08, themeSupport * 0.02)
          : 0.65 +
              (candidate.convergenceScore ?? 0) * 0.2 +
              Math.min(0.1, candidate.phenomenonIds.length * 0.05) +
              Math.min(0.08, themeSupport * 0.02),
      );

      const affectedCapabilities = unique([
        ...candidate.sharedCapabilities,
        ...(profile.capabilities ?? []),
      ]).slice(0, 5);

      return {
        id: `organizational-mechanism-${index + 1}-${type}`,
        cognitiveLayer: "mechanism",
        ontologyVersion: "1.0",

        type,
        title: profile.title,

        executiveName: profile.title,
        executiveSummary: buildExecutiveSummary(candidate, type),

        summary: profile.summary,
        interpretation: buildInterpretation(candidate, type),
        executiveImplication: profile.executiveImplication,

        organizationalBehavior: buildOrganizationalBehavior(
          candidate,
          profile.title,
        ),

        organizationalScope: inferOrganizationalScope(candidate),
        executivePriority: inferExecutivePriority(candidate, type),

        confidence,
        severity: profile.severity,
        actionability: scoreToActionability(actionabilityScore),
        stability: inferStability(candidate),

        affectedCapabilities,
        affectedCapabilityIds: affectedCapabilities,

        supportingEvidenceIds: [],
        supportingExplanationIds: candidate.explanationIds,
        supportingClusterIds: candidate.clusterIds,
        supportingPhenomenonIds: candidate.phenomenonIds,

        supportingCompressedThemeIds: candidate.compressedThemeIds,

        explanationIds: candidate.explanationIds,
        reasoningPathIds: candidate.reasoningPathIds,
        capabilityIds: candidate.capabilityIds,
        clusterIds: candidate.clusterIds,
        judgmentIds: candidate.judgmentIds,

        sourcePhenomenonIds: candidate.phenomenonIds,
        sourceClusterIds: candidate.clusterIds,

        upstreamMechanismIds: [],
        downstreamMechanismIds: [],
        reinforcingMechanismIds: [],

        evidenceReferences: [],
      };
    })
    .filter((mechanism) => {
      const supportCount =
        (mechanism.supportingPhenomenonIds?.length ?? 0) +
        (mechanism.supportingExplanationIds?.length ?? 0) +
        (mechanism.explanationIds?.length ?? 0) +
        (mechanism.reasoningPathIds?.length ?? 0) +
        (mechanism.clusterIds?.length ?? 0) +
        (mechanism.judgmentIds?.length ?? 0) +
        (mechanism.supportingCompressedThemeIds?.length ?? 0) +
        (mechanism.capabilityIds?.length ?? 0) +
        (mechanism.affectedCapabilityIds?.length ?? 0);

      return supportCount > 0 || mechanism.confidence >= 0.45;
    });
}