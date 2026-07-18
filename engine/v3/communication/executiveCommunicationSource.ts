import type {
  ExecutiveAssessmentWithPrimaryJudgment,
} from "../model/judgment/buildExecutiveAssessment";

import type {
  ExecutiveRecommendation,
} from "../model/recommendation/executiveRecommendationTypes";

import type {
  OrganizationalCondition,
  OrganizationalState,
} from "../model/state/inferOrganizationalConditions";

/**
 * Canonical source contract for Executive Communication.
 *
 * This object is assembled from canonical runtime cognition and passed to
 * the Executive Communication producer.
 *
 * It intentionally has no dependency on ExecutiveProjection or any
 * component-layer type.
 */
export type ExecutiveCommunicationSource = {
  /**
   * Organization for which the communication is being generated.
   */
  organizationId: string;

  /**
   * Canonical executive judgment.
   */
  executiveAssessment:
    ExecutiveAssessmentWithPrimaryJudgment;

  /**
   * Canonical recommended course of action.
   */
  executiveRecommendation:
    ExecutiveRecommendation;

  /**
   * Canonical integrated organizational state.
   */
  organizationalState:
    OrganizationalState;

  /**
   * Canonical organizational conditions, ordered by upstream priority.
   */
  organizationalConditions:
    OrganizationalCondition[];

  /**
   * Optional executive-facing explanation generated upstream.
   *
   * This remains structurally open during migration so the Communication
   * layer can be decoupled from the current projection contract before the
   * explanation type is made canonical.
   */
  executiveExplanation?:
    unknown;

  /**
   * Canonical organizational predictions available for forecast
   * communication.
   */
  organizationalPredictions?:
    unknown[];

  /**
   * Canonical prediction reflection available for future-state synthesis.
   */
  predictionReflection?:
    unknown;

  /**
   * Longitudinal learning state.
   */
  organizationalLearningProfile?:
    unknown;

  /**
   * Canonical organizational uncertainty assessment.
   */
  organizationalUncertainty?:
    unknown;

  /**
   * Highest-value investigations for reducing uncertainty.
   */
  investigationOpportunities?:
    unknown[];

  /**
   * Canonical organizational beliefs retained for evidence traceability.
   */
  organizationalBeliefs?:
    unknown[];

  /**
   * Canonical organizational theories retained for evidence traceability.
   */
  organizationalTheories?:
    unknown[];

  /**
   * Canonical organizational mechanisms retained for evidence traceability.
   */
  organizationalMechanisms?:
    unknown[];

  /**
   * Optional optimization result available when an optimization cycle has
   * been executed.
   */
  executiveOptimization?:
    unknown;

  /**
   * Optional simulation result available when a simulation cycle has been
   * executed.
   */
  executiveSimulation?:
    unknown;

  /**
   * Timestamp used to create the communication product.
   */
  generatedAt?:
    string;
};
