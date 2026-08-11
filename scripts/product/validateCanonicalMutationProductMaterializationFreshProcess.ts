import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);
export type ProcessRole = "owner-replay" | "atomicity" | "failure-recovery";
export type SafeRecoveryHandoffV1 = { contractVersion: "1"; role: ProcessRole; result: "PASS"; outputDigestClass: "bounded-validator-result" };

const scriptByRole: Record<ProcessRole, string> = {
  "owner-replay": "validateLeadershipConversationReplay.ts",
  atomicity: "validateCanonicalMutationProductMaterializationAtomicity.ts",
  "failure-recovery": "validateCanonicalMutationProductMaterializationFailure.ts",
};

export async function runWorker(role: ProcessRole): Promise<SafeRecoveryHandoffV1> {
  const script = path.join(process.cwd(), "scripts/product", scriptByRole[role]);
  const { stdout, stderr } = await execute(process.execPath, ["--conditions=react-server", "--import", "tsx", script], {
    cwd: process.cwd(), timeout: 60_000, maxBuffer: 1024 * 1024,
    env: { ...process.env, NODE_ENV: "test" },
  });
  assert.equal(stderr, "");
  assert.match(stdout, /PASS/);
  if (role === "owner-replay") {
    assert.match(stdout, /"freshProcesses":16/); assert.match(stdout, /"networkCalls":0/);
    assert.match(stdout, /"driveReads":0/); assert.match(stdout, /"productionAccess":0/);
  }
  return { contractVersion: "1", role, result: "PASS", outputDigestClass: "bounded-validator-result" };
}

async function main() {
  const first = await Promise.all((["owner-replay", "atomicity", "failure-recovery"] as const).map(runWorker));
  const second = await runWorker("atomicity");
  assert.deepEqual(first[1], second);
  assert.equal(new Set(first.map((item) => item.role)).size, 3);
  console.log("Canonical mutation Product materialization fresh-process validation PASS (10 checks, 4 isolated workers)");
}

void main();
