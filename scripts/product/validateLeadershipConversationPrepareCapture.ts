import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { lstat, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import {
  createCanonicalScopeTopology,
  createCanonicalSourceScopeBinding,
} from "../../engine/v3/governance/canonicalScopeLineage";
import { resolveScopedGovernanceContext } from "../../engine/v3/governance/scopedGovernanceContext";
import {
  createFilesystemSourceContentRepository,
  decodeAndNormalizeSourceContent,
  GovernedSourceContentService,
  sourceContentDigest,
} from "../../engine/v3/sources";
import { readLeadershipConversationFixture } from "../../product/frontend/leadershipConversationFixtureAdapter";
import {
  createProductWorkflowArtifactRepository,
  completeGovernedConsequenceScopeBindingV1,
  LeadershipConversationProductOperations,
  northstarLeadershipConversationFixture,
  NORTHSTAR_PREPARED_CONTENT,
  NORTHSTAR_PREPARED_LINEAGE,
} from "../../product/workflow/leadershipConversation";
import { provisionNorthstarPreparationLineageFixture } from "../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import { createProductArtifactBodyRefV1, productArtifactBodyDigest, type ProductArtifactBodyRefV1, type ProductArtifactBodyStageRequestV1, type ProductArtifactBodyStageReceiptV1 } from "../../product/persistence/productArtifactBodyContracts";
import type { ProductArtifactBodyRepository } from "../../product/persistence/productArtifactBodyRepository";

let checks = 0;
const execFileAsync=promisify(execFile);
function check(value: unknown, message: string): void {
  assert.ok(value, message);
  checks += 1;
}
class MemoryBodyRepository implements ProductArtifactBodyRepository {readonly backend="filesystem" as const;private bodies=new Map<string,Uint8Array>();async stage(input:ProductArtifactBodyStageRequestV1):Promise<ProductArtifactBodyStageReceiptV1>{const body=createProductArtifactBodyRefV1({organizationId:input.organizationId,semanticOwner:input.semanticOwner,artifactType:input.artifactType,artifactId:input.artifactId,artifactRevision:input.artifactRevision,exactBodyDigest:productArtifactBodyDigest(input.bytes),byteLength:input.bytes.byteLength,mediaType:"application/json",schemaRef:input.schemaRef}),prior=this.bodies.get(body.bodyId),disposition=prior?"exact-replay" as const:"staged" as const;if(prior)assert.deepEqual(prior,input.bytes);else this.bodies.set(body.bodyId,input.bytes.slice());return{contractVersion:"1",body,disposition,receiptDigest:productArtifactBodyDigest({body,disposition})};}async readStagedExact(ref:ProductArtifactBodyRefV1){const bytes=this.bodies.get(ref.bodyId);if(!bytes)throw new Error("body unavailable");return bytes.slice();}}

async function historicalWorker(root:string,organizationId:string):Promise<void>{const repository=createProductWorkflowArtifactRepository({root,environment:"test"}),before=await repository.read(organizationId),legacy=before.store.proposals.filter(value=>value.contractVersion==="1"),after=await repository.read(organizationId);assert.equal(before.revision,after.revision);assert.equal(legacy.length,4);assert.ok(legacy.every(value=>!("governedScopeBinding" in value)));console.log(`FOUNDATION_WORKER_RESULT ${JSON.stringify({contractVersion:"1",legacyIds:legacy.map(value=>value.proposalId),bindingCount:0,revision:before.revision,replayRevision:after.revision,recordRewrite:0,recordDeletion:0,migration:0,backfill:0})}`);}

async function main(): Promise<void> {
  const workflowRoot = await mkdtemp(path.join(tmpdir(), "discovery-leadership-conversation-workflow-"));
  const sourceRoot = await mkdtemp(path.join(tmpdir(), "discovery-governed-source-content-leadership-"));
  const lineageRoot = await mkdtemp(path.join(tmpdir(), "discovery-northstar-preparation-lineage-prepare-capture-"));
  const setup = await provisionNorthstarPreparationLineageFixture({ environment: "test", fixtureRoot: lineageRoot });
  const fixture = northstarLeadershipConversationFixture(setup.seed.productQuestionId);
  const scope = { organizationId: fixture.organizationId, type: "organization" as const, id: fixture.organizationId };
  try {
    const normalized = decodeAndNormalizeSourceContent(fixture.captureBytes).normalizedText;
    const topology = createCanonicalScopeTopology({ organizationId: fixture.organizationId, topologyVersion: 1, effectiveAt: fixture.at, nodes: [scope], relationships: [] });
    const binding = createCanonicalSourceScopeBinding({ organizationId: fixture.organizationId, bindingVersion: 1, source: { sourceId: "local:leadership-capture:001", sourceVersion: "1", normalizedContentDigest: sourceContentDigest(new TextEncoder().encode(normalized)) }, topology, assertions: [{ relationship: "applies-to", scope }], basisRefs: [`purpose:${fixture.purposeRef}`], effectiveAt: fixture.at, sourceType: "pasted-text", purposeRef: fixture.purposeRef, availability: "available" });
    const authorization = (operation: "source-content:write" | "source-content:read-for-proposal") => resolveScopedGovernanceContext({ organizationId: fixture.organizationId, subjectId: fixture.actorId, requestedScope: scope, operation, purpose: fixture.purposeRef, sensitivity: "standard", evaluatedAt: fixture.at, temporal: { mode: "current" }, serverResolvedAuthority: [{ authorityRef: "fixture-authority", policyRef: "fixture-policy", organizationId: fixture.organizationId, subjectId: fixture.actorId, scope, operations: [operation], sensitivity: ["standard"], relationship: "direct", status: "active", validFrom: fixture.at }] });
    const sourceRepository = createFilesystemSourceContentRepository({ root: sourceRoot, environment: "test" });
    const sourceService = new GovernedSourceContentService(sourceRepository, { loadRevisions: async () => [binding] }, { now: () => fixture.at });
    const repository = createProductWorkflowArtifactRepository({ root: workflowRoot, environment: "test" });
    const source = {
      write: async (input: Parameters<LeadershipConversationProductOperations["receiveUpload"]>[0] & { storedAt: string; storedByActorRef: string }) => ({...await sourceService.write({ contractVersion: "1", organizationId: input.organizationId, sourceBindingId: binding.bindingId, purposeRef: input.purposeRef, mediaType: input.mediaType, bytes: input.bytes, storedAt: fixture.at, storedByActorRef: input.storedByActorRef, idempotencyKey: input.idempotencyKey, expectedRepositoryRevision: await sourceRepository.inspectRevision(input.organizationId), authorization: authorization("source-content:write") }),sourceBindingMutationReceiptDigest:"binding-receipt-digest"}),
      readForProposal: async (input: { organizationId: string; sourceBindingId: string; sourceContentVersionId: string; purposeRef: string }) => { const result = await sourceService.read({ contractVersion: "1", ...input, authorization: authorization("source-content:read-for-proposal") }); return { bytes: result.bytes, exactContentDigest: result.version.exactContentDigest, normalizedContentDigest: result.version.normalizedContentDigest }; },
      readForEvidenceAdmission: async () => { throw new Error("Canonical routing belongs to the canonical owner router."); },
    };
    const base = readLeadershipConversationFixture(fixture.questionId).base;
    const bodyRepository=new MemoryBodyRepository();
    const lineageUnsigned={contractVersion:"1" as const,organizationId:fixture.organizationId,semanticOwner:"leadership-conversation" as const,productQuestionId:fixture.questionId,creationOperationId:"fixture-prepare:1",lineagePolicyVersion:"fixture-lineage:v1",sourceBindings:[{sourceBindingId:binding.bindingId,bindingRevisionId:binding.digest}],sourceContentVersions:[{sourceBindingId:binding.bindingId,sourceContentVersionId:"fixture-source-version:1",normalizedContentDigest:binding.source.normalizedContentDigest}],canonicalMaterial:[{canonicalObjectId:"fixture-evidence:1",revisionRef:"fixture-admission:1",owner:"canonical-evidence-admission" as const}],canonicalUnderstandingRevision:"fixture-understanding:1",projectionSourceRef:"fixture-projection:1",scopeDigest:productArtifactBodyDigest(scope),purpose:fixture.purposeRef,sensitivity:"standard" as const},materialLineage={...lineageUnsigned,seedDigest:productArtifactBodyDigest(lineageUnsigned)};
    const operations = new LeadershipConversationProductOperations({ repository, bodyRepository, clock: { now: () => fixture.at }, authorize: async ({ userId, organizationId }) => userId === fixture.actorId && organizationId === fixture.organizationId, resolvePreparedWorkMaterialLineage:async()=>materialLineage, loadBase: async () => base, source });
    const identity = { userId: fixture.actorId, organizationId: fixture.organizationId, questionId: fixture.questionId, conversationId: fixture.conversationId };
    let deniedReads = 0;
    const denied = new LeadershipConversationProductOperations({ repository: { ...repository, read: async (id) => { deniedReads += 1; return repository.read(id); } }, bodyRepository, clock: { now: () => fixture.at }, authorize: async () => false, resolvePreparedWorkMaterialLineage:async()=>materialLineage, loadBase: async () => base, source });
    await assert.rejects(() => denied.workspace({ ...identity, userId: "denied" }), /access denied/);
    check(deniedReads === 0, "denial precedes workflow I/O");
    await operations.recordContext({ ...identity, idempotencyKey: "context", title: "Northstar staff conversation", purpose: "Resolve the next delivery constraint.", intendedOutcome: "Agree one bounded owner action.", timeframe: "Weekly", participants: [{ participantRef: "p1", displayName: "Leader", titleLabel: "Director" }], leaderContext: null });
    let store = (await repository.read(fixture.organizationId)).store;
    await operations.recordPreparation({ ...identity, idempotencyKey: "prepare", contextVersionId: store.contexts[0]!.contextVersionId, content: NORTHSTAR_PREPARED_CONTENT, lineage: NORTHSTAR_PREPARED_LINEAGE, changeSummary: null });
    store = (await repository.read(fixture.organizationId)).store;
    await operations.freeze({ ...identity, idempotencyKey: "freeze", artifactVersionId: store.preparedWorkPublications![0]!.artifactRevision });
    store = (await repository.read(fixture.organizationId)).store;
    check(Boolean(store.preparedWorkPublications![0]!.materialLineage),"Prepared Work publishes complete body-free material lineage");
    check(store.frozenSnapshotPublications![0]!.materialLineage?.seedDigest===store.preparedWorkPublications![0]!.materialLineage?.seedDigest,"freeze transfers the exact owner-backed lineage seed");
    const closureInput={...identity,seriesId:"leadership-conversation-series:cycle1",expectedWorkflowRevision:(await repository.read(fixture.organizationId)).revision,authorizedProjectionDigest:NORTHSTAR_PREPARED_LINEAGE.authorizedProjectionDigest,candidateAssessmentDigest:"candidate-assessment:cycle1",b11CommunicationDigest:"b11-communication:cycle1",personalRoomSheetDigest:"personal-room-sheet:cycle1",idempotencyKey:"cycle1-closure"};
    const closed=await operations.completeCycle1Closure(closureInput),replayed=await operations.completeCycle1Closure(closureInput),completion=closed.cycle1ClosureCompletions![0]!;
    check(closed.cycle1ClosureCompletions?.length===1&&replayed.cycle1ClosureCompletions?.length===1,"closure replay creates exactly one completed checkpoint");
    check(completion.checkpointId===store.frozenSnapshotPublications![0]!.artifactId&&completion.checkpointStatus==="completed","closure binds the exact frozen checkpoint");
    check(completion.sections.some(section=>section.label==="What changed"&&section.items[0]?.includes("No consequential result")),"truthful no-consequential-result closure");
    check(completion.prepareAgainReadiness.eligible&&completion.prepareAgainReadiness.checkpointId===completion.checkpointId,"valid checkpoint exposes bounded readiness metadata");
    await assert.rejects(()=>operations.completeCycle1Closure({...closureInput,authorizedProjectionDigest:"changed"}),/idempotency conflict/);check(true,"different-input same-key closure fails closed");
    await assert.rejects(()=>operations.completeCycle1Closure({...closureInput,idempotencyKey:"stale-closure",expectedWorkflowRevision:"stale"}),/revision changed/);check(true,"stale closure revision fails closed");
    await operations.receiveUpload({ ...identity, idempotencyKey: "upload", frozenSnapshotId: store.frozenSnapshotPublications![0]!.artifactId, purposeRef: fixture.purposeRef, mediaType: "text/plain", bytes: fixture.captureBytes, displayLabel: "Staff notes", originalFilename: null });
    check(store.preparedWorkProducts.length===0&&store.frozenSnapshots.length===0,"legacy combined Prepared Work and snapshot containers remain empty");
    store = (await repository.read(fixture.organizationId)).store;
    check(!JSON.stringify(store).includes("NORTHSTAR-LEADERSHIP-CAPTURE-001"), "workflow stores references, not source content");
    const authorizedContext=authorization("source-content:read-for-proposal");
    assert.equal(authorizedContext.disposition,"authorized");
    const governedScopeBinding=completeGovernedConsequenceScopeBindingV1({contractVersion:"1",organizationId:fixture.organizationId,scope,scopeOwnerContractVersion:"1",authorityRefs:authorizedContext.authorityRefs,policyRefs:authorizedContext.policyRefs,authorizationContextRef:authorizedContext.contextId});
    await assert.rejects(()=>operations.generateScopedFixtureProposals({ ...identity, idempotencyKey:"missing",uploadReceiptId:store.uploadReceipts[0]!.uploadReceiptId,purposeRef:fixture.purposeRef,governedScopeBinding:undefined as never}),/invalid/);
    check(true,"missing governed scope fails closed at the scoped creation boundary");
    check(await operations.generateScopedFixtureProposals({ ...identity, idempotencyKey: "proposals", uploadReceiptId: store.uploadReceipts[0]!.uploadReceiptId, purposeRef: fixture.purposeRef,governedScopeBinding }) === 4, "owner-issued governed scope is bound at proposal creation");
    store = (await repository.read(fixture.organizationId)).store;
    check(store.proposals.length===4&&store.proposals.every(value=>value.contractVersion==="2"&&value.governedScopeBinding.bindingDigest===governedScopeBinding.bindingDigest),"ordinary proposal creation emits governed V2 with exactly one immutable binding");
    check(await operations.generateScopedFixtureProposals({ ...identity, idempotencyKey: "proposals", uploadReceiptId: store.uploadReceipts[0]!.uploadReceiptId, purposeRef: fixture.purposeRef,governedScopeBinding }) === 4,"same-scope replay succeeds");
    check((await repository.read(fixture.organizationId)).store.proposals.length===4,"same-scope replay creates no duplicates");
    const teamScope={organizationId:fixture.organizationId,type:"team" as const,id:"team:delivery"};
    const teamContext=resolveScopedGovernanceContext({organizationId:fixture.organizationId,subjectId:fixture.actorId,requestedScope:teamScope,operation:"source-content:read-for-proposal",purpose:fixture.purposeRef,sensitivity:"standard",evaluatedAt:fixture.at,temporal:{mode:"current"},serverResolvedAuthority:[{authorityRef:"fixture-team-authority",policyRef:"fixture-team-policy",organizationId:fixture.organizationId,subjectId:fixture.actorId,scope:teamScope,operations:["source-content:read-for-proposal"],sensitivity:["standard"],relationship:"direct",status:"active",validFrom:fixture.at}]});
    assert.equal(teamContext.disposition,"authorized");
    const teamBinding=completeGovernedConsequenceScopeBindingV1({contractVersion:"1",organizationId:fixture.organizationId,scope:teamScope,scopeOwnerContractVersion:"1",authorityRefs:teamContext.authorityRefs,policyRefs:teamContext.policyRefs,authorizationContextRef:teamContext.contextId});
    check(await operations.generateScopedFixtureProposals({...identity,idempotencyKey:"proposals",uploadReceiptId:store.uploadReceipts[0]!.uploadReceiptId,purposeRef:fixture.purposeRef,governedScopeBinding:teamBinding})===4,"same text under a different exact scope creates distinct consequences");
    store=(await repository.read(fixture.organizationId)).store;
    check(store.proposals.length===8&&new Set(store.proposals.map(value=>value.proposalId)).size===8,"cross-scope semantic identity reuse is zero");
    await assert.rejects(()=>operations.generateScopedFixtureProposals({...identity,idempotencyKey:"foreign",uploadReceiptId:store.uploadReceipts[0]!.uploadReceiptId,purposeRef:fixture.purposeRef,governedScopeBinding:{...governedScopeBinding,organizationId:"foreign"}}),/invalid/);
    check(true,"foreign or integrity-invalid bindings fail closed");
    check(await operations.generateLegacyV1FixtureProposalsForValidation({...identity,idempotencyKey:"legacy",uploadReceiptId:store.uploadReceipts[0]!.uploadReceiptId,purposeRef:fixture.purposeRef})===4,"explicit test-only fixture preserves M-1 historical V1");
    store = (await repository.read(fixture.organizationId)).store;
    await operations.review({ ...identity, idempotencyKey: "review", proposalId: store.proposals[0]!.proposalId, disposition: "approved", effectivePayload: null, reason: null });
    store=(await repository.read(fixture.organizationId)).store;
    check(store.dispositions[0]!.governedScopeBindingDigest===governedScopeBinding.bindingDigest,"RW-0 review preserves the exact proposal binding");
    check(store.proposals.filter(value=>value.contractVersion==="1").length===4&&store.proposals.filter(value=>value.contractVersion==="1").every(value=>!("governedScopeBinding" in value)),"legacy V1 proposals receive no synthesized scope");
    const legacyIds=store.proposals.filter(value=>value.contractVersion==="1").map(value=>value.proposalId),beforeWorkerRevision=(await repository.read(fixture.organizationId)).revision,worker=await execFileAsync(process.execPath,[...process.execArgv,process.argv[1]!,"--historical-worker",workflowRoot,fixture.organizationId],{env:{...process.env,NODE_ENV:"test"}}),workerLine=worker.stdout.split("\n").find(value=>value.startsWith("FOUNDATION_WORKER_RESULT "));
    assert.ok(workerLine,"fresh-process historical worker result is required");const workerResult=JSON.parse(workerLine.slice("FOUNDATION_WORKER_RESULT ".length)) as {contractVersion:string;legacyIds:string[];bindingCount:number;revision:string|null;replayRevision:string|null;recordRewrite:number;recordDeletion:number;migration:number;backfill:number};
    check(workerResult.contractVersion==="1"&&workerResult.bindingCount===0&&workerResult.recordRewrite===0&&workerResult.recordDeletion===0&&workerResult.migration===0&&workerResult.backfill===0&&workerResult.revision===beforeWorkerRevision&&workerResult.replayRevision===beforeWorkerRevision&&JSON.stringify(workerResult.legacyIds)===JSON.stringify(legacyIds),"historical V1 fresh-process replay preserves exact unbound identity without rewrite, deletion, migration, or backfill");
    const validSnapshot=await repository.read(fixture.organizationId),ambiguous=structuredClone(validSnapshot.store),governed=ambiguous.proposals.find(value=>value.contractVersion==="2")!,governedDisposition=ambiguous.dispositions.find(value=>value.proposalId===governed.proposalId)!;governedDisposition.governedScopeBindingDigest=teamBinding.bindingDigest;
    await assert.rejects(()=>repository.replace(fixture.organizationId,ambiguous,validSnapshot.revision),/governed scope lineage/);check((await repository.read(fixture.organizationId)).revision===validSnapshot.revision,"ambiguous effective binding fails closed without fallback or persistence");
    const mixed=structuredClone(validSnapshot.store),mixedProposal=mixed.proposals.find(value=>value.contractVersion==="2")!;mixedProposal.governedScopeBinding.scope={organizationId:fixture.organizationId,type:"team",id:"team:unresolved-mixed"};
    await assert.rejects(()=>repository.replace(fixture.organizationId,mixed,validSnapshot.revision),/invalid/);check((await repository.read(fixture.organizationId)).revision===validSnapshot.revision,"inseparable mixed-scope consequence fails closed without permissive union or persistence");
    check((await repository.read(fixture.organizationId)).store.routingLinks.length === 0, "prepare/capture operations cannot route");
    check(!("route" in operations), "generic callback routing is absent");
    console.log(JSON.stringify({ validation: "leadership-conversation-prepare-capture-001", result: "PASS", checks, canonicalRoutes: 0, networkCalls: 0, connectorCalls: 0, driveReads: 0, driveWrites: 0, productionAccess: 0, deployments: 0 }));
  } finally {
    await rm(workflowRoot, { recursive: true, force: true });
    await rm(sourceRoot, { recursive: true, force: true });
    await rm(lineageRoot, { recursive: true, force: true });
    await assert.rejects(() => lstat(workflowRoot));
    await assert.rejects(() => lstat(sourceRoot));
    await assert.rejects(() => lstat(lineageRoot));
  }
}

const workerIndex=process.argv.indexOf("--historical-worker");if(workerIndex>=0){void historicalWorker(process.argv[workerIndex+1]!,process.argv[workerIndex+2]!).catch(error=>{console.error(error);process.exitCode=1;});}else void main();
