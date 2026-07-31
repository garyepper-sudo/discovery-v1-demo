import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const runner = resolve(process.cwd(), "engine/benchmark/research/expected-explanation-discrimination-experiment-001/runExperiment.ts");
const run = () => execFileSync(process.execPath, ["--import", "tsx", runner], { encoding: "utf8" });
const first = run();
assert.equal(first, run(), "experiment output must be deterministic");
const report = JSON.parse(first) as { status: string; scenarios: number; strategyMetrics: Array<{ deterministic: boolean; truthfulness: number; falseEliminationRate: number }> };
assert.equal(report.status, "benchmark-only");
assert.equal(report.scenarios, 12);
assert.ok(report.strategyMetrics.every((metric) => metric.deterministic && metric.truthfulness === 1 && metric.falseEliminationRate === 0));
console.log("PASS expected explanation discrimination experiment");
