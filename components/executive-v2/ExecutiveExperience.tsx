"use client";

import ExecutiveWorkspace from "../executive-v3/ExecutiveWorkspace";

import {
  synthesizeExecutiveCommunication,
} from "../../engine/v3/communication/synthesizeExecutiveCommunication";

import type {
  ExecutiveProjection,
} from "./projection/ExecutiveProjection";

type ExecutiveExperienceProps = {
  projection: ExecutiveProjection;

  /**
   * Stable organization identity used by the canonical
   * Executive Communication producer.
   */
  organizationId?: string;

  /**
   * Preserved for compatibility with existing callers.
   */
  defaultDecisionConditionId?: string;
};

/**
 * Compatibility boundary between the existing Executive Projection
 * and the canonical Executive Communication Operating System.
 *
 * The V3 workspace receives only the communication product. It does not
 * interpret the larger Executive Projection or synthesize executive language.
 */
export default function ExecutiveExperience({
  projection,
  organizationId = "default-organization",
}: ExecutiveExperienceProps) {
  const communication =
    synthesizeExecutiveCommunication({
      projection,
      organizationId,
    });

  return (
    <ExecutiveWorkspace
      communication={communication}
    />
  );
}