import type { KnowledgeReference } from "../cognition/cognitiveGraph";

export type OrganizationalDynamicStatus =
  | "new"
  | "reinforced"
  | "stable";

export type OrganizationalDynamicCategory =
  | "authority"
  | "coordination"
  | "information"
  | "knowledge"
  | "execution"
  | "learning"
  | "decision"
  | "ownership"
  | "communication"
  | "risk"
  | "adaptation"
  | "planning"
  | "prioritization"
  | "accountability"
  | "resourceAllocation"
  | "governance"
  | "unknown";

export type OrganizationalDynamic = {
  id: string;

  /**
   * Sprint 34 canonical node type.
   */
  type: "dynamic";

  /**
   * Canonical cognitive graph label.
   */
  label: string;

  /**
   * Backward compatibility.
   * Existing engines still reference `statement`.
   * This will be removed once all downstream engines
   * migrate to `label`.
   */
  statement: string;

  category: OrganizationalDynamicCategory;
  description: string;

  confidence: number;
  strength: number;
  status: OrganizationalDynamicStatus;

  /**
   * Structured cognitive graph references.
   */
  supportedBy: KnowledgeReference[];

  /**
   * Downstream graph references.
   */
  supports: KnowledgeReference[];

  /**
   * Legacy references preserved for migration.
   */
  supportingUnderstandingIds: string[];
  supportingCapabilityIds?: string[];

  createdAt: string;
  updatedAt: string;
};

export type OrganizationalDynamicsState = {
  dynamics: OrganizationalDynamic[];
  lastUpdatedAt?: string;
};

/* ==========================================================
   Sprint 33 Compatibility Layer

   Existing engines still import FunctionalInterpretation.
   These aliases allow Discovery to migrate incrementally
   while the cognitive graph is introduced.
   ========================================================== */

export type FunctionalInterpretationStatus =
  OrganizationalDynamicStatus;

export type FunctionalInterpretationCategory =
  OrganizationalDynamicCategory;

export type FunctionalInterpretation = OrganizationalDynamic;

export type FunctionalInterpretationState = {
  interpretations: FunctionalInterpretation[];
  lastUpdatedAt?: string;
};