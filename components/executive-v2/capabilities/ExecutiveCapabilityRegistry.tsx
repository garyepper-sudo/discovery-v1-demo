import type { ReactNode } from "react";

import ExecutiveAssessmentCard from "../assessment/ExecutiveAssessmentCard";
import ExecutiveBeliefs from "../beliefs/ExecutiveBeliefs";
import ExecutiveConditions from "../conditions/ExecutiveConditions";
import ExecutiveConcepts from "../concepts/ExecutiveConcepts";
import ExecutiveInvestigationOpportunities from "../investigations/ExecutiveInvestigationOpportunities";
import ExecutiveLearningProfile from "../learning/ExecutiveLearningProfile";
import type { ExecutiveProjection } from "../projection/ExecutiveProjection";
import ExecutiveSimulation from "../simulation/ExecutiveSimulation";
import OrganizationalStateCard from "../state/OrganizationalStateCard";

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

export type ExecutiveCapabilitySurface = {
  /**
   * Canonical capability identity from the Cognitive Capability Registry.
   */
  capabilityId: ExecutiveCapabilityId;

  /**
   * Human-readable capability name.
   */
  name: string;

  /**
   * Display order inside the Executive Workspace.
   */
  order: number;

  /**
   * Executive Projection field that supplies the capability.
   */
  projectionKey: keyof ExecutiveProjection;

  /**
   * Determines whether the capability currently has
   * executive-facing data.
   */
  hasData: (projection: ExecutiveProjection) => boolean;

  /**
   * Renders the capability using data already prepared by
   * the Executive Projection.
   */
  render: (projection: ExecutiveProjection) => ReactNode;
};

export const executiveCapabilityRegistry: ExecutiveCapabilitySurface[] = [
  {
    capabilityId: "CAP-UND-005",
    name: "Executive Assessment",
    order: 10,
    projectionKey: "executiveAssessment",
    hasData: (projection) =>
      projection.executiveAssessment !== undefined,
    render: (projection) =>
      projection.executiveAssessment ? (
        <ExecutiveAssessmentCard
          assessment={projection.executiveAssessment}
        />
      ) : null,
  },

  {
    capabilityId: "CAP-UND-004",
    name: "Organizational State",
    order: 20,
    projectionKey: "organizationalState",
    hasData: (projection) =>
      projection.organizationalState !== undefined,
    render: (projection) =>
      projection.organizationalState ? (
        <OrganizationalStateCard
          state={projection.organizationalState}
        />
      ) : null,
  },

  {
    capabilityId: "CAP-UND-004",
    name: "Organizational Conditions",
    order: 30,
    projectionKey: "organizationalConditions",
    hasData: (projection) =>
      (projection.organizationalConditions?.length ?? 0) > 0,
    render: (projection) =>
      projection.organizationalConditions &&
      projection.organizationalConditions.length > 0 ? (
        <ExecutiveConditions
          conditions={projection.organizationalConditions}
        />
      ) : null,
  },

  {
    capabilityId: "CAP-ABS-001",
    name: "Organizational Concepts",
    order: 40,
    projectionKey: "organizationalConcepts",
    hasData: (projection) =>
      (projection.organizationalConcepts?.length ?? 0) > 0,
    render: (projection) =>
      projection.organizationalConcepts &&
      projection.organizationalConcepts.length > 0 ? (
        <ExecutiveConcepts
          concepts={projection.organizationalConcepts}
        />
      ) : null,
  },

  {
    capabilityId: "CAP-UND-002",
    name: "Organizational Beliefs",
    order: 50,
    projectionKey: "organizationalBeliefs",
    hasData: (projection) =>
      (projection.organizationalBeliefs?.length ?? 0) > 0,
    render: (projection) =>
      projection.organizationalBeliefs &&
      projection.organizationalBeliefs.length > 0 ? (
        <ExecutiveBeliefs
          beliefs={projection.organizationalBeliefs}
        />
      ) : null,
  },

  {
    capabilityId: "CAP-SELF-002",
    name: "Investigation Opportunities",
    order: 60,
    projectionKey: "investigationOpportunities",
    hasData: (projection) =>
      (projection.investigationOpportunities?.length ?? 0) > 0,
    render: (projection) =>
      projection.investigationOpportunities &&
      projection.investigationOpportunities.length > 0 ? (
        <ExecutiveInvestigationOpportunities
          opportunities={projection.investigationOpportunities}
        />
      ) : null,
  },

  {
    capabilityId: "CAP-LRN-002",
    name: "Learning Profile",
    order: 70,
    projectionKey: "organizationalLearningProfile",
    hasData: (projection) =>
      projection.organizationalLearningProfile !== undefined,
    render: (projection) =>
      projection.organizationalLearningProfile ? (
        <ExecutiveLearningProfile
          profile={projection.organizationalLearningProfile}
        />
      ) : null,
  },

  {
    capabilityId: "CAP-SIM-001",
    name: "Organizational Simulation",
    order: 90,
    projectionKey: "simulation",
    hasData: (projection) =>
      projection.simulation !== undefined,
    render: (projection) =>
      projection.simulation ? (
        <ExecutiveSimulation
          simulation={projection.simulation}
        />
      ) : null,
  },
];

export function getVisibleExecutiveCapabilities(
  projection: ExecutiveProjection,
): ExecutiveCapabilitySurface[] {
  return executiveCapabilityRegistry
    .filter((capability) => capability.hasData(projection))
    .sort((left, right) => left.order - right.order);
}