# Sprint 121 — Structured Explanation Candidate Shadow

## Status

Complete as a benchmark-only, shadow-only, in-memory experiment.

The candidate-construction gate failed. Sprint 119 adjudication was therefore not run and was not tuned.

## Existing Explanation architecture audit

### Current type

`OrganizationalExplanation` is defined in:

```text
engine/v3/model/judgment/organizationalJudgment.ts
```

It records an index-based ID, title, summary, explanation type, reasoning-path IDs, effect IDs, root-cause IDs, leverage-point IDs, executive-conclusion IDs, assumptions, knowledge references, and confidence.

### Current producer

```text
engine/v3/model/judgment/synthesizeExplanations.ts
```

`synthesizeExplanations()` groups organizational reasoning paths by reasoning type, source node, and target node.

Current identity is execution-order dependent:

```text
organizational-explanation-${index + 1}
```

### Current consumers

Direct consumers include:

- `evaluateExplanations()`;
- `detectJudgmentContradictions()`;
- Mechanism inference;
- organizational Belief inference;
- the unused judgment-oriented `formOrganizationalTheories()` boundary;
- Runtime diagnostic output.

### Current call graph

The active Runtime path is:

```text
Organization reasoning graph
→ reasoning relationships
→ reasoning paths
→ synthesizeExplanations()
→ evaluateExplanations()
→ detectJudgmentContradictions()
→ Mechanism inference
→ Belief inference
→ persisted Theory consolidation
→ Condition inference
```

Explanation generation therefore happens before active Mechanism, Belief, persisted Theory, and Condition formation.

### Available structured relationships

- Explanation → reasoning-path IDs
- Explanation → effect IDs
- Explanation → root-cause IDs
- Explanation → knowledge references
- Mechanism → supporting Explanation IDs
- Mechanism → supporting reasoning-path IDs
- Mechanism → supporting Evidence IDs
- Belief → supporting Mechanism and Evidence IDs
- persisted Theory → supporting Mechanism, Belief, Concept, and Evidence IDs
- Condition → supporting Mechanism, Belief, Theory, and Concept IDs

### Missing or incomplete relationships

- persisted Theory → Explanation ID
- persisted Theory → reasoning-path ID
- Explanation → active Mechanism ID
- Explanation → persisted Theory ID
- Explanation → normalized organizational scope
- Explanation → temporal applicability
- Explanation → typed opposition or discriminating Evidence
- KnowledgeReference → direct Evidence node type
- stable Explanation semantic identity

### Duplicate Theory representations

Two Theory contracts exist:

1. `engine/v3/model/judgment/organizationalTheory.ts`, which embeds supporting Explanations and reasoning paths but is not called by the active Runtime path.
2. `engine/v3/model/memory/organizationalTheories.ts`, which is used by Runtime persistence but does not retain Explanation or reasoning-path IDs.

This split prevents a complete active Explanation→Mechanism→Theory ancestry chain.

## Shadow contract

The benchmark-local `ShadowOrganizationalExplanation` contains:

- organization ID and deterministic semantic key;
- scoped subject IDs;
- root Mechanism IDs;
- explicit outcome IDs;
- Theory, Belief, and reasoning-path IDs;
- typed Evidence links;
- contradiction IDs;
- assumptions and temporal applicability;
- viability, support profile, and uncertainty;
- benchmark-local lineage fields.

Nothing is persisted and no canonical schema is modified.

## Candidate-construction rules

The shadow accepts a candidate only when all of these structured joins exist:

```text
production Explanation
→ explicit reasoning path
→ explicit outcome
→ Mechanism supporting that Explanation and path
→ persisted Theory supporting that Mechanism
→ Evidence ancestry
→ compatible organization scope
```

Candidate construction rejects:

- lexical mention;
- Condition or Executive Assessment prose;
- arbitrary Mechanism–Theory combinations;
- fixture labels;
- recommendation text;
- provider inference;
- incomplete ancestry.

## Compatibility rules

- **Explanation–Mechanism:** the Mechanism must reference both the Explanation ID and one of its reasoning-path IDs.
- **Mechanism–Theory:** the persisted Theory must explicitly reference the Mechanism ID.
- **Path–outcome:** the Explanation must contain both a reasoning-path ID and explained-effect ID.
- **Scope:** explicit Mechanism scope must equal the normalized benchmark scope or its level.
- **Temporal:** no temporal compatibility is asserted because the active structured objects do not expose a shared temporal contract.
- **Contradiction:** no comparative role is assigned without a structured target.
- **Evidence:** accepted Evidence must descend from the Explanation, Mechanism, or compatible Theory ancestry.

## Stable identity

The benchmark-local semantic key uses only:

```text
organization ID
+ normalized organizational scope
+ sorted root Mechanism IDs
+ sorted outcome IDs
+ causal relation family
```

The ID is a deterministic SHA-256 prefix of that key. Confidence, Evidence count, viability, leader state, recommendation, record order, and execution time are excluded.

No candidates survived the construction gate, so identity and lineage behavior could not be substantively evaluated. The identity implementation itself remained deterministic across replay and order reversal.

## Evidence-link model

The benchmark defines typed Explanation Evidence links with:

- Explanation ID;
- Evidence ID;
- role;
- comparative targets;
- classification confidence;
- reasoning-path rationale;
- structured, fallback, or unclassified basis.

Because no candidate completed ancestry, no Evidence roles were accepted:

```text
structured: 0
bounded lexical fallback: 0
unclassified: 0
```

Evidence-role precision and recall were not scored. No lexical fallback was added to rescue the gate.

## Ephemeral Explanation Set

The benchmark contains the Sprint 119-compatible comparative state contract, but it was not constructed because S1 failed.

S2 was deliberately stopped before:

- leader selection;
- viability comparison;
- confidence movement;
- revision scoring;
- recommendation-family evaluation.

## Benchmark design

The suite contains 25 scored scenario families and one reversed-order control, covering:

- canonical Atlas decisive evidence;
- credible opposition;
- delayed evidence;
- duplicate Evidence;
- Northstar operational constraints;
- knowledge fragmentation;
- capacity versus concurrency;
- strategy versus Decision Flow;
- leadership versus coordination;
- ownership ambiguity;
- multiple causes;
- feedback loops;
- shared and discriminating Evidence;
- counterfactuals;
- weak opposition;
- irrelevant and sparse Evidence;
- no-defensible-candidate cases;
- team, department, and enterprise scopes;
- terminology and paraphrase variants;
- repeated and reversed-order replay.

Five families use T0→T1→T2 sequential revisions.

Canonical fixtures are consumed through isolated in-memory copies and are not modified.

## S0 / S1 / S2 results

There are 35 scored states.

### S0 — Current production Explanation behavior

Production generated only 13 `OrganizationalExplanation` objects across the 35 states.

Most sparse and production-shaped investigations produced no current Explanation object at all.

### S1 — Structured candidates

| Measure | Result |
|---|---:|
| Accepted candidates | 0 |
| Candidate precision | 1.000, vacuous because none were accepted |
| Candidate recall | 0.000 |
| Exact candidate sets | 1/35 |
| Unsupported candidates | 0 |
| Missing candidates | 44 |
| Complete ancestry | 0/0 |
| Structured Evidence roles | 0 |
| Lexical fallbacks | 0 |

The only exact set was the no-defensible-candidate control.

### S2 — Adjudication

Not run.

Candidate recall was below the mandatory 90% gate. Sprint 119 precedence and ranking remained unchanged.

## Exact missing structured relationships

The primary failure is:

> The active Runtime does not expose a complete structured bridge from a production Explanation and reasoning path through an active Mechanism into the persisted Theory representation.

Observed components of that gap:

1. Production Explanation is frequently absent for sparse production inputs.
2. Existing Explanation generation occurs before Mechanism and Theory formation.
3. Active persisted Theory retains Mechanism IDs but not Explanation or reasoning-path IDs.
4. The richer judgment Theory contract retains Explanations and paths but is not called by Runtime.
5. Explanation has no normalized scope contract.
6. KnowledgeReference cannot directly identify Evidence nodes.
7. Typed opposition, discrimination, counterfactual, and contradiction targets are absent.

The benchmark also observed:

- missing production Explanation objects in most states;
- missing explicit explained-effect IDs in one state that produced an Explanation;
- incompatible or unnormalized Mechanism scope in six states.

## Ancestry completeness

No accepted candidate had to be rejected after acceptance; rather, all possible candidates failed before the complete ancestry boundary.

The desired trace:

```text
Evidence
→ reasoning path
→ Mechanism
→ Belief or Theory
→ Explanation
```

cannot currently be completed deterministically through active production objects.

## Identity and lineage

The shadow contract supports:

- prior version;
- supersession;
- merge sources;
- split source;
- reactivation.

No substantive lineage assertions were scored because no candidate passed the gate. Replay and order reversal were deterministic.

## Cross-benchmark results

Atlas, Northstar-style Ground Truth, knowledge-fragmentation, decisive-evidence, credible-opposition, and causal-constraint families all reached the same construction boundary.

The shadow did not demonstrate candidate improvement in two canonical families because it produced no accepted candidates. Existing benchmark expectations and production outputs remained unchanged.

## Determinism and safety

- repeated production replay: pass;
- Evidence-order invariance: pass;
- shadow construction replay: pass;
- stable organization identity: pass;
- Runtime persistence: none;
- fixture mutation: none;
- production output mutation: none;
- schema or capability-registry changes: none.

## Classification

**C — Existing structured cognition is insufficient**

Precision is not meaningfully estimable because the constructor accepted nothing. Recall is 0.000, so the hard gate failed and adjudication was not run.

## Recommendation

Do not authorize production integration, adjudication tuning, lexical expansion, or fixture-specific exceptions.

Authorize a targeted architecture decision about the split Theory boundary and missing Explanation lineage:

1. Decide which Theory representation is canonical.
2. Decide whether active persisted Theory must retain Explanation and reasoning-path IDs.
3. Decide whether Explanation is an early reasoning-path artifact or the completed post-Theory cognitive object.
4. Define normalized organizational scope and direct Evidence ancestry.

The minimum next step is an architecture-only contract reconciliation, not another benchmark policy experiment.
