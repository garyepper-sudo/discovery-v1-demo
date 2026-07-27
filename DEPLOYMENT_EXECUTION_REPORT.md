# Discovery Design Partner Deployment Execution Report

## Status

**DEPLOYMENT BLOCKED — NO EXTERNAL RESOURCES MUTATED**

Discovery's repository-side deployment foundation is present, but the first
design-partner deployment could not be executed from this environment.

## Execution Audit

The deployment runbook and current worktree were reviewed before external
action. The following required inputs are absent:

- Neon credentials or an authenticated Neon console session;
- Clerk production keys or an authenticated Clerk dashboard session;
- Vercel project credentials, project metadata, or deployment CLI;
- a production domain;
- an existing hosting manifest;
- a design-partner Clerk user id;
- an exact design-partner organization id;
- a product-ready design-partner Runtime containing canonical Organizational
  Understanding;
- a selected persistent Runtime volume;
- a named deployment owner and support contact.

Local environment inspection found only OpenAI development configuration.
There is no `.openai/hosting.json`, `.vercel/project.json`,
`.env.production`, Neon environment, Clerk environment, or deployment CLI.
Repository ownership information supplied after the execution attempt confirms
that Vercel production is connected to this GitHub repository and deploys from
the default `main` branch; the specific Vercel project and credentials remain
unavailable locally.

## Provider Access

### Neon

The Neon console was opened at:

```text
https://console.neon.tech/app/projects
```

It redirected to the Neon authentication boundary. No authenticated Neon
session is available, so no project, branch, role, database, pooled endpoint,
PITR setting, migration, or secret was created.

### Clerk

The Clerk dashboard was opened at:

```text
https://dashboard.clerk.com/
```

It redirected to the Clerk sign-in page. No authenticated Clerk session is
available, so no production instance, domain, sign-in method, user, session,
or secret was created.

### Application Hosting

Vercel is the known production provider and watches `main`. The repository now
contains a private Vercel Blob Runtime adapter and explicitly rejects
filesystem or `/tmp` persistence on Vercel. No Blob store was created or
connected during this sprint; provider configuration and hosted validation
remain external.

## Configuration

No production secrets were generated, transmitted, stored, or written.

The required configuration remains:

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

The three database URLs must identify the chosen Neon pooled application,
administration, and direct migration endpoints. Hosted Runtime storage requires
a connected private Blob store. Local development, benchmarks, replay, and
tooling retain `DISCOVERY_RUNTIME_STORAGE_BACKEND=filesystem` with an absolute
`DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY`.

The adapter preserves exact Runtime JSON bytes and schema, deterministic
organization keys, consistent reads, ETag-conditional replacement, immutable
backup, and revision-conditional restore. Provisioning refuses overwrite
unless explicitly authorized and never logs Runtime content.

## Provisioning

No real organization, Runtime, or Alpha access record was provisioned.

Provisioning requires:

1. exact organization id;
2. immutable Clerk consumer id;
3. named operator id;
4. product-ready Runtime whose metadata matches the organization id;
5. migrated Neon administration connection;
6. connected private Runtime object store.

The supported workflow is now staged. Provision Runtime first:

```bash
npm run deployment:provision-design-partner -- \
  --operation runtime \
  --organization EXACT_ORGANIZATION_ID \
  --actor EXACT_OPERATOR_ID \
  --runtime-source /secure/path/organization-runtime.json \
  --runtime-sha256 REVIEWED_RUNTIME_SHA256 \
  --idempotency-key UNIQUE_RUNTIME_KEY
```

Then provision access without touching Runtime:

```bash
npm run deployment:provision-design-partner -- \
  --operation access \
  --organization EXACT_ORGANIZATION_ID \
  --consumer EXACT_CLERK_USER_ID \
  --actor EXACT_OPERATOR_ID \
  --idempotency-key UNIQUE_ACCESS_KEY
```

Activation is a third external deployment operation and performs neither
provisioning step.

### Gate 5 Production Control Boundary

The reviewed Runtime artifact and Production deployment passed preflight, but
hosted Gate 5 stopped before upload because the deployed route used one enable
flag for both Runtime and access operations. The repository now resolves that
control-boundary defect with two default-disabled authorities:
`DISCOVERY_RUNTIME_PROVISIONING_ENABLED` gates only Runtime provisioning and
its diagnostic, while `DISCOVERY_ACCESS_PROVISIONING_ENABLED` gates only
access provisioning. The shared secret and fixed request scope remain
mandatory, but neither enable flag authorizes the other operation.

Focused validation covers neither enabled, Runtime only, access only, and both
enabled. Even when both are enabled, the explicit operation header routes to
one bounded implementation; Runtime cannot grant access and access cannot
write Runtime. No provider configuration, Blob object, governance record,
deployment, or Alpha activation changed while implementing this separation.

### Gate 5 Runtime-Only Hosted Retry

The reviewed `fc504518b3acd8f2e8acb11f566772ce078cc86c` release was verified
live in Production. Only Runtime provisioning and a temporary one-time secret
were enabled. Access provisioning and Alpha remained disabled and returned
404 throughout the attempt.

Production request-context OIDC passed its project, team, environment, and
store checks. The exact Atlas object was absent before the write. The
conditional first-create request then returned HTTP 409 with the bounded
`alpha-runtime-provisioning-failed` event. The current bounded route log does
not record the underlying exception class. An immediate exact-object
diagnostic proved that the object remained absent, so no restore or deletion
was required and no retry was attempted.

Read-only Neon verification remained:

- access records: 0;
- lifecycle events: 0;
- disclosure events: 0.

The Runtime authority and temporary secret were removed, the same reviewed
release was redeployed, and Runtime provisioning, access provisioning, and
Alpha again return 404. Gate 5 remains incomplete and Gate 6 is blocked until
the create failure can be classified without exposing credentials or Runtime
contents.

### Gate 5 409 Resolution

Bounded instrumentation classified the provider rejection exactly: Vercel
Blob reported that the deterministic pathname already existed when
`allowOverwrite: false` was used, although authenticated exact-key `head`
checks reported no readable object. The failure was a provider namespace
collision at the configured `discovery/runtime/v1` prefix.

Discovery retained conditional first-create and no-overwrite behavior. The
smallest safe correction moved Production to the fresh deterministic
`discovery/runtime/v2` prefix. Temporary diagnostics were removed before the
final retry.

The final Runtime-only request returned `RUNTIME_PROVISIONED`, revision
`565031538731594771a09f65e2dbd432`, and the approved Atlas digest. The
repository's immediate authenticated read-back verified exact bytes, digest,
organization identity, and schema. No access, lifecycle, disclosure, or Alpha
state changed. Runtime authority and the one-time secret were removed after
the upload, while the v2 prefix and stored Runtime remain configured.

Gate 5 is complete. Gate 6 access-only provisioning is the next launch step.

Repository inspection found no clean persisted Runtime with canonical
composition available for a real customer. Benchmark-generated state is not a
permitted substitute.

## Hosted Validation

The application is deployed, but the following cannot be executed until the
private Blob store and remaining Alpha resources are configured:

- Neon PostgreSQL validation;
- production migration and idempotent upgrade;
- pooled application connection validation;
- Clerk login and logout;
- expired, revoked, and missing Clerk sessions;
- access-before-Runtime verification using the real provider;
- wrong-user and wrong-organization isolation;
- hosted Runtime load;
- authority-qualified disclosure;
- projection;
- Product Communication Plan;
- Your Organization communication adapter;
- rendered Your Organization page;
- hosted readiness check;
- database restore;
- Runtime restore;
- release rollback;
- feature-flag rollback in the deployed environment.

Local validation from the preceding deployment-readiness sprint remains useful
repository evidence, but it is not hosted execution evidence.

## External Actions Required to Resume

The deployment can resume when the user provides or establishes:

1. an authenticated Neon console session or scoped Neon credentials;
2. an authenticated Clerk dashboard session or the production Clerk keys;
3. access to configure the existing Vercel production project;
4. a connected private Vercel Blob store;
5. the design partner's exact Clerk user id;
6. the exact Discovery organization id;
7. the canonical product-ready Runtime file;
8. the deployment owner/operator id.

After those inputs exist, execute the runbook in this order:

1. provision Neon and its recovery point;
2. migrate and validate PostgreSQL;
3. configure Clerk and create or identify the user;
4. configure hosted secrets and persistent Runtime storage;
5. provision Runtime and Alpha access atomically;
6. deploy with the Alpha flag initially disabled;
7. verify readiness;
8. enable only `Your Organization`;
9. run the complete authenticated and denial replay;
10. exercise feature-flag, release, Runtime, and database rollback;
11. restore the successful release and conduct the first supported session.

## Remaining Issues

All remaining issues are external deployment inputs or hosted execution gates.
No new product, cognition, architecture, benchmark, Governance, or roadmap work
is required to clear them.

## Conclusion

The first design partner has **not** been deployed. Reporting otherwise would
misrepresent the absence of Neon, Clerk, hosting, customer identity, customer
Runtime, hosted validation, and rollback evidence.
