import assert from "node:assert/strict";
import { runHistoricalCheckpointEndpointSpecificAcceptance } from "./historicalCheckpointLifecycleActualOwnerAcceptanceCoordinator";
runHistoricalCheckpointEndpointSpecificAcceptance().then((value) => { assert.equal(value.scenarios.length, 5); assert.equal(value.labelOnlyScenarios, 0); assert.equal(value.deniedProtectedLoads, 0); console.log(JSON.stringify(value)); });
