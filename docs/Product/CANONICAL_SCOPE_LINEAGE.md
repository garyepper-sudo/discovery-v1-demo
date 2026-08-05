# Canonical Scope Lineage

Status: additive version-1 contract for Discovery 2 production integration.

Scope lineage records where a source, admitted Evidence item, or derived canonical object belongs semantically. It is provenance only. It grants no authority, changes no sensitivity, and does not replace scoped governance or disclosure evaluation.

The canonical model has four distinct owners:

1. `CanonicalScopeTopology` versions exact organization-bound scope nodes and explicit `contains` or `initiative-relates` relationships.
2. `CanonicalSourceScopeBinding` binds an exact canonical source version and normalized-content digest to one or more typed assertions (`origin`, `subject`, `applies-to`, or `initiative`). Revisions are append-only.
3. `CanonicalEvidenceScopeAttribution` retains the exact Evidence and admission identities, source-binding references, topology, and resolved assertions without entering Evidence content identity.
4. `CanonicalDerivedScopeLineage` resolves the full set of supporting Evidence attributions into an additive Runtime lineage index. Missing structured lineage remains explicit.

All collections are canonicalized and deterministically digested. Current and historical topology and source-binding resolution follows effective time and a single append-only supersession chain; missing, stale, ambiguous, forked, unknown, and cross-organization references fail closed.

Existing source content identity, normalized digest, Evidence identity, admission identity, investigation fingerprint, and cognitive-object identity exclude the new lineage objects. A scope-only correction therefore creates a new binding or attribution revision while retaining earlier history; it is not new Evidence or cognitive change.

Legacy free-form `organizationScope` remains compatibility metadata, not structured authority. Compatibility is explicit, requires the exact organization, resolves only to the organization root, and is marked as missing structured lineage. Non-root Product input requires structured lineage.

The scoped Product input resolver may use exact derived lineage to select candidates before the existing authorization, sensitivity, purpose, historical-policy, and disclosure owners evaluate them. Parent/child and initiative relationships never imply access. Role names, personas, and user IDs never infer scope.

This contract adds no database migration and does not populate Northstar data. `runDiscoveryV3` is the canonical Evidence-admission producer for this seam: when supplied an exact optional lineage context it resolves the effective topology and source binding and returns immutable Evidence attribution without changing the investigation fingerprint. `evolveOrganizationRuntime` consumes that output, builds deterministic derived lineage from exact support ancestry, and persists the additive index. Existing callers without structured lineage retain the explicit legacy path; only that path retains organization-root mechanism compatibility.
