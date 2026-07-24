# Theme Composition Policy Experiment

## Repository state and safety

This benchmark-only experiment began on branch
`sprint-79-organization-experience` at
`5bee35a827a51b5aadf9d33b83d5ba89457396f9`. Nothing was staged. The
pre-existing dirty tree included Sprint 110 conversation work, generated
architecture and capability artifacts, documentation, Executive Decision Lab
isolation, three untracked Runtime files, provider output, and `Does`.

The canonical tracked Atlas and Northstar fixtures had no diff. Executive
Decision Lab isolation and the prior
`traceConcurrencyStaffingSemantics.ts` investigation remained available. This
experiment did not edit those files, Sprint 110, production cognition,
Runtime, scoring, expectations, architecture, or product behavior.

Relevant production behavior is distributed across:

- `signals.ts`: candidate construction, confidence ordering, title
  deduplication, and the 12-Signal limit;
- `themes.ts`: `buildSignalThemes()`, first-five eligibility, theme scoring,
  theme deduplication, and the eight-theme limit;
- `causal.ts`: first-five Theme eligibility for causal chains;
- `explanations.ts`: explanation construction from causal chains.

## Current behavior and Signal ordering

The canonical isolated 48-artifact replay produces nine selected Signals:

| Rank | ID | Signal | Confidence | Unique evidence |
| ---: | --- | --- | ---: | ---: |
| 1 | S1 | Review signal is recurring | 0.83 | 5 |
| 2 | S2 | Document signal is recurring | 0.82 | 8 |
| 3 | S3 | Independent signal is recurring | 0.82 | 7 |
| 4 | S4 | Execution capacity is under pressure | 0.69 | 3 |
| 5 | S5 | Decision authority is constraining execution | 0.64 | 2 |
| 6 | S6 | Staffing may not be the primary root cause | 0.62 | 1 |
| 7 | S7 | Concurrent work is reducing effective capacity | 0.61 | 1 |
| 8 | S8 | Decision flow is constrained | 0.61 | 2 |
| 9 | S9 | Reducing active work may improve throughput | 0.58 | 1 |

`detectSignals()` sorts descending by confidence. Confidence is therefore the
primary reason S1–S5 precede S6, S7, and S9. Where confidence ties, stable
producer order remains; IDs are assigned only after sorting. Evidence count
affects confidence upstream, but there is no semantic category or scope
ranking. Artifact order did not affect the canonical result under the prior
trace controls.

Production `buildSignalThemes()` consumes `signals.slice(0, 5)`. In the
benchmark-local control this retains only a general concurrency/capacity
meaning. The staffing counterfactual and reduce-work consequence are excluded.

## Policies compared

All selection functions are pure, deterministic, benchmark-local, and use only
canonical Signal structure before evaluation:

- **A — current control:** incoming first five.
- **B — all selected:** every canonical Signal, deterministically ordered by
  confidence, unique evidence support, title, and ID.
- **C — support-ranked bounded:** at most five by confidence plus a bounded
  unique-evidence support bonus.
- **D — polarity-coverage bounded:** at most five, first covering distinct
  available polarities, then filling by support rank. This is the only
  defensible structured approximation of role coverage because Signals do not
  carry explicit causal-role fields.
- **E — diversity-aware bounded:** at most five using support rank minus
  deterministic title-and-description token overlap.

A richer “constraint / mechanism / counterfactual / consequence /
intervention” policy was deliberately omitted. Those roles are not canonical
Signal fields; assigning them would require subjective lexical rules and could
encode Ground Truth indirectly.

Ground Truth vocabulary was applied only after every policy completed.

## Dimension-level comparison

| Dimension | A | B | C | D | E |
| --- | ---: | ---: | ---: | ---: | ---: |
| Signal/Themes retained | concurrency | all 3 targets | concurrency | reduce-work only | concurrency |
| Causal/explanation retention | concurrency | concurrency only | concurrency | reduce-work only | concurrency |
| Staffing counterfactual reaches explanation | no | no | no | no | no |
| Concurrency causal meaning reaches explanation | yes | yes | yes | no | yes |
| Reduce-work consequence reaches explanation | no | no | no | yes | no |
| Theme count | 5 | 9 | 5 | 5 | 5 |
| Causal-chain count | 5 | 5 | 5 | 5 | 5 |
| Evidence coverage | 94.12% | 100% | 94.12% | 94.12% | 94.12% |
| Lineage completeness | 100% | 100% | 100% | 100% | 100% |
| Unsupported-theme rate | 0% | 0% | 0% | 0% | 0% |
| Mean pairwise redundancy | 0.318 | 0.190 | 0.318 | 0.321 | 0.318 |
| Mean Theme confidence | 0.760 | 0.691 | 0.760 | 0.748 | 0.760 |
| Incoming-order independent | no | yes | yes | yes | yes |

Theme quality and evidence precision remain high because each benchmark-local
Theme is a direct projection of one selected Signal with its original evidence
lineage. No policy synthesizes novelty. Policy B lowers average confidence by
admitting all lower-confidence Signals and more than doubles the bounded
candidate surface relative to five.

Confidence calibration, organizational mechanism quality, condition ranking,
and final recommendations were not recomputed from experimental objects. The
experiment is an eligibility adapter, not an alternate cognition pipeline.
Canonical validators establish that those production outputs remain
unchanged. Treating unchanged production output as experimental improvement
would be misleading.

## Northstar findings

Policy B proves that all selected Signals can become benchmark-local Themes
with complete lineage, zero unsupported themes, full evidence coverage, and
lower semantic redundancy. It does **not** prove improved causal composition:
the canonical `buildCausalChains()` independently consumes only its first five
Themes. Because the generic high-confidence Themes still occupy those
positions, S6 and S9 do not reach explanations.

Policy D moves the positive reduce-work Signal into causal composition, but
displaces the concurrency cause and still omits the staffing counterfactual.
Under added positive contradiction pressure, the competing staffing claim
also displaces the reduce-work Signal. It is therefore not robust enough.

Policies C and E deterministically reorder the candidates but reproduce the
control’s substantive result. Support and lexical diversity alone do not
distinguish generic recurring-document Signals from higher-value causal
assertions.

The experiment therefore does not identify a superior bounded
Signal-to-Theme eligibility policy.

## Cross-benchmark findings

The pure policies were also applied to committed, isolated Signal and Evidence
states for:

- Atlas simulation / Executive Decision fixture: seven Signals;
- Operating Model knowledge-continuity fixture: five Signals;
- the Northstar first-five-sufficient control;
- Northstar’s noisy nine-Signal canonical state;
- contradiction pressure.

Across Atlas and the Decision fixture, every policy retained 100% evidence
coverage and created no unsupported Themes. Policy B expanded the set from
five to seven; bounded policies selected five. In the five-Signal
knowledge-continuity fixture all policies preserved the complete candidate
set, differing only in deterministic order. Thus the alternatives provide no
measured benefit where five Signals are already sufficient.

The canonical Atlas, Executive Decision, Operating Model Evolution, production
replay, and Executive Simulation validators were run separately without
injecting experimental objects. Their results remained unchanged. This
distinguishes policy comparison from production regression evidence.

## Robustness and determinism

- Complete experiment output was byte-identical across repeated runs.
- Policies B–E selected identical sets after reversing incoming Signal order.
- Policy A changed substantively under reversed Signal order; production
  normally masks this because `detectSignals()` supplies confidence-sorted
  input.
- Low-confidence irrelevant noise did not displace bounded selections.
- Duplicated evidence IDs did not change selections.
- Removing an evidence object exposed broken lineage for any Theme that still
  referenced it; no policy invented replacement lineage.
- Policy D was sensitive to contradiction polarity: a competing positive
  staffing claim displaced its positive reduce-work Signal.
- Policy B admitted contradiction and noise candidates by design, although
  unsupported-theme rate remained zero.

Contradictions were not reinterpreted or suppressed. The experimental policies
only selected existing Signals.

## Complexity and cost

For nine Signals:

- A and B require ordering/projection work only.
- C and D add deterministic sorting and a linear coverage pass.
- E permits up to 36 pairwise semantic comparisons and introduces tokenization
  and a weighting coefficient.

All are computationally small at current scale. The material cost is cognitive
surface area and policy complexity, not runtime latency. B increases Theme
count from five to nine without increasing the five-chain downstream capacity.
E adds the most policy complexity while producing no semantic improvement.

## Recommendation

**B — CONTINUE BENCHMARK RESEARCH**

No bounded policy preserves all three target meanings through explanation.
The only policy that retains all three as Themes is stopped by the separate
five-Theme causal-chain boundary. A production change to
`buildSignalThemes()` alone would therefore increase Theme volume without
delivering the intended final understanding.

## Exactly one next action

Run one benchmark-only joint composition experiment across the existing
`buildSignalThemes()` and `buildCausalChains()` eligibility boundaries. The
experiment should test a single shared, structured causal-role representation
derived from existing Signal metadata and evidence lineage, and must reject
the approach unless staffing counterfactual, concurrency cause, and reduce-work
consequence all reach explanation while Atlas, Decision, evolution, noise,
contradiction, calibration, and determinism gates remain stable.

Do not change production before that joint-boundary evidence exists.

## Remaining uncertainty

The experiment proves that widening Theme eligibility alone is insufficient.
It does not establish whether the missing analytical-role structure should be
derived at composition time, already exists elsewhere in evidence lineage, or
would require a change outside the authorized scope. It also does not establish
that retaining all three target meanings will improve final Ground Truth until
the complete downstream path is evaluated.
