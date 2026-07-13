import type {
  OrganizationalCausalModel,
  OrganizationalCausalEntity,
} from "../causal/organizationalCausalModel";
import type { OrganizationalCondition } from "../state/inferOrganizationalConditions";
import type { OrganizationalIntervention } from "./organizationalIntervention";

export type InterventionCausalChange = {
  /**
   * Organizational entity directly changed by the intervention.
   */
  entityId: string;

  /**
   * Signed normalized change between -1 and 1.
   *
   * Positive means improvement or increase.
   * Negative means deterioration or decrease.
   */
  delta: number;

  /**
   * Discovery's confidence that the intervention directly
   * affects this entity.
   */
  confidence: number;

  /**
   * Executive-facing explanation of the mapping.
   */
  explanation: string;
};

export type MapInterventionToCausalChangesInput = {
  intervention: OrganizationalIntervention;

  causalModel: OrganizationalCausalModel;

  conditions: OrganizationalCondition[];
};

function clampSigned(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function findConditionEntity(
  causalModel: OrganizationalCausalModel,
  conditions: OrganizationalCondition[],
  conditionIdOrName: string,
): OrganizationalCausalEntity | undefined {
  const normalizedTarget =
    normalize(conditionIdOrName);

  const matchingCondition = conditions.find(
    (condition) =>
      normalize(condition.id) === normalizedTarget ||
      normalize(condition.name) === normalizedTarget,
  );

  if (!matchingCondition) {
    return undefined;
  }

  return causalModel.organizationalEntities.find(
    (entity) =>
      entity.type === "condition" &&
      entity.id === matchingCondition.id,
  );
}

function findConditionEntitiesByTerms(
  causalModel: OrganizationalCausalModel,
  terms: string[],
): OrganizationalCausalEntity[] {
  const normalizedTerms = terms.map(normalize);

  return causalModel.organizationalEntities.filter(
    (entity) => {
      if (entity.type !== "condition") {
        return false;
      }

      const normalizedId = normalize(entity.id);
      const normalizedLabel = normalize(entity.label);

      return normalizedTerms.some(
        (term) =>
          normalizedId.includes(term) ||
          normalizedLabel.includes(term),
      );
    },
  );
}

function getDefaultMapping(
  intervention: OrganizationalIntervention,
  causalModel: OrganizationalCausalModel,
): Array<{
  entity: OrganizationalCausalEntity;
  delta: number;
  explanation: string;
}> {
  const mapping: Array<{
    entity: OrganizationalCausalEntity;
    delta: number;
    explanation: string;
  }> = [];

  const addMatches = (
    terms: string[],
    delta: number,
    explanation: string,
  ) => {
    for (
      const entity of findConditionEntitiesByTerms(
        causalModel,
        terms,
      )
    ) {
      if (
        mapping.some(
          (existing) =>
            existing.entity.id === entity.id,
        )
      ) {
        continue;
      }

      mapping.push({
        entity,
        delta,
        explanation,
      });
    }
  };

  switch (intervention.type) {
    case "governance":
    case "policy":
      addMatches(
        [
          "decisionflow",
          "leadershipdependency",
          "operatingmodel",
        ],
        0.2,
        "Governance and policy interventions most directly affect decision rights, leadership dependency, and the operating model.",
      );
      break;

    case "hiring":
      addMatches(
        [
          "executioncapacity",
          "coordination",
          "knowledgecontinuity",
        ],
        0.15,
        "Hiring interventions may increase execution capacity while also affecting coordination and knowledge continuity.",
      );
      break;

    case "layoff":
      addMatches(
        [
          "executioncapacity",
          "knowledgecontinuity",
          "coordination",
        ],
        -0.2,
        "Layoff interventions may reduce execution capacity, weaken knowledge continuity, and increase coordination pressure.",
      );
      break;

    case "reorganization":
      addMatches(
        [
          "coordination",
          "operatingmodel",
          "strategicalignment",
          "decisionflow",
        ],
        0.12,
        "Reorganization interventions most directly affect coordination, operating structure, strategic alignment, and decision flow.",
      );
      break;

    case "budget":
      addMatches(
        [
          "executioncapacity",
          "resourceallocation",
          "strategicalignment",
        ],
        0.12,
        "Budget interventions directly affect available execution capacity, resource allocation, and strategic prioritization.",
      );
      break;

    case "technology":
      addMatches(
        [
          "executioncapacity",
          "knowledgecontinuity",
          "learning",
          "coordination",
        ],
        0.12,
        "Technology interventions may change execution throughput, knowledge continuity, organizational learning, and coordination.",
      );
      break;

    case "strategy":
      addMatches(
        [
          "strategicalignment",
          "executioncapacity",
          "coordination",
        ],
        0.15,
        "Strategic interventions most directly affect alignment, prioritization, coordination, and execution capacity.",
      );
      break;

    case "customer":
    case "market":
      addMatches(
        [
          "strategicalignment",
          "executioncapacity",
          "learning",
        ],
        0.1,
        "Customer and market interventions can change strategic alignment, execution priorities, and organizational learning requirements.",
      );
      break;

    case "custom":
      break;
  }

  return mapping;
}

export function mapInterventionToCausalChanges({
  intervention,
  causalModel,
  conditions,
}: MapInterventionToCausalChangesInput): InterventionCausalChange[] {
  const explicitChanges =
    intervention.affectedConditionIds
      .map((conditionId) => {
        const entity = findConditionEntity(
          causalModel,
          conditions,
          conditionId,
        );

        if (!entity) {
          return undefined;
        }

        return {
          entityId: entity.id,

          delta: clampSigned(0.2),

          confidence: clamp01(
            intervention.confidence,
          ),

          explanation:
            `The intervention explicitly identifies ${entity.label} as an affected organizational condition.`,
        };
      })
      .filter(
        (
          change,
        ): change is InterventionCausalChange =>
          change !== undefined,
      );

  if (explicitChanges.length > 0) {
    return explicitChanges;
  }

  return getDefaultMapping(
    intervention,
    causalModel,
  ).map(({ entity, delta, explanation }) => ({
    entityId:
      entity.id,

    delta:
      clampSigned(delta),

    confidence:
      clamp01(
        intervention.confidence * entity.confidence,
      ),

    explanation,
  }));
}