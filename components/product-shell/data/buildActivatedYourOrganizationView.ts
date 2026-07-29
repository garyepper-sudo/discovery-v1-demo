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
