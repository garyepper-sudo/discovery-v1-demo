export type OrganizationalPhenomenonStatus =
  | "emerging"
  | "strengthening"
  | "stable"
  | "weakening"
  | "fragmented";

export type OrganizationalPhenomenonType =
  | "knowledge_fragmentation"
  | "duplicated_work"
  | "repeated_experimentation"
  | "scattered_documentation"
  | "institutional_memory_loss"
  | "weak_knowledge_transfer"
  | "inconsistent_documentation"
  | "organizational_learning_failure"
  | "decision_latency"
  | "approval_bottleneck"
  | "ownership_ambiguity"
  | "coordination_breakdown"
  | "execution_capacity"
  | "customer_concentration"
  | "leadership_alignment"
  | "operational_complexity"
  | "innovation_pipeline"
  | "emerging_organizational_phenomenon";

export type OrganizationalPhenomenonSignal = {
  label: string;
  description: string;
  strength: number;
};

export type OrganizationalPhenomenon = {
  id: string;

  type: OrganizationalPhenomenonType;
  label: string;
  description: string;

  clusterIds: string[];
  understandingIds: string[];
  patternIds?: string[];

  status: OrganizationalPhenomenonStatus;

  confidence: number;
  strength: number;

  signals: OrganizationalPhenomenonSignal[];
  relatedEntityIds?: string[];
  possibleMechanismTypes: string[];

  executiveMeaning: string;
  evidenceSummary: string;
  changeExplanation: string;

  firstDetectedAt: string;
  lastUpdatedAt: string;
};

export type OrganizationalPhenomenaState = {
  phenomena: OrganizationalPhenomenon[];
  lastUpdatedAt?: string;
};