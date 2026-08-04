import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { GoogleDriveSynchronizationReceipt } from "../../connectors/google-drive/contracts";
import { normalizeExtractedContent } from "../../connectors/google-drive/identity";
import type { GoogleDriveMetadataRepository } from "../../connectors/google-drive/repositories";
import { SANDBOX_ORGANIZATION_ID, sandboxManifest, type SandboxBatchId, type SandboxDocument } from "./manifest";
import { runLivingOrganizationSandboxIsolated } from "./isolatedReplay";
import type { SandboxReplayResult } from "./replay";

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
  passageContentDigest: string; passageContentLength: number;
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
  semanticParityDiagnostic: SandboxSemanticParityDiagnostic;
  nextOperatorAction: string; driveWrites: 0; rawRuntimeReturned: false;
};
export type SandboxSemanticParityDifference = {
  field: string;
  expected: unknown;
  observed: unknown;
  classification: "canonical-mismatch";
  transportOnly: false;
  firstResponsibleBoundary: "manifest-binding" | "evidence-admission" | "runtime-evolution" | "authorized-projection" | "checkpoint-construction";
};
export type SandboxSemanticParityDiagnostic = {
  passed: boolean;
  differences: SandboxSemanticParityDifference[];
  expectedDigest: string;
  observedDigest: string;
  transportFieldsExcluded: string[];
  canonicalFieldsExcluded: [];
};
export type SandboxSemanticFirstDivergence = {
  firstDivergentOwner: SandboxSemanticParityDifference["firstResponsibleBoundary"] | null;
  firstDivergentField: string | null;
  independentMismatchCount: number;
  dependentDownstreamMismatchCount: number;
  expectedSafeDigest: string | null;
  observedSafeDigest: string | null;
};
export type SandboxSemanticDocument = { logicalDocumentId:string;logicalDocumentVersion:string;normalizedContentDigest:string;passageContentDigest?:string;passageContentLength?:number;effectiveAt:string };
export type SandboxDriveCanonicalOwner = { synchronizeFolder(input: {
  userId: string; organizationId: string; sourceId: string; folderId: string;
}): Promise<GoogleDriveSynchronizationReceipt> };
export type SandboxGoogleDriveResetReceipt={version:"1";organizationId:typeof SANDBOX_ORGANIZATION_ID;sourceId:string;folderId:string;filesRemoved:number;passagesRemoved:number;sourceVersionsRemoved:number;folderSynchronizationReset:true;driveWrites:0;digest:string};

const corpusRoot = path.dirname(new URL(import.meta.url).pathname);
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const normalizedDigest = (value: string) => digest(normalizeExtractedContent(value));

export async function resetSandboxGoogleDriveSynchronizationState(input:{environment:string;organizationId:string;sourceId:string;folderId:string;googleFolderId:string;metadata:GoogleDriveMetadataRepository}):Promise<SandboxGoogleDriveResetReceipt>{
  if(!["development","sandbox","test"].includes(input.environment)) throw new Error("Sandbox Google Drive synchronization reset refused outside development, sandbox, or test.");
  if(input.organizationId!==SANDBOX_ORGANIZATION_ID) throw new Error("Sandbox Google Drive synchronization reset organization mismatch.");
  const metadata=await input.metadata.read();
  const source=metadata.sources.find(item=>item.id===input.sourceId);
  const folder=metadata.folders.find(item=>item.id===input.folderId);
  if(!source||source.organizationId!==input.organizationId||source.revokedAt) throw new Error("Exact sandbox Google Drive source reset access denied.");
  if(!folder||folder.sourceId!==source.id||folder.organizationId!==input.organizationId||folder.revokedAt||folder.includeNested||folder.googleFolderId!==input.googleFolderId) throw new Error("Exact sandbox Google Drive folder reset access denied.");
  const removedFiles=metadata.files.filter(item=>item.folderId===folder.id);
  const removedFileIds=new Set(removedFiles.map(item=>item.googleFileId));
  const removedSourceIdentities=new Set(removedFiles.map(item=>item.sourceIdentity));
  const passages=metadata.passages.filter(item=>removedFileIds.has(item.googleFileId));
  const sourceVersions=(metadata.sourceVersions??[]).filter(item=>removedSourceIdentities.has(item.sourceIdentity));
  await input.metadata.replace({...metadata,folders:metadata.folders.map(item=>item.id===folder.id?{...item,lastSynchronizedAt:null,synchronizationCursor:null}:item),files:metadata.files.filter(item=>item.folderId!==folder.id),passages:metadata.passages.filter(item=>!removedFileIds.has(item.googleFileId)),sourceVersions:(metadata.sourceVersions??[]).filter(item=>!removedSourceIdentities.has(item.sourceIdentity))});
  const base={version:"1" as const,organizationId:SANDBOX_ORGANIZATION_ID as typeof SANDBOX_ORGANIZATION_ID,sourceId:source.id,folderId:folder.id,filesRemoved:removedFiles.length,passagesRemoved:passages.length,sourceVersionsRemoved:sourceVersions.length,folderSynchronizationReset:true as const,driveWrites:0 as const};
  return {...base,digest:digest(JSON.stringify(base))};
}

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
    const passageContent=normalizeExtractedContent(file.content);
    bindings.push({logicalDocumentId:document.id,logicalDocumentVersion:document.version,normalizedContentDigest:match.normalizedContentDigest,passageContentDigest:digest(passageContent),passageContentLength:passageContent.length,driveFileId:file.driveFileId,driveRevisionId:file.driveRevisionId,driveMimeType:file.mimeType,retrievedAt:file.retrievedAt,effectiveAt:document.effectiveAt,sourceAuthorizationScope:`organization:${SANDBOX_ORGANIZATION_ID}:google-drive-binding:${digest(`${sourceId}\u001f${configuredFolderId}`)}`});
  }
  const missing=expected.filter(document=>!filesByLogicalId.has(document.id));
  if(missing.length) throw new Error(`Sandbox Google Drive corpus is incomplete: ${missing.map(item=>item.id).join(", ")}.`);
  return {bindings:bindings.sort((a,b)=>a.logicalDocumentId.localeCompare(b.logicalDocumentId)),contents:new Map([...filesByLogicalId].map(([id,file])=>[id,file.content]))};
}

function semanticShape(result:SandboxReplayResult){
  return {checkpoints:result.checkpoints.map(item=>({batchId:item.batchId,sourceCount:item.sourceCount,newSourceCount:item.newSourceCount,updatedSourceCount:item.updatedSourceCount,duplicateCount:item.duplicateCount,unsupportedOrFailedCount:item.unsupportedOrFailedCount,evidenceCandidateCount:item.evidenceCandidateCount,admittedEvidenceCount:item.admittedEvidenceCount,admittedEvidenceDigests:[...item.admittedEvidenceDigests],currentUnderstandingIds:[...item.currentUnderstandingIds].sort(),currentUnderstandingRevisionIds:[...item.currentUnderstandingRevisionIds].sort(),currentUnderstandingCount:item.currentUnderstandingCount,evolutionHistoryCount:item.evolutionHistoryCount,materialChange:item.materialChange,contradictionCount:item.contradictionCount,uncertainty:item.uncertainty,investigationOpportunityCount:item.investigationOpportunityCount,unrelatedControlDigest:item.unrelatedControlDigest})),negativeControls:[...result.negativeControls].sort((a,b)=>a.documentId.localeCompare(b.documentId))};
}
const transportFieldsExcluded = ["driveFileId","driveRevisionId","connectorRequestId","oauthIdentity","retrievedAt","temporaryPath","googleAccountMetadata"];
function responsibleBoundary(field:string):SandboxSemanticParityDifference["firstResponsibleBoundary"]{
  const normalized=field.toLowerCase();
  if(normalized.startsWith("documents")) return "manifest-binding";
  if(normalized.includes("evidence")) return "evidence-admission";
  if(normalized.includes("understanding")) return "authorized-projection";
  if(normalized.includes("evolutionhistory")||normalized.includes("materialchange")||normalized.includes("contradiction")||normalized.includes("uncertainty")||normalized.includes("investigation")) return "runtime-evolution";
  return "checkpoint-construction";
}
function fieldDifferences(expected:unknown,observed:unknown,prefix=""):SandboxSemanticParityDifference[]{
  if(JSON.stringify(expected)===JSON.stringify(observed)) return [];
  if(Array.isArray(expected)&&Array.isArray(observed)) return Array.from({length:Math.max(expected.length,observed.length)},(_,index)=>fieldDifferences(expected[index],observed[index],`${prefix}[${index}]`)).flat();
  if(expected&&observed&&typeof expected==="object"&&typeof observed==="object"){
    const left=expected as Record<string,unknown>,right=observed as Record<string,unknown>;
    return [...new Set([...Object.keys(left),...Object.keys(right)])].sort().flatMap(key=>fieldDifferences(left[key],right[key],prefix?`${prefix}.${key}`:key));
  }
  return [{field:prefix,expected,observed,classification:"canonical-mismatch",transportOnly:false,firstResponsibleBoundary:responsibleBoundary(prefix)}];
}
function observedDocumentSemantics(bindings:readonly SandboxDriveBinding[],comparePassageContent:boolean){
  return bindings.map(binding=>({logicalDocumentId:binding.logicalDocumentId,logicalDocumentVersion:binding.logicalDocumentVersion,normalizedContentDigest:binding.normalizedContentDigest,...(comparePassageContent?{passageContentDigest:binding.passageContentDigest,passageContentLength:binding.passageContentLength}:{}),effectiveAt:binding.effectiveAt})).sort((a,b)=>a.logicalDocumentId.localeCompare(b.logicalDocumentId));
}
export function compareSandboxSemanticParity(input:{expected:SandboxReplayResult;observed:SandboxReplayResult;expectedDocuments?:readonly SandboxSemanticDocument[];observedBindings?:readonly SandboxDriveBinding[]}):SandboxSemanticParityDiagnostic{
  const expected={...(input.expectedDocuments?{documents:[...input.expectedDocuments].sort((a,b)=>a.logicalDocumentId.localeCompare(b.logicalDocumentId))}:{}),replay:semanticShape(input.expected)};
  const comparePassageContent=input.expectedDocuments?.some(document=>document.passageContentDigest!==undefined||document.passageContentLength!==undefined)??false;
  const observed={...(input.observedBindings?{documents:observedDocumentSemantics(input.observedBindings,comparePassageContent)}:{}),replay:semanticShape(input.observed)};
  const differences=fieldDifferences(expected,observed);
  return {passed:differences.length===0,differences,expectedDigest:digest(JSON.stringify(expected)),observedDigest:digest(JSON.stringify(observed)),transportFieldsExcluded:[...transportFieldsExcluded],canonicalFieldsExcluded:[]};
}
export function summarizeSandboxSemanticFirstDivergence(diagnostic:SandboxSemanticParityDiagnostic):SandboxSemanticFirstDivergence{
  const first=diagnostic.differences[0];
  if(!first) return {firstDivergentOwner:null,firstDivergentField:null,independentMismatchCount:0,dependentDownstreamMismatchCount:0,expectedSafeDigest:null,observedSafeDigest:null};
  return {firstDivergentOwner:first.firstResponsibleBoundary,firstDivergentField:first.field,independentMismatchCount:1,dependentDownstreamMismatchCount:diagnostic.differences.length-1,expectedSafeDigest:digest(JSON.stringify(first.expected)),observedSafeDigest:digest(JSON.stringify(first.observed))};
}
export function semanticCheckpointsEqual(drive:SandboxReplayResult,local:SandboxReplayResult):boolean {
  return compareSandboxSemanticParity({expected:local,observed:drive}).passed;
}

export async function synchronizeSandboxDriveCorpus(input:{
  environment:string;userId:string;organizationId:string;sourceId:string;configuredFolderId:string;
  requestedFolderId:string;connectedFolderId:string;includeNested:boolean;throughBatch:SandboxBatchId;
  files:readonly SandboxDriveTransportFile[];sandboxRoot:string;localOracleRoot:string;owner:SandboxDriveCanonicalOwner;
  replayStartAtBatch?:SandboxBatchId;resetReplay?:boolean;
}):Promise<SandboxDriveSynchronizationResult>{
  const bound=await bindSandboxDriveFiles(input);
  const receipt=await input.owner.synchronizeFolder({userId:input.userId,organizationId:input.organizationId,sourceId:input.sourceId,folderId:input.connectedFolderId});
  if(receipt.organizationId!==SANDBOX_ORGANIZATION_ID||receipt.folderId!==input.connectedFolderId) throw new Error("Canonical Google Drive synchronization receipt scope mismatch.");
  if(receipt.inaccessibleFiles.length||receipt.unsupportedFiles.length) throw new Error("Canonical Google Drive synchronization reported unsupported or failed corpus files.");
  const driveReplay=await runLivingOrganizationSandboxIsolated({role:"synthetic-drive",sandboxRoot:input.sandboxRoot,startAtBatch:input.replayStartAtBatch,reset:input.resetReplay,throughBatch:input.throughBatch,documentContents:bound.contents});
  const localReplay=await runLivingOrganizationSandboxIsolated({role:"local-expected",sandboxRoot:input.localOracleRoot,startAtBatch:input.replayStartAtBatch,reset:input.resetReplay,throughBatch:input.throughBatch});
  const checkpoint=driveReplay.checkpoints.at(-1)!; const semanticCheckpointDigest=digest(JSON.stringify(semanticShape(driveReplay)));
  const canonicalInventory=await sandboxDriveUploadInventory();
  const expectedSemanticDocuments=await Promise.all(expectedDocuments(input.throughBatch).map(async document=>{const content=normalizeExtractedContent(await readFile(path.join(corpusRoot,document.relativePath),"utf8"));return {logicalDocumentId:document.id,logicalDocumentVersion:document.version,normalizedContentDigest:canonicalInventory.find(item=>item.logicalDocumentId===document.id)!.normalizedContentDigest,passageContentDigest:digest(content),passageContentLength:content.length,effectiveAt:document.effectiveAt};}));
  const semanticParityDiagnostic=compareSandboxSemanticParity({expected:localReplay,observed:driveReplay,expectedDocuments:expectedSemanticDocuments,observedBindings:bound.bindings});
  return {version:"1",organizationId:SANDBOX_ORGANIZATION_ID,folderBindingIdentity:digest(`${input.sourceId}\u001f${input.configuredFolderId}`),synchronizedAt:receipt.synchronizedAt,filesInspected:input.files.length,newFiles:receipt.newFiles.length,updatedFiles:receipt.changedFiles.length,unchangedFiles:receipt.unchangedFiles.length+receipt.unchangedContentRevisionFiles.length,duplicateFiles:checkpoint.duplicateCount,unsupportedFiles:receipt.unsupportedFiles.length,failedFiles:receipt.inaccessibleFiles.length,evidenceCandidates:checkpoint.evidenceCandidateCount,evidenceAdmitted:checkpoint.admittedEvidenceCount,bindings:bound.bindings,runtimeRevisionBefore:null,runtimeRevisionAfter:null,materialChange:checkpoint.materialChange,understandingRevisionIds:[...checkpoint.currentUnderstandingRevisionIds],contradictionCount:checkpoint.contradictionCount,investigationOpportunityCount:checkpoint.investigationOpportunityCount,checkpointDigest:semanticCheckpointDigest,semanticParity:semanticParityDiagnostic.passed,semanticParityDiagnostic,warnings:["Runtime repository revisions are not exposed by the canonical sandbox replay owner.",...receipt.limitations],nextOperatorAction:"Add only the next declared corpus batch, or rerun unchanged synchronization.",driveWrites:0,rawRuntimeReturned:false};
}
