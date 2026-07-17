import {
  NORTHSTAR_ORGANIZATION_ID,
} from "./northstarCompanyFixture";

export type NorthstarEvidenceBatch =
  | "batch-1-strategy-finance"
  | "batch-2-sales-customer"
  | "batch-3-operations-product"
  | "batch-4-people-integration"
  | "batch-5-late-contradictory-evidence";

export type NorthstarEvidenceFormat =
  | "markdown"
  | "csv"
  | "json"
  | "txt";

export type NorthstarEvidenceReliability =
  | "high"
  | "moderate"
  | "low";

export type NorthstarEvidenceBias =
  | "neutral"
  | "optimistic"
  | "defensive"
  | "commercial"
  | "operational"
  | "political"
  | "incomplete";

export type NorthstarEvidenceArtifact = {
  id: string;
  organizationId: string;
  batch: NorthstarEvidenceBatch;
  sequence: number;
  filename: string;
  format: NorthstarEvidenceFormat;
  title: string;
  function: string;
  owner: string;
  effectiveDate: string;
  createdAt: string;
  reliability: NorthstarEvidenceReliability;
  bias: NorthstarEvidenceBias;
  stale: boolean;
  duplicateOf?: string;
  contradictsArtifactIds: string[];
  supportsGroundTruth: string[];
  supportsMisleadingNarratives: string[];
  expectedCognitiveEffects: string[];
  summary: string;
};

export type NorthstarEvidenceManifest = {
  organizationId: string;
  companyName: string;
  artifactCount: number;
  batches: Array<{
    id: NorthstarEvidenceBatch;
    name: string;
    purpose: string;
    expectedStateChange: string;
  }>;
  artifacts: NorthstarEvidenceArtifact[];
};

function artifact(
  input:
    Omit<
      NorthstarEvidenceArtifact,
      "organizationId"
    >,
): NorthstarEvidenceArtifact {
  return {
    organizationId:
      NORTHSTAR_ORGANIZATION_ID,

    ...input,
  };
}

export const northstarEvidenceManifest:
  NorthstarEvidenceManifest = {
    organizationId:
      NORTHSTAR_ORGANIZATION_ID,

    companyName:
      "Northstar Industrial Systems",

    artifactCount:
      48,

    batches: [
      {
        id:
          "batch-1-strategy-finance",

        name:
          "Strategy and Finance",

        purpose:
          "Establish the official executive narrative, strategic objectives, financial pressure, and initial operating assumptions.",

        expectedStateChange:
          "Discovery should identify margin pressure, forecast instability, delivery risk, and possible acquisition underperformance while retaining moderate confidence because most evidence is leadership-authored.",
      },

      {
        id:
          "batch-2-sales-customer",

        name:
          "Sales and Customer Evidence",

        purpose:
          "Introduce regional variation, customer-impact evidence, optimistic commercial narratives, and conflicting revenue forecasts.",

        expectedStateChange:
          "Discovery should increase uncertainty, identify sales-delivery contradictions, and recognize that strategic-account risk is systemic rather than isolated.",
      },

      {
        id:
          "batch-3-operations-product",

        name:
          "Operations and Product",

        purpose:
          "Expose work-in-progress overload, reprioritization, ownership ambiguity, product interruption, and production instability.",

        expectedStateChange:
          "Discovery should converge on excessive concurrent work and unclear decision rights as cross-functional mechanisms reducing throughput.",
      },

      {
        id:
          "batch-4-people-integration",

        name:
          "People and Acquisition Integration",

        purpose:
          "Reveal burnout, hidden dependency, integration fragmentation, talent risk, and gaps between public acquisition claims and operating reality.",

        expectedStateChange:
          "Discovery should identify fragile execution capacity, hidden organizational dependency, and acquisition integration as an amplifier rather than the sole root cause.",
      },

      {
        id:
          "batch-5-late-contradictory-evidence",

        name:
          "Late Contradictory Evidence",

        purpose:
          "Introduce high-value evidence that invalidates several earlier assumptions after an initial executive recommendation has been formed.",

        expectedStateChange:
          "Discovery should revise beliefs, increase confidence in the concurrency and decision-rights mechanism, reject staffing as the primary explanation, and preserve the distinction between reasonable prior judgment and newly available evidence.",
      },
    ],

    artifacts: [
      artifact({
        id:
          "ns-artifact-001",

        batch:
          "batch-1-strategy-finance",

        sequence:
          1,

        filename:
          "01-board-strategy-update-q2.md",

        format:
          "markdown",

        title:
          "Q2 Board Strategy Update",

        function:
          "Executive Leadership",

        owner:
          "Elena Morris, CEO",

        effectiveDate:
          "2026-06-30",

        createdAt:
          "2026-07-05T09:00:00.000Z",

        reliability:
          "moderate",

        bias:
          "optimistic",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-012",
          "ns-artifact-025",
          "ns-artifact-038",
        ],

        supportsGroundTruth: [
          "Delivery reliability is strategically material.",
          "Acquisition execution affects enterprise growth.",
        ],

        supportsMisleadingNarratives: [
          "The acquisition integration is broadly on track.",
          "Customer delivery issues are temporary.",
        ],

        expectedCognitiveEffects: [
          "Create initial belief that strategy remains sound but execution is inconsistent.",
          "Create moderate confidence in leadership's acquisition narrative.",
        ],

        summary:
          "Board-facing update reports strong demand, improving delivery, and acquisition synergy progress while acknowledging temporary execution pressure.",
      }),

      artifact({
        id:
          "ns-artifact-002",

        batch:
          "batch-1-strategy-finance",

        sequence:
          2,

        filename:
          "02-annual-operating-plan.md",

        format:
          "markdown",

        title:
          "2026 Annual Operating Plan",

        function:
          "Finance",

        owner:
          "Marcus Lee, CFO",

        effectiveDate:
          "2026-01-01",

        createdAt:
          "2025-12-12T16:00:00.000Z",

        reliability:
          "moderate",

        bias:
          "neutral",

        stale:
          true,

        contradictsArtifactIds: [
          "ns-artifact-004",
          "ns-artifact-005",
        ],

        supportsGroundTruth: [
          "Margin restoration and execution reliability are linked.",
        ],

        supportsMisleadingNarratives: [
          "Operating assumptions remain current despite changed conditions.",
        ],

        expectedCognitiveEffects: [
          "Provide original growth, margin, and hiring assumptions.",
          "Create a stale baseline for later variance analysis.",
        ],

        summary:
          "Original annual plan assumes stable gross margin, improving delivery performance, and planned acquisition synergies.",
      }),

      artifact({
        id:
          "ns-artifact-003",

        batch:
          "batch-1-strategy-finance",

        sequence:
          3,

        filename:
          "03-q2-p-and-l.csv",

        format:
          "csv",

        title:
          "Q2 Consolidated Profit and Loss",

        function:
          "Finance",

        owner:
          "Corporate FP&A",

        effectiveDate:
          "2026-06-30",

        createdAt:
          "2026-07-08T12:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-001",
        ],

        supportsGroundTruth: [
          "Expedite costs and delivery inefficiency are reducing margin.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Increase confidence that execution failures have material financial impact.",
          "Create signal connecting expedite expense to margin deterioration.",
        ],

        summary:
          "Actual revenue remains near plan, but gross margin is below target due to expedite costs, rework, discounts, and project overruns.",
      }),

      artifact({
        id:
          "ns-artifact-004",

        batch:
          "batch-1-strategy-finance",

        sequence:
          4,

        filename:
          "04-budget-variance-analysis.md",

        format:
          "markdown",

        title:
          "Q2 Budget Variance Analysis",

        function:
          "Finance",

        owner:
          "Corporate FP&A",

        effectiveDate:
          "2026-06-30",

        createdAt:
          "2026-07-09T10:30:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-002",
        ],

        supportsGroundTruth: [
          "High activity is not translating into completed throughput.",
          "Margin leakage is cross-functional.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create observation that labor utilization is high while project completion is low.",
          "Create contradiction with annual-plan productivity assumptions.",
        ],

        summary:
          "Labor utilization exceeds plan, yet project completions, milestone billing, and contribution margin remain below plan.",
      }),

      artifact({
        id:
          "ns-artifact-005",

        batch:
          "batch-1-strategy-finance",

        sequence:
          5,

        filename:
          "05-reforecast-v3.csv",

        format:
          "csv",

        title:
          "2026 Revenue Reforecast Version 3",

        function:
          "Finance",

        owner:
          "Marcus Lee, CFO",

        effectiveDate:
          "2026-07-15",

        createdAt:
          "2026-07-15T18:00:00.000Z",

        reliability:
          "high",

        bias:
          "defensive",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-013",
          "ns-artifact-014",
        ],

        supportsGroundTruth: [
          "Sales confidence definitions are inconsistent.",
          "Forecast instability reflects delivery uncertainty.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create contradiction between commercial forecast and finance-adjusted forecast.",
          "Increase uncertainty around bookings conversion.",
        ],

        summary:
          "Finance reduces the sales forecast by 11% because of delivery timing, weak probability discipline, and unresolved customer dependencies.",
      }),

      artifact({
        id:
          "ns-artifact-006",

        batch:
          "batch-1-strategy-finance",

        sequence:
          6,

        filename:
          "06-expedite-cost-analysis.csv",

        format:
          "csv",

        title:
          "Expedite and Premium Freight Analysis",

        function:
          "Finance and Operations",

        owner:
          "Operations Finance",

        effectiveDate:
          "2026-06-30",

        createdAt:
          "2026-07-10T14:00:00.000Z",

        reliability:
          "high",

        bias:
          "operational",

        stale:
          false,

        contradictsArtifactIds: [],

        supportsGroundTruth: [
          "Reprioritization and late changes create margin leakage.",
          "Customer exceptions are systemic.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create mechanism linking late commitments and schedule changes to premium cost.",
        ],

        summary:
          "Premium freight and expedite expense are concentrated in projects reprioritized after production release.",
      }),

      artifact({
        id:
          "ns-artifact-007",

        batch:
          "batch-1-strategy-finance",

        sequence:
          7,

        filename:
          "07-synergy-tracker.json",

        format:
          "json",

        title:
          "Vector Controls Synergy Tracker",

        function:
          "Corporate Development",

        owner:
          "Integration Management Office",

        effectiveDate:
          "2026-06-30",

        createdAt:
          "2026-07-06T11:00:00.000Z",

        reliability:
          "moderate",

        bias:
          "optimistic",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-036",
          "ns-artifact-037",
          "ns-artifact-038",
        ],

        supportsGroundTruth: [
          "Commercial integration is ahead of operating integration.",
        ],

        supportsMisleadingNarratives: [
          "The acquisition integration is broadly on track.",
        ],

        expectedCognitiveEffects: [
          "Create initial belief that synergy progress is positive.",
          "Leave unresolved evidence around technical and operating integration.",
        ],

        summary:
          "Tracker reports 72% of planned synergies on track, driven mainly by pipeline attribution and procurement estimates.",
      }),

      artifact({
        id:
          "ns-artifact-008",

        batch:
          "batch-1-strategy-finance",

        sequence:
          8,

        filename:
          "08-executive-operating-review-notes.md",

        format:
          "markdown",

        title:
          "Executive Operating Review Notes",

        function:
          "Executive Leadership",

        owner:
          "CEO Office",

        effectiveDate:
          "2026-07-11",

        createdAt:
          "2026-07-11T20:00:00.000Z",

        reliability:
          "moderate",

        bias:
          "political",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-020",
          "ns-artifact-028",
        ],

        supportsGroundTruth: [
          "Decision ownership is unclear.",
          "Functions disagree on root causes.",
        ],

        supportsMisleadingNarratives: [
          "The principal issue is insufficient staffing.",
        ],

        expectedCognitiveEffects: [
          "Create competing explanations across sales, operations, and engineering.",
          "Increase ambiguity around the primary intervention.",
        ],

        summary:
          "Executives agree execution is deteriorating but disagree whether staffing, process, product quality, or governance is the main cause.",
      }),

      artifact({
        id:
          "ns-artifact-009",

        batch:
          "batch-1-strategy-finance",

        sequence:
          9,

        filename:
          "09-capital-allocation-memo.md",

        format:
          "markdown",

        title:
          "Capital Allocation and Hiring Freeze Memo",

        function:
          "Finance",

        owner:
          "Marcus Lee, CFO",

        effectiveDate:
          "2026-07-01",

        createdAt:
          "2026-07-01T08:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [],

        supportsGroundTruth: [
          "The solution must not depend on additional headcount.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create hard budget and headcount constraints for decision generation.",
        ],

        summary:
          "Company-wide hiring freeze requires operating improvements to remain budget neutral and headcount neutral.",
      }),

      artifact({
        id:
          "ns-artifact-010",

        batch:
          "batch-1-strategy-finance",

        sequence:
          10,

        filename:
          "10-kpi-definition-register.csv",

        format:
          "csv",

        title:
          "Enterprise KPI Definition Register",

        function:
          "Finance",

        owner:
          "Business Intelligence",

        effectiveDate:
          "2026-06-30",

        createdAt:
          "2026-07-04T13:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-012",
          "ns-artifact-026",
        ],

        supportsGroundTruth: [
          "Functions use inconsistent metric definitions.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create contradiction around on-time delivery and forecast confidence definitions.",
        ],

        summary:
          "Register documents four competing definitions of on-time delivery and three regional definitions of committed forecast.",
      }),

      artifact({
        id:
          "ns-artifact-011",

        batch:
          "batch-2-sales-customer",

        sequence:
          11,

        filename:
          "11-global-sales-pipeline.csv",

        format:
          "csv",

        title:
          "Global Enterprise Pipeline",

        function:
          "Sales",

        owner:
          "Revenue Operations",

        effectiveDate:
          "2026-07-15",

        createdAt:
          "2026-07-16T07:30:00.000Z",

        reliability:
          "moderate",

        bias:
          "commercial",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-005",
          "ns-artifact-015",
        ],

        supportsGroundTruth: [
          "Pipeline confidence is overstated.",
        ],

        supportsMisleadingNarratives: [
          "Demand strength can compensate for execution weakness.",
        ],

        expectedCognitiveEffects: [
          "Create high apparent demand.",
          "Increase contradiction with finance and customer-risk evidence.",
        ],

        summary:
          "Pipeline shows strong coverage and high confidence despite several deals depending on unvalidated delivery dates.",
      }),

      artifact({
        id:
          "ns-artifact-012",

        batch:
          "batch-2-sales-customer",

        sequence:
          12,

        filename:
          "12-strategic-account-risk-report.md",

        format:
          "markdown",

        title:
          "Strategic Account Risk Report",

        function:
          "Customer Success",

        owner:
          "Strategic Accounts Team",

        effectiveDate:
          "2026-07-14",

        createdAt:
          "2026-07-14T17:00:00.000Z",

        reliability:
          "high",

        bias:
          "operational",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-001",
          "ns-artifact-011",
        ],

        supportsGroundTruth: [
          "Customer delivery risk is systemic.",
          "Strategic accounts receive informal priority.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Increase confidence that delivery failure threatens growth.",
          "Create signal linking informal escalation to priority instability.",
        ],

        summary:
          "Seven of the top twenty accounts show elevated renewal or expansion risk due to missed milestones, inconsistent ownership, or unresolved product issues.",
      }),

      artifact({
        id:
          "ns-artifact-013",

        batch:
          "batch-2-sales-customer",

        sequence:
          13,

        filename:
          "13-north-america-forecast.md",

        format:
          "markdown",

        title:
          "North America Forecast Commentary",

        function:
          "Sales",

        owner:
          "North America Regional VP",

        effectiveDate:
          "2026-07-15",

        createdAt:
          "2026-07-15T15:00:00.000Z",

        reliability:
          "low",

        bias:
          "optimistic",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-005",
          "ns-artifact-015",
        ],

        supportsGroundTruth: [],

        supportsMisleadingNarratives: [
          "Regional autonomy is the primary source of revenue growth.",
        ],

        expectedCognitiveEffects: [
          "Create optimistic regional forecast belief with low confidence.",
        ],

        summary:
          "Regional leader describes forecast as highly achievable and attributes delivery concerns to isolated operational resistance.",
      }),

      artifact({
        id:
          "ns-artifact-014",

        batch:
          "batch-2-sales-customer",

        sequence:
          14,

        filename:
          "14-europe-forecast.md",

        format:
          "markdown",

        title:
          "Europe Forecast Commentary",

        function:
          "Sales",

        owner:
          "Europe Regional VP",

        effectiveDate:
          "2026-07-15",

        createdAt:
          "2026-07-15T15:30:00.000Z",

        reliability:
          "moderate",

        bias:
          "commercial",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-005",
        ],

        supportsGroundTruth: [
          "Forecast definitions differ by region.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create regional inconsistency signal.",
        ],

        summary:
          "Europe applies a stricter confidence standard and flags multiple deals as dependent on product and delivery validation.",
      }),

      artifact({
        id:
          "ns-artifact-015",

        batch:
          "batch-2-sales-customer",

        sequence:
          15,

        filename:
          "15-win-loss-analysis.csv",

        format:
          "csv",

        title:
          "Enterprise Win-Loss Analysis",

        function:
          "Revenue Operations",

        owner:
          "Market Intelligence",

        effectiveDate:
          "2026-06-30",

        createdAt:
          "2026-07-12T09:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-011",
          "ns-artifact-013",
        ],

        supportsGroundTruth: [
          "Execution credibility affects commercial performance.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create mechanism linking delivery reliability to discounting and lost deals.",
        ],

        summary:
          "Delivery credibility and implementation risk appear in 38% of losses and 44% of discount negotiations.",
      }),

      artifact({
        id:
          "ns-artifact-016",

        batch:
          "batch-2-sales-customer",

        sequence:
          16,

        filename:
          "16-discount-exception-log.csv",

        format:
          "csv",

        title:
          "Discount Exception Log",

        function:
          "Sales and Finance",

        owner:
          "Deal Desk",

        effectiveDate:
          "2026-06-30",

        createdAt:
          "2026-07-10T11:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [],

        supportsGroundTruth: [
          "Commercial concessions compensate for execution risk.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Connect delivery uncertainty to margin leakage.",
        ],

        summary:
          "A significant share of discount exceptions cite schedule risk, implementation uncertainty, or customer escalation history.",
      }),

      artifact({
        id:
          "ns-artifact-017",

        batch:
          "batch-2-sales-customer",

        sequence:
          17,

        filename:
          "17-customer-qbr-notes.md",

        format:
          "markdown",

        title:
          "Strategic Customer QBR Notes",

        function:
          "Customer Success",

        owner:
          "Enterprise Customer Success",

        effectiveDate:
          "2026-07-08",

        createdAt:
          "2026-07-08T19:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-019",
        ],

        supportsGroundTruth: [
          "Ownership changes during delivery reduce trust.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create cross-account pattern of ownership ambiguity and repeated escalation.",
        ],

        summary:
          "Multiple customers describe changing owners, repeated re-explanation, and commitments made before requirements stabilize.",
      }),

      artifact({
        id:
          "ns-artifact-018",

        batch:
          "batch-2-sales-customer",

        sequence:
          18,

        filename:
          "18-support-theme-export.csv",

        format:
          "csv",

        title:
          "Support Theme Export",

        function:
          "Customer Success",

        owner:
          "Support Operations",

        effectiveDate:
          "2026-06-30",

        createdAt:
          "2026-07-09T08:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-030",
        ],

        supportsGroundTruth: [
          "Recurring product and handoff issues are systemic.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create recurring support phenomena.",
          "Contradict product classification of issues as isolated.",
        ],

        summary:
          "Customer issues cluster around configuration handoffs, ownership ambiguity, release quality, and undocumented exceptions.",
      }),

      artifact({
        id:
          "ns-artifact-019",

        batch:
          "batch-2-sales-customer",

        sequence:
          19,

        filename:
          "19-customer-success-executive-summary.md",

        format:
          "markdown",

        title:
          "Customer Success Executive Summary",

        function:
          "Customer Success",

        owner:
          "VP Customer Success",

        effectiveDate:
          "2026-07-10",

        createdAt:
          "2026-07-10T18:00:00.000Z",

        reliability:
          "moderate",

        bias:
          "defensive",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-017",
          "ns-artifact-018",
        ],

        supportsGroundTruth: [],

        supportsMisleadingNarratives: [
          "Customer exceptions are isolated rather than systemic.",
        ],

        expectedCognitiveEffects: [
          "Create contradiction between summary narrative and detailed customer evidence.",
        ],

        summary:
          "Executive summary describes customer issues as concentrated in a small number of complex accounts.",
      }),

      artifact({
        id:
          "ns-artifact-020",

        batch:
          "batch-2-sales-customer",

        sequence:
          20,

        filename:
          "20-sales-operations-escalation-thread.txt",

        format:
          "txt",

        title:
          "Sales and Operations Escalation Thread",

        function:
          "Sales and Operations",

        owner:
          "Regional Sales and Delivery Leaders",

        effectiveDate:
          "2026-07-13",

        createdAt:
          "2026-07-13T22:00:00.000Z",

        reliability:
          "moderate",

        bias:
          "political",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-008",
        ],

        supportsGroundTruth: [
          "Customer commitments precede feasibility validation.",
          "Escalation substitutes for clear decision rights.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create direct evidence of ownership conflict and priority override.",
        ],

        summary:
          "Thread shows sales committing a delivery date, operations rejecting feasibility, and senior executives overriding the normal process.",
      }),

      artifact({
        id:
          "ns-artifact-021",

        batch:
          "batch-3-operations-product",

        sequence:
          21,

        filename:
          "21-production-schedule-attainment.csv",

        format:
          "csv",

        title:
          "Production Schedule Attainment",

        function:
          "Manufacturing",

        owner:
          "Manufacturing Operations",

        effectiveDate:
          "2026-06-30",

        createdAt:
          "2026-07-07T07:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-001",
          "ns-artifact-026",
        ],

        supportsGroundTruth: [
          "Schedule instability reduces delivery reliability.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create high-confidence deterioration trend.",
        ],

        summary:
          "Schedule attainment has declined for four consecutive months while emergency reprioritizations have increased.",
      }),

      artifact({
        id:
          "ns-artifact-022",

        batch:
          "batch-3-operations-product",

        sequence:
          22,

        filename:
          "22-work-in-progress-report.csv",

        format:
          "csv",

        title:
          "Enterprise Work-in-Progress Report",

        function:
          "Operations",

        owner:
          "Enterprise PMO",

        effectiveDate:
          "2026-07-12",

        createdAt:
          "2026-07-13T08:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-024",
        ],

        supportsGroundTruth: [
          "Excessive concurrent work is reducing completed throughput.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create primary signal connecting active initiative count to delay.",
          "Increase confidence in concurrency mechanism.",
        ],

        summary:
          "Twenty-seven strategic initiatives and 143 major customer projects are active simultaneously, with completion rates declining as concurrency increases.",
      }),

      artifact({
        id:
          "ns-artifact-023",

        batch:
          "batch-3-operations-product",

        sequence:
          23,

        filename:
          "23-priority-change-log.csv",

        format:
          "csv",

        title:
          "Executive Priority Change Log",

        function:
          "Operations",

        owner:
          "Enterprise PMO",

        effectiveDate:
          "2026-07-12",

        createdAt:
          "2026-07-13T09:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [],

        supportsGroundTruth: [
          "Frequent reprioritization increases work in progress and decision latency.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create mechanism connecting executive overrides to throughput loss.",
        ],

        summary:
          "Major program priorities changed 39 times in the last quarter, frequently without explicit de-prioritization of prior work.",
      }),

      artifact({
        id:
          "ns-artifact-024",

        batch:
          "batch-3-operations-product",

        sequence:
          24,

        filename:
          "24-pmo-status-deck.md",

        format:
          "markdown",

        title:
          "Enterprise PMO Status Deck",

        function:
          "Program Management",

        owner:
          "Enterprise PMO",

        effectiveDate:
          "2026-07-10",

        createdAt:
          "2026-07-10T12:00:00.000Z",

        reliability:
          "low",

        bias:
          "optimistic",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-022",
          "ns-artifact-023",
        ],

        supportsGroundTruth: [],

        supportsMisleadingNarratives: [
          "Most strategic initiatives are on track.",
        ],

        expectedCognitiveEffects: [
          "Create contradiction between status labels and underlying delivery data.",
        ],

        summary:
          "Deck classifies 81% of strategic initiatives as green despite missed milestones and repeated priority changes.",
      }),

      artifact({
        id:
          "ns-artifact-025",

        batch:
          "batch-3-operations-product",

        sequence:
          25,

        filename:
          "25-delivery-performance-report.csv",

        format:
          "csv",

        title:
          "Customer Delivery Performance",

        function:
          "Delivery",

        owner:
          "Delivery Operations",

        effectiveDate:
          "2026-06-30",

        createdAt:
          "2026-07-08T06:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-001",
          "ns-artifact-026",
        ],

        supportsGroundTruth: [
          "Delivery reliability is deteriorating.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create canonical delivery-reliability condition.",
        ],

        summary:
          "Only 61% of projects meet the customer-promised date under the strict enterprise definition.",
      }),

      artifact({
        id:
          "ns-artifact-026",

        batch:
          "batch-3-operations-product",

        sequence:
          26,

        filename:
          "26-regional-delivery-scorecard.csv",

        format:
          "csv",

        title:
          "Regional Delivery Scorecard",

        function:
          "Delivery",

        owner:
          "Regional Operations",

        effectiveDate:
          "2026-06-30",

        createdAt:
          "2026-07-08T08:00:00.000Z",

        reliability:
          "moderate",

        bias:
          "optimistic",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-010",
          "ns-artifact-021",
          "ns-artifact-025",
        ],

        supportsGroundTruth: [
          "Metric definitions differ by region.",
        ],

        supportsMisleadingNarratives: [
          "Delivery performance is improving.",
        ],

        expectedCognitiveEffects: [
          "Create metric-definition contradiction.",
        ],

        summary:
          "Regional scorecard reports 84% on-time delivery by excluding customer-driven delays and revised promise dates.",
      }),

      artifact({
        id:
          "ns-artifact-027",

        batch:
          "batch-3-operations-product",

        sequence:
          27,

        filename:
          "27-engineering-capacity.csv",

        format:
          "csv",

        title:
          "Engineering Capacity Allocation",

        function:
          "Engineering",

        owner:
          "Engineering Operations",

        effectiveDate:
          "2026-07-07",

        createdAt:
          "2026-07-08T15:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-029",
        ],

        supportsGroundTruth: [
          "Interruptions and concurrent priorities consume engineering capacity.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create observation that only 42% of engineering capacity reaches planned roadmap work.",
        ],

        summary:
          "Engineering capacity is fragmented across roadmap work, customer escalations, acquisition integration, defects, and unplanned executive priorities.",
      }),

      artifact({
        id:
          "ns-artifact-028",

        batch:
          "batch-3-operations-product",

        sequence:
          28,

        filename:
          "28-engineering-interruption-log.csv",

        format:
          "csv",

        title:
          "Engineering Interruption Log",

        function:
          "Engineering",

        owner:
          "Engineering Operations",

        effectiveDate:
          "2026-07-07",

        createdAt:
          "2026-07-08T16:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-008",
        ],

        supportsGroundTruth: [
          "Customer escalation and ownership ambiguity repeatedly interrupt planned work.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create cross-functional interruption mechanism.",
        ],

        summary:
          "Senior engineering teams were redirected 64 times in the quarter, often for customer issues without a clear accountable owner.",
      }),

      artifact({
        id:
          "ns-artifact-029",

        batch:
          "batch-3-operations-product",

        sequence:
          29,

        filename:
          "29-engineering-headcount-request.md",

        format:
          "markdown",

        title:
          "Engineering Headcount Request",

        function:
          "Engineering",

        owner:
          "Chief Product and Technology Officer",

        effectiveDate:
          "2026-07-09",

        createdAt:
          "2026-07-09T14:00:00.000Z",

        reliability:
          "moderate",

        bias:
          "defensive",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-027",
          "ns-artifact-042",
        ],

        supportsGroundTruth: [],

        supportsMisleadingNarratives: [
          "The principal issue is insufficient staffing.",
          "Engineering capacity alone is responsible for missed commitments.",
        ],

        expectedCognitiveEffects: [
          "Create competing staffing explanation.",
        ],

        summary:
          "Request argues that missed commitments are primarily caused by a shortage of engineering capacity and seeks 34 additional hires.",
      }),

      artifact({
        id:
          "ns-artifact-030",

        batch:
          "batch-3-operations-product",

        sequence:
          30,

        filename:
          "30-product-quality-review.md",

        format:
          "markdown",

        title:
          "Product Quality Review",

        function:
          "Product",

        owner:
          "Product Quality Council",

        effectiveDate:
          "2026-07-06",

        createdAt:
          "2026-07-06T17:00:00.000Z",

        reliability:
          "moderate",

        bias:
          "defensive",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-018",
          "ns-artifact-031",
        ],

        supportsGroundTruth: [],

        supportsMisleadingNarratives: [
          "Customer product issues are isolated incidents.",
        ],

        expectedCognitiveEffects: [
          "Create contradiction around defect recurrence and customer impact.",
        ],

        summary:
          "Review characterizes major customer issues as isolated configuration problems rather than systemic product quality failures.",
      }),

      artifact({
        id:
          "ns-artifact-031",

        batch:
          "batch-3-operations-product",

        sequence:
          31,

        filename:
          "31-defect-escape-analysis.csv",

        format:
          "csv",

        title:
          "Defect Escape and Rework Analysis",

        function:
          "Engineering and Quality",

        owner:
          "Quality Analytics",

        effectiveDate:
          "2026-06-30",

        createdAt:
          "2026-07-09T13:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-030",
        ],

        supportsGroundTruth: [
          "Recurring defects and handoff failures increase execution load.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create phenomenon linking rushed releases to downstream escalation.",
        ],

        summary:
          "Defect escapes correlate with compressed validation, customer-specific exceptions, and late requirement changes.",
      }),

      artifact({
        id:
          "ns-artifact-032",

        batch:
          "batch-3-operations-product",

        sequence:
          32,

        filename:
          "32-product-council-minutes.md",

        format:
          "markdown",

        title:
          "Product Council Meeting Minutes",

        function:
          "Product and Sales",

        owner:
          "Product Operations",

        effectiveDate:
          "2026-07-12",

        createdAt:
          "2026-07-12T21:00:00.000Z",

        reliability:
          "high",

        bias:
          "political",

        stale:
          false,

        contradictsArtifactIds: [],

        supportsGroundTruth: [
          "Decision rights for roadmap exceptions are unclear.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create direct evidence of unresolved ownership.",
        ],

        summary:
          "Minutes show repeated debate over who may authorize customer-specific roadmap changes, with decisions escalated to the CEO.",
      }),

      artifact({
        id:
          "ns-artifact-033",

        batch:
          "batch-4-people-integration",

        sequence:
          33,

        filename:
          "33-engagement-survey.csv",

        format:
          "csv",

        title:
          "Employee Engagement Survey",

        function:
          "People",

        owner:
          "People Analytics",

        effectiveDate:
          "2026-06-15",

        createdAt:
          "2026-06-20T12:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-035",
        ],

        supportsGroundTruth: [
          "Decision fatigue and unclear priorities are reducing execution capacity.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create people-system evidence for role ambiguity and overload.",
        ],

        summary:
          "Lowest-scoring items are priority clarity, decision speed, cross-functional accountability, and confidence that leadership will stop lower-value work.",
      }),

      artifact({
        id:
          "ns-artifact-034",

        batch:
          "batch-4-people-integration",

        sequence:
          34,

        filename:
          "34-regrettable-attrition-report.csv",

        format:
          "csv",

        title:
          "Regrettable Attrition Report",

        function:
          "People",

        owner:
          "People Analytics",

        effectiveDate:
          "2026-06-30",

        createdAt:
          "2026-07-05T10:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [],

        supportsGroundTruth: [
          "High performers compensate for weak systems.",
          "Execution capacity is fragile.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create risk signal around hidden dependency and burnout.",
        ],

        summary:
          "Attrition is concentrated among senior program managers, systems engineers, and acquired technical leaders carrying cross-functional coordination load.",
      }),

      artifact({
        id:
          "ns-artifact-035",

        batch:
          "batch-4-people-integration",

        sequence:
          35,

        filename:
          "35-leadership-culture-update.md",

        format:
          "markdown",

        title:
          "Leadership Culture Update",

        function:
          "People",

        owner:
          "Chief People Officer",

        effectiveDate:
          "2026-07-01",

        createdAt:
          "2026-07-01T17:00:00.000Z",

        reliability:
          "low",

        bias:
          "optimistic",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-033",
          "ns-artifact-034",
        ],

        supportsGroundTruth: [],

        supportsMisleadingNarratives: [
          "Employee strain is temporary and localized.",
        ],

        expectedCognitiveEffects: [
          "Create contradiction between leadership narrative and people data.",
        ],

        summary:
          "Update emphasizes resilience, engagement initiatives, and successful integration while minimizing accountability and workload concerns.",
      }),

      artifact({
        id:
          "ns-artifact-036",

        batch:
          "batch-4-people-integration",

        sequence:
          36,

        filename:
          "36-vector-integration-plan.md",

        format:
          "markdown",

        title:
          "Vector Controls Integration Plan",

        function:
          "Integration Management",

        owner:
          "Integration Management Office",

        effectiveDate:
          "2026-02-01",

        createdAt:
          "2026-01-20T09:00:00.000Z",

        reliability:
          "moderate",

        bias:
          "optimistic",

        stale:
          true,

        contradictsArtifactIds: [
          "ns-artifact-037",
          "ns-artifact-038",
        ],

        supportsGroundTruth: [
          "Integration sequencing was underdefined.",
        ],

        supportsMisleadingNarratives: [
          "The acquisition integration is broadly on track.",
        ],

        expectedCognitiveEffects: [
          "Provide planned integration baseline.",
        ],

        summary:
          "Plan assumes rapid commercial, systems, product, and operating integration with limited sequencing dependencies.",
      }),

      artifact({
        id:
          "ns-artifact-037",

        batch:
          "batch-4-people-integration",

        sequence:
          37,

        filename:
          "37-systems-integration-status.csv",

        format:
          "csv",

        title:
          "Acquisition Systems Integration Status",

        function:
          "Information Technology",

        owner:
          "Enterprise Applications",

        effectiveDate:
          "2026-07-10",

        createdAt:
          "2026-07-11T10:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-007",
          "ns-artifact-036",
        ],

        supportsGroundTruth: [
          "Acquired operations remain fragmented.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Increase confidence that integration progress is overstated.",
        ],

        summary:
          "Vector still operates separate CRM, support, product telemetry, project management, and financial reporting systems.",
      }),

      artifact({
        id:
          "ns-artifact-038",

        batch:
          "batch-4-people-integration",

        sequence:
          38,

        filename:
          "38-vector-leadership-notes.md",

        format:
          "markdown",

        title:
          "Vector Leadership Retention Interviews",

        function:
          "People and Integration",

        owner:
          "Integration Talent Lead",

        effectiveDate:
          "2026-07-08",

        createdAt:
          "2026-07-09T18:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-001",
          "ns-artifact-007",
          "ns-artifact-035",
          "ns-artifact-036",
        ],

        supportsGroundTruth: [
          "Commercial integration preceded operating ownership.",
          "Acquired talent lacks clarity.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create hidden integration mechanism.",
          "Increase talent-retention risk.",
        ],

        summary:
          "Acquired leaders report unclear authority, duplicate governance, conflicting product commitments, and uncertainty about who owns integration decisions.",
      }),

      artifact({
        id:
          "ns-artifact-039",

        batch:
          "batch-4-people-integration",

        sequence:
          39,

        filename:
          "39-org-chart.md",

        format:
          "markdown",

        title:
          "Northstar Organization Chart",

        function:
          "People",

        owner:
          "HR Operations",

        effectiveDate:
          "2026-03-01",

        createdAt:
          "2026-03-01T08:00:00.000Z",

        reliability:
          "moderate",

        bias:
          "neutral",

        stale:
          true,

        contradictsArtifactIds: [
          "ns-artifact-040",
        ],

        supportsGroundTruth: [
          "Formal ownership differs from operating reality.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create stale entity and reporting relationships requiring later correction.",
        ],

        summary:
          "Formal chart omits recent interim roles, acquisition integration overlays, and shared delivery accountability.",
      }),

      artifact({
        id:
          "ns-artifact-040",

        batch:
          "batch-4-people-integration",

        sequence:
          40,

        filename:
          "40-decision-rights-matrix.csv",

        format:
          "csv",

        title:
          "Current Decision Rights Matrix",

        function:
          "Executive Operations",

        owner:
          "Chief of Staff",

        effectiveDate:
          "2026-07-10",

        createdAt:
          "2026-07-10T14:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-039",
        ],

        supportsGroundTruth: [
          "Decision rights are incomplete and overlapping.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Create canonical decision-rights condition.",
        ],

        summary:
          "Matrix shows overlapping authority for customer commitments, roadmap exceptions, project reprioritization, and escalation ownership.",
      }),

      artifact({
        id:
          "ns-artifact-041",

        batch:
          "batch-5-late-contradictory-evidence",

        sequence:
          41,

        filename:
          "41-capacity-normalization-analysis.csv",

        format:
          "csv",

        title:
          "Normalized Capacity and Throughput Analysis",

        function:
          "Finance and Operations",

        owner:
          "Special Analysis Team",

        effectiveDate:
          "2026-07-16",

        createdAt:
          "2026-07-17T08:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-029",
        ],

        supportsGroundTruth: [
          "The principal issue is not insufficient staffing.",
          "Concurrency and interruptions reduce productive capacity.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Reduce confidence in staffing explanation.",
          "Increase confidence in work-in-progress mechanism.",
        ],

        summary:
          "After normalizing for interruption and reprioritization, current staffing is sufficient to meet planned throughput if concurrent work is reduced.",
      }),

      artifact({
        id:
          "ns-artifact-042",

        batch:
          "batch-5-late-contradictory-evidence",

        sequence:
          42,

        filename:
          "42-engineering-pilot-results.md",

        format:
          "markdown",

        title:
          "Engineering Focus Pilot Results",

        function:
          "Engineering",

        owner:
          "Platform Engineering",

        effectiveDate:
          "2026-07-15",

        createdAt:
          "2026-07-17T09:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-029",
        ],

        supportsGroundTruth: [
          "Reducing concurrent work increases throughput without additional headcount.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Provide causal evidence supporting concurrency reduction.",
        ],

        summary:
          "A six-week pilot limiting active initiatives increased completed engineering throughput by 31% with unchanged staffing.",
      }),

      artifact({
        id:
          "ns-artifact-043",

        batch:
          "batch-5-late-contradictory-evidence",

        sequence:
          43,

        filename:
          "43-commitment-feasibility-audit.csv",

        format:
          "csv",

        title:
          "Customer Commitment Feasibility Audit",

        function:
          "Internal Audit",

        owner:
          "Operational Audit",

        effectiveDate:
          "2026-07-16",

        createdAt:
          "2026-07-17T10:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-013",
          "ns-artifact-019",
        ],

        supportsGroundTruth: [
          "Commercial commitments are made before feasibility validation.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Increase confidence in sales-delivery governance mechanism.",
        ],

        summary:
          "Forty-three percent of late strategic projects had customer dates committed before cross-functional feasibility review.",
      }),

      artifact({
        id:
          "ns-artifact-044",

        batch:
          "batch-5-late-contradictory-evidence",

        sequence:
          44,

        filename:
          "44-priority-reset-pilot.md",

        format:
          "markdown",

        title:
          "Priority Reset Pilot",

        function:
          "Operations",

        owner:
          "Chief Operating Officer",

        effectiveDate:
          "2026-07-16",

        createdAt:
          "2026-07-17T11:00:00.000Z",

        reliability:
          "high",

        bias:
          "operational",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-024",
        ],

        supportsGroundTruth: [
          "Stopping lower-value work improves delivery throughput.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Provide intervention evidence supporting active-work reduction.",
        ],

        summary:
          "Two delivery teams reduced active projects by 35% and improved milestone completion by 24% within eight weeks.",
      }),

      artifact({
        id:
          "ns-artifact-045",

        batch:
          "batch-5-late-contradictory-evidence",

        sequence:
          45,

        filename:
          "45-governance-layer-postmortem.md",

        format:
          "markdown",

        title:
          "Prior Governance Layer Postmortem",

        function:
          "Executive Operations",

        owner:
          "Chief of Staff",

        effectiveDate:
          "2025-11-30",

        createdAt:
          "2026-07-17T12:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [],

        supportsGroundTruth: [
          "Adding approval layers without reducing work or clarifying ownership is likely to fail.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Disqualify approval-layer-only intervention.",
        ],

        summary:
          "A prior executive review committee increased decision latency and escalation volume because it added approval without changing ownership or active workload.",
      }),

      artifact({
        id:
          "ns-artifact-046",

        batch:
          "batch-5-late-contradictory-evidence",

        sequence:
          46,

        filename:
          "46-metric-reconciliation-report.csv",

        format:
          "csv",

        title:
          "Enterprise Metric Reconciliation",

        function:
          "Business Intelligence",

        owner:
          "Data Governance Council",

        effectiveDate:
          "2026-07-16",

        createdAt:
          "2026-07-17T13:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-001",
          "ns-artifact-026",
        ],

        supportsGroundTruth: [
          "Official delivery reporting overstated performance.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Resolve metric-definition contradiction in favor of strict enterprise measure.",
        ],

        summary:
          "Reconciled data confirms actual customer-date delivery performance is 61%, not the 84% reported in regional scorecards.",
      }),

      artifact({
        id:
          "ns-artifact-047",

        batch:
          "batch-5-late-contradictory-evidence",

        sequence:
          47,

        filename:
          "47-vector-customer-escalation-review.md",

        format:
          "markdown",

        title:
          "Vector Customer Escalation Review",

        function:
          "Integration and Customer Success",

        owner:
          "Integration Steering Committee",

        effectiveDate:
          "2026-07-16",

        createdAt:
          "2026-07-17T14:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-007",
          "ns-artifact-019",
        ],

        supportsGroundTruth: [
          "Acquisition fragmentation amplifies existing ownership failures.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Refine acquisition belief from root cause to amplifier.",
        ],

        summary:
          "Vector escalations largely arise where Northstar and Vector ownership models overlap, rather than from Vector product quality alone.",
      }),

      artifact({
        id:
          "ns-artifact-048",

        batch:
          "batch-5-late-contradictory-evidence",

        sequence:
          48,

        filename:
          "48-independent-operating-assessment.md",

        format:
          "markdown",

        title:
          "Independent Operating Assessment",

        function:
          "External Advisory",

        owner:
          "Independent Operations Review Team",

        effectiveDate:
          "2026-07-16",

        createdAt:
          "2026-07-17T15:00:00.000Z",

        reliability:
          "high",

        bias:
          "neutral",

        stale:
          false,

        contradictsArtifactIds: [
          "ns-artifact-001",
          "ns-artifact-008",
          "ns-artifact-024",
          "ns-artifact-029",
          "ns-artifact-035",
        ],

        supportsGroundTruth: [
          "Excessive concurrent work and unclear decision rights are the primary mechanisms.",
          "Staffing is not the primary constraint.",
          "Governance layers alone will fail.",
        ],

        supportsMisleadingNarratives: [],

        expectedCognitiveEffects: [
          "Increase confidence in the canonical ground-truth mechanism.",
          "Reduce ambiguity across competing explanations.",
          "Support recommendation to reduce active work and clarify decision rights.",
        ],

        summary:
          "Independent review concludes that Northstar has adequate nominal capacity but loses throughput through excessive concurrency, ownership overlap, executive overrides, and unstable priorities.",
      }),
    ],
  };
