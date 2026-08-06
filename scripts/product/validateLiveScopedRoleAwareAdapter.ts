import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import type { AlphaOrganizationAccessRecord } from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { SANDBOX_PERSONAS, SANDBOX_ORGANIZATION_ID, type ResolvedSandboxPersona } from "../../lib/access/sandboxMultiUserAccess";
import { assertFrontendSafeSerialization } from "../../product/frontend/roleAwareLivingOrganization";
import { readLiveScopedRoleAwareProjection } from "../../product/integration/liveScopedRoleAwareAdapter";

const NOW = "2026-08-04T20:00:00.000Z";
const RETAINED = "/Users/garyepper/Desktop/Alpha-Sprint-14-main/.discovery-onboarding-runtime/organizations";
const EXPECTED = "824a4c2e3f86cf000e3f8442d2bf38a97b4281e545959a49bf2bc6f41bb8b047";
const sha = (value: Uint8Array | string) => createHash("sha256").update(value).digest("hex");
const persona = (index: number, label?: string): ResolvedSandboxPersona => ({ ...SANDBOX_PERSONAS[index]!, ...(label ? { label } : {}), userId: `user_syntheticlive${index}` });
const record = (p: ResolvedSandboxPersona, overrides: Partial<AlphaOrganizationAccessRecord> = {}): AlphaOrganizationAccessRecord => ({
  accessRecordId: `access:${p.key}`, policyId: "alpha-explicit-allowlist-disclosure", policyVersion: "1",
  consumerId: p.userId, organizationId: SANDBOX_ORGANIZATION_ID, relationship: "allowed_alpha_user",
  supportedExperiences: ["organization"], scope: { type: "organization", organizationId: SANDBOX_ORGANIZATION_ID },
  status: "active", createdAt: "2026-08-04T12:00:00.000Z", ...overrides,
});
const semantic = (value: unknown) => sha(JSON.stringify(value));

async function read(
  p: ResolvedSandboxPersona,
  records = [record(p)],
  mutateRuntime?: (runtime: Record<string, unknown>) => void,
) {
  let reads = 0;
  const repository = new FilesystemOrganizationRuntimeRepository(RETAINED);
  const result = await readLiveScopedRoleAwareProjection({ userId: p.userId, organizationId: SANDBOX_ORGANIZATION_ID, persona: p, accessRecords: records, runtimeRepository: { read: async (id) => {
    reads += 1;
    const stored = await repository.read(id);
    if (stored && mutateRuntime) mutateRuntime(stored.runtime as unknown as Record<string, unknown>);
    return stored;
  } }, evaluatedAt: NOW });
  return { result, reads };
}

async function main() {
  const path = `${RETAINED}/${SANDBOX_ORGANIZATION_ID}.json`;
  assert.equal(sha(readFileSync(path)), EXPECTED);
  const authorized = [];
  for (let index = 0; index < 3; index += 1) {
    const { result, reads } = await read(persona(index));
    assert.equal(result.disposition, "authorized");
    assert.equal(reads, 1);
    if (result.disposition !== "authorized") throw new Error("authorized path denied");
    assert.equal(Object.hasOwn(result, "runtimeReads"), false);
    assert.equal(result.genericProjection.items.length, 0);
    assert.equal(result.canonicalProjection.understandings.length, 2);
    assert.equal(result.canonicalProjection.explanations.length, 1);
    assert.equal(result.canonicalProjection.conditions.length, 7);
    assert.equal(result.canonicalProjection.investigations.length, 9);
    assert.equal(result.canonicalProjection.evolution.length, 0);
    assert.equal(result.canonicalProjection.evidence.length, 12);
    assert.ok(result.experience.understanding.synthesis.trim());
    assert.equal(result.experience.user.role, result.personaLabel);
    assert.equal(result.experience.understanding.originalQuestion, "Original question unavailable");
    assertFrontendSafeSerialization(result.canonicalProjection);
    assertFrontendSafeSerialization(result.genericProjection);
    assertFrontendSafeSerialization(result.experience);
    const projection = structuredClone(result.canonicalProjection);
    projection.projectionId = "normalized";
    projection.consumerId = "normalized";
    projection.disclosureDecisionId = "normalized";
    authorized.push({ key: pKey(index), digest: semantic(projection), result });
  }
  assert.equal(new Set(authorized.map((item) => item.digest)).size, 1);
  const renamed = await read(persona(1, "Changed descriptive title"));
  assert.equal(renamed.result.disposition, "authorized");
  if (renamed.result.disposition !== "authorized") throw new Error("renamed path denied");
  assert.deepEqual(renamed.result.canonicalProjection, authorized[1]!.result.canonicalProjection);
  assert.deepEqual(renamed.result.genericProjection, authorized[1]!.result.genericProjection);
  const standardExperience = structuredClone(authorized[1]!.result.experience);
  const renamedExperience = structuredClone(renamed.result.experience);
  standardExperience.user.role = "normalized";
  renamedExperience.user.role = "normalized";
  assert.deepEqual(renamedExperience, standardExperience);

  const decoy = "FORBIDDEN_RAW_RUNTIME_QUESTION_7f51";
  const decoyRead = await read(persona(1), [record(persona(1))], (runtime) => {
    const memory = runtime.memory as Record<string, unknown>;
    memory.understandingSnapshots = [{ question: decoy, timestamp: NOW }];
    memory.events = [{ question: decoy, timestamp: NOW }];
    memory.currentUnderstandings = [{ summary: decoy }];
  });
  assert.equal(decoyRead.result.disposition, "authorized");
  if (decoyRead.result.disposition !== "authorized") throw new Error("decoy path denied");
  assert.deepEqual(decoyRead.result.experience, authorized[1]!.result.experience);
  assert.doesNotMatch(JSON.stringify(decoyRead.result.experience), new RegExp(decoy));

  const manager = persona(2);
  for (const records of [[], [record(manager, { status: "revoked", revokedAt: NOW })], [record(manager), record(manager, { accessRecordId: "fork", supersedesAccessRecordId: "missing" })]]) {
    const { result, reads } = await read(manager, records);
    assert.equal(result.disposition, "denied");
    assert.equal(reads, 0);
    assert.deepEqual(Object.keys(result), ["disposition"]);
    for (const forbidden of ["runtimeReads", "personaLabel", "scopeLabel", "canonicalProjection", "genericProjection", "experience", "sourceRevision", "sourceRevisionDigest"]) assert.equal(Object.hasOwn(result, forbidden), false);
  }
  const mismatch = await readLiveScopedRoleAwareProjection({ userId: "user_other", organizationId: SANDBOX_ORGANIZATION_ID, persona: manager, accessRecords: [record(manager)], runtimeRepository: { read: async () => { throw new Error("must not read"); } }, evaluatedAt: NOW });
  assert.equal(mismatch.disposition, "denied");
  assert.deepEqual(Object.keys(mismatch), ["disposition"]);
  assert.equal(sha(readFileSync(path)), EXPECTED);

  const source = readFileSync("product/integration/liveScopedRoleAwareAdapter.ts", "utf8");
  assert.equal((source.match(/composeActivatedYourOrganization\(/g) ?? []).length, 1);
  assert.ok(source.indexOf("preflightAlphaOrganizationAccess") < source.indexOf("runtimeRepository.read"));
  assert.doesNotMatch(source, /sourcePopulator|scopeSelector|projectionReader/);
  assert.doesNotMatch(source, /runtimeReads/);
  console.log(JSON.stringify({ status: "PASS", accounts: authorized.map(({ key, digest, result }) => ({ account: key, displayedRole: result.experience.user.role, scope: result.scopeLabel, compositions: result.canonicalProjection.understandings.length, understandings: result.canonicalProjection.understandings.length, explanations: result.canonicalProjection.explanations.length, evidenceReferences: result.canonicalProjection.evidence.length, conditions: result.canonicalProjection.conditions.length, investigations: result.canonicalProjection.investigations.length, semanticDigest: digest })), semanticDigestsIdentical: true, genericItems: 0, callCounts: { authorizedRuntimeReads: 1, deniedRuntimeReads: 0 }, deniedShape: ["disposition"], decoyQuestionAbsent: true, roleLabelNeutrality: true, retainedRuntimeDigest: EXPECTED, externalActivity: { network: 0, connectorCalls: 0, driveReads: 0, driveWrites: 0 } }));
}
function pKey(index: number) { return ["CEO", "Engineering Director", "Platform Manager"][index]!; }
main().catch((error) => { console.error(error instanceof Error ? error.message : "validation failed"); process.exitCode = 1; });
