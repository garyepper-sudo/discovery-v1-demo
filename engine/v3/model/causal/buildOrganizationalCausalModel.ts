import type { OrganizationalBelief } from "../beliefs/organizationalBeliefs";
import type { OrganizationalMechanism } from "../judgment/organizationalMechanism";
import type { OrganizationalTheory } from "../memory/organizationalTheories";
import type { OrganizationalCondition } from "../state/inferOrganizationalConditions";
import type {
  OrganizationalCausalEntity,
  OrganizationalCausalModel,
  OrganizationalCausalRelationship,
} from "./organizationalCausalModel";

export type BuildOrganizationalCausalModelInput = {
  organizationId: string;

  conditions: OrganizationalCondition[];

  beliefs: OrganizationalBelief[];

  mechanisms: OrganizationalMechanism[];

  theories: OrganizationalTheory[];

  generatedAt?: string;
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0,
    ) / values.length
  );
}

function buildConditionEntities(
  conditions: OrganizationalCondition[],
): OrganizationalCausalEntity[] {
  return conditions.map((condition) => ({
    id: condition.id,
    type: "condition",
    label: condition.name,
    status: condition.status,
    confidence: clamp01(condition.confidence),
  }));
}

function buildBeliefEntities(
  beliefs: OrganizationalBelief[],
): OrganizationalCausalEntity[] {
  return beliefs.map((belief) => ({
    id: belief.id,
    type: "belief",
    label: belief.statement,
    status: belief.trend,
    confidence: clamp01(belief.confidence),
  }));
}

function buildMechanismEntities(
  mechanisms: OrganizationalMechanism[],
): OrganizationalCausalEntity[] {
  return mechanisms.map((mechanism) => ({
    id: mechanism.id,
    type: "mechanism",
    label:
      mechanism.executiveName ||
      mechanism.title ||
      mechanism.id,
    status: mechanism.stability,
    confidence: clamp01(mechanism.confidence),
  }));
}

function buildTheoryEntities(
  theories: OrganizationalTheory[],
): OrganizationalCausalEntity[] {
  return theories.map((theory) => ({
    id: theory.id,
    type: "theory",
    label: theory.title,
    status: theory.status,
    confidence: clamp01(theory.confidence),
  }));
}

function buildConditionRelationships(
  conditions: OrganizationalCondition[],
): OrganizationalCausalRelationship[] {
  const relationships: OrganizationalCausalRelationship[] = [];

  for (const condition of conditions) {
    for (
      const downstreamConditionId of
      condition.downstreamConditionIds ?? []
    ) {
      relationships.push({
        id:
          `causal-${condition.id}-${downstreamConditionId}`,

        sourceEntityId:
          condition.id,

        targetEntityId:
          downstreamConditionId,

        /**
         * Conditions are modeled as organizational constraints.
         *
         * A positive simulation delta means the source constraint weakens.
         * Weakening an upstream constraint should generally improve the
         * connected downstream condition.
         *
         * Relationship direction therefore describes the stable structural
         * relationship between conditions and must not change based on the
         * source condition's current status.
         */
        direction:
          "enables",

        strength:
          clamp01(
            condition.strength,
          ),

        confidence:
          clamp01(
            condition.confidence,
          ),

        explanation:
          `Improvement in ${condition.name} is expected to improve the connected downstream organizational condition because Discovery has explicitly modeled it as an upstream influence.`,

        supportingMechanismIds:
          condition.supportingMechanismIds ??
          [],

        supportingTheoryIds:
          condition.supportingTheoryIds ??
          [],

        supportingBeliefIds:
          condition.supportingBeliefIds ??
          [],

        supportingEvidenceIds:
          [],
      });
    }
  }

  return relationships;
}

export function buildOrganizationalCausalModel(
  input: BuildOrganizationalCausalModelInput,
): OrganizationalCausalModel {
  const generatedAt =
    input.generatedAt ??
    new Date().toISOString();

  const organizationalEntities = [
    ...buildConditionEntities(input.conditions),
    ...buildBeliefEntities(input.beliefs),
    ...buildMechanismEntities(input.mechanisms),
    ...buildTheoryEntities(input.theories),
  ];

  const causalRelationships =
    buildConditionRelationships(input.conditions);

  const modelConfidence = clamp01(
    average(
      causalRelationships.map(
        (relationship) =>
          relationship.confidence,
      ),
    ),
  );

  return {
    id:
      `causal-model-${input.organizationId}-${generatedAt}`,

    organizationId:
      input.organizationId,

    organizationalEntities,

    causalRelationships,

    confidence:
      modelConfidence,

    summary:
      causalRelationships.length > 0
        ? `Discovery currently models ${causalRelationships.length} directed organizational influence relationships across ${organizationalEntities.length} organizational entities.`
        : "Discovery has not yet identified enough connected organizational relationships to form a meaningful causal model.",

    generatedAt,
  };
}