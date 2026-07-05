export type OrganizationalObservationType =
  | "distributed_documentation"
  | "duplicated_work"
  | "repeated_experiment"
  | "knowledge_stored_locally"
  | "weak_handoff"
  | "missing_owner"
  | "approval_waiting"
  | "executive_escalation"
  | "conflicting_documentation"
  | "learning_not_reused"
  | "coordination_gap"
  | "generic_observation";

export type OrganizationalObservation = {
  id: string;
  type: OrganizationalObservationType;
  label: string;
  description: string;

  sourceEvidenceIds: string[];
  relatedEntityIds: string[];

  matchedTerms: string[];

  confidence: number;
  strength: number;
};

export type OrganizationalPatternType =
  | "documentation_distributed_across_systems"
  | "work_is_being_repeated"
  | "knowledge_not_transferring"
  | "decisions_wait_for_approval"
  | "ownership_is_unclear"
  | "learning_is_not_compounding"
  | "coordination_is_fragmented"
  | "generic_pattern";

export type OrganizationalPattern = {
  id: string;
  type: OrganizationalPatternType;
  label: string;
  description: string;

  observationIds: string[];
  sourceEvidenceIds: string[];
  relatedEntityIds: string[];

  supportingConceptIds: string[];
  supportingMeaningIds: string[];
  conceptReinforcement: number;

  confidence: number;
  strength: number;

  possiblePhenomenonTypes: string[];
};

export type OrganizationalObservationState = {
  observations: OrganizationalObservation[];
  patterns: OrganizationalPattern[];
  lastUpdatedAt?: string;
};