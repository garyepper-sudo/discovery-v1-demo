# Comparative Evidence Roles Contract

**Status:** Canonical — implemented and active
**Program:** Discovery 2 Sequential Implementation Program
**Production activation:** Active for normal forward Runtime evolution

The exact bounded producer input required to implement this contract is
defined by:

```text
COMPLETED_EXPLANATION_INPUT_CONTRACT.md
```

That document refines only the structured input boundary. The allowed roles
and their semantics remain governed here.

---

# Implementation status

Phase 1 is implemented in:

```text
engine/v3/model/judgment/organizationalJudgment.ts
engine/v3/model/judgment/completeOrganizationalExplanations.ts
engine/v3/runtime/evolveOrganizationRuntime.ts
```

Normal `evolveOrganizationRuntime()` execution now passes the bounded
organization-scoped Evidence context. Completed Explanations materialize
deterministic assignments when valid and an explicit empty array when a valid
context yields none.

Historical records without the optional collection remain valid. Activation
uses lazy forward materialization and requires no bulk Runtime migration.

The focused production benchmark passes 20/20 canonical scenarios with stable
identity, reversed-order equality, organization isolation, historical
compatibility, and downstream noninterference.

No downstream production consumer currently interprets these roles.

---

# Purpose

This specification defines the smallest production contract that can preserve
how existing Evidence relates to one completed Organizational Explanation in
comparison with other completed Explanations.

The contract closes a semantic gap:

```text
Evidence ancestry
→ completed Organizational Explanation
→ missing comparative Evidence role
→ Explanation adjudication
```

Evidence ancestry answers:

> Which Evidence participated in forming this Explanation?

A comparative Evidence role answers:

> What structurally warranted role does this Evidence play for this
> Explanation when alternatives are considered?

The two meanings must remain distinct. Ancestry alone never implies support,
opposition, discrimination, or authority.

This specification extends existing production objects and producers. It does
not introduce a universal Evidence-role object, candidate object, adjudication
engine, cognitive layer, Runtime, or truth store.

---

# Current production boundary

Production currently provides:

- `OrganizationalExplanationSeed.evidenceIds`;
- `OrganizationalExplanationSeed.evidenceReferences`;
- `OrganizationalExplanationSeed.reasoningPathIds`;
- `OrganizationalExplanationSeed.reasoningRelationshipIds`;
- completed `OrganizationalExplanation.evidenceIds`;
- completed Explanation ancestry through Seed, Reasoning Path, Mechanism,
  Belief, and Theory identities;
- `V3EvidenceRelationship` with `supports`, `contradicts`, `depends_on`,
  `explains`, `extends`, and `duplicates`;
- `V3Contradiction.evidenceIds` and optional `opposingEvidenceIds`;
- stable `V3Evidence.sourceId` when supplied;
- deterministic completed-Explanation identity and ordering.

Production does not provide:

- an Evidence-to-Explanation directional relationship;
- an Explanation-to-Explanation comparison relationship;
- a typed counterfactual;
- a typed observed-outcome-to-Explanation relationship;
- a typed rule-out relationship;
- a typed discriminating relationship;
- a canonical target on `V3Contradiction` identifying which Explanation it
  opposes;
- production adjudication of completed Explanations.

The contract must not infer those missing meanings from text.

---

# Existing objects to extend

## Persisted object

Extend:

```text
OrganizationalExplanation
```

with one optional nested collection:

```text
comparativeEvidenceRoles?
```

The collection belongs on the completed Explanation because:

- its meaning is candidate-specific;
- the completed Explanation already owns stable claim identity, scope,
  outcomes, and ancestry;
- placing it on Evidence would make a contextual role appear universal;
- placing it in a new top-level Runtime collection would create unnecessary
  ownership and persistence;
- the collection can remain absent on historical records.

## Producer input

Extend the private input of:

```text
completeOrganizationalExplanations()
```

to accept the bounded, ephemeral Evidence context defined by:

```text
COMPLETED_EXPLANATION_INPUT_CONTRACT.md
```

The context projects only canonical Evidence identities and direct
`contradicts` Evidence Relationships already available at the existing
orchestration boundary. The producer already receives Seeds, Mechanisms,
Beliefs, Theories, prior completed Explanations, and contradiction identities.
It must not receive full Runtime state, benchmark role links, hidden
expected-answer labels, or unrelated Evidence fields.

No downstream consumer changes in Phase 1.

---

# Proposed schema addition

The following is the canonical conceptual TypeScript shape. Coding may adjust
type names to repository conventions but may not change the semantics.

```ts
export type OrganizationalExplanationEvidenceRole =
  | "supports"
  | "opposes"
  | "shared";

export type OrganizationalExplanationEvidenceRoleBasis =
  | {
      kind: "explanation-seed";
      referenceIds: string[];
    }
  | {
      kind: "evidence-relationship";
      referenceIds: string[];
    }
  | {
      kind: "shared-support";
      referenceIds: string[];
    };

export type OrganizationalExplanationEvidenceRoleAssignment = {
  evidenceId: string;
  role: OrganizationalExplanationEvidenceRole;
  basis: OrganizationalExplanationEvidenceRoleBasis;
  relatedExplanationIds: string[];
};

export type OrganizationalExplanation = {
  // Existing fields remain unchanged.
  comparativeEvidenceRoles?:
    OrganizationalExplanationEvidenceRoleAssignment[];
};
```

## Field semantics

### `evidenceId`

The stable identity of an existing canonical Evidence record.

It does not copy Evidence text, source, reliability, time, sensitivity, or
confidence into the Explanation.

### `role`

The relationship defined in the allowed-role section below. It is always
relative to the Explanation containing the assignment.

### `basis.kind`

The canonical structured relationship that warrants the assignment.

It is not a confidence class and does not determine weight.

### `basis.referenceIds`

Stable identities of the exact Seed or Evidence Relationships used to derive
the assignment.

The array must be non-empty, unique, and sorted.

### `relatedExplanationIds`

Other completed Explanations required to interpret the role.

- `supports`: empty;
- `opposes`: empty in Phase 1 because the assignment is relative to its
  containing Explanation;
- `shared`: every other comparable Explanation supported by the same Evidence,
  unique and sorted.

The containing Explanation ID must never appear in this array.

---

# Allowed Phase 1 roles

Phase 1 permits exactly three roles.

## `supports`

### Semantic definition

The Evidence is explicitly referenced by a canonical Explanation Seed that was
completed into this Explanation.

This means the Seed producer used the Evidence as structured support for the
reasoning path underlying the candidate. It does not mean the Evidence proves
the Explanation, is independent, is decisive, or should increase confidence.

### Required derivation

Assign `supports` only when:

1. the completed Explanation retains the Seed identity;
2. the Evidence ID appears in that Seed's `evidenceIds` or in a
   type-`evidence` `evidenceReference`;
3. the Seed has at least one retained Reasoning Path;
4. the Explanation was completed successfully from that Seed.

Mechanism or Theory ancestry alone is insufficient for this role because their
aggregated supporting Evidence may not preserve the candidate-specific Seed
relationship.

### Basis

```text
kind: explanation-seed
referenceIds: [seedId]
```

## `opposes`

### Semantic definition

The Evidence contradicts Evidence that structurally supports this Explanation.

This is opposition to the Explanation's current support, not proof that the
Explanation is false or ruled out.

### Required derivation

Assign `opposes` only when:

1. a canonical `V3EvidenceRelationship` has type `contradicts`;
2. exactly one relationship endpoint has a valid `supports` assignment for the
   Explanation;
3. the other endpoint is the Evidence receiving `opposes`;
4. the opposing endpoint is an existing canonical Evidence identity;
5. the relationship is not being used to infer a target from text.

If both endpoints support the same Explanation, the contradiction is
structurally ambiguous. Preserve the contradiction but assign neither endpoint
the `opposes` role from that relationship.

`V3Contradiction.opposingEvidenceIds` is not sufficient by itself because the
current object does not identify the completed Explanation it opposes.

### Basis

```text
kind: evidence-relationship
referenceIds: [evidenceRelationshipId]
```

## `shared`

### Semantic definition

The same Evidence structurally supports this Explanation and at least one
other comparable completed Explanation.

`shared` means the Evidence cannot, by itself, distinguish those Explanations.
It does not mean the Explanations are equivalent, mutually exclusive, equally
likely, or independently corroborated.

### Comparable Explanation definition

Two completed Explanations are comparable in Phase 1 only when they have:

1. the same `organizationId`;
2. exactly equal normalized `claim.scope`;
3. at least one identical `claim.outcomeRef`;
4. different Explanation identities.

No lexical similarity, family label, title, summary, or benchmark truth may be
used.

### Required derivation

Assign `shared` when:

1. the Evidence has a valid `supports` assignment on the current Explanation;
2. it has a valid `supports` assignment on at least one comparable
   Explanation;
3. all related Explanation identities are known after the complete candidate
   set has been constructed.

The Evidence retains its `supports` assignment. `shared` is an additional
comparative fact, not a replacement direction.

An Evidence item may therefore have both `supports` and `shared` assignments
for one Explanation. Phase 1 does not permit simultaneous `supports` and
`opposes` assignments for the same Evidence and Explanation.

### Basis

```text
kind: shared-support
referenceIds: [supporting seed IDs across the compared Explanations]
```

---

# Roles not allowed in Phase 1

The validated benchmark vocabulary is broader than current production
semantics. Phase 1 must not copy that vocabulary into production.

## `discriminates`

Not derivable. Production has no structured relationship stating that Evidence
favors one completed Explanation over another.

## `counterfactual`

Not derivable. Production has no canonical counterfactual object or typed
Evidence-to-Explanation counterfactual link.

## `outcome`

Not derivable. `OrganizationalOutcomeRef` identifies an explained target; it
does not connect observed outcome Evidence to an Explanation or establish
whether the outcome supports or weakens it.

## `ruleOut`

Not derivable. Contradiction or opposition does not establish decisive
falsification.

## `corroborates`

Do not persist as a role. Independent corroboration is an adjudication result
computed from multiple `supports` assignments and distinct existing
`sourceId` values. It is not an intrinsic role of one Evidence record.

## `duplicate`

Do not persist as a candidate role. Duplicate status is already an Evidence
relationship and should constrain independent contribution without being
recast as support or opposition.

## `weak`, `stale`, or `bounded`

Do not persist as roles. They would introduce reliability, recency, or
evidence-quality policy outside this phase.

## `irrelevant`

Do not persist. Irrelevant Evidence receives no assignment.

## `feedback`

Not derivable as a canonical candidate-specific relationship.

The absence of these roles blocks activation of the existing benchmark
adjudicator wherever it requires discrimination, counterfactual, outcome, or
rule-out semantics.

---

# Canonical producer ownership

The canonical producer is:

```text
completeOrganizationalExplanations()
```

Ownership remains there because it is the earliest production boundary with:

- the completed Explanation identity;
- normalized claim scope and outcomes;
- the exact Seed ancestry;
- the complete set of successfully completed alternatives;
- prior completed Explanations;
- the ability to produce stable nested assignments before persistence.

`synthesizeExplanationSeeds()` remains the upstream owner of Seed Evidence
references. It does not populate the completed contract.

The following must not populate or rewrite roles:

- adjudication;
- Conditions;
- Organizational State;
- Organizational Understanding;
- Executive Assessment;
- projection;
- applications;
- providers;
- Runtime loading;
- benchmarks.

Runtime persists the producer output; it does not infer missing roles.

---

# Allowed structured derivation inputs

Phase 1 may use only:

1. `OrganizationalExplanationSeed.id`;
2. `OrganizationalExplanationSeed.evidenceIds`;
3. type-`evidence` Seed `evidenceReferences`;
4. `OrganizationalExplanationSeed.reasoningPathIds`;
5. the completed Explanation's stable identity, organization, scope, and
   outcome references;
6. other successfully completed Explanations from the same producer call;
7. canonical `V3EvidenceRelationship` identities and types;
8. canonical Evidence identities only to validate references.

Phase 1 may not derive roles from:

- Evidence text;
- titles, summaries, labels, or family names;
- keyword overlap;
- hidden benchmark state;
- expected answers;
- recommendation identity;
- current leader or ranking;
- reliability;
- timestamp or recency;
- Evidence confidence;
- participant seniority;
- provider interpretation;
- application state.

`sourceId` is retained for later independence-aware adjudication but does not
determine a Phase 1 role.

---

# No-assignment conditions

Assign no role when:

- the Evidence identity is missing or unresolved;
- the Evidence is present only through aggregated Mechanism or Theory ancestry;
- the Seed has no retained Reasoning Path;
- the Explanation failed completion;
- the only relationship is `supports`, `explains`, `extends`, `depends_on`, or
  `duplicates` between Evidence records without a Seed support link;
- a `contradicts` relationship has both endpoints supporting the same
  Explanation;
- a contradiction does not structurally target the Explanation;
- comparability requires text or a benchmark family label;
- reliability or time would be required to decide the role;
- multiple valid derivations disagree;
- any referenced identity belongs to another organization;
- the producer cannot prove the relationship from the allowed inputs.

Absence is the correct output when meaning is not structurally available.

---

# Determinism requirements

## Stable assignment identity

Do not add a standalone assignment ID in Phase 1. The stable composite identity
is:

```text
explanationId
| evidenceId
| role
| basis.kind
| sorted basis.referenceIds
| sorted relatedExplanationIds
```

## Ordering

Sort assignments by:

1. `evidenceId`;
2. explicit role order: `supports`, `opposes`, `shared`;
3. `basis.kind`;
4. stable serialization of `basis.referenceIds`;
5. stable serialization of `relatedExplanationIds`.

Never depend on enum declaration order, input order, Map insertion order, or
fixture order.

## Deduplication

Deduplicate by the full composite identity. Multiple structured paths may
produce one assignment only when every stored semantic field is identical.
Distinct bases remain distinct assignments only if the distinction is required
for traceability.

## Identity preservation

Comparative roles must not participate in:

- `OrganizationalExplanation.semanticKey`;
- completed Explanation ID generation;
- Evidence identity;
- Seed identity;
- organization identity.

Role changes revise representation; they do not create a new Explanation.

## Replay

With identical canonical inputs and `now`, repeated output must be byte equal.
Reversing Evidence, Evidence Relationship, Seed, Mechanism, Theory, or
Explanation input order must not change output.

---

# Serialization and Runtime compatibility

## Persistence

The optional collection is serialized inside:

```text
OrganizationRuntime.memory.organizationalExplanations[]
```

No new Runtime collection, index, store, or version authority is introduced.

## Missing-field behavior

Historical records without `comparativeEvidenceRoles` remain valid.

Readers must interpret:

```text
undefined
```

as:

```text
role contract not yet materialized
```

They must not interpret it as proof that no role exists.

After the producer runs under the activated contract, it writes an explicit
array, including `[]` when no role is derivable.

## Unknown values

Runtime loading must preserve safe forward compatibility. Production consumers
do not exist in Phase 1, so unknown future roles must not be interpreted.
Schema validation should reject malformed activated output rather than silently
coerce it into a known role.

## Timestamps

Role assignment must not independently modify `createdAt`. `updatedAt` follows
the existing completed-Explanation evolution behavior; Phase 1 introduces no
new timestamp.

---

# Backward compatibility strategy

1. make the collection optional;
2. keep every existing field and semantic key unchanged;
3. load historical Runtime records without migration;
4. normalize missing role collections only at the producer or read boundary,
   never by mutating stored history during load;
5. keep all downstream consumers blind to the field;
6. provide exact output fallback by disabling role formation;
7. require old Runtime → new code → serialized Runtime round-trip validation;
8. do not require new code to rewrite canonical fixtures.

No behavior may branch on role data during Phase 1.

---

# Migration requirements

Phase 1 uses lazy forward materialization.

## Required

- new and normally evolved completed Explanations receive the explicit role
  collection;
- existing Explanation IDs and `createdAt` values are retained;
- derivation is idempotent;
- role removal and addition are visible as nested representation changes;
- a dry-run report compares missing, added, removed, and changed assignments;
- failed derivation leaves roles absent or empty according to whether the
  producer was activated for that record.

## Not required

- bulk Runtime rewrite;
- one-time fixture migration;
- historical role reconstruction;
- new migration service;
- new schema version object;
- adjudication state migration.

Historical roles must not be fabricated from current text or current ranking.

---

# Validation rules

Activated producer output is valid only when:

1. every assignment uses an allowed role;
2. every `evidenceId` resolves to canonical Evidence in the same organization;
3. every basis reference resolves to the correct canonical input type;
4. every `relatedExplanationId` resolves to a different successfully completed
   Explanation in the same organization;
5. `shared` assignments satisfy exact scope and overlapping-outcome
   comparability;
6. `supports` assignments resolve to a retained Seed Evidence reference;
7. `opposes` assignments resolve to a canonical `contradicts` Evidence
   Relationship with exactly one supported endpoint;
8. arrays are unique and canonically sorted;
9. no role changes Explanation identity;
10. no role changes confidence, viability, ranking, or downstream output;
11. no cross-organization reference exists;
12. no role was derived from text, metadata weighting, or benchmark truth;
13. absence of `sourceId` does not suppress an otherwise valid role.

Invalid production role output must fail the focused producer result or remain
unmaterialized. It must not be silently accepted.

---

# Benchmark requirements before production activation

A focused **Comparative Evidence Role Formation** benchmark must run the actual
production producer with actual structured production inputs.

It must not inject final role assignments.

## Required scenarios

1. one Seed-supported Evidence item;
2. Mechanism-only ancestry with no Seed support;
3. Theory-only ancestry with no Seed support;
4. one canonical contradiction against supported Evidence;
5. ambiguous contradiction whose endpoints both support the candidate;
6. shared support across comparable Explanations;
7. same Evidence across non-comparable scope;
8. same Evidence across non-overlapping outcomes;
9. duplicate Evidence relationships;
10. irrelevant Evidence;
11. missing `sourceId`;
12. reliability metadata present and ignored;
13. timestamp metadata present and ignored;
14. reversed Evidence order;
15. reversed Evidence Relationship order;
16. reversed Seed and Explanation order;
17. historical Explanation without the optional field;
18. repeated evolution with no role change;
19. organization isolation;
20. malformed or unresolved references.

## Required invariants

- exact role set;
- exact basis identities;
- exact related Explanation identities;
- stable Evidence, Seed, Explanation, and organization identities;
- byte-stable repeated replay;
- reversed-order equality;
- no confidence or viability change;
- no Condition, State, Understanding, Assessment, recommendation, risk,
  opportunity, simulation, communication, or projection change;
- no Runtime fixture mutation;
- old Runtime load and round-trip compatibility;
- feature-disabled output equal to the pre-Phase 1 baseline.

## Complete regression

Before activation, run the full canonical sequence defined by the Discovery 2
Sequential Implementation Program, including Evidence Provenance, Evidence
Independence, Ground Truth, Judgment, Operating Model Evolution, Executive
Decision, order independence, Simulation, Collaboration, cognition validation,
architecture validation, typecheck, build, and `git diff --check`.

Accepted pre-existing failures must be reported unchanged.

---

# Production activation decision

Phase 1 role formation may be activated only if the focused benchmark proves
that `supports`, `opposes`, and `shared` are derived exactly from canonical
structured production inputs without downstream movement.

That activation gate is satisfied. The production benchmark passes 20/20 and
normal forward Runtime evolution now materializes the optional role
collection.

Phase 1 activation does not authorize completed-Explanation adjudication.

The existing adjudication benchmark materially depends on roles that production
cannot currently derive:

- `discriminates`;
- `counterfactual`;
- observed `outcome`;
- `ruleOut`.

Therefore Phase 2 must stop after Phase 1 unless a later, separately authorized
contract identifies canonical structured producers for those meanings.

The correct response to that gap is not to:

- parse Evidence text;
- copy benchmark links;
- infer from the expected winner;
- treat opposition as decisive discrimination;
- create a universal candidate ecology;
- add a provider-generated role;
- let adjudication assign its own input semantics.

---

# Explicit Phase 1 non-goals

Phase 1 does not:

- adjudicate completed Explanations;
- change `viability`;
- select a leading Explanation;
- rank alternatives;
- calculate or revise confidence;
- apply reliability weighting;
- apply recency weighting;
- infer Evidence independence beyond preserving `sourceId`;
- semantically deduplicate Evidence;
- synthesize counterfactuals;
- link observed outcomes;
- infer rule-out or discrimination;
- change contradiction logic;
- change Mechanisms, Beliefs, Concepts, Theories, Conditions, or State;
- change Organizational Understanding or Executive Assessment;
- change recommendations, risks, opportunities, simulations, communication, or
  projection;
- change Runtime identity or create a new Runtime collection;
- add a capability;
- add a cognitive primitive;
- add a provider or AI role classifier;
- modify applications;
- migrate historical records in bulk;
- activate Phase 2.

---

# Implementation file forecast

The smallest expected coding surface is:

```text
engine/v3/model/judgment/organizationalJudgment.ts
engine/v3/model/judgment/completeOrganizationalExplanations.ts
engine/v3/runtime/evolveOrganizationRuntime.ts
engine/benchmark/judgment-lab/<focused comparative-role benchmark>.ts
```

`organizationRuntime.ts` and `organizationStateStore.ts` should require no
semantic change if the optional nested field serializes through the existing
completed Explanation collection. They may receive compatibility tests but
should not be modified unless implementation evidence proves a typed loader
change is required.

No downstream production file belongs in the Phase 1 implementation diff.

---

# Completion standard

The contract is implemented when:

- the optional nested schema exists on completed Explanations;
- the existing completion producer is the sole owner;
- only `supports`, `opposes`, and `shared` can be assigned;
- every assignment is structurally traceable;
- unsupported meanings remain absent;
- Runtime and historical records remain compatible;
- role formation is deterministic and order independent;
- no downstream output changes;
- the focused and complete regressions pass;
- the Phase 2 activation blocker is documented and preserved.

If any allowed role cannot be derived under these rules, implementation must
omit that role or stop. It must not weaken the semantic definition to make the
benchmark pass.
