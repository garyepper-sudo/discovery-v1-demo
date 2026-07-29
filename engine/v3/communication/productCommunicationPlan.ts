import type {
  CanonicalObjectReference,
  OrganizationalUnderstandingProjection,
  ProjectionExperience,
} from "../projection/organizationalUnderstandingProjection";

export const PRODUCT_COMMUNICATION_CONTRACT_VERSION = "1";
export const ORGANIZATION_COMMUNICATION_POLICY_ID =
  "product-communication:organization";
export const ORGANIZATION_COMMUNICATION_POLICY_VERSION = "1";

export type ProductCommunicationContext = {
  organizationId: string;
  consumerId: string;
  experience: ProjectionExperience;
  generatedAt: string;
  contractVersion: string;
};

export type UpstreamPrioritySignal = {
  signalId: string;
  subjectRef: CanonicalObjectReference;
  producer:
    | "condition_significance"
    | "investigation_information_gain"
    | "decision_relevance"
    | "research_relevance"
    | "prediction_risk"
    | "executive_priority"
    | "other";
  objective: string;
  priorityClass?: string;
  score?: number;
  rank?: number;
  generatedAt?: string;
  supportingRefs: CanonicalObjectReference[];
};

export type AuthorizedApplicationCommunicationInput = {
  inputId: string;
  owner:
    | "assessment"
    | "recommendation"
    | "decision"
    | "research"
    | "prediction"
    | "investigation";
  objective: string;
  organizationId: string;
  consumerId: string;
  disclosureDecisionId: string;
  subjectRefs: CanonicalObjectReference[];
};

export type ProductCommunicationSource = {
  context: ProductCommunicationContext;
  projection: OrganizationalUnderstandingProjection;
  prioritySignals: UpstreamPrioritySignal[];
  applicationInputs?: AuthorizedApplicationCommunicationInput[];
};

export type CommunicationPolicyRuleId =
  | "valid-upstream-priority-signal"
  | "singleton-understanding-fallback"
  | "supporting-disclosed-reference"
  | "unresolved-uncertainty-required"
  | "material-change-required"
  | "investigation-opportunity-available";

export type ProductCommunicationPolicy = {
  policyId: string;
  version: string;
  experience: ProductCommunicationContext["experience"];
  leadRules: CommunicationPolicyRuleId[];
  supportRules: CommunicationPolicyRuleId[];
  uncertaintyRules: CommunicationPolicyRuleId[];
  continuityRules: CommunicationPolicyRuleId[];
  actionRules: CommunicationPolicyRuleId[];
};

export const ORGANIZATION_PRODUCT_COMMUNICATION_POLICY:
  ProductCommunicationPolicy = {
    policyId: ORGANIZATION_COMMUNICATION_POLICY_ID,
    version: ORGANIZATION_COMMUNICATION_POLICY_VERSION,
    experience: "organization",
    leadRules: [
      "valid-upstream-priority-signal",
      "singleton-understanding-fallback",
    ],
    supportRules: ["supporting-disclosed-reference"],
    uncertaintyRules: ["unresolved-uncertainty-required"],
    continuityRules: ["material-change-required"],
    actionRules: ["investigation-opportunity-available"],
  };

export type CommunicationPriorityProvenance = {
  source:
    | "upstream_signal"
    | "communication_policy"
    | "experience_requirement"
    | "deterministic_fallback";
  ruleId?: CommunicationPolicyRuleId;
  upstreamSignalIds?: string[];
  subjectRef: CanonicalObjectReference;
  explanation: {
    code:
      | "condition_significance_signal"
      | "investigation_information_gain_signal"
      | "other_upstream_signal"
      | "material_change_required"
      | "unresolved_uncertainty_required"
      | "investigation_opportunity_available"
      | "experience_lead_fallback"
      | "supporting_disclosed_reference";
  };
};

export type ProductCommunicationAvailabilityState =
  | "available-with-source-text"
  | "available-structurally-without-text"
  | "available-empty"
  | "source-text-unavailable"
  | "upstream-priority-unavailable"
  | "unresolved-alternatives-required"
  | "projection-data-unavailable"
  | "withheld"
  | "revoked"
  | "invalid-authority"
  | "organization-mismatch"
  | "consumer-mismatch"
  | "historical-compatibility-unavailable"
  | "unsupported-application-input"
  | "first-supported-understanding"
  | "history-not-authorized"
  | "change-reason-unavailable"
  | "no-meaningful-change"
  | "no-additional-evidence-recommended"
  | "inquiry-rationale-unavailable"
  | "gap-known-request-not-authorized"
  | "expected-gain-unavailable"
  | "supporting-references-unavailable"
  | "investigation-data-unavailable"
  | "organizational-context-not-authorized";

export type ProductCommunicationAvailabilityArea =
  | "communication"
  | "lead"
  | "priority"
  | "support"
  | "uncertainty"
  | "changes"
  | "next-inquiries"
  | "alternatives"
  | "application-inputs";

export type ProductCommunicationAvailability = {
  area: ProductCommunicationAvailabilityArea;
  state: ProductCommunicationAvailabilityState;
};

export type SourcePassThroughText = {
  text: string;
  sourceRef: CanonicalObjectReference;
  sourceField: string;
  sourceOwner:
    | "canonical_cognition"
    | "application_cognition"
    | "communication_artifact";
};

export type CommunicationPlanItem = {
  itemId: string;
  subjectRef: CanonicalObjectReference;
  sourceText?: SourcePassThroughText;
  supportingRefs: CanonicalObjectReference[];
  priority: CommunicationPriorityProvenance;
  availability: ProductCommunicationAvailability;
  change?: {
    direction:
      | "emerged"
      | "strengthened"
      | "weakened"
      | "revised"
      | "contradicted"
      | "retired"
      | "merged"
      | "resolved"
      | "unresolved";
    occurredAt: string;
    previousRevisionAvailable: boolean;
    reasonAvailability: "available" | "unavailable";
  };
  inquiry?: {
    priorityRank: number;
    rationale: string | null;
    gaps: string[];
    clarificationTargets: string[];
    expectedConfidenceGain: number | null;
    expectedGainUnit: "canonical-confidence-gain-points";
    supportingReferencesAvailability: "available" | "unavailable";
    outcomeCaveat:
      "The result could strengthen, weaken, or redirect the current understanding.";
  };
};

export type CommunicationAlternativeGroup = {
  compositionRef: CanonicalObjectReference;
  alternatives: Array<{
    explanationRef: CanonicalObjectReference;
    disposition: "supported" | "plausible" | "unresolved" | "weakened";
    supportingRefs: CanonicalObjectReference[];
  }>;
};

export type CommunicationEvidenceRole = {
  evidenceRef: CanonicalObjectReference;
  explanationRef: CanonicalObjectReference;
  role: "supports" | "opposes" | "shared";
  basisKind:
    | "explanation-seed"
    | "evidence-relationship"
    | "shared-support";
  basisReferenceIds: string[];
  relatedExplanationRefs: CanonicalObjectReference[];
};

export type ProductCommunicationPlan = {
  planId: string;
  contractVersion: string;
  policyId: string;
  policyVersion: string;
  organizationId: string;
  consumerId: string;
  experience: ProductCommunicationContext["experience"];
  generatedAt: string;
  projectionId: string;
  disclosureDecisionId: string;
  sourceRevisionIds: string[];
  prioritySignals: UpstreamPrioritySignal[];
  lead?: CommunicationPlanItem;
  support: CommunicationPlanItem[];
  uncertainty: CommunicationPlanItem[];
  changes: CommunicationPlanItem[];
  nextInquiries: CommunicationPlanItem[];
  alternatives: CommunicationAlternativeGroup[];
  evidenceRoles: CommunicationEvidenceRole[];
  availability: ProductCommunicationAvailability[];
};

const compare = (left: string, right: string): number =>
  left.localeCompare(right);

function referenceIdentity(reference: CanonicalObjectReference): string {
  return JSON.stringify([
    reference.objectType,
    reference.objectId,
    reference.revisionId ?? null,
  ]);
}

function copyReference(
  reference: CanonicalObjectReference,
): CanonicalObjectReference {
  return { ...reference };
}

function normalizeReferences(
  references: readonly CanonicalObjectReference[],
): CanonicalObjectReference[] {
  const unique = new Map<string, CanonicalObjectReference>();
  for (const reference of references) {
    unique.set(referenceIdentity(reference), copyReference(reference));
  }
  return [...unique.entries()]
    .sort(([left], [right]) => compare(left, right))
    .map(([, reference]) => reference);
}

function availability(
  area: ProductCommunicationAvailabilityArea,
  state: ProductCommunicationAvailabilityState,
): ProductCommunicationAvailability {
  return { area, state };
}

function projectionFailureState(
  projection: OrganizationalUnderstandingProjection,
): ProductCommunicationAvailabilityState | undefined {
  const state = projection.availability.find(
    (entry) => entry.area === "projection",
  )?.state;
  switch (state) {
    case "withheld":
      return "withheld";
    case "revoked":
      return "revoked";
    case "organization-mismatch":
      return "organization-mismatch";
    case "consumer-mismatch":
      return "consumer-mismatch";
    case "authority-receipt-invalid":
      return "invalid-authority";
    case "historical-compatibility-unavailable":
      return "historical-compatibility-unavailable";
    case "runtime-data-unavailable":
    case "referenced-data-missing":
      return "projection-data-unavailable";
    default:
      return undefined;
  }
}

function emptyPlan(
  source: ProductCommunicationSource,
  policy: ProductCommunicationPolicy,
  state: ProductCommunicationAvailabilityState,
): ProductCommunicationPlan {
  return {
    planId: planIdentity(source, policy, []),
    contractVersion: source.context.contractVersion,
    policyId: policy.policyId,
    policyVersion: policy.version,
    organizationId: source.context.organizationId,
    consumerId: source.context.consumerId,
    experience: source.context.experience,
    generatedAt: source.context.generatedAt,
    projectionId: source.projection.projectionId,
    disclosureDecisionId: source.projection.disclosureDecisionId,
    sourceRevisionIds: [...source.projection.sourceRevisionIds].sort(compare),
    prioritySignals: [],
    support: [],
    uncertainty: [],
    changes: [],
    nextInquiries: [],
    alternatives: [],
    evidenceRoles: [],
    availability: [availability("communication", state)],
  };
}

function planIdentity(
  source: ProductCommunicationSource,
  policy: ProductCommunicationPolicy,
  signalIds: readonly string[],
): string {
  return `product-communication-plan:${encodeURIComponent(JSON.stringify([
    source.context.contractVersion,
    policy.policyId,
    policy.version,
    source.context.organizationId,
    source.context.consumerId,
    source.context.experience,
    source.projection.projectionId,
    source.projection.disclosureDecisionId,
    [...source.projection.sourceRevisionIds].sort(compare),
    [...signalIds].sort(compare),
  ]))}`;
}

function disclosedClosure(
  projection: OrganizationalUnderstandingProjection,
): Map<string, CanonicalObjectReference> {
  const references = normalizeReferences([
    ...projection.understandings.flatMap((item) => [
      item.canonicalRef,
      ...item.supportingRefs,
    ]),
    ...projection.explanations.flatMap((item) => [
      item.canonicalRef,
      ...item.supportingRefs,
    ]),
    ...projection.evidence.flatMap((item) => [
      item.canonicalRef,
      ...item.supportingRefs,
    ]),
    ...projection.uncertainty.flatMap((item) => [
      item.canonicalRef,
      ...item.supportingRefs,
    ]),
    ...projection.conditions.flatMap((item) => [
      item.canonicalRef,
      ...item.supportingRefs,
    ]),
    ...(projection.organizationalState
      ? [
          projection.organizationalState.canonicalRef,
          ...projection.organizationalState.supportingRefs,
        ]
      : []),
    ...projection.investigations.flatMap((item) => [
      item.canonicalRef,
      ...item.supportingRefs,
    ]),
    ...projection.evolution.flatMap((item) => [
      item.canonicalRef,
      ...item.supportingRefs,
    ]),
    ...projection.depth.summary,
    ...projection.depth.support,
    ...projection.depth.trace,
  ]);
  return new Map(
    references.map((reference) => [referenceIdentity(reference), reference]),
  );
}

function signalReason(
  producer: UpstreamPrioritySignal["producer"],
): CommunicationPriorityProvenance["explanation"]["code"] {
  if (producer === "condition_significance") {
    return "condition_significance_signal";
  }
  if (producer === "investigation_information_gain") {
    return "investigation_information_gain_signal";
  }
  return "other_upstream_signal";
}

function organizationSignalOrder(signal: UpstreamPrioritySignal): string {
  const producerOrder: Record<UpstreamPrioritySignal["producer"], number> = {
    condition_significance: 0,
    investigation_information_gain: 1,
    decision_relevance: 2,
    research_relevance: 3,
    prediction_risk: 4,
    executive_priority: 5,
    other: 6,
  };
  return `${producerOrder[signal.producer]}\0${referenceIdentity(
    signal.subjectRef,
  )}\0${signal.signalId}`;
}

function validSignals(
  signals: readonly UpstreamPrioritySignal[],
  closure: ReadonlyMap<string, CanonicalObjectReference>,
): UpstreamPrioritySignal[] {
  const allowedProducers = new Set<UpstreamPrioritySignal["producer"]>([
    "condition_significance",
    "investigation_information_gain",
    "decision_relevance",
    "research_relevance",
    "prediction_risk",
    "executive_priority",
    "other",
  ]);
  return signals
    .filter(
      (signal) =>
        signal.signalId.length > 0 &&
        allowedProducers.has(signal.producer) &&
        signal.objective.trim().length > 0 &&
        closure.has(referenceIdentity(signal.subjectRef)) &&
        signal.supportingRefs.every((reference) =>
          closure.has(referenceIdentity(reference)),
        ) &&
        (signal.score === undefined || Number.isFinite(signal.score)) &&
        (signal.rank === undefined || Number.isFinite(signal.rank)),
    )
    .map((signal) => ({
      ...signal,
      subjectRef: copyReference(signal.subjectRef),
      supportingRefs: normalizeReferences(signal.supportingRefs),
    }))
    .sort((left, right) =>
      compare(organizationSignalOrder(left), organizationSignalOrder(right)),
    );
}

function exactSourceText(
  projection: OrganizationalUnderstandingProjection,
  reference: CanonicalObjectReference,
  area: ProductCommunicationAvailabilityArea,
): SourcePassThroughText | undefined {
  if (reference.objectType === "organizational-condition") {
    const condition = projection.conditions.find(
      (item) => referenceIdentity(item.canonicalRef) === referenceIdentity(reference),
    );
    const conditionText =
      area === "uncertainty"
        ? condition?.value.uncertaintySummary
        : condition?.value.summary;
    if (condition && conditionText) {
      return {
        text: conditionText,
        sourceRef: copyReference(condition.canonicalRef),
        sourceField:
          area === "uncertainty" ? "uncertaintySummary" : "summary",
        sourceOwner: "canonical_cognition",
      };
    }
  }
  if (reference.objectType === "investigation-opportunity") {
    const investigation = projection.investigations.find(
      (item) => referenceIdentity(item.canonicalRef) === referenceIdentity(reference),
    );
    if (investigation?.value.suggestedExecutiveQuestion) {
      return {
        text: investigation.value.suggestedExecutiveQuestion,
        sourceRef: copyReference(investigation.canonicalRef),
        sourceField: "suggestedExecutiveQuestion",
        sourceOwner: "canonical_cognition",
      };
    }
  }
  if (
    area === "uncertainty" &&
    reference.objectType === "organizational-explanation"
  ) {
    const uncertainty = projection.uncertainty.find(
      (item) =>
        referenceIdentity(item.canonicalRef) === referenceIdentity(reference) &&
        item.value.owner === "organizational-explanation",
    );
    if (
      uncertainty?.value.owner === "organizational-explanation" &&
      uncertainty.value.statement
    ) {
      return {
        text: uncertainty.value.statement,
        sourceRef: copyReference(uncertainty.canonicalRef),
        sourceField: "uncertainty.statement",
        sourceOwner: "canonical_cognition",
      };
    }
  }
  if (
    area === "changes" &&
    reference.objectType === "organizational-evolution"
  ) {
    const evolution = projection.evolution.find(
      (item) =>
        referenceIdentity(item.canonicalRef) === referenceIdentity(reference),
    );
    if (evolution?.value.reason) {
      return {
        text: evolution.value.reason,
        sourceRef: copyReference(evolution.canonicalRef),
        sourceField: "reason",
        sourceOwner: "canonical_cognition",
      };
    }
  }
  return undefined;
}

function changeDirection(
  changeType: string | undefined,
): NonNullable<CommunicationPlanItem["change"]>["direction"] {
  switch (changeType) {
    case "new":
      return "emerged";
    case "strengthening":
    case "strengthened":
      return "strengthened";
    case "weakening":
    case "weakened":
      return "weakened";
    case "contradicted":
      return "contradicted";
    case "retired":
      return "retired";
    case "merged":
      return "merged";
    case "resolved":
      return "resolved";
    case "unresolved":
      return "unresolved";
    default:
      return "revised";
  }
}

function item(
  projection: OrganizationalUnderstandingProjection,
  subjectRef: CanonicalObjectReference,
  supportingRefs: readonly CanonicalObjectReference[],
  priority: CommunicationPriorityProvenance,
  area: ProductCommunicationAvailabilityArea,
  source?: {
    itemId: string;
    sourceText?: SourcePassThroughText;
  },
): CommunicationPlanItem {
  const sourceText =
    source?.sourceText ?? exactSourceText(projection, subjectRef, area);
  const evolution = area === "changes"
    ? projection.evolution.find(
        (entry) =>
          referenceIdentity(entry.canonicalRef) ===
          referenceIdentity(subjectRef),
      )
    : undefined;
  const investigation = area === "next-inquiries"
    ? projection.investigations.find(
        (entry) =>
          referenceIdentity(entry.canonicalRef) ===
          referenceIdentity(subjectRef),
      )
    : undefined;
  const investigationDetailsAvailable = Boolean(
    investigation &&
      (
        typeof investigation.value.reason === "string" ||
        Array.isArray(investigation.value.missingEvidence) ||
        Number.isFinite(investigation.value.expectedConfidenceGain)
      ),
  );
  return {
    itemId:
      source?.itemId ??
      `communication-item:${encodeURIComponent(referenceIdentity(subjectRef))}`,
    subjectRef: copyReference(subjectRef),
    ...(sourceText ? { sourceText } : {}),
    supportingRefs: normalizeReferences(supportingRefs),
    priority,
    availability: availability(
      area,
      sourceText
        ? "available-with-source-text"
        : "available-structurally-without-text",
    ),
    ...(evolution
      ? {
          change: {
            direction: changeDirection(evolution.value.changeType),
            occurredAt: evolution.value.occurredAt,
            previousRevisionAvailable: Boolean(
              evolution.value.previousRevisionId,
            ),
            reasonAvailability: evolution.value.reason
              ? "available" as const
              : "unavailable" as const,
          },
        }
      : {}),
    ...(investigation && investigationDetailsAvailable
      ? {
          inquiry: {
            priorityRank:
              investigation.priorityRank ?? Number.MAX_SAFE_INTEGER,
            rationale:
              typeof investigation.value.reason === "string" &&
                investigation.value.reason.trim()
                ? investigation.value.reason.trim()
                : null,
            gaps: Array.isArray(investigation.value.missingEvidence)
              ? [...investigation.value.missingEvidence]
              : [],
            clarificationTargets: Array.isArray(
                investigation.value.affectedConditions,
              )
              ? [...investigation.value.affectedConditions]
              : [],
            expectedConfidenceGain: Number.isFinite(
                investigation.value.expectedConfidenceGain,
              )
              ? investigation.value.expectedConfidenceGain
              : null,
            expectedGainUnit:
              "canonical-confidence-gain-points" as const,
            supportingReferencesAvailability:
              investigation.supportingRefs.length > 0
                ? "available" as const
                : "unavailable" as const,
            outcomeCaveat:
              "The result could strengthen, weaken, or redirect the current understanding." as const,
          },
        }
      : {}),
  };
}

/**
 * Pure compiler over an already-disclosed projection.
 *
 * It orders communication roles, preserves upstream signal provenance, and
 * passes through exact source text. It does not traverse Runtime, decide
 * disclosure, rank cognition, synthesize prose, calculate confidence, persist,
 * or mutate its inputs.
 */
export function compileProductCommunicationPlan(
  source: ProductCommunicationSource,
  policy: ProductCommunicationPolicy,
): ProductCommunicationPlan {
  const { context, projection } = source;
  if (context.organizationId !== projection.organizationId) {
    return emptyPlan(source, policy, "organization-mismatch");
  }
  if (context.consumerId !== projection.consumerId) {
    return emptyPlan(source, policy, "consumer-mismatch");
  }
  if (
    context.experience !== projection.experience ||
    context.experience !== policy.experience
  ) {
    return emptyPlan(source, policy, "projection-data-unavailable");
  }
  const failure = projectionFailureState(projection);
  if (failure) {
    return emptyPlan(source, policy, failure);
  }

  if ((source.applicationInputs ?? []).length > 0) {
    return emptyPlan(source, policy, "unsupported-application-input");
  }

  const closure = disclosedClosure(projection);
  const signals = validSignals(source.prioritySignals, closure);
  const signalsBySubject = new Map<string, UpstreamPrioritySignal[]>();
  for (const signal of signals) {
    const identity = referenceIdentity(signal.subjectRef);
    signalsBySubject.set(identity, [
      ...(signalsBySubject.get(identity) ?? []),
      signal,
    ]);
  }

  const firstSignaledSubject = signals[0]
    ? referenceIdentity(signals[0].subjectRef)
    : undefined;
  const singletonFallback =
    projection.understandings.length === 1
      ? projection.understandings[0].canonicalRef
      : undefined;
  const leadRef = firstSignaledSubject
    ? closure.get(firstSignaledSubject)
    : singletonFallback;
  const leadSignals = leadRef
    ? signalsBySubject.get(referenceIdentity(leadRef)) ?? []
    : [];
  const lead = leadRef
    ? item(
        projection,
        leadRef,
        leadSignals.flatMap((signal) => signal.supportingRefs),
        {
          source:
            leadSignals.length > 0
              ? "upstream_signal"
              : "deterministic_fallback",
          ruleId:
            leadSignals.length > 0
              ? "valid-upstream-priority-signal"
              : "singleton-understanding-fallback",
          ...(leadSignals.length > 0
            ? { upstreamSignalIds: leadSignals.map((signal) => signal.signalId) }
            : {}),
          subjectRef: copyReference(leadRef),
          explanation: {
            code:
              leadSignals.length > 0
                ? signalReason(leadSignals[0].producer)
                : "experience_lead_fallback",
          },
        },
        "lead",
      )
    : undefined;

  const leadIdentity = leadRef ? referenceIdentity(leadRef) : undefined;
  const supportRefs = normalizeReferences([
    ...projection.understandings.map((entry) => entry.canonicalRef),
    ...projection.explanations.map((entry) => entry.canonicalRef),
    ...projection.conditions.map((entry) => entry.canonicalRef),
    ...(projection.organizationalState
      ? [projection.organizationalState.canonicalRef]
      : []),
    ...projection.evidence.map((entry) => entry.canonicalRef),
  ]).filter((reference) => referenceIdentity(reference) !== leadIdentity);
  const support = supportRefs.map((reference) =>
    item(
      projection,
      reference,
      [],
      {
        source: "communication_policy",
        ruleId: "supporting-disclosed-reference",
        subjectRef: copyReference(reference),
        explanation: { code: "supporting_disclosed_reference" },
      },
      "support",
    ),
  );

  const projectedUncertainty = [...projection.uncertainty]
    .sort((left, right) => compare(left.id, right.id))
    .map((entry) => {
      const sourceText =
        entry.value.owner === "organizational-explanation"
          ? {
              text: entry.value.statement,
              sourceRef: copyReference(entry.canonicalRef),
              sourceField: "uncertainty.statement",
              sourceOwner: "canonical_cognition" as const,
            }
          : entry.value.owner === "organizational-uncertainty"
            ? {
                text: entry.value.driver.description,
                sourceRef: copyReference(entry.canonicalRef),
                sourceField: "driver.description",
                sourceOwner: "canonical_cognition" as const,
              }
            : undefined;
      return item(
        projection,
        entry.canonicalRef,
        entry.supportingRefs,
        {
          source: "experience_requirement",
          ruleId: "unresolved-uncertainty-required",
          subjectRef: copyReference(entry.canonicalRef),
          explanation: { code: "unresolved_uncertainty_required" },
        },
        "uncertainty",
        {
          itemId: `communication-item:uncertainty:${encodeURIComponent(entry.id)}`,
          ...(sourceText ? { sourceText } : {}),
        },
      );
    });
  const conditionUncertainty = [...projection.conditions]
    .filter((entry) => entry.value.uncertaintySummary?.trim())
    .sort((left, right) => compare(left.id, right.id))
    .map((entry) =>
      item(
        projection,
        entry.canonicalRef,
        entry.supportingRefs,
        {
          source: "experience_requirement",
          ruleId: "unresolved-uncertainty-required",
          subjectRef: copyReference(entry.canonicalRef),
          explanation: { code: "unresolved_uncertainty_required" },
        },
        "uncertainty",
      ),
    );
  const uncertainty = [...projectedUncertainty, ...conditionUncertainty];
  const changes = [...projection.evolution]
    .sort((left, right) => compare(left.id, right.id))
    .map((entry) =>
      item(
        projection,
        entry.canonicalRef,
        entry.supportingRefs,
        {
          source: "experience_requirement",
          ruleId: "material-change-required",
          subjectRef: copyReference(entry.canonicalRef),
          explanation: { code: "material_change_required" },
        },
        "changes",
      ),
    );
  const nextInquiries = [...projection.investigations]
    .sort((left, right) =>
      (left.priorityRank ?? Number.MAX_SAFE_INTEGER) -
        (right.priorityRank ?? Number.MAX_SAFE_INTEGER) ||
      compare(left.id, right.id),
    )
    .map((entry) =>
      item(
        projection,
        entry.canonicalRef,
        entry.supportingRefs,
        {
          source: "experience_requirement",
          ruleId: "investigation-opportunity-available",
          subjectRef: copyReference(entry.canonicalRef),
          explanation: { code: "investigation_opportunity_available" },
        },
        "next-inquiries",
      ),
    );

  const explanations = new Map(
    projection.explanations.map((entry) => [entry.id, entry]),
  );
  const alternatives = [...projection.understandings]
    .sort((left, right) => compare(left.id, right.id))
    .filter((entry) =>
      entry.value.compositionUncertainty.includes("unresolved-alternatives"),
    )
    .map((entry) => ({
      compositionRef: copyReference(entry.canonicalRef),
      alternatives: [...entry.value.explanationIds]
        .sort(compare)
        .flatMap((explanationId) => {
          const explanation = explanations.get(explanationId);
          return explanation
            ? [{
                explanationRef: copyReference(explanation.canonicalRef),
                disposition: "unresolved" as const,
                supportingRefs: normalizeReferences(
                  explanation.supportingRefs,
                ),
              }]
            : [];
        }),
    }));
  const evidenceRoles = projection.evidence
    .flatMap((evidence) =>
      evidence.value.roles.map((role) => ({
        evidenceRef: copyReference(evidence.canonicalRef),
        explanationRef: {
          objectType: "organizational-explanation" as const,
          objectId: role.explanationId,
        },
        role: role.role,
        basisKind: role.basisKind,
        basisReferenceIds: [...role.basisReferenceIds].sort(compare),
        relatedExplanationRefs: [...role.relatedExplanationIds]
          .sort(compare)
          .map((objectId) => ({
            objectType: "organizational-explanation" as const,
            objectId,
          })),
      })),
    )
    .sort((left, right) =>
      JSON.stringify(left).localeCompare(JSON.stringify(right)),
    );

  const invalidSignalCount = source.prioritySignals.length - signals.length;
  return {
    planId: planIdentity(source, policy, signals.map((signal) => signal.signalId)),
    contractVersion: context.contractVersion,
    policyId: policy.policyId,
    policyVersion: policy.version,
    organizationId: context.organizationId,
    consumerId: context.consumerId,
    experience: context.experience,
    generatedAt: context.generatedAt,
    projectionId: projection.projectionId,
    disclosureDecisionId: projection.disclosureDecisionId,
    sourceRevisionIds: [...projection.sourceRevisionIds].sort(compare),
    prioritySignals: signals,
    ...(lead ? { lead } : {}),
    support,
    uncertainty,
    changes,
    nextInquiries,
    alternatives,
    evidenceRoles,
    availability: [
      availability("communication", "available-structurally-without-text"),
      availability(
        "lead",
        lead
          ? lead.sourceText
            ? "available-with-source-text"
            : "source-text-unavailable"
          : "upstream-priority-unavailable",
      ),
      availability(
        "support",
        support.length > 0
          ? "available-structurally-without-text"
          : "available-empty",
      ),
      availability(
        "uncertainty",
        uncertainty.length > 0
          ? "available-structurally-without-text"
          : "available-empty",
      ),
      availability(
        "changes",
        changes.length > 0
          ? changes.some((entry) => !entry.sourceText)
            ? "change-reason-unavailable"
            : "available-with-source-text"
          : projection.availability.find((entry) => entry.area === "evolution")
                ?.state === "referenced-data-missing"
            ? "history-not-authorized"
            : projection.availability.find((entry) => entry.area === "evolution")
                  ?.state === "runtime-data-unavailable"
              ? "projection-data-unavailable"
              : projection.understandings.every(
                    (entry) => entry.value.previousRevisionId === null,
                  )
                ? "first-supported-understanding"
                : "no-meaningful-change",
      ),
      availability(
        "next-inquiries",
        nextInquiries.length > 0
          ? nextInquiries[0]?.inquiry?.rationale === null
            ? "inquiry-rationale-unavailable"
            : nextInquiries[0]?.inquiry?.expectedConfidenceGain === null
              ? "expected-gain-unavailable"
              : nextInquiries[0]?.inquiry
                    ?.supportingReferencesAvailability === "unavailable"
                ? "supporting-references-unavailable"
                : nextInquiries.some((entry) => entry.sourceText)
                  ? "available-with-source-text"
                  : "source-text-unavailable"
          : projection.availability.find(
                (entry) => entry.area === "investigations",
              )?.state === "referenced-data-missing"
            ? "gap-known-request-not-authorized"
            : projection.availability.find(
                  (entry) => entry.area === "investigations",
                )?.state === "runtime-data-unavailable"
              ? "investigation-data-unavailable"
              : "available-empty",
      ),
      availability(
        "alternatives",
        alternatives.length > 0
          ? "unresolved-alternatives-required"
          : "available-empty",
      ),
      availability(
        "priority",
        invalidSignalCount > 0 || signals.length === 0
          ? "upstream-priority-unavailable"
          : "available-structurally-without-text",
      ),
      availability("application-inputs", "available-empty"),
    ],
  };
}
