import type { CandidateDefinition, CandidateEvent, CandidatePermission, CandidateWorld, TimeStep } from "./candidateEcologyTypes";

const candidate = (id: string, semanticId: string, values: Partial<CandidateDefinition> = {}): CandidateDefinition => ({
  id, semanticId, scopeId: "team-a", contributorId: "user-a", purpose: "organizational-learning",
  restricted: false, localOnly: false, aiGenerated: false, ...values,
});
const event = (id: string, at: TimeStep, kind: CandidateEvent["kind"], candidateId: string, rootSourceIds: string[] = [], values: Partial<CandidateEvent> = {}): CandidateEvent => ({
  id, at, kind, candidateId, rootSourceIds, ...values,
});
const permission = (principalId: string, scopeId: string, level: CandidatePermission["level"], purpose = "organizational-learning", activeUntil?: TimeStep): CandidatePermission => ({
  principalId, scopeId, purpose, level, activeUntil,
});
const commonPermissions = [
  permission("user-a", "team-a", "raw"),
  permission("user-b", "team-b", "raw"),
  permission("manager", "organization", "raw"),
];

export function createCandidateWorlds(): CandidateWorld[] {
  return [
    {
      id: "weak-later-validated", partition: "development", organizationId: "candidate-ecology-org",
      candidates: [candidate("candidate-w1", "insight-w1")],
      events: [
        event("w1-propose", "T1", "propose", "candidate-w1"),
        event("w1-support-a", "T2", "support", "candidate-w1", ["source-w1-a"]),
        event("w1-support-b", "T3", "support", "candidate-w1", ["source-w1-b"]),
      ],
      permissions: commonPermissions,
      expected: { eventuallyPromoted: ["candidate-w1"], neverPromoted: [], viableAlternatives: [], localExceptions: [], emergentCandidates: [], correctFinalAuthority: ["candidate-w1"] },
    },
    {
      id: "ai-hallucination", partition: "development", organizationId: "candidate-ecology-org",
      candidates: [candidate("candidate-w2", "insight-w2", { aiGenerated: true })],
      events: [
        event("w2-propose", "T1", "propose", "candidate-w2"),
        event("w2-repeat-a", "T2", "support", "candidate-w2", ["ai-origin-w2"]),
        event("w2-repeat-b", "T3", "support", "candidate-w2", ["ai-origin-w2"]),
        event("w2-repeat-c", "T4", "support", "candidate-w2", ["ai-origin-w2"]),
        event("w2-contradict", "T5", "contradict", "candidate-w2", ["source-w2-counter"]),
        event("w2-expire", "T6", "expire", "candidate-w2"),
      ],
      permissions: commonPermissions,
      expected: { eventuallyPromoted: [], neverPromoted: ["candidate-w2"], viableAlternatives: [], localExceptions: [], emergentCandidates: [], correctFinalAuthority: [] },
    },
    {
      id: "partial-combination", partition: "held-out", organizationId: "candidate-ecology-org",
      candidates: [
        candidate("candidate-w3-a", "partial-w3-a", { scopeId: "team-a" }),
        candidate("candidate-w3-b", "partial-w3-b", { scopeId: "team-b", contributorId: "user-b" }),
        candidate("candidate-w3-combined", "insight-w3", { scopeId: "organization", contributorId: "manager" }),
      ],
      events: [
        event("w3-propose-a", "T1", "propose", "candidate-w3-a"),
        event("w3-support-a", "T2", "support", "candidate-w3-a", ["source-w3-a"]),
        event("w3-propose-b", "T1", "propose", "candidate-w3-b"),
        event("w3-support-b", "T2", "support", "candidate-w3-b", ["source-w3-b"]),
        event("w3-combine", "T4", "combine", "candidate-w3-combined", [], { relatedCandidateIds: ["candidate-w3-a", "candidate-w3-b"] }),
      ],
      permissions: commonPermissions,
      expected: { eventuallyPromoted: ["candidate-w3-combined"], neverPromoted: ["candidate-w3-a", "candidate-w3-b"], viableAlternatives: [], localExceptions: [], emergentCandidates: ["candidate-w3-combined"], correctFinalAuthority: ["candidate-w3-combined"] },
    },
    {
      id: "competing-explanations", partition: "development", organizationId: "candidate-ecology-org",
      candidates: [candidate("candidate-w4-a", "insight-w4-a"), candidate("candidate-w4-b", "insight-w4-b")],
      events: [
        event("w4-propose-a", "T1", "propose", "candidate-w4-a"),
        event("w4-propose-b", "T1", "propose", "candidate-w4-b"),
        event("w4-a-1", "T2", "support", "candidate-w4-a", ["source-w4-a1"]),
        event("w4-a-2", "T3", "support", "candidate-w4-a", ["source-w4-a2"]),
        event("w4-b-1", "T2", "support", "candidate-w4-b", ["source-w4-b1"]),
        event("w4-b-2", "T3", "support", "candidate-w4-b", ["source-w4-b2"]),
        event("w4-b-counter", "T5", "contradict", "candidate-w4-b", ["source-w4-counter"]),
      ],
      permissions: commonPermissions,
      expected: { eventuallyPromoted: ["candidate-w4-a", "candidate-w4-b"], neverPromoted: [], viableAlternatives: ["candidate-w4-a", "candidate-w4-b"], localExceptions: [], emergentCandidates: [], correctFinalAuthority: ["candidate-w4-a", "candidate-w4-b"] },
    },
    {
      id: "local-anomaly", partition: "held-out", organizationId: "candidate-ecology-org",
      candidates: [
        candidate("candidate-w5-pattern", "insight-w5-pattern", { scopeId: "organization", contributorId: "manager" }),
        candidate("candidate-w5-exception", "insight-w5-exception", { scopeId: "team-a", localOnly: true }),
      ],
      events: [
        event("w5-pattern-propose", "T1", "propose", "candidate-w5-pattern"),
        event("w5-pattern-a", "T2", "support", "candidate-w5-pattern", ["source-w5-p1"]),
        event("w5-pattern-b", "T3", "support", "candidate-w5-pattern", ["source-w5-p2"]),
        event("w5-exception-propose", "T2", "propose", "candidate-w5-exception"),
        event("w5-exception-a", "T3", "support", "candidate-w5-exception", ["source-w5-e1"]),
        event("w5-exception-b", "T4", "support", "candidate-w5-exception", ["source-w5-e2"]),
      ],
      permissions: commonPermissions,
      expected: { eventuallyPromoted: ["candidate-w5-pattern", "candidate-w5-exception"], neverPromoted: [], viableAlternatives: [], localExceptions: ["candidate-w5-exception"], emergentCandidates: [], correctFinalAuthority: ["candidate-w5-pattern", "candidate-w5-exception"] },
    },
    {
      id: "restricted-insight", partition: "permission-validation", organizationId: "candidate-ecology-org",
      candidates: [candidate("candidate-w6", "insight-w6", { scopeId: "specialist", contributorId: "specialist", purpose: "workforce", restricted: true })],
      events: [
        event("w6-propose", "T1", "propose", "candidate-w6"),
        event("w6-support-a", "T2", "support", "candidate-w6", ["source-w6-a"]),
        event("w6-support-b", "T3", "support", "candidate-w6", ["source-w6-b"]),
        event("w6-revoke", "T5", "revoke", "candidate-w6"),
      ],
      permissions: [
        permission("specialist", "specialist", "raw", "workforce", "T5"),
        permission("manager", "specialist", "aggregate", "workforce"),
        permission("employee", "specialist", "none", "workforce"),
      ],
      expected: { eventuallyPromoted: ["candidate-w6"], neverPromoted: [], viableAlternatives: [], localExceptions: [], emergentCandidates: [], correctFinalAuthority: [] },
    },
    {
      id: "never-resolves", partition: "development", organizationId: "candidate-ecology-org",
      candidates: [candidate("candidate-w7", "insight-w7")],
      events: [
        event("w7-propose", "T1", "propose", "candidate-w7"),
        event("w7-support", "T2", "support", "candidate-w7", ["source-w7-a"]),
        event("w7-expire", "T6", "expire", "candidate-w7"),
      ],
      permissions: commonPermissions,
      expected: { eventuallyPromoted: [], neverPromoted: ["candidate-w7"], viableAlternatives: ["candidate-w7"], localExceptions: [], emergentCandidates: [], correctFinalAuthority: [] },
    },
    {
      id: "contrarian-correct", partition: "held-out", organizationId: "candidate-ecology-org",
      candidates: [candidate("candidate-w8-dominant", "insight-w8-dominant"), candidate("candidate-w8-contrarian", "insight-w8-contrarian")],
      events: [
        event("w8-dom-propose", "T1", "propose", "candidate-w8-dominant"),
        event("w8-dom-repeat-a", "T2", "support", "candidate-w8-dominant", ["source-w8-common"]),
        event("w8-dom-repeat-b", "T2", "support", "candidate-w8-dominant", ["source-w8-common"]),
        event("w8-con-propose", "T2", "propose", "candidate-w8-contrarian"),
        event("w8-con-support-a", "T3", "support", "candidate-w8-contrarian", ["source-w8-c1"]),
        event("w8-dom-counter", "T4", "contradict", "candidate-w8-dominant", ["source-w8-counter"]),
        event("w8-con-support-b", "T5", "support", "candidate-w8-contrarian", ["source-w8-c2"]),
      ],
      permissions: commonPermissions,
      expected: { eventuallyPromoted: ["candidate-w8-contrarian"], neverPromoted: ["candidate-w8-dominant"], viableAlternatives: ["candidate-w8-contrarian"], localExceptions: [], emergentCandidates: [], correctFinalAuthority: ["candidate-w8-contrarian"] },
    },
  ];
}
