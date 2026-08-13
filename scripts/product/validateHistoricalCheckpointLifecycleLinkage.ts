import { runHistoricalCheckpointLifecycleActualOwnerAcceptance, runHistoricalCheckpointLifecycleAdversarialWorldAcceptance, type HistoricalCheckpointActualOwnerMode } from "./historicalCheckpointLifecycleActualOwnerAcceptanceCoordinator";

export async function runHistoricalCheckpointLifecycleValidation(mode: HistoricalCheckpointActualOwnerMode = "base") {
  if (["current-access", "authorization-before-load", "cross-organization", "safe-projection-isolation", "collision"].includes(mode)) {
    return runHistoricalCheckpointLifecycleAdversarialWorldAcceptance(mode as "current-access" | "authorization-before-load" | "cross-organization" | "safe-projection-isolation" | "collision");
  }
  return runHistoricalCheckpointLifecycleActualOwnerAcceptance(mode);
}

if (process.argv[1]?.endsWith("validateHistoricalCheckpointLifecycleLinkage.ts")) {
  const mode = (process.env.DISCOVERY_HISTORICAL_CHECKPOINT_MODE ?? "base") as HistoricalCheckpointActualOwnerMode;
  runHistoricalCheckpointLifecycleValidation(mode)
    .then((value) => console.log(JSON.stringify(value)))
    .catch((error) => { console.error(error); process.exitCode = 1; });
}
