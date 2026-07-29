import type {
  IntelligenceScenario,
  OrganizationalDomain,
} from "./types";

type DomainContext = {
  domain: OrganizationalDomain;
  organization: string;
  outcome: string;
  customer: string;
  workUnit: string;
  capacity: string;
};

const DOMAINS: DomainContext[] = [
  { domain: "sales", organization: "Sales Cooperative", outcome: "qualified conversion", customer: "buyer", workUnit: "opportunity", capacity: "seller capacity" },
  { domain: "operations", organization: "Operations Network", outcome: "cycle time", customer: "internal client", workUnit: "work order", capacity: "team capacity" },
  { domain: "hr", organization: "People Services Group", outcome: "employee retention", customer: "employee", workUnit: "role", capacity: "manager capacity" },
  { domain: "finance", organization: "Finance Partnership", outcome: "forecast reliability", customer: "business unit", workUnit: "forecast", capacity: "analyst capacity" },
  { domain: "strategy", organization: "Strategy Office", outcome: "strategic execution", customer: "stakeholder", workUnit: "strategic initiative", capacity: "leadership capacity" },
  { domain: "manufacturing", organization: "Manufacturing Cooperative", outcome: "first-pass yield", customer: "plant customer", workUnit: "production batch", capacity: "line capacity" },
  { domain: "healthcare", organization: "Regional Care Network", outcome: "care access", customer: "patient", workUnit: "care episode", capacity: "clinical capacity" },
  { domain: "government", organization: "Public Service Agency", outcome: "service completion", customer: "resident", workUnit: "case", capacity: "caseworker capacity" },
  { domain: "agriculture", organization: "Agricultural Cooperative", outcome: "harvest yield", customer: "grower", workUnit: "field cycle", capacity: "equipment capacity" },
  { domain: "technology", organization: "Software Platform Company", outcome: "service reliability", customer: "user", workUnit: "release", capacity: "engineering capacity" },
  { domain: "professional_services", organization: "Advisory Partnership", outcome: "engagement margin", customer: "client", workUnit: "engagement", capacity: "consultant capacity" },
  { domain: "retail", organization: "Retail Group", outcome: "repeat purchase", customer: "shopper", workUnit: "store-week", capacity: "store capacity" },
  { domain: "supply_chain", organization: "Distribution Network", outcome: "on-time delivery", customer: "recipient", workUnit: "shipment", capacity: "network capacity" },
  { domain: "customer_success", organization: "Customer Success Organization", outcome: "renewal", customer: "account", workUnit: "success plan", capacity: "manager capacity" },
  { domain: "marketing", organization: "Marketing Organization", outcome: "qualified demand", customer: "audience", workUnit: "campaign", capacity: "team capacity" },
  { domain: "product", organization: "Product Organization", outcome: "feature adoption", customer: "product user", workUnit: "product increment", capacity: "delivery capacity" },
];

type ScenarioPattern = {
  id: string;
  question: (domain: DomainContext) => string;
  evidence: (domain: DomainContext) => IntelligenceScenario["evidence"];
  groundTruth: (domain: DomainContext) => string | null;
  competing: (domain: DomainContext) => string[];
  uncertainty: (domain: DomainContext) => string[];
  nextEvidence: (domain: DomainContext) => string[];
};

const PATTERNS: ScenarioPattern[] = [
  {
    id: "demand_or_execution",
    question: (d) => `Why did ${d.outcome} weaken despite stable reported demand?`,
    evidence: (d) => [
      { id: "e1", statement: `${d.customer} interest remained stable across the last two periods.`, role: "weakening" },
      { id: "e2", statement: `${d.workUnit} completion time increased after a handoff change.`, role: "supporting" },
      { id: "e3", statement: `The largest decline occurred where ${d.capacity} was most constrained.`, role: "supporting" },
      { id: "e4", statement: `One leader attributes the decline entirely to market conditions.`, role: "contrasting" },
    ],
    groundTruth: (d) => `Execution friction is better supported than demand decline, but the contribution of ${d.capacity} remains provisional.`,
    competing: (d) => ["Demand quality declined.", `${d.capacity} constrained execution.`, "The handoff change increased avoidable delay."],
    uncertainty: () => ["No matched cohort isolates the handoff change.", "Reported demand may not equal realized demand."],
    nextEvidence: (d) => [`Compare ${d.workUnit} cohorts before and after the handoff change.`, `Segment ${d.outcome} by capacity-constrained and unconstrained teams.`],
  },
  {
    id: "growth_quality",
    question: (d) => `Is recent growth in ${d.outcome} durable or temporarily concentrated?`,
    evidence: (d) => [
      { id: "e1", statement: `${d.outcome} improved for three consecutive periods.`, role: "supporting" },
      { id: "e2", statement: `More than half of the improvement came from one ${d.customer} segment.`, role: "weakening" },
      { id: "e3", statement: `The remaining segments were flat.`, role: "context" },
      { id: "e4", statement: `No retention or repeat-use cohort is yet available.`, role: "weakening" },
    ],
    groundTruth: () => "Growth is real but concentration and missing persistence evidence make durability provisional.",
    competing: () => ["Broad-based structural improvement.", "Temporary concentration in one segment.", "Measurement timing created an apparent increase."],
    uncertainty: () => ["Persistence is unobserved.", "Segment concentration may be seasonal."],
    nextEvidence: (d) => [`Track repeat behavior for the growing ${d.customer} cohort.`, "Compare the same seasonal period in prior years."],
  },
  {
    id: "capacity_or_priority",
    question: (d) => `Is constrained ${d.outcome} primarily a capacity problem or a prioritization problem?`,
    evidence: (d) => [
      { id: "e1", statement: `${d.capacity} utilization is high in aggregate.`, role: "supporting" },
      { id: "e2", statement: `High-priority ${d.workUnit}s wait behind lower-priority work.`, role: "supporting" },
      { id: "e3", statement: `Two teams with similar staffing have materially different throughput.`, role: "contrasting" },
      { id: "e4", statement: `The planning policy has not been reviewed in twelve months.`, role: "context" },
    ],
    groundTruth: () => "Capacity is constrained, but allocation and prioritization explain meaningful variation.",
    competing: (d) => [`Absolute ${d.capacity} shortage.`, "Priority rules misallocate available capacity.", "Local process variation drives the difference."],
    uncertainty: () => ["Aggregate utilization may hide skill-specific capacity.", "Priority labels may be applied inconsistently."],
    nextEvidence: (d) => [`Map waiting time by ${d.workUnit} priority and required skill.`, "Compare queue policy compliance across the highest- and lowest-throughput teams."],
  },
  {
    id: "retention_driver",
    question: (d) => `What is most likely driving deterioration in ${d.outcome} among established ${d.customer}s?`,
    evidence: (d) => [
      { id: "e1", statement: `Deterioration is concentrated among established ${d.customer}s, not new ones.`, role: "supporting" },
      { id: "e2", statement: `Response time worsened before the decline.`, role: "supporting" },
      { id: "e3", statement: `Pricing and policy remained unchanged.`, role: "weakening" },
      { id: "e4", statement: `Exit feedback is available for only a small self-selected sample.`, role: "context" },
    ],
    groundTruth: () => "Service responsiveness is a plausible driver; pricing is weakened, and causal certainty is not warranted.",
    competing: () => ["Service responsiveness reduced value.", "Unobserved competitive alternatives changed behavior.", "The observed decline reflects cohort composition."],
    uncertainty: () => ["Exit feedback is selection-biased.", "Competitive exposure is unmeasured."],
    nextEvidence: (d) => [`Relate response-time changes to subsequent ${d.customer} outcomes by cohort.`, "Collect structured reasons from a representative sample."],
  },
  {
    id: "quality_speed_tradeoff",
    question: (d) => `Did the recent speed initiative improve ${d.outcome} without shifting cost into quality?`,
    evidence: (d) => [
      { id: "e1", statement: `${d.workUnit} completion became faster after the initiative.`, role: "supporting" },
      { id: "e2", statement: `Rework indicators rose in the same period.`, role: "weakening" },
      { id: "e3", statement: `The measurement definition for rework did not change.`, role: "context" },
      { id: "e4", statement: `Teams adopted the initiative at different times.`, role: "contrasting" },
    ],
    groundTruth: () => "Speed improved, while contemporaneous rework creates a material quality tradeoff that requires staggered-cohort analysis.",
    competing: () => ["The initiative caused a quality tradeoff.", "External complexity increased rework.", "Faster teams report rework more completely."],
    uncertainty: () => ["Adoption timing is not yet linked to outcomes.", "Work complexity may differ across teams."],
    nextEvidence: () => ["Use staggered adoption timing to compare changes.", "Normalize rework by work complexity and team."],
  },
  {
    id: "leadership_alignment",
    question: (d) => `Is leadership alignment sufficient to improve ${d.outcome}?`,
    evidence: (d) => [
      { id: "e1", statement: `Leaders state a common priority for ${d.outcome}.`, role: "supporting" },
      { id: "e2", statement: `Team goals use three incompatible definitions of success.`, role: "weakening" },
      { id: "e3", statement: `Resource allocation still favors the previous priority.`, role: "weakening" },
      { id: "e4", statement: `No decision-rights change accompanied the announcement.`, role: "context" },
    ],
    groundTruth: () => "Verbal alignment exists, but goals, resources, and decision rights do not yet support operational alignment.",
    competing: () => ["Communication has not reached teams.", "Incentives preserve the previous priority.", "The new priority is understood but resource-constrained."],
    uncertainty: () => ["Team interpretation has not been sampled.", "Resource commitments for the next period are unknown."],
    nextEvidence: () => ["Compare team decisions against the stated priority.", "Trace the next allocation cycle and decision-right usage."],
  },
  {
    id: "insufficient_recovery",
    question: (d) => `Why do otherwise similar teams show different ${d.outcome}?`,
    evidence: (d) => [
      { id: "e1", statement: `Two teams have different ${d.outcome}.`, role: "supporting" },
      { id: "e2", statement: `Staffing totals are similar.`, role: "context" },
      { id: "e3", statement: `No comparable data exists for work mix, tenure, process, or local demand.`, role: "weakening" },
      { id: "e4", statement: `Each team leader offers a different untested explanation.`, role: "contrasting" },
    ],
    groundTruth: () => null,
    competing: () => ["Work mix differs.", "Experience or skill differs.", "Local process differs.", "Demand conditions differ."],
    uncertainty: () => ["Current evidence cannot discriminate among the alternatives.", "Similar staffing totals do not establish comparable capacity."],
    nextEvidence: (d) => [`Collect matched ${d.workUnit} mix, tenure, process, and demand measures for both teams.`, "Select one outcome period and use identical definitions across teams."],
  },
];

export function buildDiscoveryIntelligenceCorpus(): IntelligenceScenario[] {
  return DOMAINS.flatMap((domain, domainIndex) =>
    PATTERNS.map((pattern, patternIndex) => ({
      id: `di-${String(domainIndex + 1).padStart(2, "0")}-${String(patternIndex + 1).padStart(2, "0")}-${domain.domain}-${pattern.id}`,
      organizationId: `evaluation-${domain.domain}-${String(patternIndex + 1).padStart(2, "0")}`,
      domain: domain.domain,
      question: pattern.question(domain),
      evidence: pattern.evidence(domain),
      groundTruth: pattern.groundTruth(domain),
      competingExplanations: pattern.competing(domain),
      expectedUncertainty: pattern.uncertainty(domain),
      highestValueNextEvidence: pattern.nextEvidence(domain),
    })),
  );
}

export const DISCOVERY_INTELLIGENCE_CORPUS =
  buildDiscoveryIntelligenceCorpus();
