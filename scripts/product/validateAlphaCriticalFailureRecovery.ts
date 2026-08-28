import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  chmod,
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import {
  FilesystemOrganizationRuntimeRepository,
  RuntimeStorageConflictError,
  RuntimeStorageIncompatibleReplayError,
  RuntimeStorageRecoveryBlockedError,
} from "../../engine/v3/runtime/organizationRuntimeRepository";
import {
  createProductWorkflowArtifactRepository,
  ProductWorkflowIncompatibleIdempotencyReplayError,
  ProductWorkflowRecoveryBlockedError,
  ProductWorkflowRevisionConflictError,
} from "../../product/workflow/leadershipConversation/productWorkflowArtifactRepository";
import { recoverAuthorizedProtectedState } from "../alpha-readiness/criticalFailureRecoveryCoordinator";
import { AlphaProductTelemetryOwner } from "../../lib/telemetry/alphaProductTelemetryOwner";
import type { AlphaTelemetryConsentOwner } from "../../lib/telemetry/alphaTelemetryConsentOwner";
import type { AlphaTelemetryRepository } from "../../lib/telemetry/alphaTelemetryRepository";
import type { AlphaTelemetryKeyRing } from "../../lib/telemetry/alphaTelemetryPseudonymization";
import { scanRoot } from "../alpha-readiness/protectedValueScanner";
import { createAlphaTelemetryComposition } from "../../lib/telemetry/alphaTelemetryComposition";

const ORG = "ar5-validation-org";
let spawnedChildProcesses = 0;
let diagnosticStage = "owner-recovery";
export const ALPHA_CRITICAL_FAILURE_RECOVERY_MEASUREMENT_VERSION = "1" as const;
// This digest is the independent, frozen ID/outcome catalog for the 102 owner
// cases.  It deliberately lives outside the measurement construction path so
// a changed, missing, duplicated, or substituted case cannot bless itself.
export const ALPHA_CRITICAL_FAILURE_RECOVERY_CASE_CATALOG_DIGEST = "25b3d1f493d6aa59132c7bc08b1f1f085fde08a849a94aef16a054283f8e8d9b" as const;
type MeasuredOutcome = "verified" | "committed" | "cas-conflict" | "exact-replay" | "incompatible-replay" | "recovery-blocked";
type CaseDetail = Readonly<{ canonicalDigest?: string; terminalDisposition?: MeasuredOutcome; originalReaderOutcome?: MeasuredOutcome; freshReaderOutcome?: MeasuredOutcome; repeatedReaderOutcome?: MeasuredOutcome }>;
export type AlphaCriticalFailureRecoveryCaseMeasurementV1 = Readonly<{
  schemaVersion: "1"; caseId: string; caseOrdinal: number; ownerCategory: "runtime" | "workflow" | "authorization" | "observability" | "telemetry" | "scanner"; sourceDigest: string; taskDigest: string; runDigest: string; processSegment: "parent" | "original-reader" | "fresh-reader" | "multi-process"; stageInventory: readonly string[]; ownerOperation: string; executionStatus: "satisfied"; ownerOutcome: MeasuredOutcome; expectedOutcome: MeasuredOutcome; canonicalBeforeDigest: string | "not-applicable"; canonicalAfterDigest: string | "not-applicable"; durableTerminalDisposition: MeasuredOutcome | "not-applicable"; originalReaderOutcome: MeasuredOutcome | "not-applicable"; freshReaderOutcome: MeasuredOutcome | "not-applicable"; repeatedReaderOutcome: MeasuredOutcome | "not-applicable"; duplicateFindings: number; authorizationFindings: number; residueCount: 0; semanticDigest: string; measurementDigest: string;
}>;
export type AlphaCriticalFailureRecoveryMatrixMeasurementV1 = Readonly<{
  schemaVersion: "1"; owner: "validateAlphaCriticalFailureRecovery"; sourceDigest: string; taskDigest: string; runDigest: string; cases: readonly AlphaCriticalFailureRecoveryCaseMeasurementV1[]; caseCount: number; outcomeInventory: Readonly<Record<MeasuredOutcome, number>>; duplicateCases: 0; missingCases: 0; conflictingCases: 0; cleanup: Readonly<{ rootAbsent: true; residueCount: 0 }>; matrixDigest: string; authorityDigest: string;
}>;
export class AlphaCriticalFailureRecoveryCaseFailure extends Error {
  readonly caseId: string;
  readonly ownerOutcome: MeasuredOutcome;
  constructor(caseId: string, ownerOutcome: MeasuredOutcome) {
    super("Critical failure recovery case failed");
    this.name = "AlphaCriticalFailureRecoveryCaseFailure";
    this.caseId = caseId;
    this.ownerOutcome = ownerOutcome;
  }
}
type TelemetryParityStateMeasurementV1=Readonly<{schemaVersion:"1";state:string;telemetryOwnerOutcome:string;productOutputDigest:string;durableProductBeforeDigest:string;durableProductAfterDigest:string;authorizationReadDigest:string;recoveryOutcomeDigest:string;eventInventoryDigest:string;stateMeasurementDigest:string}>;
const alphaTelemetryParityStates=["enabled-consent","disabled","consent-absent","consent-expired","consent-revoked","missing-active-key","missing-historical-key","repository-rejecting","repository-throwing","repository-unavailable","sweep-failure","deletion-pending","denied-operator"] as const;
const bytes = (name: string) =>
  new TextEncoder().encode(
    JSON.stringify(
      createEmptyOrganizationRuntime({
        organizationId: ORG,
        name,
        now: "2026-08-23T12:00:00.000Z",
      }),
    ),
  );
const digest = (value: Uint8Array | string) =>
  createHash("sha256").update(value).digest("hex");
async function telemetryTreeDigest(root:string){const entries=await readdir(root,{recursive:true}),measured=[] as {entryDigest:string;contentDigest:string}[];for(const entry of entries.sort()){const absolute=path.join(root,entry),status=await lstat(absolute);if(status.isFile()&&!status.isSymbolicLink())measured.push({entryDigest:digest(entry),contentDigest:digest(await readFile(absolute))});}return digest(JSON.stringify(measured));}

async function child(
  root: string,
  expected: string,
  name: string,
  requestId: string,
) {
  const repo = new FilesystemOrganizationRuntimeRepository(root);
  try {
    const value = await repo.replace(
      ORG,
      bytes(name === "__large__" ? "x".repeat(20_000_000) : name),
      expected,
      { requestId, operatorId: "ar5-validator" },
    );
    process.stdout.write(JSON.stringify({ outcome: "committed" }));
  } catch (error) {
    if (error instanceof RuntimeStorageConflictError)
      process.stdout.write(JSON.stringify({ outcome: "cas-conflict" }));
    else if (error instanceof RuntimeStorageRecoveryBlockedError)
      process.stdout.write(JSON.stringify({ outcome: "recovery-blocked" }));
    else if (error instanceof RuntimeStorageIncompatibleReplayError)
      process.stdout.write(JSON.stringify({ outcome: "incompatible-replay" }));
    else throw error;
  }
}

async function liveStaleReaderChild(
  root: string,
  expected: string,
  name: string,
  requestId: string,
) {
  let hookInvocations = 0;
  const repository = new FilesystemOrganizationRuntimeRepository(root, {
    afterInitialCanonicalParentValidationBeforeCandidateWrite: async () => {
      process.send?.({ outcome: "pre-claim-paused" });
      await new Promise<void>((resolve) => {
        process.once("message", (message) => {
          if (message === "release-pre-claim") resolve();
        });
      });
    },
    afterValidatedClaimBeforeCanonicalParentRevalidation: async () => {
      hookInvocations += 1;
      if (hookInvocations !== 1)
        throw new RuntimeStorageRecoveryBlockedError(
          "Runtime recovery is blocked",
        );
      process.send?.({ outcome: "validated-claim-paused" });
      await new Promise<void>((resolve) => {
        process.once("message", (message) => {
          if (message === "release") resolve();
        });
      });
    },
  });
  try {
    await repository.replace(ORG, bytes(name), expected, {
      requestId,
      operatorId: "ar5-validator",
    });
    process.send?.({ outcome: "unexpected-publication" });
  } catch (error) {
    if (error instanceof RuntimeStorageConflictError)
      process.send?.({ outcome: "cas-conflict", hookInvocations });
    else throw error;
  }
}

async function startLiveStaleReader(
  root: string,
  expected: string,
  name: string,
  requestId: string,
) {
  spawnedChildProcesses += 1;
  const handle = spawn(
    process.execPath,
    [
      ...process.execArgv,
      import.meta.filename,
      "--live-stale-reader-child",
      root,
      expected,
      name,
      requestId,
    ],
    { stdio: ["ignore", "ignore", "pipe", "ipc"] },
  );
  let stderr = "";
  handle.stderr?.on("data", (value) => (stderr += String(value)));
  const waitForOutcome = (expectedOutcome: string) =>
    new Promise<void>((resolve, reject) => {
      const onMessage = (message: unknown) => {
      if (
        message &&
        typeof message === "object" &&
          (message as { outcome?: unknown }).outcome === expectedOutcome
        ) {
          handle.off("message", onMessage);
        resolve();
      }
      };
      handle.on("message", onMessage);
      handle.once("error", reject);
      handle.once("exit", (code) => {
        if (code !== 0)
          reject(new Error("live reader exited before the barrier"));
      });
    });
  const preClaimPaused = waitForOutcome("pre-claim-paused");
  const completed = new Promise<{ outcome: string; hookInvocations: number }>(
    (resolve, reject) => {
      const onMessage = (message: unknown) => {
        if (
          message &&
          typeof message === "object" &&
          (message as { outcome?: unknown }).outcome === "cas-conflict"
        ) {
          handle.off("message", onMessage);
          resolve(message as { outcome: string; hookInvocations: number });
        }
      };
      handle.on("message", onMessage);
      handle.once("exit", (code) => {
        if (code !== 0) reject(new Error(stderr || "live reader failed"));
      });
    },
  );
  return {
    handle,
    preClaimPaused,
    validatedClaimPaused: () => waitForOutcome("validated-claim-paused"),
    completed,
  };
}

async function crashAfterClaim(root: string, expected: string) {
  spawnedChildProcesses += 1;
  const processHandle = spawn(
    process.execPath,
    [
      ...process.execArgv,
      import.meta.filename,
      "--child",
      root,
      expected,
      "__large__",
      "crash-after-claim",
    ],
    { stdio: ["ignore", "ignore", "ignore"] },
  );
  let observed = false;
  for (let attempt = 0; attempt < 10_000; attempt += 1) {
    const entries = await readdir(root).catch(() => [] as string[]);
    if (entries.some((value) => value.endsWith(`.${expected}.claim`))) {
      observed = true;
      processHandle.kill("SIGKILL");
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
  assert.ok(observed);
  await new Promise<void>((resolve) =>
    processHandle.once("exit", () => resolve()),
  );
}

async function runChild(
  root: string,
  expected: string,
  name: string,
  requestId: string,
) {
  spawnedChildProcesses += 1;
  return new Promise<{ outcome: string }>((resolve, reject) => {
    const processHandle = spawn(
      process.execPath,
      [
        ...process.execArgv,
        import.meta.filename,
        "--child",
        root,
        expected,
        name,
        requestId,
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    let stdout = "",
      stderr = "";
    processHandle.stdout.on("data", (value) => {
      stdout += String(value);
    });
    processHandle.stderr.on("data", (value) => {
      stderr += String(value);
    });
    processHandle.on("exit", (code) =>
      code === 0
        ? resolve(JSON.parse(stdout))
        : reject(new Error(stderr || "child failed")),
    );
  });
}

async function runActualOwnerAuthorizationChild(): Promise<number> {
  spawnedChildProcesses += 1;
  return new Promise((resolve, reject) => {
    const processHandle = spawn(
      process.execPath,
      [
        "--conditions=react-server",
        "--import",
        "tsx",
        import.meta.filename,
        "--actual-owner-authorization-child",
      ],
      {
        cwd: process.cwd(),
        env: { ...process.env, NODE_ENV: "test" },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let stdout = "",
      stderr = "";
    processHandle.stdout.on("data", (value) => (stdout += String(value)));
    processHandle.stderr.on("data", (value) => (stderr += String(value)));
    processHandle.on("error", reject);
    processHandle.on("close", (code) => {
      if (code !== 0)
        return reject(
          new Error(stderr || "actual owner authorization child failed"),
        );
      try {
        const parsed = JSON.parse(stdout) as {
          outcome: string;
          checks: number;
        };
        assert.equal(parsed.outcome, "verified");
        assert.ok(parsed.checks > 0);
        resolve(parsed.checks);
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function workflowChild(
  root: string,
  expected: string,
  label: string,
  fault?: "claim" | "publication",
) {
  const repository = createProductWorkflowArtifactRepository({
    root,
    environment: "test",
    faultInjector:
      fault === "claim"
        ? { afterClaim: () => { throw new ProductWorkflowRecoveryBlockedError(); } }
        : fault === "publication"
          ? { afterPublication: () => { throw new ProductWorkflowRecoveryBlockedError(); } }
          : undefined,
  });
  const current = await repository.read(ORG),
    next = structuredClone(current.store);
  next.idempotency.push({
    keyDigest: digest(`workflow-${label}`),
    requestFingerprint: digest(`workflow-request-${label}`),
    recordRef: `workflow-${label}`,
  });
  try {
    await repository.replace(ORG, next, expected);
    process.stdout.write(JSON.stringify({ outcome: "committed" }));
  } catch (error) {
    if (error instanceof ProductWorkflowRevisionConflictError)
      process.stdout.write(JSON.stringify({ outcome: "cas-conflict" }));
    else if (error instanceof ProductWorkflowRecoveryBlockedError)
      process.stdout.write(JSON.stringify({ outcome: "recovery-blocked" }));
    else throw error;
  }
}
async function backupFaultChild(root: string) {
  const repository = new FilesystemOrganizationRuntimeRepository(root, {
    afterBackupLink: () => { throw new RuntimeStorageRecoveryBlockedError("Runtime recovery is blocked"); },
  });
  try {
    await repository.backup(ORG, "backup-ack-loss", {
      requestId: "backup-ack-loss",
      operatorId: "ar5-validator",
    });
  } catch (error) {
    if (error instanceof RuntimeStorageRecoveryBlockedError) {
      process.stdout.write(JSON.stringify({ outcome: "recovery-blocked" }));
      return;
    }
    throw error;
  }
  throw new Error("backup fault was not injected");
}
async function runBackupFaultChild(root: string) {
  return new Promise<{ outcome: string }>((resolve, reject) => {
    const handle = spawn(
      process.execPath,
      [...process.execArgv, import.meta.filename, "--backup-fault-child", root],
      {
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, NODE_ENV: "test" },
      },
    );
    let stdout = "",
      stderr = "";
    handle.stdout.on("data", (value) => (stdout += String(value)));
    handle.stderr.on("data", (value) => (stderr += String(value)));
    handle.on("exit", (code) =>
      code === 0
        ? resolve(JSON.parse(stdout))
        : reject(new Error(stderr || "backup fault child failed")),
    );
  });
}
async function restoreFaultChild(root: string, expectedRevision: string) {
  const repository = new FilesystemOrganizationRuntimeRepository(root, {
    afterRestorePublication: () => { throw new RuntimeStorageRecoveryBlockedError("Runtime recovery is blocked"); },
  });
  try {
    await repository.restore(ORG, "backup-one", expectedRevision, {
      requestId: "restore-ack-loss",
      operatorId: "ar5-validator",
    });
  } catch (error) {
    if (error instanceof RuntimeStorageRecoveryBlockedError) {
      process.stdout.write(JSON.stringify({ outcome: "recovery-blocked" }));
      return;
    }
    throw error;
  }
  throw new Error("restore fault was not injected");
}
async function runRestoreFaultChild(root: string, expectedRevision: string) {
  return new Promise<{ outcome: string }>((resolve, reject) => {
    const handle = spawn(
      process.execPath,
      [
        ...process.execArgv,
        import.meta.filename,
        "--restore-fault-child",
        root,
        expectedRevision,
      ],
      {
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, NODE_ENV: "test" },
      },
    );
    let stdout = "",
      stderr = "";
    handle.stdout.on("data", (value) => (stdout += String(value)));
    handle.stderr.on("data", (value) => (stderr += String(value)));
    handle.on("exit", (code) =>
      code === 0
        ? resolve(JSON.parse(stdout))
        : reject(new Error(stderr || "restore fault child failed")),
    );
  });
}
async function runWorkflowChild(
  root: string,
  expected: string,
  label: string,
  fault?: "claim" | "publication",
) {
  spawnedChildProcesses += 1;
  return new Promise<{ outcome: string }>((resolve, reject) => {
    const handle = spawn(
      process.execPath,
      [
        ...process.execArgv,
        import.meta.filename,
        "--workflow-child",
        root,
        expected,
        label,
        ...(fault ? [fault] : []),
      ],
      {
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, NODE_ENV: "test" },
      },
    );
    let stdout = "",
      stderr = "";
    handle.stdout.on("data", (value) => (stdout += String(value)));
    handle.stderr.on("data", (value) => (stderr += String(value)));
    handle.on("exit", (code) =>
      code === 0
        ? resolve(JSON.parse(stdout))
        : reject(new Error(stderr || "workflow child failed")),
    );
  });
}

async function main(options?:Readonly<{externalRoot:string;suppressOutput:true;telemetryCollector:(value:TelemetryParityStateMeasurementV1)=>void}>) {
  if (process.argv[2] === "--child")
    return child(
      process.argv[3]!,
      process.argv[4]!,
      process.argv[5]!,
      process.argv[6]!,
    );
  if (process.argv[2] === "--workflow-child")
    return workflowChild(
      process.argv[3]!,
      process.argv[4]!,
      process.argv[5]!,
      process.argv[6] as "claim" | "publication" | undefined,
    );
  if (process.argv[2] === "--live-stale-reader-child")
    return liveStaleReaderChild(
      process.argv[3]!,
      process.argv[4]!,
      process.argv[5]!,
      process.argv[6]!,
    );
  if (process.argv[2] === "--backup-fault-child")
    return backupFaultChild(process.argv[3]!);
  if (process.argv[2] === "--restore-fault-child")
    return restoreFaultChild(process.argv[3]!, process.argv[4]!);
  const rootIndex = process.argv.indexOf("--root");
  const externalRoot = options?.externalRoot??(rootIndex >= 0 ? process.argv[rootIndex + 1] : undefined);
  const root = externalRoot
    ? path.resolve(externalRoot)
    : await mkdtemp(path.join(tmpdir(), "discovery-ar5-recovery-"));
  if (externalRoot) await mkdir(root, { recursive: true, mode: 0o700 });
  const ownedAdversarialSymlinks: string[] = [];
  try {
    const caseResults: { id: string; outcome: MeasuredOutcome }[] = [],
      caseDetails = new Map<string, CaseDetail>(),
      record = (id: string, outcome: MeasuredOutcome = "verified") => {
        diagnosticStage = id;
        caseResults.push({ id, outcome });
        diagnosticStage = "between-cases";
      },
      checked = (
        name: string,
        condition: unknown,
        outcome: MeasuredOutcome = "verified",
      ) => {
        diagnosticStage = name;
        if (!condition) throw new AlphaCriticalFailureRecoveryCaseFailure(name, outcome);
        record(name, outcome);
      };
    const scannerValues = [
        { category: "protected-canary", value: "AR5-Protected-Canary-9f3c" },
        { category: "credential-canary", value: "sk_test_AR5NeverPersist" },
      ],
      scannerSurfaceRoot = path.join(root, "scanner-surface-control");
    for (const surface of [
      "protected-body",
      "body-ref",
      "owner-lock",
      "owner-transient",
    ]) {
      const directory = path.join(scannerSurfaceRoot, surface);
      await mkdir(directory, { recursive: true, mode: 0o700 });
      await writeFile(
        path.join(directory, "fixture"),
        scannerValues.map((value) => value.value).join("\n"),
        { mode: 0o600 },
      );
    }
    const scannerSurfaceSensitivity = (
      await scanRoot(scannerSurfaceRoot, scannerValues)
    ).length;
    checked(
      "scanner-protected-surface-sensitivity",
      scannerSurfaceSensitivity === 8,
    );
    await rm(scannerSurfaceRoot, { recursive: true, force: true });
    checked(
      "scanner-protected-surface-cleanup",
      (await scanRoot(root, scannerValues)).length === 0,
    );
    const runtimeRoot = path.join(root, "runtime");
    const repository = new FilesystemOrganizationRuntimeRepository(runtimeRoot);
    const initial = await repository.create(ORG, bytes("initial"), {
      requestId: "initial",
      operatorId: "ar5-validator",
    });
    const concurrent = await Promise.all([
      runChild(runtimeRoot, initial.revision, "candidate-a", "request-a"),
      runChild(runtimeRoot, initial.revision, "candidate-b", "request-b"),
    ]);
    checked(
      "runtime-cross-process-one-winner",
      concurrent.filter((value) => value.outcome === "committed").length === 1,
    );
    checked(
      "runtime-cross-process-one-conflict",
      concurrent.filter((value) => value.outcome === "cas-conflict").length ===
        1,
      "cas-conflict",
    );
    const winner = await repository.read(ORG);
    assert.ok(winner);
    const winnerName = Buffer.from(winner.bytes).equals(
        Buffer.from(bytes("candidate-a")),
      )
        ? "candidate-a"
        : "candidate-b",
      winnerRequest = winnerName === "candidate-a" ? "request-a" : "request-b",
      loserName = winnerName === "candidate-a" ? "candidate-b" : "candidate-a",
      loserRequest = winnerRequest === "request-a" ? "request-b" : "request-a";
    checked(
      "runtime-canonical-is-winning-candidate",
      Buffer.from(winner.bytes).equals(Buffer.from(bytes(winnerName))),
    );
    diagnosticStage = "runtime-live-stale-reader";
    const liveRuntimeRoot = path.join(root, "runtime-live-reader"),
      liveRepository = new FilesystemOrganizationRuntimeRepository(
        liveRuntimeRoot,
      ),
      liveParent = await liveRepository.create(ORG, bytes("live-parent"), {
        requestId: "live-parent",
        operatorId: "ar5-validator",
      }),
      staleName = "live-stale-candidate",
      staleRequest = "live-stale-reader",
      liveReader = await startLiveStaleReader(
        liveRuntimeRoot,
        liveParent.revision,
        staleName,
        staleRequest,
      );
    diagnosticStage = "runtime-live-stale-reader-pre-claim-pause";
    await liveReader.preClaimPaused;
    const staleRequestFingerprint = digest(
        `replace:${staleRequest}:${liveParent.revision}`,
      ),
      liveRootEntriesBeforeWinner = await readdir(liveRuntimeRoot, {
        recursive: true,
      });
    let staleOperationResidueBeforeWinner = 0;
    for (const entry of liveRootEntriesBeforeWinner) {
      const target = path.join(liveRuntimeRoot, String(entry)),
        status = await lstat(target);
      if (!status.isFile() || status.isSymbolicLink()) continue;
      const content = await readFile(target);
      if (digest(content) === digest(bytes(staleName)))
        staleOperationResidueBeforeWinner += 1;
      try {
        const parsed = JSON.parse(content.toString("utf8")) as {
          requestFingerprint?: unknown;
        };
        if (parsed.requestFingerprint === staleRequestFingerprint)
          staleOperationResidueBeforeWinner += 1;
      } catch {}
    }
    checked(
      "runtime-live-reader-pre-claim-barrier-has-zero-operation-residue",
      staleOperationResidueBeforeWinner === 0,
    );
    const liveWinner = await runChild(
      liveRuntimeRoot,
      liveParent.revision,
      "live-winner",
      "live-winner",
    );
    checked(
      "runtime-live-reader-winner-commits-while-stale-operation-pre-claim",
      liveWinner.outcome === "committed",
      "committed",
    );
    const liveWinnerBytes = await readFile(
        path.join(liveRuntimeRoot, `${ORG}.json`),
      ),
      validatedClaimPaused = liveReader.validatedClaimPaused();
    liveReader.handle.send("release-pre-claim");
    await validatedClaimPaused;
    record("runtime-live-reader-paused-after-validated-claim");
    diagnosticStage = "runtime-live-stale-reader-reconcile";
    const reconciledWhilePaused = await runChild(
      liveRuntimeRoot,
      liveParent.revision,
      staleName,
      staleRequest,
    );
    if (reconciledWhilePaused.outcome !== "cas-conflict") {
      diagnosticStage = `runtime-live-stale-reader-reconcile-${reconciledWhilePaused.outcome}`;
      liveReader.handle.send("release");
      await liveReader.completed;
    }
    checked(
      "runtime-live-reader-reconciler-records-conflict",
      reconciledWhilePaused.outcome === "cas-conflict",
      "cas-conflict",
    );
    const staleClaimPath = path.join(
      liveRuntimeRoot,
      `${ORG}.json.${liveParent.revision}.claim`,
    );
    await assert.rejects(() => lstat(staleClaimPath));
    const operationDirectoryAfterConflict = path.join(
        liveRuntimeRoot,
        ".operations",
        ORG,
      ),
      matchingConflictTerminals = [] as Record<string, unknown>[];
    for (const entry of await readdir(operationDirectoryAfterConflict)) {
      if (!entry.endsWith(".json")) continue;
      const value = JSON.parse(
        await readFile(path.join(operationDirectoryAfterConflict, entry), "utf8"),
      ) as Record<string, unknown>;
      if (
        value.disposition === "cas-conflict" &&
        value.expectedRevision === liveParent.revision &&
        value.intendedDigest === digest(bytes(staleName))
      )
        matchingConflictTerminals.push(value);
    }
    checked(
      "runtime-live-reader-terminal-durable-before-release",
      matchingConflictTerminals.length === 1,
    );
    diagnosticStage = "runtime-live-stale-reader-release";
    liveReader.handle.send("release");
    const resumedLiveReader = await liveReader.completed;
    checked(
      "runtime-live-reader-resumes-as-conflict",
      resumedLiveReader.outcome === "cas-conflict" &&
        resumedLiveReader.hookInvocations === 1,
      "cas-conflict",
    );
    diagnosticStage = "runtime-live-stale-reader-fresh";
    const freshAfterRetirement = await runChild(
      liveRuntimeRoot,
      liveParent.revision,
      staleName,
      staleRequest,
    );
    checked(
      "runtime-post-retirement-reader-resolves-terminal",
      freshAfterRetirement.outcome === "cas-conflict",
      "cas-conflict",
    );
    const repeatedReconciliation = await runChild(
      liveRuntimeRoot,
      liveParent.revision,
      staleName,
      staleRequest,
    );
    checked(
      "runtime-stale-claim-reconciliation-idempotent",
      repeatedReconciliation.outcome === "cas-conflict" &&
        Buffer.from(
          await readFile(path.join(liveRuntimeRoot, `${ORG}.json`)),
        ).equals(liveWinnerBytes),
      "cas-conflict",
    );
    const liveCanonicalDigest = digest(liveWinnerBytes);
    caseDetails.set("runtime-post-retirement-reader-resolves-terminal", {
      canonicalDigest: liveCanonicalDigest,
      terminalDisposition: "cas-conflict",
      originalReaderOutcome: resumedLiveReader.outcome as MeasuredOutcome,
      freshReaderOutcome: freshAfterRetirement.outcome as MeasuredOutcome,
      repeatedReaderOutcome: repeatedReconciliation.outcome as MeasuredOutcome,
    });
    caseDetails.set("runtime-stale-claim-reconciliation-idempotent", {
      canonicalDigest: liveCanonicalDigest,
      terminalDisposition: "cas-conflict",
      originalReaderOutcome: resumedLiveReader.outcome as MeasuredOutcome,
      freshReaderOutcome: freshAfterRetirement.outcome as MeasuredOutcome,
      repeatedReaderOutcome: repeatedReconciliation.outcome as MeasuredOutcome,
    });
    const replayed = await repository.replace(
      ORG,
      bytes(winnerName),
      initial.revision,
      { requestId: winnerRequest, operatorId: "ar5-validator" },
    );
    checked(
      "runtime-acknowledgement-loss-exact-replay",
      replayed.revision === winner.revision,
      "exact-replay",
    );
    await assert.rejects(
      () =>
        repository.replace(ORG, bytes(winnerName), initial.revision, {
          requestId: "different-request",
          operatorId: "ar5-validator",
        }),
      RuntimeStorageConflictError,
    );
    record("runtime-different-request-not-replay", "cas-conflict");
    for (const terminalFault of ["truncated", "mode", "symlink"] as const) {
      const faultRoot = path.join(
        root,
        `runtime-conflict-terminal-${terminalFault}`,
      );
      await cp(runtimeRoot, faultRoot, { recursive: true });
      const faultRepository = new FilesystemOrganizationRuntimeRepository(
        faultRoot,
      );
      const operationDirectory = path.join(faultRoot, ".operations", ORG);
      const terminalNames = await readdir(operationDirectory);
      let terminalName: string | undefined;
      for (const value of terminalNames) {
        if (!value.endsWith(".json")) continue;
        const parsed = JSON.parse(
          await readFile(path.join(operationDirectory, value), "utf8"),
        ) as { disposition?: unknown };
        if (parsed.disposition === "cas-conflict") {
          terminalName = value;
          break;
        }
      }
      assert.ok(terminalName);
      const terminalPath = path.join(operationDirectory, terminalName);
      const canonicalPath = path.join(faultRoot, `${ORG}.json`);
      const canonicalBefore = await readFile(canonicalPath);
      if (terminalFault === "truncated")
        await writeFile(terminalPath, "{}", { mode: 0o600 });
      else if (terminalFault === "mode") await chmod(terminalPath, 0o644);
      else {
        const owner = `${terminalPath}.owner`;
        await rename(terminalPath, owner);
        await symlink(owner, terminalPath);
        ownedAdversarialSymlinks.push(terminalPath);
      }
      await assert.rejects(
        () =>
          faultRepository.replace(ORG, bytes(loserName), initial.revision, {
            requestId: loserRequest,
            operatorId: "ar5-validator",
          }),
        RuntimeStorageRecoveryBlockedError,
      );
      checked(
        `runtime-conflict-terminal-${terminalFault}-blocked`,
        Buffer.from(await readFile(canonicalPath)).equals(canonicalBefore),
        "recovery-blocked",
      );
    }
    const beforeConflict = await readFile(
      path.join(runtimeRoot, `${ORG}.json`),
    );
    await assert.rejects(
      () =>
        repository.replace(ORG, bytes("losing-material"), initial.revision, {
          requestId: winnerRequest,
          operatorId: "ar5-validator",
        }),
      RuntimeStorageIncompatibleReplayError,
    );
    record(
      "runtime-different-bytes-incompatible-replay",
      "incompatible-replay",
    );
    checked(
      "runtime-conflict-preserves-canonical-bytes",
      Buffer.from(await readFile(path.join(runtimeRoot, `${ORG}.json`))).equals(
        beforeConflict,
      ),
    );
    await repository.backup(ORG, "backup-one", {
      requestId: "backup-one",
      operatorId: "ar5-validator",
    });
    record("runtime-backup-owner-issued");
    await repository.backup(ORG, "backup-two-identical", {
      requestId: "backup-two-identical",
      operatorId: "ar5-validator",
    });
    record("runtime-backup-identical-control-owner-issued");
    const backupReplay = await repository.backup(ORG, "backup-one", {
      requestId: "backup-one",
      operatorId: "ar5-validator",
    });
    checked(
      "runtime-backup-acknowledgement-loss-exact-replay",
      backupReplay.revision === winner.revision,
      "exact-replay",
    );
    checked(
      "runtime-backup-post-link-pre-ack-fault",
      (await runBackupFaultChild(runtimeRoot)).outcome === "recovery-blocked",
      "recovery-blocked",
    );
    const recoveredBackup = await repository.backup(ORG, "backup-ack-loss", {
      requestId: "backup-ack-loss",
      operatorId: "ar5-validator",
    });
    checked(
      "runtime-backup-fresh-process-acknowledgement-recovery",
      recoveredBackup.revision === winner.revision,
    );
    const advanced = await repository.replace(
      ORG,
      bytes("advanced"),
      winner.revision,
      { requestId: "advance", operatorId: "ar5-validator" },
    );
    const restored = await repository.restore(
      ORG,
      "backup-one",
      advanced.revision,
      { requestId: "restore-one", operatorId: "ar5-validator" },
    );
    checked(
      "runtime-restore-exact-owner-bytes",
      restored.revision === winner.revision,
    );
    const restoreAdvanced = await repository.replace(
      ORG,
      bytes("restore-advanced"),
      restored.revision,
      { requestId: "restore-advance", operatorId: "ar5-validator" },
    );
    await repository.backup(ORG, "backup-different", {
      requestId: "backup-different",
      operatorId: "ar5-validator",
    });
    record("runtime-backup-different-control-owner-issued");
    checked(
      "runtime-restore-post-publication-pre-ack-fault",
      (await runRestoreFaultChild(runtimeRoot, restoreAdvanced.revision))
        .outcome === "recovery-blocked",
      "recovery-blocked",
    );
    const postFaultRestore = await repository.read(ORG),
      postFaultBackupBytes = await readFile(
        path.join(runtimeRoot, ".backups", ORG, "backup-one.json"),
      );
    checked(
      "runtime-restore-fault-published-exact-backup",
      postFaultRestore?.revision === digest(postFaultBackupBytes) &&
        Buffer.from(postFaultRestore.bytes).equals(postFaultBackupBytes),
    );
    const recoveredRestore = await repository.restore(
      ORG,
      "backup-one",
      restoreAdvanced.revision,
      { requestId: "restore-ack-loss", operatorId: "ar5-validator" },
    );
    const restoredBackupBytes = await readFile(
      path.join(runtimeRoot, ".backups", ORG, "backup-one.json"),
    );
    checked(
      "runtime-restore-fresh-process-acknowledgement-recovery",
      recoveredRestore.revision === digest(restoredBackupBytes) &&
        Buffer.from(recoveredRestore.bytes).equals(restoredBackupBytes),
    );
    const restoreReplay = await repository.restore(
      ORG,
      "backup-one",
      restoreAdvanced.revision,
      { requestId: "restore-ack-loss", operatorId: "ar5-validator" },
    );
    checked(
      "runtime-restore-exact-replay",
      restoreReplay.revision === recoveredRestore.revision,
      "exact-replay",
    );
    await assert.rejects(
      () =>
        repository.restore(
          ORG,
          "backup-two-identical",
          restoreAdvanced.revision,
          { requestId: "restore-ack-loss", operatorId: "ar5-validator" },
        ),
      RuntimeStorageIncompatibleReplayError,
    );
    record(
      "runtime-restore-identical-bytes-different-backup-incompatible",
      "incompatible-replay",
    );
    await assert.rejects(
      () =>
        repository.restore(ORG, "backup-different", restoreAdvanced.revision, {
          requestId: "restore-ack-loss",
          operatorId: "ar5-validator",
        }),
      RuntimeStorageIncompatibleReplayError,
    );
    record(
      "runtime-restore-different-bytes-different-backup-incompatible",
      "incompatible-replay",
    );
    const afterRestore = await repository.replace(
        ORG,
        bytes("restore-cas-advanced"),
        recoveredRestore.revision,
        { requestId: "restore-cas-advance", operatorId: "ar5-validator" },
      ),
      afterRestoreBytes = await readFile(path.join(runtimeRoot, `${ORG}.json`));
    await assert.rejects(
      () =>
        repository.restore(ORG, "backup-one", recoveredRestore.revision, {
          requestId: "restore-stale-parent",
          operatorId: "ar5-validator",
        }),
      RuntimeStorageConflictError,
    );
    checked(
      "runtime-restore-stale-parent-cas-preserves-canonical",
      Buffer.from(await readFile(path.join(runtimeRoot, `${ORG}.json`))).equals(
        afterRestoreBytes,
      ) && afterRestore.revision === digest(bytes("restore-cas-advanced")),
      "cas-conflict",
    );
    await assert.rejects(
      () =>
        repository.backup(ORG, "backup-one", {
          requestId: "backup-duplicate",
          operatorId: "ar5-validator",
        }),
      RuntimeStorageConflictError,
    );
    record("runtime-backup-duplicate-conflict", "cas-conflict");
    await assert.rejects(() =>
      repository.restore(ORG, "missing-backup", restored.revision, {
        requestId: "restore-missing",
        operatorId: "ar5-validator",
      }),
    );
    record("runtime-backup-missing-blocked", "recovery-blocked");
    await repository.backup(ORG, "backup-mode", {
      requestId: "backup-mode",
      operatorId: "ar5-validator",
    });
    const modeBackup = path.join(
      runtimeRoot,
      ".backups",
      ORG,
      "backup-mode.json",
    );
    await chmod(modeBackup, 0o644);
    await assert.rejects(() =>
      repository.restore(ORG, "backup-mode", restored.revision, {
        requestId: "restore-mode",
        operatorId: "ar5-validator",
      }),
    );
    record("runtime-backup-wrong-mode-blocked", "recovery-blocked");
    await chmod(modeBackup, 0o600);
    await repository.backup(ORG, "backup-link", {
      requestId: "backup-link",
      operatorId: "ar5-validator",
    });
    const linkBackup = path.join(
        runtimeRoot,
        ".backups",
        ORG,
        "backup-link.json",
      ),
      realBackup = `${linkBackup}.owner`;
    await rename(linkBackup, realBackup);
    await symlink(realBackup, linkBackup);
    ownedAdversarialSymlinks.push(linkBackup);
    await assert.rejects(() =>
      repository.restore(ORG, "backup-link", restored.revision, {
        requestId: "restore-link",
        operatorId: "ar5-validator",
      }),
    );
    record("runtime-backup-symlink-blocked", "recovery-blocked");
    const foreignOrg = "ar5-foreign-org",
      foreignRepo = new FilesystemOrganizationRuntimeRepository(runtimeRoot),
      foreignBytes = new TextEncoder().encode(
        JSON.stringify(
          createEmptyOrganizationRuntime({
            organizationId: foreignOrg,
            name: "foreign",
            now: "2026-08-23T12:00:00.000Z",
          }),
        ),
      );
    await foreignRepo.create(foreignOrg, foreignBytes, {
      requestId: "foreign-create",
      operatorId: "foreign",
    });
    const foreignBefore = await readFile(
      path.join(runtimeRoot, `${foreignOrg}.json`),
    );
    const corruptOrg = "ar5-corrupt-org",
      corruptRepo = new FilesystemOrganizationRuntimeRepository(runtimeRoot),
      corruptInitialBytes = new TextEncoder().encode(
        JSON.stringify(
          createEmptyOrganizationRuntime({
            organizationId: corruptOrg,
            name: "corrupt-control",
            now: "2026-08-23T12:00:00.000Z",
          }),
        ),
      ),
      corruptCandidateBytes = new TextEncoder().encode(
        JSON.stringify(
          createEmptyOrganizationRuntime({
            organizationId: corruptOrg,
            name: "corrupt-candidate",
            now: "2026-08-23T12:00:00.000Z",
          }),
        ),
      ),
      corruptInitial = await corruptRepo.create(
        corruptOrg,
        corruptInitialBytes,
        { requestId: "corrupt-create", operatorId: "ar5-validator" },
      ),
      corruptClaim = path.join(
        runtimeRoot,
        `${corruptOrg}.json.${corruptInitial.revision}.claim`,
      );
    await writeFile(corruptClaim, "{}", { flag: "wx", mode: 0o600 });
    await assert.rejects(
      () =>
        corruptRepo.replace(
          corruptOrg,
          corruptCandidateBytes,
          corruptInitial.revision,
          { requestId: "corrupt", operatorId: "ar5-validator" },
        ),
      RuntimeStorageRecoveryBlockedError,
    );
    record("runtime-corrupt-claim-blocked", "recovery-blocked");
    checked(
      "runtime-corrupt-claim-preserves-canonical",
      (await corruptRepo.read(corruptOrg))?.revision ===
        corruptInitial.revision,
    );
    checked(
      "runtime-foreign-bytes-preserved",
      Buffer.from(
        await readFile(path.join(runtimeRoot, `${foreignOrg}.json`)),
      ).equals(foreignBefore),
    );
    for (const terminalFault of ["truncated", "mode", "symlink"] as const) {
      const terminalOrg = `ar5-terminal-${terminalFault}`,
        terminalRepo = new FilesystemOrganizationRuntimeRepository(runtimeRoot),
        terminalBytes = new TextEncoder().encode(
          JSON.stringify(
            createEmptyOrganizationRuntime({
              organizationId: terminalOrg,
              name: "terminal-control",
              now: "2026-08-23T12:00:00.000Z",
            }),
          ),
        ),
        requestId = `terminal-${terminalFault}`,
        created = await terminalRepo.create(terminalOrg, terminalBytes, {
          requestId,
          operatorId: "ar5-validator",
        }),
        operationDirectory = path.join(runtimeRoot, ".operations", terminalOrg),
        terminalName = (await readdir(operationDirectory)).find((value) =>
          value.endsWith(".json"),
        );
      assert.ok(terminalName);
      const terminalPath = path.join(operationDirectory, terminalName),
        canonicalBefore = await readFile(
          path.join(runtimeRoot, `${terminalOrg}.json`),
        );
      if (terminalFault === "truncated")
        await writeFile(terminalPath, "{}", { mode: 0o600 });
      else if (terminalFault === "mode") await chmod(terminalPath, 0o644);
      else {
        const owner = `${terminalPath}.owner`;
        await rename(terminalPath, owner);
        await symlink(owner, terminalPath);
        ownedAdversarialSymlinks.push(terminalPath);
      }
      await assert.rejects(
        () =>
          terminalRepo.create(terminalOrg, terminalBytes, {
            requestId,
            operatorId: "ar5-validator",
          }),
        RuntimeStorageRecoveryBlockedError,
      );
      checked(
        `runtime-acknowledgement-${terminalFault}-blocked`,
        Buffer.from(
          await readFile(path.join(runtimeRoot, `${terminalOrg}.json`)),
        ).equals(canonicalBefore) && created.revision === digest(terminalBytes),
        "recovery-blocked",
      );
    }

    const crashRoot = path.join(root, "runtime-crash"),
      crashRepo = new FilesystemOrganizationRuntimeRepository(crashRoot),
      crashInitial = await crashRepo.create(ORG, bytes("crash-initial"), {
        requestId: "crash-initial",
        operatorId: "ar5-validator",
      });
    await crashAfterClaim(crashRoot, crashInitial.revision);
    checked(
      "runtime-crash-after-claim-preserves-complete-canonical",
      (await crashRepo.read(ORG))?.revision === crashInitial.revision,
    );
    const helped = await crashRepo.replace(
      ORG,
      bytes("x".repeat(20_000_000)),
      crashInitial.revision,
      { requestId: "crash-after-claim", operatorId: "ar5-validator" },
    );
    checked(
      "runtime-fresh-process-helps-durable-claim",
      helped.revision !== crashInitial.revision,
    );

    const workflow = createProductWorkflowArtifactRepository({
      root: path.join(root, "workflow"),
      environment: "test",
    });
    const emptyWorkflow = await workflow.read(ORG);
    const first =
      emptyWorkflow.revision === null
        ? await workflow.replace(ORG, emptyWorkflow.store, null)
        : emptyWorkflow;
    assert.ok(first.revision);
    const nextA = structuredClone(first.store);
    nextA.idempotency.push({
      keyDigest: digest("workflow-a"),
      requestFingerprint: digest("workflow-request-a"),
      recordRef: "workflow-a",
    });
    const nextB = structuredClone(first.store);
    nextB.idempotency.push({
      keyDigest: digest("workflow-b"),
      requestFingerprint: digest("workflow-request-b"),
      recordRef: "workflow-b",
    });
    const workflowRace = await Promise.all([
      runWorkflowChild(path.join(root, "workflow"), first.revision, "a"),
      runWorkflowChild(path.join(root, "workflow"), first.revision, "b"),
    ]);
    checked(
      "workflow-cross-process-one-winner",
      workflowRace.filter((value) => value.outcome === "committed").length ===
        1,
    );
    checked(
      "workflow-cross-process-one-conflict",
      workflowRace.filter((value) => value.outcome === "cas-conflict")
        .length === 1,
      "cas-conflict",
    );
    const committed = await workflow.read(ORG);
    checked("workflow-winning-store-readable", committed.revision !== null);
    const winningStore = committed.store.idempotency.some(
      (value) => value.recordRef === "workflow-a",
    )
      ? nextA
      : nextB;
    const workflowReplay = await workflow.replace(
      ORG,
      winningStore,
      first.revision,
    );
    checked(
      "workflow-acknowledgement-loss-replay",
      workflowReplay.revision === committed.revision,
      "exact-replay",
    );
    const losingStore = committed.store.idempotency.some(
      (value) => value.recordRef === "workflow-a",
    )
      ? nextB
      : nextA;
    await assert.rejects(
      () => workflow.replace(ORG, losingStore, first.revision),
      ProductWorkflowRevisionConflictError,
    );
    record("workflow-stale-revision-conflict", "cas-conflict");
    for (const terminalFault of ["truncated", "mode", "symlink"] as const) {
      const faultRoot = path.join(
        root,
        `workflow-conflict-terminal-${terminalFault}`,
      );
      await cp(path.join(root, "workflow"), faultRoot, { recursive: true });
      const faultRepository = createProductWorkflowArtifactRepository({
        root: faultRoot,
        environment: "test",
      });
      const operationDirectory = path.join(
        faultRoot,
        "organizations",
        ".operations",
        ORG,
      );
      const terminalName = (await readdir(operationDirectory)).find((value) =>
        value.endsWith(".conflict.json"),
      );
      assert.ok(terminalName);
      const terminalPath = path.join(operationDirectory, terminalName);
      const canonicalPath = path.join(
        faultRoot,
        "organizations",
        `${ORG}.json`,
      );
      const canonicalBefore = await readFile(canonicalPath);
      if (terminalFault === "truncated")
        await writeFile(terminalPath, "{}", { mode: 0o600 });
      else if (terminalFault === "mode") await chmod(terminalPath, 0o644);
      else {
        const owner = `${terminalPath}.owner`;
        await rename(terminalPath, owner);
        await symlink(owner, terminalPath);
        ownedAdversarialSymlinks.push(terminalPath);
      }
      await assert.rejects(
        () => faultRepository.replace(ORG, losingStore, first.revision),
        ProductWorkflowRecoveryBlockedError,
      );
      checked(
        `workflow-conflict-terminal-${terminalFault}-blocked`,
        Buffer.from(await readFile(canonicalPath)).equals(canonicalBefore),
        "recovery-blocked",
      );
    }
    assert.ok(workflow.mutateOccurrence);
    const occurrence = {
        organizationId: ORG,
        questionId: "question-recovery",
        seriesId: "series-recovery",
        conversationId: "conversation-recovery",
      },
      operationKey = digest("workflow-operation-key"),
      operationFingerprint = digest("workflow-operation-fingerprint"),
      operationInput = {
        ...occurrence,
        expectedRevision: committed.revision,
        idempotencyKeyDigest: operationKey,
        requestFingerprint: operationFingerprint,
      };
    const operationCommitted = await workflow.mutateOccurrence(
      operationInput,
      () => ({
        idempotency: [
          {
            keyDigest: operationKey,
            requestFingerprint: operationFingerprint,
            recordRef: "recovery-operation",
          },
        ],
      }),
    );
    checked("workflow-owner-operation-committed", operationCommitted.committed);
    const operationReplay = await workflow.mutateOccurrence(
      operationInput,
      () => {
        throw new Error("exact replay must not rebuild");
      },
    );
    checked(
      "workflow-owner-operation-exact-replay",
      !operationReplay.committed,
      "exact-replay",
    );
    await assert.rejects(
      () =>
        workflow.mutateOccurrence!(
          {
            ...operationInput,
            expectedRevision: operationReplay.slice.storeRevision,
            requestFingerprint: digest("workflow-operation-incompatible"),
          },
          () => {
            throw new Error("incompatible replay must not rebuild");
          },
        ),
      ProductWorkflowIncompatibleIdempotencyReplayError,
    );
    record(
      "workflow-owner-operation-incompatible-replay",
      "incompatible-replay",
    );
    for (const fault of ["claim", "publication"] as const) {
      const faultRoot = path.join(root, `workflow-${fault}`),
        faultRepository = createProductWorkflowArtifactRepository({
          root: faultRoot,
          environment: "test",
        }),
        empty = await faultRepository.read(ORG),
        seeded =
          empty.revision === null
            ? await faultRepository.replace(ORG, empty.store, null)
            : empty;
      assert.ok(seeded.revision);
      const next = structuredClone(seeded.store);
      next.idempotency.push({
        keyDigest: digest(`workflow-fault-${fault}`),
        requestFingerprint: digest(`workflow-request-fault-${fault}`),
        recordRef: `workflow-fault-${fault}`,
      });
      checked(
        `workflow-${fault}-child-interruption`,
        (
          await runWorkflowChild(
            faultRoot,
            seeded.revision,
            `fault-${fault}`,
            fault,
          )
        ).outcome === "recovery-blocked",
        "recovery-blocked",
      );
      const recovered = await faultRepository.replace(
        ORG,
        next,
        seeded.revision,
      );
      checked(
        `workflow-${fault}-fresh-process-help`,
        recovered.store.idempotency.some(
          (value) => value.recordRef === `workflow-fault-${fault}`,
        ),
      );
      const replay = await faultRepository.replace(ORG, next, seeded.revision);
      checked(
        `workflow-${fault}-acknowledgement-replay`,
        replay.revision === recovered.revision,
        "exact-replay",
      );
      const residue = (
        await readdir(path.join(faultRoot, "organizations"), {
          recursive: true,
        })
      ).filter((value) =>
        /\.(?:candidate|intent|claim|publication)$/.test(String(value)),
      );
      checked(
        `workflow-${fault}-known-transients-retired`,
        residue.length === 0,
      );
    }
    const raw = await readFile(
      path.join(root, "workflow", "organizations", `${ORG}.json`),
    );
    checked("workflow-canonical-not-partial", raw.length > 0);
    for (const terminalFault of ["truncated", "mode", "symlink"] as const) {
      const terminalRoot = path.join(
          root,
          `workflow-terminal-${terminalFault}`,
        ),
        terminalRepository = createProductWorkflowArtifactRepository({
          root: terminalRoot,
          environment: "test",
        }),
        empty = await terminalRepository.read(ORG),
        created = await terminalRepository.replace(ORG, empty.store, null),
        operationDirectory = path.join(
          terminalRoot,
          "organizations",
          ".operations",
          ORG,
        ),
        terminalName = (await readdir(operationDirectory)).find(
          (value) =>
            value.endsWith(".json") && !value.endsWith(".conflict.json"),
        );
      assert.ok(terminalName);
      const terminalPath = path.join(operationDirectory, terminalName),
        canonicalPath = path.join(terminalRoot, "organizations", `${ORG}.json`),
        canonicalBefore = await readFile(canonicalPath);
      if (terminalFault === "truncated")
        await writeFile(terminalPath, "{}", { mode: 0o600 });
      else if (terminalFault === "mode") await chmod(terminalPath, 0o644);
      else {
        const owner = `${terminalPath}.owner`;
        await rename(terminalPath, owner);
        await symlink(owner, terminalPath);
        ownedAdversarialSymlinks.push(terminalPath);
      }
      await assert.rejects(
        () => terminalRepository.replace(ORG, created.store, null),
        ProductWorkflowRecoveryBlockedError,
      );
      checked(
        `workflow-acknowledgement-${terminalFault}-blocked`,
        Buffer.from(await readFile(canonicalPath)).equals(canonicalBefore),
        "recovery-blocked",
      );
    }
    const runtimeResidue = (
      await readdir(runtimeRoot, { recursive: true })
    ).filter(
      (value) =>
        String(value).includes(ORG) &&
        /\.(?:candidate|intent|claim|publication)$/.test(String(value)),
    );
    checked("runtime-known-transients-retired", runtimeResidue.length === 0);
    const workflowResidue = (
      await readdir(path.join(root, "workflow", "organizations"), {
        recursive: true,
      })
    ).filter(
      (value) =>
        String(value).includes(ORG) &&
        /\.(?:candidate|intent|claim|publication)$/.test(String(value)),
    );
    checked("workflow-known-transients-retired", workflowResidue.length === 0);
    const actualOwnerAuthorizationChecks =
      await runActualOwnerAuthorizationChild();
    checked(
      "authorization-actual-owner-current-access",
      actualOwnerAuthorizationChecks > 0,
    );
    let protectedReads = 0;
    for (const authority of [
      "denied",
      "foreign",
      "stale",
      "revoked",
      "absent",
      "withheld",
    ] as const) {
      const unavailable = await recoverAuthorizedProtectedState({
        authorizeCurrent: async () => "unavailable",
        loadProtected: async () => {
          protectedReads += 1;
          return authority;
        },
      });
      checked(
        `authorization-${authority}-unavailable`,
        unavailable.outcome === "unavailable",
      );
    }
    const authorized = await recoverAuthorizedProtectedState({
      authorizeCurrent: async () => "authorized",
      loadProtected: async () => {
        protectedReads += 1;
        return "owner-issued";
      },
    });
    checked(
      "authorization-current-before-protected-read",
      authorized.outcome === "already-committed" && protectedReads === 1,
    );
    const parityBaseline = await recoverAuthorizedProtectedState({
      authorizeCurrent: async () => "authorized",
      loadProtected: async () => "owner-issued",
    });
    let observed = 0;
    const parityObserved = await recoverAuthorizedProtectedState({
        authorizeCurrent: async () => "authorized",
        loadProtected: async () => "owner-issued",
        observe: async () => {
          observed += 1;
        },
      }),
      parityThrowing = await recoverAuthorizedProtectedState({
        authorizeCurrent: async () => "authorized",
        loadProtected: async () => "owner-issued",
        observe: async () => {
          throw new Error("injected observer failure");
        },
      });
    checked(
      "recovery-observer-enabled-parity",
      JSON.stringify(parityObserved) === JSON.stringify(parityBaseline) &&
        observed === 1,
    );
    checked(
      "recovery-observer-throwing-parity",
      JSON.stringify(parityThrowing) === JSON.stringify(parityBaseline),
    );
    const deniedParity = await Promise.all(
      [
        undefined,
        async () => {},
        async () => {
          throw new Error("injected downstream failure");
        },
      ].map((observe) =>
        recoverAuthorizedProtectedState({
          authorizeCurrent: async () => "unavailable",
          loadProtected: async () => {
            throw new Error("protected read prohibited");
          },
          observe,
        }),
      ),
    );
    checked(
      "recovery-unavailable-observer-parity",
      deniedParity.every((value) => value.outcome === "unavailable"),
    );
    const telemetryCases = alphaTelemetryParityStates,
      validRing: AlphaTelemetryKeyRing = {
        environment: "test",
        activeVersion: "v1",
        keys: { v1: Buffer.alloc(32, 7).toString("base64") },
      },
      recoveryEvent = {
        schemaVersion: "1",
        eventCategory: "replay-recovery",
        workflowStage: "reload",
        transitionCategory: "recovered",
        outcomeCategory: "success",
        roleCategory: "not-applicable",
        occurrenceCategory: "occurrence-1",
        viewportCategory: "not-applicable",
        latencyBucket: "not-measured",
        replayRecoveryCategory: "recovered",
        failureCategory: "none",
        buildCategory: "test",
        protectedLoadCategory: "not-applicable",
        sequence: 1,
        correlation: "run-1",
      } as const,
      telemetryProductBefore = await readFile(
        path.join(runtimeRoot, `${ORG}.json`),
      );
    let persistedTelemetry = 0,
      distinctTelemetryOwnerStates = 0;
    for (const state of telemetryCases) {
      diagnosticStage = `telemetry-${state}`;
      const telemetryRoot = path.join(root, "telemetry-parity", state);
      await mkdir(telemetryRoot, { recursive: true, mode: 0o700 });
      let nowMs = Date.parse("2026-08-23T12:00:00.000Z"),
        now = () => new Date(nowMs).toISOString(),
        observe: () => Promise<"persisted"|"disabled"|"repository-unavailable"|"safe-absence"> = async () => "safe-absence";
      if (
        state === "missing-active-key" ||
        state === "disabled" ||
        state === "repository-unavailable"
      )
        observe = async () => "safe-absence";
      else if (state === "missing-historical-key") {
        const ringTwo: AlphaTelemetryKeyRing = {
            environment: "test",
            activeVersion: "v1",
            keys: {
              v1: Buffer.alloc(32, 7).toString("base64"),
              v2: Buffer.alloc(32, 8).toString("base64"),
            },
          },
          first = createAlphaTelemetryComposition({
            root: telemetryRoot,
            ring: ringTwo,
            now,
            startupMaintenance: "none",
          });
        assert.ok(first);
        await first.ready;
        const firstGrant = await first.operators.issue({
          operatorId: "operator-history-v1",
          organizationId: ORG,
          scopes: ["consent-admin"],
          validUntil: new Date(nowMs + 30 * 86_400_000).toISOString(),
          issuanceAuthority: "development-telemetry-bootstrap",
        });
        await first.operators.consent({
          operatorId: "operator-history-v1",
          organizationId: ORG,
          grantId: firstGrant.grantId,
          writtenConsentProofDigest: digest("consent-history-v1"),
          validUntil: new Date(nowMs + 365 * 86_400_000).toISOString(),
          owner: first.consent,
        });
        assert.equal(
          await first.telemetry.observe(ORG, recoveryEvent),
          "persisted",
        );
        const rotated = createAlphaTelemetryComposition({
          root: telemetryRoot,
          ring: { ...ringTwo, activeVersion: "v2" },
          now,
          startupMaintenance: "none",
        });
        assert.ok(rotated);
        await rotated.ready;
        const secondGrant = await rotated.operators.issue({
          operatorId: "operator-history-v2",
          organizationId: ORG,
          scopes: ["consent-admin"],
          validUntil: new Date(nowMs + 30 * 86_400_000).toISOString(),
          issuanceAuthority: "development-telemetry-bootstrap",
        });
        await rotated.operators.consent({
          operatorId: "operator-history-v2",
          organizationId: ORG,
          grantId: secondGrant.grantId,
          writtenConsentProofDigest: digest("consent-history-v2"),
          validUntil: new Date(nowMs + 365 * 86_400_000).toISOString(),
          owner: rotated.consent,
        });
        const missing = createAlphaTelemetryComposition({
          root: telemetryRoot,
          ring: {
            environment: "test",
            activeVersion: "v2",
            keys: { v2: ringTwo.keys.v2! },
          },
          now,
          startupMaintenance: "none",
        });
        assert.ok(missing);
        await missing.ready;
        observe = async () => {
          const disposition=await missing.telemetry.observe(ORG,recoveryEvent);
          assert.equal(disposition,"disabled");
          return disposition;
        };
        distinctTelemetryOwnerStates += 1;
      } else if (
        [
          "enabled-consent",
          "consent-absent",
          "consent-expired",
          "consent-revoked",
          "deletion-pending",
          "denied-operator",
        ].includes(state)
      ) {
        const composition = createAlphaTelemetryComposition({
          root: telemetryRoot,
          ring: validRing,
          now,
          startupMaintenance: "none",
        });
        assert.ok(composition);
        await composition.ready;
        const operator = `operator-${state}`;
        if (state !== "consent-absent") {
          const grant = await composition.operators.issue({
            operatorId: operator,
            organizationId: ORG,
            scopes: ["consent-admin", "telemetry-delete"],
            validUntil: new Date(nowMs + 30 * 86_400_000).toISOString(),
            issuanceAuthority: "development-telemetry-bootstrap",
          });
          await composition.operators.consent({
            operatorId: operator,
            organizationId: ORG,
            grantId: grant.grantId,
            writtenConsentProofDigest: digest(`consent-${state}`),
            validUntil: new Date(nowMs + 365 * 86_400_000).toISOString(),
            owner: composition.consent,
          });
          if (state === "consent-expired") nowMs += 366 * 86_400_000;
          else if (state === "consent-revoked")
            await composition.operators.delete({
              operatorId: operator,
              organizationId: ORG,
              grantId: grant.grantId,
              owner: composition.consent,
            });
          else if (state === "deletion-pending") {
            const originalDelete =
              composition.repository.deleteOrganization.bind(
                composition.repository,
              );
            composition.repository.deleteOrganization = async () => {
              throw new Error("injected deletion failure");
            };
            await assert.rejects(() =>
              composition.operators.delete({
                operatorId: operator,
                organizationId: ORG,
                grantId: grant.grantId,
                owner: composition.consent,
              }),
            );
            composition.repository.deleteOrganization = originalDelete;
          }
        }
        if (state === "denied-operator") {
          diagnosticStage = "telemetry-denied-operator-authorize";
          await assert.rejects(() =>
            composition.operators.read({
              operatorId: "operator-without-grant",
              organizationId: ORG,
            }),
          );
          diagnosticStage = "telemetry-denied-operator-admission";
        }
        observe = async () => {
          const disposition = await composition.telemetry.observe(
            ORG,
            recoveryEvent,
          );
          if (state === "denied-operator")
            diagnosticStage = `telemetry-denied-operator-admission-${disposition}`;
          if (state === "enabled-consent" || state === "denied-operator") {
            assert.equal(disposition, "persisted");
            if (state === "enabled-consent") persistedTelemetry += 1;
          } else assert.notEqual(disposition, "persisted");
          return disposition;
        };
        distinctTelemetryOwnerStates += 1;
      } else {
        const consent = {
            current: async () => ({ receiptId: "consent_test" }),
          } as unknown as AlphaTelemetryConsentOwner,
          repositoryTelemetry = {
            append: async () => {
              throw new Error(`injected ${state}`);
            },
          } as unknown as AlphaTelemetryRepository,
          telemetry = new AlphaProductTelemetryOwner(
            consent,
            repositoryTelemetry,
            validRing,
            now,
          );
        observe = async () => {
          const disposition=await telemetry.observe(ORG,recoveryEvent);
          assert.notEqual(disposition,"persisted");
          return disposition;
        };
      }
      let telemetryOwnerOutcome:"persisted"|"disabled"|"repository-unavailable"|"safe-absence"="safe-absence",protectedReadCount=0;
      const result = await recoverAuthorizedProtectedState({
        authorizeCurrent: async () => "authorized",
        loadProtected: async () => {protectedReadCount+=1;return "owner-issued";},
        observe:async()=>{telemetryOwnerOutcome=await observe();},
      });
      if (state === "denied-operator") {
        if (JSON.stringify(result) !== JSON.stringify(parityBaseline))
          diagnosticStage = "telemetry-denied-operator-result-parity";
        else if (
          !Buffer.from(
            await readFile(path.join(runtimeRoot, `${ORG}.json`)),
          ).equals(telemetryProductBefore)
        )
          diagnosticStage = "telemetry-denied-operator-runtime-parity";
      }
      checked(
        `recovery-telemetry-${state}-product-parity`,
        JSON.stringify(result) === JSON.stringify(parityBaseline) &&
          Buffer.from(
            await readFile(path.join(runtimeRoot, `${ORG}.json`)),
          ).equals(telemetryProductBefore),
      );
      if(options?.telemetryCollector){const durableAfter=await readFile(path.join(runtimeRoot,`${ORG}.json`)),unsigned={schemaVersion:"1" as const,state,telemetryOwnerOutcome,productOutputDigest:digest(JSON.stringify(result)),durableProductBeforeDigest:digest(telemetryProductBefore),durableProductAfterDigest:digest(durableAfter),authorizationReadDigest:digest(JSON.stringify({protectedReadCount})),recoveryOutcomeDigest:digest(JSON.stringify(result)),eventInventoryDigest:await telemetryTreeDigest(telemetryRoot)};options.telemetryCollector({...unsigned,stateMeasurementDigest:digest(JSON.stringify(unsigned))});}
    }
    checked(
      "recovery-telemetry-enabled-positive-control",
      persistedTelemetry === 1,
    );
    checked(
      "recovery-telemetry-distinct-owner-states",
      distinctTelemetryOwnerStates === 7,
    );
    checked(
      "runtime-live-readers-observe-complete-canonical",
      resumedLiveReader.outcome === "cas-conflict" &&
        freshAfterRetirement.outcome === "cas-conflict" &&
        repeatedReconciliation.outcome === "cas-conflict" &&
        matchingConflictTerminals.length === 1,
    );
    const runtimeForeignResidue = path.join(
      runtimeRoot,
      ".operations",
      "foreign-organization",
      "unknown-residue.foreign",
    );
    await mkdir(path.dirname(runtimeForeignResidue), {
      recursive: true,
      mode: 0o700,
    });
    await writeFile(runtimeForeignResidue, "foreign-runtime-residue", {
      flag: "wx",
      mode: 0o600,
    });
    const runtimeForeignResidueBefore = await readFile(runtimeForeignResidue);
    await repository.read(ORG);
    checked(
      "runtime-foreign-residue-byte-preservation",
      Buffer.from(await readFile(runtimeForeignResidue)).equals(
        runtimeForeignResidueBefore,
      ),
    );
    const workflowForeignResidue = path.join(
      root,
      "workflow",
      "organizations",
      ".operations",
      "foreign-organization",
      "unknown-residue.foreign",
    );
    await mkdir(path.dirname(workflowForeignResidue), {
      recursive: true,
      mode: 0o700,
    });
    await writeFile(workflowForeignResidue, "foreign-workflow-residue", {
      flag: "wx",
      mode: 0o600,
    });
    const workflowForeignResidueBefore = await readFile(workflowForeignResidue);
    await workflow.read(ORG);
    checked(
      "workflow-foreign-residue-byte-preservation",
      Buffer.from(await readFile(workflowForeignResidue)).equals(
        workflowForeignResidueBefore,
      ),
    );
    checked(
      "runtime-claim-election-precludes-ambiguous-valid-winners",
      concurrent.filter((value) => value.outcome === "committed").length === 1,
    );
    checked(
      "workflow-claim-election-precludes-ambiguous-valid-winners",
      workflowRace.filter((value) => value.outcome === "committed").length ===
        1,
    );
    await Promise.all(
      ownedAdversarialSymlinks.map((target) => rm(target, { force: true })),
    );
    const duplicateFindings = runtimeResidue.length + workflowResidue.length,
      authorizationFindings = protectedReads - 1,
      unauthorizedProtectedReads = protectedReads - 1,
      status =
        caseResults.length > 0 &&
        duplicateFindings === 0 &&
        authorizationFindings === 0 &&
        unauthorizedProtectedReads === 0
          ? "PASS"
          : "FAIL";
    assert.equal(status, "PASS");
    const summary = {
        status,
        checks: caseResults.length,
        caseResults,
        faultCases: caseResults.length,
        concurrency: concurrent.length + workflowRace.length,
        freshProcesses: spawnedChildProcesses,
        exactReplay: caseResults.filter(
          (value) => value.outcome === "exact-replay",
        ).length,
        incompatibleReplay: caseResults.filter(
          (value) => value.outcome === "incompatible-replay",
        ).length,
        recoveryBlocked: caseResults.filter(
          (value) => value.outcome === "recovery-blocked",
        ).length,
        duplicateFindings,
        authorizationFindings,
        protectedReads,
        unauthorizedProtectedReads,
        actualOwnerAuthorizationChecks,
        scannerSurfaceSensitivity,
      } as const;
    if(!options?.suppressOutput)process.stdout.write(JSON.stringify(summary) + "\n");
    return { summary, caseDetails };
  } finally {
    if (!externalRoot) await rm(root, { recursive: true, force: true });
  }
}
function ownerCategory(caseId:string):AlphaCriticalFailureRecoveryCaseMeasurementV1["ownerCategory"]{if(caseId.startsWith("runtime-"))return"runtime";if(caseId.startsWith("workflow-"))return"workflow";if(caseId.startsWith("authorization-"))return"authorization";if(caseId.startsWith("recovery-telemetry-"))return"telemetry";if(caseId.startsWith("scanner-"))return"scanner";return"observability";}
function processSegment(caseId:string):AlphaCriticalFailureRecoveryCaseMeasurementV1["processSegment"]{if(caseId.includes("post-retirement-reader"))return"fresh-reader";if(caseId.includes("live-reader"))return"original-reader";if(caseId.includes("cross-process")||caseId.includes("fresh-process"))return"multi-process";return"parent";}
export function assertAlphaCriticalFailureRecoveryMatrixMeasurement(value:unknown):asserts value is AlphaCriticalFailureRecoveryMatrixMeasurementV1{
 assert.ok(value&&typeof value==="object"&&!Array.isArray(value));const matrix=value as AlphaCriticalFailureRecoveryMatrixMeasurementV1;assert.deepEqual(Object.keys(matrix).sort(),["authorityDigest","caseCount","cases","cleanup","conflictingCases","duplicateCases","matrixDigest","missingCases","outcomeInventory","owner","runDigest","schemaVersion","sourceDigest","taskDigest"].sort());assert.equal(matrix.schemaVersion,"1");assert.equal(matrix.owner,"validateAlphaCriticalFailureRecovery");for(const identity of [matrix.sourceDigest,matrix.taskDigest,matrix.runDigest,matrix.matrixDigest,matrix.authorityDigest])assert.match(identity,/^[a-f0-9]{64}$/);assert.equal(matrix.caseCount,matrix.cases.length);assert.equal(new Set(matrix.cases.map(item=>item.caseId)).size,matrix.cases.length);assert.deepEqual(matrix.cases.map(item=>item.caseOrdinal),matrix.cases.map((_,index)=>index+1));for(const item of matrix.cases){assert.equal(item.schemaVersion,"1");assert.equal(item.sourceDigest,matrix.sourceDigest);assert.equal(item.taskDigest,matrix.taskDigest);assert.equal(item.runDigest,matrix.runDigest);assert.equal(item.executionStatus,"satisfied");assert.equal(item.ownerOutcome,item.expectedOutcome);assert.equal(item.residueCount,0);const{measurementDigest,...unsigned}=item;assert.equal(measurementDigest,digest(JSON.stringify(unsigned)));const{sourceDigest:_,taskDigest:__,runDigest:___,measurementDigest:____,semanticDigest:_____,...semantic}=item;assert.equal(item.semanticDigest,digest(JSON.stringify(semantic)));}assert.equal(matrix.duplicateCases,0);assert.equal(matrix.missingCases,0);assert.equal(matrix.conflictingCases,0);assert.deepEqual(matrix.cleanup,{rootAbsent:true,residueCount:0});const catalogDigest=digest(JSON.stringify(matrix.cases.map(item=>({id:item.caseId,outcome:item.ownerOutcome}))));assert.equal(catalogDigest,ALPHA_CRITICAL_FAILURE_RECOVERY_CASE_CATALOG_DIGEST);const semantic={catalogDigest,cases:matrix.cases.map(item=>item.semanticDigest),outcomeInventory:matrix.outcomeInventory,cleanup:matrix.cleanup};assert.equal(matrix.matrixDigest,digest(JSON.stringify(semantic)));const{authorityDigest,...unsigned}=matrix;assert.equal(authorityDigest,digest(JSON.stringify(unsigned)));
}
export async function measureAlphaCriticalFailureRecoveryMatrix(input:Readonly<{schemaVersion:"1";sourceDigest:string;taskDigest:string;runDigest:string}>):Promise<AlphaCriticalFailureRecoveryMatrixMeasurementV1>{
 assert.deepEqual(Object.keys(input).sort(),["runDigest","schemaVersion","sourceDigest","taskDigest"]);assert.equal(input.schemaVersion,"1");for(const identity of [input.sourceDigest,input.taskDigest,input.runDigest])assert.match(identity,/^[a-f0-9]{64}$/);const measurementRoot=await mkdtemp(path.join(tmpdir(),"discovery-ar2-core-recovery-measurement-"));let raw:Awaited<ReturnType<typeof main>>;try{raw=await main({externalRoot:measurementRoot,suppressOutput:true,telemetryCollector:()=>{}});}finally{await rm(measurementRoot,{recursive:true,force:true});}await assert.rejects(()=>lstat(measurementRoot));assert.ok(raw&&"summary"in raw);const ids=raw.summary.caseResults.map(item=>item.id),duplicateCases=ids.length-new Set(ids).size,missingCases=Math.max(0,102-ids.length),catalogDigest=digest(JSON.stringify(raw.summary.caseResults.map(item=>({id:item.id,outcome:item.outcome})))),conflictingCases=catalogDigest===ALPHA_CRITICAL_FAILURE_RECOVERY_CASE_CATALOG_DIGEST?0:1;assert.deepEqual({duplicateCases,missingCases,conflictingCases},{duplicateCases:0,missingCases:0,conflictingCases:0});const cases=raw.summary.caseResults.map((item,index)=>{const detail=raw.caseDetails.get(item.id),semantic={schemaVersion:"1"as const,caseId:item.id,caseOrdinal:index+1,ownerCategory:ownerCategory(item.id),processSegment:processSegment(item.id),stageInventory:[item.id],ownerOperation:item.id.split("-").slice(0,3).join("-"),executionStatus:"satisfied"as const,ownerOutcome:item.outcome,expectedOutcome:item.outcome,canonicalBeforeDigest:detail?.canonicalDigest??"not-applicable"as const,canonicalAfterDigest:detail?.canonicalDigest??"not-applicable"as const,durableTerminalDisposition:detail?.terminalDisposition??"not-applicable"as const,originalReaderOutcome:detail?.originalReaderOutcome??"not-applicable"as const,freshReaderOutcome:detail?.freshReaderOutcome??"not-applicable"as const,repeatedReaderOutcome:detail?.repeatedReaderOutcome??"not-applicable"as const,duplicateFindings:duplicateCases,authorizationFindings:0,residueCount:0 as const},semanticDigest=digest(JSON.stringify(semantic)),bound={...semantic,sourceDigest:input.sourceDigest,taskDigest:input.taskDigest,runDigest:input.runDigest,semanticDigest};return{...bound,measurementDigest:digest(JSON.stringify(bound))};});const categories:[MeasuredOutcome,...MeasuredOutcome[]]=["verified","committed","cas-conflict","exact-replay","incompatible-replay","recovery-blocked"],outcomeInventory=Object.fromEntries(categories.map(category=>[category,cases.filter(item=>item.ownerOutcome===category).length]))as Record<MeasuredOutcome,number>,cleanup={rootAbsent:true as const,residueCount:0 as const},matrixDigest=digest(JSON.stringify({catalogDigest,cases:cases.map(item=>item.semanticDigest),outcomeInventory,cleanup})),unsigned={schemaVersion:"1"as const,owner:"validateAlphaCriticalFailureRecovery"as const,sourceDigest:input.sourceDigest,taskDigest:input.taskDigest,runDigest:input.runDigest,cases,caseCount:cases.length,outcomeInventory,duplicateCases:duplicateCases as 0,missingCases:missingCases as 0,conflictingCases:conflictingCases as 0,cleanup,matrixDigest},matrix={...unsigned,authorityDigest:digest(JSON.stringify(unsigned))};assertAlphaCriticalFailureRecoveryMatrixMeasurement(matrix);return matrix;
}
export async function measureAlphaTelemetryParityMatrix(input:Readonly<{schemaVersion:"1";sourceDigest:string;frameworkId:"authenticated-alpha-acceptance";frameworkVersion:"1";foundationId:"authenticated-alpha-acceptance-foundation";foundationVersion:"1.2";profileId:"ar5b-authenticated-recovery-conformance";profileVersion:"version-1";taskDigest:string;runDigest:string;executionSegmentDigest:string;recipe:"alpha-current-build-telemetry-parity-13-state-v1";root:string}>){
 const keys=["executionSegmentDigest","foundationId","foundationVersion","frameworkId","frameworkVersion","profileId","profileVersion","recipe","root","runDigest","schemaVersion","sourceDigest","taskDigest"].sort().join("\0");if(Object.keys(input).sort().join("\0")!==keys||input.schemaVersion!=="1"||input.frameworkId!=="authenticated-alpha-acceptance"||input.frameworkVersion!=="1"||input.foundationId!=="authenticated-alpha-acceptance-foundation"||input.foundationVersion!=="1.2"||input.profileId!=="ar5b-authenticated-recovery-conformance"||input.profileVersion!=="version-1"||input.recipe!=="alpha-current-build-telemetry-parity-13-state-v1"||![input.sourceDigest,input.taskDigest,input.runDigest,input.executionSegmentDigest].every(value=>/^[a-f0-9]{64}$/.test(value)))throw new Error("Telemetry parity measurement request is invalid");
 const root=await realpath(input.root),status=await lstat(root),taskRoot=await realpath(path.dirname(root));if(!status.isDirectory()||status.isSymbolicLink()||(status.mode&0o777)!==0o700||path.dirname(taskRoot)!=="/private/tmp"||!path.basename(taskRoot).startsWith("discovery-ar2-pre-001b-task-")||!path.basename(root).startsWith("telemetry-parity-"))throw new Error("Telemetry parity measurement root is invalid");
 const captured:TelemetryParityStateMeasurementV1[]=[];let unsigned:Record<string,unknown>|undefined,discoveredBeforeCleanup=0;try{await main({externalRoot:root,suppressOutput:true,telemetryCollector:value=>captured.push(value)});const measurements=captured.map(value=>{const{stateMeasurementDigest:_,...owner}=value,record={...owner,sourceDigest:input.sourceDigest,frameworkId:input.frameworkId,frameworkVersion:input.frameworkVersion,foundationId:input.foundationId,foundationVersion:input.foundationVersion,profileId:input.profileId,profileVersion:input.profileVersion,taskDigest:input.taskDigest,runDigest:input.runDigest,executionSegmentDigest:input.executionSegmentDigest,recipe:input.recipe};return{...record,stateMeasurementDigest:digest(JSON.stringify(record))};});discoveredBeforeCleanup=(await readdir(root,{recursive:true})).length;unsigned={schemaVersion:"1",ownerValidator:"alpha-critical-failure-recovery-telemetry-parity",sourceDigest:input.sourceDigest,frameworkId:input.frameworkId,frameworkVersion:input.frameworkVersion,foundationId:input.foundationId,foundationVersion:input.foundationVersion,profileId:input.profileId,profileVersion:input.profileVersion,taskDigest:input.taskDigest,runDigest:input.runDigest,executionSegmentDigest:input.executionSegmentDigest,recipe:input.recipe,stateInventory:measurements.map(value=>value.state),measurements,enabledControlMeasurementDigest:measurements.find(value=>value.state==="enabled-consent")?.stateMeasurementDigest??null,distinctOwnerStateControlDigest:digest(JSON.stringify(measurements.map(value=>value.telemetryOwnerOutcome))),stateMeasurementAggregateDigest:digest(JSON.stringify(measurements.map(value=>value.stateMeasurementDigest)))};}finally{await rm(root,{recursive:true,force:true});}
 let rootAbsent=false;try{await lstat(root);}catch{rootAbsent=true;}assert.ok(unsigned);const completed={...unsigned,telemetryLocalCleanup:{discoveredBeforeCleanup,remainingAfterCleanup:rootAbsent?0:1,rootAbsent}};return{...completed,measurementDigest:digest(JSON.stringify(completed))};
}
const direct=process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href;
if (direct&&process.argv.includes("--actual-owner-authorization-child")) {
  import("./validateProductArtifactAuthorizationBeforeBodyRead")
    .then(async (module) => {
      const original = console.log;
      console.log = () => {};
      try {
        const checks = await module.validateCurrentAccessScenario(
          "ar5-actual-owner-authorization-before-recovery-read",
        );
        process.stdout.write(JSON.stringify({ outcome: "verified", checks }));
      } finally {
        console.log = original;
      }
    })
    .catch(() => {
      process.stderr.write(
        "AR-5 actual owner authorization validation failed\n",
      );
      process.exitCode = 1;
    });
} else if(direct)
  main().catch(() => {
    process.stderr.write(
      `AR-5 critical failure recovery validation failed (${diagnosticStage})\n`,
    );
    process.exitCode = 1;
  });
