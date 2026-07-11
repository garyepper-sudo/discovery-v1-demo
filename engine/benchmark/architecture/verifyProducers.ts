import fs from "node:fs";
import path from "node:path";

import type { ArchitectureCheck } from "./types";

type ProducerCapability = {
  id: string;
  name: string;
  canonicalProducer: string;
  resolvedFiles?: Array<{
    path: string;
    exports?: string[];
  }>;
};

const PROJECT_ROOT = process.cwd();

function resolveProjectPath(relativePath: string): string {
  return path.resolve(PROJECT_ROOT, relativePath);
}

function readSourceFile(relativePath: string): string | undefined {
  const absolutePath = resolveProjectPath(relativePath);

  if (!fs.existsSync(absolutePath)) {
    return undefined;
  }

  return fs.readFileSync(absolutePath, "utf8");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countExportedProducerDefinitions(
  source: string,
  producer: string,
): number {
  const escapedProducer = escapeRegExp(producer);

  const patterns = [
    new RegExp(
      `export\\s+function\\s+${escapedProducer}\\s*\\(`,
      "g",
    ),
    new RegExp(
      `export\\s+async\\s+function\\s+${escapedProducer}\\s*\\(`,
      "g",
    ),
    new RegExp(
      `export\\s+const\\s+${escapedProducer}\\s*=`,
      "g",
    ),
  ];

  return patterns.reduce(
    (total, pattern) =>
      total + (source.match(pattern)?.length ?? 0),
    0,
  );
}

function findProducerName(
  capability: ProducerCapability,
): string | undefined {
  const canonicalFile = capability.resolvedFiles?.find(
    (file) => file.path === capability.canonicalProducer,
  );

  return canonicalFile?.exports?.find((exportName) =>
    /^[a-z]/.test(exportName),
  );
}

export function verifyProducer(
  capability: ProducerCapability,
): ArchitectureCheck {
  const producer = findProducerName(capability);

  if (!producer) {
    return {
      capabilityId: capability.id,
      capabilityName: capability.name,
      category: "producer",
      status: "fail",
      message: "Canonical producer export is not declared.",
      detail: capability.canonicalProducer,
    };
  }

  const source = readSourceFile(capability.canonicalProducer);

  if (source === undefined) {
    return {
      capabilityId: capability.id,
      capabilityName: capability.name,
      category: "producer",
      status: "fail",
      message: "Canonical producer source file was not found.",
      detail: capability.canonicalProducer,
    };
  }

  const occurrences = countExportedProducerDefinitions(
    source,
    producer,
  );

  if (occurrences !== 1) {
    return {
      capabilityId: capability.id,
      capabilityName: capability.name,
      category: "producer",
      status: "fail",
      message:
        occurrences === 0
          ? `Canonical producer export not found: ${producer}()`
          : `Expected one canonical producer export, but found ${occurrences}.`,
      detail: capability.canonicalProducer,
    };
  }

  return {
    capabilityId: capability.id,
    capabilityName: capability.name,
    category: "producer",
    status: "pass",
    message: `Canonical producer verified: ${producer}()`,
    detail: capability.canonicalProducer,
  };
}