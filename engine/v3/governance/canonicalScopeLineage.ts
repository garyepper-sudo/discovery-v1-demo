import { createHash } from "node:crypto";

import type { GovernedScopeRef, GovernedScopeType } from "./scopedGovernanceContext";

export const CANONICAL_SCOPE_LINEAGE_VERSION = "1" as const;
export type ScopeRelationshipKind = "contains" | "initiative-relates";
export type SourceScopeRelationship = "origin" | "subject" | "applies-to" | "initiative";

export type CanonicalScopeNode = GovernedScopeRef & { label?: string };
export type CanonicalScopeRelationship = {
  kind: ScopeRelationshipKind;
  from: GovernedScopeRef;
  to: GovernedScopeRef;
};
export type CanonicalScopeTopology = {
  kind: "canonical-scope-topology";
  schemaVersion: typeof CANONICAL_SCOPE_LINEAGE_VERSION;
  topologyId: string;
  organizationId: string;
  topologyVersion: number;
  effectiveAt: string;
  supersedesTopologyId: string | null;
  nodes: CanonicalScopeNode[];
  relationships: CanonicalScopeRelationship[];
  digest: string;
};
export type SourceScopeAssertion = {
  relationship: SourceScopeRelationship;
  scope: GovernedScopeRef;
};
export type CanonicalSourceVersionRef = {
  sourceId: string;
  sourceVersion: string;
  normalizedContentDigest: string;
};
export type CanonicalSourceType = "pasted-text" | "plain-text-upload" | "markdown-upload" | "manual-takeaway" | "authorized-record";
export type CanonicalSourceAvailability = "available" | "revoked";
export type CanonicalSourceScopeBinding = {
  kind: "canonical-source-scope-binding";
  schemaVersion: typeof CANONICAL_SCOPE_LINEAGE_VERSION;
  bindingId: string;
  organizationId: string;
  bindingVersion: number;
  source: CanonicalSourceVersionRef;
  topologyId: string;
  assertions: SourceScopeAssertion[];
  basisRefs: string[];
  effectiveAt: string;
  supersedesBindingId: string | null;
  sourceType?: CanonicalSourceType;
  purposeRef?: string;
  availability?: CanonicalSourceAvailability;
  digest: string;
};
export type CanonicalEvidenceScopeAttribution = {
  kind: "canonical-evidence-scope-attribution";
  schemaVersion: typeof CANONICAL_SCOPE_LINEAGE_VERSION;
  attributionId: string;
  organizationId: string;
  attributionVersion: number;
  evidenceId: string;
  evidenceAdmissionId: string;
  evidenceIdentityVersion?: "1" | "2";
  localEvidenceIds?: string[];
  sourceBindingIds: string[];
  topologyId: string;
  assertions: SourceScopeAssertion[];
  effectiveAt: string;
  supersedesAttributionId: string | null;
  digest: string;
};
export type CanonicalDerivedScopeLineage = {
  kind: "canonical-derived-scope-lineage";
  schemaVersion: typeof CANONICAL_SCOPE_LINEAGE_VERSION;
  lineageId: string;
  organizationId: string;
  derivedObjectRef: string;
  supportingEvidenceIds: string[];
  evidenceAttributionIds: string[];
  topologyId: string;
  assertions: SourceScopeAssertion[];
  completeness: "complete" | "missing-structured-lineage";
  legacyOrganizationCompatibility: boolean;
  effectiveAt: string;
  digest: string;
};
export type CanonicalScopeLineageIndex = {
  kind: "canonical-scope-lineage-index";
  schemaVersion: typeof CANONICAL_SCOPE_LINEAGE_VERSION;
  organizationId: string;
  topologyId: string;
  sourceBindings: CanonicalSourceScopeBinding[];
  evidenceAttributions: CanonicalEvidenceScopeAttribution[];
  derivedLineages: CanonicalDerivedScopeLineage[];
  digest: string;
};
export type CanonicalScopeLineageAdmissionInput = {
  organizationId: string;
  effectiveAt: string;
  topologyRevisions: readonly CanonicalScopeTopology[];
  sourceBindingRevisions: readonly CanonicalSourceScopeBinding[];
  existingEvidenceAttributions?: readonly CanonicalEvidenceScopeAttribution[];
};
export type CanonicalEvidenceScopeAdmission = {
  organizationId: string;
  topology: CanonicalScopeTopology;
  sourceBindings: CanonicalSourceScopeBinding[];
  evidenceAttributions: CanonicalEvidenceScopeAttribution[];
  operationBatch: CanonicalEvidenceAdmissionOperationBatchV1;
  digest: string;
};
export type CanonicalEvidenceAdmissionOperationItemV1 = {
  contractVersion: "1";
  canonicalEvidenceId: string;
  canonicalAdmissionId: string;
  attributionId: string;
  attributionVersion: number;
  investigationEvidenceIds: string[];
  sourceBindings: Array<{
    sourceBindingId: string;
    sourceId: string;
    sourceVersion: string;
    normalizedContentDigest: string;
  }>;
  disposition: "new-canonical-evidence" | "existing-evidence-new-provenance" | "existing-attribution-replayed";
  attributionDigest: string;
};
export type CanonicalEvidenceAdmissionOperationBatchV1 = {
  contractVersion: "1";
  organizationId: string;
  admissions: CanonicalEvidenceAdmissionOperationItemV1[];
  admissionDisposition: "admitted" | "partially-admitted" | "not-admitted";
  batchDigest: string;
};

const compare = (left: string, right: string): number => left.localeCompare(right);
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value as Record<string, unknown>).sort(([a],[b]) => compare(a,b)).map(([key,item]) => `${JSON.stringify(key)}:${stable(item)}`).join(",")}}`;
  return JSON.stringify(value);
}
const hash = (value: unknown): string => createHash("sha256").update(stable(value)).digest("hex");
const exact = (value: string): boolean => value.trim() === value && value.length > 0 && value !== "*";
const timestamp = (value: string): boolean => exact(value) && Number.isFinite(Date.parse(value));
const scopeKey = (scope: GovernedScopeRef): string => stable([scope.organizationId, scope.type, scope.id]);
const assertionKey = (value: SourceScopeAssertion): string => stable([value.relationship, scopeKey(value.scope)]);
const copyScope = (scope: GovernedScopeRef): GovernedScopeRef => ({ organizationId: scope.organizationId, type: scope.type, id: scope.id });
const normalizeAssertions = (values: readonly SourceScopeAssertion[]): SourceScopeAssertion[] => [...new Map(values.map(value => [assertionKey(value), { relationship: value.relationship, scope: copyScope(value.scope) }])).values()].sort((a,b) => compare(assertionKey(a), assertionKey(b)));
const normalizeStrings = (values: readonly string[]): string[] => [...new Set(values)].sort(compare);
const investigationEvidenceOrdinal = (value: string): number => {
  const match = value.match(/^(?:.*?)(\d+)$/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
};
const normalizeInvestigationEvidenceIds = (values: readonly string[]): string[] =>
  [...new Set(values)].sort((left, right) =>
    investigationEvidenceOrdinal(left) - investigationEvidenceOrdinal(right) || compare(left, right)
  );

function validateScope(scope: GovernedScopeRef, organizationId: string): void {
  if (scope.organizationId !== organizationId || !exact(scope.id)) throw new Error("Canonical scope organization or identity mismatch.");
}
function nodeMap(topology: CanonicalScopeTopology): Map<string, CanonicalScopeNode> {
  return new Map(topology.nodes.map(node => [scopeKey(node), node]));
}
function validateTopologyReference(topology: CanonicalScopeTopology, organizationId: string, topologyId: string): void {
  if (topology.organizationId !== organizationId || topology.topologyId !== topologyId) throw new Error("Canonical topology reference mismatch.");
}

export function createCanonicalScopeTopology(input: {
  organizationId: string; topologyVersion: number; effectiveAt: string;
  supersedesTopologyId?: string | null; nodes: readonly CanonicalScopeNode[];
  relationships: readonly CanonicalScopeRelationship[];
}): CanonicalScopeTopology {
  if (!exact(input.organizationId) || !Number.isInteger(input.topologyVersion) || input.topologyVersion < 1 || !timestamp(input.effectiveAt)) throw new Error("Invalid canonical scope topology metadata.");
  const nodes = [...input.nodes].map(node => ({ ...copyScope(node), ...(node.label ? { label: node.label } : {}) })).sort((a,b) => compare(scopeKey(a), scopeKey(b)));
  nodes.forEach(node => validateScope(node, input.organizationId));
  if (new Set(nodes.map(scopeKey)).size !== nodes.length) throw new Error("Duplicate canonical scope node.");
  const roots = nodes.filter(node => node.type === "organization" && node.id === input.organizationId);
  if (roots.length !== 1) throw new Error("Canonical topology requires one exact organization root.");
  const known = new Set(nodes.map(scopeKey));
  const relationships = [...input.relationships].map(value => ({ kind: value.kind, from: copyScope(value.from), to: copyScope(value.to) })).sort((a,b) => compare(stable(a),stable(b)));
  for (const relationship of relationships) {
    validateScope(relationship.from,input.organizationId); validateScope(relationship.to,input.organizationId);
    if (!known.has(scopeKey(relationship.from)) || !known.has(scopeKey(relationship.to)) || scopeKey(relationship.from) === scopeKey(relationship.to)) throw new Error("Unknown or self-referential canonical scope relationship.");
  }
  if (new Set(relationships.map(stable)).size !== relationships.length) throw new Error("Duplicate canonical scope relationship.");
  const children = new Map<string,string[]>();
  for (const edge of relationships.filter(item => item.kind === "contains")) children.set(scopeKey(edge.from), [...(children.get(scopeKey(edge.from)) ?? []), scopeKey(edge.to)]);
  const visit = (key:string, path:Set<string>):void => { if(path.has(key)) throw new Error("Canonical scope containment cycle."); const next=new Set(path).add(key); for(const child of children.get(key)??[]) visit(child,next); };
  nodes.forEach(node => visit(scopeKey(node),new Set()));
  const unsigned = { kind:"canonical-scope-topology" as const, schemaVersion:CANONICAL_SCOPE_LINEAGE_VERSION, organizationId:input.organizationId, topologyVersion:input.topologyVersion, effectiveAt:input.effectiveAt, supersedesTopologyId:input.supersedesTopologyId ?? null, nodes, relationships };
  const digest=hash(unsigned); return { ...unsigned, topologyId:`scope-topology:${input.organizationId}:v${input.topologyVersion}:${digest}`, digest };
}

export function resolveCurrentScopeTopology(revisions: readonly CanonicalScopeTopology[], at: string): CanonicalScopeTopology | undefined {
  if (!timestamp(at) || !revisions.length) return undefined;
  const byId=new Map(revisions.map(item=>[item.topologyId,item])); if(byId.size!==revisions.length) throw new Error("Duplicate topology revision identity.");
  const successors=new Map<string,string[]>();
  for(const item of revisions){ if(item.supersedesTopologyId){ if(!byId.has(item.supersedesTopologyId)) throw new Error("Stale topology predecessor."); successors.set(item.supersedesTopologyId,[...(successors.get(item.supersedesTopologyId)??[]),item.topologyId]); } }
  if([...successors.values()].some(items=>items.length!==1)) throw new Error("Forked topology revision.");
  const eligible=revisions.filter(item=>Date.parse(item.effectiveAt)<=Date.parse(at));
  const heads=eligible.filter(item=>!(successors.get(item.topologyId)??[]).some(id=>eligible.some(candidate=>candidate.topologyId===id)));
  if(heads.length!==1) throw new Error("Ambiguous current topology revision."); return heads[0];
}

export function createCanonicalSourceScopeBinding(input:{ organizationId:string; bindingVersion:number; source:CanonicalSourceVersionRef; topology:CanonicalScopeTopology; assertions:readonly SourceScopeAssertion[]; basisRefs:readonly string[]; effectiveAt:string; supersedesBindingId?:string|null; sourceType?:CanonicalSourceType; purposeRef?:string; availability?:CanonicalSourceAvailability }):CanonicalSourceScopeBinding {
  validateTopologyReference(input.topology,input.organizationId,input.topology.topologyId);
  if(!Number.isInteger(input.bindingVersion)||input.bindingVersion<1||!timestamp(input.effectiveAt)||!exact(input.source.sourceId)||!exact(input.source.sourceVersion)||!exact(input.source.normalizedContentDigest)||input.source.normalizedContentDigest.length<16) throw new Error("Invalid canonical source binding metadata.");
  const assertions=normalizeAssertions(input.assertions); if(!assertions.length) throw new Error("Canonical source binding requires an explicit scope assertion.");
  const known=nodeMap(input.topology); for(const assertion of assertions){ validateScope(assertion.scope,input.organizationId); if(!known.has(scopeKey(assertion.scope))) throw new Error("Unknown canonical source-binding scope."); }
  const basisRefs=normalizeStrings(input.basisRefs); if(!basisRefs.length||basisRefs.some(value=>!exact(value)||/filename|drive-file/i.test(value))) throw new Error("Canonical binding requires non-transport governed basis.");
  const extensionCount=[input.sourceType,input.purposeRef,input.availability].filter(value=>value!==undefined).length;
  if(extensionCount!==0&&extensionCount!==3)throw new Error("Governed local source binding metadata must be complete.");
  if(input.purposeRef!==undefined&&!exact(input.purposeRef))throw new Error("Invalid governed source purpose reference.");
  const extension=input.sourceType===undefined?{}:{sourceType:input.sourceType,purposeRef:input.purposeRef!,availability:input.availability!};
  const unsigned={kind:"canonical-source-scope-binding" as const,schemaVersion:CANONICAL_SCOPE_LINEAGE_VERSION,organizationId:input.organizationId,bindingVersion:input.bindingVersion,source:structuredClone(input.source),topologyId:input.topology.topologyId,assertions,basisRefs,effectiveAt:input.effectiveAt,supersedesBindingId:input.supersedesBindingId??null,...extension};
  const digest=hash(unsigned); return {...unsigned,bindingId:`source-scope-binding:${input.organizationId}:${input.source.sourceId}:v${input.bindingVersion}:${digest}`,digest};
}

export function resolveCurrentSourceScopeBinding(revisions:readonly CanonicalSourceScopeBinding[],at:string):CanonicalSourceScopeBinding|undefined{
  if(!revisions.length)return undefined; if(!timestamp(at))throw new Error("Invalid binding resolution time.");
  for(const item of revisions){const {bindingId,digest,...unsigned}=item;const expected=hash(unsigned);if(digest!==expected||bindingId!==`source-scope-binding:${item.organizationId}:${item.source.sourceId}:v${item.bindingVersion}:${expected}`)throw new Error("Canonical source binding integrity failed.");}
  const identity=stable({source:revisions[0]!.source,sourceType:revisions[0]!.sourceType,purposeRef:revisions[0]!.purposeRef}); if(revisions.some(item=>item.organizationId!==revisions[0]!.organizationId||stable({source:item.source,sourceType:item.sourceType,purposeRef:item.purposeRef})!==identity))throw new Error("Binding revision identity changed.");
  const byId=new Map(revisions.map(item=>[item.bindingId,item])); if(byId.size!==revisions.length)throw new Error("Duplicate binding identity.");
  const successors=new Map<string,string[]>(); for(const item of revisions){if(item.supersedesBindingId){if(!byId.has(item.supersedesBindingId))throw new Error("Stale binding predecessor.");successors.set(item.supersedesBindingId,[...(successors.get(item.supersedesBindingId)??[]),item.bindingId]);}}
  if([...successors.values()].some(items=>items.length!==1))throw new Error("Forked binding revision.");
  const eligible=revisions.filter(item=>Date.parse(item.effectiveAt)<=Date.parse(at)); const heads=eligible.filter(item=>!(successors.get(item.bindingId)??[]).some(id=>eligible.some(candidate=>candidate.bindingId===id)));
  if(heads.length!==1)throw new Error("Ambiguous current binding revision."); return heads[0];
}

export function createCanonicalEvidenceScopeAttribution(input:{ organizationId:string; attributionVersion:number; evidenceId:string; evidenceAdmissionId:string; evidenceIdentityVersion?:"1"|"2"; localEvidenceIds?:readonly string[]; bindings:readonly CanonicalSourceScopeBinding[]; topology:CanonicalScopeTopology; effectiveAt:string; supersedesAttributionId?:string|null }):CanonicalEvidenceScopeAttribution {
  validateTopologyReference(input.topology,input.organizationId,input.topology.topologyId);
  if(!Number.isInteger(input.attributionVersion)||input.attributionVersion<1||!exact(input.evidenceId)||!exact(input.evidenceAdmissionId)||!timestamp(input.effectiveAt)||!input.bindings.length)throw new Error("Invalid Evidence scope attribution metadata.");
  if(input.evidenceIdentityVersion==="2"&&(!input.evidenceId.startsWith("canonical-evidence:v2:")||input.evidenceAdmissionId!==canonicalEvidenceAdmissionId(input.organizationId,input.evidenceId)||!input.localEvidenceIds?.length))throw new Error("Invalid v2 canonical Evidence attribution identity.");
  input.bindings.forEach(binding=>{if(binding.organizationId!==input.organizationId||binding.topologyId!==input.topology.topologyId)throw new Error("Evidence attribution binding mismatch.");});
  const sourceBindingIds=normalizeStrings(input.bindings.map(item=>item.bindingId)); const assertions=normalizeAssertions(input.bindings.flatMap(item=>item.assertions));
  const unsigned={kind:"canonical-evidence-scope-attribution" as const,schemaVersion:CANONICAL_SCOPE_LINEAGE_VERSION,organizationId:input.organizationId,attributionVersion:input.attributionVersion,evidenceId:input.evidenceId,evidenceAdmissionId:input.evidenceAdmissionId,...(input.evidenceIdentityVersion?{evidenceIdentityVersion:input.evidenceIdentityVersion}:{}),...(input.localEvidenceIds?{localEvidenceIds:normalizeStrings(input.localEvidenceIds)}:{}),sourceBindingIds,topologyId:input.topology.topologyId,assertions,effectiveAt:input.effectiveAt,supersedesAttributionId:input.supersedesAttributionId??null};
  const digest=hash(unsigned); return {...unsigned,attributionId:`evidence-scope-attribution:${input.organizationId}:${input.evidenceId}:v${input.attributionVersion}:${digest}`,digest};
}

export function createCanonicalDerivedScopeLineage(input:{ organizationId:string; derivedObjectRef:string; supportingEvidenceIds:readonly string[]; attributions:readonly CanonicalEvidenceScopeAttribution[]; topology:CanonicalScopeTopology; effectiveAt:string; legacyOrganizationCompatibility?:boolean }):CanonicalDerivedScopeLineage {
  validateTopologyReference(input.topology,input.organizationId,input.topology.topologyId); if(!exact(input.derivedObjectRef)||!timestamp(input.effectiveAt))throw new Error("Invalid derived scope lineage metadata.");
  const requestedEvidenceIds=normalizeStrings(input.supportingEvidenceIds); const byEvidence=new Map<string,CanonicalEvidenceScopeAttribution>();
  for(const attribution of input.attributions){byEvidence.set(attribution.evidenceId,attribution);for(const localId of attribution.localEvidenceIds??[]){const existing=byEvidence.get(localId);if(existing&&existing.evidenceId!==attribution.evidenceId)throw new Error("Ambiguous investigation-local Evidence ancestry.");byEvidence.set(localId,attribution);}}
  const complete=requestedEvidenceIds.length>0&&requestedEvidenceIds.every(id=>byEvidence.has(id));
  const supportingEvidenceIds=complete?normalizeStrings(requestedEvidenceIds.map(id=>byEvidence.get(id)!.evidenceId)):requestedEvidenceIds;
  const legacy=Boolean(input.legacyOrganizationCompatibility)&&!complete;
  const assertions=complete?normalizeAssertions(supportingEvidenceIds.flatMap(id=>byEvidence.get(id)!.assertions)):legacy?[{relationship:"applies-to" as const,scope:{organizationId:input.organizationId,type:"organization" as const,id:input.organizationId}}]:[];
  const evidenceAttributionIds=complete?normalizeStrings(supportingEvidenceIds.map(id=>byEvidence.get(id)!.attributionId)):[];
  const unsigned={kind:"canonical-derived-scope-lineage" as const,schemaVersion:CANONICAL_SCOPE_LINEAGE_VERSION,organizationId:input.organizationId,derivedObjectRef:input.derivedObjectRef,supportingEvidenceIds,evidenceAttributionIds,topologyId:input.topology.topologyId,assertions,completeness:complete?"complete" as const:"missing-structured-lineage" as const,legacyOrganizationCompatibility:legacy,effectiveAt:input.effectiveAt};
  const digest=hash(unsigned); return {...unsigned,lineageId:`derived-scope-lineage:${input.organizationId}:${input.derivedObjectRef}:${digest}`,digest};
}

export function createCanonicalScopeLineageIndex(input:{organizationId:string;topology:CanonicalScopeTopology;sourceBindings?:readonly CanonicalSourceScopeBinding[];evidenceAttributions?:readonly CanonicalEvidenceScopeAttribution[];derivedLineages?:readonly CanonicalDerivedScopeLineage[]}):CanonicalScopeLineageIndex{
  validateTopologyReference(input.topology,input.organizationId,input.topology.topologyId);
  const sourceBindings=[...(input.sourceBindings??[])].sort((a,b)=>compare(a.bindingId,b.bindingId)); const evidenceAttributions=[...(input.evidenceAttributions??[])].sort((a,b)=>compare(a.attributionId,b.attributionId)); const derivedLineages=[...(input.derivedLineages??[])].sort((a,b)=>compare(a.lineageId,b.lineageId));
  for(const item of [...sourceBindings,...evidenceAttributions,...derivedLineages])if(item.organizationId!==input.organizationId||item.topologyId!==input.topology.topologyId)throw new Error("Scope lineage index organization or topology mismatch.");
  const unsigned={kind:"canonical-scope-lineage-index" as const,schemaVersion:CANONICAL_SCOPE_LINEAGE_VERSION,organizationId:input.organizationId,topologyId:input.topology.topologyId,sourceBindings,evidenceAttributions,derivedLineages};return{...unsigned,digest:hash(unsigned)};
}

export function lineageSupportsRequestedScope(lineage:CanonicalDerivedScopeLineage,requestedScope:GovernedScopeRef):boolean{
  if(lineage.organizationId!==requestedScope.organizationId)return false;
  if(lineage.completeness!=="complete")return lineage.legacyOrganizationCompatibility&&requestedScope.type==="organization"&&requestedScope.id===requestedScope.organizationId;
  return lineage.assertions.some(assertion=>scopeKey(assertion.scope)===scopeKey(requestedScope));
}

export function canonicalScopeLineageDigest(value:unknown):string{return hash(value);}
export function canonicalScopeTypes():readonly GovernedScopeType[]{return ["organization","function","department","team","initiative","private-workspace","restricted"] as const;}

export function canonicalEvidenceIdentity(input:{organizationId:string;evidenceText:string}):string{
  if(!exact(input.organizationId)||typeof input.evidenceText!=="string")throw new Error("Invalid canonical Evidence identity input.");
  const normalized=input.evidenceText.normalize("NFKC").replace(/\s+/g," ").trim();
  if(!normalized)throw new Error("Invalid canonical Evidence identity input.");
  return `canonical-evidence:v2:${hash([input.organizationId,normalized])}`;
}

export function canonicalEvidenceAdmissionId(organizationId:string,canonicalEvidenceId:string):string{
  if(!exact(organizationId)||!canonicalEvidenceId.startsWith("canonical-evidence:v2:"))throw new Error("Canonical admission requires a v2 canonical Evidence identity.");
  return `evidence-admission:v2:${hash([organizationId,canonicalEvidenceId,"canonical-scope-lineage-admission"] )}`;
}

export function admitCanonicalEvidenceScopeLineage(input:{
  lineage:CanonicalScopeLineageAdmissionInput;
  evidence:readonly {evidenceId:string;evidenceText:string;sourceId?:string;contentDigest?:string}[];
}):CanonicalEvidenceScopeAdmission{
  const {lineage}=input; const topology=resolveCurrentScopeTopology(lineage.topologyRevisions,lineage.effectiveAt);
  if(!topology||topology.organizationId!==lineage.organizationId)throw new Error("No exact effective canonical scope topology.");
  const bindingGroups=new Map<string,CanonicalSourceScopeBinding[]>();
  for(const binding of lineage.sourceBindingRevisions){
    if(binding.organizationId!==lineage.organizationId)throw new Error("Cross-organization source binding.");
    bindingGroups.set(binding.source.sourceId,[...(bindingGroups.get(binding.source.sourceId)??[]),binding]);
  }
  const selected=new Map<string,CanonicalSourceScopeBinding>();
  const bindingsById=new Map(lineage.sourceBindingRevisions.map(value=>[value.bindingId,value]));
  const grouped=new Map<string,{localEvidenceIds:string[];bindings:CanonicalSourceScopeBinding[];ordinal:number}>();
  const canonicalByLocalId=new Map<string,string>();
  for(const [ordinal,item] of input.evidence.entries()){
    if(!item.sourceId)continue;
    const revisions=bindingGroups.get(item.sourceId); if(!revisions)continue;
    const binding=resolveCurrentSourceScopeBinding(revisions,lineage.effectiveAt);
    if(!binding||binding.topologyId!==topology.topologyId||!item.contentDigest||item.contentDigest!==binding.source.normalizedContentDigest)throw new Error("Evidence source version does not match its effective canonical binding.");
    selected.set(binding.bindingId,binding);
    const evidenceId=canonicalEvidenceIdentity({organizationId:lineage.organizationId,evidenceText:item.evidenceText});
    const existingCanonical=canonicalByLocalId.get(item.evidenceId);if(existingCanonical)throw new Error(existingCanonical===evidenceId?"Duplicate investigation-local Evidence ID.":"Duplicate investigation-local Evidence ID resolves to different canonical Evidence.");canonicalByLocalId.set(item.evidenceId,evidenceId);
    const group=grouped.get(evidenceId)??{localEvidenceIds:[],bindings:[],ordinal}; group.localEvidenceIds.push(item.evidenceId);group.bindings.push(binding);grouped.set(evidenceId,group);
  }
  const attributions:CanonicalEvidenceScopeAttribution[]=[];
  const operationAdmissions:Array<CanonicalEvidenceAdmissionOperationItemV1 & {ordinal:number}>=[];
  for(const [evidenceId,group] of grouped){
    const history=(lineage.existingEvidenceAttributions??[]).filter(value=>value.organizationId===lineage.organizationId&&value.evidenceId===evidenceId).sort((a,b)=>a.attributionVersion-b.attributionVersion);
    const previous=history.at(-1);
    const retainedBindings=(previous?.sourceBindingIds??[]).map(bindingId=>bindingsById.get(bindingId)).filter((value):value is CanonicalSourceScopeBinding=>Boolean(value&&value.organizationId===lineage.organizationId&&value.topologyId===topology.topologyId));
    const bindings=[...new Map([...retainedBindings,...group.bindings].map(value=>[value.bindingId,value])).values()];
    const bindingIds=normalizeStrings(bindings.map(value=>value.bindingId));
    const replayed=Boolean(previous&&stable(previous.sourceBindingIds)===stable(bindingIds));
    const attribution=replayed?previous!:createCanonicalEvidenceScopeAttribution({organizationId:lineage.organizationId,attributionVersion:(previous?.attributionVersion??0)+1,evidenceId,evidenceAdmissionId:canonicalEvidenceAdmissionId(lineage.organizationId,evidenceId),evidenceIdentityVersion:"2",localEvidenceIds:[...(previous?.localEvidenceIds??[]),...group.localEvidenceIds],bindings,topology,effectiveAt:lineage.effectiveAt,supersedesAttributionId:previous?.attributionId??null});
    attributions.push(attribution);
    operationAdmissions.push({contractVersion:"1",canonicalEvidenceId:attribution.evidenceId,canonicalAdmissionId:attribution.evidenceAdmissionId,attributionId:attribution.attributionId,attributionVersion:attribution.attributionVersion,investigationEvidenceIds:normalizeInvestigationEvidenceIds(group.localEvidenceIds),sourceBindings:bindings.sort((a,b)=>compare(a.bindingId,b.bindingId)).map(binding=>({sourceBindingId:binding.bindingId,sourceId:binding.source.sourceId,sourceVersion:binding.source.sourceVersion,normalizedContentDigest:binding.source.normalizedContentDigest})),disposition:replayed?"existing-attribution-replayed":previous?"existing-evidence-new-provenance":"new-canonical-evidence",attributionDigest:attribution.digest,ordinal:group.ordinal});
  }
  const sourceBindings=[...selected.values()].sort((a,b)=>compare(a.bindingId,b.bindingId));
  const evidenceAttributions=[...new Map(attributions.map(value=>[value.attributionId,value])).values()].sort((a,b)=>compare(a.attributionId,b.attributionId));
  const admissions=operationAdmissions.sort((a,b)=>a.ordinal-b.ordinal||compare(a.canonicalEvidenceId,b.canonicalEvidenceId)||compare(a.canonicalAdmissionId,b.canonicalAdmissionId)||compare(a.attributionId,b.attributionId)).map(({ordinal:_,...item})=>item);
  const admittedLocalCount=operationAdmissions.reduce((sum,item)=>sum+item.investigationEvidenceIds.length,0);
  const admissionDisposition=admissions.length===0?"not-admitted":admittedLocalCount<input.evidence.length?"partially-admitted":"admitted";
  const batchUnsigned={contractVersion:"1" as const,organizationId:lineage.organizationId,admissions,admissionDisposition};
  const operationBatch={...batchUnsigned,batchDigest:hash(batchUnsigned)};
  const unsigned={organizationId:lineage.organizationId,topology,sourceBindings,evidenceAttributions};
  const admission={...unsigned,digest:hash(unsigned)} as CanonicalEvidenceScopeAdmission;
  Object.defineProperty(admission,"operationBatch",{value:operationBatch,enumerable:false,writable:false,configurable:false});
  return admission;
}

export function resolveUnambiguousLegacyEvidenceAttribution(input:{organizationId:string;localEvidenceId:string;attributions:readonly CanonicalEvidenceScopeAttribution[]}):CanonicalEvidenceScopeAttribution|undefined{
  const candidates=input.attributions.filter(value=>value.organizationId===input.organizationId&&(value.evidenceId===input.localEvidenceId||(value.localEvidenceIds??[]).includes(input.localEvidenceId)));
  const identities=new Set(candidates.map(value=>value.evidenceId)); if(identities.size>1||(candidates.length>1&&candidates.some(value=>value.evidenceIdentityVersion!=="2")))throw new Error("Ambiguous legacy Evidence identity."); return candidates[0];
}
