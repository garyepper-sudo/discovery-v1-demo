# Organizational Objective Discovery Research Canon

**Status:** Benchmark-supported research; no production implementation
**Phase:** Phase 2D prerequisite research
**Governance gaps:** `GAP-A-011`, `GAP-A-018`

## 1. Research question

How should Discovery discover, confirm, maintain, and revise an organizational
objective with the fewest necessary questions while preserving authority,
ambiguity, history, and truthful abstention?

The answer is not “infer the objective.” It is a governed discovery loop that
uses existing authorized signals to form non-authoritative hypotheses, asks the
single most discriminating material question, and requires explicit authority
before an Objective governs business recommendations.

## 2. Existing-state audit

Discovery has no current canonical objective-discovery owner or interaction.
The designed Organizational Objective contract defines identity, scope,
authority, epistemic confidence, versioning, and status, but deliberately does
not define how a candidate becomes confirmed.

Existing architecture already supplies useful signals:

| Signal | Existing owner | What it can establish | What it cannot establish |
| --- | --- | --- | --- |
| User statement | Product Question / authorized interaction | A declared candidate and its source | Governing authority by wording alone |
| Admitted evidence | Evidence and canonical cognition | Observed priorities, constraints, and contradictions | Permission to establish an objective |
| Decisions | Existing decision lifecycle | Enacted tradeoffs and historical priorities | A current end independent of context |
| Strategy artifacts | Authorized source and evidence lineage | Stated direction and means | Current governing status |
| KPIs | Evidence and success-criterion references | What is measured and monitored | The end being pursued |
| Organizational conditions | Organizational Understanding | Context, capacity, risk, and change | Preferences or authority |

The concept is therefore missing composition and governance, not raw signal
availability. A Question objective, an engine-generated executive objective, a
metric, and a governed Organizational Objective remain distinct.

## 3. Expert-pattern comparison

The experiment uses expert practice as a comparison pattern, not as authority
or imitation:

- Professional coaching establishes and repeatedly reconfirms the client-owned
  agreement, clarifies the desired outcome, and notices shifts rather than
  prescribing a goal. This supports explicit authority and revalidation.
- Value-focused decision analysis distinguishes fundamental ends from means,
  gathers perspectives from affected stakeholders, and iterates problem and
  objective framing. This supports multiple hypotheses, means/end checks, and
  conflict preservation.
- Structured decision making frames the problem before evaluating alternatives
  and makes stakeholder differences explicit. This supports scope and authority
  questions before recommendation eligibility.
- Organizational assessment practice favors triangulation across stated intent,
  behavior, records, and stakeholder perspectives. Discovery adapts that
  pattern by treating every source as lineage-preserving evidence rather than
  granting observed behavior authority.

The hybrid adaptive architecture converges toward these patterns: establish
the agreement, triangulate, distinguish ends from means, expose disagreement,
ask a discriminating question, and reconfirm after material change.

Sources:

- [International Coaching Federation Core Competencies](https://coachingfederation.org/credentialing/coaching-competencies/icf-core-competencies/)
- [ICF criteria for establishing and maintaining agreements](https://coachingfederation.org/credentialing/performance-evaluations/criteria-for-assessing-mcc/)
- [Keeney and McDaniels, identifying and structuring values](https://doi.org/10.1287/opre.47.5.651)
- [Structured decision making and stakeholder objective framing](https://doi.org/10.1287/inte.2022.1154)
- [Strategic objective setting with value-focused thinking](https://doi.org/10.1287/inte.2019.1011)

## 4. Candidate architectures

The benchmark compares direct declaration; evidence, decision, strategy, and
metric inference; multiple objective hypotheses with discriminating questions;
and a governed hybrid. Single-source architectures are simple but systematically
lose conflict, currency, or authority. Hypothesis preservation fixes premature
collapse but is still unsafe without authority separation.

Architecture G is the smallest complete candidate:

```text
authorized declarations + admitted evidence + decisions + strategy + KPIs
                              + organizational conditions
                                         ↓
                    non-authoritative Objective hypotheses
                                         ↓
             highest-value authority or meaning clarification
                                         ↓
         confirmed governed Objective OR explicit unresolved state
```

## 5. Objective-hypothesis boundary

Objective hypotheses should be canonical to the future discovery operation but
not canonical organizational authority. They are temporary, deterministic,
lineage-preserving product projections. They must not be persisted as active
Objectives merely because they recur.

Each hypothesis must disclose:

- exact organization and scope;
- candidate objective meaning;
- source lineage;
- source authority, separately from interpretation confidence;
- supporting and conflicting signals;
- currency;
- the exact unresolved distinction;
- the next question and why its answer is material.

No hypothesis may generate an Objective Recommendation.

## 6. Declared, observed, and governed

These are three states of evidence and authority, not three durable object
types:

- **Declared objective signal:** what an identified source says should be
  pursued. Its authority is explicit and independently checked.
- **Observed objective signal:** what decisions, resource allocation, strategy,
  metrics, or behavior appear to prioritize. It may support or challenge a
  declaration but never grants authority.
- **Governed Objective:** the versioned product object confirmed by a source
  authorized for its scope, with explicit success criteria and lifecycle.

Declared and observed signals may conflict indefinitely without fabrication.
The product must show the conflict or ask for authorized resolution.

## 7. Adaptive discovery interaction

The benchmark supports this bounded sequence:

1. Reuse authorized signals already available; do not ask the user to repeat
   known facts.
2. Form the smallest materially distinct hypothesis set.
3. If one current, precise, governing declaration is uncontradicted, confirm it
   without a questionnaire.
4. Otherwise ask one question selected by deterministic information gain:
   authority first, then ends versus means, scope, conflict, success criterion,
   or currency.
5. Stop when the Objective is governable, the user defers, or evidence cannot
   safely distinguish candidates.
6. Record a truthful unresolved or abstention state rather than selecting the
   most frequent signal.

The benchmark's adaptive strategy averages fewer than one question across a
mix containing already-governed cases; it asks one material question in every
ambiguous fixture. That number is synthetic and is not a customer burden claim.

## 8. Volatility and revalidation

Objective volatility is not a new cognitive object. It is a revalidation policy
derived from objective history and authorized evidence of material change.
Revalidation triggers include:

- target date or scheduled review;
- leadership or authority change;
- crisis, regulation, acquisition, or market discontinuity;
- persistent conflict between the governed Objective and authorized decisions;
- success, abandonment, expiry, or supersession evidence;
- changed scope, constraints, or protected stakeholder obligations.

A trigger opens a review. It never silently edits or replaces the active
Objective. Material revisions create immutable versions with ancestry.

## 9. Benchmark

Experiment 001 contains 42 deterministic scenarios spanning clear declaration,
inference, vague language, means/end confusion, KPI substitution, authority,
stakeholder conflict, multiple scopes, crisis and lifecycle shifts, Goodhart
controls, stale objectives, and wording variants.

Metrics cover objective correctness, authority correctness, ambiguity
reduction, question efficiency, burden, future Recommendation readiness,
stability, governance, determinism, simplicity, and false governance.

The generated report is authoritative for exact synthetic metrics. The bounded
result is:

- G wins the architecture comparison;
- G preserves all expected material hypotheses;
- G produces zero false governance after authority gating;
- F preserves hypotheses but cannot safely distinguish evidence confidence
  from authority;
- A–E are useful signal adapters, not sufficient discovery architectures;
- hybrid adaptive matches full-questionnaire fixture correctness with far lower
  question burden;
- fixed interviews miss scenario-specific ambiguity.

## 10. Negative controls

The validator proves fail-closed behavior for absent signals, irrelevant
evidence volume, unauthorized certainty, stale objectives, metric substitution,
conflicting ends, and observed behavior without governing authority. Frequency,
confidence, evidence volume, or Runtime presence never creates authority.

## 11. Governance recommendation

Adopt the hybrid adaptive discovery model as the design requirement for the
future Organizational Objective contract implementation. Do not implement it
as cognition, do not create a separate persistence system, and do not generate
Objective Recommendations yet.

The next contract design must specify the temporary hypothesis projection,
authority-resolution interface, deterministic material-question selection,
revalidation triggers, immutable Objective version creation, permission
inheritance, fixture coverage, and fail-closed states.

## 12. Evidence limits

This experiment is synthetic. It does not validate political dynamics,
cross-cultural authority, real executive burden, inter-rater agreement,
objective quality, or recommendation outcomes. Field studies must test whether
authorized stakeholders recognize the hypothesis set, answer the proposed
question, and accept or correct the resulting Objective.
