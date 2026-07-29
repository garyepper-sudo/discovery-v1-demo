# Discovery Intelligence Evaluation Framework

**Status:** Canonical evaluation architecture
**Version:** 1.0.0
**Authority:** Evaluation only; no cognitive, Runtime, persistence, or product authority

## Purpose

The framework answers:

> Did Discovery genuinely improve truthful organizational understanding?

Existing benchmarks remain authoritative for the contracts they validate.
This framework composes their evidence with new evaluation evidence. It does
not replace, import into, tune, or mutate production cognition.

```text
fixed evaluation scenario
→ read-only system output
→ deterministic automated measures
→ bounded estimated measures
→ blinded human review
→ Discovery Intelligence Scorecard
→ trend, regression, and promotion recommendation
```

The long-term optimization target is improvement in truthful organizational
understanding, not artifact volume, benchmark completion, or confidence alone.

## Canonical fitness function

Discovery has one optimization target:

> **Increase Truthful Organizational Understanding over time.**

Organizational Understanding is the quality, completeness, calibration,
usefulness, and durability of Discovery's current understanding of an
organization. It includes:

- coverage of material Evidence and organizational scope;
- preservation and discrimination of competing explanations;
- specific uncertainty and calibrated assertion strength;
- compression without loss of decisive distinctions;
- relevance to reasonable decisions;
- generalization across wording, context, and domain;
- defensible novel insight beyond source restatement;
- durability and justified evolution over time;
- a non-negotiable dependency on truthfulness.

Organizational Understanding is not artifact count, cognitive-layer
completion, confidence, certainty, communication polish, user engagement,
decision prescription, or benchmark score maximization. Those properties may
support or constrain understanding; none substitutes for it.

## Hierarchy

```text
Organizational Understanding — single optimization target
├── Truthful Decision Utility — supporting capability
├── Evidence Acquisition Quality — supporting capability
├── Communication Quality — supporting capability
├── Learning Quality — supporting capability
└── Longitudinal Understanding — supporting capability
    ├── Understanding Freshness
    └── Understanding Evolution

Subject to non-compensable hard constraints:
├── Truthfulness
└── Model Stewardship
    ├── Governance and permissions
    ├── Determinism
    ├── Identity and historical truth
    └── System sustainability
```

Supporting capabilities are diagnostic. Their scores explain why
Organizational Understanding improved or failed to improve, but they are not
combined into a competing aggregate objective. Communication or utility
cannot mathematically compensate for weak understanding.

Hard constraints are promotion gates. Discovery cannot claim improvement by
fabricating, hallucinating, overclaiming, weakening lineage, weakening
confidence calibration, violating permissions, violating determinism,
discarding historical truth, or relying on unsustainable system behavior.

The executable metric definitions, methods, examples, and failure modes live
in `engine/evaluation/discovery-intelligence/scorecard.ts`.

## Measurement classes

- **Measured:** A deterministic contract can directly score the property.
  Examples include lineage validity, scenario coverage, organization
  isolation, negative controls, and unsupported-claim counts.
- **Estimated:** A deterministic proxy can provide bounded evidence but is not
  the property itself. Examples include explanation coverage, information
  gain, brevity, and tradeoff coverage.
- **Human-only:** The property requires judgment that deterministic checks
  cannot truthfully claim to possess. Examples include novel understanding,
  managerial thinking change, executive readability, and improvement
  efficiency.

Missing scores are `null`, never zero. Overall fitness equals the
Organizational Understanding score. Supporting-capability and constraint
scores remain visible diagnostics, and the report exposes total measurement
coverage as confidence. A low-coverage evaluation requires human review rather
than an optimistic score.

## Longitudinal Understanding

Longitudinal Understanding contains two canonical subdimensions:

### Understanding Freshness

Freshness asks whether current understanding is still likely to represent
organizational reality. It depends conceptually on:

- Evidence recency;
- expected organizational volatility;
- expected validation cadence;
- unresolved contradictions;
- newly weakening Evidence;
- newly supporting Evidence.

Elapsed time alone neither makes understanding stale nor proves it remains
fresh. No freshness formula or production calculation is implemented by this
framework.

### Understanding Evolution

Evolution asks whether additional Evidence genuinely improved understanding.
Improvement may include better explanations, reduced uncertainty, more
accurate calibration, retirement of weak explanations, stronger Evidence, or
preservation of still-valid truth. More artifacts or higher confidence alone
do not establish evolution.

## Expected Understanding Gain

**Expected Understanding Gain** is the estimated increase in Organizational
Understanding produced by acquiring one additional piece of Evidence.

It is not another evaluation dimension. It is a future optimization objective
for Evidence acquisition, question generation, recommended investigations,
survey recommendations, document requests, and AI analysis requests.

Examples include analyzing CRM conversion, interviewing lost customers,
running a weekly manager pulse, conducting finance variance analysis,
reviewing a project retrospective, or analyzing authorized Slack evidence.

Discovery should eventually recommend the Evidence with the highest Expected
Understanding Gain relative to effort, cost, delay, governance, and user
burden. This framework defines the concept only. It implements no
recommendation or ranking algorithm.

## Understanding Opportunity

An **Understanding Opportunity** is a future user-facing Evidence
recommendation object. Conceptually it contains:

- current understanding;
- current uncertainty;
- Understanding Freshness;
- Expected Understanding Gain;
- recommended acquisition;
- estimated effort, cost, delay, and user burden;
- decision relevance;
- governance and permission considerations.

This document does not authorize a new Runtime object, persistence contract,
product route, cognition layer, or recommendation algorithm.

## Human rubric

Two or more reviewers should score independently before discussing results.
Reviewers must not know the candidate architecture label when a blinded
comparison is possible.

| Criterion | Range | 0 | 5 | 10 |
| --- | ---: | --- | --- | --- |
| Understanding | 0–10 | Incorrect or unusable | Main pattern, material gaps | Traceable, compressed, generalizable understanding with alternatives and limits |
| Truthfulness | 0–10 | Unsupported material claims | Mostly grounded, minor overstatement | Fully grounded, calibrated, causally restrained, lineage-preserving |
| Decision utility | 0–10 | No effect on judgment | Partial clarification | Material improvement in frame, tradeoffs, alternatives, or next evidence |
| Communication | 0–10 | Confusing or internally focused | Understandable with effort | Clear, brief, structured, progressively disclosed, dual-audience readable |
| Evidence recommendations | 0–10 | Irrelevant or redundant | Relevant but weakly prioritized | Smallest practical, highest-discrimination sequence |
| Uncertainty handling | 0–10 | False certainty or generic caveats | Specific uncertainty without consequence | Specific, decision-relevant, bounded, and recoverable |

Maximum human score: 60. Reviewers must cite evidence for every score and
record material disagreement. The executable rubric is in
`engine/evaluation/discovery-intelligence/humanRubric.ts`.

## Benchmark corpus

The initial corpus contains 112 deterministic scenarios: seven investigation
patterns across sixteen domains:

- Sales
- Operations
- HR
- Finance
- Strategy
- Manufacturing
- Healthcare
- Government
- Agriculture
- Technology
- Professional Services
- Retail
- Supply Chain
- Customer Success
- Marketing
- Product

Every scenario has an isolated synthetic organization ID, a question, admitted
evidence, ground truth where appropriate, competing explanations, expected
uncertainty, and highest-value next evidence. Some scenarios intentionally
have no ground-truth explanation so abstention and recovery can be evaluated.

The corpus is evaluation infrastructure, not production fixture data. Scenario
identity and ordering are deterministic. A corpus digest is printed by
`npm run validate:discovery-intelligence`.

## Reporting

The canonical report contains:

- Organizational Understanding fitness score;
- supporting-capability diagnostic scores;
- hard-constraint results;
- measurement confidence;
- historical trend;
- benchmark trend;
- regressions;
- architecture changes supplied by the evaluation operator;
- promote, hold, block, or human-review-required recommendation.

Reports must retain framework version and input identity. They must never use a
wall-clock timestamp as deterministic evidence. Historical comparisons require
the same framework version or an explicit migration note.

## Promotion and blocking

Evaluation evidence informs architecture decisions; it does not make them.

A change may be considered for promotion only when:

1. truthfulness is at least 8/10;
2. model stewardship is at least 9/10;
3. measured coverage is at least 60%;
4. Organizational Understanding is at least 8/10;
5. no dimension regression is unexplained;
6. human-only criteria have reviewed evidence where material;
7. existing architecture and subsystem gates continue to pass.

Truthfulness below 8 or Model Stewardship below 9 blocks promotion regardless
of Organizational Understanding. Governance, permissions, determinism, and
system sustainability are evaluated within Model Stewardship and remain
non-compensable. A regression changes a promote recommendation to hold.
Evaluation never lowers canonical thresholds or promotes cognition directly.

## Future use

Future benchmark and architecture reviews should:

1. declare how the change is expected to improve Organizational Understanding
   and which supporting capabilities it affects;
2. freeze scenarios and expected outcomes before evaluating the candidate;
3. run existing subsystem benchmarks unchanged;
4. record automated and human evidence separately;
5. compare against a same-version baseline;
6. disclose regressions, uncertainty, and measurement coverage;
7. treat score improvement as evidence, not architectural authority.

Do not optimize against the public corpus alone. Add held-out scenarios and
independent reviewers before making consequential promotion decisions.

## Boundary

The framework does not write Runtime state, persist scores, change cognition,
alter Product Translation, modify Truthful Utility, classify Evidence Roles,
change onboarding, or consume Organizational Functions. It is a read-only
evaluation boundary.
