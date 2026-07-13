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

import type { ExecutiveCapabilityId } from "./ExecutiveCapabilityRegistry";

export type ExecutiveCapabilityRenderer = {
  capabilityId: ExecutiveCapabilityId;
  projectionKey: keyof ExecutiveProjection;
  render: (projection: ExecutiveProjection) => ReactNode;
};

export const executiveCapabilityRendererRegistry: ExecutiveCapabilityRenderer[] =
  [
    {
      capabilityId: "CAP-UND-005",
      projectionKey: "executiveAssessment",
      render: (projection) =>
        projection.executiveAssessment ? (
          <ExecutiveAssessmentCard
            assessment={projection.executiveAssessment}
          />
        ) : null,
    },

    {
      capabilityId: "CAP-UND-004",
      projectionKey: "organizationalState",
      render: (projection) =>
        projection.organizationalState ? (
          <OrganizationalStateCard
            state={projection.organizationalState}
          />
        ) : null,
    },

    {
      capabilityId: "CAP-UND-004",
      projectionKey: "organizationalConditions",
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
      projectionKey: "organizationalConcepts",
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
      projectionKey: "organizationalBeliefs",
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
      projectionKey: "investigationOpportunities",
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
      projectionKey: "organizationalLearningProfile",
      render: (projection) =>
        projection.organizationalLearningProfile ? (
          <ExecutiveLearningProfile
            profile={projection.organizationalLearningProfile}
          />
        ) : null,
    },

    {
      capabilityId: "CAP-SIM-001",
      projectionKey: "simulation",
      render: (projection) =>
        projection.simulation ? (
          <ExecutiveSimulation
            simulation={projection.simulation}
          />
        ) : null,
    },
  ];

export function getExecutiveCapabilityRenderer(
  capabilityId: ExecutiveCapabilityId,
  projectionKey: keyof ExecutiveProjection,
): ExecutiveCapabilityRenderer | undefined {
  return executiveCapabilityRendererRegistry.find(
    (renderer) =>
      renderer.capabilityId === capabilityId &&
      renderer.projectionKey === projectionKey,
  );
}