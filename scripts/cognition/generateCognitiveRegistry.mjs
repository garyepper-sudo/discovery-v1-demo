import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";

const ROOT = process.cwd();

const REGISTRY_PATH = resolve(
  ROOT,
  "docs/Architecture/COGNITIVE_FILE_REGISTRY.json",
);

const INCLUDED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
]);

const EXCLUDED_DIRECTORIES = new Set([
  ".git",
  ".next",
  ".discovery-runtime",
  "node_modules",
  "coverage",
  "dist",
  "build",
]);

const EXCLUDED_FILES = new Set([
  "package-lock.json",
  "tsconfig.tsbuildinfo",
  "next-env.d.ts",
]);

const ARCHITECTURAL_RULES = [
  {
    layer: "BENCH",
    patterns: [
      /^engine\/benchmark\//,
      /benchmark/i,
      /atlas/i,
      /audit/i,
    ],
  },
  {
    layer: "PROJ",
    patterns: [
      /^components\/executive-v2\/projection\//,
      /projection/i,
    ],
  },
  {
    layer: "EXP",
    patterns: [
      /^components\//,
      /^app\/.*\/page\.(ts|tsx|js|jsx)$/,
      /^styles\//,
    ],
  },
  {
    layer: "RUN",
    patterns: [
      /^engine\/v3\/runtime\//,
      /runtime/i,
      /memoryStore/i,
      /organizationStore/i,
    ],
  },
  {
    layer: "EXEC",
    patterns: [
      /^engine\/v3\/executive\//,
      /executiveAssessment/i,
      /organizationalState/i,
      /organizationalCondition/i,
      /investigationOpportunit/i,
      /theoryValidation/i,
    ],
  },
  {
    layer: "COG",
    patterns: [
      /^engine\/v3\//,
      /^engine\/(?!benchmark\/)/,
    ],
  },
  {
    layer: "INFRA",
    patterns: [
      /^app\/api\//,
      /^scripts\//,
      /config/i,
      /store/i,
      /adapter/i,
      /route\.(ts|js)$/,
    ],
  },
  {
    layer: "DATA",
    patterns: [
      /^sample-data\//,
      /^public\//,
      /^engine\/benchmark\/datasets\//,
    ],
  },
  {
    layer: "DOC",
    patterns: [/^docs\//, /\.md$/],
  },
];

const COGNITIVE_DOMAIN_RULES = [
  {
    domain: "PER",
    name: "Perception",
    patterns: [
      /evidence/i,
      /observation/i,
      /signal/i,
      /extract/i,
      /entity/i,
      /semantic/i,
      /contradiction/i,
      /phenomena/i,
    ],
  },
  {
    domain: "UND",
    name: "Understanding",
    patterns: [
      /understanding/i,
      /mechanism/i,
      /belief/i,
      /theor/i,
      /explanation/i,
      /reasoning/i,
      /condition/i,
      /organizationalState/i,
    ],
  },
  {
    domain: "MEM",
    name: "Memory",
    patterns: [
      /memory/i,
      /persist/i,
      /store/i,
      /runtime/i,
      /retention/i,
      /continuity/i,
    ],
  },
  {
    domain: "LRN",
    name: "Learning",
    patterns: [
      /learning/i,
      /evolution/i,
      /revision/i,
      /growth/i,
      /velocity/i,
      /stability/i,
    ],
  },
  {
    domain: "ABS",
    name: "Abstraction",
    patterns: [
      /concept/i,
      /compression/i,
      /cluster/i,
      /cohort/i,
      /generaliz/i,
      /synthes/i,
    ],
  },
  {
    domain: "SYS",
    name: "Systems Intelligence",
    patterns: [
      /graph/i,
      /relationship/i,
      /network/i,
      /dependency/i,
      /dynamic/i,
      /system/i,
      /causal/i,
    ],
  },
  {
    domain: "PRD",
    name: "Prediction",
    patterns: [/predict/i, /forecast/i, /trajectory/i, /futureState/i],
  },
  {
    domain: "SIM",
    name: "Simulation",
    patterns: [/simulat/i, /scenario/i, /counterfactual/i, /intervention/i],
  },
  {
    domain: "ADP",
    name: "Adaptation",
    patterns: [
      /adapt/i,
      /selfCorrect/i,
      /recalibrat/i,
      /replaceTheory/i,
      /restructur/i,
    ],
  },
  {
    domain: "SELF",
    name: "Self-Awareness",
    patterns: [
      /confidence/i,
      /uncertainty/i,
      /missingEvidence/i,
      /blindSpot/i,
      /fitness/i,
      /health/i,
      /calibrat/i,
    ],
  },
];

function normalizePath(path) {
  return path.replaceAll("\\", "/");
}

function shouldExclude(path) {
  const normalized = normalizePath(path);
  const segments = normalized.split("/");

  if (segments.some((segment) => EXCLUDED_DIRECTORIES.has(segment))) {
    return true;
  }

  return EXCLUDED_FILES.has(segments.at(-1));
}

function walkDirectory(directory) {
  const results = [];

  for (const name of readdirSync(directory)) {
    const absolutePath = join(directory, name);
    const relativePath = normalizePath(relative(ROOT, absolutePath));

    if (shouldExclude(relativePath)) {
      continue;
    }

    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      results.push(...walkDirectory(absolutePath));
      continue;
    }

    if (!INCLUDED_EXTENSIONS.has(extname(name))) {
      continue;
    }

    results.push({
      absolutePath,
      relativePath,
      sizeBytes: stats.size,
    });
  }

  return results;
}

function matchesAny(value, patterns) {
  return patterns.some((pattern) => pattern.test(value));
}

function classifyArchitecturalLayer(path) {
  for (const rule of ARCHITECTURAL_RULES) {
    if (matchesAny(path, rule.patterns)) {
      return rule.layer;
    }
  }

  return "REVIEW";
}

function classifyCognitiveDomain(path, content, layer) {
  if (!["COG", "RUN", "EXEC"].includes(layer)) {
    return {
      code: null,
      name: null,
      confidence: "not-applicable",
      alternatives: [],
    };
  }

  const searchable = `${path}\n${content}`;
  const scores = COGNITIVE_DOMAIN_RULES.map((rule) => ({
    code: rule.domain,
    name: rule.name,
    score: rule.patterns.filter((pattern) => pattern.test(searchable)).length,
  })).sort((left, right) => right.score - left.score);

  const strongest = scores[0];
  const alternatives = scores
    .slice(1, 3)
    .filter((candidate) => candidate.score > 0)
    .map((candidate) => candidate.code);

  if (!strongest || strongest.score === 0) {
    return {
      code: null,
      name: null,
      confidence: "low",
      alternatives: [],
    };
  }

  return {
    code: strongest.code,
    name: strongest.name,
    confidence:
      strongest.score >= 4
        ? "high"
        : strongest.score >= 2
          ? "medium"
          : "low",
    alternatives,
  };
}

function extractImports(content) {
  const imports = new Set();

  const patterns = [
    /from\s+["']([^"']+)["']/g,
    /import\s+["']([^"']+)["']/g,
    /require\(\s*["']([^"']+)["']\s*\)/g,
    /import\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      imports.add(match[1]);
    }
  }

  return [...imports].sort();
}

function extractExports(content) {
  const exports = new Set();

  const patterns = [
    /export\s+(?:default\s+)?function\s+([A-Za-z0-9_$]+)/g,
    /export\s+(?:const|let|var|class|type|interface|enum)\s+([A-Za-z0-9_$]+)/g,
    /export\s*\{([^}]+)\}/g,
  ];

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      if (pattern.source.includes("\\{")) {
        for (const item of match[1].split(",")) {
          const name = item.trim().split(/\s+as\s+/)[1] ?? item.trim();
          if (name) {
            exports.add(name);
          }
        }
      } else if (match[1]) {
        exports.add(match[1]);
      }
    }
  }

  return [...exports].sort();
}

function deriveCapabilityName(path, exports) {
  if (exports.length === 1) {
    return exports[0];
  }

  const fileName = path.split("/").at(-1) ?? path;

  return fileName.replace(/\.[^.]+$/, "");
}

function makeProposedId(layer, domain, index) {
  const sequence = String(index).padStart(3, "0");

  if (layer === "COG" && domain) {
    return `COG-${domain}-${sequence}`;
  }

  if (layer === "RUN") {
    return `RUN-${domain ?? "CORE"}-${sequence}`;
  }

  if (layer === "EXEC") {
    return `EXEC-${domain ?? "CORE"}-${sequence}`;
  }

  if (layer === "PROJ") {
    return `PROJ-${sequence}`;
  }

  if (layer === "EXP") {
    return `EXP-${sequence}`;
  }

  if (layer === "BENCH") {
    return `BENCH-${sequence}`;
  }

  if (layer === "INFRA") {
    return `INFRA-${sequence}`;
  }

  if (layer === "DATA") {
    return `DATA-${sequence}`;
  }

  if (layer === "DOC") {
    return `DOC-${sequence}`;
  }

  return `REVIEW-${sequence}`;
}

function loadExistingRegistry() {
  if (!existsSync(REGISTRY_PATH)) {
    return {
      version: 1,
      status: "proposed",
      generatedAt: null,
      entries: [],
    };
  }

  try {
    const parsed = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));

    return {
      version: parsed.version ?? 1,
      status: parsed.status ?? "proposed",
      generatedAt: parsed.generatedAt ?? null,
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    };
  } catch (error) {
    throw new Error(
      `Could not parse ${REGISTRY_PATH}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function buildRegistry() {
  const existingRegistry = loadExistingRegistry();

  const existingByPath = new Map(
    existingRegistry.entries.map((entry) => [entry.path, entry]),
  );

  const files = walkDirectory(ROOT).sort((left, right) =>
    left.relativePath.localeCompare(right.relativePath),
  );

  const counters = new Map();

  const entries = files.map((file) => {
    let content = "";

    try {
      content = readFileSync(file.absolutePath, "utf8");
    } catch {
      content = "";
    }

    const architecturalLayer = classifyArchitecturalLayer(
      file.relativePath,
    );

    const cognitiveDomain = classifyCognitiveDomain(
      file.relativePath,
      content,
      architecturalLayer,
    );

    const counterKey = `${architecturalLayer}:${cognitiveDomain.code ?? "NONE"}`;
    const nextCounter = (counters.get(counterKey) ?? 0) + 1;
    counters.set(counterKey, nextCounter);

    const previous = existingByPath.get(file.relativePath);

    const imports = extractImports(content);
    const exports = extractExports(content);

    return {
      id:
        previous?.id ??
        makeProposedId(
          architecturalLayer,
          cognitiveDomain.code,
          nextCounter,
        ),

      idStatus: previous?.idStatus ?? "proposed",

      path: file.relativePath,

      capabilityName:
        previous?.capabilityName ??
        deriveCapabilityName(file.relativePath, exports),

      architecturalLayer:
        previous?.architecturalLayer ?? architecturalLayer,

      cognitiveDomain:
        previous?.cognitiveDomain ??
        cognitiveDomain.code,

      cognitiveDomainName:
        previous?.cognitiveDomainName ??
        cognitiveDomain.name,

      classificationConfidence:
        previous?.classificationConfidence ??
        cognitiveDomain.confidence,

      alternativeDomains:
        previous?.alternativeDomains ??
        cognitiveDomain.alternatives,

      imports,

      exports,

      consumes: previous?.consumes ?? [],

      produces: previous?.produces ?? exports,

      consumedBy: previous?.consumedBy ?? [],

      canonicalProducer:
        previous?.canonicalProducer ?? false,

      runtimeDestination:
        previous?.runtimeDestination ?? null,

      executiveDestination:
        previous?.executiveDestination ?? null,

      atlasCoverage:
        previous?.atlasCoverage ?? "unknown",

      livingOrganizationDomains:
        previous?.livingOrganizationDomains ??
        (cognitiveDomain.name ? [cognitiveDomain.name] : []),

      orphanRisk:
        previous?.orphanRisk ?? "unknown",

      reviewStatus:
        previous?.reviewStatus ?? "unreviewed",

      notes: previous?.notes ?? "",

      sizeBytes: file.sizeBytes,
    };
  });

  return {
    version: 1,
    status: "proposed",
    generatedAt: new Date().toISOString(),
    repositoryRoot: ROOT,
    entryCount: entries.length,
    entries,
  };
}

function main() {
  const registry = buildRegistry();

  mkdirSync(dirname(REGISTRY_PATH), {
    recursive: true,
  });

  writeFileSync(
    REGISTRY_PATH,
    `${JSON.stringify(registry, null, 2)}\n`,
    "utf8",
  );

  console.log("");
  console.log("Cognitive registry generated.");
  console.log(`Entries: ${registry.entryCount}`);
  console.log(`Output: ${relative(ROOT, REGISTRY_PATH)}`);
  console.log("");
  console.log("All IDs are provisional until manually reviewed.");
  console.log("");
}

main();