import type {
  ArchitectureCheck,
  ArchitectureVerificationReport,
} from "./types";

import { verifyDependencies } from "./verifyDependencies";
import { verifyExecutiveDestinations } from "./verifyExecutive";
import { verifyOperatingSystemCoverage } from "./verifyOperatingSystemCoverage";
import { verifyOperatingSystemOwnership } from "./verifyOperatingSystems";
import { verifyProducer } from "./verifyProducers";
import { verifyRuntimeDestination } from "./verifyRuntime";

type RegistryCapability = {
  id: string;
  name: string;
  canonicalProducer: string;
  domain?: string;
  subsystem?: string;
  runtimeDestination?: string;
  executiveDestinations?: unknown;
  consumesCapabilities?: unknown;
  consumedByCapabilities?: unknown;
  atlasCoverage?: unknown;
  benchmarkCoverage?: unknown;
  resolvedFiles?: Array<{
    path: string;
    exports?: string[];
  }>;
};

export type CognitiveDomain = {
  code: string;
  name: string;
};

export function runArchitectureChecks(
  capabilities: RegistryCapability[],
  domains: CognitiveDomain[],
): ArchitectureVerificationReport {
  const checks: ArchitectureCheck[] = [];

  const capabilitiesById = new Map(
    capabilities.map((capability) => [
      capability.id,
      capability,
    ]),
  );

  const domainsByCode = new Map(
    domains.map((domain) => [
      domain.code,
      domain,
    ]),
  );

  for (const capability of capabilities) {
    checks.push(
      verifyProducer(capability),
    );

    checks.push(
      verifyRuntimeDestination(capability),
    );

    checks.push(
      verifyExecutiveDestinations(capability),
    );

    checks.push(
      ...verifyDependencies(
        capability,
        capabilitiesById,
      ),
    );

    checks.push(
      ...verifyOperatingSystemOwnership(
        capability,
        domainsByCode,
      ),
    );
  }

  for (const domain of domains) {
    checks.push(
      ...verifyOperatingSystemCoverage(
        domain,
        capabilities,
      ),
    );
  }

  const passedChecks = checks.filter(
    (check) => check.status === "pass",
  ).length;

  const failedChecks =
    checks.length - passedChecks;

  const integrityScore =
    checks.length === 0
      ? 0
      : Math.round(
          (passedChecks / checks.length) * 100,
        );

  return {
    generatedAt: new Date().toISOString(),
    checks,
    passedChecks,
    failedChecks,
    integrityScore,
  };
}