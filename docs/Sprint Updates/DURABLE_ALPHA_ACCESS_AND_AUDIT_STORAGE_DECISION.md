# Durable Alpha Access and Audit Storage Decision

> Implementation status (2026-07-26): the selected PostgreSQL/Drizzle design
> is implemented and validated as an inactive local repository shadow. See
> `DURABLE_ALPHA_POSTGRESQL_STORAGE_FOUNDATION.md`. Hosted Neon operations,
> dependency remediation, and route activation remain separate blocked gates.
> The subsequent repository assessment is
> `ALPHA_READINESS_ASSESSMENT.md`; its bounded Alpha Readiness implementation
> sequence is the next phase.

**Status:** Architecture ready for an inactive implementation shadow
**Classification:** A — Durable Alpha Storage Architecture Ready
**Selected stack:** Neon-managed PostgreSQL + Drizzle ORM/Drizzle Kit
**Activation:** Not authorized

## Repository State

- Branch: `sprint-79-organization-experience`
- HEAD: `a65391c30e62df02787c913db8b27a1eff021345`
- Milestone: `Canonize Discovery Alpha governance identity foundation`
- Later commits: none
- Initial working tree: clean

The repository contains an inactive, validated identity and authorization
chain but no durable access or audit implementation. This decision changes no
code, dependencies, migrations, Runtime data, routes, middleware, Clerk
configuration, cognition, disclosure, projection, communication, or UI.

## Existing Persistence Inventory

| Mechanism | Owner and location | Semantics | Deployment suitability | Access/audit suitability |
| --- | --- | --- | --- | --- |
| Organization Runtime JSON | Organization Runtime; `.discovery-runtime/organizations/*.json` through `organizationStateStore.ts` | Synchronous whole-file reads and writes; one JSON document per organization; no lock, transaction, migration, or concurrent-writer control | Local and benchmark persistence; not a production multi-instance database | Reject. Runtime must not own user identity, access, revocation, or governance audit history |
| Alpha preview cookie | Alpha preview gate; browser HTTP-only HMAC cookie | Time-bounded proof of shared-password possession; no user or organization relationship | Works as an outer preview gate across requests | Reject. It is neither identity nor authorization |
| Benchmark and product fixtures | Repository files and in-memory adapters | Deterministic validation inputs | Test and prototype only | Reject for hosted durability |
| DEPS reports | Versioned repository JSON/Markdown | Engineering evidence | Source-controlled reporting | Reject for operational records |
| Environment configuration | `.env.local` locally and Vercel environment variables when hosted | Secrets/configuration only | Suitable for database connection secrets | Never a record store |

No database client, ORM, migration framework, hosted database integration,
generic repository abstraction, external user store, organization membership
store, decision database, or Clerk metadata persistence exists. Clerk metadata
is not used.

Runtime JSON cannot safely store these records because it is organizational
cognition persistence, uses whole-file synchronous writes, has no
cross-instance concurrency or transaction boundary, and would improperly make
Runtime an authentication and Governance owner.

## Storage Ownership

### Alpha access store

The Alpha access store owns:

- explicit consumer-to-organization access;
- policy identity and version;
- relationship, experience, and organization scope;
- active, expired, revoked, and superseded lifecycle;
- grant and administrative provenance;
- deterministic record identity and idempotency;
- lifecycle timestamps; and
- append-only access-administration events.

### Disclosure audit store

The disclosure audit store owns:

- append-only disclosure-decision event history;
- decision, policy, consumer, organization, experience, and access provenance;
- disposition and reason codes;
- safely disclosable revision and authority references;
- request correlation metadata;
- event version, payload integrity, and resolution time.

It is an operational Governance log, not organizational cognition.

### Explicit exclusions

Runtime owns no user IDs, memberships, Alpha access records, revocations, or
disclosure audit events. Clerk owns no Discovery access record, canonical
organization scope, contribution authority, composition authority, or
disclosure decision.

## Technology Comparison

| Option | Integrity and constraints | Operations and local development | Future Governance fit | Decision |
| --- | --- | --- | --- | --- |
| PostgreSQL + Prisma | Strong transactions, constraints, mature migrations and tooling; database triggers and some partial-index behavior require raw SQL | Good hosted and local support but adds generated-client workflow and more abstraction than this two-repository boundary needs | Strong | Valid, not selected |
| PostgreSQL + Drizzle | Strong PostgreSQL transactions and constraints; typed SQL-shaped schema; generated versioned SQL migrations; raw SQL remains available for triggers and privileges | Lightweight in the existing TypeScript repository; local PostgreSQL and hosted Neon use the same behavior | Strong | **Selected** |
| PostgreSQL + direct driver/custom migrations | Maximum SQL control | Lowest dependency surface but creates custom mapping, migration, validation, and error-normalization work | Strong database model, weaker engineering sustainability | Reject |
| SQLite | Transactions and simple local setup | Hosted Vercel filesystems are not durable; multi-instance concurrency and constraint behavior diverge from PostgreSQL | Becomes migration work | Reject, including as the default local backend |
| Managed document or key-value store | Can persist records but relational uniqueness, partial active constraints, ordered lifecycle, and atomic revoke-plus-audit require custom coordination | Provider-specific operational model | Weak fit for later membership and scoped policy | Reject |
| Clerk metadata | Durable identity-provider metadata | Convenient but couples Discovery authorization and audit to Clerk ownership and limits transactional policy history | Wrong ownership boundary | Reject |
| Filesystem JSON | Deterministic and dependency-free locally | No safe hosted durability, transaction, unique constraint, concurrency, backup, or multi-instance behavior | Throwaway | Reject |

PostgreSQL is commodity infrastructure suited to relational access state, ACID
lifecycle transitions, foreign keys, partial unique indexes, append-only
enforcement, and ordered audit queries.

Drizzle wins over Prisma here because the repository needs a small,
SQL-explicit server boundary rather than a generated object graph. Drizzle
supports transactions and code-first versioned SQL migrations while allowing
the required PostgreSQL triggers, partial indexes, checks, and privileges to
remain visible.

## Selected Technology and Library

### Database

Use PostgreSQL 17 hosted by Neon through the Vercel Marketplace. Create the
database in Neon AWS `us-east-1` and explicitly run the relevant Vercel Node
functions in `iad1` so application and database regions are colocated.

Use a pooled TLS connection for application traffic and a separate direct
connection only for migrations and controlled administration. The database is
not an Edge Runtime dependency; storage code runs in server-only Node
functions.

Vercel currently provisions external PostgreSQL through Marketplace providers
and injects connection credentials as environment variables. Neon is the
selected provider because its Vercel integration supplies managed PostgreSQL,
pooling/serverless connectivity, branching, and point-in-time recovery without
changing the PostgreSQL data model.

### Query and migration library

Use:

- `drizzle-orm` for typed repository queries and transactions;
- `drizzle-kit` for generated, reviewable SQL migrations; and
- Neon's serverless PostgreSQL driver as the Drizzle transport.

Drizzle types stop at the repository implementation. Governance domain types
remain provider-independent.

### Local and CI database

Use the same PostgreSQL major version in a disposable local container and CI
service container. Do not use SQLite as a behavioral substitute. Developers
may optionally use an isolated Neon development branch, but no production
credential may appear locally.

## Access Schema

The logical access store contains two tables:

1. `alpha_access_records`, the current lifecycle-bearing relationship rows;
2. `alpha_access_lifecycle_events`, immutable administrative history.

### `alpha_access_records`

| Column | Type | Rule |
| --- | --- | --- |
| `access_record_id` | `text` primary key | Domain-generated deterministic ID |
| `policy_id` | `text` | Exactly `alpha-explicit-allowlist-disclosure` for v1 |
| `policy_version` | `text` | Exactly `1` for v1 |
| `consumer_id` | `text` | Nonempty Clerk user ID during Alpha; no wildcard |
| `organization_id` | `text` | Explicit Discovery organization ID; no wildcard |
| `relationship` | `text` | `allowed_alpha_user` for v1 |
| `experience` | `text` | `organization` for v1 |
| `scope_type` | `text` | `organization` for v1 |
| `scope_id` | `text` | Must equal `organization_id` for v1 |
| `status` | enum/check | `active`, `revoked`, or `superseded`; expiry is time-derived |
| `granted_at` | `timestamptz` | Explicit domain time |
| `granted_by` | `text` | Internal operator/principal identifier |
| `expires_at` | `timestamptz null` | Null or after `granted_at` |
| `revoked_at` | `timestamptz null` | Required only when revoked |
| `revoked_by` | `text null` | Required only when revoked |
| `supersedes_access_record_id` | `text null` | Self-reference to one predecessor |
| `idempotency_key` | `text` | Required, unique, operator-supplied request identity |
| `created_at` | `timestamptz` | Database insertion time |
| `updated_at` | `timestamptz` | Changes only for a lifecycle transition |

The domain ID is a versioned SHA-256 identity over normalized policy,
consumer, organization, experience, explicit grant time, and idempotency key.
Database timestamps are storage provenance and never inputs to deterministic
policy evaluation.

### Mutability

Identity, policy, consumer, organization, relationship, experience, scope,
grant provenance, expiry, predecessor, and idempotency fields are immutable.

Only one terminal lifecycle mutation is permitted:

- `active → revoked`; or
- `active → superseded`.

No transition out of `revoked` or `superseded` is allowed. Expiry is derived
from `expires_at <= resolvedAt`; the database row is not required to mutate
when time passes. Changing scope, expiry, policy, or experience creates a new
record through supersession.

Records are never soft-deleted or routinely deleted. Organization deletion is
restricted while retained access/audit records exist. Clerk consumer deletion
does not cascade; retained IDs follow the privacy-retention process.

### `alpha_access_lifecycle_events`

| Column | Type | Rule |
| --- | --- | --- |
| `lifecycle_event_id` | `text` primary key | Deterministic versioned event ID |
| `event_version` | `smallint` | Starts at `1` |
| `event_type` | enum/check | `granted`, `revoked`, `superseded` |
| `access_record_id` | `text` | Foreign key, restrict delete |
| `predecessor_access_record_id` | `text null` | Exact predecessor |
| `successor_access_record_id` | `text null` | Exact successor for supersession |
| `actor_id` | `text` | Authorized administrator principal |
| `reason` | `text` | Required bounded operator reason |
| `occurred_at` | `timestamptz` | Explicit operation time |
| `idempotency_key` | `text` unique | Administrative retry identity |
| `created_at` | `timestamptz` | Database insertion time |

This table is append-only and records every grant, revocation, and
supersession transaction.

## Audit Schema

### `alpha_disclosure_audit_events`

| Column | Type | Rule |
| --- | --- | --- |
| `audit_event_id` | `text` primary key | Existing deterministic event identity |
| `event_version` | `smallint` | Starts at `1` |
| `decision_id` | `text` unique | Existing exact decision identity |
| `policy_id` | `text` | Exact policy |
| `policy_version` | `text` | Exact policy version |
| `consumer_id` | `text` | Verified consumer |
| `organization_id` | `text` | Requested organization |
| `experience` | `text` | Requested experience |
| `access_record_id` | `text null` | Only when a valid record was resolved |
| `disposition` | enum/check | `disclosed`, `partially-disclosed`, `withheld`, `revoked`, `invalid` |
| `reason_codes` | `text[]` | Nonempty, allowlisted bounded codes |
| `source_revision_ids` | `text[]` | Only safely disclosed revisions |
| `authority_receipt_ids` | `text[]` | Only safely disclosed receipts |
| `resolved_at` | `timestamptz` | Explicit decision time |
| `request_correlation_id` | `text` | Random opaque server correlation ID |
| `payload_sha256` | `text` | Canonical payload integrity and idempotency check |
| `created_at` | `timestamptz` | Database insertion time |

Denied and invalid events omit composition, revision, authority, and access
identifiers that were not safely resolved. Withheld object identifiers are not
recorded merely because they were requested. The audit contains no Evidence
body, Explanation prose, protected cognition, session token, email, password,
or raw request.

## Constraints and Indexes

Required database constraints:

- primary keys on all record and event IDs;
- unique `idempotency_key` per administrative operation;
- unique `decision_id` and `audit_event_id`;
- partial unique index on
  `(policy_id, policy_version, consumer_id, organization_id, experience)`
  where access `status = 'active'`;
- unique non-null `supersedes_access_record_id`, preventing two successors;
- checks rejecting empty identifiers, `*`, and null bytes;
- check that `scope_type = 'organization'` and
  `scope_id = organization_id` for policy v1;
- check that expiry follows grant time;
- checks coupling revoked status to `revoked_at` and `revoked_by`;
- foreign keys with `ON DELETE RESTRICT`;
- transition trigger permitting only the two allowed terminal mutations;
- update/delete rejection triggers on both event tables; and
- application database role with no direct `UPDATE` or `DELETE` privilege on
  event tables.

Indexes:

- current access lookup by consumer, organization, experience, policy, status,
  and expiry;
- access history by consumer/organization and descending `granted_at`;
- lifecycle history by access record and descending `occurred_at`;
- audit history by organization and descending `resolved_at`;
- audit history by consumer and descending `resolved_at`;
- audit lookup by correlation ID; and
- BRIN or time index on audit `created_at` only when volume justifies it.

## Transaction Model

### Grant

Use a `SERIALIZABLE` transaction:

1. take a transaction-scoped advisory lock over the normalized access key;
2. verify there is no active terminal record;
3. insert the access record;
4. append the `granted` lifecycle event;
5. commit.

The partial unique index is the final concurrent-grant guard.

### Supersession

In one `SERIALIZABLE` transaction:

1. lock the access key and current row `FOR UPDATE`;
2. verify it is active and current;
3. update it once to `superseded`;
4. insert the successor with exact predecessor identity;
5. append the immutable supersession event;
6. commit.

### Revocation

In one `SERIALIZABLE` transaction:

1. lock the access key and active row `FOR UPDATE`;
2. move it once to `revoked` with actor, reason, and time;
3. append the immutable revocation event;
4. commit.

Every subsequent preflight uses a fresh database read. There is no positive
authorization cache in Alpha.

### Expiry

Expiry is evaluated in SQL using the request's explicit `resolvedAt`, not the
database clock:

`expires_at IS NULL OR expires_at > resolved_at`

An expired row is ineligible even if its stored status remains `active`.
Superseding an expired record still locks and transitions the predecessor.

### Decision and audit

For limited Alpha, use one bounded database transaction and fail closed:

1. verify identity;
2. begin a short `REPEATABLE READ` transaction;
3. select and lock the current eligible access row `FOR SHARE`;
4. load Runtime exactly once and resolve authority/disclosure;
5. revalidate the locked record against explicit `resolvedAt`;
6. append or idempotently verify the audit event;
7. commit;
8. only then return disclosed content.

Revocation requires an incompatible row lock and therefore cannot silently
overtake an in-flight authorized decision. Set strict statement and transaction
timeouts so a database failure denies rather than hanging.

The disclosure decision remains an in-memory domain result; it is not a new
canonical truth object.

## Audit Failure Policy

**Fail closed on audit write failure.**

Successful or partial disclosure is not returned until its required audit
event is durably committed. This reduces availability but avoids an
unobservable disclosure gap, which is the correct tradeoff for a small hosted
Alpha.

Retries reuse deterministic event and decision IDs. `ON CONFLICT` may succeed
only after reading the existing row and confirming an exact payload hash.
Same-ID/different-payload is an integrity error and denies disclosure.

Denied requests should also be audited when the database is available, but an
audit outage must not convert denial into disclosure. An unavailable audit
store returns a generic denial and emits a protected operational alert.

No outbox is needed for the first Alpha because the audit database is the
system of record and the response is gated on its commit. An outbox may later
feed external monitoring without becoming the authoritative audit owner.

## Repository Interfaces

Database and Drizzle types end inside server-only adapters.

```ts
type AlphaStorageError =
  | { code: "unavailable"; retryable: true }
  | { code: "conflict"; retryable: false }
  | { code: "invalid-transition"; retryable: false }
  | { code: "integrity-failure"; retryable: false };

interface AlphaAccessRecordRepository {
  loadAccessChain(input: {
    consumerId: string;
    organizationId: string;
    experience: "organization";
    policyId: "alpha-explicit-allowlist-disclosure";
    policyVersion: "1";
    resolvedAt: string;
  }): Promise<readonly AlphaOrganizationAccessRecord[]>;

  grantAccess(
    input: GrantAlphaAccessInput,
  ): Promise<AlphaOrganizationAccessRecord>;

  revokeAccess(
    input: RevokeAlphaAccessInput,
  ): Promise<AlphaOrganizationAccessRecord>;

  supersedeAccess(
    input: SupersedeAlphaAccessInput,
  ): Promise<AlphaOrganizationAccessRecord>;
}

interface AlphaDisclosureAuditRepository {
  appendOrVerify(
    event: AlphaDisclosureDecisionAuditEvent,
  ): Promise<"appended" | "already-present-identical">;
}
```

`loadAccessChain` returns validated domain records, not raw ORM rows. The
server orchestration supplies those records to the existing pure
`preflightAlphaOrganizationAccess`; policy evaluation does not move into SQL
or the repository.

For compatibility with the current domain contract, a stored `superseded`
predecessor maps back to its historical domain status `active`, while the
successor carries `supersedesAccessRecordId`. A terminal revoked row maps to
`revoked`. The complete chain is loaded so missing predecessors, forks, cycles,
and attempted reactivation continue to fail in the existing domain core.

Repositories validate database rows before mapping them into domain types.
Transactions are injected into repository implementations, never cognition or
product contracts. The existing synchronous fixture reader remains a test
adapter; the inactive hosted orchestration awaits the repository before
invoking the same pure preflight.

## Administrative Workflow

Use a server-only CLI for limited Alpha. Do not add an admin route or UI.

Commands:

- `alpha-access inspect`;
- `alpha-access grant`;
- `alpha-access revoke`;
- `alpha-access supersede`; and
- `alpha-audit review`.

The CLI uses a separate least-privilege administration credential supplied
through the operator environment or managed secret store. It requires:

- an explicit administrator principal;
- exact consumer and organization IDs;
- exact experience and expiry;
- a bounded reason and idempotency key;
- display of the complete proposed change;
- interactive confirmation for grant, revoke, and supersede;
- `--confirm` only for controlled noninteractive automation; and
- a lifecycle event in the same transaction.

Wildcard grants are rejected. Secrets and grants never enter source control.
Database-console editing is emergency-only and must be followed by integrity
review; it is not the normal administrative mechanism.

## Local Development and CI

- Run PostgreSQL 17 in a local disposable container.
- Use a local-only role and `.env.local`; never copy hosted credentials.
- Apply the same versioned Drizzle SQL migrations used in hosted environments.
- Seed deterministic Atlas Alpha records only through test/seed commands.
- Give every test worker an isolated database or schema.
- CI starts a PostgreSQL service, migrates from zero, runs concurrency and
  failure-injection tests, and destroys the database.
- Migration reset is allowed only for disposable local/CI databases.
- Hosted environments use forward migrations and tested forward repair, not
  destructive reset.
- Test migration up, clean bootstrap, upgrade from the previous schema,
  idempotent retry, backup restore, and rollback where PostgreSQL permits it.

SQLite is not used because its partial-index, locking, concurrency, timestamp,
array, trigger, and serverless behavior would make important tests
nonrepresentative.

## Security and Privacy

- TLS is mandatory in transit; provider-managed encryption is mandatory at
  rest and for backups.
- Store pooled application, migration, and administration credentials
  separately in Vercel/Neon managed environment secrets.
- The application role can read current access and append audit events but
  cannot grant access, mutate lifecycle state, update audit, or delete audit.
- The administration role can execute bounded lifecycle procedures but cannot
  read protected cognition.
- The migration role alone owns DDL and append-only enforcement objects.
- Use parameterized Drizzle queries; raw SQL is migration-only or uses bound
  parameters.
- Every query includes exact consumer, organization, experience, policy, and
  version predicates.
- Bound identifier and reason-code length and audit arrays to prevent volume
  abuse.
- Rate-limit requests before Runtime load; alert on denial and audit volume.
- Never log raw database URLs, session tokens, protected cognition, or audit
  payloads in application logs.
- Treat Clerk user IDs and administrator IDs as pseudonymous personal data.
- Restrict audit queries to explicitly authorized operators.
- Record database administrative access through provider logs.

For Alpha, `consumer_id` remains the stable Clerk user ID. Introducing an
internal principal solely for Alpha would add mapping state without improving
the current boundary. The repository interface treats it as an opaque external
principal reference. Broader Governance later adds a `principals` table and
backfills a Clerk-identity mapping without changing access-record identity or
history.

## Backup and Operations

For limited Alpha:

- enable Neon point-in-time recovery on a paid plan before real grants;
- retain at least seven days of point-in-time history initially;
- create a daily logical backup/export encrypted under a separate key and
  retained for 30 days;
- test restore into an isolated project before activation and quarterly;
- monitor query latency, connection saturation, transaction aborts, lock
  waits, access-read failures, audit-write failures, and storage growth;
- alert immediately on audit integrity conflicts or repeated write failures;
- target p95 access preflight below 100 ms in-region and audit commit below
  150 ms, with a bounded end-to-end transaction timeout;
- use pooled application connections with conservative function concurrency;
- apply migrations in a maintenance window with a pre-migration backup;
- prefer forward repair; rollback only migrations explicitly proven
  reversible; and
- maintain an emergency revocation command using the administration role.

Access and audit records are initially retained for one year after the later
of access termination or decision resolution. Before the first deletion, a
separate privacy/compliance decision must approve retention. Application roles
have no delete capability. A restricted retention role may later archive and
delete eligible partitions or rows with its own immutable operation record.

## Dependency-Security Sequence

Storage implementation may proceed in inactive shadow while current routes
remain unchanged. It should not wait for Clerk/Next remediation because the
storage model and repository tests are provider-independent, and completing
them gives the remediation sprint a stable downstream boundary.

The sequence is:

1. inactive PostgreSQL storage foundation and repository shadow;
2. dependency remediation and regression validation;
3. deployed Clerk middleware/provider verification;
4. operational readiness and route-activation review.

Clerk and Next must be upgraded to reviewed fixed versions before any hosted
route activation. New storage dependencies must receive a baseline
`npm audit`, lockfile review, license review, and production-path inventory.
The security gate blocks activation if any unreviewed critical/high
production-path advisory, failed tenant-isolation test, failed append-only
test, or unresolved middleware/authentication bypass remains.

## Migration to Broader Governance

Fields that survive unchanged:

- record and event IDs;
- principal/consumer reference;
- organization reference;
- policy identity/version;
- relationship;
- experience;
- scope type/ID;
- lifecycle and provenance;
- decision identity;
- disposition, reason codes, and authority references.

Generalization:

- `consumer_id` becomes `principal_id` through a Clerk identity mapping;
- `allowed_alpha_user` becomes one membership/entitlement relationship type;
- organization scope expands to team, department, function, initiative, and
  object scopes;
- one experience expands through a normalized entitlement-experience join;
- Alpha policy rows remain versioned historical records while new policies
  produce new records;
- administrative actors become governed principals with explicit
  administrative authority; and
- audit event versions add contribution, object-level disclosure, and
  collective-intelligence events without rewriting v1 history.

The PostgreSQL database, access record IDs, lifecycle events, and disclosure
audit table survive. Migration adds principal, identity-provider mapping,
membership, role, scope, permission, and policy tables. Hazards include
duplicate identity mappings, ambiguous organization backfill, role inference,
policy-version overlap, and accidental cascade deletion. Backfill must be
explicit, reversible where possible, and default-deny when mapping is
ambiguous.

## Candidate Comparison

| Candidate | Safety | Effort | Migration quality | Hosted/local fit | Dependency/operations | Result |
| --- | --- | --- | --- | --- | --- | --- |
| 1. PostgreSQL + Prisma + CLI | High | Medium-high | Strong; raw SQL still needed | Strong | Heavier generated-client workflow | Runner-up |
| 2. PostgreSQL + Drizzle + CLI | High | Medium | Strong and SQL-visible | Strong with Neon/Vercel and local PostgreSQL | Small typed boundary; standard managed DB | **Selected** |
| 3. Managed PostgreSQL + direct driver/custom migrations | High at database, medium in application | High | Depends on custom discipline | Strong | Unnecessary custom infrastructure | Reject |
| 4. SQLite Alpha store | Medium locally, low hosted | Low initially, high later | Requires later database migration | Divergent and non-durable on Vercel | Throwaway risk | Reject |
| 5. Hosted KV/document store | Medium only with substantial custom coordination | Medium-high | Weak relational migration | Hosted-friendly, test semantics provider-specific | Lock-in and integrity complexity | Reject |
| 6. Clerk metadata | Low for Discovery ownership and audit | Low initially | Poor | Hosted-friendly | Couples authorization to identity provider | Reject |

## Implementation Sequence

```text
reviewed Drizzle/Neon dependencies and security baseline
→ server-only storage contracts and domain/database mapping
→ versioned PostgreSQL migrations and database roles
→ access repository shadow
→ append-only lifecycle and disclosure-audit repositories
→ CLI administration shadow
→ concurrency, failure, migration, backup/restore validation
→ inactive end-to-end governance replay
→ DEPS report
→ dependency-remediation sprint
→ deployed Clerk verification
→ route-activation review
```

The storage sprint must not import repositories into active routes. Rollback
removes the inactive adapters and drops only empty or test shadow resources.
Once real records exist, rollback is forward-disable plus retained data, never
silent deletion.

## Benchmark Plan

The focused storage gate must cover:

1. deterministic domain IDs;
2. active access retrieval;
3. missing access denial;
4. expired access denial;
5. revoked access denial;
6. superseded access denial;
7. duplicate-active prevention;
8. conflicting-record prevention;
9. organization isolation;
10. consumer isolation;
11. experience isolation;
12. wildcard rejection;
13. grant transaction;
14. revoke transaction;
15. supersession transaction;
16. concurrent grant conflict;
17. concurrent revocation;
18. access-reader failure;
19. audit append;
20. audit idempotency;
21. audit immutability;
22. audit update rejection;
23. audit delete rejection;
24. audit-failure disclosure denial;
25. no Runtime writes;
26. no cognition writes;
27. no access data in Runtime;
28. no audit data in Runtime;
29. no protected cognition in denied audit;
30. exact policy identity;
31. exact access provenance;
32. exact decision identity;
33. migration from zero;
34. migration upgrade;
35. forward repair or proven rollback;
36. backup and restore;
37. CLI authorization;
38. CLI grant;
39. CLI expiry;
40. CLI revoke;
41. CLI supersession;
42. inactive end-to-end governance replay;
43. Clerk identity regression;
44. producer regression;
45. projection regression;
46. communication regression;
47. product-adapter regression;
48. active-route byte equivalence;
49. no User Intelligence claim;
50. dependency audit does not worsen unexpectedly; and
51. deterministic DEPS evidence.

Promotion classifications:

- **A — Durable Alpha Storage Architecture Ready:** PostgreSQL migrations,
  repositories, fail-closed audit, CLI lifecycle, concurrency, restore, and
  inactive replay all pass; route remains inactive.
- **B — Architecture Valid; Deployment or Security Decision Required:** local
  contract passes but hosted provider, backup, secrets, security, or
  operational behavior remains unresolved.
- **C — Durable Alpha Storage Architecture Blocked:** required isolation,
  transaction, append-only, migration, or rollback semantics cannot be
  preserved.

## Decision

1. **Database technology:** PostgreSQL 17.
2. **Library:** Drizzle ORM and Drizzle Kit, using the Neon serverless
   PostgreSQL driver.
3. **Hosted deployment:** Neon through Vercel Marketplace, Neon AWS
   `us-east-1`, colocated with Vercel `iad1` Node functions.
4. **Local development:** disposable PostgreSQL 17 container; CI PostgreSQL
   service; no SQLite substitution.
5. **Access owner:** Discovery Alpha Access Store.
6. **Audit owner:** Discovery Alpha Disclosure Audit Store.
7. **Access mutability:** identity/scope/grant fields immutable; exactly one
   terminal lifecycle mutation to revoked or superseded.
8. **Audit mutability:** append-only; application update/delete prohibited.
9. **Revocation:** atomic active-to-revoked transition plus lifecycle event.
10. **Supersession:** atomic predecessor transition, successor insert, and
    lifecycle event.
11. **Uniqueness:** one active record per policy/version/consumer/
    organization/experience; unique predecessor successor, idempotency,
    decision, and event identities.
12. **Audit failure:** fail closed before returning protected disclosure.
13. **Administration:** separate-credential, confirmation-based server CLI.
14. **Backup:** provider PITR plus daily encrypted logical export and tested
    restore.
15. **Secrets:** separate application, administration, and migration
    credentials in Vercel/Neon secret management; local-only development
    credentials.
16. **Governance migration:** preserve PostgreSQL records/events; map Clerk
    consumer IDs to internal principals and add membership, role, and scope
    tables.
17. **Dependency sequence:** storage shadow may proceed now; Clerk and Next
    remediation is mandatory before route activation.

## Exact Next Implementation Sprint

**Durable Alpha PostgreSQL Storage Foundation — Inactive Repository Shadow**

Implement the selected PostgreSQL/Drizzle schema, database roles, migrations,
server-only repository adapters, fail-closed append-only audit boundary,
controlled Alpha CLI, and the 51-case storage validation gate. Keep all active
routes, Clerk middleware/providers, Runtime, cognition, schemas, projection,
communication, and UI unchanged. Use only local/CI test databases and an
explicitly isolated hosted development branch; do not activate hosted Alpha.

## Deferred Work

- dependency upgrades and remediation;
- production database provisioning;
- production credentials and real grants;
- Clerk middleware/provider activation;
- admin route or UI;
- broader membership, roles, scopes, and Governance Control Plane;
- route activation;
- retention deletion jobs;
- compliance certification; and
- User Intelligence or Collective Intelligence claims.

## References

- [Vercel Marketplace storage](https://vercel.com/docs/marketplace-storage)
- [Postgres on Vercel](https://vercel.com/docs/postgres)
- [Neon for Vercel](https://vercel.com/marketplace/neon)
- [Drizzle transactions](https://orm.drizzle.team/docs/transactions)
- [Drizzle migrations](https://orm.drizzle.team/docs/migrations)
