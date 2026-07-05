export type OrganizationReasoningNode = {
  entityId: string;
  canonicalName: string;
  category: string;
  aliases: string[];
  confidence: number;
  evidenceIds: string[];
  relatedEntityIds: string[];
};

export type OrganizationReasoningGraph = {
  organizationId: string;
  generatedAt: string;
  nodes: OrganizationReasoningNode[];
};

const ARTIFACT_TERMS = [
  "pattern",
  "become",
  "increasingly",
  "strong",
  "belief",
  "treats",
  "sees",
  "this",
  "discovery",
];

function normalizeEntityName(value: unknown): string {
  return String(value ?? "").trim();
}

function resolveEntityCategory(entity: any): string {
  if (
    typeof entity?.category === "string" &&
    entity.category.trim() &&
    entity.category !== "unknown"
  ) {
    return entity.category;
  }

  const id = String(entity?.id ?? "");
  const parts = id.split(":");
  const entityIndex = parts.indexOf("entity");

  if (entityIndex >= 0 && parts[entityIndex + 1]) {
    return parts[entityIndex + 1];
  }

  return "unknown";
}

function isReasoningWorthyEntity(entity: any): boolean {
  const canonicalName = normalizeEntityName(
    entity?.canonicalName ?? entity?.name
  );

  if (!canonicalName) return false;
  if (canonicalName.toLowerCase() === "unknown entity") return false;

  const confidence =
    typeof entity?.confidence === "number" ? entity.confidence : 0.5;

  const aliases = Array.isArray(entity?.aliases) ? entity.aliases : [];
  const evidenceIds = Array.isArray(entity?.evidenceIds)
    ? entity.evidenceIds
    : [];
  const relatedEntityIds = Array.isArray(entity?.relatedEntityIds)
    ? entity.relatedEntityIds
    : [];

  const normalized = canonicalName.toLowerCase();

  const looksLikeArtifact = ARTIFACT_TERMS.some((term) => {
    return normalized === term || normalized.endsWith(` ${term}`);
  });

  if (looksLikeArtifact && aliases.length === 0) {
    return false;
  }

  const hasOrganizationalSignal =
    aliases.length > 0 ||
    evidenceIds.length > 0 ||
    relatedEntityIds.length > 0 ||
    confidence >= 0.65;

  return hasOrganizationalSignal;
}

export function buildOrganizationReasoningGraph(
  organizationModel: any
): OrganizationReasoningGraph {
  const now = new Date().toISOString();

  const entities = Array.isArray(organizationModel?.entities)
    ? organizationModel.entities
    : [];

  const nodes: OrganizationReasoningNode[] = entities
    .filter(isReasoningWorthyEntity)
    .map((entity: any) => ({
      entityId: entity.id,
      canonicalName: normalizeEntityName(
        entity.canonicalName ?? entity.name ?? "Unknown Entity"
      ),
      category: resolveEntityCategory(entity),
      aliases: Array.isArray(entity.aliases) ? entity.aliases : [],
      confidence:
        typeof entity.confidence === "number" ? entity.confidence : 0.5,
      evidenceIds: Array.isArray(entity.evidenceIds) ? entity.evidenceIds : [],
      relatedEntityIds: Array.isArray(entity.relatedEntityIds)
        ? entity.relatedEntityIds
        : [],
    }));

  return {
    organizationId: organizationModel?.organizationId ?? "unknown",
    generatedAt: now,
    nodes,
  };
}