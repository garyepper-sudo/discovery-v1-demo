# Discovery Alpha Governance Identity Foundation Complete

## Status

The Alpha access architecture is selected. The explicit allowlist disclosure
producer and official Clerk identity adapter are implemented and validated as
inactive shadows. The complete disclosure-to-product delivery chain is
demonstrated without changing the active route, middleware, UI, Runtime,
schemas, cognition, projection, communication, or persistence.

Durable access and audit storage are absent. A deployed Clerk session has not
been verified. Hosted Alpha remains inactive. This document and the foundation
package are committed together by the canonization sprint.

## Purpose

Discovery now has a production-shaped consumer identity and authorization
boundary without weakening canonical cognition, authority, or Runtime
ownership. Authentication, organization access, canonical authority,
disclosure, and presentation remain distinct responsibilities.

## Architecture

```text
Clerk server-verified identity
        ↓
VerifiedConsumerIdentity
        ↓
Discovery-owned organization access
        ↓
authority-qualified disclosure
        ↓
existing Organizational Understanding projection
        ↓
existing Product Communication Plan
        ↓
inactive Your Organization communication adapter
        ↓
candidate product view
```

Clerk owns authenticated user and session lifecycle. Discovery owns access
records, access policy, expiry, supersession, revocation, authority
validation, disclosure decisions, and audit semantics. Runtime owns none of
authentication, Alpha membership, access records, or disclosure-audit history.
The shared Alpha password remains an outer preview gate only.

## Alpha policy

The exact transitional policy is:

`alpha-explicit-allowlist-disclosure@1`

It supports one server-verified Clerk consumer, one explicit Discovery
organization, the `organization` experience, one current request, one valid
terminal access-record chain, and exact current composition revisions with
valid authority receipts.

It does not support wildcard access, inferred access from organization
existence, email identity, client-supplied identity, query-parameter identity,
Clerk Organizations, membership, roles, permissions, Intelligence Scope, or
general Governance.

## Authorization before Runtime

Identity is verified first. Discovery access eligibility is checked second.
Unauthenticated, malformed, unavailable, missing, expired, revoked,
conflicting, or invalid requests never load Runtime. An eligible request loads
the requested organization Runtime once, validates exact composition and
authority-receipt identity, and then invokes existing disclosure enforcement.

## Implemented capabilities

- explicit `VerifiedConsumerIdentity`;
- per-consumer/per-organization access records outside Runtime;
- active, expired, revoked, superseded, duplicate, and conflicting record
  handling;
- deterministic request-bound decisions and provenance;
- exact composition, revision, and authority-receipt validation;
- audit-ready, non-persistent bounded events;
- official `@clerk/nextjs/server` adapter behind `server-only`;
- deterministic Clerk identity normalization;
- no email, password, query, cookie, organization-ID, or client identity
  substitution;
- no Clerk Organizations, memberships, roles, or permissions; and
- complete inactive disclosure, projection, communication, adapter, and
  candidate-view replay.

## Validation evidence

| Validation | Result |
| --- | --- |
| Clerk identity shadow | `28/28` |
| Alpha disclosure producer | `61/61` |
| Disclosure and revocation | `14/14` |
| Organizational Understanding projection | `30/30` |
| Your Organization projection compatibility | `43/43` |
| Structured Product Communication | `60/60` |
| Your Organization communication adapter | `69/69` |
| Organization Experience | `24/24` |
| Canonical ownership migration | `14/14` |
| Cognition validation | 32 capabilities |
| Architecture verification | `295/302`; 7 pre-existing findings |

Deterministic persisted Runtime SHA-256 before and after replay:

`ce267f9e34bc60f94d4c1e16e0a153042f5d8a5b1d54ee4633999c17041fc9cc`

The current DEPS Markdown report renders twice to SHA-1:

`ccdf3bc356154580b1c52e8c1d978e41234f6255`

The producer's deterministic preflight, decision, and audit-event SHA-256
values are:

- `fc0cf63a6d06b9b4cf1106e913d35d32b75c2908b54a8f545ad54470cc9c6955`;
- `75919513db38010ce79a7c8713281e04818c6d4ed25ff7e38e2de20a6e4d5c31`;
- `38abe61941e20867d2cced78f179e29d63ed76a952d43e26dc91fb0dda834163`.

## DEPS

The current authoritative report is
`deps-clerk-identity-shadow`, following
`deps-alpha-allowlist-disclosure-producer-shadow`.

| Measure | Disposition |
| --- | --- |
| Organizational Understanding | Unchanged |
| User Intelligence | Not Measured |
| Collective Intelligence | Not Measured |
| Governance Integrity | Improved |
| System Sustainability | Improved |
| Complexity | Increased and justified |
| Product regression | Unchanged |
| Runtime regression | Unchanged |

No User Intelligence, Collective Intelligence, or Local Understanding Utility
improvement is claimed.

## Dependency-security posture

Installing Clerk added its required dependency tree. `npm audit --json`
currently reports 19 vulnerable package entries: 17 high and 2 critical. The
direct affected packages include Clerk, Next, ESLint, and
`eslint-config-next`; the remaining entries are transitive.

No automatic remediation was performed. The findings do not by themselves
prove that every vulnerable path is exploitable in Discovery, but the Clerk
and Next authorization/middleware advisories are activation blockers until
reviewed and remediated. The application must not be described as safe for
hosted production activation while this review remains open. See
`CLERK_DEPENDENCY_SECURITY_REVIEW.md`.

## Remaining hosted-Alpha dependencies

- live Clerk credentials;
- deployed Clerk middleware/provider verification;
- durable Discovery-owned access-record storage;
- controlled grant, expiry, supersession, and revocation administration;
- durable append-only bounded audit storage;
- operational alerts and failure handling;
- browser and cross-organization isolation testing;
- dependency-security remediation and verification;
- route activation and rollback review; and
- explicit limited-Alpha authorization.

## Rollback

Rollback removes the inactive Clerk adapter, identity normalizer, Alpha policy
producer, validators, dependency, DEPS evidence, and synchronized
documentation. It does not rewrite Runtime, cognition, canonical
Organizational Understanding, authority history, projection, communication,
or product state.

## Next chapter

The next authorized work is a read-only **Durable Alpha Access and Audit
Storage Decision Sprint**. It may determine storage and lifecycle
architecture, but it does not authorize implementation or route activation.
