# Onboarding Test Environment

## Purpose

This environment exercises Discovery onboarding without production data,
production Clerk identities, Atlas, or the production Runtime. It composes the
existing Clerk authentication, governance access records, Organization Runtime,
investigation pipeline, and product workspace. It does not introduce a parallel
organization model.

The environment fails closed. Onboarding test operations require an explicit
`DISCOVERY_ENV` of `development` or `staging`, matching public environment
labels, an explicit server and browser enable flag, Clerk test keys, and storage
that passes the isolation checks. `production` is always refused.

## Environment boundary audit

| Concern | Production implementation | Existing non-production option | Gap addressed here |
| --- | --- | --- | --- |
| Authentication | Clerk middleware and production instance keys | Clerk development instances through the same SDK | Test-key validation and protected onboarding routes |
| Database | Configured remote PostgreSQL/Neon governance store | Existing PostgreSQL repositories accept local URLs | All three configured URLs must be localhost |
| Runtime storage | Private Vercel Blob repository | Existing filesystem Runtime repository | Absolute, visibly onboarding-isolated directory required |
| Organization provisioning | Bounded Atlas design-partner provisioner | Empty Runtime and governance repository primitives | Idempotent `onb-dev-` composition that never invokes Atlas |
| Onboarding routes | General routes rejected by production route policy | Existing organization/context form and investigation API | Authenticated state resolver and canonical rendered `/onboarding` entry |
| Access control | Clerk identity plus governed organization access records | Same repository contract | Exact test-user access grant; no authorization weakening |
| Reset tooling | No production reset by design | Local migration reset was database-wide | Exact-user, exact-organization, dry-run-first reset |
| Environment identification | Deployment-specific flags without one onboarding boundary | Filesystem and development-provider options existed independently | Explicit contract, startup summary, and shell badge |

The production route policy, Atlas provisioner, disclosure contracts, immutable
audit records, and canonical Runtime architecture are unchanged.

`DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED` remains the Production Hosted Alpha
rollout and rollback control. The isolated local onboarding environment keeps
that flag disabled. After the complete environment contract above validates,
the local sandbox may use the same Hosted Alpha presentation through its
separate fail-closed presentation predicate. This is not a general development
default and grants no provisioning authority or Atlas access.

## Local development setup

1. Create or select a Clerk development instance. In its dashboard, create a
   disposable test user (or allow sign-up) with a non-production email address.
   Do not reuse a production Clerk instance or production user.
2. Start a local PostgreSQL server and create a database dedicated to onboarding
   testing.
3. Copy `.env.example` to `.env.local` and set the following values:

   ```text
   DISCOVERY_ENV=development
   NEXT_PUBLIC_DISCOVERY_ENV=development
   DISCOVERY_ONBOARDING_TEST_ENABLED=true
   NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED=true
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   DISCOVERY_DATABASE_URL=postgresql://localhost/discovery_onboarding
   DISCOVERY_DATABASE_ADMIN_URL=postgresql://localhost/discovery_onboarding
   DISCOVERY_DATABASE_MIGRATION_URL=postgresql://localhost/discovery_onboarding
   DISCOVERY_RUNTIME_STORAGE_BACKEND=filesystem
   DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY=/absolute/path/to/discovery-onboarding-runtime
   DISCOVERY_ALPHA_ORGANIZATION_ID=
   DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED=false
   DISCOVERY_RUNTIME_PROVISIONING_ENABLED=false
   DISCOVERY_ACCESS_PROVISIONING_ENABLED=false
   ```

4. Apply the existing governance schema with `npm run storage:migrate`.
5. Run `npm run validate:onboarding-test-environment`.
6. Start Discovery with `npm run onboarding:test:dev`, sign in through the Clerk development
   instance, and open `/`.

Do not print or commit `.env.local`. The product shell displays a Development or
Staging badge, but never a key, token, database address, or other secret.
The startup command prints only the validated environment class, provider class,
storage backend, and optional isolation identifier. Confirm it reports
`development`, `localhost`, `filesystem`, and `clerkInstance: development`.

## Routing and state

The authenticated `/onboarding` entry resolves state from existing access
records and Runtime metadata:

- no active organization access: render new onboarding at `/onboarding`;
- one active organization with no completed investigation: render resumable
  onboarding at `/onboarding`;
- one active organization with a completed investigation:
  `/your-organization?organizationId=...`;
- multiple active organizations: `/organizations`.

`/discovery-v1` remains directly accessible for legacy compatibility, but no
onboarding state resolver selects it as a destination.

The first investigation provisions an organization with the reserved
`onb-dev-` prefix, an empty filesystem Runtime, and an exact governance access
record. The operation is deterministic for a Clerk user and browser request ID,
so retries do not create duplicate organizations. The existing investigation
pipeline then evolves the Runtime and the existing workspace renders it.

The route, organization/access creation, Runtime creation, investigation, and
first workspace destination are operational. Evidence collection remains the
existing text/context onboarding surface. Document choices displayed by that
screen are presentation-only; this task does not add document ingestion.

## Reset a test user

Reset is dry-run by default:

```bash
npm run onboarding:test:reset -- --email person@example.com
```

Limit the preview to one exact onboarding-owned organization:

```bash
npm run onboarding:test:reset -- --email person@example.com --organization onb-dev-...
```

## Investigation retry integrity

The local onboarding API derives a canonical SHA-256 fingerprint from the
organization identity, normalized investigation fields, and canonically
ordered evidence provenance and content. Runtime metadata records the
request identity and fingerprint before cognition begins.

- An identical or normalization-equivalent retry reuses the completed
  canonical response without rerunning cognition or advancing Runtime history.
- Reusing one request identity for materially different input fails closed.
- A currently in-progress identical request does not start a second mutation.
- A recoverable pre-persistence failure may retry the same request identity.
- Added or changed evidence produces a new fingerprint and exactly one new
  investigation.
- Evidence added after an insufficient first attempt is treated as completion
  of the initial evidence set, not by itself as a later organizational
  observation.

The browser-generated investigation request identity is content-derived for
safe interrupted replay. Enforcement remains authoritative in
`runOrganizationInvestigation()`; client state is not trusted for idempotency.

After reviewing the JSON plan, apply the same command with `--apply`.

The utility validates the environment before contacting Clerk or PostgreSQL. It
resolves exactly one matching Clerk development user, considers only
`onb-dev-...` access history, revokes any active access while retaining
lifecycle audit history, and deletes only the exact local Runtime file when no
other consumer has ever held access to that organization. It preserves the
Clerk identity and shared Runtime state. Any ambiguity or partial failure exits
nonzero.

## Staging contract

The environment contract also validates staging configuration. Staging must have a unique
`DISCOVERY_NON_PRODUCTION_ISOLATION_ID`. Every configured PostgreSQL hostname
and the Vercel Blob prefix must contain that identifier. Staging must use Clerk
test keys and isolated Blob authentication. Organization creation and reset in
this implementation deliberately remain local-development-only because their
filesystem guarantees do not apply to Blob storage; staging onboarding must not
be enabled until equivalent isolated Blob lifecycle operations exist.

## Validation scenarios

`npm run validate:onboarding-test-environment` checks the production refusal
guards and these deterministic scenarios:

- A: a brand-new user enters onboarding;
- B: an interrupted user resumes and a retry remains idempotent;
- C: a completed user returns to the organization workspace;
- D: an invited user enters an existing organization;
- E: reset state returns a user to first-run onboarding.

The validator uses in-memory repositories and synthetic test keys. It does not
connect to or mutate Clerk, PostgreSQL, Runtime storage, or production.
