import type { FormationInput } from "./types";

const pattern = /^A plausible alternative is that (.+?)\.$/i;

export function identifyCompetingExplanations(input: FormationInput) {
  return input.rawEvidence.flatMap((evidence) => {
    const match = evidence.text.match(pattern);
    if (!match) return [];
    return [{
      explanation: match[1].trim(),
      supportingArtifactIds: input.artifacts
        .filter((artifact) => artifact.evidenceIds.includes(evidence.id))
        .map((artifact) => artifact.id),
      supportingEvidenceIds: [evidence.id],
      contradictingArtifactIds: [],
      discriminatingEvidenceNeeded: [
        `Evidence testing whether ${match[1].trim()} persists when the leading mediator changes`,
      ],
      relativeSupport: 0.25,
    }];
  }).sort((a, b) => a.explanation.localeCompare(b.explanation));
}
