import type { RawSiloEvidence } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import type { RefinementScenario, RefinementTruth } from "./types";

const e = (sourceId: string, silo: string, content: string): RawSiloEvidence => ({
  sourceId, sourceType: silo, silo, content,
  observedAt: "2026-01-01T00:00:00.000Z", reliability: 0.8,
});
const explicit = (id: string, silo: string, from: string, to: string, condition = "the operating condition persists") =>
  e(id, silo, `Evidence indicates that ${from} leads to ${to} when ${condition}.`);
const temporal = (id: string, silo: string, from: string, to: string) =>
  e(id, silo, `After ${from} changed, ${to} changed in the following period.`);
const intervention = (id: string, silo: string, from: string, to: string) =>
  e(id, silo, `When ${from} was reduced, ${to} declined while major alternatives remained stable.`);
const contrast = (id: string, silo: string, from: string, to: string) =>
  e(id, silo, `Comparable groups with less ${from} showed less ${to} under otherwise similar conditions.`);
const repeated = (id: string, silo: string, from: string, to: string) =>
  e(id, silo, `Repeated transitions from higher ${from} were followed by higher ${to} across periods.`);
const alt = (id: string, silo: string, text: string) =>
  e(id, silo, `A plausible alternative is that ${text}.`);
const make = (
  n: number,
  category: RefinementScenario["category"],
  evidence: RawSiloEvidence[],
): RefinementScenario => {
  const id = `ref-${String(n).padStart(3, "0")}`;
  return { id, category, scenario: {
    id, organizationId: `organization-${id}`, company: "Neutral Test Organization",
    industry: "Cross-industry", question: "What causal structure is supported?", evidence,
  }};
};

let ordinal = 0;
const scenarios: RefinementScenario[] = [];
const truths: RefinementTruth[] = [];
const add = (
  category: RefinementScenario["category"],
  items: RawSiloEvidence[],
  topology: RefinementTruth["expectedTopology"],
  shouldQualify: boolean,
  edges: Array<[string, string]>,
) => {
  ordinal += 1;
  const value = make(ordinal, category, items);
  scenarios.push(value);
  truths.push({ scenarioId: value.id, expectedTopology: topology, shouldQualify, expectedEdges: edges });
};
const families = [
  ["sales exceptions", "customization", "delivery variability", "margin erosion"],
  ["risk penalties", "decision risk", "manager escalation", "executive bottleneck"],
  ["unit-cost focus", "lead-time variability", "missed commitments", "expedite cost"],
  ["workflow confusion", "weak adoption", "training demand", "retention risk"],
];
for (const [a, b, c, d] of families) add("explicit-linear", [
  explicit("a", "S1", a, b), explicit("b", "S2", b, c), explicit("c", "S3", c, d),
  alt("d", "S4", `another factor explains ${d}`),
], "linear", true, [[a, b], [b, c], [c, d]]);

const implicitFamilies = [
  ["exception volume", "customization load", "specialist dependency"],
  ["executive override", "local inactivity", "approval delay"],
  ["handoff ambiguity", "rework", "cycle time"],
  ["maintenance deferral", "recovery complexity", "incident duration"],
  ["workflow confusion", "training requests", "renewal concern"],
  ["priority churn", "work switching", "delivery delay"],
];
for (const [a, b, c] of implicitFamilies) add("implicit-linear", [
  temporal("a1", "S1", a, b), intervention("a2", "S2", a, b),
  contrast("b1", "S3", b, c), repeated("b2", "S4", b, c),
  alt("z", "S5", `seasonal pressure explains ${c}`),
], "linear", true, [[a, b], [b, c]]);

for (let i = 0; i < 4; i += 1) {
  const root = `shared driver ${i}`, mediator = `shared mediator ${i}`;
  const x = `outcome alpha ${i}`, y = `outcome beta ${i}`;
  add("explicit-branching", [
    explicit("a", "S1", root, mediator), explicit("b", "S2", mediator, x),
    explicit("c", "S3", mediator, y), alt("z", "S4", `another process explains ${x}`),
  ], "branching", true, [[root, mediator], [mediator, x], [mediator, y]]);
}
for (let i = 0; i < 4; i += 1) {
  const a = `driver alpha ${i}`, b = `driver beta ${i}`;
  const mediator = `shared mediator ${i}`, out = `combined outcome ${i}`;
  add("explicit-converging", [
    explicit("a", "S1", a, mediator), explicit("b", "S2", b, mediator),
    explicit("c", "S3", mediator, out), alt("z", "S4", `another process explains ${out}`),
  ], "converging", true, [[a, mediator], [b, mediator], [mediator, out]]);
}
for (let i = 0; i < 3; i += 1) {
  const root = `implicit shared driver ${i}`, mediator = `implicit mediator ${i}`;
  const x = `implicit outcome alpha ${i}`, y = `implicit outcome beta ${i}`;
  add("implicit-branching", [
    temporal("a1", "S1", root, mediator), intervention("a2", "S2", root, mediator),
    contrast("b1", "S3", mediator, x), repeated("b2", "S4", mediator, x),
    temporal("c1", "S5", mediator, y), intervention("c2", "S6", mediator, y),
    alt("z", "S7", `another process explains ${x}`),
  ], "branching", true, [[root, mediator], [mediator, x], [mediator, y]]);
}
for (let i = 0; i < 3; i += 1) {
  const a = `implicit driver alpha ${i}`, b = `implicit driver beta ${i}`;
  const mediator = `implicit shared mediator ${i}`, out = `implicit combined outcome ${i}`;
  add("implicit-converging", [
    temporal("a1", "S1", a, mediator), intervention("a2", "S2", a, mediator),
    contrast("b1", "S3", b, mediator), repeated("b2", "S4", b, mediator),
    temporal("c1", "S5", mediator, out), intervention("c2", "S6", mediator, out),
    alt("z", "S7", `another process explains ${out}`),
  ], "converging", true, [[a, mediator], [b, mediator], [mediator, out]]);
}

const controls: RawSiloEvidence[][] = [
  [e("a", "S1", "Metric A and metric B moved together; direction is unknown.")],
  [temporal("a", "S1", "event A", "event B")],
  [e("a", "S1", "A third factor plausibly explains both A and B.")],
  [e("a", "S1", "The alleged outcome may create the alleged upstream condition.")],
  [e("a", "S1", "Only troubled teams were observed, so selection bias remains.")],
  [temporal("a", "S1", "weak association", "outcome"), temporal("b", "S2", "weak association", "outcome")],
  [e("a", "S1", "Many observations are connected but no supported topology exists.")],
  [explicit("a", "S1", "event", "real outcome"), e("b", "S2", "An unrelated outcome occurred simultaneously.")],
  [explicit("a", "S1", "driver one", "outcome"), explicit("b", "S2", "driver two", "outcome")],
  [explicit("a", "S1", "driver", "mediator"), explicit("b", "S2", "mediator", "valid branch"), e("c", "S3", "A second branch is merely plausible.")],
  [explicit("a", "S1", "valid driver", "mediator"), explicit("b", "S2", "mediator", "outcome"), e("c", "S3", "An unsupported driver happened earlier.")],
  [e("a", "Quality", "One quality review increased approval steps."), e("b", "Management", "Managers may be more cautious.")],
];
const controlEdges: Array<Array<[string, string]>> = [
  [], [], [], [], [], [], [],
  [["event", "real outcome"]],
  [["driver one", "outcome"], ["driver two", "outcome"]],
  [["driver", "mediator"], ["mediator", "valid branch"]],
  [["valid driver", "mediator"], ["mediator", "outcome"]],
  [],
];
controls.forEach((items, index) =>
  add("control", items, "unresolved", false, controlEdges[index]));

export const inferenceScenarios = scenarios;
// Scoring truth is imported only by the runner after candidate registration.
export const scoringTruth = truths;
export const heldOutFutures = Object.fromEntries(truths.map((truth) => [
  truth.scenarioId,
  truth.shouldQualify
    ? `The registered ${truth.expectedTopology} outcomes recurred under the registered conditions.`
    : "The held-out evidence did not establish the proposed causal topology.",
]));
