# Phase 2.1 — Organization Onboarding Foundation

**Status:** Implemented foundation

## Outcome

Discovery now has a canonical, provider-independent onboarding orchestration
contract. It converts the manual activation sequence into bounded stages with
deterministic identity, idempotency keys, observable transitions, restartable
receipts, independent validation, failure classification, and a concise
operational summary.

No Production operation invokes this foundation yet.

## Architecture

The implementation is in `lib/onboarding`:

- `types.ts` defines lifecycle, receipt, stage, dependency, and summary
  contracts.
- `onboardingReceipt.ts` creates deterministic receipts and validates retries.
- `onboardingStages.ts` owns the eight bounded stage operations.
- `runOrganizationOnboarding.ts` executes or resumes the first incomplete
  stage and emits receipt observations.
- `summarizeOnboarding.ts` projects operator-facing visibility.
- `index.ts` exposes the bounded public surface.

The lifecycle is:

```text
Created
→ ConfigurationValidated
→ RuntimeProvisioned
→ GovernanceProvisioned
→ UsersAssigned
→ HealthVerified
→ SmokeTestPassed
→ Ready
```

`Failed` records the exact stage, stable failure code, recoverability, and
operator action.

## Implementation behavior

- Completed stages are skipped when the last receipt is supplied.
- Runtime is inspected before provisioning.
- Existing Runtime must match the requested digest.
- Access is inspected per exact consumer before assignment.
- Runtime and access idempotency keys are deterministic.
- Health and smoke tests are separate stages.
- Receipt transitions are observable at `Running`, `Succeeded`, and `Failed`.
- Receipt mismatch and state conflicts fail closed.
- No stage deletes or overwrites existing state.

## Validation

`npm run validate:onboarding-foundation` verifies:

- deterministic stage order;
- running-state observability;
- complete ready receipts;
- no-op completed retries;
- resume from the first failed stage;
- no repeated Runtime or access mutation on retry;
- fail-closed Runtime digest conflict;
- bounded exact-user assignment;
- ready operational summary.

The validation uses in-memory adapters and performs no network, database,
Runtime, Clerk, Blob, or deployment mutation.

## Noninterference

This sprint does not change:

- Runtime contracts or persistence;
- governance records or repositories;
- authorization or organization resolution;
- disclosure;
- Clerk authentication;
- health behavior;
- provisioning routes or feature flags;
- the canonical Discovery Experience;
- Production environment configuration.

The orchestration has no Production adapter, route, UI, or automatic startup
integration. Existing Alpha behavior therefore remains unchanged.

## Remaining Phase 2.1 work

Before operating against a new organization:

1. Implement a reviewed operator adapter over existing bounded provisioning
   operations.
2. Choose durable receipt storage outside Runtime and governance authority.
3. Add a dry-run operator command.
4. Validate default-disabled authority and independent stage enablement.
5. Add adapter-level rollback guidance without automatic destructive recovery.
6. Run a non-Atlas organization rehearsal in an isolated environment.
7. Review the resulting receipt before enabling any Production operation.

## Future evolution

Phase 2.2 should expose customer-friendly progress and input collection while
keeping this lifecycle authoritative underneath. The first product increment
should collect organization identity, understanding objective, participant
scope, and initial context, then hand exact inputs to a reviewed onboarding
adapter. Connector ingestion and goal-directed retrieval remain later Phase 2
work.
