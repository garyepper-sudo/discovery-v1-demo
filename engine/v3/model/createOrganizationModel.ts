import type { OrganizationModel } from "./organizationModel";

export function createOrganizationModel(
  organizationId: string
): OrganizationModel {
  const now = new Date().toISOString();

  return {
    organizationId,
    version: 1,
    createdAt: now,
    updatedAt: now,

    entities: [],
    entityRelationships: [],

    nodes: [],
    edges: [],
    snapshots: [],

    metrics: {
      coherence: 0,
      continuity: 0,
      integration: 0,
      adaptability: 0,
      emergence: 0,
    },
  };
}