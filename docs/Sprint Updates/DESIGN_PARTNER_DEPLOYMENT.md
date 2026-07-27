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
DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY
DISCOVERY_ALPHA_ORGANIZATION_ID
DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED=true
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
```

Database URLs must require TLS. Use:

- the Neon pooled application endpoint for `DISCOVERY_DATABASE_URL`;
- a least-privilege administrative endpoint for access lifecycle operations;
- the direct Neon endpoint for migrations;
- an absolute path on a persistent mounted volume for the Runtime directory.

Run before release:

```bash
npm run deployment:validate-environment
```

The validator prints no secret values. Secrets belong in the deployment
platform's encrypted environment, never `.env`, build output, logs, or Git.

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
upgrade check. `deployment:validate-database` verifies PostgreSQL 17, the
governance tables, all three enforcement triggers, application connectivity,
and bounded pooled concurrency.

Before migrating an existing hosted database, create a Neon branch or
point-in-time restore marker. Database rollback means restoring that isolated
branch and deploying the preceding application release. The migration is
additive; do not use the local destructive reset against Neon.

Local PostgreSQL 17 validation demonstrated clean install, idempotent upgrade,
schema status, append-only enforcement, and local reset. Neon provisioning,
roles, pooling, PITR, and restore remain unmeasured here.

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

## Organization and Access Provisioning

The supported operator workflow requires an already produced canonical
organization Runtime. It does not create or invent cognition.

```bash
npm run deployment:provision-design-partner -- \
  --organization EXACT_ORGANIZATION_ID \
  --consumer EXACT_CLERK_USER_ID \
  --actor EXACT_OPERATOR_ID \
  --runtime-source /secure/path/organization-runtime.json \
  --idempotency-key UNIQUE_PROVISIONING_KEY
```

The command:

- verifies exact organization identity;
- rejects a Runtime without a completed investigation;
- rejects a Runtime without canonical Organizational Understanding;
- writes the Runtime atomically to the persistent volume;
- preserves a prior Runtime backup when replacing;
- grants idempotent organization-scoped Alpha access through the repository;
- restores the prior Runtime if the access grant fails;
- requires no manual database editing.

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
- unexpected process restart or persistent-volume unavailability.

## Recovery and Rollback

### Runtime

```bash
npm run deployment:runtime-recovery -- \
  backup EXACT_ORGANIZATION_ID /secure/backups/runtime.json

npm run deployment:runtime-recovery -- \
  restore EXACT_ORGANIZATION_ID /secure/backups/runtime.json
```

Backup and restore produce SHA-256 evidence and reject organization mismatch
or a non-product-ready Runtime.

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
