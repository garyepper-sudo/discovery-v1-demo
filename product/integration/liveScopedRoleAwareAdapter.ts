import { createHash } from "node:crypto";

import {
  buildAlphaCanonicalAuthorityReceipt,
  preflightAlphaOrganizationAccess,
  resolveAlphaAllowlistDisclosureDecision,
  type AlphaOrganizationAccessRecord,
  type VerifiedConsumerIdentity,
} from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import { resolveScopedGovernanceContext, type GovernedScopeRef } from "../../engine/v3/governance/scopedGovernanceContext";
import {
  readCanonicalScopeLineageTopology,
  resolveCurrentSourceScopeBinding,
} from "../../engine/v3/governance/canonicalScopeLineage";
import type { OrganizationalUnderstandingProjection } from "../../engine/v3/projection/organizationalUnderstandingProjection";
import type { OrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { produceCanonicalUnderstandingAudienceLineage } from "../../engine/v3/understanding/produceCanonicalUnderstandingAudienceLineage";
import { resolveCanonicalUnderstandingCurrentEligibility } from "../../engine/v3/understanding/resolveCanonicalUnderstandingCurrentEligibility";
import { grantsFor, resolveSandboxAccessHead, SANDBOX_ORGANIZATION_ID, type ResolvedSandboxPersona } from "../../lib/access/sandboxMultiUserAccess";
import { composeActivatedYourOrganization } from "../../components/product-shell/data/composeActivatedYourOrganization";
import { buildRoleAwareDiscoveryExperienceView } from "../../components/product-shell/data/buildDiscoveryExperienceView";
import { assertFrontendSafeSerialization } from "../frontend/roleAwareLivingOrganization";
import { readScopedOrganizationalProductProjection, type ScopedProductProjection } from "./scopedOrganizationalProductProjection";
import { buildGenericScopedProductSource } from "./runtimeToScopedProductSource";

export const LIVE_ROLE_AWARE_PURPOSE = "living-organization-live-scoped-product";

type AuthorizedComposition = Extract<ReturnType<typeof composeActivatedYourOrganization>, { status: "available" }>;
export type LiveCanonicalPresentation = AuthorizedComposition["view"];

type LiveScopedProjectionDenied = {
  disposition: "denied";
};

type LiveScopedProjectionAuthorized = {
  disposition: "authorized";
  canonicalProjection: OrganizationalUnderstandingProjection;
  genericProjection: ScopedProductProjection;
  experience: ReturnType<typeof buildRoleAwareDiscoveryExperienceView>;
  personaLabel: string;
  scopeLabel: string;
  sourceRevision: string;
  sourceRevisionDigest: string;
};

export type LiveScopedProjectionResult = LiveScopedProjectionDenied | LiveScopedProjectionAuthorized;
const digest = (value: string): string => createHash("sha256").update(value).digest("hex");

export function defaultSandboxScope(persona: ResolvedSandboxPersona): GovernedScopeRef {
  const selected = persona.scopes[0];
  if (!selected) throw new Error("Sandbox persona has no explicit scope.");
  return structuredClone(selected);
}

export async function readLiveScopedRoleAwareProjection(input: {
  userId: string;
  organizationId: string;
  persona: ResolvedSandboxPersona;
  accessRecords: readonly AlphaOrganizationAccessRecord[];
  runtimeRepository: Pick<OrganizationRuntimeRepository, "read">;
  evaluatedAt: string;
}): Promise<LiveScopedProjectionResult> {
  const requestedScope = defaultSandboxScope(input.persona);
  const denied = (): LiveScopedProjectionDenied => ({ disposition: "denied" });
  if (input.organizationId !== SANDBOX_ORGANIZATION_ID || input.persona.userId !== input.userId || requestedScope.organizationId !== input.organizationId) return denied();

  let head: AlphaOrganizationAccessRecord | undefined;
  try { head = resolveSandboxAccessHead(input.accessRecords); } catch { return denied(); }
  if (!head || head.status !== "active") return denied();
  const identity: VerifiedConsumerIdentity = {
    consumerId: input.userId, provider: "clerk",
    verificationId: `clerk-live:${digest(`${input.userId}:${input.evaluatedAt}`)}`,
    verifiedAt: input.evaluatedAt,
  };
  const preflight = preflightAlphaOrganizationAccess({
    identity, organizationId: input.organizationId, experience: "organization", resolvedAt: input.evaluatedAt,
  }, { findAccessRecords: () => input.accessRecords });
  if (preflight.disposition !== "eligible") return denied();
  const context = resolveScopedGovernanceContext({
    organizationId: input.organizationId, subjectId: input.userId, requestedScope,
    operation: "understanding:disclose-direct", purpose: LIVE_ROLE_AWARE_PURPOSE,
    sensitivity: "standard", evaluatedAt: input.evaluatedAt, temporal: { mode: "current" },
    serverResolvedAuthority: grantsFor(input.persona, "active", head.createdAt),
  });
  if (context.disposition !== "authorized") return denied();

  const stored = await input.runtimeRepository.read(input.organizationId);
  if (!stored || stored.runtime.metadata.organizationId !== input.organizationId) return denied();
  const compositions = stored.runtime.memory.organizationalUnderstandingState.canonicalCompositions ?? [];
  const scopeLineageIndex = stored.runtime.memory.canonicalScopeLineageIndex;
  const topology = scopeLineageIndex
    ? readCanonicalScopeLineageTopology(scopeLineageIndex)
    : undefined;
  if (!scopeLineageIndex || !topology) return denied();
  const audienceLineage = produceCanonicalUnderstandingAudienceLineage({
    organizationId: input.organizationId,
    compositions,
    explanations: stored.runtime.memory.organizationalExplanations,
    scopeLineageIndex,
    scopeTopology: topology,
  });
  const materialSupports = stored.runtime.memory.organizationalExplanations.flatMap(
    (explanation) => explanation.canonicalGovernanceLineage?.materialSupports ?? [],
  );
  const lineagePolicyVersion = stored.runtime.memory.theories
    .map((theory) => theory.canonicalGovernanceAncestry?.lineagePolicyVersion)
    .find((value) => Boolean(value)) ?? "unavailable";
  const currentEligibility = resolveCanonicalUnderstandingCurrentEligibility({
    contractVersion: "1",
    organizationId: input.organizationId,
    subjectId: input.userId,
    purposeRef: context.purpose,
    requestedScope,
    sensitivity: context.sensitivity,
    evaluatedAt: input.evaluatedAt,
    authorizationContextRef: context.contextId,
    canonicalUnderstandingRevision: stored.revision,
    audienceLineageDigest: audienceLineage.digest,
    lineagePolicyVersion,
    materialSupports,
  }, {
    authorization: context,
    isPurposeCompatible: ({ requestedPurpose, materialPurposeRefs }) =>
      requestedPurpose === LIVE_ROLE_AWARE_PURPOSE && materialPurposeRefs.length > 0,
    resolveCurrentSourceBinding: ({
      organizationId,
      historicalBindingId,
      historicalGovernanceRevisionRef,
      evaluatedAt,
    }) => {
      const historical = scopeLineageIndex.sourceBindings.find(
        (binding) => binding.bindingId === historicalBindingId,
      );
      if (
        !historical ||
        historical.organizationId !== organizationId ||
        historical.digest !== historicalGovernanceRevisionRef
      ) return undefined;
      const revisions = scopeLineageIndex.sourceBindings.filter(
        (binding) =>
          binding.organizationId === organizationId &&
          binding.source.sourceId === historical.source.sourceId,
      );
      const current = resolveCurrentSourceScopeBinding(revisions, evaluatedAt);
      if (!current) return undefined;
      return {
        organizationId,
        historicalBindingId,
        currentBindingRevisionRef: current.bindingId,
        currentGovernanceRevisionRef: current.digest,
        availability: current.availability ?? "unavailable",
        purposeRefs: current.purposeRef ? [current.purposeRef] : [],
        scopes: current.assertions.map((assertion) => assertion.scope),
      };
    },
  });
  if (currentEligibility.disposition !== "eligible") return denied();
  let resolution;
  try {
    resolution = resolveAlphaAllowlistDisclosureDecision({
      identity, organizationId: input.organizationId, experience: "organization",
      requestedCompositions: compositions,
      authorityReceipts: compositions.flatMap((composition) => {
        const receipt = buildAlphaCanonicalAuthorityReceipt(composition);
        return receipt ? [receipt] : [];
      }),
      resolvedAt: input.evaluatedAt, preflight,
    });
  } catch { return denied(); }
  if (resolution.provenance.disposition !== "disclosed" && resolution.provenance.disposition !== "partially-disclosed") return denied();

  const canonical = composeActivatedYourOrganization({ runtime: stored.runtime, identity, resolution, resolvedAt: input.evaluatedAt });
  if (canonical.status !== "available") return denied();
  const genericSource = buildGenericScopedProductSource({
    stored,
    organizationId: input.organizationId,
    requestedScope,
    currentEligibility,
  });
  const genericProjection = readScopedOrganizationalProductProjection({
    authenticatedUserId: input.userId, organizationId: input.organizationId, context,
    repository: { readAuthorizedSource: () => structuredClone(genericSource) },
  });
  const result: LiveScopedProjectionAuthorized = {
    disposition: "authorized", canonicalProjection: canonical.projection,
    genericProjection,
    experience: buildRoleAwareDiscoveryExperienceView({
      organizationId: canonical.projection.organizationId,
      displayRole: input.persona.label,
      view: canonical.view,
    }),
    personaLabel: input.persona.label,
    scopeLabel: `${requestedScope.type}:${requestedScope.id}`,
    sourceRevision: stored.revision, sourceRevisionDigest: digest(stored.revision),
  };
  assertFrontendSafeSerialization(result.canonicalProjection);
  assertFrontendSafeSerialization(result.genericProjection);
  assertFrontendSafeSerialization(result.experience);
  return result;
}
