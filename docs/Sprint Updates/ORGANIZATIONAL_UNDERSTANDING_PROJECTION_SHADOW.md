# Organizational Understanding Projection Shadow

**Status:** Contract valid; compatibility refinement and application
activation blocked
**Classification:** B — Projection Contract Valid, Compatibility Refinement
Required

**Milestone disposition:** Included in the completed Discovery Projection
Foundation together with the inactive compatibility adapter.

## Purpose

This sprint establishes the first reusable, pure projection contract between
disclosed canonical Organizational Understanding and product experience view
models.

The governing rule is:

> Projection selects, resolves, and reshapes disclosed canonical information.
> It does not infer, authorize, narrate, or own organizational truth.

The active `Your Organization` experience remains on the Phase 8A adapter.

## Ownership boundary

- completed Explanations continue to own claims, ancestry, assumptions,
  comparative Evidence roles, viability, and Explanation uncertainty;
- canonical Organizational Understanding continues to own composition
  identity, scope, outcomes, exact Explanation membership, composition
  uncertainty, authority receipt, and revision continuity;
- authority and disclosure continue to own admission, authority disposition,
  consumer eligibility, and revocation;
- projection owns only disclosure-enforced selection, reference resolution,
  normalization, availability, trace bundling, and progressive-disclosure
  grouping;
- communication owns headlines, summaries, rhetorical priority, narrative,
  and recommendation wording;
- UI owns sections, labels, routes, hierarchy, truncation, and interaction.

No Runtime schema, persistence contract, cognition, capability, disclosure
decision producer, communication producer, or product behavior changed.

## Implemented contract

`engine/v3/projection/organizationalUnderstandingProjection.ts` defines:

- `ProjectionContext`;
- `ProjectionSource`;
- `CanonicalObjectReference`;
- `CanonicalEvolutionReference`;
- `ProjectionAvailability`;
- `ProjectedReference<T>`;
- `ProjectionDepth`;
- `OrganizationalUnderstandingProjection`;
- `compileOrganizationalUnderstandingProjection()`.

The contract is ephemeral and is not stored in Organization Runtime.
`generatedAt` and contract version are explicit inputs. The compiler performs
no clock, network, Runtime, provider, or persistence access.

## Data flow

```text
Persisted Organization Runtime
→ canonical cognition
→ authority-qualified canonical compositions
→ resolved disclosure decision
→ disclosure enforcement
→ explicit ProjectionSource
→ pure projection compiler
→ shadow comparison with Phase 8A
```

The compiler derives its Understanding set from
`disclosure.disclosedCompositions`, then requires matching source composition
and revision identities. It resolves only exact Explanation membership.

## Disclosure enforcement

The compiler:

- requires a disclosure result and decision identity;
- verifies organization and consumer identity;
- accepts only `eligible` disclosure;
- rejects `withheld` and `revoked` results;
- requires an explicit authorized authority-transition receipt;
- excludes every unreferenced Explanation;
- includes Conditions only when `supportingExplanationIds` reaches a disclosed
  Explanation;
- includes Organizational State only when it reaches an included Condition;
- includes investigations only when they reach an included Condition;
- includes evolution only when it reaches an already disclosed or included
  object.

Supporting objects cannot reconstruct withheld Understanding. Rejection
availability carries no protected object identity or content.

The benchmark harness supplies already-resolved decisions only to test the
existing disclosure contract. No production decision producer was created.

## Availability model

The projection distinguishes:

- `available-with-content`;
- `available-empty`;
- `runtime-data-unavailable`;
- `referenced-data-missing`;
- `withheld`;
- `revoked`;
- `organization-mismatch`;
- `consumer-mismatch`;
- `authority-receipt-invalid`;
- `historical-compatibility-unavailable`.

Partial Explanation resolution is reported as referenced data missing even
when safely resolved members remain present. Evidence identity and
comparative-role metadata may be projected, but Evidence bodies remain
`runtime-data-unavailable`.

## Progressive disclosure

The compiler emits canonical references at three presentation-neutral depths:

- `summary`: disclosed canonical composition references;
- `support`: reachable Explanations, uncertainty, Conditions, State,
  investigations, and evolution;
- `trace`: reachable Evidence and cognitive ancestry references.

Ordering is deterministic by stable canonical identity. Evolution uses
`occurredAt` followed by stable identity. These rules normalize
presentation-neutral source arrays; they do not rank cognition.

## Shadow comparison

| Phase 8A field | Shadow classification |
| --- | --- |
| Canonical composition identity and revision | Exact parity |
| Completed Explanation membership | Exact parity |
| Structured uncertainty and unresolved alternatives | Semantically equivalent |
| Optional Explanation title and summary | Intentionally excluded from projection ownership |
| Evidence bodies | Intentionally unavailable |
| Unlinked Conditions, State, investigations, and changes | Intentionally unavailable |
| Active application consumption | Blocked by disclosure activation |

The shared projection improves identity, revision, disclosure, and trace
structure. It intentionally does not reproduce the Phase 8A adapter's
fixture-era optional prose probing or broad unlinked Runtime traversal.

The structured projection can support a future Runtime-details view model, but
it cannot supply a human-readable top insight without a separately owned
communication contract.

## Focused validation

`npm run validate:organizational-understanding-projection-shadow` passes 30
deterministic checks covering:

- repeated and reversed-order equality;
- organization and consumer isolation;
- withheld and revoked disclosure;
- authority-receipt enforcement;
- support-object non-bypass;
- exact object and revision identity;
- exact Explanation membership;
- unresolved alternatives and uncertainty preservation;
- no fabricated prose, confidence, Evidence bodies, ranking, or primary
  judgment;
- explicit availability states;
- historical compatibility behavior;
- progressive-disclosure trace closure;
- source and persisted Runtime immutability;
- Phase 8A semantic comparison;
- active-path non-activation and rollback.

The benchmark uses production-shaped completed Explanations without
fixture-only title, summary, claim statement, or Evidence-reference fields.

## Limitations and blockers

- no production disclosure-decision producer exists;
- the active Phase 8A page does not invoke disclosure enforcement;
- Evidence bodies remain unavailable;
- completed Explanations do not own required human-readable product prose;
- organization-wide State and uncertainty without an explicit disclosed trace
  remain unavailable;
- Local Understanding Utility and real User Intelligence remain unmeasured;
- no active view-model or browser parity claim is made.

## Rollback

Delete the new pure compiler, focused validator, and package command. The
existing Phase 8A adapter remains unchanged throughout this sprint, so Runtime,
canonical cognition, disclosure, and product output require no rollback.

## Recommendation

Do not activate `Your Organization` through the shared projection yet.

The next sprint should refine compatibility at one bounded adapter boundary:
construct the Runtime-details view model from the shared projection while
keeping user-visible prose owned by an existing communication source or
explicitly unavailable. Activation still requires a real resolved
disclosure-decision producer and its separately authorized Governance work.
