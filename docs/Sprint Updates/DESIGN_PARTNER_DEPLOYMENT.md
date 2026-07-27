# Discovery Design Partner Deployment Sprint 001

## Status

**B — DEPLOYABLE AFTER BOUNDED FIXES**

The repository now contains the bounded deployment controls needed for one
organization and one supported `Your Organization` deployment. Production
dependency blockers are remediated and local deployment validation passes.

Vercel production is connected to the GitHub repository and deploys the
default `main` branch. This environment contains no Vercel project credentials,
Neon credentials, Clerk production keys, production domain, or product-ready
design-partner Runtime. Consequently, no hosted resource was provisioned and
the required actual hosted authenticated replay has not occurred.

## Supported Deployment

```text
one application release
  → one Clerk production instance
  → one Neon PostgreSQL 17 project
  → one persistent Runtime volume
  → one exact Clerk consumer id
  → one exact organization id
  → one enabled Your Organization route
```

All other product experiences remain outside this deployment.

## Dependency Remediation

| Dependency | Before | After | Reason |
| --- | --- | --- | --- |
| Next.js | 14.2.18 | 15.5.21 | Removes the recorded middleware-bypass, server-component, SSRF, and related production advisories |
| Clerk Next.js | 6.10.0 | 6.39.6 | Removes the critical middleware protection bypass and earlier authenticity issue |
| PostCSS override | 8.4.31 | 8.5.23 | Removes transitive source-map file-disclosure findings |
| Sharp override | 0.34.5 | 0.35.3 | Removes the transitive libvips security findings |
| eslint-config-next | 14.2.18 | 15.5.21 | Keeps build-time framework rules aligned |

The production audit changed from 3 high and 2 critical findings to zero.
Development-only findings remain accepted because they are not shipped in the
production dependency graph. No automatic audit fix or unrelated upgrade was
used.

Next 15 requires asynchronous page `params` and `searchParams`; route files
were mechanically adapted without changing product behavior.

## Environment and Secrets

Production requires:

```text
DISCOVERY_DATABASE_URL
DISCOVERY_DATABASE_ADMIN_URL
DISCOVERY_DATABASE_MIGRATION_URL
DISCOVERY_RUNTIME_STORAGE_BACKEND=vercel-blob
DISCOVERY_RUNTIME_BLOB_PREFIX=discovery/runtime/v1
BLOB_READ_WRITE_TOKEN
DISCOVERY_ALPHA_ORGANIZATION_ID
DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED=true
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
```

Database URLs must require TLS. Use:

- the Neon pooled application endpoint for `DISCOVERY_DATABASE_URL`;
- a least-privilege administrative endpoint for access lifecycle operations;
- the direct Neon endpoint for migrations;
- a connected private Vercel Blob store for hosted Runtime persistence.

Local development, benchmarks, and replay continue to use:

```text
DISCOVERY_RUNTIME_STORAGE_BACKEND=filesystem
DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY=/absolute/local/path
```

Vercel preview and production must use `vercel-blob`; they cannot use `/tmp`
as durable Runtime storage. `DISCOVERY_RUNTIME_BLOB_PREFIX` is optional and
defaults to `discovery/runtime/v1`. A connected private store supplies
`BLOB_READ_WRITE_TOKEN`; provider-managed OIDC may instead use
`VERCEL_OIDC_TOKEN` with `BLOB_STORE_ID`.

Run before release:

```bash
npm run deployment:validate-environment
npm run deployment:validate-runtime-storage
```

The validator prints no secret values. Secrets belong in the deployment
platform's encrypted environment, never `.env`, build output, logs, or Git.

## Runtime Storage, Provisioning, and Recovery

Both backends implement read, existence check, create, revision-safe replace,
backup, and restore without changing the Runtime JSON model:

- `filesystem` preserves exact bytes and uses atomic rename for local work.
- `vercel-blob` uses authenticated private objects, consistent uncached reads,
  deterministic organization keys, and ETag-conditional writes.

The active key is:

```text
discovery/runtime/v1/organizations/<organizationId>/runtime.json
```

Named backups are immutable objects at:

```text
discovery/runtime/v1/organizations/<organizationId>/backups/<backupId>.json
```

The repository never enumerates organization objects. The activation loader
supplies only the exact organization id after authorization succeeds.

`deployment:provision-design-partner` verifies the reviewed local Runtime,
its organization identity, product readiness, uploaded bytes, and retrieved
digest. Existing objects are refused unless `--allow-overwrite true` is
explicitly supplied; replacement first creates an immutable named backup.

Use backend-neutral backup and restore:

```bash
DISCOVERY_OPERATION_OPERATOR_ID=EXACT_OPERATOR_ID \
DISCOVERY_OPERATION_REQUEST_ID=EXACT_REQUEST_ID \
npm run deployment:runtime-recovery -- backup EXACT_ORGANIZATION_ID BACKUP_ID

DISCOVERY_OPERATION_OPERATOR_ID=EXACT_OPERATOR_ID \
DISCOVERY_OPERATION_REQUEST_ID=EXACT_REQUEST_ID \
npm run deployment:runtime-recovery -- restore EXACT_ORGANIZATION_ID BACKUP_ID
```

Restore is revision-conditional and fails closed on a concurrent update.
Operational logs contain identifiers, backend, outcome, revision, and digest,
never Runtime content. Application rollback does not automatically restore
Runtime; a named Runtime restore is a separate reviewed operation.

## Neon PostgreSQL Procedure

1. Create one PostgreSQL 17 Neon project in the selected region.
2. Retain the Neon owner only for setup and recovery.
3. Configure direct migration, administration, and pooled application URLs.
4. Run:

```bash
npm ci
npm run deployment:validate-environment
npm run storage:status
npm run storage:migrate
npm run storage:migrate
npm run deployment:validate-database
```

The first migration is a clean install. The second run is the idempotent
upgrade check. The canonical runner uses Drizzle's PostgreSQL journal at
`drizzle.__drizzle_migrations`. `storage:status` is non-mutating and reports
exactly one of `EMPTY`, `PENDING`, `CURRENT`, `DRIFTED`, `PARTIAL`, or
`UNKNOWN`. Migration execution is accepted only from `EMPTY`, `PENDING`, or
`CURRENT`; it refuses inconsistent schema, edited applied SQL, and unknown
history. A PostgreSQL advisory lock serializes concurrent attempts.

The journal stores Drizzle's ordered migration timestamp and SHA-256 content
hash. Status cross-checks journal identity and digest against committed files,
then verifies the complete tables, indexes, constraints, functions, triggers,
roles, and grants. Governance objects without a journal and journal entries
without the complete schema report `PARTIAL`; an applied digest mismatch
reports `DRIFTED`.

`deployment:validate-database` verifies PostgreSQL 17, the
governance tables, all three enforcement triggers, application connectivity,
and bounded pooled concurrency.

Before migrating an existing hosted database, create a Neon branch or
point-in-time restore marker. Database rollback means restoring that isolated
branch and deploying the preceding application release. The migration is
additive; do not use the local destructive reset against Neon.

Local PostgreSQL 17 validation demonstrated the complete 19-check journal
matrix, clean reconstruction, concurrent serialization, transactional failure
rollback, edited-history rejection, idempotent upgrade, schema status, and the
existing 60-check append-only storage contract. Neon migration and recovery
remain unexecuted. A verified Neon recovery branch is still required before
the Production migration command may run.

## Clerk Deployment

1. Create or select one Clerk production instance.
2. Configure the production domain and approved sign-in method.
3. Store the publishable and secret keys in the application host.
4. Create the design-partner user and record the immutable Clerk user id.
5. Do not use Clerk organization membership or client claims as Discovery
   authority.
6. Verify in a deployed browser:
   - sign in reaches only the provisioned organization;
   - sign out clears the session and blocks the route;
   - expired, revoked, and missing sessions never reach Runtime loading;
   - a different Clerk user and organization query are denied.

Middleware now protects only the feature-flagged `Your Organization` path.
Discovery's durable access record remains the organization authorization
owner. Local identity validation passes, but live Clerk behavior is not
demonstrated without production keys and a deployed domain.

## Staged Organization Provisioning

The supported operator workflow requires an already produced canonical
organization Runtime. It does not create or invent cognition.

Gate 5 provisions Runtime only:

```bash
npm run deployment:provision-design-partner -- \
  --operation runtime \
  --organization EXACT_ORGANIZATION_ID \
  --actor EXACT_OPERATOR_ID \
  --runtime-source /secure/path/organization-runtime.json \
  --runtime-sha256 REVIEWED_RUNTIME_SHA256 \
  --idempotency-key UNIQUE_RUNTIME_KEY
```

Gate 6 provisions access only after the Runtime exists:

```bash
npm run deployment:provision-design-partner -- \
  --operation access \
  --organization EXACT_ORGANIZATION_ID \
  --consumer EXACT_CLERK_USER_ID \
  --actor EXACT_OPERATOR_ID \
  --idempotency-key UNIQUE_ACCESS_KEY
```

The Runtime operation:

- verifies exact organization identity;
- rejects a Runtime without a completed investigation;
- rejects a Runtime without canonical Organizational Understanding;
- writes the Runtime atomically to the persistent volume;
- preserves a prior Runtime backup when replacing;
- retrieves and verifies exact bytes, digest, organization identity, and
  schema;
- never opens the governance database or grants access.

The access operation verifies that the Runtime exists, then grants
idempotent organization-scoped Alpha access and its transactional lifecycle
event. The access record is the existing canonical organization-to-Clerk
mapping; no parallel organization or identity store is introduced. It never
writes Runtime.

Gate 7 remains an external deployment operation. It sets the exact Alpha
organization and activation flag, deploys, checks health, and runs replay. It
does not provision Runtime or access. Each gate therefore has an independent
idempotency key and rollback boundary and requires no manual database editing.

Repository reconstruction found no persisted Runtime currently containing a
canonical composition. A product-ready design-partner Runtime must therefore
be produced through the existing investigation pipeline or securely supplied
before hosted provisioning. This is a deployment blocker; this sprint does not
manufacture cognition to bypass it.

## Product

The enabled path remains:

```text
Clerk authentication
  → durable access lookup
  → Runtime load
  → authority-qualified disclosure
  → Organizational Understanding Projection
  → Product Communication Plan
  → Your Organization communication adapter
  → existing Your Organization UI
```

Runtime is loaded exactly once and only after access eligibility. Missing
Runtime, projection, communication, database, or audit support fails closed.
Other product pages and mutation APIs remain unavailable to the bounded Alpha.

## Monitoring and Logging

`/api/health` returns only:

- configuration readiness;
- database connectivity;
- expected Runtime-file presence;
- a request id.

It does not load or expose organizational cognition. Configure the deployment
platform to poll this endpoint and alert after consecutive failures.

The active path emits structured JSON events for:

- request start;
- access denial;
- Runtime failure;
- database configuration failure;
- audit/transaction failure;
- completed disclosure.

Each event includes a request id and bounded organization id, but no identity
token, database credential, evidence, explanation, projection, or
communication body.

Minimum alerts:

- readiness remains `503`;
- repeated database or audit failures;
- repeated Runtime failures;
- private Blob authentication or object-read failure.

## Recovery and Rollback

### Runtime

```bash
npm run deployment:runtime-recovery -- \
  backup EXACT_ORGANIZATION_ID BACKUP_ID

npm run deployment:runtime-recovery -- \
  restore EXACT_ORGANIZATION_ID BACKUP_ID
```

Backup and restore produce SHA-256 evidence, use the configured repository,
reject organization mismatch, and fail closed on revision conflicts.

### Database

Use Neon point-in-time recovery or a pre-migration branch. Restore into
isolation, run `deployment:validate-database`, inspect the exact access record,
then promote through Neon's supported procedure.

### Application

1. Set `DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED=false` for immediate product
   rollback.
2. Redeploy the preceding immutable release.
3. Keep the append-only audit and access records.
4. Validate `/api/health`.
5. Verify the route has returned to the Phase 8A fallback.

No Runtime or cognition migration is required for the feature-flag rollback.

Hosted database restore, persistent-volume restore, and release rollback still
require execution on the selected providers before external access.

## Deployment Checklist

- [x] Critical and high production dependency audit findings removed
- [x] Next 15 production build passes
- [x] Environment and secret-shape validator
- [x] Configurable absolute persistent Runtime location
- [x] PostgreSQL 17 migration and schema validator
- [x] Idempotent operator provisioning workflow
- [x] Structured request and failure logging
- [x] Bounded health/readiness endpoint
- [x] Runtime backup and restore tooling
- [x] Local authorization, disclosure, projection, communication, and product replay
- [ ] Neon project, roles, pooled URL, PITR, and monitoring provisioned
- [ ] Production Clerk instance and domain verified
- [ ] Persistent application Runtime volume provisioned
- [ ] Product-ready customer Runtime supplied
- [ ] Exact customer access record provisioned
- [ ] Hosted health check and alerts verified
- [ ] Hosted database and Runtime recovery drill passed
- [ ] Deployed application rollback passed
- [ ] Actual authenticated browser replay passed

## Support Checklist

- Name one deployment owner and one customer-session owner.
- Retain the immutable release identifier and exact environment revision.
- Record the design partner's Clerk user id, Discovery organization id, and
  access-record id in the secure operator runbook.
- Confirm backup age before every session.
- Review health, Runtime, database, and audit failures before the session.
- Keep the activation flag rollback available to the on-call operator.
- Never troubleshoot by editing governance tables or Runtime JSON manually.
- Revoke access with `storage:alpha-access revoke` if the relationship ends.

## Validation

Completed locally:

- production audit: zero vulnerabilities;
- dependency clean install;
- Next 15 typecheck and production build;
- PostgreSQL 17 clean migration and idempotent upgrade;
- hosted-database contract validator against representative PostgreSQL 17;
- environment validation without printing secrets;
- existing storage, Clerk, disclosure, governance, projection,
  communication, organization-experience, Runtime, cognition, architecture,
  benchmark, and activation gates.

Not completed:

- Neon migration, pooling, role, PITR, and restore;
- real Clerk sign-in, sign-out, expiry, revocation, and missing-session replay;
- hosted Runtime persistence/recovery;
- hosted deployment and rollback;
- actual design-partner end-to-end session.

## Known Limitations and Blockers

1. The Vercel production linkage is known, but its project identity,
   credentials, environment, domain, and deployment evidence are unavailable
   in this workspace.
2. No repository Runtime currently contains the canonical composition required
   by the activated route.
3. Live Clerk and Neon behavior remains unmeasured.
4. Health monitoring and alerts exist as deployable controls but are not
   configured on a host.
5. Development-only audit findings remain accepted; the production graph is
   clean.
6. Only `Your Organization` is supported. Research, Ask, Decisions, Brief,
   Experiments, and organization switching remain inactive.

## Recommendation

Do not invite the design partner yet. The software-side deployment work is
bounded and locally valid, but real-customer readiness requires the unchecked
provider tasks above. Provision Neon, Clerk, a persistent Runtime volume, and a
product-ready organization Runtime; then execute the hosted recovery and
authenticated browser replay. If every unchecked deployment item passes,
enable the flag for the single provisioned design partner.
