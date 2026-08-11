import type {
  OrganizationalExplanation,
  OrganizationalOutcomeRef,
  OrganizationalScopeRef,
} from "../model/judgment/organizationalJudgment";
import type { V3Evidence } from "../types";

export type CanonicalUnderstandingCompositionUncertainty =
  | "unresolved-alternatives"
  | "comparative-role-data-unavailable";

export type CanonicalUnderstandingContributionDisposition =
  | "authorized-organizational-knowledge"
  | "provisional";

export type CanonicalUnderstandingContributionDecision = {
  explanationId: string;
  organizationId: string;
  contributionAdmission: "admitted" | "provisional";
  cognitiveUse: "eligible" | "provisional-only";
  canonicalCompositionEligibility: "eligible" | "ineligible";
  persistenceEligibility: "eligible" | "eligible-as-provisional";
  authorityDisposition: CanonicalUnderstandingContributionDisposition;
  disclosureEligibility: "not-evaluated";
  basis: string[];
};

export type CanonicalUnderstandingAuthorityTransition = {
  authorityOwner: "canonical-organizational-understanding";
  contributionDecisionOwner: "canonical-understanding-contribution-validation";
  persistenceOwner: "organization-runtime";
  disclosureOwner: "application-boundary-not-evaluated";
  explanationIds: string[];
  disposition: "authorized-organizational-knowledge";
  basis: string[];
};

export type CanonicalUnderstandingComposition = {
  id: string;
  revisionId: string;
  previousRevisionId: string | null;
  organizationId: string;
  scope: OrganizationalScopeRef;
  outcomeRef: OrganizationalOutcomeRef;
  explanationIds: string[];
  /**
   * Explicit Phase 5A authority transition. Optional for historical Runtime
   * records and the bounded pre-authority rollback path.
   */
  authorityTransition?: CanonicalUnderstandingAuthorityTransition;
  compositionUncertainty: CanonicalUnderstandingCompositionUncertainty[];
  /**
   * Current immutable epistemic revision. Optional only for historical Runtime
   * records created before canonical confidence-revision ownership existed.
   */
  currentEpistemicRevisionId?: string;
  epistemicRevisions?: CanonicalUnderstandingEpistemicRevisionV1[];
  createdAt: string;
  updatedAt: string;
};

export type CanonicalUnderstandingEpistemicRevisionV1 = {
  contractVersion: "1";
  revisionId: string;
  stableUnderstandingId: string;
  predecessorRevisionId: string;
  conclusionRevisionId: string;
  confidence: number | null;
  uncertainty: string[];
  supportingMaterialRefs: string[];
  contradictingMaterialRefs: string[];
  scopeDigest: string;
  interpretationVersion: string;
  operationId: string;
  occurredAt: string;
  actorRef: string;
  authorityRefs: string[];
  policyRefs: string[];
  revisionDigest: string;
};

export type CanonicalUnderstandingTraceView = {
  compositionId: string;
  explanations: OrganizationalExplanation[];
};

const compare = (left: string, right: string): number =>
  left.localeCompare(right);

function unique(values: readonly string[]): string[] {
  return [...new Set(values)].sort(compare);
}

function scopeIdentity(scope: OrganizationalScopeRef): string {
  return JSON.stringify([
    scope.organizationId,
    scope.type,
    scope.id,
    scope.parent?.type ?? null,
    scope.parent?.id ?? null,
  ]);
}

function outcomeIdentity(outcome: OrganizationalOutcomeRef): string {
  return JSON.stringify([outcome.type, outcome.id]);
}

function encodedIdentity(parts: readonly string[]): string {
  return encodeURIComponent(JSON.stringify(parts));
}

function copyScope(scope: OrganizationalScopeRef): OrganizationalScopeRef {
  return {
    organizationId: scope.organizationId,
    type: scope.type,
    id: scope.id,
    ...(scope.parent
      ? { parent: { type: scope.parent.type, id: scope.parent.id } }
      : {}),
  };
}

export function evaluateCanonicalUnderstandingContribution(input: {
  organizationId: string;
  explanation: OrganizationalExplanation;
  evidence?: readonly Pick<V3Evidence, "id" | "source" | "sourceId">[];
}): CanonicalUnderstandingContributionDecision {
  const { explanation } = input;
  const basis: string[] = [];
  const evidenceById = new Map(
    (input.evidence ?? []).map((item) => [item.id, item]),
  );
  const hasEvidenceContext = input.evidence !== undefined;
  const uniqueEvidenceIds = unique(explanation.evidenceIds);

  if (
    explanation.organizationId !== input.organizationId ||
    explanation.claim.scope.organizationId !== input.organizationId
  ) {
    basis.push("organization-identity-mismatch");
  }
  if (!explanation.id || !explanation.semanticKey) {
    basis.push("missing-producer-owned-identity");
  }
  if (explanation.claim.outcomeRefs.length === 0) {
    basis.push("missing-organizational-outcome");
  }
  if (uniqueEvidenceIds.length === 0) {
    basis.push("missing-evidence-ancestry");
  }
  if (uniqueEvidenceIds.length !== explanation.evidenceIds.length) {
    basis.push("duplicate-evidence-identity");
  }
  if (
    explanation.reasoningPathIds.length === 0 &&
    explanation.mechanismIds.length === 0 &&
    explanation.beliefIds.length === 0 &&
    explanation.theoryIds.length === 0
  ) {
    basis.push("missing-deterministic-cognitive-ancestry");
  }

  if (hasEvidenceContext) {
    for (const evidenceId of uniqueEvidenceIds) {
      const evidence = evidenceById.get(evidenceId);
      if (!evidence) {
        basis.push(`missing-evidence-reference:${evidenceId}`);
        continue;
      }
      if (!evidence.source && !evidence.sourceId) {
        basis.push(`missing-evidence-provenance:${evidenceId}`);
      }
    }
  }

  const eligible = basis.length === 0;

  return {
    explanationId: explanation.id,
    organizationId: input.organizationId,
    contributionAdmission: eligible ? "admitted" : "provisional",
    cognitiveUse: eligible ? "eligible" : "provisional-only",
    canonicalCompositionEligibility: eligible ? "eligible" : "ineligible",
    persistenceEligibility: eligible ? "eligible" : "eligible-as-provisional",
    authorityDisposition: eligible
      ? "authorized-organizational-knowledge"
      : "provisional",
    disclosureEligibility: "not-evaluated",
    basis: eligible ? ["existing-production-semantics-satisfied"] : unique(basis),
  };
}

/**
 * Phase 4B compatibility shadow. It owns only composition semantics and
 * references completed Explanations without copying their claims or ancestry.
 */
export function buildCanonicalUnderstandingCompatibilityShadow(input: {
  organizationId: string;
  explanations: readonly OrganizationalExplanation[];
  evidence?: readonly Pick<V3Evidence, "id" | "source" | "sourceId">[];
  authorityTransitionMode?: "explicit" | "implicit";
  previousCompositions?: readonly CanonicalUnderstandingComposition[];
  now: string;
}): CanonicalUnderstandingComposition[] {
  const grouped = new Map<
    string,
    {
      scope: OrganizationalScopeRef;
      outcomeRef: OrganizationalOutcomeRef;
      explanationIds: string[];
      roleDataUnavailable: boolean;
    }
  >();

  for (const explanation of input.explanations) {
    // Historical Runtime records predate the canonical completed-Explanation
    // contract. They remain readable but cannot participate in canonical
    // composition without a producer-owned claim.
    if (!explanation.claim) {
      continue;
    }

    const contributionDecision =
      input.authorityTransitionMode === "implicit"
        ? null
        : evaluateCanonicalUnderstandingContribution({
            organizationId: input.organizationId,
            explanation,
            evidence: input.evidence,
          });

    if (
      contributionDecision
        ? contributionDecision.canonicalCompositionEligibility !== "eligible"
        : explanation.organizationId !== input.organizationId ||
          explanation.claim.scope.organizationId !== input.organizationId
    ) {
      continue;
    }

    for (const outcomeRef of explanation.claim.outcomeRefs) {
      const key = JSON.stringify([
        scopeIdentity(explanation.claim.scope),
        outcomeIdentity(outcomeRef),
      ]);
      const group = grouped.get(key) ?? {
        scope: copyScope(explanation.claim.scope),
        outcomeRef: { type: outcomeRef.type, id: outcomeRef.id },
        explanationIds: [],
        roleDataUnavailable: false,
      };
      group.explanationIds.push(explanation.id);
      group.roleDataUnavailable ||= !Array.isArray(
        explanation.comparativeEvidenceRoles,
      );
      grouped.set(key, group);
    }
  }

  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, group]) => {
      const explanationIds = unique(group.explanationIds);
      const compositionId = `organizational-understanding:${encodedIdentity([
        input.organizationId,
        scopeIdentity(group.scope),
        outcomeIdentity(group.outcomeRef),
      ])}`;
      const revisionId = `${compositionId}:revision:${encodedIdentity(
        explanationIds,
      )}`;
      const previous = input.previousCompositions?.find(
        (candidate) => candidate.id === compositionId,
      );

      return {
        id: compositionId,
        revisionId,
        previousRevisionId:
          previous && previous.revisionId !== revisionId
            ? previous.revisionId
            : previous?.previousRevisionId ?? null,
        organizationId: input.organizationId,
        scope: group.scope,
        outcomeRef: group.outcomeRef,
        explanationIds,
        ...(input.authorityTransitionMode === "implicit"
          ? {}
          : {
              authorityTransition: {
                authorityOwner:
                  "canonical-organizational-understanding" as const,
                contributionDecisionOwner:
                  "canonical-understanding-contribution-validation" as const,
                persistenceOwner: "organization-runtime" as const,
                disclosureOwner:
                  "application-boundary-not-evaluated" as const,
                explanationIds,
                disposition:
                  "authorized-organizational-knowledge" as const,
                basis: ["existing-production-semantics-satisfied"],
              },
            }),
        compositionUncertainty: [
          ...(explanationIds.length > 1
            ? (["unresolved-alternatives"] as const)
            : []),
          ...(group.roleDataUnavailable
            ? (["comparative-role-data-unavailable"] as const)
            : []),
        ],
        ...(previous?.currentEpistemicRevisionId
          ? {
              currentEpistemicRevisionId: previous.currentEpistemicRevisionId,
              epistemicRevisions: structuredClone(previous.epistemicRevisions ?? []),
            }
          : {}),
        createdAt: previous?.createdAt ?? input.now,
        updatedAt:
          previous?.revisionId === revisionId ? previous.updatedAt : input.now,
      };
    });
}

/**
 * Ephemeral trace resolution. The returned Explanations remain the source
 * objects; the canonical composition never copies their owned semantics.
 */
export function resolveCanonicalUnderstandingTrace(input: {
  composition: CanonicalUnderstandingComposition;
  explanations: readonly OrganizationalExplanation[];
}): CanonicalUnderstandingTraceView {
  const byId = new Map(
    input.explanations.map((explanation) => [explanation.id, explanation]),
  );
  const explanations = input.composition.explanationIds.map((id) => {
    const explanation = byId.get(id);
    if (!explanation) {
      throw new Error(`Missing completed Explanation reference: ${id}`);
    }
    if (explanation.organizationId !== input.composition.organizationId) {
      throw new Error(`Cross-organization Explanation reference: ${id}`);
    }
    return explanation;
  });

  return {
    compositionId: input.composition.id,
    explanations,
  };
}
