# Joint Composition Experiment

## Repository safety

This benchmark-only investigation began on branch
`sprint-79-organization-experience` at
`5bee35a827a51b5aadf9d33b83d5ba89457396f9`. Nothing was staged. The
pre-existing dirty tree contained Sprint 110 work, generated architecture and
capability artifacts, documentation, Executive Decision Lab isolation, three
untracked Runtime files, provider output, and `Does`.

The canonical tracked Atlas and Northstar fixtures had no diff. Executive
Decision Lab isolation, `traceConcurrencyStaffingSemantics.ts`, and
`themeCompositionPolicyExperiment.ts` remained available and were not edited.
No production cognition, Runtime, fixture, scoring, expectation, architecture,
or product behavior was changed.

Relevant production functions are:

- `detectSignals()` and `scoreSignals()` for ordered Signal input;
- `buildSignalThemes()` and `detectThemes()` for Signal eligibility, Theme
  projection, deduplication, confidence ordering, and the eight-Theme bound;
- `buildCausalChains()` for the independent first-five Theme bound;
- `generateExplanations()` for causal explanation synthesis;
- evidence-network relationships for generic connectivity;
- contradictions, mechanisms, conditions, and executive outputs for canonical
  downstream validation.

## Minimum complete explanation

Hidden benchmark Ground Truth was used only after policy completion to test
five distinct explanatory parts:

1. observed pressure: execution capacity is constrained;
2. causal driver: excessive concurrent work and reprioritization reduce
   effective capacity;
3. rejected alternative: insufficient staffing is not the primary cause;
4. counterfactual: current staffing can support throughput if concurrency is
   reduced;
5. consequence: reduce, sequence, or protect active work.

Existing fixture support includes the capacity and work-in-progress artifacts,
the independent assessment, the unchanged-staffing focus pilot, and the
reduce-active-work results identified in the prior semantic trace. These labels
and phrases never enter candidate generation or selection.

## Current dual-boundary behavior

The canonical isolated replay produces nine Signals. Confidence ordering places
generic recurring-document Signals first and S6, S7, and S9 below the first
five:

```text
Signals
→ buildSignalThemes(signals.slice(0, 5))
→ ordered Theme set
→ buildCausalChains(themes.slice(0, 5))
→ explanations
```

The current benchmark-local control retains pressure and a general concurrency
driver. It omits the rejected staffing explanation, the staffing/concurrency
counterfactual, and the reduce-work consequence.

All target Signals retain evidence IDs, confidence, polarity, and descriptive
text. They do not carry structured causal roles, contradiction IDs, explicit
scope, antecedent/consequent links, or action implication.

## Existing-metadata sufficiency audit

| Inference | Availability | Finding |
| --- | --- | --- |
| central pressure | free text only | confidence and negative polarity cannot distinguish state from cause |
| causal contributor | free text or generic graph adjacency | evidence relationships do not reliably encode causal direction |
| rejected explanation | unavailable structurally | target Signals/Themes carry no contradiction or rejected-alternative role |
| counterfactual | free text only | no antecedent, consequent, or conditional relationship is carried |
| consequence | free text only | positive polarity also describes unrelated improvement or contradiction |
| action implication | free text only | no action/consequence role exists |
| scope transition | unavailable on targets | canonical target scope is unspecified |
| temporal precedence | upstream evidence only | no causal temporal relation reaches Signal/Theme |
| independent corroboration | partially derivable | distinct evidence IDs exist; source independence is not explicit |
| semantic redundancy | approximate | token overlap is available but not semantic role equivalence |
| connectivity | canonically available | relationships are generic and overvalue highly connected document evidence |

Evidence lineage is sufficient to verify support and coverage. It is not
sufficient to distinguish why a supported statement belongs in a minimal
causal explanation.

## Joint policies tested

- **A — current control:** first five Signals, then first five Themes.
- **B — unbounded diagnostic:** all selected Signals and all resulting
  signal-derived Themes reach canonical causal-chain and explanation
  construction.
- **C — independent structured ranking:** confidence, evidence support, and
  available contradiction linkage independently at both boundaries.
- **D — shared coverage state:** deterministic coverage of evidence, scope,
  polarity, contradiction linkage, and free-text diversity across both
  selections.
- **E — lineage coverage:** the same bounded coverage objective emphasizing
  distinct evidence ancestry and redundancy reduction.
- **F — causal connectivity:** preference for objects whose evidence
  participates in canonical evidence-network relationships.

Path F was retained because relationships are structured, but its result is
diagnostic: relationship type does not reliably identify the explanatory
direction required here.

No policy uses Northstar-specific terms or hidden explanatory-role labels.

## Dimension-level results

| Path | Explanation parts retained | Complete | Evidence coverage | Redundancy | Themes / chains | Unsupported |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| A | pressure, causal driver | no | 94.12% | 0.319 | 5 / 5 | 0% |
| B | pressure, causal driver, rejected alternative, consequence | no | 100% | 0.189 | 9 / 9 | 0% |
| C | pressure, causal driver | no | 94.12% | 0.319 | 5 / 5 | 0% |
| D | pressure, rejected alternative, consequence | no | 100% | 0.160 | 5 / 5 | 0% |
| E | pressure, rejected alternative, consequence | no | 100% | 0.160 | 5 / 5 | 0% |
| F | pressure, causal driver | no | 94.12% | 0.319 | 5 / 5 | 0% |

Lineage completeness was 100% for every path. Canonical target scope and
contradiction coverage remained zero because those references are absent on the
Signal-derived Themes.

Average causal confidence ranged from 0.713 for the nine-chain diagnostic to
0.796 for the confidence-dominated bounded paths. D/E averaged 0.732. These
values describe the experimental causal objects; production confidence was not
changed.

## Northstar findings

The unbounded diagnostic proves that existing selected Signals can recover:

- execution pressure;
- concurrent work as a causal driver;
- staffing as a rejected primary explanation;
- reduce-active-work as the implication.

It still cannot reconstruct the complete conditional relationship that current
staffing is sufficient **if** concurrent work is reduced. That relationship is
present in source evidence but is split or compressed before the selected
Signal/Theme representation used by composition.

D/E achieve full evidence coverage and lower redundancy while retaining the
rejected alternative and consequence. They drop the explicit concurrency
driver because the structured fields cannot tell it apart from redundant
capacity evidence. C/F retain the driver but prefer the generic,
high-confidence recurring-document structures and lose the counterfactual and
consequence.

No bounded policy produces the complete explanation.

## Cross-benchmark findings

Every viable path was applied benchmark-locally to:

- Northstar;
- the committed Atlas canonical / Executive Decision fixture;
- the committed Operating Model knowledge-continuity fixture;
- a first-five-sufficient input;
- noise, contradiction, redundant-high-confidence, removal, and order
  controls.

Across Atlas and the Decision fixture:

- unsupported Theme and causal-chain rates remained zero;
- A/B/C preserved 100% evidence coverage;
- D/E preserved 84.21%, demonstrating that diversity can displace central
  high-support evidence;
- F preserved 94.74% and favored graph-connected evidence;
- B expanded causal output from five to seven without establishing better
  judgment.

In the five-Signal knowledge-continuity fixture every path preserved all
evidence, and alternatives produced no material benefit. Experimental outputs
were never substituted into Runtime, mechanisms, conditions, confidence, or
recommendations. Canonical validators separately confirmed those production
outputs remained stable.

## Robustness and graceful degradation

- Complete report equality across repeated runs: PASS.
- B–F reversed-Signal-order equality: PASS.
- B–F reversed-Theme-order equality: PASS.
- A depends on incoming order, as expected from its direct slices; production
  normally supplies confidence-sorted arrays.
- Low-confidence irrelevant additions did not create unsupported objects.
- D/E could overvalue distinct polarity under contradiction pressure.
- F overvalued highly connected generic evidence.
- Redundant high-confidence Signals increased competition without supplying
  missing causal roles.
- Removing one evidence object exposed missing lineage rather than inventing a
  replacement.
- Removing S6 gracefully removed the rejected-alternative part.
- Removing S9 gracefully removed the consequence part.
- Reversing the source artifact order was already deterministic in the prior
  semantic trace; this harness does not recreate an alternate ingestion path.

No policy created unsupported causal connections, but none demonstrated
complete bounded explanatory retention.

## Representation-gap determination

1. **Can existing structured metadata preserve the complete explanation?**
   No. Even the unbounded diagnostic cannot reconstruct the counterfactual
   relationship structurally.
2. **Is evidence lineage sufficient?** It is sufficient for support,
   provenance, and coverage, but not explanatory role or causal relationship.
3. **Is free-text semantic interpretation required today?** Yes. Causal driver,
   rejected alternative, counterfactual, and action implication are encoded
   primarily in text.
4. **Selection policy or representation?** Primarily representation. Selection
   limits expose the problem, but structured ranking cannot recognize the
   missing roles.
5. **Can a bounded shared policy solve it without new canonical fields?** Not
   with the tested reliable metadata.
6. **Would role structure be new cognition?** The organizational meanings
   already exist in evidence and selected assertions. A minimal relationship
   marker would make implicit relationships explicit, but producing that marker
   would still alter canonical representation and must be separately designed
   and authorized.

The minimum missing structural information is a typed relationship among
existing assertions that can distinguish:

- causal contributor;
- rejected or weakened alternative;
- conditional antecedent and consequent;
- consequence or action implication.

This report does not define a new object, schema, or capability.

## Computational and cognitive complexity

A–C/F require deterministic sorting or connectivity counts. D/E add up to 46
pairwise comparisons for the Northstar nine-Signal/five-Theme case. Runtime
cost is small.

The important cost is conceptual: unbounded B creates nine explanations and
still misses the counterfactual, while D/E add selection complexity and can
displace central evidence. More ranking sophistication cannot compensate
reliably for absent explanatory roles.

## Classification

**C — REPRESENTATION GAP**

The existing Signal and Theme structures contain the relevant text and
evidence lineage but not enough reliable structured information to select and
compose a minimal complete explanation under bounded eligibility.

## Exactly one next action

Conduct one documentation-and-benchmark design investigation to specify the
minimum typed relationship needed among existing assertions—without adding it
to production—and test whether that proposed representation can be populated
from current canonical producers without Northstar-specific lexical rules.

Do not implement a new field, object, capability, or production policy until
that feasibility benchmark passes.

## Remaining uncertainty

This experiment does not prove that a future typed relationship can be inferred
reliably or that carrying it through final judgment will improve the canonical
Ground Truth score. It establishes only that confidence, polarity, scope,
lineage, contradiction references, redundancy, and generic connectivity as
currently represented are insufficient.
