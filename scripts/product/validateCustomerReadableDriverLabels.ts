import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { getMechanismProfile } from "../../engine/v3/model/judgment/mechanismProfiles";
import type {
  OrganizationalMechanismType,
} from "../../engine/v3/model/judgment/organizationalMechanism";
import {
  inferOrganizationalConditions,
} from "../../engine/v3/model/state/inferOrganizationalConditions";

const NOW = "2026-08-06T12:00:00.000Z";
const REPRESENTATIVE_TYPES = [
  "coordinationBreakdown",
  "accountabilityGap",
  "duplicatedKnowledgeWork",
  "institutionalMemoryLoss",
] as const satisfies readonly OrganizationalMechanismType[];
const CONTROL_TYPES = [
  "decisionLatency",
  "knowledgeFragmentation",
  "resourceConstraint",
] as const satisfies readonly OrganizationalMechanismType[];
const CONCATENATED_LABELS = [
  "Coordinationbreakdown",
  "Accountabilitygap",
  "Duplicatedknowledgework",
  "Institutionalmemoryloss",
];

function mechanism(
  type: OrganizationalMechanismType,
  confidence: number,
  signalText: string,
) {
  const profile = getMechanismProfile(type);
  return {
    id: `mechanism:${type}`,
    type,
    // Historical runtimes may retain this legacy title. The canonical readable
    // name remains separately owned by the mechanism profile.
    title: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
    executiveName: profile.executiveName,
    summary: `${profile.summary} ${signalText}`,
    confidence,
    strength: confidence,
  };
}

const mechanisms = [
  mechanism("coordinationBreakdown", 0.99, "coordination handoff ownership"),
  mechanism("accountabilityGap", 0.98, "accountability ownership handoff"),
  mechanism("duplicatedKnowledgeWork", 0.97, "duplicated knowledge coordination"),
  mechanism(
    "institutionalMemoryLoss",
    0.96,
    "institutional memory knowledge coordination",
  ),
  mechanism("decisionLatency", 0.7, "decision approval"),
  mechanism("knowledgeFragmentation", 0.69, "knowledge documentation"),
  mechanism("resourceConstraint", 0.68, "capacity resource"),
];

function generate() {
  return inferOrganizationalConditions({
    mechanisms,
    now: NOW,
  });
}

const first = generate();
const second = generate();
assert.deepEqual(second, first, "condition generation must remain deterministic");

const summaries = first.conditions.map((condition) => condition.summary);
const combined = summaries.join("\n");
for (const type of REPRESENTATIVE_TYPES) {
  const profile = getMechanismProfile(type);
  assert.equal(
    profile.type,
    type,
    `readable name must preserve canonical mechanism identity for ${type}`,
  );
  assert.ok(
    combined.includes(profile.executiveName),
    `canonical summaries must use the profile-owned label ${profile.executiveName}`,
  );
}
for (const type of CONTROL_TYPES) {
  const profile = getMechanismProfile(type);
  const control = inferOrganizationalConditions({
    mechanisms: [mechanism(type, 0.9, "coordination handoff ownership")],
    now: NOW,
  });
  assert.ok(
    control.conditions.some((condition) =>
      condition.summary.includes(profile.executiveName),
    ),
    `already-readable profile label must remain stable for ${type}`,
  );
}
for (const label of CONCATENATED_LABELS) {
  assert.ok(
    !combined.includes(label),
    `canonical summaries must not contain ${label}`,
  );
}

const coordination = first.conditions.find(
  (condition) => condition.id === "condition-coordination",
);
assert.ok(coordination, "coordination condition must be produced");
const driverSentence = coordination.summary
  .split(". ")
  .find((sentence) => sentence.startsWith("The strongest drivers are "));
assert.equal(
  driverSentence,
  "The strongest drivers are Coordination Breakdown, Accountability Gap, Duplicated Knowledge Work, and Institutional Memory Loss",
  "driver priority and ordering must remain unchanged while labels become readable",
);

const historicalSummary =
  "Coordination System is limiting organizational performance. The strongest drivers are Coordinationbreakdown and Accountabilitygap.";
const serializedHistoricalRuntime = JSON.stringify({
  organizationalConditions: [{ summary: historicalSummary }],
});
assert.equal(
  JSON.parse(serializedHistoricalRuntime).organizationalConditions[0].summary,
  historicalSummary,
  "historical Runtime summaries must remain replay-compatible and unmodified",
);

const communicationSource = readFileSync(
  resolve("engine/v3/communication/productCommunicationPlan.ts"),
  "utf8",
);
assert.match(
  communicationSource,
  /text:\s*conditionText,[\s\S]*sourceField:\s*[\s\S]*"summary"/,
  "Product Communication must continue exact canonical-summary pass-through",
);

const alphaSources = [
  "components/alpha/AlphaExperience.tsx",
  "components/product-shell/data/buildDiscoveryExperienceView.ts",
].map((path) => readFileSync(resolve(path), "utf8")).join("\n");
for (const rawType of REPRESENTATIVE_TYPES) {
  assert.ok(
    !alphaSources.includes(rawType),
    `active presentation must not repair or expose raw identifier ${rawType}`,
  );
}
assert.ok(
  !/replace\s*\([^)]*(?:breakdown|gap|knowledgeWork|memoryLoss)/i.test(alphaSources),
  "Alpha must not repair canonical driver labels",
);

const synthesis = coordination.summary;
const currentAnswer = synthesis.match(/^.*?[.!?](?:\s|$)/)?.[0].trim();
assert.ok(currentAnswer, "corrected synthesis must retain a first sentence");
assert.ok(
  synthesis.startsWith(currentAnswer),
  "current answer must remain an exact first-sentence prefix",
);

console.log("Customer-readable canonical driver label validation passed.");
