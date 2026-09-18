import "server-only";

import { createHash, randomUUID } from "node:crypto";
import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresOrganizationRuntimeRepository, VercelBlobOrganizationRuntimeRepository } from "../../engine/v3/runtime";

const FOUNDER_BOOTSTRAP_CREATION_KEY = "founder-production-smoke:asterline-software-synthetic-test:v2";

export type OrganizationIdentityGrammar = "ORGANIZATION_COLON_UUID" | "ORGANIZATION_UNDERSCORE_UUID" | "OTHER_RUNTIME_SAFE" | "INVALID";
export type OrganizationIdentityContinuity = "PROVEN_SAME_LOGICAL_ORGANIZATION" | "PROVEN_DIFFERENT_ORGANIZATIONS" | "INSUFFICIENT_EVIDENCE";
export type OrganizationIdentityEvidenceClassification = "PROVES_CONTINUITY" | "SUPPORTS_CONTINUITY" | "NO_CONNECTION" | "CONTRADICTS_CONTINUITY";

type StructuralCounts = Readonly<{
  participantBindings: number;
  organizationAccessGrants: number;
  exactSeriesAccessGrants: number;
  governedSources: number;
  recurringMeetingSeries: number;
  occurrences: number;
  productQuestions: number;
  preparedWork: number;
  meetingPacks: number;
  productWorkflowExists: boolean;
}>;
type Candidate = Readonly<{
  status: "PRESENT" | "ABSENT";
  fingerprint: string | null;
  grammar: OrganizationIdentityGrammar | null;
  organizationIdentityParentExists: boolean;
  creationKeyLineage: "FOUNDER_BOOTSTRAP" | "NON_FOUNDER" | "ABSENT";
  structures: StructuralCounts;
}>;

export type OrganizationIdentityReconciliationReceipt = Readonly<{
  status: "COMPLETE";
  correlationId: string;
  readOnly: true;
  configMatchesLegacyRuntimeMetadata: boolean;
  legacyCandidate: Candidate;
  canonicalFounderCandidate: Candidate;
  canonicalFounderMatch: "YES" | "NO" | "FOUNDER_ABSENT";
  continuityEvidence: readonly Readonly<{ kind: "CONFIG_TO_LEGACY_RUNTIME" | "IDENTITY_EQUALITY" | "SHARED_PARTICIPANT_BINDING" | "FOUNDER_BOOTSTRAP_LINEAGE"; classification: OrganizationIdentityEvidenceClassification }> [];
  continuity: OrganizationIdentityContinuity;
}>;
export type OrganizationIdentityReconciliationFailureReceipt = Readonly<{
  status: "FAILED_CLOSED";
  correlationId: string;
  stage: "PRECHECK" | "LEGACY_RUNTIME_READ" | "CANONICAL_IDENTITY_READ" | "STRUCTURAL_READ";
  errorCode: "ORGANIZATION_IDENTITY_RECONCILIATION_FAILED";
  readOnly: true;
}>;

export class OrganizationIdentityReconciliationOperationError extends Error {
  constructor(readonly receipt: OrganizationIdentityReconciliationFailureReceipt) {
    super("Organization identity reconciliation failed");
  }
}

type IdentityRow = { organization_id: string; creation_key: string };
type CountRow = Record<string, string | number | boolean>;
type Dependencies = Readonly<{
  openSql: () => { end(input: { timeout: number }): Promise<void> };
  legacy: () => { read(organizationId: string): Promise<{ runtime: { metadata: { organizationId: string } } } | null> };
  application: (sql: any) => { read(organizationId: string): Promise<unknown> };
  findIdentity: (sql: any, organizationId: string) => Promise<IdentityRow | null>;
  findFounderIdentity: (sql: any) => Promise<IdentityRow | null>;
  structuralCounts: (sql: any, organizationId: string) => Promise<StructuralCounts>;
}>;

const emptyCounts = (): StructuralCounts => ({ participantBindings: 0, organizationAccessGrants: 0, exactSeriesAccessGrants: 0, governedSources: 0, recurringMeetingSeries: 0, occurrences: 0, productQuestions: 0, preparedWork: 0, meetingPacks: 0, productWorkflowExists: false });
const fingerprint = (value: string): string => createHash("sha256").update(value).digest("hex").slice(0, 16);
const grammar = (value: string): OrganizationIdentityGrammar => /^organization:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u.test(value) ? "ORGANIZATION_COLON_UUID" : /^organization_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u.test(value) ? "ORGANIZATION_UNDERSCORE_UUID" : /^[A-Za-z0-9_-]+$/u.test(value) ? "OTHER_RUNTIME_SAFE" : "INVALID";
const configuredOrganizationId = (environment: NodeJS.ProcessEnv): string | null => {
  const value = environment.DISCOVERY_ALPHA_ORGANIZATION_ID;
  if (!value) return null;
  if (grammar(value) === "INVALID") throw new Error("Organization identity reconciliation is unavailable");
  return value;
};
const count = (value: unknown): number => {
  const result = Number(value);
  if (!Number.isSafeInteger(result) || result < 0) throw new Error("Organization identity reconciliation is unavailable");
  return result;
};
const identity = async (sql: any, organizationId: string): Promise<IdentityRow | null> => {
  const rows = await sql<IdentityRow[]>`SELECT organization_id, creation_key FROM organization_identities WHERE organization_id = ${organizationId}`;
  if (rows.length > 1) throw new Error("Organization identity reconciliation is unavailable");
  return rows[0] ?? null;
};
const founderIdentity = async (sql: any): Promise<IdentityRow | null> => {
  const rows = await sql<IdentityRow[]>`SELECT organization_id, creation_key FROM organization_identities WHERE creation_key = ${FOUNDER_BOOTSTRAP_CREATION_KEY}`;
  if (rows.length > 1) throw new Error("Organization identity reconciliation is unavailable");
  return rows[0] ?? null;
};
const structures = async (sql: any, organizationId: string): Promise<StructuralCounts> => {
  const rows = await sql<CountRow[]>`
    SELECT
      (SELECT count(DISTINCT g.participant_ref) FROM participant_reference_access_grants g WHERE g.organization_id = ${organizationId} AND (EXISTS (SELECT 1 FROM participant_identity_stable_subject_mappings p WHERE p.participant_ref = g.participant_ref) OR EXISTS (SELECT 1 FROM existing_participant_identity_bindings p WHERE p.participant_ref = g.participant_ref))) AS participant_bindings,
      (SELECT count(*) FROM participant_reference_access_grants WHERE organization_id = ${organizationId} AND scope = 'organization') AS organization_access_grants,
      (SELECT count(*) FROM participant_reference_access_grants WHERE organization_id = ${organizationId} AND scope = 'meeting-series') AS exact_series_access_grants,
      (SELECT count(*) FROM chief_source_versions WHERE organization_id = ${organizationId}) AS governed_sources,
      (SELECT count(DISTINCT series_id) FROM chief_workflow_entries WHERE organization_id = ${organizationId} AND series_id IS NOT NULL) AS recurring_meeting_series,
      (SELECT count(DISTINCT conversation_id) FROM chief_workflow_entries WHERE organization_id = ${organizationId} AND conversation_id IS NOT NULL) AS occurrences,
      (SELECT count(DISTINCT question_id) FROM chief_workflow_entries WHERE organization_id = ${organizationId} AND question_id IS NOT NULL) AS product_questions,
      (SELECT count(*) FROM chief_workflow_entries WHERE organization_id = ${organizationId} AND collection = 'preparedWorkPublications') AS prepared_work,
      (SELECT count(*) FROM chief_workflow_entries WHERE organization_id = ${organizationId} AND collection = 'meetingPackPublications') AS meeting_packs,
      EXISTS (SELECT 1 FROM chief_workflow_heads WHERE organization_id = ${organizationId}) AS product_workflow_exists
  `;
  if (rows.length !== 1) throw new Error("Organization identity reconciliation is unavailable");
  const row = rows[0]!;
  return { participantBindings: count(row.participant_bindings), organizationAccessGrants: count(row.organization_access_grants), exactSeriesAccessGrants: count(row.exact_series_access_grants), governedSources: count(row.governed_sources), recurringMeetingSeries: count(row.recurring_meeting_series), occurrences: count(row.occurrences), productQuestions: count(row.product_questions), preparedWork: count(row.prepared_work), meetingPacks: count(row.meeting_packs), productWorkflowExists: row.product_workflow_exists === true };
};
const candidate = async (sql: any, row: IdentityRow | null, counts: Dependencies["structuralCounts"]): Promise<Candidate> => row ? { status: "PRESENT", fingerprint: fingerprint(row.organization_id), grammar: grammar(row.organization_id), organizationIdentityParentExists: true, creationKeyLineage: row.creation_key === FOUNDER_BOOTSTRAP_CREATION_KEY ? "FOUNDER_BOOTSTRAP" : "NON_FOUNDER", structures: await counts(sql, row.organization_id) } : { status: "ABSENT", fingerprint: null, grammar: null, organizationIdentityParentExists: false, creationKeyLineage: "ABSENT", structures: emptyCounts() };

/** A temporary, read-only comparison of the configured legacy Runtime and founder identity. */
export async function reconcileProductionOrganizationIdentity(environment: NodeJS.ProcessEnv = process.env, injected?: Partial<Dependencies>): Promise<OrganizationIdentityReconciliationReceipt> {
  const correlationId = randomUUID();
  let stage: OrganizationIdentityReconciliationFailureReceipt["stage"] = "PRECHECK";
  let sql: any;
  const dependencies: Dependencies = { openSql: () => postgres(requireDiscoveryDatabaseUrl("application", environment), { max: 1 }), legacy: () => new VercelBlobOrganizationRuntimeRepository(), application: connection => new PostgresOrganizationRuntimeRepository(connection), findIdentity: identity, findFounderIdentity: founderIdentity, structuralCounts: structures, ...injected };
  try {
    if (environment.VERCEL_ENV !== "production" || environment.NODE_ENV !== "production") throw new Error("Organization identity reconciliation is unavailable");
    const configuredId = configuredOrganizationId(environment);
    requireDiscoveryDatabaseUrl("application", environment);
    sql = dependencies.openSql();
    stage = "LEGACY_RUNTIME_READ";
    const legacy = configuredId ? await dependencies.legacy().read(configuredId) : null;
    if (configuredId && (!legacy || legacy.runtime.metadata.organizationId !== configuredId)) throw new Error("Organization identity reconciliation is unavailable");
    stage = "CANONICAL_IDENTITY_READ";
    const [legacyIdentity, founder] = await Promise.all([configuredId ? dependencies.findIdentity(sql, configuredId) : Promise.resolve(null), dependencies.findFounderIdentity(sql)]);
    stage = "STRUCTURAL_READ";
    // Constructing the canonical repository makes its read-only owner boundary explicit; no create/replace method is reachable here.
    dependencies.application(sql);
    const legacyCandidate: Candidate = configuredId ? { status: "PRESENT", fingerprint: fingerprint(configuredId), grammar: grammar(configuredId), organizationIdentityParentExists: legacyIdentity !== null, creationKeyLineage: legacyIdentity?.creation_key === FOUNDER_BOOTSTRAP_CREATION_KEY ? "FOUNDER_BOOTSTRAP" : legacyIdentity ? "NON_FOUNDER" : "ABSENT", structures: await dependencies.structuralCounts(sql, configuredId) } : await candidate(sql, null, dependencies.structuralCounts);
    const founderCandidate = await candidate(sql, founder, dependencies.structuralCounts);
    const sameId = Boolean(configuredId && founder?.organization_id === configuredId);
    // Distinct owner-issued identities with distinct durable creation keys are
    // separate canonical organizations unless an explicit continuity owner says otherwise.
    const provablyDifferent = Boolean(founder && legacyIdentity && !sameId && founder.creation_key !== legacyIdentity.creation_key);
    const evidence: OrganizationIdentityReconciliationReceipt["continuityEvidence"] = [
      { kind: "CONFIG_TO_LEGACY_RUNTIME", classification: "PROVES_CONTINUITY" },
      { kind: "IDENTITY_EQUALITY", classification: sameId ? "PROVES_CONTINUITY" : provablyDifferent ? "CONTRADICTS_CONTINUITY" : "NO_CONNECTION" },
      // Per-organization binding counts cannot prove a shared participant reference without an explicit intersection read.
      { kind: "SHARED_PARTICIPANT_BINDING", classification: "NO_CONNECTION" },
      // The founder creation lineage identifies only the founder candidate; it does not connect that candidate to legacy Runtime state.
      { kind: "FOUNDER_BOOTSTRAP_LINEAGE", classification: "NO_CONNECTION" },
    ];
    return { status: "COMPLETE", correlationId, readOnly: true, configMatchesLegacyRuntimeMetadata: Boolean(configuredId), legacyCandidate, canonicalFounderCandidate: founderCandidate, canonicalFounderMatch: founder ? sameId ? "YES" : "NO" : "FOUNDER_ABSENT", continuity: sameId ? "PROVEN_SAME_LOGICAL_ORGANIZATION" : provablyDifferent ? "PROVEN_DIFFERENT_ORGANIZATIONS" : "INSUFFICIENT_EVIDENCE", continuityEvidence: evidence };
  } catch {
    throw new OrganizationIdentityReconciliationOperationError({ status: "FAILED_CLOSED", correlationId, stage, errorCode: "ORGANIZATION_IDENTITY_RECONCILIATION_FAILED", readOnly: true });
  } finally { if (sql) await sql.end({ timeout: 1 }); }
}
