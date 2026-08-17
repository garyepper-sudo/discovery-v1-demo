import "server-only";

import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { chmod, lstat, mkdir, open, readFile, realpath, rename, rm, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { runDiscoveryV3 } from "../../../engine/v3";
import { CanonicalLocalSourceBindingService } from "../../../engine/v3/governance/canonicalLocalSourceBindingService";
import { createCanonicalScopeLineageIndex, createCanonicalScopeTopology, readCanonicalScopeLineageTopology, resolveCurrentSourceScopeBinding } from "../../../engine/v3/governance/canonicalScopeLineage";
import { resolveScopedGovernanceContext, type ScopedGovernanceOperation } from "../../../engine/v3/governance/scopedGovernanceContext";
import { evolveOrganizationRuntime } from "../../../engine/v3/runtime/evolveOrganizationRuntime";
import { produceCanonicalUnderstandingAudienceLineage } from "../../../engine/v3/understanding/produceCanonicalUnderstandingAudienceLineage";
import { resolveCanonicalUnderstandingCurrentEligibility } from "../../../engine/v3/understanding/resolveCanonicalUnderstandingCurrentEligibility";
import { createEmptyOrganizationRuntime } from "../../../engine/v3/runtime/organizationRuntime";
import { createDurableProductQuestion } from "../../questions/questionLifecycle";
import { FilesystemOrganizationRuntimeRepository } from "../../../engine/v3/runtime/organizationRuntimeRepository";
import { GovernedSourceContentService } from "../../../engine/v3/sources/governedSourceContentService";
import { createFilesystemSourceContentRepository } from "../../../engine/v3/sources/sourceContentRepository";
import { decodeAndNormalizeSourceContent, sourceContentDigest } from "../../../engine/v3/sources/sourceContentDeterminism";
import { buildGenericScopedProductSource } from "../../integration/runtimeToScopedProductSource";
import { readScopedOrganizationalProductProjection } from "../../integration/scopedOrganizationalProductProjection";
import { CanonicalProductWorkspaceAdapter } from "../../integration/canonicalProductWorkspaceAdapter";
import { northstarScopeTopology } from "./sourceScopeBindings";
import { SANDBOX_ORGANIZATION_ID, SANDBOX_PRIMARY_QUESTION, sandboxManifest } from "./manifest";

const PURPOSE = "leadership-conversation-capture" as const;
const ACTOR = "person:northstar-preparation-lineage-fixture";
export const NORTHSTAR_PRODUCT_QUESTION_FIXTURE_KEY = "northstar-implementation-duration";
const POLICY = "conservative-material-ancestor.v1";
const FIXTURE_ID = "northstar-preparation-lineage-fixture-v1";
const PROVISIONING_KEY = "northstar-preparation-lineage:v1";
const SAFE_ID = /^[A-Za-z0-9_-]+$/u;
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
  sourceContentVersions: Array<{ sourceBindingId: string; sourceContentVersionId: string; normalizedContentDigest: string }>;
  canonicalMaterial: Array<{ canonicalObjectId: string; revisionRef: string; owner: "canonical-evidence-admission" }>;
  canonicalUnderstandingRevision: string;
  projectionSourceRef: string;
  scopeDigest: string;
  purpose: string;
  sensitivity: "standard";
  seedDigest: string;
};

export type NorthstarPreparationLineageProvisioningResult = {
  disposition: "provisioned" | "idempotent-replay";
  seed: NorthstarPreparationLineageSeedV1;
  counts: { sources: number; material: number; understandings: number };
  runtimeRevision: string;
};

export type NorthstarPreparationLineageSeedRecordV1 = {
  contractVersion: "1";
  organizationId: typeof SANDBOX_ORGANIZATION_ID;
  fixtureId: typeof FIXTURE_ID;
  recordId: string;
  provisioningKeyDigest: string;
  requestFingerprint: string;
  seed: NorthstarPreparationLineageSeedV1;
  seedDigest: string;
  storageIntegrityDigest: string;
};

export type NorthstarPreparationLineageProvisioningInput = {
  environment: "development" | "sandbox" | "test";
  fixtureRoot: string;
  now?: string;
};

export async function provisionForeignCanonicalOwnerPartition(input:{runtimeRoot:string;sourceContentRoot:string;organizationId:string;productQuestionId:string;actorId:string;at:string}):Promise<{organizationId:string;productQuestionId:string;canonicalUnderstandingRevision:string;projectionSourceRef:string;projectionRevision:string;runtimeRevision:string;sourceBindingId:string;sourceContentVersionId:string;canonicalEvidenceIds:string[]}> {
  if(input.organizationId===SANDBOX_ORGANIZATION_ID||!SAFE_ID.test(input.organizationId))throw new Error("Foreign canonical owner partition identity is invalid.");
  const repository=new FilesystemOrganizationRuntimeRepository(input.runtimeRoot),scope={organizationId:input.organizationId,type:"organization" as const,id:input.organizationId};
  const topology=createCanonicalScopeTopology({organizationId:input.organizationId,topologyVersion:1,effectiveAt:input.at,nodes:[{...scope,label:"Foreign canonical validation partition"}],relationships:[]});
  const empty=createEmptyOrganizationRuntime({organizationId:input.organizationId,name:"Foreign canonical validation partition",now:input.at});
  const withQuestion=createDurableProductQuestion({runtime:{...empty,memory:{...empty.memory,canonicalScopeLineageIndex:createCanonicalScopeLineageIndex({organizationId:input.organizationId,topology,sourceBindings:[],evidenceAttributions:[],derivedLineages:[]})}},title:"What constrains the foreign validation partition?",questionId:input.productQuestionId,createdAt:input.at}).runtime;
  await repository.create(input.organizationId,runtimeBytes(withQuestion),{requestId:"foreign-owner-partition:create",operatorId:input.actorId});
  const text=[
    "Northstar delivery commitments repeatedly exceed the implementation capacity available to the delivery team.",
    "Leaders approve additional work without removing existing commitments, while cross-functional dependencies remain unresolved.",
    "The resulting queue growth causes schedule slippage, rework, and recurring escalation across product and engineering.",
    "A bounded commitment policy and explicit dependency ownership would reduce overload and improve delivery predictability.",
  ].join("\n\n"),bytes=new TextEncoder().encode(text),normalized=decodeAndNormalizeSourceContent(bytes),normalizedBytes=new TextEncoder().encode(normalized.normalizedText),normalizedContentDigest=sourceContentDigest(normalizedBytes);
  const scoped=(operation:ScopedGovernanceOperation)=>resolveScopedGovernanceContext({organizationId:input.organizationId,subjectId:input.actorId,requestedScope:scope,operation,purpose:PURPOSE,sensitivity:"standard",evaluatedAt:input.at,temporal:{mode:"current"},serverResolvedAuthority:[{authorityRef:"authority:foreign-canonical-partition",policyRef:"policy:foreign-canonical-partition:v1",organizationId:input.organizationId,subjectId:input.actorId,scope,operations:[operation],sensitivity:["standard"],relationship:"direct",status:"active",validFrom:input.at}]});
  const before=(await repository.read(input.organizationId))!,service=new CanonicalLocalSourceBindingService(repository,{now:()=>input.at});
  const receipt=await service.registerCanonicalLocalSourceBinding({contractVersion:"1",organizationId:input.organizationId,productQuestionId:input.productQuestionId,sourceType:"plain-text-upload",purposeRef:PURPOSE,normalizedContentDigest,requestedScopeAssertions:[{relationship:"applies-to",scope}],sensitivity:"standard",recordedAt:input.at,recordedByActorRef:input.actorId,idempotencyKey:"foreign-owner-partition:binding",expectedRuntimeRevision:before.revision,operation:{requestId:"foreign-owner-partition:binding",operatorId:input.actorId},authorization:scoped("source-binding:register-local")});
  const bound=(await repository.read(input.organizationId))!,index=bound.runtime.memory.canonicalScopeLineageIndex!,binding=index.sourceBindings.find(item=>item.bindingId===receipt.sourceBindingId)!;
  const sourceRepository=createFilesystemSourceContentRepository({root:input.sourceContentRoot,environment:"test"}),contentService=new GovernedSourceContentService(sourceRepository,{loadRevisions:async({organizationId,sourceBindingId})=>{const loaded=await repository.read(organizationId),all=loaded?.runtime.memory.canonicalScopeLineageIndex?.sourceBindings??[],target=all.find(item=>item.bindingId===sourceBindingId);return target?all.filter(item=>item.source.sourceId===target.source.sourceId):[];}},{now:()=>input.at});
  const sourceVersion=await contentService.write({contractVersion:"1",organizationId:input.organizationId,sourceBindingId:binding.bindingId,purposeRef:PURPOSE,mediaType:"text/plain",bytes,storedAt:input.at,storedByActorRef:input.actorId,idempotencyKey:"foreign-owner-partition:content",expectedRepositoryRevision:await sourceRepository.inspectRevision(input.organizationId),authorization:scoped("source-content:write")});
  const sourceRead=await contentService.read({contractVersion:"1",organizationId:input.organizationId,sourceBindingId:binding.bindingId,sourceContentVersionId:sourceVersion.sourceContentVersionId,purposeRef:PURPOSE,authorization:scoped("source-content:read-for-evidence-admission")});
  if(sourceRead.version.organizationId!==input.organizationId||sourceRead.version.sourceBindingId!==binding.bindingId||sourceRead.version.normalizedContentDigest!==binding.source.normalizedContentDigest||sourceRead.text!==normalized.normalizedText)throw new Error("Foreign canonical owner partition governed Source Content is invalid.");
  const result=runDiscoveryV3({company:"Foreign canonical validation partition",website:"https://foreign.invalid",industry:"Validation",question:"What constrains this partition?",context:"",evidenceSources:[{sourceId:binding.source.sourceId,sourceType:"upload",observedAt:input.at,contentDigest:sourceRead.version.normalizedContentDigest,content:sourceRead.text}]},{organizationId:input.organizationId,effectiveAt:input.at,topologyRevisions:[topology],sourceBindingRevisions:index.sourceBindings});
  const admissions=result.scopeLineageAdmission?.operationBatch.admissions??[];
  if(!admissions.length)throw new Error("Foreign canonical owner partition Evidence admission is unavailable.");
  const priorLog=console.log;let evolved;
  try{console.log=()=>{};evolved=evolveOrganizationRuntime({runtime:bound.runtime,result,input:{company:"Foreign canonical validation partition",website:"https://foreign.invalid",industry:"Validation",question:"What constrains this partition?",context:""},semanticTime:input.at,organizationalUnderstandingOwnershipMode:"canonical"});}finally{console.log=priorLog;}
  const explanations=evolved.memory.organizationalExplanations.filter(item=>item.canonicalGovernanceLineage),compositions=evolved.memory.organizationalUnderstandingState.canonicalCompositions??[];
  if(!explanations.length||!compositions.length)throw new Error("Foreign canonical owner partition construction is unavailable.");
  const serialized=stable(explanations);
  if(serialized.includes(SANDBOX_ORGANIZATION_ID)||explanations.some(item=>item.organizationId!==input.organizationId||item.claim.scope.organizationId!==input.organizationId||item.canonicalGovernanceLineage?.organizationId!==input.organizationId))throw new Error("Foreign canonical owner partition contains foreign owner lineage.");
  const stored=await repository.replace(input.organizationId,runtimeBytes(evolved),bound.revision,{requestId:"foreign-owner-partition:cognition",operatorId:input.actorId});
  const reloaded = await repository.read(input.organizationId);
  const reloadedExplanations=reloaded?.runtime.memory.organizationalExplanations.filter(item=>item.canonicalGovernanceLineage)??[],composition=reloaded?.runtime.memory.organizationalUnderstandingState.canonicalCompositions?.find(item=>item.organizationId===input.organizationId&&item.scope.organizationId===input.organizationId&&item.explanationIds.every(explanationId=>reloadedExplanations.some(explanation=>explanation.id===explanationId)));
  if(
    !reloaded ||
    !composition ||
    composition.organizationId !== input.organizationId ||
    composition.scope.organizationId !== input.organizationId ||
    composition.revisionId.length === 0
  )throw new Error("Foreign canonical owner partition cognition is unavailable.");
  const reloadedIndex=reloaded.runtime.memory.canonicalScopeLineageIndex!,materialSupports=reloadedExplanations.flatMap(item=>item.canonicalGovernanceLineage!.materialSupports),audienceLineage=produceCanonicalUnderstandingAudienceLineage({organizationId:input.organizationId,compositions:reloaded.runtime.memory.organizationalUnderstandingState.canonicalCompositions??[],explanations:reloadedExplanations,scopeLineageIndex:reloadedIndex,scopeTopology:readCanonicalScopeLineageTopology(reloadedIndex)}),disclosure=scoped("understanding:disclose-derived"),eligibility=resolveCanonicalUnderstandingCurrentEligibility({contractVersion:"1",organizationId:input.organizationId,subjectId:input.actorId,purposeRef:PURPOSE,requestedScope:scope,sensitivity:"standard",evaluatedAt:input.at,authorizationContextRef:disclosure.contextId,canonicalUnderstandingRevision:reloaded.revision,audienceLineageDigest:audienceLineage.digest,lineagePolicyVersion:POLICY,materialSupports},{authorization:disclosure,isPurposeCompatible:({requestedPurpose,materialPurposeRefs})=>materialPurposeRefs.includes(requestedPurpose),resolveCurrentSourceBinding:({historicalBindingId,historicalGovernanceRevisionRef})=>{const historical=reloadedIndex.sourceBindings.find(item=>item.bindingId===historicalBindingId&&item.digest===historicalGovernanceRevisionRef);if(!historical)return undefined;const latest=resolveCurrentSourceScopeBinding(reloadedIndex.sourceBindings.filter(item=>item.source.sourceId===historical.source.sourceId),input.at);return latest?{organizationId:input.organizationId,historicalBindingId,currentBindingRevisionRef:latest.bindingId,currentGovernanceRevisionRef:latest.digest,availability:latest.availability??"unavailable",purposeRefs:latest.purposeRef?[latest.purposeRef]:[],scopes:latest.assertions.map(item=>item.scope)}:undefined;}});
  if(eligibility.disposition!=="eligible")throw new Error("Foreign canonical owner partition current eligibility is unavailable.");
  const projection=readScopedOrganizationalProductProjection({authenticatedUserId:input.actorId,organizationId:input.organizationId,context:disclosure,repository:{readAuthorizedSource:()=>buildGenericScopedProductSource({stored:reloaded,organizationId:input.organizationId,requestedScope:scope,currentEligibility:eligibility})}});
  if(projection.disposition!=="available"||projection.sourceRevisionRef!==reloaded.revision)throw new Error("Foreign canonical owner partition scoped projection is unavailable.");
  return{organizationId:input.organizationId,productQuestionId:input.productQuestionId,canonicalUnderstandingRevision:composition.revisionId,projectionSourceRef:composition.id,projectionRevision:projection.sourceRevisionRef,runtimeRevision:reloaded.revision,sourceBindingId:binding.bindingId,sourceContentVersionId:sourceVersion.sourceContentVersionId,canonicalEvidenceIds:admissions.map(item=>item.canonicalEvidenceId).sort()};
}

function authorization(operation: ScopedGovernanceOperation, at: string) {
  const scope = { organizationId: SANDBOX_ORGANIZATION_ID, type: "organization" as const, id: SANDBOX_ORGANIZATION_ID };
  return resolveScopedGovernanceContext({ organizationId: SANDBOX_ORGANIZATION_ID, subjectId: ACTOR, requestedScope: scope, operation, purpose: PURPOSE, sensitivity: "standard", evaluatedAt: at, temporal: { mode: "current" }, serverResolvedAuthority: [{ authorityRef: "authority:northstar-preparation-lineage-fixture", policyRef: "policy:northstar-preparation-lineage-fixture:v1", organizationId: SANDBOX_ORGANIZATION_ID, subjectId: ACTOR, scope, operations: [operation], sensitivity: ["standard"], relationship: "direct", status: "active", validFrom: sandboxManifest.replayTimestamps[0] }] });
}

async function safeFixtureRoot(root: string): Promise<string> {
  if (!path.isAbsolute(root)) throw new Error("Northstar fixture root must be absolute.");
  const suppliedStatus = await lstat(root);
  if (!suppliedStatus.isDirectory() || suppliedStatus.isSymbolicLink()) throw new Error("Northstar fixture root is unsafe.");
  const actual = await realpath(root);
  const temporary = await realpath(tmpdir());
  if (!actual.startsWith(`${temporary}${path.sep}`) || !path.basename(actual).startsWith("discovery-northstar-preparation-lineage-")) throw new Error("Northstar fixture root is outside the isolated fixture boundary.");
  const status = await lstat(actual);
  if (!status.isDirectory() || status.isSymbolicLink()) throw new Error("Northstar fixture root is unsafe.");
  return actual;
}

function runtimeBytes(value: unknown): Uint8Array { return new TextEncoder().encode(JSON.stringify(value, null, 2)); }

function validateSeed(seed: NorthstarPreparationLineageSeedV1): void {
  const { seedDigest, ...unsigned } = seed;
  const bindingIds = new Set(seed.sourceBindings.map(item => item.sourceBindingId));
  const versionIds = new Set<string>();
  if (seed.contractVersion !== "1" || seed.organizationId !== SANDBOX_ORGANIZATION_ID || seed.semanticOwner !== "leadership-conversation" || !seed.productQuestionId || seed.lineagePolicyVersion !== POLICY || seedDigest !== digest(unsigned) || !bindingIds.size || bindingIds.size !== seed.sourceBindings.length || !seed.sourceContentVersions.length || !seed.canonicalMaterial.length || !seed.canonicalUnderstandingRevision || !seed.projectionSourceRef || !seed.scopeDigest || seed.purpose!==PURPOSE || seed.sensitivity!=="standard") throw new Error("Northstar preparation lineage seed integrity failed.");
  for (const version of seed.sourceContentVersions) {
    if (!version.sourceBindingId || !bindingIds.has(version.sourceBindingId) || !version.sourceContentVersionId || versionIds.has(version.sourceContentVersionId) || !/^[a-f0-9]{64}$/u.test(version.normalizedContentDigest)) throw new Error("Northstar preparation lineage seed integrity failed.");
    versionIds.add(version.sourceContentVersionId);
  }
}

function seedRecordIdentity(organizationId: string, fixtureId: string, provisioningKeyDigest: string): string {
  return `northstar-lineage-seed-${digest(["1", organizationId, fixtureId, provisioningKeyDigest])}`;
}

function unsignedSeedRecord(seed: NorthstarPreparationLineageSeedV1) {
  const provisioningKeyDigest = digest(PROVISIONING_KEY);
  const recordId = seedRecordIdentity(SANDBOX_ORGANIZATION_ID, FIXTURE_ID, provisioningKeyDigest);
  const requestFingerprint = digest({ contractVersion: "1", organizationId: SANDBOX_ORGANIZATION_ID, fixtureId: FIXTURE_ID, provisioningKeyDigest, seedDigest: seed.seedDigest });
  return { contractVersion: "1" as const, organizationId: SANDBOX_ORGANIZATION_ID as typeof SANDBOX_ORGANIZATION_ID, fixtureId: FIXTURE_ID as typeof FIXTURE_ID, recordId, provisioningKeyDigest, requestFingerprint, seed, seedDigest: seed.seedDigest };
}

function completeSeedRecord(seed: NorthstarPreparationLineageSeedV1): NorthstarPreparationLineageSeedRecordV1 {
  validateSeed(seed);
  const unsigned = unsignedSeedRecord(seed);
  return { ...unsigned, storageIntegrityDigest: digest(unsigned) };
}

function seedRecordBytes(record: NorthstarPreparationLineageSeedRecordV1): Uint8Array {
  return new TextEncoder().encode(`${stable(record)}\n`);
}

function validateSeedRecord(record: NorthstarPreparationLineageSeedRecordV1): void {
  validateSeed(record.seed);
  const { storageIntegrityDigest, ...unsigned } = record;
  const expected = unsignedSeedRecord(record.seed);
  if (record.contractVersion !== "1" || record.organizationId !== SANDBOX_ORGANIZATION_ID || record.fixtureId !== FIXTURE_ID || record.recordId !== expected.recordId || record.provisioningKeyDigest !== expected.provisioningKeyDigest || record.requestFingerprint !== expected.requestFingerprint || record.seedDigest !== record.seed.seedDigest || stable(unsigned) !== stable(expected) || storageIntegrityDigest !== digest(unsigned)) throw new Error("Northstar preparation lineage seed record integrity failed.");
}

async function rejectSymlink(target: string): Promise<void> {
  try { if ((await lstat(target)).isSymbolicLink()) throw new Error("Northstar preparation lineage seed storage is unsafe."); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
}

async function seedRecordTarget(root: string, organizationId: string, fixtureId: string, provisioningKey: string): Promise<{ target: string; temporary: string }> {
  if (organizationId !== SANDBOX_ORGANIZATION_ID || fixtureId !== FIXTURE_ID || provisioningKey !== PROVISIONING_KEY || !SAFE_ID.test(organizationId) || !SAFE_ID.test(fixtureId)) throw new Error("Northstar preparation lineage seed identity is invalid.");
  const actualRoot = await safeFixtureRoot(root);
  const records = path.join(actualRoot, "preparation-lineage-seeds"), organization = path.join(records, organizationId);
  for (const directory of [records, organization]) { await rejectSymlink(directory); await mkdir(directory, { recursive: true, mode: 0o700 }); await rejectSymlink(directory); await chmod(directory, 0o700); }
  const actualRecords = await realpath(records), actualOrganization = await realpath(organization);
  if (actualRecords !== path.join(actualRoot, "preparation-lineage-seeds") || actualOrganization !== path.join(actualRecords, organizationId)) throw new Error("Northstar preparation lineage seed storage escaped its fixture root.");
  const provisioningKeyDigest = digest(provisioningKey), recordId = seedRecordIdentity(organizationId, fixtureId, provisioningKeyDigest), target = path.join(actualOrganization, `${recordId}.json`), temporary = path.join(actualOrganization, `${recordId}.tmp`);
  await rejectSymlink(target); await rejectSymlink(temporary);
  return { target, temporary };
}

async function readSeedRecord(input: { fixtureRoot: string; organizationId: string; fixtureId: string; provisioningKey: string; expectedSeedDigest?: string }): Promise<NorthstarPreparationLineageSeedRecordV1> {
  const { target } = await seedRecordTarget(input.fixtureRoot, input.organizationId, input.fixtureId, input.provisioningKey);
  let raw: Uint8Array;
  try { const status = await lstat(target); if (!status.isFile() || status.isSymbolicLink() || (status.mode & 0o777) !== 0o600) throw new Error("Northstar preparation lineage seed record integrity failed."); raw = new Uint8Array(await readFile(target)); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") throw new Error("Northstar preparation lineage seed record is unavailable."); throw error; }
  let record: NorthstarPreparationLineageSeedRecordV1;
  try { record = JSON.parse(new TextDecoder().decode(raw)) as NorthstarPreparationLineageSeedRecordV1; }
  catch { throw new Error("Northstar preparation lineage seed record integrity failed."); }
  validateSeedRecord(record);
  if (!Buffer.from(raw).equals(Buffer.from(seedRecordBytes(record))) || (input.expectedSeedDigest !== undefined && input.expectedSeedDigest !== record.seedDigest)) throw new Error("Northstar preparation lineage seed record integrity failed.");
  return record;
}

async function persistSeedRecord(root: string, seed: NorthstarPreparationLineageSeedV1): Promise<NorthstarPreparationLineageSeedRecordV1> {
  const record = completeSeedRecord(seed), next = seedRecordBytes(record), paths = await seedRecordTarget(root, SANDBOX_ORGANIZATION_ID, FIXTURE_ID, PROVISIONING_KEY);
  try {
    const existing = await readSeedRecord({ fixtureRoot: root, organizationId: SANDBOX_ORGANIZATION_ID, fixtureId: FIXTURE_ID, provisioningKey: PROVISIONING_KEY });
    if (!Buffer.from(next).equals(Buffer.from(seedRecordBytes(existing)))) throw new Error("Northstar preparation lineage seed record collision.");
    return existing;
  } catch (error) { if (!/record is unavailable/u.test((error as Error).message)) throw error; }
  try { await unlink(paths.temporary); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  const handle = await open(paths.temporary, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o600);
  try { await handle.writeFile(next); await handle.sync(); } finally { await handle.close(); }
  await rename(paths.temporary, paths.target);
  const published = await readSeedRecord({ fixtureRoot: root, organizationId: SANDBOX_ORGANIZATION_ID, fixtureId: FIXTURE_ID, provisioningKey: PROVISIONING_KEY, expectedSeedDigest: seed.seedDigest });
  if (!Buffer.from(next).equals(Buffer.from(seedRecordBytes(published)))) throw new Error("Northstar preparation lineage seed record publication failed.");
  return published;
}

export async function readNorthstarPreparationLineageSeed(input: { fixtureRoot: string; organizationId: typeof SANDBOX_ORGANIZATION_ID; fixtureId: typeof FIXTURE_ID; provisioningKey: typeof PROVISIONING_KEY; expectedSeedDigest?: string }): Promise<NorthstarPreparationLineageSeedV1> {
  return structuredClone((await readSeedRecord(input)).seed);
}

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
  const productQuestionOwner = new CanonicalProductWorkspaceAdapter({
    runtimeRepository,
    authorize: async ({ userId, organizationId }) => userId === ACTOR && organizationId === SANDBOX_ORGANIZATION_ID,
    investigate: async () => { throw new Error("Northstar Product Question setup does not perform investigation."); },
  });
  const questionResult = await productQuestionOwner.createQuestion({
    userId: ACTOR,
    organizationId: SANDBOX_ORGANIZATION_ID,
    question: SANDBOX_PRIMARY_QUESTION,
    createdAt: at,
    idempotencyKey: NORTHSTAR_PRODUCT_QUESTION_FIXTURE_KEY,
    operation: { requestId: "northstar-product-question:setup", operatorId: ACTOR },
  });
  const productQuestionId = questionResult.workspace.question.id;
  if (!productQuestionId) throw new Error("Northstar owner-issued Product Question identity is unavailable.");
  stored = (await runtimeRepository.read(SANDBOX_ORGANIZATION_ID))!;
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
    const binding = await bindingService.registerCanonicalLocalSourceBinding({ contractVersion: "1", organizationId: SANDBOX_ORGANIZATION_ID, productQuestionId, sourceType: "markdown-upload", purposeRef: PURPOSE, normalizedContentDigest: sourceContentDigest(new TextEncoder().encode(normalized.normalizedText)), requestedScopeAssertions: [{ relationship: "applies-to", scope }], sensitivity: "standard", recordedAt: at, recordedByActorRef: ACTOR, idempotencyKey: `northstar-preparation-binding:${document.id}:v1`, expectedRuntimeRevision: stored.revision, operation: { requestId: `northstar-preparation-binding:${document.id}`, operatorId: ACTOR }, authorization: authorization("source-binding:register-local", at) });
    const resolvedBinding = await bindingService.resolveCanonicalCurrentSourceBinding({ contractVersion: "1", organizationId: SANDBOX_ORGANIZATION_ID, productQuestionId, sourceType: "markdown-upload", purposeRef: PURPOSE, normalizedContentDigest: binding.normalizedContentDigest, requestedScopeAssertions: [{ relationship: "applies-to", scope }], sensitivity: "standard", resolvedAt: at, authorization: authorization("source-binding:resolve-current", at) });
    const expectedRepositoryRevision = await sourceRepository.inspectRevision(SANDBOX_ORGANIZATION_ID);
    const version = await contentService.write({ contractVersion: "1", organizationId: SANDBOX_ORGANIZATION_ID, sourceBindingId: binding.sourceBindingId, purposeRef: PURPOSE, mediaType: "text/markdown", bytes, storedAt: at, storedByActorRef: ACTOR, idempotencyKey: `northstar-preparation-content:${document.id}:v1`, expectedRepositoryRevision, authorization: authorization("source-content:write", at) });
    const read = await contentService.read({ contractVersion: "1", organizationId: SANDBOX_ORGANIZATION_ID, sourceBindingId: binding.sourceBindingId, sourceContentVersionId: version.sourceContentVersionId, purposeRef: PURPOSE, authorization: authorization("source-content:read-for-evidence-admission", at) });
    if (binding.organizationId !== SANDBOX_ORGANIZATION_ID || resolvedBinding.binding.organizationId !== SANDBOX_ORGANIZATION_ID || resolvedBinding.binding.bindingId !== binding.sourceBindingId || version.organizationId !== SANDBOX_ORGANIZATION_ID || version.sourceBindingId !== binding.sourceBindingId || read.version.sourceBindingId !== binding.sourceBindingId || read.version.sourceContentVersionId !== version.sourceContentVersionId || binding.normalizedContentDigest !== version.normalizedContentDigest || resolvedBinding.binding.source.normalizedContentDigest !== version.normalizedContentDigest || read.version.normalizedContentDigest !== version.normalizedContentDigest) throw new Error("Canonical Northstar source binding and source version association is invalid.");
    bindings.push({ sourceBindingId: binding.sourceBindingId, bindingRevisionId: binding.bindingRevisionId });
    versions.push({ sourceBindingId: version.sourceBindingId, sourceContentVersionId: version.sourceContentVersionId, normalizedContentDigest: version.normalizedContentDigest });
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
  const unsigned: Omit<NorthstarPreparationLineageSeedV1, "seedDigest"> = { contractVersion: "1", organizationId: SANDBOX_ORGANIZATION_ID as typeof SANDBOX_ORGANIZATION_ID, semanticOwner: "leadership-conversation", productQuestionId, creationOperationId: `northstar-preparation-lineage:v1:${digest([SANDBOX_ORGANIZATION_ID, documents.map(item=>item.id)])}`, lineagePolicyVersion: POLICY, sourceBindings: bindings.sort((a,b)=>a.sourceBindingId.localeCompare(b.sourceBindingId)), sourceContentVersions: versions.sort((a,b)=>a.sourceBindingId.localeCompare(b.sourceBindingId)||a.sourceContentVersionId.localeCompare(b.sourceContentVersionId)||a.normalizedContentDigest.localeCompare(b.normalizedContentDigest)), canonicalMaterial: admissions.map(item=>({ canonicalObjectId: item.canonicalEvidenceId, revisionRef: item.canonicalAdmissionId, owner: "canonical-evidence-admission" as const })).sort((a,b)=>a.canonicalObjectId.localeCompare(b.canonicalObjectId)), canonicalUnderstandingRevision: current.revisionId, projectionSourceRef: current.id, scopeDigest:digest(scope), purpose:PURPOSE, sensitivity:"standard" };
  const seed = { ...unsigned, seedDigest: digest(unsigned) };
  await persistSeedRecord(root, seed);
  return { disposition: replay ? "idempotent-replay" : "provisioned", seed, counts: { sources: bindings.length, material: admissions.length, understandings: compositions.length }, runtimeRevision: stored.revision };
}

export async function resetNorthstarPreparationLineageFixture(input: NorthstarPreparationLineageProvisioningInput): Promise<void> {
  const root = await safeFixtureRoot(input.fixtureRoot);
  await rm(root, { recursive: true });
}
