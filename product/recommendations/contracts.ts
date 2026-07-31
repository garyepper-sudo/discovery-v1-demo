import type {
  ProductConfidenceImprovementActionType,
  ProductConfidenceImprovementTarget,
} from "../improvements/contracts";

export type ProductRecommendationPurpose =
  | "improve-understanding"
  | "advance-organizational-objective";

export type ProductRecommendationAction = {
  kind: "confidence-improvement" | "future-objective-action";
  actionType: ProductConfidenceImprovementActionType | string;
  target: ProductConfidenceImprovementTarget | { kind: string; targetRef: string };
};

export type ProductRecommendationConstraint = {
  kind: "authorization" | "governance" | "cost" | "effort" | "delay" | "burden" | "risk" | "reversibility" | "source-access";
  value: string;
  required: boolean;
};

export type ProductRecommendationSecondaryEffect = {
  kind: "understanding-improvement" | "objective-progress" | "risk-reduction" | "cost-reduction" | "learning-value";
  targetRef: string | null;
  expectedDirection: "positive" | "negative" | "mixed" | "unknown";
  basis: string;
};

export type ProductRecommendationFoundation = {
  recommendationPurpose: ProductRecommendationPurpose;
  organizationId: string;
  questionId: string;
  understandingRevisionRef: string;
  primaryIntendedEffect: {
    kind: "understanding-improvement" | "objective-progress";
    targetRef: string;
  };
  action: ProductRecommendationAction;
  rationale: { whyThis: string; whyNow: string; whyNotAlternatives: string };
  evidenceRefs: string[];
  assumptions: string[];
  tradeoffs: string[];
  constraints: ProductRecommendationConstraint[];
  learningValue: "none" | "low" | "moderate" | "high";
  secondaryEffects: ProductRecommendationSecondaryEffect[];
  authorizationRequired: boolean;
};

export type ProductUnderstandingRecommendation = ProductRecommendationFoundation & {
  recommendationPurpose: "improve-understanding";
  recommendationId: string;
  proposalId: string;
  unknownId: string;
  statement: string;
  rationale: ProductRecommendationFoundation["rationale"] & {
    understandingGap: string;
    whyThisAction: string;
    expectedDiscriminationGain: "low" | "moderate" | "high";
    expectedUnderstandingImprovement: "low" | "moderate" | "high";
  };
  costAndConstraints: {
    effort: "low" | "moderate" | "high";
    delay: "immediate" | "short" | "medium" | "long";
    burden: "low" | "moderate" | "high";
    governanceRisk: "low" | "moderate" | "high";
  };
  primaryIntendedEffect: { kind: "understanding-improvement"; targetRef: string };
  requiresAuthorization: true;
};

export type ProductObjectiveContext = {
  status: "unknown" | "inferred-low-confidence" | "inferred-high-confidence" | "confirmed" | "conflicting" | "expired" | "superseded";
  objectiveRef: string | null;
  objectiveVersionRef: string | null;
  assumptionDisclosed: boolean;
};

export type ProductOptimizationContextInput = {
  versionRef: string | null;
  usesDisclosedDefault: boolean;
  materialConstraints: string[];
  actionAlternativeCount: number;
  authorizationPermitted: boolean;
  proposedActionReversible: boolean;
  proposedActionHighStakes: boolean;
};

export type ProductObjectiveRecommendationEligibility =
  | {
      eligible: true;
      qualification: "confirmed-objective" | "high-confidence-inferred-objective-conditional";
      objectiveRef: string;
      objectiveStatus: "confirmed" | "inferred-high-confidence";
      limitations: string[];
    }
  | {
      eligible: false;
      reason: "objective-unknown" | "objective-inference-low-confidence" | "objectives-conflict" | "objective-version-inactive" | "high-stakes-objective-unconfirmed" | "optimization-context-missing" | "action-alternatives-insufficient" | "authorization-limited";
      requiredNextStep: "ask-objective" | "confirm-objective" | "prioritize-objectives" | "provide-optimization-context" | "improve-understanding" | "abstain";
    };

export type ProductObjectiveRecommendationCandidate = ProductRecommendationFoundation & {
  recommendationPurpose: "advance-organizational-objective";
  objectiveVersionRef: string;
  optimizationContextVersionRef: string;
  expectedObjectiveEffect: {
    direction: "positive" | "negative" | "mixed" | "unknown";
    magnitude: "small" | "moderate" | "large" | "unknown";
    basis: string;
  };
  requiresDecision: true;
};
