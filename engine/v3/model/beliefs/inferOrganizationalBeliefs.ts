import {
  buildSemanticCohorts,
  buildSemanticObservations,
  scoreSemanticCohorts,
  type SemanticCohort,
  type SemanticObservationInput,
} from "../../semantic";
import type { OrganizationalMechanism } from "../judgment/organizationalMechanism";
import type { OrganizationalBelief } from "./organizationalBeliefs";

type MechanismLike = Pick<
  OrganizationalMechanism,
  | "id"
  | "type"
  | "title"
  | "executiveName"
  | "summary"
  | "interpretation"
  | "executiveSummary"
  | "executiveImplication"
  | "organizationalBehavior"
  | "confidence"
  | "supportingEvidenceIds"
  | "supportingSemanticConceptIds"
> & {
  label?: string;
  description?: string;
  supportingPatternIds?: string[];
  supportingConceptIds?: string[];
  evidenceIds?: string[];
};

type ContradictionLike = {
  id: string;
  evidenceIds?: string[];
  opposingEvidenceIds?: string[];
};

function asArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function normalizeIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function beliefStatementForCohort(cohort: SemanticCohort): string {
  return (
    cohort.canonicalMeaning.statement ||
    cohort.statement ||
    "The organization is operating with an unresolved structural constraint."
  );
}

function beliefIdForStatement(statement: string): string {
  return `belief_${normalizeIdPart(statement)}`;
}

function derivedPatternIdsForCohort(
  cohort: SemanticCohort,
  statement: string,
): string[] {
  return unique([
    ...cohort.supportingPatternIds,
    `pattern:semantic-cohort:${normalizeIdPart(cohort.id)}`,
    `pattern:belief:${normalizeIdPart(statement)}`,
    ...cohort.observationIds.map(
      (observationId) =>
        `pattern:semantic-observation:${normalizeIdPart(observationId)}`,
    ),
  ]);
}

function derivedConceptIdsForCohort(
  cohort: SemanticCohort,
  statement: string,
): string[] {
  return unique([
    ...cohort.canonicalMeaning.conceptIds,
    ...cohort.supportingConceptIds,
    `concept:belief:${normalizeIdPart(statement)}`,
  ]);
}

function supportingEvidenceIdsForCohort(
  cohort: SemanticCohort,
  mechanisms: MechanismLike[],
): string[] {
  const mechanismById = new Map(
    mechanisms.map((mechanism) => [mechanism.id, mechanism]),
  );

  return unique(
    cohort.supportingMechanismIds.flatMap((mechanismId) => {
      const mechanism = mechanismById.get(mechanismId);

      return mechanism
        ? [
            ...asArray(mechanism.supportingEvidenceIds),
            ...asArray(mechanism.evidenceIds),
          ]
        : [];
    }),
  );
}

function contradictedMechanismIdsForCohort(
  cohort: SemanticCohort,
  mechanisms: MechanismLike[],
  contradictions: ContradictionLike[],
): string[] {
  const mechanismById = new Map(
    mechanisms.map((mechanism) => [mechanism.id, mechanism]),
  );
  const opposingEvidenceIds = new Set(
    contradictions.flatMap((contradiction) =>
      asArray(contradiction.opposingEvidenceIds),
    ),
  );

  if (opposingEvidenceIds.size === 0) return [];

  return unique(
    cohort.supportingMechanismIds.filter((mechanismId) => {
      const mechanism = mechanismById.get(mechanismId);
      if (!mechanism) return false;

      return [
        ...asArray(mechanism.supportingEvidenceIds),
        ...asArray(mechanism.evidenceIds),
      ].some((evidenceId) => opposingEvidenceIds.has(evidenceId));
    }),
  );
}

function confidenceForCohort(cohort: SemanticCohort): number {
  return clampConfidence(
    cohort.confidence * 0.45 +
      cohort.canonicalMeaning.confidence * 0.25 +
      cohort.explanatoryBreadth * 0.12 +
      cohort.explanatoryDepth * 0.08 +
      cohort.semanticStability * 0.1,
  );
}

function mergeBelief(
  existing: OrganizationalBelief,
  incoming: OrganizationalBelief,
): OrganizationalBelief {
  const combinedMechanismIds = unique([
    ...existing.supportingMechanismIds,
    ...incoming.supportingMechanismIds,
  ]);

  const revisedConfidence = clampConfidence(
    (existing.confidence * Math.max(1, existing.supportingMechanismIds.length) +
      incoming.confidence * Math.max(1, incoming.supportingMechanismIds.length)) /
      Math.max(
        1,
        existing.supportingMechanismIds.length +
          incoming.supportingMechanismIds.length,
      ),
  );

  return {
    ...existing,
    confidence: revisedConfidence,
    supportingMechanismIds: combinedMechanismIds,
    supportingPatternIds: unique([
      ...existing.supportingPatternIds,
      ...incoming.supportingPatternIds,
    ]),
    supportingConceptIds: unique([
      ...existing.supportingConceptIds,
      ...incoming.supportingConceptIds,
    ]),
    supportingEvidenceIds: unique([
      ...existing.supportingEvidenceIds,
      ...incoming.supportingEvidenceIds,
    ]),
    contradictoryEvidenceIds: unique([
      ...existing.contradictoryEvidenceIds,
      ...incoming.contradictoryEvidenceIds,
    ]),
    trend:
      revisedConfidence > existing.confidence
        ? "strengthening"
        : revisedConfidence < existing.confidence
          ? "weakening"
          : "stable",
    lastUpdatedAt: incoming.lastUpdatedAt,
  };
}

export function inferOrganizationalBeliefs(params: {
  mechanisms?: MechanismLike[];
  mechanismNetwork?: SemanticObservationInput[];
  centralMechanismIds?: string[];

  dynamics?: SemanticObservationInput[];
  understandingClusters?: SemanticObservationInput[];
  understandings?: SemanticObservationInput[];

  organizationalConcepts?: SemanticObservationInput[];
  meaningSignals?: SemanticObservationInput[];
  phenomena?: SemanticObservationInput[];

  explanations?: unknown[];
  judgments?: unknown[];
  capabilities?: unknown[];
  contradictions?: ContradictionLike[];

  now?: string;
}): OrganizationalBelief[] {
  const now = params.now ?? new Date().toISOString();
  const mechanisms = asArray(params.mechanisms);
  const contradictions = asArray(params.contradictions);

  const semanticObservations = buildSemanticObservations({
    mechanisms,
    mechanismNetworks: asArray(params.mechanismNetwork),
    organizationalDynamics: asArray(params.dynamics),
    understandingClusters: asArray(params.understandingClusters),
    understandings: asArray(params.understandings),
    organizationalConcepts: asArray(params.organizationalConcepts),
    meaningSignals: asArray(params.meaningSignals),
    phenomena: asArray(params.phenomena),
  });

  const semanticCohorts = scoreSemanticCohorts({
    cohorts: buildSemanticCohorts({
      observations: semanticObservations,
      minimumSharedKeywords: 2,
    }),
  }).filter((cohort) => cohort.supportingMechanismIds.length > 0);

  const beliefMap = new Map<string, OrganizationalBelief>();

  for (const cohort of semanticCohorts) {
    const statement = beliefStatementForCohort(cohort);
    const id = beliefIdForStatement(statement);

    const belief: OrganizationalBelief = {
      id,
      statement,
      confidence: confidenceForCohort(cohort),
      supportingMechanismIds: unique(cohort.supportingMechanismIds),
      supportingPatternIds: derivedPatternIdsForCohort(cohort, statement),
      supportingConceptIds: derivedConceptIdsForCohort(cohort, statement),
      supportingEvidenceIds: supportingEvidenceIdsForCohort(cohort, mechanisms),
      contradictoryEvidenceIds: contradictedMechanismIdsForCohort(
        cohort,
        mechanisms,
        contradictions,
      ),
      trend: cohort.cohortState === "weakening" ? "weakening" : "stable",
      lastUpdatedAt: now,
    };

    const existing = beliefMap.get(id);

    beliefMap.set(id, existing ? mergeBelief(existing, belief) : belief);
  }

  return Array.from(beliefMap.values()).sort(
    (a, b) => b.confidence - a.confidence,
  );
}
