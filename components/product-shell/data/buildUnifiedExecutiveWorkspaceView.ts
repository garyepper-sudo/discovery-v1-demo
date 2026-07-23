import type { OrganizationRuntime } from "../../../engine/v3/runtime";
import { buildOrganizationExperienceView } from "./buildOrganizationExperienceView";
import { buildAskExperienceView } from "./buildAskExperienceView";
import { buildDecisionsExperienceView } from "./buildDecisionsExperienceView";
import { buildExperimentExperienceView } from "./buildExperimentExperienceView";
import { buildBriefExperienceView } from "./buildBriefExperienceView";
import { buildProductHref } from "./productOrganization";

export function buildUnifiedExecutiveWorkspaceView(runtime: OrganizationRuntime) {
  const organization = buildOrganizationExperienceView(runtime);
  const think = buildAskExperienceView(runtime);
  const decisions = buildDecisionsExperienceView(runtime);
  const experiment = buildExperimentExperienceView(runtime);
  const brief = buildBriefExperienceView(runtime);
  const organizationId = runtime.metadata.organizationId;
  return {
    organization: organization.organization,
    greetingName: organization.organization.name.split(/\s+/)[0] || "there",
    summary: {
      understanding: organization.model.coherence,
      understandingLabel: organization.model.coherenceLabel,
      confidence: organization.currentUnderstanding.confidence,
      confidenceLabel: organization.currentUnderstanding.confidenceLabel,
      primaryConstraint: organization.model.areas[0]?.label ?? "Still emerging",
    },
    insights: organization.insights.map((headline, index) => ({
      id: `insight-${index + 1}`,
      headline,
      implication: index === 0 ? organization.currentUnderstanding.explanation : organization.currentUnderstanding.reasoning,
      activeAreaIds: organization.model.areas.filter((_, areaIndex) => areaIndex === 0 || areaIndex === index + 1).map((area) => area.id),
    })),
    model: organization.model,
    influence: {
      statement: decisions.state.kind === "active" ? decisions.state.summary : organization.currentUnderstanding.explanation,
      metric: null,
      destination: buildProductHref("/decisions", organizationId),
    },
    think: {
      starters: [think.nextQuestion?.text, organization.exploration.recommended.label, ...think.otherQuestions.map((item) => item.text), ...organization.exploration.alternatives.map((item) => item.label)].filter((item): item is string => Boolean(item)).filter((item, index, items) => items.indexOf(item) === index).slice(0, 3),
      destination: buildProductHref("/ask", organizationId),
    },
    decisions: {
      ...decisions,
      destination: buildProductHref("/decisions", organizationId),
    },
    experiment: { ...experiment, destination: buildProductHref("/experiment", organizationId), runDestination: buildProductHref("/executive-decision", organizationId) },
    brief: { ...brief, destination: buildProductHref("/brief", organizationId) },
    actions: {
      teach: `${buildProductHref("/your-organization", organizationId)}#teach-discovery`,
      exploreInsight: `${buildProductHref("/your-organization", organizationId)}#insight-reasoning`,
      recap: `${buildProductHref("/your-organization", organizationId)}#session-recap`,
    },
  };
}
