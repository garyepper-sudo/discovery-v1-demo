import type {
  CommunicationAlternativeGroup,
  CommunicationEvidenceRole,
  CommunicationPlanItem,
  CommunicationPriorityProvenance,
  ProductCommunicationAvailability,
  ProductCommunicationPlan,
  SourcePassThroughText,
} from "../../../engine/v3/communication/productCommunicationPlan";
import type {
  CanonicalObjectReference,
} from "../../../engine/v3/projection/organizationalUnderstandingProjection";

export const YOUR_ORGANIZATION_COMMUNICATION_ADAPTER_VERSION = "1";

export type YourOrganizationCommunicationItem = {
  id: string;
  subjectRef: CanonicalObjectReference;
  sourceText?: SourcePassThroughText;
  supportingRefs: CanonicalObjectReference[];
  priority: CommunicationPriorityProvenance;
  availability: ProductCommunicationAvailability;
  change?: CommunicationPlanItem["change"];
};

export type YourOrganizationCommunicationView = {
  viewId: string;
  adapterVersion: string;
  organizationId: string;
  consumerId: string;
  experience: "organization";
  planId: string;
  communicationContractVersion: string;
  policy: {
    id: string;
    version: string;
  };
  projectionId: string;
  disclosureDecisionId: string;
  sourceRevisionIds: string[];
  lead?: YourOrganizationCommunicationItem & {
    role: "lead-understanding";
  };
  headline: {
    sourceText?: SourcePassThroughText;
    availability: ProductCommunicationAvailability;
  };
  support: YourOrganizationCommunicationItem[];
  uncertainty: YourOrganizationCommunicationItem[];
  alternatives: CommunicationAlternativeGroup[];
  nextInquiries: YourOrganizationCommunicationItem[];
  changes: YourOrganizationCommunicationItem[];
  evidenceRoles: CommunicationEvidenceRole[];
  availability: ProductCommunicationAvailability[];
  unsupportedFields: Array<{
    field:
      | "why-it-matters"
      | "explanation-summary"
      | "recommendation"
      | "scalar-confidence"
      | "evidence-bodies"
      | "next-action"
      | "change-narrative"
      | "understanding-evolution-narrative"
      | "theory-evolution-narrative";
    disposition:
      | "narrative-synthesis-required"
      | "application-cognition-required"
      | "source-text-unavailable";
  }>;
};

const compare = (left: string, right: string): number =>
  left.localeCompare(right);

function referenceIdentity(reference: CanonicalObjectReference): string {
  return JSON.stringify([
    reference.objectType,
    reference.objectId,
    reference.revisionId ?? null,
  ]);
}

function copyReference(
  reference: CanonicalObjectReference,
): CanonicalObjectReference {
  return { ...reference };
}

function copySourceText(
  sourceText: SourcePassThroughText,
): SourcePassThroughText {
  return {
    ...sourceText,
    sourceRef: copyReference(sourceText.sourceRef),
  };
}

function copyPriority(
  priority: CommunicationPriorityProvenance,
): CommunicationPriorityProvenance {
  return {
    ...priority,
    ...(priority.upstreamSignalIds
      ? { upstreamSignalIds: [...priority.upstreamSignalIds].sort(compare) }
      : {}),
    subjectRef: copyReference(priority.subjectRef),
    explanation: { ...priority.explanation },
  };
}

function item(
  source: CommunicationPlanItem,
): YourOrganizationCommunicationItem {
  return {
    id: source.itemId,
    subjectRef: copyReference(source.subjectRef),
    ...(source.sourceText
      ? { sourceText: copySourceText(source.sourceText) }
      : {}),
    supportingRefs: [...source.supportingRefs]
      .map(copyReference)
      .sort((left, right) =>
        compare(referenceIdentity(left), referenceIdentity(right)),
      ),
    priority: copyPriority(source.priority),
    availability: { ...source.availability },
    ...(source.change ? { change: { ...source.change } } : {}),
  };
}

function itemIdentity(source: CommunicationPlanItem): string {
  return `${referenceIdentity(source.subjectRef)}\0${source.itemId}`;
}

function copyAlternatives(
  groups: readonly CommunicationAlternativeGroup[],
): CommunicationAlternativeGroup[] {
  return [...groups]
    .map((group) => ({
      compositionRef: copyReference(group.compositionRef),
      alternatives: [...group.alternatives]
        .map((alternative) => ({
          explanationRef: copyReference(alternative.explanationRef),
          disposition: alternative.disposition,
          supportingRefs: [...alternative.supportingRefs]
            .map(copyReference)
            .sort((left, right) =>
              compare(referenceIdentity(left), referenceIdentity(right)),
            ),
        }))
        .sort((left, right) =>
          compare(
            referenceIdentity(left.explanationRef),
            referenceIdentity(right.explanationRef),
          ),
        ),
    }))
    .sort((left, right) =>
      compare(
        referenceIdentity(left.compositionRef),
        referenceIdentity(right.compositionRef),
      ),
    );
}

function copyEvidenceRoles(
  roles: readonly CommunicationEvidenceRole[],
): CommunicationEvidenceRole[] {
  return [...roles]
    .map((role) => ({
      evidenceRef: copyReference(role.evidenceRef),
      explanationRef: copyReference(role.explanationRef),
      role: role.role,
      basisKind: role.basisKind,
      basisReferenceIds: [...role.basisReferenceIds].sort(compare),
      relatedExplanationRefs: [...role.relatedExplanationRefs]
        .map(copyReference)
        .sort((left, right) =>
          compare(referenceIdentity(left), referenceIdentity(right)),
        ),
    }))
    .sort((left, right) =>
      JSON.stringify(left).localeCompare(JSON.stringify(right)),
    );
}

function planAvailability(
  plan: ProductCommunicationPlan,
  area: ProductCommunicationAvailability["area"],
): ProductCommunicationAvailability {
  return {
    ...(plan.availability.find((entry) => entry.area === area) ?? {
      area,
      state: "available-empty",
    }),
  };
}

/**
 * Pure shape adapter from a completed Product Communication Plan into an
 * inactive Your Organization communication candidate.
 *
 * It does not read Runtime or projection, execute communication policy,
 * evaluate disclosure, synthesize text, calculate priority or confidence,
 * persist output, or mutate its input.
 */
export function buildYourOrganizationCommunicationView(input: {
  plan: ProductCommunicationPlan;
}): YourOrganizationCommunicationView {
  const { plan } = input;
  if (plan.experience !== "organization") {
    throw new Error(
      "Your Organization communication requires an organization plan.",
    );
  }

  const lead = plan.lead
    ? {
        ...item(plan.lead),
        role: "lead-understanding" as const,
      }
    : undefined;

  return {
    viewId: `your-organization-communication:${encodeURIComponent(
      JSON.stringify([
        YOUR_ORGANIZATION_COMMUNICATION_ADAPTER_VERSION,
        plan.planId,
        plan.organizationId,
        plan.consumerId,
        plan.policyId,
        plan.policyVersion,
      ]),
    )}`,
    adapterVersion: YOUR_ORGANIZATION_COMMUNICATION_ADAPTER_VERSION,
    organizationId: plan.organizationId,
    consumerId: plan.consumerId,
    experience: "organization",
    planId: plan.planId,
    communicationContractVersion: plan.contractVersion,
    policy: {
      id: plan.policyId,
      version: plan.policyVersion,
    },
    projectionId: plan.projectionId,
    disclosureDecisionId: plan.disclosureDecisionId,
    sourceRevisionIds: [...plan.sourceRevisionIds].sort(compare),
    ...(lead ? { lead } : {}),
    headline: {
      ...(lead?.sourceText
        ? { sourceText: copySourceText(lead.sourceText) }
        : {}),
      availability: planAvailability(plan, "lead"),
    },
    support: [...plan.support]
      .sort((left, right) =>
        compare(itemIdentity(left), itemIdentity(right)),
      )
      .map(item),
    uncertainty: [...plan.uncertainty]
      .sort((left, right) =>
        compare(itemIdentity(left), itemIdentity(right)),
      )
      .map(item),
    alternatives: copyAlternatives(plan.alternatives),
    nextInquiries: [...plan.nextInquiries]
      .sort((left, right) =>
        compare(itemIdentity(left), itemIdentity(right)),
      )
      .map(item),
    changes: [...plan.changes]
      .sort((left, right) =>
        compare(itemIdentity(left), itemIdentity(right)),
      )
      .map(item),
    evidenceRoles: copyEvidenceRoles(plan.evidenceRoles),
    availability: [...plan.availability]
      .map((entry) => ({ ...entry }))
      .sort((left, right) => compare(left.area, right.area)),
    unsupportedFields: [
      {
        field: "why-it-matters",
        disposition: "narrative-synthesis-required",
      },
      {
        field: "explanation-summary",
        disposition: "narrative-synthesis-required",
      },
      {
        field: "recommendation",
        disposition: "application-cognition-required",
      },
      {
        field: "scalar-confidence",
        disposition: "application-cognition-required",
      },
      {
        field: "evidence-bodies",
        disposition: "source-text-unavailable",
      },
      {
        field: "next-action",
        disposition: "application-cognition-required",
      },
      {
        field: "change-narrative",
        disposition: "narrative-synthesis-required",
      },
      {
        field: "understanding-evolution-narrative",
        disposition: "narrative-synthesis-required",
      },
      {
        field: "theory-evolution-narrative",
        disposition: "source-text-unavailable",
      },
    ],
  };
}
