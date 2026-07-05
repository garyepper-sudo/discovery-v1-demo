export type OrganizationReasoningNodeKind = "entity" | "phenomenon";

export type OrganizationReasoningNode = {
  id: string;
  kind: OrganizationReasoningNodeKind;

  entityId?: string;
  phenomenonId?: string;

  canonicalName: string;
  category: string;
  aliases: string[];
  confidence: number;
  evidenceIds: string[];
  relatedEntityIds: string[];

  description?: string;
  status?: string;
  strength?: number;
  clusterIds?: string[];
  understandingIds?: string[];
  possibleMechanismTypes?: string[];
};

export type OrganizationReasoningEdgeKind =
  | "entity_related_to_entity"
  | "entity_participates_in_phenomenon"
  | "phenomenon_suggests_mechanism"
  | "phenomenon_related_to_phenomenon";

export type OrganizationReasoningEdge = {
  id: string;
  kind: OrganizationReasoningEdgeKind;
  sourceId: string;
  targetId: string;
  label: string;
  confidence: number;
};

export type OrganizationReasoningGraph = {
  organizationId: string;
  generatedAt: string;
  nodes: OrganizationReasoningNode[];
  edges: OrganizationReasoningEdge[];
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

  return (
    aliases.length > 0 ||
    evidenceIds.length > 0 ||
    relatedEntityIds.length > 0 ||
    confidence >= 0.65
  );
}

function getPhenomena(organizationModel: any): any[] {
  if (Array.isArray(organizationModel?.phenomena)) {
    return organizationModel.phenomena;
  }

  if (Array.isArray(organizationModel?.phenomenaState?.phenomena)) {
    return organizationModel.phenomenaState.phenomena;
  }

  if (Array.isArray(organizationModel?.organizationalPhenomena?.phenomena)) {
    return organizationModel.organizationalPhenomena.phenomena;
  }

  return [];
}

function buildEntityNode(entity: any): OrganizationReasoningNode {
  return {
    id: entity.id,
    kind: "entity",

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
  };
}

function buildPhenomenonNode(phenomenon: any): OrganizationReasoningNode {
  return {
    id: phenomenon.id,
    kind: "phenomenon",

    phenomenonId: phenomenon.id,

    canonicalName:
      normalizeEntityName(phenomenon.label) ||
      "Emerging Organizational Phenomenon",
    category: phenomenon.type ?? "organizational_phenomenon",
    aliases: [],
    confidence:
      typeof phenomenon.confidence === "number" ? phenomenon.confidence : 0.5,
    evidenceIds: Array.isArray(phenomenon.evidenceIds)
      ? phenomenon.evidenceIds
      : [],
    relatedEntityIds: Array.isArray(phenomenon.relatedEntityIds)
      ? phenomenon.relatedEntityIds
      : [],

    description: phenomenon.description,
    status: phenomenon.status,
    strength:
      typeof phenomenon.strength === "number" ? phenomenon.strength : undefined,
    clusterIds: Array.isArray(phenomenon.clusterIds)
      ? phenomenon.clusterIds
      : [],
    understandingIds: Array.isArray(phenomenon.understandingIds)
      ? phenomenon.understandingIds
      : [],
    possibleMechanismTypes: Array.isArray(phenomenon.possibleMechanismTypes)
      ? phenomenon.possibleMechanismTypes
      : [],
  };
}

function buildEntityRelationshipEdges(
  entityNodes: OrganizationReasoningNode[]
): OrganizationReasoningEdge[] {
  const entityIds = new Set(entityNodes.map((node) => node.id));
  const edges: OrganizationReasoningEdge[] = [];

  for (const node of entityNodes) {
    for (const relatedEntityId of node.relatedEntityIds) {
      if (!entityIds.has(relatedEntityId)) continue;

      edges.push({
        id: `edge:${node.id}:related:${relatedEntityId}`,
        kind: "entity_related_to_entity",
        sourceId: node.id,
        targetId: relatedEntityId,
        label: "related to",
        confidence: node.confidence,
      });
    }
  }

  return edges;
}

function buildEntityPhenomenonEdges(params: {
  entityNodes: OrganizationReasoningNode[];
  phenomenonNodes: OrganizationReasoningNode[];
}): OrganizationReasoningEdge[] {
  const { entityNodes, phenomenonNodes } = params;
  const entityIds = new Set(entityNodes.map((node) => node.id));
  const edges: OrganizationReasoningEdge[] = [];

  for (const phenomenon of phenomenonNodes) {
    for (const relatedEntityId of phenomenon.relatedEntityIds) {
      if (!entityIds.has(relatedEntityId)) continue;

      edges.push({
        id: `edge:${relatedEntityId}:participates:${phenomenon.id}`,
        kind: "entity_participates_in_phenomenon",
        sourceId: relatedEntityId,
        targetId: phenomenon.id,
        label: "participates in",
        confidence: phenomenon.confidence,
      });
    }
  }

  return edges;
}

function buildPhenomenonRelationshipEdges(
  phenomenonNodes: OrganizationReasoningNode[]
): OrganizationReasoningEdge[] {
  const edges: OrganizationReasoningEdge[] = [];

  for (let i = 0; i < phenomenonNodes.length; i += 1) {
    for (let j = i + 1; j < phenomenonNodes.length; j += 1) {
      const source = phenomenonNodes[i];
      const target = phenomenonNodes[j];

      const sourceMechanisms = new Set(source.possibleMechanismTypes ?? []);
      const hasSharedMechanism = (target.possibleMechanismTypes ?? []).some(
        (mechanismType) => sourceMechanisms.has(mechanismType)
      );

      if (!hasSharedMechanism) continue;

      edges.push({
        id: `edge:${source.id}:related:${target.id}`,
        kind: "phenomenon_related_to_phenomenon",
        sourceId: source.id,
        targetId: target.id,
        label: "related phenomenon",
        confidence: Math.min(source.confidence, target.confidence),
      });
    }
  }

  return edges;
}

export function buildOrganizationReasoningGraph(
  organizationModel: any
): OrganizationReasoningGraph {
  const now = new Date().toISOString();

  const entities = Array.isArray(organizationModel?.entities)
    ? organizationModel.entities
    : [];

  const entityNodes = entities
    .filter(isReasoningWorthyEntity)
    .map(buildEntityNode);

  const phenomenonNodes = getPhenomena(organizationModel).map(buildPhenomenonNode);

  const nodes = [...entityNodes, ...phenomenonNodes];

  const edges = [
    ...buildEntityRelationshipEdges(entityNodes),
    ...buildEntityPhenomenonEdges({
      entityNodes,
      phenomenonNodes,
    }),
    ...buildPhenomenonRelationshipEdges(phenomenonNodes),
  ];

  return {
    organizationId: organizationModel?.organizationId ?? "unknown",
    generatedAt: now,
    nodes,
    edges,
  };
}