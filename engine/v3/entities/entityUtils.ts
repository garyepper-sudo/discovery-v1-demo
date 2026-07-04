import type {
  OrganizationalEntity,
  OrganizationalEntityType,
} from "./organizationalEntity";

export function normalizeEntityName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function createEntityId(
  organizationId: string,
  type: OrganizationalEntityType,
  name: string
): string {
  const normalized = normalizeEntityName(name).replace(/\s+/g, "-");
  return `${organizationId}:entity:${type}:${normalized}`;
}

export function createOrganizationalEntity(input: {
  organizationId: string;
  canonicalName: string;
  type?: OrganizationalEntityType;
  evidenceId?: string;
}): OrganizationalEntity {
  const now = new Date().toISOString();
  const type = input.type ?? "unknown";
  const normalizedName = normalizeEntityName(input.canonicalName);

  return {
    id: createEntityId(input.organizationId, type, input.canonicalName),
    organizationId: input.organizationId,

    canonicalName: input.canonicalName.trim(),
    normalizedName,
    aliases: [],

    type,
    confidence: 0.55,
    stability: "candidate",

    firstSeen: now,
    lastSeen: now,
    mentionCount: 1,

    observationIds: input.evidenceId ? [input.evidenceId] : [],
    beliefIds: [],
    understandingIds: [],
    capabilityIds: [],
    dynamicIds: [],
    phenomenonIds: [],
    conceptIds: [],

    relatedEntityIds: [],

    createdAt: now,
    updatedAt: now,
  };
}

export function entityNamesMatch(
  a: OrganizationalEntity,
  b: OrganizationalEntity
): boolean {
  if (a.normalizedName === b.normalizedName) return true;

  const aNames = new Set([a.normalizedName, ...a.aliases.map(normalizeEntityName)]);
  const bNames = new Set([b.normalizedName, ...b.aliases.map(normalizeEntityName)]);

  for (const name of aNames) {
    if (bNames.has(name)) return true;
  }

  return false;
}

export function mergeOrganizationalEntities(
  existing: OrganizationalEntity,
  incoming: OrganizationalEntity
): OrganizationalEntity {
  const now = new Date().toISOString();

  const aliases = new Set([
    ...existing.aliases,
    ...incoming.aliases,
    incoming.canonicalName,
  ]);

  aliases.delete(existing.canonicalName);

  const mentionCount = existing.mentionCount + incoming.mentionCount;

  return {
    ...existing,

    aliases: Array.from(aliases),

    confidence: Math.min(
      1,
      Math.max(existing.confidence, incoming.confidence) + 0.05
    ),

    stability:
      mentionCount >= 5
        ? "stable"
        : mentionCount >= 2
          ? "emerging"
          : "candidate",

    lastSeen: now,
    mentionCount,

    observationIds: Array.from(
      new Set([...existing.observationIds, ...incoming.observationIds])
    ),
    beliefIds: Array.from(new Set([...existing.beliefIds, ...incoming.beliefIds])),
    understandingIds: Array.from(
      new Set([...existing.understandingIds, ...incoming.understandingIds])
    ),
    capabilityIds: Array.from(
      new Set([...existing.capabilityIds, ...incoming.capabilityIds])
    ),
    dynamicIds: Array.from(
      new Set([...existing.dynamicIds, ...incoming.dynamicIds])
    ),
    phenomenonIds: Array.from(
      new Set([...existing.phenomenonIds, ...incoming.phenomenonIds])
    ),
    conceptIds: Array.from(
      new Set([...existing.conceptIds, ...incoming.conceptIds])
    ),
    relatedEntityIds: Array.from(
      new Set([...existing.relatedEntityIds, ...incoming.relatedEntityIds])
    ),

    updatedAt: now,
  };
}