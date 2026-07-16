import type {
  OrganizationalUncertaintyStatus,
  OrganizationalUncertaintyDriver,
} from "../epistemic/organizationalUncertainty";

export type ExecutiveExplanation = {
  /**
   * Concise executive-facing synthesis of the current organizational
   * assessment and its implications.
   */
  executiveSummary: string;

  /**
   * Full explanation of what Discovery currently believes is happening.
   */
  assessmentNarrative: string;

  /**
   * Explanation of how strongly Discovery trusts the current assessment.
   */
  confidenceNarrative: string;

  /**
   * Explanation of the most important unresolved uncertainty.
   */
  uncertaintyNarrative: string;

  /**
   * Explanation of what Discovery recommends investigating next.
   */
  investigationNarrative: string;

  /**
   * Canonical categorical uncertainty interpretation.
   */
  uncertaintyStatus:
    OrganizationalUncertaintyStatus;

  /**
   * Overall uncertainty from 0 to 1.
   *
   * Higher values indicate greater uncertainty.
   */
  overallUncertainty: number;

  /**
   * Canonical factors limiting confidence.
   */
  confidenceLimiters: string[];

  /**
   * Structured uncertainty drivers inherited from the Epistemic
   * Operating System.
   */
  uncertaintyDrivers:
    OrganizationalUncertaintyDriver[];

  /**
   * Evidence areas most likely to improve Discovery's understanding.
   */
  recommendedEvidenceAreas: string[];

  /**
   * Stable explanation timestamp.
   */
  generatedAt: string;
};