import { createHash } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { InvestigationEvidenceSource } from "../../../engine/types";
import { discloseCanonicalOrganizationalUnderstanding } from "../../../engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding";
import { compileOrganizationalUnderstandingProjection, ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION, type CanonicalEvolutionReference } from "../../../engine/v3/projection/organizationalUnderstandingProjection";
import { SANDBOX_CONTROL_AREA, SANDBOX_ORGANIZATION_ID, sandboxManifest, type SandboxBatchId } from "./manifest";
import { resetLivingOrganizationSandbox } from "./reset";
import { northstarScopeTopology, northstarSourceScopeBindings } from "./sourceScopeBindings";

const root = path.dirname(new URL(import.meta.url).pathname);
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const normalizedContent = (value: string) => value.replace(/\s+/g," ").trim().toLowerCase();

export type SandboxCheckpoint = { batchId: SandboxBatchId; replayTimestamp: string; sourceCount: number; newSourceCount: number; updatedSourceCount: number; duplicateCount: number; unsupportedOrFailedCount: number; evidenceCandidateCount: number; admittedEvidenceCount: number; admittedEvidenceDigests: string[]; currentUnderstandingIds: string[]; currentUnderstandingRevisionIds: string[]; currentUnderstandingCount: number; evolutionHistoryCount: number; modelDigest: string; materialChange: "initial"|"changed"|"no-material-change"; contradictionCount: number; uncertainty: { driverCount: number; limiterCount: number }; investigationOpportunityCount: number; authorizedProjectionId: string; unrelatedControlDigest: string; checkpointDigest: string };
export type SandboxNegativeControlResult = { documentId: string; classification: NonNullable<(typeof sandboxManifest.documents)[number]["negativeControl"]>; contentDuplicate: boolean; candidateCreated: boolean; admitted: boolean; materialChange: boolean };
export type SandboxReplayResult = { manifestDigest: string; checkpoints: SandboxCheckpoint[]; negativeControls: SandboxNegativeControlResult[]; connectorCalls: 0; networkCalls: 0; externalActions: 0 };

async function sources(batchId: SandboxBatchId, seen: Set<string>, documentContents?: ReadonlyMap<string,string>) {
  const documents = sandboxManifest.documents.filter((item) => item.batchId === batchId);
  const candidates: InvestigationEvidenceSource[] = []; const negativeControls: SandboxNegativeControlResult[] = [];
  let duplicates = 0;
  for (const document of documents) {
    const content = documentContents?.get(document.id) ?? await readFile(path.join(root,document.relativePath),"utf8");
    const contentKey = digest(normalizedContent(content));
    const contentDuplicate = seen.has(contentKey);
    if (document.negativeControl) {
      if (contentDuplicate || document.negativeControl === "formatting-only") duplicates += 1;
      negativeControls.push({ documentId:document.id, classification:document.negativeControl, contentDuplicate, candidateCreated:false, admitted:false, materialChange:false });
      continue;
    }
    seen.add(contentKey);
    candidates.push({ sourceId:`sandbox:${document.id}:v${document.version}`, sourceType:"authorized_records", observedAt:document.effectiveAt, reliability:.8, sourceName:document.relativePath, sourceRole:document.semanticRole, organizationScope:sandboxManifest.sourceScope, ingestionMethod:"file", originalFilename:path.basename(document.relativePath), mimeType:document.sourceType, contentDigest:document.sha256, extractionStatus:"extracted", content });
  }
  return { documents, candidates: candidates.sort((left,right)=>left.sourceId.localeCompare(right.sourceId)), duplicates, negativeControls };
}

export async function runLivingOrganizationSandbox(input: { sandboxRoot: string; throughBatch?: SandboxBatchId; startAtBatch?: SandboxBatchId; reset?: boolean; documentContents?: ReadonlyMap<string,string> }): Promise<SandboxReplayResult> {
  if(input.reset!==false) await resetLivingOrganizationSandbox({environment:"sandbox",organizationId:SANDBOX_ORGANIZATION_ID,sandboxRoot:input.sandboxRoot});
  const runtimeDirectory = path.join(input.sandboxRoot,"runtime"); await mkdir(runtimeDirectory,{recursive:true});
  process.env.DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY = runtimeDirectory;
  const { runOrganizationInvestigation } = await import("../../../engine/v3/investigation/runOrganizationInvestigation");
  const seen = new Set<string>(); const checkpoints: SandboxCheckpoint[] = []; const negativeControls: SandboxNegativeControlResult[] = [];
  const startIndex=input.startAtBatch?sandboxManifest.batchOrder.indexOf(input.startAtBatch):0;
  if(startIndex<0) throw new Error("Unknown sandbox replay start batch.");
  for(const document of sandboxManifest.documents.filter(item=>sandboxManifest.batchOrder.indexOf(item.batchId)<startIndex)){
    const content=input.documentContents?.get(document.id)??await readFile(path.join(root,document.relativePath),"utf8");seen.add(digest(normalizedContent(content)));
  }
  const finalIndex=input.throughBatch?sandboxManifest.batchOrder.indexOf(input.throughBatch):sandboxManifest.batchOrder.length-1;
  const order=sandboxManifest.batchOrder.slice(startIndex,finalIndex+1);
  for (const batchId of order) {
    const batchIndex = sandboxManifest.batchOrder.indexOf(batchId); const loaded = await sources(batchId,seen,input.documentContents);
    let runtime;
    let result;
    if (loaded.candidates.length) {
      const { loadOrganizationRuntimeState } = await import("../../../engine/v3/runtime/organizationStateStore");
      const before = loadOrganizationRuntimeState(SANDBOX_ORGANIZATION_ID);
      const investigation = runOrganizationInvestigation({
        organizationId: SANDBOX_ORGANIZATION_ID,
        company: sandboxManifest.organization.name,
        website: sandboxManifest.organization.website,
        industry: sandboxManifest.organization.industry,
        question: sandboxManifest.primaryQuestion,
        context: `Bounded local sandbox batch ${batchId}.`,
        evidenceSources: loaded.candidates,
        investigationRequestId: `living-organization-${batchId}-v1`,
        scopeLineage: {
          organizationId: SANDBOX_ORGANIZATION_ID,
          effectiveAt: sandboxManifest.replayTimestamps[batchIndex]!,
          topologyRevisions: [northstarScopeTopology],
          sourceBindingRevisions: northstarSourceScopeBindings,
          existingEvidenceAttributions:
            before.memory.canonicalScopeLineageIndex?.evidenceAttributions ?? [],
        },
      });
      runtime=investigation.runtime; result=investigation.result;
    } else {
      const { loadOrganizationRuntimeState } = await import("../../../engine/v3/runtime/organizationStateStore"); runtime=loadOrganizationRuntimeState(SANDBOX_ORGANIZATION_ID); result=runtime.memory.understandingState as any;
    }
    const memory=runtime.memory as typeof runtime.memory & { organizationalUncertainty?: {drivers?: unknown[]; confidenceLimiters?: unknown[]}; investigationOpportunities?: unknown[] };
    const compositions=runtime.memory.organizationalUnderstandingState.canonicalCompositions ?? [];
    const decision={id:`sandbox-disclosure-${batchId}`,organizationId:SANDBOX_ORGANIZATION_ID,consumerId:"sandbox-validator",disposition:"eligible" as const,effectiveAt:sandboxManifest.replayTimestamps[batchIndex]!,basis:["exact sandbox validator authorization"]};
    const disclosure=discloseCanonicalOrganizationalUnderstanding({organizationId:SANDBOX_ORGANIZATION_ID,consumerId:"sandbox-validator",decision,compositions});
    const projection=compileOrganizationalUnderstandingProjection({context:{organizationId:SANDBOX_ORGANIZATION_ID,consumerId:"sandbox-validator",experience:"organization",generatedAt:sandboxManifest.replayTimestamps[batchIndex]!,contractVersion:ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION},disclosure,compositions,explanations:runtime.memory.organizationalExplanations,conditions:(memory as any).organizationalConditions ?? [],organizationalState:(memory as any).organizationalState,uncertainty:memory.organizationalUncertainty as any,investigations:(memory.investigationOpportunities ?? []) as any,evolution:[] as CanonicalEvolutionReference[]});
    const ids=projection.understandings.map(item=>item.id).sort();
    const revisions=projection.understandings.map(item=>item.canonicalRef.revisionId ?? item.id).sort();
    const modelDigest=digest({ understandingIds:ids, revisionIds:revisions, evolutionHistoryCount:runtime.memory.organizationalUnderstandingState.evolutionHistory.length });
    const prior=checkpoints.at(-1); const changed=prior ? modelDigest !== prior.modelDigest : true;
    const controlTerms=SANDBOX_CONTROL_AREA.toLowerCase().split(/\s+/).filter(term=>term.length>5);
    const controlState=projection.understandings.filter(item=>controlTerms.some(term=>JSON.stringify(item.value).toLowerCase().includes(term))).map(item=>item.id).sort();
    const safe={batchId,replayTimestamp:sandboxManifest.replayTimestamps[batchIndex]!,sourceCount:loaded.documents.length,newSourceCount:loaded.candidates.length,updatedSourceCount:0,duplicateCount:loaded.duplicates,unsupportedOrFailedCount:0,evidenceCandidateCount:loaded.candidates.length,admittedEvidenceCount:result?.evidence?.length ?? 0,admittedEvidenceDigests:(result?.evidence ?? []).map((item:any)=>digest([item.sourceId,item.text])).sort(),currentUnderstandingIds:ids,currentUnderstandingRevisionIds:revisions,currentUnderstandingCount:ids.length,evolutionHistoryCount:runtime.memory.organizationalUnderstandingState.evolutionHistory.length,modelDigest,materialChange:(batchIndex===0?"initial":changed?"changed":"no-material-change") as SandboxCheckpoint["materialChange"],contradictionCount:result?.contradictions?.length ?? 0,uncertainty:{driverCount:memory.organizationalUncertainty?.drivers?.length ?? 0,limiterCount:memory.organizationalUncertainty?.confidenceLimiters?.length ?? 0},investigationOpportunityCount:memory.investigationOpportunities?.length ?? 0,authorizedProjectionId:projection.projectionId,unrelatedControlDigest:digest(controlState)};
    checkpoints.push({...safe,checkpointDigest:digest(safe)});
    negativeControls.push(...loaded.negativeControls.map(item=>({...item,materialChange:changed})));
  }
  return {manifestDigest:digest(sandboxManifest),checkpoints,negativeControls,connectorCalls:0,networkCalls:0,externalActions:0};
}
