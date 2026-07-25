import type {
  HeldOutFuture,
  RawSiloEvidence,
  ScoringTruth,
} from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import type { FamilyId } from "./types";

const e = (
  sourceId: string,
  silo: string,
  content: string,
  observedAt = "2026-01-01T00:00:00.000Z",
  reliability = 0.8,
): RawSiloEvidence => ({
  sourceId,
  sourceType: silo,
  silo,
  content,
  observedAt,
  reliability,
});

export const baseFamilies: Array<{
  id: FamilyId;
  evidence: RawSiloEvidence[];
  bridgeSourceId: string;
  peripheralSourceId: string;
  revealOrder: string[];
}> = [
  {
    id: "commercial",
    bridgeSourceId: "pt-a3",
    peripheralSourceId: "pt-a5",
    revealOrder: ["pt-a1", "pt-a2", "pt-a3", "pt-a4", "pt-a5"],
    evidence: [
      e("pt-a1", "Sales", "Customer workflow exceptions are increasing in enterprise agreements."),
      e("pt-a2", "Product", "Customer workflow exceptions require more product customization."),
      e("pt-a3", "Operations", "Product customization increases implementation variability and specialist handoffs."),
      e("pt-a4", "Finance", "Implementation variability increases services cost and reduces margin."),
      e("pt-a5", "Leadership", "Leadership attributes delivery misses to execution discipline."),
    ],
  },
  {
    id: "escalation",
    bridgeSourceId: "pt-b3",
    peripheralSourceId: "pt-b5",
    revealOrder: ["pt-b1", "pt-b2", "pt-b3", "pt-b4", "pt-b5"],
    evidence: [
      e("pt-b1", "HR", "Promotion outcomes reward managers who avoid visible local failure."),
      e("pt-b2", "Information", "Executives retain information needed for ambiguous decisions."),
      e("pt-b3", "Management", "When risk is visible and information is incomplete, managers escalate decisions."),
      e("pt-b4", "Leadership", "Repeated escalation creates an executive approval bottleneck."),
      e("pt-b5", "Teams", "Teams report that routine decisions remain fast."),
    ],
  },
  {
    id: "optimization",
    bridgeSourceId: "pt-c3",
    peripheralSourceId: "pt-c5",
    revealOrder: ["pt-c1", "pt-c2", "pt-c3", "pt-c4", "pt-c5"],
    evidence: [
      e("pt-c1", "Procurement", "Supplier selection increasingly favors the lowest unit cost."),
      e("pt-c2", "Operations", "Low-unit-cost suppliers have longer and more variable lead times."),
      e("pt-c3", "Planning", "Lead-time variability increases operational schedule variability."),
      e("pt-c4", "Sales", "Schedule variability causes missed customer commitments."),
      e("pt-c5", "Finance", "Missed commitments increase expedite and inventory cost."),
    ],
  },
  {
    id: "customer",
    bridgeSourceId: "pt-d3",
    peripheralSourceId: "pt-d5",
    revealOrder: ["pt-d1", "pt-d2", "pt-d3", "pt-d4", "pt-d5"],
    evidence: [
      e("pt-d1", "Support", "Customers report confusion completing core workflows."),
      e("pt-d2", "Product", "Workflow confusion precedes low advanced-feature adoption."),
      e("pt-d3", "Sales", "Low feature adoption drives customer requests for training."),
      e("pt-d4", "Customer Success", "Unresolved training requests create renewal and expansion pressure."),
      e("pt-d5", "Marketing", "Brand awareness increased during the same period."),
    ],
  },
];

export const scoringTruth: Record<FamilyId, ScoringTruth> = {
  commercial: { scenarioId: "commercial", family: "commercial-complexity", emergentExpected: true, expectedMechanismTerms: ["exception", "custom", "implementation"], expectedOutcomeTerms: ["margin", "cost"], expectedInterventionTerms: ["exception", "standard"], requiredSilos: ["Sales", "Product", "Operations", "Finance"] },
  escalation: { scenarioId: "escalation", family: "decision-escalation", emergentExpected: true, expectedMechanismTerms: ["risk", "information", "escalat"], expectedOutcomeTerms: ["approval", "bottleneck"], expectedInterventionTerms: ["information", "incentive", "decision"], requiredSilos: ["HR", "Information", "Management", "Leadership"] },
  optimization: { scenarioId: "optimization", family: "local-optimization", emergentExpected: true, expectedMechanismTerms: ["cost", "lead", "variab"], expectedOutcomeTerms: ["miss", "expedite"], expectedInterventionTerms: ["total", "supplier"], requiredSilos: ["Procurement", "Operations", "Planning", "Sales"] },
  customer: { scenarioId: "customer", family: "customer-misdiagnosis", emergentExpected: true, expectedMechanismTerms: ["workflow", "adoption", "training"], expectedOutcomeTerms: ["renewal", "expansion"], expectedInterventionTerms: ["workflow", "usability"], requiredSilos: ["Support", "Product", "Sales", "Customer Success"] },
};

export const heldOutFutures: Record<FamilyId, HeldOutFuture> = {
  commercial: { scenarioId: "commercial", content: "Margin falls as implementation variability persists.", outcomeTerms: ["margin", "implementation"], effectiveInterventionTerms: ["exception", "standard"] },
  escalation: { scenarioId: "escalation", content: "Ambiguous decisions continue entering executive approval.", outcomeTerms: ["executive", "approval"], effectiveInterventionTerms: ["information", "incentive", "decision"] },
  optimization: { scenarioId: "optimization", content: "Customer misses increase expedite cost.", outcomeTerms: ["miss", "expedite"], effectiveInterventionTerms: ["total", "supplier"] },
  customer: { scenarioId: "customer", content: "Renewal pressure persists despite higher awareness.", outcomeTerms: ["renewal", "awareness"], effectiveInterventionTerms: ["workflow", "usability"] },
};
