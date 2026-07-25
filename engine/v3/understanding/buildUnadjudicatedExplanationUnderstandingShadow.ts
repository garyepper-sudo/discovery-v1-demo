import type {
  OrganizationalExplanation,
  OrganizationalExplanationEvidenceRoleAssignment,
  OrganizationalOutcomeRef,
  OrganizationalScopeRef,
} from "../model/judgment/organizationalJudgment";

export type ExplanationRoleProjection = {
  availability: "available" | "unavailable";
  supporting: OrganizationalExplanationEvidenceRoleAssignment[];
  opposing: OrganizationalExplanationEvidenceRoleAssignment[];
  shared: OrganizationalExplanationEvidenceRoleAssignment[];
};

export type UnadjudicatedExplanationUnderstanding = {
  explanationId: string;
  semanticKey: string;
  claim: OrganizationalExplanation["claim"];
  ancestry: {
    explanationSeedIds: string[];
    reasoningPathIds: string[];
    mechanismIds: string[];
    beliefIds: string[];
    theoryIds: string[];
    evidenceIds: string[];
    contradictionIds: string[];
    assumptions: string[];
  };
  comparativeEvidence: ExplanationRoleProjection;
  sourceViability: "unadjudicated";
  uncertainty: string[];
};

export type UnadjudicatedExplanationUnderstandingGroup = {
  organizationId: string;
  scope: OrganizationalScopeRef;
  outcomeRef: OrganizationalOutcomeRef;
  explanations: UnadjudicatedExplanationUnderstanding[];
  hasUnresolvedAlternatives: boolean;
  justifiedSelectionExists: false;
  selectionLimitation: string;
};

export type UnadjudicatedExplanationUnderstandingShadow = {
  organizationId: string;
  groups: UnadjudicatedExplanationUnderstandingGroup[];
  ignoredExplanationCount: number;
  limitations: string[];
};

const compareStrings = (left: string, right: string): number =>
  left.localeCompare(right);

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort(compareStrings);
}

function normalizeScope(scope: OrganizationalScopeRef): OrganizationalScopeRef {
  return {
    organizationId: scope.organizationId,
    type: scope.type,
    id: scope.id,
    ...(scope.parent
      ? { parent: { type: scope.parent.type, id: scope.parent.id } }
      : {}),
  };
}

function scopeKey(scope: OrganizationalScopeRef): string {
  return [
    scope.organizationId,
    scope.type,
    scope.id,
    scope.parent?.type ?? "",
    scope.parent?.id ?? "",
  ].join("\u001f");
}

function outcomeKey(outcome: OrganizationalOutcomeRef): string {
  return `${outcome.type}\u001f${outcome.id}`;
}

function normalizeRole(
  assignment: OrganizationalExplanationEvidenceRoleAssignment,
): OrganizationalExplanationEvidenceRoleAssignment {
  return {
    evidenceId: assignment.evidenceId,
    role: assignment.role,
    basis: {
      kind: assignment.basis.kind,
      referenceIds: sortedUnique(assignment.basis.referenceIds),
    },
    relatedExplanationIds: sortedUnique(assignment.relatedExplanationIds),
  };
}

function roleKey(
  assignment: OrganizationalExplanationEvidenceRoleAssignment,
): string {
  return [
    assignment.role,
    assignment.evidenceId,
    assignment.basis.kind,
    assignment.basis.referenceIds.join("\u001e"),
    assignment.relatedExplanationIds.join("\u001e"),
  ].join("\u001f");
}

function normalizedRoles(
  explanation: OrganizationalExplanation,
): ExplanationRoleProjection {
  const sourceRoles = explanation.comparativeEvidenceRoles;
  const available = Array.isArray(sourceRoles);
  const roles = available
    ? sourceRoles
        .map(normalizeRole)
        .filter(
          (role, index, all) =>
            all.findIndex((candidate) => roleKey(candidate) === roleKey(role)) ===
            index,
        )
        .sort((left, right) => roleKey(left).localeCompare(roleKey(right)))
    : [];

  return {
    availability: available ? "available" : "unavailable",
    supporting: roles.filter((role) => role.role === "supports"),
    opposing: roles.filter((role) => role.role === "opposes"),
    shared: roles.filter((role) => role.role === "shared"),
  };
}

function projectExplanation(
  explanation: OrganizationalExplanation,
): UnadjudicatedExplanationUnderstanding {
  return {
    explanationId: explanation.id,
    semanticKey: explanation.semanticKey,
    claim: {
      scope: normalizeScope(explanation.claim.scope),
      rootMechanismIds: sortedUnique(explanation.claim.rootMechanismIds),
      outcomeRefs: [...explanation.claim.outcomeRefs]
        .map((outcome) => ({ type: outcome.type, id: outcome.id }))
        .sort((left, right) => outcomeKey(left).localeCompare(outcomeKey(right))),
      causalRelationFamily: explanation.claim.causalRelationFamily,
    },
    ancestry: {
      explanationSeedIds: sortedUnique(explanation.explanationSeedIds),
      reasoningPathIds: sortedUnique(explanation.reasoningPathIds),
      mechanismIds: sortedUnique(explanation.mechanismIds),
      beliefIds: sortedUnique(explanation.beliefIds),
      theoryIds: sortedUnique(explanation.theoryIds),
      evidenceIds: sortedUnique(explanation.evidenceIds),
      contradictionIds: sortedUnique(explanation.contradictionIds),
      assumptions: sortedUnique(explanation.assumptions),
    },
    comparativeEvidence: normalizedRoles(explanation),
    sourceViability: "unadjudicated",
    uncertainty: sortedUnique(explanation.uncertainty),
  };
}

/**
 * Read-only Phase 3 shadow at CAP-UND-006. The result is deliberately
 * ephemeral and carries no authority to select or change an Explanation.
 */
export function buildUnadjudicatedExplanationUnderstandingShadow(input: {
  organizationId: string;
  explanations: readonly OrganizationalExplanation[];
}): UnadjudicatedExplanationUnderstandingShadow {
  const matching = input.explanations.filter(
    (explanation) =>
      explanation.organizationId === input.organizationId &&
      explanation.claim.scope.organizationId === input.organizationId,
  );
  const byId = new Map<string, OrganizationalExplanation>();

  for (const explanation of matching) {
    const existing = byId.get(explanation.id);
    if (existing && JSON.stringify(existing) !== JSON.stringify(explanation)) {
      throw new Error(`Conflicting completed Explanation identity: ${explanation.id}`);
    }
    byId.set(explanation.id, explanation);
  }

  const grouped = new Map<
    string,
    {
      scope: OrganizationalScopeRef;
      outcomeRef: OrganizationalOutcomeRef;
      explanations: OrganizationalExplanation[];
    }
  >();

  for (const explanation of [...byId.values()].sort((left, right) =>
    left.id.localeCompare(right.id),
  )) {
    const scope = normalizeScope(explanation.claim.scope);
    for (const outcomeRef of explanation.claim.outcomeRefs) {
      const key = `${scopeKey(scope)}\u001d${outcomeKey(outcomeRef)}`;
      const group = grouped.get(key) ?? {
        scope,
        outcomeRef: { type: outcomeRef.type, id: outcomeRef.id },
        explanations: [],
      };
      group.explanations.push(explanation);
      grouped.set(key, group);
    }
  }

  return {
    organizationId: input.organizationId,
    groups: [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, group]) => ({
        organizationId: input.organizationId,
        scope: group.scope,
        outcomeRef: group.outcomeRef,
        explanations: group.explanations
          .map(projectExplanation)
          .sort((left, right) =>
            left.explanationId.localeCompare(right.explanationId),
          ),
        hasUnresolvedAlternatives: group.explanations.length > 1,
        justifiedSelectionExists: false,
        selectionLimitation:
          "No justified selection exists; completed Explanations remain unadjudicated.",
      })),
    ignoredExplanationCount: input.explanations.length - matching.length,
    limitations: [
      "This read-only shadow preserves completed Explanation semantics and creates no organizational authority.",
      "Comparative Evidence roles are consumed from the completed-Explanation producer and are not recomputed.",
    ],
  };
}
