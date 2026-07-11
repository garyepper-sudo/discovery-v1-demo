import type { ArchitectureCheck } from "./types";

type ExecutiveCapability = {
  id: string;
  name: string;
  executiveDestinations?: unknown;
};

export function verifyExecutiveDestinations(
  capability: ExecutiveCapability,
): ArchitectureCheck {
  const value = capability.executiveDestinations;

  if (!Array.isArray(value)) {
    return {
      capabilityId: capability.id,
      capabilityName: capability.name,
      category: "executive",
      status: "fail",
      message: "Executive destinations must be declared as an array.",
    };
  }

  const destinations = value.map((destination) =>
    typeof destination === "string"
      ? destination.trim()
      : "",
  );

  const hasInvalidEntry = destinations.some(
    (destination) => destination.length === 0,
  );

  if (hasInvalidEntry) {
    return {
      capabilityId: capability.id,
      capabilityName: capability.name,
      category: "executive",
      status: "fail",
      message:
        "Executive destinations must contain only non-empty strings.",
    };
  }

  const hasDuplicates =
    new Set(destinations).size !== destinations.length;

  if (hasDuplicates) {
    return {
      capabilityId: capability.id,
      capabilityName: capability.name,
      category: "executive",
      status: "fail",
      message: "Executive destinations contain duplicate entries.",
    };
  }

  return {
    capabilityId: capability.id,
    capabilityName: capability.name,
    category: "executive",
    status: "pass",
    message:
      destinations.length > 0
        ? `Executive destinations declared: ${destinations.join(", ")}`
        : "Executive destinations declared: none",
  };
}