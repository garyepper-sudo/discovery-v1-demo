import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, rm, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import postgres from "postgres";
import { PostgresParticipantReferenceAccessRepository } from "../../db/governance/postgresRepositories";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { FounderFirstUnderstandingApplicationService } from "../../lib/alpha-activation/founderFirstUnderstandingApplicationService";
import { createFounderFirstUnderstandingOwnerBundleForIsolatedValidation } from "../../lib/alpha-activation/founderFirstUnderstandingOwnerBundle";
import { parseFirstUnderstandingForm } from "../../lib/alpha-activation/founderFirstUnderstandingForm";
import type { RegisteredMeetingPreparationScopeV1 } from "../../product/workflow/leadershipConversation";
import {resolveScopedGovernanceContext} from "../../engine/v3/governance/scopedGovernanceContext";

function form(name:string) { const data=new FormData(); for(const [key,value] of Object.entries({organizationDisplayName:name,understandingPurpose:"Understand our delivery constraints",primaryQuestion:"Which delivery constraints matter first?",meetingTitle:"Weekly understanding",cadence:"Weekly",confirmation:"confirmed"}))data.set(key,value);data.append("files",new File(["Delivery is delayed at the handoff."],"delivery.txt"));data.append("sourcePurpose","Describe the handoff");data.append("files",new File(["# Review\nThe first review asks for evidence."],"review.md"));data.append("sourcePurpose","Frame the review");return data; }
async function main(){
 const root=await mkdtemp(path.join(tmpdir(),"discovery-first-understanding-apply-"));
 const url=process.env.DISCOVERY_TEST_DATABASE_URL;
 if(!url||!/^postgres(?:ql)?:\/\/[^/]+@(127\.0\.0\.1|localhost):55432\//u.test(url))throw new Error("An explicitly configured local validation database is required.");
 const sql=postgres(url,{max:1}), rollback=new Error("ROLLBACK_VALIDATION");let checks=0;
 try{await sql.begin("isolation level serializable",async tx=>{
  // Existing repository SQL runs unchanged. Nested owner transactions become
  // savepoints inside this outer transaction, which is always rolled back.
  const nested=new Proxy(tx,{get(target,key,receiver){return key==="begin"?(_options:unknown,operation:(value:typeof tx)=>Promise<unknown>)=>target.savepoint(operation):Reflect.get(target,key,receiver);}});
  const participantRef=`participant:${randomUUID()}`, accessRepository=new PostgresParticipantReferenceAccessRepository(nested as unknown as typeof sql);
  const bundle=createFounderFirstUnderstandingOwnerBundleForIsolatedValidation({runtime:new FilesystemOrganizationRuntimeRepository(path.join(root,"runtime")),accessRepository,workflowRoot:path.join(root,"workflow"),sourceRoot:path.join(root,"sources"),bodyRoot:path.join(root,"bodies"),participantRef,consumerId:"user_isolated_request",close:async()=>undefined});
  const input=await parseFirstUnderstandingForm(form(`Isolated organization ${randomUUID()}`)), service=new FounderFirstUnderstandingApplicationService(bundle);
  const bad=form("Forbidden");bad.set("participantRef",participantRef);await assert.rejects(()=>parseFirstUnderstandingForm(bad));checks++;
  const preview=await service.preview(input);assert.equal(preview.preview.organization,"create");assert.equal(preview.preview.preparedWork,"create");checks++;
  assert.deepEqual(await readdir(root),[],"preview performs no filesystem writes");
  const runtimeRead=bundle.runtime.read.bind(bundle.runtime);bundle.runtime.read=async()=>{throw Object.assign(new Error("Runtime unavailable"),{code:"unavailable"});};
  assert.equal((await service.apply(input)).status,"unavailable","unavailable owner is not mislabeled as retry-required");bundle.runtime.read=runtimeRead;checks++;
  assert.equal((await service.apply(input)).status,"applied","first Apply uses the actual application service");checks++;
  const bootstrap=await bundle.applyBootstrap();
  await bundle.applyAccess();
  const first=await bundle.admitSources(bootstrap.productQuestionId);
  let inspectionReads=0;const sourceRead=bundle.sourceRepository.read.bind(bundle.sourceRepository);bundle.sourceRepository.read=async(...args)=>{inspectionReads++;return sourceRead(...args);};
  await assert.rejects(()=>bundle.sourceContent.inspectExactWriteState({organizationId:bootstrap.organizationId,productQuestionId:bootstrap.productQuestionId,sourceBindingId:first[0]!.sourceBindingId,purposeRef:"leadership-conversation-capture",normalizedContentDigest:first[0]!.normalizedContentDigest,exactContentDigest:input.sources[0]!.exactDigest,byteLength:input.sources[0]!.bytes.byteLength,authorization:resolveScopedGovernanceContext({organizationId:bootstrap.organizationId,subjectId:"unrelated",requestedScope:{organizationId:bootstrap.organizationId,type:"organization",id:bootstrap.organizationId},operation:"source-content:write",purpose:"leadership-conversation-capture",sensitivity:"standard",evaluatedAt:new Date().toISOString(),temporal:{mode:"current"},serverResolvedAuthority:[]})}));assert.equal(inspectionReads,0);bundle.sourceRepository.read=sourceRead;checks++;
  await bundle.registerScope(bootstrap.productQuestionId);
  const meeting=await bundle.provisionMeeting();
  assert.ok(await bundle.destination(bootstrap.productQuestionId,meeting.seriesId));checks++;
  await bundle.applyBootstrap(); await bundle.applyAccess(); await bundle.admitSources(bootstrap.productQuestionId); await bundle.registerScope(bootstrap.productQuestionId); await bundle.provisionMeeting();
  const applied=await service.apply(input);assert.equal(applied.status,"replayed");checks++;
  const stored=await bundle.runtime.read(bootstrap.organizationId);assert.ok(stored);assert.equal(stored.runtime.metadata.investigationCount,0);assert.equal(stored.runtime.memory.canonicalScopeLineageIndex?.sourceBindings.length,2);checks++;
  const workflow=(await bundle.workflow.read(bootstrap.organizationId)).store;assert.equal(workflow.contexts.length,1);assert.equal(workflow.preparedWorkPublications?.length,1);assert.equal((workflow as typeof workflow&{registeredMeetingPreparationScopes:RegisteredMeetingPreparationScopeV1[]}).registeredMeetingPreparationScopes.length,1);checks++;
  assert.equal((await accessRepository.findGrants({organizationId:bootstrap.organizationId,participantRef,scope:"organization"})).length,1);assert.equal((await accessRepository.findGrants({organizationId:bootstrap.organizationId,participantRef,scope:"meeting-series",meetingSeriesId:meeting.seriesId})).length,1);checks++;
  for(const source of input.sources){const blob=path.join(root,"sources","organizations",bootstrap.organizationId,"blobs",`${source.exactDigest}.blob`);assert.deepEqual(new Uint8Array(await readFile(blob)),source.bytes);}
  const altered=structuredClone(input);altered.sources[0]!.bytes=new TextEncoder().encode("Changed content");altered.sources[0]!.exactDigest=createHash("sha256").update(altered.sources[0]!.bytes).digest("hex");altered.sources[0]!.normalizedDigest=altered.sources[0]!.exactDigest;assert.notEqual((await service.apply(altered)).status,"applied");checks++;
  await service.plan(input);await unlink(path.join(root,"sources","organizations",bootstrap.organizationId,"blobs",`${input.sources[0]!.exactDigest}.blob`));await bundle.admit(input.sources[0]!,bootstrap.productQuestionId);assert.equal((await service.apply(input)).status,"replayed");checks++;
  assert.equal(first.length,2);assert.equal(workflow.meetingPackPublications?.length??0,0);
  for(const failure of ["source-content","meeting-grant","prepared-work"] as const) {
    const scenarioRoot=path.join(root,failure),scenario=createFounderFirstUnderstandingOwnerBundleForIsolatedValidation({runtime:new FilesystemOrganizationRuntimeRepository(path.join(scenarioRoot,"runtime")),accessRepository,workflowRoot:path.join(scenarioRoot,"workflow"),sourceRoot:path.join(scenarioRoot,"sources"),bodyRoot:path.join(scenarioRoot,"bodies"),participantRef,consumerId:"user_isolated_request",close:async()=>undefined}),scenarioService=new FounderFirstUnderstandingApplicationService(scenario),scenarioInput=await parseFirstUnderstandingForm(form(`Recovery ${failure} ${randomUUID()}`));
    const sourceWrite=scenario.sourceContent.write.bind(scenario.sourceContent),grant=scenario.access.grant.bind(scenario.access),stage=scenario.bodies.stage.bind(scenario.bodies);
    if(failure==="source-content")scenario.sourceContent.write=async()=>{throw new Error("Injected source failure after real binding");};
    if(failure==="meeting-grant")scenario.access.grant=async value=>{if(value.scope==="meeting-series")throw new Error("Injected grant failure after real context");return grant(value);};
    if(failure==="prepared-work")scenario.bodies.stage=async()=>{throw new Error("Injected Prepared Work staging failure");};
    assert.equal((await scenarioService.apply(scenarioInput)).status,"retry-required");
    scenario.sourceContent.write=sourceWrite;scenario.access.grant=grant;scenario.bodies.stage=stage;
    assert.equal((await scenarioService.apply(scenarioInput)).status,"replayed");
    const recovered=await scenario.applyBootstrap(),records=(await scenario.workflow.read(recovered.organizationId)).store;
    assert.equal(records.contexts.length,1);assert.equal(records.preparedWorkPublications?.length,1);assert.equal((await scenario.runtime.read(recovered.organizationId))?.runtime.memory.canonicalScopeLineageIndex?.sourceBindings.length,2);checks++;
  }
  console.log(`PASS real canonical Apply/replay/source restoration checks=${checks}; actual Postgres+filesystem owners; rollback pending`);
  throw rollback;
 }).catch(error=>{if(error!==rollback)throw error;});
 console.log("PASS isolated SQL transaction rolled back; founder state writes=0");
 }finally{await sql.end({timeout:1});await rm(root,{recursive:true,force:true});}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
