# Alpha Explicit Allowlist Disclosure Producer Shadow

**Status:** Inactive shadow demonstrated
**Policy:** `alpha-explicit-allowlist-disclosure@1`
**Classification:** B — live identity deployment and durable stores remain missing

## Purpose

This sprint implements the bounded shadow authorized by the Alpha Governance
Activation Strategy. It proves that an explicit verified identity, an explicit
Discovery-owned organization access record, and exact current authority
receipts can produce and enforce a deterministic consumer-specific disclosure
decision without activating a route.

It does not implement authentication, a production access store, durable
audit, route enforcement, general membership, Intelligence Scope, Runtime
changes, cognition, projection, communication, or UI behavior.

## Inherited decision

The selected transitional model is an explicit per-user/per-organization
allowlist. Clerk remains the selected production identity provider. A
subsequent inactive shadow added an official server adapter, but no route was
activated. The shared Alpha password remains a preview gate and is not
authorization.

The shadow policy supports only:

- an explicitly verified consumer;
- one exact organization;
- the `organization` experience;
- organization-wide Alpha read access;
- one current request;
- active, versioned access records; and
- exact authority-qualified canonical composition revisions.

Everything else denies.

## Contracts

### Verified identity

`VerifiedConsumerIdentity` requires:

- stable `consumerId`;
- provider `clerk`;
- nonempty verification provenance; and
- explicit `verifiedAt`.

Only benchmark-owned inputs construct this type in the shadow. Production must
construct it after real provider verification. Email, query parameters, shared
passwords, and implicit default users are not identity.

### Access record

`AlphaOrganizationAccessRecord` preserves:

- access-record, policy, consumer, and organization identity;
- the single supported experience;
- exact organization scope;
- active or revoked state;
- creation and optional expiry time; and
- an optional explicit predecessor record.

It is stored outside Runtime and supplied through
`AlphaAccessRecordReader`. The repository contains no database implementation
or production fixture fallback.

The resolver accepts one valid terminal record or one complete deterministic
supersession chain. Duplicates, disconnected records, cycles, malformed scope,
wildcards, missing predecessors, conflicting terminals, or attempted silent
reactivation after revocation fail closed.

### Authority receipt

`AlphaCanonicalAuthorityReceipt` is a reference envelope over the existing
`CanonicalUnderstandingAuthorityTransition`. It binds:

- organization;
- composition;
- exact revision; and
- the complete canonical authority transition

to a deterministic receipt ID. It does not redefine authority. A missing,
modified, foreign, duplicated, stale, or historical receipt cannot disclose a
composition.

### Decision and audit

The producer reuses
`OrganizationalUnderstandingDisclosureDecision` and
`OrganizationalUnderstandingDisclosureResult`. Its additive provenance
envelope records policy, experience, access-record provenance, exact requested,
disclosed, and safely withheld composition references, resolution time, and
stable reason codes.

Decision and audit IDs are SHA-256 identities over normalized explicit inputs.
The evaluator reads no ambient clock, random source, environment authorization,
network, Runtime store, route, projection, or communication object.

The audit event contains no narrative, Evidence body, hidden content, session
token, or credential. The validator's append-only sink proves event shape and
copy isolation only. No durable audit persistence is claimed.

## Authorization-before-Runtime sequence

```text
benchmark-owned verified identity
        ↓
injected AlphaAccessRecordReader
        ↓
organization access preflight
        ├── denied / revoked / invalid → no Runtime load
        └── eligible
                ↓
        injected persisted Runtime loader
                ↓
        exact composition revisions and authority receipts
                ↓
        request-time disclosure decision
                ↓
        existing disclosure enforcement
                ↓
        existing Organizational Understanding Projection
                ↓
        existing Product Communication Plan
                ↓
        inactive Your Organization communication adapter
                ↓
        compatibility candidate view
```

The shadow loader reads the persisted Atlas Runtime exactly once after a
successful preflight. A benchmark-owned production-shaped Explanation supplies
one current authority-qualified composition because the checked-in Atlas
fixture is historical and has no canonical composition receipts. The fixture
never enters production code or Runtime.

Denied, revoked, invalid, guessed-organization, and reader-failure requests do
not invoke the Runtime loader. Loader failure and Runtime identity mismatch
terminate the chain without a resolution.

## Request-time validity and revocation

- Decisions are recomputed for every request.
- `resolvedAt` is an explicit input.
- There is no cross-request cache.
- A changed resolution time, composition revision, authority receipt, policy,
  or access record produces a new decision.
- Access records are the shadow's current revocation source.
- Revocation suppresses the next request before Runtime loading.
- A prior disclosed result remains an unchanged historical fact and grants no
  future access.
- The canonical decision does not invent a predecessor decision when no
  durable decision history exists.

## Threat results

The focused validator covers:

- missing, malformed, unsupported-provider, wildcard, and future-dated
  identity;
- missing, revoked, expired, foreign, malformed, duplicate, conflicting,
  cyclic or invalidly reactivated access;
- guessed organization and unsupported experience;
- access-reader failure;
- denial-before-loader and successful-loader-once;
- loader failure and Runtime identity mismatch;
- foreign or malformed compositions;
- missing, modified, foreign, duplicate, stale, and historical authority
  receipts;
- supporting-object disclosure bypass;
- stale request-time decisions;
- revocation between requests;
- shared-password and query-parameter non-authority;
- audit narrative exclusion and append-only shape;
- Runtime non-mutation;
- inactive route isolation;
- no Clerk SDK, production store, or benchmark import in the policy producer;
  and
- no User Intelligence or Local Understanding Utility claim.

Every unsafe case fails closed.

## Validation evidence

Focused result: `61/61 PASS`.

Deterministic hashes from the validation replay:

| Artifact | SHA-256 |
| --- | --- |
| Preflight | `fc0cf63a6d06b9b4cf1106e913d35d32b75c2908b54a8f545ad54470cc9c6955` |
| Decision envelope | `75919513db38010ce79a7c8713281e04818c6d4ed25ff7e38e2de20a6e4d5c31` |
| Audit event | `38abe61941e20867d2cced78f179e29d63ed76a952d43e26dc91fb0dda834163` |
| Projection | `c780b1a8aedd844a3ba588ac9d83ce95e3acb016f195a7094724ee61124846b8` |
| Communication plan | `207fa8dde90d8cd47b51c294b5fb3fe6f946ab855768862e2febf72c522d7b3f` |
| Communication view | `11550a7051f460d5091329c109a8d2714a0f80c3a25c7865f7973816aed1b268` |
| Candidate view | `e9af00eb7862770ab1cef7a264929918e8519b5fab137fe024141f80d572e614` |
| Runtime before and after | `ce267f9e34bc60f94d4c1e16e0a153042f5d8a5b1d54ee4633999c17041fc9cc` |

The focused hash table must be refreshed if the producer or validator changes.
Native regression commands and their outputs remain authoritative.

## Demonstrated

- explicit verified-identity contract;
- explicit versioned allowlist contract;
- injected access-reader boundary;
- deterministic access preflight;
- authorization before Runtime loading;
- exact request-time policy and decision provenance;
- active, revoked, expiry, and bounded supersession behavior;
- exact composition revision and authority receipt validation;
- existing disclosure enforcement;
- complete inactive projection and communication delivery;
- audit-ready event shape;
- fail-closed unsafe cases;
- Runtime byte stability; and
- active-route noninterference.

## Still missing for hosted Alpha

- live Clerk deployment configuration and real-session verification;
- a durable Discovery-owned access-record store;
- a controlled administrative path to create, supersede, expire, and revoke
  records;
- a durable append-only bounded audit-event store;
- deployment secrets and provider configuration;
- production operational alerts and failure handling;
- inactive integration against real provider identity and durable stores;
- production route integration;
- activation and rollback review; and
- explicit limited-Alpha authorization.

The injected reader is not a production access store. The benchmark identity
in this validator is not a Clerk session; the separate Clerk identity validator
covers the inactive server boundary. The in-memory audit sink is not durable
audit.

## Scorecard and DEPS posture

| Metric | Movement |
| --- | --- |
| Organizational Understanding | Unchanged |
| User Intelligence | Not Measured |
| Collective Intelligence | Not Measured |
| Governance Integrity | Improved at the inactive shadow boundary |
| System Sustainability | Improved through isolated typed interfaces |

Complexity increased through one producer module, one focused validator, and
DEPS evidence. The increase is justified by a reusable fail-closed boundary
and exact rollback. Product behavior is unchanged.

## Rollback

Remove:

- `engine/v3/governance/alphaAllowlistDisclosureProducer.ts`;
- the focused validator and package command;
- its DEPS source, manifest, and report; and
- this documentation synchronization.

No Runtime, cognition, disclosure enforcement, projection, communication,
route, UI, schema, dependency, or persisted organization rollback is required.

## Recommendation

The Clerk identity shadow is now complete. The next authorized step is a
read-only **Durable Alpha Access and Audit Storage Decision Sprint**. It should
select storage and lifecycle architecture without implementing stores or
activating a route.

**B — PRODUCER CONTRACT VALID; IDENTITY OR DURABLE ACCESS INTEGRATION REQUIRED**
