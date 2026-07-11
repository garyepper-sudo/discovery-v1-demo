import {
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();

const REGISTRY_PATH = resolve(
  ROOT,
  "docs/Architecture/COGNITIVE_CAPABILITY_REGISTRY.json",
);

const REPORT_PATH = resolve(
  ROOT,
  "docs/Architecture/COGNITIVE_CAPABILITY_AUDIT.json",
);

function loadJson(path, label) {
  if (!existsSync(path)) {
    throw new Error(`${label} not found: ${path}`);
  }

  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(
      `Could not parse ${label}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function unique(values) {
  return [...new Set(values)].sort();
}

function main() {
  const registry = loadJson(
    REGISTRY_PATH,
    "Capability registry",
  );

  const capabilities = Array.isArray(registry.capabilities)
    ? registry.capabilities
    : [];

  const capabilityById = new Map(
    capabilities.map((capability) => [
      capability.id,
      capability,
    ]),
  );

  const consumersByCapabilityId = new Map();

  for (const capability of capabilities) {
    for (const dependencyId of capability.consumesCapabilities ?? []) {
      const currentConsumers =
        consumersByCapabilityId.get(dependencyId) ?? [];

      currentConsumers.push(capability.id);

      consumersByCapabilityId.set(
        dependencyId,
        currentConsumers,
      );
    }
  }

  const enrichedCapabilities = capabilities.map(
    (capability) => ({
      ...capability,

      consumedByCapabilities: unique([
        ...(capability.consumedByCapabilities ?? []),
        ...(consumersByCapabilityId.get(capability.id) ?? []),
      ]),
    }),
  );

  const duplicateIds = [];

  const idCounts = new Map();

  for (const capability of enrichedCapabilities) {
    idCounts.set(
      capability.id,
      (idCounts.get(capability.id) ?? 0) + 1,
    );
  }

  for (const [id, count] of idCounts.entries()) {
    if (count > 1) {
      duplicateIds.push({
        id,
        count,
      });
    }
  }

  const missingDependencies = [];

  for (const capability of enrichedCapabilities) {
    for (const dependencyId of capability.consumesCapabilities ?? []) {
      if (!capabilityById.has(dependencyId)) {
        missingDependencies.push({
          capabilityId: capability.id,
          missingDependencyId: dependencyId,
        });
      }
    }
  }

  const missingCanonicalProducers =
    enrichedCapabilities
      .filter(
        (capability) =>
          capability.canonicalProducer &&
          capability.canonicalProducerExists === false,
      )
      .map((capability) => ({
        capabilityId: capability.id,
        canonicalProducer: capability.canonicalProducer,
      }));

  const capabilitiesWithoutProducer =
    enrichedCapabilities
      .filter(
        (capability) =>
          capability.canonicalProducer === null,
      )
      .map((capability) => capability.id);

  const capabilitiesWithoutConsumers =
    enrichedCapabilities
      .filter(
        (capability) =>
          (capability.consumedByCapabilities ?? []).length === 0 &&
          (capability.executiveDestinations ?? []).length === 0,
      )
      .map((capability) => capability.id);

  const capabilitiesWithoutRuntimeDestination =
    enrichedCapabilities
      .filter(
        (capability) =>
          capability.runtimeDestination === null,
      )
      .map((capability) => capability.id);

  const implementationFileUsage = new Map();

  for (const capability of enrichedCapabilities) {
    for (const file of capability.implementationFiles ?? []) {
      const usages = implementationFileUsage.get(file) ?? [];

      usages.push(capability.id);

      implementationFileUsage.set(file, usages);
    }
  }

  const filesImplementingMultipleCapabilities =
    [...implementationFileUsage.entries()]
      .filter(([, capabilityIds]) => capabilityIds.length > 1)
      .map(([path, capabilityIds]) => ({
        path,
        capabilityIds: unique(capabilityIds),
      }));

  const audit = {
    generatedAt: new Date().toISOString(),

    capabilityCount: enrichedCapabilities.length,

    health: {
      duplicateIdCount: duplicateIds.length,
      missingDependencyCount: missingDependencies.length,
      missingCanonicalProducerCount:
        missingCanonicalProducers.length,
      capabilitiesWithoutProducerCount:
        capabilitiesWithoutProducer.length,
      capabilitiesWithoutConsumersCount:
        capabilitiesWithoutConsumers.length,
      capabilitiesWithoutRuntimeDestinationCount:
        capabilitiesWithoutRuntimeDestination.length,
      multiCapabilityFileCount:
        filesImplementingMultipleCapabilities.length,
    },

    duplicateIds,

    missingDependencies,

    missingCanonicalProducers,

    capabilitiesWithoutProducer,

    capabilitiesWithoutConsumers,

    capabilitiesWithoutRuntimeDestination,

    filesImplementingMultipleCapabilities,
  };

  writeFileSync(
    REGISTRY_PATH,
    `${JSON.stringify(
      {
        ...registry,
        generatedAt: new Date().toISOString(),
        capabilities: enrichedCapabilities,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  writeFileSync(
    REPORT_PATH,
    `${JSON.stringify(audit, null, 2)}\n`,
    "utf8",
  );

  console.log("");
  console.log("Capability registry validated.");
  console.log(`Capabilities: ${audit.capabilityCount}`);
  console.log(`Duplicate IDs: ${audit.health.duplicateIdCount}`);
  console.log(
    `Missing dependencies: ${audit.health.missingDependencyCount}`,
  );
  console.log(
    `Missing canonical producers: ${audit.health.missingCanonicalProducerCount}`,
  );
  console.log(
    `Capabilities without producer: ${audit.health.capabilitiesWithoutProducerCount}`,
  );
  console.log(
    `Capabilities without consumers: ${audit.health.capabilitiesWithoutConsumersCount}`,
  );
  console.log(
    `Capabilities without Runtime destination: ${audit.health.capabilitiesWithoutRuntimeDestinationCount}`,
  );
  console.log(
    `Files implementing multiple capabilities: ${audit.health.multiCapabilityFileCount}`,
  );
  console.log("");
  console.log(
    "Output: docs/Architecture/COGNITIVE_CAPABILITY_AUDIT.json",
  );
  console.log("");
}

main();