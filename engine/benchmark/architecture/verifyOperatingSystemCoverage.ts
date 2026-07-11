import type { ArchitectureCheck } from "./types";

type CognitiveDomain = {
  code: string;
  name: string;
};

type CoverageCapability = {
  id: string;
  name: string;
  domain?: string;
  subsystem?: string;
  runtimeDestination?: string;
  executiveDestinations?: unknown;
  atlasCoverage?: unknown;
  benchmarkCoverage?: unknown;
};

export function verifyOperatingSystemCoverage(
  domain: CognitiveDomain,
  capabilities: CoverageCapability[],
): ArchitectureCheck[] {
  const domainCapabilities = capabilities.filter(
    (capability) => capability.domain === domain.code,
  );

  if (domainCapabilities.length === 0) {
    return [];
  }

  const hasSubsystemCoverage = domainCapabilities.every(
    (capability) =>
      typeof capability.subsystem === "string" &&
      capability.subsystem.trim().length > 0,
  );

  const hasRuntimeCoverage = domainCapabilities.every(
    (capability) =>
      typeof capability.runtimeDestination === "string" &&
      capability.runtimeDestination.trim().length > 0,
  );

  const hasAtlasCoverage = domainCapabilities.some(
    (capability) =>
      capability.atlasCoverage === "yes" ||
      capability.atlasCoverage === "partial",
  );

  const hasBenchmarkCoverage = domainCapabilities.some(
    (capability) =>
      Array.isArray(capability.benchmarkCoverage) &&
      capability.benchmarkCoverage.length > 0,
  );

  //
  // Perception and Memory are foundational systems.
  // They are not expected to expose executive objects directly.
  //

  const executiveCoverageRequired =
    domain.code !== "PER" &&
    domain.code !== "MEM";

  const hasExecutiveCoverage =
    !executiveCoverageRequired ||
    domainCapabilities.some(
      (capability) =>
        Array.isArray(capability.executiveDestinations) &&
        capability.executiveDestinations.length > 0,
    );

  return [
    {
      capabilityId: `OS-${domain.code}`,
      capabilityName: `${domain.name} OS`,
      category: "operating-system",
      status: "pass",
      message: `Operating System registered with ${domainCapabilities.length} capability or capabilities.`,
    },
    {
      capabilityId: `OS-${domain.code}`,
      capabilityName: `${domain.name} OS`,
      category: "operating-system",
      status: hasSubsystemCoverage ? "pass" : "fail",
      message: hasSubsystemCoverage
        ? "All capabilities have subsystem ownership."
        : "One or more capabilities are missing subsystem ownership.",
    },
    {
      capabilityId: `OS-${domain.code}`,
      capabilityName: `${domain.name} OS`,
      category: "operating-system",
      status: hasRuntimeCoverage ? "pass" : "fail",
      message: hasRuntimeCoverage
        ? "All capabilities have runtime destinations."
        : "One or more capabilities are missing runtime destinations.",
    },
    {
      capabilityId: `OS-${domain.code}`,
      capabilityName: `${domain.name} OS`,
      category: "atlas",
      status: hasAtlasCoverage ? "pass" : "fail",
      message: hasAtlasCoverage
        ? "Atlas coverage is present."
        : "Atlas coverage is missing.",
    },
    {
      capabilityId: `OS-${domain.code}`,
      capabilityName: `${domain.name} OS`,
      category: "benchmark",
      status: hasBenchmarkCoverage ? "pass" : "fail",
      message: hasBenchmarkCoverage
        ? "Benchmark coverage is present."
        : "Benchmark coverage is missing.",
    },
    {
      capabilityId: `OS-${domain.code}`,
      capabilityName: `${domain.name} OS`,
      category: "executive",
      status: hasExecutiveCoverage ? "pass" : "fail",
      message: !executiveCoverageRequired
        ? "Direct executive destination coverage is not required for this foundational Operating System."
        : hasExecutiveCoverage
          ? "Executive destination coverage is present."
          : "Executive destination coverage is missing.",
    },
  ];
}