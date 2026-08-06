import type { CanonicalObservableArtifact, CanonicalObservableSnapshot, ObservableAuthorization } from "./contracts";

const organizationId = "fidelity-org-001";
const base = (input: Partial<CanonicalObservableArtifact> & Pick<CanonicalObservableArtifact, "id" | "kind" | "statement">): CanonicalObservableArtifact => ({ organizationId, confidence: null, supportingEvidenceIds: [], opposingEvidenceIds: [], competingArtifactIds: [], unresolved: false, priority: null, expectedUtility: null, justification: null, understandingRefs: [`organization:${organizationId}:understanding:2`], changedFromArtifactId: null, observedAt: "2026-07-31T20:00:00.000Z", ...input });

export const goldenSnapshot: CanonicalObservableSnapshot = {
  contractVersion: "1", organizationId, evidenceIds: ["e-support", "e-oppose", "e-private"],
  artifacts: [
    base({ id: "finding-1", kind: "finding", statement: "Approval timing constrains onboarding handoffs.", confidence: 0.72, supportingEvidenceIds: ["e-support"], changedFromArtifactId: "finding-0" }),
    base({ id: "condition-1", kind: "condition", statement: "Cross-functional handoffs are constrained.", confidence: 0.68, supportingEvidenceIds: ["e-support"], unresolved: true }),
    base({ id: "constraint-1", kind: "constraint", statement: "Approval timing is the principal current constraint.", confidence: 0.64, supportingEvidenceIds: ["e-support"], opposingEvidenceIds: ["e-oppose"] }),
    base({ id: "conclusion-1", kind: "conclusion", statement: "Onboarding delay is most consistent with late approval ownership.", confidence: 0.66, supportingEvidenceIds: ["e-support"], opposingEvidenceIds: ["e-oppose"] }),
    base({ id: "prediction-1", kind: "prediction", statement: "Earlier ownership may reduce handoff delay.", confidence: 0.58, supportingEvidenceIds: ["e-support"], unresolved: true }),
    base({ id: "contradiction-1", kind: "contradiction", statement: "Approval timing and credential readiness provide opposing explanations.", confidence: 0.61, supportingEvidenceIds: ["e-support"], opposingEvidenceIds: ["e-oppose"], unresolved: true, justification: "Both endpoints remain supported." }),
    base({ id: "mechanism-1", kind: "mechanism", statement: "Late ownership → delayed approval → delayed handoff", confidence: 0.7, supportingEvidenceIds: ["e-support"], opposingEvidenceIds: ["e-oppose"], competingArtifactIds: ["mechanism-2"], unresolved: true }),
    base({ id: "mechanism-2", kind: "mechanism", statement: "Credential unreadiness → blocked access → delayed handoff", confidence: 0.57, supportingEvidenceIds: ["e-oppose"], competingArtifactIds: ["mechanism-1"], unresolved: true }),
    base({ id: "uncertainty-1", kind: "uncertainty", statement: "The relative contribution of approval timing and credential readiness is unresolved.", confidence: 0.4, supportingEvidenceIds: ["e-support"], opposingEvidenceIds: ["e-oppose"], unresolved: true, priority: 0.8 }),
    base({ id: "gap-1", kind: "evidence-gap", statement: "Compare handoff duration where approval timing differs but credential readiness is equivalent.", expectedUtility: 0.24, priority: 1, justification: "This comparison directly discriminates the two mechanisms.", unresolved: true }),
    base({ id: "private-finding", kind: "finding", statement: "Restricted private observation.", supportingEvidenceIds: ["e-private"] }),
  ],
};

export const fullAuthorization: ObservableAuthorization = { organizationId, authorizedEvidenceIds: ["e-support", "e-oppose"], authorizedArtifactIds: goldenSnapshot.artifacts.filter((item) => item.id !== "private-finding").map((item) => item.id) };
export const organizationTwoAuthorization: ObservableAuthorization = { ...fullAuthorization, organizationId: "fidelity-org-002" };
