import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { GoogleDriveSynchronizationReceipt } from "../../connectors/google-drive/contracts";
import { normalizeExtractedContent } from "../../connectors/google-drive/identity";
import { SANDBOX_ORGANIZATION_ID, sandboxManifest, type SandboxBatchId, type SandboxDocument } from "./manifest";
import { runLivingOrganizationSandbox, type SandboxReplayResult } from "./replay";

export const SANDBOX_DRIVE_MAX_FILES = 32;
export const SANDBOX_DRIVE_MAX_TOTAL_BYTES = 2 * 1024 * 1024;
export const SANDBOX_DRIVE_MIME_ALLOWLIST = [
  "application/vnd.google-apps.document", "text/markdown", "text/plain",
] as const;

export type SandboxDriveTransportFile = {
  driveFileId: string; driveRevisionId: string; name: string; mimeType: string;
  retrievedAt: string; content: string;
};
export type SandboxDriveBinding = {
  logicalDocumentId: string; logicalDocumentVersion: string; normalizedContentDigest: string;
  driveFileId: string; driveRevisionId: string; driveMimeType: string; retrievedAt: string;
  effectiveAt: string; sourceAuthorizationScope: string;
};
export type SandboxDriveSynchronizationResult = {
  version: "1"; organizationId: typeof SANDBOX_ORGANIZATION_ID; folderBindingIdentity: string;
  synchronizedAt: string; filesInspected: number; newFiles: number; updatedFiles: number;
  unchangedFiles: number; duplicateFiles: number; unsupportedFiles: number; failedFiles: number;
  evidenceCandidates: number; evidenceAdmitted: number; bindings: SandboxDriveBinding[];
  runtimeRevisionBefore: null; runtimeRevisionAfter: null;
  materialChange: "initial"|"changed"|"no-material-change";
  understandingRevisionIds: string[]; contradictionCount: number;
  investigationOpportunityCount: number; checkpointDigest: string;
  semanticParity: boolean; warnings: string[];
  nextOperatorAction: string; driveWrites: 0; rawRuntimeReturned: false;
};
export type SandboxDriveCanonicalOwner = { synchronizeFolder(input: {
  userId: string; organizationId: string; sourceId: string; folderId: string;
}): Promise<GoogleDriveSynchronizationReceipt> };

const corpusRoot = path.dirname(new URL(import.meta.url).pathname);
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const normalizedDigest = (value: string) => digest(normalizeExtractedContent(value));

function exactOpaqueId(value: string, label: string): string {
  const exact = value.trim();
  if (!exact || ["root","my-drive","drive"].includes(exact.toLowerCase())) throw new Error(`Sandbox Google Drive ${label} must be an exact non-root identifier.`);
  if (/[/\\?&*]/.test(exact)) throw new Error(`Sandbox Google Drive ${label} must be an opaque identifier.`);
  return exact;
}
function expectedDocuments(throughBatch: SandboxBatchId): readonly SandboxDocument[] {
  const finalIndex = sandboxManifest.batchOrder.indexOf(throughBatch);
  return sandboxManifest.documents.filter(document => sandboxManifest.batchOrder.indexOf(document.batchId) <= finalIndex);
}

export async function sandboxDriveUploadInventory() {
  return Promise.all(sandboxManifest.documents.map(async document => {
    const content = await readFile(path.join(corpusRoot,document.relativePath),"utf8");
    return { logicalDocumentId:document.id, batchId:document.batchId, filename:path.basename(document.relativePath), manifestDigest:document.sha256, normalizedContentDigest:normalizedDigest(content) };
  }));
}

export async function bindSandboxDriveFiles(input: {
  environment:string; organizationId:string; configuredFolderId:string; requestedFolderId:string;
  sourceId:string; includeNested:boolean; files:readonly SandboxDriveTransportFile[]; throughBatch:SandboxBatchId;
}): Promise<{bindings:SandboxDriveBinding[];contents:Map<string,string>}> {
  if (!["development","sandbox","test"].includes(input.environment)) throw new Error("Sandbox Google Drive corpus synchronization is unavailable outside development, sandbox, or test.");
  if (input.organizationId !== SANDBOX_ORGANIZATION_ID) throw new Error("Sandbox Google Drive organization mismatch.");
  const configuredFolderId=exactOpaqueId(input.configuredFolderId,"configured folder ID");
  const requestedFolderId=exactOpaqueId(input.requestedFolderId,"requested folder ID");
  if (configuredFolderId!==requestedFolderId) throw new Error("Sandbox Google Drive folder mismatch.");
  const sourceId=exactOpaqueId(input.sourceId,"authorized source ID");
  if(input.includeNested) throw new Error("Sandbox Google Drive corpus requires non-recursive exact-folder scope.");
  if(input.files.length>SANDBOX_DRIVE_MAX_FILES) throw new Error("Sandbox Google Drive file-count limit exceeded.");
  if(input.files.reduce((sum,file)=>sum+Buffer.byteLength(file.content),0)>SANDBOX_DRIVE_MAX_TOTAL_BYTES) throw new Error("Sandbox Google Drive total-byte limit exceeded.");
  const inventory=await sandboxDriveUploadInventory(); const expected=expectedDocuments(input.throughBatch);
  const expectedIds=new Set(expected.map(document=>document.id));
  const inventoryByKey=new Map(inventory.map(item=>[`${item.filename}\u001f${item.normalizedContentDigest}`,item]));
  const filesByLogicalId=new Map<string,SandboxDriveTransportFile>(); const bindings:SandboxDriveBinding[]=[];
  for(const file of input.files){
    if(!(SANDBOX_DRIVE_MIME_ALLOWLIST as readonly string[]).includes(file.mimeType)) throw new Error(`Unsupported sandbox Google Drive MIME type: ${file.mimeType||"unknown"}.`);
    exactOpaqueId(file.driveFileId,"file ID"); exactOpaqueId(file.driveRevisionId,"revision ID");
    const match=inventoryByKey.get(`${file.name}\u001f${normalizedDigest(file.content)}`);
    if(!match||!expectedIds.has(match.logicalDocumentId)) throw new Error(`Unexpected or digest-mismatched sandbox corpus file: ${file.name}.`);
    if(filesByLogicalId.has(match.logicalDocumentId)) throw new Error(`Duplicate Drive transport binding for ${match.logicalDocumentId}.`);
    const document=sandboxManifest.documents.find(item=>item.id===match.logicalDocumentId)!;
    filesByLogicalId.set(match.logicalDocumentId,file);
    bindings.push({logicalDocumentId:document.id,logicalDocumentVersion:document.version,normalizedContentDigest:match.normalizedContentDigest,driveFileId:file.driveFileId,driveRevisionId:file.driveRevisionId,driveMimeType:file.mimeType,retrievedAt:file.retrievedAt,effectiveAt:document.effectiveAt,sourceAuthorizationScope:`organization:${SANDBOX_ORGANIZATION_ID}:google-drive-binding:${digest(`${sourceId}\u001f${configuredFolderId}`)}`});
  }
  const missing=expected.filter(document=>!filesByLogicalId.has(document.id));
  if(missing.length) throw new Error(`Sandbox Google Drive corpus is incomplete: ${missing.map(item=>item.id).join(", ")}.`);
  return {bindings:bindings.sort((a,b)=>a.logicalDocumentId.localeCompare(b.logicalDocumentId)),contents:new Map([...filesByLogicalId].map(([id,file])=>[id,file.content]))};
}

function semanticShape(result:SandboxReplayResult){
  return {checkpoints:result.checkpoints.map(item=>({batchId:item.batchId,sourceCount:item.sourceCount,newSourceCount:item.newSourceCount,updatedSourceCount:item.updatedSourceCount,duplicateCount:item.duplicateCount,unsupportedOrFailedCount:item.unsupportedOrFailedCount,evidenceCandidateCount:item.evidenceCandidateCount,admittedEvidenceCount:item.admittedEvidenceCount,admittedEvidenceDigests:item.admittedEvidenceDigests,currentUnderstandingIds:item.currentUnderstandingIds,currentUnderstandingRevisionIds:item.currentUnderstandingRevisionIds,currentUnderstandingCount:item.currentUnderstandingCount,evolutionHistoryCount:item.evolutionHistoryCount,materialChange:item.materialChange,contradictionCount:item.contradictionCount,uncertainty:item.uncertainty,investigationOpportunityCount:item.investigationOpportunityCount,unrelatedControlDigest:item.unrelatedControlDigest})),negativeControls:result.negativeControls};
}
export function semanticCheckpointsEqual(drive:SandboxReplayResult,local:SandboxReplayResult):boolean {
  return JSON.stringify(semanticShape(drive))===JSON.stringify(semanticShape(local));
}

export async function synchronizeSandboxDriveCorpus(input:{
  environment:string;userId:string;organizationId:string;sourceId:string;configuredFolderId:string;
  requestedFolderId:string;connectedFolderId:string;includeNested:boolean;throughBatch:SandboxBatchId;
  files:readonly SandboxDriveTransportFile[];sandboxRoot:string;localOracleRoot:string;owner:SandboxDriveCanonicalOwner;
}):Promise<SandboxDriveSynchronizationResult>{
  const bound=await bindSandboxDriveFiles(input);
  const receipt=await input.owner.synchronizeFolder({userId:input.userId,organizationId:input.organizationId,sourceId:input.sourceId,folderId:input.connectedFolderId});
  if(receipt.organizationId!==SANDBOX_ORGANIZATION_ID||receipt.folderId!==input.connectedFolderId) throw new Error("Canonical Google Drive synchronization receipt scope mismatch.");
  if(receipt.inaccessibleFiles.length||receipt.unsupportedFiles.length) throw new Error("Canonical Google Drive synchronization reported unsupported or failed corpus files.");
  const driveReplay=await runLivingOrganizationSandbox({sandboxRoot:input.sandboxRoot,throughBatch:input.throughBatch,documentContents:bound.contents});
  // The canonical Runtime store resolves its configured directory once per process.
  // Reuse the same exact acceptance root; replay reset makes the oracle run clean.
  const localReplay=await runLivingOrganizationSandbox({sandboxRoot:input.sandboxRoot,throughBatch:input.throughBatch});
  const checkpoint=driveReplay.checkpoints.at(-1)!; const semanticCheckpointDigest=digest(JSON.stringify(semanticShape(driveReplay)));
  return {version:"1",organizationId:SANDBOX_ORGANIZATION_ID,folderBindingIdentity:digest(`${input.sourceId}\u001f${input.configuredFolderId}`),synchronizedAt:receipt.synchronizedAt,filesInspected:input.files.length,newFiles:receipt.newFiles.length,updatedFiles:receipt.changedFiles.length,unchangedFiles:receipt.unchangedFiles.length+receipt.unchangedContentRevisionFiles.length,duplicateFiles:checkpoint.duplicateCount,unsupportedFiles:receipt.unsupportedFiles.length,failedFiles:receipt.inaccessibleFiles.length,evidenceCandidates:checkpoint.evidenceCandidateCount,evidenceAdmitted:checkpoint.admittedEvidenceCount,bindings:bound.bindings,runtimeRevisionBefore:null,runtimeRevisionAfter:null,materialChange:checkpoint.materialChange,understandingRevisionIds:[...checkpoint.currentUnderstandingRevisionIds],contradictionCount:checkpoint.contradictionCount,investigationOpportunityCount:checkpoint.investigationOpportunityCount,checkpointDigest:semanticCheckpointDigest,semanticParity:semanticCheckpointsEqual(driveReplay,localReplay),warnings:["Runtime repository revisions are not exposed by the canonical sandbox replay owner.",...receipt.limitations],nextOperatorAction:"Add only the next declared corpus batch, or rerun unchanged synchronization.",driveWrites:0,rawRuntimeReturned:false};
}
