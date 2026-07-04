import type { OrganizationRuntime } from "../runtime/organizationRuntime";
import {
  upsertOrganizationModelNode,
} from "./updateOrganizationModel";
import type { OrganizationModel } from "./organizationModel";

export function synchronizeOrganizationModel(
  runtime: OrganizationRuntime
): OrganizationModel {
  let model = runtime.organizationModel;

  const now = new Date().toISOString();

  //
  // Observations
  //
  for (const observation of runtime.memory.observations) {
    model = upsertOrganizationModelNode(model, {
      id: `observation:${observation.id}`,
      type: "observation",
      label: observation.title ?? observation.id,
      summary: observation.summary ?? "",
      confidence: observation.confidence ?? 0.5,
      createdAt: now,
      updatedAt: now,
    });
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
    });
  }

  return model;
}