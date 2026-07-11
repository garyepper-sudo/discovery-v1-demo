import type { ArchitectureCheck } from "./types";

type CognitiveDomain = {
  code?: string;
  name?: string;
};

type OperatingSystemCapability = {
  id: string;
  name: string;
  domain?: string;
  subsystem?: string;
};

export function verifyOperatingSystemOwnership(
  capability: OperatingSystemCapability,
  domainsByCode: Map<string, CognitiveDomain>,
): ArchitectureCheck[] {
  const domainCode = capability.domain?.trim() ?? "";
  const subsystem = capability.subsystem?.trim() ?? "";

  const domain = domainsByCode.get(domainCode);

  const operatingSystemCheck: ArchitectureCheck = {
    capabilityId: capability.id,
    capabilityName: capability.name,
    category: "operating-system",
    status:
      domainCode.length > 0 &&
      Boolean(domain?.name?.trim())
        ? "pass"
        : "fail",
    message:
      domainCode.length > 0 &&
      Boolean(domain?.name?.trim())
        ? `Operating System verified: ${domain?.name} OS`
        : "Operating System ownership is missing or invalid.",
    detail:
      domainCode.length > 0 && !domain
        ? `Unknown domain code: ${domainCode}`
        : undefined,
  };

  const subsystemCheck: ArchitectureCheck = {
    capabilityId: capability.id,
    capabilityName: capability.name,
    category: "operating-system",
    status: subsystem.length > 0 ? "pass" : "fail",
    message:
      subsystem.length > 0
        ? `Subsystem ownership verified: ${subsystem}`
        : "Subsystem ownership is missing.",
  };

  return [operatingSystemCheck, subsystemCheck];
}