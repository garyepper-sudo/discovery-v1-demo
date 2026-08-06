import type { OrganizationRuntime } from "../../../engine/v3/runtime";
import type { AlphaFixture } from "../../../product/alpha/viewModels";
import type { buildActivatedYourOrganizationView } from "./buildActivatedYourOrganizationView";

const NOT_YET_AVAILABLE = "Not yet available in this Alpha";
const IMPACT_EXPLANATION_UNAVAILABLE =
  "No additional impact explanation is available.";

type ActivatedView = ReturnType<typeof buildActivatedYourOrganizationView>;

function availableText(
  value: string | undefined,
  fallback = NOT_YET_AVAILABLE,
): string {
  return value?.trim() || fallback;
}

function items(
  values: readonly string[],
  fallback: string,
  limit = 4,
): string[] {
  const selected = [...new Set(values.map((value) => value.trim()).filter(Boolean))]
    .slice(0, limit);
  return selected.length ? selected : [fallback];
}

function originalInvestigationQuestion(runtime: OrganizationRuntime): string {
  const memory = runtime.memory as unknown as {
    understandingSnapshots?: Array<{
      question?: string;
      timestamp?: string;
    }>;
    events?: Array<{
      question?: string;
      timestamp?: string;
    }>;
  };
  const candidates = [
    ...(memory.understandingSnapshots ?? []),
    ...(memory.events ?? []),
  ]
    .flatMap((entry) =>
      entry.question?.trim()
        ? [{
            question: entry.question.trim(),
            timestamp: entry.timestamp?.trim() ?? "",
          }]
        : [],
    )
    .sort((left, right) =>
      `${left.timestamp}\0${left.question}`.localeCompare(
        `${right.timestamp}\0${right.question}`,
      ),
    );
  return candidates[0]?.question ?? "Original question unavailable";
}

export function buildDiscoveryExperienceView(input: {
  runtime: OrganizationRuntime;
  view: ActivatedView;
}): AlphaFixture {
  const { runtime, view } = input;
  return buildDiscoveryExperience({
    organizationId: runtime.metadata.organizationId,
    organizationName: runtime.metadata.name || "Your organization",
    displayRole: "Authorized organization view",
    originalQuestion: originalInvestigationQuestion(runtime),
    view,
  });
}

/** Projection/Product-Communication-only presentation boundary for role-aware reads. */
export function buildRoleAwareDiscoveryExperienceView(input: {
  organizationId: string;
  displayRole: string;
  view: ActivatedView;
}): AlphaFixture {
  return buildDiscoveryExperience({
    organizationId: input.organizationId,
    organizationName: "Your organization",
    displayRole: input.displayRole,
    originalQuestion: "Original question unavailable",
    view: input.view,
  });
}

function buildDiscoveryExperience(input: {
  organizationId: string;
  organizationName: string;
  displayRole: string;
  originalQuestion: string;
  view: ActivatedView;
}): AlphaFixture {
  const { view } = input;
  const sections = view.runtimeSections;
  const understanding = availableText(sections.currentUnderstanding.summary);
  const explanation = availableText(sections.explanations.summary);
  const uncertainty = availableText(sections.uncertainty.summary);
  const condition = availableText(sections.conditions.summary);
  const state = sections.organizationalState.available
    ? availableText(sections.organizationalState.summary)
    : IMPACT_EXPLANATION_UNAVAILABLE;
  const canonicalInquiry =
    view.evidenceRequestDisclosure?.request?.question.trim() || null;
  const investigations = items(
    canonicalInquiry
      ? [canonicalInquiry]
      : sections.investigations.items,
    "No additional inquiry is currently authorized.",
  );
  const changeItems = items(
    sections.recentChanges.items,
    "No meaningful change is currently available.",
  );
  const relationshipItems = items(
    [
      ...sections.conditions.items,
      ...sections.organizationalState.items,
    ],
    "No related understanding is currently available.",
  );

  return {
    productionMode: true,
    organization: {
      id: input.organizationId,
      name: input.organizationName,
    },
    user: {
      name: input.organizationName,
      role: input.displayRole,
    },
    understanding: {
      id: view.insights[0]?.id ?? "authorized-organizational-understanding",
      title: "Current Organizational Understanding",
      originalQuestion: input.originalQuestion,
      objective: understanding,
      synthesis: understanding,
      explanation,
      whyItMatters: state,
      strongestExplanation: explanation,
      primaryUnknown: uncertainty,
      contradiction:
        sections.uncertainty.items[1] ??
        "No additional contradiction is currently available.",
      confidence: {
        qualitative: null,
        value: null,
        change: null,
        rationale: "This view contains authority-qualified projected understanding.",
        limitation:
          "A scalar confidence value is not available through the approved disclosure contract.",
      },
      ...(view.beliefBasis
        ? {
            beliefBasis: {
              summaryExplanation: view.beliefBasis.summaryExplanation,
              broaderSupport: [...view.beliefBasis.broaderSupport],
              evidenceCategories: view.beliefBasis.evidenceCategories.map(
                (category) => ({ ...category }),
              ),
              uncertainty: [...view.beliefBasis.uncertainty],
              broaderUncertainty: [
                ...view.beliefBasis.broaderUncertainty,
              ],
              alternatives: view.beliefBasis.alternatives.map(
                (alternative) => ({ ...alternative }),
              ),
              nextInquiry: view.beliefBasis.nextInquiry
                ? {
                    ...view.beliefBasis.nextInquiry,
                    affectedConditions: [
                      ...view.beliefBasis.nextInquiry.affectedConditions,
                    ],
                  }
                : null,
            },
          }
        : {}),
      ...(view.changeDisclosure
        ? {
            changeDisclosure: {
              state: view.changeDisclosure.state,
              changes: view.changeDisclosure.changes.map((change) => ({
                ...change,
              })),
            },
          }
        : {}),
      ...(view.evidenceRequestDisclosure
        ? {
            evidenceRequestDisclosure: {
              state: view.evidenceRequestDisclosure.state,
              request: view.evidenceRequestDisclosure.request
                ? {
                    ...view.evidenceRequestDisclosure.request,
                    gaps: [
                      ...view.evidenceRequestDisclosure.request.gaps,
                    ],
                    clarificationTargets: [
                      ...view.evidenceRequestDisclosure.request
                        .clarificationTargets,
                    ],
                  }
                : null,
            },
          }
        : {}),
    },
    sources: investigations.map((title, index) => ({
      id: `authorized-source-${index + 1}`,
      title,
      rationale:
        index === 0
          ? view.beliefBasis?.nextInquiry?.scopeLabel ??
            "A broader organizational context."
          : "A broader organizational context.",
      contribution: null,
      state: "Included",
      tone: (["green", "blue", "violet", "orange"] as const)[index % 4],
    })),
    events: changeItems.map((detail, index) => ({
      id: `authorized-event-${index + 1}`,
      time: "Available now",
      title: index === 0 ? "Meaningful change" : "Understanding update",
      detail,
      effect: "Read-only projected change",
      kind: index === 0 ? "strengthening" : "relationship",
    })),
    relationships: relationshipItems.map((title, index) => ({
      id: `authorized-relationship-${index + 1}`,
      title,
      description: index === 0 ? condition : "Related projected understanding",
      tone: (["green", "blue", "violet", "orange"] as const)[index % 4],
    })),
    responsePaths: [
      {
        id: "agree",
        title: "This matches my experience",
        description: "Provisional response; nothing durable changes in this Alpha.",
        tone: "blue",
      },
      {
        id: "missing",
        title: "Something important is missing",
        description: "Add provisional context without claiming model persistence.",
        tone: "orange",
      },
      {
        id: "different",
        title: "I interpret this differently",
        description: "Record a provisional alternative interpretation.",
        tone: "violet",
      },
      {
        id: "investigate",
        title: "Investigate further before deciding",
        description: "Review the authorized next inquiries.",
        tone: "green",
      },
    ],
    changes: changeItems.map((headline, index) => ({
      id: `authorized-change-${index + 1}`,
      eyebrow: index === 0 ? "Meaningful change" : "Understanding evolution",
      headline,
      detail: "Available in this organization’s learning history.",
      action: "Review understanding",
      kind: index === 0 ? "learning" : "relationship",
      impact: null,
    })),
  };
}
