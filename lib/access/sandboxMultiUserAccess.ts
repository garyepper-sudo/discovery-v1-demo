import { createHash } from "node:crypto";

import type { AlphaOrganizationAccessRecord } from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import {
  resolveScopedGovernanceContext,
  type GovernedScopeRef,
  type ScopedAuthorityGrant,
  type ScopedGovernanceOperation,
} from "../../engine/v3/governance/scopedGovernanceContext";
import { validateOnboardingTestEnvironment } from "../environment/discoveryEnvironment";

export const SANDBOX_ORGANIZATION_ID = "sandbox-northstar-implementation-services-001";
export type SandboxPersonaKey = "sandbox-ceo" | "sandbox-director" | "sandbox-manager";

export function nextSandboxLifecycleTime(createdAt: string): string {
  const value = Date.parse(createdAt);
  if (!Number.isFinite(value)) throw new Error("Invalid sandbox lifecycle head time.");
  return new Date(value + 60_000).toISOString();
}

type Persona = {
  key: SandboxPersonaKey;
  label: string;
  environmentKey: string;
  scopes: readonly GovernedScopeRef[];
  operations: readonly ScopedGovernanceOperation[];
};

const scope = (type: GovernedScopeRef["type"], id: string): GovernedScopeRef => ({
  organizationId: SANDBOX_ORGANIZATION_ID, type, id,
});

export const SANDBOX_PERSONAS: readonly Persona[] = [
  {
    key: "sandbox-ceo", label: "Northstar CEO", environmentKey: "DISCOVERY_SANDBOX_CEO_USER_ID",
    scopes: [scope("organization", SANDBOX_ORGANIZATION_ID)],
    operations: ["understanding:disclose-direct", "understanding:disclose-derived", "understanding:read-historical", "understanding:read-historical-metadata"],
  },
  {
    key: "sandbox-director", label: "Northstar Engineering Director", environmentKey: "DISCOVERY_SANDBOX_DIRECTOR_USER_ID",
    scopes: [scope("function", "engineering"), scope("initiative", "northstar-cross-functional-delivery")],
    operations: ["understanding:disclose-direct", "understanding:disclose-derived", "understanding:read-historical", "understanding:read-historical-metadata", "contribution:request-evidence-candidacy"],
  },
  {
    key: "sandbox-manager", label: "Northstar Platform Manager", environmentKey: "DISCOVERY_SANDBOX_MANAGER_USER_ID",
    scopes: [scope("team", "platform-delivery"), scope("initiative", "northstar-cross-functional-delivery")],
    operations: ["understanding:disclose-direct", "understanding:read-historical-metadata", "contribution:submit", "contribution:request-evidence-candidacy"],
  },
] as const;

export type ResolvedSandboxPersona = Persona & { userId: string };

function exact(value: string | undefined, label: string): string {
  if (!value || !/^user_[A-Za-z0-9]+$/.test(value)) throw new Error(`Invalid ${label}.`);
  return value;
}

export function resolveSandboxPersonas(environment: Readonly<Record<string, string | undefined>> = process.env): readonly ResolvedSandboxPersona[] {
  validateOnboardingTestEnvironment(environment);
  const resolved = SANDBOX_PERSONAS.map((persona) => ({ ...persona, userId: exact(environment[persona.environmentKey], persona.environmentKey) }));
  if (new Set(resolved.map(({ userId }) => userId)).size !== resolved.length) throw new Error("Sandbox personas require three distinct Clerk development user IDs.");
  return resolved;
}

export function resolvePersonaForSignedInUser(userId: string, environment: Readonly<Record<string, string | undefined>> = process.env): ResolvedSandboxPersona | undefined {
  return resolveSandboxPersonas(environment).find((persona) => persona.userId === userId);
}

export function grantsFor(persona: ResolvedSandboxPersona, status: "active" | "revoked", at = "2026-01-01T00:00:00.000Z"): readonly ScopedAuthorityGrant[] {
  return persona.scopes.map((item) => ({
    authorityRef: `sandbox-access:${persona.key}:${item.type}:${item.id}`,
    policyRef: "development-sandbox-multi-user-access:v1",
    organizationId: SANDBOX_ORGANIZATION_ID,
    subjectId: persona.userId,
    scope: item,
    operations: [...persona.operations],
    sensitivity: ["standard"],
    relationship: item.type === "initiative" ? "initiative-member" : item.type === "organization" ? "direct" : "descendant",
    status,
    validFrom: at,
    ...(status === "revoked" ? { revokedAt: at } : {}),
  }));
}

export function authorizeSandboxRequest(input: { persona: ResolvedSandboxPersona; status: "active" | "revoked"; requestedScope: GovernedScopeRef; operation: ScopedGovernanceOperation; organizationId?: string }) {
  return resolveScopedGovernanceContext({
    organizationId: input.organizationId ?? SANDBOX_ORGANIZATION_ID,
    subjectId: input.persona.userId,
    requestedScope: input.requestedScope,
    operation: input.operation,
    purpose: "living-organization-sandbox-role-scoped-sign-in",
    sensitivity: "standard",
    evaluatedAt: "2026-08-04T12:00:00.000Z",
    temporal: { mode: "current" },
    serverResolvedAuthority: grantsFor(input.persona, input.status),
  });
}

const stable = (value: unknown): string => JSON.stringify(value, Object.keys(value as object).sort());

export function resolveSandboxAccessHead(records: readonly AlphaOrganizationAccessRecord[]): AlphaOrganizationAccessRecord | undefined {
  if (records.length === 0) return undefined;
  const byId = new Map(records.map((record) => [record.accessRecordId, record] as const));
  if (byId.size !== records.length) throw new Error("Duplicate sandbox access record identity.");
  const predecessorIds = new Set<string>();
  for (const record of records) {
    if (!record.supersedesAccessRecordId) continue;
    const predecessor = byId.get(record.supersedesAccessRecordId);
    if (!predecessor || predecessorIds.has(record.supersedesAccessRecordId)) throw new Error("Forked or incomplete sandbox access lineage.");
    predecessorIds.add(record.supersedesAccessRecordId);
    if (
      predecessor.consumerId !== record.consumerId ||
      predecessor.organizationId !== record.organizationId ||
      predecessor.policyId !== record.policyId ||
      predecessor.policyVersion !== record.policyVersion ||
      predecessor.relationship !== record.relationship ||
      predecessor.scope.type !== record.scope.type ||
      predecessor.scope.organizationId !== record.scope.organizationId ||
      predecessor.supportedExperiences.join("\0") !== record.supportedExperiences.join("\0") ||
      Date.parse(record.createdAt) < Date.parse(predecessor.createdAt)
    ) throw new Error("Sandbox access lineage changes canonical identity.");
  }
  const heads = records.filter((record) => !predecessorIds.has(record.accessRecordId));
  if (heads.length !== 1) throw new Error("Sandbox access lineage must have one current head.");
  const visited = new Set<string>();
  let current: AlphaOrganizationAccessRecord | undefined = heads[0];
  while (current) {
    if (visited.has(current.accessRecordId)) throw new Error("Cyclic sandbox access lineage.");
    visited.add(current.accessRecordId);
    current = current.supersedesAccessRecordId ? byId.get(current.supersedesAccessRecordId) : undefined;
  }
  if (visited.size !== records.length) throw new Error("Disconnected sandbox access lineage.");
  return heads[0];
}

export function safeAssignment(persona: ResolvedSandboxPersona, records: readonly AlphaOrganizationAccessRecord[]) {
  const active = resolveSandboxAccessHead(records)?.status === "active";
  const safe = {
    personaKey: persona.key,
    displayLabel: persona.label,
    userReference: `${persona.userId.slice(0, 8)}…${persona.userId.slice(-4)}`,
    organizationId: SANDBOX_ORGANIZATION_ID,
    scopeIds: active ? persona.scopes.map(({ type, id }) => `${type}:${id}`) : [],
    operationIds: active ? [...persona.operations] : [],
    status: active ? "active" as const : "revoked" as const,
    revoked: !active,
  };
  return { ...safe, assignmentDigest: createHash("sha256").update(stable(safe)).digest("hex") };
}
