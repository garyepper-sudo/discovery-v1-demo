import { createHash } from "node:crypto";

import {
  createCanonicalScopeTopology,
  createCanonicalSourceScopeBinding,
  type CanonicalSourceScopeBinding,
  type SourceScopeAssertion,
} from "../../../engine/v3/governance/canonicalScopeLineage";
import type { GovernedScopeRef } from "../../../engine/v3/governance/scopedGovernanceContext";
import { SANDBOX_ORGANIZATION_ID, sandboxManifest } from "./manifest";

export const NORTHSTAR_SCOPE_BINDING_VERSION = "1" as const;
export const NORTHSTAR_TOPOLOGY_EFFECTIVE_AT = "2026-01-01T00:00:00.000Z";

const compareText = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

const scope = (type: GovernedScopeRef["type"], id: string): GovernedScopeRef => ({
  organizationId: SANDBOX_ORGANIZATION_ID,
  type,
  id,
});

export const NORTHSTAR_SCOPES = {
  organization: scope("organization", SANDBOX_ORGANIZATION_ID),
  engineering: scope("function", "engineering"),
  platformDelivery: scope("team", "platform-delivery"),
  deliveryInitiative: scope("initiative", "northstar-cross-functional-delivery"),
} as const;

export const northstarScopeTopology = createCanonicalScopeTopology({
  organizationId: SANDBOX_ORGANIZATION_ID,
  topologyVersion: 1,
  effectiveAt: NORTHSTAR_TOPOLOGY_EFFECTIVE_AT,
  nodes: [
    { ...NORTHSTAR_SCOPES.organization, label: "Northstar Implementation Services" },
    { ...NORTHSTAR_SCOPES.engineering, label: "Engineering" },
    { ...NORTHSTAR_SCOPES.platformDelivery, label: "Platform Delivery" },
    { ...NORTHSTAR_SCOPES.deliveryInitiative, label: "Cross-functional delivery" },
  ],
  relationships: [
    { kind: "contains", from: NORTHSTAR_SCOPES.organization, to: NORTHSTAR_SCOPES.engineering },
    { kind: "contains", from: NORTHSTAR_SCOPES.engineering, to: NORTHSTAR_SCOPES.platformDelivery },
    { kind: "initiative-relates", from: NORTHSTAR_SCOPES.deliveryInitiative, to: NORTHSTAR_SCOPES.engineering },
    { kind: "initiative-relates", from: NORTHSTAR_SCOPES.deliveryInitiative, to: NORTHSTAR_SCOPES.platformDelivery },
  ],
});

export type NorthstarControlDisposition =
  | "not-a-control"
  | "deduplicated-exact"
  | "deduplicated-formatting"
  | "excluded-unrelated"
  | "excluded-external"
  | "excluded-nonmaterial";

export type NorthstarSourceScopeRecord = {
  documentId: string;
  sourceId: string;
  sourceVersion: string;
  normalizedContentDigest: string;
  semanticPurpose: string;
  assertions: SourceScopeAssertion[];
  rawDetail: "organization" | "function" | "team" | "initiative" | "excluded-control";
  upwardAggregation: "bounded-context" | "safe-aggregation" | "local-retention" | "not-applicable";
  controlDisposition: NorthstarControlDisposition;
  rationale: string;
  binding: CanonicalSourceScopeBinding | null;
};

const assertionsByDocument: Readonly<Record<string, readonly SourceScopeAssertion[]>> = {
  "foundation-overview": [{ relationship: "origin", scope: NORTHSTAR_SCOPES.organization }],
  "foundation-governance": [
    { relationship: "origin", scope: NORTHSTAR_SCOPES.organization },
    { relationship: "applies-to", scope: NORTHSTAR_SCOPES.deliveryInitiative },
  ],
  "initial-capacity": [
    { relationship: "origin", scope: NORTHSTAR_SCOPES.platformDelivery },
    { relationship: "subject", scope: NORTHSTAR_SCOPES.engineering },
  ],
  "initial-customer-notes": [
    { relationship: "origin", scope: NORTHSTAR_SCOPES.deliveryInitiative },
    { relationship: "subject", scope: NORTHSTAR_SCOPES.engineering },
  ],
  "initial-status": [
    { relationship: "origin", scope: NORTHSTAR_SCOPES.engineering },
    { relationship: "subject", scope: NORTHSTAR_SCOPES.platformDelivery },
  ],
  "diagnostic-decision-path": [
    { relationship: "origin", scope: NORTHSTAR_SCOPES.deliveryInitiative },
    { relationship: "subject", scope: NORTHSTAR_SCOPES.engineering },
  ],
  "diagnostic-feasibility": [
    { relationship: "origin", scope: NORTHSTAR_SCOPES.deliveryInitiative },
    { relationship: "subject", scope: NORTHSTAR_SCOPES.engineering },
  ],
  "constraint-policy": [
    { relationship: "origin", scope: NORTHSTAR_SCOPES.organization },
    { relationship: "applies-to", scope: NORTHSTAR_SCOPES.deliveryInitiative },
  ],
  "contradictory-region": [
    { relationship: "origin", scope: NORTHSTAR_SCOPES.engineering },
    { relationship: "subject", scope: NORTHSTAR_SCOPES.platformDelivery },
  ],
  "outcome-pilot": [
    { relationship: "origin", scope: NORTHSTAR_SCOPES.deliveryInitiative },
    { relationship: "subject", scope: NORTHSTAR_SCOPES.platformDelivery },
    { relationship: "applies-to", scope: NORTHSTAR_SCOPES.engineering },
  ],
  "learning-retrospective": [
    { relationship: "origin", scope: NORTHSTAR_SCOPES.deliveryInitiative },
    { relationship: "subject", scope: NORTHSTAR_SCOPES.platformDelivery },
    { relationship: "applies-to", scope: NORTHSTAR_SCOPES.engineering },
  ],
};

const controlDisposition = (documentId: string): NorthstarControlDisposition => ({
  "negative-duplicate": "deduplicated-exact",
  "negative-formatting": "deduplicated-formatting",
  "negative-unrelated": "excluded-unrelated",
  "negative-external": "excluded-external",
  "negative-community": "excluded-nonmaterial",
} as const)[documentId] ?? "not-a-control";

const rawDetail = (assertions: readonly SourceScopeAssertion[]): NorthstarSourceScopeRecord["rawDetail"] => {
  const origin = assertions.find((item) => item.relationship === "origin")?.scope.type;
  return origin === "organization" || origin === "function" || origin === "team" || origin === "initiative"
    ? origin
    : "excluded-control";
};

export const northstarSourceScopeRecords: readonly NorthstarSourceScopeRecord[] = sandboxManifest.documents
  .map((document): NorthstarSourceScopeRecord => {
    const assertions = [...(assertionsByDocument[document.id] ?? [])];
    const disposition = controlDisposition(document.id);
    const binding = assertions.length ? createCanonicalSourceScopeBinding({
      organizationId: SANDBOX_ORGANIZATION_ID,
      bindingVersion: 1,
      source: {
        sourceId: `sandbox:${document.id}:v${document.version}`,
        sourceVersion: document.version,
        normalizedContentDigest: document.sha256,
      },
      topology: northstarScopeTopology,
      assertions,
      basisRefs: [`northstar-semantic-review:${NORTHSTAR_SCOPE_BINDING_VERSION}:${document.id}`],
      effectiveAt: document.effectiveAt,
    }) : null;
    return {
      documentId: document.id,
      sourceId: `sandbox:${document.id}:v${document.version}`,
      sourceVersion: document.version,
      normalizedContentDigest: document.sha256,
      semanticPurpose: document.semanticRole,
      assertions,
      rawDetail: rawDetail(assertions),
      upwardAggregation: assertions.some((item) => item.scope.type === "team")
        ? "local-retention"
        : assertions.some((item) => item.scope.type === "function" || item.scope.type === "initiative")
          ? "safe-aggregation"
          : assertions.length ? "bounded-context" : "not-applicable",
      controlDisposition: disposition,
      rationale: assertions.length
        ? `Reviewed semantic role: ${document.semanticRole}.`
        : `Preserved negative-control disposition: ${disposition}.`,
      binding,
    };
  })
  .sort((left, right) => compareText(left.documentId, right.documentId));

export const northstarSourceScopeBindings = northstarSourceScopeRecords
  .flatMap((record) => record.binding ? [record.binding] : [])
  .sort((left, right) => compareText(left.bindingId, right.bindingId));

export const northstarSourceScopePackageDigest = createHash("sha256")
  .update(JSON.stringify({
    version: NORTHSTAR_SCOPE_BINDING_VERSION,
    topologyId: northstarScopeTopology.topologyId,
    records: northstarSourceScopeRecords.map(({ binding, ...record }) => ({
      ...record,
      bindingId: binding?.bindingId ?? null,
    })),
  }))
  .digest("hex");
