import type {
  OrganizationalExplanation,
} from "../model/judgment/organizationalJudgment";
import type {
  InvestigationOpportunity,
} from "../model/investigation/buildInvestigationOpportunities";
import type {
  OrganizationalUncertainty,
  OrganizationalUncertaintyDriver,
} from "../model/epistemic/organizationalUncertainty";
import type {
  OrganizationalCondition,
  OrganizationalState,
} from "../model/state/inferOrganizationalConditions";
import type {
  CanonicalUnderstandingComposition,
} from "../understanding/buildCanonicalUnderstandingCompatibilityShadow";
import type {
  OrganizationalUnderstandingDisclosureResult,
} from "../understanding/discloseCanonicalOrganizationalUnderstanding";

export const ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION = "1";

export type ProjectionExperience =
  | "organization"
  | "inquiry"
  | "research"
  | "decisions"
  | "communication";

export type ProjectionContext = {
  organizationId: string;
  consumerId: string;
  experience: ProjectionExperience;
  generatedAt: string;
  contractVersion: string;
};

export type CanonicalObjectReference = {
  objectType:
    | "organizational-understanding"
    | "organizational-explanation"
    | "evidence"
    | "reasoning-path"
    | "mechanism"
    | "belief"
    | "theory"
    | "contradiction"
    | "organizational-uncertainty"
    | "organizational-condition"
    | "organizational-state"
    | "investigation-opportunity"
    | "organizational-evolution";
  objectId: string;
  revisionId?: string;
};

export type CanonicalEvolutionReference = {
  id: string;
  organizationId: string;
  occurredAt: string;
  objectType: CanonicalObjectReference["objectType"];
  objectId: string;
  revisionId?: string;
  previousRevisionId?: string | null;
  changeType?:
    | "new"
    | "strengthening"
    | "strengthened"
    | "weakening"
    | "weakened"
    | "contradicted"
    | "retired"
    | "merged"
    | "resolved"
    | "revised"
    | "unresolved";
  reason?: string;
  supportingRefs: CanonicalObjectReference[];
};

export type ProjectionSource = {
  context: ProjectionContext;
  disclosure: OrganizationalUnderstandingDisclosureResult;
  compositions: CanonicalUnderstandingComposition[];
  explanations: OrganizationalExplanation[];
  conditions: OrganizationalCondition[];
  organizationalState?: OrganizationalState;
  uncertainty?: OrganizationalUncertainty;
  investigations: InvestigationOpportunity[];
  investigationsAvailable?: boolean;
  investigationPriorityRanks?: Record<string, number>;
  evolution: CanonicalEvolutionReference[];
};

export type ProjectionAvailabilityState =
  | "available-with-content"
  | "available-empty"
  | "runtime-data-unavailable"
  | "referenced-data-missing"
  | "withheld"
  | "revoked"
  | "organization-mismatch"
  | "consumer-mismatch"
  | "authority-receipt-invalid"
  | "historical-compatibility-unavailable";

export type ProjectionAvailabilityArea =
  | "projection"
  | "understanding"
  | "explanations"
  | "evidence"
  | "uncertainty"
  | "conditions"
  | "organizational-state"
  | "investigations"
  | "evolution";

export type ProjectionAvailability = {
  area: ProjectionAvailabilityArea;
  state: ProjectionAvailabilityState;
};

export type ProjectedReference<T> = {
  id: string;
  canonicalRef: CanonicalObjectReference;
  value: T;
  supportingRefs: CanonicalObjectReference[];
};

export type ProjectedEvidenceValue = {
  roles: Array<{
    explanationId: string;
    role: "supports" | "opposes" | "shared";
    basisKind:
      | "explanation-seed"
      | "evidence-relationship"
      | "shared-support";
    basisReferenceIds: string[];
    relatedExplanationIds: string[];
  }>;
  bodyAvailability: "runtime-data-unavailable";
};

export type ProjectedUncertaintyValue =
  | {
      owner: "organizational-understanding";
      disposition:
        CanonicalUnderstandingComposition["compositionUncertainty"][number];
    }
  | {
      owner: "organizational-explanation";
      explanationId: string;
      statement: string;
    }
  | {
      owner: "organizational-uncertainty";
      driver: OrganizationalUncertaintyDriver;
    };

export type ProjectionDepth = {
  summary: CanonicalObjectReference[];
  support: CanonicalObjectReference[];
  trace: CanonicalObjectReference[];
};

export type OrganizationalUnderstandingProjection = {
  projectionId: string;
  contractVersion: string;
  organizationId: string;
  consumerId: string;
  experience: ProjectionExperience;
  generatedAt: string;
  disclosureDecisionId: string;
  sourceRevisionIds: string[];
  understandings: Array<
    ProjectedReference<CanonicalUnderstandingComposition>
  >;
  explanations: Array<ProjectedReference<OrganizationalExplanation>>;
  evidence: Array<ProjectedReference<ProjectedEvidenceValue>>;
  uncertainty: Array<ProjectedReference<ProjectedUncertaintyValue>>;
  conditions: Array<ProjectedReference<OrganizationalCondition>>;
  organizationalState?: ProjectedReference<OrganizationalState>;
  investigations: Array<
    ProjectedReference<InvestigationOpportunity> & {
      priorityRank?: number;
    }
  >;
  evolution: Array<ProjectedReference<CanonicalEvolutionReference>>;
  availability: ProjectionAvailability[];
  depth: ProjectionDepth;
};

const compare = (left: string, right: string): number =>
  left.localeCompare(right);

function unique<T>(values: readonly T[], identity: (value: T) => string): T[] {
  const byIdentity = new Map<string, T>();
  for (const value of values) {
    const key = identity(value);
    if (!byIdentity.has(key)) {
      byIdentity.set(key, value);
    }
  }
  return [...byIdentity.entries()]
    .sort(([left], [right]) => compare(left, right))
    .map(([, value]) => value);
}

function referenceIdentity(reference: CanonicalObjectReference): string {
  return JSON.stringify([
    reference.objectType,
    reference.objectId,
    reference.revisionId ?? null,
  ]);
}

function normalizeReferences(
  references: readonly CanonicalObjectReference[],
): CanonicalObjectReference[] {
  return unique(references, referenceIdentity).map((reference) => ({
    ...reference,
  }));
}

function compositionReference(
  composition: CanonicalUnderstandingComposition,
): CanonicalObjectReference {
  return {
    objectType: "organizational-understanding",
    objectId: composition.id,
    revisionId: composition.currentEpistemicRevisionId ?? composition.revisionId,
  };
}

function explanationReference(
  explanationId: string,
): CanonicalObjectReference {
  return {
    objectType: "organizational-explanation",
    objectId: explanationId,
  };
}

function copyExplanation(
  explanation: OrganizationalExplanation,
  disclosedExplanationIds: ReadonlySet<string>,
): OrganizationalExplanation {
  const disclosedRoles = explanation.comparativeEvidenceRoles?.filter(
    (assignment) =>
      assignment.relatedExplanationIds.every((id) =>
        disclosedExplanationIds.has(id),
      ),
  );
  return {
    id: explanation.id,
    organizationId: explanation.organizationId,
    semanticKey: explanation.semanticKey,
    claim: structuredClone(explanation.claim),
    explanationSeedIds: [...explanation.explanationSeedIds],
    reasoningPathIds: [...explanation.reasoningPathIds],
    mechanismIds: [...explanation.mechanismIds],
    beliefIds: [...explanation.beliefIds],
    theoryIds: [...explanation.theoryIds],
    evidenceIds: [...explanation.evidenceIds],
    contradictionIds: [...explanation.contradictionIds],
    assumptions: [...explanation.assumptions],
    ...(disclosedRoles
      ? {
          comparativeEvidenceRoles: structuredClone(
            disclosedRoles,
          ),
        }
      : {}),
    viability: explanation.viability,
    uncertainty: [...explanation.uncertainty],
    createdAt: explanation.createdAt,
    updatedAt: explanation.updatedAt,
  };
}

function emptyProjection(
  source: ProjectionSource,
  state: ProjectionAvailabilityState,
): OrganizationalUnderstandingProjection {
  const availability: ProjectionAvailability[] = [
    "projection",
    "understanding",
    "explanations",
    "evidence",
    "uncertainty",
    "conditions",
    "organizational-state",
    "investigations",
    "evolution",
  ].map((area) => ({
    area: area as ProjectionAvailabilityArea,
    state,
  }));

  return {
    projectionId: `organizational-understanding-projection:${encodeURIComponent(
      JSON.stringify([
        source.context.contractVersion,
        source.context.organizationId,
        source.context.consumerId,
        source.context.experience,
        source.disclosure.decisionId,
        [],
      ]),
    )}`,
    contractVersion: source.context.contractVersion,
    organizationId: source.context.organizationId,
    consumerId: source.context.consumerId,
    experience: source.context.experience,
    generatedAt: source.context.generatedAt,
    disclosureDecisionId: source.disclosure.decisionId,
    sourceRevisionIds: [],
    understandings: [],
    explanations: [],
    evidence: [],
    uncertainty: [],
    conditions: [],
    investigations: [],
    evolution: [],
    availability,
    depth: {
      summary: [],
      support: [],
      trace: [],
    },
  };
}

function availability(
  area: ProjectionAvailabilityArea,
  count: number,
  emptyState: ProjectionAvailabilityState = "available-empty",
): ProjectionAvailability {
  return {
    area,
    state: count > 0 ? "available-with-content" : emptyState,
  };
}

function sameComposition(
  left: CanonicalUnderstandingComposition,
  right: CanonicalUnderstandingComposition,
): boolean {
  return (
    left.id === right.id &&
    left.revisionId === right.revisionId &&
    left.organizationId === right.organizationId
  );
}

/**
 * Pure, non-persistent projection of already-disclosed canonical
 * Organizational Understanding.
 *
 * The compiler resolves references and normalizes presentation-neutral source
 * order. It does not read Runtime, infer authority or disclosure, calculate
 * confidence, rank cognition, or synthesize language.
 */
export function compileOrganizationalUnderstandingProjection(
  source: ProjectionSource,
): OrganizationalUnderstandingProjection {
  const { context, disclosure } = source;

  if (
    disclosure.organizationId !== context.organizationId
  ) {
    return emptyProjection(source, "organization-mismatch");
  }
  if (disclosure.consumerId !== context.consumerId) {
    return emptyProjection(source, "consumer-mismatch");
  }
  if (!disclosure.decisionId) {
    return emptyProjection(source, "withheld");
  }
  if (disclosure.disposition === "revoked") {
    return emptyProjection(source, "revoked");
  }
  if (disclosure.disposition !== "eligible") {
    return emptyProjection(source, "withheld");
  }

  const sourceCompositions = new Map(
    source.compositions.map((composition) => [composition.id, composition]),
  );
  const disclosedCompositions = unique(
    disclosure.disclosedCompositions,
    (composition) => `${composition.id}\0${composition.revisionId}`,
  );
  const authorityInvalid = disclosedCompositions.some(
    (composition) =>
      composition.organizationId !== context.organizationId ||
      composition.authorityTransition?.disposition !==
        "authorized-organizational-knowledge",
  );
  if (authorityInvalid) {
    return emptyProjection(source, "authority-receipt-invalid");
  }

  const missingHistoricalSource = disclosedCompositions.some((composition) => {
    const candidate = sourceCompositions.get(composition.id);
    return !candidate || !sameComposition(candidate, composition);
  });
  if (missingHistoricalSource) {
    return emptyProjection(source, "historical-compatibility-unavailable");
  }

  const explanationsById = new Map(
    source.explanations
      .filter(
        (explanation) =>
          explanation.organizationId === context.organizationId,
      )
      .map((explanation) => [explanation.id, explanation]),
  );
  const disclosedExplanationIds = new Set(
    disclosedCompositions.flatMap((composition) => composition.explanationIds),
  );
  const resolvedExplanations = [...disclosedExplanationIds]
    .sort(compare)
    .flatMap((id) => {
      const explanation = explanationsById.get(id);
      return explanation ? [explanation] : [];
    });
  const missingExplanation =
    resolvedExplanations.length !== disclosedExplanationIds.size;

  const understandingReferences = disclosedCompositions.map(
    compositionReference,
  );
  const projectedUnderstandings = disclosedCompositions.map((composition) => ({
    id: composition.id,
    canonicalRef: compositionReference(composition),
    value: structuredClone(composition),
    supportingRefs: normalizeReferences(
      composition.explanationIds.map(explanationReference),
    ),
  }));

  const projectedExplanations = resolvedExplanations.map((explanation) => {
    const traceReferences: CanonicalObjectReference[] = [
      ...explanation.evidenceIds.map((objectId) => ({
        objectType: "evidence" as const,
        objectId,
      })),
      ...explanation.reasoningPathIds.map((objectId) => ({
        objectType: "reasoning-path" as const,
        objectId,
      })),
      ...explanation.mechanismIds.map((objectId) => ({
        objectType: "mechanism" as const,
        objectId,
      })),
      ...explanation.beliefIds.map((objectId) => ({
        objectType: "belief" as const,
        objectId,
      })),
      ...explanation.theoryIds.map((objectId) => ({
        objectType: "theory" as const,
        objectId,
      })),
      ...explanation.contradictionIds.map((objectId) => ({
        objectType: "contradiction" as const,
        objectId,
      })),
    ];
    return {
      id: explanation.id,
      canonicalRef: explanationReference(explanation.id),
      value: copyExplanation(explanation, disclosedExplanationIds),
      supportingRefs: normalizeReferences(traceReferences),
    };
  });

  const evidenceIds = [...new Set(
    resolvedExplanations.flatMap((explanation) => explanation.evidenceIds),
  )].sort(compare);
  const projectedEvidence = evidenceIds.map((evidenceId) => {
    const roles = resolvedExplanations
      .flatMap((explanation) =>
        (explanation.comparativeEvidenceRoles ?? [])
          .filter((assignment) => assignment.evidenceId === evidenceId)
          .filter((assignment) =>
            assignment.relatedExplanationIds.every((id) =>
              disclosedExplanationIds.has(id),
            ),
          )
          .map((assignment) => ({
            explanationId: explanation.id,
            role: assignment.role,
            basisKind: assignment.basis.kind,
            basisReferenceIds: [...assignment.basis.referenceIds].sort(compare),
            relatedExplanationIds: [...assignment.relatedExplanationIds].sort(
              compare,
            ),
          })),
      )
      .sort((left, right) =>
        JSON.stringify(left).localeCompare(JSON.stringify(right)),
      );
    return {
      id: evidenceId,
      canonicalRef: {
        objectType: "evidence" as const,
        objectId: evidenceId,
      },
      value: {
        roles,
        bodyAvailability: "runtime-data-unavailable" as const,
      },
      supportingRefs: normalizeReferences(
        roles.map((role) => explanationReference(role.explanationId)),
      ),
    };
  });

  const projectedUncertainty: Array<
    ProjectedReference<ProjectedUncertaintyValue>
  > = [];
  for (const composition of disclosedCompositions) {
    for (const disposition of [...composition.compositionUncertainty].sort(
      compare,
    )) {
      projectedUncertainty.push({
        id: `${composition.id}:uncertainty:${disposition}`,
        canonicalRef: compositionReference(composition),
        value: {
          owner: "organizational-understanding",
          disposition,
        },
        supportingRefs: composition.explanationIds.map(explanationReference),
      });
    }
  }
  for (const explanation of resolvedExplanations) {
    for (const statement of [...explanation.uncertainty].sort(compare)) {
      projectedUncertainty.push({
        id: `${explanation.id}:uncertainty:${encodeURIComponent(statement)}`,
        canonicalRef: explanationReference(explanation.id),
        value: {
          owner: "organizational-explanation",
          explanationId: explanation.id,
          statement,
        },
        supportingRefs: [],
      });
    }
  }
  if (
    source.uncertainty?.organizationId === context.organizationId
  ) {
    for (const driver of source.uncertainty.drivers) {
      const linkedIds = driver.sourceObjectIds.filter(
        (id) =>
          disclosedExplanationIds.has(id) ||
          disclosedCompositions.some((composition) => composition.id === id),
      );
      if (
        linkedIds.length === 0 ||
        linkedIds.length !== driver.sourceObjectIds.length
      ) {
        continue;
      }
      projectedUncertainty.push({
        id: `organizational-uncertainty:${driver.type}:${encodeURIComponent(
          JSON.stringify([...driver.sourceObjectIds].sort(compare)),
        )}`,
        canonicalRef: {
          objectType: "organizational-uncertainty",
          objectId: `organizational-uncertainty:${context.organizationId}`,
        },
        value: {
          owner: "organizational-uncertainty",
          driver: structuredClone(driver),
        },
        supportingRefs: normalizeReferences(
          linkedIds.map((objectId) =>
            disclosedExplanationIds.has(objectId)
              ? explanationReference(objectId)
              : {
                  objectType: "organizational-understanding",
                  objectId,
                },
          ),
        ),
      });
    }
  }

  const projectedConditions = source.conditions
    .filter((condition) => {
      const explanationIds = condition.supportingExplanationIds ?? [];
      return (
        explanationIds.length > 0 &&
        explanationIds.every((id) => disclosedExplanationIds.has(id))
      );
    })
    .sort((left, right) => compare(left.id, right.id))
    .map((condition) => ({
      id: condition.id,
      canonicalRef: {
        objectType: "organizational-condition" as const,
        objectId: condition.id,
      },
      value: structuredClone(condition),
      supportingRefs: normalizeReferences(
        (condition.supportingExplanationIds ?? [])
          .filter((id) => disclosedExplanationIds.has(id))
          .map(explanationReference),
      ),
    }));
  const disclosedConditionIds = new Set(
    projectedConditions.map((condition) => condition.id),
  );
  const disclosedConditionId = (identity: string): string | undefined => {
    if (disclosedConditionIds.has(identity)) return identity;
    const nameMatches = projectedConditions.filter(
      (condition) => condition.value.name === identity,
    );
    return nameMatches.length === 1 ? nameMatches[0]?.id : undefined;
  };

  const stateConditionIds = source.organizationalState
    ? [
      ...source.organizationalState.dominantConditions,
      ...source.organizationalState.improvingConditions,
      ...source.organizationalState.deterioratingConditions,
    ]
    : [];
  const projectedState =
    source.organizationalState &&
    stateConditionIds.length > 0 &&
    stateConditionIds.every((conditionId) =>
      disclosedConditionIds.has(conditionId),
    )
      ? {
          id: source.organizationalState.id,
          canonicalRef: {
            objectType: "organizational-state" as const,
            objectId: source.organizationalState.id,
          },
          value: structuredClone(source.organizationalState),
          supportingRefs: normalizeReferences(
            stateConditionIds
              .filter((id) => disclosedConditionIds.has(id))
              .map((objectId) => ({
                objectType: "organizational-condition" as const,
                objectId,
              })),
          ),
        }
      : undefined;

  const projectedInvestigations = source.investigations
    .map((investigation) => ({
      investigation,
      priorityRank: source.investigationPriorityRanks?.[investigation.id],
    }))
    .filter(
      ({ investigation }) =>
        investigation.affectedConditions.length > 0 &&
        investigation.affectedConditions.every((identity) =>
          Boolean(disclosedConditionId(identity)),
        ),
    )
    .sort((left, right) =>
      (left.priorityRank ?? Number.MAX_SAFE_INTEGER) -
        (right.priorityRank ?? Number.MAX_SAFE_INTEGER) ||
      compare(left.investigation.id, right.investigation.id),
    )
    .map(({ investigation, priorityRank }, fallbackRank) => ({
      id: investigation.id,
      priorityRank: priorityRank ?? fallbackRank,
      canonicalRef: {
        objectType: "investigation-opportunity" as const,
        objectId: investigation.id,
      },
      value: structuredClone(investigation),
      supportingRefs: normalizeReferences(
        investigation.affectedConditions
          .flatMap((identity) => disclosedConditionId(identity) ?? [])
          .map((objectId) => ({
            objectType: "organizational-condition" as const,
            objectId,
          })),
      ),
    }));

  const allowedReferenceIds = new Set([
    ...disclosedCompositions.map((composition) => composition.id),
    ...resolvedExplanations.map((explanation) => explanation.id),
    ...projectedConditions.map((condition) => condition.id),
    ...(projectedState ? [projectedState.id] : []),
    ...projectedInvestigations.map((investigation) => investigation.id),
  ]);
  const projectedEvolution = source.evolution
    .filter(
      (event) =>
        event.organizationId === context.organizationId &&
        event.supportingRefs.every((reference) =>
          allowedReferenceIds.has(reference.objectId),
        ) &&
        (allowedReferenceIds.has(event.objectId) ||
          event.supportingRefs.length > 0),
    )
    .sort((left, right) =>
      `${left.occurredAt}\0${left.id}`.localeCompare(
        `${right.occurredAt}\0${right.id}`,
      ),
    )
    .map((event) => ({
      id: event.id,
      canonicalRef: {
        objectType: "organizational-evolution" as const,
        objectId: event.id,
        ...(event.revisionId ? { revisionId: event.revisionId } : {}),
      },
      value: structuredClone(event),
      supportingRefs: normalizeReferences(event.supportingRefs),
    }));

  const supportReferences = normalizeReferences([
    ...projectedExplanations.map((item) => item.canonicalRef),
    ...projectedUncertainty.map((item) => item.canonicalRef),
    ...projectedConditions.map((item) => item.canonicalRef),
    ...(projectedState ? [projectedState.canonicalRef] : []),
    ...projectedInvestigations.map((item) => item.canonicalRef),
    ...projectedEvolution.map((item) => item.canonicalRef),
  ]);
  const traceReferences = normalizeReferences([
    ...projectedExplanations.flatMap((item) => item.supportingRefs),
    ...projectedEvidence.map((item) => item.canonicalRef),
  ]);
  const sourceRevisionIds = disclosedCompositions
    .map((composition) => composition.currentEpistemicRevisionId ?? composition.revisionId)
    .sort(compare);

  return {
    projectionId: `organizational-understanding-projection:${encodeURIComponent(
      JSON.stringify([
        context.contractVersion,
        context.organizationId,
        context.consumerId,
        context.experience,
        disclosure.decisionId,
        sourceRevisionIds,
      ]),
    )}`,
    contractVersion: context.contractVersion,
    organizationId: context.organizationId,
    consumerId: context.consumerId,
    experience: context.experience,
    generatedAt: context.generatedAt,
    disclosureDecisionId: disclosure.decisionId,
    sourceRevisionIds,
    understandings: projectedUnderstandings,
    explanations: projectedExplanations,
    evidence: projectedEvidence,
    uncertainty: unique(projectedUncertainty, (item) => item.id),
    conditions: projectedConditions,
    ...(projectedState ? { organizationalState: projectedState } : {}),
    investigations: projectedInvestigations,
    evolution: projectedEvolution,
    availability: [
      availability("projection", projectedUnderstandings.length),
      availability("understanding", projectedUnderstandings.length),
      {
        area: "explanations",
        state: missingExplanation
          ? "referenced-data-missing"
          : projectedExplanations.length > 0
            ? "available-with-content"
            : "available-empty",
      },
      {
        area: "evidence",
        state:
          projectedEvidence.length > 0
            ? "runtime-data-unavailable"
            : "available-empty",
      },
      availability("uncertainty", projectedUncertainty.length),
      availability(
        "conditions",
        projectedConditions.length,
        source.conditions.length > 0
          ? "referenced-data-missing"
          : "runtime-data-unavailable",
      ),
      availability(
        "organizational-state",
        projectedState ? 1 : 0,
        source.organizationalState
          ? "referenced-data-missing"
          : "runtime-data-unavailable",
      ),
      availability(
        "investigations",
        projectedInvestigations.length,
        source.investigationsAvailable === false
          ? "runtime-data-unavailable"
          : source.investigations.length > 0
            ? "referenced-data-missing"
            : "available-empty",
      ),
      availability(
        "evolution",
        projectedEvolution.length,
        source.evolution.length > 0
          ? "referenced-data-missing"
          : "available-empty",
      ),
    ],
    depth: {
      summary: normalizeReferences(understandingReferences),
      support: supportReferences,
      trace: traceReferences,
    },
  };
}
