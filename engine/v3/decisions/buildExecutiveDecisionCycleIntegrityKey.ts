import {
  createHash,
} from "node:crypto";

import type {
  ExecutiveDecisionCycle,
} from "./runExecutiveDecisionCycle";

/**
 * Recursively converts a value into a deterministic JSON-compatible shape.
 *
 * Object keys are sorted alphabetically at every level.
 * Array order is preserved because order is semantically meaningful for
 * ranked scenarios, generated options, evaluations, and recommendations.
 */
function canonicalize(
  value: unknown,
): unknown {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(
      (item) =>
        canonicalize(
          item,
        ),
    );
  }

  const record =
    value as
      Record<string, unknown>;

  return Object.keys(
    record,
  )
    .sort()
    .reduce<
      Record<string, unknown>
    >(
      (
        canonical,
        key,
      ) => {
        const item =
          record[key];

        /**
         * Match JSON.stringify semantics by omitting undefined object
         * properties while preserving null, false, zero, and empty values.
         */
        if (
          item !== undefined
        ) {
          canonical[key] =
            canonicalize(
              item,
            );
        }

        return canonical;
      },
      {},
    );
}

/**
 * Builds a deterministic integrity key for the complete canonical
 * Executive Decision Cycle.
 *
 * The key changes whenever any serialized part of the cycle changes,
 * including:
 *
 * - executive decision inputs,
 * - optimization objective,
 * - generated options,
 * - viability and causal evaluations,
 * - simulated scenarios,
 * - comparison and ranking,
 * - confidence calibration,
 * - recommendation,
 * - or completion timestamp.
 *
 * This function performs no mutation and no independent reasoning.
 */
export function buildExecutiveDecisionCycleIntegrityKey(
  decisionCycle:
    ExecutiveDecisionCycle,
): string {
  const canonicalCycle =
    canonicalize(
      decisionCycle,
    );

  const serialized =
    JSON.stringify(
      canonicalCycle,
    );

  return createHash(
    "sha256",
  )
    .update(
      serialized,
      "utf8",
    )
    .digest(
      "hex",
    );
}
