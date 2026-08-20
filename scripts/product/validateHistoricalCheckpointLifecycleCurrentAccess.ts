import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { HistoricalCheckpointLifecycleLinkProjectionV1 } from "../../product/workflow/leadershipConversation/historicalCheckpointLifecycleLinkContracts";
import { provisionHistoricalCheckpointSharedWorld, runHistoricalCheckpointEndpointSpecificAcceptance } from "./historicalCheckpointLifecycleActualOwnerAcceptanceCoordinator";
const legacyProjection:HistoricalCheckpointLifecycleLinkProjectionV1={contractVersion:"1",linkId:"legacy",linkKind:"decision-review",checkpointId:"checkpoint",linkedRecordId:"review",linkedRecordRevision:"1",linkedSubrecordId:null,occurredAt:"2026-08-19T00:00:00.000Z",accessResultDigests:["checkpoint-access","linked-access"],projectionDigest:"legacy-digest"};
assert.equal(legacyProjection.governedScopeBindingDigest,undefined,"M-1 does not guess scope for an unbound historical projection");
async function main(){const bootstrapRoot=await mkdtemp(path.join(tmpdir(),"discovery-leadership-conversation-replay-scope-bootstrap-")),lineageRoot=await mkdtemp(path.join(tmpdir(),"discovery-northstar-preparation-lineage-scope-bootstrap-"));try{await provisionHistoricalCheckpointSharedWorld(bootstrapRoot,lineageRoot);}finally{await rm(bootstrapRoot,{recursive:true,force:true});await rm(lineageRoot,{recursive:true,force:true});}const value=await runHistoricalCheckpointEndpointSpecificAcceptance();assert.equal(value.scenarios.length,5);assert.equal(value.labelOnlyScenarios,0);assert.equal(value.deniedProtectedLoads,0);console.log(JSON.stringify(value));}
void main();
