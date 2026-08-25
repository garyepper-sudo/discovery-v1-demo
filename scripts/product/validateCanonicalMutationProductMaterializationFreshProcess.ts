import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

const execute = promisify(execFile);
export type ProcessRole = "owner-replay" | "atomicity" | "failure-recovery";
export type SafeRecoveryHandoffV1 = {
  contractVersion: "1";
  role: ProcessRole;
  result: "PASS";
  outputDigestClass: "bounded-validator-result";
  measurementDigest: string;
};

const scriptByRole: Record<ProcessRole, string> = {
  "owner-replay": "validateLeadershipConversationReplay.ts",
  atomicity: "validateCanonicalMutationProductMaterializationAtomicity.ts",
  "failure-recovery":
    "validateCanonicalMutationProductMaterializationFailure.ts",
};

export async function runWorker(
  role: ProcessRole,
): Promise<SafeRecoveryHandoffV1> {
  const script = path.join(
    process.cwd(),
    "scripts/product",
    scriptByRole[role],
  );
  const { stdout, stderr } = await execute(
    process.execPath,
    ["--conditions=react-server", "--import", "tsx", script],
    {
      cwd: process.cwd(),
      timeout: 60_000,
      maxBuffer: 1024 * 1024,
      env: { ...process.env, NODE_ENV: "test" },
    },
  );
  assert.equal(stderr, "");
  assert.match(stdout, /PASS/);
  if (role === "owner-replay") {
    assert.match(stdout, /"freshProcesses":17/);
    assert.match(stdout, /"networkCalls":0/);
    assert.match(stdout, /"driveReads":0/);
    assert.match(stdout, /"productionAccess":0/);
  }
  const line = stdout.trim().split("\n").at(-1);
  assert.ok(line);
  let measurementDigest: string;
  if (role === "atomicity") {
    const measured = JSON.parse(line) as {
      status: string;
      boundaries: Record<string, boolean>;
      inventory: { duplicateFindings: number };
    };
    assert.equal(measured.status, "PASS");
    assert.ok(Object.values(measured.boundaries).every(Boolean));
    assert.equal(measured.inventory.duplicateFindings, 0);
    measurementDigest = (await import("node:crypto"))
      .createHash("sha256")
      .update(JSON.stringify(measured))
      .digest("hex");
  } else if (role === "failure-recovery") {
    const measured = JSON.parse(line) as {
      status: string;
      measurementDigest: string;
      inventory: { duplicateRuntimeWrites: number };
      stages: Record<string, string>;
    };
    assert.equal(measured.status, "PASS");
    assert.equal(measured.inventory.duplicateRuntimeWrites, 0);
    const { measurementDigest: claimed, ...unsigned } = measured;
    measurementDigest = (await import("node:crypto"))
      .createHash("sha256")
      .update(JSON.stringify(unsigned))
      .digest("hex");
    assert.equal(claimed, measurementDigest);
  } else
    measurementDigest = (await import("node:crypto"))
      .createHash("sha256")
      .update(line)
      .digest("hex");
  return {
    contractVersion: "1",
    role,
    result: "PASS",
    outputDigestClass: "bounded-validator-result",
    measurementDigest,
  };
}

async function main() {
  const first = await Promise.all(
    (["owner-replay", "atomicity", "failure-recovery"] as const).map(runWorker),
  );
  const second = await runWorker("atomicity"),
    failureRepeat = await runWorker("failure-recovery");
  assert.deepEqual(first[1], second);
  assert.deepEqual(first[2], failureRepeat);
  assert.equal(new Set(first.map((item) => item.role)).size, 3);
  const durableRoot = await mkdtemp(
    path.join(tmpdir(), "discovery-ar5-materialization-durable-"),
  );
  await mkdir(path.join(durableRoot, "lineage"), {
    recursive: true,
    mode: 0o700,
  });
  let durableBoundary;
  try {
    const script = path.join(
        process.cwd(),
        "scripts/product/validateCanonicalMutationProductMaterializationAtomicity.ts",
      ),
      stage = async (mode: string) => {
        const { stdout, stderr } = await execute(
          process.execPath,
          [
            "--conditions=react-server",
            "--import",
            "tsx",
            script,
            "--durable-stage",
            mode,
            durableRoot,
          ],
          { cwd: process.cwd(), env: { ...process.env, NODE_ENV: "test" } },
        );
        assert.equal(stderr, "");
        return JSON.parse(stdout) as Record<string, unknown>;
      },
      seed = await stage("seed"),
      runtimeOnly = await stage("runtime-only"),
      recovered = await stage("recover");
    assert.equal(seed.stage, "seeded");
    assert.equal(runtimeOnly.stage, "runtime-committed-workflow-absent");
    assert.equal(runtimeOnly.workflowMaterializations, 0);
    assert.equal(recovered.stage, "canonical-committed-product-materialized");
    assert.equal(recovered.workflowMaterializations, 1);
    assert.equal(recovered.workflowReceipts, 1);
    assert.equal(recovered.workflowPublications, 1);
    assert.equal(recovered.duplicateFindings, 0);
    durableBoundary = { runtimeOnly, recovered };
  } finally {
    await rm(durableRoot, { recursive: true, force: true });
  }
  process.stdout.write(
    `${JSON.stringify({ status: "PASS", workers: first.length + 2, durableWorkers: Object.keys(durableBoundary!).length + 1, totalWorkers: first.length + 2 + Object.keys(durableBoundary!).length + 1, roles: first.map((value) => value.role), deterministicAtomicity: JSON.stringify(first[1]) === JSON.stringify(second), deterministicFailureRecovery: JSON.stringify(first[2]) === JSON.stringify(failureRepeat), durableBoundary })}\n`,
  );
}

void main();
