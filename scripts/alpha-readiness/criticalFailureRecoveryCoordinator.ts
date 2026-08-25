import {
  assertRecoveryOutcome,
  criticalFailureRecoveryProducers,
  type CriticalFailureRecoveryMeasurementEnvelope,
  type CriticalFailureRecoveryResult,
  type CriticalFailureRecoveryOutcome,
} from "./criticalFailureRecoveryContracts";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";

const sha256 = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const digestPattern = /^[a-f0-9]{64}$/;
const exactKeys = (value: Record<string, unknown>, keys: readonly string[]) =>
  assert.deepEqual(Object.keys(value).sort(), [...keys].sort());
const record = (value: unknown): Record<string, unknown> => {
  assert.ok(value !== null && typeof value === "object" && !Array.isArray(value));
  return value as Record<string, unknown>;
};
const nonnegativeInteger = (value: unknown) =>
  assert.ok(typeof value === "number" && Number.isSafeInteger(value) && value >= 0);
const boolean = (value: unknown) => assert.equal(typeof value, "boolean");
const string = (value: unknown) => assert.ok(typeof value === "string" && value.length > 0);
const validateNumberRecord = (value: unknown, keys: readonly string[]) => {
  const item = record(value); exactKeys(item, keys); keys.forEach((key) => nonnegativeInteger(item[key]));
};

const replayFamilyKeys = ["occurrences", "protectedBodyRefs", "physicalBodyRefs", "physicalBlobs", "preparedPublications", "frozenPublications", "publicationReceipts", "contributionPublications", "contributionReceipts", "capturePublications", "captureReceipts", "captureCorrespondenceTuples", "whatChangedPublications", "futurePreparationLinks", "routingLinks", "idempotencyRecords", "evidenceRoutes", "runtimeEvidence", "runtimeCanonicalOperations", "runtimeTerminals", "workflowTerminals", "runtimeTerminalBindings", "workflowTerminalBindings", "closures", "productMaterializations", "productMaterializationReceipts", "events"] as const;

function validateProducerMeasurement(producer: CriticalFailureRecoveryMeasurementEnvelope["producer"], measurement: Record<string, unknown>) {
  exactKeys(measurement, measurementKeys[producer]);
  if (producer === "focused-owner-recovery") {
    assert.equal(measurement.status, "PASS");
    ["checks", "faultCases", "concurrency", "freshProcesses", "exactReplay", "incompatibleReplay", "recoveryBlocked", "duplicateFindings", "authorizationFindings", "protectedReads", "unauthorizedProtectedReads", "actualOwnerAuthorizationChecks", "scannerSurfaceSensitivity"].forEach((key) => nonnegativeInteger(measurement[key]));
    boolean(measurement.deterministicRepeat);
    assert.ok(Array.isArray(measurement.caseResults) && measurement.caseResults.length > 0);
    const ids = measurement.caseResults.map((entry) => { const item = record(entry); exactKeys(item, ["id", "outcome"]); string(item.id); if (item.outcome !== "verified") assertRecoveryOutcome(item.outcome); return item.id; });
    assert.equal(new Set(ids).size, ids.length);
  } else if (producer === "materialization-atomicity") {
    assert.equal(measurement.status, "PASS");
    const boundaries = record(measurement.boundaries); exactKeys(boundaries, ["exactReplay", "incompatibleReplay", "runtimeBeforeWorkflow", "workflowAfterRuntime"]); Object.values(boundaries).forEach(boolean);
    validateNumberRecord(measurement.inventory, ["productMaterializations", "productMaterializationReceipts", "whatChangedPublications", "changeLinks", "runtimeWrites", "workflowWrites", "duplicateFindings"]);
  } else if (producer === "materialization-failure") {
    assert.equal(measurement.status, "PASS");
    const stages = record(measurement.stages); exactKeys(stages, ["draftConflict", "recovered", "workflowPending"]); Object.values(stages).forEach(string);
    validateNumberRecord(measurement.inventory, ["writesBeforeRecovery", "writesAfterRecovery", "duplicateRuntimeWrites"]); assert.ok(digestPattern.test(String(measurement.measurementDigest)));
  } else if (producer === "materialization-fresh-process") {
    assert.equal(measurement.status, "PASS"); ["workers", "durableWorkers", "totalWorkers"].forEach((key) => nonnegativeInteger(measurement[key]));
    ["deterministicAtomicity", "deterministicFailureRecovery"].forEach((key) => boolean(measurement[key])); assert.ok(Array.isArray(measurement.roles) && measurement.roles.every((value) => typeof value === "string"));
    const durable = record(measurement.durableBoundary); exactKeys(durable, ["runtimeOnly", "recovered"]);
    const runtimeOnly = record(durable.runtimeOnly); exactKeys(runtimeOnly, ["status", "stage", "runtimeEvents", "workflowMaterializations"]); assert.equal(runtimeOnly.status, "PASS"); string(runtimeOnly.stage); nonnegativeInteger(runtimeOnly.runtimeEvents); nonnegativeInteger(runtimeOnly.workflowMaterializations);
    const recovered = record(durable.recovered); exactKeys(recovered, ["status", "stage", "runtimeEvents", "workflowMaterializations", "workflowReceipts", "workflowPublications", "duplicateFindings"]); assert.equal(recovered.status, "PASS"); string(recovered.stage); ["runtimeEvents", "workflowMaterializations", "workflowReceipts", "workflowPublications", "duplicateFindings"].forEach((key) => nonnegativeInteger(recovered[key]));
  } else if (producer === "joined-replay-inventory") {
    assert.equal(measurement.status, "PASS"); nonnegativeInteger(measurement.checks); nonnegativeInteger(measurement.freshProcesses);
    const inventory = record(measurement.inventory); exactKeys(inventory, ["families", "duplicateFindings"]); validateNumberRecord(inventory.families, replayFamilyKeys); nonnegativeInteger(inventory.duplicateFindings);
    validateNumberRecord(measurement.observability, ["eventCount", "neutralityCaseCount"]);
  } else if (producer === "scanner") {
    ["findings", "sensitivity", "surfaces"].forEach((key) => nonnegativeInteger(measurement[key]));
  } else {
    assert.equal(measurement.status, "cleanup-complete"); nonnegativeInteger(measurement.rootsRemaining);
  }
}

const measurementKeys: Record<
  CriticalFailureRecoveryMeasurementEnvelope["producer"],
  readonly string[]
> = {
  "focused-owner-recovery": ["status", "checks", "faultCases", "concurrency", "freshProcesses", "exactReplay", "incompatibleReplay", "recoveryBlocked", "duplicateFindings", "authorizationFindings", "protectedReads", "unauthorizedProtectedReads", "actualOwnerAuthorizationChecks", "scannerSurfaceSensitivity", "caseResults", "deterministicRepeat"],
  "materialization-atomicity": ["status", "boundaries", "inventory"],
  "materialization-failure": ["status", "stages", "inventory", "measurementDigest"],
  "materialization-fresh-process": ["status", "workers", "roles", "totalWorkers", "deterministicAtomicity", "deterministicFailureRecovery", "durableBoundary", "durableWorkers"],
  "joined-replay-inventory": ["status", "checks", "freshProcesses", "inventory", "observability"],
  scanner: ["findings", "sensitivity", "surfaces"],
  "cleanup-zero": ["status", "rootsRemaining"],
};

export function validateCriticalFailureRecoveryEnvelopes(input: {
  envelopes: CriticalFailureRecoveryMeasurementEnvelope[];
  sourceDigest: string;
  runId: string;
}): string {
  assert.equal(input.envelopes.length, criticalFailureRecoveryProducers.length);
  input.envelopes.forEach((value, index) => {
    exactKeys(value as unknown as Record<string, unknown>, ["contractVersion", "producer", "phase", "sequence", "sourceDigest", "taskId", "runId", "measurement", "measurementDigest"]);
    assert.equal(value.contractVersion, "ar5a-measurement-v1");
    assert.equal(value.producer, criticalFailureRecoveryProducers[index]);
    assert.equal(value.phase, value.producer);
    assert.equal(value.sequence, index + 1);
    assert.equal(value.sourceDigest, input.sourceDigest);
    assert.equal(value.taskId, "ar5a-core-failure-recovery");
    assert.equal(value.runId, input.runId);
    assert.ok(digestPattern.test(value.measurementDigest));
    validateProducerMeasurement(value.producer, value.measurement);
    assert.equal(value.measurementDigest, sha256(JSON.stringify(value.measurement)));
  });
  return sha256(JSON.stringify(input.envelopes.map((value) => value.measurementDigest)));
}

const requiredAr3Cases = [
  "recovery-observer-enabled-parity",
  "recovery-observer-throwing-parity",
  "recovery-unavailable-observer-parity",
] as const;
const requiredAr4Cases = [
  "recovery-telemetry-enabled-consent-product-parity",
  "recovery-telemetry-disabled-product-parity",
  "recovery-telemetry-consent-absent-product-parity",
  "recovery-telemetry-consent-expired-product-parity",
  "recovery-telemetry-consent-revoked-product-parity",
  "recovery-telemetry-missing-active-key-product-parity",
  "recovery-telemetry-missing-historical-key-product-parity",
  "recovery-telemetry-repository-rejecting-product-parity",
  "recovery-telemetry-repository-throwing-product-parity",
  "recovery-telemetry-repository-unavailable-product-parity",
  "recovery-telemetry-sweep-failure-product-parity",
  "recovery-telemetry-deletion-pending-product-parity",
  "recovery-telemetry-denied-operator-product-parity",
] as const;

export function adjudicateCriticalFailureRecovery(input: {
  envelopes: CriticalFailureRecoveryMeasurementEnvelope[];
  sourceDigest: string;
  changedPathsDigest: string;
  runId: string;
}): Omit<CriticalFailureRecoveryResult, "resultDigest"> {
  const envelopeDigestAggregate = validateCriticalFailureRecoveryEnvelopes(input);
  const get = <P extends CriticalFailureRecoveryMeasurementEnvelope["producer"]>(producer: P) => {
    const found = input.envelopes.find((value) => value.producer === producer);
    assert.ok(found); return found.measurement as Extract<CriticalFailureRecoveryMeasurementEnvelope, { producer: P }>["measurement"];
  };
  const focused = get("focused-owner-recovery"), atomicity = get("materialization-atomicity"), failure = get("materialization-failure"), fresh = get("materialization-fresh-process"), replay = get("joined-replay-inventory"), scanner = get("scanner"), cleanup = get("cleanup-zero");
  const cases = focused.caseResults;
  const verified = new Set(cases.filter((value) => value.outcome === "verified").map((value) => value.id));
  const ar3Pass = requiredAr3Cases.every((id) => verified.has(id)) && replay.observability.neutralityCaseCount > 0;
  const actualAr4 = cases.filter((value) => requiredAr4Cases.includes(value.id as any) && value.outcome === "verified").map((value) => value.id).sort();
  const ar4Pass = JSON.stringify(actualAr4) === JSON.stringify([...requiredAr4Cases].sort());
  const duplicateFindingTotal = focused.duplicateFindings + replay.inventory.duplicateFindings;
  const deterministic = focused.deterministicRepeat === true && fresh.deterministicAtomicity === true && fresh.deterministicFailureRecovery === true;
  const pass = focused.status === "PASS" && atomicity.status === "PASS" && failure.status === "PASS" && fresh.status === "PASS" && replay.status === "PASS" && duplicateFindingTotal === 0 && focused.authorizationFindings === 0 && focused.unauthorizedProtectedReads === 0 && scanner.findings === 0 && cleanup.status === "cleanup-complete" && cleanup.rootsRemaining === 0 && ar3Pass && ar4Pass && deterministic;
  return {
    contractVersion: "ar5a-core-failure-recovery-v1",
    ownerRecoveryStatus: pass ? "PASS" : "BLOCKED",
    productReadinessStatus: pass ? "PASS" : "BLOCKED",
    faultCaseTotal: focused.faultCases,
    concurrencyTotal: focused.concurrency,
    freshProcessTotal: focused.freshProcesses * 2 + fresh.totalWorkers + replay.freshProcesses,
    exactReplayTotal: focused.exactReplay,
    incompatibleReplayTotal: focused.incompatibleReplay,
    recoveryBlockedTotal: focused.recoveryBlocked,
    duplicateFindingTotal,
    authorizationFindingTotal: focused.authorizationFindings,
    scannerFindingTotal: scanner.findings,
    scannerSensitivityTotal: scanner.sensitivity,
    cleanupStatus: cleanup.status,
    ar3OwnerParityStatus: ar3Pass ? "PASS" : "BLOCKED",
    ar4OwnerParityStatus: ar4Pass ? "PASS" : "BLOCKED",
    historicalEvidenceDisposition: "preserved-source-stale",
    deterministicRepeatStatus: deterministic ? "PASS" : "BLOCKED",
    bodyRepositoryPath: "unchanged",
    replayValidatorPath: "activated",
    packageLockStatus: "unchanged",
    durationCategories: ["immediate", "bounded-local"],
    recoverableDataCategories: ["no-loss", "owner-issued-replay"],
    sourceDigest: input.sourceDigest,
    changedPathsDigest: input.changedPathsDigest,
    envelopeDigestAggregate,
  };
}

export type RecoveryOwnerObservation = {
  outcome: CriticalFailureRecoveryOutcome;
};

export function coordinateCriticalFailureRecovery(
  observation: RecoveryOwnerObservation,
): { outcome: CriticalFailureRecoveryOutcome; retry: boolean } {
  assertRecoveryOutcome(observation.outcome);
  return {
    outcome: observation.outcome,
    retry:
      observation.outcome === "recovered-uncommitted" ||
      observation.outcome === "exact-replay",
  };
}

export async function recoverAuthorizedProtectedState<T>(input: {
  authorizeCurrent(): Promise<"authorized" | "unavailable">;
  loadProtected(): Promise<T>;
  observe?(observation: RecoveryOwnerObservation): void | Promise<void>;
}): Promise<
  { outcome: "already-committed"; value: T } | { outcome: "unavailable" }
> {
  if ((await input.authorizeCurrent()) !== "authorized") {
    const result = { outcome: "unavailable" as const };
    try {
      await input.observe?.(result);
    } catch {}
    return result;
  }
  const result = {
    outcome: "already-committed" as const,
    value: await input.loadProtected(),
  };
  try {
    await input.observe?.({ outcome: result.outcome });
  } catch {}
  return result;
}
