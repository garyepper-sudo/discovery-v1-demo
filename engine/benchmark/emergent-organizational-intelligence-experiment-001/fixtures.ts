import type {
  CanonicalArtifacts,
  FutureOutcome,
  InferenceScenario,
  ScoringTruth,
  SiloEvidence,
} from "./types";

const evidence = (
  id: string,
  silo: string,
  observation: string,
  localInterpretation: string,
  observedAt = "2026-01-01T00:00:00.000Z",
): SiloEvidence => ({ id, silo, observation, localInterpretation, observedAt });

function artifacts(input: {
  mechanismId?: string;
  cause?: string;
  process?: string;
  effect?: string;
  evidenceIds: string[];
  contradiction?: boolean;
  history?: boolean;
}): CanonicalArtifacts {
  const mechanisms = input.mechanismId
    ? [
        {
          id: input.mechanismId,
          cause: input.cause ?? "distributed organizational inputs",
          mechanism: input.process ?? input.mechanismId,
          effect: input.effect ?? "organizational outcome",
          confidence: 0.82,
          evidenceIds: [...input.evidenceIds].sort(),
        },
      ]
    : [];
  return {
    mechanisms,
    contradictions: input.contradiction
      ? [
          {
            id: `contradiction-${input.mechanismId ?? "unresolved"}`,
            explanation: "Local interpretations remain incompatible.",
            confidence: 0.72,
            evidenceIds: input.evidenceIds.slice(0, 1),
            opposingEvidenceIds: input.evidenceIds.slice(1, 2),
          },
        ]
      : [],
    theories: input.mechanismId
      ? [
          {
            id: `theory-${input.mechanismId}`,
            title: input.process ?? input.mechanismId,
            explanation: `${input.cause} produces ${input.effect}.`,
            confidence: 0.78,
            supportingEvidence: [...input.evidenceIds].sort(),
          },
        ]
      : [],
    conditions: input.mechanismId
      ? [
          {
            id: `condition-${input.mechanismId}`,
            name: input.effect ?? "organizational outcome",
            status: "constrained",
            confidence: 0.8,
            supportingMechanismIds: [input.mechanismId],
          },
        ]
      : [],
    state: {
      id: `state-${input.mechanismId ?? "uncertain"}`,
      summary: input.mechanismId
        ? `The organization is constrained by ${input.effect}.`
        : "The current Organizational State is uncertain.",
      confidence: input.mechanismId ? 0.76 : 0.4,
      dominantConditions: input.mechanismId
        ? [`condition-${input.mechanismId}`]
        : [],
    },
    historicalTransitions:
      input.history && input.mechanismId
        ? [
            {
              id: `transition-${input.mechanismId}`,
              beforeState: "apparently stable",
              afterState: input.effect ?? "organizational outcome",
              evidenceIds: [...input.evidenceIds].sort(),
            },
          ]
        : [],
  };
}

function scenario(
  id: string,
  items: SiloEvidence[],
  canonical: CanonicalArtifacts,
): InferenceScenario {
  return {
    id,
    evidence: [...items].sort((a, b) => a.id.localeCompare(b.id)),
    artifacts: canonical,
  };
}

export const inferenceScenarios: InferenceScenario[] = [
  scenario(
    "scenario-001",
    [
      evidence("A1", "Sales", "Enterprise deals require increasing customization.", "Demand remains healthy; customization helps win."),
      evidence("A2", "Product", "Roadmap exceptions continue growing.", "Prioritization discipline is weak."),
      evidence("A3", "Operations", "Implementation timelines continue expanding.", "Delivery capacity is insufficient."),
      evidence("A4", "Finance", "Services margin continues shrinking.", "Services pricing is too low."),
    ],
    artifacts({ mechanismId: "operating-model-mismatch", cause: "commercial customization and roadmap exceptions", process: "standard product work converts into bespoke implementation work", effect: "implementation delay and margin erosion", evidenceIds: ["A1", "A2", "A3", "A4"] }),
  ),
  scenario(
    "scenario-002",
    [
      evidence("B1", "Leadership", "More engineers were approved after delivery slowed.", "Capacity is the constraint."),
      evidence("B2", "Product", "Priorities change several times during each quarter.", "Customer demand is volatile."),
      evidence("B3", "Engineering", "Teams restart work after roadmap changes.", "Technical estimates are unreliable."),
      evidence("B4", "HR", "Hiring increased while completed work remained flat.", "Onboarding needs improvement."),
    ],
    artifacts({ mechanismId: "priority-churn", cause: "repeated priority changes", process: "work restarts before completion", effect: "delivery remains flat despite additional staffing", evidenceIds: ["B1", "B2", "B3", "B4"] }),
  ),
  scenario(
    "scenario-003",
    [
      evidence("C1", "Sales", "Exceptions are promised to retain strategic accounts.", "Product flexibility protects revenue."),
      evidence("C2", "Product", "Exception volume reduces roadmap capacity.", "Sales qualification is inconsistent."),
      evidence("C3", "Customer Success", "Late implementations increase escalation pressure.", "Implementation needs more resources."),
      evidence("C4", "Finance", "Escalated accounts receive more concessions.", "Renewal risk is increasing."),
    ],
    artifacts({ mechanismId: "exception-reinforcement-loop", cause: "account exceptions", process: "exceptions reduce capacity and delays increase escalation concessions", effect: "more exception demand and lower margin", evidenceIds: ["C1", "C2", "C3", "C4"], history: true }),
  ),
  scenario(
    "scenario-004",
    [
      evidence("D1", "Leadership", "Maintenance investment was deferred to protect a launch.", "Launch timing is strategically necessary.", "2025-01-01T00:00:00.000Z"),
      evidence("D2", "Engineering", "Deferred maintenance increases recovery time.", "Reliability work needs prioritization.", "2025-04-01T00:00:00.000Z"),
      evidence("D3", "Operations", "Incident duration rises as runbooks become stale.", "Operational discipline is inconsistent.", "2025-08-01T00:00:00.000Z"),
      evidence("D4", "Customer Success", "Renewal concerns rise after repeated outages.", "Customers need better communication.", "2025-11-01T00:00:00.000Z"),
    ],
    artifacts({ mechanismId: "maintenance-deferral-chain", cause: "deferred maintenance", process: "recovery capability erodes over time", effect: "longer incidents create delayed renewal risk", evidenceIds: ["D1", "D2", "D3", "D4"], history: true }),
  ),
  scenario(
    "scenario-005",
    [
      evidence("E1", "Product", "Requirements are complete before handoff.", "Engineering execution is slow."),
      evidence("E2", "Engineering", "Acceptance decisions change during implementation.", "Product requirements are unstable."),
      evidence("E3", "Operations", "No function owns cross-functional acceptance.", "Handoff accountability is unclear."),
    ],
    artifacts({ mechanismId: "handoff-ownership-gap", cause: "unowned cross-functional acceptance", process: "local completion criteria diverge", effect: "requirements reopen during implementation", evidenceIds: ["E1", "E2", "E3"], contradiction: true }),
  ),
  scenario(
    "scenario-006",
    [
      evidence("F1", "Legal", "A new regulation requires regional data residency; the current architecture cannot comply.", "Regional data residency is the complete cause of launch delay."),
      evidence("F2", "Sales", "Regulated-market launches are delayed.", "Enterprise contracting is slow."),
    ],
    artifacts({ mechanismId: "regional-data-residency", cause: "new regulation", process: "architecture cannot satisfy residency", effect: "regulated-market launch delay", evidenceIds: ["F1"] }),
  ),
  scenario(
    "scenario-007",
    [
      evidence("G1", "Marketing", "Website traffic declined this month.", "Brand awareness may be weakening."),
      evidence("G2", "Finance", "Travel spending increased this month.", "Operating discipline may be weakening."),
    ],
    artifacts({ evidenceIds: ["G1", "G2"] }),
  ),
  scenario(
    "scenario-008",
    [
      evidence("H1", "HR", "Turnover rose after office attendance changed.", "Attendance policy caused turnover."),
      evidence("H2", "Sales", "Pipeline also declined after office attendance changed.", "Attendance policy reduced selling time."),
      evidence("H3", "Finance", "A market contraction began in the same period.", "External demand explains pipeline movement."),
    ],
    artifacts({ evidenceIds: ["H1", "H2", "H3"], contradiction: true }),
  ),
  scenario(
    "scenario-009",
    [
      evidence("I1", "Operations", "Central approval reduces incidents in regulated work.", "More approval improves quality."),
      evidence("I2", "Product", "Local autonomy speeds exploration work.", "Less approval improves learning."),
      evidence("I3", "Leadership", "Both operating contexts are strategically important.", "One governance model should still be possible."),
    ],
    artifacts({ mechanismId: "context-dependent-governance", cause: "different risk contexts", process: "opposing governance modes remain locally valid", effect: "no universal decision model is supported", evidenceIds: ["I1", "I2", "I3"], contradiction: true }),
  ),
];

// Scoring-only truth is not passed to inference or registration.
export const scoringTruth: ScoringTruth[] = [
  { scenarioId: "scenario-001", family: "cross-functional-bottleneck", expectedMechanismId: "operating-model-mismatch", expectedOutcome: "implementation delay and margin erosion", effectiveIntervention: "standardize-commercial-product-boundary", requiredSilos: ["Sales", "Product", "Operations", "Finance"], shouldAbstain: false },
  { scenarioId: "scenario-002", family: "misdiagnosed-constraint", expectedMechanismId: "priority-churn", expectedOutcome: "delivery remains flat despite additional staffing", effectiveIntervention: "stabilize-priority-commitments", requiredSilos: ["Leadership", "Product", "Engineering", "HR"], shouldAbstain: false },
  { scenarioId: "scenario-003", family: "feedback-loop", expectedMechanismId: "exception-reinforcement-loop", expectedOutcome: "more exception demand and lower margin", effectiveIntervention: "price-and-govern-exceptions", requiredSilos: ["Sales", "Product", "Customer Success", "Finance"], shouldAbstain: false },
  { scenarioId: "scenario-004", family: "delayed-consequence", expectedMechanismId: "maintenance-deferral-chain", expectedOutcome: "longer incidents create delayed renewal risk", effectiveIntervention: "restore-reliability-investment", requiredSilos: ["Leadership", "Engineering", "Operations", "Customer Success"], shouldAbstain: false },
  { scenarioId: "scenario-005", family: "reconciled-local-explanations", expectedMechanismId: "handoff-ownership-gap", expectedOutcome: "requirements reopen during implementation", effectiveIntervention: "assign-cross-functional-acceptance-owner", requiredSilos: ["Product", "Engineering", "Operations"], shouldAbstain: false },
  { scenarioId: "scenario-006", family: "single-silo-answer", requiredSilos: ["Legal"], shouldAbstain: true },
  { scenarioId: "scenario-007", family: "insufficient", requiredSilos: [], shouldAbstain: true },
  { scenarioId: "scenario-008", family: "coincidental-correlation", requiredSilos: [], shouldAbstain: true },
  { scenarioId: "scenario-009", family: "unresolved-contradiction", requiredSilos: [], shouldAbstain: true },
];

export const futureOutcomes: FutureOutcome[] = scoringTruth.map((truth) => ({
  scenarioId: truth.scenarioId,
  observedOutcome: truth.expectedOutcome ?? "No stable integrated mechanism is confirmed.",
  effectiveIntervention: truth.effectiveIntervention,
}));
