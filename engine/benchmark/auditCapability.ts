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

type RegistryFileEntry = {
  id?: string;
  path?: string;
  architecturalLayer?: string | null;
  cognitiveDomain?: string | null;
  exports?: string[];
  imports?: string[];
  consumes?: string[];
  produces?: string[];
  consumedBy?: string[];
  canonicalProducer?: boolean;
  runtimeDestination?: string | null;
  executiveDestination?: string | null;
  atlasCoverage?: string | null;
  reviewStatus?: string | null;
  orphanRisk?: string | boolean | null;
};

type CapabilityRegistryEntry = {
  id?: string;
  name?: string;
  capabilityName?: string;
  displayName?: string;
  aliases?: string[];
  searchTerms?: string[];

  description?: string;
  status?: string;
  domain?: string;
  cognitiveDomain?: string;
  architecturalLayer?: string;

  canonicalProducer?: string | null;
  canonicalProducerExists?: boolean;

  implementationFiles?: string[];
  resolvedFiles?: Array<{
    path?: string;
    existsInFileRegistry?: boolean;
    fileId?: string | null;
    architecturalLayer?: string | null;
    cognitiveDomain?: string | null;
    exports?: string[];
    imports?: string[];
  }>;

  missingImplementationFiles?: string[];

  dependencies?: string[];
  consumers?: string[];
  consumedBy?: string[];

  produces?: string[];
  consumes?: string[];

  runtimeDestination?: string | null;
  executiveDestination?: string | null;
  projectionDestination?: string | null;
  uiDestination?: string | null;

  atlasCoverage?: string | null;
  simulationCoverage?: string | null;
  benchmarkCoverage?: string | null;

  [key: string]: unknown;
};

type CapabilityAudit = {
  capability: string;
  searchTerms: string[];
  generatedAt: string;
  matches: CapabilityMatch[];

  registryCapability: CapabilityRegistryEntry | null;
  fileRegistryEntries: RegistryFileEntry[];
};

type VerificationCheck = {
  label: string;
  status: "pass" | "warning" | "fail" | "unknown";
  detail: string;
};

const PROJECT_ROOT = process.cwd();

const CAPABILITY_REGISTRY_PATH = path.join(
  PROJECT_ROOT,
  "docs",
  "Architecture",
  "COGNITIVE_CAPABILITY_REGISTRY.json",
);

const FILE_REGISTRY_PATH = path.join(
  PROJECT_ROOT,
  "docs",
  "Architecture",
  "COGNITIVE_FILE_REGISTRY.json",
);

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

function normalizePath(value: string): string {
  return value.replaceAll("\\", "/").replace(/^\.\//, "");
}

function normalizeComparable(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
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

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort();
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
}

function buildSearchTerms(
  capability: string,
  registryCapability?: CapabilityRegistryEntry | null,
): string[] {
  const terms = new Set<string>();

  const addVariants = (value: string | undefined): void => {
    if (!value) {
      return;
    }

    const trimmed = normalizeCapability(value);

    [
      trimmed,
      toCamelCase(trimmed),
      toPascalCase(trimmed),
      toKebabCase(trimmed),
      trimmed.toLowerCase(),
    ]
      .filter(Boolean)
      .forEach((term) => terms.add(term));
  };

  addVariants(capability);
  addVariants(registryCapability?.id);
  addVariants(registryCapability?.name);
  addVariants(registryCapability?.capabilityName);
  addVariants(registryCapability?.displayName);

  for (const alias of registryCapability?.aliases ?? []) {
    addVariants(alias);
  }

  for (const searchTerm of registryCapability?.searchTerms ?? []) {
    addVariants(searchTerm);
  }

  for (const producedObject of registryCapability?.produces ?? []) {
  addVariants(producedObject);
}

for (const implementationFile of
  registryCapability?.implementationFiles ?? []) {
  const filename = path
    .basename(implementationFile)
    .replace(/\.[^.]+$/, "");

  addVariants(filename);
}

if (registryCapability?.canonicalProducer) {
  const canonicalProducerName = path
    .basename(registryCapability.canonicalProducer)
    .replace(/\.[^.]+$/, "");

  addVariants(canonicalProducerName);
}

const runtimeDestination =
  registryCapability?.runtimeDestination;

if (runtimeDestination) {
  const runtimeProperty =
    runtimeDestination.split(".").at(-1);

  addVariants(runtimeProperty);
}

return [...terms];

  return [...terms];
}

function loadJsonFile<T>(
  filePath: string,
  label: string,
): T | null {
  if (!fs.existsSync(filePath)) {
    console.warn(`${label} not found: ${filePath}`);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch (error) {
    console.warn(
      `Could not parse ${label}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );

    return null;
  }
}

function capabilityEntriesFromRegistry(
  registry: unknown,
): CapabilityRegistryEntry[] {
  if (!registry || typeof registry !== "object") {
    return [];
  }

  const record = registry as Record<string, unknown>;

  if (Array.isArray(record.capabilities)) {
    return record.capabilities as CapabilityRegistryEntry[];
  }

  if (Array.isArray(record.entries)) {
    return record.entries as CapabilityRegistryEntry[];
  }

  return [];
}

function fileEntriesFromRegistry(
  registry: unknown,
): RegistryFileEntry[] {
  if (!registry || typeof registry !== "object") {
    return [];
  }

  const record = registry as Record<string, unknown>;

  if (Array.isArray(record.entries)) {
    return record.entries as RegistryFileEntry[];
  }

  if (Array.isArray(record.files)) {
    return record.files as RegistryFileEntry[];
  }

  return [];
}

function capabilityIdentityValues(
  capability: CapabilityRegistryEntry,
): string[] {
  return unique([
    capability.id ?? "",
    capability.name ?? "",
    capability.capabilityName ?? "",
    capability.displayName ?? "",
    ...(capability.aliases ?? []),
    ...(capability.searchTerms ?? []),
  ]).map(normalizeComparable);
}

function findRegistryCapability(
  requestedCapability: string,
  capabilities: CapabilityRegistryEntry[],
): CapabilityRegistryEntry | null {
  const requested = normalizeComparable(requestedCapability);
  const requestedKebab = toKebabCase(requestedCapability);

  const exactMatch = capabilities.find((capability) => {
    const identities = capabilityIdentityValues(capability);

    return (
      identities.includes(requested) ||
      toKebabCase(capability.id ?? "") === requestedKebab ||
      toKebabCase(capability.name ?? "") === requestedKebab ||
      toKebabCase(capability.capabilityName ?? "") === requestedKebab
    );
  });

  if (exactMatch) {
    return exactMatch;
  }

  const partialMatches = capabilities.filter((capability) =>
    capabilityIdentityValues(capability).some(
      (identity) =>
        identity.includes(requested) ||
        requested.includes(identity),
    ),
  );

  return partialMatches.length === 1
    ? partialMatches[0]
    : null;
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
  const normalized = normalizePath(relativePath);
  const lower = normalized.toLowerCase();

  if (lower.includes("/benchmark/")) {
    return "Benchmark";
  }

  if (
    lower.includes("/simulation/") ||
    lower.includes("/simulations/") ||
    lower.includes("simulation")
  ) {
    return "Simulation";
  }

  if (
    lower.startsWith("app/api/") ||
    lower.includes("/api/")
  ) {
    return "API";
  }

  if (
    lower.includes("/projection/") ||
    lower.includes("projection")
  ) {
    return "Projection";
  }

  if (
    lower.includes("/executive/") ||
    lower.includes("/expression/")
  ) {
    return "Executive";
  }

  if (
    lower.includes("/runtime/") ||
    lower.includes("runtime")
  ) {
    return "Runtime";
  }

  if (
    lower.startsWith("components/") ||
    lower.endsWith(".tsx") ||
    lower.startsWith("app/")
  ) {
    return "UI";
  }

  if (lower.startsWith("engine/")) {
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

  const relativePath = normalizePath(
    path.relative(PROJECT_ROOT, filePath),
  );

  const lines = contents.split(/\r?\n/);
  const matches: CapabilityMatch[] = [];

  lines.forEach((line, index) => {
    for (const term of searchTerms) {
      if (
        !term ||
        !line.toLowerCase().includes(term.toLowerCase())
      ) {
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
  return matches && matches.length > 0
    ? "✅ Found"
    : "❌ Not found";
}

function escapeMarkdown(value: string): string {
  return value
    .replace(/\|/g, "\\|")
    .replace(/`/g, "\\`");
}

function displayValue(
  value: string | null | undefined,
): string {
  return value && value.trim().length > 0
    ? `\`${normalizePath(value)}\``
    : "Not declared";
}

function fileExistsInProject(relativePath: string): boolean {
  return fs.existsSync(
    path.resolve(PROJECT_ROOT, normalizePath(relativePath)),
  );
}

function registryFileByPath(
  entries: RegistryFileEntry[],
): Map<string, RegistryFileEntry> {
  return new Map(
    entries
      .filter(
        (entry): entry is RegistryFileEntry & { path: string } =>
          typeof entry.path === "string",
      )
      .map((entry) => [
        normalizePath(entry.path),
        entry,
      ]),
  );
}

function implementationFilesForCapability(
  capability: CapabilityRegistryEntry | null,
): string[] {
  if (!capability) {
    return [];
  }

  const resolvedPaths =
    capability.resolvedFiles
      ?.map((file) => file.path)
      .filter(
        (value): value is string =>
          typeof value === "string",
      ) ?? [];

  return unique([
    ...(capability.implementationFiles ?? []),
    ...resolvedPaths,
  ]).map(normalizePath);
}

function dependencyValues(
  capability: CapabilityRegistryEntry,
): string[] {
  return unique([
  ...(capability.dependencies ?? []),
  ...asStringArray(capability.consumesCapabilities),
  ...asStringArray(capability.dependsOn),
  ...asStringArray(capability.requiredCapabilities),
]);
}

function consumerValues(
  capability: CapabilityRegistryEntry,
): string[] {
  return unique([
  ...(capability.consumers ?? []),
  ...(capability.consumedBy ?? []),
  ...asStringArray(capability.consumedByCapabilities),
  ...asStringArray(capability.downstreamConsumers),
]);
}

function producedValues(
  capability: CapabilityRegistryEntry,
): string[] {
  return unique([
  ...(capability.produces ?? []),
  ...asStringArray(capability.producesObjects),
  ...asStringArray(capability.outputObjects),
  ...asStringArray(capability.cognitiveObjects),
]);
}

function consumedValues(
  capability: CapabilityRegistryEntry,
): string[] {
  return unique([
    ...(capability.consumes ?? []),
    ...asStringArray(capability.inputObjects),
  ]);
}

function runtimeDestinationValue(
  capability: CapabilityRegistryEntry,
): string | null {
  const value =
    capability.runtimeDestination ??
    capability.runtimePath ??
    capability.persistenceDestination;

  return typeof value === "string"
    ? value
    : null;
}

function executiveDestinationValue(
  capability: CapabilityRegistryEntry,
): string | null {
  const values = unique([
    ...asStringArray(capability.executiveDestinations),
    ...asStringArray(capability.projectionDestinations),
    ...asStringArray(capability.uiDestinations),
    capability.executiveDestination ?? "",
    capability.projectionDestination ?? "",
    capability.uiDestination ?? "",
  ]);

  return values.length > 0
    ? values.join(", ")
    : null;
}

function atlasCoverageValue(
  capability: CapabilityRegistryEntry,
): string | null {
  const atlasCoverage =
    typeof capability.atlasCoverage === "string"
      ? capability.atlasCoverage
      : null;

  const simulationCoverage =
    typeof capability.simulationCoverage === "string"
      ? capability.simulationCoverage
      : null;

  const benchmarkCoverage = asStringArray(
    capability.benchmarkCoverage,
  );

  if (atlasCoverage) {
    return atlasCoverage;
  }

  if (simulationCoverage) {
    return simulationCoverage;
  }

  return benchmarkCoverage.length > 0
    ? benchmarkCoverage.join(", ")
    : null;
}

function createVerificationChecks(
  audit: CapabilityAudit,
): VerificationCheck[] {
  const capability = audit.registryCapability;

  if (!capability) {
    return [
      {
        label: "Capability registry entry",
        status: "fail",
        detail:
          "No matching capability was found in COGNITIVE_CAPABILITY_REGISTRY.json.",
      },
    ];
  }

  const implementationFiles =
    implementationFilesForCapability(capability);

  const canonicalProducer =
    capability.canonicalProducer
      ? normalizePath(capability.canonicalProducer)
      : null;

  const runtimeDestination =
    runtimeDestinationValue(capability);

  const executiveDestination =
    executiveDestinationValue(capability);

  const consumers = consumerValues(capability);

  const atlasCoverage =
    atlasCoverageValue(capability);

  const matchedPaths = new Set(
    audit.matches.map((match) =>
      normalizePath(match.relativePath),
    ),
  );

  const missingImplementationFiles =
    implementationFiles.filter(
      (filePath) => !fileExistsInProject(filePath),
    );

  const unobservedImplementationFiles =
    implementationFiles.filter(
      (filePath) => !matchedPaths.has(filePath),
    );

  const checks: VerificationCheck[] = [
    {
      label: "Capability registry entry",
      status: "pass",
      detail: capability.id
        ? `Matched capability ID: ${capability.id}`
        : "Matched by capability name.",
    },
    {
      label: "Canonical producer declared",
      status: canonicalProducer ? "pass" : "fail",
      detail:
        canonicalProducer ??
        "No canonical producer is declared.",
    },
    {
      label: "Canonical producer exists",
      status: canonicalProducer
        ? fileExistsInProject(canonicalProducer)
          ? "pass"
          : "fail"
        : "unknown",
      detail: canonicalProducer
        ? fileExistsInProject(canonicalProducer)
          ? canonicalProducer
          : `Missing file: ${canonicalProducer}`
        : "Cannot verify without a declared producer.",
    },
    {
      label: "Implementation files",
      status:
        implementationFiles.length === 0
          ? "fail"
          : missingImplementationFiles.length > 0
            ? "fail"
            : "pass",
      detail:
        implementationFiles.length === 0
          ? "No implementation files are declared."
          : missingImplementationFiles.length > 0
            ? `Missing: ${missingImplementationFiles.join(", ")}`
            : `${implementationFiles.length} declared file(s) exist.`,
    },
    {
      label: "Runtime destination",
      status: runtimeDestination ? "pass" : "fail",
      detail:
        runtimeDestination ??
        "No Runtime destination is declared.",
    },
    {
      label: "Executive destination",
      status: executiveDestination
        ? "pass"
        : "warning",
      detail:
        executiveDestination ??
        "No Executive, Projection, or UI destination is declared.",
    },
    {
  label: "Consumers",
  status:
    consumers.length > 0
      ? "pass"
      : capability.terminalCapability
        ? "pass"
        : "fail",
  detail:
    consumers.length > 0
      ? `${consumers.length} declared consumer(s).`
      : capability.terminalCapability
        ? "Terminal capability (no downstream cognitive capability expected)."
        : "No downstream consumers are declared.",
},
    {
      label: "Atlas coverage",
      status:
        atlasCoverage &&
        !["unknown", "none", "not covered"].includes(
          atlasCoverage.toLowerCase(),
        )
          ? "pass"
          : "warning",
      detail:
        atlasCoverage ??
        "Atlas coverage is not declared.",
    },
    {
      label: "Structural implementation coverage",
      status:
        implementationFiles.length === 0
          ? "unknown"
          : unobservedImplementationFiles.length === 0
            ? "pass"
            : "warning",
      detail:
        implementationFiles.length === 0
          ? "No implementation files are available to compare."
          : unobservedImplementationFiles.length === 0
            ? "All declared implementation files appeared in the structural trace."
            : `Declared files without a capability-name match: ${unobservedImplementationFiles.join(
                ", ",
              )}`,
    },
  ];

  return checks;
}

function statusIcon(
  status: VerificationCheck["status"],
): string {
  switch (status) {
    case "pass":
      return "✅";
    case "warning":
      return "⚠️";
    case "fail":
      return "❌";
    default:
      return "➖";
  }
}

function determineConnectionStatus(
  checks: VerificationCheck[],
): string {
  if (
    checks.some(
      (check) =>
        check.status === "fail" &&
        [
          "Capability registry entry",
          "Canonical producer declared",
          "Canonical producer exists",
          "Implementation files",
          "Runtime destination",
          "Consumers",
        ].includes(check.label),
    )
  ) {
    return "❌ Incomplete";
  }

  if (checks.some((check) => check.status === "warning")) {
    return "⚠️ Connected with review required";
  }

  return "✅ Connected";
}

function appendStringList(
  lines: string[],
  title: string,
  values: string[],
): void {
  lines.push(`### ${title}`, "");

  if (values.length === 0) {
    lines.push("None declared.", "");
    return;
  }

  for (const value of values) {
    lines.push(`- \`${normalizePath(value)}\``);
  }

  lines.push("");
}

function createVerifiedArchitectureSection(
  audit: CapabilityAudit,
): string[] {
  const capability = audit.registryCapability;

  if (!capability) {
    return [
      "## Verified Architecture",
      "",
      "❌ No matching entry was found in `COGNITIVE_CAPABILITY_REGISTRY.json`.",
      "",
      "The structural search remains available below, but architectural connectivity cannot be verified until this capability is registered.",
      "",
    ];
  }

  const checks = createVerificationChecks(audit);
  const connectionStatus =
    determineConnectionStatus(checks);

  const implementationFiles =
    implementationFilesForCapability(capability);

  const canonicalProducer =
    capability.canonicalProducer
      ? normalizePath(capability.canonicalProducer)
      : null;

  const dependencies =
    dependencyValues(capability);

  const consumers =
    consumerValues(capability);

  const produces =
    producedValues(capability);

  const consumes =
    consumedValues(capability);

  const runtimeDestination =
    runtimeDestinationValue(capability);

  const executiveDestination =
    executiveDestinationValue(capability);

  const atlasCoverage =
    atlasCoverageValue(capability);

  const lines: string[] = [
    "## Verified Architecture",
    "",
    `**Connection status:** ${connectionStatus}`,
    "",
    "| Property | Value |",
    "|---|---|",
    `| Capability ID | ${
      capability.id
        ? `\`${capability.id}\``
        : "Not declared"
    } |`,
    `| Capability name | ${
      capability.name ??
      capability.capabilityName ??
      capability.displayName ??
      audit.capability
    } |`,
    `| Cognitive domain | ${
      capability.cognitiveDomain ??
      capability.domain ??
      "Not declared"
    } |`,
    `| Architectural layer | ${
      capability.architecturalLayer ??
      "Not declared"
    } |`,
    `| Canonical producer | ${displayValue(
      canonicalProducer,
    )} |`,
    `| Runtime destination | ${displayValue(
      runtimeDestination,
    )} |`,
    `| Executive destination | ${displayValue(
      executiveDestination,
    )} |`,
    `| Atlas coverage | ${
      atlasCoverage ?? "Not declared"
    } |`,
    `| Registry status | ${
      capability.status ?? "Not declared"
    } |`,
    "",
  ];

  appendStringList(
    lines,
    "Produced Cognitive Objects",
    produces,
  );

  appendStringList(
    lines,
    "Consumed Cognitive Objects",
    consumes,
  );

  appendStringList(
    lines,
    "Implementation Files",
    implementationFiles,
  );

  appendStringList(
    lines,
    "Capability Dependencies",
    dependencies,
  );

  appendStringList(
    lines,
    "Declared Consumers",
    consumers,
  );

  lines.push(
    "## Architecture Verification",
    "",
    "| Check | Status | Detail |",
    "|---|:---:|---|",
    ...checks.map(
      (check) =>
        `| ${check.label} | ${statusIcon(
          check.status,
        )} | ${escapeMarkdown(check.detail)} |`,
    ),
    "",
  );

  return lines;
}

function createArchitectureDriftSection(
  audit: CapabilityAudit,
): string[] {
  const capability = audit.registryCapability;

  if (!capability) {
    return [];
  }

  const implementationFiles =
    implementationFilesForCapability(capability);

  const declaredFileSet = new Set(
    implementationFiles.map(normalizePath),
  );

  const matchedFileSet = new Set(
    audit.matches.map((match) =>
      normalizePath(match.relativePath),
    ),
  );

  const declaredButUnmatched =
    implementationFiles.filter(
      (filePath) =>
        !matchedFileSet.has(normalizePath(filePath)),
    );

  const matchedButUndeclared = unique(
    [...matchedFileSet].filter(
      (filePath) =>
        !declaredFileSet.has(filePath),
    ),
  );

  const missingFiles =
    implementationFiles.filter(
      (filePath) => !fileExistsInProject(filePath),
    );

  const lines: string[] = [
    "## Architecture Drift",
    "",
  ];

  if (
    declaredButUnmatched.length === 0 &&
    matchedButUndeclared.length === 0 &&
    missingFiles.length === 0
  ) {
    lines.push(
      "✅ No structural drift was detected between the declared implementation files and the capability trace.",
      "",
    );

    return lines;
  }

  if (missingFiles.length > 0) {
    lines.push(
      "### Missing Declared Files",
      "",
      ...missingFiles.map(
        (filePath) => `- \`${filePath}\``,
      ),
      "",
    );
  }

  if (declaredButUnmatched.length > 0) {
    lines.push(
      "### Declared Files Without Search Matches",
      "",
      "These may be valid supporting implementations that do not contain the capability name directly.",
      "",
      ...declaredButUnmatched.map(
        (filePath) => `- \`${filePath}\``,
      ),
      "",
    );
  }

  if (matchedButUndeclared.length > 0) {
    lines.push(
      "### Structural Matches Not Declared as Implementation Files",
      "",
      "Review these files to determine whether they should be registered as consumers, validators, projections, simulations, or supporting implementations.",
      "",
      ...matchedButUndeclared.map(
        (filePath) => `- \`${filePath}\``,
      ),
      "",
    );
  }

  return lines;
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
    ...createVerifiedArchitectureSection(audit),
    ...createArchitectureDriftSection(audit),
    "## Structural Search",
    "",
    "This section records source-code references. It supplements, but does not replace, the registry-backed architectural verification above.",
    "",
    "### Search Terms",
    "",
    ...audit.searchTerms.map(
      (term) => `- \`${term}\``,
    ),
    "",
    "### Pipeline Summary",
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
    "### Detailed Matches",
    "",
  ];

  for (const layer of orderedLayers) {
    const layerMatches =
      grouped.get(layer) ?? [];

    if (layerMatches.length === 0) {
      continue;
    }

    lines.push(`#### ${layer}`, "");

    const matchesByFile = new Map<
      string,
      CapabilityMatch[]
    >();

    for (const match of layerMatches) {
      const existing =
        matchesByFile.get(match.relativePath) ?? [];

      existing.push(match);
      matchesByFile.set(
        match.relativePath,
        existing,
      );
    }

    for (const [
      relativePath,
      fileMatches,
    ] of matchesByFile) {
      lines.push(
        `##### \`${relativePath}\``,
        "",
      );

      for (const match of fileMatches) {
        lines.push(
          `- Line ${match.lineNumber} · **${match.kind}** · matched \`${match.matchedTerm}\``,
        );

        lines.push(
          `  - \`${escapeMarkdown(
            match.line,
          )}\``,
        );
      }

      lines.push("");
    }
  }

  lines.push(
    "## Interpretation",
    "",
    "The structural search identifies references; the Verified Architecture section evaluates the capability against the Cognitive Capability Registry and Cognitive File Registry.",
    "",
    "A capability is considered fully connected only when:",
    "",
    "1. its canonical producer is declared and exists,",
    "2. its implementation files exist,",
    "3. its Runtime destination is declared,",
    "4. its downstream consumers are declared,",
    "5. its Executive or Projection destination is known where applicable,",
    "6. and its Atlas or benchmark coverage is recorded.",
    "",
  );

  return lines.join("\n");
}

function safeFileName(value: string): string {
  return toKebabCase(value) || "capability";
}

function runCapabilityAudit(): void {
  const requestedCapability =
    normalizeCapability(
      process.argv.slice(2).join(" "),
    );

  if (!requestedCapability) {
    console.error(
      'Usage: npm run audit:capability -- "Executive Assessment"',
    );

    process.exitCode = 1;
    return;
  }

  const capabilityRegistry =
    loadJsonFile<unknown>(
      CAPABILITY_REGISTRY_PATH,
      "Cognitive capability registry",
    );

  const fileRegistry =
    loadJsonFile<unknown>(
      FILE_REGISTRY_PATH,
      "Cognitive file registry",
    );

  const capabilityEntries =
    capabilityEntriesFromRegistry(
      capabilityRegistry,
    );

  const fileEntries =
    fileEntriesFromRegistry(fileRegistry);

  const registryCapability =
    findRegistryCapability(
      requestedCapability,
      capabilityEntries,
    );

  const searchTerms = buildSearchTerms(
    requestedCapability,
    registryCapability,
  );

  const files = SEARCH_ROOTS.flatMap(
    (root) => walk(root),
  );

  const matches = files.flatMap(
    (filePath) =>
      findMatches({
        filePath,
        searchTerms,
      }),
  );

  const fileRegistryMap =
    registryFileByPath(fileEntries);

  const relevantFileEntries = unique([
    ...implementationFilesForCapability(
      registryCapability,
    ),
    ...(registryCapability?.canonicalProducer
      ? [registryCapability.canonicalProducer]
      : []),
    ...matches.map(
      (match) => match.relativePath,
    ),
  ])
    .map(normalizePath)
    .map((filePath) =>
      fileRegistryMap.get(filePath),
    )
    .filter(
      (
        entry,
      ): entry is RegistryFileEntry =>
        Boolean(entry),
    );

  const audit: CapabilityAudit = {
    capability:
      registryCapability?.name ??
      registryCapability?.capabilityName ??
      registryCapability?.displayName ??
      requestedCapability,

    searchTerms,

    generatedAt: new Date().toISOString(),

    matches,

    registryCapability,

    fileRegistryEntries:
      relevantFileEntries,
  };

  const report =
    createMarkdownReport(audit);

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
    `${safeFileName(
      registryCapability?.id ??
        audit.capability,
    )}.md`,
  );

  fs.writeFileSync(
    reportPath,
    report,
    "utf8",
  );

  const checks =
    createVerificationChecks(audit);

  const connectionStatus =
    determineConnectionStatus(checks);

  console.log(report);
  console.log("");
  console.log(
    "=========================================",
  );
  console.log(
    `Architecture status: ${connectionStatus}`,
  );
  console.log(
    `Capability registry: ${
      registryCapability
        ? "Matched"
        : "Not matched"
    }`,
  );
  console.log(
    `Structural matches: ${matches.length}`,
  );
  console.log(
    `Saved report: ${path.relative(
      PROJECT_ROOT,
      reportPath,
    )}`,
  );
  console.log(
    "=========================================",
  );

  const hasCriticalFailure = checks.some(
    (check) =>
      check.status === "fail" &&
      [
        "Capability registry entry",
        "Canonical producer declared",
        "Canonical producer exists",
        "Implementation files",
        "Runtime destination",
        "Consumers",
      ].includes(check.label),
  );

  if (hasCriticalFailure) {
    process.exitCode = 1;
  }
}

runCapabilityAudit();