# Expected Explanation Discrimination Experiment 001

**Status:** Complete benchmark-only research

**Decision:** Retain Expected Understanding Gain as the broader future
acquisition objective. Treat Expected Explanation Discrimination as a
reusable, non-authoritative interpretation-layer concept for investigations
that have an explicit competing-explanation space.

## Research question

Is Expected Explanation Discrimination more fundamental than Expected
Understanding Gain for future Evidence acquisition?

## Preregistered comparison

The experiment re-expresses twelve existing
`competingExplanationAdjudication` scenario families as read-only acquisition
problems. Each fixture retains its source benchmark and scenario identity.
Each starts with three viable explanations and includes:

- corroborative Evidence that primarily increases confidence;
- contextual Evidence with broad understanding and decision value;
- a candidate-relative comparative or counterfactual test;
- shared Evidence that all explanations predict;
- an inadmissible hypothesis control.

Strategies score only information available before acquisition. Observed
effects and ground truth are used only by the evaluator. Changing hidden
observed effects does not change selection scores.

## Results

| Strategy | Correct supported understanding | Mean Evidence items | Mean effort | Evidence efficiency | Ambiguity reduction | False elimination | Truthfulness | Causal restraint | Utility |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Highest confidence gain | 12/12 | 3.000 | 4.000 | 0.143 | 1.000 | 0.000 | 1.000 | 1.000 | 0.517 |
| Highest Expected Understanding Gain proxy | 12/12 | 2.000 | 4.000 | 0.167 | 1.000 | 0.000 | 1.000 | 1.000 | 0.875 |
| Highest Expected Explanation Discrimination | 12/12 | 1.000 | 2.000 | 0.333 | 1.000 | 0.000 | 1.000 | 1.000 | 0.950 |

All three strategies eventually reached the fixture-supported understanding.
Explanation Discrimination used the least Evidence and effort. It eliminated
21 unsupported competitors with zero false eliminations. All strategies were
deterministic, organization-isolated, truthful, and causally restrained under
the experiment protocol.

## Answers

### 1. Does Discovery naturally maintain an explanation space?

**Benchmark evidence: yes, within existing Judgment Lab and shadow
adjudication contracts.**

Existing scenarios preserve leading, viable, weakened, rejected, displaced,
and unresolved explanations. This is evidence of an explanation-space
grammar. It is not evidence that production has a universal, persisted
explanation-space object. Production completed Explanations and shadow
competing-explanation adjudication must not be conflated.

### 2. Can competing explanations be explicit without weakening truthfulness?

**Yes under the tested shadow contract.**

Explicit alternatives improved the ability to retain ambiguity and identify
candidate-relative tests. Truthfulness remained 1.000 because shared evidence
did not eliminate alternatives, hypotheses were inadmissible, and rule-out
effects required counterfactual strength.

### 3. Can Evidence be scored for discrimination?

**Yes, deterministically in the experiment.**

The score measures how many pairs of viable explanations predict different
observable outcomes, normalized by acquisition effort. It does not use the
observed outcome or correct answer during selection.

### 4. Which strategy is most evidence-efficient?

**Expected Explanation Discrimination in this corpus.**

It reached the supported set with one item versus two for the Expected
Understanding Gain proxy and three for confidence gain.

### 5. Is it more fundamental than Expected Understanding Gain?

**Not established.**

Explanation Discrimination is narrower and more proximal when an explicit
alternative space exists. Expected Understanding Gain remains broader: it can
value coverage, freshness, discovery of unknown alternatives, calibration,
decision relevance, and useful compression even when no explicit explanation
space exists.

The concepts are therefore not synonyms. Expected Explanation Discrimination
is one candidate contributor to Expected Understanding Gain, and may be the
preferred acquisition objective for the bounded phase of an investigation
where competing explanations are already explicit.

## Ownership determination

Selected option: **C — reusable interpretation-layer concept.**

Rationale:

- It consumes a governed explanation space and predicted discriminating
  outcomes.
- It creates no Evidence, Explanation, confidence, or canonical authority.
- Its result is a ranked acquisition interpretation, not organizational truth.
- It may serve multiple downstream consumers without belonging to one UI.

Option B, product-layer ownership, is too narrow because the concept can guide
investigation planning before product communication. Option D, a canonical
cognitive primitive, is unsupported because no production owner, Runtime
contract, persistence strategy, independent replication, or need for new
authority has been demonstrated.

## Limitations

- The twelve fixtures are structured derivations of one existing Judgment Lab
  family, not an independent corpus.
- Every fixture includes a known high-quality comparative or counterfactual
  test, favoring strategies capable of recognizing it.
- Predicted outcomes are supplied by the fixture; the experiment does not test
  how Discovery would generate them.
- Effort and utility values are preregistered synthetic values.
- Zero false elimination reflects conservative fixture semantics, not a
  production guarantee.
- The experiment does not cover discovery of explanations absent from the
  initial space.
- The Expected Understanding Gain strategy is a bounded proxy, not a future
  canonical algorithm.

## Promotion gates not met

- independent scenario family;
- unstructured or natural-language acquisition candidates;
- predicted-outcome generation;
- noisy and partially wrong predictions;
- calibrated acquisition cost and user burden;
- governance-sensitive acquisition choices;
- production contract owner;
- evidence that a new canonical primitive is necessary.

## Architecture boundary

No production cognition, Product Translation, Truthful Utility, Evidence
Roles, Organizational Functions, Runtime, persistence, onboarding, or existing
benchmark behavior changed. The result authorizes no promotion.
