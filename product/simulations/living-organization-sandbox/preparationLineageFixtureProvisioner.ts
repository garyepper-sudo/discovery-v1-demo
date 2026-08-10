import "server-only";

import { createHash } from "node:crypto";
import { lstat, readFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { runDiscoveryV3 } from "../../../engine/v3";
import { CanonicalLocalSourceBindingService } from "../../../engine/v3/governance/canonicalLocalSourceBindingService";
import { createCanonicalScopeLineageIndex, readCanonicalScopeLineageTopology, resolveCurrentSourceScopeBinding } from "../../../engine/v3/governance/canonicalScopeLineage";
import { resolveScopedGovernanceContext, type ScopedGovernanceOperation } from "../../../engine/v3/governance/scopedGovernanceContext";
import { evolveOrganizationRuntime } from "../../../engine/v3/runtime/evolveOrganizationRuntime";
import { produceCanonicalUnderstandingAudienceLineage } from "../../../engine/v3/understanding/produceCanonicalUnderstandingAudienceLineage";
import { resolveCanonicalUnderstandingCurrentEligibility } from "../../../engine/v3/understanding/resolveCanonicalUnderstandingCurrentEligibility";
import { createEmptyOrganizationRuntime } from "../../../engine/v3/runtime/organizationRuntime";
import { FilesystemOrganizationRuntimeRepository } from "../../../engine/v3/runtime/organizationRuntimeRepository";
import { GovernedSourceContentService } from "../../../engine/v3/sources/governedSourceContentService";
import { createFilesystemSourceContentRepository } from "../../../engine/v3/sources/sourceContentRepository";
import { decodeAndNormalizeSourceContent, sourceContentDigest } from "../../../engine/v3/sources/sourceContentDeterminism";
import { buildGenericScopedProductSource } from "../../integration/runtimeToScopedProductSource";
import { readScopedOrganizationalProductProjection } from "../../integration/scopedOrganizationalProductProjection";
import { northstarScopeTopology } from "./sourceScopeBindings";
import { SANDBOX_ORGANIZATION_ID, SANDBOX_PRIMARY_QUESTION, sandboxManifest } from "./manifest";

const PURPOSE = "leadership-conversation-capture" as const;
const ACTOR = "person:northstar-preparation-lineage-fixture";
const QUESTION_ID = "product-question:northstar-implementation-duration";
const POLICY = "conservative-material-ancestor.v1";
const stable = (value: unknown): string => Array.isArray(value) ? `[${value.map(stable).join(",")}]` : value && typeof value === "object" ? `{${Object.entries(value as Record<string, unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>`${JSON.stringify(key)}:${stable(item)}`).join(",")}}` : JSON.stringify(value);
const digest = (value: unknown): string => createHash("sha256").update(typeof value === "string" ? value : stable(value)).digest("hex");

export type NorthstarPreparationLineageSeedV1 = {
  contractVersion: "1";
  organizationId: typeof SANDBOX_ORGANIZATION_ID;
  semanticOwner: "leadership-conversation";
  productQuestionId: string;
  creationOperationId: string;
  lineagePolicyVersion: typeof POLICY;
  sourceBindings: Array<{ sourceBindingId: string; bindingRevisionId: string }>;
  sourceContentVersions: Array<{ sourceContentVersionId: string; normalizedContentDigest: string }>;
  canonicalMaterial: Array<{ canonicalObjectId: string; revisionRef: string; owner: "canonical-evidence-admission" }>;
  canonicalUnderstandingRevision: string;
  projectionSourceRef: string;
  seedDigest: string;
};

export type NorthstarPreparationLineageProvisioningResult = {
  disposition: "provisioned" | "idempotent-replay";
  seed: NorthstarPreparationLineageSeedV1;
  counts: { sources: number; material: number; understandings: number };
  runtimeRevision: string;
};

export type NorthstarPreparationLineageProvisioningInput = {
  environment: "development" | "sandbox" | "test";
  fixtureRoot: string;
  now?: string;
};

function authorization(operation: ScopedGovernanceOperation, at: string) {
  const scope = { organizationId: SANDBOX_ORGANIZATION_ID, type: "organization" as const, id: SANDBOX_ORGANIZATION_ID };
  return resolveScopedGovernanceContext({ organizationId: SANDBOX_ORGANIZATION_ID, subjectId: ACTOR, requestedScope: scope, operation, purpose: PURPOSE, sensitivity: "standard", evaluatedAt: at, temporal: { mode: "current" }, serverResolvedAuthority: [{ authorityRef: "authority:northstar-preparation-lineage-fixture", policyRef: "policy:northstar-preparation-lineage-fixture:v1", organizationId: SANDBOX_ORGANIZATION_ID, subjectId: ACTOR, scope, operations: [operation], sensitivity: ["standard"], relationship: "direct", status: "active", validFrom: sandboxManifest.replayTimestamps[0] }] });
}

async function safeFixtureRoot(root: string): Promise<string> {
  if (!path.isAbsolute(root)) throw new Error("Northstar fixture root must be absolute.");
  const actual = await realpath(root);
  const temporary = await realpath(tmpdir());
  if (!actual.startsWith(`${temporary}${path.sep}`) || !path.basename(actual).startsWith("discovery-northstar-preparation-lineage-")) throw new Error("Northstar fixture root is outside the isolated fixture boundary.");
  const status = await lstat(actual);
  if (!status.isDirectory() || status.isSymbolicLink()) throw new Error("Northstar fixture root is unsafe.");
  return actual;
}

function runtimeBytes(value: unknown): Uint8Array { return new TextEncoder().encode(JSON.stringify(value, null, 2)); }

export async function provisionNorthstarPreparationLineageFixture(input: NorthstarPreparationLineageProvisioningInput): Promise<NorthstarPreparationLineageProvisioningResult> {
  if (!(["development", "sandbox", "test"] as string[]).includes(input.environment)) throw new Error("Northstar preparation lineage provisioning is development-only.");
  const root = await safeFixtureRoot(input.fixtureRoot);
  const at = input.now ?? sandboxManifest.replayTimestamps[1];
  const runtimeRepository = new FilesystemOrganizationRuntimeRepository(path.join(root, "runtime"));
  const sourceRepository = createFilesystemSourceContentRepository({ root: path.join(root, "discovery-governed-source-content-northstar-preparation"), environment: input.environment });
  let stored = await runtimeRepository.read(SANDBOX_ORGANIZATION_ID);
  let replay = Boolean(stored);
  if (!stored) {
    const runtime = createEmptyOrganizationRuntime({ organizationId: SANDBOX_ORGANIZATION_ID, name: sandboxManifest.organization.name, now: at });
    runtime.memory.canonicalScopeLineageIndex = createCanonicalScopeLineageIndex({ organizationId: SANDBOX_ORGANIZATION_ID, topology: northstarScopeTopology });
    stored = await runtimeRepository.create(SANDBOX_ORGANIZATION_ID, runtimeBytes(runtime), { requestId: "northstar-preparation-lineage:create", operatorId: ACTOR });
  }
  const clock = { now: () => at };
  const bindingService = new CanonicalLocalSourceBindingService(runtimeRepository, clock);
  const bindingResolver = { loadRevisions: async ({ organizationId, sourceBindingId }: { organizationId: string; sourceBindingId: string }) => {
    const loaded = await runtimeRepository.read(organizationId);
    const all = loaded?.runtime.memory.canonicalScopeLineageIndex?.sourceBindings ?? [];
    const target = all.find(item => item.bindingId === sourceBindingId);
    return target ? all.filter(item => item.source.sourceId === target.source.sourceId) : [];
  } };
  const contentService = new GovernedSourceContentService(sourceRepository, bindingResolver, clock);
  const scope = { organizationId: SANDBOX_ORGANIZATION_ID, type: "organization" as const, id: SANDBOX_ORGANIZATION_ID };
  const documents = sandboxManifest.documents.filter(item => item.negativeControl === null && ["batch-0", "batch-1"].includes(item.batchId));
  const bindings: NorthstarPreparationLineageSeedV1["sourceBindings"] = [];
  const versions: NorthstarPreparationLineageSeedV1["sourceContentVersions"] = [];
  const evidenceSources: Array<{ sourceId: string; sourceType: "upload"; observedAt: string; contentDigest: string; content: string }> = [];
  for (const document of documents) {
    const bytes = new Uint8Array(await readFile(path.join(process.cwd(), "product/simulations/living-organization-sandbox", document.relativePath)));
    if (sourceContentDigest(bytes) !== document.sha256) throw new Error("Committed Northstar source integrity failed.");
    const normalized = decodeAndNormalizeSourceContent(bytes);
    stored = (await runtimeRepository.read(SANDBOX_ORGANIZATION_ID))!;
    const binding = await bindingService.registerCanonicalLocalSourceBinding({ contractVersion: "1", organizationId: SANDBOX_ORGANIZATION_ID, productQuestionId: QUESTION_ID, sourceType: "markdown-upload", purposeRef: PURPOSE, normalizedContentDigest: sourceContentDigest(new TextEncoder().encode(normalized.normalizedText)), requestedScopeAssertions: [{ relationship: "applies-to", scope }], sensitivity: "standard", recordedAt: at, recordedByActorRef: ACTOR, idempotencyKey: `northstar-preparation-binding:${document.id}:v1`, expectedRuntimeRevision: stored.revision, operation: { requestId: `northstar-preparation-binding:${document.id}`, operatorId: ACTOR }, authorization: authorization("source-binding:register-local", at) });
    const resolvedBinding = await bindingService.resolveCanonicalCurrentSourceBinding({ contractVersion: "1", organizationId: SANDBOX_ORGANIZATION_ID, productQuestionId: QUESTION_ID, sourceType: "markdown-upload", purposeRef: PURPOSE, normalizedContentDigest: binding.normalizedContentDigest, requestedScopeAssertions: [{ relationship: "applies-to", scope }], sensitivity: "standard", resolvedAt: at, authorization: authorization("source-binding:resolve-current", at) });
    const expectedRepositoryRevision = await sourceRepository.inspectRevision(SANDBOX_ORGANIZATION_ID);
    const version = await contentService.write({ contractVersion: "1", organizationId: SANDBOX_ORGANIZATION_ID, sourceBindingId: binding.sourceBindingId, purposeRef: PURPOSE, mediaType: "text/markdown", bytes, storedAt: at, storedByActorRef: ACTOR, idempotencyKey: `northstar-preparation-content:${document.id}:v1`, expectedRepositoryRevision, authorization: authorization("source-content:write", at) });
    const read = await contentService.read({ contractVersion: "1", organizationId: SANDBOX_ORGANIZATION_ID, sourceBindingId: binding.sourceBindingId, sourceContentVersionId: version.sourceContentVersionId, purposeRef: PURPOSE, authorization: authorization("source-content:read-for-evidence-admission", at) });
    bindings.push({ sourceBindingId: binding.sourceBindingId, bindingRevisionId: binding.bindingRevisionId });
    versions.push({ sourceContentVersionId: version.sourceContentVersionId, normalizedContentDigest: version.normalizedContentDigest });
    evidenceSources.push({ sourceId: resolvedBinding.binding.source.sourceId, sourceType: "upload", observedAt: document.effectiveAt, contentDigest: version.normalizedContentDigest, content: read.text });
    replay ||= binding.disposition === "current-binding-reused" || version.disposition === "idempotent-replay";
  }
  stored = (await runtimeRepository.read(SANDBOX_ORGANIZATION_ID))!;
  const index = stored.runtime.memory.canonicalScopeLineageIndex!;
  const topology = readCanonicalScopeLineageTopology(index);
  if (!topology) throw new Error("Northstar topology is unavailable.");
  const result = runDiscoveryV3({ company: sandboxManifest.organization.name, website: sandboxManifest.organization.website, industry: sandboxManifest.organization.industry, question: SANDBOX_PRIMARY_QUESTION, context: "", evidenceSources }, { organizationId: SANDBOX_ORGANIZATION_ID, effectiveAt: at, topologyRevisions: [topology], sourceBindingRevisions: index.sourceBindings, existingEvidenceAttributions: index.evidenceAttributions });
  let evolved = stored.runtime;
  if (!replay) {
    const originalLog=console.log;
    try { console.log=()=>{}; evolved = evolveOrganizationRuntime({ runtime: stored.runtime, result, input: { company: sandboxManifest.organization.name, website: sandboxManifest.organization.website, industry: sandboxManifest.organization.industry, question: SANDBOX_PRIMARY_QUESTION, context: "" }, semanticTime: at }); }
    finally { console.log=originalLog; }
  }
  if (!replay) stored = await runtimeRepository.replace(SANDBOX_ORGANIZATION_ID, runtimeBytes(evolved), stored.revision, { requestId: "northstar-preparation-lineage:cognition", operatorId: ACTOR });
  else stored = (await runtimeRepository.read(SANDBOX_ORGANIZATION_ID))!;
  const admissions = result.scopeLineageAdmission?.operationBatch.admissions ?? [];
  const compositions = stored.runtime.memory.organizationalUnderstandingState.canonicalCompositions ?? [];
  const current = [...compositions].sort((a,b)=>a.id.localeCompare(b.id)).at(-1);
  if (!admissions.length || !current) throw new Error("Canonical Northstar material or Understanding was not produced.");
  const currentIndex=stored.runtime.memory.canonicalScopeLineageIndex!;
  const currentTopology=readCanonicalScopeLineageTopology(currentIndex)!;
  const explanations=stored.runtime.memory.organizationalExplanations.filter(item=>item.canonicalGovernanceLineage);
  const materialSupports=explanations.flatMap(item=>item.canonicalGovernanceLineage!.materialSupports);
  const audienceLineage=produceCanonicalUnderstandingAudienceLineage({organizationId:SANDBOX_ORGANIZATION_ID,compositions,explanations,scopeLineageIndex:currentIndex,scopeTopology:currentTopology});
  const disclosure=authorization("understanding:disclose-derived",at);
  const eligibility=resolveCanonicalUnderstandingCurrentEligibility({contractVersion:"1",organizationId:SANDBOX_ORGANIZATION_ID,subjectId:ACTOR,purposeRef:PURPOSE,requestedScope:scope,sensitivity:"standard",evaluatedAt:at,authorizationContextRef:disclosure.contextId,canonicalUnderstandingRevision:stored.revision,audienceLineageDigest:audienceLineage.digest,lineagePolicyVersion:POLICY,materialSupports},{authorization:disclosure,isPurposeCompatible:({requestedPurpose,materialPurposeRefs})=>materialPurposeRefs.includes(requestedPurpose),resolveCurrentSourceBinding:({historicalBindingId,historicalGovernanceRevisionRef})=>{const historical=currentIndex.sourceBindings.find(item=>item.bindingId===historicalBindingId&&item.digest===historicalGovernanceRevisionRef);if(!historical)return undefined;const latest=resolveCurrentSourceScopeBinding(currentIndex.sourceBindings.filter(item=>item.source.sourceId===historical.source.sourceId),at);return latest?{organizationId:SANDBOX_ORGANIZATION_ID,historicalBindingId,currentBindingRevisionRef:latest.bindingId,currentGovernanceRevisionRef:latest.digest,availability:latest.availability??"unavailable",purposeRefs:latest.purposeRef?[latest.purposeRef]:[],scopes:latest.assertions.map(item=>item.scope)}:undefined;}});
  if(eligibility.disposition!=="eligible")throw new Error("Canonical Northstar Understanding is not currently eligible.");
  const projection=readScopedOrganizationalProductProjection({authenticatedUserId:ACTOR,organizationId:SANDBOX_ORGANIZATION_ID,context:disclosure,repository:{readAuthorizedSource:()=>buildGenericScopedProductSource({stored,organizationId:SANDBOX_ORGANIZATION_ID,requestedScope:scope,currentEligibility:eligibility})}});
  if(projection.disposition!=="available")throw new Error("Canonical Northstar scoped projection is unavailable.");
  const unsigned: Omit<NorthstarPreparationLineageSeedV1, "seedDigest"> = { contractVersion: "1", organizationId: SANDBOX_ORGANIZATION_ID as typeof SANDBOX_ORGANIZATION_ID, semanticOwner: "leadership-conversation", productQuestionId: QUESTION_ID, creationOperationId: `northstar-preparation-lineage:v1:${digest([SANDBOX_ORGANIZATION_ID, documents.map(item=>item.id)])}`, lineagePolicyVersion: POLICY, sourceBindings: bindings.sort((a,b)=>a.sourceBindingId.localeCompare(b.sourceBindingId)), sourceContentVersions: versions.sort((a,b)=>a.sourceContentVersionId.localeCompare(b.sourceContentVersionId)), canonicalMaterial: admissions.map(item=>({ canonicalObjectId: item.canonicalEvidenceId, revisionRef: item.canonicalAdmissionId, owner: "canonical-evidence-admission" as const })).sort((a,b)=>a.canonicalObjectId.localeCompare(b.canonicalObjectId)), canonicalUnderstandingRevision: current.revisionId, projectionSourceRef: current.id };
  const seed = { ...unsigned, seedDigest: digest(unsigned) };
  return { disposition: replay ? "idempotent-replay" : "provisioned", seed, counts: { sources: bindings.length, material: admissions.length, understandings: compositions.length }, runtimeRevision: stored.revision };
}

export async function resetNorthstarPreparationLineageFixture(input: NorthstarPreparationLineageProvisioningInput): Promise<void> {
  const root = await safeFixtureRoot(input.fixtureRoot);
  await rm(root, { recursive: true });
}
