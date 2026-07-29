# Organizational Functions Experiment 001

Status: benchmark-only research; non-canonical  
Baseline: `103d68a5a08f6bfa55a569cc67f5cda8d6f72b48`

## Research conclusion

A small Organizational Function vocabulary adds useful semantic compression
and cross-industry transfer, but this experiment does **not** justify adding a
canonical cognition layer.

The strongest supported placement is a reusable, non-authoritative
interpretation layer. The experiment is synthetic, direction recovery remains
imperfect at 0.947 after final review, several functions overlap existing Signals, Phenomena, and
Conditions, and no production producer, persistence contract, or migration
strategy has been established.

## Existing semantic-layer audit

| Layer | Current semantic responsibility | Function meaning already present |
| --- | --- | --- |
| Evidence | Preserves admitted source statements, provenance, type, polarity, and confidence. | Only in source wording and extracted keywords. |
| Observations | Restates useful evidence-, Signal-, or Theme-grounded facts with Evidence lineage. | Sometimes, but without a stable cross-domain vocabulary. |
| Signals | Detects recurring organizational pressures such as execution capacity, decision flow, coordination, learning, and customer consequences. | Strongly. Several Signal rules already name function-like pressures. |
| Themes | Compresses related Evidence and Signals into topics. Current rules retain historical startup/commercial categories alongside Signal-derived themes. | Partially and inconsistently; Themes are topical rather than universally functional. |
| Contradictions | Preserves incompatible or tension-bearing claims for later reasoning. | No; it describes evidential conflict. |
| Phenomena | Represents observed organizational patterns such as decision latency, approval bottlenecks, coordination breakdown, execution capacity, and learning failure. | Strongly for operating phenomena, but as detected patterns/status rather than neutral function identity. |
| Mechanisms | Represents supported relationships through which upstream organizational behavior produces downstream behavior. | Functions may appear as endpoints, but a function label cannot establish causality. |
| Beliefs | Retains confidence-bearing organizational propositions derived from prior cognition. | Incidentally, through proposition content. |
| Concepts | Compresses recurring meaning into reusable organizational concepts. | Potentially, but Concepts are learned/compressed cognition, not a fixed interpretation vocabulary. |
| Theories | Organizes beliefs and mechanisms into broader explanatory structures. | Only as part of explanations. |
| Organizational Conditions | Assesses the health, status, trend, priority, and executive meaning of domains such as coordination, learning, decision flow, and execution capacity. | Strongly; Conditions are evaluative and authoritative, unlike a neutral function projection. |
| Product Evidence Roles | Product-owned, non-authoritative classification of what admitted Evidence does and which product-relevant signal it carries. | Partially. Roles encode demand, capacity, decision, retention, execution, constraint, source, and direction. |
| Truthful Utility profiles | Require bounded combinations of Evidence Roles or literal fallback patterns before disclosing product utility. | Only for the five current utility domains. |

Meaning is duplicated most clearly for coordination, knowledge flow,
learning/adaptation, decision authorization, and productive capacity. Signals
name pressures, Phenomena name detected patterns, Conditions assess health,
and product roles repeat a subset for disclosure. The distinction that remains
available to Organizational Functions is narrower: *what stable kind of
organizational work is implicated*, without asserting a pressure, cause, or
condition.

The Evidence-to-Mechanism handoff loses meaning when domain wording varies
before stable upstream and downstream endpoints can be compared. Signals and
Phenomena solve part of this problem, but their vocabularies mix pressure,
status, and event semantics. They do not provide a complete neutral function
taxonomy. Conversely, a function layer would be redundant wherever those
layers already encode the same distinction.

If promoted, Functions should be consumed only by non-authoritative product
communication, evidence acquisition, and shadow research consumers.
Mechanisms could use them only as lineage-bearing candidate endpoints; a label
must never create a causal edge. Conditions, Beliefs, Theories, and
authoritative assessments must not consume a product-derived projection,
because doing so would create authority leakage and circularity.

## Experimental vocabulary

The experiment uses 14 universal, department-independent functions:

1. demand generation
2. value conversion
3. value exchange
4. customer retention
5. capacity acquisition
6. productive capacity
7. decision formation
8. decision authorization
9. coordination
10. execution throughput
11. quality control
12. knowledge flow
13. learning and adaptation
14. resource allocation

Definitions, included and excluded Evidence, canonical-layer relationships,
ambiguity risks, positive examples, and negative controls are executable in
`vocabulary.ts`. Assignments contain Evidence and Observation lineage and
abstain on rejected, cross-organization, negated, hypothetical, quoted,
question-form, irrelevant, or ambiguous input. No new confidence value is
created.

## Architectures

### A — current baseline

Current literal Product Translation grammar is projected for comparison. It
has no Organizational Function layer. The existing Truthful Utility benchmark
remains the authoritative baseline at 12/15 independent paraphrases.

### B — product-owned projection

Frozen benchmark representations of Product Evidence Roles project to
Functions in the benchmark only; the experiment neither imports nor executes
the product classifier. This
recovers the three known utility misses, but covers only current product-role
domains and produces one over-assignment in the function corpus.

### C — shadow canonical-function handoff

Admitted Evidence and its Observations project directly to Functions using
fixed benchmark rules. Shadow mechanism and evidence-acquisition consumers run
in parallel. Canonical cognition is neither invoked differently nor mutated.

## Dataset

The preregistered corpus contains 27 scenarios across software,
manufacturing, professional services, healthcare operations, nonprofit,
government, agriculture, and retail:

- 5 exact-grammar positives;
- 6 independently worded paraphrases;
- 8 cross-industry transfers;
- 4 negative/rejected controls;
- 1 negation;
- 1 hypothesis;
- 1 quotation/question;
- 1 ambiguity control.

Each positive registers expected and prohibited Functions, direction,
abstention, an optional downstream relationship, and an optional
highest-value Evidence gap. Expected labels are used only by the scorer, never
by the assignment adapter.

## Results

| Metric | A | B | C |
| --- | ---: | ---: | ---: |
| Exact function recovery | 4/5 | 5/5 | 5/5 |
| Independent paraphrase recovery | 0/6 | 3/6 | 6/6 |
| Cross-industry transfer | 2/8 | 0/8 | 8/8 |
| Function precision | 1.000 | 0.909 | 1.000 |
| Function recall | 0.364 | 0.455 | 1.000 |
| Direction precision | 0.857 | 1.000 | 0.947 |
| Negative controls | 1.000 | 1.000 | 1.000 |
| Negation precision | 1.000 | 1.000 | 1.000 |
| Hypothesis precision | 1.000 | 1.000 | 1.000 |
| Quotation precision | 1.000 | 1.000 | 1.000 |
| Ambiguity abstention | 1.000 | 1.000 | 1.000 |
| Mechanism candidate recovery | 1/3 | 2/3 | 3/3 |
| Highest-value Evidence gap recovery | 6/9 | 8/9 | 9/9 |
| Organization isolation | pass | pass | pass |
| Ordering determinism | pass | pass | pass |

The exact-function metric differs from the existing 5/5 Truthful Utility
exact-recovery metric: it requires every preregistered Function in a scenario,
while Truthful Utility requires only its current disclosure grammar.

The three known misses—opportunity duration, hiring workload pressure, and
retention cancellations—are all recovered by B and C. Applied to the verified
12/15 utility baseline, that is a benchmark-only projected recovery of 15/15.
No production Truthful Utility consumer was changed, so this is not a
production performance claim.

Architecture C compresses varied terms into stable endpoints without merging
organizations or admitting negative controls. It also selects more specific
Evidence-gap templates, grounded to the Function assignment's admitted
Evidence lineage. These fixed templates are not claims that a recommendation
is globally optimal. Mechanism recovery improves only when two assigned endpoints
and explicit relationship wording coexist; the Function label alone never
creates a Mechanism.

The pre-review run reported Architecture C direction precision of **0.789**.
Final review found a concrete rule-precedence defect: generic increase terms
were evaluated before explicit friction phrases such as “more weeks” and
“outpaced.” Correcting that benchmark-only defect raised the valid result to
**0.947**. Direction remains the principal weakness. A neutral Function identity is
easier to recover than whether its health, flow, or volume is increasing,
decreasing, or constrained. Direction should remain grounded in existing
canonical polarity/trend artifacts rather than expanded lexical inference.

## Redundancy and collapse

| Function | Classification | Rationale |
| --- | --- | --- |
| Demand generation | A — novel reusable abstraction | Not consistently represented by current operating Signals or Phenomena. |
| Value conversion | A | Stable commercial/noncommercial commitment conversion is not a canonical primitive. |
| Value exchange | A | Separates pricing/exchange work from cost and demand semantics. |
| Customer retention | B — useful projection | Existing Themes and product roles overlap, but the cross-sector identity is reusable. |
| Capacity acquisition | A | Distinct from the execution-capacity Condition. |
| Productive capacity | B | Strong overlap with execution-capacity Signals and Conditions. |
| Decision formation | A | Separates option formation from authorization and decision latency. |
| Decision authorization | B | Useful distinction, with substantial approval-bottleneck overlap. |
| Coordination | C — duplicate | Already explicit in Signals, Phenomena, and Conditions. |
| Execution throughput | B | Reusable endpoint, but overlaps execution Signals and Conditions. |
| Quality control | A | Not represented as a stable current canonical domain. |
| Knowledge flow | C | Closely duplicates knowledge-continuity Signals and Conditions. |
| Learning/adaptation | C | Closely duplicates learning Phenomena and Conditions. |
| Resource allocation | A | Stable cross-domain work not consistently encoded in current layers. |

The vocabulary therefore contains 7 A, 4 B, 3 C, 0 D, and 0 E
classifications. It is not mostly redundant, unstable, or domain-specific, but
the duplicated members argue against promoting the vocabulary as one intact
canonical layer.

## Placement analysis

| Option | Assessment |
| --- | --- |
| 1. Product-owned | Safe and low-cost, with clean authority boundaries. Reuse by evidence acquisition or research would duplicate the projection. |
| 2. Reusable interpretation layer | Best current fit. Preserves lineage and deterministic abstention while allowing product communication, evidence acquisition, and research reuse without cognitive authority. No persistence is required initially. |
| 3. Canonical cognition primitive | Not justified. It introduces producer, authority, migration, persistence, and circularity questions; direction is incomplete; several functions duplicate canonical layers. |
| 4. No new layer | Safer than Option 3, but improving Signals alone would continue mixing pressure/status semantics with neutral function identity and would not explain the cross-industry gains observed here. |

## Promotion gates

| Gate | Result |
| --- | --- |
| Substantial semantic generalization | Pass in this synthetic corpus |
| No meaningful precision regression | Pass for C |
| Value in two independent consumers | Provisionally pass: mechanism candidates and Evidence acquisition |
| Low overlap with existing layers | Fail |
| Stable small vocabulary | Provisional; one experiment only |
| Complete lineage | Pass |
| Deterministic assignment | Pass |
| Organization isolation | Pass |
| No circular dependency | Pass in benchmark placement |
| Clear canonical owner and producer | Fail |
| Migration and persistence strategy | Fail |
| Simpler alternatives insufficient | Not established |

Recommendation: do not create a canonical primitive. Retain the current
product-owned Evidence Roles. If independent real-world benchmarks reproduce
the result, extract only the non-duplicative Functions into a reusable,
non-authoritative interpretation layer and keep Signals, Phenomena,
Mechanisms, Conditions, and Runtime unchanged.

## Reproduction

```bash
npm run experiment:organizational-functions
```

The command executes only deterministic local fixtures. It performs no
network, Runtime, persistence, environment, Atlas, or product mutation.
