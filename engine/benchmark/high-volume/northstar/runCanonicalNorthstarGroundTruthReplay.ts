import fs from "node:fs";
import path from "node:path";

import {
  loadOrganizationRuntimeState,
} from "../../../v3/runtime/organizationStateStore";

import type {
  OrganizationRuntime,
} from "../../../v3/runtime/organizationRuntime";

import {
  NORTHSTAR_ORGANIZATION_ID,
} from "./northstarCompanyFixture";

import {
  runNorthstarIngestionExperiment001,
} from "./runNorthstarIngestionExperiment001";

const CANONICAL_REPLAY_TIME =
  Date.parse(
    "2026-07-22T20:00:00.000Z",
  );

const runtimePath =
  path.join(
    process.cwd(),
    ".discovery-runtime",
    "organizations",
    `${NORTHSTAR_ORGANIZATION_ID}.json`,
  );

function withDeterministicEnvironment<T>(
  operation: () => T,
): T {
  const OriginalDate =
    Date;

  const originalRandom =
    Math.random;

  let clockTick =
    0;

  let randomState =
    0x1032026;

  class DeterministicDate extends OriginalDate {
    constructor(...args: ConstructorParameters<DateConstructor>) {
      if (
        args.length >
        0
      ) {
        super(...args);
      } else {
        super(
          CANONICAL_REPLAY_TIME +
            clockTick++,
        );
      }
    }

    static now(): number {
      return (
        CANONICAL_REPLAY_TIME +
        clockTick++
      );
    }
  }

  Math.random = () => {
    randomState =
      (
        randomState *
          1664525 +
        1013904223
      ) >>>
      0;

    return (
      randomState /
      0x100000000
    );
  };

  globalThis.Date =
    DeterministicDate as
      DateConstructor;

  try {
    return operation();
  } finally {
    globalThis.Date =
      OriginalDate;

    Math.random =
      originalRandom;
  }
}

function withoutReplayLogging<T>(
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

export function runCanonicalNorthstarGroundTruthReplay():
  OrganizationRuntime {
  const runtimeExisted =
    fs.existsSync(
      runtimePath,
    );

  const previousRuntime =
    runtimeExisted
      ? fs.readFileSync(
          runtimePath,
        )
      : null;

  try {
    withDeterministicEnvironment(
      () =>
        withoutReplayLogging(
          () =>
            runNorthstarIngestionExperiment001(),
        ),
    );

    return JSON.parse(
      JSON.stringify(
        loadOrganizationRuntimeState(
          NORTHSTAR_ORGANIZATION_ID,
        ),
      ),
    ) as OrganizationRuntime;
  } finally {
    if (
      previousRuntime
    ) {
      fs.mkdirSync(
        path.dirname(
          runtimePath,
        ),
        {
          recursive: true,
        },
      );

      fs.writeFileSync(
        runtimePath,
        previousRuntime,
      );
    } else if (
      fs.existsSync(
        runtimePath,
      )
    ) {
      fs.unlinkSync(
        runtimePath,
      );
    }
  }
}
