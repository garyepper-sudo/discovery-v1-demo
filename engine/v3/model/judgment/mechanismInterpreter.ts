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

function mechanismFitScore(
  candidate: MechanismCandidate,
  type: OrganizationalMechanismType,
): number {
  if (type === "unknown") return 0;

  const profile = mechanismProfiles[type];
  const text = candidate.sourceTexts.join(" ");

  return (
    countMatches(text, profile.behaviors ?? []) * 0.35 +
    countMatches(text, profile.capabilities ?? []) * 0.35 +
    countMatches(text, profile.consequences ?? []) * 0.3
  );
}

function chooseMechanismType(
  candidate: MechanismCandidate,
): OrganizationalMechanismType {
  let bestType: OrganizationalMechanismType = "unknown";
  let bestScore = 0;

  for (const type of Object.keys(
    mechanismProfiles,
  ) as OrganizationalMechanismType[]) {
    const score = mechanismFitScore(candidate, type);

    if (score > bestScore) {
      bestType = type;
      bestScore = score;
    }
  }

  if (bestScore < 1.2 && candidate.noveltyScore > 0.45) {
    return "unknown";
  }

  return bestType;
}

function inferOrganizationalScope(
  candidate: MechanismCandidate,
): OrganizationalScope {
  if (candidate.clusterIds.length >= 2 || candidate.capabilityIds.length >= 2) {
    return "systemic";
  }

  if (
    candidate.reasoningPathIds.length >= 2 ||
    candidate.explanationIds.length >= 3
  ) {
    return "crossFunctional";
  }

  if (candidate.explanationIds.length > 0) {
    return "local";
  }

  return "unknown";
}

function inferExecutivePriority(
  candidate: MechanismCandidate,
  type: OrganizationalMechanismType,
): ExecutivePriority {
  const score =
    candidate.confidence * 0.35 +
    candidate.convergenceScore * 0.35 +
    (type === "unknown" ? 0.05 : 0.15) +
    Math.min(0.15, candidate.explanationIds.length * 0.03);

  return scoreToPriority(score);
}

function inferStability(candidate: MechanismCandidate): OrganizationalMechanism["stability"] {
  if (candidate.convergenceScore >= 0.75) return "reinforced";
  if (candidate.convergenceScore >= 0.45) return "emerging";
  return "unknown";
}

function buildOrganizationalBehavior(
  candidate: MechanismCandidate,
  profileTitle: string,
): string {
  const behaviors = candidate.sharedBehaviors.slice(0, 3);

  if (behaviors.length > 0) {
    return behaviors.join(", ");
  }

  return profileTitle;
}

function buildExecutiveSummary(
  candidate: MechanismCandidate,
  type: OrganizationalMechanismType,
): string {
  const profile = mechanismProfiles[type];

  return `${profile.title} is supported by ${candidate.explanationIds.length} explanation${
    candidate.explanationIds.length === 1 ? "" : "s"
  }, ${candidate.reasoningPathIds.length} reasoning path${
    candidate.reasoningPathIds.length === 1 ? "" : "s"
  }, and ${candidate.capabilityIds.length} capability signal${
    candidate.capabilityIds.length === 1 ? "" : "s"
  }.`;
}

function buildInterpretation(
  candidate: MechanismCandidate,
  type: OrganizationalMechanismType,
): string {
  const profile = mechanismProfiles[type];

  if (type !== "unknown") {
    return profile.interpretation;
  }

  const sharedSignals = unique([
    ...candidate.sharedBehaviors,
    ...candidate.sharedCapabilities,
    ...candidate.sharedConsequences,
  ]);

  return `${profile.interpretation} Shared signals include: ${
    sharedSignals.slice(0, 5).join(", ") ||
    "a repeated but unlabeled organizational pattern"
  }.`;
}

export function interpretMechanismCandidates(
  candidates: MechanismCandidate[],
): OrganizationalMechanism[] {
  return candidates
    .map((candidate, index): OrganizationalMechanism => {
      const type = chooseMechanismType(candidate);
      const profile = mechanismProfiles[type];

      const confidence = clamp01(
        candidate.confidence * 0.65 + candidate.convergenceScore * 0.35,
      );

      const actionabilityScore = clamp01(
        type === "unknown"
          ? 0.5 + candidate.convergenceScore * 0.2
          : 0.65 + candidate.convergenceScore * 0.25,
      );

      const affectedCapabilities = unique([
        ...candidate.sharedCapabilities,
        ...(profile.capabilities ?? []),
      ]).slice(0, 5);

      return {
        id: `organizational-mechanism-${index + 1}-${type}`,
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
        supportingPhenomenonIds: [],

        explanationIds: candidate.explanationIds,
        reasoningPathIds: candidate.reasoningPathIds,
        capabilityIds: candidate.capabilityIds,
        clusterIds: candidate.clusterIds,
        judgmentIds: candidate.judgmentIds,

        sourcePhenomenonIds: [],
        sourceClusterIds: candidate.clusterIds,

        upstreamMechanismIds: [],
        downstreamMechanismIds: [],
        reinforcingMechanismIds: [],

        evidenceReferences: [],
      };
    })
    .filter((mechanism) => {
      const supportCount =
        (mechanism.explanationIds?.length ?? 0) +
        (mechanism.reasoningPathIds?.length ?? 0) +
        (mechanism.capabilityIds?.length ?? 0) +
        (mechanism.clusterIds?.length ?? 0) +
        (mechanism.judgmentIds?.length ?? 0);

      return supportCount > 0;
    });
}