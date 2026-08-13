import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  assertHistoricalCheckpointSharedManifest,
  provisionHistoricalCheckpointSharedWorld,
  reconstructHistoricalCheckpointActualOwnerComposition,
  type HistoricalCheckpointSharedWorldManifest,
} from "./historicalCheckpointLifecycleActualOwnerAcceptanceCoordinator";
import { createProductWorkflowArtifactRepository, leadershipDigest, leadershipStableSerialize } from "../../product/workflow/leadershipConversation";
import {
  assertHistoricalCheckpointLifecycleLinkIntegrityV1,
  assertHistoricalCheckpointLifecycleReceiptIntegrityV1,
} from "../../product/workflow/leadershipConversation/historicalCheckpointLifecycleLinkContracts";

type WorkerResult = {
  worker: number;
  pid: number;
  disposition: "committed" | "replayed" | "stale";
  linkId: string | null;
  eventId: string | null;
  receiptId: string | null;
  finalRevision: string | null;
};

const manifestPath = (root: string) => path.join(root, "shared-manifest.json");
const coordinationRoot = (root: string) => path.join(root, "coordination");

async function waitFor(pathname: string): Promise<void> {
  for (;;) {
    try { await access(pathname); return; } catch { await new Promise((resolve) => setTimeout(resolve, 5)); }
  }
}

async function worker(root: string, index: number): Promise<void> {
  const manifest = JSON.parse(await readFile(manifestPath(root), "utf8")) as HistoricalCheckpointSharedWorldManifest;
  assertHistoricalCheckpointSharedManifest(manifest);
  const reads = { count: 0, safe: [] as string[] };
  const server = await reconstructHistoricalCheckpointActualOwnerComposition(manifest.root, manifest.lineageFixtureRoot, reads);
  await writeFile(path.join(coordinationRoot(root), `ready-${index}`), `${process.pid}\n`, { flag: "wx" });
  await waitFor(path.join(coordinationRoot(root), "start"));
  const distinct = process.argv[5] === "distinct";
  const endpoint = distinct
    ? index % 2 === 0
      ? { linkKind: "decision-review" as const, reviewId: manifest.reviewId }
      : { linkKind: "learning" as const, learningId: manifest.learningId }
    : manifest.endpoint;
  let safe: WorkerResult;
  try {
    const result = await server.historicalCheckpointLifecycle.publish({
    userId: manifest.userId,
    organizationId: manifest.organizationId,
    questionId: manifest.questionId,
    conversationId: manifest.conversationId,
    checkpointId: manifest.checkpointId,
    checkpointRevision: manifest.checkpointRevision,
    ...endpoint,
    idempotencyKey: distinct ? `l1-shared-distinct-${index}` : manifest.idempotencyKey,
    predecessorLinkId: distinct ? manifest.idempotencyKey : null,
    expectedWorkflowRevision: manifest.expectedWorkflowRevision,
    purpose: manifest.purpose,
    scopeDigest: manifest.scopeDigest,
    sensitivity: manifest.sensitivity,
    evaluatedAt: manifest.evaluatedAt,
  });
    safe = { worker: index, pid: process.pid, disposition: result.repository.disposition, linkId: result.link.linkId, eventId: result.link.workflowEventId, receiptId: result.receipt.receiptId, finalRevision: result.repository.currentWorkflowRepositoryRevision };
  } catch (error) {
    if (!distinct || !(error instanceof Error) || !/revision changed|successor fork denied/.test(error.message)) throw error;
    safe = { worker: index, pid: process.pid, disposition: "stale", linkId: null, eventId: null, receiptId: null, finalRevision: null };
  }
  await writeFile(path.join(coordinationRoot(root), `result-${index}.json`), `${JSON.stringify(safe)}\n`, { flag: "wx" });
}

function launch(script: string, root: string, index: number, mode: "same" | "distinct"): Promise<{ code: number | null; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["--conditions=react-server", "--import", "tsx", script, "worker", root, String(index), mode], {
      cwd: process.cwd(), env: process.env, stdio: ["ignore", "ignore", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += String(chunk); });
    child.on("close", (code) => resolve({ code, stderr }));
  });
}

async function inspect(root: string, manifest: HistoricalCheckpointSharedWorldManifest, results: WorkerResult[], expectedLinks: number) {
  const repository = createProductWorkflowArtifactRepository({ root: path.join(root, "workflow"), environment: "test" });
  const snapshot = await repository.read(manifest.organizationId);
  const links = snapshot.store.historicalCheckpointLifecycleLinks ?? [];
  const receipts = snapshot.store.historicalCheckpointLifecycleLinkReceipts ?? [];
  const events = snapshot.store.events.filter((value) => value.eventType === "historical-checkpoint-lifecycle-link-published");
  const idempotency = snapshot.store.idempotency.filter((value) => value.recordRef === links[0]?.linkId);
  assert.equal(links.length, expectedLinks); assert.equal(receipts.length, expectedLinks); assert.equal(events.length, expectedLinks); assert.equal(idempotency.length, 1);
  assertHistoricalCheckpointLifecycleLinkIntegrityV1(links[0]!);
  assertHistoricalCheckpointLifecycleReceiptIntegrityV1(receipts[0]!);
  assert.equal(new Set(results.map((value) => value.pid)).size, 8);
  if (expectedLinks === 1) {
    assert.ok(results.every((value) => value.linkId === links[0]!.linkId && value.eventId === events[0]!.eventId && value.receiptId === receipts[0]!.receiptId));
    assert.equal(results.filter((value) => value.disposition === "committed").length, 1);
    assert.equal(results.filter((value) => value.disposition === "replayed").length, 7);
  } else {
    assert.equal(results.filter((value) => value.disposition === "committed").length, 1);
    assert.equal(results.filter((value) => value.disposition === "stale").length, 7);
  }
  return { revision: snapshot.revision, linkId: links[0]!.linkId, eventId: events[0]!.eventId, receiptId: receipts[0]!.receiptId };
}

async function main(): Promise<void> {
  if (process.argv[2] === "worker") return worker(process.argv[3]!, Number(process.argv[4]));
  const root = await mkdtemp(path.join(tmpdir(), "discovery-leadership-conversation-replay-l1-shared-cas-"));
  const lineageFixtureRoot = await mkdtemp(path.join(tmpdir(), "discovery-northstar-preparation-lineage-shared-cas-"));
  try {
    await mkdir(coordinationRoot(root), { recursive: true });
    const manifest = await provisionHistoricalCheckpointSharedWorld(root, lineageFixtureRoot);
    await writeFile(manifestPath(root), `${JSON.stringify(manifest)}\n`, { flag: "wx" });
    const script = path.join(process.cwd(), "scripts/product/validateHistoricalCheckpointLifecycleConcurrentCollisions.ts");
    const workers = Array.from({ length: 8 }, (_, index) => launch(script, root, index, "same"));
    for (let index = 0; index < 8; index += 1) await waitFor(path.join(coordinationRoot(root), `ready-${index}`));
    await writeFile(path.join(coordinationRoot(root), "start"), "released\n", { flag: "wx" });
    const exits = await Promise.all(workers);
    for (const exit of exits) assert.equal(exit.code, 0, exit.stderr);
    const results = await Promise.all(Array.from({ length: 8 }, async (_, index) => JSON.parse(await readFile(path.join(coordinationRoot(root), `result-${index}.json`), "utf8")) as WorkerResult));
    const same = await inspect(root, manifest, results, 1);
    await Promise.all(Array.from({ length: 8 }, (_, index) => rm(path.join(coordinationRoot(root), `ready-${index}`))));
    await Promise.all(Array.from({ length: 8 }, (_, index) => rm(path.join(coordinationRoot(root), `result-${index}.json`))));
    await rm(path.join(coordinationRoot(root), "start"));
    const latest = await createProductWorkflowArtifactRepository({ root: path.join(root, "workflow"), environment: "test" }).read(manifest.organizationId);
    const distinctManifest = { ...manifest, expectedWorkflowRevision: latest.revision, idempotencyKey: same.linkId };
    const { manifestDigest: _old, ...distinctUnsigned } = distinctManifest;
    distinctManifest.manifestDigest = leadershipDigest(leadershipStableSerialize(distinctUnsigned));
    await writeFile(manifestPath(root), `${JSON.stringify(distinctManifest)}\n`);
    const distinctWorkers = Array.from({ length: 8 }, (_, index) => launch(script, root, index, "distinct"));
    for (let index = 0; index < 8; index += 1) await waitFor(path.join(coordinationRoot(root), `ready-${index}`));
    await writeFile(path.join(coordinationRoot(root), "start"), "released\n", { flag: "wx" });
    const distinctExits = await Promise.all(distinctWorkers);
    for (const exit of distinctExits) assert.equal(exit.code, 0, exit.stderr);
    const distinctResults = await Promise.all(Array.from({ length: 8 }, async (_, index) => JSON.parse(await readFile(path.join(coordinationRoot(root), `result-${index}.json`), "utf8")) as WorkerResult));
    const final = await inspect(root, distinctManifest, distinctResults, 2);
    const residue = (await readdir(path.join(root, "workflow", "organizations"))).filter((name) => name.includes(".lock") || name.includes(".tmp"));
    assert.deepEqual(residue, []);
    console.log(JSON.stringify({ validation: "historical-checkpoint-lifecycle-concurrent-collisions", result: "PASS", sameRequestWorkers: results, distinctSuccessorWorkers: distinctResults, sharedManifestDigest: manifest.manifestDigest, expectedRevision: manifest.expectedWorkflowRevision, same, final, commonReadyBarrier: true, perWorkerWorlds: 0, perWorkerWorkflowRoots: 0, sameRequestRelationshipCount: 1, distinctSuccessorWinnerCount: 1, forkedSuccessors: 0, partialPublications: 0, residue: 0 }));
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(lineageFixtureRoot, { recursive: true, force: true });
  }
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
