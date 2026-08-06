import { createHash } from "node:crypto";

import type {
  CanonicalEvidenceScopeAttribution,
  CanonicalScopeLineageIndex,
  CanonicalScopeTopology,
  CanonicalSourceScopeBinding,
} from "../governance/canonicalScopeLineage";
import { createCanonicalScopeLineageIndex } from "../governance/canonicalScopeLineage";
import { RECIPIENT_AUDIENCE_RESOURCE_FAMILY } from "../governance/recipientAudienceScope";
import type { GovernedScopeRef } from "../governance/scopedGovernanceContext";
import type { OrganizationalExplanation } from "../model/judgment/organizationalJudgment";
import type { CanonicalUnderstandingComposition } from "./buildCanonicalUnderstandingCompatibilityShadow";

export const CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_VERSION = "1" as const;
export const CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_PRODUCER_VERSION = "2" as const;

export type AudienceLineageFieldFamily = "composition-claim" | "explanation-claim" | "evidence-reference";
export type AudienceLineageCompleteness = "complete" | "incomplete" | "conflicting";
export type AudienceRequirementBasis = "explicit-field-owned" | "governed-derivation" | "unresolved";
export type TargetVersionBasis =
  | { kind: "canonical-revision"; revisionId: string }
  | { kind: "canonical-immutable-identity"; identity: string }
  | { kind: "unresolved" };

export type CanonicalAudienceLineageSupport = {
  objectType: "organizational-explanation" | "canonical-evidence";
  objectId: string;
  versionBasis: TargetVersionBasis;
  sourceScopeRefs: GovernedScopeRef[];
  evidenceScopeRefs: GovernedScopeRef[];
  attributionRefs: string[];
  sourceBindingRefs: string[];
  role: "supports" | "opposes" | "shared" | "unspecified";
};

export type CanonicalUnderstandingAudienceLineageRecord = {
  kind: "canonical-understanding-audience-lineage-record";
  schemaVersion: typeof CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_VERSION;
  producerVersion: typeof CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_PRODUCER_VERSION;
  lineageId: string;
  revisionId: string;
  organizationId: string;
  compositionId: string;
  compositionRevision: string;
  targetObjectKind: "canonical-understanding-composition" | "organizational-explanation" | "canonical-evidence";
  targetObjectId: string;
  targetVersionBasis: TargetVersionBasis;
  fieldFamily: AudienceLineageFieldFamily;
  subjectScope: GovernedScopeRef | null;
  sourceScopes: GovernedScopeRef[];
  evidenceScopes: GovernedScopeRef[];
  audienceRequirement: GovernedScopeRef | null;
  audienceRequirementBasis: AudienceRequirementBasis;
  resourceFamily: typeof RECIPIENT_AUDIENCE_RESOURCE_FAMILY;
  operation: "receive";
  purpose: "organizational-understanding";
  supports: CanonicalAudienceLineageSupport[];
  completeness: AudienceLineageCompleteness;
  reasons: string[];
  digest: string;
};

export type CanonicalUnderstandingAudienceLineage = {
  kind: "canonical-understanding-audience-lineage";
  schemaVersion: typeof CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_VERSION;
  producerVersion: typeof CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_PRODUCER_VERSION;
  organizationId: string;
  records: CanonicalUnderstandingAudienceLineageRecord[];
  unresolvedFieldFamilies: string[];
  intentionallyUnavailableFieldFamilies: string[];
  laterDisclosureFieldFamilies: string[];
  digest: string;
};

const compare = (a: string, b: string): number => a.localeCompare(b);
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value as Record<string, unknown>).sort(([a],[b])=>compare(a,b)).map(([k,v])=>`${JSON.stringify(k)}:${stable(v)}`).join(",")}}`;
  return JSON.stringify(value);
}
const hash = (value: unknown): string => createHash("sha256").update(stable(value)).digest("hex");
const exact = (value: string): boolean => value.trim() === value && value.length > 0 && value !== "*" && !value.includes("\0");
const scopeKey = (scope: GovernedScopeRef): string => stable([scope.organizationId, scope.type, scope.id]);
const normalizeScopes = (values: readonly GovernedScopeRef[]): GovernedScopeRef[] => [...new Map(values.map(v=>[scopeKey(v),structuredClone(v)])).values()].sort((a,b)=>compare(scopeKey(a),scopeKey(b)));
const normalizeStrings = (values: readonly string[]): string[] => [...new Set(values)].sort(compare);
const governedScope = (organizationId: string, scope: OrganizationalExplanation["claim"]["scope"]): GovernedScopeRef | null => {
  if (scope.organizationId !== organizationId || !exact(scope.id)) return null;
  if (!["organization","department","team","initiative"].includes(scope.type)) return null;
  return { organizationId, type: scope.type as GovernedScopeRef["type"], id: scope.id };
};

type RecordInput = Omit<CanonicalUnderstandingAudienceLineageRecord,"kind"|"schemaVersion"|"producerVersion"|"lineageId"|"revisionId"|"digest"|"resourceFamily"|"operation"|"purpose">;
export function normalizeCanonicalUnderstandingAudienceLineageRecordInput(value: RecordInput): RecordInput {
  return { ...structuredClone(value), sourceScopes: normalizeScopes(value.sourceScopes), evidenceScopes: normalizeScopes(value.evidenceScopes), supports: [...value.supports].map(s=>({...structuredClone(s),sourceScopeRefs:normalizeScopes(s.sourceScopeRefs),evidenceScopeRefs:normalizeScopes(s.evidenceScopeRefs),attributionRefs:normalizeStrings(s.attributionRefs),sourceBindingRefs:normalizeStrings(s.sourceBindingRefs)})).sort((a,b)=>compare(stable(a),stable(b))), reasons: normalizeStrings(value.reasons) };
}
export function deriveCanonicalUnderstandingAudienceLineageRecordId(value: RecordInput): string {
  return `canonical-understanding-audience-lineage:${hash([value.organizationId,value.compositionId,value.targetObjectKind,value.targetObjectId,value.fieldFamily])}`;
}
export function deriveCanonicalUnderstandingAudienceLineageRevision(value: RecordInput, lineageId = deriveCanonicalUnderstandingAudienceLineageRecordId(value)): string {
  return `canonical-understanding-audience-lineage-revision:${hash({lineageId,...normalizeCanonicalUnderstandingAudienceLineageRecordInput(value)})}`;
}
export function deriveCanonicalUnderstandingAudienceLineageIntegrity(value: Omit<CanonicalUnderstandingAudienceLineageRecord,"digest">): string { return hash(value); }
function createRecord(value: RecordInput): CanonicalUnderstandingAudienceLineageRecord {
  const normalized=normalizeCanonicalUnderstandingAudienceLineageRecordInput(value); const lineageId=deriveCanonicalUnderstandingAudienceLineageRecordId(normalized); const revisionId=deriveCanonicalUnderstandingAudienceLineageRevision(normalized,lineageId);
  const unsigned={kind:"canonical-understanding-audience-lineage-record" as const,schemaVersion:CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_VERSION,producerVersion:CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_PRODUCER_VERSION,lineageId,revisionId,...normalized,resourceFamily:RECIPIENT_AUDIENCE_RESOURCE_FAMILY,operation:"receive" as const,purpose:"organizational-understanding" as const};
  return {...unsigned,digest:deriveCanonicalUnderstandingAudienceLineageIntegrity(unsigned)};
}

function validateScope(scope: GovernedScopeRef | null, organizationId: string): void { if(scope&&(!exact(scope.id)||scope.organizationId!==organizationId)) throw new Error("Invalid or cross-organization scope."); }
export function validateCanonicalUnderstandingAudienceLineageRecord(record: CanonicalUnderstandingAudienceLineageRecord): void {
  if(record.kind!=="canonical-understanding-audience-lineage-record"||record.schemaVersion!==CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_VERSION||record.producerVersion!==CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_PRODUCER_VERSION) throw new Error("Unsupported audience-lineage record version.");
  if(record.resourceFamily!==RECIPIENT_AUDIENCE_RESOURCE_FAMILY||record.operation!=="receive"||record.purpose!=="organizational-understanding") throw new Error("Invalid audience-lineage resource semantics.");
  if(![record.organizationId,record.compositionId,record.compositionRevision,record.targetObjectId].every(exact)) throw new Error("Invalid audience-lineage identity.");
  [record.subjectScope,record.audienceRequirement,...record.sourceScopes,...record.evidenceScopes].forEach(s=>validateScope(s,record.organizationId));
  for(const support of record.supports){if(!exact(support.objectId))throw new Error("Invalid support identity.");[...support.sourceScopeRefs,...support.evidenceScopeRefs].forEach(s=>validateScope(s,record.organizationId));}
  const {digest,...unsigned}=record; const input:RecordInput={organizationId:record.organizationId,compositionId:record.compositionId,compositionRevision:record.compositionRevision,targetObjectKind:record.targetObjectKind,targetObjectId:record.targetObjectId,targetVersionBasis:record.targetVersionBasis,fieldFamily:record.fieldFamily,subjectScope:record.subjectScope,sourceScopes:record.sourceScopes,evidenceScopes:record.evidenceScopes,audienceRequirement:record.audienceRequirement,audienceRequirementBasis:record.audienceRequirementBasis,supports:record.supports,completeness:record.completeness,reasons:record.reasons};
  if(record.lineageId!==deriveCanonicalUnderstandingAudienceLineageRecordId(input))throw new Error("Invalid audience-lineage identity reconstruction.");
  if(record.revisionId!==deriveCanonicalUnderstandingAudienceLineageRevision(input,record.lineageId))throw new Error("Invalid audience-lineage revision reconstruction.");
  if(digest!==deriveCanonicalUnderstandingAudienceLineageIntegrity(unsigned))throw new Error("Invalid audience-lineage integrity.");
  if(record.completeness==="complete"&&(record.targetVersionBasis.kind==="unresolved"||!record.audienceRequirement||record.audienceRequirementBasis==="unresolved"||record.reasons.length))throw new Error("Invalid complete audience-lineage record.");
  if(record.completeness==="conflicting"&&record.audienceRequirement)throw new Error("Conflicting lineage cannot select an audience requirement.");
  if(record.completeness==="incomplete"&&!record.reasons.length)throw new Error("Incomplete lineage requires bounded reasons.");
}

function bindingClosure(input:{organizationId:string;attribution:CanonicalEvidenceScopeAttribution;bindings:readonly CanonicalSourceScopeBinding[]}):{bindings:CanonicalSourceScopeBinding[];sourceScopes:GovernedScopeRef[];reasons:string[]}{
  const byId=new Map<string,CanonicalSourceScopeBinding>(); const conflicts=new Set<string>();
  for(const binding of input.bindings){const prior=byId.get(binding.bindingId);if(prior&&stable(prior)!==stable(binding))conflicts.add(binding.bindingId);else byId.set(binding.bindingId,binding);}
  const resolved:CanonicalSourceScopeBinding[]=[]; const reasons:string[]=[];
  for(const id of normalizeStrings(input.attribution.sourceBindingIds)){const binding=byId.get(id);if(!binding){reasons.push(`missing-source-binding:${id}`);continue;}if(conflicts.has(id)){reasons.push(`conflicting-source-binding:${id}`);continue;}if(binding.organizationId!==input.organizationId){reasons.push(`cross-organization-source-binding:${id}`);continue;}resolved.push(binding);}
  if(!input.attribution.sourceBindingIds.length)reasons.push("missing-source-binding-reference");
  return {bindings:resolved,sourceScopes:normalizeScopes(resolved.flatMap(b=>b.assertions.map(a=>a.scope))),reasons};
}

export function produceCanonicalUnderstandingAudienceLineage(input:{organizationId:string;compositions:readonly CanonicalUnderstandingComposition[];explanations:readonly OrganizationalExplanation[];scopeLineageIndex?:CanonicalScopeLineageIndex;scopeTopology?:CanonicalScopeTopology}):CanonicalUnderstandingAudienceLineage{
  if(Object.keys(input).some(k=>!["organizationId","compositions","explanations","scopeLineageIndex","scopeTopology"].includes(k)))throw new Error("Unsupported producer input.");
  if(!exact(input.organizationId))throw new Error("Organization identity is required.");
  if(input.scopeLineageIndex){if(!input.scopeTopology)throw new Error("Scope topology is required.");const rebuilt=createCanonicalScopeLineageIndex({organizationId:input.organizationId,topology:input.scopeTopology,sourceBindings:input.scopeLineageIndex.sourceBindings,evidenceAttributions:input.scopeLineageIndex.evidenceAttributions,derivedLineages:input.scopeLineageIndex.derivedLineages});if(rebuilt.digest!==input.scopeLineageIndex.digest)throw new Error("Invalid scope-lineage index integrity.");}
  const explanations=new Map<string,OrganizationalExplanation>();for(const e of input.explanations){if(explanations.has(e.id))throw new Error("Duplicate Explanation identity.");explanations.set(e.id,e);}
  const attrs=new Map<string,CanonicalEvidenceScopeAttribution>();for(const a of input.scopeLineageIndex?.evidenceAttributions??[]){if(attrs.has(a.evidenceId))throw new Error("Duplicate Evidence attribution identity.");attrs.set(a.evidenceId,a);}
  const records:CanonicalUnderstandingAudienceLineageRecord[]=[];
  for(const c of [...input.compositions].sort((a,b)=>compare(a.id,b.id))){if(c.organizationId!==input.organizationId)throw new Error("Cross-organization composition.");const scope=governedScope(input.organizationId,c.scope);const missing=c.explanationIds.filter(id=>!explanations.has(id));records.push(createRecord({organizationId:input.organizationId,compositionId:c.id,compositionRevision:c.revisionId,targetObjectKind:"canonical-understanding-composition",targetObjectId:c.id,targetVersionBasis:{kind:"canonical-revision",revisionId:c.revisionId},fieldFamily:"composition-claim",subjectScope:scope,sourceScopes:[],evidenceScopes:[],audienceRequirement:null,audienceRequirementBasis:"unresolved",supports:c.explanationIds.map(id=>({objectType:"organizational-explanation",objectId:id,versionBasis:{kind:"unresolved"},sourceScopeRefs:[],evidenceScopeRefs:[],attributionRefs:[],sourceBindingRefs:[],role:"unspecified"})),completeness:"incomplete",reasons:["audience-requirement-unresolved","claim-owner-version-unresolved",...missing.map(id=>`missing-explanation:${id}`)]}));
    for(const id of normalizeStrings(c.explanationIds)){const e=explanations.get(id);if(!e)continue;if(e.organizationId!==input.organizationId)throw new Error("Cross-organization Explanation.");const es=governedScope(input.organizationId,e.claim.scope);records.push(createRecord({organizationId:input.organizationId,compositionId:c.id,compositionRevision:c.revisionId,targetObjectKind:"organizational-explanation",targetObjectId:e.id,targetVersionBasis:{kind:"unresolved"},fieldFamily:"explanation-claim",subjectScope:es,sourceScopes:[],evidenceScopes:[],audienceRequirement:null,audienceRequirementBasis:"unresolved",supports:[],completeness:"incomplete",reasons:["audience-requirement-unresolved","target-version-unresolved"]}));const roles=new Map((e.comparativeEvidenceRoles??[]).map(r=>[r.evidenceId,r.role]));
      for(const evidenceId of normalizeStrings(e.evidenceIds)){const a=attrs.get(evidenceId);if(a&&a.organizationId!==input.organizationId)throw new Error("Cross-organization Evidence attribution.");const evidenceScopes=a?normalizeScopes(a.assertions.map(x=>x.scope)):[];const closure=a?bindingClosure({organizationId:input.organizationId,attribution:a,bindings:input.scopeLineageIndex?.sourceBindings??[]}):{bindings:[],sourceScopes:[],reasons:["missing-evidence-attribution"]};const reasons=["audience-requirement-unresolved",...closure.reasons,...(!a?["missing-evidence-attribution"]:[])];records.push(createRecord({organizationId:input.organizationId,compositionId:c.id,compositionRevision:c.revisionId,targetObjectKind:"canonical-evidence",targetObjectId:evidenceId,targetVersionBasis:a?{kind:"canonical-revision",revisionId:a.digest}:{kind:"unresolved"},fieldFamily:"evidence-reference",subjectScope:null,sourceScopes:closure.sourceScopes,evidenceScopes,audienceRequirement:null,audienceRequirementBasis:"unresolved",supports:[{objectType:"canonical-evidence",objectId:evidenceId,versionBasis:a?{kind:"canonical-revision",revisionId:a.digest}:{kind:"unresolved"},sourceScopeRefs:closure.sourceScopes,evidenceScopeRefs:evidenceScopes,attributionRefs:a?[a.attributionId]:[],sourceBindingRefs:a?a.sourceBindingIds:[],role:roles.get(evidenceId)??"unspecified"}],completeness:"incomplete",reasons}));}
    }
  }
  records.sort((a,b)=>compare(a.lineageId,b.lineageId));if(new Set(records.map(r=>r.lineageId)).size!==records.length)throw new Error("Duplicate audience-lineage record identity.");records.forEach(validateCanonicalUnderstandingAudienceLineageRecord);
  const unsigned={kind:"canonical-understanding-audience-lineage" as const,schemaVersion:CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_VERSION,producerVersion:CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_PRODUCER_VERSION,organizationId:input.organizationId,records,unresolvedFieldFamilies:["audit-reference","composition-claim","condition","confidence","contradiction","evidence-count","evidence-reference","evolution","history","investigation","safe-lineage","uncertainty","unknown","explanation-claim"].sort(compare),intentionallyUnavailableFieldFamilies:["evidence-body"],laterDisclosureFieldFamilies:["availability"]};return{...unsigned,digest:hash(unsigned)};
}
export function validateCanonicalUnderstandingAudienceLineage(value:CanonicalUnderstandingAudienceLineage):void{if(value.kind!=="canonical-understanding-audience-lineage"||value.schemaVersion!==CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_VERSION||value.producerVersion!==CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_PRODUCER_VERSION)throw new Error("Unsupported audience-lineage contract version.");if(!exact(value.organizationId))throw new Error("Invalid lineage organization.");value.records.forEach(validateCanonicalUnderstandingAudienceLineageRecord);if(new Set(value.records.map(r=>r.lineageId)).size!==value.records.length)throw new Error("Duplicate lineage identity.");if(value.records.some((r,i)=>i>0&&compare(value.records[i-1]!.lineageId,r.lineageId)>0))throw new Error("Noncanonical lineage ordering.");const{digest,...unsigned}=value;if(digest!==hash(unsigned))throw new Error("Invalid audience-lineage digest.");}
