# Material Information Acquisition Research Canon

**Status:** Benchmark-supported research; not implemented
**Research experiment:** Material Information Acquisition Experiment 001
**Related gaps:** `GAP-D-002`, with bounded dependencies on existing Phase 2 Unknown and Understanding Recommendation contracts

## 1. Research question

Can Discovery replace multiple special-purpose “what should we learn next?”
workflows with one deterministic, governed algorithm that selects the next
material information-acquisition action?

The benchmark supports that hypothesis. The common object is not another kind
of uncertainty or Evidence. It is a temporary comparison among actions offered
by existing owners.

## 2. Existing-state audit

Discovery already contains the necessary inputs, distributed across canonical
boundaries:

- Organizational Understanding preserves uncertainty, alternatives,
  contradiction, lineage, and change.
- Canonical investigation opportunities expose targeted gaps and expected
  confidence gain.
- Phase 2 Unknowns preserve exact unresolved questions.
- Understanding Recommendations provide governed proposals for improving an
  Answer or its confidence.
- Product Question retrieval searches authorized connected evidence.
- Evidence admission owns whether acquired information may affect cognition.
- Outcome and Learning contracts distinguish waiting for observation from
  acquiring more evidence immediately.
- Objective Discovery and Optimization Context research identify authority and
  preference ambiguities that only an authorized person can resolve.

No canonical owner currently compares search, question, comparison, document,
survey, measurement, experiment, waiting, stopping, and abstention through one
contract. The missing capability is composition and policy, not a new cognitive
primitive.

## 3. Research foundation

Decision analysis distinguishes information gain from decision value. The
value of information depends on how information can change a decision and on
preferences; rankings can differ under different utility assumptions. Discovery
therefore must not equate uncertainty reduction with organizational value.

Experimental design seeks the most information for bounded effort, while
sequential design updates knowledge after each observation. Discovery adapts
that principle without adopting a probabilistic or autonomous experimental
engine. Cost-sensitive active learning similarly supports selecting informative
queries under unequal costs, but its label-learning assumptions do not define
organizational authority or product truth.

Sources:

- [Value of information across decision problems](https://doi.org/10.1287/deca.2024.0187)
- [Applied value-of-information analysis with acquisition costs](https://doi.org/10.1287/deca.1080.0121)
- [NIST definition of economical experimental design](https://itl.nist.gov/div898/handbook/pri/section1/pri11.htm)
- [NIST sequential optimal experimental design](https://pages.nist.gov/optbayesexpt/manual.html)

## 4. Candidate-action contract

Every candidate action in the benchmark exposes the same bounded attributes:

```text
action kind
expected information gain
expected organizational value
user burden
acquisition cost
delay
authorization
governance permission
reversibility
source reliability
existing evidence quality
```

These attributes are comparison inputs, not a proposed persisted product
object. Existing producers retain ownership of uncertainty, authorization,
Evidence, Outcome timing, source reliability, and expected confidence gain.

## 5. Candidate actions

The benchmark discriminates among:

- search existing authorized evidence;
- ask one adaptive question;
- compare existing evidence;
- request a known document;
- recommend a survey;
- recommend a measurement;
- recommend a reversible experiment;
- wait for a governed Outcome;
- do nothing because current understanding is sufficient;
- abstain because no governed action has material net value.

No additional primitive action is justified. Connecting a source is a governed
way to make search or document acquisition available, not a different learning
semantics. Future action implementations may join the candidate set when they
provide distinct acquisition consequences through the same contract.

## 6. Benchmark design

Experiment 001 contains 32 deterministic scenarios covering sufficient,
contradictory, stale, unavailable, unauthorized, repeated, unreliable, and
low-value information; cheap and expensive surveys; direct measurements;
reversible and prohibited experiments; Outcome waiting; objective,
understanding, and optimization ambiguity; permission denial; equal gross gain;
and wording variants.

Selection code consumes only candidate attributes. It never reads scenario
labels, expected action identifiers, negative-control markers, or fixture tags.
Expected outputs are used only by the evaluator.

## 7. Result

The governed hybrid wins with an overall synthetic score of `0.910`, perfect
bounded action selection, perfect question efficiency, perfect governance
integrity, and deterministic replay.

| Strategy | Correct choice | Governance | Overall |
| --- | ---: | ---: | ---: |
| Governed hybrid | 1.000 | 1.000 | 0.910 |
| Expected organizational value | 0.781 | 0.875 | 0.796 |
| Expected information gain | 0.719 | 0.875 | 0.757 |
| Rule priority | 0.438 | 1.000 | 0.539 |
| Fixed workflow | 0.281 | 0.906 | 0.461 |
| Always ask | 0.219 | 1.000 | 0.373 |
| Always search | 0.156 | 0.938 | 0.362 |
| Always measure | 0.125 | 1.000 | 0.308 |
| Always survey | 0.063 | 1.000 | 0.293 |
| Always experiment | 0.031 | 0.969 | 0.261 |

These values are synthetic architectural discrimination, not calibrated
probabilities, monetary utilities, or production-performance claims.

## 8. Answers to the research questions

- **R1 — Search before asking?** Search first only when relevant, authorized,
  sufficiently reliable evidence is available at lower net burden.
- **R2 — Ask instead of searching?** Ask when the missing information is an
  authorized preference, authority confirmation, interpretation, or fact known
  by the user and unavailable from governed evidence.
- **R3 — Wait?** Wait when a committed process will produce a sufficiently
  reliable Outcome before delay destroys material value.
- **R4 — When is a question not worthwhile?** When already answered, incapable
  of changing understanding or action, lower-value than another source, or
  outside authorization.
- **R5 — Burden versus gain?** Burden is a cost against net material value, not
  a separate veto; authorization and governance remain hard gates.
- **R6 — Always exhaust evidence?** No. Low-quality, stale, or non-discriminating
  evidence can be dominated by a question, measurement, or experiment.
- **R7 — Reliability?** Reliability bounds expected contribution; large gross
  information gain from an unreliable source must not dominate automatically.
- **R8 — Cost?** Cost can reverse otherwise equal action rankings and can make
  stopping correct.
- **R9 — Authorization?** Authorization is an eligibility gate before ranking,
  not a soft score.
- **R10 — No acquisition?** Yes. Do nothing and abstain are explicit truthful
  outcomes.

## 9. Recommended algorithm

```text
1. Read current authorized Organizational Understanding.
2. Identify the uncertainty with the greatest material limitation.
3. Request candidate acquisition actions from existing owners.
4. Reject unauthorized or prohibited actions.
5. Compare bounded expected information gain and organizational value
   against burden, cost, delay, reliability, evidence quality, and reversibility.
6. Select exactly one action deterministically.
7. Stop or abstain when no action has sufficient net material value.
8. Route new information through existing authorization and Evidence admission.
9. Update Organizational Understanding through canonical cognition.
10. Repeat only if material uncertainty remains.
```

The benchmark's weighted score is experimental machinery. A production
contract must not canonize these weights without calibration.

## 10. Canonical loop hypothesis

The smallest supported description is:

```text
Current Organizational Understanding
        ↓
Highest-value material uncertainty
        ↓
Governed candidate acquisition actions
        ↓
One best net-value action, stopping, or abstention
        ↓
New authorized information
        ↓
Canonical Evidence admission and cognition
        ↓
Updated Organizational Understanding
        ↺
```

No stage is removable. Candidate enumeration prevents “always ask”; governance
prevents unauthorized acquisition; stopping prevents activity for its own sake;
Evidence admission prevents acquired content from bypassing cognition.

## 11. Interaction implications

Discovery should ordinarily present one next learning action, its target
uncertainty, expected contribution, cost or burden boundary, source and scope,
and why alternatives were not selected when material. It should never present
an experimental score as a guarantee or silently begin acquisition.

User authorization remains required wherever current contracts require it.
This research does not justify autonomous connectors, surveys, measurements, or
experiments.

## 12. Governance implications

The result supports designing one non-persistent Material Information
Acquisition contract that composes existing owners. It does not justify a new
Runtime object, uncertainty object, planner, confidence system, universal
utility function, or recommendation generator.

Before promotion, governance must define attribute ownership, hard eligibility
gates, budgets, user consent, action-specific execution ownership, audit
receipts, cancellation, failure behavior, stopping thresholds, and calibration.
`GAP-D-002` remains Research; it is not resolved by this experiment.

## 13. Limits and kill-criteria review

The general algorithm did not require scenario-specific branches, and all
domains used the same candidate contract. Complexity produced measurable
synthetic benefit over fixed and single-factor strategies without rewriting
existing architecture, so the stated kill criteria did not trigger.

However, the fixtures are authored. Real-world calibration may show that some
attributes cannot be compared reliably or that action domains need distinct
governance. That would block promotion rather than justify hidden heuristics.

## 14. Next step

Design—but do not implement—the Material Information Acquisition contract and
attribute-ownership matrix. Then benchmark calibration, ties, missing values,
multi-user authority, budgets, and action execution failures before any
production or autonomous acquisition work.
