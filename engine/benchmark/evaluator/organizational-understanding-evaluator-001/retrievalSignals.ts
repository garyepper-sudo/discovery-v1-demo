import type { OrganizationalUnderstandingProposition, RecoveredProposition } from "./contracts";
import { compareConfidence } from "./confidenceNormalization";
import { PHASE_3_FEATURE_VERSION, type Phase3FeatureObservation } from "./phase3Contracts";

const tokens = (value: string) => [...new Set(value.toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim().split(/\s+/u).filter((token) => token.length > 2))].sort();
const intersection = (left: readonly string[], right: readonly string[]) => {
  const rightSet = new Set(right);
  return [...new Set(left.filter((value) => rightSet.has(value)))].sort();
};
const overlap = (left: readonly string[], right: readonly string[]) => {
  const shared = intersection(left, right);
  return { value: shared.length / Math.max(new Set([...left, ...right]).size, 1), references: shared };
};
const observation = (feature: Phase3FeatureObservation["feature"], value: number, references: string[]): Phase3FeatureObservation => ({ feature, featureVersion: PHASE_3_FEATURE_VERSION, value: Number(value.toFixed(6)), references: [...references].sort() });

export function collectPhase3Features(recovered: RecoveredProposition, truth: OrganizationalUnderstandingProposition): Phase3FeatureObservation[] {
  const recoveredTokens = tokens(recovered.recoveredMeaning);
  const truthTokens = tokens(truth.canonicalMeaning);
  const tokenOverlap = overlap(recoveredTokens, truthTokens);
  const predicateOverlap = overlap(tokens(recovered.predicate), tokens(truth.predicate));
  const entityOverlap = overlap([...recovered.subjectRefs, ...recovered.objectRefs].sort(), [...truth.subjectRefs, ...truth.objectRefs].sort());
  const evidenceOverlap = overlap([...recovered.supportingEvidenceRefs, ...recovered.opposingEvidenceRefs].sort(), [...truth.supportingEvidenceRefs, ...truth.opposingEvidenceRefs].sort());
  const relationshipOverlap = overlap(recovered.relatedPropositionRefs, [...truth.contradictionEndpointRefs, ...truth.competingPropositionRefs]);
  const phraseContainment = recoveredTokens.join(" ").includes(truthTokens.join(" ")) || truthTokens.join(" ").includes(recoveredTokens.join(" ")) ? 1 : 0;
  const confidence = recovered.normalizedConfidence && truth.expectedConfidence ? compareConfidence({ ...recovered.normalizedConfidence, representation: "interval" }, truth.expectedConfidence).overlap : 0;
  const familySpecificRefs = truth.family === "contradiction" ? truth.contradictionEndpointRefs : truth.family === "mechanism" || truth.family === "evidence-gap" ? truth.competingPropositionRefs : truth.family === "prediction" ? [truth.temporality?.state ?? "unknown"] : [];
  const recoveredFamilyRefs = truth.family === "prediction" ? [recovered.temporality.state] : recovered.relatedPropositionRefs;
  const familySpecific = overlap(recoveredFamilyRefs, familySpecificRefs);
  return [
    observation("token-overlap", tokenOverlap.value, tokenOverlap.references),
    observation("phrase-containment", phraseContainment, []),
    observation("predicate-overlap", predicateOverlap.value, predicateOverlap.references),
    observation("entity-overlap", entityOverlap.value, entityOverlap.references),
    observation("evidence-overlap", evidenceOverlap.value, evidenceOverlap.references),
    observation("relationship-overlap", relationshipOverlap.value, relationshipOverlap.references),
    observation("confidence-overlap", confidence, []),
    observation("family-specific-overlap", familySpecific.value, familySpecific.references),
  ];
}
