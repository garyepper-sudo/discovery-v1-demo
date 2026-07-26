# Clerk Identity Shadow Integration

**Status:** Inactive server boundary implemented
**Classification:** B — contract and package integration valid; live deployment
verification not demonstrated
**Activation:** Blocked

## Decision

Discovery now has one server-only adapter that constructs the existing
`VerifiedConsumerIdentity` from Clerk's server-verified App Router `auth()`
state. Clerk owns authentication. Discovery continues to own organization
access policy, disclosure eligibility, authority, and Runtime loading.

The adapter is not imported by middleware, a route, a layout, a component, or
the active product. It does not activate Clerk or change Alpha behavior.

## Dependency

`@clerk/nextjs@6.10.0` is compatible with the repository's existing Next
`14.2.18` and React `18.3.1` versions. Newer Clerk 6 releases inspected during
the sprint require at least Next `14.2.25`; upgrading Next was outside scope.

The adapter uses `auth()` from `@clerk/nextjs/server` and is guarded by
`server-only`.

## Identity mapping

| Clerk server value | Discovery value | Rule |
| --- | --- | --- |
| nonnull server `userId` | verification gate | Required by Clerk 6 server auth |
| `userId` | `consumerId` | Must be nonempty and normalized |
| constant | `provider` | Always `clerk` |
| `sessionId` | `verificationId` | Provenance identifier only; no token is retained |
| explicit server time | `verifiedAt` | Supplied at the nondeterministic server boundary |

Email, query parameters, cookies, the shared Alpha password, organization
claims, Clerk Organizations, roles, memberships, and permissions are not
accepted as consumer identity or Discovery access authority.

## Fail-closed orchestration

```text
Clerk server auth()
        ↓
VerifiedConsumerIdentity normalization
        ├── unauthenticated / malformed / unavailable
        │       → no access lookup → no Runtime load
        └── verified
                ↓
        Discovery-owned Alpha access reader
                ├── denied / missing / revoked / invalid
                │       → no Runtime load
                └── eligible
                        ↓
                existing Runtime loader (once)
                        ↓
                existing disclosure producer
```

The shadow orchestrator accepts an injected identity resolver so deterministic
validation can exercise the boundary without credentials or network access.
The production adapter itself directly invokes Clerk's official server helper.

## Validation

`npm run validate:clerk-identity-shadow` passes `28/28`.

It demonstrates exact mapping; fail-closed unauthenticated, malformed, and
unavailable states; access-before-Runtime ordering; a single Runtime load after
active access; unchanged policy input; server-only isolation; no active product
imports; and byte-equivalent `middleware.ts` and `app/layout.tsx`.

## Configuration and production boundary

The future hosted server boundary requires Clerk's standard
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. No credential,
placeholder secret, environment file, Clerk middleware, or provider wrapper
was added.

Because active middleware remains unchanged and no deployed Clerk session was
available, live request verification is not demonstrated. This is
Classification B rather than A.

Still missing:

- deployment configuration and real-session verification;
- a durable Discovery-owned access-record store;
- controlled access creation, supersession, expiry, and revocation;
- a durable bounded audit store;
- operational failure handling, browser isolation, and activation testing;
- route activation and rollback review; and
- explicit limited-Alpha authorization.

## Scorecard

| Metric | Movement |
| --- | --- |
| Organizational Understanding | Unchanged |
| User Intelligence | Not Measured |
| Collective Intelligence | Not Measured |
| Governance Integrity | Improved at the inactive identity boundary |
| System Sustainability | Improved through a replaceable server adapter and deterministic core |

No Local Understanding Utility, user outcome, production readiness, or
research conclusion is claimed.

## Rollback

Remove the Clerk dependency, server adapter, deterministic identity/orchestration
module, validator and command, DEPS source/report, and this documentation
synchronization. Active middleware, routes, Runtime, cognition, schemas,
disclosure, projection, communication, and UI remain unchanged.

## Next recommendation

The next separately authorized infrastructure sprint should implement durable
Discovery-owned Alpha access and bounded audit storage only after a read-only
architecture decision sprint. That decision work must remain independent of
Clerk authentication and must not implement storage or activate the product
route.

The dependency-security review records 19 current npm audit package entries:
17 high and 2 critical. Clerk and Next remediation is required before hosted
activation; no automatic remediation occurred in this milestone.
