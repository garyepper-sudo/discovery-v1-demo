import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "engine", "v3");

const SEARCH_TERMS = [
  "executiveUnderstanding",
  "executiveAssessment",
  "dominantTheory",
  "currentUnderstanding",
  "consolidateUnderstanding",
  "executiveNarrative",
  "explanatoryPower",
  "primaryTheory",
  "leadingTheory",
  "rank",
  "synthesize",
];

function walk(directory: string): string[] {
  const entries = fs.readdirSync(directory, {
    withFileTypes: true,
  });

  return entries.flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walk(fullPath);
    }

    if (
      entry.isFile() &&
      (entry.name.endsWith(".ts") ||
        entry.name.endsWith(".tsx"))
    ) {
      return [fullPath];
    }

    return [];
  });
}

function relativePath(filePath: string): string {
  return path.relative(process.cwd(), filePath);
}

function findMatches(
  filePath: string,
  contents: string,
): void {
  const lines = contents.split("\n");

  const matches = lines.flatMap((line, index) => {
    const matchedTerms = SEARCH_TERMS.filter((term) =>
      line.includes(term),
    );

    if (matchedTerms.length === 0) {
      return [];
    }

    return [
      {
        lineNumber: index + 1,
        line: line.trim(),
        terms: matchedTerms,
      },
    ];
  });

  if (matches.length === 0) {
    return;
  }

  console.log("");
  console.log(relativePath(filePath));
  console.log("-".repeat(relativePath(filePath).length));

  matches.forEach((match) => {
    console.log(
      `${match.lineNumber}: [${match.terms.join(", ")}] ${match.line}`,
    );
  });
}

function runAudit(): void {
  if (!fs.existsSync(ROOT)) {
    throw new Error(`Could not find engine root: ${ROOT}`);
  }

  console.log("=========================================");
  console.log("DISCOVERY UNDERSTANDING LAYER AUDIT");
  console.log("=========================================");

  const files = walk(ROOT);

  files.forEach((filePath) => {
    const contents = fs.readFileSync(filePath, "utf8");
    findMatches(filePath, contents);
  });

  console.log("");
  console.log("=========================================");
  console.log("AUDIT COMPLETE");
  console.log("=========================================");
}

runAudit();