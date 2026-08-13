import assert from "node:assert/strict";
import { runHistoricalCheckpointEndpointSpecificAcceptance } from "./historicalCheckpointLifecycleActualOwnerAcceptanceCoordinator";
runHistoricalCheckpointEndpointSpecificAcceptance().then((value) => { assert.ok(value.scenarios.every((scenario) => scenario.deniedCheckpointBodyReads === 0 && scenario.deniedEndpointLoads === 0)); console.log(JSON.stringify({ ...value, validation: "historical-checkpoint-lifecycle-authorization-before-load" })); });
