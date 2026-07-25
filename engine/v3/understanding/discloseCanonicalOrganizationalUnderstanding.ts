import type { CanonicalUnderstandingComposition } from "./buildCanonicalUnderstandingCompatibilityShadow";

export type OrganizationalUnderstandingDisclosureDisposition =
  | "eligible"
  | "withheld"
  | "revoked";

/**
 * A resolved disclosure decision, not a permission or policy definition.
 * Phase 5B deliberately leaves production decision production unassigned.
 */
export type OrganizationalUnderstandingDisclosureDecision = {
  id: string;
  organizationId: string;
  consumerId: string;
  disposition: OrganizationalUnderstandingDisclosureDisposition;
  effectiveAt: string;
  supersedesDecisionId?: string;
  basis: string[];
};

export type OrganizationalUnderstandingDisclosureResult = {
  decisionId: string;
  organizationId: string;
  consumerId: string;
  disposition: OrganizationalUnderstandingDisclosureDisposition;
  disclosedCompositions: CanonicalUnderstandingComposition[];
  suppressedCompositionIds: string[];
};

const compare = (left: string, right: string): number =>
  left.localeCompare(right);

function copyComposition(
  composition: CanonicalUnderstandingComposition,
): CanonicalUnderstandingComposition {
  return structuredClone(composition);
}

/**
 * Phase 5B disclosure enforcement at the canonical Understanding boundary.
 *
 * The caller must supply an already-resolved decision. This function does not
 * infer identity, permissions, membership, purpose, or policy. Withheld and
 * revoked decisions affect future disclosure only; canonical truth and
 * historical Runtime remain unchanged.
 */
export function discloseCanonicalOrganizationalUnderstanding(input: {
  organizationId: string;
  consumerId: string;
  decision: OrganizationalUnderstandingDisclosureDecision;
  compositions: readonly CanonicalUnderstandingComposition[];
}): OrganizationalUnderstandingDisclosureResult {
  const decisionMatchesRequest =
    input.decision.organizationId === input.organizationId &&
    input.decision.consumerId === input.consumerId;

  const candidates = input.compositions
    .filter(
      (composition) =>
        composition.organizationId === input.organizationId &&
        composition.authorityTransition?.disposition ===
          "authorized-organizational-knowledge",
    )
    .sort((left, right) => compare(left.id, right.id));

  const disclosureEligible =
    decisionMatchesRequest && input.decision.disposition === "eligible";

  return {
    decisionId: input.decision.id,
    organizationId: input.organizationId,
    consumerId: input.consumerId,
    disposition: decisionMatchesRequest
      ? input.decision.disposition
      : "withheld",
    disclosedCompositions: disclosureEligible
      ? candidates.map(copyComposition)
      : [],
    suppressedCompositionIds: disclosureEligible
      ? []
      : candidates.map((composition) => composition.id),
  };
}
