# Recipient-Audience Scope Governance Contract

Status: shadow-only, version 1. Classification B. Ready for the forward producer task; not activated in Product.

Contract readiness: PASS. Activation readiness: BLOCKED. Corrected benchmark
digests are `4380d11a9d50dd22a60b1c83352229fa381a1e33bd3fd637d3ee334cec3a801b`
for `results.json` and
`a94e3ed498117e2d7498de3d479bfc71036fbc3e988607a21347e3bcc0c689fa`
for `REPORT.md`.

## Ownership

| Concept | Existing owner | Persistence/mutation | Evaluator and consumers | Security meaning |
|---|---|---|---|---|
| Authenticated principal | Clerk resolution | Clerk | server identity boundary | identifies a principal only |
| Organization admission | `AlphaOrganizationAccessRecord` | Alpha access repository / administrative lifecycle | Alpha preflight, live adapter | may enter one organization experience |
| Access lifecycle | append-only access records and lifecycle events | Postgres repository | current chain-head resolution | active, revoked, superseded/restored successor |
| Recipient audience | `RecipientAudienceGrant` | future separate repository; no migration here | pure shadow evaluator | explicit scopes the recipient may receive |
| Subject scope | canonical composition | Runtime | later disclosure | what a claim describes |
| Source/Evidence/derived scope | canonical scope lineage | Runtime lineage owner | provenance consumers | origin/support provenance, never audience authority |
| Default scope | sandbox persona/Product context | environment-derived development binding | navigation | initial Product emphasis only |
| Display scope/role | presentation metadata | none | presentation | human label only |
| Nested disclosure | future canonical Understanding disclosure | none yet | future disclosure | direct, safe-abstracted, withheld, unavailable |

Current Alpha access contains organization admission only. Sandbox `ScopedAuthorityGrant` values support development authorization but are not persisted audience-grant revisions. Purpose is evaluated by scoped governance, while Alpha admission has no purpose field. Revocation terminates the current access head; restoration creates an explicit active successor. Current server reads re-resolve identity and authorization, so account switches and sign-out do not reuse earlier authority.

## Scope identity and relations

`GovernedScopeRef` binds `organizationId`, type, and ID. Supported types are organization, function, department, team, initiative, private workspace, and restricted. `CanonicalScopeTopology` owns deterministic, versioned nodes and explicit `contains` or `initiative-relates` edges. It rejects duplicates, cycles, stale/forked topology histories, malformed identities, and cross-organization edges. Equality is exact. Descendant coverage traverses explicit `contains` edges only. Initiative relations never imply containment. There is no inferred hierarchy, intersection, sibling grant, ancestor coverage, or broadest-scope fallback.

## Selected Model B

A separate immutable, versioned grant is bound to an exact active assignment identity and revision. This separates organization admission from audience authority, permits independent revocation/supersession, makes stale assignments fail closed, and supports multiple explicit grants with deterministic evaluation.

- Model A was rejected because admission and audience grants can have different revision and revocation lifecycles.
- Model C was rejected as unnecessarily generic; version 1 is limited to canonical Organizational Understanding, `receive`, and the governed `organizational-understanding` purpose.
- Model D was rejected because default scope is navigation metadata.
- Model E was rejected because roles, titles, and hierarchy are non-authoritative.

## Contract and lifecycle

Identity is derived from organization, assignment, recipient, and resource family. Revision identity hashes the complete normalized immutable revision, including assignment revision, sorted/deduplicated scopes, operations and purposes, coverage, state, issuer authority, effective time, and exact predecessor. Wall-clock time and array position never own identity.

States are proposed, active, inactive, revoked, and superseded. Only an active grant bound to the exact current active assignment revision can authorize. Restoration requires a new active grant revision; an old revoked grant never reactivates. Missing, ambiguous, malformed, unsupported, stale, revoked, cross-organization, or unknown inputs fail closed. Historical records remain immutable.

Scope coverage is exact or explicit-descendant. An organization-wide shared audience requires an explicit organization audience grant. Narrow grants do not cover ancestors. Multiple grants are independently evaluated after deterministic normalization.

The pure evaluator consumes an already-resolved current assignment, grant revisions, one bounded requirement, and one canonical topology. Its server-internal decision may retain exact assignment/grant/relation audit references. The existing external denied Product response remains `{ disposition: "denied" }`; it receives no grant identity, scope existence, relation, count, or reason.

## Persistence and migration

No database migration or access mutation is part of this task. Future activation requires a separate audience-grant repository/table, immutable revisions and administrative events, optimistic stale-write rejection, and an organization-authorized `audience-grant:administer` operation. Existing assignments receive no grandfathered authority. Grants must be created through an explicit human-governed administrative operation.

## Validation

The deterministic benchmark executes 70 cases across five ownership models (350 cells) plus 11 sensitivity invariants. It covers lifecycle, exact/descendant relations, purpose/resource/operation restrictions, role/default neutrality, current-state revocation, cross-organization isolation, deterministic ordering, frontend-safe serialization, and absence of Runtime/access/Product side effects.

The forward-producer investigation is closed as a fail-closed diagnostic
foundation with producer classification F, no qualifying model, and no
complete field family. Exact producer-input accounting and source closure pass,
but every candidate field still lacks a canonical audience requirement.

Next: **DISCOVERY CANONICAL ORGANIZATIONAL UNDERSTANDING FIELD
AUDIENCE-REQUIREMENT GOVERNANCE CONTRACT 001**.

Material role differentiation remains OPEN and route promotion remains
blocked. The forward producer must remain shadow-only and require no current
persisted audience grant. Later activation still requires persistence,
administrative issuance, current-grant resolution, controlled live wiring, and
dedicated leakage acceptance.
