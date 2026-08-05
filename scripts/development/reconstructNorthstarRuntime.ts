import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { FileGoogleDriveMetadataRepository } from "../../product/connectors/google-drive/repositories";
import {
  FilesystemOrganizationRuntimeRepository,
} from "../../engine/v3/runtime/organizationRuntimeRepository";
import { serializeLivingOrganizationReconstructionInputSnapshot } from "../../product/simulations/living-organization-sandbox/reconstructionInputSnapshot";
import {
  deriveNorthstarPackageFromMetadata,
  deriveNorthstarPackageFromRepository,
  NORTHSTAR_RECONSTRUCTION_INPUT_DIGEST,
  verifyNorthstarReconstructionPackage,
} from "../../product/simulations/living-organization-sandbox/northstarReconstructionPackage";
import { SANDBOX_ORGANIZATION_ID } from "../../product/simulations/living-organization-sandbox/manifest";
import { runLivingOrganizationSandboxIsolated } from "../../product/simulations/living-organization-sandbox/isolatedReplay";
import { NORTHSTAR_SCOPES } from "../../product/simulations/living-organization-sandbox/sourceScopeBindings";

const argumentsMap = new Map(process.argv.slice(2).flatMap((value, index, all) =>
  value.startsWith("--") ? [[value, all[index + 1]?.startsWith("--") ? "true" : all[index + 1] ?? "true"]] : []));
const apply = argumentsMap.has("--apply");
const exact = (name: string): string => {
  const value = argumentsMap.get(name)?.trim();
  if (!value || value === "true") throw new Error(`${name} is required.`);
  return value;
};
const sha256 = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");

function runtimeCounts(runtime: Awaited<ReturnType<FilesystemOrganizationRuntimeRepository["read"]>> extends infer T
  ? T extends { runtime: infer R } ? R : never : never) {
  const memory = runtime.memory as typeof runtime.memory & {
    evidence?: unknown[];
    evidenceAdmissions?: unknown[];
    evidenceProvenance?: unknown[];
    investigationOpportunities?: unknown[];
    mechanismNetwork?: { mechanisms: unknown[] };
    contradictions?: unknown[];
  };
  const index = runtime.memory.canonicalScopeLineageIndex;
  return {
    evidence: memory.evidence?.length ?? 0,
    admissions: memory.evidenceAdmissions?.length ?? 0,
    provenance: index?.sourceBindings.length ?? 0,
    attributions: index?.evidenceAttributions.length ?? 0,
    derivedLineage: index?.derivedLineages.length ?? 0,
    mechanisms: memory.mechanismNetwork?.mechanisms.length ?? 0,
    explanations: runtime.memory.organizationalExplanations.length,
    understandings: runtime.memory.organizationalUnderstandingState.canonicalCompositions?.length ?? 0,
    contradictions: memory.contradictions?.length ?? 0,
    investigations: memory.investigationOpportunities?.length ?? 0,
  };
}

async function main() {
  const organizationId = exact("--organization-id");
  const metadataFile = exact("--metadata-file");
  const expectedEmptyShellRevision = exact("--expected-empty-revision");
  if (organizationId !== SANDBOX_ORGANIZATION_ID) throw new Error("Exact Northstar organization is required.");
  const sourceId = process.env.DISCOVERY_SANDBOX_GOOGLE_DRIVE_CONNECTED_FOLDER_ID ?
    process.env.DISCOVERY_SANDBOX_GOOGLE_DRIVE_CONNECTED_FOLDER_ID : "";
  const googleFolderId = process.env.DISCOVERY_SANDBOX_GOOGLE_DRIVE_FOLDER_ID ?? "";
  const metadata = await new FileGoogleDriveMetadataRepository(metadataFile).read();
  const connectedFolderId = sourceId;
  const folder = metadata.folders.find((item) => item.id === connectedFolderId);
  if (!folder) throw new Error("Exact retained Northstar connected-folder binding is absent.");
  const packageA = await deriveNorthstarPackageFromRepository();
  const packageB = deriveNorthstarPackageFromMetadata({
    metadata,
    sourceId: folder.sourceId,
    connectedFolderId,
    googleFolderId,
  });
  const verifiedA = verifyNorthstarReconstructionPackage(packageA);
  const verifiedB = verifyNorthstarReconstructionPackage(packageB);
  assert.deepEqual(serializeLivingOrganizationReconstructionInputSnapshot(packageA), serializeLivingOrganizationReconstructionInputSnapshot(packageB));
  assert.equal(verifiedA.digest, verifiedB.digest);

  const retained = new FilesystemOrganizationRuntimeRepository();
  const before = await retained.read(organizationId);
  if (!before || before.revision !== expectedEmptyShellRevision) {
    throw new Error("Retained Northstar Runtime is not the exact expected empty shell.");
  }
  const beforeCounts = runtimeCounts(before.runtime);
  if (Object.values(beforeCounts).some((value) => value !== 0)) {
    throw new Error("Retained Northstar Runtime contains non-empty canonical state.");
  }

  const contentByDocument = new Map(packageB.records.map((record) => [
    record.logicalSourceId.replace(/^sandbox:/u, "").replace(/:v[^:]+$/u, ""),
    record.content,
  ]));
  const roots = await Promise.all([0, 1, 2].map(() => mkdtemp(path.join(os.tmpdir(), "discovery-living-organization-sandbox-reconstruction-003-"))));
  try {
    const candidates = [];
    const replayResults = [];
    for (let index = 0; index < roots.length; index += 1) {
      replayResults.push(await runLivingOrganizationSandboxIsolated({
        role: index === 1 ? "synthetic-drive" : "local-expected",
        sandboxRoot: roots[index]!,
        ...(index === 1 ? { documentContents: contentByDocument } : {}),
      }));
      const candidate = await new FilesystemOrganizationRuntimeRepository(path.join(roots[index]!, "runtime")).read(organizationId);
      if (!candidate) throw new Error("Candidate Runtime was not persisted by canonical replay.");
      candidates.push(candidate);
    }
    for (const candidate of candidates.slice(1)) {
      assert.deepEqual(candidate.bytes, candidates[0]!.bytes);
      assert.equal(candidate.revision, candidates[0]!.revision);
    }
    const selected = candidates[0]!;
    const counts = runtimeCounts(selected.runtime);
    const lineage = selected.runtime.memory.canonicalScopeLineageIndex;
    assert.ok(lineage && lineage.sourceBindings.length === 11 && lineage.evidenceAttributions.length > 0);
    assert.ok(lineage.evidenceAttributions.every((item) =>
      item.evidenceIdentityVersion === "2" &&
      item.evidenceId.startsWith("canonical-evidence:v2:") &&
      item.evidenceAdmissionId.startsWith("evidence-admission:v2:")));
    assert.ok(lineage.derivedLineages.some((item) => item.completeness === "complete"));
    assert.ok(counts.mechanisms > 0 && counts.explanations > 0 && counts.understandings > 0);
    assert.ok(replayResults.every((result) => result.negativeControls.length === 5 &&
      result.negativeControls.every((item) => !item.candidateCreated && !item.admitted && !item.materialChange)));
    for (const scope of [
      NORTHSTAR_SCOPES.organization,
      NORTHSTAR_SCOPES.engineering,
      NORTHSTAR_SCOPES.platformDelivery,
      NORTHSTAR_SCOPES.deliveryInitiative,
    ]) {
      assert.ok(lineage.derivedLineages.some((item) =>
        item.completeness === "complete" && item.assertions.some((assertion) =>
          assertion.scope.organizationId === scope.organizationId &&
          assertion.scope.type === scope.type && assertion.scope.id === scope.id)));
    }

    const restoreRoot = await mkdtemp(path.join(os.tmpdir(), "discovery-living-organization-sandbox-restore-check-"));
    try {
      const isolatedRepository = new FilesystemOrganizationRuntimeRepository(restoreRoot);
      const created = await isolatedRepository.create(organizationId, before.bytes, {
        requestId: "northstar-reconstruction-restore-check-create",
        operatorId: "local-development-reconstruction",
      });
      await isolatedRepository.backup(organizationId, "empty-shell", {
        requestId: "northstar-reconstruction-restore-check-backup",
        operatorId: "local-development-reconstruction",
      });
      const changed = await isolatedRepository.replace(organizationId, selected.bytes, created.revision, {
        requestId: "northstar-reconstruction-restore-check-replace",
        operatorId: "local-development-reconstruction",
      });
      const restored = await isolatedRepository.restore(organizationId, "empty-shell", changed.revision, {
        requestId: "northstar-reconstruction-restore-check-restore",
        operatorId: "local-development-reconstruction",
      });
      assert.deepEqual(restored.bytes, before.bytes);
    } finally {
      await rm(restoreRoot, { recursive: true, force: true });
    }

    if (apply) {
      if (exact("--expected-package-digest") !== NORTHSTAR_RECONSTRUCTION_INPUT_DIGEST) throw new Error("Expected package digest mismatch.");
      if (exact("--expected-candidate-digest") !== sha256(selected.bytes)) throw new Error("Expected candidate digest mismatch.");
      const current = await retained.read(organizationId);
      if (!current || current.revision !== expectedEmptyShellRevision) throw new Error("Concurrent Runtime change detected.");
      const rollbackFile = path.resolve(exact("--rollback-file"));
      const rollbackParent = await realpath(path.dirname(rollbackFile));
      const resolvedRollbackFile = path.join(rollbackParent, path.basename(rollbackFile));
      const temporaryRoots = await Promise.all([os.tmpdir(), "/tmp"].map(async (root) => `${await realpath(root)}${path.sep}`));
      if (!temporaryRoots.some((root) => resolvedRollbackFile.startsWith(root))) {
        throw new Error("Rollback file must be inside an approved operating-system temporary directory.");
      }
      try {
        await lstat(resolvedRollbackFile);
        throw new Error("Rollback file already exists.");
      } catch (error) {
        if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error;
      }
      await writeFile(resolvedRollbackFile, current.bytes, { mode: 0o600, flag: "wx" });
      const rollbackBytes = new Uint8Array(await readFile(resolvedRollbackFile));
      assert.deepEqual(rollbackBytes, current.bytes);
      try {
        await retained.replace(organizationId, selected.bytes, current.revision, {
          requestId: "northstar-runtime-reconstruction-versioned-package-003",
          operatorId: "local-development-reconstruction",
        });
        const reloaded = await new FilesystemOrganizationRuntimeRepository().read(organizationId);
        if (!reloaded) throw new Error("Reconstructed Runtime reload failed.");
        assert.deepEqual(reloaded.bytes, selected.bytes);
        assert.equal(reloaded.revision, selected.revision);
      } catch (error) {
        const partial = await retained.read(organizationId);
        if (partial && partial.revision !== current.revision) {
          await retained.replace(organizationId, rollbackBytes, partial.revision, {
            requestId: "northstar-runtime-reconstruction-versioned-package-003-rollback",
            operatorId: "local-development-reconstruction",
          });
        }
        throw error;
      }
    }

    console.log(JSON.stringify({
      result: "PASS",
      mode: apply ? "apply" : "dry-run",
      organization: "exact-northstar-sandbox",
      package: { contract: packageA.contractVersion, digest: verifiedA.digest, records: 16, uniqueDigests: 15, byteParity: true },
      before: { revision: before.revision, counts: beforeCounts },
      candidates: { cycles: 3, byteIdentical: true, revision: selected.revision, digest: sha256(selected.bytes), counts },
      retainedWrites: apply ? 1 : 0,
      rollbackRetained: apply,
      externalActivity: { connectorCalls: 0, driveReads: 0, driveWrites: 0, synchronizations: 0 },
    }));
  } finally {
    await Promise.all(roots.map((root) => rm(root, { recursive: true, force: true })));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Northstar reconstruction failed.");
  process.exitCode = 1;
});
