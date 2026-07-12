import fs from "fs";
import path from "path";

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

const CAPABILITY_AUDIT_PATH = path.join(
  PROJECT_ROOT,
  "docs",
  "Architecture",
  "COGNITIVE_CAPABILITY_AUDIT.json",
);

const OUTPUT_PATH = path.join(
  PROJECT_ROOT,
  "docs",
  "Sprint Updates",
  "ARCHITECTURE_HANDOFF.md",
);

function loadJson(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}`);
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(
      `Could not parse ${label}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function titleCase(value) {
  return String(value ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function capabilityLabel(capability) {
  return `${capability.id ?? "UNREGISTERED"} — ${
    capability.name ?? "Unnamed Capability"
  }`;
}

function capabilitySearchCorpus(capability) {
  return normalizeText(
    [
      capability.id,
      capability.name,
      capability.description,
      capability.subsystem,
      ...asArray(capability.searchTerms),
      ...asArray(capability.producesObjects),
      ...asArray(capability.executiveDestinations),
    ].join(" "),
  );
}

function tokenSet(value) {
  return new Set(
    normalizeText(value)
      .split(" ")
      .filter((token) => token.length >= 4),
  );
}

function overlapScore(left, right) {
  const leftTokens = tokenSet(capabilitySearchCorpus(left));
  const rightTokens = tokenSet(capabilitySearchCorpus(right));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  const intersection = [...leftTokens].filter((token) =>
    rightTokens.has(token),
  );

  const union = new Set([...leftTokens, ...rightTokens]);

  return intersection.length / union.size;
}

function findPotentialOverlaps(capabilities) {
  const overlaps = [];

  for (let leftIndex = 0; leftIndex < capabilities.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < capabilities.length;
      rightIndex += 1
    ) {
      const left = capabilities[leftIndex];
      const right = capabilities[rightIndex];
      const score = overlapScore(left, right);

      const sharedProducedObjects = asArray(left.producesObjects).filter(
        (objectName) =>
          asArray(right.producesObjects).includes(objectName),
      );

      const sameProducer =
        left.canonicalProducer &&
        right.canonicalProducer &&
        left.canonicalProducer === right.canonicalProducer;

      if (
        score >= 0.3 ||
        sharedProducedObjects.length > 0 ||
        sameProducer
      ) {
        overlaps.push({
          left,
          right,
          score,
          sharedProducedObjects,
          sameProducer,
        });
      }
    }
  }

  return overlaps.sort((left, right) => right.score - left.score);
}

function buildCapabilityTable(capabilities) {
  const lines = [
    "| ID | Capability | Layer | Produces | Runtime Destination | Consumers |",
    "|---|---|---|---|---|---|",
  ];

  for (const capability of capabilities) {
    lines.push(
      `| ${capability.id ?? ""} | ${capability.name ?? ""} | ${
        capability.architecturalLayer ?? "Not declared"
      } | ${
        asArray(capability.producesObjects).join(", ") || "None"
      } | ${
        capability.runtimeDestination ?? "Not declared"
      } | ${
        asArray(capability.consumedByCapabilities).join(", ") ||
        (capability.terminalCapability ? "Terminal capability" : "None")
      } |`,
    );
  }

  return lines;
}

function buildDependencyMap(capabilities) {
  const lines = [];

  for (const capability of capabilities) {
    const dependencies = asArray(capability.consumesCapabilities);

    lines.push(
      `### ${capabilityLabel(capability)}`,
      "",
      `**Depends on:** ${
        dependencies.length > 0
          ? dependencies.join(", ")
          : "No registered capability dependencies"
      }`,
      "",
      `**Produces:** ${
        asArray(capability.producesObjects).join(", ") || "None declared"
      }`,
      "",
      `**Canonical producer:** \`${
        capability.canonicalProducer ?? "Not declared"
      }\``,
      "",
      `**Runtime destination:** \`${
        capability.runtimeDestination ?? "Not declared"
      }\``,
      "",
      `**Executive destinations:** ${
        asArray(capability.executiveDestinations).join(", ") ||
        "None declared"
      }`,
      "",
    );
  }

  return lines;
}

function buildOverlapSection(overlaps) {
  if (overlaps.length === 0) {
    return [
      "No potential capability overlaps were detected by the registry comparison.",
      "",
    ];
  }

  const lines = [];

  for (const overlap of overlaps) {
    const reasons = [];

    if (overlap.score >= 0.3) {
      reasons.push(
        `semantic similarity ${Math.round(overlap.score * 100)}%`,
      );
    }

    if (overlap.sharedProducedObjects.length > 0) {
      reasons.push(
        `shared produced objects: ${overlap.sharedProducedObjects.join(", ")}`,
      );
    }

    if (overlap.sameProducer) {
      reasons.push("same canonical producer");
    }

    lines.push(
      `### ${capabilityLabel(overlap.left)}`,
      "",
      `Possible overlap with **${capabilityLabel(overlap.right)}**.`,
      "",
      `Reason: ${reasons.join("; ")}.`,
      "",
      "Review before creating a new capability. Similarity does not automatically mean duplication; one capability may legitimately depend on or transform another.",
      "",
    );
  }

  return lines;
}

function buildArchitectureHandoff() {
  const capabilityRegistry = loadJson(
    CAPABILITY_REGISTRY_PATH,
    "Cognitive capability registry",
  );

  const fileRegistry = loadJson(
    FILE_REGISTRY_PATH,
    "Cognitive file registry",
  );

  const capabilityAudit = loadJson(
    CAPABILITY_AUDIT_PATH,
    "Cognitive capability audit",
  );

  const capabilities = asArray(capabilityRegistry.capabilities);
  const fileEntries = asArray(
    fileRegistry.entries ?? fileRegistry.files,
  );

  const overlaps = findPotentialOverlaps(capabilities);

  const health = capabilityAudit.health ?? {};

  const canonicalProducers = capabilities.filter(
    (capability) => capability.canonicalProducer,
  ).length;

  const terminalCapabilities = capabilities.filter(
    (capability) => capability.terminalCapability,
  ).length;

  const lines = [
    "# Discovery Architecture Handoff",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Purpose",
    "",
    "This document is the canonical architecture handoff for beginning a new Discovery sprint or chat.",
    "",
    "Before proposing a new capability, use this document to verify whether the responsibility, cognitive object, canonical producer, Runtime destination, or executive destination already exists.",
    "",
    "## Permanent Development Rule",
    "",
    "Before adding any new cognitive capability:",
    "",
    "1. Search the Cognitive Capability Registry.",
    "2. Search existing produced cognitive objects.",
    "3. Search canonical producers and implementation files.",
    "4. Review potential semantic overlaps.",
    "5. Extend an existing capability unless a distinct architectural responsibility is proven.",
    "",
    "## Architecture Health",
    "",
    `- Registered capabilities: ${capabilities.length}`,
    `- Canonical producers: ${canonicalProducers}`,
    `- Registered files: ${fileEntries.length}`,
    `- Terminal capabilities: ${terminalCapabilities}`,
    `- Duplicate capability IDs: ${health.duplicateIdCount ?? 0}`,
    `- Missing dependencies: ${health.missingDependencyCount ?? 0}`,
    `- Missing canonical producers: ${
      health.missingCanonicalProducerCount ?? 0
    }`,
    `- Capabilities without producer: ${
      health.capabilitiesWithoutProducerCount ?? 0
    }`,
    `- Capabilities without consumers: ${
      health.capabilitiesWithoutConsumersCount ?? 0
    }`,
    `- Capabilities without Runtime destination: ${
      health.capabilitiesWithoutRuntimeDestinationCount ?? 0
    }`,
    `- Files implementing multiple capabilities: ${
      health.multiCapabilityFileCount ?? 0
    }`,
    "",
    "## Canonical Capability Registry",
    "",
    ...buildCapabilityTable(capabilities),
    "",
    "## Capability Dependency Map",
    "",
    ...buildDependencyMap(capabilities),
    "## Potential Capability Overlap",
    "",
    ...buildOverlapSection(overlaps),
    "## Canonical Pipeline",
    "",
    "```text",
    "Evidence Ingestion",
    "↓",
    "Organizational Observation Inference",
    "↓",
    "Organizational Mechanism Inference",
    "↓",
    "Organizational Belief Formation",
    "↓",
    "Organizational Theory Formation",
    "↓",
    "Organizational Condition Inference",
    "↓",
    "Executive Assessment",
    "↓",
    "Executive Understanding Synthesis",
    "↓",
    "Organization Runtime",
    "↓",
    "Executive Projection",
    "↓",
    "Executive Workspace",
    "```",
    "",
    "## Canonical Source Files",
    "",
    ...capabilities.flatMap((capability) => [
      `### ${capabilityLabel(capability)}`,
      "",
      `- Canonical producer: \`${
        capability.canonicalProducer ?? "Not declared"
      }\``,
      ...asArray(capability.implementationFiles).map(
        (filePath) => `- Implementation: \`${filePath}\``,
      ),
      "",
    ]),
    "## Sprint Handoff Guidance",
    "",
    "Treat the following files as canonical architectural sources:",
    "",
    "- `docs/Architecture/COGNITIVE_CAPABILITY_REGISTRY.json`",
    "- `docs/Architecture/COGNITIVE_FILE_REGISTRY.json`",
    "- `docs/Architecture/COGNITIVE_CAPABILITY_AUDIT.json`",
    "- `docs/Architecture/COGNITIVE_OBJECT_MODEL.md`",
    "- `docs/Sprint Updates/ARCHITECTURE_HANDOFF.md`",
    "",
    "When architectural evidence conflicts, prefer the current registry and verified source-code trace over older sprint prose.",
    "",
  ];

  fs.mkdirSync(path.dirname(OUTPUT_PATH), {
    recursive: true,
  });

  fs.writeFileSync(
    OUTPUT_PATH,
    `${lines.join("\n")}\n`,
    "utf8",
  );

  console.log("");
  console.log("=========================================");
  console.log("DISCOVERY ARCHITECTURE HANDOFF");
  console.log("=========================================");
  console.log("");
  console.log(`Capabilities ............... ${capabilities.length}`);
  console.log(`Canonical producers ........ ${canonicalProducers}`);
  console.log(`Registered files ........... ${fileEntries.length}`);
  console.log(`Potential overlaps ......... ${overlaps.length}`);
  console.log("");
  console.log(
    `Duplicate IDs .............. ${health.duplicateIdCount ?? 0}`,
  );
  console.log(
    `Missing dependencies ....... ${health.missingDependencyCount ?? 0}`,
  );
  console.log(
    `Missing producers .......... ${
      health.missingCanonicalProducerCount ?? 0
    }`,
  );
  console.log(
    `Missing consumers .......... ${
      health.capabilitiesWithoutConsumersCount ?? 0
    }`,
  );
  console.log(
    `Missing Runtime destinations ${
      health.capabilitiesWithoutRuntimeDestinationCount ?? 0
    }`,
  );
  console.log("");
  console.log(
    `Output: ${path.relative(PROJECT_ROOT, OUTPUT_PATH)}`,
  );
  console.log("=========================================");
}

try {
  buildArchitectureHandoff();
} catch (error) {
  console.error("");
  console.error("Architecture handoff generation failed.");
  console.error(
    error instanceof Error ? error.message : String(error),
  );
  process.exitCode = 1;
}