import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { importExactlyThreeSealedOutputs } from "./evaluator";
import { ADDENDUM_V3_VERSION, FROZEN_PACKET_EXPECTATIONS, REQUIRED_OUTPUT_FIELDS, selectFrozenPacketForCurrentAccess, type FrozenPacketKind } from "./fixtures";

type FrozenRequest = {
  model: string;
  reasoning: string;
  messages: Array<{ role: "system" | "user"; content: unknown }>;
  output_contract: {
    format: string;
    fields: Record<string, unknown>;
    citation_format: string;
    limits: { max_words: number; no_material_uncited_claims: boolean };
  };
};

type FrozenPacket = {
  kind: FrozenPacketKind;
  requestPath: string;
  transcriptPath: string;
  request: FrozenRequest;
  requestSha256: string;
  transcriptSha256: string;
};

const sha256 = (value: string) => createHash("sha256").update(value, "utf8").digest("hex");
const assertLf = (value: string, description: string) => assert.ok(!value.includes("\r"), `${description} must use normalized LF endings`);
const CANDIDATE_VISIBLE_PROHIBITED_TERMS = [
  /\bbenchmark\b/i,
  /\brevocation\b/i,
  /\bgrant\b/i,
  /\bR[012]\b/,
  /hidden[ -]?answer/i,
  /expected[ -]?result/i,
  /private[ -]?basis/i,
  /sha-?256/i,
  /\bdigest\b/i,
  /call[ -]?index/i,
  /task[ -]?directory/i,
];
const object = (value: unknown, description: string): Record<string, unknown> => {
  assert.ok(value && typeof value === "object" && !Array.isArray(value), `${description} must be an object`);
  return value as Record<string, unknown>;
};

function sourceSet(request: FrozenRequest) {
  const user = object(request.messages[1]?.content, "User message content");
  assert.ok(Array.isArray(user.sources), "User message must contain ordered sources");
  return user.sources.map((source, index) => {
    const entry = object(source, `Source ${index + 1}`);
    assert.equal(typeof entry.label, "string", "Source label must be a string");
    assert.equal(typeof entry.lines, "string", "Source lines must be a string");
    return entry;
  });
}

function requestFrom(raw: string, kind: FrozenPacketKind): FrozenRequest {
  assertLf(raw, `${kind} request`);
  for (const term of CANDIDATE_VISIBLE_PROHIBITED_TERMS) assert.ok(!term.test(raw), `${kind} request contains prohibited candidate-visible terminology: ${term}`);
  const request = JSON.parse(raw) as unknown;
  const value = object(request, `${kind} request`);
  assert.deepEqual(Object.keys(value), ["model", "reasoning", "messages", "output_contract"], `${kind} request key order differs from Luna's frozen serialization`);
  assert.equal(value.model, "gpt-6-astra", "Frozen model identity differs");
  assert.equal(value.reasoning, "ultra", "Frozen reasoning setting differs");
  assert.ok(Array.isArray(value.messages) && value.messages.length === 2, "Frozen request must have exactly system and user messages");
  const messages = value.messages as FrozenRequest["messages"];
  assert.deepEqual(messages.map((message) => message.role), ["system", "user"], "Frozen message roles differ");
  assert.equal(typeof messages[0]?.content, "string", "System instruction must be a string");
  const user = object(messages[1]?.content, "User message content");
  assert.deepEqual(Object.keys(user), ["instruction", "question", "time_horizon", "objectives", "constraints", "sources"], "Frozen user-content key order differs");
  assert.ok(Array.isArray(user.objectives) && Array.isArray(user.constraints), "Frozen objectives and constraints must be ordered arrays");
  const outputContract = object(value.output_contract, "Output contract");
  assert.deepEqual(Object.keys(outputContract), ["format", "fields", "citation_format", "limits"], "Frozen output-contract key order differs");
  assert.deepEqual(Object.keys(object(outputContract.fields, "Output fields")), [...REQUIRED_OUTPUT_FIELDS], "Frozen output fields differ");
  const limits = object(outputContract.limits, "Output limits");
  assert.equal(typeof limits.max_words, "number", "Frozen output limit is missing");
  assert.equal(limits.no_material_uncited_claims, true, "Frozen output contract must prohibit material uncited claims");
  const typed = value as FrozenRequest;
  assert.equal(sourceSet(typed).length, FROZEN_PACKET_EXPECTATIONS[kind].sourceCount, `${kind} source count differs from the freeze receipt`);
  return typed;
}

// This renderer consumes a parsed frozen request only. It never reconstructs a
// request from source fixtures, and the result must exactly match Luna's frozen
// candidate-visible transcript before any provider dispatch can occur.
export function renderCandidateTranscript(request: FrozenRequest): string {
  const user = object(request.messages[1]?.content, "User message content");
  const sources = sourceSet(request);
  const objectives = user.objectives as string[];
  const constraints = user.constraints as string[];
  assert.ok(objectives.every((item) => typeof item === "string"), "Objectives must be strings");
  assert.ok(constraints.every((item) => typeof item === "string"), "Constraints must be strings");
  const contract = request.output_contract;
  return [
    `MODEL: ${request.model}`,
    `REASONING: ${request.reasoning}`,
    "SYSTEM:",
    request.messages[0].content as string,
    "USER INSTRUCTION:",
    user.instruction as string,
    `QUESTION: ${user.question as string}`,
    `TIME HORIZON: ${user.time_horizon as string}`,
    `OBJECTIVES: ${objectives.join(" | ")}`,
    `CONSTRAINTS: ${constraints.join(" | ")}`,
    ...sources.flatMap((source, index) => [`SOURCE ${String.fromCharCode(65 + index)}:`, source.lines as string]),
    `OUTPUT CONTRACT: ${String(contract.format).toUpperCase()}; fields ${Object.keys(contract.fields).join(", ")}; citations ${contract.citation_format}; max ${contract.limits.max_words} words; ${contract.limits.no_material_uncited_claims ? "no material uncited claims" : "material uncited claims permitted"}.`,
    "",
  ].join("\n");
}

async function loadFrozenPacket(kind: FrozenPacketKind, requestPath: string, transcriptPath: string): Promise<FrozenPacket> {
  const [requestRaw, transcript] = await Promise.all([readFile(requestPath, "utf8"), readFile(transcriptPath, "utf8")]);
  const expected = FROZEN_PACKET_EXPECTATIONS[kind];
  assert.equal(sha256(requestRaw), expected.requestSha256, `${kind} request SHA-256 differs from the freeze receipt`);
  assertLf(transcript, `${kind} rendered transcript`);
  assert.equal(sha256(transcript), expected.transcriptSha256, `${kind} transcript SHA-256 differs from the freeze receipt`);
  const request = requestFrom(requestRaw, kind);
  assert.equal(renderCandidateTranscript(request), transcript, `${kind} parsed request does not reproduce the frozen rendered transcript`);
  return { kind, requestPath, transcriptPath, request, requestSha256: expected.requestSha256, transcriptSha256: expected.transcriptSha256 };
}

function pathFromEnvironment(kind: FrozenPacketKind, artifact: "REQUEST" | "TRANSCRIPT") {
  const name = `DISCOVERY_GATE2_ADDENDUM_V3_${kind.toUpperCase()}_${artifact}_PATH`;
  const value = process.env[name];
  assert.ok(value, `Set ${name} to the Luna-approved candidate-visible file`);
  return value;
}

export async function verifyFrozenPackets() {
  const restricted = await loadFrozenPacket("restricted", pathFromEnvironment("restricted", "REQUEST"), pathFromEnvironment("restricted", "TRANSCRIPT"));
  const expanded = await loadFrozenPacket("expanded", pathFromEnvironment("expanded", "REQUEST"), pathFromEnvironment("expanded", "TRANSCRIPT"));
  const restrictedSources = sourceSet(restricted.request).map((source) => JSON.stringify(source));
  const expandedSources = sourceSet(expanded.request).map((source) => JSON.stringify(source));
  assert.ok(restrictedSources.every((source) => expandedSources.includes(source)), "Expanded request omits a restricted source");
  const expandedOnlySources = expandedSources.filter((source) => !restrictedSources.includes(source));
  assert.equal(expandedOnlySources.length, 1, "Expanded request must add exactly one source");
  const sameRestricted = selectFrozenPacketForCurrentAccess("restricted") === "restricted";
  const grantAddsOne = selectFrozenPacketForCurrentAccess("expanded") === "expanded";
  const revocationReturnsRestricted = selectFrozenPacketForCurrentAccess("revoked") === "restricted";
  assert.ok(sameRestricted && grantAddsOne && revocationReturnsRestricted, "Deterministic permission selection failed");
  const revokedSources = sourceSet(restricted.request).map((source) => JSON.stringify(source));
  assert.deepEqual(revokedSources, restrictedSources, "Revoked access must reconstruct the restricted source set");
  assert.equal(expandedOnlySources.filter((source) => revokedSources.includes(source)).length, 0, "Expanded-only source is available after revocation");
  return {
    version: ADDENDUM_V3_VERSION,
    packets: { restricted, expanded },
    permissionSelection: {
      restricted: selectFrozenPacketForCurrentAccess("restricted"),
      expanded: selectFrozenPacketForCurrentAccess("expanded"),
      revoked: selectFrozenPacketForCurrentAccess("revoked"),
      revokedRequestPath: restricted.requestPath,
      revokedSourceSetEqualsRestricted: true,
      call1AndCall3ReuseExactRestrictedFile: true,
      protectedSourceAfterRevocation: 0,
      protectedCitationEligibilityAfterRevocation: 0,
    },
    threeCallPlan: [
      { call: 1, packet: "restricted", requestSha256: restricted.requestSha256, transcriptSha256: restricted.transcriptSha256 },
      { call: 2, packet: "expanded", requestSha256: expanded.requestSha256, transcriptSha256: expanded.transcriptSha256 },
      { call: 3, packet: "restricted", requestSha256: restricted.requestSha256, transcriptSha256: restricted.transcriptSha256 },
    ],
  };
}

async function importOutputsFromEnvironment() {
  const entries = [1, 2, 3].map((call) => ({
    path: process.env[`DISCOVERY_GATE2_ADDENDUM_V3_CALL_${call}_OUTPUT_PATH`],
    sha256: process.env[`DISCOVERY_GATE2_ADDENDUM_V3_CALL_${call}_OUTPUT_SHA256`],
  }));
  assert.ok(entries.every((entry) => entry.path && entry.sha256), "All three sealed-output paths and SHA-256 values are required");
  return importExactlyThreeSealedOutputs(entries as Array<{ path: string; sha256: string }>);
}

const command = process.argv[2] ?? "validate";
if (command === "validate") {
  void verifyFrozenPackets().then((result) => process.stdout.write(`${JSON.stringify({ ...result, packets: Object.fromEntries(Object.entries(result.packets).map(([kind, packet]) => [kind, { requestPath: packet.requestPath, transcriptPath: packet.transcriptPath, requestSha256: packet.requestSha256, transcriptSha256: packet.transcriptSha256 }])) }, null, 2)}\n`));
} else if (command === "import-sealed-outputs") {
  void importOutputsFromEnvironment().then((result) => process.stdout.write(`${JSON.stringify(result.map((entry) => ({ path: entry.path, sha256: entry.sha256 })), null, 2)}\n`));
} else {
  throw new Error(`Unknown Addendum V3 command: ${command}`);
}
