import "server-only";

import { createHash, randomUUID } from "node:crypto";
import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresOrganizationRuntimeRepository, VercelBlobOrganizationRuntimeRepository, type StoredOrganizationRuntime } from "../../engine/v3/runtime";
import { resolveOrganizationIdentityByCreationKey, type OrganizationIdentityV1 } from "./organizationIdentityOwner";

const FOUNDER_CREATION_KEY = "founder-production-smoke:asterline-software-synthetic-test:v2";
const FOUNDER_FINGERPRINT = "778c8abe00afa2ac";
const LEGACY_FINGERPRINT = "964a98c58b24c6c0";

export type FounderRuntimePreservationState =
  | "P1 — POSTGRES_CANONICAL_RUNTIME_PRESENT"
  | "P2 — BLOB_CANONICAL_RUNTIME_PRESENT"
  | "P3 — BOTH_PRESENT_MATCHING"
  | "P4 — BOTH_PRESENT_CONFLICTING"
  | "P5 — NO_CANONICAL_RUNTIME_BUT_BOOTSTRAP_STATE_PRESENT"
  | "P6 — NO_CANONICAL_RUNTIME_OR_DEPENDENT_STATE";

type Stage = "PRECHECK" | "FOUNDER_IDENTITY_READ" | "POSTGRES_RUNTIME_READ" | "BLOB_RUNTIME_READ" | "STRUCTURAL_READ" | "ACCESS_PROVENANCE_READ";
type RuntimeFacts = Readonly<{
  status: "PRESENT" | "ABSENT";
  revision: string | null;
  payloadFingerprint: string | null;
  organizationFingerprintMatchesFounder: boolean;
  validRepositoryDecode: boolean;
  bootstrap: Readonly<{
    present: boolean;
    productQuestionFingerprint: string | null;
    sourceBindingCount: number;
    sourceBindingFingerprint: string | null;
    advancement: "NONE" | "PRESENT";
  }>;
}>;
type StructuralFacts = Readonly<{
  governedSources: number;
  preparedWork: number;
  meetingPacks: number;
  recurringMeetingSeries: number;
  occurrences: number;
  reviewedCarryForwardReferences: number;
  workflowReferences: number;
}>;
type AccessFacts = Readonly<{
  participantBinding: "PRESENT" | "ABSENT";
  organizationAccess: "CURRENT" | "HISTORICAL_OR_REVOKED" | "ABSENT";
  provenance: "FOUNDER_BOOTSTRAP" | "NON_FOUNDER" | "ABSENT";
  exactFounderLineage: boolean;
  referencesCanonicalFounder: boolean;
}>;

export type CanonicalFounderRuntimePreservationReceipt = Readonly<{
  status: "COMPLETE";
  correlationId: string;
  readOnly: true;
  canonicalFounder: Readonly<{ fingerprint: string; resolvedThrough: "ORGANIZATION_IDENTITY_OWNER_CREATION_KEY" }>;
  postgresRuntime: RuntimeFacts;
  blobRuntime: RuntimeFacts;
  structuralState: StructuralFacts;
  accessGrant: AccessFacts;
  preservationState: FounderRuntimePreservationState;
  sameIdBlobImport: Readonly<{ eligible: "YES" | "NO" | "NOT_APPLICABLE"; owner: "importLegacyOrganizationRuntime" | null }>;
  freshRevisionOneInitialization: Readonly<{
    eligible: "YES" | "NO" | "NOT_APPLICABLE";
    owner: "provisionOrganizationUnderstandingBootstrap" | null;
    excludedLaterWrites: readonly ("PARTICIPANT_BINDING" | "ACCESS_GRANT" | "SOURCE_CREATION" | "MEETING_CREATION" | "PREPARED_WORK")[];
  }>;
  configuration: Readonly<{
    configuredOrganizationFingerprint: string | null;
    targetsLegacyCandidate: boolean;
    targetsCanonicalFounder: boolean;
    founderConfigurationSufficientForHealthAndCurrentRuntimeReads: boolean;
    otherOrganizationIdentityVariables: "NONE_DISCOVERED";
    changesApplicationData: false;
  }>;
}>;
export type CanonicalFounderRuntimePreservationFailureReceipt = Readonly<{
  status: "FAILED_CLOSED";
  correlationId: string;
  stage: Stage;
  errorCode: "CANONICAL_FOUNDER_RUNTIME_PRESERVATION_FAILED";
  readOnly: true;
}>;
export class CanonicalFounderRuntimePreservationOperationError extends Error {
  constructor(readonly receipt: CanonicalFounderRuntimePreservationFailureReceipt) { super("Canonical founder Runtime preservation diagnostic failed"); }
}

type Dependencies = Readonly<{
  openSql: () => { end(input: { timeout: number }): Promise<void> };
  resolveFounder: (sql: any, creationKey: string) => Promise<OrganizationIdentityV1 | null>;
  postgresRuntime: (sql: any) => Pick<PostgresOrganizationRuntimeRepository, "read">;
  blobRuntime: () => Pick<VercelBlobOrganizationRuntimeRepository, "read">;
  structuralFacts: (sql: any, organizationId: string) => Promise<StructuralFacts>;
  accessFacts: (sql: any, organizationId: string, creationKey: string) => Promise<AccessFacts>;
  expectedFounderFingerprint: string;
}>;

const fingerprint = (value: string | Uint8Array): string => createHash("sha256").update(value).digest("hex").slice(0, 16);
const count = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) throw new Error("Canonical founder Runtime preservation diagnostic is unavailable");
  return parsed;
};
const runtimeFacts = (organizationId: string, stored: StoredOrganizationRuntime | null): RuntimeFacts => {
  if (!stored) return { status: "ABSENT", revision: null, payloadFingerprint: null, organizationFingerprintMatchesFounder: false, validRepositoryDecode: true, bootstrap: { present: false, productQuestionFingerprint: null, sourceBindingCount: 0, sourceBindingFingerprint: null, advancement: "NONE" } };
  const bootstrap = stored.runtime.memory.initialUnderstandingBootstrap;
  const bindings = stored.runtime.memory.canonicalScopeLineageIndex?.sourceBindings ?? [];
  const advancement = stored.runtime.metadata.investigationCount > 0
    || (stored.runtime.memory.organizationalUnderstandingState.canonicalCompositions?.length ?? 0) > 0
    || stored.runtime.memory.organizationalExplanations.length > 0 ? "PRESENT" : "NONE";
  return {
    status: "PRESENT", revision: stored.revision, payloadFingerprint: fingerprint(stored.bytes),
    organizationFingerprintMatchesFounder: stored.runtime.metadata.organizationId === organizationId, validRepositoryDecode: true,
    bootstrap: { present: Boolean(bootstrap), productQuestionFingerprint: bootstrap ? fingerprint(bootstrap.initialProductQuestionId) : null, sourceBindingCount: bindings.length, sourceBindingFingerprint: bindings.length ? fingerprint(bindings.map(value => value.bindingId).sort().join("\0")) : null, advancement },
  };
};
const structuralFacts = async (sql: any, organizationId: string): Promise<StructuralFacts> => {
  const rows = await sql<Record<string, unknown>[]>`
    SELECT
      (SELECT count(*) FROM chief_source_versions WHERE organization_id = ${organizationId}) AS governed_sources,
      (SELECT count(*) FROM chief_workflow_entries WHERE organization_id = ${organizationId} AND collection = 'preparedWorkPublications') AS prepared_work,
      (SELECT count(*) FROM chief_workflow_entries WHERE organization_id = ${organizationId} AND collection = 'meetingPackPublications') AS meeting_packs,
      (SELECT count(DISTINCT series_id) FROM chief_workflow_entries WHERE organization_id = ${organizationId} AND series_id IS NOT NULL) AS recurring_meeting_series,
      (SELECT count(DISTINCT conversation_id) FROM chief_workflow_entries WHERE organization_id = ${organizationId} AND conversation_id IS NOT NULL) AS occurrences,
      (SELECT count(*) FROM chief_workflow_entries WHERE organization_id = ${organizationId} AND collection ILIKE '%carry%forward%') AS reviewed_carry_forward_references,
      (SELECT count(*) FROM chief_workflow_entries WHERE organization_id = ${organizationId}) AS workflow_references
  `;
  if (rows.length !== 1) throw new Error("Canonical founder Runtime preservation diagnostic is unavailable");
  const row = rows[0]!;
  return { governedSources: count(row.governed_sources), preparedWork: count(row.prepared_work), meetingPacks: count(row.meeting_packs), recurringMeetingSeries: count(row.recurring_meeting_series), occurrences: count(row.occurrences), reviewedCarryForwardReferences: count(row.reviewed_carry_forward_references), workflowReferences: count(row.workflow_references) };
};
const accessFacts = async (sql: any, organizationId: string, creationKey: string): Promise<AccessFacts> => {
  const rows = await sql<Record<string, unknown>[]>`
    SELECT
      EXISTS (SELECT 1 FROM participant_reference_access_grants g WHERE g.organization_id = ${organizationId} AND (EXISTS (SELECT 1 FROM participant_identity_stable_subject_mappings p WHERE p.participant_ref = g.participant_ref) OR EXISTS (SELECT 1 FROM existing_participant_identity_bindings p WHERE p.participant_ref = g.participant_ref))) AS participant_binding,
      EXISTS (SELECT 1 FROM participant_reference_access_grants WHERE organization_id = ${organizationId} AND scope = 'organization' AND status = 'active') AS current_access,
      EXISTS (SELECT 1 FROM participant_reference_access_grants WHERE organization_id = ${organizationId} AND scope = 'organization') AS any_access,
      EXISTS (SELECT 1 FROM participant_reference_access_grants WHERE organization_id = ${organizationId} AND scope = 'organization' AND operation_id = ${`${creationKey}:organization`}) AS founder_provenance
  `;
  if (rows.length !== 1) throw new Error("Canonical founder Runtime preservation diagnostic is unavailable");
  const row = rows[0]!;
  const provenance = row.founder_provenance === true ? "FOUNDER_BOOTSTRAP" : row.any_access === true ? "NON_FOUNDER" : "ABSENT";
  return { participantBinding: row.participant_binding === true ? "PRESENT" : "ABSENT", organizationAccess: row.current_access === true ? "CURRENT" : row.any_access === true ? "HISTORICAL_OR_REVOKED" : "ABSENT", provenance, exactFounderLineage: provenance === "FOUNDER_BOOTSTRAP", referencesCanonicalFounder: row.any_access === true };
};
const hasDependentState = (facts: StructuralFacts, access: AccessFacts) => Object.values(facts).some(value => value > 0) || access.participantBinding === "PRESENT" || access.organizationAccess !== "ABSENT";

/** Temporary protected read-only check before any canonical-founder Runtime initialization. */
export async function inspectCanonicalFounderRuntimePreservation(environment: NodeJS.ProcessEnv = process.env, injected?: Partial<Dependencies>): Promise<CanonicalFounderRuntimePreservationReceipt> {
  const correlationId = randomUUID(); let stage: Stage = "PRECHECK"; let sql: any;
  const dependencies: Dependencies = { openSql: () => postgres(requireDiscoveryDatabaseUrl("application", environment), { max: 1 }), resolveFounder: resolveOrganizationIdentityByCreationKey, postgresRuntime: connection => new PostgresOrganizationRuntimeRepository(connection), blobRuntime: () => new VercelBlobOrganizationRuntimeRepository(), structuralFacts, accessFacts, expectedFounderFingerprint: FOUNDER_FINGERPRINT, ...injected };
  try {
    if (environment.VERCEL_ENV !== "production" || environment.NODE_ENV !== "production") throw new Error("Canonical founder Runtime preservation diagnostic is unavailable");
    const configuredId = environment.DISCOVERY_ALPHA_ORGANIZATION_ID;
    if (configuredId && !/^[A-Za-z0-9_-]+$/u.test(configuredId)) throw new Error("Canonical founder Runtime preservation diagnostic is unavailable");
    requireDiscoveryDatabaseUrl("application", environment); sql = dependencies.openSql();
    stage = "FOUNDER_IDENTITY_READ";
    const founder = await dependencies.resolveFounder(sql, FOUNDER_CREATION_KEY);
    if (!founder || fingerprint(founder.organizationId) !== dependencies.expectedFounderFingerprint) throw new Error("Canonical founder Runtime preservation diagnostic is unavailable");
    stage = "POSTGRES_RUNTIME_READ";
    const postgresFacts = runtimeFacts(founder.organizationId, await dependencies.postgresRuntime(sql).read(founder.organizationId));
    stage = "BLOB_RUNTIME_READ";
    const blobFacts = runtimeFacts(founder.organizationId, await dependencies.blobRuntime().read(founder.organizationId));
    stage = "STRUCTURAL_READ";
    const structures = await dependencies.structuralFacts(sql, founder.organizationId);
    stage = "ACCESS_PROVENANCE_READ";
    const access = await dependencies.accessFacts(sql, founder.organizationId, FOUNDER_CREATION_KEY);
    const preservationState: FounderRuntimePreservationState = postgresFacts.status === "PRESENT" && blobFacts.status === "PRESENT"
      ? postgresFacts.payloadFingerprint === blobFacts.payloadFingerprint ? "P3 — BOTH_PRESENT_MATCHING" : "P4 — BOTH_PRESENT_CONFLICTING"
      : postgresFacts.status === "PRESENT" ? "P1 — POSTGRES_CANONICAL_RUNTIME_PRESENT"
      : blobFacts.status === "PRESENT" ? "P2 — BLOB_CANONICAL_RUNTIME_PRESENT"
      : hasDependentState(structures, access) ? "P5 — NO_CANONICAL_RUNTIME_BUT_BOOTSTRAP_STATE_PRESENT"
      : "P6 — NO_CANONICAL_RUNTIME_OR_DEPENDENT_STATE";
    const fresh = preservationState === "P6 — NO_CANONICAL_RUNTIME_OR_DEPENDENT_STATE";
    return { status: "COMPLETE", correlationId, readOnly: true, canonicalFounder: { fingerprint: FOUNDER_FINGERPRINT, resolvedThrough: "ORGANIZATION_IDENTITY_OWNER_CREATION_KEY" }, postgresRuntime: postgresFacts, blobRuntime: blobFacts, structuralState: structures, accessGrant: access, preservationState, sameIdBlobImport: { eligible: preservationState === "P2 — BLOB_CANONICAL_RUNTIME_PRESENT" ? "YES" : "NOT_APPLICABLE", owner: preservationState === "P2 — BLOB_CANONICAL_RUNTIME_PRESENT" ? "importLegacyOrganizationRuntime" : null }, freshRevisionOneInitialization: { eligible: fresh ? "YES" : "NOT_APPLICABLE", owner: fresh ? "provisionOrganizationUnderstandingBootstrap" : null, excludedLaterWrites: ["PARTICIPANT_BINDING", "ACCESS_GRANT", "SOURCE_CREATION", "MEETING_CREATION", "PREPARED_WORK"] }, configuration: { configuredOrganizationFingerprint: configuredId ? fingerprint(configuredId) : null, targetsLegacyCandidate: configuredId ? fingerprint(configuredId) === LEGACY_FINGERPRINT : false, targetsCanonicalFounder: configuredId === founder.organizationId, founderConfigurationSufficientForHealthAndCurrentRuntimeReads: true, otherOrganizationIdentityVariables: "NONE_DISCOVERED", changesApplicationData: false } };
  } catch {
    throw new CanonicalFounderRuntimePreservationOperationError({ status: "FAILED_CLOSED", correlationId, stage, errorCode: "CANONICAL_FOUNDER_RUNTIME_PRESERVATION_FAILED", readOnly: true });
  } finally { if (sql) await sql.end({ timeout: 1 }); }
}
