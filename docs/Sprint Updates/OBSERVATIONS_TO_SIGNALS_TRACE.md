# Observations to Signals Semantic Trace

## Purpose and repository safety

This benchmark-only investigation asks whether the concurrency and staffing
meaning required by the isolated Northstar Ground Truth replay is lost at the
provisional Organizational Observations → Organizational Signals boundary. It
does not change cognition, scoring, Ground Truth expectations, Runtime,
architecture, or product behavior.

The investigation began on branch
`sprint-79-organization-experience` at
`5bee35a827a51b5aadf9d33b83d5ba89457396f9`. Nothing was staged. The working
tree already contained unrelated Sprint 110 conversation work, generated
architecture and capability artifacts, documentation, three untracked Runtime
files, provider output, `Does`, and the benchmark-isolation work in
`engine/benchmark/executive-decision-lab`. Those files are outside this
investigation and were not edited. The canonical Atlas and Northstar tracked
Runtime fixtures had no diff before the trace.

The relevant production path is:

```text
ingested evidence
→ detectSignals
→ detectThemes
→ buildObservations
→ detectContradictions
→ inferMechanisms
→ buildCausalChains
→ generateExplanations
→ buildUnderstanding
→ evolveOrganizationRuntime
→ phenomena → organizational mechanisms → beliefs → theories
→ conditions → state → assessment → organizational understanding
→ recommendation
```

This order rejects an assumption behind the provisional diagnosis: in the
canonical investigation pipeline, Signals are produced before the legacy
Observations. Organizational observations accumulated by Runtime evolution are
a distinct later collection. The traced producers are `signals.ts`,
`themes.ts`, `observations.ts`, `contradictions.ts`,
`engine/v3/mechanism.ts`, and the
judgment producers invoked by `evolveOrganizationRuntime.ts`. The canonical
replay is constructed by
`engine/benchmark/high-volume/northstar/runCanonicalNorthstarGroundTruthReplay.ts`
and scored by
`engine/benchmark/high-volume/northstar/scoreNorthstarGroundTruth.ts` against
the isolated 48-artifact fixture.

## Target semantics

The fixture supports five related, but non-interchangeable, meanings:

| Concept | Fixture-supported meaning | Required executive consequence |
| --- | --- | --- |
| concurrent work | 27 initiatives and 143 major projects are active simultaneously; interruptions and concurrency reduce throughput | reduce simultaneous work |
| priority dilution | work is repeatedly reprioritized without explicit deprioritization | sequence and protect priority work |
| capacity pressure | nominal capacity is fragmented by concurrency, overrides, overlap, and unstable priorities | treat capacity as an operating-model issue |
| staffing sufficient | unchanged staffing produced higher throughput when focus improved | do not assume added headcount is required |
| staffing is not the root cause | independent review explicitly rejects staffing as the primary constraint | test sequencing and governance before hiring |

Supported structured equivalents include work in progress, simultaneous work,
fragmented capacity, interruption, sequencing, reprioritization, unchanged
staffing, headcount-neutral improvement, adequate nominal capacity, and
staffing not primary. The trace does not introduce unsupported synonyms.

### Source evidence

- `ns-artifact-021`: production schedule attainment and emergency
  reprioritization.
- `ns-artifact-022`: 27 initiatives and 143 projects active simultaneously.
- `ns-artifact-023`: 39 priority changes without explicit deprioritization.
- `ns-artifact-027`: adequate nominal capacity fragmented by concurrency,
  overlap, overrides, and unstable priorities.
- `ns-artifact-028`: interruption and unplanned work.
- `ns-artifact-041`: current staffing can be sufficient if concurrency falls.
- `ns-artifact-042`: a focus pilot improved throughput 31% with unchanged
  staffing and no headcount increase.
- `ns-artifact-044`: reducing active projects improved throughput and milestone
  attainment.
- `ns-artifact-048`: independent assessment says staffing is not the primary
  constraint and recommends reducing active work.
- `ns-artifact-009`: hiring-freeze/headcount-neutral constraint.

`ns-artifact-029` is the direct contradiction: it requests 34 hires and
attributes slippage to insufficient staffing. `ns-artifact-024` is a
contradictory optimistic PMO narrative. `ns-artifact-002` is stale annual-plan
evidence. `ns-artifact-030` and `ns-artifact-031` are plausible but irrelevant
product-quality evidence used by the noise control.

## Canonical trace

The 48-artifact replay remained 75/100. The target meaning was present in
Evidence and was converted into six selected Signals:

- `S4`, 0.69: “Execution capacity is under pressure.”
- `S5`, 0.64: “Decision authority is constraining execution.”
- `S6`, 0.62: “Staffing may not be the primary root cause.”
- `S7`, 0.61: “Concurrent work is reducing effective capacity.”
- `S8`, 0.61: “Decision flow is constrained.”
- `S9`, 0.58: “Reducing active work may improve throughput.”

The Signals preserve both the causal driver and the rejected staffing
alternative. The provisional Observations → Signals loss therefore did not
occur.

The exact explicit staffing-negation first loses downstream eligibility in
`buildSignalThemes()`: `signals.slice(0, 5)` admits `S4` and `S5`, while `S6`
and the more specific concurrency/action signals are outside the five-signal
theme input after higher-confidence generic recurring and evidence-owner
themes enter the final eight-theme ranking. The current legacy observations
still preserve all five concepts because `buildObservations()` consumes the
full selected Signal set directly. This is why the meaning can coexist in an
Observation while being unavailable to the theme → causal-chain → explanation
branch.

The surviving explanation, `EX5` (0.72), says execution capacity is under
pressure and cites adequate nominal capacity. The canonical understanding
retains only a general capacity abstraction. The durable organizational branch
later recovers concurrency and capacity from evidence ancestry, but it does
not recover the explicit “staffing is not the primary root cause” claim or the
reduce/sequencing action. The Executive Recommendation contains neither target
meaning.

## Semantic-retention matrix

| Stage | concurrent work | priority dilution | capacity pressure | staffing sufficient | staffing not root cause |
| --- | --- | --- | --- | --- | --- |
| Evidence | EXPLICITLY RETAINED | EXPLICITLY RETAINED | EXPLICITLY RETAINED | EXPLICITLY RETAINED | EXPLICITLY RETAINED |
| Entities | NOT EXPECTED AT THIS STAGE | NOT EXPECTED AT THIS STAGE | STRUCTURALLY RETAINED | NOT EXPECTED AT THIS STAGE | NOT EXPECTED AT THIS STAGE |
| Signals | EXPLICITLY RETAINED | EXPLICITLY RETAINED | EXPLICITLY RETAINED | STRUCTURALLY RETAINED | EXPLICITLY RETAINED |
| Themes | STRUCTURALLY RETAINED | GENERATED BUT NOT SELECTED | EXPLICITLY RETAINED | RETAINED UNDER A VALID ABSTRACTION | GENERATED BUT NOT SELECTED |
| Current legacy observations | EXPLICITLY RETAINED | EXPLICITLY RETAINED | EXPLICITLY RETAINED | EXPLICITLY RETAINED | EXPLICITLY RETAINED |
| Longitudinal observations | EXPLICITLY RETAINED | EXPLICITLY RETAINED | EXPLICITLY RETAINED | EXPLICITLY RETAINED | EXPLICITLY RETAINED |
| Contradictions | NOT EXPECTED AT THIS STAGE | NOT EXPECTED AT THIS STAGE | NOT EXPECTED AT THIS STAGE | NOT EXPECTED AT THIS STAGE | NOT EXPECTED AT THIS STAGE |
| Phenomena | WEAKENED | DROPPED BY FILTERING | RETAINED UNDER A VALID ABSTRACTION | WEAKENED | DROPPED BY FILTERING |
| Legacy mechanisms | DROPPED BY FILTERING | DROPPED BY FILTERING | WEAKENED | DROPPED BY FILTERING | DROPPED BY FILTERING |
| Causal chains / explanations | WEAKENED | GENERATED BUT NOT SELECTED | EXPLICITLY RETAINED | RETAINED UNDER A VALID ABSTRACTION | GENERATED BUT NOT SELECTED |
| Canonical understanding | DROPPED BY FILTERING | DROPPED BY FILTERING | RETAINED UNDER A VALID ABSTRACTION | WEAKENED | DROPPED BY FILTERING |
| Organizational mechanisms | WEAKENED | WEAKENED | MERGED WITH ANOTHER CONCEPT | DROPPED BY FILTERING | DROPPED BY FILTERING |
| Durable beliefs | RETAINED UNDER A VALID ABSTRACTION | WEAKENED | RETAINED UNDER A VALID ABSTRACTION | WEAKENED | DROPPED BY FILTERING |
| Theories / conditions | RETAINED UNDER A VALID ABSTRACTION | WEAKENED | RETAINED UNDER A VALID ABSTRACTION | DROPPED BY FILTERING | DROPPED BY FILTERING |
| Organizational state | WEAKENED | DROPPED BY FILTERING | RETAINED UNDER A VALID ABSTRACTION | DROPPED BY FILTERING | DROPPED BY FILTERING |
| Executive assessment | RETAINED UNDER A VALID ABSTRACTION | WEAKENED | RETAINED UNDER A VALID ABSTRACTION | DROPPED BY FILTERING | DROPPED BY FILTERING |
| Organizational understanding | RETAINED UNDER A VALID ABSTRACTION | WEAKENED | RETAINED UNDER A VALID ABSTRACTION | DROPPED BY FILTERING | DROPPED BY FILTERING |
| Executive recommendation | DROPPED BY FILTERING | DROPPED BY FILTERING | WEAKENED | DROPPED BY FILTERING | DROPPED BY FILTERING |

“Execution capacity pressure” is a valid abstraction for constrained effective
capacity, but not for the causal counterfactual that staffing is adequate and
is not the primary root cause. That counterfactual is substantively lost.

## Controlled inputs

All controls used the canonical producers, fixed time, deterministic entropy,
in-memory Runtime evolution, and no persisted Runtime.

| Control | Observation / Signal | Contradiction | Phenomenon | Mechanism / Condition / final judgment |
| --- | --- | --- | --- | --- |
| B concurrency only | concurrency, priority, capacity retained | none | capacity retained | capacity reaches conditions and assessment; specific reduce-work action absent |
| C staffing/capacity only | capacity and staffing semantics retained | none | capacity retained | capacity reaches conditions and assessment; staffing negation absent |
| D combined support | all target meanings retained | none | capacity retained | capacity reaches conditions and assessment; staffing negation absent |
| E combined + `029` | all targets retained; positive staffing assertion remains in evidence/observations | contradiction generated | capacity retained | selected negative staffing Signal remains stable; final negation absent |
| F combined + irrelevant `030`/`031` | target retention unchanged | unchanged | target retention unchanged | mechanism count grows, but target outcome is unchanged |
| G reversed relevant artifacts | identical target presence | identical | identical | identical |
| H reversed supporting evidence | identical target presence | identical | identical | identical |

The canonical contradiction object does not carry the target vocabulary. In
the dedicated contradiction control, the conflicting positive staffing claim
is preserved upstream, but it does not suppress or replace `S6`. Contradiction
handling is therefore not the first loss.

No scope grouping occurs in `detectSignals()`. Rules match evidence text
globally; rule and assertion candidates require one match, while emergent
keyword candidates require two. Confidence is `0.70 × average evidence
confidence`, plus support up to 0.18 and a 0.08 strong-evidence bonus;
assertions may receive up to 0.12 specificity. Candidates are normalized by
title, sorted by confidence, and limited to 12. The canonical replay produces
nine Signals, so staffing and concurrency do not compete at the Signal limit.
Every selected Signal is supplied to downstream theme and observation
producers, but `buildSignalThemes()` considers only the first five.

No target Signal candidate was rejected at the 12-Signal limit and no target
Signal was removed by deduplication. The relevant rejection is downstream:
`S6`, `S7`, and `S9` are selected Signals but are not all promoted into the
bounded theme set used by causal synthesis.

## First-loss analysis

For the final missing staffing counterfactual:

- last explicit upstream object: Signal `S6` and the corresponding current and
  longitudinal observations;
- first causal-composition boundary where it becomes unavailable:
  `buildSignalThemes()` in `themes.ts`;
- producer rule: `signals.slice(0, 5)`, followed by final theme confidence
  sorting and `.slice(0, 8)`;
- consumer: causal-chain and explanation synthesis;
- downstream result: `EX5` retains adequate nominal capacity only, while
  canonical understanding and durable judgment omit “staffing is not the
  primary root cause”;
- source: `ns-artifact-048`, supported by `041`, `042`, `044`, and contextual
  capacity evidence;
- diagnosis confidence: high;
- impact: cognition/synthesis, not merely presentation or evaluator wording.

For the missing concurrency action, explicit `S7` and `S9` are also below the
five-Signal theme input. Durable beliefs later recover a valid abstraction of
concurrency from evidence ancestry, but the sequencing/reduce-active-work
consequence remains unavailable to the final recommendation. This is semantic
compression followed by action-level loss, not loss at Signal synthesis.

## Primary classification

**D. DOWNSTREAM SYNTHESIS DEFICIENCY**

Signals preserve the target meaning. A later bounded theme-composition step
excludes the specific staffing-negation and concurrency-action Signals, and
later layers do not reconstruct their substantive meaning. Confidence in this
classification is high because the canonical replay, isolated controls,
contradiction control, noise control, and order controls all show the same
boundary.

## Determinism and immutability

The substantive JSON trace is byte-identical across two runs, including stage
presence, IDs, lineage, selected objects, confidence, first-loss boundary, and
final score. Reversing artifacts and relevant evidence does not change target
presence. The canonical replay remains 75/100.

The trace uses no persisted Runtime. Canonical Atlas and Northstar tracked
fixtures remain unchanged. No temporary organization Runtime is created. The
pre-existing dirty files and Executive Decision Lab isolation remain outside
the investigation.

## Exactly one recommended next action

Authorize one benchmark-led experiment at the existing theme-composition
boundary: test whether making the already-selected `S6`, `S7`, and `S9`
eligible for causal explanation preserves the staffing counterfactual and
reduce-work consequence through final judgment without changing unrelated
Northstar or Atlas outputs. Do not change production until that experiment
demonstrates the narrow causal effect.

## Remaining uncertainty

This trace establishes the first bounded composition loss and the later absence
of the target semantics. It does not prove which future selection policy is
best, nor whether preserving all three Signals would improve executive quality
without crowding out other valid themes. That is the purpose of the recommended
experiment, not this investigation.
