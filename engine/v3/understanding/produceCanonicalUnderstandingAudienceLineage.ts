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
import {
  validateCanonicalExplanationGovernanceLineage,
} from "../model/judgment/completeOrganizationalExplanations";
import type {
  OrganizationalExplanation,
} from "../model/judgment/organizationalJudgment";
import type { CanonicalMaterialEvidenceSupportV1 } from "../governance/canonicalDerivedArtifactGovernanceAncestry";
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

type ResolvedExplanationLineage = {
  record: CanonicalUnderstandingAudienceLineageRecord;
  evidence: Map<string, {
    attribution: CanonicalEvidenceScopeAttribution;
    sourceBindings: CanonicalSourceScopeBinding[];
    roles: Set<CanonicalAudienceLineageSupport["role"]>;
    reasons: string[];
    completeness: AudienceLineageCompleteness;
  }>;
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

function currentBinding(
  referenced: CanonicalSourceScopeBinding,
  allBindings: readonly CanonicalSourceScopeBinding[],
): CanonicalSourceScopeBinding | null {
  const revisions = allBindings.filter((candidate) =>
    candidate.organizationId === referenced.organizationId &&
    candidate.source.sourceId === referenced.source.sourceId &&
    candidate.source.sourceVersion === referenced.source.sourceVersion &&
    candidate.source.normalizedContentDigest === referenced.source.normalizedContentDigest &&
    candidate.sourceType === referenced.sourceType &&
    candidate.purposeRef === referenced.purposeRef
  );
  const predecessorIds = new Set(
    revisions.map((candidate) => candidate.supersedesBindingId).filter((id): id is string => Boolean(id)),
  );
  const heads = revisions.filter((candidate) => !predecessorIds.has(candidate.bindingId));
  return heads.length === 1 ? heads[0]! : null;
}

function resolveMaterialSupport(input: {
  organizationId: string;
  support: CanonicalMaterialEvidenceSupportV1;
  index: CanonicalScopeLineageIndex;
}): {
  attribution: CanonicalEvidenceScopeAttribution | null;
  sourceBindings: CanonicalSourceScopeBinding[];
  reasons: string[];
  completeness: AudienceLineageCompleteness;
} {
  const reasons: string[] = [];
  let completeness: AudienceLineageCompleteness = "complete";
  const matchingAttributions = input.index.evidenceAttributions.filter(
    (candidate) => candidate.attributionId === input.support.attributionId,
  );
  const attribution = matchingAttributions.length === 1 ? matchingAttributions[0]! : null;
  if (!attribution) {
    reasons.push(matchingAttributions.length ? "ambiguous-evidence-attribution" : "missing-evidence-attribution");
    return { attribution: null, sourceBindings: [], reasons, completeness: "incomplete" };
  }
  if (
    attribution.organizationId !== input.organizationId ||
    attribution.evidenceId !== input.support.canonicalEvidenceId ||
    attribution.evidenceAdmissionId !== input.support.canonicalAdmissionId ||
    attribution.attributionVersion !== input.support.attributionRevision ||
    attribution.digest !== input.support.attributionDigest
  ) {
    reasons.push("canonical-evidence-lineage-mismatch");
    return { attribution, sourceBindings: [], reasons, completeness: "incomplete" };
  }

  const bindingsById = new Map<string, CanonicalSourceScopeBinding[]>();
  for (const binding of input.index.sourceBindings) {
    bindingsById.set(binding.bindingId, [...(bindingsById.get(binding.bindingId) ?? []), binding]);
  }
  const sourceBindings: CanonicalSourceScopeBinding[] = [];
  for (const reference of input.support.sourceBindingRefs) {
    const matches = bindingsById.get(reference.sourceBindingId) ?? [];
    const referenced = matches.length === 1 ? matches[0]! : null;
    if (!referenced) {
      reasons.push(matches.length ? "ambiguous-source-binding" : "missing-source-binding");
      completeness = "incomplete";
      continue;
    }
    if (
      referenced.organizationId !== input.organizationId ||
      referenced.digest !== reference.sourceGovernanceRevision ||
      !attribution.sourceBindingIds.includes(referenced.bindingId)
    ) {
      reasons.push("source-binding-lineage-mismatch");
      completeness = "incomplete";
      continue;
    }
    const current = currentBinding(referenced, input.index.sourceBindings);
    if (!current) {
      reasons.push("current-source-binding-unresolved");
      completeness = "incomplete";
      continue;
    }
    if (current.availability === "revoked") {
      reasons.push("material-source-binding-revoked");
      completeness = "conflicting";
      continue;
    }
    if (!current.purposeRef) {
      reasons.push("source-binding-purpose-unresolved");
      completeness = "incomplete";
      continue;
    }
    sourceBindings.push(current);
  }
  if (!input.support.sourceBindingRefs.length) {
    reasons.push("missing-source-binding-reference");
    completeness = "incomplete";
  }
  return { attribution, sourceBindings, reasons: normalizeStrings(reasons), completeness };
}

function combineCompleteness(values: readonly AudienceLineageCompleteness[]): AudienceLineageCompleteness {
  if (values.includes("conflicting")) return "conflicting";
  if (values.includes("incomplete")) return "incomplete";
  return "complete";
}

function audienceRequirement(
  scope: GovernedScopeRef | null,
  completeness: AudienceLineageCompleteness,
): { requirement: GovernedScopeRef | null; basis: AudienceRequirementBasis } {
  return completeness === "complete" && scope
    ? { requirement: scope, basis: "governed-derivation" }
    : { requirement: null, basis: "unresolved" };
}

function resolveExplanationLineage(input: {
  organizationId: string;
  composition: CanonicalUnderstandingComposition;
  explanation: OrganizationalExplanation;
  index: CanonicalScopeLineageIndex | undefined;
}): ResolvedExplanationLineage {
  const scope = governedScope(input.organizationId, input.explanation.claim.scope);
  const lineage = input.explanation.canonicalGovernanceLineage;
  const evidence = new Map<string, ResolvedExplanationLineage["evidence"] extends Map<string, infer V> ? V : never>();
  const reasons: string[] = [];
  let completeness: AudienceLineageCompleteness = "complete";

  if (input.explanation.organizationId !== input.organizationId) {
    reasons.push("cross-organization-explanation");
    completeness = "incomplete";
  } else if (!scope) {
    reasons.push("subject-scope-unresolved");
    completeness = "incomplete";
  }
  if (!lineage || !input.index) {
    reasons.push(lineage ? "scope-lineage-index-unavailable" : "historical-local-only-lineage");
    completeness = "incomplete";
  } else {
    try {
      validateCanonicalExplanationGovernanceLineage(lineage);
    } catch {
      reasons.push("invalid-canonical-explanation-lineage");
      completeness = "incomplete";
    }
    if (
      lineage.organizationId !== input.organizationId ||
      !lineage.topologyIds.includes(input.index.topologyId)
    ) {
      reasons.push("canonical-explanation-lineage-scope-mismatch");
      completeness = "incomplete";
    }
    const signatures = new Map<string, string>();
    for (const support of lineage.materialSupports) {
      const signatureKey = stable([support.canonicalEvidenceId, support.role]);
      const signature = stable(support);
      const previous = signatures.get(signatureKey);
      if (previous && previous !== signature) {
        reasons.push("duplicate-incompatible-material-lineage");
        completeness = "incomplete";
        continue;
      }
      signatures.set(signatureKey, signature);
      const resolved = resolveMaterialSupport({ organizationId: input.organizationId, support, index: input.index });
      completeness = combineCompleteness([completeness, resolved.completeness]);
      reasons.push(...resolved.reasons);
      if (!resolved.attribution) continue;
      const prior = evidence.get(support.canonicalEvidenceId);
      if (prior && prior.attribution.attributionId !== resolved.attribution.attributionId) {
        reasons.push("ambiguous-canonical-evidence-lineage");
        completeness = "incomplete";
        continue;
      }
      const role: CanonicalAudienceLineageSupport["role"] =
        support.role === "contradictory-material" ? "opposes" : "supports";
      evidence.set(support.canonicalEvidenceId, {
        attribution: resolved.attribution,
        sourceBindings: [...new Map([...(prior?.sourceBindings ?? []), ...resolved.sourceBindings].map((item) => [item.bindingId, item])).values()],
        roles: new Set([...(prior?.roles ?? []), role]),
        reasons: normalizeStrings([...(prior?.reasons ?? []), ...resolved.reasons]),
        completeness: combineCompleteness([prior?.completeness ?? "complete", resolved.completeness]),
      });
    }
  }
  if (!lineage?.materialSupports.length) {
    reasons.push("material-lineage-unavailable");
    completeness = "incomplete";
  }
  const normalizedReasons = normalizeStrings(reasons);
  const requirement = audienceRequirement(scope, completeness);
  const supports = [...evidence.entries()].flatMap(([evidenceId, item]) =>
    [...item.roles].sort(compare).map((role) => ({
      objectType: "canonical-evidence" as const,
      objectId: evidenceId,
      versionBasis: { kind: "canonical-revision" as const, revisionId: item.attribution.digest },
      sourceScopeRefs: normalizeScopes(item.sourceBindings.flatMap((binding) => binding.assertions.map((assertion) => assertion.scope))),
      evidenceScopeRefs: normalizeScopes(item.attribution.assertions.map((assertion) => assertion.scope)),
      attributionRefs: [item.attribution.attributionId],
      sourceBindingRefs: normalizeStrings(item.sourceBindings.map((binding) => binding.bindingId)),
      role,
    })),
  );
  const sourceScopes = normalizeScopes(supports.flatMap((support) => support.sourceScopeRefs));
  const evidenceScopes = normalizeScopes(supports.flatMap((support) => support.evidenceScopeRefs));
  return {
    evidence,
    record: createRecord({
      organizationId: input.organizationId,
      compositionId: input.composition.id,
      compositionRevision: input.composition.revisionId,
      targetObjectKind: "organizational-explanation",
      targetObjectId: input.explanation.id,
      targetVersionBasis: lineage
        ? { kind: "canonical-revision", revisionId: lineage.lineageDigest }
        : { kind: "unresolved" },
      fieldFamily: "explanation-claim",
      subjectScope: scope,
      sourceScopes,
      evidenceScopes,
      audienceRequirement: requirement.requirement,
      audienceRequirementBasis: requirement.basis,
      supports,
      completeness,
      reasons: completeness === "complete" ? [] : normalizedReasons,
    }),
  };
}

function createCompositionLineageRecord(input: {
  organizationId: string;
  composition: CanonicalUnderstandingComposition;
  scope: GovernedScopeRef | null;
  missingExplanationIds: readonly string[];
  explanations: readonly ResolvedExplanationLineage[];
}): CanonicalUnderstandingAudienceLineageRecord {
  const completeness = combineCompleteness([
    ...input.explanations.map((item) => item.record.completeness),
    ...(input.missingExplanationIds.length || !input.scope ? ["incomplete" as const] : []),
  ]);
  const requirement = audienceRequirement(input.scope, completeness);
  return createRecord({
    organizationId: input.organizationId,
    compositionId: input.composition.id,
    compositionRevision: input.composition.revisionId,
    targetObjectKind: "canonical-understanding-composition",
    targetObjectId: input.composition.id,
    targetVersionBasis: { kind: "canonical-revision", revisionId: input.composition.revisionId },
    fieldFamily: "composition-claim",
    subjectScope: input.scope,
    sourceScopes: normalizeScopes(input.explanations.flatMap((item) => item.record.sourceScopes)),
    evidenceScopes: normalizeScopes(input.explanations.flatMap((item) => item.record.evidenceScopes)),
    audienceRequirement: requirement.requirement,
    audienceRequirementBasis: requirement.basis,
    supports: input.explanations.map((item) => ({
      objectType: "organizational-explanation",
      objectId: item.record.targetObjectId,
      versionBasis: item.record.targetVersionBasis,
      sourceScopeRefs: item.record.sourceScopes,
      evidenceScopeRefs: item.record.evidenceScopes,
      attributionRefs: normalizeStrings(item.record.supports.flatMap((support) => support.attributionRefs)),
      sourceBindingRefs: normalizeStrings(item.record.supports.flatMap((support) => support.sourceBindingRefs)),
      role: "supports",
    })),
    completeness,
    reasons: completeness === "complete" ? [] : normalizeStrings([
      ...input.missingExplanationIds.map((id) => `missing-explanation:${id}`),
      ...(!input.scope ? ["subject-scope-unresolved"] : []),
      ...input.explanations.flatMap((item) => item.record.reasons),
    ]),
  });
}

function createCanonicalEvidenceLineageRecords(input: {
  organizationId: string;
  composition: CanonicalUnderstandingComposition;
  scope: GovernedScopeRef | null;
  explanations: readonly ResolvedExplanationLineage[];
}): CanonicalUnderstandingAudienceLineageRecord[] {
  type EvidenceResolution = ResolvedExplanationLineage["evidence"] extends Map<string, infer Value> ? Value : never;
  const evidenceById = new Map<string, EvidenceResolution>();
  for (const explanation of input.explanations) {
    for (const [evidenceId, item] of explanation.evidence) {
      const prior = evidenceById.get(evidenceId);
      if (prior && prior.attribution.attributionId !== item.attribution.attributionId)
        throw new Error("Ambiguous canonical Evidence lineage.");
      evidenceById.set(evidenceId, {
        attribution: item.attribution,
        sourceBindings: [...new Map([...(prior?.sourceBindings ?? []), ...item.sourceBindings].map((binding) => [binding.bindingId, binding])).values()],
        roles: new Set([...(prior?.roles ?? []), ...item.roles]),
        reasons: normalizeStrings([...(prior?.reasons ?? []), ...item.reasons]),
        completeness: combineCompleteness([prior?.completeness ?? "complete", item.completeness]),
      });
    }
  }
  return [...evidenceById.entries()].sort(([left], [right]) => compare(left, right)).map(([evidenceId, item]) => {
    const sourceScopes = normalizeScopes(item.sourceBindings.flatMap((binding) => binding.assertions.map((assertion) => assertion.scope)));
    const evidenceScopes = normalizeScopes(item.attribution.assertions.map((assertion) => assertion.scope));
    const requirement = audienceRequirement(input.scope, item.completeness);
    return createRecord({
      organizationId: input.organizationId,
      compositionId: input.composition.id,
      compositionRevision: input.composition.revisionId,
      targetObjectKind: "canonical-evidence",
      targetObjectId: evidenceId,
      targetVersionBasis: { kind: "canonical-revision", revisionId: item.attribution.digest },
      fieldFamily: "evidence-reference",
      subjectScope: input.scope,
      sourceScopes,
      evidenceScopes,
      audienceRequirement: requirement.requirement,
      audienceRequirementBasis: requirement.basis,
      supports: [...item.roles].sort(compare).map((role) => ({
        objectType: "canonical-evidence",
        objectId: evidenceId,
        versionBasis: { kind: "canonical-revision", revisionId: item.attribution.digest },
        sourceScopeRefs: sourceScopes,
        evidenceScopeRefs: evidenceScopes,
        attributionRefs: [item.attribution.attributionId],
        sourceBindingRefs: normalizeStrings(item.sourceBindings.map((binding) => binding.bindingId)),
        role,
      })),
      completeness: item.completeness,
      reasons: item.completeness === "complete" ? [] : item.reasons,
    });
  });
}

export function produceCanonicalUnderstandingAudienceLineage(input:{organizationId:string;compositions:readonly CanonicalUnderstandingComposition[];explanations:readonly OrganizationalExplanation[];scopeLineageIndex?:CanonicalScopeLineageIndex;scopeTopology?:CanonicalScopeTopology}):CanonicalUnderstandingAudienceLineage{
  if(Object.keys(input).some(k=>!["organizationId","compositions","explanations","scopeLineageIndex","scopeTopology"].includes(k)))throw new Error("Unsupported producer input.");
  if(!exact(input.organizationId))throw new Error("Organization identity is required.");
  if(input.scopeLineageIndex){
    if(!input.scopeTopology)throw new Error("Scope topology is required.");
    const rebuilt=createCanonicalScopeLineageIndex({organizationId:input.organizationId,topology:input.scopeTopology,sourceBindings:input.scopeLineageIndex.sourceBindings,evidenceAttributions:input.scopeLineageIndex.evidenceAttributions,derivedLineages:input.scopeLineageIndex.derivedLineages});
    if(rebuilt.digest!==input.scopeLineageIndex.digest)throw new Error("Invalid scope-lineage index integrity.");
  }
  const explanations=new Map<string,OrganizationalExplanation>();
  for(const explanation of input.explanations){
    if(explanations.has(explanation.id))throw new Error("Duplicate Explanation identity.");
    explanations.set(explanation.id,explanation);
  }
  const records:CanonicalUnderstandingAudienceLineageRecord[]=[];
  for(const c of [...input.compositions].sort((a,b)=>compare(a.id,b.id))){
    if(c.organizationId!==input.organizationId)throw new Error("Cross-organization composition.");
    const scope=governedScope(input.organizationId,c.scope);
    const missing=c.explanationIds.filter(id=>!explanations.has(id));
    const resolvedExplanations:ResolvedExplanationLineage[]=[];
    for(const id of normalizeStrings(c.explanationIds)){
      const e=explanations.get(id);
      if(!e)continue;
      const resolved=resolveExplanationLineage({organizationId:input.organizationId,composition:c,explanation:e,index:input.scopeLineageIndex});
      resolvedExplanations.push(resolved);
      records.push(resolved.record);
    }
    records.push(createCompositionLineageRecord({
      organizationId:input.organizationId,
      composition:c,
      scope,
      missingExplanationIds:missing,
      explanations:resolvedExplanations,
    }));
    records.push(...createCanonicalEvidenceLineageRecords({
      organizationId:input.organizationId,
      composition:c,
      scope,
      explanations:resolvedExplanations,
    }));
  }
  records.sort((a,b)=>compare(a.lineageId,b.lineageId));if(new Set(records.map(r=>r.lineageId)).size!==records.length)throw new Error("Duplicate audience-lineage record identity.");records.forEach(validateCanonicalUnderstandingAudienceLineageRecord);
  const resolvedFamilies=new Set(records.filter(record=>record.completeness==="complete").map(record=>record.fieldFamily));
  const governedFamilies:AudienceLineageFieldFamily[]=["composition-claim","evidence-reference","explanation-claim"];
  const unresolvedFieldFamilies=["audit-reference","condition","confidence","contradiction","evidence-count","evolution","history","investigation","safe-lineage","uncertainty","unknown",...governedFamilies.filter(family=>!resolvedFamilies.has(family))].sort(compare);
  const unsigned={kind:"canonical-understanding-audience-lineage" as const,schemaVersion:CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_VERSION,producerVersion:CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_PRODUCER_VERSION,organizationId:input.organizationId,records,unresolvedFieldFamilies,intentionallyUnavailableFieldFamilies:["evidence-body"],laterDisclosureFieldFamilies:["availability"]};return{...unsigned,digest:hash(unsigned)};
}
export function validateCanonicalUnderstandingAudienceLineage(value:CanonicalUnderstandingAudienceLineage):void{if(value.kind!=="canonical-understanding-audience-lineage"||value.schemaVersion!==CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_VERSION||value.producerVersion!==CANONICAL_UNDERSTANDING_AUDIENCE_LINEAGE_PRODUCER_VERSION)throw new Error("Unsupported audience-lineage contract version.");if(!exact(value.organizationId))throw new Error("Invalid lineage organization.");value.records.forEach(validateCanonicalUnderstandingAudienceLineageRecord);if(new Set(value.records.map(r=>r.lineageId)).size!==value.records.length)throw new Error("Duplicate lineage identity.");if(value.records.some((r,i)=>i>0&&compare(value.records[i-1]!.lineageId,r.lineageId)>0))throw new Error("Noncanonical lineage ordering.");const{digest,...unsigned}=value;if(digest!==hash(unsigned))throw new Error("Invalid audience-lineage digest.");}
