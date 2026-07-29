import type { InvestigationOpportunity } from "../../../engine/v3/model/investigation/buildInvestigationOpportunities";
import type {
  AlphaAllowlistDisclosureResolution,
  VerifiedConsumerIdentity,
} from "../../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import {
  ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION,
  compileOrganizationalUnderstandingProjection,
  type OrganizationalUnderstandingProjection,
  type CanonicalEvolutionReference,
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

type PersistedLearningEvent = {
  id: string;
  timestamp: string;
  objectType: string;
  objectId: string;
  changeType: string;
  reason: string;
};

const meaningfulChangeTypes = new Set([
  "new",
  "strengthening",
  "strengthened",
  "weakening",
  "weakened",
  "contradicted",
  "retired",
  "merged",
  "resolved",
  "unresolved",
]);

export function buildActivatedEvolutionCandidates(
  runtime: OrganizationRuntime,
): CanonicalEvolutionReference[] {
  const memory = runtime.memory as unknown as {
    learningEvents?: PersistedLearningEvent[];
  };
  const explanationsById = new Map(
    runtime.memory.organizationalExplanations.map((explanation) => [
      explanation.id,
      explanation,
    ]),
  );
  const events = (memory.learningEvents ?? [])
    .filter(
      (event) =>
        (event.objectType === "belief" || event.objectType === "theory") &&
        meaningfulChangeTypes.has(event.changeType) &&
        event.timestamp.trim().length > 0,
    )
    .sort((left, right) =>
      `${left.timestamp}\0${left.id}`.localeCompare(
        `${right.timestamp}\0${right.id}`,
      ),
    );
  const candidates: CanonicalEvolutionReference[] = [];

  for (
    const composition of
      runtime.memory.organizationalUnderstandingState.canonicalCompositions ??
      []
  ) {
    if (!composition.previousRevisionId) {
      continue;
    }
    const explanations = composition.explanationIds.flatMap(
      (id) => explanationsById.get(id) ?? [],
    );
    const linkedEvents = events.filter(
      (event) =>
        event.timestamp === composition.updatedAt &&
        explanations.some((explanation) =>
          event.objectType === "belief"
            ? explanation.beliefIds.includes(event.objectId)
            : explanation.theoryIds.includes(event.objectId),
        ),
    );
    const supportingRefs = [
      {
        objectType: "organizational-understanding" as const,
        objectId: composition.id,
        revisionId: composition.revisionId,
      },
      ...explanations.map((explanation) => ({
        objectType: "organizational-explanation" as const,
        objectId: explanation.id,
      })),
    ];

    for (const event of linkedEvents) {
      candidates.push({
        id: `organizational-evolution:${encodeURIComponent(
          JSON.stringify([composition.id, event.id]),
        )}`,
        organizationId: composition.organizationId,
        occurredAt: event.timestamp,
        objectType: "organizational-understanding",
        objectId: composition.id,
        revisionId: composition.revisionId,
        previousRevisionId: composition.previousRevisionId,
        changeType: event.changeType as
          CanonicalEvolutionReference["changeType"],
        ...(event.reason.trim() ? { reason: event.reason.trim() } : {}),
        supportingRefs,
      });
    }

    if (composition.previousRevisionId && linkedEvents.length === 0) {
      candidates.push({
        id: `organizational-evolution:${encodeURIComponent(
          JSON.stringify([composition.id, composition.revisionId]),
        )}`,
        organizationId: composition.organizationId,
        occurredAt: composition.updatedAt,
        objectType: "organizational-understanding",
        objectId: composition.id,
        revisionId: composition.revisionId,
        previousRevisionId: composition.previousRevisionId,
        changeType: "revised",
        supportingRefs,
      });
    }
  }

  return candidates;
}

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
      primaryJudgment?: {
        dominantConditionId?: string;
        supportingConditionIds?: string[];
      };
    };
  };
  const judgment = memory.executiveAssessment?.primaryJudgment;
  const prioritizedConditionIds = [
    ...(judgment?.dominantConditionId
      ? [judgment.dominantConditionId]
      : []),
    ...(judgment?.supportingConditionIds ?? []),
  ];
  return prioritizedConditionIds.flatMap((conditionId, rank) => {
    const condition = projection.conditions.find(
      (candidate) => candidate.id === conditionId,
    );
    return condition
      ? [{
          signalId: `alpha-executive-priority:${encodeURIComponent(
            JSON.stringify([
              projection.disclosureDecisionId,
              condition.id,
            ]),
          )}`,
          subjectRef: { ...condition.canonicalRef },
          producer: "executive_priority" as const,
          objective: "preserve-existing-executive-priority",
          rank,
          generatedAt: resolvedAt,
          supportingRefs: condition.supportingRefs.map((reference) => ({
            ...reference,
          })),
        }]
      : [];
  });
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
    evolution: buildActivatedEvolutionCandidates(runtime),
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
