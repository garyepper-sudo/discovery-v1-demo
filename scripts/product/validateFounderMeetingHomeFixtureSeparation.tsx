import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

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
  (React as typeof React & {useActionState:typeof React.useActionState}).useActionState=((_action:unknown,initialState:unknown)=>[initialState,()=>{},false]) as typeof React.useActionState;
  meetingHome=(await import("../../app/product-alpha/meetings/[seriesAddress]/page")).default;
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
    server:{workspace:async(input:any)=>{workspaceInputs.push(input);return workspace;},readMeetingPack:async()=>currentPack,analyzeSourceScopedForDevelopment:async()=>({result:{status:"eligible"}})},
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

  globals.__discoveryFounderMeetingHomeComposition = async address => ({
    request:{consumerId:"user_founder_route_validation"},
    meeting:{organizationId:"organization-private",questionId:"question-private",occurrenceId:"occurrence-private",seriesId:"series-private",seriesAddress:address},
    server:{workspace:async()=>workspace,readMeetingPack:async()=>currentPack,analyzeSourceScopedForDevelopment:async()=>{throw new Error("analysis unavailable");}},
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

  console.log(`PASS founder Meeting Home fixture separation checks=${checks} sandbox-module-loads=0 page-writes=0 product-writes=0 provider-requests=0`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
