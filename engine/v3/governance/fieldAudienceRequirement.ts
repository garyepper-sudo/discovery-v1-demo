import { createHash } from "node:crypto";

import { createCanonicalScopeTopology, type CanonicalScopeTopology } from "./canonicalScopeLineage";
import type { GovernedScopeRef } from "./scopedGovernanceContext";

export const FIELD_AUDIENCE_REQUIREMENT_VERSION = "1" as const;
export const FIELD_AUDIENCE_APPROVAL_VERSION = "1" as const;
export const FIELD_AUDIENCE_RESOURCE = "canonical-organizational-understanding" as const;
export const FIELD_AUDIENCE_OPERATION = "receive" as const;
export const FIELD_AUDIENCE_PURPOSE = "organizational-understanding" as const;
export const FIELD_AUDIENCE_APPROVAL_OPERATION = "field-audience-requirement:approve" as const;
export const FIELD_AUDIENCE_ISSUANCE_OPERATION = "field-audience-requirement:issue" as const;
export const FIELD_AUDIENCE_ISSUANCE_RECEIPT_VERSION = "1" as const;
export const FIELD_AUDIENCE_APPROVAL_POLICY_VERSION = "field-audience-approval-policy:1" as const;
export const FIELD_AUDIENCE_APPROVAL_POLICY_DERIVATION_VERSION = "1" as const;
export const FIELD_AUDIENCE_ISSUANCE_AUTHORIZATION_VERSION = "1" as const;

export const FIELD_AUDIENCE_FAMILIES = [
  "composition-claim", "composition-identity", "composition-revision", "explanation-claim", "explanation-identity", "explanation-version-basis",
  "evidence-reference", "evidence-source-identity", "comparative-evidence-role", "evidence-count", "evidence-body", "condition", "investigation",
  "confidence", "uncertainty", "unknown", "contradiction", "history", "evolution", "authority-receipt", "audit-reference", "safe-lineage", "availability",
] as const;
export type FieldAudienceFamily = typeof FIELD_AUDIENCE_FAMILIES[number];
export type FieldAudienceLifecycle = "proposed" | "active" | "inactive" | "revoked" | "superseded";
export type FieldAudienceDisposition = "classified" | "unresolved" | "intentionally-unavailable";
export type FieldAudienceAdministrativeCapability =
  | "manage-organization-membership" | "manage-organization-access-assignments" | "manage-recipient-audience-grants"
  | "manage-field-audience-requirements" | "manage-canonical-scope-topology" | "view-governance-audit"
  | "manage-administrative-delegation" | "invoke-break-glass-receive";
export type FieldAudienceRequirementKind = "field-audience-family-policy" | "exact-field-audience-requirement";

export type FieldAudienceTarget = {
  organizationId: string; objectKind: string; objectId: string; objectRevision: string;
  fieldFamily: FieldAudienceFamily; fieldPath: string;
};
/** Outer clauses are OR alternatives; scopes inside one clause are AND. */
export type FieldAudienceScopeExpression = GovernedScopeRef[][];

export type FieldAudienceAdministrativeAuthority = {
  kind: "field-audience-administrative-authority"; schemaVersion: typeof FIELD_AUDIENCE_REQUIREMENT_VERSION;
  authorityId: string; revisionId: string; revision: number; organizationId: string; principalId: string;
  capability: FieldAudienceAdministrativeCapability; state: FieldAudienceLifecycle; effectiveAt: string; expiresAt: string | null;
  supersedesRevisionId: string | null; issuerAuthorityRef: string; digest: string;
};

type FieldAudienceRuleBase = {
  schemaVersion: typeof FIELD_AUDIENCE_REQUIREMENT_VERSION; revision: number; organizationId: string;
  resourceFamily: typeof FIELD_AUDIENCE_RESOURCE; operation: typeof FIELD_AUDIENCE_OPERATION; purpose: typeof FIELD_AUDIENCE_PURPOSE;
  fieldFamily: FieldAudienceFamily; disposition: FieldAudienceDisposition; requirements: FieldAudienceScopeExpression;
  state: FieldAudienceLifecycle; effectiveAt: string; supersedesRevisionId: string | null; issuerAuthorityRevisionId: string;
  proposalId: string; proposalRevisionId: string; proposalDigest: string; revisionId: string; digest: string;
};
export type FieldAudienceFamilyPolicy = FieldAudienceRuleBase & {
  kind: "field-audience-family-policy"; policyId: string; policyVersion: string; fieldPath: string;
};
export type ExactFieldAudienceRequirement = FieldAudienceRuleBase & {
  kind: "exact-field-audience-requirement"; requirementId: string; target: FieldAudienceTarget; overridePolicyVersion: string | null;
};

export type FieldAudienceRequirementApproval = {
  kind: "field-audience-requirement-approval"; schemaVersion: typeof FIELD_AUDIENCE_APPROVAL_VERSION;
  approvalId: string; revisionId: string; digest: string; organizationId: string;
  requirementKind: FieldAudienceRequirementKind; proposalId: string; proposalRevisionId: string; proposalDigest: string;
  target: FieldAudienceTarget | null; fieldFamily: FieldAudienceFamily; fieldPath: string;
  approvingPrincipalId: string; authorityId: string; authorityRevisionId: string;
  capability: "manage-field-audience-requirements"; decision: "approved" | "rejected";
  operation: typeof FIELD_AUDIENCE_APPROVAL_OPERATION; effectiveAt: string;
};
export type FieldAudienceIssuanceReceipt = {
  kind: "field-audience-requirement-issuance-receipt"; schemaVersion: typeof FIELD_AUDIENCE_ISSUANCE_RECEIPT_VERSION;
  receiptId: string; revisionId: string; digest: string; organizationId: string; requirementKind: FieldAudienceRequirementKind;
  proposalId: string; proposalRevisionId: string; proposalDigest: string;
  requirementId: string; requirementRevisionId: string; requirementDigest: string;
  target: FieldAudienceTarget | null; fieldFamily: FieldAudienceFamily; fieldPath: string; policyBoundary: string | null;
  approvalRefs: {approvalId:string;approvalRevisionId:string;approvalDigest:string;authorityId:string;authorityRevisionId:string;approvingPrincipalId:string}[];
  approvalSetDigest: string; approvalPolicyDerivationId:string; approvalPolicyRevisionId: string; approvalPolicyIntegrity:string;
  requiredDistinctPrincipalCount: number; actualDistinctPrincipalCount: number;
  authorizationId:string; authorizationRevisionId:string; authorizationIntegrity:string;
  issuingPrincipalId: string; issuingAuthorityId: string; issuingAuthorityRevisionId: string;
  operation: typeof FIELD_AUDIENCE_ISSUANCE_OPERATION; resource: typeof FIELD_AUDIENCE_RESOURCE; purpose: typeof FIELD_AUDIENCE_PURPOSE;
  authorizationAsOf: string; issuedAt: string; predecessorReceiptId: string | null;
};
export type AuthorizedFieldAudienceRequirementIssuance = {
  kind:"authorized-field-audience-requirement-issuance"; schemaVersion:typeof FIELD_AUDIENCE_ISSUANCE_AUTHORIZATION_VERSION;
  authorizationId:string; revisionId:string; organizationId:string; proposalId:string; proposalRevisionId:string; proposalDigest:string; requirementRevisionId:string;
  approvalPolicyDerivation:FieldAudienceApprovalPolicyDerivation; approvalPolicyDerivationId:string; approvalPolicyRevisionId:string; approvalPolicyIntegrity:string;
  approvalRefs:ReturnType<typeof approvalRefs>; approvalRevisionIds:string[]; approvalSetDigest:string; approvingPrincipalIds:string[];
  requiredDistinctPrincipalCount:number; actualDistinctPrincipalCount:number;
  issuingPrincipalId:string; issuingAuthorityId:string; issuingAuthorityRevisionId:string;
  operation:typeof FIELD_AUDIENCE_ISSUANCE_OPERATION; resource:typeof FIELD_AUDIENCE_RESOURCE; purpose:typeof FIELD_AUDIENCE_PURPOSE;
  topologyId:string; topologyDigest:string; currentRequirementStateDigest:string; asOf:string; digest:string;
};
export type FieldAudienceIssuanceAuthorizationResult = {authorized:true;authorization:AuthorizedFieldAudienceRequirementIssuance}|{authorized:false;reason:string};
export type FieldAudienceIssuanceAuthorizationValidation = {valid:true;authorization:AuthorizedFieldAudienceRequirementIssuance}|{valid:false;reason:string};
export type FieldAudienceHistoricalIssuanceValidation = {valid:true}|{valid:false;reason:string};
export type FieldAudienceApprovalPolicyDerivation = {
  kind:"field-audience-approval-policy-derivation"; schemaVersion:typeof FIELD_AUDIENCE_APPROVAL_POLICY_DERIVATION_VERSION;
  policyId:typeof FIELD_AUDIENCE_APPROVAL_POLICY_VERSION; derivationId:string; revisionId:string; digest:string;
  organizationId:string; requirementKind:FieldAudienceRequirementKind; proposalId:string; proposalRevisionId:string; proposalDigest:string;
  target:FieldAudienceTarget|null; fieldFamily:FieldAudienceFamily; fieldPath:string; normalizedRequirements:FieldAudienceScopeExpression;
  governingPolicy:{state:"not-applicable"}|{state:"applicable";policyId:string;revisionId:string;digest:string;normalizedRequirements:FieldAudienceScopeExpression};
  topologyId:string; topologyVersion:number; topologyDigest:string; topologyOrganizationId:string;
  organizationWide:boolean;
  disposition:"single-approval-required"|"dual-approval-required"|"unresolved"|"invalid";
  requiredDistinctPrincipalCount:1|2|null;
  reason:"non-organization-wide-family-policy"|"organization-wide-family-policy"|"equal-exact-override"|"narrower-exact-override"|"broader-exact-override"|"incomparable-exact-override"|"missing-governing-family-policy"|"intentionally-unavailable"|"invalid-proposal-or-topology";
  comparison:"equal"|"broader"|"narrower"|"incomparable"|"not-applicable";
};
export type FieldAudienceApprovalPolicy = FieldAudienceApprovalPolicyDerivation;

export type FieldAudienceRequirementComparison = "equal" | "broader" | "narrower" | "incomparable" | "invalid-topology";
export type FieldAudienceResolution = {
  kind: "field-audience-resolution"; schemaVersion: typeof FIELD_AUDIENCE_REQUIREMENT_VERSION; resolutionId: string;
  disposition: "resolved" | "unresolved" | "inactive" | "revoked" | "conflicting" | "intentionally-unavailable" | "stale-target" | "invalid-authority" | "invalid-approval" | "invalid-topology" | "malformed" | "cross-organization";
  organizationId: string; target: FieldAudienceTarget; requirements?: FieldAudienceScopeExpression;
  basis?: "field-family-policy" | "exact-object-override"; policyVersion?: string; comparison?: FieldAudienceRequirementComparison;
  issuanceReceipt?: FieldAudienceIssuanceReceipt;
};

const compare = (a: string, b: string): number => a.localeCompare(b);
export function canonicalFieldAudienceJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalFieldAudienceJson).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value as Record<string, unknown>).sort(([a],[b]) => compare(a,b)).map(([key,item]) => `${JSON.stringify(key)}:${canonicalFieldAudienceJson(item)}`).join(",")}}`;
  return JSON.stringify(value);
}
export const fieldAudienceDigest = (value: unknown): string => createHash("sha256").update(canonicalFieldAudienceJson(value)).digest("hex");
const exact = (value: string): boolean => typeof value === "string" && value.trim() === value && value.length > 0 && value !== "*" && !value.includes("\0");
const timestamp = (value:string):boolean => exact(value) && Number.isFinite(Date.parse(value));
const scopeKey = (scope: GovernedScopeRef): string => canonicalFieldAudienceJson([scope.organizationId, scope.type, scope.id]);
const copyScope = (scope:GovernedScopeRef):GovernedScopeRef => ({organizationId:scope.organizationId,type:scope.type,id:scope.id});
const normalizeScopes = (values: readonly GovernedScopeRef[]): GovernedScopeRef[] => [...new Map(values.map((scope) => [scopeKey(scope), copyScope(scope)])).values()].sort((a,b) => compare(scopeKey(a),scopeKey(b)));
export function normalizeFieldAudienceExpression(value: FieldAudienceScopeExpression): FieldAudienceScopeExpression {
  return [...new Map(value.map((clause) => { const normalized=normalizeScopes(clause); return [canonicalFieldAudienceJson(normalized),normalized] as const; })).values()].sort((a,b)=>compare(canonicalFieldAudienceJson(a),canonicalFieldAudienceJson(b)));
}
function assertLifecycle(revision:number,state:FieldAudienceLifecycle,supersedes:string|null):void {
  if (!Number.isInteger(revision) || revision < 1 || ((revision===1)!==(supersedes===null)) || (state==="superseded"&&revision===1)) throw new Error("Invalid field audience lifecycle.");
}
function assertTarget(target:FieldAudienceTarget):void {
  if (![target.organizationId,target.objectKind,target.objectId,target.objectRevision,target.fieldPath].every(exact) || !FIELD_AUDIENCE_FAMILIES.includes(target.fieldFamily)) throw new Error("Invalid exact field target.");
  if (!target.fieldPath.startsWith(`${target.fieldFamily}.`) && target.fieldPath!==target.fieldFamily) throw new Error("Field path is not owned by its family.");
}
function validTopology(topology:CanonicalScopeTopology,organizationId:string):boolean {
  try { const rebuilt=createCanonicalScopeTopology({organizationId:topology.organizationId,topologyVersion:topology.topologyVersion,effectiveAt:topology.effectiveAt,supersedesTopologyId:topology.supersedesTopologyId,nodes:topology.nodes,relationships:topology.relationships}); return topology.organizationId===organizationId&&rebuilt.topologyId===topology.topologyId&&rebuilt.digest===topology.digest; } catch { return false; }
}
function contains(topology:CanonicalScopeTopology,from:GovernedScopeRef,to:GovernedScopeRef):boolean {
  const target=scopeKey(to), queue=[scopeKey(from)], seen=new Set<string>();
  while(queue.length){const current=queue.shift()!;if(current===target)return true;if(seen.has(current))continue;seen.add(current);for(const edge of topology.relationships)if(edge.kind==="contains"&&scopeKey(edge.from)===current)queue.push(scopeKey(edge.to));}
  return false;
}
function clauseAtLeastAsBroad(topology:CanonicalScopeTopology,a:readonly GovernedScopeRef[],b:readonly GovernedScopeRef[]):boolean {
  return a.every(requiredA=>b.some(requiredB=>contains(topology,requiredA,requiredB)));
}
export function compareFieldAudienceRequirements(a:FieldAudienceScopeExpression,b:FieldAudienceScopeExpression,topology:CanonicalScopeTopology,organizationId:string):FieldAudienceRequirementComparison {
  if(!validTopology(topology,organizationId))return "invalid-topology";
  const left=normalizeFieldAudienceExpression(a),right=normalizeFieldAudienceExpression(b);
  if([...left,...right].flat().some(scope=>scope.organizationId!==organizationId||!topology.nodes.some(node=>scopeKey(node)===scopeKey(scope))))return "invalid-topology";
  const leftBroad=right.every(clauseB=>left.some(clauseA=>clauseAtLeastAsBroad(topology,clauseA,clauseB)));
  const rightBroad=left.every(clauseA=>right.some(clauseB=>clauseAtLeastAsBroad(topology,clauseB,clauseA)));
  return leftBroad&&rightBroad?"equal":leftBroad?"broader":rightBroad?"narrower":"incomparable";
}

export function createFieldAudienceAdministrativeAuthority(input:Omit<FieldAudienceAdministrativeAuthority,"kind"|"schemaVersion"|"authorityId"|"revisionId"|"digest">):FieldAudienceAdministrativeAuthority {
  const capabilities:readonly FieldAudienceAdministrativeCapability[]=["manage-organization-membership","manage-organization-access-assignments","manage-recipient-audience-grants","manage-field-audience-requirements","manage-canonical-scope-topology","view-governance-audit","manage-administrative-delegation","invoke-break-glass-receive"];
  if(![input.organizationId,input.principalId,input.issuerAuthorityRef].every(exact)||!capabilities.includes(input.capability)||!timestamp(input.effectiveAt)||(input.expiresAt!==null&&!timestamp(input.expiresAt)))throw new Error("Invalid administrative authority.");
  assertLifecycle(input.revision,input.state,input.supersedesRevisionId);
  const authorityId=`field-audience-administrative-authority:${fieldAudienceDigest([input.organizationId,input.principalId,input.capability])}`;
  const unsigned={kind:"field-audience-administrative-authority" as const,schemaVersion:FIELD_AUDIENCE_REQUIREMENT_VERSION,authorityId,...input};
  const revisionId=`field-audience-administrative-authority-revision:${fieldAudienceDigest(unsigned)}`;
  return {...unsigned,revisionId,digest:fieldAudienceDigest({...unsigned,revisionId})};
}
function validAuthority(value:FieldAudienceAdministrativeAuthority|undefined,organizationId:string,at:string):boolean {
  if(!value||!timestamp(at))return false;
  try { const {digest,revisionId,...unsigned}=value; return value.kind==="field-audience-administrative-authority"&&value.schemaVersion===FIELD_AUDIENCE_REQUIREMENT_VERSION&&revisionId===`field-audience-administrative-authority-revision:${fieldAudienceDigest(unsigned)}`&&digest===fieldAudienceDigest({...unsigned,revisionId})&&value.organizationId===organizationId&&value.capability==="manage-field-audience-requirements"&&value.state==="active"&&Date.parse(value.effectiveAt)<=Date.parse(at)&&(value.expiresAt===null||Date.parse(value.expiresAt)>Date.parse(at)); } catch{return false;}
}
type RuleCreation = {revision:number;organizationId:string;resourceFamily:typeof FIELD_AUDIENCE_RESOURCE;operation:typeof FIELD_AUDIENCE_OPERATION;purpose:typeof FIELD_AUDIENCE_PURPOSE;fieldFamily:FieldAudienceFamily;disposition:FieldAudienceDisposition;requirements:FieldAudienceScopeExpression;state:FieldAudienceLifecycle;effectiveAt:string;supersedesRevisionId:string|null;issuerAuthorityRevisionId:string;authorities:readonly FieldAudienceAdministrativeAuthority[];asOf:string};
function normalizeRule(input:RuleCreation):{requirements:FieldAudienceScopeExpression}{
  if(![input.organizationId,input.issuerAuthorityRevisionId].every(exact)||!timestamp(input.effectiveAt)||!timestamp(input.asOf)||Date.parse(input.effectiveAt)>Date.parse(input.asOf))throw new Error("Invalid field requirement rule.");
  assertLifecycle(input.revision,input.state,input.supersedesRevisionId);
  const requirements=normalizeFieldAudienceExpression(input.requirements);
  if((input.disposition==="classified")!==(requirements.length>0)||requirements.some(clause=>clause.length===0||clause.some(scope=>scope.organizationId!==input.organizationId||!exact(scope.id))))throw new Error("Invalid requirement expression.");
  const authority=input.authorities.find(item=>item.revisionId===input.issuerAuthorityRevisionId);if(!validAuthority(authority,input.organizationId,input.asOf))throw new Error("Invalid field-classification issuer.");
  return{requirements};
}
function proposalFields(value:FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement):Record<string,unknown>{const {proposalId:_,proposalRevisionId:__,proposalDigest:___,revisionId:____,digest:_____,...fields}=value;return fields;}

export function createFieldAudienceFamilyPolicy(input:Omit<FieldAudienceFamilyPolicy,"kind"|"schemaVersion"|"policyId"|"proposalId"|"proposalRevisionId"|"proposalDigest"|"revisionId"|"digest"|"requirements">&{requirements:FieldAudienceScopeExpression;authorities:readonly FieldAudienceAdministrativeAuthority[];asOf:string}):FieldAudienceFamilyPolicy {
  if(!exact(input.policyVersion)||!exact(input.fieldPath)||(input.fieldPath!==input.fieldFamily&&!input.fieldPath.startsWith(`${input.fieldFamily}.`)))throw new Error("Invalid field policy identity.");
  const normalized=normalizeRule(input);const policyId=`field-audience-family-policy:${fieldAudienceDigest([input.organizationId,input.resourceFamily,input.operation,input.purpose,input.fieldFamily,input.fieldPath])}`;
  const base={kind:"field-audience-family-policy" as const,schemaVersion:FIELD_AUDIENCE_REQUIREMENT_VERSION,policyId,revision:input.revision,organizationId:input.organizationId,resourceFamily:input.resourceFamily,operation:input.operation,purpose:input.purpose,fieldFamily:input.fieldFamily,fieldPath:input.fieldPath,policyVersion:input.policyVersion,disposition:input.disposition,requirements:normalized.requirements,state:input.state,effectiveAt:input.effectiveAt,supersedesRevisionId:input.supersedesRevisionId,issuerAuthorityRevisionId:input.issuerAuthorityRevisionId};
  const proposalId=`field-audience-proposal:${fieldAudienceDigest([base.kind,policyId])}`,proposalRevisionId=`field-audience-proposal-revision:${fieldAudienceDigest(base)}`,proposalDigest=fieldAudienceDigest({...base,proposalId,proposalRevisionId});
  const proposed={...base,proposalId,proposalRevisionId,proposalDigest};const revisionId=`field-audience-family-policy-revision:${fieldAudienceDigest(proposed)}`;return{...proposed,revisionId,digest:fieldAudienceDigest({...proposed,revisionId})};
}
export function createExactFieldAudienceRequirement(input:Omit<ExactFieldAudienceRequirement,"kind"|"schemaVersion"|"requirementId"|"proposalId"|"proposalRevisionId"|"proposalDigest"|"revisionId"|"digest"|"requirements">&{requirements:FieldAudienceScopeExpression;authorities:readonly FieldAudienceAdministrativeAuthority[];asOf:string}):ExactFieldAudienceRequirement {
  assertTarget(input.target);if(input.target.organizationId!==input.organizationId||input.target.fieldFamily!==input.fieldFamily)throw new Error("Exact target does not match requirement owner.");
  const normalized=normalizeRule(input);const requirementId=`exact-field-audience-requirement:${fieldAudienceDigest([input.organizationId,input.resourceFamily,input.operation,input.purpose,input.target])}`;
  const base={kind:"exact-field-audience-requirement" as const,schemaVersion:FIELD_AUDIENCE_REQUIREMENT_VERSION,requirementId,revision:input.revision,organizationId:input.organizationId,resourceFamily:input.resourceFamily,operation:input.operation,purpose:input.purpose,fieldFamily:input.fieldFamily,target:structuredClone(input.target),overridePolicyVersion:input.overridePolicyVersion,disposition:input.disposition,requirements:normalized.requirements,state:input.state,effectiveAt:input.effectiveAt,supersedesRevisionId:input.supersedesRevisionId,issuerAuthorityRevisionId:input.issuerAuthorityRevisionId};
  const proposalId=`field-audience-proposal:${fieldAudienceDigest([base.kind,requirementId])}`,proposalRevisionId=`field-audience-proposal-revision:${fieldAudienceDigest(base)}`,proposalDigest=fieldAudienceDigest({...base,proposalId,proposalRevisionId});
  const proposed={...base,proposalId,proposalRevisionId,proposalDigest};const revisionId=`exact-field-audience-requirement-revision:${fieldAudienceDigest(proposed)}`;return{...proposed,revisionId,digest:fieldAudienceDigest({...proposed,revisionId})};
}
function validRule(value:FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement,authorities:readonly FieldAudienceAdministrativeAuthority[],asOf:string):boolean{
  try { if(Date.parse(value.effectiveAt)>Date.parse(asOf))return false;if(value.kind==="exact-field-audience-requirement")assertTarget(value.target);const recreated=value.kind==="field-audience-family-policy"?createFieldAudienceFamilyPolicy({...value,authorities,asOf:value.effectiveAt}):createExactFieldAudienceRequirement({...value,authorities,asOf:value.effectiveAt});return recreated.proposalId===value.proposalId&&recreated.proposalRevisionId===value.proposalRevisionId&&recreated.proposalDigest===value.proposalDigest&&recreated.revisionId===value.revisionId&&recreated.digest===value.digest&&canonicalFieldAudienceJson(proposalFields(recreated))===canonicalFieldAudienceJson(proposalFields(value)); }catch{return false;}
}

export function createFieldAudienceRequirementApproval(input:Omit<FieldAudienceRequirementApproval,"kind"|"schemaVersion"|"approvalId"|"revisionId"|"digest"|"capability"|"operation">&{proposal:FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement;authority:FieldAudienceAdministrativeAuthority}):FieldAudienceRequirementApproval{
  const {proposal,authority}=input;if(!validAuthority(authority,proposal.organizationId,input.effectiveAt)||authority.principalId!==input.approvingPrincipalId||input.organizationId!==proposal.organizationId||input.requirementKind!==proposal.kind||input.proposalId!==proposal.proposalId||input.proposalRevisionId!==proposal.proposalRevisionId||input.proposalDigest!==proposal.proposalDigest)throw new Error("Approval is not bound to an exact valid proposal and authority.");
  const expectedTarget=proposal.kind==="exact-field-audience-requirement"?proposal.target:null,fieldPath=proposal.kind==="exact-field-audience-requirement"?proposal.target.fieldPath:proposal.fieldPath;
  if(canonicalFieldAudienceJson(input.target)!==canonicalFieldAudienceJson(expectedTarget)||input.fieldFamily!==proposal.fieldFamily||input.fieldPath!==fieldPath||input.authorityId!==authority.authorityId||input.authorityRevisionId!==authority.revisionId||!timestamp(input.effectiveAt))throw new Error("Approval binding is invalid.");
  const base={kind:"field-audience-requirement-approval" as const,schemaVersion:FIELD_AUDIENCE_APPROVAL_VERSION,organizationId:input.organizationId,requirementKind:input.requirementKind,proposalId:input.proposalId,proposalRevisionId:input.proposalRevisionId,proposalDigest:input.proposalDigest,target:expectedTarget?structuredClone(expectedTarget):null,fieldFamily:input.fieldFamily,fieldPath:input.fieldPath,approvingPrincipalId:input.approvingPrincipalId,authorityId:input.authorityId,authorityRevisionId:input.authorityRevisionId,capability:"manage-field-audience-requirements" as const,decision:input.decision,operation:FIELD_AUDIENCE_APPROVAL_OPERATION,effectiveAt:input.effectiveAt};
  const approvalId=`field-audience-requirement-approval:${fieldAudienceDigest([base.organizationId,base.proposalRevisionId,base.approvingPrincipalId,base.operation])}`,revisionId=`field-audience-requirement-approval-revision:${fieldAudienceDigest(base)}`;return{...base,approvalId,revisionId,digest:fieldAudienceDigest({...base,approvalId,revisionId})};
}
function validApproval(approval:FieldAudienceRequirementApproval,proposal:FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement,authorities:readonly FieldAudienceAdministrativeAuthority[]):boolean{
  try {const authority=authorities.find(item=>item.revisionId===approval.authorityRevisionId);if(!authority)return false;const recreated=createFieldAudienceRequirementApproval({...approval,proposal,authority});return recreated.approvalId===approval.approvalId&&recreated.revisionId===approval.revisionId&&recreated.digest===approval.digest;}catch{return false;}
}
function terminal<T extends {revisionId:string;supersedesRevisionId:string|null}>(items:readonly T[]):T[]{const superseded=new Set(items.map(item=>item.supersedesRevisionId).filter((value):value is string=>value!==null));return items.filter(item=>!superseded.has(item.revisionId));}
function organizationWide(rule:FieldAudienceFamilyPolicy):boolean{return rule.requirements.flat().some(scope=>scope.type==="organization"&&scope.id===rule.organizationId);}
function approvalsFor(proposal:FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement,all:readonly FieldAudienceRequirementApproval[],authorities:readonly FieldAudienceAdministrativeAuthority[],required:number,asOf:string,current:boolean):{valid:boolean;accepted:FieldAudienceRequirementApproval[]}{
  const bound=all.filter(item=>item.proposalRevisionId===proposal.proposalRevisionId||item.proposalId===proposal.proposalId);
  if(bound.some(item=>Date.parse(item.effectiveAt)>Date.parse(asOf)||!validApproval(item,proposal,authorities)))return{valid:false,accepted:[]};
  const decisions=new Map<string,Set<string>>();for(const item of bound){const set=decisions.get(item.approvingPrincipalId)??new Set<string>();set.add(item.decision);decisions.set(item.approvingPrincipalId,set);}
  if([...decisions.values()].some(set=>set.size>1)||bound.some(item=>item.decision==="rejected"))return{valid:false,accepted:[]};
  const accepted=[...new Map(bound.filter(item=>item.decision==="approved").map(item=>[item.revisionId,item])).values()].sort((a,b)=>compare(a.revisionId,b.revisionId));
  if(current){const heads=terminal(authorities.filter(item=>item.organizationId===proposal.organizationId));if(accepted.some(item=>!heads.some(head=>head.revisionId===item.authorityRevisionId&&validAuthority(head,proposal.organizationId,asOf))))return{valid:false,accepted:[]};}
  return{valid:new Set(accepted.map(item=>item.approvingPrincipalId)).size>=required,accepted};
}

const requirementIdOf=(value:FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement):string=>value.kind==="field-audience-family-policy"?value.policyId:value.requirementId;
const targetOf=(value:FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement):FieldAudienceTarget|null=>value.kind==="exact-field-audience-requirement"?structuredClone(value.target):null;
const fieldPathOf=(value:FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement):string=>value.kind==="exact-field-audience-requirement"?value.target.fieldPath:value.fieldPath;
const policyBoundaryOf=(value:FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement):string|null=>value.kind==="field-audience-family-policy"?value.policyVersion:value.overridePolicyVersion;
const approvalRefs=(values:readonly FieldAudienceRequirementApproval[])=>values.map(value=>({approvalId:value.approvalId,approvalRevisionId:value.revisionId,approvalDigest:value.digest,authorityId:value.authorityId,authorityRevisionId:value.authorityRevisionId,approvingPrincipalId:value.approvingPrincipalId})).sort((a,b)=>compare(canonicalFieldAudienceJson(a),canonicalFieldAudienceJson(b)));
const requirementStateDigest=(values:readonly (FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement)[])=>fieldAudienceDigest([...values].map(value=>({kind:value.kind,revisionId:value.revisionId,digest:value.digest,state:value.state})).sort((a,b)=>compare(a.revisionId,b.revisionId)));

export function deriveFieldAudienceApprovalPolicy(input:{proposal:FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement;governingFamilyPolicy:FieldAudienceFamilyPolicy|null;topology:CanonicalScopeTopology;asOf:string}):FieldAudienceApprovalPolicy{
  const proposal=input.proposal;
  const target=targetOf(proposal),fieldPath=fieldPathOf(proposal),normalizedRequirements=normalizeFieldAudienceExpression(proposal.requirements);
  const governingPolicy:FieldAudienceApprovalPolicyDerivation["governingPolicy"]=proposal.kind==="field-audience-family-policy"?{state:"not-applicable"}:{state:"applicable",policyId:input.governingFamilyPolicy?.policyId??"missing",revisionId:input.governingFamilyPolicy?.revisionId??"missing",digest:input.governingFamilyPolicy?.digest??"missing",normalizedRequirements:input.governingFamilyPolicy?normalizeFieldAudienceExpression(input.governingFamilyPolicy.requirements):[]};
  const finish=(disposition:FieldAudienceApprovalPolicy["disposition"],requiredDistinctPrincipalCount:1|2|null,reason:FieldAudienceApprovalPolicy["reason"],comparison:FieldAudienceApprovalPolicy["comparison"],organizationWideStatus:boolean):FieldAudienceApprovalPolicy=>{const identity={kind:"field-audience-approval-policy-derivation" as const,schemaVersion:FIELD_AUDIENCE_APPROVAL_POLICY_DERIVATION_VERSION,policyId:FIELD_AUDIENCE_APPROVAL_POLICY_VERSION,organizationId:proposal.organizationId,requirementKind:proposal.kind,proposalId:proposal.proposalId,proposalRevisionId:proposal.proposalRevisionId,proposalDigest:proposal.proposalDigest,target,fieldFamily:proposal.fieldFamily,fieldPath,normalizedRequirements,governingPolicy,topologyId:input.topology.topologyId,topologyVersion:input.topology.topologyVersion,topologyDigest:input.topology.digest,topologyOrganizationId:input.topology.organizationId,organizationWide:organizationWideStatus,disposition,requiredDistinctPrincipalCount,reason,comparison};const derivationId=`field-audience-approval-policy-derivation:${fieldAudienceDigest([identity.organizationId,identity.proposalId,identity.policyId])}`,revisionId=`field-audience-approval-policy-derivation-revision:${fieldAudienceDigest({...identity,derivationId})}`;return{...identity,derivationId,revisionId,digest:fieldAudienceDigest({...identity,derivationId,revisionId})};};
  try{
    if(!timestamp(input.asOf)||!validTopology(input.topology,proposal.organizationId)||proposal.disposition==="intentionally-unavailable")return proposal.disposition==="intentionally-unavailable"?finish("unresolved",null,"intentionally-unavailable",proposal.kind==="field-audience-family-policy"?"not-applicable":"incomparable",false):finish("invalid",null,"invalid-proposal-or-topology",proposal.kind==="field-audience-family-policy"?"not-applicable":"incomparable",false);
    if(proposal.kind==="field-audience-family-policy"){const wide=organizationWide(proposal);return wide?finish("dual-approval-required",2,"organization-wide-family-policy","not-applicable",true):finish("single-approval-required",1,"non-organization-wide-family-policy","not-applicable",false);}
    const policy=input.governingFamilyPolicy;if(!policy)return finish("unresolved",null,"missing-governing-family-policy","incomparable",false);
    if(policy.organizationId!==proposal.organizationId||policy.fieldFamily!==proposal.fieldFamily||policy.fieldPath!==proposal.target.fieldPath||policy.state!=="active")return finish("invalid",null,"invalid-proposal-or-topology","incomparable",false);
    const comparison=compareFieldAudienceRequirements(proposal.requirements,policy.requirements,input.topology,proposal.organizationId);
    if(comparison==="invalid-topology")return finish("invalid",null,"invalid-proposal-or-topology","incomparable",false);
    if(comparison==="incomparable")return finish("unresolved",null,"incomparable-exact-override",comparison,false);
    if(comparison==="broader")return finish("dual-approval-required",2,"broader-exact-override",comparison,false);
    return comparison==="equal"?finish("single-approval-required",1,"equal-exact-override",comparison,false):finish("single-approval-required",1,"narrower-exact-override",comparison,false);
  }catch{return finish("invalid",null,"invalid-proposal-or-topology",proposal.kind==="field-audience-family-policy"?"not-applicable":"incomparable",false);}
}

type AuthoritativeAuthorizationInput={proposal:FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement;governingFamilyPolicy:FieldAudienceFamilyPolicy|null;approvals:readonly FieldAudienceRequirementApproval[];currentAdministrativeAuthorities:readonly FieldAudienceAdministrativeAuthority[];currentRequirementState:readonly (FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement)[];topology:CanonicalScopeTopology;issuingPrincipalId:string;issuingAuthorityRevisionId:string;asOf:string};
export function normalizeAuthorizedFieldAudienceRequirementIssuanceInput(input:AuthoritativeAuthorizationInput){
  if(!timestamp(input.asOf)||!validTopology(input.topology,input.proposal.organizationId)||!validRule(input.proposal,input.currentAdministrativeAuthorities,input.asOf)||input.proposal.state!=="active")throw new Error("invalid-proposal-or-topology");
  const currentHeads=terminal(input.currentRequirementState.filter(item=>item.organizationId===input.proposal.organizationId&&requirementIdOf(item)===requirementIdOf(input.proposal)));if(currentHeads.some(item=>item.revisionId!==input.proposal.revisionId&&item.state==="active"))throw new Error("conflicting-current-requirement");
  const policy=deriveFieldAudienceApprovalPolicy({proposal:input.proposal,governingFamilyPolicy:input.governingFamilyPolicy,topology:input.topology,asOf:input.asOf});
  if(policy.requiredDistinctPrincipalCount===null)throw new Error(`approval-policy:${policy.reason}`);
  const checked=approvalsFor(input.proposal,input.approvals,input.currentAdministrativeAuthorities,policy.requiredDistinctPrincipalCount,input.asOf,true);if(!checked.valid)throw new Error("invalid-current-approval-set");
  const issuing=terminal(input.currentAdministrativeAuthorities.filter(item=>item.organizationId===input.proposal.organizationId)).find(item=>item.revisionId===input.issuingAuthorityRevisionId);
  if(!issuing||issuing.principalId!==input.issuingPrincipalId||!validAuthority(issuing,input.proposal.organizationId,input.asOf))throw new Error("invalid-current-issuing-authority");
  const refs=approvalRefs(checked.accepted),principals=[...new Set(refs.map(item=>item.approvingPrincipalId))].sort(compare);
  return{kind:"authorized-field-audience-requirement-issuance" as const,schemaVersion:FIELD_AUDIENCE_ISSUANCE_AUTHORIZATION_VERSION,organizationId:input.proposal.organizationId,proposalId:input.proposal.proposalId,proposalRevisionId:input.proposal.proposalRevisionId,proposalDigest:input.proposal.proposalDigest,requirementRevisionId:input.proposal.revisionId,approvalPolicyDerivation:policy,approvalPolicyDerivationId:policy.derivationId,approvalPolicyRevisionId:policy.revisionId,approvalPolicyIntegrity:policy.digest,approvalRefs:refs,approvalRevisionIds:refs.map(item=>item.approvalRevisionId),approvalSetDigest:fieldAudienceDigest(refs),approvingPrincipalIds:principals,requiredDistinctPrincipalCount:policy.requiredDistinctPrincipalCount,actualDistinctPrincipalCount:principals.length,issuingPrincipalId:input.issuingPrincipalId,issuingAuthorityId:issuing.authorityId,issuingAuthorityRevisionId:issuing.revisionId,operation:FIELD_AUDIENCE_ISSUANCE_OPERATION,resource:FIELD_AUDIENCE_RESOURCE,purpose:FIELD_AUDIENCE_PURPOSE,topologyId:input.topology.topologyId,topologyDigest:input.topology.digest,currentRequirementStateDigest:requirementStateDigest(input.currentRequirementState),asOf:input.asOf};
}
export const deriveAuthorizedFieldAudienceRequirementIssuanceId=(input:ReturnType<typeof normalizeAuthorizedFieldAudienceRequirementIssuanceInput>)=>`authorized-field-audience-requirement-issuance:${fieldAudienceDigest([input.organizationId,input.proposalRevisionId,input.operation,input.asOf])}`;
export const deriveAuthorizedFieldAudienceRequirementIssuanceRevision=(input:ReturnType<typeof normalizeAuthorizedFieldAudienceRequirementIssuanceInput>&{authorizationId:string})=>`authorized-field-audience-requirement-issuance-revision:${fieldAudienceDigest(input)}`;
export const deriveAuthorizedFieldAudienceRequirementIssuanceIntegrity=(input:Omit<AuthorizedFieldAudienceRequirementIssuance,"digest">)=>fieldAudienceDigest(input);
const constructAuthorization=(input:AuthoritativeAuthorizationInput):AuthorizedFieldAudienceRequirementIssuance=>{const normalized=normalizeAuthorizedFieldAudienceRequirementIssuanceInput(input),authorizationId=deriveAuthorizedFieldAudienceRequirementIssuanceId(normalized),revisionId=deriveAuthorizedFieldAudienceRequirementIssuanceRevision({...normalized,authorizationId}),unsigned={...normalized,authorizationId,revisionId};return{...unsigned,digest:deriveAuthorizedFieldAudienceRequirementIssuanceIntegrity(unsigned)};};

export function validateAuthorizedFieldAudienceRequirementIssuance(input:{authorization:AuthorizedFieldAudienceRequirementIssuance;proposal:FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement;governingFamilyPolicy:FieldAudienceFamilyPolicy|null;approvals:readonly FieldAudienceRequirementApproval[];administrativeAuthorities:readonly FieldAudienceAdministrativeAuthority[];currentRequirementState:readonly (FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement)[];topology:CanonicalScopeTopology}):FieldAudienceIssuanceAuthorizationValidation{
  try{const expected=constructAuthorization({proposal:input.proposal,governingFamilyPolicy:input.governingFamilyPolicy,approvals:input.approvals,currentAdministrativeAuthorities:input.administrativeAuthorities,currentRequirementState:input.currentRequirementState,topology:input.topology,issuingPrincipalId:input.authorization.issuingPrincipalId,issuingAuthorityRevisionId:input.authorization.issuingAuthorityRevisionId,asOf:input.authorization.asOf});return canonicalFieldAudienceJson(expected)===canonicalFieldAudienceJson(input.authorization)?{valid:true,authorization:expected}:{valid:false,reason:"authorization-reconstruction-mismatch"};}catch(error){return{valid:false,reason:error instanceof Error?error.message:"malformed-authorization"};}
}

export function authorizeNewFieldAudienceRequirementIssuance(input:AuthoritativeAuthorizationInput):FieldAudienceIssuanceAuthorizationResult{
  const {proposal}=input;try{if(!timestamp(input.asOf)||!validTopology(input.topology,proposal.organizationId)||!validRule(proposal,input.currentAdministrativeAuthorities,input.asOf))return{authorized:false,reason:"invalid-proposal-or-topology"};const sameIdentity=input.currentRequirementState.filter(item=>item.organizationId===proposal.organizationId&&requirementIdOf(item)===requirementIdOf(proposal)),currentHeads=terminal(sameIdentity);if(currentHeads.some(item=>item.revisionId!==proposal.revisionId&&item.state==="active"))return{authorized:false,reason:"conflicting-current-requirement"};if(proposal.state!=="active")return{authorized:false,reason:"requirement-not-active"};return{authorized:true,authorization:constructAuthorization(input)};}catch(error){return{authorized:false,reason:error instanceof Error?error.message:"malformed-issuance-input"};}
}

type ReceiptConstructionInput={authorizedIssuance:AuthorizedFieldAudienceRequirementIssuance;proposal:FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement;governingFamilyPolicy?:FieldAudienceFamilyPolicy|null;topology?:CanonicalScopeTopology;approvals:readonly FieldAudienceRequirementApproval[];referencedAdministrativeAuthorities?:readonly FieldAudienceAdministrativeAuthority[];currentRequirementState?:readonly (FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement)[];finalRequirement:FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement;issuingAuthority:FieldAudienceAdministrativeAuthority;issuedAt:string;predecessorReceiptId?:string|null};
export function normalizeFieldAudienceIssuanceReceiptInput(input:ReceiptConstructionInput){
  const accepted=input.approvals.filter(item=>input.authorizedIssuance.approvalRevisionIds.includes(item.revisionId));
  return{organizationId:input.proposal.organizationId,requirementKind:input.proposal.kind,proposalId:input.proposal.proposalId,proposalRevisionId:input.proposal.proposalRevisionId,proposalDigest:input.proposal.proposalDigest,requirementId:requirementIdOf(input.finalRequirement),requirementRevisionId:input.finalRequirement.revisionId,requirementDigest:input.finalRequirement.digest,target:targetOf(input.finalRequirement),fieldFamily:input.finalRequirement.fieldFamily,fieldPath:fieldPathOf(input.finalRequirement),policyBoundary:policyBoundaryOf(input.finalRequirement),approvalRefs:approvalRefs(accepted),approvalSetDigest:fieldAudienceDigest(approvalRefs(accepted)),approvalPolicyDerivationId:input.authorizedIssuance.approvalPolicyDerivationId,approvalPolicyRevisionId:input.authorizedIssuance.approvalPolicyRevisionId,approvalPolicyIntegrity:input.authorizedIssuance.approvalPolicyIntegrity,requiredDistinctPrincipalCount:input.authorizedIssuance.requiredDistinctPrincipalCount,actualDistinctPrincipalCount:input.authorizedIssuance.actualDistinctPrincipalCount,authorizationId:input.authorizedIssuance.authorizationId,authorizationRevisionId:input.authorizedIssuance.revisionId,authorizationIntegrity:input.authorizedIssuance.digest,issuingPrincipalId:input.authorizedIssuance.issuingPrincipalId,issuingAuthorityId:input.issuingAuthority.authorityId,issuingAuthorityRevisionId:input.authorizedIssuance.issuingAuthorityRevisionId,operation:FIELD_AUDIENCE_ISSUANCE_OPERATION,resource:FIELD_AUDIENCE_RESOURCE,purpose:FIELD_AUDIENCE_PURPOSE,authorizationAsOf:input.authorizedIssuance.asOf,issuedAt:input.issuedAt,predecessorReceiptId:input.predecessorReceiptId??null};
}
export const deriveFieldAudienceIssuanceReceiptId=(input:ReturnType<typeof normalizeFieldAudienceIssuanceReceiptInput>):string=>`field-audience-requirement-issuance-receipt:${fieldAudienceDigest(input)}`;
export const deriveFieldAudienceIssuanceReceiptRevision=(input:ReturnType<typeof normalizeFieldAudienceIssuanceReceiptInput>&{receiptId:string}):string=>`field-audience-requirement-issuance-receipt-revision:${fieldAudienceDigest(input)}`;
export const deriveFieldAudienceIssuanceReceiptIntegrity=(input:Omit<FieldAudienceIssuanceReceipt,"digest">):string=>fieldAudienceDigest(input);

export function issueFieldAudienceRequirement(input:ReceiptConstructionInput):FieldAudienceIssuanceReceipt{
  if(!input.topology||!input.referencedAdministrativeAuthorities||!input.currentRequirementState)throw new Error("Authoritative issuance inputs are required.");
  const validation=validateAuthorizedFieldAudienceRequirementIssuance({authorization:input.authorizedIssuance,proposal:input.proposal,governingFamilyPolicy:input.governingFamilyPolicy??null,approvals:input.approvals,administrativeAuthorities:input.referencedAdministrativeAuthorities,currentRequirementState:input.currentRequirementState,topology:input.topology});if(!validation.valid)throw new Error(`Invalid issuance authorization: ${validation.reason}`);
  if(!timestamp(input.issuedAt)||Date.parse(input.issuedAt)<Date.parse(input.authorizedIssuance.asOf)||input.proposal.proposalRevisionId!==input.authorizedIssuance.proposalRevisionId||input.finalRequirement.revisionId!==input.authorizedIssuance.requirementRevisionId||input.proposal.proposalRevisionId!==input.finalRequirement.proposalRevisionId||canonicalFieldAudienceJson(input.finalRequirement)!==canonicalFieldAudienceJson(input.proposal)||input.issuingAuthority.revisionId!==input.authorizedIssuance.issuingAuthorityRevisionId||input.issuingAuthority.authorityId!==input.authorizedIssuance.issuingAuthorityId)throw new Error("Issuance does not match its authorization.");
  const normalized=normalizeFieldAudienceIssuanceReceiptInput(input);if(normalized.approvalRefs.length!==input.authorizedIssuance.approvalRevisionIds.length||new Set(normalized.approvalRefs.map(item=>item.approvingPrincipalId)).size!==normalized.actualDistinctPrincipalCount)throw new Error("Issuance approval set is incomplete.");
  const receiptId=deriveFieldAudienceIssuanceReceiptId(normalized),revisionId=deriveFieldAudienceIssuanceReceiptRevision({...normalized,receiptId});const unsigned={kind:"field-audience-requirement-issuance-receipt" as const,schemaVersion:FIELD_AUDIENCE_ISSUANCE_RECEIPT_VERSION,...normalized,receiptId,revisionId};return{...unsigned,digest:deriveFieldAudienceIssuanceReceiptIntegrity(unsigned)};
}

export function validateFieldAudienceIssuanceReceipt(input:{receipt:FieldAudienceIssuanceReceipt;authorization?:AuthorizedFieldAudienceRequirementIssuance;proposal:FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement;governingFamilyPolicy?:FieldAudienceFamilyPolicy|null;topology?:CanonicalScopeTopology;finalRequirement:FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement;approvals:readonly FieldAudienceRequirementApproval[];referencedAuthorityRevisions:readonly FieldAudienceAdministrativeAuthority[];historicalRequirementState?:readonly (FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement)[]}):FieldAudienceHistoricalIssuanceValidation{
  try{
    if(!input.authorization||!input.topology||!input.historicalRequirementState)return{valid:false,reason:"authoritative-historical-inputs-required"};
    const {receipt,proposal,finalRequirement}=input;if(receipt.schemaVersion!==FIELD_AUDIENCE_ISSUANCE_RECEIPT_VERSION||receipt.kind!=="field-audience-requirement-issuance-receipt")return{valid:false,reason:"unsupported-receipt-version"};
    const authorization=validateAuthorizedFieldAudienceRequirementIssuance({authorization:input.authorization,proposal,governingFamilyPolicy:input.governingFamilyPolicy??null,approvals:input.approvals,administrativeAuthorities:input.referencedAuthorityRevisions,currentRequirementState:input.historicalRequirementState,topology:input.topology});if(!authorization.valid)return{valid:false,reason:`invalid-historical-authorization:${authorization.reason}`};
    if(!timestamp(receipt.issuedAt)||!timestamp(receipt.authorizationAsOf)||receipt.organizationId!==proposal.organizationId||proposal.organizationId!==finalRequirement.organizationId)return{valid:false,reason:"organization-or-time-mismatch"};
    if(receipt.proposalId!==proposal.proposalId||receipt.proposalRevisionId!==proposal.proposalRevisionId||receipt.proposalDigest!==proposal.proposalDigest||receipt.requirementId!==requirementIdOf(finalRequirement)||receipt.requirementRevisionId!==finalRequirement.revisionId||receipt.requirementDigest!==finalRequirement.digest||canonicalFieldAudienceJson(receipt.target)!==canonicalFieldAudienceJson(targetOf(finalRequirement))||receipt.fieldFamily!==finalRequirement.fieldFamily||receipt.fieldPath!==fieldPathOf(finalRequirement)||receipt.policyBoundary!==policyBoundaryOf(finalRequirement))return{valid:false,reason:"proposal-or-requirement-mismatch"};
    const selected=input.approvals.filter(item=>receipt.approvalRefs.some(ref=>ref.approvalRevisionId===item.revisionId));if(selected.length!==receipt.approvalRefs.length||selected.some(item=>!validApproval(item,proposal,input.referencedAuthorityRevisions)))return{valid:false,reason:"historical-approval-mismatch"};
    const refs=approvalRefs(selected);if(canonicalFieldAudienceJson(refs)!==canonicalFieldAudienceJson(receipt.approvalRefs)||fieldAudienceDigest(refs)!==receipt.approvalSetDigest||new Set(refs.map(item=>item.approvingPrincipalId)).size!==receipt.actualDistinctPrincipalCount||receipt.actualDistinctPrincipalCount<receipt.requiredDistinctPrincipalCount)return{valid:false,reason:"approval-set-mismatch"};
    const issuing=input.referencedAuthorityRevisions.find(item=>item.revisionId===receipt.issuingAuthorityRevisionId);if(!issuing||issuing.authorityId!==receipt.issuingAuthorityId||issuing.principalId!==receipt.issuingPrincipalId||!validAuthority(issuing,receipt.organizationId,receipt.authorizationAsOf))return{valid:false,reason:"historical-issuing-authority-mismatch"};
    if(receipt.authorizationId!==authorization.authorization.authorizationId||receipt.authorizationRevisionId!==authorization.authorization.revisionId||receipt.authorizationIntegrity!==authorization.authorization.digest||receipt.approvalPolicyDerivationId!==authorization.authorization.approvalPolicyDerivationId||receipt.approvalPolicyRevisionId!==authorization.authorization.approvalPolicyRevisionId||receipt.approvalPolicyIntegrity!==authorization.authorization.approvalPolicyIntegrity||receipt.requiredDistinctPrincipalCount!==authorization.authorization.requiredDistinctPrincipalCount)return{valid:false,reason:"authorization-or-policy-binding-mismatch"};
    const normalized={organizationId:receipt.organizationId,requirementKind:receipt.requirementKind,proposalId:receipt.proposalId,proposalRevisionId:receipt.proposalRevisionId,proposalDigest:receipt.proposalDigest,requirementId:receipt.requirementId,requirementRevisionId:receipt.requirementRevisionId,requirementDigest:receipt.requirementDigest,target:receipt.target,fieldFamily:receipt.fieldFamily,fieldPath:receipt.fieldPath,policyBoundary:receipt.policyBoundary,approvalRefs:receipt.approvalRefs,approvalSetDigest:receipt.approvalSetDigest,approvalPolicyDerivationId:receipt.approvalPolicyDerivationId,approvalPolicyRevisionId:receipt.approvalPolicyRevisionId,approvalPolicyIntegrity:receipt.approvalPolicyIntegrity,requiredDistinctPrincipalCount:receipt.requiredDistinctPrincipalCount,actualDistinctPrincipalCount:receipt.actualDistinctPrincipalCount,authorizationId:receipt.authorizationId,authorizationRevisionId:receipt.authorizationRevisionId,authorizationIntegrity:receipt.authorizationIntegrity,issuingPrincipalId:receipt.issuingPrincipalId,issuingAuthorityId:receipt.issuingAuthorityId,issuingAuthorityRevisionId:receipt.issuingAuthorityRevisionId,operation:receipt.operation,resource:receipt.resource,purpose:receipt.purpose,authorizationAsOf:receipt.authorizationAsOf,issuedAt:receipt.issuedAt,predecessorReceiptId:receipt.predecessorReceiptId};
    const receiptId=deriveFieldAudienceIssuanceReceiptId(normalized),revisionId=deriveFieldAudienceIssuanceReceiptRevision({...normalized,receiptId});const unsigned={kind:receipt.kind,schemaVersion:receipt.schemaVersion,...normalized,receiptId,revisionId};if(receipt.receiptId!==receiptId||receipt.revisionId!==revisionId||receipt.digest!==deriveFieldAudienceIssuanceReceiptIntegrity(unsigned))return{valid:false,reason:"receipt-integrity-mismatch"};return{valid:true};
  }catch{return{valid:false,reason:"malformed-historical-receipt"};}
}

export function resolveCurrentFieldAudienceRequirement(input:{organizationId:string;target:FieldAudienceTarget;policies:readonly FieldAudienceFamilyPolicy[];exactRequirements:readonly ExactFieldAudienceRequirement[];historicalAuthorities:readonly FieldAudienceAdministrativeAuthority[];approvals:readonly FieldAudienceRequirementApproval[];issuanceReceipts:readonly FieldAudienceIssuanceReceipt[];issuanceAuthorizations?:readonly AuthorizedFieldAudienceRequirementIssuance[];topology:CanonicalScopeTopology;asOf:string}):FieldAudienceResolution{
  const finish=(disposition:FieldAudienceResolution["disposition"],extra:Partial<FieldAudienceResolution>={}):FieldAudienceResolution=>{const unsigned={kind:"field-audience-resolution" as const,schemaVersion:FIELD_AUDIENCE_REQUIREMENT_VERSION,disposition,organizationId:input.organizationId,target:input.target,...extra};return{...unsigned,resolutionId:`field-audience-resolution:${fieldAudienceDigest(unsigned)}`};};
  try{assertTarget(input.target);}catch{return finish("malformed");}if(!timestamp(input.asOf))return finish("malformed");if(input.target.organizationId!==input.organizationId)return finish("cross-organization");if(!validTopology(input.topology,input.organizationId))return finish("invalid-topology");
  const exactCandidates=input.exactRequirements.filter(item=>item.organizationId===input.organizationId&&item.target.objectKind===input.target.objectKind&&item.target.objectId===input.target.objectId&&item.fieldFamily===input.target.fieldFamily&&item.target.fieldPath===input.target.fieldPath);
  if(exactCandidates.some(item=>item.target.objectRevision!==input.target.objectRevision))return finish("stale-target");if(exactCandidates.some(item=>!validRule(item,input.historicalAuthorities,input.asOf)))return finish("invalid-authority");
  const exactHeads=terminal(exactCandidates);if(exactHeads.length===1&&(exactHeads[0]!.state==="revoked"||exactHeads[0]!.state==="inactive"))return finish(exactHeads[0]!.state);const activeExact=exactHeads.filter(item=>item.state==="active");if(activeExact.length>1)return finish("conflicting");
  const policies=input.policies.filter(item=>item.organizationId===input.organizationId&&item.fieldFamily===input.target.fieldFamily&&item.fieldPath===input.target.fieldPath);if(policies.some(item=>!validRule(item,input.historicalAuthorities,input.asOf)))return finish("invalid-authority");
  const policyHeads=terminal(policies);if(policyHeads.length===1&&(policyHeads[0]!.state==="revoked"||policyHeads[0]!.state==="inactive"))return finish(policyHeads[0]!.state);const activePolicies=policyHeads.filter(item=>item.state==="active");if(activePolicies.length>1)return finish("conflicting");
  const policy=activePolicies.at(0),override=activeExact.at(0);let comparison:FieldAudienceRequirementComparison|undefined;
  const receiptFor=(rule:FieldAudienceFamilyPolicy|ExactFieldAudienceRequirement)=>{const matching=input.issuanceReceipts.filter(receipt=>receipt.requirementRevisionId===rule.revisionId);if(matching.length!==1)return null;const receipt=matching[0]!,authorization=input.issuanceAuthorizations?.find(value=>value.authorizationId===receipt.authorizationId),governingFamilyPolicy=rule.kind==="exact-field-audience-requirement"?activePolicies.at(0)??null:null;return validateFieldAudienceIssuanceReceipt({receipt,authorization,proposal:rule,governingFamilyPolicy,topology:input.topology,finalRequirement:rule,approvals:input.approvals,referencedAuthorityRevisions:input.historicalAuthorities,historicalRequirementState:[...input.policies,...input.exactRequirements]}).valid?receipt:null;};
  if(override){if(!policy)return finish("unresolved",{comparison:"incomparable"});comparison=compareFieldAudienceRequirements(override.requirements,policy.requirements,input.topology,input.organizationId);if(comparison==="invalid-topology")return finish("invalid-topology");if(comparison==="incomparable")return finish("unresolved",{comparison});const receipt=receiptFor(override);if(!receipt)return finish("invalid-approval",{comparison});return override.disposition==="intentionally-unavailable"?finish("intentionally-unavailable",{basis:"exact-object-override",policyVersion:override.overridePolicyVersion??undefined,comparison,issuanceReceipt:receipt}):finish("resolved",{requirements:override.requirements,basis:"exact-object-override",policyVersion:override.overridePolicyVersion??undefined,comparison,issuanceReceipt:receipt});}
  if(!policy)return finish("unresolved");const receipt=receiptFor(policy);if(!receipt)return finish("invalid-approval");return policy.disposition==="intentionally-unavailable"?finish("intentionally-unavailable",{basis:"field-family-policy",policyVersion:policy.policyVersion,issuanceReceipt:receipt}):policy.disposition==="classified"?finish("resolved",{requirements:policy.requirements,basis:"field-family-policy",policyVersion:policy.policyVersion,issuanceReceipt:receipt}):finish("unresolved");
}
