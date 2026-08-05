import type { OrganizationRuntime } from "../runtime/organizationRuntime";
import { upsertOrganizationModelNode } from "./updateOrganizationModel";
import type { OrganizationModel } from "./organizationModel";

export function synchronizeOrganizationModel(
  runtime: OrganizationRuntime,
  now = new Date().toISOString(),
): OrganizationModel {
  let model = runtime.organizationModel;

  //
  // Observations
  //
  for (const observation of runtime.memory.observations) {
    model = upsertOrganizationModelNode(model, {
      id: `observation:${observation.id}`,
      type: "observation",
      label: observation.statement ?? observation.id,
      summary: observation.statement ?? observation.normalizedStatement ?? "",
      confidence: observation.confidence ?? 0.5,
      createdAt: observation.firstSeenAt ?? now,
      updatedAt: observation.lastSeenAt ?? now,
    }, now);
  }

  //
  // Beliefs
  //
  for (const belief of runtime.memory.beliefs) {
    model = upsertOrganizationModelNode(model, {
      id: `belief:${belief.id}`,
      type: "belief",
      label: belief.statement,
      summary: belief.statement,
      confidence: belief.confidence ?? 0.5,
      createdAt: now,
      updatedAt: now,
    }, now);
  }

  return model;
}
