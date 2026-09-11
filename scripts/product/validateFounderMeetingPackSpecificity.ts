import assert from "node:assert/strict";
import { reviewedCarryForwardDevelopmentTransport } from "../../product/integration/reviewedCarryForward";
import { composeChiefMeetingPack } from "../../product/integration/chiefMeetingPackComposer";
import type { SourceScopedSectionsV1 } from "../../lib/analysis/sourceScopedExecutiveAnalysisContracts";

const titles = [
  "Sales and Customer Evidence",
  "Strategy and Launch Brief",
  "Security, Support, and Financial Constraints",
  "Decisions, Commitments, Assumptions, and Open Questions",
  "Product and Engineering Readiness",
];
const bodies = [
  "SYNTHETIC TEST DATA — ASTERLINE SOFTWARE\nAtlas $420k renewal is due November 1 and Customer Success marks Atlas at risk. Atlas would consider a 30-day controlled pilot if scheduled export is available and security review is complete.",
  "SYNTHETIC TEST DATA — ASTERLINE SOFTWARE\nStrategy and Launch Brief: proposed target October 15 2026; no final decision has been made. Options are general release, controlled pilot, or delay.",
  "SYNTHETIC TEST DATA — ASTERLINE SOFTWARE\nSecurity, Support, and Financial Constraints: SEC-31 and SEC-44 remain medium findings; support recommends a pilot of no more than 3 customers; renewals total $730k and the October general-release versus pilot difference is approximately $30k.",
  "SYNTHETIC TEST DATA — ASTERLINE SOFTWARE\nDecisions, Commitments, Assumptions, and Open Questions: C-01 by September 26, C-02 by October 7, C-03 retest by October 10, C-04 ask Atlas by September 12, C-05 runbooks by September 30.",
  "SYNTHETIC TEST DATA — ASTERLINE SOFTWARE\nProduct and Engineering Readiness: feature complete is reported, Engineering readiness is 92%, and 200-user p95 is 3.8 seconds against a sub-two-second GA target.",
];
const sources = titles.map((title, index) => ({
  organizationId: "fixture-organization",
  sourceId: `fixture-source-${index}`,
  sourceVersion: `fixture-version-${index}`,
  title,
  effectiveAt: `2026-09-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
  authority: "authoritative" as const,
  normalizedBodyDigest: `fixture-body-${index}`,
  body: bodies[index],
}));
const request = {
  configuration: { model: "fixture-model" },
  question: "Should Asterline keep the October 15 launch date, delay it, or limit the release to a controlled pilot?",
  packet: { organizationId: "fixture-organization", subjectId: "fixture-user", questionId: "fixture-question", seriesId: "fixture-series", occurrenceId: "fixture-occurrence", packetDigest: "fixture-packet", sources: sources.map((source) => ({ ...source, bodyDigest: "fixture-body", entryDigest: "fixture-entry" })) },
} as never;

async function main() {
const output = await reviewedCarryForwardDevelopmentTransport({ request, requestBytes: "" }) as { sections: SourceScopedSectionsV1 };
const { sections } = output;
const allItems = Object.values(sections).flat();
assert.equal(sections.decisions.length, 3);
assert.ok(sections.commitments.length >= 3);
assert.ok(sections.contradictions.length >= 3);
assert.ok(sections.openQuestions.some(item => /Atlas.*pilot|pilot.*Atlas/i.test(item.statement)));
assert.ok(sections.decisions.some(item => /October 15/i.test(item.statement)));
assert.ok(sections.decisions.some(item => /controlled pilot/i.test(item.statement)));
assert.ok(sections.decisions.some(item => /delay/i.test(item.statement)));
assert.ok(allItems.every(item => item.citations.length > 0));
assert.ok(!allItems.some(item => /similar utilization|primary organization-wide delivery constraint/i.test(item.statement)));

const candidate = { contractVersion: "1", status: "user-scoped-ai-generated-noncanonical-not-reviewed", organizationId: "fixture-organization", subjectId: "fixture-user", questionId: "fixture-question", seriesId: "fixture-series", occurrenceId: "fixture-occurrence", requestDigest: "request", sourcePacketDigest: "fixture-packet", configurationDigest: "configuration", model: "fixture-model", sections, usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, latencyMs: 0, returnedModel: "fixture-model" }, candidateDigest: "candidate" } as never;
const pack = composeChiefMeetingPack({
  organizationId: "fixture-organization", questionId: "fixture-question", seriesId: "fixture-series", occurrenceId: "fixture-occurrence", userScopeDigest: "scope", preparedWorkPublicationDigest: "prepared", analysis: candidate, inputSnapshotDigest: "snapshot", sourceLineageDigest: "lineage", priorCompletionDigest: null, prepare: { meeting: { purpose: "Determine the safest launch path." } } as never, workspace: {} as never, notes: [], createdAt: "2026-09-10T00:00:00.000Z",
});
assert.ok(pack.agendaText.includes("October 15"));
assert.ok(pack.talkingPointsText.includes("Atlas"));
assert.ok(pack.citationProjection?.agenda.every(item => item.citations.length > 0));
console.log(JSON.stringify({ validation: "founder-meeting-pack-specificity-v1", result: "PASS", scoreGate: "candidate-specificity-present", sourceCount: 5, commitments: sections.commitments.length, contradictions: sections.contradictions.length, agendaItems: pack.agendaItems.length }));
}
void main();
