# Completed Explanation Adjudication Contract

**Status:** Canonical design — production activation blocked
**Program:** Discovery 2 Sequential Implementation Program, Phase 2
**Depends on:** Comparative Evidence Roles Contract
**Production behavior:** Unchanged

---

The production producer audit supporting this blocked status is:

```text
CANDIDATE_RELATIVE_EXPLANATION_TEST_PRODUCER_AUDIT.md
```

# Purpose

This document defines the smallest legitimate production responsibility for
adjudicating completed `OrganizationalExplanation` objects.

It answers:

> Given multiple completed Organizational Explanations, what canonical
> structured information is sufficient to determine their relative status
> without inventing unsupported semantics?

The answer from the current production architecture is:

> Phase 1 structure is sufficient to identify comparable Explanations,
> structural support, narrow opposition, and shared Evidence. It is not
> sufficient to determine decisive preference, rule-out, observed-outcome
> confirmation, confidence, or a selected current Explanation.

Phase 2 therefore remains blocked. This contract preserves the intended owner,
semantic boundaries, compatibility requirements, benchmark gate, and exact
unblocking condition. It does not authorize a schema or producer change.

---

# Benchmark evidence

## Demonstrated production evidence

Production now provides:

- completed Explanation identity, normalized scope, outcomes, and ancestry;
- deterministic `supports`, `opposes`, and `shared` Evidence roles;
- exact Explanation comparability based on organization, scope, and
  overlapping outcome identity;
- canonical Evidence identity;
- direct Evidence-to-Evidence `contradicts` and `duplicates` relationships;
- optional Evidence `sourceId` provenance;
- deterministic completion and Runtime persistence;
- historical compatibility when comparative roles are absent.

The Comparative Evidence Roles Production Gate passes `20/20`. It proves role
formation, basis traceability, repeated and reversed-order equality,
organization isolation, historical compatibility, and downstream
noninterference.

## Demonstrated benchmark-only evidence

The Completed Explanation Adjudication Production Shadow reports:

- exact completed Explanation sets and ancestry;
- `34/34` expected leaders and abstentions;
- deterministic repeated replay;
- Evidence-, candidate-, and source-order equivalence;
- no authoritative production writes;
- Classification A inside its controlled fixture model.

That result demonstrates that completed Explanations can support adjudication
when adequate structured comparative semantics exist.

It does not demonstrate that those semantics exist in production.

## Fixture-only semantics

The shadow adjudicator receives benchmark-owned links for:

- `discriminate`;
- `counterfactual`;
- `outcome`;
- `ruleOut`;
- `corroborate`;
- `bounded`, `weak`, and `stale`;
- `feedback`;
- expected viable sets and expected leaders.

It also assigns benchmark-owned confidence constants such as `0.88`, `0.78`,
`0.66`, `0.52`, `0.45`, and `0.20`.

Those fields and constants are not production contracts. They must not be
copied into `OrganizationalExplanation`, Runtime, or a production adjudicator.

The Competing Explanation Production Shadow's controlled-fixture overfit
finding reinforces this boundary: success on fixture-owned role labels is not
evidence of production semantic availability.

---

# Production boundary

Production currently persists completed Explanations as:

```ts
export type OrganizationalExplanation = {
  // Stable identity, claim, and ancestry fields.
  comparativeEvidenceRoles?:
    OrganizationalExplanationEvidenceRoleAssignment[];
  viability: "unadjudicated";
  uncertainty: string[];
  // Existing timestamps.
};
```

That remains the exact authorized TypeScript contract for Phase 2 at present.

No adjudication field, standing, score, leader, rank, confidence, disposition,
or selection reference may be added until the unblocking criteria in this
document are satisfied.

The absence of an adjudication extension is intentional. Adding a richer
shape before its inputs have canonical producers would create placeholder
architecture and invite benchmark-only semantics into production.

---

# Canonical owner

Completed `OrganizationalExplanation` is the intended owner of its durable
adjudication state.

The future canonical write owner should be one deterministic Explanation
evaluation step in the existing completed-Explanation producer boundary:

```text
completeOrganizationalExplanations()
→ adjudicate completed Explanations
→ persist the completed set
```

The evaluation may be implemented as a second pure function called by the
existing orchestration path. It must not become an independently writable
store, service, capability, or downstream consumer.

`completeOrganizationalExplanations()` remains the sole owner of:

- completed Explanation identity;
- completed claim and ancestry;
- comparative role materialization.

The future adjudication step would own only the adjudication fields it
produces. Runtime would persist those fields without interpreting them.

## Seed-era `OrganizationalJudgment`

`evaluateExplanations()` evaluates `OrganizationalExplanationSeed` objects
using raw-count and Seed-era criteria, then provides ranked
`OrganizationalJudgment` objects to Executive Assessment.

It is not the completed-Explanation adjudication authority.

Its current status is:

- retained provisional evaluator for backward compatibility;
- existing downstream input contributor;
- not a source of completed Explanation viability or selection;
- an eventual retirement or migration candidate only after a later
  Explanation-aware consumer proves parity and benefit.

Phase 2 must not make Seed-era Judgment write or overwrite completed
Explanation adjudication state.

---

# Exact semantic vocabulary

These meanings remain distinct.

## Support

Evidence is structurally referenced by a completed Explanation's retained Seed.

Production representation:

```text
comparativeEvidenceRoles.role = supports
```

Support does not establish independence, quality, viability, dominance, or
truth.

## Opposition

Evidence directly contradicts Evidence that structurally supports the
Explanation.

Production representation:

```text
comparativeEvidenceRoles.role = opposes
```

Opposition establishes contestability. It does not establish discrimination,
falsification, rule-out, or required confidence movement.

## Shared Evidence

The same Evidence supports at least two comparable completed Explanations.

Production representation:

```text
comparativeEvidenceRoles.role = shared
```

Shared Evidence cannot distinguish the compared Explanations and must not be
counted as additional independent support.

## Discrimination

Evidence favors one comparable completed Explanation over another under an
explicit structured comparison.

Production status:

```text
not represented
```

No current canonical producer emits an Evidence-to-Explanation-pair
discrimination relationship.

## Falsification

Evidence demonstrates that an Explanation's claim or required implication is
false under a defined test.

Production status:

```text
not represented at the completed-Explanation boundary
```

A contradiction or `opposes` role is not falsification.

## Rule-out

A decisive structured basis makes an Explanation non-viable for the evaluated
claim and context.

Production status:

```text
not represented
```

No current producer owns this transition.

## Missing Evidence

The canonical structured information required to evaluate or distinguish an
Explanation is absent.

Production status:

- general uncertainty objects and prose exist;
- completed Explanations retain `uncertainty`;
- no canonical completed-Explanation missing-Evidence requirement identifies
  the exact test, target Explanation, comparison, or resolution condition.

An empty comparative-role array cannot be interpreted as proof of insufficient
Evidence. It means only that a valid Phase 1 context produced no eligible role.

## Uncertainty

Known limits on the Explanation or its comparison.

Production status:

- an `uncertainty: string[]` field exists;
- it is not currently a structured adjudication rationale;
- text must not drive adjudication.

## Explanatory coverage

The degree to which an Explanation accounts for the relevant outcomes and
scope.

Production status:

- outcome ancestry and scope exist;
- no canonical coverage metric or required-outcome set exists at this
  boundary.

Counting outcome references is not a valid coverage score.

## Causal completeness

Whether the Explanation contains the required causal structure for the claim.

Production status:

- completion requires a Seed, Reasoning Path, root Mechanism, Theory, Evidence
  ancestry, scope, and outcome;
- that is construction completeness, not proof that the causal account is
  complete.

No canonical causal-completeness measure exists.

## Observed outcome confirmation

A later observed outcome confirms a prediction or implication attributable to
the Explanation.

Production status:

- Prediction Evaluation and Executive Review outcome objects exist downstream;
- neither canonically targets a completed Explanation or one of its required
  implications;
- neither is available as an upstream adjudication input.

## Outcome weakening

A later observed outcome conflicts with a prediction or implication
attributable to the Explanation.

Production status:

```text
not linked to completed Explanations
```

## Explanation comparability

Two completed Explanations are comparable only when they:

1. belong to the same organization;
2. have exactly equal normalized claim scope;
3. share at least one exact outcome reference;
4. have different Explanation identities.

This Phase 1 definition is available and sufficient for forming a comparison
set. Comparability does not imply mutual exclusivity.

## Explanation viability

Whether an Explanation remains defensible for the evaluated claim and context.

Current production status:

```text
viability: unadjudicated
```

Structural support alone does not prove viability. Opposition alone does not
prove non-viability.

## Explanation selection

The current canonical Explanation preferred over comparable alternatives for a
defined purpose and time.

Production status:

```text
not represented
```

Selection is revisable authority, not permanent truth. It requires stronger
semantics than current production provides.

---

# Adjudication responsibility

## Responsibilities Phase 2 may own after unblocking

Phase 2 may eventually own:

- formation of exact comparable Explanation sets;
- explicit preservation of unresolved alternatives;
- per-Explanation viable, weakened, or ruled-out state when canonical
  structured bases justify those transitions;
- a selected current Explanation only when one has a decisive comparative
  basis;
- abstention when no selection is justified;
- traceable adjudication rationale;
- deterministic revision of adjudication state.

## Responsibilities not automatically granted

Phase 2 does not automatically own:

- Explanation construction;
- Evidence role creation;
- Evidence reliability or recency policy;
- semantic similarity;
- Evidence independence policy;
- confidence calibration;
- Condition or State ranking;
- Organizational Understanding composition;
- Executive Assessment;
- recommendation selection;
- disclosure or application projection;
- permanent truth.

## Current permitted result

Current structured inputs permit a read-only comparison analysis:

- comparable or non-comparable;
- structurally supported or no direct Seed support role;
- opposed or not opposed;
- shared support or candidate-specific support;
- unresolved competition.

That analysis may be benchmarked. It must not yet be persisted as adjudication
or used to change `viability`.

---

# Proposed TypeScript contract

No production schema addition is authorized by this contract.

The exact current contract remains:

```ts
export type OrganizationalExplanation = {
  // Existing fields.
  comparativeEvidenceRoles?:
    OrganizationalExplanationEvidenceRoleAssignment[];

  viability: "unadjudicated";
  uncertainty: string[];
};
```

A future adjudication field may be designed only after the missing structured
semantic contract is accepted and benchmarked. At that time, it must:

- be nested on `OrganizationalExplanation`;
- separate viability from selection;
- identify exact canonical basis references;
- preserve competing Explanation identities;
- represent abstention;
- remain optional for historical compatibility;
- avoid participating in Explanation ID or semantic-key generation.

This document intentionally does not canonize future enum values or placeholder
fields whose producers do not yet exist.

---

# Structured inputs

## Available and sufficient for bounded comparison

- completed Explanation identity;
- organization identity;
- normalized claim scope;
- exact outcome references;
- Seed, Reasoning Path, Mechanism, Belief, Theory, Evidence, contradiction, and
  assumption ancestry;
- Phase 1 `supports`, `opposes`, and `shared` assignments;
- exact role bases and related Explanation identities;
- direct canonical `contradicts` relationships;
- existing Evidence identity;
- optional Evidence `sourceId`;
- canonical `duplicates` relationships.

## Available but not sufficient without a new contract

### Evidence independence

`sourceId` and `duplicates` relationships are available upstream, but Phase 1
does not define a production contribution policy or deliver them in the
completed-Explanation role context.

Their presence is not sufficient to assign weights or corroboration.

### Predictions and outcomes

Prediction evaluations and Executive Reviews contain structured outcome
information, but they do not target completed Explanation identities or
required Explanation implications.

Using them would reverse authority direction or rely on lexical matching.

### Conditions and Organizational State

Conditions attach Explanation identities only after Condition scoring.
Organizational State and Executive Assessment are downstream.

They must not adjudicate upstream Explanations because that would create a
feedback loop and duplicate authority.

---

# Missing decisive semantics

| Semantic | Exists in production? | Canonical producer | Available here? | Required for minimum selection? |
|---|---|---|---|---|
| discrimination | no | none | no | yes |
| decisive Evidence | no completed-Explanation relation | none | no | yes |
| rule-out | no | none | no | yes, for rejection |
| observed outcome confirmation | generic outcome evaluation exists | Prediction Evaluation / Executive Review | no Explanation target | yes, for outcome-based strengthening |
| observed outcome weakening | generic outcome evaluation exists | Prediction Evaluation / Executive Review | no Explanation target | yes, for outcome-based weakening |
| counterfactual comparison | no canonical object or link | none | no | yes, when used as a decisive basis |

The smallest missing canonical contract is:

> A structured, candidate-relative Explanation test result that identifies the
> tested completed Explanation, any compared Explanation, the canonical
> Evidence or evaluated outcome basis, the test kind, and whether the result
> discriminates, weakens, confirms, or rules out—without deriving that meaning
> from prose.

This is a missing semantic contract, not authorization to introduce a new
universal cognitive primitive. The next sprint should first determine whether
an existing prediction, outcome-evaluation, Evidence Relationship, or
Reasoning Relationship object can be narrowly extended to own it.

If no existing producer can derive the result, implementation must stop.

---

# Derivation rules

The future adjudicator must follow these rules.

1. Form comparable sets only from exact organization, scope, and overlapping
   outcome identity.
2. Treat `supports` as structural support, not weighted support.
3. Treat `opposes` as contestability, not discrimination or falsification.
4. Treat `shared` as non-discriminating reuse and never as additional weight.
5. Do not select a leader from Evidence counts.
6. Do not reject an Explanation from opposition alone.
7. Do not infer missing Evidence from an empty role collection.
8. Do not infer independence from record count.
9. Do not use confidence, reliability, recency, seniority, prose, family
   labels, or expected answers unless a separate canonical contract explicitly
   authorizes that semantic.
10. Preserve all comparable alternatives when no decisive structured basis
    exists.
11. Abstain rather than use stable identity as a tie-breaker.
12. Never use Conditions, State, Assessment, recommendations, or projections
    to determine upstream adjudication.

Under current inputs, rules 5, 6, 10, and 11 require unresolved preservation.
They do not authorize persisted viability or selection.

---

# Adjudication model evaluation

| Approach | Semantic validity now | Determinism | Main risk | Decision |
|---|---|---|---|---|
| rule-based status assignment | partial | high | status names overclaim Phase 1 roles | defer |
| structured pairwise comparison | valid for comparability only | high | no decisive relation | use in benchmark only |
| viability thresholds | invalid | high | arbitrary thresholds and false precision | reject |
| dominance relation | invalid | high | no canonical discriminator | reject |
| partial ordering | not currently grounded | high | Evidence count becomes hidden score | defer |
| unresolved competing-set preservation | valid | high | limited production value | required fallback |
| score-based ranking | invalid | achievable | duplicates, shared Evidence, overfit | reject |
| hybrid ranking and rules | invalid | achievable | hides missing semantics in complexity | reject |

The canonical model is therefore:

```text
exact comparable set
→ preserve support, opposition, and shared structure
→ preserve unresolved alternatives
→ no leader, rank, confidence, or viability transition
```

This model is safe enough for a benchmark baseline but not sufficient to
activate a durable adjudication field.

---

# Uncertainty and tie behavior

- Multiple comparable Explanations without a decisive structured basis remain
  unresolved.
- Shared Evidence cannot break a tie.
- Equal Evidence counts do not define a tie because counts do not define
  standing.
- Stable ID order may canonicalize serialization only; it must never choose a
  leader.
- Opposition may mark a benchmark comparison as contested but cannot reject or
  automatically weaken the target.
- When role materialization is absent, adjudication is unavailable.
- When role materialization is explicit but insufficient, the benchmark must
  report insufficient structured basis rather than select.
- Non-comparable Explanations are not competitors and must not be ranked
  against one another.

---

# Evidence-independence treatment

Phase 2 must not aggregate Evidence-record volume as corroboration.

Rules:

1. `shared` contributes no additional support weight.
2. Repeated role assignments with the same composite identity collapse under
   the Phase 1 deduplication rule.
3. Evidence carrying the same `sourceId` must not be treated as independent
   merely because record IDs differ.
4. A `duplicates` relationship prevents independent contribution but does not
   establish that two otherwise unlinked records share one source.
5. Missing `sourceId` must not be interpreted as an independent source.
6. No confidence or rank may be calculated until an independence-aware
   contribution contract is canonically available.

Current production preserves relevant provenance, but it has no activated
adjudication-level independence policy. This blocks score-based adjudication.
It does not block a no-count, unresolved comparison benchmark.

---

# Determinism requirements

Any future producer and the focused benchmark must preserve:

- byte-equal repeated output for identical inputs and `now`;
- reversed Evidence-order equality;
- reversed role-order equality;
- reversed Explanation-order equality;
- reversed source-order equality;
- stable Explanation IDs and semantic keys;
- canonical sorting of compared Explanation IDs and basis references;
- explicit status ordering if statuses are later authorized;
- organization isolation;
- no module-level cache or cross-call state;
- no input-order winner;
- no lexical or provider inference;
- no current-time dependency beyond the existing evolution timestamp.

Deterministic output is necessary but not sufficient. A deterministic policy
built on unsupported semantics remains invalid.

---

# Compatibility and migration

Phase 2 must preserve:

- historical Explanations with no comparative roles;
- historical Explanations with roles but no adjudication;
- stable Explanation IDs and semantic keys;
- existing `createdAt` behavior;
- no bulk Runtime migration;
- lazy forward materialization only after activation;
- no application or projection change;
- no Organizational Understanding ownership migration;
- no Condition, State, Assessment, recommendation, or simulation change.

When adjudication context is absent, output remains:

```text
viability: unadjudicated
```

When current structured semantics are insufficient, output also remains:

```text
viability: unadjudicated
```

Absence of adjudication must never be normalized into viability, rejection, or
selection during Runtime loading.

---

# Longitudinal revision compatibility

A future adjudication design must allow:

- new Evidence to add or remove contestability;
- a new canonical test result to discriminate among alternatives;
- resolved contradictions to remove a prior basis;
- evaluated predictions or observed outcomes to confirm or weaken an
  Explanation;
- a selected Explanation to return to unresolved;
- a ruled-out Explanation to be reconsidered when its decisive basis is
  invalidated;
- prior states to remain historically inspectable without changing the stable
  Explanation identity.

Phase 2 does not implement that history.

The future nested adjudication value must be replaceable as current state and
must cite stable basis identities. Durable adjudication history should reuse
the later canonical authority or revision-history mechanism rather than an
append-only array invented here.

---

# Explicit non-goals

Phase 2 does not:

- implement production code or schema;
- activate an adjudication consumer;
- create `AdjudicatedExplanation`;
- create a separate adjudication result store;
- create a generalized Evidence-role registry;
- create a universal candidate framework;
- add a cognitive capability;
- rank or select completed Explanations;
- change Explanation viability or confidence;
- assign benchmark confidence constants;
- infer discrimination or rule-out from opposition;
- infer observed-outcome meaning from text;
- infer Evidence independence from record identity;
- change Seed-era Judgment;
- change Conditions, State, Organizational Understanding, Executive
  Assessment, recommendations, projections, or applications;
- migrate historical Runtime;
- implement longitudinal outcome revision;
- redesign Governance, scope, or contribution policy.

---

# Focused benchmark gate

The next benchmark may execute the real completed-Explanation producer and a
benchmark-only proposed comparison function.

It must use only production-available structured inputs for its baseline path.
It must not inject final adjudication statuses, expected leaders, family truth,
or prose-derived roles into the function under test.

## Required scenarios

1. one structurally supported Explanation;
2. multiple comparable supported Explanations;
3. shared Evidence without double counting;
4. opposing but non-discriminating Evidence;
5. explicit absence of sufficient structured basis;
6. malformed references;
7. unresolved competition;
8. non-comparable Explanations;
9. duplicate Evidence paths;
10. reversed Evidence ordering;
11. reversed Explanation ordering;
12. reversed source ordering;
13. repeated-run byte equality;
14. organization isolation;
15. historical Explanation without roles;
16. no forced winner;
17. no viability or confidence change;
18. no downstream output change.

## Adversarial scenarios

- one Explanation has ten repeated records from one source while another has
  fewer records from distinct sources;
- all compared Explanations share the same supporting Evidence;
- one Explanation has opposition but no discriminating Evidence;
- stable ID order favors the expected fixture leader;
- prose contains decisive language while structured inputs remain
  non-decisive;
- benchmark family labels imply a winner not represented in production;
- an observed outcome exists but has no structured Explanation target;
- duplicate and derivative Evidence use different record IDs;
- all alternatives are weakly supported and the fixture expects selection.

The baseline benchmark must preserve unresolved alternatives in every case
where production lacks a decisive structured basis.

## Decisive-status gate

No benchmark may test a production `selected`, `ruled-out`, or decisively
`weakened` status until it can construct that status from a canonical
production input whose producer and semantics are independently documented.

Fixture labels and expected answers may score the benchmark; they may not be
inputs to the production or shadow producer.

## Complete regression

Before any later activation:

- Comparative Evidence Roles Production Gate;
- Evidence Provenance Preservation;
- Evidence Independence;
- Explanation Seed/Theory Ancestry Bridge;
- Completed Explanation Adjudication Shadow;
- Ground Truth;
- Judgment Lab and Judgment Lab Expansion;
- Operating Model Evolution;
- Executive Decision Lab and order independence;
- Executive Simulation;
- cognition validation;
- architecture validation;
- typecheck;
- build;
- diff checks;
- Atlas and Northstar fixture hash preservation.

---

# Discovery Scorecard hypothesis

## Expected Score Impact

```text
Organizational Understanding  potential improvement in Explanation Quality
                              and Model Coherence after valid adjudication;
                              no movement from this contract alone
User Intelligence             unchanged until a downstream consumer exists
Collective Intelligence       unchanged or not yet measurable
Governance Integrity          unchanged; explicit traceability is mandatory
System Sustainability         unchanged
```

No numerical movement is assigned.

Future observed Organizational Understanding movement requires:

- a focused production benchmark proving semantically valid standing,
  abstention, and any authorized selection;
- exact basis traceability;
- adversarial generalization beyond fixture-owned labels;
- preserved alternatives and uncertainty;
- a later downstream consumer benchmark showing improved Explanation Quality
  or Model Coherence.

Contract completion alone is not score movement.

---

# Alternatives

## 1. Extend completed Explanation with deterministic adjudication status

Benefits:

- correct eventual ownership;
- simple persistence;
- direct traceability.

Risks:

- current roles do not justify viability, rejection, confidence, or selection;
- an enum would canonize unsupported transitions.

Decision:

```text
defer until structured decisive semantics exist
```

## 2. Preserve only an explicit competing Explanation set

Benefits:

- production inputs can derive exact comparability;
- preserves alternatives;
- no forced winner.

Risks:

- duplicates information derivable from current Explanations;
- adds durable state with no authorized consumer;
- does not constitute meaningful adjudication.

Decision:

```text
benchmark as the safe fallback; do not persist yet
```

## 3. Pairwise comparison relationships

Benefits:

- can represent exact competing pairs;
- compatible with partial ordering later.

Risks:

- current production can populate only comparable and shared/opposed
  structure, not decisive direction;
- a new top-level relationship would introduce unnecessary ownership.

Decision:

```text
do not add a new object; reassess only if an existing relationship can be
narrowly extended after producer evidence
```

## 4. Reuse Seed-era Organizational Judgment

Benefits:

- already ranks and assigns statuses;
- already reaches Executive Assessment.

Risks:

- evaluates Seeds rather than completed Explanations;
- uses raw counts and Seed confidence;
- mixes executive significance with causal adjudication;
- creates two authorities and reverses the ownership migration.

Decision:

```text
reject
```

## 5. Introduce a separate adjudication result object

Benefits:

- isolates evaluation output;
- could preserve history.

Risks:

- creates a second Explanation authority and store;
- complicates identity, migration, and ownership;
- violates extend-before-expand.

Decision:

```text
reject
```

## 6. Defer adjudication until missing decisive semantics exist

Benefits:

- preserves semantic truth;
- avoids fixture overfit and false certainty;
- keeps the production boundary reversible;
- allows the smallest missing producer contract to be investigated directly.

Risks:

- delays production authority migration;
- leaves completed Explanations `unadjudicated`.

Decision:

```text
selected
```

---

# Implementation sequence

No production implementation is authorized now.

The required sequence is:

1. freeze this blocked contract;
2. build a benchmark-only production-available comparison baseline;
3. perform a read-only ownership audit for the missing candidate-relative
   Explanation test result;
4. determine whether an existing Prediction Evaluation, Executive Review,
   Evidence Relationship, Reasoning Relationship, or completed-Explanation
   input can be narrowly extended;
5. stop if no canonical producer can derive the semantic;
6. if a producer exists, design its exact structured contract separately;
7. extend the focused benchmark with that real structured input;
8. prove adversarial generalization, abstention, identity, isolation, and
   downstream noninterference;
9. only then design the optional nested adjudication field;
10. request separate production authorization.

Do not combine the missing-semantic contract, adjudication implementation, and
downstream consumption in one sprint.

---

# Rollback criteria

Because this sprint changes documentation only, production rollback is not
required.

Any later Phase 2 implementation must roll back if:

- fixture labels or prose supply adjudication meaning;
- opposition becomes discrimination or falsification;
- shared Evidence increases support;
- record count determines standing;
- missing `sourceId` implies independence;
- a winner is forced without decisive structure;
- a loser is deleted;
- Explanation identity or semantic keys change;
- historical Runtime requires bulk migration;
- downstream behavior changes before authorization;
- output becomes input-order dependent;
- Governance Integrity or System Sustainability regresses.

The Phase 1 commit remains the production rollback point:

```text
310be01853300d093f7db5d82ca17a8c89242394
```

---

# Phase 2 unblocking criteria

Phase 2 production implementation remains blocked until all of the following
are true:

1. one existing canonical producer owns a structured candidate-relative
   Explanation test result;
2. the result targets exact completed Explanation identity;
3. its basis resolves to canonical Evidence or an evaluated outcome;
4. its semantics distinguish opposition from discrimination, confirmation,
   weakening, and rule-out;
5. no meaning is derived from prose, expected answers, family labels, or
   provider output;
6. Evidence independence is either canonically enforced or the adjudicator
   performs no count- or weight-based comparison;
7. the focused benchmark runs the real proposed producer;
8. adversarial scenarios defeat controlled-fixture overfit;
9. unresolved alternatives and abstention remain first-class;
10. repeated and reversed-order replay are byte stable;
11. organization identity and historical compatibility are preserved;
12. Conditions through applications remain unchanged;
13. the staged production scope is one existing object and one canonical write
    owner.

Until then:

```text
OrganizationalExplanation.viability = "unadjudicated"
```

is the only truthful production state.

The smallest missing canonical semantic contract is the structured,
candidate-relative Explanation test result described above.

**PHASE 2 ADJUDICATION CONTRACT BLOCKED**
