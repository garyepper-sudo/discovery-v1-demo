import type { MaterialAcquisitionEstimate } from "../contracts";
import type { CalibrationPreregistrationManifest, DeclaredValue } from "./contracts";

export type CalibrationPacketValue = {
  state: "available" | "unavailable" | "withheld" | "not-applicable";
  value: string | null;
  qualification: string | null;
};

export type CalibrationHumanPacket = {
  caseId: string;
  whatWeAreTryingToUnderstand: { question: string; unknown: string };
  whyTheUncertaintyMatters: string;
  currentAuthorizedUnderstanding: string;
  governedContext: { objective: string; optimizationContext: string };
  availableInformationActions: Array<{
    candidateId: string;
    actionType: string;
    whatTheActionWouldExamine: string;
    whatTheActionMayHelpDiscoveryLearn: string;
    expectedRelevance: CalibrationPacketValue;
    expectedInformationContribution: CalibrationPacketValue;
    expectedDiscriminationGain: CalibrationPacketValue;
    humanBurden: CalibrationPacketValue;
    organizationalBurden: CalibrationPacketValue;
    expectedDirectCost: CalibrationPacketValue;
    expectedDelay: CalibrationPacketValue;
    expectedReliability: CalibrationPacketValue;
    reversibility: CalibrationPacketValue;
    cancellation: { supported: boolean; characteristics: string };
    governance: { allowed: boolean; reasonCodes: string[] };
    authorization: { satisfied: boolean; consentState: string; reasonCodes: string[] };
    requiredSourceAccess: Array<{ sourceScope: string; authorization: string; state: string }>;
    privacyOrDisclosureConstraints: string[];
    resourceConstraints: string[];
    materialAssumptions: string[];
    unavailableFields: string[];
    withheldFields: string[];
    stoppingCondition: string;
    limitations: string[];
    truthfulLimitation: "No result, Evidence admission, Unknown reduction, confidence improvement, or organizational improvement is guaranteed.";
  }>;
  materialDifferencesAndLimitations: "Compare only the governed fields shown for each action. Unavailable and withheld fields are not favorable evidence.";
  independentHumanResponse: string;
};

function declared(value: DeclaredValue): string {
  return typeof value === "string" ? value : value.state;
}

function packetValue<T>(estimate: MaterialAcquisitionEstimate<T>): CalibrationPacketValue {
  if (estimate.state === "available") {
    return { state: "available", value: String(estimate.value), qualification: estimate.qualification };
  }
  if (estimate.state === "permission-withheld" || estimate.state === "intentionally-undisclosed") {
    return { state: "withheld", value: null, qualification: null };
  }
  if (estimate.state === "not-applicable") {
    return { state: "not-applicable", value: null, qualification: null };
  }
  const detail = "reason" in estimate ? estimate.reason : estimate.state;
  return { state: "unavailable", value: null, qualification: detail };
}

const noneDeclared = (items: string[], label: string) => items.length ? [...items] : [`No ${label} declared in the governed envelope.`];

export function renderCalibrationHumanPacket(manifest: CalibrationPreregistrationManifest): CalibrationHumanPacket {
  const byId = new Map(manifest.candidateEnvelopes.map((item) => [item.envelope.candidate.candidateId, item]));
  return {
    caseId: manifest.caseId,
    whatWeAreTryingToUnderstand: { question: manifest.question.exactText, unknown: manifest.unknown.exactText },
    whyTheUncertaintyMatters: manifest.unknown.whyItMatters,
    currentAuthorizedUnderstanding: manifest.authorizedUnderstandingSummary,
    governedContext: { objective: declared(manifest.objectiveVersion), optimizationContext: declared(manifest.optimizationContextVersion) },
    availableInformationActions: manifest.neutralDisplayOrder.map((candidateId) => {
      const item = byId.get(candidateId);
      if (!item) throw new Error("Calibration packet candidate is unavailable.");
      const envelope = item.envelope;
      const reasons = [...envelope.candidate.eligibility.reasonCodes].sort();
      return {
        candidateId,
        actionType: envelope.candidate.actionType,
        whatTheActionWouldExamine: item.neutralDescription,
        whatTheActionMayHelpDiscoveryLearn: envelope.expectedInformationClass,
        expectedRelevance: packetValue(envelope.candidate.expectedOrganizationalRelevance),
        expectedInformationContribution: packetValue(envelope.candidate.expectedInformationContribution),
        expectedDiscriminationGain: packetValue(envelope.candidate.expectedDiscriminationGain),
        humanBurden: packetValue(envelope.humanBurden),
        organizationalBurden: packetValue(envelope.organizationalBurden),
        expectedDirectCost: packetValue(envelope.candidate.cost),
        expectedDelay: packetValue(envelope.candidate.delay),
        expectedReliability: packetValue(envelope.candidate.reliability),
        reversibility: packetValue(envelope.candidate.reversibility),
        cancellation: { ...envelope.cancellation },
        governance: { allowed: envelope.candidate.eligibility.governanceAllowed, reasonCodes: reasons },
        authorization: { satisfied: envelope.candidate.eligibility.authorizationSatisfied, consentState: envelope.candidate.eligibility.consentState, reasonCodes: reasons },
        requiredSourceAccess: envelope.requiredSourceAccess.length
          ? envelope.requiredSourceAccess.map((source) => source.state === "withheld"
            ? { sourceScope: "withheld", authorization: "withheld", state: "withheld" }
            : { sourceScope: source.sourceScopeRef, authorization: source.authorizationRef ?? "not-required", state: source.state })
          : [{ sourceScope: "No required source access declared in the governed envelope.", authorization: "not-required", state: "not-required" }],
        privacyOrDisclosureConstraints: noneDeclared(envelope.privacyConstraints, "privacy or disclosure constraints"),
        resourceConstraints: noneDeclared(envelope.resourceConstraintRefs, "resource constraints"),
        materialAssumptions: noneDeclared(envelope.assumptions, "material assumptions"),
        unavailableFields: noneDeclared(envelope.unavailableFields, "unavailable fields"),
        withheldFields: envelope.withheldFields.length ? envelope.withheldFields.map(() => "withheld") : ["No withheld fields declared in the governed envelope."],
        stoppingCondition: envelope.candidate.stoppingCondition,
        limitations: [...item.limitations],
        truthfulLimitation: "No result, Evidence admission, Unknown reduction, confidence improvement, or organizational improvement is guaranteed." as const,
      };
    }),
    materialDifferencesAndLimitations: "Compare only the governed fields shown for each action. Unavailable and withheld fields are not favorable evidence.",
    independentHumanResponse: `CALIBRATION CASE 002 — INDEPENDENT HUMAN DECISION

Disposition:
- authorize
- decline
- defer

Candidate ID:
Required only when disposition is authorize.

Human rationale:
Optional, but encouraged.

Material preference not represented in the displayed context:
Use "none" when there is none.

Execution authorization:
- do-not-execute
- execute-existing-local-read-only-operation
- defer-execution

- do-not-execute:
  Record the human choice only. Do not perform the operation.

- execute-existing-local-read-only-operation:
  Perform the selected operation only when it is already implemented,
  separately authorized, local, read-only, non-connector, non-external, and
  reversible under its existing owner.

- defer-execution:
  Preserve the human disposition but defer operation execution until a
  separate future authorization.`,
  };
}
