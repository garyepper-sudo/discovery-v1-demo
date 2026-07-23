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
  qualitative: "Early" | "Moderate" | "High";
  value: number;
  change: number;
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
};

export type SourceViewModel = {
  id: string;
  title: string;
  rationale: string;
  contribution: "High" | "Medium";
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
  impact: "High" | "Moderate";
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
};
