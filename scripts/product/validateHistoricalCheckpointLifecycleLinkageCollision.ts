import assert from "node:assert/strict";
import { runHistoricalCheckpointCrossRecordIsolationAcceptance } from "./historicalCheckpointLifecycleActualOwnerAcceptanceCoordinator";
runHistoricalCheckpointCrossRecordIsolationAcceptance().then(value=>{assert.equal(value.relationships,2);assert.equal(value.checkpoints,2);assert.equal(value.endpoints,2);assert.equal(value.unrelatedLoads,0);console.log(JSON.stringify(value));});
