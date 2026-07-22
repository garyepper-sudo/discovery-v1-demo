import assert from "node:assert/strict";
import type { V3Contradiction } from "../../v3/types";
import { consolidateOrganizationalMechanisms } from "../../v3/model/judgment/consolidateOrganizationalMechanisms";
import type { OrganizationalMechanism } from "../../v3/model/judgment/organizationalMechanism";

function mechanism(params: {
  id: string;
  confidence: number;
  evidenceIds: string[];
  phenomenonId?: string;
}): OrganizationalMechanism {
  const phenomenonId = params.phenomenonId ?? "phenomenon-continuing";
  return {
    id: params.id,
    cognitiveLayer: "mechanism",
    ontologyVersion: "1.0",
    type: "knowledgeConcentration",
    title: "Knowledge Concentration",
    summary: "Knowledge remains concentrated.",
    interpretation: "Delivery depends on concentrated expertise.",
    executiveImplication: "Transfer operating knowledge.",
    executiveName: "Knowledge Concentration",
    executiveSummary: "Knowledge remains concentrated.",
    organizationalBehavior: "founder dependency",
    confidence: params.confidence,
    severity: 0.7,
    executivePriority: 0.7,
    actionability: "high",
    stability: "emerging",
    organizationalScope: "local",
    affectedCapabilities: ["delivery"],
    affectedCapabilityIds: ["delivery"],
    supportingEvidenceIds: params.evidenceIds,
    supportingExplanationIds: ["explanation-1"],
    supportingClusterIds: ["cluster-1"],
    supportingPhenomenonIds: [phenomenonId],
    sourcePhenomenonIds: [phenomenonId],
    sourceClusterIds: ["cluster-1"],
    upstreamMechanismIds: [],
    downstreamMechanismIds: [],
    reinforcingMechanismIds: [],
    evidenceReferences: [],
  };
}

function contradiction(params: {
  id: string;
  confidence: number;
  opposingEvidenceIds?: string[];
}): V3Contradiction {
  return {
    id: params.id,
    title: params.opposingEvidenceIds?.length
      ? "New evidence qualifies previous organizational understanding"
      : "Important question remains unresolved",
    explanation: "Focused mechanism-confidence regression fixture.",
    evidenceIds: params.opposingEvidenceIds ?? ["question-evidence"],
    opposingEvidenceIds: params.opposingEvidenceIds ?? [],
    confidence: params.confidence,
  };
}

const previous = mechanism({
  id: "mechanism-stable",
  confidence: 0.6,
  evidenceIds: ["evidence-prior"],
});
const current = mechanism({
  id: "mechanism-current-candidate",
  confidence: 0.65,
  evidenceIds: ["evidence-current"],
});
const matched = contradiction({
  id: "contradiction-matched",
  confidence: 0.75,
  opposingEvidenceIds: ["evidence-current"],
});
const unrelated = contradiction({
  id: "contradiction-unrelated",
  confidence: 0.9,
  opposingEvidenceIds: ["evidence-other"],
});
const unresolvedQuestion = contradiction({
  id: "contradiction-question",
  confidence: 0.8,
});

const matchedResult = consolidateOrganizationalMechanisms(
  [current],
  [previous],
  [matched],
)[0];
assert.equal(matchedResult.id, previous.id, "Continuing identity must remain stable.");
assert.ok(
  matchedResult.confidence < previous.confidence,
  "Matched contradiction must reduce continuing mechanism confidence.",
);

const duplicateResult = consolidateOrganizationalMechanisms(
  [current],
  [previous],
  [matched, { ...matched, confidence: 0.5 }],
)[0];
const reversedDuplicateResult = consolidateOrganizationalMechanisms(
  [current],
  [previous],
  [{ ...matched, confidence: 0.5 }, matched],
)[0];
assert.equal(
  duplicateResult.confidence,
  matchedResult.confidence,
  "A duplicate contradiction ID must be applied once.",
);
assert.equal(
  reversedDuplicateResult.confidence,
  matchedResult.confidence,
  "Duplicate contradiction resolution must be input-order stable.",
);

const orderedResult = consolidateOrganizationalMechanisms(
  [current],
  [previous],
  [unrelated, matched],
)[0];
const reorderedResult = consolidateOrganizationalMechanisms(
  [current],
  [previous],
  [matched, unrelated],
)[0];
assert.deepEqual(
  orderedResult,
  reorderedResult,
  "Contradiction input order must not affect the result.",
);

const unrelatedResult = consolidateOrganizationalMechanisms(
  [current],
  [previous],
  [unrelated],
)[0];
const continuingBaseline = consolidateOrganizationalMechanisms(
  [current],
  [previous],
  [],
)[0];
assert.equal(
  unrelatedResult.confidence,
  continuingBaseline.confidence,
  "Unrelated contradiction must not reduce confidence.",
);

const questionResult = consolidateOrganizationalMechanisms(
  [current],
  [previous],
  [unresolvedQuestion],
)[0];
assert.equal(
  questionResult.confidence,
  continuingBaseline.confidence,
  "An unresolved question without opposing ancestry must not reduce confidence.",
);

const newMechanism = mechanism({
  id: "mechanism-new",
  confidence: 0.65,
  evidenceIds: ["evidence-current"],
  phenomenonId: "phenomenon-new",
});
const newMechanismBaseline = consolidateOrganizationalMechanisms(
  [newMechanism],
  [previous],
  [],
)[0];
const newMechanismResult = consolidateOrganizationalMechanisms(
  [newMechanism],
  [previous],
  [matched],
)[0];
assert.equal(
  newMechanismResult.confidence,
  newMechanismBaseline.confidence,
  "A new mechanism without reconciled identity must not be penalized.",
);

console.log("PASS — matched contradiction lowers continuing mechanism confidence");
console.log("PASS — unrelated and non-qualifying contradictions are ignored");
console.log("PASS — duplicate contradiction IDs are applied once");
console.log("PASS — contradiction input ordering is deterministic");
console.log("PASS — new mechanisms are not contradiction-penalized");
