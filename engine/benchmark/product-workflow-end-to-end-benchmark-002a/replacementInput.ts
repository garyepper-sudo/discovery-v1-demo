import { createHash } from "node:crypto";
import type { MaterialAcquisitionCandidate, MaterialAcquisitionEstimate, MaterialInformationAcquisitionInput } from "../../../product/acquisition/contracts";
import type { ReplacementScenario } from "./types";

const at = "2026-08-02T18:00:00.000Z";
const available = <T>(value: T, sourceRef: string): MaterialAcquisitionEstimate<T> => ({ state: "available", value, sourceRef, qualification: "Frozen controlled holdout estimate; not outcome calibrated.", maturity: "synthetic" });
const canonical = (value: unknown): string => Array.isArray(value) ? `[${value.map(canonical).join(",")}]` : value && typeof value === "object" ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(",")}}` : JSON.stringify(value);
const hash = (value: unknown): string => createHash("sha256").update(canonical(value)).digest("hex");
const organizationId = "holdout-coldchain-009";
const unknownRef = "holdout-unknown-coldchain:v1";

function candidate(input: { id: string; information: "low" | "moderate" | "high"; relevance: "low" | "moderate" | "high"; discrimination: "low" | "moderate" | "high"; reliability: "low" | "moderate" | "high"; sourceRef: string }): MaterialAcquisitionCandidate {
  return { candidateId: input.id, actionType: "compare-existing-evidence", actionOwnerRef: "held-out-owner:coldchain-analysis", target: { kind: "controlled-held-out-information", targetRef: `target:${input.id}`, organizationId }, uncertaintyRef: unknownRef, materialEffectTargets: ["unknown", "answer"], eligibility: { ownerAvailable: true, targetAccessible: true, executionAvailable: true, authorizationSatisfied: true, governanceAllowed: true, consentState: "not-required", reasonCodes: ["material-effect-confirmed"] }, expectedInformationContribution: available(input.information, input.sourceRef), expectedOrganizationalRelevance: available(input.relevance, input.sourceRef), expectedDiscriminationGain: available(input.discrimination, input.sourceRef), burden: available("low", input.sourceRef), cost: available("none", input.sourceRef), delay: available("immediate", input.sourceRef), reliability: available(input.reliability, input.sourceRef), existingEvidenceQuality: available("high", input.sourceRef), reversibility: available("reversible", input.sourceRef), stoppingCondition: "Stop when overnight excursion mechanisms are materially distinguished.", expectedEvidenceLineage: { sourceKind: "controlled-held-out", sourceScopeRef: `scope:${input.id}`, admissionRequired: true } };
}

function selectorInput(revision: string, candidates: MaterialAcquisitionCandidate[]): MaterialInformationAcquisitionInput {
  return { contractVersion: "1", organizationId, questionId: "holdout-question-coldchain", understandingRevisionRef: revision, materialUncertainty: { unknownId: "holdout-unknown-coldchain", unknownVersionRef: unknownRef, status: "open", investigationOpportunityRef: "opportunity:coldchain" }, purpose: "improve-understanding", candidates, budgetContext: { maxBurden: "moderate", maxCost: "low", maxDelay: "short", irreversibleActionAllowed: false, materialPreferencesComplete: true, budgetExhausted: false, userDeclined: false }, authorizationContextRef: "authorization:coldchain:v1", governanceContextRefs: ["governance:coldchain:v1"], evaluatedAt: at };
}

const baselineCandidates = [candidate({ id: "coldchain-door-dwell", information: "high", relevance: "high", discrimination: "high", reliability: "high", sourceRef: "baseline-evidence:v1" }), candidate({ id: "coldchain-refrigeration", information: "moderate", relevance: "moderate", discrimination: "moderate", reliability: "moderate", sourceRef: "baseline-evidence:v1" })];
const revisedCandidates = [candidate({ id: "coldchain-door-dwell", information: "low", relevance: "moderate", discrimination: "low", reliability: "moderate", sourceRef: "outcome-admission:v1" }), candidate({ id: "coldchain-refrigeration", information: "high", relevance: "high", discrimination: "high", reliability: "high", sourceRef: "outcome-admission:v1" })];

const draft: Omit<ReplacementScenario, "scenarioHash"> = {
  id: "holdout-11-outcome-discrimination", status: "untouched-controlled-holdout", priorExposureCount: 0, organizationId,
  question: { id: "holdout-question-coldchain", revision: 1, text: "Why are cold-chain temperature excursions increasing during overnight loading?" },
  unknown: { id: "holdout-unknown-coldchain", revisionRef: unknownRef, text: "Whether dock-door dwell or refrigeration degradation is the dominant mechanism." },
  objective: { versionRef: "objective-coldchain:v1", statement: "Reduce overnight temperature excursions without interrupting safe loading." },
  optimizationContext: { versionRef: "context-coldchain:v1", summary: "Prefer reversible analysis of authorized operational records." },
  baselineUnderstanding: { revisionRef: "understanding-coldchain:v1", answer: "Extended dock-door dwell is the leading supported explanation for overnight excursions.", uncertainty: "Refrigeration degradation remains plausible but less supported.", mechanisms: ["dock-door dwell", "refrigeration degradation"] },
  baselineEvidence: [{ id: "coldchain-e1", statement: "Excursions co-occurred with long door-open intervals on overnight loads.", role: "supports", authorized: true }, { id: "coldchain-e2", statement: "Daytime refrigeration checks remained within range.", role: "shared", authorized: true }],
  baselineInput: selectorInput("understanding-coldchain:v1", baselineCandidates),
  materialOutcome: { outcomeId: "outcome-coldchain-door-control", version: 1, operationRef: "operation:door-control-pilot:v1", organizationId, authorized: true, observedAt: at, observation: "After the governed door-control pilot reduced open intervals, overnight excursions persisted while compressor-pressure alarms co-occurred.", lineage: ["operation:door-control-pilot:v1", "decision:coldchain-pilot:v1", "question:holdout-question-coldchain"] },
  resultingInformation: { informationId: "information-coldchain-outcome:v1", sourceOutcomeRef: "outcome-coldchain-door-control:v1", statement: "Reduced door dwell did not reduce excursions; compressor-pressure alarms tracked the remaining events." },
  evidenceCandidacy: { candidateId: "evidence-candidate-coldchain-outcome:v1", sourceInformationRef: "information-coldchain-outcome:v1", status: "candidate" },
  admittedEvidence: { id: "coldchain-e3", statement: "Excursions persisted after door dwell fell and co-occurred with compressor-pressure alarms.", role: "opposes", authorized: true, sourceOutcomeRef: "outcome-coldchain-door-control:v1", admissionReceiptRef: "evidence-admission:coldchain-e3:v1" },
  revisedUnderstanding: { revisionRef: "understanding-coldchain:v2", answer: "Refrigeration degradation is now the leading supported explanation; reduced door dwell did not resolve excursions.", uncertainty: "The exact refrigeration component remains unresolved.", mechanisms: ["refrigeration degradation", "dock-door dwell weakened"] },
  materialOutcomeInput: selectorInput("understanding-coldchain:v2", revisedCandidates),
  unrelatedOutcome: { outcomeId: "outcome-cafeteria-waste", version: 1, operationRef: "operation:cafeteria-waste:v1", organizationId, authorized: true, observedAt: at, observation: "A cafeteria waste-sorting pilot reduced landfill volume.", lineage: ["operation:cafeteria-waste:v1"] },
  unrelatedOutcomeInput: selectorInput("understanding-coldchain:v1", baselineCandidates),
  ambiguousFacts: ["The exact refrigeration component remains unlocalized."], withheld: ["technician-identities"], prohibitedRecommendations: ["Treat any Outcome assertion as Evidence without admission."], deterministicClock: at,
};

export const replacementScenario: ReplacementScenario = { ...draft, scenarioHash: hash(draft) };
