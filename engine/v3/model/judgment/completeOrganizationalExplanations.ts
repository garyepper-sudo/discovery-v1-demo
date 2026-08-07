import type { OrganizationalBelief } from "../beliefs/organizationalBeliefs";
import type { OrganizationalTheory } from "../memory/organizationalTheories";
import {
  canonicalAncestryDigest,
  normalizeCanonicalMaterialSupports,
  resolveCanonicalMaterialSupports,
  validateCanonicalDerivedArtifactGovernanceAncestry,
  validateCanonicalDerivedArtifactGovernanceAncestryGraph,
  type CanonicalAncestryConstructionContext,
  type CanonicalMaterialAncestorReferenceV1,
} from "../../governance/canonicalDerivedArtifactGovernanceAncestry";
import type {
  OrganizationalExplanation,
  OrganizationalExplanationEvidenceRole,
  OrganizationalExplanationEvidenceRoleAssignment,
  OrganizationalExplanationSeed,
  OrganizationalOutcomeRef,
  OrganizationalScopeRef,
} from "./organizationalJudgment";
import type { OrganizationalMechanism } from "./organizationalMechanism";
import type {
  V3Evidence,
  V3EvidenceRelationship,
} from "../../types";

export type ExplanationCompletionFailure = {
  seedId: string;
  missingRelationships: string[];
};

export type CompleteOrganizationalExplanationsResult = {
  explanations: OrganizationalExplanation[];
  failures: ExplanationCompletionFailure[];
};

export type OrganizationalExplanationCompletionEvidenceContext = {
  organizationId: string;
  evidence: Array<Pick<V3Evidence, "id">>;
  relationships: Array<
    Pick<
      V3EvidenceRelationship,
      "id" | "sourceEvidenceId" | "targetEvidenceId" | "type"
    >
  >;
};

type CompleteOrganizationalExplanationsInput = {
  organizationId: string;
  seeds: OrganizationalExplanationSeed[];
  mechanisms: OrganizationalMechanism[];
  beliefs: OrganizationalBelief[];
  theories: OrganizationalTheory[];
  existingExplanations?: OrganizationalExplanation[];
  contradictionIds?: string[];
  evidenceContext?: OrganizationalExplanationCompletionEvidenceContext;
  canonicalGovernanceContext?: CanonicalAncestryConstructionContext;
  now: string;
};

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function hash(value: string): string {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(16).padStart(8, "0");
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function uniqueObjects<T>(values: T[]): T[] {
  const byValue = new Map(values.map((value) => [stable(value), value]));
  return [...byValue.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => value);
}

function scopeMatches(
  left: OrganizationalScopeRef | undefined,
  right: OrganizationalScopeRef,
): boolean {
  return Boolean(
    left &&
      left.organizationId === right.organizationId &&
      left.type === right.type &&
      left.id === right.id,
  );
}

function pathsForMechanism(mechanism: OrganizationalMechanism): string[] {
  return unique([
    ...(mechanism.supportingReasoningPathIds ?? []),
    ...(mechanism.reasoningPathIds ?? []),
  ]);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function compareOutcomeRefs(
  left: OrganizationalOutcomeRef,
  right: OrganizationalOutcomeRef,
): boolean {
  return stable(left) === stable(right);
}

function explanationsAreComparable(
  left: OrganizationalExplanation,
  right: OrganizationalExplanation,
): boolean {
  if (left.id === right.id) return false;
  if (left.organizationId !== right.organizationId) return false;
  if (stable(left.claim.scope) !== stable(right.claim.scope)) return false;
  return left.claim.outcomeRefs.some((leftOutcome) =>
    right.claim.outcomeRefs.some((rightOutcome) =>
      compareOutcomeRefs(leftOutcome, rightOutcome),
    ),
  );
}

type ValidEvidenceContext = {
  evidenceIds: Set<string>;
  relationships: Array<{
    id: string;
    sourceEvidenceId: string;
    targetEvidenceId: string;
    type: "contradicts";
  }>;
};

function validateEvidenceContext(
  organizationId: string,
  context: OrganizationalExplanationCompletionEvidenceContext | undefined,
): ValidEvidenceContext | null {
  if (!context) return null;
  if (
    !isNonEmptyString(context.organizationId) ||
    context.organizationId !== organizationId ||
    !Array.isArray(context.evidence) ||
    !Array.isArray(context.relationships)
  ) {
    return null;
  }

  const evidenceCounts = new Map<string, number>();
  for (const item of context.evidence) {
    const id = item && isNonEmptyString(item.id) ? item.id : "";
    if (!id) continue;
    evidenceCounts.set(id, (evidenceCounts.get(id) ?? 0) + 1);
  }
  const evidenceIds = new Set(
    [...evidenceCounts.entries()]
      .filter(([, count]) => count === 1)
      .map(([id]) => id)
      .sort(),
  );

  const relationshipsById = new Map<
    string,
    OrganizationalExplanationCompletionEvidenceContext["relationships"]
  >();
  for (const relationship of context.relationships) {
    if (!relationship || !isNonEmptyString(relationship.id)) continue;
    const current = relationshipsById.get(relationship.id) ?? [];
    current.push(relationship);
    relationshipsById.set(relationship.id, current);
  }

  const relationships = [...relationshipsById.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([, candidates]) => {
      if (
        candidates.some(
          (relationship) =>
            relationship.type !== "contradicts" ||
            !isNonEmptyString(relationship.sourceEvidenceId) ||
            !isNonEmptyString(relationship.targetEvidenceId) ||
            relationship.sourceEvidenceId === relationship.targetEvidenceId ||
            !evidenceIds.has(relationship.sourceEvidenceId) ||
            !evidenceIds.has(relationship.targetEvidenceId),
        )
      ) {
        return [];
      }
      const uniqueCandidates = uniqueObjects(
        candidates.map((relationship) => ({
          id: relationship.id,
          sourceEvidenceId: relationship.sourceEvidenceId,
          targetEvidenceId: relationship.targetEvidenceId,
          type: "contradicts" as const,
        })),
      );
      return uniqueCandidates.length === 1 ? uniqueCandidates : [];
    })
    .sort(
      (left, right) =>
        left.id.localeCompare(right.id) ||
        left.sourceEvidenceId.localeCompare(right.sourceEvidenceId) ||
        left.targetEvidenceId.localeCompare(right.targetEvidenceId),
    );

  return { evidenceIds, relationships };
}

const roleOrder: Record<OrganizationalExplanationEvidenceRole, number> = {
  supports: 0,
  opposes: 1,
  shared: 2,
};

function compareRoleAssignments(
  left: OrganizationalExplanationEvidenceRoleAssignment,
  right: OrganizationalExplanationEvidenceRoleAssignment,
): number {
  return (
    left.evidenceId.localeCompare(right.evidenceId) ||
    roleOrder[left.role] - roleOrder[right.role] ||
    left.basis.kind.localeCompare(right.basis.kind) ||
    stable(left.basis.referenceIds).localeCompare(
      stable(right.basis.referenceIds),
    ) ||
    stable(left.relatedExplanationIds).localeCompare(
      stable(right.relatedExplanationIds),
    )
  );
}

function canonicalExplanationGovernanceLineage(input: {
  completionInput: CompleteOrganizationalExplanationsInput;
  explanation: OrganizationalExplanation;
  comparativeEvidenceRoles: readonly OrganizationalExplanationEvidenceRoleAssignment[];
}): NonNullable<OrganizationalExplanation["canonicalGovernanceLineage"]> {
  const context = input.completionInput.canonicalGovernanceContext;
  if (!context) {
    throw new Error("Canonical Explanation governance context is unavailable.");
  }
  const directRoles = new Map<
    string,
    "material" | "contradictory-material"
  >();
  const currentOperationEvidenceIds = new Set(
    context.operationBatch.admissions.flatMap(
      (admission) => admission.investigationEvidenceIds,
    ),
  );
  for (const evidenceId of input.explanation.evidenceIds) {
    if (currentOperationEvidenceIds.has(evidenceId)) {
      directRoles.set(evidenceId, "material");
    }
  }
  for (const assignment of input.comparativeEvidenceRoles) {
    if (currentOperationEvidenceIds.has(assignment.evidenceId)) {
      directRoles.set(
        assignment.evidenceId,
        assignment.role === "opposes" ? "contradictory-material" : "material",
      );
    }
  }
  const directMaterialSupports = resolveCanonicalMaterialSupports({
    context,
    localEvidenceRoles: [...directRoles.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([localEvidenceId, role]) => ({ localEvidenceId, role })),
  });

  const theoryById = new Map(
    input.completionInput.theories.map((theory) => [theory.id, theory]),
  );
  const ancestorRefs: CanonicalMaterialAncestorReferenceV1[] = [];
  const inheritedSupports = [] as typeof directMaterialSupports;
  for (const theoryId of input.explanation.theoryIds) {
    const theory = theoryById.get(theoryId);
    const ancestry = theory?.canonicalGovernanceAncestry;
    if (!theory || !ancestry) {
      throw new Error(
        "Historical pre-lineage Theory cannot support a governed Explanation.",
      );
    }
    validateCanonicalDerivedArtifactGovernanceAncestry(ancestry);
    validateCanonicalDerivedArtifactGovernanceAncestryGraph({
      root: ancestry,
      ancestors: input.completionInput.theories.flatMap((candidate) =>
        [
          ...(candidate.canonicalGovernanceAncestry
            ? [candidate.canonicalGovernanceAncestry]
            : []),
          ...(candidate.canonicalGovernanceAncestryHistory ?? []),
        ],
      ),
    });
    if (
      ancestry.organizationId !== input.explanation.organizationId ||
      ancestry.derivedArtifactId !== theory.id
    ) {
      throw new Error("Material Theory ancestry identity mismatch.");
    }
    ancestorRefs.push({
      derivedArtifactType: "organizational-theory",
      derivedArtifactId: theory.id,
      derivedArtifactRevisionId: ancestry.derivedArtifactRevisionId,
      ancestryDigest: ancestry.ancestryDigest,
      supportRole: ancestry.transitiveMaterialSupports.some(
        (support) => support.role === "contradictory-material",
      )
        ? "contradictory-material"
        : "material",
    });
    inheritedSupports.push(...ancestry.transitiveMaterialSupports);
  }
  const inheritedMaterialAncestorRefs = [
    ...new Map(
      ancestorRefs.map((reference) => [
        stable([
          reference.derivedArtifactType,
          reference.derivedArtifactId,
          reference.derivedArtifactRevisionId,
        ]),
        reference,
      ]),
    ).values(),
  ].sort((left, right) => stable(left).localeCompare(stable(right)));
  if (inheritedMaterialAncestorRefs.length !== ancestorRefs.length) {
    throw new Error("Duplicate material Theory ancestor reference.");
  }
  const materialSupports = normalizeCanonicalMaterialSupports([
    ...directMaterialSupports,
    ...inheritedSupports,
  ]);
  if (!directMaterialSupports.length || !inheritedMaterialAncestorRefs.length) {
    throw new Error("Canonical Explanation material ancestry is incomplete.");
  }
  const unsigned = {
    contractVersion: "canonical-explanation-governance-lineage.v1" as const,
    organizationId: input.explanation.organizationId,
    directMaterialSupports,
    inheritedMaterialAncestorRefs,
    materialSupports,
    topologyIds: unique(materialSupports.map((support) => support.topologyId)),
    purposeRefs: unique(
      materialSupports.flatMap((support) => support.purposeRefs),
    ),
    lineagePolicyVersion: "conservative-material-support.v1" as const,
  };
  return {
    ...unsigned,
    lineageDigest: canonicalAncestryDigest(unsigned),
  };
}

function formComparativeEvidenceRoles(params: {
  input: CompleteOrganizationalExplanationsInput;
  explanations: OrganizationalExplanation[];
  context: ValidEvidenceContext;
}): Map<string, OrganizationalExplanationEvidenceRoleAssignment[]> {
  const { input, explanations, context } = params;
  const seedById = new Map(input.seeds.map((seed) => [seed.id, seed]));
  const byExplanation = new Map<
    string,
    OrganizationalExplanationEvidenceRoleAssignment[]
  >();

  for (const explanation of explanations) {
    const assignments: OrganizationalExplanationEvidenceRoleAssignment[] = [];
    for (const seedId of unique(explanation.explanationSeedIds)) {
      const seed = seedById.get(seedId);
      if (!seed || seed.reasoningPathIds.length === 0) continue;
      const supportedEvidenceIds = unique([
        ...seed.evidenceIds,
        ...seed.evidenceReferences
          .filter((reference) => reference.type === "evidence")
          .map((reference) => reference.id),
      ]).filter((evidenceId) => context.evidenceIds.has(evidenceId));
      for (const evidenceId of supportedEvidenceIds) {
        assignments.push({
          evidenceId,
          role: "supports",
          basis: {
            kind: "explanation-seed",
            referenceIds: [seedId],
          },
          relatedExplanationIds: [],
        });
      }
    }
    byExplanation.set(explanation.id, assignments);
  }

  for (const explanation of explanations) {
    const assignments = byExplanation.get(explanation.id) ?? [];
    const supportedEvidenceIds = new Set(
      assignments
        .filter((assignment) => assignment.role === "supports")
        .map((assignment) => assignment.evidenceId),
    );
    for (const relationship of context.relationships) {
      const sourceSupports = supportedEvidenceIds.has(
        relationship.sourceEvidenceId,
      );
      const targetSupports = supportedEvidenceIds.has(
        relationship.targetEvidenceId,
      );
      if (sourceSupports === targetSupports) continue;
      const evidenceId = sourceSupports
        ? relationship.targetEvidenceId
        : relationship.sourceEvidenceId;
      assignments.push({
        evidenceId,
        role: "opposes",
        basis: {
          kind: "evidence-relationship",
          referenceIds: [relationship.id],
        },
        relatedExplanationIds: [],
      });
    }
    byExplanation.set(explanation.id, assignments);
  }

  for (const explanation of explanations) {
    const assignments = byExplanation.get(explanation.id) ?? [];
    const supports = assignments.filter(
      (assignment) => assignment.role === "supports",
    );
    for (const support of supports) {
      const relatedExplanations = explanations
        .filter((candidate) =>
          explanationsAreComparable(explanation, candidate),
        )
        .filter((candidate) =>
          (byExplanation.get(candidate.id) ?? []).some(
            (assignment) =>
              assignment.role === "supports" &&
              assignment.evidenceId === support.evidenceId,
          ),
        )
        .sort((left, right) => left.id.localeCompare(right.id));
      if (relatedExplanations.length === 0) continue;
      const referenceIds = unique([
        ...support.basis.referenceIds,
        ...relatedExplanations.flatMap((candidate) =>
          (byExplanation.get(candidate.id) ?? [])
            .filter(
              (assignment) =>
                assignment.role === "supports" &&
                assignment.evidenceId === support.evidenceId,
            )
            .flatMap((assignment) => assignment.basis.referenceIds),
        ),
      ]);
      assignments.push({
        evidenceId: support.evidenceId,
        role: "shared",
        basis: {
          kind: "shared-support",
          referenceIds,
        },
        relatedExplanationIds: relatedExplanations.map(
          (candidate) => candidate.id,
        ),
      });
    }
    const byIdentity = new Map(
      assignments.map((assignment) => [stable(assignment), assignment]),
    );
    byExplanation.set(
      explanation.id,
      [...byIdentity.values()].sort(compareRoleAssignments),
    );
  }

  return byExplanation;
}

export function completeOrganizationalExplanations(
  input: CompleteOrganizationalExplanationsInput,
): CompleteOrganizationalExplanationsResult {
  const completed: OrganizationalExplanation[] = [];
  const failures: ExplanationCompletionFailure[] = [];

  for (const seed of [...input.seeds].sort((a, b) => a.id.localeCompare(b.id))) {
    const missing = new Set<string>();
    if (!input.organizationId) missing.add("organization identity");
    if (!seed.scope?.id) missing.add("normalized scope");
    if (seed.reasoningPathIds.length === 0) missing.add("reasoning path");
    if (seed.outcomeRefs.length === 0) missing.add("outcome reference");

    const mechanisms = input.mechanisms
      .filter((mechanism) => {
        const seedLinked = (
          mechanism.supportingExplanationSeedIds ??
          mechanism.supportingExplanationIds ??
          []
        ).includes(seed.id);
        const pathLinked = pathsForMechanism(mechanism).some((pathId) =>
          seed.reasoningPathIds.includes(pathId),
        );
        return seedLinked && pathLinked && scopeMatches(mechanism.scopeRef, seed.scope);
      })
      .sort((a, b) => a.id.localeCompare(b.id));

    if (mechanisms.length === 0) missing.add("root Mechanism");

    const mechanismIds = mechanisms.map((mechanism) => mechanism.id);
    const theories = input.theories
      .filter((theory) => {
        const mechanismLinked = theory.supportingMechanisms.some((id) =>
          mechanismIds.includes(id),
        );
        const seedLinked = (theory.explanationSeedIds ?? []).includes(seed.id);
        const pathLinked = (theory.reasoningPathIds ?? []).some((id) =>
          seed.reasoningPathIds.includes(id),
        );
        const scopeLinked = (theory.scopeRefs ?? []).some((scope) =>
          scopeMatches(scope, seed.scope),
        );
        return mechanismLinked && seedLinked && pathLinked && scopeLinked;
      })
      .sort((a, b) => a.id.localeCompare(b.id));

    if (theories.length === 0) missing.add("canonical persisted Theory");

    const evidenceIds = unique([
      ...seed.evidenceIds,
      ...mechanisms.flatMap((mechanism) => mechanism.supportingEvidenceIds),
      ...theories.flatMap((theory) => theory.supportingEvidence),
    ]);
    if (evidenceIds.length === 0) missing.add("Evidence ancestry");

    if (missing.size > 0) {
      failures.push({
        seedId: seed.id,
        missingRelationships: [...missing].sort(),
      });
      continue;
    }

    const outcomeRefs = uniqueObjects<OrganizationalOutcomeRef>(seed.outcomeRefs);
    const semanticKey = stable({
      organizationId: input.organizationId,
      scope: seed.scope,
      causalRelationFamily: seed.explanationType,
      rootMechanismIds: mechanismIds,
      outcomeRefs,
    });
    const id = `organizational-explanation:${hash(semanticKey)}`;
    const existing = input.existingExplanations?.find(
      (explanation) => explanation.id === id,
    );
    const theoryIds = theories.map((theory) => theory.id);
    const beliefIds = unique(
      input.beliefs
        .filter((belief) =>
          belief.supportingMechanismIds.some((mechanismId) =>
            mechanismIds.includes(mechanismId),
          ),
        )
        .map((belief) => belief.id),
    );

    completed.push({
      id,
      organizationId: input.organizationId,
      semanticKey,
      claim: {
        scope: seed.scope,
        rootMechanismIds: mechanismIds,
        outcomeRefs,
        causalRelationFamily: seed.explanationType,
      },
      explanationSeedIds: [seed.id],
      reasoningPathIds: [...seed.reasoningPathIds].sort(),
      mechanismIds,
      beliefIds,
      theoryIds,
      evidenceIds,
      contradictionIds: unique(input.contradictionIds ?? []),
      assumptions: [...seed.assumptions],
      viability: "unadjudicated",
      uncertainty: [],
      createdAt: existing?.createdAt ?? input.now,
      updatedAt: input.now,
    });
  }

  const byId = new Map<string, OrganizationalExplanation>();
  for (const explanation of completed) byId.set(explanation.id, explanation);
  const explanations = [...byId.values()].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const evidenceContext = validateEvidenceContext(
    input.organizationId,
    input.evidenceContext,
  );
  const rolesByExplanation = evidenceContext
    ? formComparativeEvidenceRoles({
        input,
        explanations,
        context: evidenceContext,
      })
    : null;

  return {
    explanations: explanations.map((explanation) => {
      const comparativeEvidenceRoles =
        rolesByExplanation?.get(explanation.id) ?? [];
      const withRoles = rolesByExplanation
        ? { ...explanation, comparativeEvidenceRoles }
        : explanation;
      return input.canonicalGovernanceContext
        ? {
            ...withRoles,
            canonicalGovernanceLineage: canonicalExplanationGovernanceLineage({
              completionInput: input,
              explanation,
              comparativeEvidenceRoles,
            }),
          }
        : withRoles;
    }),
    failures: failures.sort((a, b) => a.seedId.localeCompare(b.seedId)),
  };
}
