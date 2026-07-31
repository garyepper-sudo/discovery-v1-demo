import type {
  ExperimentAction,
  ExperimentCondition,
  OptimizationContext,
  RecommendationScenario,
} from "./types";

const action = (
  id: string,
  type: ExperimentAction["type"],
  target: string,
  objectiveAffinity: string[],
  values: Partial<ExperimentAction> = {},
): ExperimentAction => ({
  id, type, target, objectiveAffinity,
  timing: "next review window",
  understandingValue: "moderate",
  speed: "moderate",
  cost: "low",
  risk: "low",
  reversible: true,
  evidenceSupported: true,
  governanceAllowed: true,
  ...values,
});

export const scenarios: RecommendationScenario[] = [
  {
    scenarioId: "onboarding-delay", organizationId: "benchmark-org-onboarding",
    title: "Onboarding delay", understandingRevisionRef: "understanding-onboarding-v1",
    understanding: "Ownership timing and credential readiness remain plausible and incompletely discriminated.",
    competingExplanations: ["ownership timing", "credential readiness"], highStakes: false,
    objectives: ["reduce onboarding time", "reduce implementation cost", "improve customer experience", "improve understanding before acting"],
    wrongObjective: "reduce implementation cost",
    actions: [
      action("inspect", "inspect", "compare admitted ownership and credential evidence", ["improve understanding before acting"], { understandingValue: "high", speed: "low" }),
      action("ownership-pilot", "pilot", "assign ownership before kickoff", ["reduce onboarding time", "improve customer experience"], { speed: "high", cost: "moderate" }),
      action("credential-control", "control", "require credential readiness before kickoff", ["reduce onboarding time"], { speed: "moderate" }),
    ],
  },
  {
    scenarioId: "revenue-decline", organizationId: "benchmark-org-revenue",
    title: "Revenue decline", understandingRevisionRef: "understanding-revenue-v1",
    understanding: "Lead volume is stable while conversion declined; pricing, execution, and product fit remain alternatives.",
    competingExplanations: ["pricing", "sales execution", "product fit"], highStakes: false,
    objectives: ["recover revenue quickly", "preserve gross margin", "minimize customer churn", "diagnose the primary cause"],
    wrongObjective: "preserve gross margin",
    actions: [
      action("conversion-review", "inspect", "compare conversion by price, segment, and stage", ["diagnose the primary cause"], { understandingValue: "high" }),
      action("sales-pilot", "pilot", "run a bounded sales-execution pilot", ["recover revenue quickly"], { speed: "high", cost: "moderate" }),
      action("retention-control", "control", "protect at-risk renewals", ["minimize customer churn"], { speed: "high" }),
    ],
  },
  {
    scenarioId: "operational-safety", organizationId: "benchmark-org-safety",
    title: "Operational safety", understandingRevisionRef: "understanding-safety-v1",
    understanding: "Evidence is incomplete, downside may be severe, and delay may increase exposure.",
    competingExplanations: ["isolated incident", "systemic control weakness"], highStakes: true,
    objectives: ["minimize harm", "preserve continuity", "improve understanding", "reduce compliance exposure"],
    wrongObjective: "preserve continuity",
    actions: [
      action("safety-review", "inspect", "inspect existing authorized safety evidence", ["improve understanding"], { understandingValue: "high", speed: "high" }),
      action("containment", "mitigate", "apply reversible containment", ["minimize harm", "reduce compliance exposure"], { speed: "high", cost: "moderate" }),
      action("shutdown", "control", "pause the affected operation", ["minimize harm"], { risk: "moderate", cost: "high", reversible: false }),
    ],
  },
  {
    scenarioId: "cost-reduction", organizationId: "benchmark-org-cost",
    title: "Cost reduction", understandingRevisionRef: "understanding-cost-v1",
    understanding: "Cost centers differ in performance dependence and irreversible cuts remain causally uncertain.",
    competingExplanations: ["structural excess", "temporary utilization gap"], highStakes: true,
    objectives: ["preserve cash", "protect growth", "minimize layoffs", "maximize near-term savings"],
    wrongObjective: "maximize near-term savings",
    actions: [
      action("cost-review", "inspect", "compare reversible cost levers and performance dependence", ["protect growth"], { understandingValue: "high" }),
      action("vendor-cut", "control", "reduce reversible vendor spend", ["preserve cash", "minimize layoffs"], { speed: "high" }),
      action("layoff", "control", "reduce headcount", ["maximize near-term savings"], { speed: "high", cost: "low", risk: "high", reversible: false }),
    ],
  },
  {
    scenarioId: "product-launch", organizationId: "benchmark-org-launch",
    title: "Product launch", understandingRevisionRef: "understanding-launch-v1",
    understanding: "Demand support is moderate, readiness incomplete, and competitive timing matters.",
    competingExplanations: ["timing advantage", "readiness risk"], highStakes: false,
    objectives: ["launch quickly", "maximize learning", "protect brand", "minimize launch cost"],
    wrongObjective: "minimize launch cost",
    actions: [
      action("readiness-review", "inspect", "inspect readiness gaps and demand evidence", ["maximize learning"], { understandingValue: "high" }),
      action("limited-launch", "pilot", "run a reversible limited launch", ["launch quickly", "maximize learning"], { speed: "high", cost: "moderate" }),
      action("delay-launch", "defer", "delay until readiness controls pass", ["protect brand"], { speed: "low" }),
    ],
  },
  {
    scenarioId: "coordination", organizationId: "benchmark-org-coordination",
    title: "Cross-functional coordination", understandingRevisionRef: "understanding-coordination-v1",
    understanding: "Ownership is unclear and shared-resource overload competes as the explanation for delay.",
    competingExplanations: ["unclear ownership", "resource overload"], highStakes: false,
    objectives: ["improve throughput", "reduce management burden", "preserve autonomy", "improve accountability"],
    wrongObjective: "preserve autonomy",
    actions: [
      action("coordination-review", "inspect", "compare delay patterns by owner and shared resource", ["improve throughput"], { understandingValue: "high" }),
      action("owner-pilot", "pilot", "pilot explicit accountable ownership", ["improve accountability", "improve throughput"], { speed: "high" }),
      action("capacity-control", "control", "reserve shared-resource capacity", ["reduce management burden"], { cost: "moderate" }),
    ],
  },
  {
    scenarioId: "negative-no-authority", organizationId: "benchmark-org-negative-authority",
    title: "No authorized action", understandingRevisionRef: "understanding-negative-authority-v1",
    understanding: "A material issue is visible, but no authorized source or permitted action target exists.",
    competingExplanations: ["restricted cause A", "restricted cause B"], highStakes: true,
    objectives: ["reduce risk"], wrongObjective: "move quickly", actions: [],
    negativeControl: "no-authorized-action",
  },
  {
    scenarioId: "negative-unsupported-forecast", organizationId: "benchmark-org-negative-forecast",
    title: "Unsupported forecast", understandingRevisionRef: "understanding-negative-forecast-v1",
    understanding: "No historical or comparative basis supports directional implications.",
    competingExplanations: ["unknown driver"], highStakes: false,
    objectives: ["predict next-quarter performance"], wrongObjective: "maximize growth",
    actions: [action("unknown-review", "inspect", "collect a bounded comparative basis", ["predict next-quarter performance"], { evidenceSupported: false })],
    negativeControl: "unsupported-forecast",
  },
];

export const defaultOptimization: OptimizationContext = {
  optimizer: "balanced", timeHorizon: null, riskTolerance: "low",
  costSensitivity: "moderate", speedPriority: "moderate",
  understandingPriority: "high", reversibilityPreference: "preferred",
  evidenceRequirement: "existing-only", constraints: [],
};

const objective = (
  status: ExperimentCondition["objective"]["status"],
  primaryObjective: string | null,
  confidence: ExperimentCondition["objective"]["objectiveConfidence"],
) => ({
  status, primaryObjective, secondaryObjectives: [], objectiveEvidenceRefs:
    status.startsWith("inferred") ? ["fixture-objective-evidence"] : [],
  objectiveConfidence: confidence,
});

export function conditionsFor(scenario: RecommendationScenario): ExperimentCondition[] {
  const confirmed = scenario.objectives[0] ?? null;
  return [
    { id: "A", label: "understanding only", objective: objective("unknown", null, null), optimization: null },
    { id: "B", label: "generic default", objective: objective("unknown", null, null), optimization: defaultOptimization },
    { id: "C", label: "inferred low", objective: objective("inferred-low-confidence", confirmed, "low"), optimization: defaultOptimization },
    { id: "D", label: "inferred high", objective: objective("inferred-high-confidence", confirmed, "high"), optimization: defaultOptimization },
    { id: "E", label: "confirmed default", objective: objective("confirmed", confirmed, "high"), optimization: defaultOptimization },
    { id: "F", label: "confirmed constrained", objective: objective("confirmed", confirmed, "high"), optimization: { ...defaultOptimization, constraints: ["bounded budget", "authorized scope only"], reversibilityPreference: "required" } },
    { id: "G", label: "full balanced", objective: objective("confirmed", confirmed, "high"), optimization: { ...defaultOptimization, optimizer: "balanced", timeHorizon: "12-months" } },
    { id: "H-risk-low", label: "sensitivity low risk", objective: objective("confirmed", confirmed, "high"), optimization: { ...defaultOptimization, riskTolerance: "low" } },
    { id: "H-risk-high", label: "sensitivity high risk", objective: objective("confirmed", confirmed, "high"), optimization: { ...defaultOptimization, riskTolerance: "high", reversibilityPreference: "neutral", evidenceRequirement: "action-before-more-evidence-allowed" } },
    { id: "I", label: "conflicting objectives", objective: { ...objective("confirmed", confirmed, "high"), secondaryObjectives: scenario.objectives.slice(1, 3) }, optimization: defaultOptimization },
    { id: "J", label: "wrong inferred objective", objective: objective("inferred-high-confidence", scenario.wrongObjective, "high"), optimization: { ...defaultOptimization, optimizer: "objective-first" } },
    { id: "K", label: "user-corrected objective", objective: objective("confirmed", confirmed, "high"), optimization: { ...defaultOptimization, optimizer: "objective-first" } },
    { id: "L", label: "unknown objective high stakes", objective: objective("unknown", null, null), optimization: { ...defaultOptimization, optimizer: "objective-first", evidenceRequirement: "action-before-more-evidence-allowed" } },
  ];
}

export const labProfiles: Array<{ id: string; context: OptimizationContext }> = [
  { id: "understanding-first", context: { ...defaultOptimization, optimizer: "understanding-first", understandingPriority: "high" } },
  { id: "fastest", context: { ...defaultOptimization, optimizer: "custom", speedPriority: "high", understandingPriority: "low", riskTolerance: "moderate" } },
  { id: "lowest-cost", context: { ...defaultOptimization, optimizer: "custom", costSensitivity: "high" } },
  { id: "lowest-risk", context: { ...defaultOptimization, optimizer: "custom", riskTolerance: "low", reversibilityPreference: "required" } },
  { id: "highest-reversibility", context: { ...defaultOptimization, optimizer: "custom", reversibilityPreference: "required" } },
  { id: "objective-first", context: { ...defaultOptimization, optimizer: "objective-first", understandingPriority: "low" } },
];
