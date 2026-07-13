import type {
  OrganizationalCausalModel,
  OrganizationalCausalRelationship,
  OrganizationalInfluenceDirection,
} from "./organizationalCausalModel";

export type OrganizationalInfluenceChange = {
  /**
   * Organizational entity whose state changed.
   */
  entityId: string;

  /**
   * Signed normalized change between -1 and 1.
   */
  delta: number;

  /**
   * Depth from the original changed entity.
   */
  depth: number;

  /**
   * Causal relationship that produced this change.
   *
   * Undefined for the original source change.
   */
  relationshipId?: string;

  /**
   * Upstream entity that propagated this change.
   *
   * Undefined for the original source change.
   */
  sourceEntityId?: string;

  /**
   * Explanation of why this change occurred.
   */
  explanation: string;
};

export type OrganizationalInfluencePropagationResult = {
  /**
   * Original entity changed by an intervention or scenario.
   */
  sourceEntityId: string;

  /**
   * Original normalized change between -1 and 1.
   */
  sourceDelta: number;

  /**
   * All direct and indirect propagated effects.
   */
  changes: OrganizationalInfluenceChange[];

  /**
   * Relationships traversed during propagation.
   */
  traversedRelationshipIds: string[];

  /**
   * Maximum depth reached.
   */
  maxDepthReached: number;
};

export type PropagateOrganizationalInfluenceInput = {
  causalModel: OrganizationalCausalModel;

  /**
   * Entity directly changed by the intervention.
   */
  changedEntityId: string;

  /**
   * Signed normalized change between -1 and 1.
   *
   * Positive means improvement or increase.
   * Negative means deterioration or decrease.
   */
  delta: number;

  /**
   * Maximum number of downstream propagation steps.
   */
  maxDepth?: number;

  /**
   * Minimum absolute propagated effect retained.
   */
  minimumEffect?: number;
};

function clampSigned(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

function getDirectionMultiplier(
  direction: OrganizationalInfluenceDirection,
): number {
  switch (direction) {
    case "increases":
    case "enables":
    case "stabilizes":
      return 1;

    case "decreases":
    case "constrains":
    case "destabilizes":
      return -1;
  }
}

function calculatePropagatedDelta(
  sourceDelta: number,
  relationship: OrganizationalCausalRelationship,
): number {
  const directionMultiplier =
    getDirectionMultiplier(relationship.direction);

  return clampSigned(
    sourceDelta *
      directionMultiplier *
      relationship.strength *
      relationship.confidence,
  );
}

export function propagateOrganizationalInfluence({
  causalModel,
  changedEntityId,
  delta,
  maxDepth = 4,
  minimumEffect = 0.01,
}: PropagateOrganizationalInfluenceInput): OrganizationalInfluencePropagationResult {
  const sourceDelta = clampSigned(delta);

  const changes: OrganizationalInfluenceChange[] = [
    {
      entityId: changedEntityId,
      delta: sourceDelta,
      depth: 0,
      explanation:
        "This entity was directly changed by the organizational intervention or scenario.",
    },
  ];

  const traversedRelationshipIds = new Set<string>();
  const strongestKnownEffect = new Map<string, number>([
    [changedEntityId, Math.abs(sourceDelta)],
  ]);

  const queue: Array<{
    entityId: string;
    delta: number;
    depth: number;
  }> = [
    {
      entityId: changedEntityId,
      delta: sourceDelta,
      depth: 0,
    },
  ];

  let maxDepthReached = 0;

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || current.depth >= maxDepth) {
      continue;
    }

    const outgoingRelationships =
      causalModel.causalRelationships.filter(
        (relationship) =>
          relationship.sourceEntityId === current.entityId,
      );

    for (const relationship of outgoingRelationships) {
      const propagatedDelta =
        calculatePropagatedDelta(
          current.delta,
          relationship,
        );

      if (Math.abs(propagatedDelta) < minimumEffect) {
        continue;
      }

      const previousStrongestEffect =
        strongestKnownEffect.get(
          relationship.targetEntityId,
        ) ?? 0;

      if (
        Math.abs(propagatedDelta) <=
        previousStrongestEffect
      ) {
        continue;
      }

      const nextDepth = current.depth + 1;

      strongestKnownEffect.set(
        relationship.targetEntityId,
        Math.abs(propagatedDelta),
      );

      traversedRelationshipIds.add(
        relationship.id,
      );

      changes.push({
        entityId:
          relationship.targetEntityId,

        delta:
          propagatedDelta,

        depth:
          nextDepth,

        relationshipId:
          relationship.id,

        sourceEntityId:
          current.entityId,

        explanation:
          relationship.explanation,
      });

      queue.push({
        entityId:
          relationship.targetEntityId,

        delta:
          propagatedDelta,

        depth:
          nextDepth,
      });

      maxDepthReached = Math.max(
        maxDepthReached,
        nextDepth,
      );
    }
  }

  return {
    sourceEntityId:
      changedEntityId,

    sourceDelta,

    changes,

    traversedRelationshipIds:
      Array.from(traversedRelationshipIds),

    maxDepthReached,
  };
}