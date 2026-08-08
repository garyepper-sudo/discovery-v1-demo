# Discovery Canonical Persistence-Safe Actor Reference Owner and Authentication-Subject Separation 001

## Status

Canonical additive Alpha governance implementation, independently reviewed and validated.

## Decision

Authentication subject, Alpha access-record identity, and persistence-safe actor reference are distinct identities. The Alpha access owner resolves the authenticated subject privately and assigns an opaque, organization-bound `actorRef` only when one exact active, unexpired Alpha access record proves current authority.

The private keyed subject-lookup digest is an owner-local lookup mechanism. It is never the actor reference, never disclosed through Product contracts, and never persisted as raw authentication subject material. Historical records are not backfilled with inferred actor identity.

## Persistence and lifecycle

- `alpha_actor_mappings` is an additive Alpha governance relation.
- Actor references are independently server-generated UUID-based opaque values.
- Assignment is organization-bound, idempotent, and concurrency-safe.
- Access-record revision, revocation, and restoration do not rewrite historical actor identity.
- Revocation blocks current authority while preserving immutable historical attribution.
- A second unrecorded idempotency key cannot claim an existing mapping.

## Migration contract

The ordered governance history contains the foundation migration followed by the actor-reference migration. A valid foundation-only database is migration-required. Missing, reordered, duplicated, conflicting, journal-only, schema-only, or partially reset history fails closed. Reset and reconstruction operate only on the explicit disposable Alpha governance inventory.

## Validation

- migration-journal validation: 44 checks passing;
- focused and fresh-process actor-owner proofs: passing;
- migration apply, replay, reset, reconstruction, concurrency, and catalog controls: passing;
- Product governance: 191 checks and 47 decisions;
- architecture: canonical 295/302 with the same seven inherited findings;
- typecheck, lint, build, and diff checks: passing.

The Alpha storage suite's assertion 55 is unrelated to this migration. Its exact failure is reproducible on clean canonical main and remains unsuppressed.

## Boundaries

No Runtime schema, cognition owner, Product contract, frontend, route, connector, Google Drive, Production, or deployment behavior changes. The retained Runtime remains unchanged.
