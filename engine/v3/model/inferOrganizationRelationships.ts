import type {
  OrganizationModel,
  OrganizationModelEdge,
} from "./organizationModel";

export function inferOrganizationRelationships(
  model: OrganizationModel
): OrganizationModel {
  const now = new Date().toISOString();

  const edges: OrganizationModelEdge[] = [];

  const observations = model.nodes.filter(
    (node) => node.type === "observation"
  );

  const beliefs = model.nodes.filter(
    (node) => node.type === "belief"
  );

  //
  // Every belief must ultimately come from observations.
  //
  for (const belief of beliefs) {
    for (const observation of observations) {
      edges.push({
        id: `${observation.id}->${belief.id}`,
        from: observation.id,
        to: belief.id,
        type: "supports",
        strength: Math.min(
          observation.confidence,
          belief.confidence
        ),
        explanation:
          "Belief derived from organizational observations.",
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return {
    ...model,
    updatedAt: now,
    edges,
  };
}