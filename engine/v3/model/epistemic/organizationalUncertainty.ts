export type OrganizationalUncertaintyStatus =
  | "low"
  | "moderate"
  | "high"
  | "critical";

export type OrganizationalUncertaintyDriverType =
  | "limited-evidence"
  | "contradictory-evidence"
  | "unresolved-question"
  | "competing-explanations"
  | "immature-learning"
  | "unvalidated-prediction"
  | "missing-evidence"
  | "other";

export type OrganizationalUncertaintyDriver = {
  /**
   * Stable category describing the source of uncertainty.
   */
  type:
    OrganizationalUncertaintyDriverType;

  /**
   * Human-readable explanation of the uncertainty.
   */
  description: string;

  /**
   * Relative contribution to overall uncertainty.
   */
  weight: number;

  /**
   * Canonical object identifiers supporting this driver.
   */
  sourceObjectIds: string[];
};

export type OrganizationalUncertainty = {
  /**
   * Organization whose epistemic state is being assessed.
   */
  organizationId: string;

  /**
   * Share of expected evidence support currently available.
   *
   * 1 means evidence support is considered complete for the
   * current investigation; 0 means no usable evidence exists.
   */
  evidenceCompleteness: number;

  /**
   * Degree to which the current evidence agrees.
   *
   * 1 means strong agreement; 0 means severe conflict.
   */
  evidenceAgreement: number;

  /**
   * Share of available evidence involved in contradictions.
   */
  contradictionDensity: number;

  /**
   * Average confidence of detected contradictions.
   */
  contradictionConfidence: number;

  /**
   * Degree to which several plausible interpretations remain unresolved.
   */
  ambiguityScore: number;

  /**
   * Confidence supported by longitudinal organizational learning.
   */
  learningCertainty: number;

  /**
   * Confidence supported by evaluated organizational predictions.
   */
  predictionCertainty: number;

  /**
   * Urgency of performing additional investigation.
   */
  investigationUrgency: number;

  /**
   * Number of detected contradictions that remain unresolved.
   */
  unresolvedContradictionCount: number;

  /**
   * Number of explicit questions that remain unresolved.
   */
  unresolvedQuestionCount: number;

  /**
   * Number of plausible competing explanations currently represented.
   */
  competingExplanationCount: number;

  /**
   * Overall uncertainty from 0 to 1.
   *
   * Higher values indicate greater uncertainty.
   */
  overallUncertainty: number;

  /**
   * Executive-facing categorical interpretation.
   */
  status:
    OrganizationalUncertaintyStatus;

  /**
   * Structured reasons contributing to uncertainty.
   */
  drivers:
    OrganizationalUncertaintyDriver[];

  /**
   * Evidence areas most likely to reduce uncertainty.
   */
  recommendedEvidenceAreas: string[];

  /**
   * Human-readable reasons confidence should remain limited.
   */
  confidenceLimiters: string[];

  /**
   * Concise executive explanation of the epistemic state.
   */
  summary: string;

  /**
   * Stable assessment timestamp.
   */
  assessedAt: string;
};