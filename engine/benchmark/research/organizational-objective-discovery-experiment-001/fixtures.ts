import type { ObjectiveAuthority, ObjectiveDiscoveryScenario, ObjectiveSignal, ObjectiveSignalKind } from "./types";

const signal = (
  kind: ObjectiveSignalKind,
  objectiveKey: string,
  confidence: number,
  authority: ObjectiveAuthority = "none",
  current = true,
): ObjectiveSignal => ({ kind, objectiveKey, confidence, authority, current });

const clear = (id: string, label: string, key: string, tags: string[] = []): ObjectiveDiscoveryScenario => ({
  id,
  label,
  signals: [
    signal("declaration", key, 1, "governing"),
    signal("strategy", key, 0.9, "delegated"),
    signal("metric", key, 0.8),
  ],
  expectedObjectiveKeys: [key],
  expectedDisposition: "govern",
  minimumQuestions: 0,
  ambiguousMeaning: false,
  tags: ["clear", ...tags],
});

const inferred = (id: string, label: string, key: string, tags: string[] = []): ObjectiveDiscoveryScenario => ({
  id,
  label,
  signals: [signal("evidence", key, 0.86), signal("decision", key, 0.82), signal("metric", key, 0.78)],
  expectedObjectiveKeys: [key],
  expectedDisposition: "clarify-authority",
  minimumQuestions: 1,
  ambiguousMeaning: false,
  tags: ["inferred", ...tags],
});

const conflict = (id: string, label: string, a: string, b: string, tags: string[] = []): ObjectiveDiscoveryScenario => ({
  id,
  label,
  signals: [
    signal("declaration", a, 1, "governing"),
    signal("strategy", a, 0.9, "delegated"),
    signal("decision", b, 0.9, "delegated"),
    signal("metric", b, 0.85),
  ],
  expectedObjectiveKeys: [a, b].sort(),
  expectedDisposition: "resolve-conflict",
  minimumQuestions: 1,
  ambiguousMeaning: false,
  tags: ["conflict", ...tags],
});

const volatile = (id: string, label: string, oldKey: string, newKey: string, tags: string[] = []): ObjectiveDiscoveryScenario => ({
  id,
  label,
  signals: [
    signal("declaration", oldKey, 1, "governing", false),
    signal("strategy", oldKey, 0.8, "delegated", false),
    signal("condition", newKey, 0.95),
    signal("decision", newKey, 0.9, "delegated"),
  ],
  expectedObjectiveKeys: [oldKey, newKey].sort(),
  expectedDisposition: "revalidate",
  minimumQuestions: 1,
  ambiguousMeaning: false,
  tags: ["volatile", ...tags],
});

export const objectiveDiscoveryScenarios: ObjectiveDiscoveryScenario[] = [
  clear("declared-clear", "Governing executive states a precise objective", "retention"),
  inferred("observed-only", "Behavior consistently implies an undeclared objective", "growth"),
  conflict("declared-observed-conflict", "Declared margin objective conflicts with growth behavior", "margin", "growth"),
  conflict("ceo-board-conflict", "CEO growth objective conflicts with board cash objective", "growth", "cash"),
  conflict("sales-product-conflict", "Sales volume conflicts with product quality", "volume", "quality"),
  conflict("short-long-conflict", "Short-term cash conflicts with long-term platform objective", "cash", "platform"),
  clear("authority-clear", "Authorized owner confirms objective", "reliability", ["authority"]),
  { ...inferred("authority-unknown", "Contributor states an objective without mandate", "expansion", ["authority"]), signals: [signal("declaration", "expansion", 1, "contributor")] },
  { ...inferred("authority-delegated", "Delegated operator states an objective", "throughput", ["authority"]), signals: [signal("declaration", "throughput", 1, "delegated")] },
  conflict("stakeholder-split", "Two governing stakeholders state different ends", "access", "sustainability", ["authority"]),
  { id: "vague-grow", label: "Leadership says grow", signals: [signal("declaration", "growth", 1, "governing")], expectedObjectiveKeys: ["growth"], expectedDisposition: "clarify-meaning", minimumQuestions: 1, ambiguousMeaning: true, tags: ["vague"] },
  { id: "means-as-end", label: "Leadership names an initiative rather than an end", signals: [signal("declaration", "launch-crm", 1, "governing"), signal("strategy", "retention", 0.7)], expectedObjectiveKeys: ["launch-crm", "retention"].sort(), expectedDisposition: "clarify-meaning", minimumQuestions: 1, ambiguousMeaning: true, tags: ["means-end"] },
  { id: "metric-as-objective", label: "A KPI target is presented as the objective", signals: [signal("metric", "nrr-110", 1), signal("evidence", "retention", 0.7)], expectedObjectiveKeys: ["nrr-110", "retention"].sort(), expectedDisposition: "clarify-meaning", minimumQuestions: 1, ambiguousMeaning: true, tags: ["metric-boundary"] },
  inferred("decision-pattern", "Repeated decisions reveal a candidate objective", "speed"),
  inferred("strategy-pattern", "Strategy artifacts imply a candidate objective", "enterprise-focus"),
  inferred("metric-pattern", "Metrics imply a candidate objective", "efficiency"),
  inferred("condition-pattern", "Operating conditions imply an urgent candidate objective", "resilience"),
  volatile("crisis-pivot", "Crisis may supersede the prior objective", "growth", "survival", ["crisis"]),
  volatile("turnaround-pivot", "Turnaround changes the objective", "expansion", "cash", ["turnaround"]),
  volatile("regulatory-pivot", "Regulation changes the objective", "speed", "compliance", ["regulatory"]),
  volatile("leadership-change", "New leadership may revise the objective", "efficiency", "innovation", ["leadership"]),
  volatile("market-shift", "Market shift may revise the objective", "premium", "retention", ["market"]),
  clear("startup-stage", "Early-stage company confirms learning objective", "validated-learning", ["lifecycle"]),
  clear("scaleup-stage", "Scale-up confirms repeatability objective", "repeatability", ["lifecycle"]),
  clear("mature-stage", "Mature company confirms resilience objective", "resilience", ["lifecycle"]),
  conflict("portfolio-objectives", "Multiple scoped objectives coexist", "growth", "reliability", ["multiple"]),
  conflict("team-org-scope", "Team objective differs from organization objective", "team-speed", "org-quality", ["scope"]),
  { id: "no-signal", label: "No objective-relevant signal exists", signals: [], expectedObjectiveKeys: [], expectedDisposition: "abstain", minimumQuestions: 1, ambiguousMeaning: false, tags: ["negative"], negativeControl: true },
  { id: "irrelevant-volume", label: "High evidence volume contains no objective signal", signals: [signal("evidence", "irrelevant", 0.1)], expectedObjectiveKeys: [], expectedDisposition: "abstain", minimumQuestions: 1, ambiguousMeaning: false, tags: ["negative", "volume"], negativeControl: true },
  { id: "unauthorized-certainty", label: "Highly confident analyst lacks authority", signals: [signal("declaration", "automation", 1, "contributor")], expectedObjectiveKeys: ["automation"], expectedDisposition: "clarify-authority", minimumQuestions: 1, ambiguousMeaning: false, tags: ["negative", "authority"] },
  { id: "historical-objective", label: "Only an expired objective is available", signals: [signal("declaration", "expansion", 1, "governing", false)], expectedObjectiveKeys: ["expansion"], expectedDisposition: "revalidate", minimumQuestions: 1, ambiguousMeaning: false, tags: ["negative", "freshness"] },
  conflict("goodhart-revenue", "Revenue target conflicts with durable customer value", "revenue", "customer-value", ["goodhart"]),
  conflict("goodhart-velocity", "Velocity metric conflicts with quality objective", "velocity", "quality", ["goodhart"]),
  conflict("risk-posture", "Growth objective conflicts with risk posture", "growth", "capital-preservation", ["risk"]),
  clear("time-horizon", "Objective and horizon are explicitly governed", "profitability-24m", ["horizon"]),
  inferred("question-derived", "Question language suggests but does not authorize an objective", "reduce-delays", ["question"]),
  inferred("answer-derived", "Answer suggests but does not authorize an objective", "reduce-churn", ["answer"]),
  volatile("outcome-revision", "Observed outcome challenges the prior objective", "volume", "quality", ["learning"]),
  conflict("acquisition-integration", "Acquisition creates competing integration objectives", "synergy", "continuity", ["event"]),
  clear("regulated-safety", "Regulated organization confirms safety objective", "safety", ["regulatory"]),
  { ...clear("declared-clear-paraphrase", "Precise governing objective stated with different wording", "retention"), wordingVariantOf: "declared-clear" },
  { ...conflict("declared-observed-paraphrase", "Different wording preserves declared and observed conflict", "margin", "growth"), wordingVariantOf: "declared-observed-conflict" },
];
