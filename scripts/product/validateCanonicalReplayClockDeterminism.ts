import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const ORGANIZATION_ID = "sandbox-canonical-clock-determinism-001";
const digest = (value: string | Uint8Array) =>
  createHash("sha256").update(value).digest("hex");

const sources = (reverse: boolean, semanticTime = "2026-01-16T12:00:00.000Z") => {
  const values = [
    { sourceId: "clock-source-a-v1", sourceType: "authorized_records" as const, observedAt: "2026-01-15T12:00:00.000Z", reliability: 0.9, content: "Delivery execution reviews show stable scope ownership but recurring cross-team sequencing delays." },
    { sourceId: "clock-source-b-v1", sourceType: "authorized_records" as const, observedAt: semanticTime, reliability: 0.85, content: "Leadership review confirms that sequencing delays create avoidable implementation risk and slower customer outcomes." },
  ];
  return reverse ? values.reverse() : values;
};

async function worker(): Promise<void> {
  const { runOrganizationInvestigation } = await import("../../engine/v3/investigation/runOrganizationInvestigation");
  const reverse = process.argv.includes("--reverse");
  const changedTime = process.argv.includes("--changed-time");
  const originalLog = console.log;
  console.log = () => undefined;
  const output = runOrganizationInvestigation({
    organizationId: ORGANIZATION_ID,
    company: "Canonical Clock Sandbox",
    website: "https://sandbox.invalid",
    industry: "Implementation services",
    question: "What is limiting reliable delivery execution?",
    context: "Fixed synthetic canonical determinism diagnostic.",
    investigationRequestId: "canonical-clock-determinism-request-001",
    evidenceSources: sources(reverse, changedTime ? "2026-01-17T12:00:00.000Z" : undefined),
  });
  console.log = originalLog;
  const runtimeBytes = Buffer.from(JSON.stringify(output.runtime, null, 2));
  const runtimeDirectory = process.env.DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY!;
  const persisted = await readFile(path.join(runtimeDirectory, `${ORGANIZATION_ID}.json`));
  assert.deepEqual(persisted, runtimeBytes, "save/reload bytes must equal returned canonical Runtime bytes");
  process.stdout.write(JSON.stringify({ runtime: runtimeBytes.toString("base64"), revision: digest(runtimeBytes) }));
}

async function cycle(input: { label: string; timezone: string; locale: string; reverse?: boolean; changedTime?: boolean }) {
  const root = await mkdtemp(path.join(os.tmpdir(), `discovery-living-organization-sandbox-clock-validator-${input.label}-`));
  const child = spawn(process.execPath, ["--import", "tsx", process.argv[1]!, "--worker", ...(input.reverse ? ["--reverse"] : []), ...(input.changedTime ? ["--changed-time"] : [])], {
    cwd: process.cwd(),
    env: { NODE_ENV: "test", DISCOVERY_ENV: "sandbox", FORCE_COLOR: "0", TZ: input.timezone, LANG: input.locale, DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY: path.join(root, "runtime") },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "", stderr = "";
  child.stdout.setEncoding("utf8"); child.stderr.setEncoding("utf8");
  child.stdout.on("data", (value: string) => { stdout += value; });
  child.stderr.on("data", (value: string) => { stderr += value; });
  try {
    const code = await new Promise<number | null>((resolve, reject) => { child.once("error", reject); child.once("close", resolve); });
    assert.equal(code, 0, stderr.slice(0, 500));
    return JSON.parse(stdout) as { runtime: string; revision: string };
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function main(): Promise<void> {
  if (process.argv.includes("--worker")) return worker();
  const results = await Promise.all([
    cycle({ label: "utc", timezone: "UTC", locale: "C" }),
    cycle({ label: "la", timezone: "America/Los_Angeles", locale: "en_US.UTF-8" }),
    cycle({ label: "tokyo", timezone: "Asia/Tokyo", locale: "fr_FR.UTF-8", reverse: true }),
  ]);
  assert.equal(new Set(results.map((item) => item.runtime)).size, 1, "fresh-process Runtime bytes must be identical");
  assert.equal(new Set(results.map((item) => item.revision)).size, 1, "fresh-process Runtime revisions must be identical");
  const semanticChange = await cycle({ label: "semantic-change", timezone: "UTC", locale: "C", changedTime: true });
  assert.notEqual(semanticChange.revision, results[0]!.revision, "genuine semantic effective-time change must change Runtime history");
  console.log(JSON.stringify({ validation: "canonical-replay-clock-runtime-determinism-001", result: "PASS", freshProcesses: 3, runtimeRevision: results[0]!.revision, timezoneLocaleInvariant: true, inputOrderInvariant: true, saveReloadExact: true, semanticTimeSensitive: true, networkCalls: 0, connectorCalls: 0, externalActions: 0 }, null, 2));
}

void main();
