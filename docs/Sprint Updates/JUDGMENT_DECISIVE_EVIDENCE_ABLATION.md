# Judgment Lab Decisive-Evidence Ablation

Date: 2026-07-23
Branch: `sprint-79-organization-experience`
Commit: `5bee35a827a51b5aadf9d33b83d5ba89457396f9`

## Repository safety

The experiment is benchmark-only. It adds one diagnostic runner and this
report. It does not change production cognition, Runtime, schemas, pipeline
ordering, ranking, confidence, contradiction handling, recommendations,
investigations, architecture, product behavior, canonical fixtures, benchmark
expectations, or scoring. Sprint 110 files were not edited.

At startup:

- staged files: none;
- tracked Atlas and Northstar fixtures: unchanged;
- Decision Lab isolation and order-independence regression: present;
- benchmark checkpoint: present;
- semantic trace, Theme-policy, joint-composition, and
  explanatory-relationship studies: present;
- existing generated, Runtime, provider, Sprint 110, documentation, and user
  changes: dirty but left unstaged and untouched.

The diagnostic uses an in-memory Runtime, fixed timestamps
(`2026-07-01T12:00:00.000Z` and `2026-07-08T12:00:00.000Z`), no entropy, and
no hidden Ground Truth in engine input. It snapshots the canonical fixture
before execution and asserts that the fixture remains byte-equivalent.

## Research question

Does canonical cognition respond proportionately when genuinely diagnostic
evidence is present, removed, weakened, contradicted, delayed, duplicated,
made stale, or replaced with plausible but non-diagnostic evidence?

## Decisive-evidence definitions

### Existing Atlas pair

| Item | Fixture fact | Classification | Expected effect |
| --- | --- | --- | --- |
| A04 | High-reliability current review: 19 of 27 cross-functional decisions waited for executive approval despite accountable owners | strongly diagnostic | materially strengthen Decision Flow and reduce need for direct cycle-time evidence |
| A11 | High-reliability current log: 64% of routine decisions escalated; escalation was four times slower without higher quality | strongly diagnostic | materially strengthen approval-dependency explanation and support delegation |
| A04 + A11 | Independent operational review plus sampled outcome comparison | jointly strongly diagnostic, but not solely decisive | removal should lower confidence and reprioritize direct decision evidence; reversal is not required because A05, A08, A10, A13, and A16 retain related context |

The original fixture calls both artifacts `decisive`, but its own corpus means
their removal should not necessarily reverse the conclusion. The canonical
evaluator's label therefore overstates the expected magnitude. This is a
fixture-label limitation, not an excuse for a zero confidence response.

### Controlled reversal item

R04 is a high-reliability controlled flow-time study added only to the
diagnostic fixture. It reports 55% capacity utilization, attributes 91% of
delay to executive approval, and observes on-time delivery without more staff
when approval is absent. Three preceding artifacts consistently attribute
delay to workload and capacity.

R04 is **truly decisive within this bounded fixture** because it:

1. measures the proposed capacity explanation;
2. controls the principal alternative;
3. reports a comparative outcome;
4. rules out staffing as the binding cause; and
5. identifies approval waiting as the cause.

Expected: the capacity conclusion should be displaced by Decision Flow, not
merely receive a small confidence adjustment.

### Other diagnostic evidence

- A17, an independent high-reliability decision-quality review opposing
  delegation, is contradictory.
- A18, an unmeasured delegation workshop, is merely supportive or ambiguous.
- A19, an office-facilities update, is irrelevant.
- verbatim A04/A11 copies are redundant, not corroborating.
- low-reliability or stale A04/A11 variants are weaker than their originals.

## Canonical Judgment Lab trace

The unchanged canonical suite passed:

- framework: 15/15;
- expansion: 15/15;
- reported sensitivity: `limited`.

Full-corpus baseline:

| Layer | Result |
| --- | --- |
| artifacts | 16 |
| evidence objects | 133 |
| observations | 81 |
| Signals | 7 |
| contradictions | 5 |
| Themes | 8 |
| Phenomena | 5 |
| mechanisms | 11 |
| beliefs | 3 |
| theories | 4 |
| conditions | 8 |
| dominant condition | Decision Flow |
| confidence | 0.593594 |
| investigation | condition persistence |
| recommendation | Delegate routine decision authority. |

The complete machine-readable trace records stable identity, confidence, and
lineage for every layer. Candidate condition ordering is not exposed by the
current Runtime projection; the selected condition is available.

### First divergence on removal

Removing A04 and A11 changes Evidence and Observations immediately. Signals
retain the same identities, Themes and beliefs change in weight/lineage, one
contradiction disappears, while Phenomena, theories, conditions, dominant
condition, confidence, and recommendation remain substantively unchanged.
Missing-information wording changes.

The artifacts therefore enter cognition. They are not lost at ingestion. Their
diagnostic weight stops affecting the executive judgment after upstream
lineage/weight changes are composed into the stable downstream condition.

## Ablation matrix

All differences are relative to the full-corpus baseline unless stated.

| Path | Condition | Confidence | Contradictions | Investigation | Recommendation | Assessment |
| --- | --- | ---: | --- | --- | --- | --- |
| baseline | Decision Flow | 0.593594 | 5 | condition persistence | delegate authority | reference |
| decisive removed | unchanged | +0.000000 | changed, 5→4 | unchanged | unchanged | underreaction; only lineage, explanation, and missing information respond |
| decisive present | unchanged | +0.000000 | unchanged | unchanged | unchanged | expected reference |
| decisive weakened | unchanged | +0.000000 | unchanged | unchanged | unchanged | underreaction; reliability loss is not reflected downstream |
| decisive contradicted | unchanged | **+0.000713** | unchanged count and identity | unchanged | unchanged | incorrect direction and underreaction |
| decisive delayed | Decision Flow→Strategic Alignment | **+0.193322** from prior stage | changed | decision authority | unchanged | model revises, but confidence rises sharply and selected condition moves away from the evidence topic |
| decisive duplicated | Decision Flow→Strategic Alignment | **+0.150892** | unchanged | unchanged | unchanged | severe overreaction to non-independent copies |
| plausible substitute | unchanged | +0.000000 | 5→4 | unchanged | unchanged | appropriately does not strengthen conclusion |
| reversed evidence order | unchanged | +0.000000 | unchanged | unchanged | unchanged | appropriate invariance |
| supporting context removed | Decision Flow→Strategic Alignment | +0.112772 | changed | strategic alignment | unchanged | context matters, but less context increases confidence |
| irrelevant evidence | unchanged | +0.000000 | unchanged | unchanged | unchanged | appropriate substantive invariance |
| stale decisive evidence | unchanged | +0.000000 | unchanged | unchanged | unchanged | underreaction to loss of recency |

## Dimension-level response

### Dominant condition

- insensitive to removal, weakening, staleness, and credible contradiction;
- changes on verbatim duplication;
- fails to reverse in the controlled R04 case;
- changes during delayed evidence, but away from Decision Flow.

### Mechanism and theory

- removal changes mechanism confidence/lineage but not mechanism identities;
- R04 introduces Governance Friction, Accountability Gap, and Decision
  Latency, showing that semantic cognition sees the new evidence;
- the dominant condition remains Strategic Alignment despite those mechanisms;
- contradiction affects internal weights but does not preserve a visible
  competing explanation;
- verbatim duplication changes downstream mechanism and theory weights.

### Contradiction handling

A17 enters Evidence and Observations, but the canonical contradiction set
retains the same identities. Confidence increases by 0.000713 instead of
falling. The earliest clear responsibility is contradiction formation:
credible opposing semantics are not represented as a new contradiction before
judgment composition.

### Confidence

- removal: no response;
- low reliability: no response;
- staleness: no response;
- contradiction: small increase;
- exact duplication: +0.150892;
- removal of supporting context: +0.112772;
- R04 controlled reversal: only -0.008279.

The directions are not proportional to diagnostic strength.

### Missing information and investigation

Removal changes missing-information details but retains the generic
condition-persistence investigation. R04 correctly changes the investigation
from Strategic Alignment to Decision Authority. Delayed evidence also changes
the investigation to Decision Authority. Investigation synthesis is therefore
more sensitive than dominant judgment.

### Recommendation and explanation

The recommendation remains `Delegate routine decision authority.` in every
path, including the capacity-only before-state and the credible contradictory
quality evidence. Explanations change when the selected condition or lineage
changes, but do not surface why contradiction, reliability, staleness, or
duplication should alter confidence.

### Evidence lineage

Lineage changes deterministically for removal, contradiction, duplication,
irrelevant evidence, and delayed evidence. Reversed order is invariant. The
problem is not total ancestry loss; it is how source identity and diagnostic
weight influence later cognition.

## Counterfactual sensitivity

1. **Same conclusion without A04/A11?** Yes, with identical confidence and
   recommendation.
2. **Confidence or explanation?** Removal changes explanation lineage and
   missing information, not confidence.
3. **Selected mechanism?** Identities remain stable after removal; weights and
   lineage change.
4. **Investigation?** Not for removal; yes for controlled R04 and delayed
   evidence.
5. **Proportional to strength?** No. Weak/stale evidence is equivalent to
   high/current evidence.
6. **Contradiction weakens conclusion?** No. Confidence increases slightly.
7. **Duplication inflates confidence?** Yes, by 0.150892, and changes the
   selected condition.
8. **Delayed evidence revises prior understanding?** Yes, but confidence rises
   0.193322 and the dominant condition moves to Strategic Alignment rather
   than Decision Flow.
9. **Irrelevant plausible evidence stable?** Yes substantively; only ancestry
   expands.

## Evaluator audit

The canonical evaluator has a secondary deficiency:

- sensitivity is not computed inside `buildJudgmentScorecard`; the caller
  supplies `strong`, `limited`, or `none`;
- the pilot caller marks any change to condition, understanding,
  recommendation, confidence, or visible uncertainty as strong;
- it marks a missing-information-only change as limited;
- it does not measure direction, proportionality, diagnostic strength,
  duplication independence, delayed revision quality, or contradiction
  preservation;
- its confidence check uses artifact-count coverage, not reliability,
  independence, recency, or diagnostic value;
- its contradiction score rewards the presence of generic words such as
  `mixed` or `ambiguity`, not the specific opposing claim;
- its semantic matching is term-based and does not recognize equivalent
  causal structures explicitly;
- reversed ordering is stable, but equivalent phrasing is covered only by a
  broad terminology metamorphic case.

Consequently the dimension scores remain unchanged for removal, weakening,
contradiction, and the controlled reversal even when their response quality is
materially different. This is an evaluator deficiency, but the production
defects above are observable without relying on evaluator scores.

## Multi-scenario generalization

| Required case | Diagnostic path | Observed result | Failure ownership |
| --- | --- | --- | --- |
| decisive evidence should reverse | capacity-only R01–R03 plus controlled R04 | Strategic Alignment remains selected; confidence falls only 0.008279; mechanisms and investigation react | cognition failure |
| materially reduce confidence, no reversal | A17 contradiction | condition stable, confidence rises 0.000713 | cognition failure |
| change investigation | R04 and delayed A04/A11 | investigation changes to Decision Authority | no failure for investigation synthesis |
| preserve multiple explanations | A17 contradiction | no new contradiction identity or visible competing explanation | cognition failure |
| duplicate should not inflate | duplicated A04/A11 | +0.150892 and condition changes | cognition failure |
| plausible evidence should not matter | A18 substitute and A19 irrelevant control | substantive judgment stable | no failure |
| delayed evidence should revise | delayed A04/A11 | revision occurs, but direction and confidence are disproportionate | cognition failure |

The original A04/A11 “decisive” label is a fixture-label deficiency because
other diagnostic decision evidence remains. The controlled reversal case
removes that ambiguity and independently reproduces underreaction.

## Earliest responsible producers

The experiment does not identify one universal failing function:

1. **Evidence Formation / provenance weighting:** artifact reliability and
   staleness do not change the Evidence identities or downstream result.
2. **Evidence and Observation identity:** verbatim copies become additional
   evidence and observations and later behave as corroboration.
3. **Contradiction formation:** the explicit opposing quality result does not
   create a distinct contradiction.
4. **Condition ranking / confidence composition:** upstream changes reach
   mechanisms and investigations but are translated into unchanged or
   directionally incorrect dominant judgment and confidence.
5. **Evaluator:** the benchmark cannot score proportionality or direction.

These are observed producer boundaries, not authorization to change them.

## Robustness and mutation safety

- baseline repeated execution: identical;
- complete matrix repeated internally: identical;
- controlled reversal repeated: identical;
- reversed evidence order: identical substantive Runtime signature;
- organization identity: preserved;
- fixture snapshot: unchanged;
- Runtime files written: none;
- hidden Ground Truth passed to engine: no;
- benchmark output and evaluator order: deterministic.

## Primary classification

**A — PROVEN PRODUCTION REASONING DEFICIENCY**

Confidence: **high**.

Canonical cognition underreacts to genuinely diagnostic removal, weakening,
staleness, contradiction, and controlled counterfactual evidence; it
overreacts to exact duplication; and the effects repeat deterministically
across independent diagnostic paths. The controlled R04 case proves that this
finding is not owned solely by the original Atlas fixture label or evaluator.

Secondary findings:

- original fixture label: benchmark fixture deficiency;
- sensitivity score: evaluator deficiency;
- explanation: presentation also fails to surface several internal weight
  changes, but presentation is not the primary cause.

## Exactly one recommended next action

Authorize one narrow architecture-preserving production-design sprint to
define and regression-test how stable source identity, reliability, recency,
and explicit opposition must survive Evidence Formation into existing
weighting and contradiction producers before any code repair is selected.

This is one producer-boundary design action, not authorization to redesign
Runtime, add a capability, or implement multiple speculative fixes.
