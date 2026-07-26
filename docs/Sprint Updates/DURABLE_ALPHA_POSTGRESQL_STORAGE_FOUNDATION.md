# Durable Alpha PostgreSQL Storage Foundation

**Status:** Complete as an inactive local repository shadow
**Classification:** B — Storage Foundation Valid; Deployment or Operational Integration Required
**Activation:** Blocked

## Purpose

Discovery now has a durable, Discovery-owned storage boundary for Alpha
organization access, access lifecycle, and disclosure audit. It remains
inactive: no route, middleware, provider, Runtime, cognition, projection,
communication, UI, or product behavior imports the repositories.

Clerk owns authenticated identity. Discovery owns access records, lifecycle,
disclosure decisions, and audit semantics. Organization Runtime owns none of
these operational governance records.

## Technology and configuration

- PostgreSQL 17; local validation used PostgreSQL `17.10`.
- Drizzle ORM `0.45.2` and Drizzle Kit `0.31.10`.
- Neon serverless driver `1.1.0` for the future hosted adapter.
- `postgres` `3.4.9` for migrations, CLI, repositories, and local/CI tests.
- Separate fail-closed application, administration, and migration URLs.

There is no default production database, filesystem persistence, or SQLite
fallback. `compose.alpha-storage.yml` supplies a disposable PostgreSQL 17
service with local-only credentials and a health check.

## Schema, constraints, and migrations

The Drizzle schema and reviewed migration create
`alpha_access_records`, `alpha_access_lifecycle_events`, and
`alpha_disclosure_audit_events`.

Database constraints enforce exact policy/version, relationship, experience,
organization scope, non-wildcard identities, terminal lifecycle shape,
expiry ordering, one active record per exact access key, one successor per
predecessor, and unique administrative, decision, correlation, and event
identities.

Identity, scope, and grant provenance are immutable. The only record
transitions are `active → revoked` and `active → superseded`. Expiry remains
request-time evaluation. Lifecycle and audit triggers reject `UPDATE` and
`DELETE`; application and administration role grants are explicit.

## Repositories and transaction shadow

Explicit mapping keeps PostgreSQL rows outside governance core, Runtime,
projection, communication, and UI. Unknown policy versions and invalid row
shapes fail closed. Grant, revoke, and supersede use `SERIALIZABLE`
transactions; exact-key advisory locking and the partial unique index protect
concurrent grants. Lifecycle events commit in the same transaction.

Audit retries verify a deterministic payload hash. Same identity plus a
different payload is an integrity failure. The inactive disclosure path uses
a bounded `REPEATABLE READ` transaction, explicit statement/lock/idle
timeouts, shared access locking, one Runtime load, audit append, and commit
before returning protected output. Runtime or audit failure rolls back and
denies.

## Administration and local development

`npm run storage:alpha-access -- <operation>` supports `inspect`, `grant`,
`revoke`, and `supersede`. Mutations require exact opaque IDs, actor, reason,
idempotency key, preview, and interactive `YES` or `--confirm`. `--dry-run`
needs no database. The CLI performs no Clerk email lookup.

Migration commands are `storage:migrate`, `storage:status`, and the explicitly
guarded local-only `storage:reset:local`. Application startup never migrates.

## Validation

The PostgreSQL gate passes `60/60` against PostgreSQL `17.10`, including
transactions, concurrent grant conflict, isolation, complete-chain mapping,
pure preflight reuse, append-only enforcement, application-role non-bypass,
Runtime and audit failure rollback, CLI safety, Runtime non-mutation, and
active-route byte equivalence.

- validation SHA-256:
  `a5b2f390a4e7a116a28fff20526161d77f5e991aac4173998e5dca999cb3ef01`;
- migration SHA-256:
  `6910328c74e753af64ebadd6215a594f32cd25e128b70ba13eb8d1aadcdf00d0`;
- Runtime before/after SHA-256:
  `ce267f9e34bc60f94d4c1e16e0a153042f5d8a5b1d54ee4633999c17041fc9cc`.

Migration bootstrap, repeat, and status checks pass. A logical dump restored
five access and two audit records plus all three enforcement triggers into an
isolated database. Current-access resolution remained exact and restored audit
updates were rejected. This is bounded local restore evidence, not Neon PITR.

## Security and DEPS

Before storage dependencies, the all-dependencies audit reported 19 entries:
17 high and 2 critical. Afterward it reports 23: four moderate, 17 high, and 2
critical. The four additions are Drizzle Kit development-tool findings. The
post-install production-only audit reports 5 entries: 3 high and 2 critical;
none is attributed to Drizzle, Neon, or `postgres`. No audit fix or existing
dependency upgrade was performed.

- Organizational Understanding: Unchanged.
- User Intelligence: Not Measured.
- Collective Intelligence: Not Measured.
- Governance Integrity: Improved.
- System Sustainability: Improved.
- Complexity: Increased and justified.
- Product and Runtime regression: Unchanged.

No user utility or Local Understanding Utility claim is made.

## Remaining blockers and rollback

Remaining hosted gates are Neon provisioning and environment wiring; hosted
role and pooling verification; live PITR; deployed Clerk verification;
dependency remediation; browser tenant-isolation testing; route review; and
monitoring/alerting.

Inactive rollback removes the dependencies, database boundary, migration,
repositories, CLI, local service, validator, DEPS report, and documentation.
Once real records exist, rollback must forward-disable and retain data.

## Recommendation

Run the bounded Alpha Readiness implementation sequence documented in
`ALPHA_READINESS_ASSESSMENT.md`. Dependency remediation is the first technical
gate; hosted Runtime durability, Neon verification, enforcement activation,
minimum operations, and deployed isolation/recovery validation must also pass
before the first external Alpha deployment.
