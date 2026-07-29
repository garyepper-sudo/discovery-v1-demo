export const alphaScenes = [
  "ask",
  "orient",
  "plan",
  "learn",
  "understand",
  "respond",
  "follow",
  "return",
  "home",
] as const;

export type AlphaScene = (typeof alphaScenes)[number];

export type ConfidenceViewModel = {
  qualitative: "Early" | "Moderate" | "High" | null;
  value: number | null;
  change: number | null;
  rationale: string;
  limitation: string;
};

export type UnderstandingViewModel = {
  id: string;
  title: string;
  originalQuestion: string;
  objective: string;
  synthesis: string;
  explanation: string;
  whyItMatters: string;
  strongestExplanation: string;
  primaryUnknown: string;
  contradiction: string;
  confidence: ConfidenceViewModel;
  beliefBasis?: {
    summaryExplanation: string;
    evidenceCategories: Array<{
      role: "supports" | "opposes" | "shared";
      count: number;
    }>;
    uncertainty: string[];
    alternatives: Array<{
      id: string;
      disposition: "supported" | "plausible" | "unresolved" | "weakened";
      summary: string | null;
    }>;
    nextInquiry: {
      question: string;
      rationale:
        | "investigation-information-gain"
        | "investigation-opportunity-available"
        | "authorized-next-inquiry";
    } | null;
  };
  changeDisclosure?: {
    state:
      | "available"
      | "first-supported-understanding"
      | "history-not-authorized"
      | "change-reason-unavailable"
      | "no-meaningful-change"
      | "projection-data-unavailable";
    changes: Array<{
      id: string;
      direction:
        | "emerged"
        | "strengthened"
        | "weakened"
        | "revised"
        | "contradicted"
        | "retired"
        | "merged"
        | "resolved"
        | "unresolved";
      reason: string | null;
      occurredAt: string;
      previousRevisionAvailable: boolean;
    }>;
  };
};

export type SourceViewModel = {
  id: string;
  title: string;
  rationale: string;
  contribution: "High" | "Medium" | null;
  state: "Included" | "Limited" | "Excluded";
  tone: "green" | "blue" | "violet" | "orange";
};

export type LearningEventViewModel = {
  id: string;
  time: string;
  title: string;
  detail: string;
  effect: string;
  kind: "strengthening" | "weakening" | "contradiction" | "relationship";
};

export type RelationshipViewModel = {
  id: string;
  title: string;
  description: string;
  tone: "green" | "blue" | "violet" | "orange";
};

export type ResponsePathViewModel = {
  id: "agree" | "missing" | "different" | "investigate";
  title: string;
  description: string;
  tone: "blue" | "orange" | "violet" | "green";
};

export type MeaningfulChangeViewModel = {
  id: string;
  eyebrow: string;
  headline: string;
  detail: string;
  action: string;
  kind: "confidence" | "contradiction" | "learning" | "relationship";
  impact: "High" | "Moderate" | null;
};

export type AlphaFixture = {
  organization: { id: string; name: string };
  user: { name: string; role: string };
  understanding: UnderstandingViewModel;
  sources: SourceViewModel[];
  events: LearningEventViewModel[];
  relationships: RelationshipViewModel[];
  responsePaths: ResponsePathViewModel[];
  changes: MeaningfulChangeViewModel[];
  productionMode?: boolean;
};
