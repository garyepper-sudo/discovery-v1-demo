import type { InvestigationOpportunity } from "../../../engine/v3/model/investigation/buildInvestigationOpportunities";
import type {
  AlphaAllowlistDisclosureResolution,
  VerifiedConsumerIdentity,
} from "../../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import {
  ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION,
  compileOrganizationalUnderstandingProjection,
  type OrganizationalUnderstandingProjection,
} from "../../../engine/v3/projection/organizationalUnderstandingProjection";
import {
  ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
  PRODUCT_COMMUNICATION_CONTRACT_VERSION,
  compileProductCommunicationPlan,
  type UpstreamPrioritySignal,
} from "../../../engine/v3/communication/productCommunicationPlan";
import type { OrganizationRuntime } from "../../../engine/v3/runtime";
import { buildYourOrganizationCommunicationView } from "./buildYourOrganizationCommunicationView";
import { buildActivatedYourOrganizationView } from "./buildActivatedYourOrganizationView";

export type ActivatedYourOrganizationState =
  | {
      status: "available";
      runtime: OrganizationRuntime;
      projection: OrganizationalUnderstandingProjection;
      communicationPlanId: string;
      communicationViewId: string;
      disclosureDecisionId: string;
      view: ReturnType<typeof buildActivatedYourOrganizationView>;
    }
  | {
      status:
        | "authentication-required"
        | "organization-required"
        | "access-denied"
        | "runtime-unavailable"
        | "projection-unavailable"
        | "communication-unavailable"
        | "activation-unavailable";
      reason: string;
    };

function prioritySignals(
  runtime: OrganizationRuntime,
  projection: OrganizationalUnderstandingProjection,
  resolvedAt: string,
): UpstreamPrioritySignal[] {
  const memory = runtime.memory as unknown as {
    executiveAssessment?: {
      primaryJudgment?: { dominantConditionId?: string };
    };
  };
  const dominantConditionId =
    memory.executiveAssessment?.primaryJudgment?.dominantConditionId;
  if (!dominantConditionId) return [];
  const condition = projection.conditions.find(
    (candidate) => candidate.id === dominantConditionId,
  );
  if (!condition) return [];
  return [{
    signalId: `alpha-executive-priority:${encodeURIComponent(
      JSON.stringify([
        projection.disclosureDecisionId,
        condition.id,
      ]),
    )}`,
    subjectRef: { ...condition.canonicalRef },
    producer: "executive_priority",
    objective: "preserve-existing-executive-priority",
    generatedAt: resolvedAt,
    supportingRefs: condition.supportingRefs.map((reference) => ({
      ...reference,
    })),
  }];
}

export function composeActivatedYourOrganization(input: {
  runtime: OrganizationRuntime;
  identity: VerifiedConsumerIdentity;
  resolution: AlphaAllowlistDisclosureResolution;
  resolvedAt: string;
}): ActivatedYourOrganizationState {
  const { runtime, identity, resolution, resolvedAt } = input;
  const extendedMemory = runtime.memory as unknown as {
    investigationOpportunities?: InvestigationOpportunity[];
  };
  const projection = compileOrganizationalUnderstandingProjection({
    context: {
      organizationId: runtime.metadata.organizationId,
      consumerId: identity.consumerId,
      experience: "organization",
      generatedAt: resolvedAt,
      contractVersion: ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION,
    },
    disclosure: resolution.disclosure,
    compositions:
      runtime.memory.organizationalUnderstandingState.canonicalCompositions ??
      [],
    explanations: runtime.memory.organizationalExplanations,
    conditions: runtime.memory.organizationalConditions,
    ...(runtime.memory.organizationalState
      ? { organizationalState: runtime.memory.organizationalState }
      : {}),
    ...(runtime.memory.organizationalUncertainty
      ? { uncertainty: runtime.memory.organizationalUncertainty }
      : {}),
    investigations: extendedMemory.investigationOpportunities ?? [],
    evolution: [],
  });
  const projectionState = projection.availability.find(
    (entry) => entry.area === "projection",
  )?.state;
  if (
    projectionState !== "available-with-content" ||
    projection.understandings.length === 0
  ) {
    return {
      status: "projection-unavailable",
      reason: projectionState ?? "projection-state-missing",
    };
  }

  const plan = compileProductCommunicationPlan(
    {
      context: {
        organizationId: runtime.metadata.organizationId,
        consumerId: identity.consumerId,
        experience: "organization",
        generatedAt: resolvedAt,
        contractVersion: PRODUCT_COMMUNICATION_CONTRACT_VERSION,
      },
      projection,
      prioritySignals: prioritySignals(runtime, projection, resolvedAt),
    },
    ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
  );
  const communication = buildYourOrganizationCommunicationView({ plan });
  if (!communication.headline.sourceText?.text.trim()) {
    return {
      status: "communication-unavailable",
      reason: communication.headline.availability.state,
    };
  }

  return {
    status: "available",
    runtime,
    projection,
    communicationPlanId: plan.planId,
    communicationViewId: communication.viewId,
    disclosureDecisionId: resolution.decision.id,
    view: buildActivatedYourOrganizationView({
      runtime,
      projection,
      communication,
    }),
  };
}
