# Discovery Hosted Alpha Activation Report

Date: 2026-07-27

Classification: C — Hosted Alpha Activation Blocked

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
