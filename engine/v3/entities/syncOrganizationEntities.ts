import type { OrganizationModel } from "../model/organizationModel";
import type { EntityMention } from "./entityLifecycle";
import { resolveEntityMentions } from "./resolveEntityMentions";

export function syncOrganizationEntities(params: {
  organizationModel: OrganizationModel;
  entityMentions: EntityMention[];
}): OrganizationModel {
  const { organizationModel, entityMentions } = params;

  if (entityMentions.length === 0) {
    return organizationModel;
  }

  return resolveEntityMentions({
    organizationModel,
    mentions: entityMentions,
  });
}