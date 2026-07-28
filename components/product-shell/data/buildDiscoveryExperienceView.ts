import type { OrganizationRuntime } from "../../../engine/v3/runtime";
import type { AlphaFixture } from "../../../product/alpha/viewModels";
import type { buildActivatedYourOrganizationView } from "./buildActivatedYourOrganizationView";

const NOT_YET_AVAILABLE = "Not yet available in this Alpha";

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

export function buildDiscoveryExperienceView(input: {
  runtime: OrganizationRuntime;
  view: ActivatedView;
}): AlphaFixture {
  const { runtime, view } = input;
  const sections = view.runtimeSections;
  const understanding = availableText(sections.currentUnderstanding.summary);
  const explanation = availableText(sections.explanations.summary);
  const uncertainty = availableText(sections.uncertainty.summary);
  const condition = availableText(sections.conditions.summary);
  const state = availableText(sections.organizationalState.summary);
  const investigations = items(
    sections.investigations.items,
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
      id: runtime.metadata.organizationId,
      name: runtime.metadata.name || "Your organization",
    },
    user: {
      name: runtime.metadata.name || "Your organization",
      role: "Authorized organization view",
    },
    understanding: {
      id: view.insights[0]?.id ?? "authorized-organizational-understanding",
      title: "Current Organizational Understanding",
      originalQuestion: investigations[0],
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
        qualitative: "Early",
        value: null,
        change: null,
        rationale: "This view contains authority-qualified projected understanding.",
        limitation:
          "A scalar confidence value is not available through the approved disclosure contract.",
      },
    },
    sources: investigations.map((title, index) => ({
      id: `authorized-source-${index + 1}`,
      title,
      rationale: "Authorized next inquiry from the projected organization view.",
      contribution: index === 0 ? "High" : "Medium",
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
      detail: "Available from the authority-qualified projected organization view.",
      action: "Review understanding",
      kind: index === 0 ? "learning" : "relationship",
      impact: index === 0 ? "High" : "Moderate",
    })),
  };
}
