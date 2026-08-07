import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { runDiscoveryV3 } from "../../engine/v3";
import {
  createCanonicalDerivedArtifactGovernanceAncestry,
  resolveCanonicalMaterialSupports,
  validateCanonicalDerivedArtifactGovernanceAncestry,
  validateCanonicalDerivedArtifactGovernanceAncestryGraph,
  type CanonicalAncestryConstructionContext,
} from "../../engine/v3/governance/canonicalDerivedArtifactGovernanceAncestry";
import {
  admitCanonicalEvidenceScopeLineage,
  createCanonicalScopeLineageIndex,
  createCanonicalScopeTopology,
  createCanonicalSourceScopeBinding,
  readCanonicalScopeLineageTopology,
  resolveCurrentSourceScopeBinding,
} from "../../engine/v3/governance/canonicalScopeLineage";
import { resolveScopedGovernanceContext } from "../../engine/v3/governance/scopedGovernanceContext";
import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import {
  FilesystemOrganizationRuntimeRepository,
  RuntimeStorageConflictError,
} from "../../engine/v3/runtime/organizationRuntimeRepository";
import { produceCanonicalUnderstandingAudienceLineage } from "../../engine/v3/understanding/produceCanonicalUnderstandingAudienceLineage";
import { resolveCanonicalUnderstandingCurrentEligibility } from "../../engine/v3/understanding/resolveCanonicalUnderstandingCurrentEligibility";
import { createDurableProductQuestion } from "../../product/questions/questionLifecycle";
import { atlasIndustrialArtifacts } from "../../engine/benchmark/judgment-lab/atlasIndustrialPilot";
import { buildGenericScopedProductSource } from "../../product/integration/runtimeToScopedProductSource";
import { readScopedOrganizationalProductProjection } from "../../product/integration/scopedOrganizationalProductProjection";

const ORG = "fresh-process-canonical-ancestry";
const ACTOR = "subject:fresh-process";
const QUESTION = "question:fresh-process";
const PURPOSE = QUESTION;
const AT_A = "2026-08-07T12:00:00.000Z";
const AT_B = "2026-08-07T12:01:00.000Z";
const AT_C = "2026-08-07T12:02:00.000Z";
const sha = (value: string): string => createHash("sha256").update(value).digest("hex");
const bytes = (value: unknown): Uint8Array => new TextEncoder().encode(JSON.stringify(value, null, 2));
const scope = { organizationId: ORG, type: "organization" as const, id: ORG };

function runGovernedOperation(input: {
  runtime: ReturnType<typeof createEmptyOrganizationRuntime>;
  sourceId: string;
  text: string;
  at: string;
}) {
  const topology = createCanonicalScopeTopology({
    organizationId: ORG, topologyVersion: 1, effectiveAt: AT_A,
    nodes: [scope], relationships: [],
  });
  const contentDigest = sha(input.text);
  const binding = createCanonicalSourceScopeBinding({
    organizationId: ORG,
    bindingVersion: 1,
    source: { sourceId: input.sourceId, sourceVersion: "1", normalizedContentDigest: contentDigest },
    topology,
    assertions: [{ relationship: "origin", scope }],
    basisRefs: [`product-question:${QUESTION}`, `purpose:${PURPOSE}`],
    effectiveAt: input.at,
    sourceType: "manual-takeaway",
    purposeRef: PURPOSE,
    availability: "available",
  });
  const discoveryInput = {
    company: "Fresh Process",
    website: "https://fresh-process.invalid",
    industry: "Validation",
    question: "What changed?",
    context: "",
    evidenceSources: [{
      sourceId: input.sourceId,
      sourceType: "paste" as const,
      observedAt: input.at,
      contentDigest,
      content: input.text,
    }],
  };
  const prior = input.runtime.memory.canonicalScopeLineageIndex;
  const result = runDiscoveryV3(discoveryInput, {
    organizationId: ORG,
    effectiveAt: input.at,
    topologyRevisions: [topology],
    sourceBindingRevisions: [...(prior?.sourceBindings ?? []), binding],
    existingEvidenceAttributions: prior?.evidenceAttributions ?? [],
  });
  const saved = console.log;
  try {
    console.log = () => {};
    return evolveOrganizationRuntime({
      runtime: input.runtime,
      result,
      input: discoveryInput,
      semanticTime: input.at,
    });
  } finally {
    console.log = saved;
  }
}

async function roleA(root: string): Promise<void> {
  const repository = new FilesystemOrganizationRuntimeRepository(root);
  let runtime = createEmptyOrganizationRuntime({ organizationId: ORG, name: "Fresh", now: AT_A });
  runtime = createDurableProductQuestion({ runtime, title: "What changed?", questionId: QUESTION, createdAt: AT_A }).runtime;
  runtime = runGovernedOperation({ runtime, sourceId: "source:a", text: atlasIndustrialArtifacts.map((item) => item.content).join("\n\n"), at: AT_A });
  assert.ok(runtime.memory.theories.some((theory) => theory.canonicalGovernanceAncestry));
  await repository.create(ORG, bytes(runtime), { requestId: "process-a", operatorId: ACTOR });
}

async function roleB(root: string): Promise<void> {
  const repository = new FilesystemOrganizationRuntimeRepository(root);
  const stored = await repository.read(ORG); assert.ok(stored);
  const index = stored.runtime.memory.canonicalScopeLineageIndex; assert.ok(index);
  const priorTheory = stored.runtime.memory.theories[0]!;
  const priorAncestry = priorTheory.canonicalGovernanceAncestry!;
  validateCanonicalDerivedArtifactGovernanceAncestry(priorAncestry);
  const runtime = runGovernedOperation({ runtime: stored.runtime, sourceId: "source:b", text: atlasIndustrialArtifacts.map((item) => `Second operation confirms: ${item.content}`).join("\n\n"), at: AT_B });
  const theory = runtime.memory.theories.find((item) => item.canonicalGovernanceAncestryHistory?.length) ?? runtime.memory.theories[0]!;
  validateCanonicalDerivedArtifactGovernanceAncestryGraph({ root: theory.canonicalGovernanceAncestry!, ancestors: theory.canonicalGovernanceAncestryHistory ?? [] });
  assert.ok(runtime.memory.organizationalExplanations.some((explanation) => explanation.canonicalGovernanceLineage));
  assert.ok((runtime.memory.organizationalUnderstandingState.canonicalCompositions ?? []).length > 0);
  await repository.replace(ORG, bytes(runtime), stored.revision, { requestId: "process-b", operatorId: ACTOR });
}

function authorization(at: string) {
  return resolveScopedGovernanceContext({
    organizationId: ORG, subjectId: ACTOR, requestedScope: scope,
    operation: "understanding:disclose-derived", purpose: PURPOSE,
    sensitivity: "standard", evaluatedAt: at, temporal: { mode: "current" },
    serverResolvedAuthority: [{ authorityRef: "authority:fresh", policyRef: "policy:fresh:v1", organizationId: ORG, subjectId: ACTOR, scope, operations: ["understanding:disclose-derived"], sensitivity: ["standard"], relationship: "direct", status: "active", validFrom: AT_A }],
  });
}

async function roleC(root: string): Promise<void> {
  const repository = new FilesystemOrganizationRuntimeRepository(root);
  const before = await repository.read(ORG); assert.ok(before);
  const index = before.runtime.memory.canonicalScopeLineageIndex; assert.ok(index);
  const topology = readCanonicalScopeLineageTopology(index); assert.ok(topology);
  const explanation = before.runtime.memory.organizationalExplanations[0]!;
  const compositions = before.runtime.memory.organizationalUnderstandingState.canonicalCompositions ?? [];
  const lineage = produceCanonicalUnderstandingAudienceLineage({ organizationId: ORG, compositions, explanations: [explanation], scopeLineageIndex: index, scopeTopology: topology });
  const supports = explanation.canonicalGovernanceLineage!.materialSupports;
  const resolveAt = (currentIndex: typeof index, runtimeRevision: string, at: string) => resolveCanonicalUnderstandingCurrentEligibility({ contractVersion: "1", organizationId: ORG, subjectId: ACTOR, purposeRef: PURPOSE, requestedScope: scope, sensitivity: "standard", evaluatedAt: at, authorizationContextRef: authorization(at).contextId, canonicalUnderstandingRevision: runtimeRevision, audienceLineageDigest: lineage.digest, lineagePolicyVersion: "conservative-material-ancestor.v1", materialSupports: supports }, {
    authorization: authorization(at),
    isPurposeCompatible: ({ requestedPurpose, materialPurposeRefs }) => materialPurposeRefs.includes(requestedPurpose),
    resolveCurrentSourceBinding: ({ historicalBindingId, historicalGovernanceRevisionRef }) => {
      const historical = currentIndex.sourceBindings.find((item) => item.bindingId === historicalBindingId && item.digest === historicalGovernanceRevisionRef);
      if (!historical) return undefined;
      const current = resolveCurrentSourceScopeBinding(currentIndex.sourceBindings.filter((item) => item.source.sourceId === historical.source.sourceId), at);
      if (!current) return undefined;
      return { organizationId: ORG, historicalBindingId, currentBindingRevisionRef: current.bindingId, currentGovernanceRevisionRef: current.digest, availability: current.availability ?? "unavailable", purposeRefs: current.purposeRef ? [current.purposeRef] : [], scopes: current.assertions.map((item) => item.scope) };
    },
  });
  const project = (stored: typeof before, eligibility: ReturnType<typeof resolveAt>) => readScopedOrganizationalProductProjection({
    authenticatedUserId: ACTOR,
    organizationId: ORG,
    context: authorization(AT_C),
    repository: { readAuthorizedSource: () => buildGenericScopedProductSource({ stored, organizationId: ORG, requestedScope: scope, currentEligibility: eligibility }) },
  });
  const eligible = resolveAt(index, before.revision, AT_C);
  assert.equal(eligible.disposition, "eligible");
  assert.equal(project(before, eligible).disposition, "available");
  const inheritedRef = supports[0]!.sourceBindingRefs[0]!;
  const inherited = index.sourceBindings.find((item) => item.bindingId === inheritedRef.sourceBindingId)!;
  const revoked = createCanonicalSourceScopeBinding({ organizationId: ORG, bindingVersion: inherited.bindingVersion + 1, source: inherited.source, topology, assertions: inherited.assertions, basisRefs: inherited.basisRefs, effectiveAt: AT_C, supersedesBindingId: inherited.bindingId, sourceType: inherited.sourceType!, purposeRef: inherited.purposeRef!, availability: "revoked" });
  const nextIndex = createCanonicalScopeLineageIndex({ organizationId: ORG, topology, sourceBindings: [...index.sourceBindings, revoked], evidenceAttributions: index.evidenceAttributions, derivedLineages: index.derivedLineages });
  const runtime = structuredClone(before.runtime); runtime.memory.canonicalScopeLineageIndex = nextIndex;
  const theoryBytes = sha(JSON.stringify(runtime.memory.theories));
  const explanationBytes = sha(JSON.stringify(runtime.memory.organizationalExplanations));
  const compositionBytes = sha(JSON.stringify(runtime.memory.organizationalUnderstandingState.canonicalCompositions));
  await repository.replace(ORG, bytes(runtime), before.revision, { requestId: "process-c-revoke", operatorId: ACTOR });
  const reloaded = await repository.read(ORG); assert.ok(reloaded?.runtime.memory.canonicalScopeLineageIndex);
  const withheld = resolveAt(reloaded.runtime.memory.canonicalScopeLineageIndex, reloaded.revision, AT_C);
  assert.equal(withheld.disposition, "withheld");
  assert.equal(project(reloaded, withheld).disposition, "withheld");
  assert.equal(sha(JSON.stringify(reloaded.runtime.memory.theories)), theoryBytes);
  assert.equal(sha(JSON.stringify(reloaded.runtime.memory.organizationalExplanations)), explanationBytes);
  assert.equal(sha(JSON.stringify(reloaded.runtime.memory.organizationalUnderstandingState.canonicalCompositions)), compositionBytes);
}

async function roleD(root: string): Promise<void> {
  const repository = new FilesystemOrganizationRuntimeRepository(root);
  const before = await repository.read(ORG); assert.ok(before);
  const ancestry = before.runtime.memory.theories[0]!.canonicalGovernanceAncestry!;
  assert.throws(() => validateCanonicalDerivedArtifactGovernanceAncestry({ ...ancestry, contractVersion: "bad" } as never));
  const afterValidation = await repository.read(ORG); assert.equal(afterValidation?.revision, before.revision);
  const winner = structuredClone(before.runtime); winner.memory.events.push({ kind: "cas-winner" });
  const won = await repository.replace(ORG, bytes(winner), before.revision, { requestId: "process-d-winner", operatorId: ACTOR });
  const loser = structuredClone(before.runtime); loser.memory.events.push({ kind: "cas-loser" });
  await assert.rejects(() => repository.replace(ORG, bytes(loser), before.revision, { requestId: "process-d-loser", operatorId: ACTOR }), RuntimeStorageConflictError);
  const retained = await repository.read(ORG); assert.equal(retained?.revision, won.revision); assert.deepEqual(retained?.bytes, won.bytes);
}

async function worker(role: string, root: string): Promise<void> {
  if (role === "A") await roleA(root);
  else if (role === "B") await roleB(root);
  else if (role === "C") await roleC(root);
  else if (role === "D") await roleD(root);
  else throw new Error("Unknown role.");
}

async function main(): Promise<void> {
  const [role, root] = process.argv.slice(2);
  if (role) {
    const saved = console.log; console.log = () => {};
    const savedWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = ((..._args: Parameters<typeof process.stdout.write>) => true) as typeof process.stdout.write;
    try { await worker(role, root!); } finally { console.log = saved; process.stdout.write = savedWrite; }
    return;
  }

  const directory = mkdtempSync(join(tmpdir(), "discovery-ancestry-persisted-ad-"));
  try {
    const executable = join(process.cwd(), "node_modules", ".bin", "tsx");
    const file = process.argv[1]!;
    for (const processRole of ["A", "B", "C", "D"]) {
      const result = spawnSync(executable, [file, processRole, directory], { encoding: "utf8", shell: false, timeout: 20_000, maxBuffer: 32_768, env: { PATH: process.env.PATH ?? "/usr/bin:/bin", NODE_ENV: "test", TMPDIR: "/tmp", NO_PROXY: "*", no_proxy: "*" } });
      assert.equal(result.status, 0, `persisted process ${processRole} failed: ${result.error?.message ?? result.stderr}`);
      assert.equal(result.signal, null);
      assert.equal(result.stdout, "");
      assert.equal(result.stderr, "");
    }
    console.log(JSON.stringify({ result: "PASS", freshProcesses: 4, actualRuntimeRepository: true, actualRuntimeEvolution: true, actualScopeAdmission: true, actualTheoryOwner: true, actualExplanationOwner: true, actualCompositionOwner: true, actualAuthorizedProjection: true, persistedRevocation: true, casConflictProof: true, externalActivity: { network: 0, connector: 0, drive: 0, production: 0 } }));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

void main();
