import type {
  OrganizationalIntervention,
  OrganizationalInterventionScope,
  OrganizationalInterventionStatus,
  OrganizationalInterventionTimeHorizon,
  OrganizationalInterventionType,
} from "./organizationalIntervention";

export type BuildOrganizationalInterventionInput = {
  organizationId: string;

  type: OrganizationalInterventionType;

  title: string;

  description: string;

  rationale?: string;

  scope?: OrganizationalInterventionScope;

  timeHorizon?: OrganizationalInterventionTimeHorizon;

  status?: OrganizationalInterventionStatus;

  affectedConditionIds?: string[];

  affectedBeliefIds?: string[];

  expectedMechanismIds?: string[];

  assumptions?: string[];

  confidence?: number;

  createdAt?: string;
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function createInterventionId(
  organizationId: string,
  title: string,
  createdAt: string,
): string {
  const normalizedTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return [
    "intervention",
    organizationId,
    normalizedTitle || "scenario",
    createdAt,
  ].join("-");
}

export function buildOrganizationalIntervention(
  input: BuildOrganizationalInterventionInput,
): OrganizationalIntervention {
  const createdAt =
    input.createdAt ?? new Date().toISOString();

  return {
    id: createInterventionId(
      input.organizationId,
      input.title,
      createdAt,
    ),

    organizationId: input.organizationId,

    type: input.type,

    title: input.title.trim(),

    description: input.description.trim(),

    rationale:
      input.rationale?.trim() ||
      "Leadership is evaluating a possible organizational change.",

    scope: input.scope ?? "organization",

    timeHorizon: input.timeHorizon ?? "near-term",

    status: input.status ?? "hypothetical",

    affectedConditionIds:
      input.affectedConditionIds ?? [],

    affectedBeliefIds:
      input.affectedBeliefIds ?? [],

    expectedMechanismIds:
      input.expectedMechanismIds ?? [],

    assumptions:
      input.assumptions ?? [],

    confidence: clamp01(
      input.confidence ?? 0.5,
    ),

    createdAt,

    updatedAt: createdAt,
  };
}