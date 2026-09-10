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

async function invoke(seriesAddress: string, organizationId?: string | string[]) {
  return MeetingHome({ params: Promise.resolve({ seriesAddress }), searchParams: Promise.resolve({ organizationId }) });
}

async function main() {
  process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED = "true";
  globals.__discoverySandboxMeetingHomeLoads = 0;
  let checks = 0;
  let closed=0;
  globals.__discoveryFounderMeetingHomeComposition = async address => ({
    request:{consumerId:"user_founder_route_validation"},
    meeting:{organizationId:"organization-private",questionId:"question-private",occurrenceId:"occurrence-private",seriesId:"series-private",seriesAddress:address},
    server:{workspace:async()=>({}),readMeetingPack:async()=>null},
    close:async()=>{closed+=1},
  });
  const markup = renderToStaticMarkup(await invoke("2mjUlX61y_lU76Z0g7Oh2O1G"));
  assert.match(markup, /data-authenticated-founder-composition="used"/);
  assert.equal(markup.includes("organization-private"), false);
  assert.equal(globals.__discoveryFounderMeetingHomeExperience.seriesAddress,"2mjUlX61y_lU76Z0g7Oh2O1G");
  assert.equal(closed,1);
  assert.equal(globals.__discoverySandboxMeetingHomeLoads, 0); checks += 5;

  globals.__discoveryFounderMeetingHomeComposition = async () => { throw new Error("NEXT_NOT_FOUND"); };
  await assert.rejects(() => invoke("foreignOpaqueMeeting1234"), /NEXT_NOT_FOUND/);
  assert.equal(globals.__discoverySandboxMeetingHomeLoads, 0); checks += 2;

  globals.__discoveryFounderMeetingHomeComposition = async () => ({request:{consumerId:"user_founder_route_validation"},meeting:{organizationId:"organization-private",questionId:"question-private",occurrenceId:"occurrence-private",seriesId:"series-private"},server:{workspace:async()=>({}),readMeetingPack:async()=>null},close:async()=>{closed+=1}});
  await assert.rejects(() => invoke("2mjUlX61y_lU76Z0g7Oh2O1G", "forged-organization"), /NEXT_NOT_FOUND/);
  assert.equal(globals.__discoverySandboxMeetingHomeLoads, 0); checks += 2;

  console.log(`PASS founder Meeting Home fixture separation checks=${checks} sandbox-module-loads=0 page-writes=0 product-writes=0 provider-requests=0`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
