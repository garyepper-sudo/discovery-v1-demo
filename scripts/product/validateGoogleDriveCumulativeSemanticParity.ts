import assert from "node:assert/strict";
import { readFile, rm, mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { GoogleDriveSynchronizationReceipt } from "../../product/connectors/google-drive/contracts";
import {
  bindSandboxDriveFiles,
  compareSandboxSemanticParity,
  summarizeSandboxSemanticFirstDivergence,
  synchronizeSandboxDriveCorpus,
  type SandboxDriveTransportFile,
} from "../../product/simulations/living-organization-sandbox/googleDriveCorpus";
import { runLivingOrganizationSandboxIsolated } from "../../product/simulations/living-organization-sandbox/isolatedReplay";
import { SANDBOX_ORGANIZATION_ID, sandboxManifest, type SandboxBatchId } from "../../product/simulations/living-organization-sandbox/manifest";
import type { SandboxReplayResult } from "../../product/simulations/living-organization-sandbox/replay";

let checks=0;
const check=(value:unknown,message?:string)=>{assert.ok(value,message);checks+=1;};
const SOURCE="source-cumulative-001",CONNECTED="connected-cumulative-001",FOLDER="folder-cumulative-001";
const through=(batch:SandboxBatchId)=>sandboxManifest.documents.filter(document=>sandboxManifest.batchOrder.indexOf(document.batchId)<=sandboxManifest.batchOrder.indexOf(batch));
async function transport(batch:SandboxBatchId):Promise<SandboxDriveTransportFile[]> {
  return Promise.all(through(batch).map(async(document,index)=>({driveFileId:`drive-${index}`,driveRevisionId:`revision-${index}`,name:path.basename(document.relativePath),mimeType:"text/markdown",retrievedAt:"2030-01-01T00:00:00.000Z",content:(await readFile(path.join("product/simulations/living-organization-sandbox",document.relativePath),"utf8")).replace(/\n$/u,"")})));
}
const receipt=(files:SandboxDriveTransportFile[],newCount:number):GoogleDriveSynchronizationReceipt=>({sourceId:SOURCE,folderId:CONNECTED,organizationId:SANDBOX_ORGANIZATION_ID,synchronizedAt:"2030-01-01T00:00:00.000Z",newFiles:files.slice(-newCount).map(file=>file.driveFileId),changedFiles:[],unchangedContentRevisionFiles:[],changedContentRevisionFiles:[],extractedForComparisonFiles:files.slice(-newCount).map(file=>file.driveFileId),unchangedFiles:files.slice(0,files.length-newCount).map(file=>file.driveFileId),movedFiles:[],removedFiles:[],inaccessibleFiles:[],unsupportedFiles:[],cursor:null,limitations:[]});
const cumulative=(stage1:SandboxReplayResult,stage2:SandboxReplayResult):SandboxReplayResult=>({...stage2,checkpoints:[...stage1.checkpoints,...stage2.checkpoints],negativeControls:[...stage1.negativeControls,...stage2.negativeControls]});
async function main(){
  const roots:string[]=[];const root=async(label:string)=>{const value=await mkdtemp(path.join(os.tmpdir(),`discovery-living-organization-sandbox-${label}-`));roots.push(value);return value;};
  try{
    const batch1Files=await transport("batch-1"),batch2Files=await transport("batch-2");
    const batch1Bound=await bindSandboxDriveFiles({environment:"sandbox",organizationId:SANDBOX_ORGANIZATION_ID,configuredFolderId:FOLDER,requestedFolderId:FOLDER,sourceId:SOURCE,includeNested:false,files:batch1Files,throughBatch:"batch-1"});
    const batch2Bound=await bindSandboxDriveFiles({environment:"sandbox",organizationId:SANDBOX_ORGANIZATION_ID,configuredFolderId:FOLDER,requestedFolderId:FOLDER,sourceId:SOURCE,includeNested:false,files:batch2Files,throughBatch:"batch-2"});
    const localRoot=await root("cumulative-local"),driveRoot=await root("cumulative-drive");
    check(localRoot!==driveRoot,"local and synthetic Drive roles require distinct Runtime roots");
    const local1=await runLivingOrganizationSandboxIsolated({role:"local-expected",sandboxRoot:localRoot,throughBatch:"batch-1",reset:true});
    const drive1=await runLivingOrganizationSandboxIsolated({role:"synthetic-drive",sandboxRoot:driveRoot,throughBatch:"batch-1",reset:true,documentContents:batch1Bound.contents});
    const parity1=compareSandboxSemanticParity({expected:local1,observed:drive1});check(parity1.passed);check(parity1.differences.length===0);
    const localStage2=await runLivingOrganizationSandboxIsolated({role:"local-expected",sandboxRoot:localRoot,startAtBatch:"batch-2",throughBatch:"batch-2",reset:false});
    const driveStage2=await runLivingOrganizationSandboxIsolated({role:"synthetic-drive",sandboxRoot:driveRoot,startAtBatch:"batch-2",throughBatch:"batch-2",reset:false,documentContents:batch2Bound.contents});
    const local2=cumulative(local1,localStage2),drive2=cumulative(drive1,driveStage2);
    const parity2=compareSandboxSemanticParity({expected:local2,observed:drive2});check(parity2.passed);check(parity2.differences.length===0);
    check(localStage2.checkpoints.length===1&&localStage2.checkpoints[0]!.batchId==="batch-2","local Batch 2 must run in a fresh process against the persisted post-Sync1 Runtime");
    check(driveStage2.checkpoints.length===1&&driveStage2.checkpoints[0]!.batchId==="batch-2","synthetic Drive Batch 2 must run in a fresh process against the persisted post-Sync1 Runtime");
    check(JSON.stringify(local1.checkpoints)===JSON.stringify(local2.checkpoints.slice(0,local1.checkpoints.length)),"local post-Sync1 state must persist identically into Batch 2");
    check(JSON.stringify(drive1.checkpoints)===JSON.stringify(drive2.checkpoints.slice(0,drive1.checkpoints.length)),"synthetic Drive post-Sync1 state must persist identically into Sync 2");
    check(compareSandboxSemanticParity({expected:local1,observed:drive1}).passed,"post-Sync1 persisted state parity");
    check(batch2Files.slice(0,5).every((file,index)=>file.content===batch1Files[index]!.content),"five unchanged files must retain exact source content");
    let calls=0;const syncDriveRoot=await root("sync-drive"),syncLocalRoot=await root("sync-local");
    const sync1=await synchronizeSandboxDriveCorpus({environment:"sandbox",userId:"sandbox-user",organizationId:SANDBOX_ORGANIZATION_ID,sourceId:SOURCE,configuredFolderId:FOLDER,requestedFolderId:FOLDER,connectedFolderId:CONNECTED,includeNested:false,throughBatch:"batch-1",files:batch1Files,sandboxRoot:syncDriveRoot,localOracleRoot:syncLocalRoot,owner:{synchronizeFolder:async()=>{calls+=1;return receipt(batch1Files,5);}}});
    const sync2=await synchronizeSandboxDriveCorpus({environment:"sandbox",userId:"sandbox-user",organizationId:SANDBOX_ORGANIZATION_ID,sourceId:SOURCE,configuredFolderId:FOLDER,requestedFolderId:FOLDER,connectedFolderId:CONNECTED,includeNested:false,throughBatch:"batch-2",replayStartAtBatch:"batch-2",resetReplay:false,files:batch2Files,sandboxRoot:syncDriveRoot,localOracleRoot:syncLocalRoot,owner:{synchronizeFolder:async()=>{calls+=1;return receipt(batch2Files,2);}}});
    check(sync1.semanticParity);check(sync2.semanticParity);check(sync2.semanticParityDiagnostic.differences.length===0);check(sync2.filesInspected===7);check(sync2.newFiles===2);check(sync2.unchangedFiles===5);check(sync2.driveWrites===0);check(calls===2);
    const perturb=(mutate:(value:typeof drive2)=>void,field:string)=>{const changed=structuredClone(drive2);mutate(changed);const diagnostic=compareSandboxSemanticParity({expected:local2,observed:changed});check(!diagnostic.passed);check(diagnostic.differences.some(item=>item.field.includes(field)));const first=summarizeSandboxSemanticFirstDivergence(diagnostic);check(first.independentMismatchCount===1);check(first.dependentDownstreamMismatchCount===diagnostic.differences.length-1);check(Boolean(first.expectedSafeDigest&&first.observedSafeDigest));};
    perturb(value=>{value.checkpoints[2]!.admittedEvidenceDigests[0]="changed-evidence";},"admittedEvidenceDigests");
    perturb(value=>{value.checkpoints[2]!.admittedEvidenceDigests.reverse();},"admittedEvidenceDigests");
    perturb(value=>{value.checkpoints[2]!.modelDigest="changed-runtime-revision";value.checkpoints[2]!.materialChange="no-material-change";},"materialChange");
    perturb(value=>{value.checkpoints[2]!.currentUnderstandingRevisionIds[0]="changed-revision";},"currentUnderstandingRevisionIds");
    perturb(value=>{value.checkpoints[2]!.contradictionCount+=1;},"contradictionCount");
    const changedBindings=structuredClone(batch2Bound.bindings);changedBindings[0]!.logicalDocumentVersion="changed-version";const bindingDiagnostic=compareSandboxSemanticParity({expected:local2,observed:drive2,expectedDocuments:changedBindings.map(({driveFileId:_a,driveRevisionId:_b,driveMimeType:_c,retrievedAt:_d,sourceAuthorizationScope:_e,...semantic})=>semantic),observedBindings:batch2Bound.bindings});check(!bindingDiagnostic.passed);check(bindingDiagnostic.differences.some(item=>item.field.includes("logicalDocumentVersion")));
    const effectiveBindings=structuredClone(batch2Bound.bindings);effectiveBindings[0]!.effectiveAt="2031-01-01T00:00:00.000Z";const effectiveDiagnostic=compareSandboxSemanticParity({expected:local2,observed:drive2,expectedDocuments:effectiveBindings.map(({driveFileId:_a,driveRevisionId:_b,driveMimeType:_c,retrievedAt:_d,sourceAuthorizationScope:_e,...semantic})=>semantic),observedBindings:batch2Bound.bindings});check(!effectiveDiagnostic.passed);check(effectiveDiagnostic.differences.some(item=>item.field.includes("effectiveAt")));
    const operator=await readFile("scripts/development/googleDriveLiveAcceptance.ts","utf8");check(operator.includes("resetOrganizationRuntimeState(SANDBOX_ORGANIZATION_ID)"));check(operator.includes("semanticCheckpointCleared:true"));
    console.log(JSON.stringify({result:"PASS",checks,rootCauseClassification:"H — RUNTIME BASELINE OR REVISION STATE DIFFERS",localOracleTrulyCumulative:true,postSync1PersistedStateParity:true,fiveUnchangedFilesSemanticallyStable:true,batch2SemanticParity:true,firstDivergenceDiagnostics:true,cleanLiveReentrySupported:true,connectorCalls:0,driveReads:0,driveWrites:0,productionTouched:false},null,2));
  }finally{await Promise.all(roots.map(value=>rm(value,{recursive:true,force:true})));}
}
void main();
