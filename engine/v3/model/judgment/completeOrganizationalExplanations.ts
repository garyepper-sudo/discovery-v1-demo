import type { OrganizationalBelief } from "../beliefs/organizationalBeliefs";
import type { OrganizationalTheory } from "../memory/organizationalTheories";
import type {
  OrganizationalExplanation,
  OrganizationalExplanationSeed,
  OrganizationalOutcomeRef,
  OrganizationalScopeRef,
} from "./organizationalJudgment";
import type { OrganizationalMechanism } from "./organizationalMechanism";

export type ExplanationCompletionFailure = {
  seedId: string;
  missingRelationships: string[];
};

export type CompleteOrganizationalExplanationsResult = {
  explanations: OrganizationalExplanation[];
  failures: ExplanationCompletionFailure[];
};

type CompleteOrganizationalExplanationsInput = {
  organizationId: string;
  seeds: OrganizationalExplanationSeed[];
  mechanisms: OrganizationalMechanism[];
  beliefs: OrganizationalBelief[];
  theories: OrganizationalTheory[];
  existingExplanations?: OrganizationalExplanation[];
  contradictionIds?: string[];
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

  return {
    explanations: [...byId.values()].sort((a, b) => a.id.localeCompare(b.id)),
    failures: failures.sort((a, b) => a.seedId.localeCompare(b.seedId)),
  };
}
