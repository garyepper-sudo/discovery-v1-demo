import { runDiscoveryV3 } from "../../v3";
import { createEmptyOrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";
import type { ExpectedEvolution, OperatingModelSnapshot, OrganizationTimeline, TimelineEvent } from "./contracts";
import { adaptRuntimeToOperatingModelSnapshot } from "./productionSnapshotAdapter";

const updates = [
  { id: "production-evidence-initial", timestamp: "2026-01-15T12:00:00.000Z", context: "Client delivery depends heavily on founder expertise. New consultants lack reliable access to founder-held methods and judgment. Growth requires transferring this knowledge without reducing service quality." },
  { id: "production-evidence-corroborating", timestamp: "2026-02-15T12:00:00.000Z", context: "A second delivery review confirms that consultants escalate unfamiliar client situations to the founder. Delivery quality remains strongest when the founder directly reviews the work." },
  { id: "production-evidence-contradictory", timestamp: "2026-03-15T12:00:00.000Z", context: "A documented delivery playbook was used by two consultants without founder review. Both engagements met the same service-quality standard, suggesting some founder-held judgment can be transferred." },
];

function expectation(id: string, type: ExpectedEvolution["type"], targetType: ExpectedEvolution["targetType"], targetId: string, rationale: string): ExpectedEvolution {
  return { id, type, targetType, targetId, rationale };
}

function event(update: typeof updates[number], changes: ExpectedEvolution[]): TimelineEvent {
  return { id: update.id, timestamp: update.timestamp, eventType: "evidence", evidence: { evidenceIds: [`evidence-${update.id}`], relationship: update.id.includes("contradictory") ? "contradicts" : "supports", summary: update.context }, expectedOrganizationalChanges: changes, expectedStableConceptIds: [], expectedRevisedConceptIds: [] };
}

export function runProductionOperatingModelReplay(): OrganizationTimeline {
  let runtime = createEmptyOrganizationRuntime({ organizationId: "benchmark-production-evolution-replay", name: "Continuity Advisory", industry: "Professional services" });
  const initialSnapshot = adaptRuntimeToOperatingModelSnapshot({ runtime, snapshotId: "production-snapshot-0", timestamp: "2026-01-01T12:00:00.000Z" });
  const snapshots: OperatingModelSnapshot[] = [];
  const originalLog = console.log;
  console.log = () => undefined;
  try {
    for (const [index, update] of updates.entries()) {
      const input = { company: "Continuity Advisory", website: "https://continuity.example", industry: "Professional services", question: "How can the organization scale delivery without reducing quality?", context: update.context };
      runtime = evolveOrganizationRuntime({ runtime, result: runDiscoveryV3(input), input });
      snapshots.push(adaptRuntimeToOperatingModelSnapshot({ runtime, snapshotId: `production-snapshot-${index + 1}`, timestamp: update.timestamp }));
    }
  } finally {
    console.log = originalLog;
  }

  const initialMechanismId = snapshots[0].mechanisms[0]?.id;
  const corroboratedMechanismId = snapshots[1].mechanisms[0]?.id;
  const beliefId = snapshots[0].beliefs[0]?.id;
  const changes: ExpectedEvolution[][] = [
    [expectation("production-condition-emerged", "condition-emerged", "condition", "condition-knowledgecontinuity", "Initial evidence should establish the knowledge-continuity condition.")],
    [
      ...(initialMechanismId ? [expectation("production-mechanism-identity-preserved", "identity-preserved", "mechanism", initialMechanismId, "Corroborating evidence about the same organizational relationship should preserve mechanism identity.")] : []),
      ...(beliefId ? [expectation("production-belief-strengthened", "belief-strengthened", "belief", beliefId, "Corroborating evidence should strengthen the current belief.")] : []),
      expectation("production-recommendation-preserved-corroboration", "recommendation-preserved", "recommendation", "production-recommendation", "Corroboration alone should not create recommendation churn."),
    ],
    [
      ...(beliefId ? [expectation("production-belief-weakened", "belief-weakened", "belief", beliefId, "Contradictory transfer evidence should weaken the current dependency belief.")] : []),
      ...(corroboratedMechanismId ? [expectation("production-mechanism-decreased", "mechanism-confidence-decreased", "mechanism", corroboratedMechanismId, "Contradictory transfer evidence should reduce mechanism confidence."), expectation("production-history-preserved", "historical-truth-preserved", "mechanism", corroboratedMechanismId, "Earlier mechanism truth should remain historically represented.")] : []),
      expectation("production-recommendation-preserved-contradiction", "recommendation-preserved", "recommendation", "production-recommendation", "The existing delegation recommendation remains directionally consistent with successful transfer evidence."),
    ],
  ];

  return {
    id: "production-operating-model-replay-001",
    organizationId: runtime.metadata.organizationId,
    usage: "development",
    title: "Production founder-dependency evidence replay",
    initialSnapshot,
    steps: updates.map((update, index) => ({ event: event(update, changes[index]), snapshot: snapshots[index] })),
  };
}
