import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import MeetingHome from "../../app/product-alpha/meetings/[seriesAddress]/page";

const globals = globalThis as typeof globalThis & {
  __discoveryFounderMeetingHomeComposition: (address: string) => Promise<any>;
  __discoveryFounderMeetingHomeExperience?:any;
  __discoverySandboxMeetingHomeLoads?: number;
};
(globalThis as typeof globalThis & { React: typeof React }).React = React;

async function invoke(seriesAddress: string, organizationId?: string | string[], ignoredQuery: Record<string, unknown> = {}) {
  return MeetingHome({ params: Promise.resolve({ seriesAddress }), searchParams: Promise.resolve({ ...ignoredQuery, organizationId }) as never });
}

async function main() {
  process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED = "true";
  globals.__discoverySandboxMeetingHomeLoads = 0;
  let checks = 0;
  let closed=0;
  const workspaceInputs:any[]=[];
  globals.__discoveryFounderMeetingHomeComposition = async address => ({
    request:{consumerId:"user_founder_route_validation"},
    meeting:{organizationId:"organization-private",questionId:"question-private",occurrenceId:"occurrence-private",seriesId:"series-private",seriesAddress:address},
    server:{workspace:async(input:any)=>{workspaceInputs.push(input);return{};},readMeetingPack:async()=>null},
    close:async()=>{closed+=1},
  });
  const markup = renderToStaticMarkup(await invoke("2mjUlX61y_lU76Z0g7Oh2O1G", undefined, {seriesId:"forged-series",conversationId:"forged-occurrence",participantRef:"forged-participant"}));
  assert.match(markup, /data-authenticated-founder-composition="used"/);
  assert.equal(markup.includes("organization-private"), false);
  assert.equal(globals.__discoveryFounderMeetingHomeExperience.seriesAddress,"2mjUlX61y_lU76Z0g7Oh2O1G");
  assert.deepEqual(workspaceInputs,[{userId:"user_founder_route_validation",organizationId:"organization-private",questionId:"question-private",conversationId:"occurrence-private",seriesId:"series-private"}]);
  assert.equal((await (await import("node:fs/promises")).readFile("app/product-alpha/meetings/[seriesAddress]/page.tsx","utf8")).includes("leadership-conversation-series:${"), false);
  const composition=await (await import("node:fs/promises")).readFile("product/integration/leadershipConversationServerComposition.ts","utf8");
  assert.match(composition,/if\(construction\.persistedPreparedWorkLineage\)return persistedPreparedWorkLineage\(input\);/);
  assert.match(composition,/persistedPreparedWorkLineage:true/);
  assert.ok(composition.indexOf("if(construction.persistedPreparedWorkLineage)return persistedPreparedWorkLineage(input);")<composition.indexOf("const seed=await readNorthstarPreparationLineageSeed"));
  assert.ok(composition.indexOf("if(construction.persistedPreparedWorkLineage)throw new Error(\"Product Decision Draft inspection lineage is unavailable.\");")<composition.lastIndexOf("const seed=await readNorthstarPreparationLineageSeed"));
  assert.equal(closed,1);
  assert.equal(globals.__discoverySandboxMeetingHomeLoads, 0); checks += 11;

  globals.__discoveryFounderMeetingHomeComposition = async () => { throw new Error("NEXT_NOT_FOUND"); };
  await assert.rejects(() => invoke("foreignOpaqueMeeting1234"), /NEXT_NOT_FOUND/);
  assert.equal(globals.__discoverySandboxMeetingHomeLoads, 0); checks += 2;

  globals.__discoveryFounderMeetingHomeComposition = async () => ({request:{consumerId:"user_founder_route_validation"},meeting:{organizationId:"organization-private",questionId:"question-private",occurrenceId:"occurrence-private",seriesId:"series-private"},server:{workspace:async()=>({}),readMeetingPack:async()=>null},close:async()=>{closed+=1}});
  await assert.rejects(() => invoke("2mjUlX61y_lU76Z0g7Oh2O1G", "forged-organization"), /NEXT_NOT_FOUND/);
  assert.equal(globals.__discoverySandboxMeetingHomeLoads, 0); checks += 2;

  console.log(`PASS founder Meeting Home fixture separation checks=${checks} sandbox-module-loads=0 page-writes=0 product-writes=0 provider-requests=0`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
