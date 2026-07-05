import { createOrganizationModel } from "../model/createOrganizationModel";
import type { OrganizationModel } from "../model/organizationModel";
import type { EntityMention } from "./entityLifecycle";
import { resolveEntityMentions } from "./resolveEntityMentions";

function ensureOrganizationModel(params: {
  organizationModel?: OrganizationModel;
  organizationId: string;
}): OrganizationModel {
  const model =
    params.organizationModel ?? createOrganizationModel(params.organizationId);

  return {
    ...model,
    entities: model.entities ?? [],
    entityRelationships: model.entityRelationships ?? [],
    nodes: model.nodes ?? [],
    edges: model.edges ?? [],
    snapshots: model.snapshots ?? [],
    metrics: model.metrics ?? {
      coherence: 0,
      continuity: 0,
      integration: 0,
      adaptability: 0,
      emergence: 0,
    },
  };
}

export function syncOrganizationEntities(params: {
  organizationModel?: OrganizationModel;
  organizationId: string;
  entityMentions: EntityMention[];
}): OrganizationModel {
  const organizationModel = ensureOrganizationModel({
    organizationModel: params.organizationModel,
    organizationId: params.organizationId,
  });

  if (params.entityMentions.length === 0) {
    return organizationModel;
  }

  return resolveEntityMentions({
    organizationModel,
    mentions: params.entityMentions,
  });
}