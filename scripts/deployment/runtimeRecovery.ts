import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rename } from "node:fs/promises";
import path from "node:path";

import type { OrganizationRuntime } from "../../engine/v3/runtime";
import { normalizeOrganizationRuntime } from "../../engine/v3/runtime/organizationStateStore";
import { getRuntimeOrganizationsDirectory } from "../../engine/v3/runtime/runtimeStorageLocation";

async function main(): Promise<void> {
const [operation, organizationId, artifactArgument] = process.argv.slice(2);
assert.match(organizationId ?? "", /^[a-zA-Z0-9_-]+$/, "Exact organization id required");
const directory = getRuntimeOrganizationsDirectory();
const active = path.join(directory, `${organizationId}.json`);
const artifact = path.resolve(artifactArgument ?? "");
assert.notEqual(artifact, process.cwd(), "Explicit artifact path required");

if (operation === "backup") {
  await mkdir(path.dirname(artifact), { recursive: true });
  const bytes = await readFile(active);
  await copyFile(active, artifact);
  console.log(JSON.stringify({
    operation,
    organizationId,
    artifact,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  }));
} else if (operation === "restore") {
  const raw = await readFile(artifact, "utf8");
  const runtime = normalizeOrganizationRuntime(JSON.parse(raw) as OrganizationRuntime);
  assert.equal(runtime.metadata.organizationId, organizationId, "Backup organization mismatch");
  assert.ok(runtime.metadata.investigationCount > 0, "Backup Runtime is not product-ready");
  const temporary = `${active}.restoring`;
  await mkdir(directory, { recursive: true });
  await copyFile(artifact, temporary);
  await rename(temporary, active);
  const restored = await readFile(active);
  console.log(JSON.stringify({
    operation,
    organizationId,
    artifact,
    sha256: createHash("sha256").update(restored).digest("hex"),
  }));
} else {
  throw new Error("Operation must be backup or restore");
}
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
