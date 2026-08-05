import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  deriveNorthstarPackageFromRepository,
  NORTHSTAR_RECONSTRUCTION_INPUT_DIGEST,
  verifyNorthstarReconstructionPackage,
} from "../../product/simulations/living-organization-sandbox/northstarReconstructionPackage";
import { sandboxManifest } from "../../product/simulations/living-organization-sandbox/manifest";
import { normalizeReconstructionContent } from "../../product/simulations/living-organization-sandbox/reconstructionInputSnapshot";
import {
  northstarScopeTopology,
  northstarSourceScopeBindings,
  northstarSourceScopeRecords,
} from "../../product/simulations/living-organization-sandbox/sourceScopeBindings";

const root = path.join(process.cwd(), "product/simulations/living-organization-sandbox");
const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");

async function main() {
  const snapshot = await deriveNorthstarPackageFromRepository();
  const verified = verifyNorthstarReconstructionPackage(snapshot);
  assert.equal(verified.digest, NORTHSTAR_RECONSTRUCTION_INPUT_DIGEST);
  assert.equal(verified.recordCount, 16);
  assert.equal(verified.uniqueDigestCount, 15);
  assert.equal(northstarSourceScopeRecords.length, 16);
  assert.equal(northstarSourceScopeBindings.length, 11);
  assert.equal(northstarSourceScopeRecords.filter((item) => item.controlDisposition !== "not-a-control").length, 5);
  assert.ok(northstarScopeTopology.nodes.some((item) => item.type === "organization"));
  assert.ok(northstarScopeTopology.nodes.some((item) => item.type === "function"));
  assert.ok(northstarScopeTopology.nodes.some((item) => item.type === "team"));
  assert.ok(northstarScopeTopology.nodes.some((item) => item.type === "initiative"));
  for (const document of sandboxManifest.documents) {
    const content = normalizeReconstructionContent(await readFile(path.join(root, document.relativePath), "utf8"));
    const record = snapshot.records.find((item) => item.logicalSourceId === `sandbox:${document.id}:v${document.version}`);
    assert.ok(record);
    assert.equal(record.sourceVersion, document.version);
    assert.equal(record.effectiveAt, document.effectiveAt);
    assert.equal(record.normalizedContentDigest, sha256(content));
  }
  console.log(JSON.stringify({
    validation: "northstar-reconstruction-versioned-package-v1",
    result: "PASS",
    records: 16,
    uniqueDigests: 15,
    sourceBindings: 11,
    negativeControls: 5,
    digest: verified.digest,
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
