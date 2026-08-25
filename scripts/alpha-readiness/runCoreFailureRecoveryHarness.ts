import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { lstat, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { scanRoot, scanText } from "./protectedValueScanner";
import type { CriticalFailureRecoveryResult } from "./criticalFailureRecoveryContracts";
import type { CriticalFailureRecoveryMeasurementEnvelope } from "./criticalFailureRecoveryContracts";
import type { CriticalFailureRecoveryMeasurementByProducer, CriticalFailureRecoveryProducer, CriticalFailureRecoveryEnvelopeFor, FocusedOwnerRecoveryMeasurement, MaterializationAtomicityMeasurement, MaterializationFailureMeasurement, MaterializationFreshProcessMeasurement, JoinedReplayInventoryMeasurement } from "./criticalFailureRecoveryContracts";
import { adjudicateCriticalFailureRecovery, validateCriticalFailureRecoveryEnvelopes } from "./criticalFailureRecoveryCoordinator";

const execute = promisify(execFile);
const repositoryRoot = process.cwd();
const evidenceRoot = path.join(
  repositoryRoot,
  "docs/agent-work-orders/evidence/alpha-readiness/ar5a",
);
const resultsPath = path.join(
  evidenceRoot,
  "AR5A_CORE_FAILURE_RECOVERY_RESULTS.json",
);
const reportPath = path.join(
  evidenceRoot,
  "AR5A_CORE_FAILURE_RECOVERY_REPORT.md",
);
const sourcePaths = [
  "engine/v3/runtime/organizationRuntimeRepository.ts",
  "product/workflow/leadershipConversation/productWorkflowArtifactRepository.ts",
  "scripts/alpha-readiness/criticalFailureRecoveryContracts.ts",
  "scripts/alpha-readiness/criticalFailureRecoveryCoordinator.ts",
  "scripts/product/validateAlphaCriticalFailureRecovery.ts",
  "scripts/product/validateCanonicalMutationProductMaterializationAtomicity.ts",
  "scripts/product/validateCanonicalMutationProductMaterializationFailure.ts",
  "scripts/product/validateCanonicalMutationProductMaterializationFreshProcess.ts",
  "scripts/product/validateLeadershipConversationReplay.ts",
  "scripts/alpha-readiness/runCoreFailureRecoveryHarness.ts",
  "package.json",
] as const;
const protectedValues = [
  { category: "protected-value", value: "AR5A-PROTECTED-CANARY-71c58f" },
  { category: "credential", value: "sk_test_ar5a_forbidden_2c913e" },
] as const;
const boundaryHead = "780247cfb8e2efad8ac085fe7ff34900e396dfba";
const evidenceRelativePaths = [
  "docs/agent-work-orders/evidence/alpha-readiness/ar5a/AR5A_CORE_FAILURE_RECOVERY_RESULTS.json",
  "docs/agent-work-orders/evidence/alpha-readiness/ar5a/AR5A_CORE_FAILURE_RECOVERY_REPORT.md",
] as const;

function digest(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function parseLastJson<T extends object>(stdout: string): T {
  for (const line of stdout.trim().split("\n").reverse()) {
    try {
      const value = JSON.parse(line);
      if (value && typeof value === "object") return value as T;
    } catch {}
  }
  throw new Error("AR-5A child result is unavailable");
}

async function child<T extends object>(
  script: string,
  args: readonly string[] = [],
): Promise<{ result: T; stdout: string; stderr: string }> {
  const execution = await execute(
    process.execPath,
    ["--conditions=react-server", "--import", "tsx", script, ...args],
    {
      cwd: repositoryRoot,
      env: {
        PATH: process.env.PATH,
        NODE_PATH: process.env.NODE_PATH,
        TMPDIR: process.env.TMPDIR,
        NODE_ENV: "test",
        TZ: "UTC",
        LANG: "C",
      },
      maxBuffer: 32 * 2 ** 20,
      timeout: 180_000,
    },
  );
  return {
    result: parseLastJson<T>(execution.stdout),
    stdout: execution.stdout,
    stderr: execution.stderr,
  };
}

async function git(...args: string[]): Promise<string> {
  return (await execute("git", args, { cwd: repositoryRoot })).stdout.trim();
}

async function sourceIdentity() {
  const tracked = (await git("ls-files", "-z")).split("\0").filter(Boolean);
  const paths = [...new Set([...tracked, ...sourcePaths])]
    .filter((file) => !evidenceRelativePaths.includes(file as any))
    .sort();
  const manifest = await Promise.all(
    paths.map(async (file) => ({
      path: file,
      digest: digest(await readFile(path.join(repositoryRoot, file))),
    })),
  );
  const currentHead = await git("rev-parse", "HEAD");
  assert.equal(await git("merge-base", "--is-ancestor", boundaryHead, currentHead).then(() => "yes"), "yes");
  const boundaryTree = await git("rev-parse", `${boundaryHead}^{tree}`);
  const packageLockDigest = digest(await readFile(path.join(repositoryRoot, "package-lock.json")));
  const boundaryPackageLockDigest = digest(await execute("git", ["show", `${boundaryHead}:package-lock.json`], { cwd: repositoryRoot, encoding: "buffer", maxBuffer: 32 * 2 ** 20 }).then((value) => value.stdout as unknown as Buffer));
  assert.equal(packageLockDigest, boundaryPackageLockDigest);
  return {
    boundaryHead,
    boundaryTree,
    generationHead: currentHead,
    pathCount: manifest.length,
    packageLockDigest,
    manifest,
    digest: digest(JSON.stringify(manifest)),
  };
}

function envelope<P extends CriticalFailureRecoveryProducer>(
  producer: P,
  sequence: number,
  measurement: CriticalFailureRecoveryMeasurementByProducer[P],
  sourceDigest: string,
  runId: string,
): CriticalFailureRecoveryEnvelopeFor<P> {
  return {
    contractVersion: "ar5a-measurement-v1",
    producer,
    phase: producer,
    sequence,
    sourceDigest,
    taskId: "ar5a-core-failure-recovery",
    runId,
    measurement,
    measurementDigest: digest(JSON.stringify(measurement)),
  };
}

function assertEnvelope(value: CriticalFailureRecoveryMeasurementEnvelope) {
  assert.equal(value.measurementDigest, digest(JSON.stringify(value.measurement)));
}

async function exactChangedPaths(): Promise<string[]> {
  const dirty = [
    ...(await git("diff", "--name-only", "-z")).split("\0"),
    ...(await git("ls-files", "--others", "--exclude-standard", "-z")).split("\0"),
  ].filter(Boolean).sort();
  if (dirty.length) return dirty;
  return (await git("diff", "--name-only", "-z", `${boundaryHead}..HEAD`))
    .split("\0").filter(Boolean).sort();
}

function renderReport(result: CriticalFailureRecoveryResult): string {
  return `# AR-5A Core Failure-Recovery Report

- Owner recovery: **${result.ownerRecoveryStatus}**
- Product readiness: **${result.productReadinessStatus}**
- Fault cases: ${result.faultCaseTotal}
- Concurrent owner operations: ${result.concurrencyTotal}
- Fresh processes: ${result.freshProcessTotal}
- Exact replays: ${result.exactReplayTotal}
- Incompatible replays: ${result.incompatibleReplayTotal}
- Recovery-blocked controls: ${result.recoveryBlockedTotal}
- Duplicate findings: ${result.duplicateFindingTotal}
- Authorization findings: ${result.authorizationFindingTotal}
- Scanner findings: ${result.scannerFindingTotal} (sensitivity ${result.scannerSensitivityTotal})
- AR-3 owner observation parity: **${result.ar3OwnerParityStatus}**
- AR-4 owner Product parity: **${result.ar4OwnerParityStatus}**
- Historical AR-3/AR-4 evidence: **${result.historicalEvidenceDisposition}** (preserved; not rewritten)
- Deterministic repeat: **${result.deterministicRepeatStatus}**
- Cleanup: **${result.cleanupStatus}**
- Product Artifact body repository: **${result.bodyRepositoryPath}**
- Replay validator: **${result.replayValidatorPath}**
- package-lock.json: **${result.packageLockStatus}**
- Source digest: \`${result.sourceDigest}\`
- Result digest: \`${result.resultDigest}\`

AR-5A hardens the existing filesystem Runtime and Product Workflow persistence owners. It adds no canonical owner, schema, migration, production rollback path, browser lifecycle, or external resource dependency.
`;
}

async function measure(): Promise<{
  result: CriticalFailureRecoveryResult;
  details: Record<string, unknown>;
  streams: string[];
}> {
  const firstRoot = await mkdtemp(path.join(tmpdir(), "discovery-ar5a-first-"));
  const secondRoot = await mkdtemp(path.join(tmpdir(), "discovery-ar5a-second-"));
  const streams: string[] = [];
  try {
    const focusedA = await child<Omit<FocusedOwnerRecoveryMeasurement, "deterministicRepeat">>(
      "scripts/product/validateAlphaCriticalFailureRecovery.ts",
      ["--root", firstRoot],
    );
    const focusedB = await child<Omit<FocusedOwnerRecoveryMeasurement, "deterministicRepeat">>(
      "scripts/product/validateAlphaCriticalFailureRecovery.ts",
      ["--root", secondRoot],
    );
    const atomicity = await child<MaterializationAtomicityMeasurement>(
      "scripts/product/validateCanonicalMutationProductMaterializationAtomicity.ts",
    );
    const failure = await child<MaterializationFailureMeasurement>(
      "scripts/product/validateCanonicalMutationProductMaterializationFailure.ts",
    );
    const fresh = await child<MaterializationFreshProcessMeasurement>(
      "scripts/product/validateCanonicalMutationProductMaterializationFreshProcess.ts",
    );
    const replay = await child<{
      result: "PASS"; checks: number; freshProcesses: number;
      inventory: JoinedReplayInventoryMeasurement["inventory"];
      observability: JoinedReplayInventoryMeasurement["observability"] & Record<string, unknown>;
    }>(
      "scripts/product/validateLeadershipConversationReplay.ts",
    );
    for (const item of [focusedA, focusedB, atomicity, failure, fresh, replay])
      streams.push(item.stdout, item.stderr);

    assert.equal(focusedA.result.status, "PASS");
    assert.equal(focusedB.result.status, "PASS");
    assert.deepEqual(focusedB.result, focusedA.result);
    assert.equal(atomicity.result.status, "PASS");
    assert.equal(failure.result.status, "PASS");
    assert.equal(fresh.result.status, "PASS");
    assert.equal(fresh.result.deterministicAtomicity, true);
    assert.equal(fresh.result.deterministicFailureRecovery, true);
    assert.equal(replay.result.result, "PASS");
    assert.equal(replay.result.inventory.duplicateFindings, 0);

    const publicFindings = streams.flatMap((value, index) =>
      scanText(`ar5a-stream-${index}`, value, protectedValues),
    );
    const rootFindings = [
      ...(await scanRoot(firstRoot, protectedValues)),
      ...(await scanRoot(secondRoot, protectedValues)),
    ];
    assert.deepEqual(publicFindings, []);
    assert.deepEqual(rootFindings, []);
    const directSensitivity = protectedValues.flatMap((value, index) =>
      scanText(`ar5a-sensitivity-${index}`, value.value, [value]),
    ).length;
    assert.equal(directSensitivity, 2);

    const source = await sourceIdentity();
    const changedPaths = await exactChangedPaths();
    assert.deepEqual(changedPaths, [...sourcePaths, ...evidenceRelativePaths].sort());
    const changedPathSet = new Set<string>(changedPaths);
    assert.ok(!changedPathSet.has("product/persistence/productArtifactBodyRepository.ts"));
    assert.ok(changedPathSet.has("scripts/product/validateLeadershipConversationReplay.ts"));
    const replayMeasurement = {
      status: replay.result.result,
      checks: replay.result.checks,
      freshProcesses: replay.result.freshProcesses,
      inventory: replay.result.inventory,
      observability: { eventCount: replay.result.observability.eventCount, neutralityCaseCount: replay.result.observability.neutralityCaseCount },
    };
    const runId = digest(`ar5a-core-failure-recovery\0${source.digest}`);
    const envelopes: CriticalFailureRecoveryMeasurementEnvelope[] = [
      envelope("focused-owner-recovery", 1, { ...focusedA.result, deterministicRepeat: JSON.stringify(focusedA.result) === JSON.stringify(focusedB.result) }, source.digest, runId),
      envelope("materialization-atomicity", 2, atomicity.result, source.digest, runId),
      envelope("materialization-failure", 3, failure.result, source.digest, runId),
      envelope("materialization-fresh-process", 4, fresh.result, source.digest, runId),
      envelope("joined-replay-inventory", 5, replayMeasurement, source.digest, runId),
      envelope("scanner", 6, { findings: publicFindings.length + rootFindings.length, sensitivity: focusedA.result.scannerSurfaceSensitivity + directSensitivity, surfaces: streams.length + 2 }, source.digest, runId),
    ];
    envelopes.forEach(assertEnvelope);
    await rm(firstRoot, { recursive: true, force: true });
    await rm(secondRoot, { recursive: true, force: true });
    await assert.rejects(() => lstat(firstRoot));
    await assert.rejects(() => lstat(secondRoot));
    envelopes.push(envelope("cleanup-zero", 7, { status: "cleanup-complete", rootsRemaining: 0 }, source.digest, runId));
    validateCriticalFailureRecoveryEnvelopes({ envelopes, sourceDigest: source.digest, runId });
    const changedPathsDigest = digest(JSON.stringify(changedPaths));
    const base = adjudicateCriticalFailureRecovery({ envelopes, sourceDigest: source.digest, changedPathsDigest, runId });
    assert.equal(base.duplicateFindingTotal, 0);
    assert.equal(base.authorizationFindingTotal, 0);
    assert.equal(focusedA.result.unauthorizedProtectedReads, 0);
    assert.ok(base.recoveryBlockedTotal > 0);
    assert.equal(base.ar3OwnerParityStatus, "PASS");
    assert.equal(base.ar4OwnerParityStatus, "PASS");
    const result = {
      ...base,
      resultDigest: digest(JSON.stringify(base)),
    };
    return {
      result,
      streams,
      details: {
        source,
        changedPaths,
        runId,
        envelopes,
      },
    };
  } catch (error) {
    await rm(firstRoot, { recursive: true, force: true });
    await rm(secondRoot, { recursive: true, force: true });
    throw error;
  }
}

async function main() {
  if (process.argv.includes("--write")) {
    const measured = await measure();
    const payload = { ...measured.result, measurements: measured.details };
    const json = `${JSON.stringify(payload, null, 2)}\n`;
    const report = renderReport(measured.result);
    assert.deepEqual(scanText("ar5a-results", json, protectedValues), []);
    assert.deepEqual(scanText("ar5a-report", report, protectedValues), []);
    await mkdir(evidenceRoot, { recursive: true });
    await writeFile(resultsPath, json, { mode: 0o600 });
    await writeFile(reportPath, report, { mode: 0o600 });
    process.stdout.write(
      `AR-5A core recovery: PASS ${measured.result.sourceDigest} ${measured.result.resultDigest}\n`,
    );
  } else {
    const payload = JSON.parse(await readFile(resultsPath, "utf8")) as CriticalFailureRecoveryResult & {
      measurements: { source: Awaited<ReturnType<typeof sourceIdentity>>; changedPaths: string[]; runId: string; envelopes: CriticalFailureRecoveryMeasurementEnvelope[] };
    };
    payload.measurements.envelopes.forEach(assertEnvelope);
    const currentSource = await sourceIdentity();
    const { generationHead: _storedHead, ...storedSource } = payload.measurements.source;
    const { generationHead: _currentHead, ...currentSourceStable } = currentSource;
    assert.deepEqual(storedSource, currentSourceStable);
    const currentChangedPaths = await exactChangedPaths();
    assert.deepEqual(payload.measurements.changedPaths, currentChangedPaths);
    const changedPathsDigest = digest(JSON.stringify(currentChangedPaths));
    const base = adjudicateCriticalFailureRecovery({ envelopes: payload.measurements.envelopes, sourceDigest: currentSource.digest, changedPathsDigest, runId: payload.measurements.runId });
    const { resultDigest, measurements: _measurements, ...storedBase } = payload;
    assert.deepEqual(storedBase, base);
    assert.equal(resultDigest, digest(JSON.stringify(base)));
    assert.equal(await readFile(reportPath, "utf8"), renderReport(payload));
    assert.deepEqual(scanText("ar5a-stored-evidence", JSON.stringify(payload), protectedValues), []);
    process.stdout.write(`AR-5A core recovery: PASS ${payload.sourceDigest} ${payload.resultDigest}\n`);
  }
}

void main().catch((error) => {
  process.stderr.write(`AR-5A core recovery: FAIL ${(error as Error).message}\n`);
  process.exitCode = 1;
});
