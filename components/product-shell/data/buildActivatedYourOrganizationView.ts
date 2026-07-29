import type { OrganizationRuntime } from "../../../engine/v3/runtime";
import type { OrganizationalUnderstandingProjection } from "../../../engine/v3/projection/organizationalUnderstandingProjection";
import type { YourOrganizationCommunicationView } from "./buildYourOrganizationCommunicationView";
import { buildOrganizationExperienceFromProjection } from "./buildOrganizationExperienceFromProjection";
import { buildUnifiedExecutiveWorkspaceView } from "./buildUnifiedExecutiveWorkspaceView";

const UNAVAILABLE = "Runtime not yet available";
const EXPLANATION_TEXT_UNAVAILABLE =
  "Explanation text is not available through Product Communication.";

type BeliefBasis = {
  summaryExplanation: string;
  evidenceCategories: Array<{
    role: "supports" | "opposes" | "shared";
    count: number;
  }>;
  uncertainty: string[];
  alternatives: Array<{
    id: string;
    disposition: "supported" | "plausible" | "unresolved" | "weakened";
    summary: string | null;
  }>;
  nextInquiry: {
    question: string;
    rationale:
      | "investigation-information-gain"
      | "investigation-opportunity-available"
      | "authorized-next-inquiry";
  } | null;
};

type ActivatedYourOrganizationView =
  ReturnType<typeof buildUnifiedExecutiveWorkspaceView> & {
    beliefBasis: BeliefBasis;
    changeDisclosure: {
      state:
        | "available"
        | "first-supported-understanding"
        | "history-not-authorized"
        | "change-reason-unavailable"
        | "no-meaningful-change"
        | "projection-data-unavailable";
      changes: Array<{
        id: string;
        direction: NonNullable<
          YourOrganizationCommunicationView["changes"][number]["change"]
        >["direction"];
        reason: string | null;
        occurredAt: string;
        previousRevisionAvailable: boolean;
      }>;
    };
    evidenceRequestDisclosure: {
      state:
        | "available"
        | "no-additional-evidence-recommended"
        | "inquiry-rationale-unavailable"
        | "gap-known-request-not-authorized"
        | "expected-gain-unavailable"
        | "supporting-references-unavailable"
        | "investigation-data-unavailable"
        | "organizational-context-not-authorized";
      request: {
        id: string;
        question: string;
        gaps: string[];
        clarificationTargets: string[];
        rationale: string | null;
        expectedConfidenceGain: number | null;
        expectedGainUnit: "canonical-confidence-gain-points";
        supportingReferencesAvailable: boolean;
        outcomeCaveat: string;
      } | null;
    };
  };

function referenceIdentity(reference: {
  objectType: string;
  objectId: string;
  revisionId?: string;
}): string {
  return JSON.stringify([
    reference.objectType,
    reference.objectId,
    reference.revisionId ?? null,
  ]);
}

function sourceTexts(
  items: ReadonlyArray<{ sourceText?: { text: string } }>,
): string[] {
  return [...new Set(
    items.flatMap((item) => item.sourceText?.text.trim()
      ? [item.sourceText.text.trim()]
      : []),
  )];
}

/**
 * Reversible UI composition over the activated communication contract.
 *
 * Existing component structure and navigation remain intact. Content that is
 * not supplied by the authority-qualified projection and Product
 * Communication Plan is explicitly unavailable rather than recovered through
 * the legacy broad Runtime adapter.
 */
export function buildActivatedYourOrganizationView(input: {
  runtime: OrganizationRuntime;
  projection: OrganizationalUnderstandingProjection;
  communication: YourOrganizationCommunicationView;
}): ActivatedYourOrganizationView {
  const { runtime, projection, communication } = input;
  const legacyShape = buildUnifiedExecutiveWorkspaceView(runtime);
  const projectedSections = buildOrganizationExperienceFromProjection({
    projection,
  });
  const leadText = communication.headline.sourceText?.text.trim() || null;
  const supportText = sourceTexts(communication.support);
  const uncertaintyText = sourceTexts(communication.uncertainty);
  const inquiryText = sourceTexts(communication.nextInquiries);
  const changeText = sourceTexts(communication.changes);
  const changeAvailability = communication.availability?.find(
    (entry) => entry.area === "changes",
  )?.state;
  const inquiryAvailability = communication.availability?.find(
    (entry) => entry.area === "next-inquiries",
  )?.state;
  const conditionAreas = projection.conditions.map((condition) => ({
    id: condition.id,
    label: condition.value.name || "Organizational condition",
    status: condition.value.status,
  }));

  const currentUnderstanding = {
    ...projectedSections.currentUnderstanding,
    available: Boolean(leadText),
    summary: leadText ?? UNAVAILABLE,
    items: leadText ? [leadText] : [],
    owner: "Product Communication Plan from disclosed Organizational Understanding",
  };
  const support = {
    ...projectedSections.explanations,
    available: supportText.length > 0,
    summary: supportText[0] ?? UNAVAILABLE,
    items: supportText,
    owner: "Product Communication Plan supporting references",
  };
  const uncertainty = {
    ...projectedSections.uncertainty,
    available: uncertaintyText.length > 0,
    summary: uncertaintyText[0] ?? UNAVAILABLE,
    items: uncertaintyText,
    owner: "Product Communication Plan uncertainty",
  };
  const investigations = {
    ...projectedSections.investigations,
    available: inquiryText.length > 0,
    summary: inquiryText[0] ?? UNAVAILABLE,
    items: inquiryText,
    owner: "Product Communication Plan next inquiries",
  };
  const recentChanges = {
    ...projectedSections.recentChanges,
    available: changeText.length > 0,
    summary: changeText[0] ?? UNAVAILABLE,
    items: changeText,
    owner: "Product Communication Plan changes",
  };
  const insightTexts = [...new Set([
    ...(leadText ? [leadText] : []),
    ...supportText,
  ])].slice(0, 3);
  const supportBySubject = new Map(
    communication.support.flatMap((item) =>
      item.sourceText?.text.trim()
        ? [[referenceIdentity(item.subjectRef), item.sourceText.text.trim()] as const]
        : [],
    ),
  );
  const evidenceCategories = (["supports", "opposes", "shared"] as const)
    .map((role) => ({
      role,
      count: communication.evidenceRoles.filter((entry) => entry.role === role)
        .length,
    }));
  const alternatives = communication.alternatives
    .flatMap((group, groupIndex) =>
      group.alternatives.map((alternative, alternativeIndex) => ({
        id: `authorized-alternative-${groupIndex + 1}-${alternativeIndex + 1}`,
        disposition: alternative.disposition,
        summary:
          supportBySubject.get(referenceIdentity(alternative.explanationRef)) ??
          null,
      })),
    );
  const nextInquiry = communication.nextInquiries.find(
    (item) => item.sourceText?.text.trim(),
  );
  const nextInquiryRationale = nextInquiry?.priority.source === "upstream_signal" &&
      nextInquiry.priority.explanation.code ===
        "investigation_information_gain_signal"
    ? "investigation-information-gain" as const
    : nextInquiry?.priority.explanation.code ===
        "investigation_opportunity_available"
      ? "investigation-opportunity-available" as const
      : "authorized-next-inquiry" as const;
  const authorizedChanges = communication.changes.flatMap((change, index) =>
    change.change
      ? [{
          id: `authorized-change-detail-${index + 1}`,
          direction: change.change.direction,
          reason: change.sourceText?.text.trim() || null,
          occurredAt: change.change.occurredAt,
          previousRevisionAvailable:
            change.change.previousRevisionAvailable,
        }]
      : [],
  );
  const changeDisclosureState =
    authorizedChanges.length > 0 &&
    authorizedChanges.every((change) => change.reason)
      ? "available" as const
      : changeAvailability === "history-not-authorized"
        ? "history-not-authorized" as const
        : changeAvailability === "first-supported-understanding"
          ? "first-supported-understanding" as const
          : changeAvailability === "no-meaningful-change"
            ? "no-meaningful-change" as const
            : changeAvailability === "projection-data-unavailable"
              ? "projection-data-unavailable" as const
              : "change-reason-unavailable" as const;
  const inquiryRequest =
    nextInquiry?.sourceText?.text.trim() && nextInquiry.inquiry
      ? {
          id: "authorized-evidence-request-1",
          question: nextInquiry.sourceText.text.trim(),
          gaps: [...nextInquiry.inquiry.gaps],
          clarificationTargets: [
            ...nextInquiry.inquiry.clarificationTargets,
          ],
          rationale: nextInquiry.inquiry.rationale,
          expectedConfidenceGain:
            nextInquiry.inquiry.expectedConfidenceGain,
          expectedGainUnit: nextInquiry.inquiry.expectedGainUnit,
          supportingReferencesAvailable:
            nextInquiry.inquiry.supportingReferencesAvailability ===
            "available",
          outcomeCaveat: nextInquiry.inquiry.outcomeCaveat,
        }
      : null;
  const evidenceRequestDisclosureState =
    inquiryRequest &&
    inquiryRequest.rationale &&
    inquiryRequest.expectedConfidenceGain !== null &&
    inquiryRequest.supportingReferencesAvailable
      ? "available" as const
      : inquiryAvailability === "inquiry-rationale-unavailable"
        ? "inquiry-rationale-unavailable" as const
        : inquiryAvailability === "gap-known-request-not-authorized"
          ? "gap-known-request-not-authorized" as const
          : inquiryAvailability === "expected-gain-unavailable"
            ? "expected-gain-unavailable" as const
            : inquiryAvailability === "supporting-references-unavailable"
              ? "supporting-references-unavailable" as const
              : inquiryAvailability === "investigation-data-unavailable"
                ? "investigation-data-unavailable" as const
                : inquiryAvailability === "withheld" ||
                    inquiryAvailability === "revoked" ||
                    inquiryAvailability === "organization-mismatch" ||
                    inquiryAvailability === "consumer-mismatch" ||
                    inquiryAvailability === "invalid-authority"
                  ? "organizational-context-not-authorized" as const
                  : "no-additional-evidence-recommended" as const;

  return {
    ...legacyShape,
    summary: {
      understanding: null,
      understandingLabel: "Authority-qualified projection active",
      confidence: null,
      confidenceLabel: "Runtime not yet available",
      primaryConstraint: conditionAreas[0]?.label ?? "Still emerging",
    },
    insights: (insightTexts.length > 0 ? insightTexts : [UNAVAILABLE]).map(
      (headline, index) => ({
        id: `authorized-insight-${index + 1}`,
        headline,
        implication: uncertaintyText[index] ?? uncertaintyText[0] ?? UNAVAILABLE,
        activeAreaIds: conditionAreas[index]
          ? [conditionAreas[index].id]
          : [],
      }),
    ),
    runtimeSections: {
      ...projectedSections,
      currentUnderstanding,
      explanations: support,
      uncertainty,
      investigations,
      recentChanges,
    },
    beliefBasis: {
      summaryExplanation:
        supportText[0] ?? EXPLANATION_TEXT_UNAVAILABLE,
      evidenceCategories,
      uncertainty: uncertaintyText,
      alternatives,
      nextInquiry: nextInquiry?.sourceText?.text.trim()
        ? {
            question: nextInquiry.sourceText.text.trim(),
            rationale: nextInquiryRationale,
          }
        : null,
    },
    changeDisclosure: {
      state: changeDisclosureState,
      changes: authorizedChanges,
    },
    evidenceRequestDisclosure: {
      state: evidenceRequestDisclosureState,
      request: inquiryRequest,
    },
    model: {
      coherence: null,
      coherenceLabel: "Authority-qualified",
      summary: leadText ?? UNAVAILABLE,
      areas: conditionAreas.slice(0, 5),
    },
    influence: {
      statement: leadText ?? UNAVAILABLE,
      metric: null,
      destination: legacyShape.influence.destination,
    },
    think: {
      starters: inquiryText.slice(0, 3),
      destination: legacyShape.think.destination,
    },
    decisions: {
      ...legacyShape.decisions,
      state: {
        kind: "not-ready",
        title: "No authorized decision view",
        summary: UNAVAILABLE,
      },
      currentPosition: {
        ...legacyShape.decisions.currentPosition,
        headline: UNAVAILABLE,
        summary: UNAVAILABLE,
        confidence: null,
        confidenceLabel: "Runtime not yet available",
        rationale: null,
        primaryConstraint: null,
        recommendationStatus: null,
        observations: [],
        risks: [],
      },
      counts: { active: 0, recommended: 0, review: 0 },
    },
    experiment: {
      ...legacyShape.experiment,
      currentScenario: UNAVAILABLE,
      scenarioSummary: null,
      recentScenarios: [],
    },
    brief: {
      ...legacyShape.brief,
      recentBriefs: [],
      sourceSummary: UNAVAILABLE,
    },
  };
}
