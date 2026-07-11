import {
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();

const CAPABILITY_REGISTRY_PATH = resolve(
  ROOT,
  "docs/Architecture/COGNITIVE_CAPABILITY_REGISTRY.json",
);

const FILE_REGISTRY_PATH = resolve(
  ROOT,
  "docs/Architecture/COGNITIVE_FILE_REGISTRY.json",
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

function normalizePath(path) {
  return path.replaceAll("\\", "/");
}

function main() {
  const capabilityRegistry = loadJson(
    CAPABILITY_REGISTRY_PATH,
    "Capability registry",
  );

  const fileRegistry = loadJson(
    FILE_REGISTRY_PATH,
    "File registry",
  );

  const filesByPath = new Map(
    fileRegistry.entries.map((entry) => [
      normalizePath(entry.path),
      entry,
    ]),
  );

  const capabilities = capabilityRegistry.capabilities.map(
    (capability) => {
      const implementationFiles =
        capability.implementationFiles ?? [];

      const resolvedFiles = implementationFiles.map((filePath) => {
        const normalizedPath = normalizePath(filePath);
        const fileEntry = filesByPath.get(normalizedPath);

        return {
          path: normalizedPath,
          existsInFileRegistry: Boolean(fileEntry),
          fileId: fileEntry?.id ?? null,
          architecturalLayer:
            fileEntry?.architecturalLayer ?? null,
          cognitiveDomain:
            fileEntry?.cognitiveDomain ?? null,
          exports: fileEntry?.exports ?? [],
          imports: fileEntry?.imports ?? [],
        };
      });

      const missingImplementationFiles = resolvedFiles
        .filter((file) => !file.existsInFileRegistry)
        .map((file) => file.path);

      const canonicalProducerExists =
        capability.canonicalProducer === null
          ? false
          : filesByPath.has(
              normalizePath(capability.canonicalProducer),
            );

      return {
        ...capability,
        canonicalProducerExists,
        resolvedFiles,
        missingImplementationFiles,
      };
    },
  );

  const output = {
    ...capabilityRegistry,
    generatedAt: new Date().toISOString(),
    capabilityCount: capabilities.length,
    capabilities,
  };

  writeFileSync(
    CAPABILITY_REGISTRY_PATH,
    `${JSON.stringify(output, null, 2)}\n`,
    "utf8",
  );

  const missingFiles = capabilities.flatMap(
    (capability) =>
      capability.missingImplementationFiles.map((path) => ({
        capabilityId: capability.id,
        path,
      })),
  );

  console.log("");
  console.log("Capability registry enriched.");
  console.log(`Capabilities: ${capabilities.length}`);
  console.log(`Missing implementation files: ${missingFiles.length}`);

  if (missingFiles.length > 0) {
    console.log("");
    console.log("Missing implementation paths:");

    for (const item of missingFiles) {
      console.log(`- ${item.capabilityId}: ${item.path}`);
    }
  }

  console.log("");
  console.log(
    "Output: docs/Architecture/COGNITIVE_CAPABILITY_REGISTRY.json",
  );
  console.log("");
}

main();