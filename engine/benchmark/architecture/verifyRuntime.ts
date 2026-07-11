import type { ArchitectureCheck } from "./types";

type RuntimeCapability = {
  id: string;
  name: string;
  runtimeDestination?: string;
};

export function verifyRuntimeDestination(
  capability: RuntimeCapability,
): ArchitectureCheck {
  const runtimeDestination =
    capability.runtimeDestination?.trim() ?? "";

  if (runtimeDestination.length === 0) {
    return {
      capabilityId: capability.id,
      capabilityName: capability.name,
      category: "runtime",
      status: "fail",
      message: "Runtime destination is missing.",
    };
  }

  return {
    capabilityId: capability.id,
    capabilityName: capability.name,
    category: "runtime",
    status: "pass",
    message: `Runtime destination declared: ${runtimeDestination}`,
  };
}