import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  applyHistoricalCheckpointFiveTransitions,
  assertHistoricalCheckpointFiveTransitionManifest,
  observeHistoricalCheckpointFiveTransitionWorlds,
  provisionHistoricalCheckpointFiveTransitionWorlds,
  type HistoricalCheckpointFiveTransitionManifest,
} from "./historicalCheckpointLifecycleActualOwnerAcceptanceCoordinator";

const manifestFile = (root: string) => path.join(root, "fresh-process-manifest.json");

async function processA(root: string, lineageRoot: string) {
  const manifest = await provisionHistoricalCheckpointFiveTransitionWorlds(root, lineageRoot);
  await writeFile(manifestFile(root), `${JSON.stringify(manifest)}\n`, { flag: "wx" });
  console.log(JSON.stringify({ process: "A", worlds: manifest.scenarios.length, links: manifest.scenarios.length * 4, manifestAuthorityFields: 0 }));
}

async function loadManifest(root: string) {
  const manifest = JSON.parse(await readFile(manifestFile(root), "utf8")) as HistoricalCheckpointFiveTransitionManifest;
  assertHistoricalCheckpointFiveTransitionManifest(manifest);
  return manifest;
}

async function processB(root: string) {
  const manifest = await loadManifest(root), evidence = await observeHistoricalCheckpointFiveTransitionWorlds(manifest, manifest.scenarios[0]!.evaluatedAt);
  assert.equal(evidence.length, 5); assert.ok(evidence.every((value) => value.detailEligible && value.listProtectedReads === 0 && value.detailProtectedReads > 0 && value.historyUnchanged));
  console.log(JSON.stringify({ process: "B", worlds: 5, eligibleReloads: 5, evidence }));
}

async function processC(root: string) {
  const manifest = await loadManifest(root), transitions = await applyHistoricalCheckpointFiveTransitions(manifest);
  assert.equal(transitions.length, 5);
  console.log(JSON.stringify({ process: "C", transitions, transitionCount: 5 }));
}

async function processD(root: string) {
  const manifest = await loadManifest(root), evidence = await observeHistoricalCheckpointFiveTransitionWorlds(manifest, "2026-08-11T17:00:00.000Z");
  assert.equal(evidence.length, 5); assert.ok(evidence.every((value) => !value.detailEligible && value.listProtectedReads === 0 && value.detailProtectedReads === 0 && value.historyUnchanged));
  console.log(JSON.stringify({ process: "D", independentDenials: 5, deniedProtectedReads: 0, evidence }));
}

async function worker() {
  const [mode, root, lineageRoot] = process.argv.slice(2);
  if (mode === "A") return processA(root!, lineageRoot!);
  if (mode === "B") return processB(root!);
  if (mode === "C") return processC(root!);
  if (mode === "D") return processD(root!);
  throw new Error("Unknown fresh-process mode.");
}

async function main() {
  if (process.argv[2]) return worker();
  const root = await mkdtemp(path.join(tmpdir(), "discovery-leadership-conversation-replay-l1-abcd-"));
  const lineageRoot = await mkdtemp(path.join(tmpdir(), "discovery-northstar-preparation-lineage-abcd-"));
  try {
    const script = path.join(process.cwd(), "scripts/product/validateHistoricalCheckpointLifecycleLinkageFreshProcess.ts");
    const evidence = [];
    for (const mode of ["A", "B", "C", "D"] as const) {
      const run = spawnSync(process.execPath, ["--conditions=react-server", "--import", "tsx", script, mode, root, lineageRoot], { cwd: process.cwd(), encoding: "utf8", env: process.env });
      assert.equal(run.status, 0, run.stderr); evidence.push(JSON.parse(run.stdout.trim().split("\n").at(-1)!));
    }
    console.log(JSON.stringify({ validation: "historical-checkpoint-lifecycle-fresh-process", result: "PASS", operatingSystemProcesses: 4, scenarioWorlds: 5, topology: evidence, processCTransitions: 5, processDDenials: 5, manifestAuthorityFields: 0, ownerObjectsCrossed: 0, positiveAuthorizationResultsCrossed: 0, protectedBodiesCrossed: 0 }));
  } finally { await rm(root, { recursive: true, force: true }); await rm(lineageRoot, { recursive: true, force: true }); }
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
