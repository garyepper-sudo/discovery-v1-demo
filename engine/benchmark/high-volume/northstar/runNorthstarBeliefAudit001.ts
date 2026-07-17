import {
  readFileSync,
} from "node:fs";

import {
  join,
} from "node:path";

import {
  captureRuntimeSnapshot,
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

type BeliefLike = {
  id?: string;
  statement?: string;
  title?: string;
  label?: string;
  confidence?: number;
};

type BeliefAuditRow = {
  sequence: number;
  artifactId: string;
  filename: string;

  resultBeliefs: number;
  runtimeBeliefs: number;
  organizationalBeliefs: number;
  projectedBeliefs: number;
  snapshotBeliefs: number;

  sampleResultBeliefs: string[];
  sampleRuntimeBeliefs: string[];
  sampleOrganizationalBeliefs: string[];
  sampleProjectedBeliefs: string[];
};

type ExtendedMemory = {
  beliefs?: BeliefLike[];
  organizationalBeliefs?: BeliefLike[];

  simulatedOrganizationStates?: Array<{
    projectedBeliefs?: BeliefLike[];
  }>;
};

function beliefText(
  belief:
    BeliefLike,
): string {
  return (
    belief.statement ??
    belief.title ??
    belief.label ??
    belief.id ??
    "unnamed-belief"
  );
}

function sampleBeliefs(
  value:
    unknown,
): string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return (
    value as
      BeliefLike[]
  )
    .slice(
      0,
      5,
    )
    .map(
      beliefText,
    );
}

function countBeliefs(
  value:
    unknown,
): number {
  return Array.isArray(
    value,
  )
    ? value.length
    : 0;
}

function readDocument(
  filename:
    string,
): string {
  return readFileSync(
    join(
      EVIDENCE_DIRECTORY,
      filename,
    ),
    "utf8",
  );
}

function buildContext(
  artifact:
    typeof northstarEvidenceManifest.artifacts[number],

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
    "",
    "Document:",
    document,
  ].join(
    "\n",
  );
}

function printRow(
  row:
    BeliefAuditRow,
): void {
  console.log("------------------------------------------");

  console.log(
    `[${row.sequence}] ${row.filename}`,
  );

  console.log(
    `result.beliefs: ${row.resultBeliefs}`,
  );

  console.log(
    `runtime.memory.beliefs: ${row.runtimeBeliefs}`,
  );

  console.log(
    `runtime.memory.organizationalBeliefs: ${row.organizationalBeliefs}`,
  );

  console.log(
    `latest projectedBeliefs: ${row.projectedBeliefs}`,
  );

  console.log(
    `snapshot beliefs: ${row.snapshotBeliefs}`,
  );

  if (
    row.sampleResultBeliefs.length >
    0
  ) {
    console.log(
      `result sample: ${row.sampleResultBeliefs.join(" | ")}`,
    );
  }

  if (
    row.sampleRuntimeBeliefs.length >
    0
  ) {
    console.log(
      `runtime sample: ${row.sampleRuntimeBeliefs.join(" | ")}`,
    );
  }

  if (
    row.sampleOrganizationalBeliefs.length >
    0
  ) {
    console.log(
      `organizational sample: ${row.sampleOrganizationalBeliefs.join(" | ")}`,
    );
  }

  if (
    row.sampleProjectedBeliefs.length >
    0
  ) {
    console.log(
      `projected sample: ${row.sampleProjectedBeliefs.join(" | ")}`,
    );
  }

  console.log("");
}

function runNorthstarBeliefAudit001(): void {
  console.log("");
  console.log("==========================================");
  console.log("NORTHSTAR BELIEF AUDIT 001");
  console.log("==========================================");
  console.log("");

  resetOrganizationRuntimeState(
    NORTHSTAR_ORGANIZATION_ID,
  );

  const rows:
    BeliefAuditRow[] = [];

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

  for (
    const artifact of
    artifacts
  ) {
    const document =
      readDocument(
        artifact.filename,
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
          buildContext(
            artifact,
            document,
          ),
      });

    const memory =
      investigation.runtime
        .memory as
      typeof investigation.runtime.memory &
      ExtendedMemory;

    const latestSimulation =
      memory
        .simulatedOrganizationStates
        ?.at(
          -1,
        );

    const snapshot =
      captureRuntimeSnapshot(
        investigation.runtime,
      );

    const row:
      BeliefAuditRow = {
      sequence:
        artifact.sequence,

      artifactId:
        artifact.id,

      filename:
        artifact.filename,

      resultBeliefs:
        countBeliefs(
          investigation.result
            .beliefs,
        ),

      runtimeBeliefs:
        countBeliefs(
          memory.beliefs,
        ),

      organizationalBeliefs:
        countBeliefs(
          memory.organizationalBeliefs,
        ),

      projectedBeliefs:
        countBeliefs(
          latestSimulation
            ?.projectedBeliefs,
        ),

      snapshotBeliefs:
        snapshot.counts
          .beliefs,

      sampleResultBeliefs:
        sampleBeliefs(
          investigation.result
            .beliefs,
        ),

      sampleRuntimeBeliefs:
        sampleBeliefs(
          memory.beliefs,
        ),

      sampleOrganizationalBeliefs:
        sampleBeliefs(
          memory.organizationalBeliefs,
        ),

      sampleProjectedBeliefs:
        sampleBeliefs(
          latestSimulation
            ?.projectedBeliefs,
        ),
    };

    rows.push(
      row,
    );

    printRow(
      row,
    );
  }

  const final =
    rows.at(
      -1,
    );

  if (!final) {
    throw new Error(
      "Belief audit produced no rows.",
    );
  }

  console.log("==========================================");
  console.log("FINAL BELIEF AUDIT");
  console.log("==========================================");
  console.log("");

  console.log(
    `Result beliefs: ${final.resultBeliefs}`,
  );

  console.log(
    `Runtime beliefs: ${final.runtimeBeliefs}`,
  );

  console.log(
    `Organizational beliefs: ${final.organizationalBeliefs}`,
  );

  console.log(
    `Projected beliefs: ${final.projectedBeliefs}`,
  );

  console.log(
    `Snapshot beliefs: ${final.snapshotBeliefs}`,
  );

  console.log("");

  if (
    final.resultBeliefs >
      0 &&
    final.runtimeBeliefs ===
      0 &&
    final.organizationalBeliefs ===
      0
  ) {
    console.log(
      "DIAGNOSIS: Investigation beliefs are produced but not persisted into canonical runtime belief collections.",
    );
  } else if (
    final.projectedBeliefs >
      0 &&
    final.snapshotBeliefs ===
      0
  ) {
    console.log(
      "DIAGNOSIS: Beliefs exist only in simulated projected state; the snapshot helper is correctly reporting zero persistent beliefs.",
    );
  } else if (
    (
      final.runtimeBeliefs >
        0 ||
      final.organizationalBeliefs >
        0
    ) &&
    final.snapshotBeliefs ===
      0
  ) {
    console.log(
      "DIAGNOSIS: Persistent beliefs exist, but captureRuntimeSnapshot() is reading the wrong collection.",
    );
  } else if (
    final.snapshotBeliefs >
    0
  ) {
    console.log(
      "DIAGNOSIS: Persistent beliefs are available and the snapshot helper is counting them.",
    );
  } else {
    console.log(
      "DIAGNOSIS: No persistent or projected belief collection was populated. Inspect belief inference and runtime evolution.",
    );
  }

  console.log("");
}

runNorthstarBeliefAudit001();

export {
  runNorthstarBeliefAudit001,
};
