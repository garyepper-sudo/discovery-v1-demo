# Discovery Hosted Alpha Activation Report

Date: 2026-07-27

Classification: A — All Pre-Mutation Blockers Resolved

## Gate 4 Migration Journal Remediation — 2026-07-27

Gate 4 previously stopped before mutation because the custom migration runner
treated `alpha_access_records` existence as migration state and ignored the
database journal.

The canonical runner now uses the installed Drizzle PostgreSQL migrator and
its standard `drizzle.__drizzle_migrations` log:

- `id serial primary key`;
- `hash text not null`, containing the migration SQL SHA-256;
- `created_at bigint`, containing the ordered timestamp from
  `db/migrations/meta/_journal.json`.

The exact Production commands remain:

```bash
npm run storage:status
npm run storage:migrate
```

Status is read-only and returns one of `EMPTY`, `PENDING`, `CURRENT`,
`DRIFTED`, `PARTIAL`, or `UNKNOWN`. It checks the database journal against the
ordered committed files and verifies every reviewed governance table, index,
constraint, function, trigger, role, and grant. Migration execution refuses
partial, drifted, or unknown state and uses a session advisory lock to
serialize concurrent attempts.

Isolated PostgreSQL 17.10 validation passed 19 journal scenarios, including
empty state, first application, second-run no-op, missing journal, missing
schema, edited SQL digest, transactional failure rollback, concurrent
execution, and clean reconstruction. Exactly one journal row was retained.
The existing PostgreSQL storage suite remained 60/60, and the hosted database
validator passed against the isolated database.

Hosted Neon was not contacted or mutated during this remediation. Gate 4 has
not passed. Before restarting it, the operator must create and record the
Neon recovery branch `pre-gate4-governance-migration` from the active
Production branch head.

## Gate 4.2a Recovery Verification and Migration — 2026-07-27

The Neon recovery point was independently verified before migration:

- name: `pre-gate4-governance-migration`;
- branch ID: `br-curly-night-afpu45kz`;
- parent: `production`;
- parent branch ID: `br-bitter-unit-afa9tns5`;
- created at: `2026-07-27 12:04:29 -0700`;
- creation mode: branch data and schema from the current parent head.

Strictly read-only transactions against both direct connections confirmed
PostgreSQL `17.10`, database `neondb`, authorized TLS 1.3, correct Neon branch
identity, and an identical bounded pre-migration schema fingerprint:
`a3b99ddcea352bde8477fce298be703c936a9d07e00e2c170383db067944caf9`.
Both inventories contained zero relevant relations, columns, constraints,
triggers, functions, or Alpha roles. The Drizzle journal, governance tables,
access records, lifecycle records, disclosure records, and database Runtime
objects were absent.

From that verified `EMPTY` state, the reviewed migration applied once to
Production. Canonical status then reported `CURRENT`, one expected and one
applied migration, a present journal, complete schema, and no missing objects.
A second migration invocation was a no-op. Hosted validation confirmed
PostgreSQL 17, the complete governance schema, all three append-only
enforcement triggers, and pooled application connectivity.

A final read-only comparison proved that Production moved to fingerprint
`4e0bd19638481f8284aebde723072257833254f11c380f364e0ce53c0da5afa4`
while the recovery branch retained the exact empty pre-migration fingerprint.
The recovery branch still contains no migration journal, governance tables,
access records, lifecycle records, disclosure records, Runtime objects, or
Alpha roles. No Runtime, access, audit, Blob, Clerk, or Vercel configuration
mutation occurred.

## Gate 5 Runtime Provisioning Attempt — 2026-07-27

Gate 5.1 passed for the frozen Atlas Runtime:

- source:
  `.local-provisioning/atlas-manufacturing-simulation.runtime.json`;
- organization ID: `atlas-manufacturing-simulation`;
- byte length: `3,328,426`;
- SHA-256:
  `8c3ad0b42c53f7027d3f0cb0a12457e84a25c03063b4c6a47d14a8fe23bef5fa`;
- JSON parsing, Runtime normalization, organization identity, completed
  investigation, canonical Organizational Understanding, and completed
  Explanation requirements passed.

Gate 5.2 stopped before the exact-key result could be established. Vercel CLI
`env run --environment production` loaded the Production variables and
provided the correct project, owner, and Blob store identity, but its bounded
OIDC claims were scoped to `environment:development`. Private Vercel Blob
rejected the read-only `HEAD` request because the connected store permits OIDC
for the Production environment, not development.

The raw token, credentials, and URLs were not printed. No backend-neutral
backup was created because Gate 5.2 did not pass. No Runtime was uploaded, no
Blob object was written, no access/lifecycle/disclosure record was created,
and no Vercel configuration or Alpha flag changed. Gate 5 can continue only
from a Production request-context execution surface or another
provider-supported Production-scoped credential.

## Gate 5 Production Route Audit — 2026-07-27

The existing protected Production route was audited before invocation. Its
Production request-context OIDC diagnostic mode is read-only, but its only
write mode calls `provisionDesignPartner`. That operation creates or replaces
the Runtime and then grants the scoped Alpha access record. It does not expose
a Runtime-only write mode.

For a first upload, the repository correctly refuses overwrite but there is no
existing Runtime to pass to the repository's backup operation. Consequently,
the write path creates no pre-upload backup. If the subsequent access grant
fails on this first-upload path, `backupId` is absent and the current
compensation branch cannot restore a previous Runtime.

Invoking the route would therefore violate both Gate 5 constraints: no access
grant and backup before upload. Adding a Runtime-only mode would require a code
change and Production redeployment, which this gate explicitly forbids.
Execution stopped before any hosted request. No diagnostic, Blob read/write,
Runtime upload, database operation, access/lifecycle/disclosure record,
configuration change, Alpha activation, or redeployment occurred.

## Staged Provisioning Architecture — 2026-07-27

The protected Production route now exposes two explicit write operations
through the existing authentication, fixed Atlas scope, Runtime repository,
and bounded logging boundary:

1. `x-discovery-provisioning-operation: runtime` validates the frozen Runtime,
   performs conflict and conditional replacement checks, backs up an existing
   Runtime before replacement, uploads, reads back, and verifies bytes,
   digest, organization identity, and schema. It never opens the governance
   database or creates access.
2. `x-discovery-provisioning-operation: access` requires the exact Runtime to
   exist, then uses the existing PostgreSQL repository to create the canonical
   organization-to-Clerk access mapping and transactional lifecycle event. It
   never writes or replaces Runtime.
3. Activation remains outside the provisioning route. The operator sets
   `DISCOVERY_ALPHA_ORGANIZATION_ID` and
   `DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED`, deploys, verifies health, and
   runs replay only after Gates 5 and 6 pass.

The route no longer calls the coupled `provisionDesignPartner` composition.
The CLI accepts the same explicit `runtime` or `access` operation. Existing
repositories, digest checks, conflict behavior, replacement backup, Runtime
normalization, access transaction, lifecycle semantics, and disclosure
boundaries remain unchanged. No second provisioning architecture, identity
store, authorization policy, or activation owner was introduced.

Focused validation demonstrates Runtime upload with zero access writes,
access grant with zero Runtime writes, activation recognition with zero
provisioning writes, and fail-closed access before Runtime. These are isolated
validation results; the decoupled route has not yet been deployed or invoked
against Production.

## Gate 5 Runtime-Only Execution Stop — 2026-07-27

Production release `f88e9d8f8e6ae5c15b060a54c5608ea159660639`
was correlated to successful Vercel Production deployment
`dpl_Fek5Vx1Hv6BXLfT1W26g4phwgQH4`. The deployment was `READY`, targeted
Production, served the Production alias, and included the protected
provisioning route. Before execution, both the protected route and
`/your-organization` returned 404. Alpha remained disabled.

The frozen Runtime passed the bounded preflight:

- path:
  `.local-provisioning/atlas-manufacturing-simulation.runtime.json`;
- organization ID: `atlas-manufacturing-simulation`;
- byte length: `3,328,426`;
- SHA-256:
  `8c3ad0b42c53f7027d3f0cb0a12457e84a25c03063b4c6a47d14a8fe23bef5fa`;
- investigations: 3;
- completed Explanations: 3;
- canonical Organizational Understanding compositions: 10;
- Evidence lineage present;
- no credential, email, customer-data, or fixture-reference pattern detected.

Execution stopped at Gate 5.2 before provider configuration or Blob access.
Although the route dispatches `runtime` and `access` independently, both write
operations use the same `DISCOVERY_PROVISIONING_OPERATION_ENABLED` flag and
the same operator secret. Enabling that flag would enable the access operation
as well as Runtime provisioning, violating the Gate 5 requirement that access
provisioning remain disabled.

No Vercel variable was added or changed. No redeployment, Production
diagnostic, Blob read/write, Runtime upload, database operation, access record,
lifecycle event, disclosure event, Alpha organization setting, or Alpha
activation occurred. The exact continuation requirement is a reviewed,
default-disabled Runtime-specific enable control that cannot authorize the
access operation.

## Production Blob OIDC Gate 3 Recovery — 2026-07-27

The first launch attempt stopped before mutation when a local exact-key Blob
read returned 403. Bounded claims proved that `vercel env run --environment
production` set `VERCEL_ENV=production` but minted an OIDC token whose subject
and `environment` claim were both `development`. Its project and team claims
matched `discovery-v1-demo` and `discovery-os`.

Root-cause classification:

```text
WRONG_ENVIRONMENT_OIDC_TOKEN
```

The failure therefore does not establish a Production Function authorization
defect. `@vercel/blob` 2.6.1 already delegates token acquisition to
`@vercel/oidc` 3.8.1, whose supported helper checks the Vercel request context
before its environment fallback.

The protected one-shot route now has an authenticated, Production-only
diagnostic mode. It validates the request-context token's Production and
project claims, then performs only the deterministic Atlas Runtime existence
check. Its bounded response excludes raw tokens, credentials, Runtime bytes,
and organization enumeration. Focused validation covers Production
request-context recognition and fail-closed behavior for development,
wrong-project, expired, and missing tokens.

The diagnostic was deployed from commit
`4d705e40efdf765710828e68c0a615601b18a08c` and invoked through the Production
alias with a temporary sensitive operation secret. Hosted evidence confirmed:

- `VERCEL_ENV=production`;
- request-context OIDC present and environment-variable OIDC absent;
- issuer `https://oidc.vercel.com/discovery-os`;
- audience `https://vercel.com/discovery-os`;
- subject scoped to project `discovery-v1-demo` and `environment:production`;
- project `prj_4W6ASUOhAu9ScTsQEklYgdHsYVnz`;
- team `team_w0EeqjE5iHRsGT1WOAnl7mkO`;
- connected private store `store_E5CmGzzbA6DnZkbl`;
- `EXACT_OBJECT_ABSENT_NO_CONFLICT` for the deterministic Atlas Runtime key.

The raw token, credentials, Runtime bytes, and unrelated object identities were
not returned. The temporary secret and enable flag were removed immediately
after the check, the same commit was redeployed, and the diagnostic route was
verified to return 404 again.

Read-only Neon checks found all three governance tables and the Drizzle
migration journal absent. Therefore the Atlas organization, scoped Clerk user,
lifecycle, and disclosure-audit conflict counts are zero by schema absence.
All application, administration, and migration endpoints again negotiated
authorized TLS 1.3.

Gate 3 is complete. No migration, Blob write, access grant, Alpha organization
configuration, or Alpha feature activation occurred. The exact continuation
step is Gate 4: run the reviewed governance migrations, verify idempotency and
the required tables/triggers, and stop on any failure.

## Resume Audit — 2026-07-27

The activation was resumed with these confirmed identifiers:

- Clerk test user: `user_3H5yQgEI6LpgRv7CeNoZsRGvu3p`
- Deployment operator: `discovery-alpha-operator`
- Organization: Atlas Manufacturing
- Organization ID: `atlas-manufacturing-simulation`

The canonical Atlas pipeline completed successfully and regenerated a
production-eligible synthetic Runtime with:

- 3 completed investigations;
- 10 canonical Organizational Understanding compositions;
- completed organizational explanation memory;
- the exact `atlas-manufacturing-simulation` organization ID;
- candidate SHA-256
  `dd8db73577c6ca495697419446aafa289e02b70b309d19831f868828d07cab69`.

The candidate passed the existing projection, communication, disclosure,
Organization Experience, and hosted Runtime repository gates:

- projection compatibility: 43 checks;
- communication adapter: 69 checks;
- Organization Experience: 10 view, 11 adapter, and 3 replay checks;
- disclosure producer: pass with zero Runtime mutation;
- hosted Runtime repository: 28 checks.

Two pipeline runs produced the same substantive cognition but different raw
bytes because the canonical pipeline records current timestamps and
timestamp-derived identifiers and references. The selected candidate had a
fixed digest, but no upload was attempted.

Vercel CLI access to `discovery-os/discovery-v1-demo` remains authenticated.
Production variable metadata confirms that the required Neon, Blob, and Clerk
variables exist. Those variables are stored using Vercel's non-readable
`sensitive` type. Both `vercel env pull` and `vercel env run` supplied
`[SENSITIVE]` placeholders or omitted the values, so the repository migration,
database validation, Blob conflict check, and atomic provisioning commands
could not authenticate from this operator environment.

Activation stopped again before hosted mutation. No migration, Blob upload,
access record, environment-variable change, feature-flag change, or
redeployment was performed by the resume attempt.

### Exact Manual Credential Bridge

In a secure local operator terminal, create an ignored mode-600 environment
file containing the real values of:

```text
DISCOVERY_DATABASE_URL
DISCOVERY_DATABASE_ADMIN_URL
DISCOVERY_DATABASE_MIGRATION_URL
BLOB_READ_WRITE_TOKEN
DISCOVERY_RUNTIME_STORAGE_BACKEND=vercel-blob
DISCOVERY_RUNTIME_BLOB_PREFIX=discovery/runtime/v1
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
```

Do not paste those values into chat or commit them. Confirm only that the file
is available and provide its local path. Activation can then resume with
read-only database and Blob conflict checks, followed by the reviewed
migration and atomic provisioning workflow. The organization and Alpha flag
must remain unset until those gates pass.

## Final Pre-Mutation Blocker Resolution Attempt — 2026-07-27

The canonical Atlas pipeline was run again under the explicit requirement that
the regenerated Runtime match the previously reviewed SHA-256 exactly.

The generated artifact contained the expected canonical Atlas cognition, but
its digest was:

```text
9cb70c74fe51e60929b23bb76709ba0b3f1030a0cb12aad6c43deb48711b8928
```

The required reviewed digest was:

```text
dd8db73577c6ca495697419446aafa289e02b70b309d19831f868828d07cab69
```

The byte mismatch is consistent with the previously observed canonical
pipeline behavior: each run records current timestamps and timestamp-derived
identifiers and references. The cognition may be substantively equivalent,
but byte identity is not reproducible from the current pipeline.

The sprint required an exact digest and prohibited accepting semantic
similarity. Work therefore stopped at the Phase 1 hard gate. The mismatched
ignored artifact was deleted, and the tracked Atlas Runtime was restored.

No Neon query or migration, Blob operation, production execution-surface
implementation, access grant, hosted environment change, Alpha activation, or
deployment was performed during this attempt.

### Remaining Resolution

One of the following reviewed inputs is required before the sprint can resume:

1. restore the exact previously reviewed Runtime bytes whose SHA-256 is
   `dd8db73577c6ca495697419446aafa289e02b70b309d19831f868828d07cab69`;
   or
2. explicitly authorize review and adoption of a newly generated artifact with
   its new immutable digest.

Changing the canonical pipeline to make timestamps deterministic would alter
cognition/Runtime generation behavior and was not authorized by this sprint.

## Pre-Mutation Gates Resolved — 2026-07-27

The historical `dd8db735...` Runtime is no longer the provisioning
requirement. A new canonical Atlas Runtime was generated once, reviewed, and
frozen at the locally ignored path:

```text
.local-provisioning/atlas-manufacturing-simulation.runtime.json
```

The file is mode 600, is not a production fallback, contains no real customer
or personal data, and is not tracked by Git.

### Approved Runtime Artifact

- Organization: Atlas Manufacturing
- Organization ID: `atlas-manufacturing-simulation`
- Generated at: `2026-07-27T18:09:02.556Z`
- Canonical schema: canonical `OrganizationRuntime` root; no separate root
  schema-version field
- Byte length: 3,328,426
- Approved SHA-256:
  `8c3ad0b42c53f7027d3f0cb0a12457e84a25c03063b4c6a47d14a8fe23bef5fa`
- Investigations: 3
- Completed Organizational Explanations: 3
- Canonical Organizational Understanding compositions: 10
- Evidence records: 50
- Contradictions: 2
- Investigation opportunities: 10

The frozen artifact passed canonical normalization and provisioning
eligibility. It also passed disclosure without Runtime mutation, projection,
projection compatibility, Product Communication, the 69-check communication
adapter, Organization Experience, and the 28-check hosted Runtime repository
gate. Re-reading the frozen file after all validations produced the same
SHA-256.

The tracked historical Atlas fixture remains unchanged because authority
compatibility benchmarks intentionally require its pre-authority state.

### Neon TLS Classification

Classification: `CHECKER_FALSE_NEGATIVE`

All three configured endpoints retain `sslmode=require` and completed an
authorized PostgreSQL TLS negotiation:

| Purpose | Endpoint | Protocol | Cipher | Certificate |
| --- | --- | --- | --- | --- |
| Application | Pooled | TLS 1.3 | `TLS_AES_256_GCM_SHA384` | Authorized |
| Administration | Direct | TLS 1.3 | `TLS_AES_256_GCM_SHA384` | Authorized |
| Migration | Direct | TLS 1.3 | `TLS_AES_256_GCM_SHA384` | Authorized |

`pg_stat_ssl` reports the Neon proxy-to-compute leg, which is why it returned
false for these sessions. The corrected validation performs the PostgreSQL
SSLRequest handshake against each client-facing endpoint, requires a valid
certificate, and records protocol and cipher without printing a hostname,
URL, username, password, or credential.

### Protected Production Provisioning Operation

The reviewed operation is:

```text
POST /api/internal/provision-atlas-runtime
```

It is available only when `VERCEL_ENV=production` and is disabled unless
`DISCOVERY_PROVISIONING_OPERATION_ENABLED=true`. Outside Production or when
disabled, it returns 404. Execution additionally requires an unguessable
`DISCOVERY_PROVISIONING_OPERATION_SECRET`, supplied in the protected request
header.

The operation accepts the frozen Runtime as a raw authenticated JSON request
body. This avoids committing it, exposing a public artifact URL, or placing
the 3.3 MB Runtime in an environment variable. The request is bounded to
4 MB.

The route accepts only the reviewed Atlas organization ID, Clerk consumer ID,
operator ID, frozen digest, and an explicit idempotency key. These values are
compared to the fixed reviewed scope before the Runtime body is processed.

The shared provisioning service:

- validates the exact digest before any repository call;
- parses and normalizes the canonical Runtime;
- verifies organization identity, completed investigation, completed
  Explanation, and canonical composition eligibility;
- performs Runtime and access conflict checks before writes;
- refuses overwrite on the production route;
- preserves existing ETag-conditional replacement and backup behavior for the
  operator CLI;
- retrieves and verifies bytes after storage;
- grants organization-scoped access through the existing PostgreSQL
  repository;
- emits a bounded receipt without Runtime or credential content.

After a successful execution, the only allowed organization has both a
Runtime and access record. Subsequent attempts fail the preflight conflict
checks before writes. The operator must then remove or set the enable flag to
false and redeploy.

This operation was validated with isolated repositories only. It was not
executed against Neon or Blob. No hosted data, access record, environment
variable, Alpha flag, or deployment was changed.

### Validation

- clean dependency installation: pass
- production dependency audit: 0 vulnerabilities
- typecheck: pass
- production build: pass
- canonical benchmark suite: 15/15
- protected provisioning operation: 16 checks
- hosted Runtime storage: 28 checks
- production reachability: 38 checks
- Clerk identity: 28 checks
- Alpha activation: 23 checks
- PostgreSQL storage: 60 checks
- authority transitions: 14 checks
- disclosure contract: 14 checks
- projection compatibility: 43 checks
- communication adapter: 69 checks
- Organization Experience: 10 view, 11 adapter, and 3 replay checks
- Atlas canonical simulation: pass
- Northstar Ground Truth: 75/100
- Neon TLS validation: pass
- architecture: accepted baseline of 295/302, 98%, seven historical findings
- DEPS: pass

### Exact Continuation Sequence

1. Create an unguessable one-time operation secret.
2. Configure the operation enable flag and secret for Production while leaving
   the governed Alpha feature flag disabled.
3. Deploy the reviewed code and confirm the operation returns 401 without the
   secret and rejects incorrect scope or digest.
4. Create the Neon recovery point and run the reviewed migration and hosted
   database validator.
5. Send the frozen Runtime bytes once with the exact reviewed headers and a
   unique idempotency key.
6. Verify the bounded receipt, Runtime digest, access record, lifecycle event,
   and exact-key backup.
7. Disable the operation immediately and redeploy.
8. Configure the Alpha organization ID, complete pre-activation health and
   authorization checks, then enable the governed Alpha separately.

## Scope

This report records the pre-mutation audit for the first hosted Alpha
activation. No Neon schema, Blob object, Clerk user, Vercel environment
variable, deployment, access record, feature flag, or hosted Runtime was
created or changed.

## Repository and Deployment

- Repository branch: `main`
- Local and remote commit:
  `50d7322749c30641a8f4c65fa70c6b01bce96aef`
- Production application: `https://discovery-v1-demo.vercel.app`
- Vercel project: `discovery-os/discovery-v1-demo`
- Vercel project access: authenticated and read-only inspection demonstrated
- Tracked worktree before the audit: clean
- Preserved stash: `stash@{0}` was not applied or dropped

The production environment contains configured variable names for Clerk,
three Discovery PostgreSQL connections, the private Blob store, the Runtime
storage backend, and the Runtime Blob prefix. Secret values were not read,
printed, or recorded.

`DISCOVERY_ALPHA_ORGANIZATION_ID` and
`DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED` are not configured in Production.
The governed Alpha therefore remains disabled.

## Candidate Organization Runtime

Repository evidence identifies the canonical synthetic Atlas benchmark:

- Organization name: Atlas Manufacturing
- Organization ID: `atlas-manufacturing-simulation`
- Runtime source:
  `.discovery-runtime/organizations/atlas-manufacturing-simulation.json`
- Runtime SHA-256:
  `ce267f9e34bc60f94d4c1e16e0a153042f5d8a5b1d54ee4633999c17041fc9cc`
- Embedded organization ID: `atlas-manufacturing-simulation`
- Completed investigation count: 3
- Canonical Organizational Understanding compositions: 0

The Runtime is tracked and explicitly associated with the Atlas simulation,
but it is not eligible for hosted provisioning. The repository provisioning
command requires at least one canonical Organizational Understanding
composition and will reject this file.

A scan of all tracked organization Runtime JSON files found no Runtime with a
canonical composition. Generating or inventing cognition was outside this
sprint and was not attempted.

If a reviewed eligible Runtime is later supplied for this organization, its
deterministic private object key will be:

```text
discovery/runtime/v1/organizations/atlas-manufacturing-simulation/runtime.json
```

## Missing Required Inputs

The following inputs were not available:

- reviewed canonical Runtime containing at least one canonical Organizational
  Understanding composition;
- exact immutable Clerk test-user ID;
- confirmed deployment operator ID;
- confirmed Neon production branch/database identity and recovery point.

Repository evidence supports `discovery-alpha-operator` only as a recommended
operator identifier. It was not adopted without explicit confirmation.

## Commands Reconstructed

Reviewed migration and validation commands:

```bash
npm run storage:status
npm run storage:migrate
npm run storage:migrate
npm run deployment:validate-database
```

Reviewed atomic provisioning command:

```bash
npm run deployment:provision-design-partner -- \
  --organization EXACT_ORGANIZATION_ID \
  --consumer EXACT_CLERK_USER_ID \
  --actor EXACT_OPERATOR_ID \
  --runtime-source /secure/path/organization-runtime.json \
  --idempotency-key UNIQUE_PROVISIONING_KEY
```

Reviewed backend-neutral recovery commands:

```bash
DISCOVERY_OPERATION_OPERATOR_ID=EXACT_OPERATOR_ID \
DISCOVERY_OPERATION_REQUEST_ID=EXACT_REQUEST_ID \
npm run deployment:runtime-recovery -- backup EXACT_ORGANIZATION_ID BACKUP_ID

DISCOVERY_OPERATION_OPERATOR_ID=EXACT_OPERATOR_ID \
DISCOVERY_OPERATION_REQUEST_ID=EXACT_REQUEST_ID \
npm run deployment:runtime-recovery -- restore EXACT_ORGANIZATION_ID BACKUP_ID
```

The only reviewed migration is
`db/migrations/0000_alpha_governance_foundation.sql`. Hosted reset is
explicitly prohibited; the reset command is guarded for localhost only.

## Stop Condition

Activation stopped before external mutation because:

1. no reviewed Runtime satisfies the provisioning contract;
2. the exact Clerk test-user ID is unavailable;
3. organization identity cannot be configured until a matching eligible
   Runtime is reviewed;
4. Blob conflict, access-record conflict, Neon recovery, authorization, and
   authenticated replay gates therefore cannot yet be completed safely.

No database migration, Blob upload, access grant, Vercel configuration change,
redeployment, browser sign-in, rollback, or recovery demonstration was
performed. Current hosted health remains the pre-activation fail-closed state
and was not represented as ready.

## Exact Continuation Sequence

1. Produce through the existing investigation pipeline, or securely supply, a
   reviewed synthetic Runtime with a canonical Organizational Understanding
   composition.
2. Confirm its exact organization ID, parse it, validate its canonical schema,
   and record its SHA-256 digest.
3. Supply the immutable Clerk test-user ID and explicitly confirm the
   deployment operator ID.
4. Confirm the Neon production branch/database and create a safe branch or
   point-in-time recovery marker.
5. Pull provider secrets into an isolated operator environment without
   printing or committing them.
6. Inspect migration state and run only the reviewed additive migration,
   idempotent upgrade, and hosted database validator.
7. Check the exact Runtime Blob key and organization access record for
   conflicts without enumerating other organizations.
8. Run the atomic provisioning command without overwrite. If a conflict
   exists, stop for an explicit backup-and-replacement review.
9. Verify Runtime bytes and digest after retrieval, then create and read a
   named immutable backup.
10. Configure `DISCOVERY_ALPHA_ORGANIZATION_ID` while leaving the Alpha flag
    disabled; redeploy and complete every pre-activation gate.
11. Enable `DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED=true` only after all
    gates pass.
12. Complete health, authenticated browser, negative authorization, tenant
    isolation, feature-flag rollback, and revision-conditional Runtime
    recovery demonstrations.

## Recommendation

Do not activate the hosted Alpha yet. The infrastructure appears bounded and
accessible, but the required governed identity and product-ready synthetic
Runtime inputs are not available. Resume from the continuation sequence once
those exact inputs have been reviewed.
