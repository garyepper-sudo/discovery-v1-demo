# Your Organization Projection Compatibility Adapter

**Status:** Shadow-valid; active route unchanged
**Classification:** B — Compatibility Adapter Valid; Product Contract
Refinement Required

**Milestone disposition:** Included in the completed Discovery Projection
Foundation; product activation remains blocked.

## Purpose

This sprint translates a completed, disclosure-enforced
`OrganizationalUnderstandingProjection` into the existing nine-section
`RuntimeOrganizationView`. It does not activate that path.

```text
Persisted Runtime
→ canonical cognition
→ authority-qualified compositions
→ resolved disclosure result
→ projection compiler
→ compatibility adapter
→ candidate Runtime-details view model
```

The active path remains `Runtime → buildRuntimeOrganizationView() → existing
UI`.

## Repository state

Work began on branch `sprint-79-organization-experience` at
`e39be469bfbb02bf846546c515606d33110e5403`. No later commits existed. The
complete projection-shadow worktree was inherited unstaged and preserved.
No unrelated file appeared in the startup audit.

## Field inventory

Every section has the same product fields: `title: string`, `owner: string`,
`available: boolean`, `summary: string`, and `items: string[]`. This sprint
adds optional `availability`, `references`, and top-level
`projectionMetadata` compatibility fields; the active adapter does not emit
them.

| Section | Current Runtime source and transformation | UI | Owner/class | Projection result |
| --- | --- | --- | --- | --- |
| Current Organizational Understanding | first canonical composition; optional Explanation `title`, `summary`, or fixture-era `claim.statement`; deduplicated and capped | summary and two items; also feeds insight | canonical identity plus legacy prose probe (E) | identity/revision direct (A); readable content communication-owned and unavailable (C) |
| Top Organizational Explanations | all Runtime Explanations; optional `title`, `summary`, or `claim.statement`; deduplicated and capped | summary and two items; also feeds insight | canonical membership plus legacy prose probe (E) | membership direct (A); “top” and readable content require upstream priority/communication (C) |
| Supporting Evidence | optional embedded `evidenceReferences` titles, labels, or statements | summary and two items | legacy compatibility probe (E/G) | Evidence identity and comparative roles direct (A); bodies Runtime-unavailable (G) |
| Remaining Uncertainty | Explanation uncertainty plus broad Runtime uncertainty strings and summary | summary and two items | canonical/derived mix | disclosed Explanation statements and linked driver descriptions shape-map (B); composition disposition remains structured |
| Relevant Conditions | Runtime Condition `name`, `title`, or `summary` | summary and two items | canonical with legacy probing | canonical Condition summary/name shape-map (B) |
| Current Organizational State | Runtime State summary, implication, and recommended focus | summary and two items | canonical | direct readable canonical fields (A/B) |
| Investigation Opportunities | first question/topic and all question/topic values | summary and two items | canonical | canonical question/topic shape-map (B) |
| Recent Changes | learning-event reason plus compatibility evolution description/title | summary and two items | mixed canonical and legacy history (E/G) | identity and revision retained; readable event narrative unavailable (C/G) |
| Model Evolution | Understanding evolution summary plus Theory evolution reason/summary | summary and two items | historical compatibility (E/G) | identity and revision retained; readable narrative unavailable (C/G) |

UI-only fields (D) are section titles, owner labels, the four-item compatibility
cap, the `Runtime not yet available` display label, truncation, layout, and
interaction state. Every projected content field is disclosure-blocked (F)
until a real consumer-specific decision is supplied.

## Adapter contract and ownership

`components/product-shell/data/buildOrganizationExperienceFromProjection.ts`
accepts only a completed projection and returns `RuntimeOrganizationView`.
It:

- performs no Runtime traversal, disclosure or authority evaluation,
  persistence, mutation, clock access, randomness, ranking, or confidence
  calculation;
- deterministically normalizes source arrays by canonical identity;
- preserves composition identity, revision, source revisions, decision
  identity, Explanation membership, canonical references, and comparative
  Evidence roles in optional compatibility metadata;
- passes through only already-readable canonical uncertainty, Condition,
  State, and investigation text;
- never reconstructs prose from structured claims;
- has no fixture, benchmark, assessment, or Runtime fallback.

Communication still owns an authorized product headline/summary contract for
canonical compositions and completed Explanations, and readable evolution
language. That future contract must accept disclosed canonical references and
return attributable audience-specific prose without changing truth,
membership, priority, confidence, or disclosure.

## Availability

The optional compatibility availability field preserves:

- available with content;
- available but empty;
- Runtime canonical data unavailable;
- referenced data missing;
- withheld;
- revoked;
- organization mismatch;
- consumer mismatch;
- invalid authority receipt;
- historical compatibility unavailable;
- communication synthesis unavailable.

Protected failure states expose no suppressed identity or reason. Existing
`available`, `summary`, and `items` fields remain backward compatible.
Unavailable sections continue to display `Runtime not yet available`.

## Shadow parity matrix

| Concern | Result |
| --- | --- |
| composition identity and revision | exact parity in compatibility references and metadata |
| organizational scope and disclosure provenance | more accurate through projection metadata |
| Explanation membership | exact parity |
| structured Explanation claims | intentionally excluded from prose-first fields; canonical source remains referenced |
| unresolved alternatives | semantic preservation in projection; no fabricated display prose |
| readable uncertainty | semantic parity for disclosed canonical statements/descriptions |
| Evidence roles | exact trace metadata; Evidence bodies intentionally unavailable |
| Conditions, State, investigations | semantic parity for disclosure-closed objects |
| learning and Understanding evolution | identity/revision preserved; communication synthesis required |
| Theory evolution | canonical production source missing from this projection |
| stable UI identifiers | canonical references available; current UI remains title-keyed |
| empty and rejection states | explicit and fail-closed |
| historical Runtime | active Phase 8A path remains bounded and unchanged |

The remaining product-contract defect is not canonical data loss. The current
experience assumes readable headline/summary strings and a semantically “top”
Explanation, while neither communication synthesis nor priority is owned by
the projection. Activating without resolving that boundary would produce
honest but materially incomplete primary content.

## Minimum disclosure producer interface

The future producer must receive:

- requesting application/experience and authenticated `consumerId`;
- exact `organizationId` and organizational scope;
- exact candidate canonical composition IDs and revision IDs;
- current authority-transition receipts;
- current membership/permission inputs sufficient to resolve, not merely
  infer, eligibility.

It must return a resolved decision with stable decision identity,
organization, consumer, `eligible | withheld | revoked`, effective/issued time,
optional superseded-decision identity, policy basis, and the exact composition
revisions governed by the decision. Withheld and revoked results must disclose
no protected object identity.

Historical decisions require explicit validity/supersession semantics. An
application may cache only within declared validity and must invalidate on
revocation, authority revision, composition revision, scope change, consumer
change, or membership change. Until those semantics exist, projection should
receive a freshly resolved result. Missing, stale, mismatched, or invalid
inputs fail closed. Current identity and permission infrastructure may provide
inputs, but repository evidence does not establish it as the canonical
decision producer.

## Validation

`npm run validate:your-organization-projection-compatibility` passes `43/43`.
It covers deterministic output, order normalization, source and Runtime
non-mutation, identity/revision, membership, uncertainty, Evidence-role
traceability, unavailable Evidence bodies, absence of fabricated prose,
confidence, ranking, and recommendations, all rejection states, active-route
non-activation, valid nine-section shape, deterministic persisted replay, and
adapter-local rollback.

The projection gate remains `30/30`; Organization Experience remains `24/24`;
Phase 5B remains `14/14`; Phase 4C remains `14/14`.

## Rollback and recommendation

Rollback is adapter-local: remove the compatibility adapter, its optional
view-model metadata, validator, command, documentation, and DEPS evidence. The
active Phase 8A adapter, Runtime, cognition, schemas, and persistence require
no rollback.

Refine the product contract next. Establish the bounded authorized
communication/priority input needed by the existing top-insight fields before
implementing the disclosure-decision producer or activating the route.
