export type ModelId = "model-0" | "model-1" | "model-2" | "model-3" | "model-4";
export type Disposition = "direct" | "safe-abstracted" | "withheld" | "unavailable";
export type Gap = "CONTRACT GAP" | "PRODUCER GAP" | "GOVERNANCE GAP" | "INTENTIONALLY UNAVAILABLE";
export type CaseCategory = "scope-relation" | "nested-field" | "lineage-quality" | "authorization-lifecycle" | "determinism";
export type BenchmarkScenario = {
  subjectAuthorized: boolean; audienceRelationDefined: boolean; nestedAuthorityDefined: boolean;
  lineage: "complete" | "incomplete" | "conflicting"; assignment: "active" | "inactive" | "revoked" | "missing" | "malformed";
  sameOrganization: boolean; restrictedSupport: boolean; canonicalAbstraction: boolean; supportRequiredForClaim: boolean;
  roleLabel: string; sourceOrder: "canonical" | "reversed"; supportOrder: "canonical" | "shuffled";
};
export type BenchmarkCase = { id: number; category: CaseCategory; name: string; scenario: BenchmarkScenario };
export type ChannelResult = { channel: string; disposition: Disposition; directLeak: boolean; combinedLeak: boolean };
export type ModelEvaluation = { modelId: ModelId; claimDisposition: Disposition; fieldDisposition: Disposition; channels: ChannelResult[]; usefulContent: boolean; safe: boolean; overWithholds: boolean; gaps: Gap[] };
