import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { atlasDecisionCase } from "./atlasDecisionPilot";
import { loadIsolatedAtlasDecisionRuntime } from "./loadIsolatedAtlasDecisionRuntime";
import { runExecutiveDecisionLab } from "./runExecutiveDecisionLab";

const fixedTimestamp = "2026-07-22T12:00:00.000Z";
const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(moduleDirectory, "../../..");
const regressionPath = fileURLToPath(import.meta.url);
const validatorPath = path.join(
  moduleDirectory,
  "validateExecutiveDecisionLab.ts",
);
const atlasRunnerPath = path.join(
  repositoryRoot,
  "engine",
  "benchmark",
  "runAtlas.ts",
);
const tsxExecutable = path.join(
  repositoryRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tsx.cmd" : "tsx",
);
const canonicalAtlasRuntimePath = path.join(
  repositoryRoot,
  ".discovery-runtime",
  "organizations",
  "atlas-manufacturing-simulation.json",
);
const relativeAtlasRuntimePath = path.join(
  ".discovery-runtime",
  "organizations",
  "atlas-manufacturing-simulation.json",
);

function normalizeGeneratedTimestamps(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeGeneratedTimestamps);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        /(?:At|Timestamp|Date)$/i.test(key)
          ? "<generated-time>"
          : normalizeGeneratedTimestamps(item),
      ]),
    );
  }

  return value;
}

function substantiveSnapshot() {
  const runtime = loadIsolatedAtlasDecisionRuntime();
  const baseline = runExecutiveDecisionLab({
    decisionCase: atlasDecisionCase,
    runtime,
    fixedTimestamp,
  });
  const scenarios = atlasDecisionCase.stressScenarios.map((scenario) =>
    runExecutiveDecisionLab({
      decisionCase: atlasDecisionCase,
      runtime,
      fixedTimestamp,
      scenario,
    }),
  );
  const normalizedRuntime = JSON.stringify(normalizeGeneratedTimestamps(runtime));

  return {
    runtimeHash: createHash("sha256").update(normalizedRuntime).digest("hex"),
    baselineSignature: baseline.deterministicSignature,
    selectedInterventionId: baseline.recommendation.interventionId,
    recommendation: baseline.recommendation,
    ranking: baseline.options.map(({ id, rank }) => ({ id, rank })),
    scenarioSignatures: scenarios.map((scenario) => scenario.deterministicSignature),
  };
}

function run(
  scriptPath: string,
  workingDirectory: string,
  extraEnvironment: Record<string, string> = {},
) {
  return spawnSync(tsxExecutable, [scriptPath], {
    cwd: workingDirectory,
    encoding: "utf8",
    env: {
      ...process.env,
      ...extraEnvironment,
    },
  });
}

if (process.env.DISCOVERY_DECISION_CAPTURE === "1") {
  process.stdout.write(JSON.stringify(substantiveSnapshot()));
} else {
  const canonicalBytes = fs.readFileSync(canonicalAtlasRuntimePath);
  const isolatedWorkingDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "discovery-decision-order-"),
  );
  const isolatedRuntimePath = path.join(
    isolatedWorkingDirectory,
    relativeAtlasRuntimePath,
  );

  try {
    fs.mkdirSync(path.dirname(isolatedRuntimePath), {
      recursive: true,
    });
    fs.writeFileSync(isolatedRuntimePath, canonicalBytes);

    const decisionAlone = run(validatorPath, isolatedWorkingDirectory);
    assert.equal(decisionAlone.status, 0, decisionAlone.stderr);
    assert.match(decisionAlone.stdout, /Passed: 39\s+Failed: 0/);

    const beforeAtlas = run(regressionPath, isolatedWorkingDirectory, {
      DISCOVERY_DECISION_CAPTURE: "1",
    });
    assert.equal(beforeAtlas.status, 0, beforeAtlas.stderr);

    const atlasAfterDecision = run(atlasRunnerPath, isolatedWorkingDirectory);
    assert.equal(atlasAfterDecision.status, 0, atlasAfterDecision.stderr);
    assert.notDeepEqual(
      fs.readFileSync(isolatedRuntimePath),
      canonicalBytes,
      "The regression fixture must demonstrate Atlas's shared-state mutation.",
    );

    const decisionAfterAtlas = run(validatorPath, isolatedWorkingDirectory);
    assert.equal(decisionAfterAtlas.status, 0, decisionAfterAtlas.stderr);
    assert.match(decisionAfterAtlas.stdout, /Passed: 39\s+Failed: 0/);

    const afterAtlas = run(regressionPath, isolatedWorkingDirectory, {
      DISCOVERY_DECISION_CAPTURE: "1",
    });
    assert.equal(afterAtlas.status, 0, afterAtlas.stderr);
    assert.deepEqual(
      JSON.parse(afterAtlas.stdout),
      JSON.parse(beforeAtlas.stdout),
      "Atlas execution order changed substantive Executive Decision Lab output.",
    );

    const repeatedFirst = run(validatorPath, isolatedWorkingDirectory);
    const repeatedSecond = run(validatorPath, isolatedWorkingDirectory);
    assert.equal(repeatedFirst.status, 0, repeatedFirst.stderr);
    assert.equal(repeatedSecond.status, 0, repeatedSecond.stderr);
    assert.equal(repeatedFirst.stdout, repeatedSecond.stdout);

    assert.deepEqual(
      fs.readFileSync(canonicalAtlasRuntimePath),
      canonicalBytes,
      "The canonical Atlas Runtime changed during the isolation regression.",
    );

    console.log("EXECUTIVE DECISION ORDER-INDEPENDENCE REGRESSION");
    console.log("PASS  Decision Lab alone: 39/39");
    console.log("PASS  Decision Lab before Atlas: substantive snapshot captured");
    console.log("PASS  Atlas mutation reproduced in the isolated workspace");
    console.log("PASS  Decision Lab after Atlas: 39/39");
    console.log("PASS  Ranking, recommendation, confidence, scenarios, and Runtime are identical");
    console.log("PASS  Consecutive Decision Lab runs are identical");
    console.log("PASS  Canonical Atlas Runtime bytes are unchanged");
  } finally {
    fs.rmSync(isolatedWorkingDirectory, {
      recursive: true,
      force: true,
    });
  }
}
