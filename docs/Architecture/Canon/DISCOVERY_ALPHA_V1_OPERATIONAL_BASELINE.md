# Discovery Alpha v1.0 Operational Baseline

**Status:** Canonical

## 1. Purpose

This document defines the accepted Production baseline for Discovery Alpha
v1.0. Every future change must preserve its minimum platform, product,
security, governance, truthfulness, and operational behavior. A conflicting
change is incorrect unless benchmarked, reviewed architectural governance
explicitly revises this baseline.

## 2. Milestone Declaration

Discovery Hosted Alpha is operational. This concludes the initial
platform-construction and Production-activation phase.

Operationally proven does not mean commercially validated. This milestone
does not claim product-market fit, scalability, or commercial validation.

## 3. Canonical Production Stack

The accepted stack is Vercel Production, Clerk authentication, Neon
PostgreSQL governance storage, private Vercel Blob Runtime storage, the
canonical Runtime repository abstraction, bounded health readiness, durable
access and lifecycle records, append-only disclosure records, access-derived
organization resolution, and the canonical Discovery Experience.

## 4. Canonical Request Path

```text
Verified Clerk identity
→ durable access lookup
→ authorized organization resolution
→ private Runtime retrieval
→ canonical projection
→ disclosure qualification
→ product view model
→ canonical Discovery Experience
```

Authorization must precede Runtime retrieval. Browser query parameters and
deployment environment configuration cannot grant access.

## 5. Canonical Organization Resolution

Durable access is the authority source. One authorized organization may
resolve automatically. Deployment organization configuration is a guardrail,
not authority. Query parameters are authorized selections only.

Zero, revoked, expired, unauthorized, malformed, conflicting, and ambiguous
access fails closed. Denied resolution performs zero Runtime reads and zero
disclosure writes wherever the contract requires.

## 6. Governance Baseline

Governance consists of exact organization- and Clerk-user-scoped access
records, lifecycle records, and disclosure records. Lifecycle and disclosure
history is append-only where specified. Denial fails closed. Wildcards, email
domains, and browser state do not authorize access.

Acceptance completed at:

- Access: 1
- Lifecycle: 1
- Disclosure: 21

Disclosure is append-only, so 21 is an acceptance snapshot rather than a
permanent expected count. Future verification must explain every delta.

## 7. Runtime Baseline

Production Runtime storage is private, organization-scoped, and addressed by
a deterministic Vercel Blob namespace through the hosted Runtime repository.
A filesystem implementation supports local development only. Normal product
rendering is read-only and has no Production fixture or filesystem fallback.
Runtime write authority remains independently disabled outside approved
provisioning operations.

The accepted Atlas Runtime digest is:

```text
8c3ad0b42c53f7027d3f0cb0a12457e84a25c03063b4c6a47d14a8fe23bef5fa
```

Legitimate Runtime evolution will change this digest and must preserve
lineage, authorization, and governance.

## 8. Canonical Product Experience

`/your-organization` is the canonical hosted entry. The hosted journey is:

```text
Home → Orient → Ask → Understand → Plan → Learn → Respond → Follow → Return
```

The legacy dashboard is not primary. Atlas resolves without a mandatory query
parameter. Navigation preserves organization identity, refresh works, and
sign-out protects every scene. Standard Chrome is authoritative for
session-lifecycle acceptance; the Codex in-app browser is not authoritative
for Clerk sign-out behavior.

## 9. Capability Honesty

- Ask: provisional
- Respond: provisional
- Plan: read-only
- Follow: read-only

Provisional actions must not imply durable cognition. Read-only actions must
not imply persistence. Unavailable capability must be labeled. Session Impact
must not claim durable change without an actual persistent operation.

## 10. Quantitative Truthfulness Contract

**Discovery must never invent quantitative organizational information.**

A quantitative value may appear only through:

```text
Runtime → Projection → Authorized Disclosure → View Model → UI
```

This governs confidence, trends, percentages, scores, ratings, probabilities,
risk, health, recommendation strength, contribution, impact, and timestamps
presented as organizational truth. Missing values render as `Unavailable`,
`Undisclosed`, or `Trend unavailable`.

Acceptance removed fabricated `81%`, `64%`, `58%`, `+7`, `+4`, and `+2`
values and synthetic hosted sparklines, trends, projections, contribution
ratings, and impact ratings.

## 11. Security Baseline

The baseline requires Clerk authentication, fail-closed protected routes,
session invalidation, middleware denial after logout, browser Back protection,
direct-route denial, safe re-login, tenant isolation, authorization before
Runtime, private Blob access, no unauthorized disclosure, no disclosure from
denied organization requests, and disabled provisioning routes during normal
operation.

Fine-grained intra-organizational information sensitivity is not fully solved.
User-level, evidence-level, and meaning-level disclosure scoping remains a
major future governance capability.

## 12. Health and Operational Baseline

```json
{
  "status": "ready",
  "checks": {
    "configuration": true,
    "database": true,
    "runtime": true
  }
}
```

Public health output remains bounded; detailed failure classification remains
server-side. The application database uses the approved pooled path. Runtime
readiness verifies hosted storage. Health requires no provisioning authority.

## 13. Provisioning Baseline

The following controls grant independent operational authority:

- `DISCOVERY_RUNTIME_PROVISIONING_ENABLED`
- `DISCOVERY_ACCESS_PROVISIONING_ENABLED`
- `DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED`

Runtime provisioning, access provisioning, and Alpha activation are separate
operations. The first launch was intentionally manual and gated. A reviewed,
repeatable operator workflow must automate it before multiple organizations
are onboarded.

## 14. Acceptance Evidence

**Acceptance Replay 001 — PASS**

The replay passed health, Runtime integrity, access and lifecycle stability,
disclosure attribution, authentication, authorization, automatic organization
resolution, the canonical experience, quantitative truthfulness, refresh,
navigation, logout, browser Back protection, direct-route denial, re-login,
negative authorization, and tenant isolation.

Detailed evidence is in `DEPLOYMENT_EXECUTION_REPORT.md` and
`docs/Sprint Updates/HOSTED_ALPHA_ACTIVATION_REPORT.md`.

## 15. Accepted Validation Baseline

- Full validation suite: 15/15
- Quantitative truthfulness: 18 checks
- Experience promotion: 19 checks
- Architecture: 295/302
- Architecture health: 98%
- Historical findings: 7

The seven findings are historical and unchanged. A new architecture failure
blocks promotion, historical warnings must not silently increase, and the six
existing React Hook warnings may remain only while unchanged.

## 16. Architecture Freeze Rule

The accepted Alpha architecture is frozen by default. Future work must not
casually redesign Runtime, governance, authorization, organization resolution,
projection, disclosure, health, provisioning, or canonical experience
boundaries.

An architecture change requires a demonstrated benchmark or Production defect,
a bounded proposal, noninterference evidence, validation against this
baseline, and explicit documentation revision.

## 17. What This Baseline Does Not Prove

This baseline does not prove:

- product-market fit or design-partner value;
- retention or commercial pricing;
- scalable onboarding or multi-organization self-service;
- automatic data retrieval or connector maturity;
- AI conversation persistence;
- fine-grained intra-organizational disclosure;
- high-volume Production scale;
- operational automation.

## 18. Next Phase

The next phase is **Discovery Phase 2 — Customer Value and Organizational
Understanding**. Its primary goals are AI-guided onboarding, repeatable
organization provisioning, AI data retrieval and connector ingestion,
organizational understanding quality, benchmark improvement, customer
learning, design-partner validation, fine-grained disclosure architecture,
and operational automation.

Broad infrastructure redesign is deprioritized unless evidence requires it.
The sequential program is defined in
`docs/Sprint Updates/NEXT_PHASE_PROGRAM.md`.

## Documentation Governance

## Alpha semantic freeze and next optimization boundary

The accepted operational baseline remains frozen while the next design-partner
Alpha is narrowed to one Chief-led workflow. Executive History current access
and Historical Checkpoint L1 remain closed foundations. Counsel, Operator, and
Scout compose existing owners only; they add no persona memory or truth.

Pre-Alpha optimization is limited to measurable cognition quality and Product
utility within existing owners. Architecture-compression implementation,
capability manifests, new policy families, new repositories, autonomous agents,
and privacy-preserving cross-user learning require separate decisions. The
Alpha Readiness Gate must preserve exact current access, revocation, isolation,
non-disclosure, replay, recovery, and rollback evidence.
The Architecture Canon should govern deployment reports, handoff summaries,
operator guides, and the generated startup brief. A later bounded
consolidation should reconcile overlapping architecture-state, activation,
readiness, handoff, and sprint-report families without deleting historical
research or sprint evidence and without mass renaming.
