import type { OrganizationModel } from "../model/organizationModel";
import type { EntityMention } from "./entityLifecycle";
import type { OrganizationalEntityType } from "./organizationalEntity";
import {
  createOrganizationalEntity,
  entityNamesMatch,
  mergeOrganizationalEntities,
  normalizeEntityName,
} from "./entityUtils";

type AliasGroup = {
  canonicalName: string;
  type: OrganizationalEntityType;
  aliases: string[];
};

const ALIAS_GROUPS: AliasGroup[] = [
  {
    canonicalName: "Scheduling Dashboard",
    type: "system",
    aliases: [
      "dashboard",
      "scheduling dashboard",
      "operations dashboard",
      "centralized scheduling dashboard",
    ],
  },
  {
    canonicalName: "Workforce Burnout",
    type: "risk",
    aliases: ["burnout", "fatigue", "emotional exhaustion"],
  },
  {
    canonicalName: "Leadership",
    type: "actor",
    aliases: ["CEO", "leadership", "executive team", "executives"],
  },
  {
    canonicalName: "Operations Team",
    type: "team",
    aliases: ["operations", "operations team"],
  },
  {
    canonicalName: "Scheduling Process",
    type: "process",
    aliases: ["scheduling", "scheduling process"],
  },
];

function resolveAlias(text: string, type: OrganizationalEntityType): {
  canonicalName: string;
  type: OrganizationalEntityType;
  aliases: string[];
} {
  const normalizedText = normalizeEntityName(text);

  const group = ALIAS_GROUPS.find((aliasGroup) => {
    if (aliasGroup.type !== type && type !== "unknown") return false;

    return aliasGroup.aliases
      .map(normalizeEntityName)
      .includes(normalizedText);
  });

  if (!group) {
    return {
      canonicalName: text,
      type,
      aliases: [],
    };
  }

  return {
    canonicalName: group.canonicalName,
    type: group.type,
    aliases: group.aliases.filter(
      (alias) => normalizeEntityName(alias) !== normalizeEntityName(group.canonicalName)
    ),
  };
}

function mentionToEntity(mention: EntityMention) {
  const resolved = resolveAlias(mention.text, mention.candidateType);

  const entity = createOrganizationalEntity({
    organizationId: mention.organizationId,
    canonicalName: resolved.canonicalName,
    type: resolved.type,
    evidenceId: mention.sourceId,
  });

  return {
    ...entity,
    aliases: Array.from(new Set([...entity.aliases, ...resolved.aliases])),
  };
}

export function resolveEntityMentions(params: {
  organizationModel: OrganizationModel;
  mentions: EntityMention[];
}): OrganizationModel {
  const { organizationModel, mentions } = params;

  const entities = [...organizationModel.entities];

  for (const mention of mentions) {
    const incoming = mentionToEntity(mention);

    const existingIndex = entities.findIndex((entity) => {
      if (entity.type !== incoming.type && entity.type !== "unknown") {
        return false;
      }

      if (entityNamesMatch(entity, incoming)) return true;

      const mentionName = normalizeEntityName(mention.text);
      const incomingName = normalizeEntityName(incoming.canonicalName);

      return (
        entity.normalizedName === mentionName ||
        entity.normalizedName === incomingName ||
        entity.aliases.map(normalizeEntityName).includes(mentionName) ||
        entity.aliases.map(normalizeEntityName).includes(incomingName)
      );
    });

    if (existingIndex >= 0) {
      entities[existingIndex] = mergeOrganizationalEntities(
        entities[existingIndex],
        incoming
      );
    } else {
      entities.push(incoming);
    }
  }

  return {
    ...organizationModel,
    entities,
    updatedAt: new Date().toISOString(),
  };
}