import type { ReactNode } from "react";

import type { ExecutiveProjection } from "../projection/ExecutiveProjection";

export type ExecutiveCapabilityId =
  | "CAP-UND-002"
  | "CAP-UND-004"
  | "CAP-UND-005"
  | "CAP-UND-006"
  | "CAP-LRN-002"
  | "CAP-ABS-001"
  | "CAP-SELF-001"
  | "CAP-SELF-002"
  | "CAP-ADP-001"
  | "CAP-SIM-001";

export type ExecutiveCapabilityCategory =
  | "understanding"
  | "learning"
  | "prediction"
  | "simulation"
  | "self-direction";

export type ExecutiveCapabilityDefinition = {
  /**
   * Canonical capability identity from Discovery's
   * Cognitive Capability Registry.
   */
  capabilityId: ExecutiveCapabilityId;

  /**
   * Human-readable executive capability name.
   */
  name: string;

  /**
   * Executive Workspace grouping.
   */
  category: ExecutiveCapabilityCategory;

  /**
   * Display order inside the Executive Workspace.
   */
  order: number;

  /**
   * Executive Projection field supplying this capability.
   */
  projectionKey: keyof ExecutiveProjection;

  /**
   * Determines whether executive-facing data exists.
   */
  hasData: (projection: ExecutiveProjection) => boolean;

  /**
   * Renders the executive-facing capability surface.
   */
  render: (projection: ExecutiveProjection) => ReactNode;
};