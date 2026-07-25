import type { RawSiloEvidence } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import type { CausalScenario, ScoringTruth } from "./types";

const evidence = (
  sourceId: string,
  silo: string,
  content: string,
  observedAt = "2026-01-01T00:00:00.000Z",
): RawSiloEvidence => ({
  sourceId, sourceType: silo, silo, content, observedAt, reliability: 0.8,
});

const scenario = (
  ordinal: number,
  family: string,
  kind: "positive" | "negative",
  items: RawSiloEvidence[],
): CausalScenario => {
  const id = `case-${String(ordinal).padStart(3, "0")}`;
  return {
    id, family, kind,
    scenario: {
      id,
      organizationId: `organization-${id}`,
      company: "Neutral Test Organization",
      industry: "Cross-industry",
      question: "What mechanism best explains the observed organizational outcome?",
      evidence: items,
    },
  };
};

const link = (id: string, silo: string, from: string, to: string, condition: string, date?: string) =>
  evidence(id, silo, `Evidence indicates that ${from} leads to ${to} when ${condition}.`, date);
const alternative = (id: string, silo: string, explanation: string) =>
  evidence(id, silo, `A plausible alternative is that ${explanation}.`);

export const inferenceScenarios: CausalScenario[] = [
  scenario(1, "commercial-complexity", "positive", [
    link("r1", "Sales", "sales exceptions", "product customization", "exception approvals remain decentralized"),
    link("r2", "Product", "product customization", "delivery variability", "custom workflows bypass the standard roadmap"),
    link("r3", "Operations", "delivery variability", "specialist dependency", "implementation variance persists"),
    link("r4", "Finance", "specialist dependency", "services margin erosion", "specialist effort remains unpriced"),
    alternative("a1", "Leadership", "weak operations execution causes services margin erosion"),
  ]),
  scenario(2, "decision-escalation", "positive", [
    link("r1", "HR", "risk-sensitive incentives", "perceived cost of independent action", "visible mistakes remain penalized"),
    link("r2", "Information", "executive information concentration", "perceived cost of independent action", "trade-off data remains concentrated"),
    link("r3", "Management", "perceived cost of independent action", "manager escalation", "uncertainty rises"),
    link("r4", "Leadership", "manager escalation", "executive bottleneck", "executives continue accepting routine escalations"),
    alternative("a1", "Operations", "manager inexperience causes executive bottlenecks"),
  ]),
  scenario(3, "local-optimization", "positive", [
    link("r1", "Procurement", "unit-cost optimization", "longer lead times", "selection rewards unit price"),
    link("r2", "Operations", "longer lead times", "operational variability", "buffer capacity is scarce"),
    link("r3", "Sales", "operational variability", "missed commitments", "commitment dates remain fixed"),
    link("r4", "Finance", "missed commitments", "expedite and inventory costs", "service targets remain binding"),
    alternative("a1", "Planning", "poor forecasting causes missed commitments"),
  ]),
  scenario(4, "customer-misdiagnosis", "positive", [
    link("r1", "Support", "workflow confusion", "weak feature adoption", "workflow guidance remains unchanged"),
    link("r2", "Product", "weak feature adoption", "increased training requests", "customers must complete advanced workflows"),
    link("r3", "Success", "increased training requests", "poor retention", "training does not resolve workflow confusion"),
    alternative("a1", "Marketing", "weak awareness causes poor retention"),
  ]),
  scenario(5, "delayed-consequence", "positive", [
    link("r1", "Leadership", "deferred maintenance", "recovery complexity", "maintenance remains deferred", "2025-01-01T00:00:00.000Z"),
    link("r2", "Engineering", "recovery complexity", "longer incidents", "recovery procedures remain stale", "2025-05-01T00:00:00.000Z"),
    link("r3", "Success", "longer incidents", "renewal risk", "long outages recur", "2025-10-01T00:00:00.000Z"),
    alternative("a1", "Finance", "pricing pressure causes renewal risk"),
  ]),
  scenario(6, "conditional", "positive", [
    link("r1", "Leadership", "visible failure penalties", "defensive review behavior", "visible failure is punished"),
    link("r2", "Management", "defensive review behavior", "approval escalation", "uncertainty rises"),
    link("r3", "Operations", "approval escalation", "delivery delay", "rapid growth increases decision volume"),
    alternative("a1", "HR", "manager inexperience causes delivery delay"),
  ]),
  scenario(7, "branching", "positive", [
    link("r1", "Strategy", "priority volatility", "work switching", "quarterly priorities keep changing"),
    link("r2", "Engineering", "work switching", "delivery delay", "teams retain parallel commitments"),
    link("r3", "People", "work switching", "employee fatigue", "replanning remains frequent"),
    alternative("a1", "Finance", "understaffing causes delivery delay"),
  ]),
  scenario(8, "converging", "positive", [
    link("r1", "Sales", "forecast volatility", "capacity mismatch", "planning cadence remains quarterly"),
    link("r2", "People", "hiring delay", "capacity mismatch", "specialist hiring remains slow"),
    link("r3", "Operations", "capacity mismatch", "service backlog", "demand exceeds available specialists"),
    alternative("a1", "Support", "poor triage causes service backlog"),
  ]),
  scenario(9, "insufficient", "negative", [
    evidence("r1", "Quality", "One quality review increased approval steps."),
    evidence("r2", "Management", "Managers may be more cautious."),
  ]),
  scenario(10, "correlation", "negative", [
    evidence("r1", "Sales", "Pipeline and customer complaints increased together."),
    evidence("r2", "Support", "The direction of influence is unknown."),
  ]),
  scenario(11, "connectivity", "negative", [
    evidence("r1", "A", "Finance, Operations, Sales, and HR metrics are strongly connected."),
    evidence("r2", "B", "No causal direction or mediator has been established."),
  ]),
  scenario(12, "competing", "negative", [
    link("r1", "Sales", "discounting", "margin erosion", "discount approvals continue"),
    alternative("a1", "Services", "delivery rework causes margin erosion"),
    alternative("a2", "Finance", "cost inflation causes margin erosion"),
  ]),
  scenario(13, "one-silo", "negative", [
    link("r1", "Legal", "residency regulation", "launch delay", "architecture remains noncompliant"),
    link("r2", "Legal", "launch delay", "regional revenue shortfall", "the launch remains blocked"),
    alternative("a1", "Legal", "weak demand causes regional revenue shortfall"),
  ]),
  scenario(14, "redundant", "negative", Array.from({ length: 8 }, (_, i) =>
    evidence(`r${i}`, `Repeated-${i}`, "Approval activity appears to be increasing."))),
  scenario(15, "temporal-reversal", "negative", [
    link("r1", "Operations", "approval delay", "customer churn", "approval queues persist", "2026-06-01T00:00:00.000Z"),
    evidence("r2", "Success", "Customer churn was observed before approval delays.", "2026-01-01T00:00:00.000Z"),
  ]),
  scenario(16, "confounded", "negative", [
    link("r1", "People", "remote work", "delivery delay", "coordination is distributed"),
    alternative("a1", "Finance", "a funding freeze causes both remote work and delivery delay"),
  ]),
  scenario(17, "structural-change", "negative", [
    link("r1", "Management", "information concentration", "decision escalation", "trade-off data remains concentrated", "2025-01-01T00:00:00.000Z"),
    evidence("r2", "Systems", "Trade-off data is now broadly available and escalation has fallen.", "2026-01-01T00:00:00.000Z"),
  ]),
];

// Scoring-only data. Candidate modules do not import this export.
export const scoringTruth: ScoringTruth[] = [
  ["case-001", true, ["sales exceptions", "product customization", "services margin erosion"], ["margin"]],
  ["case-002", true, ["risk-sensitive incentives", "manager escalation", "executive bottleneck"], ["bottleneck"]],
  ["case-003", true, ["unit-cost optimization", "operational variability", "missed commitments"], ["cost"]],
  ["case-004", true, ["workflow confusion", "weak feature adoption", "poor retention"], ["retention"]],
  ["case-005", true, ["deferred maintenance", "recovery complexity", "renewal risk"], ["renewal"]],
  ["case-006", true, ["visible failure penalties", "approval escalation", "delivery delay"], ["delay"]],
  ["case-007", true, ["priority volatility", "work switching", "delivery delay"], ["delay", "fatigue"]],
  ["case-008", true, ["forecast volatility", "capacity mismatch", "service backlog"], ["backlog"]],
  ...Array.from({ length: 9 }, (_, index) => [`case-${String(index + 9).padStart(3, "0")}`, false, [], []]),
].map(([scenarioId, shouldQualify, expectedTerms, heldOutOutcomeTerms]) => ({
  scenarioId: scenarioId as string,
  shouldQualify: shouldQualify as boolean,
  expectedTerms: expectedTerms as string[],
  heldOutOutcomeTerms: heldOutOutcomeTerms as string[],
}));

export const heldOutFutures = Object.fromEntries(scoringTruth.map((truth) => [
  truth.scenarioId,
  truth.shouldQualify
    ? `When the stated condition persisted, the expected ${truth.heldOutOutcomeTerms.join(" and ")} outcome recurred.`
    : "Later evidence did not establish the proposed causal direction.",
]));
