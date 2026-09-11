import { createHash } from "node:crypto";
import { GATE_1_WORLDS } from "./fixtures";
import { GATE_1_VERSION, type AuthorizedPacket, type CandidateClaim, type CandidateOutput, type Citation, type ExtractiveBaseline, type ScenarioVariant, type SourceFixture, type StructuralEvaluation, type WorldFixture } from "./contracts";

export const GENERIC_ANALYSIS_INSTRUCTION = "Analyze only supplied authorized organizational evidence. Return one JSON object with array fields currentConsequentialState, decisionsOrOptions, materialFacts, historicalFacts, contradictionsAndDisagreements, commitments, competingExplanations, unresolvedInformationNeeds, and executiveAssessment. Each item must be {statement, kind, applicableTime, citations}; kind is observation, attributed-assertion, inference, disagreement, requirement, assumption, or unknown; each citation is {sourceLabel, lineStart, lineEnd}. Cover current consequential state, materially distinct decisions or options, material facts, historical facts no longer current, contradictions and disagreement, commitments, competing explanations, unresolved information needs, and executive assessment. Preserve uncertainty; distinguish duplicate repetition from independent corroboration; do not convert a target into a decision or repeated behavior into authority; do not reconcile conflict without sufficient evidence; abstain when evidence cannot distinguish alternatives. Output is noncanonical working analysis requiring human review.";
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const variants: ScenarioVariant[] = ["baseline", "selective-change", "temporal-state", "contradiction-origin"];
const clone = (source: SourceFixture): SourceFixture => ({ ...source, lines: [...source.lines] });

function transformed(world: WorldFixture, variant: ScenarioVariant): SourceFixture[] {
  const sources = world.sources.map(clone);
  if (variant === "selective-change") {
    const changed = new Map<string, readonly [string, number, string, string]>([
      ["world-01", ["Source-05", 1, "A workflow change on 2026-06-12 no longer requires architecture approval before implementation for regulated-work classes.", "Source-06"]],
      ["world-02", ["Source-05", 0, "Effective 2026-07-01, the registered standard was clarified to permit emergency exports without a ticket-linked approval ID.", "Source-06"]],
      ["world-03", ["Source-03", 1, "A pilot could be limited to 20 clinics, and operations has capacity for 20 concurrent implementations in September.", "Source-05"]],
    ]).get(world.worldId)!;
    const source = sources.find((item) => item.label === changed[0])!;
    source.lines[changed[1]] = changed[2];
    return sources.filter((item) => item.label !== changed[3]);
  }
  if (variant === "temporal-state") { sources.at(-1)!.knownAt = world.worldId === "world-01" ? "2026-07-02" : world.current; return sources; }
  if (variant === "contradiction-origin") {
    sources.find((item) => item.label === "Source-03")!.lines.push(world.worldId === "world-01" ? "Three senior attendees endorsed the capacity concern solely by repeating Source-02; no new measurement was supplied." : world.worldId === "world-02" ? "Two directors endorsed a compliance update derived solely from the same support-log export; no independent sample was supplied." : "Two senior leaders endorsed launch readiness solely by repeating the commercial forecast; no readiness evidence was supplied.");
  }
  return sources;
}
const randomize = (sources: SourceFixture[], seed: string) => [...sources].sort((a, b) => digest(`${seed}:${a.label}`).localeCompare(digest(`${seed}:${b.label}`)));

export function buildPackets(): AuthorizedPacket[] {
  return GATE_1_WORLDS.flatMap((world) => variants.map((variant) => {
    const packetId = digest({ world: world.worldId, variant }).slice(0, 20);
    const authorizedSources = randomize(transformed(world, variant), packetId).map((source) => ({ label: source.label, recordedAt: source.recordedAt, knownAt: source.knownAt, lines: source.lines.map((text, index) => ({ line: index + 1, text })) }));
    const modelRequest = { instruction: GENERIC_ANALYSIS_INSTRUCTION, question: world.question, timeHorizon: { earlier: world.earlier, current: world.current }, epistemicContext: world.epistemicContext, permissionScope: world.permissionScope, authorizedSources, outputContract: "gate1-structured-candidate/v1" as const };
    return { contractVersion: GATE_1_VERSION, packetId, worldId: world.worldId, variant, sourcePacketDigest: digest(modelRequest), modelRequest };
  }));
}
const cite = (sourceLabel: string, line: number): Citation => ({ sourceLabel, lineStart: line, lineEnd: line });
export function extractiveBaseline(packet: AuthorizedPacket): ExtractiveBaseline {
  const sources = [...packet.modelRequest.authorizedSources].sort((a, b) => a.knownAt.localeCompare(b.knownAt) || a.label.localeCompare(b.label));
  const matching = (expression: RegExp) => sources.flatMap((source) => source.lines.filter((line) => expression.test(line.text)).map((line) => cite(source.label, line.line)));
  return { packetId: packet.packetId, sourcePacketDigest: packet.sourcePacketDigest, chronology: sources.map((source) => ({ sourceLabel: source.label, knownAt: source.knownAt, passages: source.lines.map((line) => cite(source.label, line.line)) })), explicitConflictPassages: matching(/not |unknown|cannot|but |does not|no /i), commitmentPassages: matching(/approved|must |due |owner|will decide/i) };
}
const sections: (keyof CandidateOutput)[] = ["currentConsequentialState", "decisionsOrOptions", "materialFacts", "historicalFacts", "contradictionsAndDisagreements", "commitments", "competingExplanations", "unresolvedInformationNeeds", "executiveAssessment"];
const claims = (output: CandidateOutput): CandidateClaim[] => sections.flatMap((section) => output[section]);
export function validateCandidate(packet: AuthorizedPacket, output: CandidateOutput): StructuralEvaluation {
  const permitted = new Map(packet.modelRequest.authorizedSources.map((source) => [source.label, source.lines.length])); let unsupportedClaims = 0; let unauthorizedCitations = 0; let malformedClaims = 0;
  for (const claim of claims(output)) { if (!claim.statement || !claim.applicableTime || !claim.citations.length) { malformedClaims++; continue; } let supported = true; for (const item of claim.citations) { const limit = permitted.get(item.sourceLabel); if (!limit || item.lineStart < 1 || item.lineEnd < item.lineStart || item.lineEnd > limit) { unauthorizedCitations++; supported = false; } } if (!supported) unsupportedClaims++; }
  const total = claims(output).length;
  return { citationSupport: total === 0 ? 0 : (total - unsupportedClaims) / total, unsupportedClaims, unauthorizedCitations, withheldSourceLeakage: unauthorizedCitations, malformedClaims, valid: malformedClaims === 0 && unauthorizedCitations === 0 };
}
export function packetManifest() { const packets = buildPackets(); if (packets.length !== 12 || new Set(packets.map((packet) => packet.packetId)).size !== 12) throw new Error("Gate 1 requires twelve unique packets."); for (const packet of packets) { const visible = JSON.stringify(packet.modelRequest); if (/world-0[1-3]|sources\.md|scenario\.json|hidden|answer key/i.test(visible)) throw new Error("Model request leaks benchmark metadata."); if (packet.variant === "selective-change" && packet.modelRequest.authorizedSources.length !== 5) throw new Error("Selective-change packet must withhold exactly one source."); } return { contractVersion: GATE_1_VERSION, packetCount: packets.length, packets: packets.map((packet) => ({ packetId: packet.packetId, sourcePacketDigest: packet.sourcePacketDigest, sourceCount: packet.modelRequest.authorizedSources.length })) }; }
