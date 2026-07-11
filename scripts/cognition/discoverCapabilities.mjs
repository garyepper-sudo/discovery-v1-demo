import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";

const ROOT = process.cwd();

const FILE_REGISTRY_PATH = resolve(
  ROOT,
  "docs/Architecture/COGNITIVE_FILE_REGISTRY.json",
);

const REPORT_PATH = resolve(
  ROOT,
  "docs/Architecture/COGNITIVE_CAPABILITY_CANDIDATES.json",
);

function loadJson(path, label) {
  if (!existsSync(path)) {
    throw new Error(`${label} not found: ${path}`);
  }

  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(
      `Could not parse ${label}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function unique(values) {
  return [...new Set(values)].sort();
}

function isPerceptionCandidate(entry) {
  if (entry.architecturalLayer !== "COG") {
    return false;
  }

  if (
    entry.path.startsWith("engine/archive/") ||
    entry.path.includes("/archive/") ||
    entry.path.includes("/legacy/") ||
    (entry.path.startsWith("engine/") &&
      !entry.path.startsWith("engine/v3/"))
  ) {
    return false;
  }

  const fileName = entry.path
    .split("/")
    .at(-1)
    ?.toLowerCase();

  if (
    fileName === "index.ts" ||
    fileName === "index.tsx" ||
    fileName === "types.ts" ||
    fileName === "types.tsx" ||
    fileName?.startsWith("test")
  ) {
    return false;
  }

  const searchable = [
    entry.path,
    entry.capabilityName,
    ...(entry.exports ?? []),
  ]
    .join("\n")
    .toLowerCase();

  const perceptionTerms = [
    "evidence",
    "observation",
    "signal",
    "entity",
    "phenomena",
    "contradiction",
  ];

  const hasExplicitPerceptionTerm = perceptionTerms.some((term) =>
    searchable.includes(term),
  );

  if (!hasExplicitPerceptionTerm) {
    return false;
  }

  const excludedTerms = [
    "belief",
    "mechanism",
    "theory",
    "causal",
    "compression",
    "learning",
    "evolution",
    "runtime",
    "executive",
    "projection",
    "judgment",
    "priority",
  ];

  return !excludedTerms.some((term) =>
    entry.path.toLowerCase().includes(term),
  );
}

function deriveCandidateName(entry) {
  const path = entry.path.toLowerCase();

  if (path.includes("/comparison/")) {
    return "Observation Understanding";
  }

  if (path.includes("/meaning/")) {
    return "Signal Detection";
  }

  if (path.includes("/entities/")) {
    return "Entity Understanding";
  }

  if (path.includes("evidence")) {
    return "Evidence Understanding";
  }

  if (path.includes("observation")) {
    return "Observation Understanding";
  }

  if (path.includes("signal")) {
    return "Signal Detection";
  }

  if (path.includes("phenomena")) {
    return "Phenomena Detection";
  }

  if (path.includes("contradiction")) {
    return "Contradiction Detection";
  }

  if (entry.exports?.length === 1) {
    return entry.exports[0];
  }

  return entry.capabilityName;
}

function main() {
  const registry = loadJson(
    FILE_REGISTRY_PATH,
    "Cognitive file registry",
  );

  const entries = Array.isArray(registry.entries)
    ? registry.entries
    : [];

  const perceptionFiles = entries.filter(isPerceptionCandidate);

  const candidates = perceptionFiles.map((entry) => ({
    proposedName: deriveCandidateName(entry),

    domain: "PER",

    sourceFileId: entry.id,

    path: entry.path,

    exports: entry.exports ?? [],

    imports: entry.imports ?? [],

    currentClassification: {
      architecturalLayer: entry.architecturalLayer,
      cognitiveDomain: entry.cognitiveDomain,
      confidence: entry.classificationConfidence,
      alternatives: entry.alternativeDomains ?? [],
    },

    proposedRole:
      entry.exports?.some((name) =>
        /^(infer|extract|detect|build|identify|generate|analyze)/i.test(
          name,
        ),
      )
        ? "producer-candidate"
        : "supporting-implementation",

    reviewStatus: "unreviewed",

    proposedCapabilityId: null,

    mapsToExistingCapability: null,

    notes: "",
  }));

  const summary = {
    totalCandidates: candidates.length,

    producerCandidates: candidates.filter(
      (candidate) =>
        candidate.proposedRole === "producer-candidate",
    ).length,

    supportingImplementations: candidates.filter(
      (candidate) =>
        candidate.proposedRole === "supporting-implementation",
    ).length,

    exportedSymbols: unique(
      candidates.flatMap((candidate) => candidate.exports),
    ).length,
  };

  const output = {
    generatedAt: new Date().toISOString(),

    status: "proposed",

    domain: {
      code: "PER",
      name: "Perception",
    },

    description:
      "Machine-generated candidates for Perception capabilities. This report is for human review and does not modify the canonical capability registry.",

    summary,

    candidates,
  };

  mkdirSync(dirname(REPORT_PATH), {
    recursive: true,
  });

  writeFileSync(
    REPORT_PATH,
    `${JSON.stringify(output, null, 2)}\n`,
    "utf8",
  );

  console.log("");
  console.log("Perception capability candidates generated.");
  console.log(`Total candidates: ${summary.totalCandidates}`);
  console.log(
    `Producer candidates: ${summary.producerCandidates}`,
  );
  console.log(
    `Supporting implementations: ${summary.supportingImplementations}`,
  );
  console.log(
    "Output: docs/Architecture/COGNITIVE_CAPABILITY_CANDIDATES.json",
  );
  console.log("");
}

main();