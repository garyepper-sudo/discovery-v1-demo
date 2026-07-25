import type {
  HeldOutFuture,
  InferenceScenario,
  RawSiloEvidence,
  ScoringTruth,
} from "./types";

const e = (
  id: string,
  silo: string,
  content: string,
  observedAt = "2026-01-01T00:00:00.000Z",
): RawSiloEvidence => ({
  sourceId: id,
  sourceType: silo,
  observedAt,
  reliability: 0.8,
  content,
  silo,
});

const s = (
  id: number,
  industry: string,
  evidence: RawSiloEvidence[],
): InferenceScenario => ({
  id: `scenario-${String(id).padStart(3, "0")}`,
  organizationId: `organization-${String(id).padStart(3, "0")}`,
  company: "Neutral Test Organization",
  industry,
  question: "What organizational mechanism best explains the current pattern?",
  evidence,
});

export const inferenceScenarios: InferenceScenario[] = [
  s(1, "Enterprise Software", [
    e("src-001-a", "Sales", "Enterprise agreements increasingly include customer-specific workflow commitments."),
    e("src-001-b", "Product", "Roadmap exceptions for customer-specific workflows continue to increase."),
    e("src-001-c", "Operations", "Implementation duration and specialist handoffs continue to increase."),
    e("src-001-d", "Finance", "Services margin declines as implementation effort rises."),
    e("src-001-e", "Leadership", "Leadership believes execution quality is the main issue."),
  ]),
  s(2, "Professional Services", [
    e("src-002-a", "Leadership", "Leadership says teams should make more decisions locally."),
    e("src-002-b", "Management", "Managers escalate ambiguous decisions before acting."),
    e("src-002-c", "HR", "Promotion outcomes favor managers with fewer visible local failures."),
    e("src-002-d", "Information Systems", "Executives retain access to commercial and capacity information needed for trade-offs."),
    e("src-002-e", "Teams", "Teams wait for senior approval when uncertainty increases."),
  ]),
  s(3, "Manufacturing", [
    e("src-003-a", "Procurement", "Supplier selection increasingly favors the lowest unit price."),
    e("src-003-b", "Operations", "Lower-priced suppliers have longer and more variable lead times."),
    e("src-003-c", "Sales", "Customer delivery commitments are missed more often."),
    e("src-003-d", "Finance", "Inventory buffers and expedite spending both continue to rise."),
  ]),
  s(4, "SaaS", [
    e("src-004-a", "Support", "Customers repeatedly report confusion completing core workflows."),
    e("src-004-b", "Product", "Use of advanced features remains low after activation."),
    e("src-004-c", "Sales", "Prospects and customers increasingly request workflow training."),
    e("src-004-d", "Marketing", "Marketing believes product awareness is insufficient."),
    e("src-004-e", "Leadership", "Leadership believes the main problem is market awareness."),
  ]),
  s(5, "Infrastructure", [
    e("src-005-a", "Leadership", "Leadership deferred maintenance work to protect a launch date.", "2025-01-01T00:00:00.000Z"),
    e("src-005-b", "Engineering", "Deferred maintenance increased recovery complexity.", "2025-04-01T00:00:00.000Z"),
    e("src-005-c", "Operations", "Incident duration increased as recovery procedures became stale.", "2025-08-01T00:00:00.000Z"),
    e("src-005-d", "Customer Success", "Renewal concerns increased after repeated long outages.", "2025-11-01T00:00:00.000Z"),
  ]),
  s(6, "Technology", [
    e("src-006-a", "Product", "Requirements are complete before formal handoff."),
    e("src-006-b", "Engineering", "Acceptance decisions change during implementation."),
    e("src-006-c", "Operations", "No function owns cross-functional acceptance decisions."),
    e("src-006-d", "Leadership", "Leadership believes engineering estimation is weak."),
  ]),
  s(7, "Financial Technology", [
    e("src-007-a", "Legal", "A new regional data-residency rule applies, and the current architecture cannot satisfy it; this is the complete cause of the regulated-market launch delay."),
    e("src-007-b", "Sales", "Regulated-market launches are delayed."),
    e("src-007-c", "Finance", "Revenue from the affected region is below plan."),
  ]),
  s(8, "Consumer Services", [
    e("src-008-a", "Marketing", "Website traffic declined during the month."),
    e("src-008-b", "Finance", "Travel spending increased during the month."),
    e("src-008-c", "Operations", "Warehouse temperature variance also increased."),
    e("src-008-d", "HR", "Benefits enrollment completed during the same period."),
  ]),
  s(9, "Healthcare", [
    e("src-009-a", "Operations", "Approval steps increased after one quality review."),
    e("src-009-b", "HR", "Some managers may be more cautious after the review."),
    e("src-009-c", "Finance", "Overtime also increased, but the cause is not yet known."),
  ]),
  s(10, "Retail", [
    e("src-010-a", "HR", "Turnover increased after the office attendance policy changed."),
    e("src-010-b", "Sales", "Pipeline declined after the office attendance policy changed."),
    e("src-010-c", "Finance", "A market contraction began during the same period."),
    e("src-010-d", "Operations", "Fulfillment performance remained stable."),
  ]),
  s(11, "Industrial Services", [
    e("src-011-a", "Leadership", "Executives previously approved most ambiguous operating decisions.", "2025-01-01T00:00:00.000Z"),
    e("src-011-b", "HR", "Performance reviews previously penalized visible local mistakes.", "2025-01-01T00:00:00.000Z"),
    e("src-011-c", "Information Systems", "Decision data is now broadly available to operating teams.", "2025-09-01T00:00:00.000Z"),
    e("src-011-d", "HR", "Reviews now reward learning from reversible local decisions.", "2025-09-01T00:00:00.000Z"),
    e("src-011-e", "Leadership", "Executives now decline routine overrides and review learning afterward.", "2025-09-01T00:00:00.000Z"),
  ]),
];

// Scoring-only expectations. Never passed to production cognition or adapters.
export const scoringTruth: ScoringTruth[] = [
  { scenarioId: "scenario-001", family: "commercial-complexity", emergentExpected: true, expectedMechanismTerms: ["exception", "custom", "implementation"], expectedOutcomeTerms: ["margin", "implementation"], expectedInterventionTerms: ["exception", "standard"], requiredSilos: ["Sales", "Product", "Operations", "Finance"] },
  { scenarioId: "scenario-002", family: "decision-escalation", emergentExpected: true, expectedMechanismTerms: ["decision", "approval", "information"], expectedOutcomeTerms: ["escalat", "approval"], expectedInterventionTerms: ["information", "incentive", "decision"], requiredSilos: ["Leadership", "Management", "HR", "Information Systems", "Teams"] },
  { scenarioId: "scenario-003", family: "local-optimization", emergentExpected: true, expectedMechanismTerms: ["supplier", "lead", "cost"], expectedOutcomeTerms: ["delay", "inventory", "expedite"], expectedInterventionTerms: ["total", "supplier", "cost"], requiredSilos: ["Procurement", "Operations", "Sales", "Finance"] },
  { scenarioId: "scenario-004", family: "customer-misdiagnosis", emergentExpected: true, expectedMechanismTerms: ["workflow", "confus", "training"], expectedOutcomeTerms: ["use", "workflow"], expectedInterventionTerms: ["workflow", "usability"], requiredSilos: ["Support", "Product", "Sales"] },
  { scenarioId: "scenario-005", family: "delayed-consequence", emergentExpected: true, expectedMechanismTerms: ["maintenance", "recovery", "incident"], expectedOutcomeTerms: ["renewal", "outage"], expectedInterventionTerms: ["maintenance", "reliability"], requiredSilos: ["Leadership", "Engineering", "Operations", "Customer Success"] },
  { scenarioId: "scenario-006", family: "contradictory-local", emergentExpected: true, expectedMechanismTerms: ["acceptance", "ownership", "implementation"], expectedOutcomeTerms: ["requirement", "implementation"], expectedInterventionTerms: ["acceptance", "owner"], requiredSilos: ["Product", "Engineering", "Operations"] },
  { scenarioId: "scenario-007", family: "single-silo", emergentExpected: false, expectedMechanismTerms: [], expectedOutcomeTerms: [], expectedInterventionTerms: [], requiredSilos: ["Legal"] },
  { scenarioId: "scenario-008", family: "unrelated", emergentExpected: false, expectedMechanismTerms: [], expectedOutcomeTerms: [], expectedInterventionTerms: [], requiredSilos: [] },
  { scenarioId: "scenario-009", family: "insufficient", emergentExpected: false, expectedMechanismTerms: [], expectedOutcomeTerms: [], expectedInterventionTerms: [], requiredSilos: [] },
  { scenarioId: "scenario-010", family: "coincidental", emergentExpected: false, expectedMechanismTerms: [], expectedOutcomeTerms: [], expectedInterventionTerms: [], requiredSilos: [] },
  { scenarioId: "scenario-011", family: "structural-change", emergentExpected: false, expectedMechanismTerms: [], expectedOutcomeTerms: [], expectedInterventionTerms: [], requiredSilos: [] },
];

export const heldOutFutures: HeldOutFuture[] = [
  { scenarioId: "scenario-001", content: "Implementation duration and services cost rise again despite additional delivery staffing.", outcomeTerms: ["implementation", "cost"], effectiveInterventionTerms: ["exception", "standard"] },
  { scenarioId: "scenario-002", content: "After a visible local error, ambiguous decisions return to executive approval.", outcomeTerms: ["approval", "executive"], effectiveInterventionTerms: ["information", "incentive", "decision"] },
  { scenarioId: "scenario-003", content: "Lead-time variance causes further missed commitments and expedite cost.", outcomeTerms: ["lead", "miss", "expedite"], effectiveInterventionTerms: ["total", "supplier", "cost"] },
  { scenarioId: "scenario-004", content: "A marketing campaign raises awareness but workflow completion and advanced-feature use remain low.", outcomeTerms: ["workflow", "use"], effectiveInterventionTerms: ["workflow", "usability"] },
  { scenarioId: "scenario-005", content: "Another long outage creates additional renewal risk.", outcomeTerms: ["outage", "renewal"], effectiveInterventionTerms: ["maintenance", "reliability"] },
  { scenarioId: "scenario-006", content: "Requirements reopen again when no owner resolves cross-functional acceptance.", outcomeTerms: ["requirement", "acceptance"], effectiveInterventionTerms: ["acceptance", "owner"] },
  { scenarioId: "scenario-007", content: "The residency remediation removes the launch block.", outcomeTerms: ["residency"], effectiveInterventionTerms: ["residency"] },
  { scenarioId: "scenario-008", content: "The unrelated measures move independently the next month.", outcomeTerms: [], effectiveInterventionTerms: [] },
  { scenarioId: "scenario-009", content: "Additional evidence remains inconclusive.", outcomeTerms: [], effectiveInterventionTerms: [] },
  { scenarioId: "scenario-010", content: "Pipeline recovers with the market while turnover remains elevated.", outcomeTerms: [], effectiveInterventionTerms: [] },
  { scenarioId: "scenario-011", content: "Local decision rights remain in use after a contested decision.", outcomeTerms: [], effectiveInterventionTerms: [] },
];
