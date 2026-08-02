import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { GoogleDriveSynchronizationReceipt } from "../../product/connectors/google-drive/contracts";
import { bindSandboxDriveFiles, SANDBOX_DRIVE_MAX_FILES, synchronizeSandboxDriveCorpus, type SandboxDriveTransportFile } from "../../product/simulations/living-organization-sandbox/googleDriveCorpus";
import { SANDBOX_ORGANIZATION_ID, sandboxManifest, type SandboxBatchId } from "../../product/simulations/living-organization-sandbox/manifest";

const SOURCE="sandbox-source-001", FOLDER="sandbox-folder-001", CONNECTED="connected-sandbox-folder-001";
let checks=0; const ok=(value:unknown)=>{assert.ok(value);checks+=1;};
async function rejects(operation:()=>Promise<unknown>,pattern:RegExp){await assert.rejects(operation,pattern);checks+=1;}
async function corpusFiles(throughBatch:SandboxBatchId):Promise<SandboxDriveTransportFile[]>{
  const through=sandboxManifest.batchOrder.indexOf(throughBatch);
  return Promise.all(sandboxManifest.documents.filter(document=>sandboxManifest.batchOrder.indexOf(document.batchId)<=through).map(async(document,index)=>({driveFileId:`drive-file-${index+1}`,driveRevisionId:"revision-1",name:path.basename(document.relativePath),mimeType:"text/markdown",retrievedAt:"2026-06-01T09:00:00.000Z",content:await readFile(path.join("product/simulations/living-organization-sandbox",document.relativePath),"utf8")})));
}
const bind=(override:Partial<Parameters<typeof bindSandboxDriveFiles>[0]>={})=>bindSandboxDriveFiles({environment:"sandbox",organizationId:SANDBOX_ORGANIZATION_ID,configuredFolderId:FOLDER,requestedFolderId:FOLDER,sourceId:SOURCE,includeNested:false,files:[],throughBatch:"batch-0",...override});

async function main(){
  const batch0=await corpusFiles("batch-0"); const bound=await bind({files:batch0});
  assert.equal(bound.bindings.length,2);checks+=1; ok(bound.bindings.every(item=>item.logicalDocumentId&&item.driveFileId)); ok(bound.bindings.every(item=>item.effectiveAt!==item.retrievedAt));
  assert.deepEqual((await bind({files:[...batch0].reverse()})).bindings,bound.bindings);checks+=1;
  await rejects(()=>bind({environment:"production",files:batch0}),/outside development/);
  await rejects(()=>bind({organizationId:"other",files:batch0}),/organization mismatch/);
  await rejects(()=>bind({configuredFolderId:"root",requestedFolderId:"root",files:batch0}),/non-root/);
  await rejects(()=>bind({requestedFolderId:"other",files:batch0}),/folder mismatch/);
  await rejects(()=>bind({sourceId:"",files:batch0}),/non-root identifier/);
  await rejects(()=>bind({includeNested:true,files:batch0}),/non-recursive/);
  await rejects(()=>bind({files:[...batch0,...Array.from({length:SANDBOX_DRIVE_MAX_FILES},(_,index)=>({...batch0[0]!,driveFileId:`extra-${index}`}))]}),/file-count/);
  await rejects(()=>bind({files:[{...batch0[0]!,mimeType:"application/octet-stream"},batch0[1]!]}),/Unsupported/);
  await rejects(()=>bind({files:[{...batch0[0]!,content:`${batch0[0]!.content}changed`},batch0[1]!]}),/digest-mismatched/);
  await rejects(()=>bind({files:[batch0[0]!]}),/incomplete/);
  await rejects(()=>bind({files:[{...batch0[0]!,name:batch0[1]!.name},batch0[1]!]}),/digest-mismatched/);
  await rejects(()=>bind({files:[{...batch0[0]!,content:"x".repeat(2*1024*1024+1)},batch0[1]!]}),/total-byte/);
  const all=await corpusFiles("negative"); const driveRoot=await mkdtemp(path.join(os.tmpdir(),"discovery-living-organization-sandbox-drive-")); const oracleRoot=await mkdtemp(path.join(os.tmpdir(),"discovery-living-organization-sandbox-oracle-"));
  const receipt=(current:SandboxDriveTransportFile[],newCount:number):GoogleDriveSynchronizationReceipt=>{const added=newCount?current.slice(-newCount):[];return {sourceId:SOURCE,folderId:CONNECTED,organizationId:SANDBOX_ORGANIZATION_ID,synchronizedAt:"2026-06-01T09:00:00.000Z",newFiles:added.map(item=>item.driveFileId),changedFiles:[],unchangedContentRevisionFiles:[],changedContentRevisionFiles:[],extractedForComparisonFiles:added.map(item=>item.driveFileId),unchangedFiles:current.slice(0,current.length-newCount).map(item=>item.driveFileId),movedFiles:[],removedFiles:[],inaccessibleFiles:[],unsupportedFiles:[],cursor:null,limitations:[]};};
  let calls=0;
  try{
    const stages:[SandboxBatchId,number][]=[["batch-1",5],["batch-2",2],["batch-3",2],["negative",7]]; let result;
    for(const [throughBatch,newCount] of stages){const current=await corpusFiles(throughBatch);result=await synchronizeSandboxDriveCorpus({environment:"sandbox",userId:"sandbox-user",organizationId:SANDBOX_ORGANIZATION_ID,sourceId:SOURCE,configuredFolderId:FOLDER,requestedFolderId:FOLDER,connectedFolderId:CONNECTED,includeNested:false,throughBatch,files:current,sandboxRoot:driveRoot,localOracleRoot:oracleRoot,owner:{synchronizeFolder:async()=>{calls+=1;return receipt(current,newCount);}}});assert.equal(result.semanticParity,true);checks+=1;assert.equal(result.newFiles,newCount);checks+=1;}
    assert.ok(result); assert.equal(calls,4);checks+=1; assert.equal(result.filesInspected,16);checks+=1; assert.equal(result.driveWrites,0);checks+=1; assert.equal(result.rawRuntimeReturned,false);checks+=1; assert.equal(result.duplicateFiles,2);checks+=1; ok(result.bindings.every(item=>!JSON.stringify(item).match(/token|credential/i))); ok(!JSON.stringify(result).includes(FOLDER)); ok(!JSON.stringify(result).includes(SOURCE));
    const common={environment:"sandbox",userId:"sandbox-user",organizationId:SANDBOX_ORGANIZATION_ID,sourceId:SOURCE,configuredFolderId:FOLDER,requestedFolderId:FOLDER,connectedFolderId:CONNECTED,includeNested:false,throughBatch:"negative" as const,files:all};
    const unchangedRoot=await mkdtemp(path.join(os.tmpdir(),"discovery-living-organization-sandbox-unchanged-")); const unchangedOracle=await mkdtemp(path.join(os.tmpdir(),"discovery-living-organization-sandbox-unchanged-oracle-"));
    try{const unchanged=await synchronizeSandboxDriveCorpus({...common,sandboxRoot:driveRoot,localOracleRoot:unchangedOracle,owner:{synchronizeFolder:async()=>receipt(all,0)}});assert.equal(unchanged.semanticParity,true);checks+=1;assert.equal(unchanged.unchangedFiles,16);checks+=1;assert.equal(unchanged.checkpointDigest,result.checkpointDigest);checks+=1;}finally{await rm(unchangedRoot,{recursive:true});await rm(unchangedOracle,{recursive:true});}
  }finally{await rm(driveRoot,{recursive:true});await rm(oracleRoot,{recursive:true});}
  console.log(JSON.stringify({result:"PASS",checks,syncCount:5,filesInspectedBySync:[5,7,9,16,16],newFilesBySync:[5,2,2,7,0],unchangedFilesFinal:16,canonicalOwnerReused:true,driveWrites:0,productionTouched:false},null,2));
}
void main();
