import type {
  OrganizationalCondition,
  OrganizationalState,
} from "../state/inferOrganizationalConditions";

export type ExecutiveConfidenceLevel =
  | "low"
  | "moderate"
  | "high";

export type ExecutivePrimaryJudgment = {
  id: string;
  generatedAt: string;

  dominantConditionId: string;
  supportingConditionIds: string[];

  confidence: number;
  confidenceLevel: ExecutiveConfidenceLevel;

  headline: string;
  executiveJudgment: string;
  rationale: string;

  supportingMechanismIds: string[];
  supportingBeliefIds: string[];
  supportingConceptIds: string[];
  supportingTheoryIds: string[];

  uncertaintySummary: string;
};

export type BuildPrimaryExecutiveJudgmentInput = {
  organizationalState: OrganizationalState;
  organizationalConditions: OrganizationalCondition[];
  now?: string;
};
