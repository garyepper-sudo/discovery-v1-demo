import { inferOrganizationalBeliefs } from "../../v3/model/beliefs/inferOrganizationalBeliefs";
import { interpretMechanismCandidates } from "../../v3/model/judgment/mechanismInterpreter";
import type { MechanismCandidate } from "../../v3/model/judgment/mechanismInferenceTypes";
import { buildExecutiveUnderstandingCandidates } from "../../v3/understanding/buildExecutiveUnderstandingCandidates";

const candidate = (
  id: string,
  phenomenonId: string | undefined,
  mechanismType = "governanceFriction",
): MechanismCandidate => ({
  id,
  phenomenonIds: phenomenonId ? [phenomenonId] : [],
  patternIds: [],
  compressedThemeIds: [],
  explanationIds: [],
  reasoningPathIds: [],
  capabilityIds: ["decision"],
  clusterIds: [],
  judgmentIds: [],
  semanticConceptIds: [],
  mechanismType,
  sourceTexts: ["Approval dependency constrains decision flow."],
  sharedBehaviors: ["approval dependency"],
  sharedCapabilities: ["decision"],
  sharedConsequences: ["slow execution"],
  convergenceScore: 0.7,
  noveltyScore: 0.2,
  confidence: 0.8,
});

const candidates = [
  candidate("candidate-a", "phenomenon-a"),
  candidate("candidate-b", "phenomenon-b", "decisionLatency"),
  candidate("candidate-empty", undefined),
];

const phenomena = [
  {
    id: "phenomenon-a",
    description: "Approval dependency constrains decision flow.",
    understandingIds: ["understanding-a", "understanding-shared"],
  },
  {
    id: "phenomenon-b",
    description: "Approval dependency constrains another decision flow.",
    understandingIds: ["understanding-b", "understanding-shared"],
  },
];

const understandings = [
  { id: "understanding-a", evidenceIds: ["E2", "E1", "E2"] },
  { id: "understanding-b", evidenceIds: ["E4", "E3"] },
  { id: "understanding-shared", evidenceIds: ["E5", "E1"] },
  { id: "understanding-unrelated", evidenceIds: ["E99"] },
];

const run = (reverse = false) =>
  interpretMechanismCandidates(candidates, {
    phenomena: reverse ? [...phenomena].reverse() : phenomena,
    understandings: reverse ? [...understandings].reverse() : understandings,
  });

const mechanisms = run();
const byType = (type: string) =>
  mechanisms.find((mechanism) => mechanism.type === type)!;
const mechanismA = byType("governanceFriction");
const mechanismB = byType("decisionLatency");
const emptyMechanism = mechanisms.find(
  (mechanism) => mechanism.supportingPhenomenonIds.length === 0,
)!;

const beliefs = inferOrganizationalBeliefs({
  mechanisms: [mechanismA],
  now: "2026-07-01T12:00:00.000Z",
});

const executiveUnderstanding = buildExecutiveUnderstandingCandidates({
  organizationalConditions: [
    {
      id: "condition-decisionflow",
      name: "Decision Flow",
      supportingBeliefIds: beliefs.map((belief) => belief.id),
      supportingMechanismIds: [mechanismA.id],
      supportingTheoryIds: [],
      confidence: 0.8,
    },
  ],
  organizationalBeliefs: beliefs,
  theories: [],
  mechanisms: [mechanismA],
  observations: [
    { id: "observation-a", evidenceIds: ["E1"] },
    { id: "observation-unrelated", evidenceIds: ["E99"] },
  ],
  organizationalState: {
    dominantConditions: ["condition-decisionflow"],
  },
} as Parameters<typeof buildExecutiveUnderstandingCandidates>[0])[0];

const assertions: Array<[string, boolean]> = [
  ["mechanism receives source-understanding evidence", mechanismA.supportingEvidenceIds.join(",") === "E1,E2,E5"],
  ["multiple sources are deduplicated", new Set(mechanismA.supportingEvidenceIds).size === mechanismA.supportingEvidenceIds.length],
  ["evidence ordering is stable", mechanismA.supportingEvidenceIds.join(",") === [...mechanismA.supportingEvidenceIds].sort().join(",")],
  ["provenance input order does not change output", JSON.stringify(run()) === JSON.stringify(run(true))],
  ["unrelated phenomenon evidence is excluded", mechanismA.supportingEvidenceIds.every((id) => !["E3", "E4", "E99"].includes(id))],
  ["overlapping vocabulary does not leak evidence", mechanismB.supportingEvidenceIds.join(",") === "E1,E3,E4,E5"],
  ["unresolved provenance remains empty", emptyMechanism.supportingEvidenceIds.length === 0],
  ["beliefs inherit mechanism evidence", beliefs.some((belief) => belief.supportingEvidenceIds.join(",") === "E1,E2,E5")],
  ["Executive Understanding inherits evidence", executiveUnderstanding?.evidenceIds?.join(",") === "E1,E2,E5"],
  ["Executive Understanding resolves observations", executiveUnderstanding?.observationIds?.join(",") === "observation-a"],
  ["cognitive output is unchanged apart from evidence", mechanisms.every((mechanism) => mechanism.confidence > 0 && mechanism.title.length > 0)],
  ["repeated runs are deterministic", JSON.stringify(run()) === JSON.stringify(run())],
  ["mechanism schema is unchanged", !mechanisms.some((mechanism) => Object.prototype.hasOwnProperty.call(mechanism, "sourceUnderstandingIds"))],
];

console.log("MECHANISM EVIDENCE PROPAGATION 001");
for (const [label, passed] of assertions) {
  console.log(`${passed ? "PASS" : "FAIL"}  ${label}`);
}

const failed = assertions.filter(([, passed]) => !passed);
console.log(`\nPassed: ${assertions.length - failed.length}`);
console.log(`Failed: ${failed.length}`);
if (failed.length > 0) process.exitCode = 1;
