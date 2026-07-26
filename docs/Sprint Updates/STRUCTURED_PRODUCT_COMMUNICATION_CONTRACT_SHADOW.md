# Structured Product Communication Contract Shadow

**Status:** Validated inactive shadow

**Classification:** A — Source-Pass-Through Communication Shadow Demonstrated

## Purpose and repository state

This sprint implements the first bounded Product Communication contract over
the disclosure-enforced Organizational Understanding Projection. It validates
communication ordering, priority provenance, exact source-text pass-through,
uncertainty, alternatives, and abstention without narrative synthesis or an
active product change.

The baseline was branch `sprint-79-organization-experience` at
`24c90a48099de2b7088d4832b6bc2219fd2528bf`, with no later commits and four
inherited, unstaged Product Communication decision-document changes.

## Governing architecture and ownership

```text
Canonical Organizational Understanding
→ disclosure-enforced Organizational Understanding Projection
→ explicit upstream priority signals
→ deterministic Product Communication Policy
→ structured Product Communication Plan
→ future narrative synthesis
→ future product adapter
→ UI
```

Canonical cognition owns organizational truth and readable source fields.
Named upstream producers own cognitive priority and its objective. Product
Communication Policy owns lead-for-experience ordering only. Future Product
Communication synthesis owns narrative, product adapters own experience
shaping, and UI owns composition and visual prominence.

The shadow does not access Runtime, generate disclosure decisions, create
authority, rank cognition, calculate confidence, recommend action, generate
prose, persist output, or alter canonical objects.

## Inputs, signals, and policy

`ProductCommunicationContext` requires explicit organization, consumer,
experience, generation time, and contract version. It never infers role,
scope, familiarity, or permission.

`ProductCommunicationSource` contains one disclosed projection, explicit
`UpstreamPrioritySignal` values, and an optional narrow application-input
envelope. The first `organization` policy rejects application inputs because
this shadow does not need them.

Every valid signal preserves its producer, objective, optional producer-owned
score or rank, subject reference, and supporting references. All references
must be inside the disclosed projection closure. Unsupported, mixed-closure,
or non-finite signals fail closed. Scores are neither recalculated nor
normalized. Duplicate or competing signals remain visible.

The versioned `product-communication:organization@1` policy orders valid named
signal categories for the organization experience, then permits a singleton
disclosed Understanding as an explicit non-semantic fallback. It never calls a
lead “most important.” Every selected item has stable provenance; array
position is never authority.

## Communication Plan and source pass-through

`ProductCommunicationPlan@1` preserves organization, consumer, projection,
disclosure-decision, revision, policy, signal, canonical-reference,
uncertainty, alternative, and availability identity. IDs depend only on
supplied identity and version data. The compiler uses no clock or randomness.

The shadow passes through exact text only from authorized projected fields:

- `OrganizationalCondition.summary`;
- `InvestigationOpportunity.suggestedExecutiveQuestion`;
- completed Explanation uncertainty statements.

It does not paraphrase, concatenate, summarize, truncate, or substitute
fixture, benchmark, product, assessment, recommendation, or Evidence-body
text. Missing readable text yields a valid structural reference with explicit
unavailability.

Unresolved composition alternatives remain groups of disclosed Explanation
references. A communication lead does not select an Explanation winner or
change adjudication. Required uncertainty remains present.

Availability distinguishes readable text, structural-only content, empty
content, unavailable priority, projection failure, withheld, revoked, invalid
authority, identity mismatch, historical incompatibility, unresolved
alternatives, and unsupported application input.

## Shadow comparison and results

| Candidate | Result |
| --- | --- |
| Raw structured projection | Preserves disclosed structure and uncertainty; no communication roles or priority provenance |
| Active Phase 8A experience | Unchanged; retains compatibility prose and historical implicit ordering |
| Structured Communication Plan | Stable roles, explicit provenance, exact source pass-through, uncertainty and alternatives preserved |
| Array-order negative control | Benchmark-only; unstable when candidate order changes and has no semantic provenance |

The focused validator passes `60/60`. Treatment SHA-256:
`61dd9f1012679fb636f39cb2b0934a1a2beec5c362fcd718c7fefb6e6d12294d`.
Persisted Atlas Runtime SHA-256:
`ce267f9e34bc60f94d4c1e16e0a153042f5d8a5b1d54ee4633999c17041fc9cc`.

## Local Understanding Utility

- Understanding Gain: positive hypothesis.
- Action Utility: demonstrated benchmark utility for exact Investigation
  Opportunity question availability.
- Cognitive Load Reduction: positive hypothesis.
- Continuity: positive hypothesis.
- Trust Calibration: demonstrated benchmark utility for provenance,
  uncertainty, alternatives, abstention, and non-leakage.

User Intelligence and real-user Local Understanding Utility remain not
measured.

## Limitations, rollback, and next recommendation

No production disclosure-decision producer, narrative synthesis, or
Your Organization communication adapter exists. General Understanding
priority requires a named upstream producer. Canonical Explanation headline
text and Evidence bodies remain unavailable. Synthetic validation does not
demonstrate user comprehension, decision quality, or active revocation.

Rollback is local: remove the pure module, validator, package command, DEPS
source/report, and this synchronization. Runtime, projection, compatibility,
active Phase 8A, schemas, cognition, and persisted data remain untouched.

The next sprint should implement a **thin inactive Your Organization
communication adapter** over this plan, without narrative synthesis or route
activation.

## Subsequent adapter result

That inactive adapter is now implemented and passes `69/69`. The plan also
preserves projection-owned comparative Evidence-role metadata so the adapter
can carry it without rereading projection. The active route remains unchanged.
See `YOUR_ORGANIZATION_PRODUCT_COMMUNICATION_ADAPTER.md`.
