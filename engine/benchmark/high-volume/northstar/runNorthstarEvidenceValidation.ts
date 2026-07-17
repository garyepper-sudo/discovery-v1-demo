import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";

import {
  extname,
  join,
} from "node:path";

import {
  NORTHSTAR_ORGANIZATION_ID,
  northstarCompanyFixture,
} from "./northstarCompanyFixture";

import {
  northstarEvidenceManifest,
  type NorthstarEvidenceArtifact,
  type NorthstarEvidenceBatch,
  type NorthstarEvidenceFormat,
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

type Check = {
  category: string;
  name: string;
  passed: boolean;
  detail: string;
};

type CorpusSummary = {
  expectedArtifacts: number;
  discoveredArtifacts: number;
  totalBytes: number;
  formats: Record<string, number>;
  batches: Record<string, number>;
  functions: Set<string>;
  owners: Set<string>;
  reliabilityLevels: Set<string>;
  biases: Set<string>;
  contradictionLinks: number;
  groundTruthStatements: Set<string>;
  misleadingNarratives: Set<string>;
  cognitiveEffects: Set<string>;
};

const FORMAT_EXTENSIONS:
  Record<
    NorthstarEvidenceFormat,
    string
  > = {
    markdown:
      ".md",

    csv:
      ".csv",

    json:
      ".json",

    txt:
      ".txt",
  };

function pushCheck(
  checks: Check[],
  category: string,
  name: string,
  passed: boolean,
  detail: string,
): void {
  checks.push({
    category,
    name,
    passed,
    detail,
  });
}

function validDate(
  value: string,
): boolean {
  return !Number.isNaN(
    Date.parse(
      value,
    ),
  );
}

function readArtifact(
  artifact:
    NorthstarEvidenceArtifact,
): {
  filepath: string;
  content: string;
  bytes: number;
} {
  const filepath =
    join(
      EVIDENCE_DIRECTORY,
      artifact.filename,
    );

  const content =
    readFileSync(
      filepath,
      "utf8",
    );

  const bytes =
    statSync(
      filepath,
    ).size;

  return {
    filepath,
    content,
    bytes,
  };
}

function validateMarkdown(
  artifact:
    NorthstarEvidenceArtifact,

  content: string,
): string[] {
  const failures: string[] = [];

  if (
    !content.startsWith(
      "# ",
    )
  ) {
    failures.push(
      "missing top-level heading",
    );
  }

  if (
    !content.includes(
      "## Executive Summary",
    )
  ) {
    failures.push(
      "missing executive summary",
    );
  }

  if (
    !content.includes(
      artifact.title,
    )
  ) {
    failures.push(
      "title not rendered",
    );
  }

  return failures;
}

function parseCsv(
  content: string,
): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let insideQuotes = false;

  for (
    let index = 0;
    index < content.length;
    index += 1
  ) {
    const character =
      content[index];

    const nextCharacter =
      content[
        index + 1
      ];

    if (
      character ===
      '"'
    ) {
      if (
        insideQuotes &&
        nextCharacter ===
          '"'
      ) {
        field +=
          '"';

        index +=
          1;
      } else {
        insideQuotes =
          !insideQuotes;
      }

      continue;
    }

    if (
      character ===
        "," &&
      !insideQuotes
    ) {
      row.push(
        field,
      );

      field =
        "";

      continue;
    }

    if (
      (
        character ===
          "\n" ||
        character ===
          "\r"
      ) &&
      !insideQuotes
    ) {
      if (
        character ===
          "\r" &&
        nextCharacter ===
          "\n"
      ) {
        index +=
          1;
      }

      row.push(
        field,
      );

      if (
        row.some(
          (value) =>
            value.length >
            0,
        )
      ) {
        rows.push(
          row,
        );
      }

      row = [];
      field =
        "";

      continue;
    }

    field +=
      character;
  }

  if (insideQuotes) {
    throw new Error(
      "CSV contains an unterminated quoted field.",
    );
  }

  row.push(
    field,
  );

  if (
    row.some(
      (value) =>
        value.length >
        0,
    )
  ) {
    rows.push(
      row,
    );
  }

  return rows;
}

function validateCsv(
  content: string,
): string[] {
  const failures: string[] = [];

  let rows:
    string[][];

  try {
    rows =
      parseCsv(
        content,
      );
  } catch (
    error
  ) {
    failures.push(
      error instanceof
        Error
        ? error.message
        : "CSV parsing failed.",
    );

    return failures;
  }

  if (
    rows.length <
    3
  ) {
    failures.push(
      "fewer than two data rows",
    );
  }

  const header =
    rows[0] ??
    [];

  if (
    header.length <
    2
  ) {
    failures.push(
      "header is not comma-delimited",
    );
  }

  const malformedRowIndex =
    rows
      .slice(
        1,
      )
      .findIndex(
        (row) =>
          row.length !==
          header.length,
      );

  if (
    malformedRowIndex >=
    0
  ) {
    failures.push(
      `row ${malformedRowIndex + 2} has ${rows[malformedRowIndex + 1]?.length ?? 0} columns; expected ${header.length}`,
    );
  }

  return failures;
}

function validateJson(
  artifact:
    NorthstarEvidenceArtifact,

  content: string,
): string[] {
  const failures: string[] = [];

  try {
    const parsed =
      JSON.parse(
        content,
      ) as {
        metadata?: {
          artifactId?: string;
          organizationId?: string;
        };
      };

    if (
      parsed.metadata
        ?.artifactId !==
      artifact.id
    ) {
      failures.push(
        "artifact ID mismatch",
      );
    }

    if (
      parsed.metadata
        ?.organizationId !==
      artifact.organizationId
    ) {
      failures.push(
        "organization ID mismatch",
      );
    }
  } catch {
    failures.push(
      "invalid JSON",
    );
  }

  return failures;
}

function validateText(
  artifact:
    NorthstarEvidenceArtifact,

  content: string,
): string[] {
  const failures: string[] = [];

  if (
    !content.includes(
      "[09:02]",
    )
  ) {
    failures.push(
      "missing transcript-style timestamp",
    );
  }

  if (
    !content.includes(
      artifact.function,
    )
  ) {
    failures.push(
      "function not rendered",
    );
  }

  return failures;
}

function validateArtifactContent(
  artifact:
    NorthstarEvidenceArtifact,

  content: string,

  bytes: number,
): string[] {
  const failures: string[] = [];

  if (
    content.trim().length ===
    0
  ) {
    failures.push(
      "empty file",
    );

    return failures;
  }

  if (
    bytes <
    250
  ) {
    failures.push(
      `content too short (${bytes} bytes)`,
    );
  }

  if (
    !content.includes(
      artifact.summary,
    )
  ) {
    failures.push(
      "manifest summary not rendered",
    );
  }

  switch (
    artifact.format
  ) {
    case "markdown":
      failures.push(
        ...validateMarkdown(
          artifact,
          content,
        ),
      );
      break;

    case "csv":
      failures.push(
        ...validateCsv(
          content,
        ),
      );
      break;

    case "json":
      failures.push(
        ...validateJson(
          artifact,
          content,
        ),
      );
      break;

    case "txt":
      failures.push(
        ...validateText(
          artifact,
          content,
        ),
      );
      break;
  }

  return failures;
}

function validateManifestReferences(
  checks: Check[],
): void {
  const artifactIds =
    new Set(
      northstarEvidenceManifest
        .artifacts
        .map(
          (artifact) =>
            artifact.id,
        ),
    );

  for (
    const artifact of
    northstarEvidenceManifest
      .artifacts
  ) {
    for (
      const contradictionId of
      artifact
        .contradictsArtifactIds
    ) {
      pushCheck(
        checks,
        "Manifest references",
        `${artifact.id} contradiction ${contradictionId}`,
        artifactIds.has(
          contradictionId,
        ),
        artifactIds.has(
          contradictionId,
        )
          ? "Reference resolves."
          : "Reference does not resolve.",
      );
    }

    if (
      artifact.duplicateOf
    ) {
      pushCheck(
        checks,
        "Manifest references",
        `${artifact.id} duplicate ${artifact.duplicateOf}`,
        artifactIds.has(
          artifact.duplicateOf,
        ),
        artifactIds.has(
          artifact.duplicateOf,
        )
          ? "Reference resolves."
          : "Reference does not resolve.",
      );
    }
  }
}

function validateManifestMetadata(
  checks: Check[],
): void {
  const ids =
    new Set<string>();

  const filenames =
    new Set<string>();

  const sequences =
    new Set<number>();

  for (
    const artifact of
    northstarEvidenceManifest
      .artifacts
  ) {
    pushCheck(
      checks,
      "Manifest metadata",
      `${artifact.id} unique ID`,
      !ids.has(
        artifact.id,
      ),
      artifact.id,
    );

    pushCheck(
      checks,
      "Manifest metadata",
      `${artifact.id} unique filename`,
      !filenames.has(
        artifact.filename,
      ),
      artifact.filename,
    );

    pushCheck(
      checks,
      "Manifest metadata",
      `${artifact.id} unique sequence`,
      !sequences.has(
        artifact.sequence,
      ),
      String(
        artifact.sequence,
      ),
    );

    ids.add(
      artifact.id,
    );

    filenames.add(
      artifact.filename,
    );

    sequences.add(
      artifact.sequence,
    );

    pushCheck(
      checks,
      "Manifest metadata",
      `${artifact.id} effective date`,
      validDate(
        artifact.effectiveDate,
      ),
      artifact.effectiveDate,
    );

    pushCheck(
      checks,
      "Manifest metadata",
      `${artifact.id} created date`,
      validDate(
        artifact.createdAt,
      ),
      artifact.createdAt,
    );

    pushCheck(
      checks,
      "Manifest metadata",
      `${artifact.id} owner`,
      artifact.owner
        .trim()
        .length >
      0,
      artifact.owner,
    );

    pushCheck(
      checks,
      "Manifest metadata",
      `${artifact.id} function`,
      artifact.function
        .trim()
        .length >
      0,
      artifact.function,
    );

    const expectedExtension =
      FORMAT_EXTENSIONS[
        artifact.format
      ];

    pushCheck(
      checks,
      "Manifest metadata",
      `${artifact.id} extension`,
      extname(
        artifact.filename,
      ) ===
      expectedExtension,
      `${artifact.filename} expected ${expectedExtension}`,
    );
  }
}

function validateCorpus(
  checks: Check[],
): CorpusSummary {
  const summary:
    CorpusSummary = {
      expectedArtifacts:
        northstarEvidenceManifest
          .artifactCount,

      discoveredArtifacts:
        0,

      totalBytes:
        0,

      formats:
        {},

      batches:
        {},

      functions:
        new Set(),

      owners:
        new Set(),

      reliabilityLevels:
        new Set(),

      biases:
        new Set(),

      contradictionLinks:
        0,

      groundTruthStatements:
        new Set(),

      misleadingNarratives:
        new Set(),

      cognitiveEffects:
        new Set(),
    };

  pushCheck(
    checks,
    "Corpus structure",
    "Evidence directory exists",
    existsSync(
      EVIDENCE_DIRECTORY,
    ),
    EVIDENCE_DIRECTORY,
  );

  if (
    !existsSync(
      EVIDENCE_DIRECTORY,
    )
  ) {
    return summary;
  }

  const discoveredFiles =
    readdirSync(
      EVIDENCE_DIRECTORY,
    )
      .filter(
        (filename) =>
          filename !==
          "evidence-index.json",
      );

  summary.discoveredArtifacts =
    discoveredFiles.length;

  pushCheck(
    checks,
    "Corpus structure",
    "Artifact count matches manifest",
    discoveredFiles.length ===
      northstarEvidenceManifest
        .artifactCount,
    `${discoveredFiles.length} / ${northstarEvidenceManifest.artifactCount}`,
  );

  const expectedFilenames =
    new Set(
      northstarEvidenceManifest
        .artifacts
        .map(
          (artifact) =>
            artifact.filename,
        ),
    );

  const unexpectedFiles =
    discoveredFiles
      .filter(
        (filename) =>
          !expectedFilenames.has(
            filename,
          ),
      );

  pushCheck(
    checks,
    "Corpus structure",
    "No unexpected evidence files",
    unexpectedFiles.length ===
      0,
    unexpectedFiles.length ===
      0
      ? "No unexpected files."
      : unexpectedFiles.join(
          ", ",
        ),
  );

  for (
    const artifact of
    northstarEvidenceManifest
      .artifacts
  ) {
    const filepath =
      join(
        EVIDENCE_DIRECTORY,
        artifact.filename,
      );

    const exists =
      existsSync(
        filepath,
      );

    pushCheck(
      checks,
      "Corpus files",
      `${artifact.id} exists`,
      exists,
      artifact.filename,
    );

    if (!exists) {
      continue;
    }

    const {
      content,
      bytes,
    } =
      readArtifact(
        artifact,
      );

    summary.totalBytes +=
      bytes;

    summary.formats[
      artifact.format
    ] =
      (
        summary.formats[
          artifact.format
        ] ??
        0
      ) +
      1;

    summary.batches[
      artifact.batch
    ] =
      (
        summary.batches[
          artifact.batch
        ] ??
        0
      ) +
      1;

    summary.functions.add(
      artifact.function,
    );

    summary.owners.add(
      artifact.owner,
    );

    summary
      .reliabilityLevels
      .add(
        artifact.reliability,
      );

    summary.biases.add(
      artifact.bias,
    );

    summary.contradictionLinks +=
      artifact
        .contradictsArtifactIds
        .length;

    for (
      const statement of
      artifact
        .supportsGroundTruth
    ) {
      summary
        .groundTruthStatements
        .add(
          statement,
        );
    }

    for (
      const narrative of
      artifact
        .supportsMisleadingNarratives
    ) {
      summary
        .misleadingNarratives
        .add(
          narrative,
        );
    }

    for (
      const effect of
      artifact
        .expectedCognitiveEffects
    ) {
      summary
        .cognitiveEffects
        .add(
          effect,
        );
    }

    const failures =
      validateArtifactContent(
        artifact,
        content,
        bytes,
      );

    pushCheck(
      checks,
      "Content quality",
      `${artifact.id} content`,
      failures.length ===
        0,
      failures.length ===
        0
        ? `${bytes} bytes; ${artifact.format} validated.`
        : failures.join(
            "; ",
          ),
    );
  }

  const indexPath =
    join(
      EVIDENCE_DIRECTORY,
      "evidence-index.json",
    );

  pushCheck(
    checks,
    "Corpus structure",
    "Evidence index exists",
    existsSync(
      indexPath,
    ),
    indexPath,
  );

  if (
    existsSync(
      indexPath,
    )
  ) {
    try {
      const index =
        JSON.parse(
          readFileSync(
            indexPath,
            "utf8",
          ),
        ) as {
          organizationId?: string;
          artifacts?: unknown[];
        };

      pushCheck(
        checks,
        "Corpus structure",
        "Evidence index organization matches",
        index.organizationId ===
          NORTHSTAR_ORGANIZATION_ID,
        index.organizationId ??
          "missing",
      );

      pushCheck(
        checks,
        "Corpus structure",
        "Evidence index count matches",
        Array.isArray(
          index.artifacts,
        ) &&
        index.artifacts.length ===
          northstarEvidenceManifest
            .artifactCount,
        Array.isArray(
          index.artifacts,
        )
          ? `${index.artifacts.length} entries`
          : "Artifacts missing.",
      );
    } catch {
      pushCheck(
        checks,
        "Corpus structure",
        "Evidence index parses",
        false,
        "Invalid JSON.",
      );
    }
  }

  return summary;
}

function validateCoverage(
  checks: Check[],

  summary:
    CorpusSummary,
): void {
  for (
    const batch of
    northstarEvidenceManifest
      .batches
  ) {
    const count =
      summary.batches[
        batch.id
      ] ??
      0;

    pushCheck(
      checks,
      "Coverage",
      `Batch ${batch.id}`,
      count >
        0,
      `${count} artifacts`,
    );
  }

  for (
    const format of
    Object.keys(
      FORMAT_EXTENSIONS,
    ) as
      NorthstarEvidenceFormat[]
  ) {
    const count =
      summary.formats[
        format
      ] ??
      0;

    pushCheck(
      checks,
      "Coverage",
      `Format ${format}`,
      count >
        0,
      `${count} artifacts`,
    );
  }

  const requiredReliability = [
    "high",
    "moderate",
    "low",
  ];

  for (
    const reliability of
    requiredReliability
  ) {
    pushCheck(
      checks,
      "Coverage",
      `Reliability ${reliability}`,
      summary
        .reliabilityLevels
        .has(
          reliability,
        ),
      summary
        .reliabilityLevels
        .has(
          reliability,
        )
        ? "Represented."
        : "Missing.",
    );
  }

  const requiredBiases = [
    "neutral",
    "optimistic",
    "defensive",
    "commercial",
    "operational",
    "political",
  ];

  for (
    const bias of
    requiredBiases
  ) {
    pushCheck(
      checks,
      "Coverage",
      `Bias ${bias}`,
      summary.biases.has(
        bias,
      ),
      summary.biases.has(
        bias,
      )
        ? "Represented."
        : "Missing.",
    );
  }

  pushCheck(
    checks,
    "Coverage",
    "Contradiction density",
    summary
      .contradictionLinks >=
      20,
    `${summary.contradictionLinks} explicit contradiction links`,
  );

  pushCheck(
    checks,
    "Coverage",
    "Ground-truth themes",
    summary
      .groundTruthStatements
      .size >=
      12,
    `${summary.groundTruthStatements.size} unique statements`,
  );

  pushCheck(
    checks,
    "Coverage",
    "Misleading narratives",
    summary
      .misleadingNarratives
      .size >=
      5,
    `${summary.misleadingNarratives.size} unique narratives`,
  );

  pushCheck(
    checks,
    "Coverage",
    "Expected cognitive effects",
    summary
      .cognitiveEffects
      .size >=
      20,
    `${summary.cognitiveEffects.size} unique effects`,
  );

  const representedExecutives =
    northstarCompanyFixture
      .executives
      .filter(
        (executive) =>
          northstarEvidenceManifest
            .artifacts
            .some(
              (artifact) => {
                const filepath =
                  join(
                    EVIDENCE_DIRECTORY,
                    artifact.filename,
                  );

                const generatedContent =
                  existsSync(
                    filepath,
                  )
                    ? readFileSync(
                        filepath,
                        "utf8",
                      )
                    : "";

                const haystack =
                  [
                    artifact.owner,
                    artifact.function,
                    artifact.title,
                    artifact.summary,
                    ...artifact.supportsGroundTruth,
                    ...artifact.supportsMisleadingNarratives,
                    ...artifact.expectedCognitiveEffects,
                    generatedContent,
                  ]
                    .join(
                      " ",
                    )
                    .toLowerCase();

                const candidates =
                  [
                    executive.name,
                    executive.title,
                    executive.function,
                  ]
                    .map(
                      (value) =>
                        value
                          .trim()
                          .toLowerCase(),
                    )
                    .filter(
                      (value) =>
                        value.length >
                        0,
                    );

                return candidates.some(
                  (candidate) =>
                    haystack.includes(
                      candidate,
                    ),
                );
              },
            ),
      );

  pushCheck(
    checks,
    "Coverage",
    "Leadership representation",
    representedExecutives.length ===
      northstarCompanyFixture
        .executives
        .length,
    `${representedExecutives.length} / ${northstarCompanyFixture.executives.length} executive perspectives represented by name, title, or function`,
  );

  pushCheck(
    checks,
    "Coverage",
    "Strategic objectives represented",
    northstarCompanyFixture
      .strategicObjectives
      .every(
        (objective) => {
          const terms =
            objective.name
              .toLowerCase()
              .split(
                /\s+/,
              )
              .filter(
                (term) =>
                  term.length >
                  4,
              );

          return northstarEvidenceManifest
            .artifacts
            .some(
              (artifact) => {
                const haystack =
                  [
                    artifact.title,
                    artifact.summary,
                    ...artifact.supportsGroundTruth,
                    ...artifact.expectedCognitiveEffects,
                  ]
                    .join(
                      " ",
                    )
                    .toLowerCase();

                return terms.some(
                  (term) =>
                    haystack.includes(
                      term,
                    ),
                );
              },
            );
        },
      ),
    `${northstarCompanyFixture.strategicObjectives.length} objectives evaluated`,
  );
}

function printSummary(
  checks: Check[],

  summary:
    CorpusSummary,
): void {
  console.log("");
  console.log("==========================================");
  console.log("NORTHSTAR EVIDENCE VALIDATION");
  console.log("==========================================");
  console.log("");

  let currentCategory =
    "";

  for (
    const check of
    checks
  ) {
    if (
      check.category !==
      currentCategory
    ) {
      currentCategory =
        check.category;

      console.log(
        currentCategory,
      );

      console.log(
        "------------------------------------------",
      );
    }

    console.log(
      `${check.passed ? "PASS" : "FAIL"}  ${check.name}`,
    );

    console.log(
      `      ${check.detail}`,
    );
  }

  const passed =
    checks.filter(
      (check) =>
        check.passed,
    ).length;

  const failed =
    checks.length -
    passed;

  console.log("");
  console.log("==========================================");
  console.log("CORPUS SUMMARY");
  console.log("==========================================");
  console.log(
    `Artifacts: ${summary.discoveredArtifacts} / ${summary.expectedArtifacts}`,
  );
  console.log(
    `Total size: ${summary.totalBytes.toLocaleString()} bytes`,
  );

  for (
    const [
      format,
      count,
    ] of
    Object.entries(
      summary.formats,
    )
  ) {
    console.log(
      `${format}: ${count}`,
    );
  }

  console.log(
    `Functions represented: ${summary.functions.size}`,
  );

  console.log(
    `Owners represented: ${summary.owners.size}`,
  );

  console.log(
    `Contradiction links: ${summary.contradictionLinks}`,
  );

  console.log(
    `Ground-truth statements: ${summary.groundTruthStatements.size}`,
  );

  console.log(
    `Misleading narratives: ${summary.misleadingNarratives.size}`,
  );

  console.log(
    `Expected cognitive effects: ${summary.cognitiveEffects.size}`,
  );

  console.log("");
  console.log(
    `Passed: ${passed}`,
  );

  console.log(
    `Failed: ${failed}`,
  );

  console.log("");

  if (
    failed ===
    0
  ) {
    console.log(
      "READY FOR INGESTION",
    );
  } else {
    console.log(
      "NOT READY FOR INGESTION",
    );

    process.exitCode =
      1;
  }

  console.log("");
}

function run(): void {
  const checks:
    Check[] = [];

  pushCheck(
    checks,
    "Manifest structure",
    "Manifest artifact count is accurate",
    northstarEvidenceManifest
      .artifacts
      .length ===
      northstarEvidenceManifest
        .artifactCount,
    `${northstarEvidenceManifest.artifacts.length} / ${northstarEvidenceManifest.artifactCount}`,
  );

  validateManifestMetadata(
    checks,
  );

  validateManifestReferences(
    checks,
  );

  const summary =
    validateCorpus(
      checks,
    );

  validateCoverage(
    checks,
    summary,
  );

  printSummary(
    checks,
    summary,
  );
}

run();
