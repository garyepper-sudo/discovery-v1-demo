import { createHash } from "node:crypto";
import type { GroundTruthPropositionGraph, OrganizationalUnderstandingProposition, RecoveredProposition, RecoveredPropositionGraph, SemanticAdjudication } from "./contracts";

const organizationId = "evaluator-fixture-org";
const caseId = "evaluator-fixture-case";
const proposition = (input: Partial<OrganizationalUnderstandingProposition> & Pick<OrganizationalUnderstandingProposition, "id" | "family" | "canonicalMeaning" | "predicate">): OrganizationalUnderstandingProposition => ({
  organizationId, caseId, subjectRefs: ["customer-onboarding"], objectRefs: [], polarity: "affirmed", modality: "inferred", importance: 0.8, decisionRelevance: 0.8,
  supportingEvidenceRefs: ["evidence-1"], opposingEvidenceRefs: [], contradictionEndpointRefs: [], competingPropositionRefs: [], authorizationScope: ["benchmark-reviewer"], requiredForCoverage: true,
  allowedEquivalentMeanings: [], prohibitedInterpretations: [], ...input,
});

const groundTruthPropositions: OrganizationalUnderstandingProposition[] = [
    proposition({ id: "finding-1", family: "finding", canonicalMeaning: "Approval ownership begins after customer handoff.", predicate: "begins-after", modality: "observed", allowedEquivalentMeanings: ["Customers are handed over before an approval owner is assigned."], prohibitedInterpretations: ["Approval ownership begins before handoff."] }),
    proposition({ id: "condition-1", family: "condition", canonicalMeaning: "Customer onboarding handoffs are operationally constrained.", predicate: "currently-constrained", allowedEquivalentMeanings: ["The current onboarding transfer process is constrained."], prohibitedInterpretations: ["Onboarding handoffs are unconstrained."] }),
    proposition({ id: "constraint-1", family: "constraint", canonicalMeaning: "Approval ownership timing is the principal current constraint.", predicate: "principal-constraint", allowedEquivalentMeanings: ["Late assignment of the sign-off owner is the main present limitation."], prohibitedInterpretations: ["Credential readiness is certainly the sole constraint."] }),
    proposition({ id: "conclusion-1", family: "conclusion", canonicalMeaning: "Late approval ownership best explains the currently supported share of handoff delay.", predicate: "best-supported-explanation", allowedEquivalentMeanings: ["The evidence currently favors delayed assignment of sign-off responsibility as the explanation."], prohibitedInterpretations: ["Late approval ownership explains every delay."] }),
    proposition({ id: "prediction-1", family: "prediction", canonicalMeaning: "Earlier approval ownership may reduce onboarding handoff duration.", predicate: "may-reduce-duration", modality: "predictive", allowedEquivalentMeanings: ["Assigning the sign-off owner sooner is expected to shorten customer transfer time."], prohibitedInterpretations: ["Earlier approval ownership is guaranteed to eliminate delay."] }),
    proposition({ id: "contradiction-1", family: "contradiction", canonicalMeaning: "Approval timing and credential readiness remain competing explanations.", predicate: "competing-explanations", polarity: "mixed", contradictionEndpointRefs: ["mechanism-1", "mechanism-2"], competingPropositionRefs: ["mechanism-1", "mechanism-2"], allowedEquivalentMeanings: ["The evidence still supports both late sign-off ownership and access readiness as alternatives."], prohibitedInterpretations: ["The two explanations agree and are fully resolved."] }),
    proposition({ id: "mechanism-1", family: "mechanism", canonicalMeaning: "Late approval ownership delays onboarding handoffs.", predicate: "causally-delays", modality: "causal", expectedConfidence: { minimum: 0.6, target: 0.72, maximum: 0.8 }, competingPropositionRefs: ["mechanism-2"], allowedEquivalentMeanings: ["Assigning sign-off responsibility late makes customer transfers take longer."], prohibitedInterpretations: ["Approval timing is merely correlated with delay."] }),
    proposition({ id: "uncertainty-1", family: "uncertainty", canonicalMeaning: "The relative contribution of approval timing and credential readiness is unresolved.", predicate: "relative-contribution-unknown", polarity: "unresolved", modality: "unknown", opposingEvidenceRefs: ["evidence-2"], allowedEquivalentMeanings: ["Current evidence cannot determine which of the two constraints contributes more."], prohibitedInterpretations: ["Approval timing is certainly the sole cause."] }),
    proposition({ id: "gap-1", family: "evidence-gap", canonicalMeaning: "Compare handoff duration while varying approval timing and holding credential readiness constant.", predicate: "discriminating-comparison-needed", modality: "hypothetical", allowedEquivalentMeanings: ["Hold access preparation equal and compare transfer times for early versus late sign-off ownership."], prohibitedInterpretations: ["Collect unrelated marketing engagement data."] }),
    proposition({ id: "implication-1", family: "implication", canonicalMeaning: "Test earlier approval ownership before redesigning the full onboarding process.", predicate: "decision-test-first", decisionRelevance: 1, allowedEquivalentMeanings: ["Try assigning the sign-off owner sooner before undertaking a complete process redesign."], prohibitedInterpretations: ["Immediately replace the entire onboarding process."] }),
];

export const phase1GroundTruthFixture: GroundTruthPropositionGraph = {
  schemaVersion: "ground-truth-proposition-graph/v1", evaluatorVersion: "oue-001-phase-1", organizationId, caseId, frozenBeforeTreatmentObservation: true,
  propositions: groundTruthPropositions,
  graphHash: createHash("sha256").update(JSON.stringify(groundTruthPropositions)).digest("hex"),
};

const recovered = (input: Partial<RecoveredProposition> & Pick<RecoveredProposition, "id" | "family" | "recoveredMeaning" | "predicate">): RecoveredProposition => ({
  sourceClaimRefs: [input.id.replace("recovered", "claim")], organizationId, caseId, subjectRefs: ["customer-onboarding"], objectRefs: [], polarity: "affirmed", modality: "inferred",
  temporality: { state: "current" }, normalizedConfidence: null, supportingEvidenceRefs: ["evidence-1"], opposingEvidenceRefs: [], relatedPropositionRefs: [], authorizationScope: ["benchmark-reviewer"], ...input,
});

export const phase1RecoveredFixture: RecoveredPropositionGraph = {
  schemaVersion: "recovered-proposition-graph/v1", evaluatorVersion: "oue-001-phase-1", organizationId, caseId, treatmentRunId: "redacted-treatment-run", inputHash: "fixture-treatment-input-hash",
  propositions: [
    recovered({ id: "recovered-finding-1", family: "finding", recoveredMeaning: "Customers are handed over before an approval owner is assigned.", predicate: "begins-after", modality: "observed" }),
    recovered({ id: "recovered-condition-1", family: "condition", recoveredMeaning: "The current onboarding transfer process is constrained.", predicate: "currently-constrained" }),
    recovered({ id: "recovered-constraint-1", family: "constraint", recoveredMeaning: "Late assignment of the sign-off owner is the main present limitation.", predicate: "principal-constraint" }),
    recovered({ id: "recovered-conclusion-1", family: "conclusion", recoveredMeaning: "The evidence currently favors delayed assignment of sign-off responsibility as the explanation.", predicate: "best-supported-explanation" }),
    recovered({ id: "recovered-prediction-1", family: "prediction", recoveredMeaning: "Assigning the sign-off owner sooner is expected to shorten customer transfer time.", predicate: "may-reduce-duration", modality: "predictive" }),
    recovered({ id: "recovered-contradiction-1", family: "contradiction", recoveredMeaning: "The evidence still supports both late sign-off ownership and access readiness as alternatives.", predicate: "competing-explanations", polarity: "mixed", relatedPropositionRefs: ["recovered-mechanism-1", "recovered-mechanism-2"] }),
    recovered({ id: "recovered-mechanism-1", family: "mechanism", recoveredMeaning: "Assigning sign-off responsibility late makes customer transfers take longer.", predicate: "causally-delays", modality: "causal", normalizedConfidence: { minimum: 0.6, maximum: 0.8 } }),
    recovered({ id: "recovered-uncertainty-1", family: "uncertainty", recoveredMeaning: "Current evidence cannot determine which constraint contributes more.", predicate: "relative-contribution-unknown", polarity: "unresolved", modality: "unknown", opposingEvidenceRefs: ["evidence-2"] }),
    recovered({ id: "recovered-gap-1", family: "evidence-gap", recoveredMeaning: "Hold access preparation equal and compare transfer times for early versus late sign-off ownership.", predicate: "discriminating-comparison-needed", modality: "hypothetical" }),
    recovered({ id: "recovered-implication-1", family: "implication", recoveredMeaning: "Try assigning the sign-off owner sooner before undertaking a complete process redesign.", predicate: "decision-test-first" }),
  ],
  duplicates: [{ canonicalRecoveredPropositionId: "recovered-finding-1", duplicateCount: 2, duplicatedSurfaceForms: ["Approval ownership starts late.", "The approval owner is assigned after handoff."] }], recoveryWarnings: [],
};

export const phase1ExpectedAdjudicationFixtures: Array<{ name: string; groundTruthPropositionId: string; recoveredPropositionId?: string; expectedClassification: SemanticAdjudication["classification"]; expectedHumanReview: boolean }> = [
  { name: "plain-language equivalence", groundTruthPropositionId: "finding-1", recoveredPropositionId: "recovered-finding-1", expectedClassification: "equivalent", expectedHumanReview: false },
  { name: "condition equivalence", groundTruthPropositionId: "condition-1", recoveredPropositionId: "recovered-condition-1", expectedClassification: "equivalent", expectedHumanReview: false },
  { name: "constraint equivalence", groundTruthPropositionId: "constraint-1", recoveredPropositionId: "recovered-constraint-1", expectedClassification: "equivalent", expectedHumanReview: false },
  { name: "conclusion equivalence", groundTruthPropositionId: "conclusion-1", recoveredPropositionId: "recovered-conclusion-1", expectedClassification: "equivalent", expectedHumanReview: false },
  { name: "prediction equivalence", groundTruthPropositionId: "prediction-1", recoveredPropositionId: "recovered-prediction-1", expectedClassification: "equivalent", expectedHumanReview: false },
  { name: "contradiction equivalence", groundTruthPropositionId: "contradiction-1", recoveredPropositionId: "recovered-contradiction-1", expectedClassification: "equivalent", expectedHumanReview: false },
  { name: "causal paraphrase equivalence", groundTruthPropositionId: "mechanism-1", recoveredPropositionId: "recovered-mechanism-1", expectedClassification: "equivalent", expectedHumanReview: false },
  { name: "uncertainty equivalence", groundTruthPropositionId: "uncertainty-1", recoveredPropositionId: "recovered-uncertainty-1", expectedClassification: "equivalent", expectedHumanReview: false },
  { name: "evidence-gap equivalence", groundTruthPropositionId: "gap-1", recoveredPropositionId: "recovered-gap-1", expectedClassification: "equivalent", expectedHumanReview: false },
  { name: "implication equivalence", groundTruthPropositionId: "implication-1", recoveredPropositionId: "recovered-implication-1", expectedClassification: "equivalent", expectedHumanReview: false },
  { name: "polarity distinction", groundTruthPropositionId: "finding-1", recoveredPropositionId: "denied-finding", expectedClassification: "contradictory", expectedHumanReview: false },
  { name: "causal modality distinction", groundTruthPropositionId: "mechanism-1", recoveredPropositionId: "correlation-only", expectedClassification: "partial", expectedHumanReview: false },
  { name: "unresolved material ambiguity", groundTruthPropositionId: "mechanism-1", recoveredPropositionId: "ambiguous-mechanism", expectedClassification: "ambiguous", expectedHumanReview: true },
];
