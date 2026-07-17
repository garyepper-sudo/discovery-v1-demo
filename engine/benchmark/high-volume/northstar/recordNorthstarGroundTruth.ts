import {
  mkdirSync,
  writeFileSync,
} from "node:fs";

import {
  join,
} from "node:path";

import {
  scoreNorthstarGroundTruth,
} from "./scoreNorthstarGroundTruth";

const RESULTS_DIRECTORY =
  join(
    process.cwd(),
    "engine",
    "benchmark",
    "high-volume",
    "northstar",
    "results",
    "ground-truth",
  );

function safeTimestamp(
  isoTimestamp:
    string,
): string {
  return isoTimestamp
    .replace(
      /:/g,
      "-",
    )
    .replace(
      /\./g,
      "-",
    );
}

function formatPercent(
  value:
    number | null,
): string {
  if (
    value ===
    null
  ) {
    return "Unavailable";
  }

  return `${(
    value *
    100
  ).toFixed(
    1,
  )}%`;
}

function buildMarkdown(
  score:
    ReturnType<
      typeof scoreNorthstarGroundTruth
    >,
): string {
  const dimensionRows =
    score.dimensions
      .map(
        (dimension) =>
          `| ${dimension.label} | ${dimension.score} | ${dimension.weight} | ${dimension.passed ? "Pass" : "Partial"} |`,
      )
      .join(
        "\n",
      );

  const triggeredFalsePositives =
    score.falsePositives
      .filter(
        (result) =>
          result.triggered,
      );

  const falsePositiveSummary =
    triggeredFalsePositives.length ===
      0
      ? "None"
      : triggeredFalsePositives
          .map(
            (result) =>
              `- ${result.label}: -${result.penalty}`,
          )
          .join(
            "\n",
          );

  return `# Northstar Ground-Truth Baseline

**Organization:** ${score.organizationId}  
**Recorded at:** ${score.scoredAt}  
**Final score:** ${score.finalScore} / 100  
**Dimension score:** ${score.dimensionScore} / 100  
**False-positive penalty:** -${score.falsePositivePenalty}  
**Calibration penalty:** -${score.calibrationPenalty}  
**Executive confidence:** ${formatPercent(score.executiveConfidence)}

## Evaluation

| Dimension | Score | Available | Result |
|---|---:|---:|---|
${dimensionRows}

## False Positives

${falsePositiveSummary}

## Conclusion

${score.conclusion}

## Interpretation

This file records the latest canonical Northstar ground-truth result.

Historical machine-readable results are stored beside this file as timestamped JSON records.

The scoring rubric should remain stable unless an explicit benchmark-version change is approved.
`;
}

function recordNorthstarGroundTruth():
  void {
  const score =
    scoreNorthstarGroundTruth();

  mkdirSync(
    RESULTS_DIRECTORY,
    {
      recursive:
        true,
    },
  );

  const timestamp =
    safeTimestamp(
      score.scoredAt,
    );

  const historicalJsonPath =
    join(
      RESULTS_DIRECTORY,
      `${timestamp}.json`,
    );

  const latestJsonPath =
    join(
      RESULTS_DIRECTORY,
      "LATEST.json",
    );

  const latestMarkdownPath =
    join(
      RESULTS_DIRECTORY,
      "LATEST.md",
    );

  const serializedScore =
    `${JSON.stringify(
      score,
      null,
      2,
    )}\n`;

  writeFileSync(
    historicalJsonPath,
    serializedScore,
    "utf8",
  );

  writeFileSync(
    latestJsonPath,
    serializedScore,
    "utf8",
  );

  writeFileSync(
    latestMarkdownPath,
    buildMarkdown(
      score,
    ),
    "utf8",
  );

  console.log("");
  console.log("==========================================");
  console.log("NORTHSTAR SCORE RECORDED");
  console.log("==========================================");
  console.log("");

  console.log(
    `Historical record: ${historicalJsonPath}`,
  );

  console.log(
    `Latest JSON: ${latestJsonPath}`,
  );

  console.log(
    `Latest report: ${latestMarkdownPath}`,
  );

  console.log("");
}

recordNorthstarGroundTruth();
