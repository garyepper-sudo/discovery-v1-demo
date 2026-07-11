import fs from "fs";
import path from "path";

type ArchitectureLayer =
  | "Engine"
  | "Runtime"
  | "Executive"
  | "Projection"
  | "UI"
  | "API"
  | "Simulation"
  | "Benchmark"
  | "Other";

type MatchKind =
  | "definition"
  | "assignment"
  | "read"
  | "import"
  | "type"
  | "unknown";

type CapabilityMatch = {
  filePath: string;
  relativePath: string;
  lineNumber: number;
  line: string;
  matchedTerm: string;
  layer: ArchitectureLayer;
  kind: MatchKind;
};

type CapabilityAudit = {
  capability: string;
  searchTerms: string[];
  generatedAt: string;
  matches: CapabilityMatch[];
};

const PROJECT_ROOT = process.cwd();

const SEARCH_ROOTS = [
  "engine",
  "components",
  "app",
  "scripts",
].map((directory) => path.join(PROJECT_ROOT, directory));

const EXCLUDED_DIRECTORY_NAMES = new Set([
  ".discovery-runtime",
  ".git",
  ".next",
  "node_modules",
  "archive",
  "coverage",
  "dist",
  "build",
]);

const SUPPORTED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
]);

function normalizeCapability(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

function toCamelCase(value: string): string {
  const words = value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "";
  }

  return [
    words[0].toLowerCase(),
    ...words.slice(1).map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase(),
    ),
  ].join("");
}

function toPascalCase(value: string): string {
  const camelCase = toCamelCase(value);

  if (!camelCase) {
    return "";
  }

  return (
    camelCase.charAt(0).toUpperCase() +
    camelCase.slice(1)
  );
}

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function buildSearchTerms(capability: string): string[] {
  const terms = new Set<string>();

  const trimmed = normalizeCapability(capability);
  const camelCase = toCamelCase(trimmed);
  const pascalCase = toPascalCase(trimmed);
  const kebabCase = toKebabCase(trimmed);
  const lowercasePhrase = trimmed.toLowerCase();

  [
    trimmed,
    camelCase,
    pascalCase,
    kebabCase,
    lowercasePhrase,
  ]
    .filter(Boolean)
    .forEach((term) => terms.add(term));

  return [...terms];
}

function shouldExcludeDirectory(directoryPath: string): boolean {
  const name = path.basename(directoryPath);

  return EXCLUDED_DIRECTORY_NAMES.has(name);
}

function walk(directoryPath: string): string[] {
  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  const entries = fs.readdirSync(directoryPath, {
    withFileTypes: true,
  });

  return entries.flatMap((entry) => {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      if (shouldExcludeDirectory(fullPath)) {
        return [];
      }

      return walk(fullPath);
    }

    if (!entry.isFile()) {
      return [];
    }

    const extension = path.extname(entry.name);

    return SUPPORTED_EXTENSIONS.has(extension)
      ? [fullPath]
      : [];
  });
}

function inferLayer(relativePath: string): ArchitectureLayer {
  const normalized = relativePath.replace(/\\/g, "/");

  if (normalized.includes("/benchmark/")) {
    return "Benchmark";
  }

  if (
    normalized.includes("/simulation/") ||
    normalized.includes("/simulations/")
  ) {
    return "Simulation";
  }

  if (
    normalized.startsWith("app/api/") ||
    normalized.includes("/api/")
  ) {
    return "API";
  }

  if (
    normalized.includes("/projection/") ||
    normalized.toLowerCase().includes("projection")
  ) {
    return "Projection";
  }

  if (
    normalized.includes("/executive/") ||
    normalized.includes("/expression/")
  ) {
    return "Executive";
  }

  if (
    normalized.includes("/runtime/") ||
    normalized.toLowerCase().includes("runtime")
  ) {
    return "Runtime";
  }

  if (
    normalized.startsWith("components/") ||
    normalized.endsWith(".tsx") ||
    normalized.startsWith("app/")
  ) {
    return "UI";
  }

  if (normalized.startsWith("engine/")) {
    return "Engine";
  }

  return "Other";
}

function inferMatchKind(
  line: string,
  matchedTerm: string,
): MatchKind {
  const trimmed = line.trim();

  if (
    trimmed.startsWith("import ") ||
    trimmed.includes(" from ")
  ) {
    return "import";
  }

  if (
    trimmed.startsWith("type ") ||
    trimmed.startsWith("interface ") ||
    trimmed.includes(`${matchedTerm}: string`) ||
    trimmed.includes(`${matchedTerm}?:`) ||
    trimmed.includes(`${matchedTerm}:`)
  ) {
    return "type";
  }

  if (
    trimmed.includes(`function ${matchedTerm}`) ||
    trimmed.includes(`const ${matchedTerm}`) ||
    trimmed.includes(`let ${matchedTerm}`) ||
    trimmed.includes(`class ${matchedTerm}`)
  ) {
    return "definition";
  }

  if (
    trimmed.includes(`${matchedTerm}:`) ||
    trimmed.includes(`${matchedTerm} =`)
  ) {
    return "assignment";
  }

  if (
    trimmed.includes(`.${matchedTerm}`) ||
    trimmed.includes(`[${JSON.stringify(matchedTerm)}]`)
  ) {
    return "read";
  }

  return "unknown";
}

function findMatches(params: {
  filePath: string;
  searchTerms: string[];
}): CapabilityMatch[] {
  const { filePath, searchTerms } = params;

  let contents: string;

  try {
    contents = fs.readFileSync(filePath, "utf8");
  } catch {
    return [];
  }

  const relativePath = path.relative(
    PROJECT_ROOT,
    filePath,
  );

  const lines = contents.split(/\r?\n/);
  const matches: CapabilityMatch[] = [];

  lines.forEach((line, index) => {
    for (const term of searchTerms) {
      if (!term || !line.toLowerCase().includes(term.toLowerCase())) {
        continue;
      }

      matches.push({
        filePath,
        relativePath,
        lineNumber: index + 1,
        line: line.trim(),
        matchedTerm: term,
        layer: inferLayer(relativePath),
        kind: inferMatchKind(line, term),
      });

      break;
    }
  });

  return matches;
}

function groupByLayer(
  matches: CapabilityMatch[],
): Map<ArchitectureLayer, CapabilityMatch[]> {
  const grouped = new Map<
    ArchitectureLayer,
    CapabilityMatch[]
  >();

  for (const match of matches) {
    const existing = grouped.get(match.layer) ?? [];
    existing.push(match);
    grouped.set(match.layer, existing);
  }

  return grouped;
}

function markdownStatus(
  matches: CapabilityMatch[] | undefined,
): string {
  return matches && matches.length > 0 ? "✅ Found" : "❌ Not found";
}

function escapeMarkdown(value: string): string {
  return value.replace(/\|/g, "\\|");
}

function createMarkdownReport(
  audit: CapabilityAudit,
): string {
  const grouped = groupByLayer(audit.matches);

  const orderedLayers: ArchitectureLayer[] = [
    "Engine",
    "Runtime",
    "Executive",
    "Projection",
    "UI",
    "API",
    "Simulation",
    "Benchmark",
    "Other",
  ];

  const lines: string[] = [
    `# Capability Trace — ${audit.capability}`,
    "",
    `Generated: ${audit.generatedAt}`,
    "",
    "## Search Terms",
    "",
    ...audit.searchTerms.map((term) => `- \`${term}\``),
    "",
    "## Pipeline Summary",
    "",
    "| Layer | Status | Matches |",
    "|---|:---:|---:|",
    ...orderedLayers.map((layer) => {
      const layerMatches = grouped.get(layer);

      return `| ${layer} | ${markdownStatus(
        layerMatches,
      )} | ${layerMatches?.length ?? 0} |`;
    }),
    "",
    "## Detailed Matches",
    "",
  ];

  for (const layer of orderedLayers) {
    const layerMatches = grouped.get(layer) ?? [];

    if (layerMatches.length === 0) {
      continue;
    }

    lines.push(`### ${layer}`, "");

    const matchesByFile = new Map<
      string,
      CapabilityMatch[]
    >();

    for (const match of layerMatches) {
      const existing =
        matchesByFile.get(match.relativePath) ?? [];

      existing.push(match);
      matchesByFile.set(match.relativePath, existing);
    }

    for (const [relativePath, fileMatches] of matchesByFile) {
      lines.push(`#### \`${relativePath}\``, "");

      for (const match of fileMatches) {
        lines.push(
          `- Line ${match.lineNumber} · **${match.kind}** · matched \`${match.matchedTerm}\``,
        );
        lines.push(
          `  - \`${escapeMarkdown(match.line)}\``,
        );
      }

      lines.push("");
    }
  }

  lines.push(
    "## Interpretation",
    "",
    "This report is a structural search, not proof of full product integration.",
    "",
    "A capability should be marked connected only after verifying:",
    "",
    "1. where it is created,",
    "2. where it is persisted,",
    "3. where it is projected,",
    "4. where it is displayed,",
    "5. and whether the active product path actually uses it.",
    "",
  );

  return lines.join("\n");
}

function safeFileName(value: string): string {
  return toKebabCase(value) || "capability";
}

function runCapabilityAudit(): void {
  const capability = normalizeCapability(
    process.argv.slice(2).join(" "),
  );

  if (!capability) {
    console.error(
      'Usage: npm run audit:capability -- "Executive Summary"',
    );
    process.exitCode = 1;
    return;
  }

  const searchTerms = buildSearchTerms(capability);

  const files = SEARCH_ROOTS.flatMap((root) =>
    walk(root),
  );

  const matches = files.flatMap((filePath) =>
    findMatches({
      filePath,
      searchTerms,
    }),
  );

  const audit: CapabilityAudit = {
    capability,
    searchTerms,
    generatedAt: new Date().toISOString(),
    matches,
  };

  const report = createMarkdownReport(audit);

  const reportDirectory = path.join(
    PROJECT_ROOT,
    "docs",
    "Sprint Updates",
    "Capability Traces",
  );

  fs.mkdirSync(reportDirectory, {
    recursive: true,
  });

  const reportPath = path.join(
    reportDirectory,
    `${safeFileName(capability)}.md`,
  );

  fs.writeFileSync(reportPath, report, "utf8");

  console.log(report);
  console.log("");
  console.log("=========================================");
  console.log(`Saved report: ${path.relative(PROJECT_ROOT, reportPath)}`);
  console.log("=========================================");
}

runCapabilityAudit();