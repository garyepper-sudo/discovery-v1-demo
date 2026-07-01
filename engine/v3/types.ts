export type V3EvidenceType =
  | "fact"
  | "claim"
  | "question"
  | "risk"
  | "opportunity"
  | "decision"
  | "metric"
  | "unknown";

export type V3Evidence = {
  id: string;
  text: string;
  type: V3EvidenceType;
  confidence: number;
  keywords: string[];
  entities: string[];
  source: string;
};

export type V3Theme = {
  id: string;
  title: string;
  description: string;
  evidenceIds: string[];
  confidence: number;
};

export type V3Contradiction = {
  id: string;
  title: string;
  explanation: string;
  evidenceIds: string[];
  confidence: number;
};

export type V3CausalChain = {
  id: string;
  cause: string;
  mechanism: string;
  effect: string;
  evidenceIds: string[];
  themeIds: string[];
  confidence: number;
};

export type V3Explanation = {
  id: string;
  title: string;
  explanation: string;
  supportingEvidenceIds: string[];
  weakeningEvidenceIds: string[];
  confidence: number;
};

export type V3ExecutiveUnderstanding = {
  headline: string;
  explanation: string;
  confidence: number;
  evidenceSummary: string[];
  contradictions: string[];
  openQuestions: string[];
  nextMoves: string[];
};

export type V3Understanding = {
  id: string;

  title: string;

  summary: string;

  confidence: number;

  supportScore: number;

  contradictionScore: number;

  noveltyScore: number;

  evidenceIds: string[];

  themeIds: string[];

  explanationIds: string[];

  causalChainIds: string[];

  supportingReasons: string[];

  contradictions: string[];

  unknowns: string[];

  implications: string[];

  recommendations: string[];
};

export type V3EmergenceEvent = {
  id: string;
  title: string;
  description: string;
  understandingId?: string;
  strength: number;
  evidenceIds: string[];
};

export type DiscoveryV3Result = {
  evidence: V3Evidence[];
  themes: V3Theme[];
  contradictions: V3Contradiction[];
  causalChains: V3CausalChain[];
  explanations: V3Explanation[];
  understanding: V3Understanding[];
  emergenceEvents: V3EmergenceEvent[];
  executiveUnderstanding: V3ExecutiveUnderstanding;
};