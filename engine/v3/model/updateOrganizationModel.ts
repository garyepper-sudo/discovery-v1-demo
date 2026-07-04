import type {
  OrganizationModel,
  OrganizationModelEdge,
  OrganizationModelNode,
} from "./organizationModel";

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function upsertOrganizationModelNode(
  model: OrganizationModel,
  node: OrganizationModelNode
): OrganizationModel {
  const now = new Date().toISOString();

  const existingIndex = model.nodes.findIndex((item) => item.id === node.id);

  const nextNodes =
    existingIndex >= 0
      ? model.nodes.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                ...node,
                confidence: clampConfidence(node.confidence),
                updatedAt: now,
              }
            : item
        )
      : [
          ...model.nodes,
          {
            ...node,
            confidence: clampConfidence(node.confidence),
            createdAt: node.createdAt || now,
            updatedAt: now,
          },
        ];

  return {
    ...model,
    version: model.version + 1,
    updatedAt: now,
    nodes: nextNodes,
  };
}

export function upsertOrganizationModelEdge(
  model: OrganizationModel,
  edge: OrganizationModelEdge
): OrganizationModel {
  const now = new Date().toISOString();

  const existingIndex = model.edges.findIndex((item) => item.id === edge.id);

  const nextEdges =
    existingIndex >= 0
      ? model.edges.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                ...edge,
                strength: clampConfidence(edge.strength),
                updatedAt: now,
              }
            : item
        )
      : [
          ...model.edges,
          {
            ...edge,
            strength: clampConfidence(edge.strength),
            createdAt: edge.createdAt || now,
            updatedAt: now,
          },
        ];

  return {
    ...model,
    version: model.version + 1,
    updatedAt: now,
    edges: nextEdges,
  };
}

export function snapshotOrganizationModel(params: {
  model: OrganizationModel;
  reason: string;
}): OrganizationModel {
  const now = new Date().toISOString();

  return {
    ...params.model,
    version: params.model.version + 1,
    updatedAt: now,
    snapshots: [
      ...params.model.snapshots,
      {
        id: `snapshot-${params.model.version + 1}-${now}`,
        createdAt: now,
        reason: params.reason,
        nodeCount: params.model.nodes.length,
        edgeCount: params.model.edges.length,
      },
    ],
  };
}