import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import type { OrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { CanonicalExecutiveHistoryAccessComposition, serializeExecutiveHistorySafeProjectionV1 } from "../../product/integration/canonicalExecutiveHistoryAccessComposition";
import { ACTOR, governance, learning, ORG, request, review, setup } from "./validateExecutiveHistoryCurrentAccess";

const execute = promisify(execFile);
const self = fileURLToPath(import.meta.url);

async function run(root: string, world: "present" | "absent"): Promise<{ serialized: string[]; loads: number; checks: number }> {
  const value = await setup(root);
  let loads = 0;
  const runtime = new Proxy(value.runtime, {
    get(target, key, receiver) {
      if (key === "read") return async (...args: Parameters<OrganizationRuntimeRepository["read"]>) => { loads += 1; return target.read(...args); };
      return Reflect.get(target, key, receiver);
    },
  }) as OrganizationRuntimeRepository;
  const composition = new CanonicalExecutiveHistoryAccessComposition({ access: value.access, runtime, authorizeAdministration: async () => true });
  const denied = { governance: governance("principal-denied", false), subjectId: "principal-denied" };
  const missing = world === "present" ? "" : "-absent";
  const projections = [
    await composition.projectReview(request("executive-review", `${review.id}${missing}`, ACTOR, denied) as never),
    await composition.projectOutcome(request("observed-outcome", `outcome-001${missing}`, ACTOR, denied) as never),
    await composition.projectLearning(request("executive-learning", `${learning.id}${missing}`, ACTOR, denied) as never),
  ];
  let checks = 0;
  projections.forEach((projection) => { assert.equal(projection.disposition, "inaccessible"); checks += 1; });
  assert.equal(loads, 0); checks += 1;
  const serialized = projections.map(serializeExecutiveHistorySafeProjectionV1);
  assert.equal(new Set(serialized).size, 1); checks += 1;
  for (const forbidden of [ORG, ACTOR, review.id, review.summary, learning.id, learning.summary, "policy", "binding", "authority", "governance", "count", "exists"]) {
    assert.equal(serialized[0]!.includes(forbidden), false); checks += 1;
  }
  const positive = [
    await composition.projectReview(request("executive-review", review.id) as never),
    await composition.projectOutcome(request("observed-outcome", "outcome-001") as never),
    await composition.projectLearning(request("executive-learning", learning.id) as never),
  ];
  positive.forEach((projection) => { assert.equal(projection.disposition, "available"); checks += 1; });
  assert.equal(loads, 3); checks += 1;
  const positiveText = positive.map(serializeExecutiveHistorySafeProjectionV1).join("\n");
  for (const protectedValue of [review.summary, review.observedOutcomes[0]!.observation, learning.summary, learning.organizationalKnowledge[0]!, "authority:history:v1", "assignment:principal-chief"]) {
    assert.equal(positiveText.includes(protectedValue), false); checks += 1;
  }
  assert.equal(positive.every((projection) => projection.disposition === "available" && projection.item?.contractVersion === "1"), true); checks += 1;
  return { serialized, loads, checks };
}

async function main(): Promise<void> {
  const [mode, root] = process.argv.slice(2);
  if (mode && root) {
    const result = await run(root, mode as "present" | "absent");
    process.stdout.write(JSON.stringify(result));
    return;
  }
  const presentRoot = await mkdtemp(path.join(tmpdir(), "discovery-executive-history-safe-present-"));
  const absentRoot = await mkdtemp(path.join(tmpdir(), "discovery-executive-history-safe-absent-"));
  try {
    const [present, absent] = await Promise.all([
      execute(process.execPath, ["--import", "tsx", self, "present", presentRoot], { env: process.env }),
      execute(process.execPath, ["--import", "tsx", self, "absent", absentRoot], { env: process.env }),
    ]);
    const left = JSON.parse(present.stdout.trim().split("\n").at(-1)!) as Awaited<ReturnType<typeof run>>;
    const right = JSON.parse(absent.stdout.trim().split("\n").at(-1)!) as Awaited<ReturnType<typeof run>>;
    assert.deepEqual(left.serialized, right.serialized);
    assert.equal(left.loads, 3);
    assert.equal(right.loads, 3);
    const checks = left.checks + right.checks + 3;
    assert.equal(checks >= 48, true);
    console.log(`RESULT PASS executive-history-safe-projection-isolation checks=${checks} processes=2 deniedProtectedLoads=0`);
  } finally {
    await rm(presentRoot, { recursive: true, force: true });
    await rm(absentRoot, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
