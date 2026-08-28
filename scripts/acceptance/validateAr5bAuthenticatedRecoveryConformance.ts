import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import { execFile } from "node:child_process";
import { constants } from "node:fs";
import {
  chmod,
  mkdir,
  mkdtemp,
  open,
  readFile,
  rm as fsRm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import {
  FilesystemOrganizationRuntimeRepository,
  RuntimeStorageConflictError,
  RuntimeStorageRecoveryBlockedError,
} from "../../engine/v3/runtime/organizationRuntimeRepository";
import {
  createProductWorkflowArtifactRepository,
  ProductWorkflowIncompatibleIdempotencyReplayError,
  ProductWorkflowRecoveryBlockedError,
  ProductWorkflowRevisionConflictError,
} from "../../product/workflow/leadershipConversation/productWorkflowArtifactRepository";
import {
  acceptanceDigest,
  createAcceptanceMeasurementEnvelopeV1,
  type ObservationState,
  type ProducerCategory,
  type PhaseCategory,
} from "./authenticatedAlphaAcceptanceContracts";
import { ar5bAuthenticatedRecoveryConformanceProfile } from "./ar5bAuthenticatedRecoveryConformanceProfile";
import {
  measureCanonicalMutationProductMaterializationDurableStage,
  runAtomicityValidation,
} from "../product/validateCanonicalMutationProductMaterializationAtomicity";
import { measureLeadershipConversationReplayJoinedInventory } from "../product/validateLeadershipConversationReplay";
import { measureAlphaTelemetryParityMatrix } from "../product/validateAlphaCriticalFailureRecovery";
import { validateCurrentAccessScenario } from "../product/validateProductArtifactAuthorizationBeforeBodyRead";
import {
  adjudicateCriticalFailureRecovery,
  recoverAuthorizedProtectedState,
  validateCriticalFailureRecoveryEnvelopes,
} from "../alpha-readiness/criticalFailureRecoveryCoordinator";
import type { CriticalFailureRecoveryMeasurementEnvelope } from "../alpha-readiness/criticalFailureRecoveryContracts";
import { createAlphaTelemetryComposition } from "../../lib/telemetry/alphaTelemetryComposition";
import { AlphaProductTelemetryOwner } from "../../lib/telemetry/alphaProductTelemetryOwner";
import type { AlphaTelemetryKeyRing } from "../../lib/telemetry/alphaTelemetryPseudonymization";
import type { AlphaTelemetryConsentOwner } from "../../lib/telemetry/alphaTelemetryConsentOwner";
import type { AlphaTelemetryRepository } from "../../lib/telemetry/alphaTelemetryRepository";
import { adjudicateAuthenticatedAlphaAcceptance } from "./authenticatedAlphaAcceptanceAdjudicator";
import {
  createAcceptanceProducerDescriptorV1,
  createAcceptanceProducerRegistryV1,
  createAcceptanceProducerSourceManifestV1,
  inspectAcceptanceProducerSourceEntriesV1,
  runAcceptanceMeasurementChild,
  type AcceptanceProducerDescriptorV1,
  type ChildMeasurementRequest,
} from "./authenticatedAlphaAcceptanceRunner";
import {
  createAcceptanceTaskManifest,
  createTaskSecret,
  writeProtectedManifest as writeOwnerProtectedManifest,
  type AcceptanceTaskManifest,
} from "./authenticatedAlphaAcceptanceTaskManifest";
import {
  AUTHENTICATED_ALPHA_ORDINARY_JOURNEY_ID,
  measureAuthenticatedAlphaCurrentBuild,
  validateAuthenticatedAlphaTaskOwnershipV1,
} from "./validateAr3CurrentBuildConformance";
import { scanText } from "../alpha-readiness/protectedValueScanner";

const runFile = promisify(execFile);

type RecoveryFact =
  (typeof ar5bAuthenticatedRecoveryConformanceProfile.requiredMeasurements)[number]["factIds"][number];
type MeasurementKind =
  | "typed-owner-outcome"
  | "typed-owner-comparison"
  | "exact-inventory"
  | "protected-read-count"
  | "durable-digest-comparison";
type OwnerBoundary =
  | "runtime-repository"
  | "workflow-repository"
  | "materialization-owner"
  | "current-access-owner"
  | "recovery-coordinator"
  | "observability-owner"
  | "telemetry-owner"
  | "joined-inventory-owner"
  | "ar5a-provenance-owner";
type NormalizedOutcome = "satisfied" | "failed" | "unavailable";
const stableComparisonDigests = new WeakMap<object, string>();
type RecordV1 = Readonly<{
  schemaVersion: "1";
  factId: RecoveryFact;
  producer: ProducerCategory;
  phase: PhaseCategory;
  ownerBoundary: OwnerBoundary;
  ownerOperation: string;
  measurementKind: MeasurementKind;
  sourceDigest: string;
  frameworkDigest: string;
  foundationDigest: string;
  profileDigest: string;
  taskDigest: string;
  runDigest: string;
  segmentDigest: string;
  inputDigest: string;
  ownerOutcome: NormalizedOutcome;
  comparisonDigest: string;
  observedCategory:
    | "owner-measured"
    | "owner-measurement-failed"
    | "owner-measurement-unavailable";
  measurementDigest: string;
}>;
const exactKeys = [
    "schemaVersion",
    "factId",
    "producer",
    "phase",
    "ownerBoundary",
    "ownerOperation",
    "measurementKind",
    "sourceDigest",
    "frameworkDigest",
    "foundationDigest",
    "profileDigest",
    "taskDigest",
    "runDigest",
    "segmentDigest",
    "inputDigest",
    "ownerOutcome",
    "comparisonDigest",
    "observedCategory",
    "measurementDigest",
  ]
    .sort()
    .join("\0"),
  digestPattern = /^[a-f0-9]{64}$/,
  safeId = /^[a-z][a-z0-9-]{2,95}$/;
function assertRecord(value: unknown): asserts value is RecordV1 {
  assert.ok(value && typeof value === "object" && !Array.isArray(value));
  const record = value as Record<string, unknown>;
  assert.equal(Object.keys(record).sort().join("\0"), exactKeys);
  assert.equal(record.schemaVersion, "1");
  assert.match(String(record.factId), safeId);
  assert.match(String(record.ownerOperation), safeId);
  for (const key of [
    "sourceDigest",
    "frameworkDigest",
    "foundationDigest",
    "profileDigest",
    "taskDigest",
    "runDigest",
    "segmentDigest",
    "inputDigest",
    "comparisonDigest",
    "measurementDigest",
  ])
    assert.match(String(record[key]), digestPattern);
  const { measurementDigest, ...unsigned } = record;
  assert.equal(measurementDigest, acceptanceDigest(unsigned));
  assert.equal(
    record.observedCategory,
    record.ownerOutcome === "satisfied"
      ? "owner-measured"
      : record.ownerOutcome === "failed"
        ? "owner-measurement-failed"
        : "owner-measurement-unavailable",
  );
}
function createRecord(
  input: Omit<RecordV1, "schemaVersion" | "measurementDigest">,
): RecordV1 {
  const unsigned = { schemaVersion: "1" as const, ...input },
    value = Object.freeze({
      ...unsigned,
      measurementDigest: acceptanceDigest(unsigned),
    });
  assertRecord(value);
  return value;
}
type Context = Readonly<{
  sourceDigest: string;
  taskDigest: string;
  runDigest: string;
  segmentDigest: string;
  taskRoot: string;
  manifestPath: string;
  secretPath: string;
  joinedResultPath: string;
  replayRecordsPath: string;
  observabilityRecordsPath: string;
}>; 
function recorder(
  context: Context,
  producer: "replay-recovery" | "observability",
  phase: "replay-recovery" | "event-observation",
) {
  const frameworkDigest = acceptanceDigest(
      ar5bAuthenticatedRecoveryConformanceProfile.framework,
    ),
    foundationDigest = acceptanceDigest(
      "authenticated-alpha-acceptance-foundation@1.2",
    ),
    profileDigest = acceptanceDigest(
      ar5bAuthenticatedRecoveryConformanceProfile,
    );
  return (
    factId: RecoveryFact,
    ownerBoundary: OwnerBoundary,
    ownerOperation: string,
    measurementKind: MeasurementKind,
    ownerOutcome: NormalizedOutcome,
    measured: unknown,
    stableMeasured: unknown = measured,
  ) => {
    const value = createRecord({
      factId,
      producer,
      phase,
      ownerBoundary,
      ownerOperation,
      measurementKind,
      sourceDigest: context.sourceDigest,
      frameworkDigest,
      foundationDigest,
      profileDigest,
      taskDigest: context.taskDigest,
      runDigest: context.runDigest,
      segmentDigest: context.segmentDigest,
      inputDigest: acceptanceDigest({ factId, ownerBoundary, ownerOperation }),
      ownerOutcome,
      comparisonDigest: acceptanceDigest(measured),
      observedCategory:
        ownerOutcome === "satisfied"
          ? "owner-measured"
          : ownerOutcome === "failed"
            ? "owner-measurement-failed"
          : "owner-measurement-unavailable",
    });
    stableComparisonDigests.set(value, acceptanceDigest(stableMeasured));
    return value;
  };
}
function state(record: RecordV1): ObservationState {
  return record.ownerOutcome === "satisfied"
    ? "observed"
    : record.ownerOutcome === "failed"
      ? "failed"
      : "unavailable";
}
type JoinedReplayMeasurement = Awaited<
  ReturnType<typeof measureLeadershipConversationReplayJoinedInventory>
>;
function assertJoinedReplayMeasurement(
  value: JoinedReplayMeasurement,
  context: Context,
) {
  assert.deepEqual(Object.keys(value).sort(), [
    "cleanupCategory",
    "duplicateFindings",
    "eventCount",
    "eventOrderingFindings",
    "eventPairingFindings",
    "executionAuthorityCategory",
    "executionSegmentCount",
    "executionSegmentDigest",
    "familyCount",
    "foreignPreserved",
    "foreignStateDigest",
    "inventoryDigest",
    "measurementDigest",
    "missingFindings",
    "observerModeDurableStateDigest",
    "observerModeEventInventoryDigest",
    "observerModeProductOutputDigest",
    "observerParityCategory",
    "owner",
    "processTopology",
    "profileDigest",
    "recipe",
    "runDigest",
    "schemaVersion",
    "sourceDigest",
    "taskAuthorityDigest",
    "taskDigest",
  ].sort());
  const { measurementDigest, ...unsigned } = value;
  assert.equal(measurementDigest, acceptanceDigest(unsigned));
  assert.equal(
    value.executionAuthorityCategory,
    "foundation-v1-2-task-authorized-measurement",
  );
  assert.equal(value.sourceDigest, context.sourceDigest);
  assert.equal(value.taskDigest, context.taskDigest);
  assert.equal(value.runDigest, context.runDigest);
  assert.equal(value.recipe, "leadership-conversation-joined-replay-v1");
  assert.equal(
    value.processTopology,
    "existing-multiprocess-replay-topology-v1",
  );
  assert.equal(value.executionSegmentCount, 22);
  assert.match(value.taskAuthorityDigest, digestPattern);
  assert.equal(value.cleanupCategory, "path-8-local-zero");
}
async function writeJoinedReplayMeasurement(
  file: string,
  value: JoinedReplayMeasurement,
) {
  const handle = await open(
    file,
    constants.O_WRONLY | constants.O_TRUNC | constants.O_NOFOLLOW,
  );
  try {
    const status = await handle.stat();
    assert.ok(status.isFile() && !status.isSymbolicLink());
    assert.equal(status.mode & 0o777, 0o600);
    await handle.writeFile(JSON.stringify(value));
    await handle.sync();
  } finally {
    await handle.close();
  }
}
async function readJoinedReplayMeasurement(file: string, context: Context) {
  const handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const status = await handle.stat();
    assert.ok(status.isFile() && !status.isSymbolicLink());
    assert.equal(status.mode & 0o777, 0o600);
    const value = JSON.parse(
      await handle.readFile("utf8"),
    ) as JoinedReplayMeasurement;
    assertJoinedReplayMeasurement(value, context);
    return value;
  } finally {
    await handle.close();
  }
}
type OwnerRecordPacket = Readonly<{
  schemaVersion: "2";
  producer: "replay-recovery" | "observability";
  sourceDigest: string;
  taskDigest: string;
  runDigest: string;
  records: readonly RecordV1[];
  recordDigestAggregate: string;
  stableComparisonDigests: readonly string[];
  integrityMac: string;
}>;
async function writeOwnerRecordPacket(
  file: string,
  producer: OwnerRecordPacket["producer"],
  context: Context,
  records: readonly RecordV1[],
) {
  const unsigned = {
      schemaVersion: "2" as const,
      producer,
      sourceDigest: context.sourceDigest,
      taskDigest: context.taskDigest,
      runDigest: context.runDigest,
      records,
      recordDigestAggregate: acceptanceDigest(
        records.map((record) => record.measurementDigest),
      ),
      stableComparisonDigests: records.map((record) => {
        const digest = stableComparisonDigests.get(record);
        assert.match(String(digest), digestPattern);
        return digest!;
      }),
    },
    secret = await readFile(context.secretPath),
    value = {
      ...unsigned,
      integrityMac: createHmac("sha256", secret)
        .update(JSON.stringify(unsigned))
        .digest("hex"),
    },
    handle = await open(
      file,
      constants.O_WRONLY | constants.O_TRUNC | constants.O_NOFOLLOW,
    );
  secret.fill(0);
  try {
    const status = await handle.stat();
    assert.ok(status.isFile() && !status.isSymbolicLink());
    assert.equal(status.mode & 0o777, 0o600);
    await handle.writeFile(JSON.stringify(value));
    await handle.sync();
  } finally {
    await handle.close();
  }
}
async function readOwnerRecordPacket(
  file: string,
  producer: OwnerRecordPacket["producer"],
  context: Context,
  secret: Buffer,
) {
  const handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const status = await handle.stat();
    assert.ok(status.isFile() && !status.isSymbolicLink());
    assert.equal(status.mode & 0o777, 0o600);
    const value = JSON.parse(await handle.readFile("utf8")) as OwnerRecordPacket,
      { integrityMac, ...unsigned } = value;
    assert.equal(value.schemaVersion, "2");
    assert.equal(value.producer, producer);
    assert.equal(value.sourceDigest, context.sourceDigest);
    assert.equal(value.taskDigest, context.taskDigest);
    assert.equal(value.runDigest, context.runDigest);
    value.records.forEach(assertRecord);
    assert.equal(value.stableComparisonDigests.length, value.records.length);
    value.stableComparisonDigests.forEach((digest) =>
      assert.match(digest, digestPattern),
    );
    assert.equal(
      value.recordDigestAggregate,
      acceptanceDigest(value.records.map((record) => record.measurementDigest)),
    );
    assert.equal(
      integrityMac,
      createHmac("sha256", secret)
        .update(JSON.stringify(unsigned))
        .digest("hex"),
    );
    return value;
  } finally {
    await handle.close();
  }
}
function recordsEnvelope(
  context: Context,
  producer: "replay-recovery" | "observability",
  phase: "replay-recovery" | "event-observation",
  sequence: number,
  records: readonly RecordV1[],
) {
  const required =
    ar5bAuthenticatedRecoveryConformanceProfile.requiredMeasurements.find(
      (value) => value.producer === producer && value.phase === phase,
    )!;
  assert.equal(records.length, required.factIds.length);
  assert.equal(
    new Set(records.map((value) => value.factId)).size,
    records.length,
  );
  assert.deepEqual(
    records.map((value) => value.factId).sort(),
    [...required.factIds].sort(),
  );
  records.forEach(assertRecord);
  const observations = records.map((value) => ({
    factId: value.factId,
    state: state(value),
  }));
  return createAcceptanceMeasurementEnvelopeV1({
    framework: ar5bAuthenticatedRecoveryConformanceProfile.framework,
    profile: ar5bAuthenticatedRecoveryConformanceProfile.profile,
    producer,
    phase,
    sourceDigest: context.sourceDigest,
    taskDigest: context.taskDigest,
    producerRunDigest: context.runDigest,
    sequence,
    measurementId: acceptanceDigest(
      records.map((value) => value.measurementDigest),
    ),
    observations,
  });
}
async function materializationMeasurements(context: Context) {
  const record = recorder(context, "replay-recovery", "replay-recovery"),
    atomicity = await runAtomicityValidation(),
    fresh = await measureCanonicalMutationProductMaterializationDurableStage({
      schemaVersion: "1",
      sourceDigest: context.sourceDigest,
      frameworkId: "authenticated-alpha-acceptance",
      frameworkVersion: "1",
      profileId: "ar5b-authenticated-recovery-conformance",
      profileVersion: "version-1",
      taskDigest: context.taskDigest,
      runDigest: context.runDigest,
      parentSegmentDigest: acceptanceDigest({
        segment: context.segmentDigest,
        role: "parent",
      }),
      freshSegmentDigest: acceptanceDigest({
        segment: context.segmentDigest,
        role: "fresh",
      }),
      recipe:
        "shared-durable-root-materialization-fresh-process-reconstruction-v1",
    }),
    joined = await measureLeadershipConversationReplayJoinedInventory({
      schemaVersion: "1",
      root: context.taskRoot,
      manifestPath: context.manifestPath,
      secretPath: context.secretPath,
      joinedResultPath: context.joinedResultPath,
      sourceDigest: context.sourceDigest,
      taskDigest: context.taskDigest,
      runDigest: context.runDigest,
      framework: ar5bAuthenticatedRecoveryConformanceProfile.framework,
      profile: ar5bAuthenticatedRecoveryConformanceProfile,
    });
  assertJoinedReplayMeasurement(joined, context);
  assert.equal(atomicity.status, "PASS");
  return [
    record(
      "exact-replay",
      "materialization-owner",
      "run-atomicity-validation",
      "typed-owner-outcome",
      atomicity.boundaries.exactReplay ? "satisfied" : "failed",
      { value: atomicity.boundaries.exactReplay },
    ),
    record(
      "incompatible-replay",
      "materialization-owner",
      "run-atomicity-validation",
      "typed-owner-outcome",
      atomicity.boundaries.incompatibleReplay ? "satisfied" : "failed",
      { value: atomicity.boundaries.incompatibleReplay },
    ),
    record(
      "joined-duplicate-inventory-zero",
      "joined-inventory-owner",
      "measure-leadership-conversation-replay-joined-inventory",
      "exact-inventory",
      joined.duplicateFindings === 0 ? "satisfied" : "failed",
      {
        duplicateFindings: joined.duplicateFindings,
        inventoryDigest: joined.inventoryDigest,
      },
    ),
    record(
      "fresh-materialization-process-executed",
      "materialization-owner",
      "measure-durable-materialization-stage",
      "typed-owner-outcome",
      fresh.rootAbsentAfterCleanup ? "satisfied" : "failed",
      { processAttestationDigest: fresh.processAttestationDigest },
      { rootAbsentAfterCleanup: fresh.rootAbsentAfterCleanup },
    ),
    record(
      "fresh-materialization-durable-state-reconstructed",
      "materialization-owner",
      "measure-durable-materialization-stage",
      "typed-owner-outcome",
      fresh.workflowMaterializations === 1 &&
        fresh.workflowReceipts === 1 &&
        fresh.workflowPublications === 1
        ? "satisfied"
        : "failed",
      { measurementDigest: fresh.measurementDigest },
      {
        runtimeEvents: fresh.runtimeEvents,
        workflowMaterializations: fresh.workflowMaterializations,
        workflowReceipts: fresh.workflowReceipts,
        workflowPublications: fresh.workflowPublications,
        duplicateFindings: fresh.duplicateFindings,
      },
    ),
    record(
      "joined-owner-inventory-matched",
      "joined-inventory-owner",
      "measure-leadership-conversation-replay-joined-inventory",
      "exact-inventory",
      joined.familyCount === 27 ? "satisfied" : "failed",
      {
        familyCount: joined.familyCount,
        inventoryDigest: joined.inventoryDigest,
        taskAuthorityDigest: joined.taskAuthorityDigest,
      },
      {
        familyCount: joined.familyCount,
        inventoryDigest: joined.inventoryDigest,
      },
    ),
    record(
      "joined-owner-missing-findings-zero",
      "joined-inventory-owner",
      "measure-leadership-conversation-replay-joined-inventory",
      "exact-inventory",
      joined.missingFindings === 0 ? "satisfied" : "failed",
      {
        missingFindings: joined.missingFindings,
        measurementDigest: joined.measurementDigest,
      },
      {
        missingFindings: joined.missingFindings,
        familyCount: joined.familyCount,
        duplicateFindings: joined.duplicateFindings,
      },
    ),
    record(
      "joined-owner-foreign-state-preserved",
      "joined-inventory-owner",
      "measure-leadership-conversation-replay-joined-inventory",
      "durable-digest-comparison",
      joined.foreignPreserved ? "satisfied" : "failed",
      {
        foreignPreserved: joined.foreignPreserved,
        foreignStateDigest: joined.foreignStateDigest,
      },
    ),
  ];
}
async function authorizationMeasurements(context: Context) {
  const record = recorder(context, "replay-recovery", "replay-recovery"),
    originalLog = console.log,
    originalWarn = console.warn;
  let checks = 0;
  try {
    console.log = () => undefined;
    console.warn = () => undefined;
    checks = await validateCurrentAccessScenario("ar5b-current-access");
  } finally {
    console.log = originalLog;
    console.warn = originalWarn;
  }
  let authorizedReads = 0,
    unauthorizedReads = 0;
  const allowed = await recoverAuthorizedProtectedState({
      authorizeCurrent: async () => "authorized",
      loadProtected: async () => {
        authorizedReads++;
        return "content-safe";
      },
    }),
    denied = await recoverAuthorizedProtectedState({
      authorizeCurrent: async () => "unavailable",
      loadProtected: async () => {
        unauthorizedReads++;
        return "never";
      },
    });
  return [
    record(
      "authorization-before-protected-read",
      "current-access-owner",
      "validate-current-access-scenario",
      "protected-read-count",
      checks >= 125 && unauthorizedReads === 0 ? "satisfied" : "failed",
      { checks, authorizedReads, unauthorizedReads },
    ),
    record(
      "authorized-read",
      "recovery-coordinator",
      "recover-authorized-protected-state",
      "protected-read-count",
      allowed.outcome === "already-committed" && authorizedReads === 1
        ? "satisfied"
        : "failed",
      { outcome: allowed.outcome, authorizedReads },
    ),
    record(
      "unavailable-shape-neutral",
      "current-access-owner",
      "validate-current-access-scenario",
      "typed-owner-outcome",
      denied.outcome === "unavailable" && checks >= 125
        ? "satisfied"
        : "failed",
      { outcome: denied.outcome, checks },
    ),
    record(
      "unauthorized-protected-reads-zero",
      "current-access-owner",
      "validate-current-access-scenario",
      "protected-read-count",
      unauthorizedReads === 0 && checks >= 125 ? "satisfied" : "failed",
      { unauthorizedReads, checks },
    ),
  ];
}
const runtimeOrg = "ar5b-owner-measurement-org",
  runtimeBytes = (name: string) =>
    new TextEncoder().encode(
      JSON.stringify(
        createEmptyOrganizationRuntime({
          organizationId: runtimeOrg,
          name,
          now: "2026-08-26T12:00:00.000Z",
        }),
      ),
    ),
  byteDigest = (value: Uint8Array) =>
    createHash("sha256").update(value).digest("hex");
async function verifyAr5aEvidence() {
  const file =
      "docs/agent-work-orders/evidence/alpha-readiness/ar5a/AR5A_CORE_FAILURE_RECOVERY_RESULTS.json",
    bytes = await readFile(file),
    { stdout: committed } = await runFile(
      "git",
      ["show", `0c2dc4dd9dfdf2239186a47c00e3dcbfa776a761:${file}`],
      { cwd: process.cwd(), encoding: "buffer", maxBuffer: 16 * 1024 * 1024 },
    ),
    value = JSON.parse(bytes.toString("utf8")),
    envelopes = value.measurements
      .envelopes as CriticalFailureRecoveryMeasurementEnvelope[],
    envelopeDigestAggregate = validateCriticalFailureRecoveryEnvelopes({
      envelopes,
      sourceDigest: value.sourceDigest,
      runId: value.measurements.runId,
    }),
    changedPathsDigest = byteDigest(
      Buffer.from(JSON.stringify(value.measurements.changedPaths)),
    ),
    canonicalBase = adjudicateCriticalFailureRecovery({
      envelopes,
      sourceDigest: value.sourceDigest,
      changedPathsDigest,
      runId: value.measurements.runId,
    }),
    canonicalResultDigest = byteDigest(
      Buffer.from(JSON.stringify(canonicalBase)),
    ),
    exact =
      Buffer.compare(bytes, committed as Buffer) === 0 &&
      envelopeDigestAggregate === value.envelopeDigestAggregate &&
      changedPathsDigest === value.changedPathsDigest &&
      assert.deepEqual(value.measurements.adjudication, {
        ...canonicalBase,
        resultDigest: canonicalResultDigest,
      }) === undefined &&
      canonicalResultDigest === value.resultDigest &&
      value.ownerRecoveryStatus === "PASS" &&
      value.productReadinessStatus === "PASS";
  return {
    exact,
    evidenceDigest: byteDigest(bytes),
    sourceDigest: value.sourceDigest,
    resultDigest: value.resultDigest,
  };
}
async function provenanceMeasurements(context: Context) {
  const record = recorder(context, "replay-recovery", "replay-recovery"),verified=await verifyAr5aEvidence();
  return [
    record(
      "ar5a-provenance-exact",
      "ar5a-provenance-owner",
      "verify-immutable-ar5a-evidence",
      "durable-digest-comparison",
      verified.exact ? "satisfied" : "failed",
      verified,
    ),
  ];
}
async function runtimeMeasurements(context: Context) {
  const record = recorder(context, "replay-recovery", "replay-recovery"),
    root = await mkdtemp("/private/tmp/discovery-ar5b-recovery-");
  try {
    const seedRepository = new FilesystemOrganizationRuntimeRepository(root),
      seed = await seedRepository.create(runtimeOrg, runtimeBytes("seed"), {
        requestId: "seed",
        operatorId: "ar5b-validator",
      }),
      intended = runtimeBytes("recovered");
    let injected = 0;
    const faultRepository = new FilesystemOrganizationRuntimeRepository(root, {
      afterValidatedClaimBeforeCanonicalParentRevalidation: () => {
        injected++;
        throw new RuntimeStorageRecoveryBlockedError(
          "Runtime recovery is blocked",
        );
      },
    });
    await assert.rejects(
      () =>
        faultRepository.replace(runtimeOrg, intended, seed.revision, {
          requestId: "recover-request",
          operatorId: "ar5b-validator",
        }),
      RuntimeStorageRecoveryBlockedError,
    );
    const originalReader = await seedRepository.read(runtimeOrg);
    assert.ok(originalReader);
    const beforeDigest = byteDigest(originalReader.bytes),
      helper = new FilesystemOrganizationRuntimeRepository(root),
      recovered = await helper.replace(runtimeOrg, intended, seed.revision, {
        requestId: "recover-request",
        operatorId: "ar5b-validator",
      }),
      after = await helper.read(runtimeOrg);
    assert.ok(after);
    const afterDigest = byteDigest(after.bytes),
      repeated = await new FilesystemOrganizationRuntimeRepository(
        root,
      ).replace(runtimeOrg, intended, seed.revision, {
        requestId: "recover-request",
        operatorId: "ar5b-validator",
      });
    let conflict = false;
    try {
      await helper.replace(runtimeOrg, runtimeBytes("loser"), seed.revision, {
        requestId: "new-request",
        operatorId: "ar5b-validator",
      });
    } catch (error) {
      conflict = error instanceof RuntimeStorageConflictError;
    }
    const final = await helper.read(runtimeOrg);
    assert.ok(final);
    const finalDigest = byteDigest(final.bytes),
      malformedRoot = await mkdtemp(
        "/private/tmp/discovery-ar5b-recovery-malformed-",
      );
    let malformedBlocked = false;
    try {
      const malformedRepository = new FilesystemOrganizationRuntimeRepository(
          malformedRoot,
        ),
        malformedSeed = await malformedRepository.create(
          runtimeOrg,
          runtimeBytes("malformed-seed"),
          { requestId: "malformed-seed", operatorId: "ar5b-validator" },
        ),
        fault = new FilesystemOrganizationRuntimeRepository(malformedRoot, {
          afterValidatedClaimBeforeCanonicalParentRevalidation: () => {
            throw new RuntimeStorageRecoveryBlockedError(
              "Runtime recovery is blocked",
            );
          },
        });
      await assert.rejects(
        () =>
          fault.replace(
            runtimeOrg,
            runtimeBytes("malformed-next"),
            malformedSeed.revision,
            { requestId: "malformed-request", operatorId: "ar5b-validator" },
          ),
        RuntimeStorageRecoveryBlockedError,
      );
      await chmod(
        path.join(
          malformedRoot,
          `${runtimeOrg}.json.${malformedSeed.revision}.claim`,
        ),
        0o644,
      );
      try {
        await malformedRepository.replace(
          runtimeOrg,
          runtimeBytes("malformed-next"),
          malformedSeed.revision,
          { requestId: "malformed-request", operatorId: "ar5b-validator" },
        );
      } catch (error) {
        malformedBlocked = error instanceof RuntimeStorageRecoveryBlockedError;
      }
    } finally {
      await fsRm(malformedRoot, { recursive: true, force: true });
    }
    const helped = byteDigest(recovered.bytes) === afterDigest,
      replayed = repeated.revision === recovered.revision,
      canonicalPreserved = afterDigest === finalDigest;
    return [
      record(
        "current-build-owner-measured",
        "runtime-repository",
        "filesystem-runtime-replace",
        "typed-owner-outcome",
        helped ? "satisfied" : "failed",
        { injected, helped },
      ),
      record(
        "exact-operation-precedence",
        "runtime-repository",
        "filesystem-runtime-replace",
        "typed-owner-comparison",
        conflict && helped ? "satisfied" : "failed",
        { conflict, helped },
      ),
      record(
        "claim-help-converged",
        "runtime-repository",
        "filesystem-runtime-replace",
        "typed-owner-outcome",
        helped ? "satisfied" : "failed",
        { helped },
      ),
      record(
        "stale-terminal-reconstructed",
        "runtime-repository",
        "filesystem-runtime-replace",
        "typed-owner-comparison",
        helped && replayed ? "satisfied" : "failed",
        { helped, replayed },
      ),
      record(
        "original-reader-converged",
        "runtime-repository",
        "filesystem-runtime-read",
        "durable-digest-comparison",
        beforeDigest !== afterDigest && helped ? "satisfied" : "failed",
        { beforeDigest, afterDigest },
      ),
      record(
        "repeated-reconciliation-converged",
        "runtime-repository",
        "filesystem-runtime-replace",
        "typed-owner-comparison",
        replayed ? "satisfied" : "failed",
        {
          firstRevision: recovered.revision,
          secondRevision: repeated.revision,
        },
      ),
      record(
        "recovery-blocked",
        "runtime-repository",
        "filesystem-runtime-replace",
        "typed-owner-outcome",
        malformedBlocked ? "satisfied" : "failed",
        { malformedBlocked },
      ),
      record(
        "winning-canonical-bytes-unchanged",
        "runtime-repository",
        "filesystem-runtime-read",
        "durable-digest-comparison",
        canonicalPreserved ? "satisfied" : "failed",
        {
          beforeLosingOperationDigest: afterDigest,
          afterLosingOperationDigest: finalDigest,
        },
      ),
    ];
  } finally {
    await fsRm(root, { recursive: true, force: true });
  }
}
async function workflowMeasurements(context: Context) {
  const record = recorder(context, "replay-recovery", "replay-recovery"),
    root = await mkdtemp("/private/tmp/discovery-ar5b-workflow-");
  try {
    const repository = createProductWorkflowArtifactRepository({
        root,
        environment: "test",
      }),
      current = await repository.read(runtimeOrg),
      next = structuredClone(current.store),
      keyDigest = acceptanceDigest("workflow-key"),
      requestFingerprint = acceptanceDigest("workflow-request");
    next.idempotency.push({
      keyDigest,
      requestFingerprint,
      recordRef: "workflow-record",
    });
    let injected = 0;
    const fault = createProductWorkflowArtifactRepository({
      root,
      environment: "test",
      faultInjector: {
        afterPublication: () => {
          injected++;
          throw new ProductWorkflowRecoveryBlockedError();
        },
      },
    });
    await assert.rejects(
      () => fault.replace(runtimeOrg, next, current.revision),
      ProductWorkflowRecoveryBlockedError,
    );
    const recovered = await repository.replace(
        runtimeOrg,
        next,
        current.revision,
      ),
      replayed = await repository.replace(runtimeOrg, next, current.revision);
    let incompatible = false,
      conflict = false;
    const changed = structuredClone(next);
    changed.idempotency.push({
      keyDigest: acceptanceDigest("changed"),
      requestFingerprint: acceptanceDigest("changed-request"),
      recordRef: "changed-record",
    });
    try {
      await repository.replace(runtimeOrg, changed, current.revision);
    } catch (error) {
      incompatible =
        error instanceof ProductWorkflowIncompatibleIdempotencyReplayError;
    }
    try {
      await repository.replace(runtimeOrg, changed, current.revision);
    } catch (error) {
      conflict = error instanceof ProductWorkflowRevisionConflictError;
    }
    return [
      record(
        "exact-replay",
        "workflow-repository",
        "workflow-replace",
        "typed-owner-outcome",
        replayed.revision === recovered.revision ? "satisfied" : "failed",
        { first: recovered.revision, second: replayed.revision },
      ),
      record(
        "incompatible-replay",
        "workflow-repository",
        "workflow-replace",
        "typed-owner-outcome",
        incompatible ? "satisfied" : "failed",
        { incompatible },
      ),
      record(
        "cas-conflict",
        "workflow-repository",
        "workflow-replace",
        "typed-owner-outcome",
        conflict ? "satisfied" : "failed",
        { conflict },
      ),
      record(
        "acknowledgement-loss-recovered-current-build",
        "workflow-repository",
        "workflow-replace",
        "typed-owner-comparison",
        injected === 1 && replayed.revision === recovered.revision
          ? "satisfied"
          : "failed",
        { injected, first: recovered.revision, second: replayed.revision },
      ),
    ];
  } finally {
    await fsRm(root, { recursive: true, force: true });
  }
}
async function observabilityMeasurements(context: Context) {
  const record = recorder(context, "observability", "event-observation"),
    joined = await readJoinedReplayMeasurement(
      context.joinedResultPath,
      context,
    ),
    observations: string[] = [],
    control = await recoverAuthorizedProtectedState({
      authorizeCurrent: async () => "authorized",
      loadProtected: async () => "content-safe",
      observe: async (value) => {
        observations.push(value.outcome);
      },
    }),
    throwing = await recoverAuthorizedProtectedState({
      authorizeCurrent: async () => "authorized",
      loadProtected: async () => "content-safe",
      observe: async () => {
        throw new Error("contained");
      },
    }),
    parity = control.outcome === throwing.outcome,
    telemetryRoot=await mkdtemp(path.join(context.taskRoot,"telemetry-parity-"));
  await chmod(telemetryRoot,0o700);
  const telemetry:any=await measureAlphaTelemetryParityMatrix({schemaVersion:"1",sourceDigest:context.sourceDigest,frameworkId:"authenticated-alpha-acceptance",frameworkVersion:"1",foundationId:"authenticated-alpha-acceptance-foundation",foundationVersion:"1.2",profileId:"ar5b-authenticated-recovery-conformance",profileVersion:"version-1",taskDigest:context.taskDigest,runDigest:context.runDigest,executionSegmentDigest:context.segmentDigest,recipe:"alpha-current-build-telemetry-parity-13-state-v1",root:telemetryRoot}),telemetryUnsigned=Object.fromEntries(Object.entries(telemetry).filter(([key])=>key!=="measurementDigest"));
  assert.equal(telemetry.measurementDigest,byteDigest(Buffer.from(JSON.stringify(telemetryUnsigned))));
  const expectedTelemetryStates=["enabled-consent","disabled","consent-absent","consent-expired","consent-revoked","missing-active-key","missing-historical-key","repository-rejecting","repository-throwing","repository-unavailable","sweep-failure","deletion-pending","denied-operator"],telemetryMeasurements=telemetry.measurements as any[],telemetryIdentitiesMatched=telemetryMeasurements.every(value=>value.sourceDigest===context.sourceDigest&&value.profileId==="ar5b-authenticated-recovery-conformance"&&value.taskDigest===context.taskDigest&&value.runDigest===context.runDigest&&value.executionSegmentDigest===context.segmentDigest&&value.recipe==="alpha-current-build-telemetry-parity-13-state-v1"&&value.stateMeasurementDigest===byteDigest(Buffer.from(JSON.stringify(Object.fromEntries(Object.entries(value).filter(([key])=>key!=="stateMeasurementDigest")))))),telemetryParity=JSON.stringify(telemetry.stateInventory)===JSON.stringify(expectedTelemetryStates)&&new Set(telemetry.stateInventory).size===expectedTelemetryStates.length&&telemetryMeasurements.length===expectedTelemetryStates.length&&telemetryIdentitiesMatched&&new Set(telemetryMeasurements.map(value=>value.productOutputDigest)).size===1&&telemetryMeasurements.every(value=>value.durableProductBeforeDigest===value.durableProductAfterDigest)&&new Set(telemetryMeasurements.map(value=>value.recoveryOutcomeDigest)).size===1&&telemetry.enabledControlMeasurementDigest===telemetryMeasurements[0]?.stateMeasurementDigest&&telemetry.telemetryLocalCleanup.rootAbsent===true&&telemetry.telemetryLocalCleanup.remainingAfterCleanup===0;
  return ar5bAuthenticatedRecoveryConformanceProfile.requiredMeasurements
    .find((value) => value.producer === "observability")!
    .factIds.map((factId) => {
      const satisfied =
        factId === "observer-parity"
          ? joined.observerParityCategory === "measured-match" &&
            joined.eventOrderingFindings === 0 &&
            joined.eventPairingFindings === 0
          : factId === "product-output-parity"
            ? joined.observerParityCategory === "measured-match"
            : factId === "durable-state-parity"
              ? joined.observerParityCategory === "measured-match"
              : factId === "telemetry-parity"
                ? telemetryParity
              : factId === "recovery-outcome-parity" ||
                  factId === "authorization-parity"
                ? parity
                : false;
      return record(
        factId,
        factId === "telemetry-parity"
          ? "telemetry-owner"
          : "observability-owner",
        factId === "telemetry-parity"
          ? "telemetry-owner-parity"
          : "recover-authorized-protected-state",
        "durable-digest-comparison",
        satisfied ? "satisfied" : "unavailable",
        {
          control: acceptanceDigest(control),
          throwing: acceptanceDigest(throwing),
          joinedMeasurementDigest: joined.measurementDigest,
          observerProductDigest: joined.observerModeProductOutputDigest,
          observerDurableDigest: joined.observerModeDurableStateDigest,
          observerEventDigest: joined.observerModeEventInventoryDigest,
          observationCount: observations.length,
          telemetryMeasurementDigest:telemetry.measurementDigest,
          telemetryStateCount:telemetryMeasurements.length,
        },
        {
          control: acceptanceDigest(control),
          throwing: acceptanceDigest(throwing),
          observerProductDigest: joined.observerModeProductOutputDigest,
          observerDurableDigest: joined.observerModeDurableStateDigest,
          observerEventDigest: joined.observerModeEventInventoryDigest,
          observationCount: observations.length,
          telemetryStateInventoryDigest: acceptanceDigest(
            telemetry.stateInventory,
          ),
          telemetryOwnerOutcomeDigest:
            telemetry.distinctOwnerStateControlDigest,
          telemetryProductOutputDigest: acceptanceDigest(
            telemetryMeasurements.map((value) => value.productOutputDigest),
          ),
          telemetryDurableStateDigest: acceptanceDigest(
            telemetryMeasurements.map((value) => [
              value.durableProductBeforeDigest,
              value.durableProductAfterDigest,
            ]),
          ),
          telemetryRecoveryOutcomeDigest: acceptanceDigest(
            telemetryMeasurements.map((value) => value.recoveryOutcomeDigest),
          ),
          telemetryStateCount: telemetryMeasurements.length,
        },
      );
    });
}
let ar5bProducerStage = "producer-bootstrap";
async function producer(mode: string) {
  ar5bProducerStage = "producer-authority";
  const raw = process.env.AR2_PRE_001B_MEASUREMENT_REQUEST,
    manifestPath = process.env.AR2_PRE_001B_AR5B_MANIFEST_PATH,
    secretPath = process.env.AR2_PRE_001B_AR5B_SECRET_PATH,
    joinedResultPath = process.env.AR2_PRE_001B_AR5B_JOINED_RESULT_PATH,
    replayRecordsPath = process.env.AR2_PRE_001B_AR5B_REPLAY_RECORDS_PATH,
    observabilityRecordsPath =
      process.env.AR2_PRE_001B_AR5B_OBSERVABILITY_RECORDS_PATH;
  if (
    !raw ||
    !manifestPath ||
    !secretPath ||
    !joinedResultPath ||
    !replayRecordsPath ||
    !observabilityRecordsPath
  )
    throw new Error("AR-5B measurement request is absent");
  const taskRoot = path.dirname(manifestPath);
  const request = JSON.parse(Buffer.from(raw, "base64").toString("utf8")),
    context: Context = {
      sourceDigest: request.sourceDigest,
      taskDigest: request.taskDigest,
      runDigest: request.runDigest,
      segmentDigest: acceptanceDigest({
        pid: process.pid,
        mode,
        run: request.runDigest,
      }),
      taskRoot,
      manifestPath,
      secretPath,
      joinedResultPath,
      replayRecordsPath,
      observabilityRecordsPath,
    };
  if (mode === "ar5b-observability") {
    ar5bProducerStage = "producer-observability";
    const records = await observabilityMeasurements(context);
    await writeOwnerRecordPacket(
      observabilityRecordsPath,
      "observability",
      context,
      records,
    );
    process.stdout.write(
      `${JSON.stringify(recordsEnvelope(context, "observability", "event-observation", 3, records))}\n`,
    );
    return;
  }
  assert.equal(mode, "ar5b-replay-recovery");
  const measured = new Map<RecoveryFact, RecordV1>();
  ar5bProducerStage = "producer-runtime";
  const runtime = await runtimeMeasurements(context);
  ar5bProducerStage = "producer-workflow";
  const workflow = await workflowMeasurements(context);
  ar5bProducerStage = "producer-materialization";
  const materialization = await materializationMeasurements(context);
  ar5bProducerStage = "producer-authorization";
  const authorization = await authorizationMeasurements(context);
  ar5bProducerStage = "producer-provenance";
  const provenance = await provenanceMeasurements(context);
  for (const item of [...runtime, ...workflow, ...materialization, ...authorization, ...provenance])
    measured.set(item.factId, item);
  const make = recorder(context, "replay-recovery", "replay-recovery"),
    records = ar5bAuthenticatedRecoveryConformanceProfile.requiredMeasurements
      .find((value) => value.producer === "replay-recovery")!
      .factIds.map(
        (factId) =>
          measured.get(factId) ??
          make(
            factId,
            factId === "ar5a-provenance-exact"
              ? "ar5a-provenance-owner"
              : "runtime-repository",
            factId,
            "typed-owner-outcome",
            "unavailable",
            { reasonCategory: "owner-measurement-not-yet-executed" },
          ),
      );
  ar5bProducerStage = "producer-envelope";
  await writeOwnerRecordPacket(
    replayRecordsPath,
    "replay-recovery",
    context,
    records,
  );
  process.stdout.write(
    `${JSON.stringify(recordsEnvelope(context, "replay-recovery", "replay-recovery", 2, records))}\n`,
  );
}
const evidenceRoot = "docs/agent-work-orders/evidence/alpha-readiness/ar5b",
  jsonPath = path.join(
    evidenceRoot,
    "AR5B_AUTHENTICATED_RECOVERY_CONFORMANCE_RESULTS.json",
  ),
  reportPath = path.join(
    evidenceRoot,
    "AR5B_AUTHENTICATED_RECOVERY_CONFORMANCE_REPORT.md",
  ),
  producerScript =
    "scripts/acceptance/validateAr5bAuthenticatedRecoveryConformance.ts";
async function sourceIdentity() {
  const { stdout } = await runFile("git", ["ls-files", "-z"], {
      cwd: process.cwd(),
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    }),
    tracked = stdout.split("\0").filter(Boolean),
    paths = [
      ...new Set([
        ...tracked,
        "scripts/acceptance/ar5bAuthenticatedRecoveryConformanceProfile.ts",
        producerScript,
        "scripts/product/validateAlphaCriticalFailureRecovery.ts",
        "scripts/product/validateCanonicalMutationProductMaterializationAtomicity.ts",
        "scripts/product/validateLeadershipConversationReplay.ts",
      ]),
    ]
      .filter(
        (value) =>
          value !== jsonPath &&
          value !== reportPath &&
          value !== "docs/Product/PRODUCT_ROADMAP.md",
      )
      .sort(),
    entries = [] as { pathDigest: string; digest: string }[];
  for (const file of paths)
    entries.push({
      pathDigest: byteDigest(Buffer.from(file)),
      digest: byteDigest(await readFile(file)),
    });
  return { paths: entries, digest: acceptanceDigest(entries) };
}
async function qualificationIdentities() {
  const pre001aPath =
      "docs/agent-work-orders/evidence/alpha-readiness/ar2-pre-001a/AR2_PRE_001A_MEASURED_ACCEPTANCE_FRAMEWORK_QUALIFICATION_RESULTS.json",
    foundationPath =
      "docs/agent-work-orders/evidence/alpha-readiness/ar2-pre-001b-v1-2/AR2_PRE_001B_ACCEPTANCE_FOUNDATION_V1_2_QUALIFICATION_RESULTS.json",
    pre001aBytes = await readFile(pre001aPath),
    foundationBytes = await readFile(foundationPath),
    pre001a = JSON.parse(pre001aBytes.toString("utf8")),
    foundation = JSON.parse(foundationBytes.toString("utf8"));
  assert.equal(pre001a.result, "PASS");
  assert.equal(foundation.status, "PASS");
  return {
    boundaryCommit: "c823deb6c82edbdc31361c1dd3631f0b99c6512d",
    framework: pre001a.framework,
    pre001a: {
      evidenceDigest: byteDigest(pre001aBytes),
      sourceDigest: pre001a.sourceDigest,
      qualificationResultDigest: pre001a.qualificationResultDigest,
      result: pre001a.result,
    },
    foundationV12: {
      identity: foundation.foundationIdentity,
      apiIdentity: foundation.apiIdentity,
      evidenceDigest: byteDigest(foundationBytes),
      sourceDigest: foundation.source.digest,
      semanticDigest: foundation.semanticDigest,
      resultDigest: foundation.resultDigest,
      status: foundation.status,
    },
  };
}
function extendManifest(
  base: AcceptanceTaskManifest,
  secret: Buffer,
): AcceptanceTaskManifest {
  const resources = [
      ...base.resources,
      ...Array.from({ length: 3 }, (_, index) => ({
        kind: "protected-file" as const,
        ordinal: base.resources.length + index,
      })),
    ],
    unsigned = {
      schemaVersion: base.schemaVersion,
      environment: base.environment,
      sourceDigest: base.sourceDigest,
      taskDigest: base.taskDigest,
      ownershipMarker: base.ownershipMarker,
      resources,
      organizationPlan: base.organizationPlan,
    };
  return {
    ...unsigned,
    integrityMac: createHmac("sha256", secret)
      .update(JSON.stringify(unsigned))
      .digest("hex"),
  };
}
async function createRegistry(
  sourceDigest: string,
  manifestPath: string,
  secret: Buffer,
) {
  const scripts = [producerScript],
    entries = await inspectAcceptanceProducerSourceEntriesV1(scripts),
    payload = { schemaVersion: "1" as const, sourceDigest, entries },
    authorityMac = createHmac("sha256", secret)
      .update(JSON.stringify(payload))
      .digest("hex"),
    sourceManifest = await createAcceptanceProducerSourceManifestV1({
      sourceDigest,
      scripts,
      authorityMac,
      taskOwnership: { manifestPath, secret },
    }),
    common = {
      profileId: ar5bAuthenticatedRecoveryConformanceProfile.profile.id,
      profileVersion:
        ar5bAuthenticatedRecoveryConformanceProfile.profile.version,
      script: producerScript,
      sourceManifestDigest: sourceManifest.manifestDigest,
      timeoutMs: 900_000,
      stages: [
        { category: "bootstrap" as const, token: "producer-bootstrap" },
        { category: "bootstrap" as const, token: "producer-authority" },
        { category: "execution" as const, token: "producer-runtime" },
        { category: "execution" as const, token: "producer-workflow" },
        { category: "execution" as const, token: "producer-materialization" },
        { category: "execution" as const, token: "producer-authorization" },
        { category: "execution" as const, token: "producer-provenance" },
        { category: "execution" as const, token: "producer-observability" },
        { category: "measurement" as const, token: "producer-envelope" },
      ],
    },
    environmentKeys = [
      "AR2_PRE_001B_AR5B_MANIFEST_PATH",
      "AR2_PRE_001B_AR5B_SECRET_PATH",
      "AR2_PRE_001B_AR5B_JOINED_RESULT_PATH",
      "AR2_PRE_001B_AR5B_REPLAY_RECORDS_PATH",
      "AR2_PRE_001B_AR5B_OBSERVABILITY_RECORDS_PATH",
    ],
    replay = await createAcceptanceProducerDescriptorV1({
      ...common,
      producer: "replay-recovery",
      phase: "replay-recovery",
      sequence: 2,
      mode: "ar5b-replay-recovery",
      environmentKeys,
    }),
    observability = await createAcceptanceProducerDescriptorV1({
      ...common,
      producer: "observability",
      phase: "event-observation",
      sequence: 3,
      mode: "ar5b-observability",
      environmentKeys,
    });
  return {
    registry: createAcceptanceProducerRegistryV1(sourceManifest, [
      replay,
      observability,
    ]),
    replay,
    observability,
  };
}
function report(value: any) {
  return `# AR-5B Authenticated Recovery Conformance\n\n- Result: **${value.adjudication.result}**\n- Producer envelopes: ${value.envelopes.length}\n- Source digest: \`${value.sourceDigest}\`\n- Result digest: \`${value.resultDigest}\`\n- Deterministic repeat: **${value.deterministicRepeat.status}**\n- Cleanup: **${value.cleanup.independentZero}**\n`;
}
function semanticProjection(value: any) {
  return {
    provenance: value.provenance,
    envelopes: value.envelopes.map((envelope: any) => ({
      producer: envelope.producer,
      phase: envelope.phase,
      sequence: envelope.sequence,
      observations: envelope.observations,
    })),
    adjudication: {
      result: value.adjudication.result,
      reasonCategories: value.adjudication.reasonCategories,
      inventory: value.adjudication.inventory,
    },
    scanner: value.scanner,
    cleanup: value.cleanup,
    ownerMeasurements: Object.values(value.ownerMeasurements).map(
      (packet: any) => ({
        producer: packet.producer,
        records: packet.records.map((record: RecordV1, index: number) => ({
          factId: record.factId,
          ownerBoundary: record.ownerBoundary,
          ownerOperation: record.ownerOperation,
          measurementKind: record.measurementKind,
          inputDigest: record.inputDigest,
          stableComparisonDigest: packet.stableComparisonDigests[index],
          ownerOutcome: record.ownerOutcome,
          observedCategory: record.observedCategory,
        })),
      }),
    ),
    joinedOwnerMeasurement: {
      schemaVersion: value.joinedOwnerMeasurement.schemaVersion,
      owner: value.joinedOwnerMeasurement.owner,
      executionAuthorityCategory:
        value.joinedOwnerMeasurement.executionAuthorityCategory,
      profileDigest: value.joinedOwnerMeasurement.profileDigest,
      recipe: value.joinedOwnerMeasurement.recipe,
      processTopology: value.joinedOwnerMeasurement.processTopology,
      familyCount: value.joinedOwnerMeasurement.familyCount,
      inventoryDigest: value.joinedOwnerMeasurement.inventoryDigest,
      duplicateFindings: value.joinedOwnerMeasurement.duplicateFindings,
      missingFindings: value.joinedOwnerMeasurement.missingFindings,
      foreignPreserved: value.joinedOwnerMeasurement.foreignPreserved,
      foreignStateDigest: value.joinedOwnerMeasurement.foreignStateDigest,
      executionSegmentCount:
        value.joinedOwnerMeasurement.executionSegmentCount,
      observerModeProductOutputDigest:
        value.joinedOwnerMeasurement.observerModeProductOutputDigest,
      observerModeDurableStateDigest:
        value.joinedOwnerMeasurement.observerModeDurableStateDigest,
      observerModeEventInventoryDigest:
        value.joinedOwnerMeasurement.observerModeEventInventoryDigest,
      observerParityCategory:
        value.joinedOwnerMeasurement.observerParityCategory,
      eventCount: value.joinedOwnerMeasurement.eventCount,
      eventOrderingFindings:
        value.joinedOwnerMeasurement.eventOrderingFindings,
      eventPairingFindings:
        value.joinedOwnerMeasurement.eventPairingFindings,
      cleanupCategory: value.joinedOwnerMeasurement.cleanupCategory,
    },
  };
}
export function ar5bAuthenticatedRecoveryStableSemanticDigest(value: unknown) {
  assertAr5bAuthenticatedRecoveryCurrentBuildMeasurement(value);
  return acceptanceDigest(semanticProjection(value));
}
function semanticDifferencePaths(left: any, right: any, prefix = "root"): string[] {
  if (typeof left !== typeof right) return [prefix];
  if (left === null || right === null || typeof left !== "object")
    return left === right ? [] : [prefix];
  const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
  return keys.flatMap((key) =>
    semanticDifferencePaths(left[key], right[key], `${prefix}.${key}`),
  );
}
function validatePersistedOwnerMeasurements(value: any) {
  for (const [key, producer] of [
    ["replayRecovery", "replay-recovery"],
    ["observability", "observability"],
  ] as const) {
    const packet = value.ownerMeasurements[key] as OwnerRecordPacket;
    assert.equal(packet.schemaVersion, "2");
    assert.equal(packet.producer, producer);
    assert.equal(packet.sourceDigest, value.sourceDigest);
    assert.equal(packet.taskDigest, value.taskDigest);
    assert.equal(packet.runDigest, value.runDigest);
    packet.records.forEach(assertRecord);
    assert.equal(packet.stableComparisonDigests.length, packet.records.length);
    packet.stableComparisonDigests.forEach((digest) =>
      assert.match(digest, digestPattern),
    );
    assert.equal(
      packet.recordDigestAggregate,
      acceptanceDigest(packet.records.map((record) => record.measurementDigest)),
    );
    const envelope = value.envelopes.find(
      (candidate: any) => candidate.producer === producer,
    );
    assert.equal(envelope.measurementId, packet.recordDigestAggregate);
    assert.deepEqual(
      packet.records.map((record) => ({
        factId: record.factId,
        state: state(record),
      })),
      envelope.observations,
    );
  }
  assert.equal(
    value.envelopeDigestAggregate,
    acceptanceDigest(
      value.envelopes.map((envelope: any) => envelope.measurementDigest),
    ),
  );
  assertJoinedReplayMeasurement(value.joinedOwnerMeasurement, {
    sourceDigest: value.sourceDigest,
    taskDigest: value.taskDigest,
    runDigest: value.runDigest,
  } as Context);
  assert.equal(
    value.joinedOwnerObservationDigest,
    value.joinedOwnerMeasurement.measurementDigest,
  );
}
function childFailureCategory(stderr: string) {
  for (const [needle, category] of [
    ["readJoinedReplayMeasurement", "joined-result-rejected"],
    ["observabilityMeasurements", "observability-measurement-rejected"],
    ["validateReplayTaskAuthority", "path8-authority-rejected"],
    [
      "measureLeadershipConversationReplayJoinedInventory",
      "path8-measurement-rejected",
    ],
    ["runtimeMeasurements", "runtime-measurement-rejected"],
    ["workflowMeasurements", "workflow-measurement-rejected"],
    ["materializationMeasurements", "materialization-measurement-rejected"],
    ["authorizationMeasurements", "authorization-measurement-rejected"],
  ] as const)
    if (stderr.includes(needle)) return category;
  if (stderr.includes("Canonical value contains a prohibited string"))
    return "canonical-value-rejected";
  if (stderr.includes("Authenticated acceptance task ownership is invalid"))
    return "task-ownership-rejected";
  if (stderr.includes("AssertionError")) return "owner-assertion-rejected";
  if (stderr.includes("TypeError")) return "owner-type-error";
  if (stderr.includes("ERR_MODULE_NOT_FOUND"))
    return "module-resolution-failed";
  return "closed-unknown-failure";
}
async function measured() {
  const source = await sourceIdentity(),
    taskRoot = await mkdtemp("/private/tmp/discovery-ar2-pre-001b-task-"),
    secret = createTaskSecret();
  let browserRoot = "";
  const previousBrowserRoot = process.env.PLAYWRIGHT_BROWSERS_PATH,
    previousTmpdir = process.env.TMPDIR;
  process.env.TMPDIR = "/private/tmp";
  await chmod(taskRoot, 0o700);
  try {
    const secretPath = path.join(taskRoot, "foundation-secret.bin"),
      joinedResultPath = path.join(
        taskRoot,
        "ar5b-path8-joined-owner-result.json",
      ),
      replayRecordsPath = path.join(taskRoot, "ar5b-replay-owner-records.json"),
      observabilityRecordsPath = path.join(
        taskRoot,
        "ar5b-observability-owner-records.json",
      ),
      manifestPath = path.join(taskRoot, "manifest.json");
    await writeFile(secretPath, secret, { mode: 0o600 });
    await writeFile(joinedResultPath, "", { mode: 0o600 });
    await writeFile(replayRecordsPath, "", { mode: 0o600 });
    await writeFile(observabilityRecordsPath, "", { mode: 0o600 });
    const manifest = extendManifest(
        createAcceptanceTaskManifest({
          sourceDigest: source.digest,
          secret,
          organizationPlan: "not-applicable-capability-disabled",
        }),
        secret,
      ),
      runDigest = acceptanceDigest({
        sourceDigest: source.digest,
        taskDigest: manifest.taskDigest,
        profile: ar5bAuthenticatedRecoveryConformanceProfile.profile,
      });
    await writeOwnerProtectedManifest(manifestPath, manifest);
    browserRoot = await mkdtemp("/private/tmp/discovery-ar2-pre-001b-browser-");
    process.env.PLAYWRIGHT_BROWSERS_PATH = browserRoot;
    await runFile("npx", ["playwright", "install", "chromium"], {
      cwd: process.cwd(),
      env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: browserRoot },
      maxBuffer: 16 * 1024 * 1024,
    });
    const secretBefore = byteDigest(await readFile(secretPath)),
      descriptors = await createRegistry(source.digest, manifestPath, secret),
      requestBase = {
        frameworkId: ar5bAuthenticatedRecoveryConformanceProfile.framework.id,
        frameworkVersion:
          ar5bAuthenticatedRecoveryConformanceProfile.framework.version,
        sourceDigest: source.digest,
        taskDigest: manifest.taskDigest,
        runDigest,
        profileId: ar5bAuthenticatedRecoveryConformanceProfile.profile.id,
        profileVersion:
          ar5bAuthenticatedRecoveryConformanceProfile.profile.version,
      },
      producerEnvironment = {
        AR2_PRE_001B_AR5B_MANIFEST_PATH: manifestPath,
        AR2_PRE_001B_AR5B_SECRET_PATH: secretPath,
        AR2_PRE_001B_AR5B_JOINED_RESULT_PATH: joinedResultPath,
        AR2_PRE_001B_AR5B_REPLAY_RECORDS_PATH: replayRecordsPath,
        AR2_PRE_001B_AR5B_OBSERVABILITY_RECORDS_PATH:
          observabilityRecordsPath,
      },
      taskOwnership = { root: taskRoot, manifestPath, secret };
    const replay = await runAcceptanceMeasurementChild({
      descriptor: descriptors.replay,
      registry: descriptors.registry,
      profile: ar5bAuthenticatedRecoveryConformanceProfile,
      request: {
        ...requestBase,
        producer: "replay-recovery",
        phase: "replay-recovery",
      },
      taskOwnership,
      producerEnvironment,
    });
    if (replay.outcome !== "accepted-envelope")
      throw new Error(
        `Replay producer failed: ${JSON.stringify(replay.diagnostic)} category=${childFailureCategory(replay.stderr)}`,
      );
    const joined = await readJoinedReplayMeasurement(joinedResultPath, {
      sourceDigest: source.digest,
      taskDigest: manifest.taskDigest,
      runDigest,
      segmentDigest: "0".repeat(64),
      taskRoot,
      manifestPath,
        secretPath,
        joinedResultPath,
        replayRecordsPath,
        observabilityRecordsPath,
      });
    const replayOwnerMeasurements = await readOwnerRecordPacket(
      replayRecordsPath,
      "replay-recovery",
      {
        sourceDigest: source.digest,
        taskDigest: manifest.taskDigest,
        runDigest,
        segmentDigest: "0".repeat(64),
        taskRoot,
        manifestPath,
        secretPath,
        joinedResultPath,
        replayRecordsPath,
        observabilityRecordsPath,
      },
      secret,
    );
    assert.equal(byteDigest(await readFile(secretPath)), secretBefore);
    const observability = await runAcceptanceMeasurementChild({
      descriptor: descriptors.observability,
      registry: descriptors.registry,
      profile: ar5bAuthenticatedRecoveryConformanceProfile,
      request: {
        ...requestBase,
        producer: "observability",
        phase: "event-observation",
      },
      taskOwnership,
      producerEnvironment,
    });
    if (observability.outcome !== "accepted-envelope")
      throw new Error(
        `Observability producer failed: ${JSON.stringify(observability.diagnostic)} category=${childFailureCategory(observability.stderr)}`,
      );
    assert.equal(
      (
        await readJoinedReplayMeasurement(joinedResultPath, {
          sourceDigest: source.digest,
          taskDigest: manifest.taskDigest,
          runDigest,
          segmentDigest: "0".repeat(64),
          taskRoot,
          manifestPath,
          secretPath,
          joinedResultPath,
          replayRecordsPath,
          observabilityRecordsPath,
        })
      ).measurementDigest,
      joined.measurementDigest,
    );
    const observabilityOwnerMeasurements = await readOwnerRecordPacket(
        observabilityRecordsPath,
        "observability",
        {
          sourceDigest: source.digest,
          taskDigest: manifest.taskDigest,
          runDigest,
          segmentDigest: "0".repeat(64),
          taskRoot,
          manifestPath,
          secretPath,
          joinedResultPath,
          replayRecordsPath,
          observabilityRecordsPath,
        },
        secret,
      ),
      producerProtectedValues = [
        { category: "task-secret-hex", value: secret.toString("hex") },
        { category: "task-secret-base64", value: secret.toString("base64") },
        { category: "protected-canary", value: "AR5B-Protected-Canary" },
        { category: "credential-canary", value: "AR5B-Credential-Canary" },
      ],
      producerStreamFindings = scanText(
        "ar5b-producer-streams",
        `${replay.stdout}\n${replay.stderr}\n${observability.stdout}\n${observability.stderr}`,
        producerProtectedValues,
      ),
      producerSensitivity = scanText(
        "ar5b-producer-scanner-sensitivity",
        "AR5B-Protected-Canary\nAR5B-Credential-Canary",
        producerProtectedValues.slice(2),
      );
    assert.equal(producerStreamFindings.length, 0);
    assert.equal(producerSensitivity.length, 2);
    const ownership = await validateAuthenticatedAlphaTaskOwnershipV1({
        schemaVersion: "1",
        root: taskRoot,
        manifestPath,
        secret,
        framework: ar5bAuthenticatedRecoveryConformanceProfile.framework,
        profile: ar5bAuthenticatedRecoveryConformanceProfile,
        sourceDigest: source.digest,
        taskDigest: manifest.taskDigest,
        runDigest,
      }),
      ordinaryFactIds =
        ar5bAuthenticatedRecoveryConformanceProfile.requiredMeasurements
          .filter(
            (value) =>
              value.producer !== "replay-recovery" &&
              value.producer !== "observability",
          )
          .flatMap((value) => value.factIds),
      ordinary = await measureAuthenticatedAlphaCurrentBuild({
        schemaVersion: "1",
        framework: ar5bAuthenticatedRecoveryConformanceProfile.framework,
        profile: ar5bAuthenticatedRecoveryConformanceProfile,
        sourceDigest: source.digest,
        taskDigest: manifest.taskDigest,
        runDigest,
        taskOwnership: ownership,
        journeyProgram: AUTHENTICATED_ALPHA_ORDINARY_JOURNEY_ID,
        roles: ["ceo", "director", "manager", "denied"],
        viewports: ["desktop-1440x1000", "narrow-390x844"],
        ordinaryFactIds,
      }),
      envelopes = [
        ...ordinary.envelopes,
        replay.measurement,
        observability.measurement,
      ].sort((a, b) => a.sequence - b.sequence),
      adjudication = adjudicateAuthenticatedAlphaAcceptance({
        profile: ar5bAuthenticatedRecoveryConformanceProfile,
        measurements: envelopes,
        sourceDigest: source.digest,
        taskDigest: manifest.taskDigest,
      });
    if (adjudication.result !== "PASS") {
      const nonpassingFacts = envelopes.flatMap((envelope) =>
        envelope.observations
          .filter(
            (observation) =>
              !["observed", "match", "executed"].includes(observation.state),
          )
          .map((observation) => ({
            factId: observation.factId,
            state: observation.state,
          })),
      );
      throw new Error(
        `AR-5B adjudication blocked: ${JSON.stringify({ reasons: adjudication.reasonCategories, inventory: adjudication.inventory, nonpassingFacts })}`,
      );
    }
    const qualification = await qualificationIdentities(),
      ar5aProvenance = await verifyAr5aEvidence(),
      base = {
      schemaVersion: "1",
      kind: "ar5b-authenticated-recovery-conformance",
      provenance: {
        ...qualification,
        profileDigest: acceptanceDigest(
          ar5bAuthenticatedRecoveryConformanceProfile,
        ),
        journeyProgramDigest: acceptanceDigest(
          AUTHENTICATED_ALPHA_ORDINARY_JOURNEY_ID,
        ),
        factCatalogDigest: acceptanceDigest(
          ar5bAuthenticatedRecoveryConformanceProfile.requiredMeasurements,
        ),
        producerSourceManifestDigest:
          descriptors.registry.sourceManifest.manifestDigest,
        registryDigest: descriptors.registry.registryDigest,
        descriptorDigests: [
          descriptors.replay.descriptorDigest,
          descriptors.observability.descriptorDigest,
        ],
        ar5a: ar5aProvenance,
        controlTowerClosure: {
          excludedPathDigest: byteDigest(
            Buffer.from("docs/Product/PRODUCT_ROADMAP.md"),
          ),
          transitionCategory: "one-path-descendant-after-implementation",
        },
      },
      sourceDigest: source.digest,
      sourceManifest: source,
      taskDigest: manifest.taskDigest,
      runDigest,
      envelopes,
      joinedOwnerObservationDigest: joined.measurementDigest,
      joinedOwnerMeasurement: joined,
      ownerMeasurements: {
        replayRecovery: replayOwnerMeasurements,
        observability: observabilityOwnerMeasurements,
      },
      envelopeDigestAggregate: acceptanceDigest(
        envelopes.map((envelope) => envelope.measurementDigest),
      ),
      adjudication,
      scanner: {
        sensitivity: ordinary.scanner.sensitivity + producerSensitivity.length,
        publicFindings:
          ordinary.scanner.publicFindings + producerStreamFindings.length,
        producerStreamSurfaces: 4,
      },
      cleanup: ordinary.cleanup,
    };
    assert.deepEqual(
      scanText("ar5b-result-candidate", JSON.stringify(base), [
        { category: "task-secret-hex", value: secret.toString("hex") },
        { category: "task-secret-base64", value: secret.toString("base64") },
      ]),
      [],
    );
    return { ...base, resultDigest: acceptanceDigest(base) };
  } finally {
    secret.fill(0);
    if (previousBrowserRoot === undefined)
      delete process.env.PLAYWRIGHT_BROWSERS_PATH;
    else process.env.PLAYWRIGHT_BROWSERS_PATH = previousBrowserRoot;
    if (previousTmpdir === undefined) delete process.env.TMPDIR;
    else process.env.TMPDIR = previousTmpdir;
    await fsRm(taskRoot, { recursive: true, force: true });
    if (browserRoot) await fsRm(browserRoot, { recursive: true, force: true });
    await assert.rejects(() => readFile(taskRoot));
    if (browserRoot) await assert.rejects(() => readFile(browserRoot));
  }
}
async function writeEvidence() {
  const first = await measured(),
    second = await measured();
  assert.notEqual(first.taskDigest, second.taskDigest);
  assert.notEqual(first.runDigest, second.runDigest);
  const firstSemanticDigest = acceptanceDigest(semanticProjection(first)),
    secondSemanticDigest = acceptanceDigest(semanticProjection(second));
  assert.equal(
    firstSemanticDigest,
    secondSemanticDigest,
    `semantic differences: ${semanticDifferencePaths(semanticProjection(first), semanticProjection(second)).join(",")}`,
  );
  const { resultDigest: _firstResultDigest, ...firstBase } = first,
    base = {
      ...firstBase,
      deterministicRepeat: {
        status: "PASS",
        firstTaskDigest: first.taskDigest,
        firstRunDigest: first.runDigest,
        secondTaskDigest: second.taskDigest,
        secondRunDigest: second.runDigest,
        semanticDigest: firstSemanticDigest,
      },
    },
    value = { ...base, resultDigest: acceptanceDigest(base) };
  await mkdir(evidenceRoot, { recursive: true });
  const json = `${JSON.stringify(value, null, 2)}\n`,
    markdown = report(value);
  assert.deepEqual(
    scanText("ar5b-final-evidence", `${json}\n${markdown}`, [
      { category: "protected-canary", value: "AR5B-Protected-Canary" },
      { category: "credential-canary", value: "AR5B-Credential-Canary" },
    ]),
    [],
  );
  await writeFile(jsonPath, json);
  await writeFile(reportPath, markdown);
  return value;
}

/**
 * Re-executes the accepted AR-5B profile against the current repository bytes
 * without writing or relabelling historical AR-5B evidence. Importing this
 * module remains side-effect free; lifecycle work begins only on invocation.
 */
export async function measureAr5bAuthenticatedRecoveryCurrentBuild() {
  const value = await measured();
  assertAr5bAuthenticatedRecoveryCurrentBuildMeasurement(value);
  return value;
}
export async function measureAr5bAuthenticatedRecoveryCurrentBuildPair() {
  const first = await measured();
  const second = await measured();
  assert.notEqual(first.taskDigest, second.taskDigest);
  assert.notEqual(first.runDigest, second.runDigest);
  const firstSemanticDigest = acceptanceDigest(semanticProjection(first));
  const secondSemanticDigest = acceptanceDigest(semanticProjection(second));
  assert.equal(firstSemanticDigest, secondSemanticDigest);
  assertAr5bAuthenticatedRecoveryCurrentBuildMeasurement(first);
  assertAr5bAuthenticatedRecoveryCurrentBuildMeasurement(second);
  return { first, second, semanticDigest: firstSemanticDigest } as const;
}
export function assertAr5bAuthenticatedRecoveryCurrentBuildMeasurement(value: any) {
  assert.equal(value.adjudication.result, "PASS");
  assert.equal(value.resultDigest, acceptanceDigest((({ resultDigest: _, ...base }) => base)(value)));
  validatePersistedOwnerMeasurements(value);
  assert.deepEqual(adjudicateAuthenticatedAlphaAcceptance({ profile: ar5bAuthenticatedRecoveryConformanceProfile, measurements: value.envelopes, sourceDigest: value.sourceDigest, taskDigest: value.taskDigest }), value.adjudication);
  assert.deepEqual(value.cleanup, { attempts: 2, localRoots: 0, foreignPreserved: true, independentZero: "zero-verified" });
  assert.equal(value.scanner.publicFindings, 0);
}
async function verifyEvidence() {
  const stored = JSON.parse(await readFile(jsonPath, "utf8")),
    { resultDigest, ...base } = stored;
  assert.equal(resultDigest, acceptanceDigest(base));
  assert.equal(report(stored), await readFile(reportPath, "utf8"));
  const current = await sourceIdentity();
  assert.equal(stored.sourceDigest, current.digest);
  assert.deepEqual(stored.sourceManifest, current);
  validatePersistedOwnerMeasurements(stored);
  assert.deepEqual(stored.provenance, {
    ...(await qualificationIdentities()),
    profileDigest: acceptanceDigest(
      ar5bAuthenticatedRecoveryConformanceProfile,
    ),
    journeyProgramDigest: acceptanceDigest(
      AUTHENTICATED_ALPHA_ORDINARY_JOURNEY_ID,
    ),
    factCatalogDigest: acceptanceDigest(
      ar5bAuthenticatedRecoveryConformanceProfile.requiredMeasurements,
    ),
    producerSourceManifestDigest:
      stored.provenance.producerSourceManifestDigest,
    registryDigest: stored.provenance.registryDigest,
    descriptorDigests: stored.provenance.descriptorDigests,
    ar5a: await verifyAr5aEvidence(),
    controlTowerClosure: {
      excludedPathDigest: byteDigest(
        Buffer.from("docs/Product/PRODUCT_ROADMAP.md"),
      ),
      transitionCategory: "one-path-descendant-after-implementation",
    },
  });
  assert.deepEqual(
    adjudicateAuthenticatedAlphaAcceptance({
      profile: ar5bAuthenticatedRecoveryConformanceProfile,
      measurements: stored.envelopes,
      sourceDigest: stored.sourceDigest,
      taskDigest: stored.taskDigest,
    }),
    stored.adjudication,
  );
  assert.equal(stored.deterministicRepeat.status, "PASS");
  assert.notEqual(
    stored.deterministicRepeat.firstTaskDigest,
    stored.deterministicRepeat.secondTaskDigest,
  );
  assert.notEqual(
    stored.deterministicRepeat.firstRunDigest,
    stored.deterministicRepeat.secondRunDigest,
  );
  assert.equal(
    stored.deterministicRepeat.semanticDigest,
    acceptanceDigest(semanticProjection(stored)),
  );
  const repeated = await measured();
  assert.equal(
    stored.deterministicRepeat.semanticDigest,
    acceptanceDigest(semanticProjection(repeated)),
  );
  return stored;
}
const direct =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (direct) {
  if (
    process.argv[2] === "ar5b-replay-recovery" ||
    process.argv[2] === "ar5b-observability"
  )
    void producer(process.argv[2]).catch(() => {
      process.stderr.write(`AR2_PRE001B_PRODUCER_FAILED:${ar5bProducerStage}\n`);
      process.exitCode = 1;
    });
  else if (process.argv.includes("--write"))
    void writeEvidence().then((value) =>
      process.stdout.write(
        `${JSON.stringify({ status: value.adjudication.result, sourceDigest: value.sourceDigest, resultDigest: value.resultDigest })}\n`,
      ),
    );
  else
    void verifyEvidence().then((value) =>
      process.stdout.write(
        `${JSON.stringify({ status: value.adjudication.result, sourceDigest: value.sourceDigest, resultDigest: value.resultDigest })}\n`,
      ),
    );
}
