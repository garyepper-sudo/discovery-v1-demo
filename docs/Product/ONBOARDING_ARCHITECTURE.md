# Discovery Organization Onboarding Architecture

**Status:** Phase 2.1 foundation

## Purpose

The user-facing onboarding experience is question-first. It begins with
“What are you trying to understand?” and acquires additional Evidence only
after the objective is known. Operating Model construction, organization
configuration, and file upload remain supporting system capabilities rather
than onboarding objectives.

Completed onboarding communicates through Product Translation and Truthful
Utility. It may produce Supported, Provisional, or Insufficient Product
Understanding without changing canonical authority.

Discovery organization onboarding is a bounded orchestration capability that
turns independently authorized operator operations into one deterministic,
observable, restartable lifecycle. It composes the accepted Alpha
infrastructure; it does not replace or weaken Runtime, governance,
authorization, organization resolution, disclosure, health, or authentication
contracts.

The Phase 2.1 foundation is operator-facing. It establishes the contract that
can later support customer self-service without embedding provider behavior or
Production authority in the state machine.

## Principles

- A stage owns one responsibility.
- Every mutation is preceded by inspection and followed by validation.
- Stable organization, Runtime, and consumer identities are supplied exactly;
  the workflow never guesses them.
- Idempotency keys derive from the receipt, stage, and exact subject.
- A succeeded stage is never repeated during receipt-based retry.
- Conflicting existing state fails closed.
- Provider credentials and operational authority remain outside the
  orchestration contract and default-disabled.
- Authorization continues to precede Runtime retrieval on product paths.

## Lifecycle

```text
Created
  ↓
ConfigurationValidated
  ↓
RuntimeProvisioned
  ↓
GovernanceProvisioned
  ↓
UsersAssigned
  ↓
HealthVerified
  ↓
SmokeTestPassed
  ↓
Ready
```

Any incomplete stage may transition to `Failed`. A recoverable failure resumes
at that same stage. An unrecoverable identity or digest conflict requires
operator intervention and a corrected request rather than an automatic retry.

The lifecycle separates governance readiness from user assignment.
`GovernanceProvisioned` verifies that the existing durable governance stores
are ready; `UsersAssigned` creates or verifies exact access records through an
adapter to the existing governance contract.

## Stage ownership

| Stage | Responsibility | Independent validation |
| --- | --- | --- |
| `Created` | Validate exact organization and initial-user inputs | Identifier, name, and consumer checks |
| `ConfigurationValidated` | Validate environment and bounded operational authority | Adapter-provided configuration checks |
| `RuntimeProvisioned` | Inspect or provision exactly one organization Runtime | Presence, organization identity, and digest |
| `GovernanceProvisioned` | Verify durable governance readiness | Access and lifecycle store checks |
| `UsersAssigned` | Inspect or assign exact initial consumers | Active access per consumer |
| `HealthVerified` | Verify organization readiness | Named configuration, database, and Runtime checks |
| `SmokeTestPassed` | Exercise the authorized canonical path | Named resolution and product-path checks |
| `Ready` | Close the receipt after every prior success | All stages, health, and smoke results |

## Authoritative receipt

`OrganizationOnboardingReceipt` is the authoritative onboarding artifact. Its
deterministic identifier is derived from the onboarding contract version and
organization ID. It contains:

- organization ID and name;
- a request fingerprint, requested Runtime digest, and exact initial consumers;
- lifecycle and current stage;
- ordered stage status, attempts, timestamps, explanations, validations,
  warnings, and failures;
- Runtime location, digest, revision, and provisioning time;
- exact consumer/access assignments;
- health and smoke-test results;
- retry eligibility, retry stage, and operator action;
- creation, update, and completion timestamps.

The orchestrator emits an immutable copy of the receipt whenever a stage
enters `Running`, `Succeeded`, or `Failed`. An operator adapter is responsible
for durably storing those observations. Receipt persistence is intentionally
not coupled to Runtime or governance persistence.

## Retry and idempotency

The caller supplies the last authoritative receipt when retrying.

1. Receipt version, identifier, organization, name, and stage order must match.
2. Every `Succeeded` stage is skipped.
3. Execution starts at the first stage not marked `Succeeded`.
4. Runtime and access stages inspect current state before mutation.
5. Existing matching state is accepted.
6. Missing state is created with a deterministic idempotency key.
7. Existing conflicting state fails closed.

This makes a completed rerun a no-op and prevents retries from duplicating
Runtime objects, access records, or lifecycle events when adapters honor the
existing persistence contracts.

## Failure recovery

Recoverable failures include transient configuration validation, unavailable
providers, failed health checks, and failed smoke tests. Correct the external
condition and retry with the last receipt.

Unrecoverable failures include invalid organization identity, invalid initial
consumer identity, incompatible receipt identity, and an existing Runtime
whose digest conflicts with the request. These require a corrected request or
an explicitly reviewed operator decision.

Operator intervention points are recorded as machine-readable failure codes,
retry eligibility, and a bounded action on both the failed stage and receipt.
The workflow never automatically deletes, overwrites, restores, or changes
authority to recover.

## Operational summary

`summarizeOnboarding` projects the receipt into:

- organization;
- current stage;
- completed stages;
- remaining stages;
- health;
- warnings;
- ready state.

This projection is suitable for logs and a future operator UI. It does not
grant authority or replace the receipt.

## Provider adapters

Phase 2.1 defines dependency contracts for configuration validation, Runtime
inspection/provisioning, governance validation, access inspection/assignment,
health, smoke testing, receipt observation, and time.

Production adapters must compose the existing:

- Organization Runtime repository;
- bounded provisioning operations;
- PostgreSQL governance repositories;
- authorized organization resolution;
- bounded health contract;
- canonical `/your-organization` path.

Adapters must retain the accepted independent feature flags and operator
authorization controls. This foundation is not wired to a route, UI, startup
hook, or Production command, so it cannot currently mutate Production.

## Future customer experience

Phase 2.2 may project the same lifecycle into a guided customer journey:

```text
Welcome
  ↓
What organization are we modeling?
  ↓
What are you trying to understand?
  ↓
Who should participate?
  ↓
Connect data sources
  ↓
Retrieve initial evidence
  ↓
Identify knowledge gaps
  ↓
Generate initial organizational understanding
  ↓
Welcome to Discovery
```

Customer-facing steps may collect intent and inputs, but the underlying
operator stages remain deterministic and independently validated. Connectors,
retrieval, billing, and automatic document scanning are later capabilities and
are not part of this foundation.
