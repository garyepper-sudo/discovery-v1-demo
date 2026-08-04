import { createHash } from "node:crypto";

import type { AuthorizedMetricResult, AuthorizedMetricId } from "../../engine/v3/governance/authorizedMetricLineage";
import type { GovernedScopeRef, GovernedScopeType } from "../../engine/v3/governance/scopedGovernanceContext";
import type {
  DecisionCalibrationAxis,
  DecisionCalibrationAxisValue,
  DecisionCalibrationClassification,
  ScopedDecisionCalibrationProjection,
} from "../integration/scopedDecisionCalibrationProjection";
import type {
  ScopedProductItemKind,
  ScopedProductProjection,
  ScopedProductProjectionItem,
} from "../integration/scopedOrganizationalProductProjection";

export const ROLE_AWARE_FIXTURE_IDS = [
  "RA-01", "RA-02", "RA-03", "RA-04", "RA-05", "RA-06",
  "RA-07", "RA-08", "RA-09", "RA-10", "RA-11", "RA-12",
  "RA-13", "RA-14", "RA-15", "RA-16", "RA-17", "RA-18",
  "RA-19", "RA-20", "RA-21", "RA-22", "RA-23", "RA-24",
] as const;

export type RoleAwareFixtureId = (typeof ROLE_AWARE_FIXTURE_IDS)[number];
export type RoleAwareWorkspace = "home" | "understanding" | "decision" | "investigation" | "history";
export type SemanticDisposition =
  | "disclosed"
  | "safely-abstracted"
  | "withheld"
  | "unavailable"
  | "insufficient-authorized-information"
  | "unsupported";

export type RoleAwareFixture = {
  fixtureId: RoleAwareFixtureId;
  description: string;
  roleDescription: string;
  scopeLabel: string;
  workspace: RoleAwareWorkspace;
  projection: ScopedProductProjection;
  primaryHeading: string;
  primaryAction?: string;
  expectedDisposition: SemanticDisposition;
};

export function isRoleAwareFixtureExperienceEnabled(input: {
  nodeEnvironment: string | undefined;
  discoveryEnvironment: string | undefined;
}): boolean {
  return input.nodeEnvironment === "development" && input.discoveryEnvironment === "development";
}

const ORGANIZATION_ID = "sandbox-northstar-implementation-services-001";
const EVALUATED_AT = "2026-08-04T16:00:00.000Z";
const AXES: DecisionCalibrationAxis[] = [
  "authority", "strategic-relationship", "evidence-support", "local-feasibility",
  "cross-scope-effect", "strategy-challenge-potential", "experiment-status", "outcome-status",
];
const SUPPORTED_METRICS = [
  "organizational-understanding.coherence",
  "organizational-learning.learning-velocity",
] as const;
const UNSUPPORTED_METRICS: AuthorizedMetricId[] = [
  "organizational-understanding.confidence",
  "organizational-understanding.freshness",
  "organizational-understanding.health",
  "organizational-learning.understanding-growth",
  "organizational-learning.memory-growth",
  "organizational-learning.trend-ranking",
];

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function identity(prefix: string, value: unknown): string {
  return `${prefix}:${createHash("sha256").update(stable(value)).digest("hex")}`;
}

function scope(type: GovernedScopeType, id: string): GovernedScopeRef {
  return { organizationId: ORGANIZATION_ID, type, id };
}

function item(input: {
  id: string;
  scope: GovernedScopeRef;
  kind: ScopedProductItemKind;
  title?: string;
  summary?: string;
  uncertainty?: string | null;
  disposition?: "disclosed" | "safely-abstracted";
  temporalMode?: "current" | "historical";
}): ScopedProductProjectionItem {
  const disposition = input.disposition ?? "disclosed";
  return {
    safeRef: `product-item:${input.id}`,
    canonicalObjectType: `scoped-${input.kind}`,
    revisionRef: `revision:${input.id}:1`,
    kind: input.kind,
    requestedScope: input.scope,
    disposition,
    whyVisible: disposition === "disclosed" ? "authorized-inputs" : "safe-abstraction-only",
    ...(disposition === "disclosed" ? {
      title: input.title,
      summary: input.summary,
      uncertainty: input.uncertainty ?? null,
    } : {}),
    safeSupportingLineage: disposition === "disclosed" ? [`lineage:${input.id}`] : [],
    auditRefs: [`audit:${input.id}`],
    temporalMode: input.temporalMode ?? "current",
  };
}

function metric(metricId: AuthorizedMetricId, requestedScope: GovernedScopeRef, value?: number | string): AuthorizedMetricResult {
  const supported = SUPPORTED_METRICS.includes(metricId as (typeof SUPPORTED_METRICS)[number]);
  const safe = {
    contractVersion: "1" as const,
    metricId,
    organizationId: ORGANIZATION_ID,
    recipientId: "recipient:fixture",
    requestedScope,
    disposition: supported ? "disclosed" as const : "unsupported-metric" as const,
    reason: supported ? "authorized-canonical-inputs" as const : "metric-unsupported" as const,
    lineage: supported ? {
      metricId,
      producerRef: metricId === SUPPORTED_METRICS[0]
        ? "update-organizational-understanding-state"
        : "compute-organizational-learning-profile",
      producerVersion: "1",
      requestedScope,
      purpose: "role-aware-fixture-presentation",
      evaluatedAt: EVALUATED_AT,
      temporalMode: "current" as const,
      authorizedInputCount: 1,
      safeInputRefs: [`metric-input:${metricId}`],
      calculationMethod: metricId === SUPPORTED_METRICS[0]
        ? "canonical-organizational-understanding-health-coherence"
        : "canonical-organizational-learning-velocity-score",
      authorityRefs: ["authority:fixture"],
      policyRefs: ["policy:fixture"],
      auditRefs: [`audit:${metricId}`],
    } : null,
    inputDecisions: [],
    ...(supported ? { value } : {}),
  };
  return { resultId: identity("authorized-metric", safe), ...safe };
}

const DEFAULT_AXIS_VALUES: { [A in DecisionCalibrationAxis]: DecisionCalibrationAxisValue[A] } = {
  authority: "authorized",
  "strategic-relationship": "consistent",
  "evidence-support": "current-supported",
  "local-feasibility": "feasible",
  "cross-scope-effect": "compatible",
  "strategy-challenge-potential": "no-supported-challenge",
  "experiment-status": "not-experiment",
  "outcome-status": "supports-assumptions",
};

function calibration(input: {
  id: string;
  requestedScope: GovernedScopeRef;
  classification: DecisionCalibrationClassification;
  overrides?: Partial<{ [A in DecisionCalibrationAxis]: DecisionCalibrationAxisValue[A] }>;
  missing?: DecisionCalibrationAxis[];
  withheld?: boolean;
  outcomeUnavailable?: boolean;
  historical?: boolean;
}): ScopedDecisionCalibrationProjection {
  const missing = new Set(input.missing ?? []);
  const values = { ...DEFAULT_AXIS_VALUES, ...input.overrides };
  const axes = AXES.map((axis) => {
    const blocked = input.withheld || missing.has(axis);
    const unavailable = axis === "outcome-status" && input.outcomeUnavailable;
    return {
      axis,
      disposition: input.withheld ? "withheld" as const
        : unavailable ? "unavailable" as const
        : blocked ? "insufficient-authorized-information" as const
        : "disclosed" as const,
      ...(!blocked && !unavailable ? { value: values[axis] } : {}),
      reasonCode: input.withheld ? "protected-derived-meaning"
        : unavailable ? "axis-input-unavailable"
        : blocked ? "required-authorized-information-incomplete"
        : `fixture:${axis}`,
      safeLineage: blocked || unavailable ? [] : [`lineage:${input.id}:${axis}`],
      auditRefs: blocked ? [] : [`audit:${input.id}:${axis}`],
    };
  });
  const safe = {
    contractVersion: "1" as const,
    organizationId: ORGANIZATION_ID,
    recipientId: "recipient:fixture",
    decisionRef: `decision:${input.id}`,
    decisionRevisionRef: `decision-revision:${input.id}:1`,
    objectiveRevisionRef: `objective-revision:${input.id}:1`,
    optimizationContextRevisionRef: `optimization-context:${input.id}:1`,
    requestedScope: input.requestedScope,
    purpose: "role-aware-fixture-presentation",
    evaluatedAt: EVALUATED_AT,
    temporalMode: input.historical ? "historical" as const : "current" as const,
    classification: input.classification,
    axes,
    safeReasonCodes: [`classification:${input.classification}`],
    safeSupportingLineage: input.withheld ? [] : axes.flatMap((axis) => axis.safeLineage).sort(),
    uncertainty: input.withheld ? "protected-meaning-withheld" as const
      : input.missing?.length ? "authorized-information-incomplete" as const
      : input.outcomeUnavailable ? "outcome-not-observed" as const
      : "none-declared" as const,
    missingAuthorizedInformation: [...(input.missing ?? [])].sort(),
    reviewRequired: ["ambiguous-strategic-intent", "cross-scope-conflict", "possible-strategy-invalidation", "unauthorized-action"].includes(input.classification),
    executionAuthorized: false as const,
    auditRefs: input.withheld ? [] : [`audit:${input.id}:calibration`],
  };
  return { projectionId: identity("scoped-decision-calibration", safe), ...safe };
}

type ProjectionInput = {
  id: RoleAwareFixtureId;
  recipientId: string;
  requestedScope: GovernedScopeRef;
  disposition?: ScopedProductProjection["disposition"];
  items?: ScopedProductProjectionItem[];
  metrics?: AuthorizedMetricResult[];
  decisionCalibration?: ScopedProductProjection["decisionCalibration"];
  historical?: boolean;
  unavailableKinds?: ScopedProductItemKind[];
  withheldItemCount?: number | null;
};

function projection(input: ProjectionInput): ScopedProductProjection {
  const disposition = input.disposition ?? "available";
  const metrics = (input.metrics ?? []).map((result) => {
    const { resultId: _priorResultId, ...rest } = result;
    const safe = { ...rest, recipientId: input.recipientId };
    return { resultId: identity("authorized-metric", safe), ...safe };
  });
  const decisionCalibration = input.decisionCalibration && "classification" in input.decisionCalibration
    ? (() => {
      const { projectionId: _priorProjectionId, ...rest } = input.decisionCalibration;
      const safe = { ...rest, recipientId: input.recipientId };
      return { projectionId: identity("scoped-decision-calibration", safe), ...safe };
    })()
    : input.decisionCalibration ?? null;
  const safe = {
    contractVersion: "1" as const,
    organizationId: ORGANIZATION_ID,
    recipientId: input.recipientId,
    requestedScope: input.requestedScope,
    purpose: "role-aware-fixture-presentation",
    evaluatedAt: EVALUATED_AT,
    temporalMode: input.historical ? "historical" as const : "current" as const,
    sourceRevisionRef: disposition === "available"
      ? input.historical ? `source-revision:${input.id}:historical` : `source-revision:${input.id}:current`
      : null,
    disposition,
    items: [...(input.items ?? [])].sort((a, b) => `${a.kind}:${a.safeRef}`.localeCompare(`${b.kind}:${b.safeRef}`)),
    metrics: metrics.sort((a, b) => a.metricId.localeCompare(b.metricId)),
    decisionCalibration,
    unavailableKinds: [...(input.unavailableKinds ?? [])].sort(),
    withheldItemCount: input.withheldItemCount === undefined ? 0 : input.withheldItemCount,
    unsupportedCapabilities: [],
    auditRefs: disposition === "available" ? [`audit:${input.id}:projection`] : [],
  };
  return { projectionId: identity("scoped-product-projection", safe), ...safe };
}

const team = scope("team", "northstar-delivery-team");
const department = scope("department", "implementation-services");
const functional = scope("function", "customer-implementation");
const organization = scope("organization", ORGANIZATION_ID);

function usefulItems(id: string, requestedScope: GovernedScopeRef): ScopedProductProjectionItem[] {
  return [
    item({ id: `${id}:understanding`, scope: requestedScope, kind: "understanding", title: "Delivery capacity is constrained by review handoffs", summary: "Discovery currently understands that review handoffs are the principal constraint in this scope.", uncertainty: "The effect of the revised intake policy is not yet established." }),
    item({ id: `${id}:change`, scope: requestedScope, kind: "material-change", title: "Review timing changed", summary: "The latest authorized revision adds context about handoff timing." }),
    item({ id: `${id}:gap`, scope: requestedScope, kind: "evidence-gap", title: "Intake-policy effect remains unknown", summary: "More information is needed about cycle time after the policy change.", uncertainty: "No complete authorized outcome series is available." }),
    item({ id: `${id}:investigation`, scope: requestedScope, kind: "investigation-opportunity", title: "Review post-change cycle time", summary: "An investigation could clarify whether the new intake policy reduced handoff delay." }),
    item({ id: `${id}:risk`, scope: requestedScope, kind: "risk", title: "Decision review may be needed", summary: "A current decision has a projected review requirement." }),
  ];
}

const definitions: Array<Omit<RoleAwareFixture, "projection"> & { build: () => ScopedProductProjection }> = [
  { fixtureId: "RA-01", description: "Useful team projection", roleDescription: "Team lead", scopeLabel: "Northstar delivery team", workspace: "home", primaryHeading: "What needs your attention", primaryAction: "Review delivery constraint", expectedDisposition: "disclosed", build: () => projection({ id: "RA-01", recipientId: "recipient:team-lead", requestedScope: team, items: usefulItems("ra01", team), metrics: [metric(SUPPORTED_METRICS[0], team, 0.74), metric(SUPPORTED_METRICS[1], team, "steady")] }) },
  { fixtureId: "RA-02", description: "Useful manager projection", roleDescription: "Manager", scopeLabel: "Northstar delivery team", workspace: "home", primaryHeading: "What needs your attention", primaryAction: "Review decision context", expectedDisposition: "disclosed", build: () => projection({ id: "RA-02", recipientId: "recipient:manager", requestedScope: team, items: usefulItems("ra02", team), metrics: [metric(SUPPORTED_METRICS[0], team, 0.71), metric(SUPPORTED_METRICS[1], team, "improving")], decisionCalibration: calibration({ id: "ra02", requestedScope: team, classification: "aligned-supported" }) }) },
  { fixtureId: "RA-03", description: "Useful director projection", roleDescription: "Director", scopeLabel: "Implementation services", workspace: "home", primaryHeading: "What needs your attention", primaryAction: "Review dependency", expectedDisposition: "disclosed", build: () => projection({ id: "RA-03", recipientId: "recipient:director", requestedScope: department, items: [...usefulItems("ra03", department), item({ id: "ra03:dependency", scope: department, kind: "dependency", title: "Cross-team review dependency", summary: "A disclosed dependency shapes delivery timing." })] }) },
  { fixtureId: "RA-04", description: "Useful functional-executive projection", roleDescription: "Functional executive", scopeLabel: "Customer implementation", workspace: "home", primaryHeading: "What needs your attention", primaryAction: "Review strategy context", expectedDisposition: "disclosed", build: () => projection({ id: "RA-04", recipientId: "recipient:functional-executive", requestedScope: functional, items: [...usefulItems("ra04", functional), item({ id: "ra04:objective", scope: functional, kind: "objective-context", title: "Improve predictable implementation", summary: "The authorized Objective prioritizes predictable delivery while protecting learning quality." })] }) },
  { fixtureId: "RA-05", description: "Useful organization-executive projection", roleDescription: "Organization executive", scopeLabel: "Northstar Implementation Services", workspace: "home", primaryHeading: "What needs your attention", primaryAction: "Review organization change", expectedDisposition: "disclosed", build: () => projection({ id: "RA-05", recipientId: "recipient:organization-executive", requestedScope: organization, items: usefulItems("ra05", organization) }) },
  { fixtureId: "RA-06", description: "No authorized information", roleDescription: "Authorized user", scopeLabel: "Restricted scope", workspace: "home", primaryHeading: "This scope cannot be shown", primaryAction: "Choose an authorized scope", expectedDisposition: "withheld", build: () => projection({ id: "RA-06", recipientId: "recipient:denied", requestedScope: scope("restricted", "restricted-scope"), disposition: "withheld", withheldItemCount: null }) },
  { fixtureId: "RA-07", description: "Partially withheld projection", roleDescription: "Manager", scopeLabel: "Northstar delivery team", workspace: "understanding", primaryHeading: "What Discovery understands", primaryAction: "Open available understanding", expectedDisposition: "safely-abstracted", build: () => projection({ id: "RA-07", recipientId: "recipient:manager", requestedScope: team, items: [usefulItems("ra07", team)[0]!, item({ id: "ra07:limited", scope: team, kind: "contradiction", disposition: "safely-abstracted" })], withheldItemCount: null, unavailableKinds: ["objective-context", "dependency"] }) },
  { fixtureId: "RA-08", description: "Historical projection after revocation", roleDescription: "Former recipient", scopeLabel: "Northstar delivery team", workspace: "history", primaryHeading: "Historical view unavailable", primaryAction: "Return to current view", expectedDisposition: "unavailable", build: () => projection({ id: "RA-08", recipientId: "recipient:former", requestedScope: team, disposition: "unavailable", historical: true, withheldItemCount: null }) },
  { fixtureId: "RA-09", description: "Supported coherence", roleDescription: "Authorized person", scopeLabel: "Northstar delivery team", workspace: "home", primaryHeading: "Supported measures", primaryAction: "Understand this measure", expectedDisposition: "disclosed", build: () => projection({ id: "RA-09", recipientId: "recipient:authorized", requestedScope: team, metrics: [metric(SUPPORTED_METRICS[0], team, 0.74)] }) },
  { fixtureId: "RA-10", description: "Supported learning velocity", roleDescription: "Authorized person", scopeLabel: "Northstar delivery team", workspace: "home", primaryHeading: "Supported measures", primaryAction: "Understand this measure", expectedDisposition: "disclosed", build: () => projection({ id: "RA-10", recipientId: "recipient:authorized", requestedScope: team, metrics: [metric(SUPPORTED_METRICS[1], team, "steady")] }) },
  { fixtureId: "RA-11", description: "Unsupported metric", roleDescription: "Authorized person", scopeLabel: "Northstar delivery team", workspace: "home", primaryHeading: "Supported measures", primaryAction: "See supported measures", expectedDisposition: "unsupported", build: () => projection({ id: "RA-11", recipientId: "recipient:authorized", requestedScope: team, metrics: [metric(UNSUPPORTED_METRICS[0]!, team)] }) },
];

const decisions: Array<[RoleAwareFixtureId, string, DecisionCalibrationClassification, Partial<{ [A in DecisionCalibrationAxis]: DecisionCalibrationAxisValue[A] }>, SemanticDisposition]> = [
  ["RA-12", "Aligned and supported decision", "aligned-supported", {}, "disclosed"],
  ["RA-13", "Aligned but stale decision", "aligned-stale", { "evidence-support": "explicitly-stale" }, "disclosed"],
  ["RA-14", "Justified divergence", "justified-divergence", { "strategic-relationship": "materially-divergent" }, "disclosed"],
  ["RA-15", "Unexplained drift", "unexplained-drift", { "strategic-relationship": "materially-divergent", "evidence-support": "insufficient-authorized-evidence" }, "disclosed"],
  ["RA-16", "Ambiguous strategic intent", "ambiguous-strategic-intent", { "strategic-relationship": "ambiguous" }, "disclosed"],
  ["RA-17", "Cross-scope conflict", "cross-scope-conflict", { "cross-scope-effect": "material-conflict" }, "disclosed"],
  ["RA-18", "Local infeasibility", "local-infeasibility", { "local-feasibility": "infeasible" }, "disclosed"],
  ["RA-19", "Possible strategy invalidation", "possible-strategy-invalidation", { "strategic-relationship": "materially-divergent", "strategy-challenge-potential": "may-require-strategy-review", "evidence-support": "mixed-or-contradicted" }, "disclosed"],
  ["RA-20", "Authorized experiment", "authorized-experiment", { authority: "authorized-bounded-experiment", "strategic-relationship": "materially-divergent", "experiment-status": "authorized-bounded-experiment", "outcome-status": "not-yet-observed" }, "disclosed"],
  ["RA-21", "Unauthorized action", "unauthorized-action", { authority: "requires-additional-authority" }, "disclosed"],
];

for (const [fixtureId, description, classification, overrides, expectedDisposition] of decisions) {
  definitions.push({ fixtureId, description, roleDescription: fixtureId === "RA-13" || fixtureId === "RA-20" ? "Team lead" : fixtureId === "RA-17" ? "Director" : "Manager", scopeLabel: "Northstar delivery team", workspace: "decision", primaryHeading: "Decision in context", primaryAction: "Review context", expectedDisposition, build: () => projection({ id: fixtureId, recipientId: `recipient:${fixtureId.toLowerCase()}`, requestedScope: team, decisionCalibration: calibration({ id: fixtureId.toLowerCase(), requestedScope: team, classification, overrides }) }) });
}

definitions.push(
  { fixtureId: "RA-22", description: "Insufficient decision information", roleDescription: "Manager", scopeLabel: "Northstar delivery team", workspace: "investigation", primaryHeading: "More information is needed", primaryAction: "Review missing information", expectedDisposition: "insufficient-authorized-information", build: () => projection({ id: "RA-22", recipientId: "recipient:manager", requestedScope: team, items: [item({ id: "ra22:gap", scope: team, kind: "evidence-gap", title: "Decision constraints are incomplete", summary: "Discovery cannot establish local feasibility from the information available to this view.", uncertainty: "Local feasibility and cross-scope effects remain unresolved." }), item({ id: "ra22:investigation", scope: team, kind: "investigation-opportunity", title: "Clarify local constraints", summary: "Authorized operational context would help assess feasibility." })], decisionCalibration: calibration({ id: "ra22", requestedScope: team, classification: "insufficient-authorized-information", missing: ["local-feasibility", "cross-scope-effect"] }) }) },
  { fixtureId: "RA-23", description: "Withheld decision calibration", roleDescription: "Authorized person", scopeLabel: "Northstar delivery team", workspace: "decision", primaryHeading: "Assessment not shown", primaryAction: "Return to decisions", expectedDisposition: "withheld", build: () => projection({ id: "RA-23", recipientId: "recipient:authorized", requestedScope: team, decisionCalibration: calibration({ id: "ra23", requestedScope: team, classification: "withheld", withheld: true }), withheldItemCount: null }) },
  { fixtureId: "RA-24", description: "Unavailable Outcome", roleDescription: "Manager", scopeLabel: "Northstar delivery team", workspace: "history", primaryHeading: "Outcome not available", primaryAction: "Review calibration", expectedDisposition: "unavailable", build: () => projection({ id: "RA-24", recipientId: "recipient:manager", requestedScope: team, items: [item({ id: "ra24:change", scope: team, kind: "material-change", title: "Decision context was reviewed", summary: "No material change was detected after the new information was reviewed." })], decisionCalibration: calibration({ id: "ra24", requestedScope: team, classification: "aligned-supported", outcomeUnavailable: true }) }) },
);

export const ROLE_AWARE_FIXTURES: Readonly<Record<RoleAwareFixtureId, RoleAwareFixture>> = Object.freeze(
  Object.fromEntries(definitions.map(({ build, ...definition }) => [definition.fixtureId, Object.freeze({ ...definition, projection: build() })])) as Record<RoleAwareFixtureId, RoleAwareFixture>,
);

const FORBIDDEN_KEY_TOKENS = [
  "runtime", "runtimememory", "organizationruntime", "cognition", "rawevidence",
  "rawsource", "rawdocument", "rawpassage", "rawcanonicalobject", "connectormetadata",
  "credential", "oauth", "accesstoken", "refreshtoken", "clientsecret", "environment",
  "hiddenmetricinput", "restrictedsourceidentity", "protectedrelationship",
  "authorizationsecret", "internalconfidence",
] as const;
const FORBIDDEN_VALUES = /(-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|sk_live_|pk_live_|AKIA[0-9A-Z]{16}|Bearer\s+[A-Za-z0-9._~-]{12,})/;

function isForbiddenKey(key: string): boolean {
  const normalized = key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return FORBIDDEN_KEY_TOKENS.some((token) => normalized.includes(token));
}

export function assertFrontendSafeSerialization(value: unknown): void {
  const visit = (itemValue: unknown, path: string): void => {
    if (typeof itemValue === "string" && FORBIDDEN_VALUES.test(itemValue)) throw new Error(`Forbidden serialized value at ${path}`);
    if (!itemValue || typeof itemValue !== "object") return;
    if (Array.isArray(itemValue)) return itemValue.forEach((entry, index) => visit(entry, `${path}[${index}]`));
    for (const [key, entry] of Object.entries(itemValue as Record<string, unknown>)) {
      if (isForbiddenKey(key)) throw new Error(`Forbidden serialized key at ${path}.${key}`);
      visit(entry, `${path}.${key}`);
    }
  };
  visit(value, "$fixture");
}

export function serializeRoleAwareFixture(fixture: RoleAwareFixture): string {
  assertFrontendSafeSerialization(fixture.projection);
  return stable(fixture.projection);
}

export function getRoleAwareFixture(id: string): RoleAwareFixture | undefined {
  return ROLE_AWARE_FIXTURES[id as RoleAwareFixtureId];
}

export const SUPPORTED_ROLE_AWARE_METRIC_IDS = SUPPORTED_METRICS;
export const UNSUPPORTED_ROLE_AWARE_METRIC_IDS = UNSUPPORTED_METRICS;
