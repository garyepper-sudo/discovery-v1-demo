import type {
  OrganizationalInfluenceChange,
  OrganizationalInfluencePropagationResult,
} from "./propagateOrganizationalInfluence";

export type AggregatedInfluenceSource =
  | "direct"
  | "indirect"
  | "direct-and-indirect";

export type AggregatedOrganizationalInfluence = {
  /**
   * Organizational entity receiving the combined effect.
   */
  entityId: string;

  /**
   * Final bounded change between -1 and 1.
   */
  delta: number;

  /**
   * Whether the entity was changed directly,
   * indirectly, or through both pathways.
   */
  sourceType: AggregatedInfluenceSource;

  /**
   * Direct effects applied to the entity.
   */
  directChanges: OrganizationalInfluenceChange[];

  /**
   * Indirect propagated effects applied to the entity.
   */
  indirectChanges: OrganizationalInfluenceChange[];

  /**
   * All causal explanations contributing to the result.
   */
  explanations: string[];

  /**
   * Relationships contributing indirect effects.
   */
  relationshipIds: string[];

  /**
   * Strongest causal depth that contributed to the entity.
   */
  maximumDepth: number;
};

export type AggregateOrganizationalInfluenceInput = {
  propagationResults: OrganizationalInfluencePropagationResult[];
};

function clampSigned(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

/**
 * Combines multiple signed effects without allowing simple
 * addition to exceed the normalized range.
 *
 * Example:
 *
 * +0.20 direct
 * +0.088 indirect
 *
 * becomes:
 *
 * 1 - (1 - 0.20) * (1 - 0.088)
 *
 * rather than:
 *
 * 0.20 + 0.088
 */
function combineSameDirection(
  values: number[],
): number {
  if (values.length === 0) {
    return 0;
  }

  const sign =
    values[0]! >= 0 ? 1 : -1;

  const combinedMagnitude =
    1 -
    values.reduce(
      (remaining, value) =>
        remaining *
        (1 - Math.abs(clampSigned(value))),
      1,
    );

  return clampSigned(
    sign * combinedMagnitude,
  );
}

function combineSignedEffects(
  values: number[],
): number {
  const positive = values.filter(
    (value) => value > 0,
  );

  const negative = values.filter(
    (value) => value < 0,
  );

  const positiveCombined =
    combineSameDirection(positive);

  const negativeCombined =
    combineSameDirection(negative);

  return clampSigned(
    positiveCombined +
      negativeCombined,
  );
}

function unique(values: string[]): string[] {
  return Array.from(
    new Set(
      values.filter(Boolean),
    ),
  );
}

export function aggregateOrganizationalInfluence({
  propagationResults,
}: AggregateOrganizationalInfluenceInput): AggregatedOrganizationalInfluence[] {
  const changesByEntity =
    new Map<
      string,
      OrganizationalInfluenceChange[]
    >();

  for (const result of propagationResults) {
    for (const change of result.changes) {
      const existing =
        changesByEntity.get(change.entityId) ??
        [];

      existing.push(change);

      changesByEntity.set(
        change.entityId,
        existing,
      );
    }
  }

  return Array.from(
    changesByEntity.entries(),
  )
    .map(([entityId, changes]) => {
      const directChanges =
        changes.filter(
          (change) =>
            change.depth === 0,
        );

      const indirectChanges =
        changes.filter(
          (change) =>
            change.depth > 0,
        );

      const sourceType: AggregatedInfluenceSource =
        directChanges.length > 0 &&
        indirectChanges.length > 0
          ? "direct-and-indirect"
          : directChanges.length > 0
            ? "direct"
            : "indirect";

      return {
        entityId,

        delta:
          combineSignedEffects(
            changes.map(
              (change) => change.delta,
            ),
          ),

        sourceType,

        directChanges,

        indirectChanges,

        explanations:
          unique(
            changes.map(
              (change) =>
                change.explanation,
            ),
          ),

        relationshipIds:
          unique(
            changes
              .map(
                (change) =>
                  change.relationshipId,
              )
              .filter(
                (
                  relationshipId,
                ): relationshipId is string =>
                  relationshipId !== undefined,
              ),
          ),

        maximumDepth:
          changes.reduce(
            (maximum, change) =>
              Math.max(
                maximum,
                change.depth,
              ),
            0,
          ),
      };
    })
    .sort(
      (left, right) =>
        Math.abs(right.delta) -
        Math.abs(left.delta),
    );
}