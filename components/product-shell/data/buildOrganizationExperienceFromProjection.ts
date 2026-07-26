import type {
  OrganizationalUnderstandingProjection,
  ProjectionAvailabilityArea,
  ProjectionAvailabilityState,
} from "../../../engine/v3/projection/organizationalUnderstandingProjection";
import type {
  RuntimeOrganizationSection,
  RuntimeOrganizationView,
} from "./buildRuntimeOrganizationView";

const UNAVAILABLE = "Runtime not yet available";

type CompatibilityAvailabilityState =
  NonNullable<RuntimeOrganizationSection["availability"]>["state"];

type SectionInput = {
  title: string;
  owner: string;
  sourceArea: ProjectionAvailabilityArea;
  sourceState: ProjectionAvailabilityState;
  items?: string[];
  contentRequiresCommunication?: boolean;
  references?: RuntimeOrganizationSection["references"];
  projectionMetadata?: RuntimeOrganizationSection["projectionMetadata"];
};

function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.trim()))].slice(0, 4);
}

function section(input: SectionInput): RuntimeOrganizationSection {
  const items = unique(input.items ?? []);
  const state: CompatibilityAvailabilityState =
    input.contentRequiresCommunication &&
    input.sourceState === "available-with-content"
      ? "communication-synthesis-unavailable"
      : input.sourceState === "available-with-content" && items.length === 0
        ? "available-empty"
        : input.sourceState;
  const available = state === "available-with-content" && items.length > 0;

  return {
    title: input.title,
    owner: input.owner,
    available,
    summary: available ? items[0] : UNAVAILABLE,
    items: available ? items : [],
    availability: {
      state,
      sourceArea: input.sourceArea,
    },
    references: input.references ?? [],
    ...(input.projectionMetadata
      ? { projectionMetadata: input.projectionMetadata }
      : {}),
  };
}

function stateFor(
  projection: OrganizationalUnderstandingProjection,
  area: ProjectionAvailabilityArea,
): ProjectionAvailabilityState {
  return (
    projection.availability.find((entry) => entry.area === area)?.state ??
    projection.availability.find((entry) => entry.area === "projection")
      ?.state ??
    "runtime-data-unavailable"
  );
}

/**
 * Pure compatibility shaping from a completed, disclosure-enforced projection
 * into the existing Your Organization Runtime-details contract.
 *
 * This adapter does not read Runtime, evaluate disclosure or authority,
 * synthesize prose, rank cognition, calculate confidence, or persist data.
 */
export function buildOrganizationExperienceFromProjection(input: {
  projection: OrganizationalUnderstandingProjection;
}): RuntimeOrganizationView {
  const { projection } = input;
  const understandings = [...projection.understandings].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
  const explanations = [...projection.explanations].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
  const evidence = [...projection.evidence].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
  const uncertainty = [...projection.uncertainty].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
  const conditions = [...projection.conditions].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
  const investigations = [...projection.investigations].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
  const evolution = [...projection.evolution].sort((left, right) =>
    `${left.value.occurredAt}\0${left.id}`.localeCompare(
      `${right.value.occurredAt}\0${right.id}`,
    ),
  );
  const uncertaintyItems = uncertainty.flatMap((item) => {
    if (item.value.owner === "organizational-explanation") {
      return [item.value.statement];
    }
    if (item.value.owner === "organizational-uncertainty") {
      return [item.value.driver.description];
    }
    return [];
  });
  const conditionItems = conditions.flatMap((item) =>
    item.value.summary.trim()
      ? [item.value.summary]
      : item.value.name.trim()
        ? [item.value.name]
        : [],
  );
  const stateItems = projection.organizationalState
    ? [
        projection.organizationalState.value.summary,
        projection.organizationalState.value.executiveImplication,
        ...projection.organizationalState.value.recommendedFocus,
      ]
    : [];
  const investigationItems = investigations.flatMap((item) =>
    item.value.suggestedExecutiveQuestion.trim()
      ? [item.value.suggestedExecutiveQuestion]
      : item.value.topic.trim()
        ? [item.value.topic]
        : [],
  );

  return {
    currentUnderstanding: section({
      title: "Current Organizational Understanding",
      owner: "Canonical Organizational Understanding",
      sourceArea: "understanding",
      sourceState: stateFor(projection, "understanding"),
      contentRequiresCommunication: projection.understandings.length > 0,
      references: understandings.map((item) => item.canonicalRef),
      projectionMetadata: {
        projectionId: projection.projectionId,
        contractVersion: projection.contractVersion,
        organizationId: projection.organizationId,
        consumerId: projection.consumerId,
        disclosureDecisionId: projection.disclosureDecisionId,
        sourceRevisionIds: [...projection.sourceRevisionIds].sort(),
        evidenceRoles: evidence.flatMap((item) =>
          item.value.roles.map((role) => ({
            evidenceId: item.id,
            explanationId: role.explanationId,
            role: role.role,
            basisKind: role.basisKind,
            basisReferenceIds: [...role.basisReferenceIds].sort(),
            relatedExplanationIds: [...role.relatedExplanationIds].sort(),
          })),
        ),
      },
    }),
    explanations: section({
      title: "Top Organizational Explanations",
      owner: "Completed Organizational Explanations",
      sourceArea: "explanations",
      sourceState: stateFor(projection, "explanations"),
      contentRequiresCommunication: projection.explanations.length > 0,
      references: explanations.map((item) => item.canonicalRef),
    }),
    evidence: section({
      title: "Supporting Evidence",
      owner: "Evidence",
      sourceArea: "evidence",
      sourceState: projection.evidence.some(
        (item) => item.value.bodyAvailability === "runtime-data-unavailable",
      )
        ? "runtime-data-unavailable"
        : stateFor(projection, "evidence"),
      references: evidence.map((item) => item.canonicalRef),
    }),
    uncertainty: section({
      title: "Remaining Uncertainty",
      owner: "Organizational Uncertainty and completed Explanations",
      sourceArea: "uncertainty",
      sourceState: stateFor(projection, "uncertainty"),
      items: uncertaintyItems,
      contentRequiresCommunication:
        projection.uncertainty.length > 0 && uncertaintyItems.length === 0,
      references: uncertainty.map((item) => item.canonicalRef),
    }),
    conditions: section({
      title: "Relevant Conditions",
      owner: "Organizational Conditions",
      sourceArea: "conditions",
      sourceState: stateFor(projection, "conditions"),
      items: conditionItems,
      references: conditions.map((item) => item.canonicalRef),
    }),
    organizationalState: section({
      title: "Current Organizational State",
      owner: "Organizational State",
      sourceArea: "organizational-state",
      sourceState: stateFor(projection, "organizational-state"),
      items: stateItems,
      references: projection.organizationalState
        ? [projection.organizationalState.canonicalRef]
        : [],
    }),
    investigations: section({
      title: "Investigation Opportunities",
      owner: "Investigation Opportunities",
      sourceArea: "investigations",
      sourceState: stateFor(projection, "investigations"),
      items: investigationItems,
      references: investigations.map((item) => item.canonicalRef),
    }),
    recentChanges: section({
      title: "Recent Changes",
      owner: "Organizational Understanding Evolution",
      sourceArea: "evolution",
      sourceState: stateFor(projection, "evolution"),
      contentRequiresCommunication: projection.evolution.length > 0,
      references: evolution.map((item) => item.canonicalRef),
    }),
    modelEvolution: section({
      title: "Model Evolution",
      owner: "Organizational Understanding Evolution",
      sourceArea: "evolution",
      sourceState: stateFor(projection, "evolution"),
      contentRequiresCommunication: projection.evolution.length > 0,
      references: evolution.map((item) => item.canonicalRef),
    }),
  };
}
