import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const navigationHarness=`data:text/javascript,${encodeURIComponent('export function notFound(){const error=new Error("NEXT_NOT_FOUND");throw error}export function redirect(destination){const error=new Error(`NEXT_REDIRECT:${destination}`);throw error}export function useRouter(){return{refresh(){}}}')}`;

const globals = globalThis as typeof globalThis & {
  __discoveryFounderMeetingHomeComposition: (address: string) => Promise<any>;
  __discoveryFounderMeetingHomePrepare?:any;
  __discoverySandboxMeetingHomeLoads?: number;
  __discoveryFounderMeetingHomeUserId?: string;
};
(globalThis as typeof globalThis & { React: typeof React }).React = React;

let meetingHome: (input:any)=>Promise<React.ReactElement>;
async function invoke(seriesAddress: string, organizationId?: string | string[], ignoredQuery: Record<string, unknown> = {}) {
  return meetingHome({ params: Promise.resolve({ seriesAddress }), searchParams: Promise.resolve({ ...ignoredQuery, organizationId }) as never });
}

async function main() {
  process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED = "true";
  const {registerHooks}=(await import("node:module")) as unknown as {registerHooks:(hooks:any)=>void};
  registerHooks({resolve(specifier:any,context:any,nextResolve:any){if(specifier==="next/navigation")return{url:navigationHarness,shortCircuit:true};return nextResolve(specifier,context);},load(url:any,context:any,nextLoad:any){if(url===navigationHarness)return{format:"module",source:decodeURIComponent(url.slice(url.indexOf(",")+1)),shortCircuit:true};return nextLoad(url,context);}});
  (React as typeof React & {useActionState:typeof React.useActionState}).useActionState=((_action:unknown,initialState:unknown)=>[initialState,()=>{},false]) as typeof React.useActionState;
  meetingHome=(await import("../../app/product-alpha/meetings/[seriesAddress]/page")).default;
  const directComposerUrl=new URL("../../product/integration/chiefLeadershipPreparationComposer.ts?founder-meeting-home-direct",import.meta.url).href;
  const {composeChiefFirstPrepareViewFromWorkspace}=await import(directComposerUrl);
  globals.__discoverySandboxMeetingHomeLoads = 0;
  let checks = 0;
  let closed=0;
  const workspaceInputs:any[]=[];
  const workspace={currentStep:"prepare",dispositions:[],actions:[],proposals:[],reviewedCarryForwardCompletion:null,closureCompletion:null,futurePreparationLink:null,uploadReceipt:null,canonicalRoutingReceipts:[],reviewedCarryForwardNonpromotions:[]};
  const prepare={meeting:{title:"Weekly SignalGrid Launch Readiness Review",purpose:"Decide the Asterline SignalGrid release path."},whatChanged:[],whatMattersNow:[],hiddenTension:[],possibleSurprise:[],questions:[],sourceBasis:[],uncertainty:[],reasoning:[],competingExplanations:[],priorCycle:{status:"none",message:"No prior reviewed meeting yet.",workflowOnlyTalkingPoints:[]}};
  globals.__discoveryFounderMeetingHomePrepare=prepare;
  const currentPack={
    contractVersion:"1" as const,authority:"noncanonical-user-working-draft" as const,generatedAgendaId:"agenda-2",generatedTalkingPointsId:"talking-2",purpose:"Decide the Asterline SignalGrid release path.",desiredOutcomes:["Distinguish general availability, controlled pilot, and delay."],agendaItems:[{itemId:"agenda-1",topic:"October 15 target",whyNow:"The target is not general-availability approval.",desiredOutcome:"Choose an option.",reason:"Decision required" as const}],citationProjection:{agenda:[{itemId:"agenda-1",statement:"October 15 is a target, not approved general availability.",classification:"source-derived" as const,citations:[{sourceId:"source-1",sourceVersion:"v1",bodyDigest:"a".repeat(64)}]}],talkingPoints:[]},closingCheck:["Confirm the launch path."],talkingPoints:{questionsToAsk:["Can Atlas accept a controlled pilot?"],currentLeaning:[],watchOuts:["Security status is not release approval."],doNotForget:["Engineering is approximately 92% ready with unresolved defects."],privateContext:[]},generatedAgendaText:"October 15 target",generatedTalkingPointsText:"Atlas pilot",agendaText:"October 15 is a target, not approved general availability.",talkingPointsText:"Engineering is approximately 92% ready with unresolved defects.",revisionKind:"generated" as const,inputBasis:{priorReviewedOutcomes:0,materialChanges:1,openCommitments:1,unresolvedQuestions:1,privateNotes:0},inputSnapshotDigest:"snapshot-2",preparedWorkPublicationDigest:"prepared-2",priorCompletionDigest:null,createdAt:"2026-09-10T00:00:00.000Z",artifactRevision:"pack-revision-2",revision:2,potentiallyOutOfDate:false,privateNotes:[]
  };
  globals.__discoveryFounderMeetingHomeComposition = async address => ({
    request:{consumerId:"user_founder_route_validation"},
    meeting:{organizationId:"organization-private",questionId:"question-private",occurrenceId:"occurrence-private",seriesId:"series-private",seriesAddress:address},
    server:{workspace:async(input:any)=>{workspaceInputs.push(input);return workspace;},readMeetingPack:async()=>currentPack,refreshMeetingPack:{available:async()=>true},reviewedCarryForwardFromMeetingPackAvailable:async()=>false,analyzeSourceScopedForDevelopment:async()=>({result:{status:"eligible"}})},
    close:async()=>{closed+=1},
  });
  const markup = renderToStaticMarkup(await invoke("2mjUlX61y_lU76Z0g7Oh2O1G", undefined, {seriesId:"forged-series",conversationId:"forged-occurrence",participantRef:"forged-participant"}));
  assert.match(markup, /Weekly SignalGrid Launch Readiness Review/);
  assert.match(markup, /Your current governed preparation is ready/);
  assert.match(markup, /Refresh draft from current sources/);
  assert.match(markup, /October 15 target/);
  assert.equal(markup.includes("organization-private"), false);
  assert.deepEqual(workspaceInputs,[{userId:"user_founder_route_validation",organizationId:"organization-private",questionId:"question-private",conversationId:"occurrence-private",seriesId:"series-private"}]);
  assert.equal((await (await import("node:fs/promises")).readFile("app/product-alpha/meetings/[seriesAddress]/page.tsx","utf8")).includes("leadership-conversation-series:${"), false);
  const composition=await (await import("node:fs/promises")).readFile("product/integration/leadershipConversationServerComposition.ts","utf8");
  assert.match(composition,/if\(construction\.persistedPreparedWorkLineage\)return persistedPreparedWorkLineage\(input\);/);
  assert.match(composition,/persistedPreparedWorkLineage:true/);
  assert.ok(composition.indexOf("if(construction.persistedPreparedWorkLineage)return persistedPreparedWorkLineage(input);")<composition.indexOf("const seed=await readNorthstarPreparationLineageSeed"));
  assert.ok(composition.indexOf("if(construction.persistedPreparedWorkLineage)throw new Error(\"Product Decision Draft inspection lineage is unavailable.\");")<composition.lastIndexOf("const seed=await readNorthstarPreparationLineageSeed"));
  assert.equal(closed,1);
  assert.equal(globals.__discoverySandboxMeetingHomeLoads, 0); checks += 10;

  const composerCurrent={organizationId:"organization-current",questionId:"question-current",conversationId:"occurrence-2",currentStep:"prepare",context:{title:"Successor",timeframe:"This week",purpose:"Prepare",participants:[{titleLabel:"Founder"}],contextVersionId:"context-2"},currentPreparedWorkProduct:{artifactVersionId:"prepared-2",content:{whatChanged:["Supported predecessor change"],situationSummary:"Current supported state",decisionsRequiringAttention:[],importantTensions:[],contradictions:[],questionsToResolve:[],evidenceReferences:["source-1"],uncertaintyAndLimitations:[],talkingPoints:[],unknowns:[]},lineage:{authorizedProjectionRevision:"projection-2",authorizedProjectionDigest:"digest-2",sourceRevisionReferences:["source-1"]}}} as any;
  const completePredecessor={closeContinuation:{stage:"complete"},reviewedCarryForwardCompletion:{counts:{}},canonicalRoutingReceipts:[{},{}],proposals:[{proposalId:"reviewed",reviewedCarryForward:{}}],reviewedCarryForwardNonpromotions:[]} as any;
  const completeProjection=composeChiefFirstPrepareViewFromWorkspace(composerCurrent,{predecessor:completePredecessor,seriesId:"series-current"});
  assert.equal(completeProjection.priorCycle.status,"completed");
  assert.deepEqual(completeProjection.whatChanged,["Supported predecessor change"]);
  assert.equal(completeProjection.seriesId,"series-current");
  assert.match(completeProjection.priorCycle.items[1]!.label,/not organizational truth/);
  for(const predecessor of [{...completePredecessor,closeContinuation:{stage:"partial"}},{...completePredecessor,reviewedCarryForwardCompletion:null}])assert.equal(composeChiefFirstPrepareViewFromWorkspace(composerCurrent,{predecessor,seriesId:"series-current"}).priorCycle.status,"none");
  assert.equal(composeChiefFirstPrepareViewFromWorkspace(composerCurrent).priorCycle.status,"none"); checks += 8;

  const successorInputs:any[]=[];
  globals.__discoveryFounderMeetingHomePrepare={...prepare,priorCycle:{status:"completed",message:"Occurrence 1 is complete. Reviewed outcomes and What Changed are available for continuity.",items:[{label:"Canonical owner results",text:"2 owner-recorded results remain available for continuity."},{label:"Reviewed records — not organizational truth",text:"2 reviewed records remain distinct from organizational truth."},{label:"Decision preserved without promotion",text:"A reviewed Decision was preserved without promotion because the required current Product Answer was unavailable."},{label:"Open matters",text:"Open matters remain available for follow-up."}]}};
  globals.__discoveryFounderMeetingHomeComposition=async address=>({request:{consumerId:"user_founder_route_validation"},meeting:{organizationId:"organization-private",questionId:"question-private",occurrenceId:"occurrence-2",predecessorOccurrenceId:"occurrence-1",seriesId:"series-private",seriesAddress:address},server:{workspace:async(input:any)=>{successorInputs.push(input);return workspace;},readMeetingPack:async()=>null,refreshMeetingPack:{available:async()=>false},reviewedCarryForwardFromMeetingPackAvailable:async()=>false},close:async()=>{closed+=1}});
  const successorMarkup=renderToStaticMarkup(await invoke("2mjUlX61y_lU76Z0g7Oh2O1G"));
  assert.match(successorMarkup,/Occurrence 2 · Prepare/);
  assert.doesNotMatch(successorMarkup,/Occurrence 1 · Prepare/);
  assert.match(successorMarkup,/Occurrence 1 is complete/);
  assert.match(successorMarkup,/Reviewed records — not organizational truth/);
  assert.match(successorMarkup,/Build the Occurrence 2 Meeting Pack/);
  assert.match(successorMarkup,/Available after you build the Occurrence 2 Meeting Pack/);
  assert.doesNotMatch(successorMarkup,/No prior reviewed meeting yet/);
  assert.deepEqual(successorInputs.map(value=>value.conversationId),["occurrence-2","occurrence-1"]); checks += 8;

  let successorPackReads=0;
  globals.__discoveryFounderMeetingHomeComposition=async address=>({request:{consumerId:"user_founder_route_validation"},meeting:{organizationId:"organization-private",questionId:"question-private",occurrenceId:"occurrence-2",predecessorOccurrenceId:"occurrence-1",seriesId:"series-private",seriesAddress:address},server:{workspace:async()=>workspace,readMeetingPack:async()=>{successorPackReads+=1;return{...currentPack,artifactRevision:"pack-revision-4",revision:4};},refreshMeetingPack:{available:async()=>false},reviewedCarryForwardFromMeetingPackAvailable:async()=>false},close:async()=>{closed+=1}});
  const existingPackMarkup=renderToStaticMarkup(await invoke("2mjUlX61y_lU76Z0g7Oh2O1G"));
  assert.match(existingPackMarkup,/Pack ready/);
  assert.doesNotMatch(existingPackMarkup,/Build the Occurrence 2 Meeting Pack/);
  assert.doesNotMatch(existingPackMarkup,/Available after you build the Occurrence 2 Meeting Pack/);
  assert.equal(successorPackReads,1);
  const existingPackReload=renderToStaticMarkup(await invoke("2mjUlX61y_lU76Z0g7Oh2O1G"));
  assert.equal(existingPackReload,existingPackMarkup);
  assert.equal(successorPackReads,2); checks += 6;
  globals.__discoveryFounderMeetingHomePrepare=prepare;

  globals.__discoveryFounderMeetingHomeComposition = async address => ({
    request:{consumerId:"user_founder_route_validation"},
    meeting:{organizationId:"organization-private",questionId:"question-private",occurrenceId:"occurrence-private",seriesId:"series-private",seriesAddress:address},
    server:{workspace:async()=>workspace,readMeetingPack:async()=>currentPack,refreshMeetingPack:{available:async()=>false},reviewedCarryForwardFromMeetingPackAvailable:async()=>false,analyzeSourceScopedForDevelopment:async()=>{throw new Error("analysis unavailable");}},
    close:async()=>{closed+=1},
  });
  const analysisUnavailableMarkup=renderToStaticMarkup(await invoke("2mjUlX61y_lU76Z0g7Oh2O1G"));
  assert.match(analysisUnavailableMarkup,/October 15 target/);
  assert.doesNotMatch(analysisUnavailableMarkup,/Refresh draft from current sources/);
  assert.doesNotMatch(analysisUnavailableMarkup,/Meeting pack unavailable/i);
  checks += 3;

  globals.__discoveryFounderMeetingHomeComposition = async () => { throw new Error("NEXT_NOT_FOUND"); };
  await assert.rejects(() => invoke("foreignOpaqueMeeting1234"), /NEXT_NOT_FOUND/);
  assert.equal(globals.__discoverySandboxMeetingHomeLoads, 0); checks += 2;

  globals.__discoveryFounderMeetingHomeUserId="user_ungranted_route_validation";
  globals.__discoveryFounderMeetingHomeComposition = async () => { throw new Error("NEXT_NOT_FOUND"); };
  await assert.rejects(() => invoke("2mjUlX61y_lU76Z0g7Oh2O1G"), /NEXT_NOT_FOUND/);
  checks += 2;
  globals.__discoveryFounderMeetingHomeUserId="user_founder_route_validation";

  globals.__discoveryFounderMeetingHomeComposition = async () => ({request:{consumerId:"user_founder_route_validation"},meeting:{organizationId:"organization-private",questionId:"question-private",occurrenceId:"occurrence-private",seriesId:"series-private"},server:{workspace:async()=>workspace,readMeetingPack:async()=>null,analyzeSourceScopedForDevelopment:async()=>({result:{status:"ineligible"}})},close:async()=>{closed+=1}});
  await assert.rejects(() => invoke("2mjUlX61y_lU76Z0g7Oh2O1G", "forged-organization"), /NEXT_NOT_FOUND/);
  assert.equal(globals.__discoverySandboxMeetingHomeLoads, 0); checks += 2;

  for(const protectedValue of ["organization-private","question-private","series-private","occurrence-private","a".repeat(64),"forged-series","forged-occurrence","forged-participant"])assert.equal(markup.includes(protectedValue),false);
  assert.match(markup,/Nothing here becomes organizational truth or a shared meeting record from this page/);
  assert.match(successorMarkup,/Reviewed records — not organizational truth/);
  assert.equal(closed,6); checks += 10;

  console.log(`PASS founder Meeting Home fixture separation checks=${checks} sandbox-module-loads=0 page-writes=0 product-writes=0 provider-requests=0 x3-x13=PASS`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
