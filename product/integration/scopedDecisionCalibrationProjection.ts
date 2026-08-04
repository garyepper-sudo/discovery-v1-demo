import { createHash } from "node:crypto";

import type { GovernedScopeRef, GovernedSensitivity, ScopedGovernanceContext } from "../../engine/v3/governance/scopedGovernanceContext";
import {
  evaluateScopedUnderstandingDisclosure,
  type ScopedDisclosureDerivedKind,
  type ScopedDisclosureSupport,
} from "../../engine/v3/understanding/scopedOrganizationalUnderstandingDisclosure";

export const SCOPED_DECISION_CALIBRATION_PROJECTION_VERSION = "1" as const;

export type DecisionCalibrationAxis =
  | "authority"
  | "strategic-relationship"
  | "evidence-support"
  | "local-feasibility"
  | "cross-scope-effect"
  | "strategy-challenge-potential"
  | "experiment-status"
  | "outcome-status";

export type DecisionCalibrationAxisValue = {
  authority: "authorized" | "authorized-bounded-experiment" | "requires-additional-authority" | "outside-authority" | "unresolved";
  "strategic-relationship": "consistent" | "materially-divergent" | "ambiguous" | "not-assessable";
  "evidence-support": "current-supported" | "explicitly-stale" | "mixed-or-contradicted" | "insufficient-authorized-evidence" | "unavailable";
  "local-feasibility": "feasible" | "constrained" | "infeasible" | "unknown";
  "cross-scope-effect": "compatible" | "material-conflict" | "unresolved" | "unavailable";
  "strategy-challenge-potential": "no-supported-challenge" | "may-require-strategy-review" | "insufficient-information";
  "experiment-status": "not-experiment" | "authorized-bounded-experiment" | "experimental-not-authorized" | "unresolved";
  "outcome-status": "not-yet-observed" | "supports-assumptions" | "weakens-assumptions" | "contradicts-assumptions" | "insufficient-authorized-information" | "unavailable";
};

export type ServerResolvedDecisionCalibrationSignal<A extends DecisionCalibrationAxis = DecisionCalibrationAxis> = {
  axis: A;
  value: DecisionCalibrationAxisValue[A];
  safeRef: string;
  organizationId: string;
  scope: GovernedScopeRef;
  sensitivity: GovernedSensitivity;
  derivedKind: ScopedDisclosureDerivedKind;
  support: ScopedDisclosureSupport[];
  supportLineageComplete: boolean;
  safeAbstractionAllowed: boolean;
  protectedCombination: boolean;
  safeReasonCode: string;
  auditRefs: string[];
};

export type ServerResolvedDecisionCalibrationInput = {
  organizationId: string;
  recipientId: string;
  decisionRef: string;
  decisionRevisionRef: string;
  decisionStatus: string;
  decisionOwnerRef: string;
  decisionScope: GovernedScopeRef;
  decisionTimeAuthorityRef: string;
  currentAuthorityRef: string;
  objectiveRevisionRef: string;
  optimizationContextRevisionRef: string;
  decisionTimeContextRevisionRef: string;
  canonicalInputs: {
    strategicAssumptionRefs: string[];
    localAssumptionRefs: string[];
    supportingEvidenceRefs: string[];
    contradictingEvidenceRefs: string[];
    organizationalUnderstandingRefs: string[];
    localConstraintRefs: string[];
    broaderConstraintRefs: string[];
    crossFunctionalDependencyRefs: string[];
    expectedOutcomeRef?: string;
    actualOutcomeRefs: string[];
    experimentAuthorizationRef?: string;
    experimentBoundsRef?: string;
    reversibilityRef?: string;
    disclosurePolicyRefs: string[];
  };
  signals: ServerResolvedDecisionCalibrationSignal[];
  divergenceExplanationSearchComplete: boolean;
  protectedCombination: boolean;
  auditRefs: string[];
};

export type DecisionCalibrationClassification =
  | "aligned-supported"
  | "aligned-stale"
  | "justified-divergence"
  | "unexplained-drift"
  | "ambiguous-strategic-intent"
  | "cross-scope-conflict"
  | "local-infeasibility"
  | "possible-strategy-invalidation"
  | "authorized-experiment"
  | "unauthorized-action"
  | "insufficient-authorized-information"
  | "withheld"
  | "unavailable";

export type ScopedDecisionCalibrationAxisResult = {
  axis: DecisionCalibrationAxis;
  disposition: "disclosed" | "withheld" | "unavailable" | "insufficient-authorized-information";
  value?: DecisionCalibrationAxisValue[DecisionCalibrationAxis];
  reasonCode: string;
  safeLineage: string[];
  auditRefs: string[];
};

export type ScopedDecisionCalibrationProjection = {
  projectionId: string;
  contractVersion: typeof SCOPED_DECISION_CALIBRATION_PROJECTION_VERSION;
  organizationId: string;
  recipientId: string;
  decisionRef: string;
  decisionRevisionRef: string;
  objectiveRevisionRef: string;
  optimizationContextRevisionRef: string;
  requestedScope: GovernedScopeRef;
  purpose: string;
  evaluatedAt: string;
  temporalMode: "current" | "historical";
  classification: DecisionCalibrationClassification;
  axes: ScopedDecisionCalibrationAxisResult[];
  safeReasonCodes: string[];
  safeSupportingLineage: string[];
  uncertainty: "none-declared" | "authorized-information-incomplete" | "protected-meaning-withheld" | "outcome-not-observed";
  missingAuthorizedInformation: DecisionCalibrationAxis[];
  reviewRequired: boolean;
  executionAuthorized: false;
  auditRefs: string[];
};

const AXES: DecisionCalibrationAxis[] = [
  "authority", "strategic-relationship", "evidence-support", "local-feasibility",
  "cross-scope-effect", "strategy-challenge-potential", "experiment-status", "outcome-status",
];
const REQUIRED_AXES = AXES.filter((axis) => axis !== "outcome-status");
const compare = (left: string, right: string): number => left.localeCompare(right);
const exact = (value: string): boolean => value.trim() === value && value.length > 0 && value !== "*";
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => compare(a, b)).map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`).join(",")}}`;
  return JSON.stringify(value);
}
function sameScope(left: GovernedScopeRef, right: GovernedScopeRef): boolean {
  return left.organizationId === right.organizationId && left.type === right.type && left.id === right.id;
}

function classify(values: Partial<{ [A in DecisionCalibrationAxis]: DecisionCalibrationAxisValue[A] }>, explanationSearchComplete: boolean): DecisionCalibrationClassification {
  const authority = values.authority;
  const strategic = values["strategic-relationship"];
  const evidence = values["evidence-support"];
  const feasibility = values["local-feasibility"];
  const crossScope = values["cross-scope-effect"];
  const challenge = values["strategy-challenge-potential"];
  const experiment = values["experiment-status"];
  if (authority === "outside-authority" || authority === "requires-additional-authority" || experiment === "experimental-not-authorized") return "unauthorized-action";
  if (!authority || authority === "unresolved") return "insufficient-authorized-information";
  if (strategic === "ambiguous") return "ambiguous-strategic-intent";
  if (!strategic || strategic === "not-assessable") return "insufficient-authorized-information";
  if (strategic === "materially-divergent" && authority === "authorized-bounded-experiment" && experiment === "authorized-bounded-experiment") return "authorized-experiment";
  if (crossScope === "material-conflict") return "cross-scope-conflict";
  if (strategic === "consistent" && (feasibility === "infeasible" || feasibility === "constrained")) return "local-infeasibility";
  if (strategic === "materially-divergent" && challenge === "may-require-strategy-review" && (evidence === "current-supported" || evidence === "mixed-or-contradicted")) return "possible-strategy-invalidation";
  if (strategic === "materially-divergent" && evidence === "current-supported") return "justified-divergence";
  if (strategic === "materially-divergent" && explanationSearchComplete && evidence === "insufficient-authorized-evidence" && challenge === "no-supported-challenge" && experiment === "not-experiment") return "unexplained-drift";
  if (strategic === "consistent" && evidence === "explicitly-stale") return "aligned-stale";
  if (strategic === "consistent" && evidence === "current-supported" && feasibility === "feasible" && crossScope === "compatible") return "aligned-supported";
  return "insufficient-authorized-information";
}

/**
 * Produces advisory Product meaning from exact server-resolved inputs. It does
 * not authorize, recommend, approve, execute, escalate, score, or mutate.
 */
export function projectScopedDecisionCalibration(input: {
  authenticatedUserId: string;
  organizationId: string;
  context: ScopedGovernanceContext;
  serverResolved: ServerResolvedDecisionCalibrationInput;
}): ScopedDecisionCalibrationProjection {
  const { context, serverResolved } = input;
  const base = {
    contractVersion: SCOPED_DECISION_CALIBRATION_PROJECTION_VERSION,
    organizationId: input.organizationId,
    recipientId: context.subjectId,
    decisionRef: exact(serverResolved.decisionRef) ? serverResolved.decisionRef : "unavailable",
    decisionRevisionRef: exact(serverResolved.decisionRevisionRef) ? serverResolved.decisionRevisionRef : "unavailable",
    objectiveRevisionRef: exact(serverResolved.objectiveRevisionRef) ? serverResolved.objectiveRevisionRef : "unavailable",
    optimizationContextRevisionRef: exact(serverResolved.optimizationContextRevisionRef) ? serverResolved.optimizationContextRevisionRef : "unavailable",
    requestedScope: structuredClone(context.requestedScope), purpose: context.purpose,
    evaluatedAt: context.evaluatedAt, temporalMode: context.temporal.mode,
  };
  const finish = (classification: DecisionCalibrationClassification, axes: ScopedDecisionCalibrationAxisResult[], reasonCodes: string[]): ScopedDecisionCalibrationProjection => {
    const missingAuthorizedInformation = REQUIRED_AXES.filter((axis) => !axes.some((result) => result.axis === axis && result.disposition === "disclosed"));
    const safeSupportingLineage = [...new Set(axes.flatMap((axis) => axis.safeLineage))].sort(compare);
    const auditRefs = [...new Set([...serverResolved.auditRefs, ...axes.flatMap((axis) => axis.auditRefs)])].sort(compare);
    const safe = {
      ...base, classification, axes: [...axes].sort((a, b) => compare(a.axis, b.axis)),
      safeReasonCodes: [...new Set(reasonCodes)].sort(compare), safeSupportingLineage,
      uncertainty: classification === "withheld" ? "protected-meaning-withheld" as const
        : classification === "insufficient-authorized-information" || classification === "unavailable" ? "authorized-information-incomplete" as const
        : axes.find((axis) => axis.axis === "outcome-status")?.value === "not-yet-observed" || axes.find((axis) => axis.axis === "outcome-status")?.value === "unavailable" ? "outcome-not-observed" as const
        : "none-declared" as const,
      missingAuthorizedInformation, reviewRequired: ["ambiguous-strategic-intent", "cross-scope-conflict", "possible-strategy-invalidation", "unauthorized-action"].includes(classification),
      executionAuthorized: false as const, auditRefs,
    };
    return { projectionId: `scoped-decision-calibration:${createHash("sha256").update(stable(safe)).digest("hex")}`, ...safe };
  };

  if (context.disposition !== "authorized" || context.subjectId !== input.authenticatedUserId || serverResolved.recipientId !== context.subjectId) return finish("withheld", [], ["current-authority-denied"]);
  if (context.organizationId !== input.organizationId || serverResolved.organizationId !== input.organizationId || !sameScope(serverResolved.decisionScope, context.requestedScope)) return finish("withheld", [], ["organization-or-scope-mismatch"]);
  if ([serverResolved.decisionRef, serverResolved.decisionRevisionRef, serverResolved.decisionStatus, serverResolved.decisionOwnerRef, serverResolved.decisionTimeAuthorityRef, serverResolved.currentAuthorityRef, serverResolved.objectiveRevisionRef, serverResolved.optimizationContextRevisionRef, serverResolved.decisionTimeContextRevisionRef].some((value) => !exact(value))) return finish("insufficient-authorized-information", [], ["required-canonical-reference-missing"]);
  if (context.temporal.mode === "historical" && context.temporal.revisionRef !== serverResolved.decisionTimeContextRevisionRef) return finish("insufficient-authorized-information", [], ["historical-lineage-unresolved"]);

  const canonicalRefs = Object.values(serverResolved.canonicalInputs).flatMap((value) =>
    Array.isArray(value) ? value : value ? [value] : [],
  );
  if (canonicalRefs.some((ref) => !exact(ref))) return finish("insufficient-authorized-information", [], ["canonical-input-reference-invalid"]);
  const supportedRefs = new Set(serverResolved.signals.flatMap((signal) => signal.support.map((item) => item.safeRef)));
  if (canonicalRefs.some((ref) => !supportedRefs.has(ref))) return finish("insufficient-authorized-information", [], ["canonical-input-lineage-incomplete"]);

  const byAxis = new Map<DecisionCalibrationAxis, ServerResolvedDecisionCalibrationSignal>();
  for (const signal of [...serverResolved.signals].sort((a, b) => compare(stable([a.axis, a.safeRef]), stable([b.axis, b.safeRef])))) {
    const prior = byAxis.get(signal.axis);
    if (prior && stable(prior) !== stable(signal)) return finish("insufficient-authorized-information", [], ["conflicting-axis-inputs"]);
    byAxis.set(signal.axis, signal);
  }
  const axes: ScopedDecisionCalibrationAxisResult[] = [];
  for (const axis of AXES) {
    const signal = byAxis.get(axis);
    if (!signal) {
      axes.push({ axis, disposition: axis === "outcome-status" ? "unavailable" : "insufficient-authorized-information", reasonCode: "axis-input-unavailable", safeLineage: [], auditRefs: [] });
      continue;
    }
    const direct = evaluateScopedUnderstandingDisclosure({ requestRef: signal.safeRef, organizationId: signal.organizationId, recipientId: context.subjectId, scope: signal.scope, sensitivity: signal.sensitivity, kind: "direct-evidence", support: signal.support, supportLineageComplete: signal.supportLineageComplete, safeAbstractionAllowed: false, protectedCombination: signal.protectedCombination, context });
    const derived = evaluateScopedUnderstandingDisclosure({ requestRef: signal.safeRef, organizationId: signal.organizationId, recipientId: context.subjectId, scope: signal.scope, sensitivity: signal.sensitivity, kind: signal.derivedKind, support: signal.support, supportLineageComplete: signal.supportLineageComplete, safeAbstractionAllowed: signal.safeAbstractionAllowed, protectedCombination: signal.protectedCombination, context });
    const disclosed = direct.disposition === "disclosed" && derived.disposition === "disclosed";
    const disposition = disclosed ? "disclosed" : direct.disposition === "unavailable" || derived.disposition === "unavailable" ? "unavailable" : direct.disposition === "insufficient-authorized-information" || derived.disposition === "insufficient-authorized-information" ? "insufficient-authorized-information" : "withheld";
    axes.push({ axis, disposition, ...(disclosed ? { value: signal.value } : {}), reasonCode: disclosed ? signal.safeReasonCode : derived.reason, safeLineage: disclosed ? [...new Set([...direct.safeDisclosedLineage, ...derived.safeDisclosedLineage])].sort(compare) : [], auditRefs: [...new Set([...signal.auditRefs, direct.decisionId, derived.decisionId])].sort(compare) });
  }
  if (serverResolved.protectedCombination || axes.some((axis) => axis.disposition === "withheld")) return finish("withheld", axes.map((axis) => axis.disposition === "disclosed" ? { ...axis, value: undefined, safeLineage: [] } : axis), ["protected-derived-meaning"]);
  if (REQUIRED_AXES.some((required) => axes.find((axis) => axis.axis === required)?.disposition !== "disclosed")) return finish("insufficient-authorized-information", axes, ["required-authorized-information-incomplete"]);
  const values = Object.fromEntries(axes.filter((axis) => axis.disposition === "disclosed").map((axis) => [axis.axis, axis.value])) as Partial<{ [A in DecisionCalibrationAxis]: DecisionCalibrationAxisValue[A] }>;
  if (
    values["experiment-status"] === "authorized-bounded-experiment"
    && (!serverResolved.canonicalInputs.experimentAuthorizationRef
      || !serverResolved.canonicalInputs.experimentBoundsRef
      || !serverResolved.canonicalInputs.expectedOutcomeRef)
  ) return finish("insufficient-authorized-information", axes, ["bounded-experiment-canonical-inputs-incomplete"]);
  const classification = classify(values, serverResolved.divergenceExplanationSearchComplete);
  return finish(classification, axes, [`classification:${classification}`, ...axes.map((axis) => axis.reasonCode)]);
}
