import assert from "node:assert/strict";
import { chmod, mkdtemp, mkdir, readdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createProductArtifactBodyRepository } from "../../product/persistence/productArtifactBodyRepository";
import { createProductWorkflowArtifactRepository } from "../../product/workflow/leadershipConversation/productWorkflowArtifactRepository";
import { ChiefMeetingPackOwner, ChiefMeetingPackRevisionConflictError } from "../../product/integration/chiefMeetingPackOwner";
import { chiefMeetingPackInputSnapshotDigest, composeChiefMeetingPack } from "../../product/integration/chiefMeetingPackComposer";
import { sourceScopedDigest, type SourceScopedCandidateV1, type SourceScopedSectionsV1 } from "../../lib/analysis/sourceScopedExecutiveAnalysisContracts";
import type { ChiefFirstPrepareViewV1, LeadershipConversationWorkspaceV1 } from "../../product/workflow/leadershipConversation";
import { reconcileMeetingPackDraftBuffers } from "../../product/workflow/leadershipConversation/meetingPackContracts";
import { SourceScopedExecutiveAnalysisOwner, type ValidatedSourceScopedAnalysisPublicationV1, type LifecycleAwareSourceScopedTransportV1 } from "../../product/integration/sourceScopedExecutiveAnalysis";
import { deterministicSourceScopedFakeTransport } from "../../lib/analysis/runSourceScopedFrontierAnalysis";
import { createLeadershipConversationServerCompositionForValidation } from "../../product/integration/leadershipConversationServerComposition";
import { provisionNorthstarPreparationLineageFixture } from "../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import { NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE, NORTHSTAR_PREPARED_CONTENT, NORTHSTAR_PREPARED_LINEAGE } from "../../product/workflow/leadershipConversation";

// Compare all durable bytes, including refs, blobs, workflow records and receipts.
async function durableInventory(root: string): Promise<Record<string, string>> {
  const inventory: Record<string, string> = {};
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(file);
      else inventory[path.relative(root, file)] = (await readFile(file)).toString("base64");
    }
  }
  await visit(root);
  return inventory;
}

type PackInput = Parameters<ChiefMeetingPackOwner["publish"]>[0];
const controlResults: Record<string, string> = {};
async function control(name: string, run: () => Promise<void>) {
  try { await run(); controlResults[name] = "PASS"; }
  catch (error) { controlResults[name] = "FAIL"; console.error(name, error); }
  console.log(`${name}: ${controlResults[name]}`);
}
function assertNoDisclosure(value: unknown, mint: ValidatedSourceScopedAnalysisPublicationV1) {
  const exposed = JSON.stringify(value, Object.getOwnPropertyNames(value ?? {}));
  const protectedValues = [mint.candidate.candidateDigest, mint.request.requestDigest,
    mint.request.packet.packetDigest, mint.publicationDigest, mint.lifecycleAttempt.attemptId,
    ...Object.values(mint.candidate.sections).flatMap(items => items.map(item => item.statement))];
  for (const secret of protectedValues) assert(!exposed?.includes(secret), "protected analysis disclosure");
}
async function mintAndCorruptionControls(input: PackInput & { validatedAnalysis: ValidatedSourceScopedAnalysisPublicationV1 }) {
  const root = await mkdtemp(path.join(tmpdir(), "chief-meeting-pack-controls-"));
  const workflow = createProductWorkflowArtifactRepository({ root: path.join(root, "workflow"), environment: "test" });
  const bodies = createProductArtifactBodyRepository({ root: path.join(root, "bodies") });
  const dependencies = { repository: workflow, bodyRepository: bodies, clock: { now: () => input.body.createdAt },
    authorize: async (identity: {userId:string;organizationId:string}) => identity.userId === input.userId && identity.organizationId === input.organizationId };
  const owner = new ChiefMeetingPackOwner(dependencies);
  try {
    for (const [name, forged] of [
      ["A1 structural-clone mint rejection", { ...input.validatedAnalysis }],
      ["A2 serialized-mint rejection", JSON.parse(JSON.stringify(input.validatedAnalysis))],
    ] as const) await control(name, async () => {
      const before = await durableInventory(root);
      await assert.rejects(() => owner.publish({ ...input, validatedAnalysis: forged }), error => {
        assert(error instanceof Error);
        assert.equal(error.message, "Validated source-scoped analysis publication is unavailable.");
        assertNoDisclosure(error, input.validatedAnalysis); return true;
      });
      assert.deepEqual(await durableInventory(root), before, "zero revisions, bodies, bindings or orphans");
    });
    await control("genuine mint positive control", async () => {
      const result = await owner.publish(input);
      assert.equal(result?.revision, 1);
      assert.deepEqual(await owner.readSourceScopedAnalysis(input), input.validatedAnalysis.candidate);
    });
    const clean = await workflow.read(input.organizationId);
    const header = clean.store.meetingPackPublications!.at(-1)!;
    const ref = header.sourceScopedAnalysisBodyReference!;
    const blob = path.join(root, "bodies", "organizations", input.organizationId, "owners", "leadership-conversation", "blobs", `${ref.exactBodyDigest}.blob`);
    const bytes = await readFile(blob);
    for (const name of ["B1 candidate-body corruption nondisclosure", "B2 request/packet corruption nondisclosure"]) {
      await control(name, async () => {
        if (name.startsWith("B1")) { const corrupt = Buffer.from(bytes); corrupt[0] ^= 1; await writeFile(blob, corrupt); }
        else {
          const changed = structuredClone(clean.store);
          changed.meetingPackPublications!.at(-1)!.sourceScopedAnalysisBinding!.requestDigest = "0".repeat(64);
          await workflow.replace(input.organizationId, changed, (await workflow.read(input.organizationId)).revision);
          assert.deepEqual(JSON.parse((await readFile(blob)).toString()), input.validatedAnalysis.candidate, "candidate remains syntactically valid and byte-exact");
        }
        const before = await durableInventory(root);
        let writes = 0;
        const reader = new ChiefMeetingPackOwner({ ...dependencies,
          repository: { read: workflow.read.bind(workflow), replace: async () => { writes++; throw new Error("unexpected write"); }, resetDevelopmentFixture: async () => { writes++; return false; } },
          bodyRepository: { backend: bodies.backend, readStagedExact: bodies.readStagedExact.bind(bodies), stage: async () => { writes++; throw new Error("unexpected write"); }, discardUnreferenced: async () => { writes++; } } });
        let returned: unknown = null, failure: unknown;
        try { returned = await reader.readSourceScopedAnalysis(input); } catch (error) { failure = error; }
        assert.equal(returned, null, "candidate returned: 0");
        if (failure) { assert(failure instanceof Error); assert.equal(failure.message, "Product artifact body integrity failed."); assertNoDisclosure(failure, input.validatedAnalysis); }
        assert.equal(writes, 0, "Product/Workflow writes: 0; isolated reader has no Runtime/source writer");
        assert.deepEqual(await durableInventory(root), before, "zero durable writes during read");
      });
      await writeFile(blob, bytes);
      if (name.startsWith("B2")) await workflow.replace(input.organizationId, clean.store, (await workflow.read(input.organizationId)).revision);
    }
    await control("C late-publication cleanup", async () => {
      const before = await durableInventory(root), stages: string[] = [];
      let persistenceFailures = 0;
      const failureRoot = await mkdtemp(path.join(tmpdir(), "chief-meeting-pack-late-failure-"));
      try {
        const emptyWorkflow = createProductWorkflowArtifactRepository({root:path.join(failureRoot,"workflow"),environment:"test"});
        const emptyBodies = createProductArtifactBodyRepository({root:path.join(failureRoot,"bodies")});
        const emptyBefore = await durableInventory(failureRoot);
        const lateOwner = new ChiefMeetingPackOwner({ ...dependencies,
          repository: { read: emptyWorkflow.read.bind(emptyWorkflow), resetDevelopmentFixture: emptyWorkflow.resetDevelopmentFixture.bind(emptyWorkflow), replace: async () => {
            assert.deepEqual(stages, ["source-scoped-analysis", "meeting-pack-draft"]);
            persistenceFailures++; throw new Error("validator final revision persistence failure");
          } },
          bodyRepository: { backend: emptyBodies.backend, readStagedExact: emptyBodies.readStagedExact.bind(emptyBodies), discardUnreferenced: emptyBodies.discardUnreferenced!.bind(emptyBodies),
            stage: async value => { const staged = await emptyBodies.stage(value); assert.equal(staged.disposition,"staged"); stages.push(value.artifactType); return staged; } } });
        await assert.rejects(() => lateOwner.publish(input), /validator final revision persistence failure/);
        assert.equal(persistenceFailures, 1);
        assert.deepEqual(await durableInventory(failureRoot), emptyBefore, "complete durable inventory restored; no revisions, orphan bodies, partial bindings or dangling refs");
      } finally { await rm(failureRoot,{recursive:true,force:true}); }
      assert.deepEqual(await durableInventory(root), before, "existing lawful publication remains unchanged");
    });
  } finally { await rm(root, { recursive: true, force: true }); }
}

async function historicalSuccessorControl(historicalAnalysis: SourceScopedCandidateV1) {
  const root = await mkdtemp(path.join(tmpdir(), "discovery-northstar-preparation-lineage-pack-upgrade-"));
  try {
    const fixture = NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE;
    const provisioned = await provisionNorthstarPreparationLineageFixture({environment:"test",fixtureRoot:root,now:fixture.at});
    const roots = {runtimeRoot:path.join(root,"runtime"),workflowRoot:path.join(root,"workflow"),sourceContentRoot:path.join(root,"discovery-governed-source-content-northstar-preparation"),lineageFixtureRoot:root,analysisLifecycleRoot:path.join(root,"lifecycle")};
    await mkdir(roots.workflowRoot,{mode:0o700}); await mkdir(roots.analysisLifecycleRoot,{mode:0o700});
    const identity = {userId:fixture.actorId,organizationId:fixture.organizationId,questionId:provisioned.seed.productQuestionId,conversationId:fixture.conversationId,seriesId:`leadership-conversation-series:${fixture.conversationId}`};
    let injectedRequests = 0;
    let request: Parameters<LifecycleAwareSourceScopedTransportV1>[0]["request"] | undefined;
    const fake: LifecycleAwareSourceScopedTransportV1 = async value => { injectedRequests++; request=value.request; return deterministicSourceScopedFakeTransport(value); };
    fake.withLifecycle = hooks => async value => {
      await hooks.transportEntry(); const output = await fake(value) as {model:string};
      await hooks.responseHeaders(output.model); const bytes=JSON.stringify(output);
      await hooks.responseBody({responseByteCount:Buffer.byteLength(bytes),responseDigest:sourceScopedDigest(bytes)});
      await hooks.candidateParsed(output.model); return output;
    };
    const bodies = createProductArtifactBodyRepository({root:path.join(root,"bodies")});
    const server = createLeadershipConversationServerCompositionForValidation({...roots,...identity,bodyRepository:bodies,analysisModel:"gpt-5.6-sol",analysisTransport:fake});
    await server.recordContext({...identity,idempotencyKey:"upgrade-context",title:"Recurring executive review",purpose:"Resolve the next material constraint.",intendedOutcome:"Prepare one better decision.",timeframe:"Weekly",participants:[{participantRef:`participant:${identity.userId}`,displayName:"Designated executive",titleLabel:"Executive"}],leaderContext:null});
    const workflow=createProductWorkflowArtifactRepository({root:roots.workflowRoot,environment:"test"});
    const context=(await workflow.read(identity.organizationId)).store.contexts.at(-1)!;
    await server.recordPreparation({...identity,idempotencyKey:"upgrade-prepare",contextVersionId:context.contextVersionId,content:NORTHSTAR_PREPARED_CONTENT,lineage:NORTHSTAR_PREPARED_LINEAGE,changeSummary:null});
    const prepared=(await workflow.read(identity.organizationId)).store.preparedWorkPublications!.at(-1)!;
    const owner=new ChiefMeetingPackOwner({repository:workflow,bodyRepository:bodies,clock:{now:()=>fixture.at},authorize:async input=>input.userId===identity.userId&&input.organizationId===identity.organizationId});
    const privateState=await owner.noteIdentity(identity);
    const historical=composeChiefMeetingPack({...identity,occurrenceId:identity.conversationId,userScopeDigest:privateState.userScopeDigest,prepare:{meeting:{purpose:"Resolve the next material constraint."},priorCycle:{status:"none"}} as ChiefFirstPrepareViewV1,workspace:{reviewedCarryForwardCompletion:null} as unknown as LeadershipConversationWorkspaceV1,analysis:historicalAnalysis,notes:[],inputSnapshotDigest:"historical-input",sourceLineageDigest:prepared.materialLineage!.envelopeDigest,preparedWorkPublicationDigest:prepared.headerDigest,priorCompletionDigest:null,createdAt:fixture.at});
    const one=await owner.publish({...identity,body:historical,idempotencyKey:"historical-one"}); assert(one);
    const two=await owner.revise({...identity,agendaText:one.agendaText+"\nHistorical revision two",talkingPointsText:one.talkingPointsText,expectedArtifactRevision:one.artifactRevision,idempotencyKey:"historical-two"}); assert(two);
    const three=await owner.revise({...identity,agendaText:two.agendaText+"\nCurrent revision three",talkingPointsText:two.talkingPointsText,expectedArtifactRevision:two.artifactRevision,idempotencyKey:"historical-three"}); assert.equal(three?.revision,3);
    const before=(await workflow.read(identity.organizationId)).store.meetingPackPublications!;
    assert.equal(before.length,3); assert(before.every(header=>!header.sourceScopedAnalysisBodyReference&&!header.sourceScopedAnalysisBinding));
    const historyBytes=await Promise.all(before.map(header=>bodies.readStagedExact(header.protectedBody)));
    await control("D revision-3 → revision-4 successor upgrade",async()=>{
      const result=await server.buildMeetingPack(identity); assert.equal(result.revision,4);
      const after=(await workflow.read(identity.organizationId)).store.meetingPackPublications!;
      assert.equal(after.length,4); assert.deepEqual(after.slice(0,3),before,"zero historical mutations/backfills");
      assert.deepEqual(await Promise.all(before.map(header=>bodies.readStagedExact(header.protectedBody))),historyBytes,"revision 3 and all historical bodies unchanged byte-for-byte");
      const header=after[3],binding=header.sourceScopedAnalysisBinding;
      assert(binding&&header.sourceScopedAnalysisBodyReference&&request);
      const candidate=await owner.readSourceScopedAnalysis(identity); assert(candidate);
      assert.equal(binding.candidateDigest,candidate.candidateDigest); assert.equal(binding.requestDigest,request.requestDigest);
      assert.equal(binding.sourcePacketDigest,request.packet.packetDigest); assert.equal(binding.questionDigest,sourceScopedDigest(request.question));
      assert.equal(binding.configurationDigest,request.configuration.configurationDigest);
      assert.equal(binding.preparedWorkPublicationDigest,prepared.headerDigest); assert.equal(binding.sourceLineageDigest,prepared.materialLineage!.envelopeDigest);
      assert.deepEqual(binding.sourceVersions,request.packet.sources.map(source=>({sourceId:source.sourceId,sourceVersion:source.sourceVersion,bodyDigest:source.bodyDigest})));
      const refs=Object.entries(await durableInventory(path.join(root,"bodies"))).filter(([file])=>file.endsWith(".json")).map(([,bytes])=>JSON.parse(Buffer.from(bytes,"base64").toString()));
      assert.equal(refs.filter(ref=>ref.artifactType==="source-scoped-analysis").length,1);
      assert.equal(injectedRequests,1,"only injected local transport executed");
    });
    await control("D exact replay creates no revision 5",async()=>{
      const beforeReplay=await durableInventory(path.join(root,"bodies"));
      const workflowBefore=await durableInventory(roots.workflowRoot);
      const result=await server.buildMeetingPack(identity); assert.equal(result.revision,4);
      assert.equal((await workflow.read(identity.organizationId)).store.meetingPackPublications!.length,4);
      assert.deepEqual(await durableInventory(path.join(root,"bodies")),beforeReplay,"zero new candidate or presentation bodies");
      assert.deepEqual(await durableInventory(roots.workflowRoot),workflowBefore,"zero new revisions or bindings");
    });
  } finally { await rm(root,{recursive:true,force:true}); }
}

async function main(){
const root=await mkdtemp(path.join(tmpdir(),"chief-meeting-pack-v1-")),workflow=createProductWorkflowArtifactRepository({root:path.join(root,"workflow"),environment:"test"}),bodyRepository=createProductArtifactBodyRepository({root:path.join(root,"bodies")}),now="2026-09-02T12:00:00.000Z",authorized=new Set(["user-a","user-b"]),owner=new ChiefMeetingPackOwner({repository:workflow,bodyRepository,clock:{now:()=>now},authorize:async input=>authorized.has(input.userId)&&input.organizationId==="org"}),base={organizationId:"org",questionId:"question",conversationId:"occurrence",seriesId:"leadership-conversation-series:occurrence"},a={...base,userId:"user-a"},b={...base,userId:"user-b"};
const item=(statement:string)=>({statement,citations:[{sourceId:"source",sourceVersion:"v1",bodyDigest:"a".repeat(64),sourcePacketDigest:"packet"}],factCheck:"PASS" as const}),empty=()=>[] as ReturnType<typeof item>[];
const sections:SourceScopedSectionsV1={whatMattersNow:[item("Release coordination is the leading current explanation.")],whyItMatters:[item("Coordination delays affect delivery.")],competingExplanations:[item("Staffing may still contribute.")],whatChanged:[item("Interface latency improved.")],decisions:[item("Decide whether to change the release sequence.")],notDecided:empty(),commitments:[item("Confirm an owner for release readiness.")],openQuestions:[item("Which dependency remains unresolved?")],contradictions:[item("The staffing account conflicts with rework evidence.")],evidenceUncertainty:[item("Customer impact evidence is missing.")],modelUncertainty:empty(),organizationalDisagreement:empty(),attention:[item("Keep ownership explicit.")],whatWouldChangeAssessment:[item("Matched delivery evidence would change the view.")]};
const candidateBase={contractVersion:"1" as const,status:"user-scoped-ai-generated-noncanonical-not-reviewed" as const,organizationId:"org",subjectId:"user-a",questionId:"question",seriesId:"leadership-conversation-series:occurrence",occurrenceId:"occurrence",requestDigest:"r".repeat(64),sourcePacketDigest:"p".repeat(64),configurationDigest:"c".repeat(64),model:"test-model",sections,usage:{inputTokens:1,outputTokens:1,totalTokens:2,latencyMs:1,returnedModel:"test-model"}},candidate={...candidateBase,candidateDigest:sourceScopedDigest(candidateBase)} satisfies SourceScopedCandidateV1,prepare={meeting:{purpose:"Resolve the delivery constraint."},priorCycle:{status:"none"}} as ChiefFirstPrepareViewV1,workspace={reviewedCarryForwardCompletion:null} as unknown as LeadershipConversationWorkspaceV1;
try{
  assert.equal(await owner.read(a),null,"analysis-not-yet / pack-absent");
  assert.equal(await owner.hasPublishedPack(a),false,"authorized pack-header lookup distinguishes an absent pack without a protected body read");
  await owner.addPrivateNote({...a,intent:"keep-private",text:"Founder-only concern.",idempotencyKey:"note-private"});
  await owner.addPrivateNote({...a,intent:"talking-points",text:"Ask about the partner dependency.",idempotencyKey:"note-talking"});
  await owner.addPrivateNote({...a,intent:"agenda",text:"Discuss the launch sequence.",idempotencyKey:"note-agenda"});
  const state=await owner.noteIdentity(a),inputSnapshotDigest=chiefMeetingPackInputSnapshotDigest({...base,occurrenceId:base.conversationId,userScopeDigest:state.userScopeDigest,preparedWorkPublicationDigest:"publication",analysisDigest:"candidate",priorCompletionDigest:null,notes:state.notes.map(note=>({noteId:note.noteId,noteRevisionId:note.noteRevisionId,intent:note.intent}))}),packBody=composeChiefMeetingPack({...base,occurrenceId:base.conversationId,userScopeDigest:state.userScopeDigest,prepare,workspace,analysis:candidate,notes:state.notes,inputSnapshotDigest,sourceLineageDigest:"lineage",preparedWorkPublicationDigest:"publication",priorCompletionDigest:null,createdAt:now});
  assert(!packBody.agendaText.includes("Founder-only concern."));assert(!packBody.agendaText.includes("Ask about the partner dependency."));assert(packBody.agendaText.includes("Discuss the launch sequence."));assert(!packBody.agendaText.includes("Changed since last time"),"first occurrence makes no prior-change claim");assert.equal(packBody.inputBasis.priorReviewedOutcomes,0);assert(packBody.talkingPointsText.includes("Ask about the partner dependency."));assert(!packBody.talkingPointsText.includes("Founder-only concern."));
  const[first,replay]=await Promise.all([owner.publish({...a,body:packBody,idempotencyKey:`build:${inputSnapshotDigest}`}),owner.publish({...a,body:packBody,idempotencyKey:`build:${inputSnapshotDigest}`})]);assert(first);assert.equal(replay?.artifactRevision,first?.artifactRevision,"actual concurrent build CAS convergence");
  assert.equal(await owner.hasPublishedPack(a),true,"authorized pack-header lookup identifies an existing pack before body reconstruction");
  assert.equal(await owner.read(b),null,"cross-user private isolation");
  const revised=await owner.revise({...a,agendaText:`${first!.agendaText}\nUser agenda edit`,talkingPointsText:`${first!.talkingPointsText}\nUser private edit`,expectedArtifactRevision:first!.artifactRevision,idempotencyKey:"revise-1"});assert.equal(revised?.revision,2);assert(revised?.agendaText.includes("User agenda edit"));
  const reconstructedOwner=new ChiefMeetingPackOwner({repository:workflow,bodyRepository,clock:{now:()=>now},authorize:async input=>authorized.has(input.userId)&&input.organizationId==="org"}),fresh=await reconstructedOwner.read(a,{preparedWorkPublicationDigest:"publication",priorCompletionDigest:null});assert.equal(fresh?.artifactRevision,revised?.artifactRevision,"fresh-process reconstruction");
  const child=JSON.parse(execFileSync(process.execPath,["--conditions=react-server","--import","tsx",path.join(process.cwd(),"scripts/product/validateChiefMeetingPackFreshProcess.ts"),root],{encoding:"utf8"}));assert.equal(child.artifactRevision,revised?.artifactRevision,"true child-process reconstruction");
  const replayRevision=await reconstructedOwner.revise({...a,agendaText:revised!.agendaText,talkingPointsText:revised!.talkingPointsText,expectedArtifactRevision:first!.artifactRevision,idempotencyKey:"revise-1"});assert.equal(replayRevision?.artifactRevision,revised?.artifactRevision,"exact save replay");
  await assert.rejects(()=>owner.revise({...a,agendaText:"conflict",talkingPointsText:"conflict",expectedArtifactRevision:first!.artifactRevision,idempotencyKey:"revise-conflict"}),ChiefMeetingPackRevisionConflictError);
  const stale=await owner.read(a,{preparedWorkPublicationDigest:"changed-input",priorCompletionDigest:null});assert.equal(stale?.potentiallyOutOfDate,true);assert(stale?.agendaText.includes("User agenda edit"));
  assert.deepEqual(reconcileMeetingPackDraftBuffers({agendaText:"unsaved agenda",talkingPointsText:"unsaved talking"},stale,true),{agendaText:"unsaved agenda",talkingPointsText:"unsaved talking"},"saving a note preserves both dirty buffers");
  await owner.addPrivateNote({...b,intent:"keep-private",text:"User B only.",idempotencyKey:"note-b"});const bState=await owner.noteIdentity(b),bDigest=chiefMeetingPackInputSnapshotDigest({...base,occurrenceId:base.conversationId,userScopeDigest:bState.userScopeDigest,preparedWorkPublicationDigest:"publication",analysisDigest:"candidate",priorCompletionDigest:null,notes:bState.notes.map(note=>({noteId:note.noteId,noteRevisionId:note.noteRevisionId,intent:note.intent}))}),bBody=composeChiefMeetingPack({...base,occurrenceId:base.conversationId,userScopeDigest:bState.userScopeDigest,prepare,workspace,analysis:candidate,notes:bState.notes,inputSnapshotDigest:bDigest,sourceLineageDigest:"lineage",preparedWorkPublicationDigest:"publication",priorCompletionDigest:null,createdAt:now}),bPack=await owner.publish({...b,body:bBody,idempotencyKey:`build:${bDigest}`});assert(bPack);assert.notEqual(bPack.artifactRevision,revised?.artifactRevision);assert(!bPack.talkingPointsText.includes("Founder-only concern."));assert(!revised?.talkingPointsText.includes("User B only."));
  const occurrence2=composeChiefMeetingPack({organizationId:base.organizationId,questionId:base.questionId,seriesId:base.seriesId,occurrenceId:"occurrence-2",userScopeDigest:state.userScopeDigest,prepare,workspace,analysis:candidate,notes:[],inputSnapshotDigest:"occurrence-2-snapshot",sourceLineageDigest:"lineage-2",preparedWorkPublicationDigest:"publication-2",priorCompletionDigest:"closure-1",priorReviewedItems:["Approved prior decision."],priorMaterialChanges:["Approved understanding changed."],createdAt:now});assert.equal(occurrence2.inputBasis.priorReviewedOutcomes,1);assert(occurrence2.agendaText.includes("Approved understanding changed."));assert(occurrence2.talkingPointsText.includes("Approved prior decision."));assert(!occurrence2.agendaText.includes("Rejected claim"));
  const a2={...a,conversationId:"occurrence-2"},b2={...b,conversationId:"occurrence-2"};await owner.addPrivateNote({...a2,intent:"talking-points",text:"User A Occurrence 2 only.",idempotencyKey:"note-a-o2"});await owner.addPrivateNote({...b2,intent:"keep-private",text:"User B Occurrence 2 only.",idempotencyKey:"note-b-o2"});const buildO2=async(input:typeof a2)=>{const privateState=await owner.noteIdentity(input),digest=chiefMeetingPackInputSnapshotDigest({organizationId:input.organizationId,questionId:input.questionId,seriesId:input.seriesId,occurrenceId:input.conversationId,userScopeDigest:privateState.userScopeDigest,preparedWorkPublicationDigest:"publication-2",analysisDigest:"candidate",priorCompletionDigest:"closure-1",notes:privateState.notes.map(note=>({noteId:note.noteId,noteRevisionId:note.noteRevisionId,intent:note.intent}))}),body=composeChiefMeetingPack({organizationId:input.organizationId,questionId:input.questionId,seriesId:input.seriesId,occurrenceId:input.conversationId,userScopeDigest:privateState.userScopeDigest,prepare,workspace,analysis:candidate,notes:privateState.notes,inputSnapshotDigest:digest,sourceLineageDigest:"lineage-2",preparedWorkPublicationDigest:"publication-2",priorCompletionDigest:"closure-1",priorReviewedItems:["Approved prior decision."],priorMaterialChanges:["Approved understanding changed."],createdAt:now});return owner.publish({...input,body,idempotencyKey:`build:${digest}`});},a2Pack=await buildO2(a2),b2Pack=await buildO2(b2);assert(a2Pack&&b2Pack);assert.notEqual(a2Pack.artifactRevision,b2Pack.artifactRevision,"two users receive distinct private Occurrence 2 artifacts");assert(a2Pack.talkingPointsText.includes("User A Occurrence 2 only."));assert(!a2Pack.talkingPointsText.includes("User B Occurrence 2 only."));assert(!b2Pack.talkingPointsText.includes("User A Occurrence 2 only."));assert(!a2Pack.talkingPointsText.includes("Founder-only concern."));assert(!b2Pack.talkingPointsText.includes("User B only."),"Occurrence 1 private context does not carry forward");assert(!a2Pack.agendaText.includes("User A Occurrence 2 only."));assert(!b2Pack.agendaText.includes("User B Occurrence 2 only."));await assert.rejects(()=>owner.revise({...b2,agendaText:a2Pack.agendaText,talkingPointsText:a2Pack.talkingPointsText,expectedArtifactRevision:a2Pack.artifactRevision,idempotencyKey:"cross-user-edit"}),ChiefMeetingPackRevisionConflictError);
  authorized.delete("user-a");await assert.rejects(()=>owner.read(a),/unavailable/);authorized.add("user-a");assert.equal(await owner.read({...a,conversationId:"wrong",seriesId:"leadership-conversation-series:wrong"}),null,"wrong occurrence discloses nothing");
  const stored=(await workflow.read("org")).store;assert.equal(stored.meetingPackPublications?.length,5);assert.equal(stored.meetingPackPrivateNotePublications?.length,6);assert.equal(stored.proposals.length+stored.dispositions.length+stored.canonicalRoutingReceipts.length+(stored.cycle1ClosureCompletions?.length??0)+(stored.reviewedCarryForwardCompletions?.length??0),0,"canonical review lifecycle writes");const bodyRoot=path.join(root,"bodies/organizations/org/owners/leadership-conversation"),physicalBodyRefs=(await readdir(path.join(bodyRoot,"refs"))).filter(value=>value.endsWith(".json")).length,physicalBlobs=(await readdir(path.join(bodyRoot,"blobs"))).filter(value=>value.endsWith(".blob")).length;assert.equal(physicalBodyRefs,11,"every durable private publication has exactly one protected-body ref");assert.equal(physicalBlobs,11,"no losing-CAS body orphan or duplicate blob");
  const preservationRoot=await mkdtemp(path.join(tmpdir(),"chief-meeting-pack-preservation-v1-"));try{const lifecycleRoot=path.join(preservationRoot,"lifecycle");await mkdir(lifecycleRoot,{recursive:true});await chmod(lifecycleRoot,0o700);const sourceBody="Source-grounded delivery evidence.",sourceDigest=sourceScopedDigest(sourceBody),transport=Object.assign(deterministicSourceScopedFakeTransport,{withLifecycle:(hooks:any)=>async(value:any)=>{await hooks.transportEntry();const output=await deterministicSourceScopedFakeTransport(value) as any;await hooks.responseHeaders(output.model);const bytes=JSON.stringify(output);await hooks.responseBody({responseByteCount:Buffer.byteLength(bytes),responseDigest:sourceScopedDigest(bytes)});await hooks.candidateParsed(output.model);return output;}}),analysisOwner=new SourceScopedExecutiveAnalysisOwner({providerFamily:"fake",model:"gpt-5.6-sol",transport,authorizeDesignatedPrincipal:async()=>true,selectCurrentPrepareSources:async()=>[{organizationId:"org",sourceId:"source",sourceVersion:"v1",title:"Source",effectiveAt:now,authority:"authoritative",normalizedBodyDigest:sourceDigest}],resolveCurrentAccess:async()=>({disposition:"eligible",accessDigest:"access"}),readProtectedBody:async()=>sourceBody}),analysisInput={subjectId:"user-a",organizationId:"org",questionId:"question",seriesId:"leadership-conversation-series:occurrence",occurrenceId:"occurrence",question:"What matters now?"};analysisOwner.configureLifecycle({root:lifecycleRoot,resolve:async()=>({preparedWorkPublicationDigest:"publication",materialLineageDigest:"lineage"})});const analyzed=await analysisOwner.analyze(analysisInput);assert.equal(analyzed.status,"eligible");if(analyzed.status!=="eligible"||!analyzed.validatedPublication)throw new Error("validated publication unavailable");const preservationWorkflow=createProductWorkflowArtifactRepository({root:path.join(preservationRoot,"workflow"),environment:"test"}),preservationBodies=createProductArtifactBodyRepository({root:path.join(preservationRoot,"bodies")}),preservationOwner=new ChiefMeetingPackOwner({repository:preservationWorkflow,bodyRepository:preservationBodies,clock:{now:()=>now},authorize:async input=>input.userId==="user-a"&&input.organizationId==="org"}),generatedBody=composeChiefMeetingPack({...base,occurrenceId:base.conversationId,userScopeDigest:state.userScopeDigest,prepare,workspace,analysis:analyzed.candidate,notes:state.notes,inputSnapshotDigest,sourceLineageDigest:"lineage",preparedWorkPublicationDigest:"publication",priorCompletionDigest:null,createdAt:now});await mintAndCorruptionControls({...a,body:generatedBody,idempotencyKey:"mint-controls",validatedAnalysis:analyzed.validatedPublication});await preservationOwner.publish({...a,body:generatedBody,idempotencyKey:"historical-presentation-only"});assert.equal(await preservationOwner.readSourceScopedAnalysis(a),null,"historical presentation-only revisions remain readable without a candidate reference");const preserved=await preservationOwner.refresh({...a,body:generatedBody,validatedAnalysis:analyzed.validatedPublication});assert.equal(preserved?.revision,2,"the server-minted validated candidate creates one referenced revision");assert.deepEqual(await preservationOwner.readSourceScopedAnalysis(a),analyzed.candidate,"authorized server reconstruction returns the exact preserved candidate");assert.equal((await preservationOwner.refresh({...a,body:generatedBody,validatedAnalysis:analyzed.validatedPublication}))?.artifactRevision,preserved?.artifactRevision,"exact replay creates no third revision");const edited=await preservationOwner.revise({...a,agendaText:`${preserved!.agendaText}\nEdited`,talkingPointsText:preserved!.talkingPointsText,expectedArtifactRevision:preserved!.artifactRevision,idempotencyKey:"preserved-edit"});assert.equal(edited?.revision,3);assert.deepEqual(await preservationOwner.readSourceScopedAnalysis(a),analyzed.candidate,"presentation edit preserves the candidate reference and binding");}finally{await rm(preservationRoot,{recursive:true,force:true});}
  await historicalSuccessorControl(candidate);
  assert(Object.values(controlResults).every(result=>result==="PASS"), "Founder-Alpha runtime controls failed");
  console.log(JSON.stringify({result:"PASS",controls:controlResults,scenarios:21,freshProcesses:2,concurrentBuildConvergence:"actual Promise.all CAS convergence",users:2,occurrences:2,twoUserOccurrence2Builds:2,crossUserOccurrence2EditDenials:1,meetingPackPublications:5,privateNotePublications:6,physicalBodyRefs,physicalBlobs,orphanBodyRefs:0,orphanBlobs:0,providerRequests:0,canonicalWrites:0,reviewPromotionWrites:0,lifecycleWrites:0,crossUserPrivateDisclosures:0,crossOccurrencePrivateDisclosures:0,privateAgendaLeaks:0,duplicateAgendaDrafts:0,duplicateTalkingPointDrafts:0,duplicateUserRevisions:0,exactCandidatePreservation:true}));
}finally{await rm(root,{recursive:true,force:true});}}
void main();
