import { acceptanceDigest, assertAcceptanceProfileRequirementsV1, type AcceptanceProfileRequirementsV1 } from "./authenticatedAlphaAcceptanceContracts";
import { ar5bAuthenticatedRecoveryConformanceProfile } from "./ar5bAuthenticatedRecoveryConformanceProfile";

export const AR6_PROFILE = { id: "ar6-current-build-conformance", version: "version-1" } as const;
export const AR6_PREDECESSOR = { id: "ar5b-authenticated-recovery-conformance", version: "version-1" } as const;
export const AR6_EXPECTED_COMMIT = "f460f1269b7cbad504ec0f3fc0335d3710200af3";
export const AR6_BROWSER_FACTS = [
  "browser-journey-ordered", "ceo-current-lifecycle-complete", "current-entry-meeting-home-bound",
  "participant-bridge-exercised", "participant-registration-bound", "exact-series-grants-checked",
  "director-shared-successor-visible", "director-authority-not-expanded",
  "manager-not-found-nondisclosure", "denied-not-found-nondisclosure",
  "unbound-not-found-nondisclosure", "missing-series-grant-not-found",
  "foreign-scope-not-found", "invalid-address-not-found", "desktop-viewport", "narrow-viewport",
  "hard-reload-reconstructed", "successor-fresh-process-reconstructed", "successor-not-started",
  "successor-execution-not-claimed",
] as const;

function freeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
// Copy, never mutate, the qualified predecessor. Its non-browser meanings remain exact.
const profile = structuredClone(ar5bAuthenticatedRecoveryConformanceProfile);
profile.profile = { ...AR6_PROFILE };
profile.requiredMeasurements = profile.requiredMeasurements.map(item => item.producer === "browser"
  ? { ...item, factIds: [...AR6_BROWSER_FACTS] } : item);
assertAcceptanceProfileRequirementsV1(profile);
export const ar6CurrentBuildAcceptanceProfile: AcceptanceProfileRequirementsV1 = freeze(profile);
export const AR6_PROFILE_DIGEST = acceptanceDigest(ar6CurrentBuildAcceptanceProfile);
export type Ar6Mode = "synthetic-qualification" | "authenticated-current-build";
export type Ar6Binding = { sourceDigest: string; taskDigest: string; runDigest: string; profileDigest: string };
export class Ar6Blocked extends Error {
  constructor(readonly reason: string) { super("AR6 BLOCKED: " + reason); this.name = "Ar6Blocked"; }
}
export function requireAr6(value: unknown, reason: string): asserts value {
  if (!value) throw new Ar6Blocked(reason);
}
export function assertAr6Binding(value: Ar6Binding): void {
  requireAr6(value && [value.sourceDigest, value.taskDigest, value.runDigest].every(v => typeof v === "string" && /^[a-f0-9]{64}$/.test(v)), "identity-invalid");
  requireAr6(value.profileDigest === AR6_PROFILE_DIGEST, "profile-mismatch");
}
export function sameAr6Binding(a: Ar6Binding, b: Ar6Binding): boolean {
  return a.sourceDigest === b.sourceDigest && a.taskDigest === b.taskDigest && a.runDigest === b.runDigest && a.profileDigest === b.profileDigest;
}
