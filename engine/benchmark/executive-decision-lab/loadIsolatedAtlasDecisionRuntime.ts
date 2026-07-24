import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import type { OrganizationRuntime } from "../../v3/runtime";

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(moduleDirectory, "../../..");
const atlasRuntimeRepositoryPath =
  ".discovery-runtime/organizations/atlas-manufacturing-simulation.json";

export function loadIsolatedAtlasDecisionRuntime(): OrganizationRuntime {
  const result = spawnSync(
    "git",
    [
      "-C",
      repositoryRoot,
      "show",
      `HEAD:${atlasRuntimeRepositoryPath}`,
    ],
    {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    },
  );

  if (result.status !== 0) {
    throw new Error(
      [
        "Unable to load the committed Atlas Decision Lab fixture.",
        result.stderr,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  return JSON.parse(result.stdout) as OrganizationRuntime;
}
