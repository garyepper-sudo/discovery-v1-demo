import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import MeetingHome from "../../app/product-alpha/meetings/[seriesAddress]/page";

type FounderResult = Awaited<ReturnType<typeof import("../../lib/alpha-activation/founderFirstUnderstandingMeetingHome").resolveFounderFirstUnderstandingMeetingHome>>;
const globals = globalThis as typeof globalThis & {
  __discoveryFounderMeetingHomeResult: (address: string, supplied?: string | string[]) => FounderResult;
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
  globals.__discoveryFounderMeetingHomeResult = () => ({
    status: "found",
    organizationId: "organization-private",
    organizationName: "Asterline Software",
    title: "Weekly SignalGrid Launch Readiness Review",
    cadence: "Weekly",
    question: "Should Asterline keep the launch date?",
    sourceCount: 1,
    canAddContext: true,
    prepared: {
      headline: "Initial Prepared Work",
      situationSummary: "The exact persisted preparation reconstructed.",
      whatChanged: [], decisionsRequiringAttention: [], importantTensions: [], contradictions: [], unknowns: [], priorCommitments: [], suggestedAgenda: [], talkingPoints: [], questionsToResolve: [], evidenceReferences: [], uncertaintyAndLimitations: ["No prior reviewed state or meeting history exists."], unavailableAreas: [],
    },
  });
  const markup = renderToStaticMarkup(await invoke("2mjUlX61y_lU76Z0g7Oh2O1G"));
  assert.match(markup, /Weekly SignalGrid Launch Readiness Review/);
  assert.match(markup, /The exact persisted preparation reconstructed/);
  assert.match(markup, /data-add-context="eligible"/);
  assert.equal(markup.includes("organization-private"), false);
  assert.equal(globals.__discoverySandboxMeetingHomeLoads, 0); checks += 5;

  globals.__discoveryFounderMeetingHomeResult = () => null;
  await assert.rejects(() => invoke("foreignOpaqueMeeting1234"), /NEXT_NOT_FOUND/);
  assert.equal(globals.__discoverySandboxMeetingHomeLoads, 0); checks += 2;

  globals.__discoveryFounderMeetingHomeResult = () => ({ status: "organization-conflict" });
  await assert.rejects(() => invoke("2mjUlX61y_lU76Z0g7Oh2O1G", "forged-organization"), /NEXT_NOT_FOUND/);
  assert.equal(globals.__discoverySandboxMeetingHomeLoads, 0); checks += 2;

  console.log(`PASS founder Meeting Home fixture separation checks=${checks} sandbox-module-loads=0 page-writes=0 product-writes=0 provider-requests=0`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
