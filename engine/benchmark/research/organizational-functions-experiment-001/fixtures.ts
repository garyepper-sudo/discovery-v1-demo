import type {
  ExperimentalEvidence,
  ExperimentalEvidenceRoleAssignment,
  OrganizationalFunction,
  Scenario,
} from "./types";

function evidence(
  scenarioId: string,
  text: string,
  options: Partial<ExperimentalEvidence> = {},
): ExperimentalEvidence {
  return {
    id: `${scenarioId}-e1`,
    organizationId: options.organizationId ?? `org-${scenarioId}`,
    text,
    type: options.type ?? "fact",
    polarity: options.polarity ?? "negative",
    admitted: options.admitted ?? true,
    sourceType: options.sourceType ?? "operating-record",
  };
}

function roles(
  item: ExperimentalEvidence,
  assigned: ExperimentalEvidenceRoleAssignment["roles"],
  direction: ExperimentalEvidenceRoleAssignment["direction"],
): ExperimentalEvidenceRoleAssignment[] {
  return [{
    evidenceId: item.id,
    roles: assigned,
    direction,
    basis: {
      evidenceType: item.type,
      evidencePolarity: item.polarity,
      evidenceStrength: "moderate",
      observationIds: [`${item.id}-observation`],
      signalIds: [],
      themeIds: [],
    },
    lineage: {
      evidenceIds: [item.id],
      observationIds: [`${item.id}-observation`],
    },
  }];
}

function scenario(input: {
  id: string;
  category: Scenario["category"];
  industry: string;
  domain: Scenario["questionDomain"];
  text: string;
  expected: OrganizationalFunction[];
  prohibited?: OrganizationalFunction[];
  direction?: Scenario["expectedDirection"];
  roleNames?: ExperimentalEvidenceRoleAssignment["roles"];
  roleDirection?: ExperimentalEvidenceRoleAssignment["direction"];
  admitted?: boolean;
  type?: ExperimentalEvidence["type"];
  mechanism?: readonly [OrganizationalFunction, OrganizationalFunction];
  gap?: Scenario["highestValueEvidenceGap"];
}): Scenario {
  const item = evidence(input.id, input.text, {
    admitted: input.admitted,
    type: input.type,
  });
  const expectedAbstention = input.expected.length === 0;
  return {
    id: input.id,
    category: input.category,
    industry: input.industry,
    questionDomain: input.domain,
    evidence: [item],
    observations: [{
      id: `${item.id}-observation`,
      organizationId: item.organizationId,
      statement: item.text,
      evidenceIds: [item.id],
    }],
    evidenceRoles: input.roleNames
      ? roles(item, input.roleNames, input.roleDirection ?? "friction")
      : [],
    expectedFunctions: input.expected,
    prohibitedFunctions: input.prohibited ?? [],
    expectedDirection:
      input.direction ?? (expectedAbstention ? "abstain" : "friction"),
    expectedAbstention,
    expectedMechanism: input.mechanism,
    highestValueEvidenceGap: input.gap,
  };
}

export const SCENARIOS: Scenario[] = [
  scenario({
    id: "exact-sales-conversion",
    category: "exact",
    industry: "software",
    domain: "sales",
    text: "Sales conversion declined while opportunity cycle time increased.",
    expected: ["value-conversion"],
    direction: "decreasing",
    roleNames: ["demand-signal", "weakens", "temporal-trend"],
    roleDirection: "decreasing",
    gap: { function: "value-conversion", recommendation: "Opportunity stage history and loss reasons." },
  }),
  scenario({
    id: "exact-execution-delay",
    category: "exact",
    industry: "software",
    domain: "execution",
    text: "Delivery cycle time increased as unresolved dependencies blocked releases.",
    expected: ["execution-throughput", "coordination"],
    roleNames: ["execution-signal", "constraint-signal", "weakens"],
    mechanism: ["coordination", "execution-throughput"],
    gap: { function: "execution-throughput", recommendation: "Delivery timeline and dependency history." },
  }),
  scenario({
    id: "exact-hiring-capacity",
    category: "exact",
    industry: "professional-services",
    domain: "hiring",
    text: "Time to fill open roles lengthened while workload exceeded staffing capacity.",
    expected: ["capacity-acquisition", "productive-capacity"],
    roleNames: ["capacity-signal", "demand-signal", "weakens"],
    mechanism: ["capacity-acquisition", "productive-capacity"],
    gap: { function: "capacity-acquisition", recommendation: "Hiring funnel by role." },
  }),
  scenario({
    id: "exact-decision-bottleneck",
    category: "exact",
    industry: "manufacturing",
    domain: "decisions",
    text: "Executive approval delays left operating decisions waiting for signoff.",
    expected: ["decision-authorization"],
    roleNames: ["decision-signal", "leadership-observation", "constraint-signal"],
    gap: { function: "decision-authorization", recommendation: "Recent decision log with approval timestamps." },
  }),
  scenario({
    id: "exact-customer-retention",
    category: "exact",
    industry: "software",
    domain: "retention",
    text: "Customer retention weakened as renewal cancellations increased.",
    expected: ["customer-retention"],
    direction: "decreasing",
    roleNames: ["retention-signal", "customer-observation", "weakens"],
    roleDirection: "decreasing",
    gap: { function: "customer-retention", recommendation: "Renewal and cancellation reasons." },
  }),
  scenario({
    id: "paraphrase-opportunity-duration",
    category: "paraphrase",
    industry: "professional-services",
    domain: "sales",
    text: "Prospective engagements spend more weeks between qualified interest and signed statement of work.",
    expected: ["value-conversion"],
    roleNames: ["demand-signal", "temporal-trend"],
    roleDirection: "friction",
    gap: { function: "value-conversion", recommendation: "Opportunity stage history and loss reasons." },
  }),
  scenario({
    id: "paraphrase-hiring-workload",
    category: "paraphrase",
    industry: "healthcare",
    domain: "hiring",
    text: "Patient caseload growth has outpaced the clinician hours available on the roster.",
    expected: ["productive-capacity"],
    roleNames: ["capacity-signal", "weakens"],
    gap: { function: "productive-capacity", recommendation: "Capacity and demand by role and shift." },
  }),
  scenario({
    id: "paraphrase-retention-cancellations",
    category: "paraphrase",
    industry: "nonprofit",
    domain: "retention",
    text: "More recurring supporters chose not to continue their annual membership.",
    expected: ["customer-retention"],
    direction: "decreasing",
    roleNames: ["customer-observation", "weakens"],
    roleDirection: "decreasing",
    gap: { function: "customer-retention", recommendation: "Renewal and cancellation reasons." },
  }),
  scenario({
    id: "paraphrase-pricing",
    category: "paraphrase",
    industry: "agriculture",
    domain: "other",
    text: "Growers accepted a smaller share of the posted rate after more concessions.",
    expected: ["value-exchange"],
    direction: "decreasing",
  }),
  scenario({
    id: "paraphrase-allocation",
    category: "paraphrase",
    industry: "government",
    domain: "other",
    text: "Staff hours were moved from prevention work to urgent case response.",
    expected: ["resource-allocation"],
    direction: "unknown",
  }),
  scenario({
    id: "paraphrase-learning",
    category: "paraphrase",
    industry: "retail",
    domain: "other",
    text: "Post-incident reviews close, but the same store failure recurs without a changed practice.",
    expected: ["learning-adaptation"],
  }),
  scenario({
    id: "cross-manufacturing-quality",
    category: "cross-industry",
    industry: "manufacturing",
    domain: "execution",
    text: "Final inspection failures send completed assemblies back through repeat work.",
    expected: ["quality-control"],
    gap: { function: "quality-control", recommendation: "Defect and rework records by process stage." },
  }),
  scenario({
    id: "cross-healthcare-throughput",
    category: "cross-industry",
    industry: "healthcare",
    domain: "execution",
    text: "Discharge-ready patients remain in beds while downstream placement is unresolved.",
    expected: ["execution-throughput", "coordination"],
    mechanism: ["coordination", "execution-throughput"],
  }),
  scenario({
    id: "cross-government-authorization",
    category: "cross-industry",
    industry: "government",
    domain: "decisions",
    text: "Routine permit actions queue for a director's signature before work proceeds.",
    expected: ["decision-authorization"],
  }),
  scenario({
    id: "cross-nonprofit-demand",
    category: "cross-industry",
    industry: "nonprofit",
    domain: "sales",
    text: "Fewer first-time donors entered the qualified campaign pipeline.",
    expected: ["demand-generation"],
    direction: "decreasing",
  }),
  scenario({
    id: "cross-agriculture-capacity",
    category: "cross-industry",
    industry: "agriculture",
    domain: "hiring",
    text: "Seasonal crews remain unfilled past the harvest start date.",
    expected: ["capacity-acquisition"],
  }),
  scenario({
    id: "cross-retail-knowledge",
    category: "cross-industry",
    industry: "retail",
    domain: "other",
    text: "New shift teams cannot retrieve the resolution history for recurring store incidents.",
    expected: ["knowledge-flow"],
  }),
  scenario({
    id: "cross-services-formation",
    category: "cross-industry",
    industry: "professional-services",
    domain: "decisions",
    text: "Partners repeatedly reopen option analysis instead of selecting a client response.",
    expected: ["decision-formation"],
  }),
  scenario({
    id: "cross-software-coordination",
    category: "cross-industry",
    industry: "software",
    domain: "execution",
    text: "Work stops at the product-to-engineering boundary because ownership of the handoff is unresolved.",
    expected: ["coordination"],
  }),
  scenario({
    id: "negative-document-retention",
    category: "negative",
    industry: "government",
    domain: "retention",
    text: "The records retention policy changed from five years to seven.",
    expected: [],
    prohibited: ["customer-retention"],
  }),
  scenario({
    id: "negative-technical-conversion",
    category: "negative",
    industry: "software",
    domain: "sales",
    text: "The file conversion took longer after the software deployment.",
    expected: [],
    prohibited: ["value-conversion", "execution-throughput"],
  }),
  scenario({
    id: "negative-approval-rating",
    category: "negative",
    industry: "government",
    domain: "decisions",
    text: "The mayor's approval rating increased in the latest poll.",
    expected: [],
    prohibited: ["decision-authorization"],
  }),
  scenario({
    id: "negated-churn",
    category: "negation",
    industry: "software",
    domain: "retention",
    text: "Customer cancellations did not increase after the pricing change.",
    expected: [],
    prohibited: ["customer-retention"],
  }),
  scenario({
    id: "hypothesis-hiring",
    category: "hypothesis",
    industry: "healthcare",
    domain: "hiring",
    text: "Hiring delays might be caused by compensation.",
    expected: [],
    prohibited: ["capacity-acquisition"],
    type: "claim",
  }),
  scenario({
    id: "quotation-decision",
    category: "quotation",
    industry: "professional-services",
    domain: "decisions",
    text: "A manager asked, “Are approvals slowing decisions?”",
    expected: [],
    prohibited: ["decision-authorization"],
    type: "question",
  }),
  scenario({
    id: "ambiguous-growth",
    category: "ambiguous",
    industry: "retail",
    domain: "other",
    text: "Growth changed during the quarter.",
    expected: [],
  }),
  scenario({
    id: "rejected-quality",
    category: "negative",
    industry: "manufacturing",
    domain: "execution",
    text: "Defect rework increased at final inspection.",
    expected: [],
    prohibited: ["quality-control"],
    admitted: false,
  }),
];
