# Completed Explanation Input Contract

**Status:** Canonical — implemented and active
**Program:** Discovery 2 Sequential Implementation Program
**Governing role semantics:** Comparative Evidence Roles Contract
**Production activation:** Active for normal forward Runtime evolution

---

# Purpose

This document defines the smallest safe input change required for
`completeOrganizationalExplanations()` to materialize the existing Comparative
Evidence Roles Contract.

It resolves the input insufficiency demonstrated by the Comparative Evidence
Roles benchmark gate:

- Seed support is structurally traceable, but the completion producer cannot
  validate referenced Evidence identities;
- canonical Evidence contradictions exist upstream, but their endpoints do not
  reach the completion producer;
- completed Explanation comparison is already available for `shared`.

The implemented design changes only what structured upstream truth the
existing completion producer consumes. It does not change upstream cognition
or add a second owner for Evidence, relationships, or completed Explanations.

---

# Decision

The existing Runtime orchestration boundary should construct and pass one
optional, bounded, deterministic Evidence context to
`completeOrganizationalExplanations()`.

The context contains:

1. the identities from the current organization-scoped canonical Evidence
   collection;
2. only canonical Evidence Relationships whose type is `contradicts`;
3. the organization identity of the current Runtime evolution.

It contains no Evidence text, confidence, provenance metadata, relationship
confidence, relationship explanation, contradiction prose, Runtime state, or
downstream cognition.

The selected design is a bounded structured view of existing canonical truth.
It is not a new cognitive object, persistence object, relationship authority,
resolver service, or Runtime collection.

---

# Production architecture evidence

## Existing orchestration boundary

`evolveOrganizationRuntime()` receives one `DiscoveryV3Result` for the Runtime
organization and calls `completeOrganizationalExplanations()` after Seeds,
Mechanisms, Beliefs, and Theories have been produced.

At that call site, the following already coexist:

- `runtime.metadata.organizationId`;
- `result.evidence`;
- `result.evidenceRelationships`;
- `result.contradictions`;
- the completed-Explanation inputs already passed today.

No global search or new store is required.

## Canonical Evidence identity

`DiscoveryV3Result.evidence` is the canonical Evidence collection for the
current investigation and organization evolution. `V3Evidence.id` is the
stable identity required to validate a Seed Evidence reference.

The completion producer does not need Evidence content or metadata to form a
Phase 1 role. It needs only to determine whether a reference resolves to
exactly one canonical identity in the current organization-scoped input.

## Canonical opposition

`V3EvidenceRelationship` is the existing canonical object that explicitly
relates two Evidence identities and assigns the type `contradicts`.

For Phase 1, this is sufficient to derive narrow opposition only when exactly
one endpoint already has a valid `supports` assignment for the current
Explanation. The other endpoint may then receive `opposes`.

The stored `sourceEvidenceId` and `targetEvidenceId` identify endpoints. They
do not establish stronger causal or adjudicative direction. A `contradicts`
relationship is treated symmetrically for this narrow derivation:

```text
exactly one endpoint supports the Explanation
→ the other endpoint opposes that Explanation's support
```

No transitive closure is permitted.

## Why `V3Contradiction` is not an input

Current `V3Contradiction` records contain:

- `evidenceIds`;
- optional `opposingEvidenceIds`;
- prose and confidence;
- no completed Explanation target;
- no reliable partition between supporting and opposing endpoints.

Representative Runtime records confirm that `opposingEvidenceIds` may repeat
the full `evidenceIds` collection or be empty. They do not encode which
Evidence opposes which other Evidence or which completed Explanation is
targeted.

Passing `V3Contradiction` would therefore add data without adding the missing
canonical direction. It could encourage inference from titles or prose, which
the governing role contract prohibits.

Contradiction synthesis remains the owner of contradiction truth.
`V3EvidenceRelationship` remains the owner of the Evidence-to-Evidence
`contradicts` relationship. Neither ownership moves to completed Explanation
construction.

---

# Exact proposed TypeScript contract

The following is the required conceptual shape. Implementation may adjust type
names to repository conventions but may not broaden the data or semantics.

```ts
import type {
  V3Evidence,
  V3EvidenceRelationship,
} from "../../types";

export type OrganizationalExplanationCompletionEvidenceContext = {
  organizationId: string;

  evidence: Array<
    Pick<V3Evidence, "id">
  >;

  relationships: Array<
    Pick<
      V3EvidenceRelationship,
      | "id"
      | "sourceEvidenceId"
      | "targetEvidenceId"
      | "type"
    >
  >;
};

type CompleteOrganizationalExplanationsInput = {
  // Existing fields remain unchanged.
  organizationId: string;
  seeds: OrganizationalExplanationSeed[];
  mechanisms: OrganizationalMechanism[];
  beliefs: OrganizationalBelief[];
  theories: OrganizationalTheory[];
  existingExplanations?: OrganizationalExplanation[];
  contradictionIds?: string[];
  now: string;

  evidenceContext?: OrganizationalExplanationCompletionEvidenceContext;
};
```

Although the relationship type remains present for validation, the
orchestration boundary must include only relationships whose type is
`contradicts`. The producer must independently verify the type and must not
trust filtering alone.

The context is a private producer input. It is not serialized into Runtime.
Only later, separately authorized role assignments would be serialized inside
their owning completed Explanation.

---

# Source of each input

| Context field | Canonical source | Construction owner | Consumer |
|---|---|---|---|
| `organizationId` | `runtime.metadata.organizationId` | `evolveOrganizationRuntime()` | completion producer |
| `evidence[].id` | `result.evidence[].id` | `evolveOrganizationRuntime()` | completion producer |
| relationship `id` | `result.evidenceRelationships[].id` | `evolveOrganizationRuntime()` | completion producer |
| relationship endpoints | `result.evidenceRelationships[]` | `evolveOrganizationRuntime()` | completion producer |
| relationship `type` | `result.evidenceRelationships[].type` | `evolveOrganizationRuntime()` | completion producer |

`evolveOrganizationRuntime()` constructs the view because it is the existing
boundary that holds both the current organization identity and the canonical
investigation result. It does not derive roles.

The completion producer remains the only owner of role population because it
alone owns the successfully completed Explanation set and candidate-relative
comparison.

---

# Context construction

The orchestration boundary must:

1. copy only Evidence IDs;
2. select only Evidence Relationships with type `contradicts`;
3. copy only the four declared relationship fields;
4. sort Evidence entries by ID;
5. sort relationships by ID, source Evidence ID, target Evidence ID, and type;
6. preserve duplicate input rows so the producer can detect ambiguous
   identities;
7. attach the current Runtime organization identity;
8. avoid reading prior or global organization state.

It must not:

- infer roles;
- parse Evidence or relationship prose;
- resolve contradiction titles;
- attach source, reliability, time, confidence, or sensitivity;
- search Runtime memory;
- merge Evidence from multiple organizations;
- mutate the canonical result.

---

# Canonical Evidence validation

## Valid identity

An Evidence identity is valid for role formation only when:

1. it is a non-empty string;
2. it appears exactly once in `evidenceContext.evidence`;
3. the context organization equals the producer input organization;
4. the reference comes from an otherwise valid completed Explanation Seed.

The producer may build a local count index for the duration of the call. That
index is an implementation detail and must not be returned or persisted.

## Unresolved identity

If a Seed Evidence ID does not resolve, suppress only assignments involving
that Evidence identity. Do not fail Explanation completion, remove ancestry,
or suppress valid assignments for other Evidence.

An unresolved Seed reference may remain in existing ancestry because Phase 1
does not redefine ancestry validation. It may not receive a comparative role.

## Duplicate identity

If the Evidence collection contains the same ID more than once, that identity
is ambiguous even when the duplicate records appear exact. Suppress role
assignments for that Evidence ID.

Do not select the first record, use input order, or silently treat multiple
records as one canonical identity.

## Malformed identity

Empty or non-string identities do not resolve and receive no assignment.
Existing TypeScript types do not replace runtime validation at the production
boundary.

## Cross-organization identity

`V3Evidence` does not currently carry an organization ID. Organization
isolation therefore derives from the existing orchestration boundary:

- one `DiscoveryV3Result` is evolved into one identified Runtime;
- the bounded context is stamped with that Runtime organization;
- the producer requires exact equality between both organization IDs;
- callers must not combine result collections across organizations.

If the context and producer organization IDs differ, role materialization is
invalid for the entire completion call. Existing Explanation completion may
continue, but the optional role collection must remain absent.

This design does not add organization identity to `V3Evidence`.

---

# Canonical relationship validation

A relationship may support `opposes` derivation only when:

1. its ID is a non-empty string;
2. its type is exactly `contradicts`;
3. both endpoint IDs resolve as valid canonical Evidence identities;
4. the source and target IDs differ;
5. exactly one endpoint has valid `supports` for the current Explanation;
6. all rows with the same relationship ID describe one identical semantic
   tuple.

Exact duplicate rows with the same relationship ID and tuple collapse to one
basis. Conflicting rows sharing an ID invalidate that relationship ID.

Relationships of type `supports`, `depends_on`, `explains`, `extends`, or
`duplicates` produce no `opposes` assignment.

If both endpoints support the Explanation, the relation is ambiguous for
candidate-relative opposition and produces no `opposes` assignment.

If neither endpoint supports the Explanation, it does not target that
Explanation and produces no assignment.

Indirect chains and multiple-hop paths are ignored. The producer must not
infer:

- discrimination;
- falsification;
- rule-out;
- counterfactual evidence;
- observed outcome;
- comparative ranking.

---

# Role derivation order

When later implementation is authorized, the producer must:

1. complete the full Explanation candidate set using existing behavior;
2. validate the optional Evidence context;
3. derive valid `supports` assignments from retained Seed Evidence;
4. derive `opposes` from valid direct `contradicts` relationships and the
   completed `supports` set;
5. derive `shared` from valid support across comparable completed
   Explanations;
6. canonicalize and validate the complete assignment collection;
7. attach it without changing Explanation identity or any downstream output.

This ordering is required because `opposes` depends on valid support and
`shared` depends on the complete successful Explanation set.

The allowed role semantics remain exactly those in the Comparative Evidence
Roles Contract.

---

# Absence and failure behavior

| Condition | Explanation completion | Role field after activation |
|---|---|---|
| `evidenceContext` absent | existing behavior | absent |
| context organization mismatch | existing behavior | absent |
| structurally malformed context | existing behavior | absent |
| valid context, no derivable role | existing behavior | explicit `[]` |
| one unresolved Evidence reference | existing behavior | suppress affected assignments only |
| one ambiguous relationship ID | existing behavior | suppress assignments based on that relationship only |
| Seed fails existing completion | existing failure behavior | no completed Explanation |

Absence means the role contract was not materialized. An explicit empty array
means the producer evaluated a valid activated context and derived no role.

No context defect may alter confidence, viability, ancestry, identity,
ordering, Conditions, State, Understanding, Assessment, recommendations, or
projection.

---

# Determinism

The context and all derived local indexes must be deterministic.

Required rules:

- normalize context arrays before derivation;
- do not rely on caller order or Map insertion order;
- group duplicate IDs before deciding validity;
- compare relationship tuples through stable field serialization;
- use the explicit role order from the governing contract;
- sort basis and related Explanation identities;
- deduplicate only by the governing composite assignment identity;
- do not use current time beyond the existing `now` input;
- do not include role data in the Explanation semantic key or ID.

Reversing Evidence, Evidence Relationship, Seed, Mechanism, Theory, or prior
Explanation input order must produce byte-equivalent results for the same
`now`.

---

# Serialization and Runtime compatibility

`OrganizationalExplanationCompletionEvidenceContext` is ephemeral and never
serialized.

The design introduces:

- no Runtime field;
- no Runtime collection;
- no Evidence store;
- no Explanation store;
- no loader behavior;
- no schema migration in this sprint.

When role materialization is separately implemented:

- historical Explanations without the optional role field remain valid;
- missing context preserves the pre-Phase 1 serialized producer output;
- valid activated context writes the optional nested role field only;
- existing IDs, semantic keys, `createdAt`, confidence, and viability remain
  unchanged;
- no bulk Runtime migration is required;
- future evolution may lazily materialize roles;
- disabled rollout is achieved by omitting the optional context.

Representative Runtime inspection shows two relevant realities:

1. Evidence and Evidence Relationships serialize under
   `memory.understandingState`;
2. existing persisted `memory.organizationalExplanations` may be legacy
   pre-completion shapes without `claim` or comparative roles.

The design relies on neither persisted shape for input construction. It uses
the current canonical result at evolution time and preserves historical
loading behavior.

---

# Ownership

| Responsibility | Canonical owner after this design |
|---|---|
| Evidence identity and content | existing Evidence producer |
| Evidence-to-Evidence relationship type and endpoints | existing Evidence Relationship producer |
| contradiction synthesis | existing contradiction producer |
| bounded context assembly | existing Runtime orchestration boundary |
| Seed support relationship | existing Explanation Seed producer |
| completed Explanation identity and comparison | existing completion producer |
| comparative role population | existing completion producer |
| persistence | existing Runtime memory |
| future adjudication | deferred Phase 2 owner |

The completion producer consumes references to upstream truth. It does not
become an Evidence owner, contradiction owner, or second relationship
authority.

Context assembly is projection, not cognition. It neither creates nor
reinterprets a relationship.

This design does not modify the central Organizational Understanding ownership
migration and introduces no generalized architecture layer.

---

# Alternatives evaluated

## 1. Full Evidence and Evidence Relationship collections

### Assessment

- **Semantic correctness:** sufficient;
- **ownership clarity:** acceptable but exposes unrelated fields;
- **determinism:** achievable;
- **coupling:** high;
- **migration risk:** low;
- **Runtime impact:** none;
- **benchmarkability:** strong;
- **Phase 2 usefulness:** broader than Phase 1 requires;
- **overbuilding risk:** moderate.

### Decision

Rejected. The completion producer does not need Evidence text, confidence,
provenance, or non-contradictory relationship types. Passing them increases
coupling and creates opportunities for prohibited inference.

## 2. Narrow deterministic indexes

Examples include `Map<string, V3Evidence>` and relationship indexes keyed by
endpoint.

### Assessment

- **Semantic correctness:** sufficient;
- **ownership clarity:** acceptable;
- **determinism:** depends on construction and iteration discipline;
- **coupling:** low;
- **migration risk:** low;
- **Runtime impact:** none;
- **benchmarkability:** moderate;
- **Phase 2 usefulness:** limited;
- **overbuilding risk:** moderate.

### Decision

Rejected as the public input contract. Maps and resolver indexes obscure
duplicate canonical IDs, are less serialization-independent, and can make
caller construction behavior part of semantics. The producer may construct
local indexes from bounded arrays.

## 3. Bounded structured context

### Assessment

- **Semantic correctness:** sufficient for all three allowed roles;
- **ownership clarity:** strongest;
- **determinism:** explicit and testable;
- **coupling:** minimal;
- **migration risk:** low;
- **Runtime impact:** none;
- **benchmarkability:** strong;
- **Phase 2 usefulness:** preserves exact structured bases without enabling
  adjudication;
- **overbuilding risk:** low.

### Decision

Selected.

## 4. Extend `V3Contradiction` through the completion boundary

### Assessment

- **Semantic correctness:** insufficient in its current shape;
- **ownership clarity:** risks making contradiction grouping a directional
  Evidence authority;
- **determinism:** achievable but semantically incomplete;
- **coupling:** moderate;
- **migration risk:** high because the upstream schema would change;
- **Runtime impact:** potential persisted-shape change;
- **benchmarkability:** possible only after inventing missing partitions;
- **Phase 2 usefulness:** speculative;
- **overbuilding risk:** high.

### Decision

Rejected. Current contradiction objects do not canonically encode the required
endpoint relationship or Explanation target.

## 5. Resolver function

Example:

```ts
resolveEvidence(id): V3Evidence | undefined
```

### Assessment

- **Semantic correctness:** potentially sufficient;
- **ownership clarity:** ambiguous;
- **determinism:** difficult to prove from the producer contract;
- **coupling:** hides external state;
- **migration risk:** low;
- **Runtime impact:** none;
- **benchmarkability:** weaker because behavior can vary behind the resolver;
- **Phase 2 usefulness:** unnecessary;
- **overbuilding risk:** high.

### Decision

Rejected. A resolver service introduces hidden behavior and makes byte-stable,
isolated replay harder to establish.

## 6. Pass only `V3EvidenceRelationship[]`

### Assessment

- **Semantic correctness:** insufficient;
- **ownership clarity:** clear;
- **determinism:** achievable;
- **coupling:** low;
- **migration risk:** low;
- **Runtime impact:** none;
- **benchmarkability:** strong;
- **Phase 2 usefulness:** limited;
- **overbuilding risk:** low.

### Decision

Rejected. The benchmark proved that relationships alone cannot validate Seed
Evidence identities.

---

# Benchmark changes required

Before implementation is activated, the existing Comparative Evidence Roles
gate must be converted from a sufficiency observer into a focused production
formation benchmark.

It must:

1. pass the bounded context through the real producer;
2. inspect actual `comparativeEvidenceRoles` produced by that producer;
3. stop using benchmark-local assignment formation as the result under test;
4. retain all 20 existing scenarios;
5. add explicit malformed-context and conflicting-relationship-ID controls;
6. prove exact assignment sets and basis identities;
7. prove missing context is byte-equal to the pre-Phase 1 producer output;
8. prove valid context with no roles produces explicit `[]`;
9. prove organization mismatch leaves the role field absent;
10. prove reversed input and repeated replay byte equality;
11. prove no downstream movement;
12. prove historical Runtime load and round-trip compatibility.

The benchmark may construct canonical Evidence and relationship fixtures as
producer inputs. It may not inject final role assignments or expected
candidate truth into production.

After the focused benchmark passes, run the complete regression sequence in
the Discovery 2 Sequential Implementation Program.

---

# Production implementation sequence

Implementation must remain sequential:

1. add the optional nested role schema to `OrganizationalExplanation`;
2. add the private optional Evidence context type and producer input;
3. add focused context validation and deterministic local indexing;
4. construct the bounded context at `evolveOrganizationRuntime()`;
5. derive `supports`;
6. derive direct `opposes`;
7. derive `shared` after the full completed set exists;
8. attach canonical assignments without changing identity or existing fields;
9. convert and run the focused benchmark gate;
10. run Runtime compatibility and full regression validation;
11. inspect the complete diff for downstream or ownership leakage.

Do not combine this sequence with Explanation adjudication.

Expected production files remain:

```text
engine/v3/model/judgment/organizationalJudgment.ts
engine/v3/model/judgment/completeOrganizationalExplanations.ts
engine/v3/runtime/evolveOrganizationRuntime.ts
```

No downstream consumer belongs in the implementation diff.

---

# Rollback strategy

The rollback boundary is the optional `evidenceContext` input.

If role materialization is unsafe:

1. stop passing `evidenceContext` at the orchestration call site;
2. the producer returns the exact pre-Phase 1 shape;
3. leave historical Runtime records readable because the nested role field is
   optional;
4. do not rewrite or delete previously persisted records;
5. do not activate downstream consumers.

If implementation cannot preserve byte-equivalent disabled output, stable
Explanation identity, and downstream noninterference, revert the Phase 1
production change as one focused unit.

---

# Explicit non-goals

This design does not:

- authorize role semantics beyond `supports`, `opposes`, and `shared`;
- authorize production schema changes beyond the implemented optional field;
- authorize a producer other than
  `completeOrganizationalExplanations()`;
- change Evidence or Evidence Relationship production;
- extend `V3Contradiction`;
- create a universal Evidence-role object;
- create a new cognitive capability;
- create a Runtime collection or store;
- add an Evidence resolver;
- adjudicate completed Explanations;
- rank or select Explanations;
- change confidence or viability;
- infer discrimination, falsification, rule-out, counterfactual, or observed
  outcome semantics;
- use Evidence text, labels, confidence, reliability, time, or source identity
  to assign a role;
- change downstream consumers;
- change Organizational Understanding ownership;
- migrate historical Runtime records;
- activate Phase 2.

---

# Phase 1 unblocking criteria

Phase 1 implementation may proceed only when this input design is accepted and
the implementation sprint remains bounded to:

- the existing completed Explanation schema;
- the existing completion producer;
- bounded context construction at the existing orchestration call site;
- the focused benchmark and compatibility validation.

Production activation then requires proof that:

1. every Seed-supported role resolves to exactly one current canonical
   Evidence identity;
2. every opposition role resolves to one direct canonical `contradicts`
   relationship with exactly one supported endpoint;
3. every shared role resolves across comparable successfully completed
   Explanations;
4. unresolved or ambiguous references suppress only unsafe assignments;
5. organization mismatch prevents all role materialization;
6. missing context preserves exact historical producer output;
7. repeated and reversed-order replay are byte stable;
8. Explanation and organization identities remain stable;
9. Runtime compatibility passes without bulk migration;
10. all downstream cognition and executive outputs remain unchanged.

The focused production benchmark satisfies these criteria and normal forward
Runtime evolution is active. This does not alter the Phase 2 gate.

The design does not unblock Phase 2 adjudication. Missing discrimination,
counterfactual, observed-outcome, and rule-out semantics remain explicit
future gates.
