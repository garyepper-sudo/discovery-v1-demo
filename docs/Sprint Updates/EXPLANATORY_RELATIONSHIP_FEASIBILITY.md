# Explanatory Relationship Feasibility

## Repository safety

This documentation-and-benchmark investigation began on branch
`sprint-79-organization-experience` at
`5bee35a827a51b5aadf9d33b83d5ba89457396f9`. Nothing was staged. Existing
Sprint 110 work, generated artifacts, documentation, Runtime files, provider
output, and benchmark isolation remained outside the investigation.

Executive Decision Lab isolation remains present. Ground Truth remained
75/100. The semantic trace, Theme policy experiment, and joint-composition
experiment remained available. Canonical tracked Atlas and Northstar fixtures
had no diff, and no canonical producer, object schema, Runtime contract,
fixture, expectation, scoring rule, or product behavior was changed.

## Responsibility audit

| Relationship | Current implicit location | Current producer / consumer | Earliest reliable inference | Likely owner | Duplication and architecture risk |
| --- | --- | --- | --- | --- | --- |
| causal contribution | evidence relationships; causal chains; mechanisms; theories | evidence network → downstream cognition | evidence support is early; causal contribution is not | evidence network for support, causal/mechanism capability for causality | medium: support must not be relabeled as causality |
| weakened/rejected alternative | contradiction prose, opposing evidence, belief contradiction IDs | contradiction producer → beliefs/hypotheses | contradiction producer | contradiction capability | medium: contradictions are produced after Themes and often lack a target Signal |
| conditional antecedent/consequent | evidence prose; some later prediction conditions | no canonical early producer | unavailable before semantic interpretation | unresolved | high: earlier production could duplicate causal or prediction cognition |
| consequence | causal chains, mechanisms, predictions, simulation | causal/mechanism/prediction producers | causal-chain producer | causal/mechanism capability | high: it is produced too late to guide its own bounded selection |
| action implication | recommendations and intervention options | decision pipeline | after executive judgment | recommendation capability | high: moving it earlier duplicates recommendation cognition |
| temporal precedence | source dates; prediction/outcome history | evidence ingestion and prediction evaluation | evidence dates are early, causal precedence is not | evidence temporal metadata plus causal capability | high if chronology is treated as causality |
| scope transition | scoped evidence and later organizational objects | multiple producers | only where both endpoints have explicit scope | owning relationship producer | high because target Signals/Themes currently expose unspecified scope |

Signals and Themes are not the demonstrated rightful owner of causal
structure. They preserve assertions and evidence ancestry. Contradictions,
causal chains, mechanisms, predictions, simulations, and recommendations own
different parts later, but those parts are either incomplete or produced too
late for the two bounded composition decisions.

## Minimum relationship vocabulary

The smallest coherent benchmark vocabulary is:

### `contributes-to`

A source supplies structured support to another explanatory object.

- Direction: source → target.
- Required evidence: explicit relationship or canonical ancestry.
- Confidence: inherits bounded relationship confidence.
- Contradictions: opposition remains separate.
- Scope: requires explicit intersection or source scope.
- Temporal meaning: none by itself.
- Falsification: invalidate or remove the supporting relationship.

This relationship is feasible for evidence support, but not automatically for
causal contribution.

### `weakens-explanation`

An opposing object reduces support for a specific explanation.

- Direction: opposing object → explanation.
- Required evidence: explicit contradiction target and opposing evidence.
- Confidence: inherits contradiction confidence.
- Scope: cannot broaden beyond the contradiction.
- Temporal behavior: later opposition revises confidence without erasing
  history.
- Falsification: resolve the contradiction or invalidate opposing evidence.

It is feasible only when the contradiction identifies the object it weakens.

### `conditional-on`

A conclusion holds only when an antecedent condition holds.

- Direction: conclusion → antecedent.
- Required evidence: structured antecedent and consequent.
- Confidence: bounded by the weaker side.
- Scope: intersection of both sides.
- Temporal behavior: antecedent precedes or coexists with consequence.
- Falsification: the consequent repeatedly fails while the antecedent holds.

This relationship is necessary for Northstar but is not structurally
available.

### `leads-to`

A structured explanatory object produces or precedes a consequence.

- Direction: cause → consequence.
- Required evidence: causal chain, mechanism, prediction, or observed outcome.
- Confidence: inherits bounded causal confidence.
- Scope: consequence cannot silently broaden cause scope.
- Temporal behavior: cause precedes or coexists with consequence.
- Falsification: repeated absence of consequence after cause.

It exists downstream but not early enough to guide causal-chain eligibility.

`implies-response` was rejected. An action is a downstream projection of
explanation; encoding it as an early explanatory edge would duplicate
recommendation cognition. A validated `leads-to` relationship can support a
later response without owning the response itself.

## Producer feasibility

| Relationship | Feasibility | Evidence |
| --- | --- | --- |
| contributes-to | directly available for evidence support; ambiguous for causality | `supports`, `explains`, and `depends_on` evidence relationships |
| weakens-explanation | directly available only when `contradiction.signalIds` supplies a target | tested canonical contradictions supplied no usable target edges |
| conditional-on | free-text only | no structured antecedent/consequent survives into target Signals/Themes |
| leads-to | directly available but late | Theme ancestry on causal chains and mechanisms |

Northstar produced 54 benchmark-local edges:

- 49 `contributes-to`;
- 5 `leads-to`;
- 0 `weakens-explanation`;
- 0 `conditional-on`.

Forty-two were early enough to precede Theme composition, but they represented
generic evidence support. Their ambiguity rate as explanatory relationships
was 77.78%. All edges had lineage and none were unsupported.

Atlas produced 49 edges with 65.31% ambiguity. The knowledge-continuity fixture
produced 19 edges with lower ambiguity, but only two were early enough for
composition.

## Benchmark-local representation

The experimental graph records:

- source and target object IDs;
- relationship type and direction;
- confidence;
- supporting and contradicting evidence IDs;
- scope;
- fixed inferred timestamp;
- derivation source;
- complete lineage;
- falsification information;
- derivation availability;
- eligibility before each composition boundary;
- ambiguity.

It is constructed after canonical cognition from explicit fields only. It is
not persisted, merged into Runtime, or treated as a platform capability.

## Composition comparison

| Path | Northstar retained meaning | Complete | Evidence coverage | Lineage |
| --- | --- | --- | ---: | ---: |
| A — current bounded | pressure, causal driver | no | 94.12% | 100% |
| B — unbounded | pressure, driver, rejected alternative, consequence | no | 100% | 100% |
| C — relationship-guided bounded | pressure, causal driver | no | 94.12% | 100% |

Relationship guidance selected `S2`, `S3`, `S1`, `S4`, and `S5`: the same
substantive high-support set as structured confidence/support ranking. Generic
evidence connectivity cannot identify S6 as a rejected alternative, S7 as the
specific driver, or S9 as the implication.

The graph does not improve bounded explanation. Even unbounded composition
still lacks the `conditional-on` relationship.

## Multi-benchmark generalization

The vocabulary and rules were applied to:

- Northstar;
- committed Atlas;
- the isolated Executive Decision fixture;
- committed knowledge-continuity state;
- contradiction-pressure;
- multi-scope;
- rejected-alternative;
- conditional-relationship;
- action-consequence;
- no-meaningful-causal-relationship controls.

The contradiction, scope, rejected-alternative, conditional, and consequence
controls deliberately expose canonical absences using the same source state;
they do not add synthetic relationships to force a pass.

Results:

- Atlas relationship-guided coverage fell from 100% to 94.74%.
- Knowledge-continuity retained 100% because only five Signals existed.
- No tested fixture produced `conditional-on`.
- Duplicating canonical contradictions did not produce
  `weakens-explanation`, because the required target IDs remained absent.
- Multi-scope evaluation could not establish scope correctness because target
  scope remained unspecified.
- The no-causal control produced an empty graph and no unsupported novelty.
- Relationship meaning was structurally consistent across organizations, but
  `contributes-to` remained support rather than reliable causality.

## False-positive and ambiguity analysis

- Unsupported relationship rate: 0% across populated graphs.
- Lineage completeness: 100%.
- Northstar ambiguity: 77.78%.
- Atlas ambiguity: 65.31%.
- Knowledge-continuity ambiguity: 5.26%.
- Conditional recall for the known Northstar conditional: 0%.
- Rejected-alternative recall at the early boundary: 0%.
- Scope correctness: unmeasurable where target scope is unspecified.

The graph is precise about explicit ancestry, but low-recall for the required
explanatory relationships. Reclassifying generic support as causality would
increase apparent recall by introducing false causal claims.

No confidence adjustment is justified: relationship-guided composition did not
improve explanation, and late causal confidence cannot be used retroactively
without circular selection.

## Architectural ownership

- Evidence support remains owned by the evidence network.
- Opposition remains owned by contradiction handling.
- Causal consequence remains owned by causal/mechanism cognition.
- Action implication remains owned by recommendations.
- Conditional explanatory structure has no demonstrated existing owner or
  reliable structured producer.

Creating an early generic relationship producer would either:

- duplicate downstream causal cognition;
- treat evidence support as causality;
- require free-text or LLM interpretation;
- or introduce a new capability.

None is authorized or supported by this benchmark.

## Architecture implications

The four-term vocabulary is conceptually coherent, but vocabulary coherence is
not implementation feasibility. Current producers cannot populate the minimum
set at the time bounded composition needs it.

The missing `conditional-on` relationship is not merely hidden in a later
canonical object. Predictions and simulations may express conditions for
future outcomes, but they operate after the explanation and do not preserve
the source evidence counterfactual required here.

## Classification

**A — NOT FEASIBLE**

The minimum complete relationship graph cannot be populated reliably from
current structured producers without free-text interpretation, circular use of
later cognition, or a new canonical responsibility. The relationship-guided
selector does not improve bounded explanation.

## Exactly one next action

Stop relationship-schema work and return to benchmark prioritization across
the full validated suite. Rank this 75/100 Ground Truth gap against other
measured deficiencies before authorizing any new cognition or representation
research.

## Remaining uncertainty

This result does not prove that conditional relationships are inherently
unrepresentable. It proves that current canonical structured producers cannot
populate them early, reliably, and generally under the sprint constraints.
Future evidence ingestion or cognition may expose suitable structure, but that
would be a different architectural investigation.
