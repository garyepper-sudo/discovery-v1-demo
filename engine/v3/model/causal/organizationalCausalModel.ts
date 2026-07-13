export type OrganizationalEntityType =
  | "condition"
  | "belief"
  | "mechanism"
  | "theory"
  | "concept";

export type OrganizationalInfluenceDirection =
  | "increases"
  | "decreases"
  | "stabilizes"
  | "destabilizes"
  | "enables"
  | "constrains";

export type OrganizationalCausalEntity = {
  /**
   * Stable identity for the organizational entity.
   */
  id: string;

  /**
   * Type of organizational cognition represented.
   */
  type: OrganizationalEntityType;

  /**
   * Human-readable organizational name.
   */
  label: string;

  /**
   * Current organizational status where available.
   */
  status?: string;

  /**
   * Discovery's confidence in the entity.
   */
  confidence: number;
};

export type OrganizationalCausalRelationship = {
  /**
   * Stable identity for the causal relationship.
   */
  id: string;

  /**
   * Upstream organizational cause.
   */
  sourceEntityId: string;

  /**
   * Downstream organizational effect.
   */
  targetEntityId: string;

  /**
   * Direction of the organizational influence.
   */
  direction: OrganizationalInfluenceDirection;

  /**
   * Estimated strength of the organizational influence.
   */
  strength: number;

  /**
   * Discovery's confidence that this causal relationship is valid.
   */
  confidence: number;

  /**
   * Executive-facing explanation of why the source
   * affects the target.
   */
  explanation: string;

  /**
   * Mechanisms supporting the causal relationship.
   */
  supportingMechanismIds: string[];

  /**
   * Theories supporting the causal relationship.
   */
  supportingTheoryIds: string[];

  /**
   * Beliefs supporting the causal relationship.
   */
  supportingBeliefIds: string[];

  /**
   * Evidence supporting the causal relationship.
   */
  supportingEvidenceIds: string[];
};

export type OrganizationalCausalModel = {
  /**
   * Stable identity for this causal-model snapshot.
   */
  id: string;

  /**
   * Organization represented by the model.
   */
  organizationId: string;

  /**
   * Organizational entities Discovery can reason across.
   */
  organizationalEntities: OrganizationalCausalEntity[];

  /**
   * Directed explanations of how organizational entities
   * influence one another.
   */
  causalRelationships: OrganizationalCausalRelationship[];

  /**
   * Discovery's overall confidence in the causal model.
   */
  confidence: number;

  /**
   * Executive summary of how the organization currently works.
   */
  summary: string;

  /**
   * When this causal model was generated.
   */
  generatedAt: string;
};