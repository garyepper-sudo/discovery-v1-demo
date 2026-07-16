import type {
  InvestigationInput,
} from "../../../types";

import {
  runDiscoveryV3,
} from "../../../v3";

import {
  createEmptyOrganizationRuntime,
  evolveOrganizationRuntime,
  type OrganizationRuntime,
} from "../../../v3/runtime";

import type {
  ExecutiveDecision,
} from "../../../v3/model/simulate/executiveDecision";

import type {
  StressVariant,
} from "../stressTypes";

const ORGANIZATION_ID =
  "stress-decision-intelligence-001";

const FIXED_TIME =
  "2026-07-16T04:00:00.000Z";

const EVIDENCE_SECTIONS = [
  "Atlas Precision Manufacturing is a 420-person industrial manufacturer operating across engineering, production, quality, procurement, sales, and finance.",

  "Routine operating decisions frequently require approval from the CEO, COO, or CFO even when the financial exposure is limited and the decision falls within an established operating plan.",

  "Operations leaders report that production scheduling changes, supplier substitutions, customer concessions, maintenance spending, and cross-functional staffing decisions often wait several days for executive review.",

  "Functional leaders generally understand the business but do not have consistently documented decision rights. Teams escalate decisions because they are uncertain about authority boundaries and fear being held responsible for making the wrong call.",

  "The executive team believes centralized approval protects quality, financial discipline, customer commitments, and regulatory compliance. However, managers report that many escalations concern routine decisions rather than material exceptions.",

  "Average routine decision cycle time is estimated at 10 days. Cross-functional handoffs involving approvals average 8 days. Several strategic initiatives have missed internal milestones because operating questions remained unresolved.",

  "Leadership wants to reduce routine decision cycle time to 5 days and cross-functional handoff delay to 4 days within 90 days.",

  "Material financial commitments, legal matters, regulatory exceptions, safety issues, and major customer concessions must retain executive approval.",

  "The organization has not yet completed a full decision-rights inventory. It also lacks complete data showing approval duration by decision category and the frequency of decisions later reversed by executives.",

  "Evidence currently supports an approval-bottleneck explanation, but staffing pressure, unclear priorities, and inconsistent operating processes may also contribute to execution delay.",
] as const;

export type DecisionIntelligenceStressCase = {
  variant: StressVariant;
  runtime: OrganizationRuntime;
  executiveDecision: ExecutiveDecision;
  description: string;
};

function evidenceFraction(
  variant: StressVariant,
): number {
  switch (variant) {
    case "baseline":
      return 1;

    case "evidence-75":
      return 0.75;

    case "evidence-50":
      return 0.5;

    case "evidence-25":
      return 0.25;

    case "evidence-10":
      return 0.1;

    default:
      return 1;
  }
}

function contradictoryEvidenceSections():
  string[] {
  return [
    "The CEO reports that approval speed has improved materially during the past quarter and believes routine decisions rarely wait for executive review.",

    "Operations leaders report that production scheduling changes and supplier substitutions still wait several days for executive approval.",

    "Finance reports that average approval-cycle duration has remained approximately unchanged.",

    "Employee survey results indicate that managers feel less empowered to make routine operating decisions than they did six months ago.",

    "The COO believes centralized approvals protect execution quality, while plant leaders believe the same approvals are now the primary cause of missed milestones.",
  ];
}

function buildInvestigationInput(
  variant: StressVariant,
): InvestigationInput {
  const fraction =
    evidenceFraction(variant);

  const retainedCount =
    Math.max(
      1,
      Math.ceil(
        EVIDENCE_SECTIONS.length *
          fraction,
      ),
    );

  const retainedEvidence =
    EVIDENCE_SECTIONS
      .slice(0, retainedCount);

  const contextSections =
    variant ===
    "contradictory-evidence"
      ? [
          ...retainedEvidence,
          ...contradictoryEvidenceSections(),
        ]
      : retainedEvidence;

  const context =
    contextSections.join(
      "\n\n",
    );

  return {
    company:
      "Atlas Precision Manufacturing",

    website:
      "https://atlas-precision.example",

    industry:
      "Industrial Manufacturing",

    question:
      "How should Atlas reduce routine approval dependency without weakening necessary financial, legal, regulatory, or operational controls?",

    context,
  };
}

function buildEvolvedRuntime(
  input: InvestigationInput,
): OrganizationRuntime {
  const initialRuntime =
    createEmptyOrganizationRuntime({
      organizationId:
        ORGANIZATION_ID,

      name:
        input.company,

      industry:
        input.industry,

      website:
        input.website,
    });

  const result =
    runDiscoveryV3(input);

  return evolveOrganizationRuntime({
    runtime:
      initialRuntime,

    result,

    input,
  });
}

function buildExecutiveDecision():
  ExecutiveDecision {
  return {
    id:
      "decision-delegate-operating-approvals",

    organizationId:
      ORGANIZATION_ID,

    type:
      "governance",

    title:
      "Reduce routine approval dependency",

    objective:
      "Improve execution speed by delegating routine operating decisions while preserving necessary governance.",

    rationale:
      "Approval latency appears to constrain coordination and execution capacity.",

    status:
      "under-review",

    timeHorizon:
      "near-term",

    targetConditionIds: [
      "condition-decisionflow",
      "condition-coordination",
      "condition-executioncapacity",
    ],

    successMetrics: [
      {
        name:
          "Routine decision cycle time",

        targetConditionId:
          "condition-decisionflow",

        baseline:
          10,

        target:
          5,

        unit:
          "days",

        rationale:
          "Faster routine decisions should reduce execution delay.",
      },

      {
        name:
          "Cross-functional handoff delay",

        targetConditionId:
          "condition-coordination",

        baseline:
          8,

        target:
          4,

        unit:
          "days",

        rationale:
          "Clearer authority should reduce waiting between teams.",
      },
    ],

    constraints: [
      {
        type:
          "risk",

        description:
          "Material financial, regulatory, legal, safety, and major customer decisions must retain executive approval.",

        required:
          true,
      },

      {
        type:
          "time",

        description:
          "The first operating changes must be implementable within 90 days.",

        required:
          true,
      },
    ],

    allowedInterventionTypes: [
      "governance",
      "policy",
      "strategy",
    ],

    assumptions: [
      "A meaningful portion of approval latency is avoidable.",
      "Functional leaders can absorb greater decision authority.",
      "Necessary control requirements can be preserved through explicit escalation rules.",
    ],

    openQuestions: [
      "Which decision categories create the greatest avoidable delay?",
      "Where would delegation create unacceptable financial, legal, regulatory, safety, or customer risk?",
      "How often are routine decisions reversed after executive escalation?",
    ],

    confidence:
      0.82,

    createdAt:
      FIXED_TIME,

    updatedAt:
      FIXED_TIME,
  };
}

export function buildDecisionIntelligenceStressExperiment001():
  DecisionIntelligenceStressCase[] {
  const variants: StressVariant[] = [
    "baseline",
    "evidence-75",
    "evidence-50",
    "evidence-25",
    "evidence-10",
    "contradictory-evidence",
  ];

  return variants.map(
    (variant) => {
      const input =
        buildInvestigationInput(
          variant,
        );

      return {
        variant,

        runtime:
          buildEvolvedRuntime(input),

        executiveDecision:
          buildExecutiveDecision(),

        description:
          variant ===
          "contradictory-evidence"
            ? "Full baseline evidence plus direct disagreement across executive, operational, financial, and employee sources."
            : `${Math.round(
                evidenceFraction(variant) *
                  100,
              )}% evidence retained.`,
      };
    },
  );
}
