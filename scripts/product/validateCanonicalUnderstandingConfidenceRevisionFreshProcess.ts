import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

import { resolveScopedGovernanceContext } from "../../engine/v3/governance/scopedGovernanceContext";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { CANONICAL_UNDERSTANDING_REVISION_OPERATION, CanonicalOrganizationalUnderstandingRevisionService } from "../../engine/v3/understanding/canonicalOrganizationalUnderstandingRevisionService";
import type { CanonicalUnderstandingComposition } from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";

const organizationId = "confidence-fresh-process-001";
const actorRef = "actor-fresh-process-001";
const at = "2026-08-10T13:00:00.000Z";
const purpose = "leadership-conversation-capture";
const stableUnderstandingId = "organizational-understanding:fresh-process-001";

function authorization() {
  const scope = { organizationId, type: "organization" as const, id: organizationId };
  return resolveScopedGovernanceContext({ organizationId, subjectId: actorRef, requestedScope: scope, operation: CANONICAL_UNDERSTANDING_REVISION_OPERATION, purpose, sensitivity: "standard", evaluatedAt: at, temporal: { mode: "current" }, serverResolvedAuthority: [{ authorityRef: "authority:fresh:v1", policyRef: "policy:fresh:v1", organizationId, subjectId: actorRef, scope, operations: [CANONICAL_UNDERSTANDING_REVISION_OPERATION], sensitivity: ["standard"], relationship: "direct", status: "active", validFrom: "2026-01-01T00:00:00.000Z" }] });
}

async function processA(root: string, manifestPath: string) {
  const repository = new FilesystemOrganizationRuntimeRepository(root);
  const runtime = createEmptyOrganizationRuntime({ organizationId, now: at });
  const composition: CanonicalUnderstandingComposition = { id: stableUnderstandingId, revisionId: `${stableUnderstandingId}:conclusion:1`, previousRevisionId: null, organizationId, scope: { organizationId, type: "organization", id: organizationId }, outcomeRef: { type: "phenomenon", id: "fresh-outcome" }, explanationIds: [], authorityTransition: { authorityOwner: "canonical-organizational-understanding", contributionDecisionOwner: "canonical-understanding-contribution-validation", persistenceOwner: "organization-runtime", disclosureOwner: "application-boundary-not-evaluated", explanationIds: [], disposition: "authorized-organizational-knowledge", basis: ["existing-production-semantics-satisfied"] }, compositionUncertainty: ["comparative-role-data-unavailable"], createdAt: at, updatedAt: at };
  runtime.memory.organizationalUnderstandingState.canonicalCompositions = [composition];
  const created = await repository.create(organizationId, new TextEncoder().encode(JSON.stringify(runtime, null, 2)), { requestId: "fresh-create", operatorId: actorRef });
  const service = new CanonicalOrganizationalUnderstandingRevisionService(repository, { now: () => at });
  const result = await service.revise({ contractVersion: "1", organizationId, questionId: "fresh-question", stableUnderstandingId, expectedPredecessorRevisionId: composition.revisionId, confidence: 0.81, uncertainty: ["comparative-role-data-unavailable"], supportingMaterialRefs: ["evidence:fresh:1"], contradictingMaterialRefs: [], interpretationVersion: "canonical-understanding-confidence:v1", purpose, sensitivity: "standard", actorRef, occurredAt: at, idempotencyKey: "fresh-process-operation", expectedRuntimeRevision: created.revision, authorization: authorization(), operation: { requestId: "fresh-revise", operatorId: actorRef } });
  await writeFile(manifestPath, JSON.stringify({ stableUnderstandingId, revisionId: result.receipt.revisionId, receiptDigest: result.receipt.receiptDigest }));
}

async function processB(root: string, manifestPath: string) {
  const expected = JSON.parse(await readFile(manifestPath, "utf8")) as { stableUnderstandingId: string; revisionId: string; receiptDigest: string };
  const stored = await new FilesystemOrganizationRuntimeRepository(root).read(organizationId);
  assert.ok(stored);
  const state = stored.runtime.memory.organizationalUnderstandingState;
  const composition = state.canonicalCompositions?.find((item) => item.id === expected.stableUnderstandingId);
  assert.ok(composition);
  assert.equal(composition.currentEpistemicRevisionId, expected.revisionId);
  assert.equal(composition.epistemicRevisions?.at(-1)?.confidence, 0.81);
  assert.equal(state.canonicalRevisionOperations?.at(-1)?.receiptDigest, expected.receiptDigest);
}

async function parent() {
  const root = await mkdtemp(path.join(os.tmpdir(), "discovery-confidence-fresh-process-"));
  const manifestPath = path.join(root, "safe-manifest.json");
  try {
    for (const mode of ["process-a", "process-b"] as const) {
      const child = spawnSync(process.execPath, ["--import", "tsx", __filename, mode, root, manifestPath], { encoding: "utf8" });
      if (child.status !== 0) throw new Error(child.stderr || child.stdout || `${mode} failed`);
    }
    console.log("Canonical Understanding confidence revision fresh-process validation: PASS");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function main() {
  const [mode, root, manifestPath] = process.argv.slice(2);
  if (mode === "process-a" && root && manifestPath) return processA(root, manifestPath);
  if (mode === "process-b" && root && manifestPath) return processB(root, manifestPath);
  return parent();
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Fresh-process validation failed.");
  process.exitCode = 1;
});
