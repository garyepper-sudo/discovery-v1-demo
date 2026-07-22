import type {
  EvolutionModelObject,
  OperatingModelSnapshot,
  OrganizationTimeline,
} from "./contracts";

const timestamps = [
  "2026-01-01T12:00:00.000Z",
  "2026-02-01T12:00:00.000Z",
  "2026-03-01T12:00:00.000Z",
  "2026-04-01T12:00:00.000Z",
  "2026-05-01T12:00:00.000Z",
  "2026-06-01T12:00:00.000Z",
];

const concept = (timestamp: string): EvolutionModelObject => ({
  id: "concept-delivery-quality",
  label: "Delivery quality depends on transferable operating knowledge",
  confidence: 0.76,
  scope: "department",
  status: "active",
  firstObservedAt: timestamps[1],
  lastUpdatedAt: timestamp,
});

const belief = (confidence: number, timestamp: string): EvolutionModelObject => ({
  id: "belief-founder-dependent-delivery",
  label: "Reliable delivery depends on founder-held judgment",
  confidence,
  scope: "department",
  status: confidence < 0.3 ? "weakened" : "active",
  firstObservedAt: timestamps[1],
  lastUpdatedAt: timestamp,
});

const condition = (status: EvolutionModelObject["status"], timestamp: string): EvolutionModelObject => ({
  id: "condition-knowledge-continuity",
  label: "Knowledge continuity constrains delivery scale",
  confidence: status === "resolved" ? 0.82 : 0.7,
  scope: "department",
  status,
  firstObservedAt: timestamps[1],
  lastUpdatedAt: timestamp,
});

const mechanism = (confidence: number, timestamp: string): EvolutionModelObject => ({
  id: "mechanism-knowledge-concentration",
  label: "Critical delivery knowledge is concentrated",
  confidence,
  scope: "department",
  status: confidence < 0.4 ? "weakened" : "active",
  firstObservedAt: timestamps[1],
  lastUpdatedAt: timestamp,
});

const snapshot = (params: {
  index: number;
  beliefConfidence?: number;
  mechanismConfidence?: number;
  conditionStatus?: EvolutionModelObject["status"];
  recommendation?: OperatingModelSnapshot["recommendation"];
  preserveHistory?: boolean;
  decisionLearning?: OperatingModelSnapshot["decisionLearning"];
}): OperatingModelSnapshot => ({
  id: `snapshot-${params.index}`,
  timestamp: timestamps[params.index],
  entities: [],
  beliefs: params.beliefConfidence === undefined ? [] : [belief(params.beliefConfidence, timestamps[params.index])],
  conditions: params.conditionStatus === undefined ? [] : [condition(params.conditionStatus, timestamps[params.index])],
  mechanisms: params.mechanismConfidence === undefined ? [] : [mechanism(params.mechanismConfidence, timestamps[params.index])],
  concepts: params.index === 0 ? [] : [concept(timestamps[params.index])],
  recommendation: params.recommendation,
  historicalTruths: params.preserveHistory ? [{ objectId: "belief-founder-dependent-delivery", statement: "Founder-held judgment was the primary source of delivery reliability before the transfer intervention.", trueFrom: timestamps[1], trueUntil: timestamps[5], supersededByEventId: "event-outcome" }] : [],
  decisionLearning: params.decisionLearning ?? [],
});

const initialSnapshot = snapshot({ index: 0 });
const initialEvidenceSnapshot = snapshot({ index: 1, beliefConfidence: 0.72, mechanismConfidence: 0.68, conditionStatus: "emerging", recommendation: { id: "recommendation-transfer", strategy: "Establish a repeatable knowledge-transfer practice", scope: "department", confidence: 0.66, reasonEventIds: ["event-initial-evidence"] } });
const contradictionSnapshot = snapshot({ index: 2, beliefConfidence: 0.54, mechanismConfidence: 0.56, conditionStatus: "active", recommendation: { id: "recommendation-validate", strategy: "Validate whether the pilot transfer practice works", scope: "department", confidence: 0.58, reasonEventIds: ["event-contradictory-evidence"] }, preserveHistory: true });
const decisionSnapshot = snapshot({ index: 3, beliefConfidence: 0.54, mechanismConfidence: 0.56, conditionStatus: "active", recommendation: contradictionSnapshot.recommendation, preserveHistory: true });
const interventionSnapshot = snapshot({ index: 4, beliefConfidence: 0.54, mechanismConfidence: 0.56, conditionStatus: "active", recommendation: contradictionSnapshot.recommendation, preserveHistory: true });
const outcomeSnapshot = snapshot({ index: 5, beliefConfidence: 0.24, mechanismConfidence: 0.34, conditionStatus: "resolved", recommendation: { id: "recommendation-extend", strategy: "Extend the validated transfer practice to adjacent delivery work", scope: "department", confidence: 0.78, reasonEventIds: ["event-outcome"] }, preserveHistory: true, decisionLearning: [{ decisionId: "decision-formalize-transfer", outcomeEventIds: ["event-outcome"], influencedObjectIds: ["belief-founder-dependent-delivery", "condition-knowledge-continuity", "mechanism-knowledge-concentration"] }] });

export const operatingModelEvolutionPilot: OrganizationTimeline = {
  id: "operating-model-evolution-pilot-001",
  organizationId: "synthetic-advisory-organization",
  usage: "development",
  title: "Knowledge transfer changes delivery dependency",
  initialSnapshot,
  steps: [
    {
      event: { id: "event-initial-evidence", timestamp: timestamps[1], eventType: "evidence", evidence: { evidenceIds: ["evidence-founder-interviews", "evidence-delivery-review"], relationship: "supports", summary: "Delivery quality currently relies on founder-held methods." }, expectedStableConceptIds: [], expectedRevisedConceptIds: ["concept-delivery-quality"], expectedOrganizationalChanges: [{ id: "initial-condition-emerged", type: "condition-emerged", targetType: "condition", targetId: "condition-knowledge-continuity", rationale: "Initial evidence should establish the delivery continuity constraint." }] },
      snapshot: initialEvidenceSnapshot,
    },
    {
      event: { id: "event-contradictory-evidence", timestamp: timestamps[2], eventType: "evidence", evidence: { evidenceIds: ["evidence-transfer-pilot"], relationship: "contradicts", summary: "A small consultant cohort delivered successfully using transferred methods." }, expectedStableConceptIds: ["concept-delivery-quality"], expectedRevisedConceptIds: ["belief-founder-dependent-delivery"], expectedOrganizationalChanges: [
        { id: "contradiction-belief-weakened", type: "belief-weakened", targetType: "belief", targetId: "belief-founder-dependent-delivery", rationale: "Contradictory delivery evidence should weaken founder dependency." },
        { id: "contradiction-mechanism-confidence-decreased", type: "mechanism-confidence-decreased", targetType: "mechanism", targetId: "mechanism-knowledge-concentration", rationale: "Successful transfer should reduce confidence in total knowledge concentration." },
        { id: "contradiction-recommendation-evolved", type: "recommendation-evolved", targetType: "recommendation", targetId: "recommendation-validate", rationale: "The recommendation should shift toward validating the new evidence." },
        { id: "contradiction-scope-preserved", type: "scope-preserved", targetType: "mechanism", targetId: "mechanism-knowledge-concentration", expectedScope: "department", rationale: "Localized evidence should remain department scoped." },
        { id: "contradiction-history-preserved", type: "historical-truth-preserved", targetType: "belief", targetId: "belief-founder-dependent-delivery", rationale: "Revision must not erase the earlier delivery reality." },
      ] },
      snapshot: contradictionSnapshot,
    },
    {
      event: { id: "event-decision", timestamp: timestamps[3], eventType: "decision", decision: { decisionId: "decision-formalize-transfer", summary: "Formalize the transfer practice for the affected delivery department.", disposition: "accepted" }, expectedStableConceptIds: ["concept-delivery-quality"], expectedRevisedConceptIds: [], expectedOrganizationalChanges: [
        { id: "decision-recommendation-preserved", type: "recommendation-preserved", targetType: "recommendation", targetId: "recommendation-validate", rationale: "The accepted decision should preserve the current recommendation until outcomes exist." },
        { id: "decision-scope-preserved", type: "scope-preserved", targetType: "mechanism", targetId: "mechanism-knowledge-concentration", expectedScope: "department", rationale: "The decision should not broaden the diagnosed mechanism." },
      ] },
      snapshot: decisionSnapshot,
    },
    {
      event: { id: "event-intervention", timestamp: timestamps[4], eventType: "intervention", intervention: { interventionId: "intervention-transfer-practice", decisionId: "decision-formalize-transfer", summary: "Introduce the transfer practice in the affected delivery department.", scope: "department" }, expectedStableConceptIds: ["concept-delivery-quality"], expectedRevisedConceptIds: [], expectedOrganizationalChanges: [
        { id: "intervention-recommendation-preserved", type: "recommendation-preserved", targetType: "recommendation", targetId: "recommendation-validate", rationale: "Implementation alone should not claim an outcome." },
        { id: "intervention-scope-preserved", type: "scope-preserved", targetType: "mechanism", targetId: "mechanism-knowledge-concentration", expectedScope: "department", rationale: "The intervention remains localized." },
      ] },
      snapshot: interventionSnapshot,
    },
    {
      event: { id: "event-outcome", timestamp: timestamps[5], eventType: "outcome", outcome: { outcomeId: "outcome-transfer-success", decisionId: "decision-formalize-transfer", interventionId: "intervention-transfer-practice", summary: "The department sustained delivery quality without direct founder involvement.", result: "confirmed" }, expectedStableConceptIds: ["concept-delivery-quality"], expectedRevisedConceptIds: ["belief-founder-dependent-delivery", "condition-knowledge-continuity"], expectedOrganizationalChanges: [
        { id: "outcome-belief-weakened", type: "belief-weakened", targetType: "belief", targetId: "belief-founder-dependent-delivery", rationale: "Observed success should further weaken founder dependency." },
        { id: "outcome-condition-resolved", type: "condition-resolved", targetType: "condition", targetId: "condition-knowledge-continuity", rationale: "The observed outcome resolves the localized continuity constraint." },
        { id: "outcome-mechanism-confidence-decreased", type: "mechanism-confidence-decreased", targetType: "mechanism", targetId: "mechanism-knowledge-concentration", rationale: "The mechanism should weaken after a confirmed transfer outcome." },
        { id: "outcome-recommendation-evolved", type: "recommendation-evolved", targetType: "recommendation", targetId: "recommendation-extend", rationale: "The recommendation may evolve because the outcome was observed." },
        { id: "outcome-scope-preserved", type: "scope-preserved", targetType: "mechanism", targetId: "mechanism-knowledge-concentration", expectedScope: "department", rationale: "A localized success must not become organization-wide truth." },
        { id: "outcome-history-preserved", type: "historical-truth-preserved", targetType: "belief", targetId: "belief-founder-dependent-delivery", rationale: "The original dependency remains historically true." },
      ] },
      snapshot: outcomeSnapshot,
    },
  ],
};

