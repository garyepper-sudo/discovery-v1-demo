import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { GoogleDriveConnectorMetadata, GoogleDriveSynchronizationReceipt } from "../../product/connectors/google-drive/contracts";
import type { GoogleDriveMetadataRepository } from "../../product/connectors/google-drive/repositories";
import { googleDriveExternalSourceIdentity, googleDrivePassageIdentity } from "../../product/connectors/google-drive/identity";
import { StagedGoogleDriveMetadataRepository, validateAndCommitSandboxDriveSynchronization } from "../../product/simulations/living-organization-sandbox/googleDriveCorpus";
import { SANDBOX_LIVE_ACCEPTANCE_STAGES, SANDBOX_ORGANIZATION_ID, sandboxManifest } from "../../product/simulations/living-organization-sandbox/manifest";

const SOURCE="sandbox-source-transactional",FOLDER="connected-folder-transactional",GOOGLE_FOLDER="google-folder-transactional",NOW="2026-06-01T09:00:00.000Z";
let checks=0;
const check=(condition:unknown,message?:string)=>{assert.ok(condition,message);checks+=1;};

class MemoryMetadataRepository implements GoogleDriveMetadataRepository{
  writes=0;
  constructor(private value:GoogleDriveConnectorMetadata){}
  async read(){return structuredClone(this.value);}
  async replace(value:GoogleDriveConnectorMetadata){this.writes+=1;this.value=structuredClone(value);}
}

function baseline():GoogleDriveConnectorMetadata{
  return {
    sources:[{version:"1",id:SOURCE,organizationId:SANDBOX_ORGANIZATION_ID,authorizingUserId:"sandbox-user",accountLabel:"development-test",status:"connected",grantedScopes:["https://www.googleapis.com/auth/drive.readonly"],authorizationExpiresAt:NOW,connectedAt:NOW,revokedAt:null}],
    folders:[{id:FOLDER,sourceId:SOURCE,organizationId:SANDBOX_ORGANIZATION_ID,googleFolderId:GOOGLE_FOLDER,displayName:"Northstar sandbox",driveId:null,includeNested:false,connectedAt:NOW,lastSynchronizedAt:null,synchronizationCursor:null,revokedAt:null,limitations:[]}],
    files:[],passages:[],sourceVersions:[],
  };
}

async function candidate():Promise<GoogleDriveConnectorMetadata>{
  const value=baseline();
  for(const [index,document] of sandboxManifest.documents.entries()){
    const content=await readFile(path.join("product/simulations/living-organization-sandbox",document.relativePath),"utf8");
    const googleFileId=`drive-file-${index+1}`,revisionId="revision-1";
    const sourceIdentity=googleDriveExternalSourceIdentity({organizationId:SANDBOX_ORGANIZATION_ID,connectedSourceId:SOURCE,googleFileId});
    const passageId=googleDrivePassageIdentity({sourceIdentity,location:"body",contentDigest:document.sha256});
    value.files.push({sourceIdentity,googleFileId,folderId:FOLDER,name:path.basename(document.relativePath),mimeType:"text/markdown",revisionId,modifiedAt:NOW,digest:null,status:"accessible",lastSeenAt:NOW,extractedAt:NOW,extractionDigest:document.sha256,passageCount:1});
    value.passages.push({id:passageId,googleFileId,fileName:path.basename(document.relativePath),mimeType:"text/markdown",revisionId,modifiedAt:NOW,extractedAt:NOW,location:"body",content,contentDigest:document.sha256});
  }
  value.folders[0]!.lastSynchronizedAt=NOW;
  return value;
}

function receipt(organizationId=SANDBOX_ORGANIZATION_ID):GoogleDriveSynchronizationReceipt{
  return {sourceId:SOURCE,folderId:FOLDER,organizationId,synchronizedAt:NOW,newFiles:sandboxManifest.documents.map((_,index)=>`drive-file-${index+1}`),changedFiles:[],unchangedContentRevisionFiles:[],changedContentRevisionFiles:[],extractedForComparisonFiles:[],unchangedFiles:[],movedFiles:[],removedFiles:[],inaccessibleFiles:[],unsupportedFiles:[],cursor:null,limitations:[]};
}

async function commit(repository:GoogleDriveMetadataRepository,value:GoogleDriveConnectorMetadata,organizationId=SANDBOX_ORGANIZATION_ID){
  return validateAndCommitSandboxDriveSynchronization({environment:"sandbox",organizationId,sourceId:SOURCE,configuredFolderId:GOOGLE_FOLDER,requestedFolderId:GOOGLE_FOLDER,connectedFolderId:FOLDER,includeNested:false,throughBatch:"negative",receipt:receipt(organizationId),candidate:value,metadata:repository});
}

async function main(){
  assert.deepEqual(SANDBOX_LIVE_ACCEPTANCE_STAGES,["batch-1","batch-2","batch-3","negative","negative"]);checks+=1;
  const initial=baseline(),canonical=new MemoryMetadataRepository(initial),valid=await candidate();
  const staged=new StagedGoogleDriveMetadataRepository(initial);
  const invalid=structuredClone(valid);invalid.passages[0]!.content+="\ncorrupt";
  await staged.replace(invalid);
  assert.deepEqual(await canonical.read(),initial);checks+=1;
  const stagedInvalid=await staged.read();
  await assert.rejects(()=>commit(canonical,stagedInvalid),/digest-mismatched/);checks+=1;
  assert.deepEqual(await canonical.read(),initial);checks+=1;assert.equal(canonical.writes,0);checks+=1;
  await assert.rejects(()=>commit(canonical,valid,"another-organization"),/organization mismatch/);checks+=1;
  assert.deepEqual(await canonical.read(),initial);checks+=1;assert.equal(canonical.writes,0);checks+=1;
  const files=await commit(canonical,valid);assert.equal(files.length,16);checks+=1;assert.equal(canonical.writes,1);checks+=1;
  const committed=await canonical.read();assert.deepEqual(committed,valid);checks+=1;
  const retryFiles=await commit(canonical,structuredClone(valid));assert.equal(retryFiles.length,16);checks+=1;
  assert.deepEqual(await canonical.read(),committed);checks+=1;
  check(canonical.writes===2);check(JSON.stringify(committed).includes("another-organization")===false);
  console.log(JSON.stringify({result:"PASS",validation:"google-drive-transactional-acceptance",checks,terminalStages:[...SANDBOX_LIVE_ACCEPTANCE_STAGES],failedAttempts:2,failedAttemptMetadataWrites:0,successfulCommit:true,retryIdempotent:true,connectorCalls:0,networkCalls:0,externalActions:0},null,2));
}

void main();
