import assert from "node:assert/strict";
import { chmod, cp, mkdtemp, readFile, rm, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { sha256, stable } from "../model-mediated-compounding-v1/contracts";
import { authenticateV1, AUTHORIZED_V1_ROOT, V1_ANCHOR_DIGEST } from "./v1Anchor";
import { verifyTerminalArchive } from "./terminalStop";

const source = "/Users/garyepper/Development/Discovery-Research-Evidence/model-mediated-compounding-v1-1/18c7703cfc3f093e3338c07c3387200ac4f645866b6c1d8cf0059fb1156fbaec";
process.env.TMPDIR = "/private/tmp";

async function copy(temp: string, name: string) {
  const root = path.join(temp, name);
  await cp(source, root, { recursive: true });
  return root;
}

async function main() {
 const temp = await mkdtemp(path.join(os.tmpdir(), "mm-terminal-bindings-"));
 let checks = 0;
 try {
  const fresh = await copy(temp, "fresh");
  const child = spawnSync(
    process.execPath,
    ["--import", "tsx", path.join(import.meta.dirname, "terminalFreshProcess.ts"), fresh],
    { encoding: "utf8", timeout: 30_000 },
  );
  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(child.stdout.trim().split(/\n/).at(-1) ?? ""), {
    result: "PASS",
    providerCalls: 0,
    requestTwoClaims: 0,
  });
  checks++;

  const v1Copy = path.join(temp, "v1-copy");
  await cp(AUTHORIZED_V1_ROOT, v1Copy, { recursive: true });
  const v1State = path.join(v1Copy, "durable-state.json");
  const v1 = JSON.parse(await readFile(v1State, "utf8"));
  v1.phase = "forged-terminal";
  await writeFile(v1State, JSON.stringify(v1, null, 2) + "\n");
  const forgedAuth = await authenticateV1(v1Copy);
  assert.notEqual(forgedAuth.anchorDigest, V1_ANCHOR_DIGEST);
  checks++;

  const stageRoot = await copy(temp, "coordinated-stage-rehash");
  const snapshotPath = path.join(stageRoot, "stage-1-execution-ledger.json");
  const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
  snapshot.attempts[0].reason = "coordinated-forgery";
  const snapshotBytes = Buffer.from(JSON.stringify(snapshot, null, 2) + "\n");
  await chmod(snapshotPath, 0o600);
  await writeFile(snapshotPath, snapshotBytes);
  await chmod(snapshotPath, 0o400);
  const stagePath = path.join(stageRoot, "stage-1-manifest.json");
  const stage = JSON.parse(await readFile(stagePath, "utf8"));
  stage.ledgerBytes = snapshotBytes.length;
  stage.ledgerDigest = sha256(snapshotBytes);
  stage.rows[0].reason = "coordinated-forgery";
  const { digest: _stageDigest, ...stageBody } = stage;
  stage.digest = sha256(stable(stageBody));
  await chmod(stagePath, 0o600);
  await writeFile(stagePath, JSON.stringify(stage, null, 2) + "\n");
  await chmod(stagePath, 0o400);
  await assert.rejects(() => verifyTerminalArchive(stageRoot), /stage|manifest|bundle/);
  checks++;

  const rehashRoot = await copy(temp, "coordinated-terminal-rehash");
  const stopPath = path.join(rehashRoot, "terminal-stop.json");
  const stop = JSON.parse(await readFile(stopPath, "utf8"));
  stop.candidateDigest = "0".repeat(64);
  const { semanticDigest: _stopDigest, ...stopBody } = stop;
  stop.semanticDigest = sha256(stable(stopBody));
  await writeFile(stopPath, JSON.stringify(stop, null, 2) + "\n");
  await assert.rejects(() => verifyTerminalArchive(rehashRoot));
  checks++;

  const modeRoot = await copy(temp, "directory-mode");
  await chmod(path.join(modeRoot, "attempts"), 0o755);
  await assert.rejects(() => verifyTerminalArchive(modeRoot), /directory mode/);
  checks++;

  const bundleRoot = await copy(temp, "missing-bundle");
  await unlink(path.join(bundleRoot, "terminal-full-bundle-receipt.json"));
  await assert.rejects(() => verifyTerminalArchive(bundleRoot));
  checks++;

  const gateRoot = await copy(temp, "manual-gate");
  const ledgerPath = path.join(gateRoot, "execution-ledger.json");
  const ledger = JSON.parse(await readFile(ledgerPath, "utf8"));
  ledger.gates.push({ stage: 1, classification: "forged" });
  await writeFile(ledgerPath, JSON.stringify(ledger, null, 2) + "\n");
  await assert.rejects(() => verifyTerminalArchive(gateRoot));
  checks++;

  console.log(JSON.stringify({
    validation: "model-mediated-v1.1-terminal-full-bindings",
    result: "PASS",
    checks,
    freshProcesses: 1,
    providerCalls: 0,
    realProviderCalls: 0,
  }));
} finally {
  await rm(temp, { recursive: true, force: true });
 }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
