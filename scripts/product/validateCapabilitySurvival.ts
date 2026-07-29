import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";

import {
  CAPABILITY_SURVIVAL_CLASSIFICATIONS,
  CAPABILITY_SURVIVAL_CONTRACTS,
  EVIDENCE_BASIS_SURVIVAL_CONTRACT,
  classifyCapabilitySurvival,
  type CapabilityBoundaryObservation,
} from "./capabilitySurvivalManifest";

const EXPECTED_CAPABILITY_IDS = [
  "CAP-COM-001",
  "CAP-LRN-001",
  "CAP-LRN-002",
  "CAP-MEM-001",
  "CAP-SELF-001",
  "CAP-SELF-002",
  "CAP-UND-006",
];

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
  scripts?: Record<string, string>;
};
const capabilityRegistry = JSON.parse(
  fs.readFileSync(
    "docs/Architecture/COGNITIVE_CAPABILITY_REGISTRY.json",
    "utf8",
  ),
) as unknown;

function collectRegistryIds(value: unknown, ids = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectRegistryIds(item, ids);
  } else if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.id === "string") ids.add(record.id);
    for (const item of Object.values(record)) collectRegistryIds(item, ids);
  }
  return ids;
}

const capabilityIds = CAPABILITY_SURVIVAL_CONTRACTS
  .map((contract) => contract.capabilityId)
  .sort();
assert.deepEqual(capabilityIds, EXPECTED_CAPABILITY_IDS);
assert.equal(new Set(capabilityIds).size, capabilityIds.length);
const registryIds = collectRegistryIds(capabilityRegistry);
for (const capabilityId of capabilityIds) {
  assert.ok(
    registryIds.has(capabilityId),
    `Capability Survival references an unknown registry ID: ${capabilityId}`,
  );
}

for (const contract of CAPABILITY_SURVIVAL_CONTRACTS) {
  assert.ok(contract.requiredBoundaries.length > 0);
  assert.ok(contract.requiredSemantics.length > 0);
  assert.ok(contract.permittedTransformations.length > 0);
  assert.ok(contract.prohibitedTransformations.length > 0);
  assert.ok(contract.validations.length > 0);
}

const observations: Record<
  (typeof CAPABILITY_SURVIVAL_CLASSIFICATIONS)[number],
  CapabilityBoundaryObservation
> = {
  "source-absent": {
    sourcePresent: false,
    authorized: false,
    downstreamRequired: false,
    downstreamPresent: false,
    unavailableStateTruthful: true,
    recomputedByNonAuthoritativeLayer: false,
    meaningPreserved: true,
  },
  "not-authorized": {
    sourcePresent: true,
    authorized: false,
    downstreamRequired: false,
    downstreamPresent: false,
    unavailableStateTruthful: true,
    recomputedByNonAuthoritativeLayer: false,
    meaningPreserved: true,
  },
  "intentionally-unavailable": {
    sourcePresent: true,
    authorized: true,
    downstreamRequired: false,
    downstreamPresent: false,
    unavailableStateTruthful: true,
    recomputedByNonAuthoritativeLayer: false,
    meaningPreserved: true,
  },
  "silently-lost": {
    sourcePresent: true,
    authorized: true,
    downstreamRequired: true,
    downstreamPresent: false,
    unavailableStateTruthful: true,
    recomputedByNonAuthoritativeLayer: false,
    meaningPreserved: false,
  },
  "misleading-fallback": {
    sourcePresent: true,
    authorized: true,
    downstreamRequired: true,
    downstreamPresent: false,
    unavailableStateTruthful: false,
    recomputedByNonAuthoritativeLayer: false,
    meaningPreserved: false,
  },
  "non-authoritative-recomputation": {
    sourcePresent: true,
    authorized: true,
    downstreamRequired: true,
    downstreamPresent: true,
    unavailableStateTruthful: true,
    recomputedByNonAuthoritativeLayer: true,
    meaningPreserved: false,
  },
  "healthy-intentional-compression": {
    sourcePresent: true,
    authorized: true,
    downstreamRequired: true,
    downstreamPresent: true,
    unavailableStateTruthful: true,
    recomputedByNonAuthoritativeLayer: false,
    meaningPreserved: true,
  },
};

for (const classification of CAPABILITY_SURVIVAL_CLASSIFICATIONS) {
  assert.equal(
    classifyCapabilitySurvival(observations[classification]),
    classification,
  );
}

const validationCommands = [...new Set([
  ...CAPABILITY_SURVIVAL_CONTRACTS.flatMap((contract) => contract.validations),
  ...EVIDENCE_BASIS_SURVIVAL_CONTRACT.validations,
])].sort();

const results = validationCommands.map((command) => {
  const script = packageJson.scripts?.[command];
  if (!script) {
    throw new Error(
      `Capability Survival configuration failure: validation command is not registered: ${command}`,
    );
  }
  const owners = CAPABILITY_SURVIVAL_CONTRACTS
    .filter((contract) => contract.validations.includes(command))
    .map((contract) => ({
      capabilityId: contract.capabilityId,
      requiredSemantics: contract.requiredSemantics,
    }));
  assert.ok(owners.length > 0);
  const semanticContext = owners
    .map((owner) =>
      `${owner.capabilityId}: ${owner.requiredSemantics.join("; ")}`,
    )
    .join("\n");
  const result = spawnSync("npm", ["run", command], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
    stdio: "pipe",
  });
  if (result.error || result.status === null) {
    throw new Error(
      [
        `Capability Survival infrastructure failure while executing ${command}.`,
        "This is not a semantic capability-loss diagnosis.",
        result.error?.message ?? result.signal ?? "No process status was returned.",
      ].join("\n"),
    );
  }
  if (result.status !== 0) {
    throw new Error([
      `Protected capability validation failed: ${command}`,
      semanticContext,
      result.stdout,
      result.stderr,
    ].join("\n"));
  }
  return { command, result: "PASS" as const };
});

console.log(JSON.stringify({
  validation: "capability-survival",
  result: "PASS",
  protectedCapabilityIds: capabilityIds,
  evidenceBasisProtected: true,
  classifications: [...CAPABILITY_SURVIVAL_CLASSIFICATIONS],
  boundaryValidations: results,
  productBehaviorChanged: false,
  runtimeMutated: false,
}, null, 2));
