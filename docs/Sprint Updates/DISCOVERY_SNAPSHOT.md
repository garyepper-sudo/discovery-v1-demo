# Discovery Startup Snapshot

**Milestone:** Discovery Alpha v1.0 operational baseline established.

Read
`docs/Architecture/Canon/DISCOVERY_ALPHA_V1_OPERATIONAL_BASELINE.md` as the
canonical Production boundary, `PROJECT_STATE.md` for current state, and
`NEXT_PHASE_PROGRAM.md` for the next work program.

## Current Production

Discovery Hosted Alpha is operational on Vercel Production. Clerk identity,
durable Neon governance, access-derived Atlas resolution, private Blob
Runtime retrieval, projection, disclosure, and the canonical Discovery
Experience form the accepted request path.

- Canonical entry: `/your-organization`
- Organization: `atlas-manufacturing-simulation`
- Experience: Home, Orient, Ask, Understand, Plan, Learn, Respond, Follow,
  Return
- Health: READY
- Runtime provisioning: disabled
- Access provisioning: disabled
- Alpha: enabled for the configured organization
- Acceptance snapshot: access 1, lifecycle 1, disclosure 21

Disclosure is append-only; future counts must explain deltas rather than treat
21 as an immutable constant.

## Canonical Contracts

- Authorization precedes Runtime retrieval.
- Durable access, not query or environment state, grants organization access.
- Runtime, governance, authority, and disclosure remain distinct.
- Production has no fixture or filesystem Runtime fallback.
- Denied requests fail closed without Runtime reads or disclosure.
- Quantitative organizational information may render only through Runtime,
  Projection, Authorized Disclosure, View Model, and UI.
- The accepted architecture is frozen unless evidence and reviewed governance
  explicitly revise it.

Acceptance Replay 001 passed the nine-scene experience, authentication,
automatic organization resolution, refresh, navigation, logout, browser Back,
direct-route denial, re-login, negative authorization, tenant isolation, and
quantitative truthfulness.

## Validation Baseline

Full validation is 15/15. Quantitative truthfulness is 18 checks, experience
promotion is 19 checks, and architecture remains at the accepted 295/302
(98%) baseline with seven historical findings. Six historical React Hook
warnings may remain only while unchanged.

## Current Direction

The platform-construction and Production-activation phase is complete. The
next phase is **Discovery Phase 2 — Customer Value and Organizational
Understanding**. The immediate next step is **Phase 2.1 — Repeatable
Organization Activation**. Infrastructure redesign is deprioritized unless
evidence requires it.
