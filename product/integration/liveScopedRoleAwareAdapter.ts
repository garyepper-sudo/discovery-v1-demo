import { createHash } from "node:crypto";

import type { AlphaOrganizationAccessRecord, VerifiedConsumerIdentity } from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import { preflightAlphaOrganizationAccess } from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import { resolveScopedGovernanceContext, type GovernedScopeRef } from "../../engine/v3/governance/scopedGovernanceContext";
import type { OrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { grantsFor, resolveSandboxAccessHead, SANDBOX_ORGANIZATION_ID, type ResolvedSandboxPersona } from "../../lib/access/sandboxMultiUserAccess";
import { assertFrontendSafeSerialization } from "../frontend/roleAwareLivingOrganization";
import { readScopedOrganizationalProductProjection, type ScopedProductProjection, type ScopedProjectionRepositorySource } from "./scopedOrganizationalProductProjection";

export const LIVE_ROLE_AWARE_PURPOSE = "living-organization-live-scoped-product";

type LiveScopedProjectionDenied = {
  disposition: "denied";
  projection: null;
  personaLabel: string;
  scopeLabel: string;
  sourceRevision: null;
  sourceRevisionDigest: null;
  runtimeReads: 0;
  corpusScopeGap: true;
};

type LiveScopedProjectionAuthorized = {
  disposition: "authorized";
  projection: ScopedProductProjection;
  personaLabel: string;
  scopeLabel: string;
  sourceRevision: string | null;
  sourceRevisionDigest: string | null;
  runtimeReads: 1;
  corpusScopeGap: true;
};

export type LiveScopedProjectionResult = LiveScopedProjectionDenied | LiveScopedProjectionAuthorized;

const digest = (value: string): string => createHash("sha256").update(value).digest("hex");

export function defaultSandboxScope(persona: ResolvedSandboxPersona): GovernedScopeRef {
  const selected = persona.scopes[0];
  if (!selected) throw new Error("Sandbox persona has no explicit scope.");
  return structuredClone(selected);
}

function sourceForRetainedRuntime(input: {
  organizationId: string;
  sourceRevision: string;
}): ScopedProjectionRepositorySource {
  // The retained accepted Runtime currently has no canonical function/team
  // source-to-scope bindings. Returning no invented items is intentional: the
  // canonical projection remains the sole owner of the bounded empty state.
  return {
    organizationId: input.organizationId,
    sourceRevisionRef: input.sourceRevision,
    items: [],
    metrics: [],
    metricCombinationPolicy: [],
  };
}

export async function readLiveScopedRoleAwareProjection(input: {
  userId: string;
  organizationId: string;
  persona: ResolvedSandboxPersona;
  accessRecords: readonly AlphaOrganizationAccessRecord[];
  runtimeRepository: Pick<OrganizationRuntimeRepository, "read">;
  evaluatedAt: string;
  projectionReader?: typeof readScopedOrganizationalProductProjection;
}): Promise<LiveScopedProjectionResult> {
  const requestedScope = defaultSandboxScope(input.persona);
  const denied = (): LiveScopedProjectionResult => ({
    disposition: "denied",
    projection: null,
    personaLabel: input.persona.label,
    scopeLabel: `${requestedScope.type}:${requestedScope.id}`,
    sourceRevision: null,
    sourceRevisionDigest: null,
    runtimeReads: 0,
    corpusScopeGap: true,
  });
  if (
    input.organizationId !== SANDBOX_ORGANIZATION_ID ||
    input.persona.userId !== input.userId ||
    requestedScope.organizationId !== input.organizationId
  ) return denied();

  let head: AlphaOrganizationAccessRecord | undefined;
  try { head = resolveSandboxAccessHead(input.accessRecords); } catch { return denied(); }
  if (!head || head.status !== "active") return denied();
  const identity: VerifiedConsumerIdentity = {
    consumerId: input.userId,
    provider: "clerk",
    verificationId: `clerk-live:${digest(`${input.userId}:${input.evaluatedAt}`)}`,
    verifiedAt: input.evaluatedAt,
  };
  const preflight = preflightAlphaOrganizationAccess({
    identity,
    organizationId: input.organizationId,
    experience: "organization",
    resolvedAt: input.evaluatedAt,
  }, { findAccessRecords: () => input.accessRecords });
  if (preflight.disposition !== "eligible") return denied();

  const context = resolveScopedGovernanceContext({
    organizationId: input.organizationId,
    subjectId: input.userId,
    requestedScope,
    operation: "understanding:disclose-direct",
    purpose: LIVE_ROLE_AWARE_PURPOSE,
    sensitivity: "standard",
    evaluatedAt: input.evaluatedAt,
    temporal: { mode: "current" },
    serverResolvedAuthority: grantsFor(input.persona, "active", head.createdAt),
  });
  if (context.disposition !== "authorized") return denied();

  const stored = await input.runtimeRepository.read(input.organizationId);
  if (!stored || stored.runtime.metadata.organizationId !== input.organizationId) return denied();
  const source = sourceForRetainedRuntime({ organizationId: input.organizationId, sourceRevision: stored.revision });
  const projection = (input.projectionReader ?? readScopedOrganizationalProductProjection)({
    authenticatedUserId: input.userId,
    organizationId: input.organizationId,
    context,
    repository: { readAuthorizedSource: () => structuredClone(source) },
  });
  assertFrontendSafeSerialization(projection);
  return {
    disposition: "authorized",
    projection,
    personaLabel: input.persona.label,
    scopeLabel: `${requestedScope.type}:${requestedScope.id}`,
    sourceRevision: stored.revision,
    sourceRevisionDigest: digest(stored.revision),
    runtimeReads: 1,
    corpusScopeGap: true,
  };
}
