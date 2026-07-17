import {
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";

import {
  join,
} from "node:path";

import {
  northstarEvidenceManifest,
  type NorthstarEvidenceArtifact,
} from "./northstarEvidenceManifest";

const OUTPUT_DIRECTORY =
  join(
    process.cwd(),
    "engine",
    "benchmark",
    "high-volume",
    "northstar",
    "evidence",
  );

function quoteCsv(
  value: unknown,
): string {
  const text =
    String(
      value ?? "",
    );

  return `"${text.replace(
    /"/g,
    '""',
  )}"`;
}

function buildMetricRows(
  artifact:
    NorthstarEvidenceArtifact,
): Array<
  Record<string, string | number>
> {
  const base =
    artifact.sequence;

  const rows: Array<
    Record<string, string | number>
  > = [];

  for (
    let index = 0;
    index < 8;
    index += 1
  ) {
    const period =
      `2026-${String(
        Math.max(
          1,
          Math.min(
            12,
            index + 1,
          ),
        ),
      ).padStart(
        2,
        "0",
      )}`;

    rows.push({
      period,

      function:
        artifact.function,

      metric:
        artifact.title,

      actual:
        Number(
          (
            45 +
            ((base * 7 + index * 11) %
              47)
          ).toFixed(
            2,
          ),
        ),

      target:
        Number(
          (
            70 +
            ((base * 3 + index * 5) %
              21)
          ).toFixed(
            2,
          ),
        ),

      variance:
        Number(
          (
            -25 +
            ((base * 5 + index * 7) %
              31)
          ).toFixed(
            2,
          ),
        ),

      confidence:
        Number(
          (
            artifact.reliability ===
            "high"
              ? 0.82
              : artifact.reliability ===
                  "moderate"
                ? 0.66
                : 0.48
          ).toFixed(
            2,
          ),
        ),

      note:
        artifact.summary,
    });
  }

  return rows;
}

function renderCsv(
  artifact:
    NorthstarEvidenceArtifact,
): string {
  const rows =
    buildMetricRows(
      artifact,
    );

  const columns =
    Object.keys(
      rows[0] ??
      {},
    );

  const lines = [
    columns
      .map(
        quoteCsv,
      )
      .join(
        ",",
      ),
  ];

  for (const row of rows) {
    lines.push(
      columns
        .map(
          (column) =>
            quoteCsv(
              row[column],
            ),
        )
        .join(
          ",",
        ),
    );
  }

  return `${lines.join(
    "\n",
  )}\n`;
}

function renderJson(
  artifact:
    NorthstarEvidenceArtifact,
): string {
  const payload = {
    metadata: {
      artifactId:
        artifact.id,

      organizationId:
        artifact.organizationId,

      title:
        artifact.title,

      function:
        artifact.function,

      owner:
        artifact.owner,

      effectiveDate:
        artifact.effectiveDate,

      createdAt:
        artifact.createdAt,

      reliability:
        artifact.reliability,

      bias:
        artifact.bias,

      stale:
        artifact.stale,
    },

    executiveSummary:
      artifact.summary,

    reportedStatus:
      artifact.bias ===
        "optimistic"
        ? "on-track"
        : artifact.bias ===
            "defensive"
          ? "requires-context"
          : artifact.reliability ===
              "high"
            ? "validated"
            : "under-review",

    indicators:
      buildMetricRows(
        artifact,
      ).slice(
        0,
        5,
      ),

    statedAssumptions:
      artifact
        .supportsMisleadingNarratives,

    supportedInterpretations:
      artifact
        .supportsGroundTruth,

    knownContradictions:
      artifact
        .contradictsArtifactIds,

    expectedCognitiveEffects:
      artifact
        .expectedCognitiveEffects,
  };

  return `${JSON.stringify(
    payload,
    null,
    2,
  )}\n`;
}

function renderMarkdown(
  artifact:
    NorthstarEvidenceArtifact,
): string {
  const tone =
    artifact.bias ===
      "optimistic"
      ? "Management believes progress remains broadly positive despite temporary execution pressure."
      : artifact.bias ===
          "defensive"
        ? "The author emphasizes contextual factors and cautions against attributing performance to a single function."
        : artifact.bias ===
            "political"
          ? "The document reflects unresolved differences among functions and does not establish shared ownership."
          : artifact.bias ===
              "commercial"
            ? "The document prioritizes growth, customer responsiveness, and commercial flexibility."
            : artifact.bias ===
                "operational"
              ? "The document prioritizes delivery feasibility, execution discipline, and operating stability."
              : "The document presents the available evidence without an explicit advocacy position.";

  const evidencePoints = [
    artifact.summary,
    ...artifact
      .supportsGroundTruth
      .map(
        (statement) =>
          `Supporting evidence: ${statement}`,
      ),
    ...artifact
      .supportsMisleadingNarratives
      .map(
        (statement) =>
          `Management interpretation: ${statement}`,
      ),
  ];

  return `# ${artifact.title}

**Organization:** Northstar Industrial Systems  
**Function:** ${artifact.function}  
**Owner:** ${artifact.owner}  
**Effective date:** ${artifact.effectiveDate}  
**Prepared:** ${artifact.createdAt}  
**Reliability:** ${artifact.reliability}  
**Perspective:** ${artifact.bias}  

---

## Executive Summary

${artifact.summary}

## Management Context

${tone}

## Key Findings

${evidencePoints
  .map(
    (point) =>
      `- ${point}`,
  )
  .join(
    "\n",
  )}

## Operating Implications

${artifact.expectedCognitiveEffects
  .map(
    (effect) =>
      `- ${effect}`,
  )
  .join(
    "\n",
  )}

## Known Dependencies

${
  artifact.contradictsArtifactIds.length >
  0
    ? artifact.contradictsArtifactIds
        .map(
          (id) =>
            `- This document may conflict with ${id}.`,
        )
        .join(
          "\n",
        )
    : "- No direct contradiction was recorded when this document was prepared."
}

## Limitations

- This document reflects the information available to ${artifact.owner} as of ${artifact.effectiveDate}.
- Metric definitions may differ from those used by other functions.
- Absence of evidence should not be interpreted as evidence of absence.
${
  artifact.stale
    ? "- This document is stale and may no longer represent the current operating environment."
    : ""
}
`;
}

function renderText(
  artifact:
    NorthstarEvidenceArtifact,
): string {
  const speakers = [
    artifact.owner,
    "Operations Lead",
    "Finance Partner",
    "Commercial Leader",
  ];

  const lines = [
    artifact.title.toUpperCase(),
    "",
    `Organization: Northstar Industrial Systems`,
    `Function: ${artifact.function}`,
    `Effective date: ${artifact.effectiveDate}`,
    "",
    `[09:02] ${speakers[0]}: ${artifact.summary}`,
    `[09:11] ${speakers[1]}: We need to distinguish the immediate escalation from the operating mechanism creating it.`,
    `[09:18] ${speakers[2]}: The financial impact is not isolated. Rework, delay, and exception handling are recurring across multiple projects.`,
    `[09:27] ${speakers[3]}: The commercial team needs flexibility, but ownership and feasibility decisions are not consistently made before commitments.`,
    `[09:35] ${speakers[0]}: No function agrees on a single definition of success, and decisions are repeatedly escalated instead of resolved at the operating level.`,
    "",
    "Follow-up observations:",
    ...artifact.expectedCognitiveEffects.map(
      (effect) =>
        `- ${effect}`,
    ),
    "",
    "Potential contradictions:",
    ...(
      artifact.contradictsArtifactIds.length >
      0
        ? artifact.contradictsArtifactIds.map(
            (id) =>
              `- Review against ${id}.`,
          )
        : [
            "- None explicitly identified.",
          ]
    ),
    "",
  ];

  return lines.join(
    "\n",
  );
}

function renderArtifact(
  artifact:
    NorthstarEvidenceArtifact,
): string {
  switch (
    artifact.format
  ) {
    case "csv":
      return renderCsv(
        artifact,
      );

    case "json":
      return renderJson(
        artifact,
      );

    case "txt":
      return renderText(
        artifact,
      );

    case "markdown":
      return renderMarkdown(
        artifact,
      );
  }
}

function validateManifest(): void {
  if (
    northstarEvidenceManifest
      .artifacts
      .length !==
    northstarEvidenceManifest
      .artifactCount
  ) {
    throw new Error(
      `Northstar evidence manifest expected ${northstarEvidenceManifest.artifactCount} artifacts but contains ${northstarEvidenceManifest.artifacts.length}.`,
    );
  }

  const ids =
    new Set<string>();

  const filenames =
    new Set<string>();

  for (
    const artifact of
    northstarEvidenceManifest
      .artifacts
  ) {
    if (
      ids.has(
        artifact.id,
      )
    ) {
      throw new Error(
        `Duplicate artifact ID "${artifact.id}".`,
      );
    }

    if (
      filenames.has(
        artifact.filename,
      )
    ) {
      throw new Error(
        `Duplicate artifact filename "${artifact.filename}".`,
      );
    }

    ids.add(
      artifact.id,
    );

    filenames.add(
      artifact.filename,
    );
  }
}

function generateEvidence(): void {
  validateManifest();

  rmSync(
    OUTPUT_DIRECTORY,
    {
      recursive:
        true,

      force:
        true,
    },
  );

  mkdirSync(
    OUTPUT_DIRECTORY,
    {
      recursive:
        true,
    },
  );

  const index = {
    organizationId:
      northstarEvidenceManifest
        .organizationId,

    companyName:
      northstarEvidenceManifest
        .companyName,

    generatedAt:
      new Date()
        .toISOString(),

    artifacts:
      northstarEvidenceManifest
        .artifacts
        .map(
          (artifact) => ({
            id:
              artifact.id,

            batch:
              artifact.batch,

            sequence:
              artifact.sequence,

            filename:
              artifact.filename,

            format:
              artifact.format,

            title:
              artifact.title,

            effectiveDate:
              artifact.effectiveDate,

            reliability:
              artifact.reliability,

            bias:
              artifact.bias,

            stale:
              artifact.stale,
          }),
        ),
  };

  for (
    const artifact of
    northstarEvidenceManifest
      .artifacts
  ) {
    const filepath =
      join(
        OUTPUT_DIRECTORY,
        artifact.filename,
      );

    writeFileSync(
      filepath,
      renderArtifact(
        artifact,
      ),
      "utf8",
    );
  }

  writeFileSync(
    join(
      OUTPUT_DIRECTORY,
      "evidence-index.json",
    ),
    `${JSON.stringify(
      index,
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log("");
  console.log("==========================================");
  console.log("NORTHSTAR EVIDENCE GENERATOR");
  console.log("==========================================");
  console.log("");
  console.log(
    `Organization: ${northstarEvidenceManifest.companyName}`,
  );
  console.log(
    `Artifacts generated: ${northstarEvidenceManifest.artifacts.length}`,
  );
  console.log(
    `Output directory: ${OUTPUT_DIRECTORY}`,
  );
  console.log("");
}

generateEvidence();
