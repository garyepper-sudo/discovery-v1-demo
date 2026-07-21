export type ExecutiveWorkStatus =
  | "Evaluate"
  | "Draft"
  | "Under Evaluation"
  | "Recommendation Ready"
  | "On Track"
  | "Needs Attention";

export type DiscoverySuggestedDecisionFixture = {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  urgency: "High" | "Medium" | "Low";
};

export type ExecutiveDecisionFixture = {
  id: string;
  title: string;
  summary: string;
  status: Extract<
    ExecutiveWorkStatus,
    "Draft" | "Under Evaluation" | "Recommendation Ready"
  >;
  updatedLabel: string;
};

export type ActiveInitiativeFixture = {
  id: string;
  title: string;
  summary: string;
  status: Extract<
    ExecutiveWorkStatus,
    "On Track" | "Needs Attention"
  >;
  trend: "Improving" | "Stable" | "Deteriorating";
  nextReviewLabel: string;
};

export type ExecutiveInsightFixture = {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  changeLabel: string;
};

export type RecommendedEvidenceFixture = {
  id: string;
  title: string;
  reason: string;
  estimatedConfidenceGain: number;
  actionLabel: string;
};

export const discoverySuggestedDecisions:
  DiscoverySuggestedDecisionFixture[] = [
    {
      id: "suggestion-decision-ownership",
      title: "Clarify decision ownership",
      summary:
        "Ambiguous ownership is increasing coordination cost and slowing cross-functional execution.",
      confidence: 84,
      urgency: "High",
    },
    {
      id: "suggestion-concurrent-work",
      title: "Reduce concurrent strategic work",
      summary:
        "Current executive capacity appears insufficient to support every active priority at the expected quality.",
      confidence: 78,
      urgency: "Medium",
    },
  ];

export const executiveDecisions:
  ExecutiveDecisionFixture[] = [
    {
      id: "decision-europe-expansion",
      title: "Evaluate European expansion",
      summary:
        "Test whether current operating capacity can support a new geographic market.",
      status: "Under Evaluation",
      updatedLabel: "Updated yesterday",
    },
    {
      id: "decision-vp-sales",
      title: "Hire a VP of Sales",
      summary:
        "Determine whether leadership capacity or commercial process is the more important constraint.",
      status: "Draft",
      updatedLabel: "Created 3 days ago",
    },
  ];

export const activeInitiatives:
  ActiveInitiativeFixture[] = [
    {
      id: "initiative-erp",
      title: "ERP implementation",
      summary:
        "Execution remains viable, but leadership bandwidth is beginning to constrain implementation quality.",
      status: "Needs Attention",
      trend: "Deteriorating",
      nextReviewLabel: "Review in 4 days",
    },
    {
      id: "initiative-pricing",
      title: "Pricing transformation",
      summary:
        "The initiative remains aligned with current organizational conditions and commercial priorities.",
      status: "On Track",
      trend: "Stable",
      nextReviewLabel: "Review next week",
    },
  ];

export const executiveInsights:
  ExecutiveInsightFixture[] = [
    {
      id: "insight-leadership-bandwidth",
      title: "Leadership bandwidth is becoming a system constraint",
      summary:
        "Several independent workstreams now depend on the same small group of executives, increasing delay and execution risk.",
      confidence: 82,
      changeLabel: "Confidence increased 9%",
    },
    {
      id: "insight-decision-flow",
      title: "Decision delay is spreading beyond approvals",
      summary:
        "The current evidence suggests unclear ownership—not approval volume alone—is driving slower decision flow.",
      confidence: 79,
      changeLabel: "Mechanism strengthened",
    },
    {
      id: "insight-priority-load",
      title: "Strategic priority load exceeds coordination capacity",
      summary:
        "The organization can sustain the current portfolio only if leadership reduces dependency across active initiatives.",
      confidence: 75,
      changeLabel: "New relationship detected",
    },
  ];

export const recommendedEvidence:
  RecommendedEvidenceFixture[] = [
    {
      id: "evidence-board-deck",
      title: "Latest board deck",
      reason:
        "Would strengthen Discovery's understanding of strategic priorities, unresolved board concerns, and executive commitments.",
      estimatedConfidenceGain: 8,
      actionLabel: "Upload deck",
    },
    {
      id: "evidence-leadership-update",
      title: "Weekly leadership update",
      reason:
        "Would improve freshness around capacity constraints, initiative dependencies, and recent operating changes.",
      estimatedConfidenceGain: 5,
      actionLabel: "Add update",
    },
    {
      id: "evidence-crm",
      title: "Current sales pipeline",
      reason:
        "Would help Discovery test whether commercial performance is constrained by demand, execution, or leadership attention.",
      estimatedConfidenceGain: 4,
      actionLabel: "Connect source",
    },
  ];