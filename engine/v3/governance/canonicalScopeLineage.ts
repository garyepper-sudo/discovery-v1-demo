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
  digest: string;
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

export function createCanonicalSourceScopeBinding(input:{ organizationId:string; bindingVersion:number; source:CanonicalSourceVersionRef; topology:CanonicalScopeTopology; assertions:readonly SourceScopeAssertion[]; basisRefs:readonly string[]; effectiveAt:string; supersedesBindingId?:string|null }):CanonicalSourceScopeBinding {
  validateTopologyReference(input.topology,input.organizationId,input.topology.topologyId);
  if(!Number.isInteger(input.bindingVersion)||input.bindingVersion<1||!timestamp(input.effectiveAt)||!exact(input.source.sourceId)||!exact(input.source.sourceVersion)||!exact(input.source.normalizedContentDigest)||input.source.normalizedContentDigest.length<16) throw new Error("Invalid canonical source binding metadata.");
  const assertions=normalizeAssertions(input.assertions); if(!assertions.length) throw new Error("Canonical source binding requires an explicit scope assertion.");
  const known=nodeMap(input.topology); for(const assertion of assertions){ validateScope(assertion.scope,input.organizationId); if(!known.has(scopeKey(assertion.scope))) throw new Error("Unknown canonical source-binding scope."); }
  const basisRefs=normalizeStrings(input.basisRefs); if(!basisRefs.length||basisRefs.some(value=>!exact(value)||/filename|drive-file/i.test(value))) throw new Error("Canonical binding requires non-transport governed basis.");
  const unsigned={kind:"canonical-source-scope-binding" as const,schemaVersion:CANONICAL_SCOPE_LINEAGE_VERSION,organizationId:input.organizationId,bindingVersion:input.bindingVersion,source:structuredClone(input.source),topologyId:input.topology.topologyId,assertions,basisRefs,effectiveAt:input.effectiveAt,supersedesBindingId:input.supersedesBindingId??null};
  const digest=hash(unsigned); return {...unsigned,bindingId:`source-scope-binding:${input.organizationId}:${input.source.sourceId}:v${input.bindingVersion}:${digest}`,digest};
}

export function resolveCurrentSourceScopeBinding(revisions:readonly CanonicalSourceScopeBinding[],at:string):CanonicalSourceScopeBinding|undefined{
  if(!revisions.length)return undefined; if(!timestamp(at))throw new Error("Invalid binding resolution time.");
  const identity=stable(revisions[0]!.source); if(revisions.some(item=>item.organizationId!==revisions[0]!.organizationId||stable(item.source)!==identity))throw new Error("Binding revision identity changed.");
  const byId=new Map(revisions.map(item=>[item.bindingId,item])); if(byId.size!==revisions.length)throw new Error("Duplicate binding identity.");
  const successors=new Map<string,string[]>(); for(const item of revisions){if(item.supersedesBindingId){if(!byId.has(item.supersedesBindingId))throw new Error("Stale binding predecessor.");successors.set(item.supersedesBindingId,[...(successors.get(item.supersedesBindingId)??[]),item.bindingId]);}}
  if([...successors.values()].some(items=>items.length!==1))throw new Error("Forked binding revision.");
  const eligible=revisions.filter(item=>Date.parse(item.effectiveAt)<=Date.parse(at)); const heads=eligible.filter(item=>!(successors.get(item.bindingId)??[]).some(id=>eligible.some(candidate=>candidate.bindingId===id)));
  if(heads.length!==1)throw new Error("Ambiguous current binding revision."); return heads[0];
}

export function createCanonicalEvidenceScopeAttribution(input:{ organizationId:string; attributionVersion:number; evidenceId:string; evidenceAdmissionId:string; bindings:readonly CanonicalSourceScopeBinding[]; topology:CanonicalScopeTopology; effectiveAt:string; supersedesAttributionId?:string|null }):CanonicalEvidenceScopeAttribution {
  validateTopologyReference(input.topology,input.organizationId,input.topology.topologyId);
  if(!Number.isInteger(input.attributionVersion)||input.attributionVersion<1||!exact(input.evidenceId)||!exact(input.evidenceAdmissionId)||!timestamp(input.effectiveAt)||!input.bindings.length)throw new Error("Invalid Evidence scope attribution metadata.");
  input.bindings.forEach(binding=>{if(binding.organizationId!==input.organizationId||binding.topologyId!==input.topology.topologyId)throw new Error("Evidence attribution binding mismatch.");});
  const sourceBindingIds=normalizeStrings(input.bindings.map(item=>item.bindingId)); const assertions=normalizeAssertions(input.bindings.flatMap(item=>item.assertions));
  const unsigned={kind:"canonical-evidence-scope-attribution" as const,schemaVersion:CANONICAL_SCOPE_LINEAGE_VERSION,organizationId:input.organizationId,attributionVersion:input.attributionVersion,evidenceId:input.evidenceId,evidenceAdmissionId:input.evidenceAdmissionId,sourceBindingIds,topologyId:input.topology.topologyId,assertions,effectiveAt:input.effectiveAt,supersedesAttributionId:input.supersedesAttributionId??null};
  const digest=hash(unsigned); return {...unsigned,attributionId:`evidence-scope-attribution:${input.organizationId}:${input.evidenceId}:v${input.attributionVersion}:${digest}`,digest};
}

export function createCanonicalDerivedScopeLineage(input:{ organizationId:string; derivedObjectRef:string; supportingEvidenceIds:readonly string[]; attributions:readonly CanonicalEvidenceScopeAttribution[]; topology:CanonicalScopeTopology; effectiveAt:string; legacyOrganizationCompatibility?:boolean }):CanonicalDerivedScopeLineage {
  validateTopologyReference(input.topology,input.organizationId,input.topology.topologyId); if(!exact(input.derivedObjectRef)||!timestamp(input.effectiveAt))throw new Error("Invalid derived scope lineage metadata.");
  const supportingEvidenceIds=normalizeStrings(input.supportingEvidenceIds); const byEvidence=new Map(input.attributions.map(item=>[item.evidenceId,item]));
  const complete=supportingEvidenceIds.length>0&&supportingEvidenceIds.every(id=>byEvidence.has(id));
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

export function canonicalEvidenceAdmissionId(organizationId:string,evidenceId:string):string{
  if(!exact(organizationId)||!exact(evidenceId))throw new Error("Invalid Evidence admission identity input.");
  return `evidence-admission:${organizationId}:${hash([organizationId,evidenceId])}`;
}

export function admitCanonicalEvidenceScopeLineage(input:{
  lineage:CanonicalScopeLineageAdmissionInput;
  evidence:readonly {evidenceId:string;sourceId?:string;contentDigest?:string}[];
}):CanonicalEvidenceScopeAdmission{
  const {lineage}=input; const topology=resolveCurrentScopeTopology(lineage.topologyRevisions,lineage.effectiveAt);
  if(!topology||topology.organizationId!==lineage.organizationId)throw new Error("No exact effective canonical scope topology.");
  const bindingGroups=new Map<string,CanonicalSourceScopeBinding[]>();
  for(const binding of lineage.sourceBindingRevisions){
    if(binding.organizationId!==lineage.organizationId)throw new Error("Cross-organization source binding.");
    bindingGroups.set(binding.source.sourceId,[...(bindingGroups.get(binding.source.sourceId)??[]),binding]);
  }
  const selected=new Map<string,CanonicalSourceScopeBinding>(); const attributions:CanonicalEvidenceScopeAttribution[]=[];
  for(const item of input.evidence){
    if(!item.sourceId)continue;
    const revisions=bindingGroups.get(item.sourceId); if(!revisions)continue;
    const binding=resolveCurrentSourceScopeBinding(revisions,lineage.effectiveAt);
    if(!binding||binding.topologyId!==topology.topologyId||!item.contentDigest||item.contentDigest!==binding.source.normalizedContentDigest)throw new Error("Evidence source version does not match its effective canonical binding.");
    selected.set(binding.bindingId,binding);
    const history=(lineage.existingEvidenceAttributions??[]).filter(value=>value.organizationId===lineage.organizationId&&value.evidenceId===item.evidenceId).sort((a,b)=>a.attributionVersion-b.attributionVersion);
    const previous=history.at(-1); const bindingIds=[binding.bindingId];
    if(previous&&stable(previous.sourceBindingIds)===stable(bindingIds)){attributions.push(previous);continue;}
    attributions.push(createCanonicalEvidenceScopeAttribution({organizationId:lineage.organizationId,attributionVersion:(previous?.attributionVersion??0)+1,evidenceId:item.evidenceId,evidenceAdmissionId:canonicalEvidenceAdmissionId(lineage.organizationId,item.evidenceId),bindings:[binding],topology,effectiveAt:lineage.effectiveAt,supersedesAttributionId:previous?.attributionId??null}));
  }
  const sourceBindings=[...selected.values()].sort((a,b)=>compare(a.bindingId,b.bindingId));
  const evidenceAttributions=[...new Map(attributions.map(value=>[value.attributionId,value])).values()].sort((a,b)=>compare(a.attributionId,b.attributionId));
  const unsigned={organizationId:lineage.organizationId,topology,sourceBindings,evidenceAttributions}; return {...unsigned,digest:hash(unsigned)};
}
