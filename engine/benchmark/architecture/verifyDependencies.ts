import type { ArchitectureCheck } from "./types";

type DependencyCapability = {
  id: string;
  name: string;
  consumesCapabilities?: unknown;
  consumedByCapabilities?: unknown;
};

function normalizeCapabilityIds(value: unknown): {
  ids: string[];
  valid: boolean;
} {
  if (!Array.isArray(value)) {
    return {
      ids: [],
      valid: false,
    };
  }

  const ids = value.map((item) =>
    typeof item === "string" ? item.trim() : "",
  );

  const valid =
    ids.every((id) => id.length > 0) &&
    new Set(ids).size === ids.length;

  return {
    ids,
    valid,
  };
}

export function verifyDependencies(
  capability: DependencyCapability,
  capabilitiesById: Map<string, DependencyCapability>,
): ArchitectureCheck[] {
  const consumes = normalizeCapabilityIds(
    capability.consumesCapabilities,
  );

  const consumedBy = normalizeCapabilityIds(
    capability.consumedByCapabilities,
  );

  const referenceFailures: string[] = [];
  const reciprocityFailures: string[] = [];

  if (!consumes.valid) {
    referenceFailures.push(
      "consumesCapabilities must be a unique array of non-empty strings",
    );
  }

  if (!consumedBy.valid) {
    referenceFailures.push(
      "consumedByCapabilities must be a unique array of non-empty strings",
    );
  }

  for (const dependencyId of consumes.ids) {
    if (dependencyId === capability.id) {
      referenceFailures.push(
        "capability cannot consume itself",
      );
      continue;
    }

    const dependency = capabilitiesById.get(dependencyId);

    if (!dependency) {
      referenceFailures.push(
        `unknown consumed capability: ${dependencyId}`,
      );
      continue;
    }

    const reciprocalConsumers = normalizeCapabilityIds(
      dependency.consumedByCapabilities,
    ).ids;

    if (!reciprocalConsumers.includes(capability.id)) {
      reciprocityFailures.push(
        `${dependencyId} is missing consumedBy link to ${capability.id}`,
      );
    }
  }

  for (const consumerId of consumedBy.ids) {
    if (consumerId === capability.id) {
      referenceFailures.push(
        "capability cannot be consumed by itself",
      );
      continue;
    }

    const consumer = capabilitiesById.get(consumerId);

    if (!consumer) {
      referenceFailures.push(
        `unknown consuming capability: ${consumerId}`,
      );
      continue;
    }

    const reciprocalDependencies = normalizeCapabilityIds(
      consumer.consumesCapabilities,
    ).ids;

    if (!reciprocalDependencies.includes(capability.id)) {
      reciprocityFailures.push(
        `${consumerId} is missing consumes link to ${capability.id}`,
      );
    }
  }

  const referenceCheck: ArchitectureCheck = {
    capabilityId: capability.id,
    capabilityName: capability.name,
    category: "dependency",
    status:
      referenceFailures.length === 0 ? "pass" : "fail",
    message:
      referenceFailures.length === 0
        ? "Dependency references verified."
        : "Dependency references are invalid.",
    detail:
      referenceFailures.length > 0
        ? referenceFailures.join("; ")
        : undefined,
  };

  const reciprocityCheck: ArchitectureCheck = {
    capabilityId: capability.id,
    capabilityName: capability.name,
    category: "dependency",
    status:
      reciprocityFailures.length === 0 ? "pass" : "fail",
    message:
      reciprocityFailures.length === 0
        ? "Dependency reciprocity verified."
        : "Dependency reciprocity is invalid.",
    detail:
      reciprocityFailures.length > 0
        ? reciprocityFailures.join("; ")
        : undefined,
  };

  return [referenceCheck, reciprocityCheck];
}