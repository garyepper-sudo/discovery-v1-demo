import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  runCanonicalNorthstarGroundTruthReplay,
} from "./runCanonicalNorthstarGroundTruthReplay";

import {
  scoreNorthstarGroundTruth,
} from "./scoreNorthstarGroundTruth";

import {
  NORTHSTAR_ORGANIZATION_ID,
} from "./northstarCompanyFixture";

const runtimeDirectory =
  path.join(
    process.cwd(),
    ".discovery-runtime",
    "organizations",
  );

const northstarRuntimePath =
  path.join(
    runtimeDirectory,
    `${NORTHSTAR_ORGANIZATION_ID}.json`,
  );

function snapshotRuntimeDirectory():
  Map<string, string> {
  if (
    !fs.existsSync(
      runtimeDirectory,
    )
  ) {
    return new Map();
  }

  return new Map(
    fs
      .readdirSync(
        runtimeDirectory,
      )
      .sort()
      .map(
        (name) => [
          name,
          fs
            .readFileSync(
              path.join(
                runtimeDirectory,
                name,
              ),
            )
            .toString(
              "base64",
            ),
        ],
      ),
  );
}

function withoutLogging<T>(
  operation: () => T,
): T {
  const originalLog =
    console.log;

  console.log = () =>
    undefined;

  try {
    return operation();
  } finally {
    console.log =
      originalLog;
  }
}

const initialRuntimeSnapshot =
  snapshotRuntimeDirectory();

const firstScore =
  withoutLogging(
    scoreNorthstarGroundTruth,
  );

assert.deepEqual(
  snapshotRuntimeDirectory(),
  initialRuntimeSnapshot,
  "Ground Truth must restore every persisted Runtime after scoring.",
);

const secondScore =
  withoutLogging(
    scoreNorthstarGroundTruth,
  );

assert.deepEqual(
  secondScore,
  firstScore,
  "Repeated Ground Truth executions must return identical score details.",
);

const firstRuntime =
  runCanonicalNorthstarGroundTruthReplay();

const secondRuntime =
  runCanonicalNorthstarGroundTruthReplay();

assert.deepEqual(
  secondRuntime,
  firstRuntime,
  "Repeated canonical replays must produce identical Runtime content.",
);

const persistedNorthstarRuntime =
  fs.existsSync(
    northstarRuntimePath,
  )
    ? fs.readFileSync(
        northstarRuntimePath,
      )
    : null;

try {
  if (
    persistedNorthstarRuntime
  ) {
    fs.unlinkSync(
      northstarRuntimePath,
    );
  }

  const withoutPersistedRuntime =
    withoutLogging(
      scoreNorthstarGroundTruth,
    );

  assert.deepEqual(
    withoutPersistedRuntime,
    firstScore,
    "A missing persisted Northstar Runtime must not change Ground Truth output.",
  );

  assert.equal(
    fs.existsSync(
      northstarRuntimePath,
    ),
    false,
    "Ground Truth must not leave a Northstar Runtime behind when none existed.",
  );
} finally {
  if (
    persistedNorthstarRuntime
  ) {
    fs.writeFileSync(
      northstarRuntimePath,
      persistedNorthstarRuntime,
    );
  }
}

assert.deepEqual(
  snapshotRuntimeDirectory(),
  initialRuntimeSnapshot,
  "The determinism regression must leave all persisted Runtime files unchanged.",
);

console.log("Focused Ground Truth determinism regression — PASS");
console.log(`Final score: ${firstScore.finalScore} / 100`);
console.log(
  `Deductions: ${firstScore.dimensions
    .filter((dimension) => dimension.score < dimension.weight)
    .map((dimension) => `${dimension.label} -${dimension.weight - dimension.score}`)
    .join(" | ")}`,
);
