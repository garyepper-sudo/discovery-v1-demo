export type ExecutiveReviewStatus =
  | "successful"
  | "partially-successful"
  | "unsuccessful"
  | "inconclusive";

export type ExecutiveObservedOutcome = {
  expectedOutcomeId: string;

  observation: string;

  achieved: boolean | null;

  confidence: number;
};

export type ExecutiveReview = {
  id: string;

  organizationId: string;

  executiveWorkId: string;

  decisionRecordId: string;

  status: ExecutiveReviewStatus;

  observedOutcomes:
    ExecutiveObservedOutcome[];

  summary: string;

  reviewedAt: string;
};