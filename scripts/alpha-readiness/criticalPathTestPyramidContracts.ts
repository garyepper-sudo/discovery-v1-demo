import assert from "node:assert/strict";
import { createHash } from "node:crypto";

export const AR2_CONTRACT_ID = "AR-2-CRITICAL-PATH-TEST-PYRAMID-FREEZE-001" as const;
export const AR2_CONTRACT_VERSION = "1" as const;
export const AR2_INVENTORY_DIGEST = "40bfc9de7e27db5107b2bf275c59784e8aac66bd58b2076e958509ca69fd84fb" as const;
export const AR2_EXECUTION_PARENT = "4d3c82dea0bdec56e23d0601149ba1008676e2bd" as const;
export const AR2_GOVERNANCE_COMMIT = "933cf79e68a16b790d1eec95f9da75a39edd1a5e" as const;

export type Ar2Disposition = "PASS" | "FAIL" | "BLOCKED";
export type Ar2LayerId = "L0" | "L1" | "L2" | "L3" | "L4" | "L5";
export type Ar2AdmissionCategory = "A" | "B" | "C" | "D";

export type Ar2Inventory = Readonly<{
  schemaVersion: "1";
  kind: "ar2-critical-path-test-pyramid-governance-inventory";
  identity: string;
  canonicalParent: string;
  layers: readonly Readonly<{ id: Ar2LayerId; name: string; meaning: string }>[];
  criticalPaths: readonly Readonly<{
    id: string;
    semantic: string;
    layers: readonly Ar2LayerId[];
    commands: readonly string[];
    negativeControls: readonly string[];
    semanticOwner: Readonly<{ path: string; symbol: string }>;
    lowerLayerProof: Readonly<{ layer: Ar2LayerId; commandId: string; admissionCategory: Ar2AdmissionCategory; ownerProof?: string }>;
    higherLayerProofs: readonly Readonly<{ layer: Ar2LayerId; commandId: string }>[];
    evidenceOwner: Readonly<{ path: string; symbol: string }>;
    sourceEvidenceOwner: Readonly<{ path: string; symbol: string }>;
    externalResourceCategory: string;
    cleanupRequirement: string;
    deterministicRepeat: string;
    currentStatus: string;
  }>[];
  commands: readonly Readonly<{
    id: string;
    lane: "fast" | "recovery" | "authenticated" | "closure";
    command: string;
    admissionCategory: Ar2AdmissionCategory;
    criticalPathIds: readonly string[];
    executionLayer: Ar2LayerId;
    evidenceLayersCarried: readonly Ar2LayerId[];
    status?: string;
    external: boolean;
    cleanup: string;
    repeat: string;
    expectedResultType: string;
  } & Record<string, unknown>>[];
  laterImplementationMaximum: readonly Readonly<{ ordinal: number; path: string; state: "NEW" | "MODIFIED"; responsibility: string } & Record<string, unknown>>[];
  conditionalImplementationPaths: readonly unknown[];
  sourceDigestExclusions: readonly string[];
  inventoryDigest: string;
} & Record<string, unknown>>;

export type Ar2CommandResult = Readonly<{
  schemaVersion: "1";
  commandId: string;
  lane: "fast" | "recovery" | "authenticated" | "closure";
  admissionCategory: Ar2AdmissionCategory;
  executionLayer: Ar2LayerId;
  disposition: Ar2Disposition;
  executionCategory: "executed" | "governed-evidence-verified" | "current-invocation" | "diagnostic-executed";
  exitCategory: "zero" | "nonzero" | "not-applicable";
  structuredResultDigest: string;
  outputDigest: string;
  cleanupCategory: "not-required" | "owner-cleanup-verified" | "task-zero-verified";
  reasonCategories: readonly string[];
  provedCriticalPaths: readonly string[];
  provedLayers: readonly Ar2LayerId[];
  measurement: Readonly<{ kind: "owner-result" | "immutable-provenance" | "firewall" | "diagnostic" | "closure-receipt"; payload: unknown }>;
  resultDigest: string;
}>;

export type Ar2CriticalPathResult = Readonly<{
  schemaVersion: "1";
  criticalPathId: string;
  disposition: Ar2Disposition;
  semanticOwnerBindingDigest: string;
  commandResultDigests: readonly string[];
  coveredLayers: readonly Ar2LayerId[];
  missingLayers: readonly Ar2LayerId[];
  reasonCategories: readonly string[];
  resultDigest: string;
}>;

export type Ar2LayerResult = Readonly<{
  schemaVersion: "1";
  layerId: Ar2LayerId;
  disposition: Ar2Disposition;
  requiredCriticalPaths: number;
  passedCriticalPaths: number;
  resultDigest: string;
}>;

export type Ar2Evidence = Readonly<{
  schemaVersion: "1";
  kind: "ar2-critical-path-test-pyramid-result";
  contract: Readonly<{ id: typeof AR2_CONTRACT_ID; version: typeof AR2_CONTRACT_VERSION }>;
  executionParent: typeof AR2_EXECUTION_PARENT;
  governanceCommit: typeof AR2_GOVERNANCE_COMMIT;
  inventoryDigest: typeof AR2_INVENTORY_DIGEST;
  identities: Readonly<{
    sourceDigest: string;
    sourceManifestDigest: string;
    layerDigest: string;
    commandInventoryDigest: string;
    ownerMapDigest: string;
    thresholdDigest: string;
    packageLockDigest: string;
  }>;
  inventoryMetrics: Readonly<{
    criticalPathRecords: number;
    inlineOwnerAssignments: number;
    distinctOwnerBindings: number;
    sharedOwnerBindings: number;
    missingOwners: number;
    conflictingOwners: number;
    commandRecords: number;
  }>;
  sourceManifest: readonly Readonly<{ path: string; digest: string }>[];
  commandResults: readonly Ar2CommandResult[];
  criticalPathResults: readonly Ar2CriticalPathResult[];
  layerResults: readonly Ar2LayerResult[];
  authenticatedCurrentBuild: Readonly<{
    sourceDigest: string;
    resultDigest: string;
    adjudication: "PASS";
    envelopeCount: number;
    factCount: number;
    scannerSensitivity: number;
    scannerFindings: 0;
    cleanupAttempts: 2;
    independentZero: "zero-verified";
    semanticDigest: string;
    ownerMeasurement: unknown;
  }>;
  authenticatedRepeat: Readonly<{
    firstTaskDigest: string;
    firstRunDigest: string;
    firstResultDigest: string;
    secondTaskDigest: string;
    secondRunDigest: string;
    secondResultDigest: string;
    semanticDigest: string;
    secondOwnerMeasurement: unknown;
  }>;
  deterministicRepeat: Readonly<{ status: "PASS"; firstDigest: string; secondDigest: string; semanticDigest: string }>;
  scanner: Readonly<{ sensitivity: number; findings: 0 }>;
  cleanup: Readonly<{ attempts: 2; independentZero: "zero-verified"; remaining: 0 }>;
  totals: Readonly<{
    passedCriticalPaths: number;
    passedCommands: number;
    unsupported: 0;
    duplicateOwners: 0;
    staticObservations: 0;
    transformedObservations: 0;
    failed: 0;
    blocked: 0;
  }>;
  overall: "PASS";
  resultDigest: string;
}>;

const digestPattern = /^[a-f0-9]{64}$/;
const layerIds: readonly Ar2LayerId[] = ["L0", "L1", "L2", "L3", "L4", "L5"];

export function ar2Digest(value: unknown): string {
  return createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");
}

function unique(values: readonly string[], label: string): void {
  assert.equal(new Set(values).size, values.length, `Duplicate ${label}`);
}

function exactKeys(value: object, keys: readonly string[], label: string): void {
  assert.deepEqual(Object.keys(value).sort(), [...keys].sort(), `${label} keys`);
}

function safeCount(value: unknown, label: string): asserts value is number {
  assert.ok(Number.isSafeInteger(value) && (value as number) >= 0, label);
}

export function deriveDisposition(values: readonly Ar2Disposition[], structuralReasons: readonly string[] = []): Ar2Disposition {
  if (structuralReasons.length > 0 || values.includes("BLOCKED")) return "BLOCKED";
  if (values.includes("FAIL")) return "FAIL";
  return "PASS";
}

export function assertAr2Inventory(value: unknown): asserts value is Ar2Inventory {
  assert.ok(value && typeof value === "object" && !Array.isArray(value));
  const inventory = value as Ar2Inventory;
  assert.equal(inventory.schemaVersion, "1");
  assert.equal(inventory.kind, "ar2-critical-path-test-pyramid-governance-inventory");
  assert.equal(inventory.identity, AR2_CONTRACT_ID);
  assert.equal(inventory.inventoryDigest, AR2_INVENTORY_DIGEST);
  const { inventoryDigest: _ignored, ...unsigned } = inventory;
  assert.equal(ar2Digest(unsigned), AR2_INVENTORY_DIGEST);
  assert.deepEqual(inventory.layers.map((layer) => layer.id), layerIds);
  unique(inventory.criticalPaths.map((item) => item.id), "critical-path ID");
  unique(inventory.commands.map((item) => item.id), "command ID");
  const commands = new Map(inventory.commands.map((item) => [item.id, item]));
  for (const item of inventory.commands) {
    assert.ok(layerIds.includes(item.executionLayer));
    unique(item.criticalPathIds, `${item.id} critical-path reference`);
    item.evidenceLayersCarried.forEach((layer) => assert.ok(layerIds.includes(layer)));
  }
  for (const item of inventory.criticalPaths) {
    assert.match(item.id, /^CP-[0-9]{2}$/);
    assert.ok(item.semanticOwner.path && item.semanticOwner.symbol);
    assert.ok(item.commands.length > 0);
    item.commands.forEach((id) => assert.ok(commands.has(id), `${item.id} unknown command ${id}`));
    const pointers = [item.lowerLayerProof, ...item.higherLayerProofs];
    for (const pointer of pointers) {
      const command = commands.get(pointer.commandId)!;
      assert.ok(command.evidenceLayersCarried.includes(pointer.layer), `${item.id} layer pointer mismatch`);
      if ("admissionCategory" in pointer)
        assert.equal(pointer.admissionCategory, command.admissionCategory);
    }
  }
  assert.equal(inventory.laterImplementationMaximum.length, 6);
  assert.deepEqual(inventory.laterImplementationMaximum.map((item) => item.ordinal), [1, 2, 3, 4, 5, 6]);
  assert.equal(inventory.conditionalImplementationPaths.length, 0);
}

export function inventoryMetrics(inventory: Ar2Inventory) {
  const bindings = inventory.criticalPaths.map((item) => `${item.semanticOwner.path}#${item.semanticOwner.symbol}`);
  const counts = new Map<string, number>();
  bindings.forEach((binding) => counts.set(binding, (counts.get(binding) ?? 0) + 1));
  return {
    criticalPathRecords: inventory.criticalPaths.length,
    inlineOwnerAssignments: bindings.length,
    distinctOwnerBindings: counts.size,
    sharedOwnerBindings: [...counts.values()].filter((count) => count > 1).length,
    missingOwners: inventory.criticalPaths.filter((item) => !item.semanticOwner.path || !item.semanticOwner.symbol).length,
    conflictingOwners: 0,
    commandRecords: inventory.commands.length,
  } as const;
}

export function assertCommandResult(value: Ar2CommandResult): void {
  exactKeys(value, ["schemaVersion", "commandId", "lane", "admissionCategory", "executionLayer", "disposition", "executionCategory", "exitCategory", "structuredResultDigest", "outputDigest", "cleanupCategory", "reasonCategories", "provedCriticalPaths", "provedLayers", "measurement", "resultDigest"], "command result");
  assert.equal(value.schemaVersion, "1");
  assert.ok(["fast", "recovery", "authenticated", "closure"].includes(value.lane));
  assert.ok(["A", "B", "C", "D"].includes(value.admissionCategory));
  assert.ok(layerIds.includes(value.executionLayer));
  assert.ok(["PASS", "FAIL", "BLOCKED"].includes(value.disposition));
  assert.ok(["executed", "governed-evidence-verified", "current-invocation", "diagnostic-executed"].includes(value.executionCategory));
  assert.ok(["zero", "nonzero", "not-applicable"].includes(value.exitCategory));
  assert.ok(["not-required", "owner-cleanup-verified", "task-zero-verified"].includes(value.cleanupCategory));
  assert.ok(Array.isArray(value.reasonCategories) && value.reasonCategories.every((item) => typeof item === "string"));
  assert.ok(Array.isArray(value.provedCriticalPaths) && value.provedCriticalPaths.every((item) => typeof item === "string"));
  assert.ok(Array.isArray(value.provedLayers) && value.provedLayers.every((item) => layerIds.includes(item)));
  exactKeys(value.measurement, ["kind", "payload"], "command measurement");
  assert.ok(["owner-result", "immutable-provenance", "firewall", "diagnostic", "closure-receipt"].includes(value.measurement.kind));
  if(value.measurement.kind==="closure-receipt"){
    const payload=value.measurement.payload as Record<string,unknown>;
    exactKeys(payload,["operation","sourceDigest","inventoryDigest","prerequisiteDigest","subjectDigest","serializationDigest","writeCompleted","parseAndReadBackVerified","residueCount"],"closure receipt");
    assert.ok(payload.operation==="ar2-write"||payload.operation==="ar2-verify");
    for(const key of ["sourceDigest","inventoryDigest","prerequisiteDigest","subjectDigest","serializationDigest"])assert.match(payload[key] as string,digestPattern);
    assert.equal(payload.writeCompleted,true);assert.equal(payload.parseAndReadBackVerified,true);assert.equal(payload.residueCount,0);
  }
  assert.equal(value.structuredResultDigest, ar2Digest(value.measurement));
  assert.match(value.structuredResultDigest, digestPattern);
  assert.match(value.outputDigest, digestPattern);
  assert.match(value.resultDigest, digestPattern);
  const { resultDigest, ...unsigned } = value;
  assert.equal(resultDigest, ar2Digest(unsigned));
}

export function assertAr2Evidence(value: unknown, inventory: Ar2Inventory): asserts value is Ar2Evidence {
  assert.ok(value && typeof value === "object" && !Array.isArray(value));
  const evidence = value as Ar2Evidence;
  assert.equal(evidence.schemaVersion, "1");
  assert.equal(evidence.kind, "ar2-critical-path-test-pyramid-result");
  assert.deepEqual(evidence.contract, { id: AR2_CONTRACT_ID, version: AR2_CONTRACT_VERSION });
  assert.equal(evidence.executionParent, AR2_EXECUTION_PARENT);
  assert.equal(evidence.governanceCommit, AR2_GOVERNANCE_COMMIT);
  assert.equal(evidence.inventoryDigest, AR2_INVENTORY_DIGEST);
  Object.values(evidence.identities).forEach((digest) => assert.match(digest, digestPattern));
  unique(evidence.sourceManifest.map((entry) => entry.path), "source path");
  evidence.sourceManifest.forEach((entry) => assert.match(entry.digest, digestPattern));
  unique(evidence.commandResults.map((result) => result.commandId), "command result");
  evidence.commandResults.forEach(assertCommandResult);
  assert.deepEqual(evidence.commandResults.map((result) => result.commandId), inventory.commands.map((command) => command.id));
  evidence.commandResults.forEach((result, index) => {
    const command = inventory.commands[index]!;
    assert.equal(result.lane, command.lane);
    assert.equal(result.admissionCategory, command.admissionCategory);
    assert.equal(result.executionLayer, command.executionLayer);
    assert.equal(result.disposition, "PASS");
    assert.deepEqual(result.provedCriticalPaths, command.admissionCategory === "D" ? [] : command.criticalPathIds);
    assert.deepEqual(result.provedLayers, command.admissionCategory === "D" ? [] : command.evidenceLayersCarried);
  });
  unique(evidence.criticalPathResults.map((result) => result.criticalPathId), "critical-path result");
  assert.deepEqual(evidence.criticalPathResults.map((result) => result.criticalPathId), inventory.criticalPaths.map((item) => item.id));
  const commands = new Map(evidence.commandResults.map((item) => [item.commandId, item]));
  evidence.criticalPathResults.forEach((result, index) => {
    exactKeys(result, ["schemaVersion", "criticalPathId", "disposition", "semanticOwnerBindingDigest", "commandResultDigests", "coveredLayers", "missingLayers", "reasonCategories", "resultDigest"], "critical-path result");
    const item = inventory.criticalPaths[index]!;
    const admitted=item.commands.map(id=>commands.get(id)!).filter(command=>command.provedCriticalPaths.includes(item.id));const covered = [...new Set(admitted.flatMap(command=>command.provedLayers))].filter((layer) => item.layers.includes(layer)).sort();
    assert.equal(result.schemaVersion, "1");
    assert.equal(result.disposition, "PASS");
    assert.equal(result.semanticOwnerBindingDigest, ar2Digest(item.semanticOwner));
    assert.deepEqual(result.commandResultDigests, admitted.map(command=>command.resultDigest));
    assert.deepEqual(result.coveredLayers, covered);
    assert.deepEqual(result.missingLayers, []);
    assert.deepEqual(result.reasonCategories, []);
    const { resultDigest, ...unsigned } = result;
    assert.equal(resultDigest, ar2Digest(unsigned));
  });
  assert.deepEqual(evidence.inventoryMetrics, inventoryMetrics(inventory));
  assert.deepEqual(evidence.layerResults.map((result) => result.layerId), layerIds);
  evidence.layerResults.forEach((result) => {
    exactKeys(result, ["schemaVersion", "layerId", "disposition", "requiredCriticalPaths", "passedCriticalPaths", "resultDigest"], "layer result");
    assert.equal(result.schemaVersion, "1");
    assert.equal(result.disposition, "PASS");
    safeCount(result.requiredCriticalPaths, "required critical paths");
    assert.equal(result.passedCriticalPaths, result.requiredCriticalPaths);
    const { resultDigest, ...unsigned } = result;
    assert.equal(resultDigest, ar2Digest(unsigned));
  });
  assert.equal(evidence.identities.sourceManifestDigest, ar2Digest(evidence.sourceManifest));
  assert.equal(evidence.identities.sourceDigest, ar2Digest({ parent: AR2_EXECUTION_PARENT, manifest: evidence.sourceManifest }));
  assert.equal(evidence.identities.layerDigest, ar2Digest(inventory.layers));
  assert.equal(evidence.identities.commandInventoryDigest, ar2Digest(inventory.commands));
  assert.equal(evidence.identities.ownerMapDigest, ar2Digest(inventory.criticalPaths.map((item) => ({ id: item.id, owner: item.semanticOwner }))));
  assert.equal(evidence.identities.thresholdDigest, ar2Digest(inventory.thresholds));
  assert.equal(evidence.authenticatedCurrentBuild.adjudication, "PASS");
  for (const digest of [evidence.authenticatedCurrentBuild.sourceDigest, evidence.authenticatedCurrentBuild.resultDigest, evidence.authenticatedCurrentBuild.semanticDigest]) assert.match(digest, digestPattern);
  safeCount(evidence.authenticatedCurrentBuild.envelopeCount, "authenticated envelope count");
  safeCount(evidence.authenticatedCurrentBuild.factCount, "authenticated fact count");
  assert.ok(evidence.authenticatedCurrentBuild.envelopeCount > 0 && evidence.authenticatedCurrentBuild.factCount > 0);
  assert.equal(evidence.authenticatedCurrentBuild.scannerFindings, 0);
  assert.equal(evidence.authenticatedCurrentBuild.cleanupAttempts, 2);
  assert.equal(evidence.authenticatedCurrentBuild.independentZero, "zero-verified");
  for (const digest of [evidence.authenticatedRepeat.firstTaskDigest,evidence.authenticatedRepeat.firstRunDigest,evidence.authenticatedRepeat.firstResultDigest,evidence.authenticatedRepeat.secondTaskDigest,evidence.authenticatedRepeat.secondRunDigest,evidence.authenticatedRepeat.secondResultDigest,evidence.authenticatedRepeat.semanticDigest]) assert.match(digest,digestPattern);
  assert.notEqual(evidence.authenticatedRepeat.firstTaskDigest,evidence.authenticatedRepeat.secondTaskDigest);
  assert.notEqual(evidence.authenticatedRepeat.firstRunDigest,evidence.authenticatedRepeat.secondRunDigest);
  assert.equal(evidence.authenticatedRepeat.firstTaskDigest,evidence.authenticatedCurrentBuild.ownerMeasurement && (evidence.authenticatedCurrentBuild.ownerMeasurement as {taskDigest:string}).taskDigest);
  assert.equal(evidence.authenticatedRepeat.firstRunDigest,(evidence.authenticatedCurrentBuild.ownerMeasurement as {runDigest:string}).runDigest);
  assert.equal(evidence.authenticatedRepeat.firstResultDigest,evidence.authenticatedCurrentBuild.resultDigest);
  assert.equal(evidence.authenticatedRepeat.semanticDigest,evidence.authenticatedCurrentBuild.semanticDigest);
  assert.equal(evidence.deterministicRepeat.status, "PASS");
  assert.equal(evidence.deterministicRepeat.firstDigest, evidence.deterministicRepeat.secondDigest);
  assert.equal(evidence.deterministicRepeat.semanticDigest, evidence.deterministicRepeat.firstDigest);
  [evidence.deterministicRepeat.firstDigest, evidence.deterministicRepeat.secondDigest].forEach((digest) => assert.match(digest, digestPattern));
  assert.ok(evidence.scanner.sensitivity > 0);
  assert.equal(evidence.scanner.findings, 0);
  assert.deepEqual(evidence.cleanup, { attempts: 2, independentZero: "zero-verified", remaining: 0 });
  assert.equal(evidence.totals.passedCriticalPaths, inventory.criticalPaths.length);
  assert.equal(evidence.totals.passedCommands, inventory.commands.length);
  for (const key of ["unsupported", "duplicateOwners", "staticObservations", "transformedObservations", "failed", "blocked"] as const)
    assert.equal(evidence.totals[key], 0);
  assert.equal(evidence.overall, "PASS");
  const { resultDigest, ...unsigned } = evidence;
  assert.equal(resultDigest, ar2Digest(unsigned));
}
