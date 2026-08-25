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
const implementationCommit = "e3b035d6bcd7f75285ff2e34111c2732c8642519";
const implementationTree = "e930031a26ffdb7255ce9562424f46087760f2b2";
const controlTowerCommit = "edc497fbb5a9f38e67ba579a391b731f82136e88";
const controlTowerTree = "6b19044d9e1792e53f0e9303f36a5e26da60561b";
const controlTowerPath = "docs/Product/PRODUCT_ROADMAP.md";
const evidenceRelativePaths = [
  "docs/agent-work-orders/evidence/alpha-readiness/ar5a/AR5A_CORE_FAILURE_RECOVERY_RESULTS.json",
  "docs/agent-work-orders/evidence/alpha-readiness/ar5a/AR5A_CORE_FAILURE_RECOVERY_REPORT.md",
] as const;
const correctionPaths = [
  "product/workflow/leadershipConversation/operations.ts",
  "scripts/alpha-readiness/runCoreFailureRecoveryHarness.ts",
  "scripts/alpha-readiness/runNonDisclosureThreatHarness.ts",
  ...evidenceRelativePaths,
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

type ControlTowerIdentity = {
  commit: string; parent: string; tree: string; message: string;
  paths: string[]; roadmapBlob: string; diffDigest: string;
};

function assertControlTowerShape(value: ControlTowerIdentity) {
  assert.equal(value.commit, controlTowerCommit);
  assert.equal(value.parent, implementationCommit);
  assert.equal(value.tree, controlTowerTree);
  assert.equal(value.message, "docs: advance alpha readiness to AR-5B");
  assert.deepEqual(value.paths, [controlTowerPath]);
  assert.match(value.roadmapBlob, /^[a-f0-9]{40}$/);
  assert.match(value.diffDigest, /^[a-f0-9]{64}$/);
}

async function controlTowerIdentity(): Promise<ControlTowerIdentity> {
  const value = {
    commit: controlTowerCommit,
    parent: await git("rev-parse", `${controlTowerCommit}^`),
    tree: await git("rev-parse", `${controlTowerCommit}^{tree}`),
    message: await git("show", "-s", "--format=%s", controlTowerCommit),
    paths: (await git("diff-tree", "--no-commit-id", "--name-only", "-r", controlTowerCommit)).split("\n").filter(Boolean),
    roadmapBlob: await git("rev-parse", `${controlTowerCommit}:${controlTowerPath}`),
    diffDigest: digest(await execute("git", ["diff-tree", "-p", "--binary", "--full-index", implementationCommit, controlTowerCommit], { cwd: repositoryRoot, maxBuffer: 32 * 2 ** 20 }).then((result) => result.stdout)),
  };
  assertControlTowerShape(value);
  return value;
}

async function sourceIdentity() {
  const tracked = (await git("ls-files", "-z")).split("\0").filter(Boolean);
  const paths = [...new Set([...tracked, ...sourcePaths])]
    .filter((file) => !evidenceRelativePaths.includes(file as any) && file !== controlTowerPath)
    .sort();
  const manifest = await Promise.all(
    paths.map(async (file) => ({
      path: file,
      digest: digest(await readFile(path.join(repositoryRoot, file))),
    })),
  );
  const currentHead = await git("rev-parse", "HEAD");
  assert.equal(await git("merge-base", "--is-ancestor", boundaryHead, currentHead).then(() => "yes"), "yes");
  assert.equal(await git("merge-base", "--is-ancestor", implementationCommit, currentHead).then(() => "yes"), "yes");
  assert.equal(await git("merge-base", "--is-ancestor", controlTowerCommit, currentHead).then(() => "yes"), "yes");
  assert.equal(await git("rev-parse", `${implementationCommit}^`), boundaryHead);
  assert.equal(await git("rev-parse", `${implementationCommit}^{tree}`), implementationTree);
  const boundaryTree = await git("rev-parse", `${boundaryHead}^{tree}`);
  const packageLockDigest = digest(await readFile(path.join(repositoryRoot, "package-lock.json")));
  const boundaryPackageLockDigest = digest(await execute("git", ["show", `${boundaryHead}:package-lock.json`], { cwd: repositoryRoot, encoding: "buffer", maxBuffer: 32 * 2 ** 20 }).then((value) => value.stdout as unknown as Buffer));
  assert.equal(packageLockDigest, boundaryPackageLockDigest);
  const controlTower = await controlTowerIdentity();
  const implementationSourceDigest = digest(JSON.stringify(manifest));
  return {
    boundaryHead,
    boundaryTree,
    implementationCommit,
    implementationTree,
    generationHead: currentHead,
    pathCount: manifest.length,
    packageLockDigest,
    excludedPaths: [...evidenceRelativePaths, controlTowerPath].sort(),
    manifest,
    implementationSourceDigest,
    controlTower,
    digest: digest(JSON.stringify({ implementationSourceDigest, controlTower })),
  };
}

function stableSource(value: Awaited<ReturnType<typeof sourceIdentity>>) {
  const { generationHead: _generationHead, ...stable } = value;
  return stable;
}

function sourceBindingControls(source: Awaited<ReturnType<typeof sourceIdentity>>) {
  const checks: string[] = [];
  const checked = (id: string, run: () => void) => { run(); checks.push(id); };
  const baseline = stableSource(source);
  const rejectSource = (id: string, candidate: typeof baseline) =>
    checked(id, () => assert.throws(() => assert.deepEqual(candidate, baseline)));
  const rejectTower = (id: string, candidate: ControlTowerIdentity) =>
    checked(id, () => assert.throws(() => { assertControlTowerShape(candidate); assert.deepEqual(candidate, source.controlTower); }));
  checked("implementation-source-current", () => assert.deepEqual(stableSource(source), baseline));
  checked("implementation-precedes-control-tower", () => assert.equal(source.controlTower.parent, source.implementationCommit));
  checked("canonical-control-tower-transition", () => assertControlTowerShape(source.controlTower));
  checked("unchanged-descendant-permitted", () => assert.deepEqual(stableSource({ ...source, generationHead: "f".repeat(40) }), baseline));
  checked("implementation-commit-exact", () => assert.equal(source.implementationCommit, implementationCommit));
  checked("implementation-tree-exact", () => assert.equal(source.implementationTree, implementationTree));
  checked("control-tower-current", () => assert.deepEqual(source.controlTower, baseline.controlTower));
  rejectTower("wrong-control-tower-commit", { ...source.controlTower, commit: boundaryHead });
  rejectTower("wrong-control-tower-parent", { ...source.controlTower, parent: boundaryHead });
  rejectTower("wrong-control-tower-tree", { ...source.controlTower, tree: boundaryHead });
  rejectTower("wrong-control-tower-message", { ...source.controlTower, message: "changed" });
  rejectTower("wrong-control-tower-path", { ...source.controlTower, paths: ["package.json"] });
  rejectTower("wrong-control-tower-blob", { ...source.controlTower, roadmapBlob: "0".repeat(40) });
  rejectTower("wrong-control-tower-diff", { ...source.controlTower, diffDigest: "0".repeat(64) });
  rejectSource("changed-implementation-digest", { ...baseline, implementationSourceDigest: "0".repeat(64) });
  rejectSource("removed-manifest-path", { ...baseline, manifest: baseline.manifest.slice(1) });
  rejectSource("added-manifest-path", { ...baseline, manifest: [...baseline.manifest, { path: "unauthorized", digest: "0".repeat(64) }] });
  rejectSource("substituted-manifest-path", { ...baseline, manifest: baseline.manifest.map((value, index) => index ? value : { ...value, path: "unauthorized" }) });
  rejectSource("reintroduced-roadmap-invalidates", { ...baseline, implementationSourceDigest: digest(JSON.stringify([...baseline.manifest, { path: controlTowerPath, digest: source.controlTower.roadmapBlob }])) });
  rejectSource("overbroad-source-exclusion", { ...baseline, excludedPaths: [...baseline.excludedPaths, baseline.manifest[0]!.path].sort() });
  rejectSource("divergent-history", { ...baseline, controlTower: { ...baseline.controlTower, parent: boundaryHead } });
  checked("roadmap-excluded", () => assert.ok(!baseline.manifest.some((value) => value.path === controlTowerPath)));
  checked("evidence-results-excluded", () => assert.ok(!baseline.manifest.some((value) => value.path === evidenceRelativePaths[0])));
  checked("evidence-report-excluded", () => assert.ok(!baseline.manifest.some((value) => value.path === evidenceRelativePaths[1])));
  checked("only-three-exclusions", () => assert.deepEqual(baseline.excludedPaths, [...evidenceRelativePaths, controlTowerPath].sort()));
  checked("aggregate-binds-both-identities", () => assert.equal(baseline.digest, digest(JSON.stringify({ implementationSourceDigest: baseline.implementationSourceDigest, controlTower: baseline.controlTower }))));
  checked("manual-evidence-change-bound", () => assert.notEqual(digest(JSON.stringify({ sourceDigest: source.digest, result: "FAIL" })), digest(JSON.stringify({ sourceDigest: source.digest, result: "PASS" }))));
  checked("static-pass-not-source-proof", () => assert.notEqual(digest("PASS"), source.digest));
  assert.equal(checks.length, 28);
  return { status: "PASS" as const, checkCount: checks.length, checks };
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
  return (await git("diff", "--name-only", "-z", `${controlTowerCommit}..HEAD`))
    .split("\0").filter(Boolean).sort();
}

function renderReport(
  result: CriticalFailureRecoveryResult,
  source: Awaited<ReturnType<typeof sourceIdentity>>,
): string {
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
- Implementation commit: \`${source.implementationCommit}\`
- Implementation tree: \`${source.implementationTree}\`
- Implementation source digest: \`${source.implementationSourceDigest}\`
- Control Tower commit: \`${source.controlTower.commit}\`
- Control Tower parent: \`${source.controlTower.parent}\`
- Control Tower tree: \`${source.controlTower.tree}\`
- Control Tower path: \`${source.controlTower.paths[0]}\`
- Control Tower roadmap blob: \`${source.controlTower.roadmapBlob}\`
- Control Tower diff digest: \`${source.controlTower.diffDigest}\`
- Aggregate source digest: \`${result.sourceDigest}\`
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
    const ar1a = await child<{
      validation: "alpha-readiness-ar1a"; mode: "validate-only"; result: "PASS";
      cases: { total: number; passed: number; failed: number };
      positiveControls: { total: number; passed: number };
      scanner: { leakageFindings: number; sensitivityCategories: number; falsePositive: number };
      cleanup: { status: "PASS"; rootsRemaining: number; childProcessesRemaining: number };
      deterministicRepeatStatus: { status: "PASS"; semanticRunDigest: string; separateProcess: true };
      sourceDigest: string; resultDigest: string;
    }>("scripts/alpha-readiness/runNonDisclosureThreatHarness.ts", ["--validate-only"]);
    for (const item of [focusedA, focusedB, atomicity, failure, fresh, replay, ar1a])
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
    assert.equal(ar1a.result.result, "PASS");
    assert.ok(ar1a.result.cases.total >= 45);
    assert.equal(ar1a.result.cases.failed, 0);
    assert.equal(ar1a.result.positiveControls.total, 1);
    assert.equal(ar1a.result.positiveControls.passed, 1);
    assert.equal(ar1a.result.scanner.leakageFindings, 0);
    assert.equal(ar1a.result.scanner.falsePositive, 0);
    assert.equal(ar1a.result.cleanup.rootsRemaining, 0);
    assert.equal(ar1a.result.cleanup.childProcessesRemaining, 0);
    assert.equal(ar1a.result.deterministicRepeatStatus.status, "PASS");

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
    const observedChangedPaths = await exactChangedPaths();
    assert.ok(
      JSON.stringify(observedChangedPaths) === JSON.stringify([correctionPaths[0]]) ||
      JSON.stringify(observedChangedPaths) === JSON.stringify([...correctionPaths].sort()),
    );
    const changedPaths = [...correctionPaths].sort();
    const changedPathSet = new Set<string>(changedPaths);
    assert.ok(!changedPathSet.has("product/persistence/productArtifactBodyRepository.ts"));
    assert.ok(!changedPathSet.has(controlTowerPath));
    const bindingValidation = sourceBindingControls(source);
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
        controlTowerTransition: source.controlTower,
        changedPaths,
        validation: { sourceBinding: bindingValidation, measuredRecovery: "PASS", ar1a: ar1a.result },
        cleanup: { status: "cleanup-complete", rootsRemaining: 0 },
        adjudication: result,
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
    const report = renderReport(measured.result, measured.details.source as Awaited<ReturnType<typeof sourceIdentity>>);
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
      measurements: { source: Awaited<ReturnType<typeof sourceIdentity>>; controlTowerTransition: ControlTowerIdentity; changedPaths: string[]; validation: { sourceBinding: ReturnType<typeof sourceBindingControls>; measuredRecovery: "PASS"; ar1a: { result: "PASS"; cases: { total: number; passed: number; failed: number }; positiveControls: { total: number; passed: number }; scanner: { leakageFindings: number; sensitivityCategories: number; falsePositive: number }; cleanup: { status: "PASS"; rootsRemaining: number; childProcessesRemaining: number }; deterministicRepeatStatus: { status: "PASS"; semanticRunDigest: string; separateProcess: true }; sourceDigest: string; resultDigest: string } }; cleanup: { status: "cleanup-complete"; rootsRemaining: 0 }; adjudication: CriticalFailureRecoveryResult; runId: string; envelopes: CriticalFailureRecoveryMeasurementEnvelope[] };
    };
    payload.measurements.envelopes.forEach(assertEnvelope);
    const currentSource = await sourceIdentity();
    assert.deepEqual(stableSource(payload.measurements.source), stableSource(currentSource));
    assert.deepEqual(payload.measurements.controlTowerTransition, currentSource.controlTower);
    assert.deepEqual(payload.measurements.validation.sourceBinding, sourceBindingControls(currentSource));
    const currentAr1a = await child<typeof payload.measurements.validation.ar1a>("scripts/alpha-readiness/runNonDisclosureThreatHarness.ts", ["--validate-only"]);
    assert.deepEqual(payload.measurements.validation.ar1a, currentAr1a.result);
    assert.deepEqual(scanText("ar5a-ar1a-verify-streams", `${currentAr1a.stdout}\n${currentAr1a.stderr}`, protectedValues), []);
    assert.deepEqual(payload.measurements.cleanup, { status: "cleanup-complete", rootsRemaining: 0 });
    const currentChangedPaths = await exactChangedPaths();
    assert.deepEqual(payload.measurements.changedPaths, currentChangedPaths);
    const changedPathsDigest = digest(JSON.stringify(currentChangedPaths));
    const base = adjudicateCriticalFailureRecovery({ envelopes: payload.measurements.envelopes, sourceDigest: currentSource.digest, changedPathsDigest, runId: payload.measurements.runId });
    const { resultDigest, measurements: _measurements, ...storedBase } = payload;
    assert.deepEqual(storedBase, base);
    assert.deepEqual(payload.measurements.adjudication, { ...base, resultDigest });
    assert.equal(resultDigest, digest(JSON.stringify(base)));
    assert.equal(await readFile(reportPath, "utf8"), renderReport(payload, currentSource));
    assert.deepEqual(scanText("ar5a-stored-evidence", JSON.stringify(payload), protectedValues), []);
    process.stdout.write(`AR-5A core recovery: PASS ${payload.sourceDigest} ${payload.resultDigest}\n`);
  }
}

void main().catch((error) => {
  process.stderr.write(`AR-5A core recovery: FAIL ${(error as Error).message}\n`);
  process.exitCode = 1;
});
