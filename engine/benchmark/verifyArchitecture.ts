import fs from "node:fs";
import path from "node:path";

import { runArchitectureChecks } from "./architecture";

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
  resolvedFiles?: Array<{
    path: string;
    exports?: string[];
  }>;
};

type CognitiveDomain = {
  code: string;
  name: string;
};

type CapabilityRegistry = {
  capabilities?: RegistryCapability[];
  domains?: CognitiveDomain[];
};

const PROJECT_ROOT = process.cwd();

const CAPABILITY_REGISTRY_PATH =
  "docs/Architecture/COGNITIVE_CAPABILITY_REGISTRY.json";

function printDivider(character = "=", width = 57): void {
  console.log(character.repeat(width));
}

function resolveProjectPath(relativePath: string): string {
  return path.resolve(PROJECT_ROOT, relativePath);
}

function loadCapabilityRegistry(): {
  capabilities: RegistryCapability[];
  domains: CognitiveDomain[];
} {
  const registryPath = resolveProjectPath(
    CAPABILITY_REGISTRY_PATH,
  );

  if (!fs.existsSync(registryPath)) {
    throw new Error(
      `Capability registry not found: ${CAPABILITY_REGISTRY_PATH}`,
    );
  }

  const registry = JSON.parse(
    fs.readFileSync(registryPath, "utf8"),
  ) as CapabilityRegistry;

  if (!Array.isArray(registry.capabilities)) {
    throw new Error(
      "Capability registry does not contain a capabilities array.",
    );
  }

  if (!Array.isArray(registry.domains)) {
    throw new Error(
      "Capability registry does not contain a domains array.",
    );
  }

  return {
    capabilities: registry.capabilities,
    domains: registry.domains,
  };
}

function printArchitectureReport(): void {
  const registry = loadCapabilityRegistry();

  const capabilities = registry.capabilities;
  const domains = registry.domains;

  const report = runArchitectureChecks(
    capabilities,
    domains,
  );

  printDivider();
  console.log("DISCOVERY ARCHITECTURE VERIFICATION");
  printDivider();
  console.log("");

  for (const capability of capabilities) {
    console.log(`${capability.id} — ${capability.name}`);
    printDivider("-", 57);

    const checks = report.checks.filter(
      (check) => check.capabilityId === capability.id,
    );

    for (const check of checks) {
      console.log(
        `${check.status === "pass" ? "✓" : "✗"} ${check.message}`,
      );

      if (check.detail) {
        console.log(`  ${check.detail}`);
      }
    }

    console.log("");
  }

  printDivider();
  console.log("ARCHITECTURE INTEGRITY");
  printDivider();
  console.log("");

  console.log(
    `Registered Capabilities ....... ${capabilities.length}`,
  );
  console.log(
    `Passed Architecture Checks .... ${report.passedChecks}`,
  );
  console.log(
    `Failed Architecture Checks .... ${report.failedChecks}`,
  );
  console.log(
    `Total Architecture Checks ..... ${report.checks.length}`,
  );
  console.log(
    `Integrity Score ............... ${report.integrityScore}%`,
  );

  console.log("");

  if (report.failedChecks > 0) {
    console.log("Architecture Verification ..... FAIL");
    printDivider();
    process.exitCode = 1;
    return;
  }

  console.log("Architecture Verification ..... PASS");
  printDivider();
}

printArchitectureReport();