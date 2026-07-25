import type { FormationInput, MediatingRelationship } from "./types";

export type ParsedRelationship = MediatingRelationship & {
  condition: string;
  silo: string;
  observedAt?: string;
};

const pattern =
  /^Evidence indicates that (.+?) leads to (.+?) when (.+?)\.$/i;

export function composePairwiseRelationships(input: FormationInput): ParsedRelationship[] {
  return input.rawEvidence.flatMap((evidence) => {
    const match = evidence.text.match(pattern);
    if (!match) return [];
    return [{
      from: match[1].trim(),
      relationship: "leads to",
      to: match[2].trim(),
      condition: match[3].trim(),
      artifactIds: input.artifacts
        .filter((artifact) => artifact.evidenceIds.includes(evidence.id))
        .map((artifact) => artifact.id),
      evidenceIds: [evidence.id],
      supportStatus: "explicit" as const,
      silo: evidence.silo ?? "unknown",
      observedAt: evidence.observedAt,
    }];
  }).sort((a, b) =>
    a.from.localeCompare(b.from) || a.to.localeCompare(b.to));
}
