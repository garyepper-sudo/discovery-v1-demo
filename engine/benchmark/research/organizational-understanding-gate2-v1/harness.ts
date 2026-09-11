import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { CANDIDATE_FIELDS, GATE_2_VERSION, type AuthorizedPacket, type CandidateItem, type CandidateOutput, type Citation, type ExtractiveBaseline, type ModelRequest, type SourceFixture, type StructuralEvaluation } from "./contracts";
import { GATE_2_WORLDS } from "./fixtures";

export const GENERIC_ANALYSIS_INSTRUCTION = `Analyze only the supplied authorized organizational evidence for the stated question, time horizon, objectives, constraints, and institutional context.

Maintain a scoped, evidence-grounded account of relevant actors, relationships, requirements, observed practices, constraints, competing explanations, and consequential alternatives.

Produce currentState, options, materialClaims, institutionalDistinctions, mechanisms, mechanismTests, informationAcquisition, commitments, unknowns, and executiveAssessment. For every material item include epistemicStatus, applicableTime, confidence, and citations. Each citation must include sourceLabel, lineStart, and lineEnd.

For every material claim distinguish observation, attributed assertion, inference, disagreement, requirement, declared norm, observed practice, permission, prediction, or unknown; cite the exact supplied source label and line range; preserve applicability time and viable alternatives; do not treat repeated behavior as authority; do not treat seniority or consensus as independent corroboration; do not prefer information merely because it reduces uncertainty; do not use or infer protected evidence that is not supplied; abstain when evidence cannot distinguish alternatives; and identify what evidence would change the account.

Treat all output as noncanonical working analysis requiring human review.`;

const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const cite = (sourceLabel: string, line: number): Citation => ({ sourceLabel, lineStart: line, lineEnd: line });
const byGenericOrder = <T extends { sourceId: string }>(items: T[], seed: string) => [...items].sort((left, right) => digest(`${seed}:${left.sourceId}`).localeCompare(digest(`${seed}:${right.sourceId}`)));

function selectSource(source: SourceFixture, lineNumbers?: number[]): SourceFixture {
  const selected = lineNumbers ? lineNumbers.map((line) => source.lines[line - 1]).filter((line): line is string => Boolean(line)) : source.lines;
  return { ...source, lines: selected };
}

export function buildPackets(): AuthorizedPacket[] {
  return GATE_2_WORLDS.flatMap((world) => world.scenarios.map((scenario) => {
    const packetId = digest({ worldId: world.worldId, scenarioId: scenario.scenarioId }).slice(0, 20);
    const selected = scenario.sourceSelections.map((selection) => {
      const source = world.sources.find((candidate) => candidate.sourceId === selection.sourceId);
      if (!source) throw new Error(`Missing public source ${selection.sourceId}`);
      return selectSource(source, selection.lineNumbers);
    });
    const authorizedSources = byGenericOrder(selected, packetId).map((source, sourceIndex) => ({
      label: `Source-${String(sourceIndex + 1).padStart(2, "0")}` as const,
      recordedAt: source.recordedAt,
      knownAt: source.knownAt,
      lines: source.lines.map((text, index) => ({ line: index + 1, text })),
    }));
    const modelRequest: ModelRequest = { instruction: GENERIC_ANALYSIS_INSTRUCTION, question: scenario.question, timeHorizon: scenario.timeHorizon, governedContext: scenario.governedContext, authorizedSources, outputContract: "gate2-structured-candidate/v1" };
    return { contractVersion: GATE_2_VERSION, packetId, worldId: world.worldId, scenarioId: scenario.scenarioId, sourcePacketDigest: digest(modelRequest), modelRequest };
  }));
}

export function extractiveBaseline(packet: AuthorizedPacket): ExtractiveBaseline {
  const sources = [...packet.modelRequest.authorizedSources].sort((left, right) => left.knownAt.localeCompare(right.knownAt) || left.label.localeCompare(right.label));
  const matching = (expression: RegExp) => sources.flatMap((source) => source.lines.filter((line) => expression.test(line.text)).map((line) => cite(source.label, line.line)));
  return {
    packetId: packet.packetId,
    sourcePacketDigest: packet.sourcePacketDigest,
    chronology: sources.map((source) => ({ sourceLabel: source.label, knownAt: source.knownAt, passages: source.lines.map((line) => cite(source.label, line.line)) })),
    explicitRequirements: matching(/requires|mandatory|must |may |authorization|policy/i),
    observations: matching(/rate|counts|records show|sample|trial|measured|report/i),
    commitments: matching(/must choose|will|next shutdown|deadline|escalat/i),
    contradictions: matching(/not |no |but |unknown|does not/i),
  };
}

export function informationValue(input: { expectedDecisionImprovement: number; acquisitionCost: number; delayCost: number }): number {
  return input.expectedDecisionImprovement - input.acquisitionCost - input.delayCost;
}

export function permissionPacketChecks(packets = buildPackets()) {
  const byScenario = new Map(packets.map((packet) => [packet.scenarioId, packet]));
  const p0 = byScenario.get("p-00"); const p1 = byScenario.get("p-01"); const p2 = byScenario.get("p-02"); const p3 = byScenario.get("p-03");
  if (!p0 || !p1 || !p2 || !p3) throw new Error("Missing permission scenarios");
  const request = (packet: AuthorizedPacket) => JSON.stringify(packet.modelRequest);
  return {
    p0p1Equal: request(p0) === request(p1),
    p0p3ReconstructedRestrictedPacketEqual: request(p0) === request(p3),
    grantAddsOneAuthorizedSource: p2.modelRequest.authorizedSources.length === 2,
    restrictedPacketDigest: digest(p0.modelRequest),
  };
}

const items = (output: CandidateOutput): CandidateItem[] => CANDIDATE_FIELDS.flatMap((field) => output[field] ?? []);
export function validateCandidate(packet: AuthorizedPacket, output: CandidateOutput): StructuralEvaluation {
  const permitted = new Map<string, number>(packet.modelRequest.authorizedSources.map((source): [string, number] => [source.label, source.lines.length]));
  let unsupportedClaims = 0; let unauthorizedCitations = 0; let malformedItems = 0;
  for (const item of items(output)) {
    if (!item?.statement || !item.epistemicStatus || !item.applicableTime || !item.confidence || !Array.isArray(item.citations) || item.citations.length === 0) { malformedItems++; continue; }
    let supported = true;
    for (const citation of item.citations) {
      const lineLimit = permitted.get(citation.sourceLabel);
      if (!lineLimit || citation.lineStart < 1 || citation.lineEnd < citation.lineStart || citation.lineEnd > lineLimit) { unauthorizedCitations++; supported = false; }
    }
    if (!supported) unsupportedClaims++;
  }
  const total = items(output).length;
  return { citationSupport: total === 0 ? 0 : (total - unsupportedClaims) / total, unsupportedClaims, unauthorizedCitations, malformedItems, valid: malformedItems === 0 && unauthorizedCitations === 0 };
}

export function packetManifest() {
  const packets = buildPackets();
  if (packets.length !== 14 || new Set(packets.map((packet) => packet.packetId)).size !== 14) throw new Error("Gate 2 requires exactly fourteen unique packets.");
  for (const packet of packets) {
    const visible = JSON.stringify(packet.modelRequest);
    if (/world-0[1-4]|scenarioId|packetId|sourcePacketDigest|answer.?key|expected mechanism|utility oracle|permission test/i.test(visible)) throw new Error("Model request leaks internal benchmark metadata.");
    assert.ok(packet.modelRequest.authorizedSources.every((source) => /^Source-0[1-2]$/.test(source.label)), "Candidate labels must remain generic.");
  }
  const permissions = permissionPacketChecks(packets);
  if (!permissions.p0p1Equal || !permissions.p0p3ReconstructedRestrictedPacketEqual || !permissions.grantAddsOneAuthorizedSource) throw new Error("Permission packet construction failed.");
  return { contractVersion: GATE_2_VERSION, packetCount: packets.length, permissions, packets: packets.map((packet) => ({ packetId: packet.packetId, sourcePacketDigest: packet.sourcePacketDigest, sourceCount: packet.modelRequest.authorizedSources.length })) };
}

async function exportPackets() {
  const output = process.env.DISCOVERY_GATE2_PACKET_OUTPUT_DIR ?? "/private/tmp/discovery-gate2-research-packets";
  await mkdir(output, { recursive: true, mode: 0o700 });
  const packets = buildPackets();
  await writeFile(path.join(output, "candidate-requests.json"), `${JSON.stringify(packets.map((packet) => packet.modelRequest), null, 2)}\n`, { mode: 0o600 });
  await writeFile(path.join(output, "extractive-baselines.json"), `${JSON.stringify(packets.map(extractiveBaseline), null, 2)}\n`, { mode: 0o600 });
  await writeFile(path.join(output, "manifest.json"), `${JSON.stringify(packetManifest(), null, 2)}\n`, { mode: 0o600 });
  process.stdout.write(`${JSON.stringify({ output, candidateRequestPath: path.join(output, "candidate-requests.json"), ...packetManifest() })}\n`);
}

function validateHarness() {
  const packets = buildPackets();
  assert.equal(packets.length, 14); assert.deepEqual(packetManifest(), packetManifest(), "packets must be deterministic"); assert.equal(new Set(packets.map((packet) => packet.sourcePacketDigest)).size, 12, "Only the deliberately equivalent P0/P1/P3 requests may share a digest");
  assert.equal(informationValue({ expectedDecisionImprovement: 4_000, acquisitionCost: 1_200, delayCost: 400 }), 2_400);
  assert.equal(informationValue({ expectedDecisionImprovement: 1_000, acquisitionCost: 1_200, delayCost: 400 }) < 0, true);
  const permissions = permissionPacketChecks(packets); assert.equal(permissions.p0p1Equal, true); assert.equal(permissions.p0p3ReconstructedRestrictedPacketEqual, true); assert.equal(permissions.grantAddsOneAuthorizedSource, true);
  const invalid: CandidateOutput = { currentState: [], options: [], materialClaims: [], institutionalDistinctions: [], mechanisms: [], mechanismTests: [], informationAcquisition: [], commitments: [], unknowns: [], executiveAssessment: [] };
  invalid.currentState.push({ statement: "invalid", epistemicStatus: "observation", applicableTime: "current", confidence: "low", citations: [{ sourceLabel: "Source-99", lineStart: 1, lineEnd: 1 }] });
  const evaluation = validateCandidate(packets[0], invalid); assert.equal(evaluation.valid, false); assert.equal(evaluation.unauthorizedCitations, 1);
  console.log("PASS organizational understanding Gate 2 packet harness");
}

const command = process.argv[2];
if (command === "export") void exportPackets(); else if (command === "validate") validateHarness();
