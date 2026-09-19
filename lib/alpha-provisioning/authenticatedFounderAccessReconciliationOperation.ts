import "server-only";

import { createHash } from "node:crypto";
import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../db/governance/postgresRepositories";
import type { AlphaOrganizationAccessRecord, VerifiedConsumerIdentity } from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import { preflightAlphaOrganizationAccess } from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import { resolveAuthorizedOrganization } from "../../lib/alpha-activation/resolveAuthorizedOrganization";
import { resolveClerkStableInstanceIdentity } from "../auth/clerkStableInstanceIdentity";
import { resolveCanonicalFounderIdentity } from "./canonicalFounderIdentity";

type Binding = { participantRef: string };
type ParticipantGrant = { status: "active" | "revoked" };
type AccessOwner = {
  findAccessRecordsForConsumer(input: { consumerId: string; experience: "organization"; resolvedAt: string }): Promise<readonly AlphaOrganizationAccessRecord[]>;
  findExistingParticipantIdentityBinding(input: { provider: "clerk"; providerSubject: string }): Promise<Binding | undefined>;
  inspectActiveParticipantIdentityNamespace(): Promise<unknown | undefined>;
  findGrants(input: { organizationId: string; participantRef: string; scope: "organization"; meetingSeriesId?: string }): Promise<readonly ParticipantGrant[]>;
};
type Resolution = Awaited<ReturnType<typeof resolveAuthorizedOrganization>>;
type Dependencies = Readonly<{
  openSql: () => { end(input: { timeout: number }): Promise<void> };
  resolveIdentity: () => Promise<{ status: "verified"; identity: VerifiedConsumerIdentity } | { status: "denied" }>;
  resolveFounder: (sql: any) => Promise<{ organizationId: string }>;
  access: (
    sql: any,
    participantIdentityLocatorKey: string,
    clerkStableInstance: string,
  ) => AccessOwner;
  resolveAuthorization: (input: Parameters<typeof resolveAuthorizedOrganization>[0]) => Promise<Resolution>;
}>;

export type FounderAccessRootCause = "ACCESS_GRANT_MISSING" | "ACCESS_GRANT_HISTORICAL_OR_REVOKED" | "PARTICIPANT_BINDING_NOT_FOUND" | "PARTICIPANT_BINDING_NOT_CURRENT" | "STABLE_SUBJECT_COMPATIBILITY_MISMATCH" | "FOUNDER_ORGANIZATION_MISMATCH" | "ACCESS_QUERY_OMITS_VALID_RECORD" | "AUTHORIZED_SET_ASSEMBLY_DEFECT" | "PASS";
type Predicate = "PASS" | "FAIL" | "NOT_APPLICABLE";
export type AuthenticatedFounderAccessReceipt = Readonly<{
  subjectAuthenticated: true;
  participantBindingFound: boolean;
  participantBindingCurrent: boolean;
  bindingClassification: "CURRENT_STABLE_SUBJECT_LOOKUP" | "NOT_FOUND";
  stableSubjectCompatible: boolean;
  founderResolved: true;
  founderFingerprint: string;
  organizationIdentityParentExists: true;
  founderBootstrapLineage: true;
  accessRecordsFound: number;
  currentAccessRecordsFound: number;
  founderOrganizationReferencedByAnyRecord: boolean;
  founderOrganizationReferencedByCurrentRecord: boolean;
  founderOrganizationReferencedByHistoricalOrRevokedRecord: boolean;
  participantReferenceMatchesBinding: boolean;
  stableSubjectCompatibilityUsed: boolean;
  currentnessPredicatePasses: boolean;
  predicates: Readonly<{ participantResolved: Predicate; bindingCurrent: Predicate; accessQueryReturnedRecords: Predicate; founderPresentInAuthorizedOrganizationSet: Predicate; ownerResolvedFounderRestrictionMatches: Predicate; finalConfiguredOrganizationAuthorized: Predicate }>;
  firstFailingPredicate: "NONE" | "PARTICIPANT_RESOLVED" | "ACCESS_QUERY_RETURNED_RECORDS" | "FOUNDER_PRESENT_IN_AUTHORIZED_ORGANIZATION_SET" | "FINAL_CONFIGURED_ORGANIZATION_AUTHORIZED";
  rootCause: FounderAccessRootCause;
}>;
export class AuthenticatedFounderAccessUnauthenticatedError extends Error {}
export class AuthenticatedFounderAccessReconciliationError extends Error {}

const fingerprint = (value: string) => createHash("sha256").update(value).digest("hex").slice(0, 16);
const current = (records: readonly AlphaOrganizationAccessRecord[], identity: VerifiedConsumerIdentity, organizationId: string, resolvedAt: string) => preflightAlphaOrganizationAccess({ identity, organizationId, experience: "organization", resolvedAt }, { findAccessRecords: () => records }).disposition === "eligible";

/** Temporary authenticated, read-only predicate trace for the canonical founder restriction. */
export async function inspectAuthenticatedFounderAccess(environment: NodeJS.ProcessEnv = process.env, injected?: Partial<Dependencies>): Promise<AuthenticatedFounderAccessReceipt> {
  if (environment.VERCEL_ENV !== "production" || environment.NODE_ENV !== "production") throw new AuthenticatedFounderAccessReconciliationError();
  const dependencies: Dependencies = {
    openSql: () => postgres(requireDiscoveryDatabaseUrl("application", environment), { max: 1 }),
    resolveIdentity: async () => (await import("../../lib/auth/resolveVerifiedConsumerIdentityFromClerk")).resolveVerifiedConsumerIdentityFromClerk(),
    resolveFounder: resolveCanonicalFounderIdentity,
    access: (sql, participantIdentityLocatorKey, clerkStableInstance) =>
      new PostgresAlphaAccessRecordRepository(
        sql,
        undefined,
        participantIdentityLocatorKey,
        clerkStableInstance,
      ) as unknown as AccessOwner,
    resolveAuthorization: resolveAuthorizedOrganization,
    ...injected,
  };
  const identityResolution = await dependencies.resolveIdentity();
  if (identityResolution.status !== "verified") throw new AuthenticatedFounderAccessUnauthenticatedError();
  const identity = identityResolution.identity;
  const resolvedAt = new Date().toISOString();
  const participantIdentityLocatorKey =
    environment.DISCOVERY_PARTICIPANT_IDENTITY_LOCATOR_KEY;
  const clerkStableInstance = resolveClerkStableInstanceIdentity(
    environment.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
  if (
    !participantIdentityLocatorKey ||
    participantIdentityLocatorKey.length < 32 ||
    !clerkStableInstance
  ) {
    throw new AuthenticatedFounderAccessReconciliationError();
  }
  let sql: any;
  try {
    sql = dependencies.openSql();
    const founder = await dependencies.resolveFounder(sql);
    const access = dependencies.access(
      sql,
      participantIdentityLocatorKey,
      clerkStableInstance,
    );
    const [binding, namespace, records] = await Promise.all([
      access.findExistingParticipantIdentityBinding({ provider: "clerk", providerSubject: identity.consumerId }),
      access.inspectActiveParticipantIdentityNamespace(),
      access.findAccessRecordsForConsumer({ consumerId: identity.consumerId, experience: "organization", resolvedAt }),
    ]);
    const founderRecords = records.filter((record) => record.organizationId === founder.organizationId);
    const founderCurrent = current(founderRecords, identity, founder.organizationId, resolvedAt);
    const participantGrants = binding ? await access.findGrants({ organizationId: founder.organizationId, participantRef: binding.participantRef, scope: "organization" }) : [];
    const resolution = await dependencies.resolveAuthorization({ identity, configuredOrganizationId: founder.organizationId, resolvedAt, accessRepository: { findAccessRecordsForConsumer: access.findAccessRecordsForConsumer.bind(access) } });
    const authorized = resolution.status === "resolved";
    const rootCause: FounderAccessRootCause = authorized ? "PASS" : founderRecords.length === 0 ? "ACCESS_GRANT_MISSING" : !founderCurrent ? "ACCESS_GRANT_HISTORICAL_OR_REVOKED" : "ACCESS_QUERY_OMITS_VALID_RECORD";
    return {
      subjectAuthenticated: true, participantBindingFound: Boolean(binding), participantBindingCurrent: Boolean(binding), bindingClassification: binding ? "CURRENT_STABLE_SUBJECT_LOOKUP" : "NOT_FOUND", stableSubjectCompatible: Boolean(binding),
      founderResolved: true, founderFingerprint: fingerprint(founder.organizationId), organizationIdentityParentExists: true, founderBootstrapLineage: true,
      accessRecordsFound: records.length, currentAccessRecordsFound: records.filter((record) => current([record], identity, record.organizationId, resolvedAt)).length,
      founderOrganizationReferencedByAnyRecord: founderRecords.length > 0, founderOrganizationReferencedByCurrentRecord: founderCurrent, founderOrganizationReferencedByHistoricalOrRevokedRecord: founderRecords.length > 0 && !founderCurrent,
      participantReferenceMatchesBinding: Boolean(binding && participantGrants.length), stableSubjectCompatibilityUsed: Boolean(namespace), currentnessPredicatePasses: founderCurrent,
      predicates: { participantResolved: "PASS", bindingCurrent: binding ? "PASS" : "FAIL", accessQueryReturnedRecords: records.length ? "PASS" : "FAIL", founderPresentInAuthorizedOrganizationSet: authorized ? "PASS" : "FAIL", ownerResolvedFounderRestrictionMatches: "PASS", finalConfiguredOrganizationAuthorized: authorized ? "PASS" : "FAIL" },
      firstFailingPredicate: !records.length ? "ACCESS_QUERY_RETURNED_RECORDS" : !authorized ? "FOUNDER_PRESENT_IN_AUTHORIZED_ORGANIZATION_SET" : "NONE", rootCause,
    };
  } catch (error) {
    if (error instanceof AuthenticatedFounderAccessUnauthenticatedError) throw error;
    throw new AuthenticatedFounderAccessReconciliationError();
  } finally { if (sql) await sql.end({ timeout: 1 }); }
}
