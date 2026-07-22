import {
  readFileSync,
} from "node:fs";

import {
  basename,
  join,
} from "node:path";

import {
  captureRuntimeSnapshot,
  type RuntimeSnapshot,
} from "../captureRuntimeSnapshot";

import {
  runOrganizationInvestigation,
} from "../../../v3/investigation";

import {
  resetOrganizationRuntimeState,
} from "../../../v3/runtime/organizationStateStore";

import {
  NORTHSTAR_ORGANIZATION_ID,
  northstarCompanyFixture,
} from "./northstarCompanyFixture";

import {
  northstarEvidenceManifest,
  type NorthstarEvidenceArtifact,
} from "./northstarEvidenceManifest";

const EVIDENCE_DIRECTORY =
  join(
    process.cwd(),
    "engine",
    "benchmark",
    "high-volume",
    "northstar",
    "evidence",
  );

type NorthstarIngestionMeasurement = {
  artifactId: string;
  filename: string;
  sequence: number;
  batch: string;
  elapsedMilliseconds: number;
  snapshot: RuntimeSnapshot;
};

type NorthstarBatchCheckpoint = {
  batch: string;
  artifactsProcessed: number;
  firstSequence: number;
  lastSequence: number;
  snapshot: RuntimeSnapshot;

  deltaFromPrevious: {
    observations: number;
    beliefs: number;
    theories: number;
    concepts: number;
    conditions: number;
    mechanisms: number;
    predictions: number;
    learningEvents: number;
    confidence: number | null;
    maturity: number | null;
  };
};

type NorthstarIngestionSummary = {
  expectedArtifacts: number;
  processedArtifacts: number;
  snapshotsCaptured: number;
  finalInvestigationCount: number;
  elapsedMilliseconds: number;
  measurements: NorthstarIngestionMeasurement[];
  batchCheckpoints: NorthstarBatchCheckpoint[];
};

function formatDuration(
  milliseconds: number,
): string {
  if (
    milliseconds <
    1_000
  ) {
    return `${milliseconds} ms`;
  }

  return `${(
    milliseconds /
    1_000
  ).toFixed(
    2,
  )} s`;
}

function readEvidenceArtifact(
  artifact:
    NorthstarEvidenceArtifact,
): string {
  const filepath =
    join(
      EVIDENCE_DIRECTORY,
      artifact.filename,
    );

  return readFileSync(
    filepath,
    "utf8",
  );
}

function buildInvestigationContext(
  artifact:
    NorthstarEvidenceArtifact,

  document:
    string,
): string {
  return [
    `Evidence Artifact ID: ${artifact.id}`,
    `Evidence Sequence: ${artifact.sequence}`,
    `Evidence Batch: ${artifact.batch}`,
    `Evidence Title: ${artifact.title}`,
    `Evidence Owner: ${artifact.owner}`,
    `Evidence Function: ${artifact.function}`,
    `Evidence Effective Date: ${artifact.effectiveDate}`,
    `Evidence Reliability: ${artifact.reliability}`,
    `Evidence Bias: ${artifact.bias}`,
    `Evidence Stale: ${artifact.stale ? "yes" : "no"}`,
    "",
    "Document:",
    document,
  ].join(
    "\n",
  );
}

function printHeader(): void {
  console.log("");
  console.log("==========================================");
  console.log("NORTHSTAR INGESTION EXPERIMENT 001");
  console.log("==========================================");
  console.log("");
}

function printProgress(
  params: {
    artifact:
      NorthstarEvidenceArtifact;

    total:
      number;

    measurement:
      NorthstarIngestionMeasurement;
  },
): void {
  const {
    artifact,
    total,
    measurement,
  } = params;

  console.log("------------------------------------------");

  console.log(
    `[${artifact.sequence}/${total}] ${artifact.filename}`,
  );

  console.log(
    `Batch: ${artifact.batch}`,
  );

  console.log(
    `Investigation count: ${measurement.snapshot.investigationCount}`,
  );

  console.log(
    `Observations: ${measurement.snapshot.counts.observations}`,
  );

  console.log(
    `Beliefs: ${measurement.snapshot.counts.beliefs}`,
  );

  console.log(
    `Theories: ${measurement.snapshot.counts.theories}`,
  );

  console.log(
    `Conditions: ${measurement.snapshot.counts.conditions}`,
  );

  console.log(
    `Mechanisms: ${measurement.snapshot.counts.mechanisms}`,
  );

  console.log(
    `Elapsed: ${formatDuration(
      measurement.elapsedMilliseconds,
    )}`,
  );

  console.log("");
}


function numericDelta(
  current:
    number | null,

  previous:
    number | null,
): number | null {
  if (
    current ===
      null ||
    previous ===
      null
  ) {
    return null;
  }

  return current -
    previous;
}

function buildBatchCheckpoint(
  params: {
    batch:
      string;

    batchMeasurements:
      NorthstarIngestionMeasurement[];

    previousCheckpoint?:
      NorthstarBatchCheckpoint;
  },
): NorthstarBatchCheckpoint {
  const {
    batch,
    batchMeasurements,
    previousCheckpoint,
  } = params;

  const first =
    batchMeasurements[0];

  const last =
    batchMeasurements.at(
      -1,
    );

  if (
    !first ||
    !last
  ) {
    throw new Error(
      `Cannot build checkpoint for empty batch "${batch}".`,
    );
  }

  const previousSnapshot =
    previousCheckpoint
      ?.snapshot;

  return {
    batch,

    artifactsProcessed:
      batchMeasurements.length,

    firstSequence:
      first.sequence,

    lastSequence:
      last.sequence,

    snapshot:
      last.snapshot,

    deltaFromPrevious: {
      observations:
        last.snapshot.counts.observations -
        (
          previousSnapshot
            ?.counts
            .observations ??
          0
        ),

      beliefs:
        last.snapshot.counts.beliefs -
        (
          previousSnapshot
            ?.counts
            .beliefs ??
          0
        ),

      theories:
        last.snapshot.counts.theories -
        (
          previousSnapshot
            ?.counts
            .theories ??
          0
        ),

      concepts:
        last.snapshot.counts.concepts -
        (
          previousSnapshot
            ?.counts
            .concepts ??
          0
        ),

      conditions:
        last.snapshot.counts.conditions -
        (
          previousSnapshot
            ?.counts
            .conditions ??
          0
        ),

      mechanisms:
        last.snapshot.counts.mechanisms -
        (
          previousSnapshot
            ?.counts
            .mechanisms ??
          0
        ),

      predictions:
        last.snapshot.counts.predictions -
        (
          previousSnapshot
            ?.counts
            .predictions ??
          0
        ),

      learningEvents:
        last.snapshot.counts.learningEvents -
        (
          previousSnapshot
            ?.counts
            .learningEvents ??
          0
        ),

      confidence:
        previousSnapshot
          ? numericDelta(
              last.snapshot.executive.confidence,
              previousSnapshot.executive.confidence,
            )
          : last.snapshot.executive.confidence,

      maturity:
        previousSnapshot
          ? numericDelta(
              last.snapshot.maturity.score,
              previousSnapshot.maturity.score,
            )
          : last.snapshot.maturity.score,
    },
  };
}

function formatOptionalDelta(
  value:
    number | null,
): string {
  if (
    value ===
    null
  ) {
    return "unavailable";
  }

  const prefix =
    value >
      0
      ? "+"
      : "";

  return `${prefix}${value.toFixed(
    3,
  )}`;
}

function printBatchCheckpoint(
  checkpoint:
    NorthstarBatchCheckpoint,
): void {
  const {
    snapshot,
    deltaFromPrevious,
  } = checkpoint;

  console.log("");
  console.log("==========================================");
  console.log(`BATCH COMPLETE: ${checkpoint.batch}`);
  console.log("==========================================");
  console.log("");

  console.log(
    `Artifacts: ${checkpoint.artifactsProcessed}`,
  );

  console.log(
    `Sequence: ${checkpoint.firstSequence}-${checkpoint.lastSequence}`,
  );

  console.log(
    `Investigation count: ${snapshot.investigationCount}`,
  );

  console.log("");
  console.log("Current cognition");
  console.log("------------------------------------------");

  console.log(
    `Observations: ${snapshot.counts.observations} (${deltaFromPrevious.observations >= 0 ? "+" : ""}${deltaFromPrevious.observations})`,
  );

  console.log(
    `Beliefs: ${snapshot.counts.beliefs} (${deltaFromPrevious.beliefs >= 0 ? "+" : ""}${deltaFromPrevious.beliefs})`,
  );

  console.log(
    `Theories: ${snapshot.counts.theories} (${deltaFromPrevious.theories >= 0 ? "+" : ""}${deltaFromPrevious.theories})`,
  );

  console.log(
    `Concepts: ${snapshot.counts.concepts} (${deltaFromPrevious.concepts >= 0 ? "+" : ""}${deltaFromPrevious.concepts})`,
  );

  console.log(
    `Conditions: ${snapshot.counts.conditions} (${deltaFromPrevious.conditions >= 0 ? "+" : ""}${deltaFromPrevious.conditions})`,
  );

  console.log(
    `Mechanisms: ${snapshot.counts.mechanisms} (${deltaFromPrevious.mechanisms >= 0 ? "+" : ""}${deltaFromPrevious.mechanisms})`,
  );

  console.log(
    `Predictions: ${snapshot.counts.predictions} (${deltaFromPrevious.predictions >= 0 ? "+" : ""}${deltaFromPrevious.predictions})`,
  );

  console.log(
    `Learning events: ${snapshot.counts.learningEvents} (${deltaFromPrevious.learningEvents >= 0 ? "+" : ""}${deltaFromPrevious.learningEvents})`,
  );

  console.log("");
  console.log("Executive state");
  console.log("------------------------------------------");

  console.log(
    `Confidence: ${snapshot.executive.confidence ?? "unavailable"} (delta ${formatOptionalDelta(deltaFromPrevious.confidence)})`,
  );

  console.log(
    `Memory maturity: ${snapshot.maturity.score ?? "unavailable"} (delta ${formatOptionalDelta(deltaFromPrevious.maturity)})`,
  );

  console.log(
    `Assessment: ${snapshot.executive.assessmentSummary ?? "unavailable"}`,
  );

  console.log(
    `Dominant theory: ${snapshot.executive.dominantTheory ?? "unavailable"}`,
  );

  console.log(
    `Recommendation: ${snapshot.executive.recommendation ?? "unavailable"}`,
  );

  console.log(
    `Organizational state: ${snapshot.executive.organizationalState ?? "unavailable"}`,
  );

  console.log("");
  console.log("Top conditions");
  console.log("------------------------------------------");

  for (
    const condition of
    snapshot.executive.topConditions
  ) {
    console.log(
      `- ${condition}`,
    );
  }

  if (
    snapshot.executive
      .topConditions
      .length ===
    0
  ) {
    console.log(
      "- unavailable",
    );
  }

  console.log("");
  console.log("Top mechanisms");
  console.log("------------------------------------------");

  for (
    const mechanism of
    snapshot.executive.topMechanisms
  ) {
    console.log(
      `- ${mechanism}`,
    );
  }

  if (
    snapshot.executive
      .topMechanisms
      .length ===
    0
  ) {
    console.log(
      "- unavailable",
    );
  }

  console.log("");
}

function assertSuccessfulRun(
  summary:
    NorthstarIngestionSummary,
): void {
  const failures:
    string[] = [];

  if (
    summary.processedArtifacts !==
    summary.expectedArtifacts
  ) {
    failures.push(
      `Processed ${summary.processedArtifacts} artifacts; expected ${summary.expectedArtifacts}.`,
    );
  }

  if (
    summary.snapshotsCaptured !==
    summary.expectedArtifacts
  ) {
    failures.push(
      `Captured ${summary.snapshotsCaptured} snapshots; expected ${summary.expectedArtifacts}.`,
    );
  }

  if (
    summary.finalInvestigationCount !==
    summary.expectedArtifacts
  ) {
    failures.push(
      `Final investigation count was ${summary.finalInvestigationCount}; expected ${summary.expectedArtifacts}.`,
    );
  }

  if (
    summary.batchCheckpoints.length !==
    northstarEvidenceManifest
      .batches
      .length
  ) {
    failures.push(
      `Captured ${summary.batchCheckpoints.length} batch checkpoints; expected ${northstarEvidenceManifest.batches.length}.`,
    );
  }

  for (
    let index = 0;
    index <
    summary.measurements.length;
    index += 1
  ) {
    const measurement =
      summary.measurements[
        index
      ];

    const expectedCount =
      index +
      1;

    if (
      measurement
        .snapshot
        .investigationCount !==
      expectedCount
    ) {
      failures.push(
        `${measurement.artifactId} produced investigation count ${measurement.snapshot.investigationCount}; expected ${expectedCount}.`,
      );
    }
  }

  if (
    failures.length >
    0
  ) {
    throw new Error(
      [
        "Northstar ingestion integrity checks failed:",
        ...failures.map(
          (failure) =>
            `- ${failure}`,
        ),
      ].join(
        "\n",
      ),
    );
  }
}

function printSummary(
  summary:
    NorthstarIngestionSummary,
): void {
  const finalSnapshot =
    summary.measurements.at(
      -1,
    )?.snapshot;

  console.log("==========================================");
  console.log("NORTHSTAR INGESTION COMPLETE");
  console.log("==========================================");
  console.log("");

  console.log(
    `Artifacts processed: ${summary.processedArtifacts} / ${summary.expectedArtifacts}`,
  );

  console.log(
    `Snapshots captured: ${summary.snapshotsCaptured}`,
  );

  console.log(
    `Final investigation count: ${summary.finalInvestigationCount}`,
  );

  console.log(
    `Batch checkpoints: ${summary.batchCheckpoints.length}`,
  );

  console.log(
    `Elapsed time: ${formatDuration(
      summary.elapsedMilliseconds,
    )}`,
  );

  if (finalSnapshot) {
    console.log("");
    console.log("Final runtime snapshot");
    console.log("------------------------------------------");

    console.log(
      `Observations: ${finalSnapshot.counts.observations}`,
    );

    console.log(
      `Beliefs: ${finalSnapshot.counts.beliefs}`,
    );

    console.log(
      `Theories: ${finalSnapshot.counts.theories}`,
    );

    console.log(
      `Concepts: ${finalSnapshot.counts.concepts}`,
    );

    console.log(
      `Conditions: ${finalSnapshot.counts.conditions}`,
    );

    console.log(
      `Mechanisms: ${finalSnapshot.counts.mechanisms}`,
    );

    console.log(
      `Predictions: ${finalSnapshot.counts.predictions}`,
    );

    console.log(
      `Learning events: ${finalSnapshot.counts.learningEvents}`,
    );

    console.log(
      `Memory maturity: ${finalSnapshot.maturity.score ?? "unavailable"}`,
    );

    console.log(
      `Executive confidence: ${finalSnapshot.executive.confidence ?? "unavailable"}`,
    );
  }

  console.log("");
  console.log("PASS");
  console.log("");
}

function runNorthstarIngestionExperiment001():
  NorthstarIngestionSummary {
  printHeader();

  console.log(
    `Organization: ${northstarCompanyFixture.organization.name}`,
  );

  console.log(
    `Organization ID: ${NORTHSTAR_ORGANIZATION_ID}`,
  );

  console.log(
    `Artifacts expected: ${northstarEvidenceManifest.artifactCount}`,
  );

  console.log("");
  console.log("Resetting runtime...");

  resetOrganizationRuntimeState(
    NORTHSTAR_ORGANIZATION_ID,
  );

  console.log("Runtime reset.");
  console.log("");

  const artifacts =
    northstarEvidenceManifest
      .artifacts
      .slice()
      .sort(
        (
          left,
          right,
        ) =>
          left.sequence -
          right.sequence,
      );

  const measurements:
    NorthstarIngestionMeasurement[] =
    [];

  const batchCheckpoints:
    NorthstarBatchCheckpoint[] =
    [];

  let currentBatch =
    "";

  let currentBatchMeasurements:
    NorthstarIngestionMeasurement[] =
    [];

  const experimentStartedAt =
    Date.now();

  for (
    const artifact of
    artifacts
  ) {
    if (
      currentBatch &&
      artifact.batch !==
        currentBatch
    ) {
      const checkpoint =
        buildBatchCheckpoint({
          batch:
            currentBatch,

          batchMeasurements:
            currentBatchMeasurements,

          previousCheckpoint:
            batchCheckpoints.at(
              -1,
            ),
        });

      batchCheckpoints.push(
        checkpoint,
      );

      printBatchCheckpoint(
        checkpoint,
      );

      currentBatchMeasurements =
        [];
    }

    currentBatch =
      artifact.batch;

    const artifactStartedAt =
      Date.now();

    const document =
      readEvidenceArtifact(
        artifact,
      );

    const investigation =
      runOrganizationInvestigation({
        organizationId:
          NORTHSTAR_ORGANIZATION_ID,

        company:
          northstarCompanyFixture
            .organization
            .name,

        website:
          "",

        industry:
          northstarCompanyFixture
            .organization
            .industry,

        question:
          "What is happening inside Northstar Industrial Systems, why is it happening, and what should executives focus on next?",

        context:
          buildInvestigationContext(
            artifact,
            document,
          ),
      });

    const snapshot =
      captureRuntimeSnapshot(
        investigation.runtime,
      );

    const measurement:
      NorthstarIngestionMeasurement = {
      artifactId:
        artifact.id,

      filename:
        artifact.filename,

      sequence:
        artifact.sequence,

      batch:
        artifact.batch,

      elapsedMilliseconds:
        Date.now() -
        artifactStartedAt,

      snapshot,
    };

    measurements.push(
      measurement,
    );

    currentBatchMeasurements.push(
      measurement,
    );

    printProgress({
      artifact,
      total:
        artifacts.length,
      measurement,
    });
  }

  if (
    currentBatch &&
    currentBatchMeasurements
      .length >
      0
  ) {
    const checkpoint =
      buildBatchCheckpoint({
        batch:
          currentBatch,

        batchMeasurements:
          currentBatchMeasurements,

        previousCheckpoint:
          batchCheckpoints.at(
            -1,
          ),
      });

    batchCheckpoints.push(
      checkpoint,
    );

    printBatchCheckpoint(
      checkpoint,
    );
  }

  const summary:
    NorthstarIngestionSummary = {
    expectedArtifacts:
      northstarEvidenceManifest
        .artifactCount,

    processedArtifacts:
      measurements.length,

    snapshotsCaptured:
      measurements.length,

    finalInvestigationCount:
      measurements.at(
        -1,
      )?.snapshot
        .investigationCount ??
      0,

    elapsedMilliseconds:
      Date.now() -
      experimentStartedAt,

    measurements,

    batchCheckpoints,
  };

  assertSuccessfulRun(
    summary,
  );

  printSummary(
    summary,
  );

  return summary;
}

if (
  basename(
    process.argv[1] ??
      "",
  ) ===
  "runNorthstarIngestionExperiment001.ts"
) {
  runNorthstarIngestionExperiment001();
}

export {
  runNorthstarIngestionExperiment001,
};

export type {
  NorthstarBatchCheckpoint,
  NorthstarIngestionMeasurement,
  NorthstarIngestionSummary,
};
