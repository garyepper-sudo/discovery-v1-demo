import type {
  AttractorEvidence,
  AttractorPhase,
  Direction,
  SyntheticOrganization,
} from "./types";

function evidence(
  id: string,
  sourceId: string,
  sourceType: AttractorEvidence["sourceType"],
  period: AttractorEvidence["period"],
  observation: string,
  direction: Direction,
  strength: number,
  structural: boolean,
  mechanism: AttractorEvidence["mechanism"],
  condition: string,
): AttractorEvidence {
  return {
    id,
    sourceId,
    sourceType,
    period,
    observation,
    direction,
    strength,
    structural,
    mechanism,
    condition,
  };
}

const historical: AttractorPhase = {
  id: "historical-and-baseline",
  observedState: "centralized",
  evidence: [
    evidence(
      "E1",
      "board-minutes-2024",
      "decision-history",
      "historical",
      "Three delegation programs ended after executives resumed approving exceptions.",
      "centralizing",
      0.9,
      true,
      "executive-override",
      "ambiguous or visible decisions",
    ),
    evidence(
      "E2",
      "manager-interviews",
      "manager-behavior",
      "baseline",
      "Managers independently describe sending uncertain decisions upward before acting.",
      "centralizing",
      0.82,
      true,
      "risk-avoidance",
      "uncertain decisions",
    ),
    evidence(
      "E3",
      "performance-policy",
      "incentive",
      "baseline",
      "Performance reviews penalize visible mistakes more than delayed escalation.",
      "centralizing",
      0.88,
      true,
      "error-penalty",
      "visible failure risk",
    ),
    evidence(
      "E4",
      "operations-access-audit",
      "information-flow",
      "baseline",
      "Commercial and capacity data needed for trade-offs remains limited to executives.",
      "centralizing",
      0.86,
      true,
      "information-concentration",
      "cross-functional trade-offs",
    ),
    evidence(
      "E5",
      "employee-pulse",
      "employee-observation",
      "baseline",
      "Employees across four teams report waiting for approval when ownership is ambiguous.",
      "centralizing",
      0.76,
      false,
      "approval-dependency",
      "ownership ambiguity",
    ),
    evidence(
      "E6",
      "leadership-townhall",
      "leadership-action",
      "baseline",
      "Executives publicly ask teams to make more decisions locally.",
      "decentralizing",
      0.52,
      false,
      "delegated-authority",
      "routine decisions",
    ),
  ],
};

const perturbation: AttractorPhase = {
  id: "delegation-perturbation",
  observedState: "decentralized",
  evidence: [
    evidence(
      "E7",
      "delegation-charter",
      "leadership-action",
      "perturbation",
      "A new charter delegates routine product and staffing decisions.",
      "decentralizing",
      0.82,
      false,
      "delegated-authority",
      "routine decisions",
    ),
    evidence(
      "E8",
      "approval-metrics",
      "intervention-result",
      "perturbation",
      "Executive approvals fall by forty percent during the first six weeks.",
      "decentralizing",
      0.8,
      false,
      "approval-dependency",
      "first six weeks after delegation",
    ),
    evidence(
      "E9",
      "team-retrospectives",
      "employee-observation",
      "perturbation",
      "Teams report faster routine decisions while exception ownership remains unclear.",
      "decentralizing",
      0.66,
      false,
      "delegated-authority",
      "routine work after delegation",
    ),
  ],
};

const restorationA: AttractorPhase = {
  id: "restoration-a-underlying-mechanisms-remain",
  observedState: "centralized",
  evidence: [
    evidence(
      "E10",
      "exception-log",
      "decision-history",
      "restoration",
      "Executives resume deciding ambiguous exceptions after two visible local mistakes.",
      "centralizing",
      0.9,
      true,
      "executive-override",
      "visible mistakes",
    ),
    evidence(
      "E11",
      "manager-follow-up",
      "manager-behavior",
      "restoration",
      "Managers again escalate cross-functional trade-offs because access remains concentrated.",
      "centralizing",
      0.84,
      true,
      "information-concentration",
      "cross-functional trade-offs",
    ),
  ],
};

const restorationB: AttractorPhase = {
  id: "restoration-b-underlying-mechanisms-change",
  observedState: "decentralized",
  evidence: [
    evidence(
      "E12",
      "performance-policy-revision",
      "incentive",
      "restoration",
      "Reviews now reward documented local learning and no longer penalize reversible mistakes.",
      "decentralizing",
      0.92,
      true,
      "learning-safety",
      "reversible local mistakes",
    ),
    evidence(
      "E13",
      "data-access-audit",
      "information-flow",
      "restoration",
      "Teams receive the commercial and capacity information required for local trade-offs.",
      "decentralizing",
      0.9,
      true,
      "distributed-information",
      "cross-functional trade-offs",
    ),
    evidence(
      "E14",
      "executive-practice-review",
      "leadership-action",
      "restoration",
      "Executives decline to override three contested decisions and review learning afterward.",
      "decentralizing",
      0.88,
      true,
      "delegated-authority",
      "contested decisions",
    ),
  ],
};

export const attractorOrganization: SyntheticOrganization = {
  id: "synthetic-decision-control",
  name: "Synthetic Distributed Systems Company",
  phases: [historical, perturbation, restorationA, restorationB],
  expected: {
    hiddenAttractor: "centralizing",
    restorationA: {
      short: "decentralized",
      medium: "mixed",
      long: "centralized",
    },
    restorationB: {
      short: "decentralized",
      medium: "decentralized",
      long: "decentralized",
    },
  },
};

function control(
  id: string,
  evidenceItems: AttractorEvidence[],
): SyntheticOrganization {
  return {
    id,
    name: id,
    phases: [
      {
        id: "control-baseline",
        observedState: "mixed",
        evidence: evidenceItems,
      },
    ],
    expected: {
      hiddenAttractor: null,
      restorationA: { short: "mixed", medium: "mixed", long: "mixed" },
      restorationB: { short: "mixed", medium: "mixed", long: "mixed" },
    },
  };
}

export const negativeControls: SyntheticOrganization[] = [
  control("no-stable-attractor", [
    evidence("N1", "team-a", "employee-observation", "baseline", "Team A escalates regulated decisions.", "centralizing", 0.72, false, "approval-dependency", "regulated work"),
    evidence("N2", "team-b", "employee-observation", "baseline", "Team B makes product decisions locally.", "decentralizing", 0.74, false, "delegated-authority", "product work"),
    evidence("N3", "team-c", "manager-behavior", "baseline", "Team C alternates based on customer risk.", "centralizing", 0.5, false, "risk-avoidance", "customer risk"),
  ]),
  control("contradictory-direction", [
    evidence("N4", "policy-a", "incentive", "historical", "Managers are penalized for local mistakes.", "centralizing", 0.86, true, "error-penalty", "visible mistakes"),
    evidence("N5", "policy-b", "incentive", "historical", "Managers are rewarded for reversible local experiments.", "decentralizing", 0.86, true, "learning-safety", "reversible decisions"),
    evidence("N6", "audit-a", "information-flow", "baseline", "Sensitive data remains executive-only.", "centralizing", 0.82, true, "information-concentration", "sensitive trade-offs"),
    evidence("N7", "audit-b", "information-flow", "baseline", "Operating data is broadly distributed.", "decentralizing", 0.82, true, "distributed-information", "operating decisions"),
  ]),
  control("genuine-direction-change", [
    evidence("N8", "history", "decision-history", "historical", "Executives historically approved all exceptions.", "centralizing", 0.9, true, "executive-override", "exceptions"),
    evidence("N9", "policy-change", "incentive", "restoration", "The error policy now rewards local learning.", "decentralizing", 0.94, true, "learning-safety", "reversible mistakes"),
    evidence("N10", "access-change", "information-flow", "restoration", "Decision information is now distributed.", "decentralizing", 0.92, true, "distributed-information", "trade-offs"),
    evidence("N11", "practice-change", "leadership-action", "restoration", "Executives consistently decline overrides.", "decentralizing", 0.9, true, "delegated-authority", "contested decisions"),
  ]),
  control("insufficient-evidence", [
    evidence("N12", "single-interview", "manager-behavior", "baseline", "One manager usually asks an executive before acting.", "centralizing", 0.8, false, "risk-avoidance", "uncertain decisions"),
  ]),
];

export function phase(id: string): AttractorPhase {
  const found = attractorOrganization.phases.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown attractor phase: ${id}`);
  return found;
}
