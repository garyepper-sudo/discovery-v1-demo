import { acceptanceDigest, type AcceptanceMeasurementEnvelopeV1 } from "./authenticatedAlphaAcceptanceContracts";
import { adjudicateAuthenticatedAlphaAcceptance } from "./authenticatedAlphaAcceptanceAdjudicator";
import { ar6CurrentBuildAcceptanceProfile, assertAr6Binding, requireAr6, sameAr6Binding, type Ar6Binding, type Ar6Mode } from "./ar6CurrentBuildAcceptanceProfile";
import type { Ar6BrowserResult } from "./ar6BrowserMeasurementProducer.spec";
import type { Ar6OwnedResource } from "./ar6ParticipantAcceptanceFixture";

export type Ar6RunState = { binding: Ar6Binding; mode: Ar6Mode; status: "NOT_STARTED" | "RUNNING" | "PASS" | "FAIL" | "BLOCKED" | "CLEANUP_REQUIRED" | "CLEANUP_PASS"; interrupted: boolean; resources: Ar6OwnedResource[] };
export interface Ar6RecoveryOwner {
  persist(state: Ar6RunState): Promise<void>;
  discover(state: Ar6RunState): Promise<Ar6OwnedResource[]>;
  verifyOwnership(resource: Ar6OwnedResource, binding: Ar6Binding): Promise<boolean>;
  cleanup(resource: Ar6OwnedResource): Promise<void>;
  independentZero(resources: Ar6OwnedResource[]): Promise<{ local: boolean; external: boolean; foreignPreserved: boolean }>;
}
/** Recovery never retries Product actions; caller's manifest and owner are protected infrastructure. */
export async function recoverAr6InterruptedRun(state: Ar6RunState, owner: Ar6RecoveryOwner): Promise<Ar6RunState> {
  assertAr6Binding(state.binding);
  requireAr6(state.status !== "PASS", "completed-run-not-recoverable");
  const next = structuredClone(state); next.interrupted = true; next.status = "CLEANUP_REQUIRED";
  await owner.persist(next);
  const discovered = await owner.discover(next);
  const inventory = [...next.resources];
  for (const item of discovered) if (!inventory.some(v => v.kind === item.kind && v.ref === item.ref && v.ownershipRef === item.ownershipRef)) inventory.push(item);
  requireAr6(new Set(inventory.map(v => v.kind + ":" + v.ref)).size === inventory.length, "cleanup-ownership-conflict");
  for (const item of inventory) requireAr6(item.ref && item.ownershipRef && await owner.verifyOwnership(item, next.binding), "cleanup-ownership-unavailable");
  next.resources = inventory; await owner.persist(next);
  // Owner handles revoke/absence semantics. Two attempts are required and may converge after a partial first attempt.
  for (let attempt = 0; attempt < 2; attempt++) {
    let failed = false;
    for (const item of inventory) { try { await owner.cleanup(item); } catch { failed = true; } }
    if (attempt === 1) requireAr6(!failed, "cleanup-not-converged");
  }
  const zero = await owner.independentZero(inventory);
  requireAr6(zero.local && zero.external && zero.foreignPreserved, "independent-zero-failed");
  next.status = "CLEANUP_PASS"; await owner.persist(next); return next;
}
export type Ar6ConformanceInput = {
  binding: Ar6Binding; mode: Ar6Mode; browser: Ar6BrowserResult;
  measurements: AcceptanceMeasurementEnvelopeV1[]; runState: Ar6RunState;
};
/** Reconcile only real execution observations. Synthetic qualification can never yield an AR6 conformance PASS. */
export function reconcileAr6CurrentBuild(input: Ar6ConformanceInput) {
  try {
    assertAr6Binding(input.binding);
    requireAr6(input.mode === "authenticated-current-build" && input.browser.mode === input.mode && input.runState.mode === input.mode, "synthetic-not-conformance");
    requireAr6(sameAr6Binding(input.binding, input.browser.binding) && sameAr6Binding(input.binding, input.runState.binding), "run-binding-mismatch");
    requireAr6(JSON.stringify(input.browser.evidenceBinding) === JSON.stringify({ browser: "REAL_BROWSER", fixture: "REAL_FIXTURE_OWNER", deterministic: "CURRENT_DETERMINISTIC_VALIDATOR", healthy: "REAL_FIXTURE_OWNER", nondisclosure: "REAL_BROWSER" }), "composed-evidence-binding-mismatch");
    requireAr6(!input.runState.interrupted && input.runState.status === "CLEANUP_PASS", "run-not-acceptable");
    const browsers = input.measurements.filter(m => m.producer === "browser");
    requireAr6(browsers.length === 1 && acceptanceDigest(browsers[0]!.observations) === acceptanceDigest(input.browser.observations), "browser-envelope-mismatch");
    requireAr6(input.measurements.every(m => m.producerRunDigest === input.binding.runDigest), "producer-run-mismatch");
    const result = adjudicateAuthenticatedAlphaAcceptance({ profile: ar6CurrentBuildAcceptanceProfile, measurements: input.measurements, sourceDigest: input.binding.sourceDigest, taskDigest: input.binding.taskDigest });
    return { kind: "ar6-current-build-conformance" as const, result: result.result, adjudication: result, canonicalIntegration: false as const };
  } catch {
    return { kind: "ar6-current-build-conformance" as const, result: "BLOCKED" as const, canonicalIntegration: false as const };
  }
}
// Deliberately no CLI execution: machine orchestration and infrastructure authority are separate.
