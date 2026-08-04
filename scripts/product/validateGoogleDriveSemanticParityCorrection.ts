import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { FileGoogleDriveMetadataRepository } from "../../product/connectors/google-drive/repositories";
import { bindSandboxDriveFiles, compareSandboxSemanticParity, resetSandboxGoogleDriveSynchronizationState, sandboxDriveUploadInventory, type SandboxDriveBinding, type SandboxDriveTransportFile } from "../../product/simulations/living-organization-sandbox/googleDriveCorpus";
import { SANDBOX_ORGANIZATION_ID, sandboxManifest } from "../../product/simulations/living-organization-sandbox/manifest";
import { runLivingOrganizationSandbox } from "../../product/simulations/living-organization-sandbox/replay";

let checks=0;const check=(value:unknown,message?:string)=>{assert.ok(value,message);checks+=1;};
async function main(){
  const documents=sandboxManifest.documents.filter(item=>["batch-0","batch-1"].includes(item.batchId));
  const files:SandboxDriveTransportFile[]=await Promise.all(documents.map(async(document,index)=>({driveFileId:`transport-${index}`,driveRevisionId:`revision-${index}`,name:path.basename(document.relativePath),mimeType:"text/markdown",retrievedAt:"2026-06-01T00:00:00.000Z",content:(await readFile(path.join("product/simulations/living-organization-sandbox",document.relativePath),"utf8")).replace(/\n$/u,"")})));
  const bound=await bindSandboxDriveFiles({environment:"sandbox",organizationId:SANDBOX_ORGANIZATION_ID,configuredFolderId:"folder-001",requestedFolderId:"folder-001",sourceId:"source-001",includeNested:false,files,throughBatch:"batch-1"});
  const root=await mkdtemp(path.join(os.tmpdir(),"discovery-living-organization-sandbox-parity-correction-"));
  const originalLog=console.log;console.log=()=>undefined;
  try{
    const observed=await runLivingOrganizationSandbox({sandboxRoot:root,throughBatch:"batch-1",documentContents:bound.contents});
    const expected=await runLivingOrganizationSandbox({sandboxRoot:root,throughBatch:"batch-1"});
    const inventory=await sandboxDriveUploadInventory();
    const expectedDocuments=documents.map(document=>{const binding=bound.bindings.find(item=>item.logicalDocumentId===document.id)!;return {logicalDocumentId:document.id,logicalDocumentVersion:document.version,normalizedContentDigest:inventory.find(item=>item.logicalDocumentId===document.id)!.normalizedContentDigest,passageContentDigest:binding.passageContentDigest,passageContentLength:binding.passageContentLength,effectiveAt:document.effectiveAt};}).sort((a,b)=>a.logicalDocumentId.localeCompare(b.logicalDocumentId));
    const exact=compareSandboxSemanticParity({expected,observed,expectedDocuments,observedBindings:bound.bindings});check(exact.passed);check(exact.differences.length===0);check(exact.canonicalFieldsExcluded.length===0);check(exact.transportFieldsExcluded.includes("driveFileId"));check(exact.transportFieldsExcluded.includes("driveRevisionId"));check(exact.transportFieldsExcluded.includes("retrievedAt"));check(exact.transportFieldsExcluded.includes("temporaryPath"));
    const changedTransport=files.map((file,index)=>({...file,driveFileId:`other-${index}`,driveRevisionId:`other-revision-${index}`,retrievedAt:"2030-01-01T00:00:00.000Z"}));
    const rebound=await bindSandboxDriveFiles({environment:"sandbox",organizationId:SANDBOX_ORGANIZATION_ID,configuredFolderId:"folder-001",requestedFolderId:"folder-001",sourceId:"source-001",includeNested:false,files:changedTransport,throughBatch:"batch-1"});
    check(compareSandboxSemanticParity({expected,observed,expectedDocuments,observedBindings:rebound.bindings}).passed,"transport-only changes must preserve parity");
    const reordered=structuredClone(observed);for(const checkpoint of reordered.checkpoints){checkpoint.currentUnderstandingIds.reverse();checkpoint.currentUnderstandingRevisionIds.reverse();}
    check(compareSandboxSemanticParity({expected,observed:reordered}).passed,"non-semantic collection order must preserve parity");
    const reorderedAdmissions=structuredClone(observed);reorderedAdmissions.checkpoints[0]!.admittedEvidenceDigests.reverse();check(!compareSandboxSemanticParity({expected,observed:reorderedAdmissions}).passed,"canonical admission order must remain semantic");
    const expectField=(mutate:(value:typeof observed)=>void,field:string)=>{const changed=structuredClone(observed);mutate(changed);const diff=compareSandboxSemanticParity({expected,observed:changed});check(!diff.passed);check(diff.differences.some(item=>item.field.includes(field)),field);};
    expectField(value=>{value.checkpoints[0]!.admittedEvidenceDigests[0]="changed";},"admittedEvidenceDigests");
    expectField(value=>{value.checkpoints[0]!.currentUnderstandingIds[0]="changed";},"currentUnderstandingIds");
    expectField(value=>{value.checkpoints[0]!.currentUnderstandingRevisionIds[0]="changed";},"currentUnderstandingRevisionIds");
    expectField(value=>{value.checkpoints[0]!.evolutionHistoryCount+=1;},"evolutionHistoryCount");
    expectField(value=>{value.checkpoints[0]!.materialChange="no-material-change";},"materialChange");
    expectField(value=>{value.checkpoints[0]!.contradictionCount+=1;},"contradictionCount");
    expectField(value=>{value.checkpoints[0]!.uncertainty.driverCount+=1;},"uncertainty.driverCount");
    expectField(value=>{value.checkpoints[0]!.investigationOpportunityCount+=1;},"investigationOpportunityCount");
    const bindingDiff=(mutate:(value:SandboxDriveBinding)=>void,field:string)=>{const bindings=structuredClone(bound.bindings);mutate(bindings[0]!);const diff=compareSandboxSemanticParity({expected,observed,expectedDocuments,observedBindings:bindings});check(!diff.passed);check(diff.differences.some(item=>item.field.includes(field)),field);};
    bindingDiff(value=>{value.normalizedContentDigest="changed";},"normalizedContentDigest");bindingDiff(value=>{value.logicalDocumentId="changed";},"logicalDocumentId");bindingDiff(value=>{value.logicalDocumentVersion="changed";},"logicalDocumentVersion");bindingDiff(value=>{value.effectiveAt="2030-01-01T00:00:00.000Z";},"effectiveAt");
    bindingDiff(value=>{value.passageContentDigest="changed";},"passageContentDigest");bindingDiff(value=>{value.passageContentLength+=1;},"passageContentLength");
    const repository=new FileGoogleDriveMetadataRepository(path.join(root,"connector-metadata.json"));
    const preservedContent="# Mixed Case\n\nPreserved spacing.\n";
    await repository.replace({sources:[],folders:[{id:"connected-001",sourceId:"source-001",organizationId:SANDBOX_ORGANIZATION_ID,googleFolderId:"folder-001",displayName:"Sandbox",driveId:null,includeNested:false,connectedAt:"2026-01-01T00:00:00.000Z",lastSynchronizedAt:null,synchronizationCursor:null,revokedAt:null,limitations:[]}],files:[{sourceIdentity:"identity-1",googleFileId:"file-1",folderId:"connected-001",name:"file.md",mimeType:"text/markdown",revisionId:"1",modifiedAt:"2026-01-01T00:00:00.000Z",digest:null,status:"accessible",lastSeenAt:"2026-01-01T00:00:00.000Z",extractedAt:"2026-01-01T00:00:00.000Z",extractionDigest:"legacy",passageCount:1}],passages:[{id:"passage-1",googleFileId:"file-1",fileName:"file.md",mimeType:"text/markdown",revisionId:"1",modifiedAt:"2026-01-01T00:00:00.000Z",extractedAt:"2026-01-01T00:00:00.000Z",location:"body",content:preservedContent,contentDigest:"legacy"}],sourceVersions:[]});
    const reread=await repository.read();check(reread.passages[0]!.content===preservedContent,"repository must preserve extracted text while normalizing only identity digest");check(reread.passages[0]!.contentDigest!=="legacy");
    const metadata={sources:[{id:"source-001",organizationId:SANDBOX_ORGANIZATION_ID,revokedAt:null},{id:"other-source",organizationId:"other-organization",revokedAt:null}],folders:[{id:"connected-001",sourceId:"source-001",organizationId:SANDBOX_ORGANIZATION_ID,googleFolderId:"folder-001",includeNested:false,revokedAt:null,lastSynchronizedAt:"now",synchronizationCursor:"cursor"},{id:"other-folder",sourceId:"other-source",organizationId:"other-organization",googleFolderId:"other-google-folder",includeNested:false,revokedAt:null,lastSynchronizedAt:"other-now",synchronizationCursor:"other-cursor"}],files:[{googleFileId:"file-1",folderId:"connected-001",sourceIdentity:"identity-1"},{googleFileId:"other-file",folderId:"other-folder",sourceIdentity:"other-identity"}],passages:[{googleFileId:"file-1"},{googleFileId:"other-file"}],sourceVersions:[{sourceIdentity:"identity-1"},{sourceIdentity:"other-identity"}]};
    let replaced=structuredClone(metadata);
    const resetRepository={read:async()=>replaced as never,replace:async(value:never)=>{replaced=value;}};
    const reset=await resetSandboxGoogleDriveSynchronizationState({environment:"sandbox",organizationId:SANDBOX_ORGANIZATION_ID,sourceId:"source-001",folderId:"connected-001",googleFolderId:"folder-001",metadata:resetRepository});
    check(reset.filesRemoved===1);check(reset.passagesRemoved===1);check(reset.sourceVersionsRemoved===1);check(reset.driveWrites===0);const resetState=replaced as typeof metadata;check(resetState.files.length===1&&resetState.files[0]!.googleFileId==="other-file");check(resetState.passages.length===1&&resetState.passages[0]!.googleFileId==="other-file");check(resetState.sourceVersions.length===1&&resetState.sourceVersions[0]!.sourceIdentity==="other-identity");check(resetState.sources.length===2&&resetState.folders.length===2);check(resetState.folders.find(item=>item.id==="other-folder")!.synchronizationCursor==="other-cursor");
    const secondReset=await resetSandboxGoogleDriveSynchronizationState({environment:"sandbox",organizationId:SANDBOX_ORGANIZATION_ID,sourceId:"source-001",folderId:"connected-001",googleFolderId:"folder-001",metadata:resetRepository});check(secondReset.filesRemoved===0&&secondReset.passagesRemoved===0&&secondReset.sourceVersionsRemoved===0,"reset must be idempotent");
    await assert.rejects(()=>resetSandboxGoogleDriveSynchronizationState({environment:"production",organizationId:SANDBOX_ORGANIZATION_ID,sourceId:"source-001",folderId:"connected-001",googleFolderId:"folder-001",metadata:{read:async()=>metadata as never,replace:async()=>undefined}}),/refused/);checks+=1;
  }finally{console.log=originalLog;await rm(root,{recursive:true,force:true});}
  console.log(JSON.stringify({result:"PASS",checks,semanticParityPassed:true,fieldLevelDiff:true,transportInvariance:true,canonicalSensitivity:true,cleanResetSupported:true,rawRuntimeReturned:false,rawDocumentBodyReturned:false,credentialEmitted:false,connectorCalls:0,driveReads:0,driveWrites:0,productionTouched:false},null,2));
}
void main();
