# Candidate-Relative Explanation Test Producer Audit

**Status:** Read-only production ownership audit
**Program:** Discovery 2 Sequential Implementation Program, Phase 2
**Depends on:** Completed Explanation Adjudication Contract
**Production behavior:** Unchanged

---

# Purpose

This audit determines whether the current production engine already owns a
canonical result capable of testing one completed `OrganizationalExplanation`
relative to another.

The required semantic question is narrow:

> Does production record a structured observation that supports, weakens,
> discriminates among, falsifies, rules out, or confirms the outcome of a
> specific completed Explanation?

This is an ownership audit, not a schema proposal. It separates actual
production semantics from benchmark fixtures, downstream interpretation, and
architectural inference.

---

# Executive finding

No existing production object is a valid candidate-relative test producer for
completed Organizational Explanations.

Production has useful partial ingredients:

- completed Explanation identity, scope, outcome identity, ancestry, and
  comparative Evidence roles;
- Evidence relationships and Contradictions;
- legacy Hypothesis support and weakening sets;
- Prediction Evaluations against observed Organizational Conditions;
- Belief revisions and Theory evolution;
- decision reviews and decision learning.

None of these records all three facts required by the Phase 2 contract:

1. the completed Explanation being tested;
2. the competing completed Explanation or viable comparison set;
3. the structured test result whose semantics justify relative standing.

`PredictionEvaluation` is the closest production object. It evaluates a
specific Prediction against observed Conditions and retains canonical Evidence
identity. It does not identify a completed Explanation, establish that the
Prediction is a required implication of that Explanation, or state what the
same outcome means for a competitor. Reusing it without those semantics would
turn forecast evaluation into unsupported Explanation selection.

Phase 2 must therefore preserve unresolved competition. It must not infer a
leader from Evidence volume, Seed-era Judgment rank, Hypothesis status,
Prediction accuracy, Belief confidence, Theory evolution, or decision
learning.

---

# Search scope

The audit traced producers, contracts, orchestration, Runtime persistence, and
representative persisted state across:

- completed Organizational Explanations and Explanation Seeds;
- Comparative Evidence Roles;
- Seed-era Organizational Judgment and Judgment Contradictions;
- `V3Hypothesis` and `V3Explanation`;
- Evidence relationships and Contradictions;
- Organizational Predictions, Prediction Evaluations, and Prediction
  Reflection;
- Organizational Beliefs and Belief Revisions;
- Organizational Theories, Theory Evolution, and Theory Validation;
- Executive Decisions, outcomes, reviews, learning, and Operating Model
  improvements;
- Executive Simulation and scenario comparison;
- Atlas and Northstar canonical Runtime fixtures;
- completed-Explanation and competing-explanation benchmark shadows.

The search tested both direct candidates and indirect ancestry bridges. A
field name such as `supporting`, `weakening`, `validated`, or `confidence` was
not treated as semantic equivalence by itself.

---

# Classification method

Each candidate is classified as exactly one of:

- **A — Valid producer:** already produces a completed-Explanation-relative
  test with canonical identity, structured result, and sufficient semantics.
- **B — Partial semantic producer:** produces relevant structured information
  but tests another subject or lacks the relation needed for adjudication.
- **C — Derived interpretation or projection:** interprets upstream state and
  must not become the upstream truth owner.
- **D — Benchmark-only evidence:** demonstrates feasibility but is not a
  production capability.
- **E — Irrelevant or unsafe substitute:** resembles adjudication but cannot be
  used without changing its established meaning.

No candidate qualifies as A.

---

# Candidate inventory

| Candidate | Canonical producer | Actual tested subject | Available semantics | Classification | Phase 2 decision |
| --- | --- | --- | --- | --- | --- |
| Comparative Evidence Roles | `completeOrganizationalExplanations()` | completed Explanation to Evidence | `supports`, narrow `opposes`, `shared`; exact Evidence basis | B | Preserve as ancestry and comparability input; not a test result |
| Seed-era Organizational Judgment | `evaluateExplanations()` | `OrganizationalExplanationSeed` | rank, status, confidence, raw support criteria | B | Do not migrate rank or status into completed Explanations |
| Judgment Contradiction | `detectJudgmentContradictions()` | competing Seeds | shared root-cause/effect heuristic and count penalty | B | Do not treat as candidate-relative falsification |
| `V3Hypothesis` | `buildHypotheses()` | mechanism- or belief-derived Hypothesis | supporting and weakening Evidence, status, questions | B | Do not map positional Hypothesis identity to completed Explanation identity |
| `V3Explanation` | V3 workspace pipeline | legacy V3 Explanation | supporting and weakening Evidence, confidence | E | Parallel legacy shape; not the canonical completed object |
| Evidence Relationship | `buildEvidenceRelationships()` | Evidence pair | supports, contradicts, depends on, explains, extends, duplicates | B | Retain as Evidence semantics; no Explanation-relative result |
| Contradiction | contradiction detection | Evidence sets | supporting/opposing Evidence and confidence | B | Retain as contradiction truth; no candidate partition or disposition |
| Organizational Prediction | prediction generation | expected future Condition change | causal path, assumptions, prose falsifying Evidence, theory/belief ancestry | B | It may express a future implication, but does not identify its completed Explanation |
| Prediction Evaluation | `evaluatePredictionOutcomes()` | one Prediction | confirmed, partially confirmed, not confirmed, inconclusive; observed Conditions and Evidence IDs | B | Strongest partial producer; cannot adjudicate Explanations without an explicit required-implication contract |
| Prediction Reflection | prediction reflection | current/competing Predictions | narrative comparison and executive interpretation | C | Projection cannot own completed-Explanation truth |
| Belief Revision | belief update | one Organizational Belief | confidence movement, reason, supporting and contradicting Evidence ancestry | B | Many-to-many ancestry is insufficient to reverse-assign a test to an Explanation |
| Theory Evolution | theory consolidation | one Organizational Theory | confidence delta, status, reason | B | Theory change is not an Explanation-relative test |
| Theory Validation | theory reflection | dominant and competing Theories | narrative validation Evidence and confidence | C | Downstream reflection lacks canonical test identity |
| Executive Review / Decision Outcome | decision lifecycle producers | Decision, option, intervention, expected outcome, or Prediction | observed outcome comparison and validated/invalidated Prediction IDs | B | Useful longitudinal input, but no completed Explanation subject |
| Executive Learning / Operating Model Improvement | decision-learning producers | decision lifecycle learning | mechanism/theory reinforcement or weakening and confidence effects | C | Downstream learning must not retroactively invent Explanation tests |
| Executive Simulation | scenario comparison | hypothetical intervention scenario | ranked projected Condition changes and trade-offs | E | Hypothetical comparison is not observed evidential adjudication |
| Completed Explanation adjudication shadows | benchmark-owned producers | fixture completed Explanations | discriminate, counterfactual, outcome, rule-out, and fixture confidence | D | Demonstrates the missing contract; must not be copied into production |

---

# Producer property audit

The following matrix records the ownership properties that determine whether
reuse would be legitimate. “Runtime example” refers to representative
canonical fixture state inspected during the audit, not a new fixture or a
claim that every typed collection must be populated.

| Candidate family | Produced type and persistence | Runtime example | Identity basis | Direction / discrimination | Determinism and text dependency | Authority direction |
| --- | --- | --- | --- | --- | --- | --- |
| completed Explanation | `OrganizationalExplanation`; `memory.organizationalExplanations` | Atlas has six persisted legacy-shaped records; current producer shape is not demonstrated by those historical records | stable completed Explanation and canonical ancestry IDs | roles are directional to one Explanation, but do not discriminate between comparable Explanations | deterministic construction; some claim content is textual, role bases are structured | correct upstream owner, but no test result exists |
| Seed Judgment | `OrganizationalJudgment`; `memory.organizationalJudgments` | Atlas has six Judgments targeting legacy Seed-era Explanation IDs | Seed ID and referenced Evidence IDs | ranked and directional, but relative to Seed-era criteria rather than a defined candidate test | deterministic for equal input; includes textual root-cause/effect heuristics and raw counts | wrong subject; migration would overwrite completed truth from a provisional evaluator |
| legacy Hypothesis | `V3Hypothesis`; V3 workspace/organism state rather than completed-Explanation memory | no canonical completed-Explanation identity bridge | positional Hypothesis ID plus mechanism, belief, theme, Evidence, and contradiction IDs | support and weakening are directional to a Hypothesis; no observed test or cross-candidate diagnostic result | deterministic after production sorting, but positional identity and generated text make equivalence unsafe | upstream contributor, but not the canonical completed object |
| Evidence relationship | `V3EvidenceRelationship`; V3 cognitive workspace and downstream Runtime state | canonical Evidence relationship IDs are available where the pipeline emits them | exact source and target Evidence IDs | directional between Evidence records; cannot distinguish Explanations | deterministic producer with semantic/text heuristics | correct Evidence authority; reusing it as Explanation standing would invert abstraction ownership |
| Contradiction | `V3Contradiction`; cognitive workspace and Runtime cognition state | Atlas contains canonical Evidence-level contradictions used by downstream cognition | contradiction and Evidence IDs | opposing sets are directional within a contradiction, not relative to candidate implications | deterministic producer; classification may use Evidence text and structured ancestry | correct contradiction authority; insufficient for adjudication |
| Prediction | `OrganizationalPrediction`; `memory.organizationalPredictions` | Atlas has 22 Predictions with Condition, Concept, Belief, and sometimes Theory ancestry | stable Prediction ID and structured upstream IDs | predicted Condition changes are directional; no completed Explanation target or competitor comparison | deterministic when canonical time inputs are controlled; prose assumptions/falsifying Evidence are not structured tests | legitimate upstream implication candidate, but its meaning cannot be expanded by inference |
| Prediction Evaluation | `PredictionEvaluation`; `memory.predictionEvaluations` | Atlas has 22 evaluations, including structured confirmed outcomes and supporting Evidence IDs | exact Prediction, Condition, and Evidence IDs | directional outcome status for one Prediction; not diagnostic across Explanations | deterministic when evaluation time is supplied; core comparison is structured rather than narrative | correct observed Prediction owner; consuming it requires a prior Explanation-to-required-implication contract |
| Prediction Reflection | `PredictionReflection`; prediction reflection memory/projection path | Atlas has one reflection comparing current and competing Predictions | Prediction IDs and narrative selection context | comparative, but executive-facing and not an Explanation test | deterministic composition can depend on textual reasons | downstream interpretation; cannot write upstream viability |
| Belief Revision | `OrganizationalBeliefRevision`; belief revision memory when produced | inspected Atlas fixture has no revision records | Belief ID, previous/revised confidence, and inherited Evidence ancestry | directional confidence movement for one Belief; cannot distinguish Explanations sharing it | deterministic formula; reason is explanatory text | valid Belief owner; reverse assignment to Explanations would be many-to-many inference |
| Theory Evolution | `TheoryEvolution`; `memory.theoryEvolution` | Atlas has 12 evolution records | Theory ID and confidence/status transition | directional for one Theory; no candidate-relative Explanation result | deterministic consolidation; reason includes generated explanation | valid Theory owner; completed Explanations may cite it but do not inherit its standing |
| Theory Validation | `TheoryValidation`; Executive Assessment/reflection output rather than completed-Explanation truth | available as executive theory reflection, not as an Explanation-targeted Runtime test | dominant/competing Theory framing; validation items lack canonical test-result identity | narratively comparative, not attached to a completed Explanation | depends on text and downstream framing | downstream projection; upstream write would invert authority |
| Decision outcome and review | `ExecutiveDecisionOutcome`, `ExecutiveReview`; decision lifecycle memory | relevant Atlas decision-review collections are empty in the inspected fixture | Decision, intervention, expected-outcome, Condition, and Prediction IDs | observed results can validate Predictions, but do not test completed Explanations | deterministic production paths with structured and narrative fields | legitimate outcome owners; require an explicit upstream implication bridge |
| Decision learning and improvement | `ExecutiveLearning`, `ExecutiveDecisionLearning`, `OperatingModelImprovement`; decision-learning memory | relevant inspected Atlas collections are empty | review, work, decision, mechanism, Theory, Belief, and knowledge IDs by type | derived strengthening/weakening, not a candidate-relative test | deterministic producers; statements and rationales are narrative | downstream retention; must not become upstream evidence authority |
| Simulation | scenario comparison and Executive Simulation outputs | Atlas simulation produces hypothetical ranked scenarios | scenario, intervention, Prediction, and Condition identities | comparative and directional, but hypothetical | deterministic simulation for fixed input | alternative evaluation only; not observed adjudication |
| benchmark shadows | benchmark-owned link and score types; no production persistence | controlled fixtures provide expected leaders and abstentions | fixture candidate, Evidence, outcome, and role IDs | explicitly discriminating by fixture design | deterministic, but depends on benchmark-owned labels and constants | benchmark evidence only; production reuse is forbidden |

All production candidates are deterministic within their established input and
time contracts. Determinism does not repair a subject, identity, or authority
gap. Likewise, stable canonical Evidence identity proves traceability, not
candidate-relative diagnostic meaning.

---

# Detailed semantic findings

## Completed Explanation and Comparative Evidence Roles

`OrganizationalExplanation` is the correct future owner of durable
adjudication state. Its production producer already retains:

- stable Explanation identity;
- organization and normalized scope;
- claims and outcome identities;
- Evidence, Observation, Signal, Mechanism, Belief, Concept, and Theory
  ancestry;
- optional comparative Evidence roles;
- `viability: "unadjudicated"`;
- explicit uncertainty.

These fields prove what each candidate cites and whether candidates are
comparable. They do not prove that cited Evidence distinguishes one candidate
from another. Shared Evidence may support multiple candidates. Opposing
Evidence may introduce tension without ruling a candidate out. The Phase 1
role contract is therefore an input to adjudication, not an adjudication test.

## Seed-era Judgment

`evaluateExplanations()` evaluates `OrganizationalExplanationSeed` objects.
Its rank and status combine Seed confidence, Evidence-reference count,
executive significance, root-cause and effect heuristics, assumptions, and
open questions.

That evaluator predates completed Explanation identity and Comparative
Evidence Roles. It cannot answer whether an observed result discriminates
between completed candidates. Its persisted Atlas records also reflect a
legacy Explanation shape rather than the current completed contract.

This overlap is intentional backward compatibility, not shared ownership.
Seed-era Judgment may remain a downstream contributor until a later migration
proves parity. It must not write completed Explanation adjudication.

## Legacy Hypotheses

`buildHypotheses()` creates mechanism- and belief-derived `V3Hypothesis`
objects with supporting and weakening Evidence sets, confidence, status,
strengths, weaknesses, and distinguishing questions.

This is relevant semantic structure, but not a completed-Explanation test:

- Hypothesis IDs are positional (`H-1`, `H-2`, and so on);
- the candidate subject is a mechanism or belief synthesis;
- weakening Evidence is inherited from contradictions or a Belief;
- status is confidence- and order-derived;
- distinguishing questions describe future inquiry but do not record a test
  or result;
- no identity contract equates a Hypothesis with a completed Explanation.

Mapping Hypotheses to completed Explanations by text, ancestry overlap, or
rank would create a new heuristic authority and break stable identity.

## Evidence Relationships and Contradictions

Evidence relationships and Contradictions are canonical statements about
Evidence. They can establish that one Evidence record directly contradicts
another, or that a contradiction contains supporting and opposing Evidence
sets.

They do not state:

- which completed Explanation a result tests;
- whether an Evidence relationship is diagnostic rather than merely
  inconsistent;
- which alternative gains when one candidate weakens;
- whether a contradiction is material enough to rule out a candidate;
- whether an observed outcome was expected by one candidate and not another.

Promoting them directly would collapse Evidence semantics into Explanation
standing.

## Prediction and observed-outcome evaluation

`PredictionEvaluation` is the most semantically capable existing producer. It
targets an exact Prediction, compares predicted Condition changes with
observed Conditions, records a bounded outcome status, and retains supporting
Evidence IDs.

However, a Prediction currently traces to Conditions, Concepts, Theories, and
Beliefs—not to a completed Explanation. More importantly, production does not
state whether the Prediction is:

- a required implication of one completed Explanation;
- merely compatible with that Explanation;
- shared by several competitors;
- uniquely discriminating;
- a sufficient rule-out condition;
- independent of the competing claims.

Adding only `sourceExplanationIds` would preserve ancestry but would not define
those missing meanings. A failed optional forecast cannot safely falsify its
source Explanation, and a confirmed forecast shared by competitors cannot
select one.

The existing producer should remain authoritative for Prediction accuracy.
Outcome-based Explanation revision belongs naturally to the later
longitudinal learning phase, after an explicit implication contract exists.

## Belief, Theory, and decision learning

Belief revisions, Theory evolution, and decision learning can strengthen or
weaken upstream organizational interpretations. They are many-to-many
aggregations with their own subjects and responsibilities.

Reverse-projecting those movements into completed Explanation standing would
be ambiguous:

- multiple Explanations may share a Belief or Theory;
- an Explanation may cite several Beliefs or Theories;
- confidence movement may reflect new support, contradiction, consolidation,
  or decision outcome;
- the existing records do not identify which candidate-relative proposition
  was tested.

Decision reviews and Prediction validations can eventually supply governed
outcome evidence. Executive Learning and Operating Model Improvement are
derived consumers of that evidence, not adjudication producers.

---

# Runtime evidence

The canonical Runtime schema persists completed Explanations, Seed-era
Judgments, Prediction Evaluations, Theory evolution, and decision-learning
objects in separate collections. It contains no completed-Explanation test or
adjudication-result collection.

Representative Atlas state demonstrates:

- persisted legacy-shaped Explanations and Seed-era Judgments;
- Predictions and Prediction Evaluations with Condition and Evidence
  ancestry;
- Beliefs and Theory evolution;
- no persisted Belief Revisions in the inspected fixture;
- no persisted decision records, work, reviews, learning, or Operating Model
  improvements in the inspected fixture.

Representative Northstar state does not supply a completed-Explanation test
example. Absence in a fixture is not proof that a typed producer is invalid,
but it prevents claiming demonstrated Runtime coverage for those paths.

The audit made no Runtime writes and did not use fixture content as a proposed
semantic contract.

---

# Ownership analysis

## Current canonical owners

| Responsibility | Current owner |
| --- | --- |
| completed Explanation identity, claim, scope, ancestry, and comparative roles | `completeOrganizationalExplanations()` |
| Evidence-to-Evidence relationship | Evidence relationship producer |
| contradiction identity and Evidence partition | contradiction producer |
| Seed-era rank and status | `evaluateExplanations()` |
| Prediction accuracy against observed Conditions | `evaluatePredictionOutcomes()` |
| Belief confidence revision | Belief revision producer |
| Theory confidence evolution | Theory consolidation |
| decision outcome interpretation and retained learning | decision review and learning producers |

These authorities should remain distinct.

## Future adjudication ownership

If canonical candidate-relative test results become available, one pure
completed-Explanation evaluation step should interpret them and write only
adjudication fields on completed `OrganizationalExplanation` objects.

It must not:

- own Evidence relationships;
- rewrite Prediction Evaluation;
- replace Belief or Theory evolution;
- let a projection persist upstream truth;
- create an independently writable universal candidate store.

Runtime should persist the completed Explanation result without interpreting
it.

---

# Missing contracts

Production lacks a canonical contract that establishes all of:

1. **Test subject:** exact completed Explanation identity.
2. **Comparison scope:** exact competing Explanation identity or bounded viable
   set.
3. **Test proposition:** the required implication or discriminating claim being
   evaluated.
4. **Observed basis:** canonical Evidence and, where applicable, observed
   Condition or decision-outcome identity.
5. **Result:** supported, weakened, falsified, ruled out, confirmed, or
   inconclusive with precise non-overlapping semantics.
6. **Diagnostic meaning:** why the result differs across candidates rather than
   merely supporting a shared outcome.
7. **Materiality:** whether the result may affect viability or only confidence.
8. **Deterministic identity and ordering:** stable across replay and input
   order.

The missing contract cannot be inferred from prose such as
`falsifyingEvidence`, `reason`, `rationale`, or `distinguishingQuestions`.

---

# Phase placement

## Phase 2

Phase 2 may deterministically derive:

- comparable candidate sets;
- shared Evidence;
- direct structural support;
- narrow opposition;
- unresolved competition.

Persisting only those derived sets would restate Phase 1 structure without
enabling legitimate selection. It would add a contract and migration burden
with no adjudication consumer value. Phase 2 should therefore remain blocked
and preserve `viability: "unadjudicated"`.

## Between Phase 2 and downstream selection

A future bounded design and benchmark gate may test whether existing
Prediction and outcome contracts can express a required
Explanation-to-implication relationship without a new universal object.

That work must prove semantics before proposing schema. It may conclude that
no safe bounded extension exists.

## Longitudinal learning phase

Observed outcome confirmation and weakening naturally belong with Prediction
Evaluation, decision review, and Operating Model evolution. That later phase
may consume completed Explanation ancestry after the implication contract is
canonical. It must not be pulled forward merely to unblock Phase 2.

## Downstream consumers

Executive Assessment, recommendation, projection, and applications must not
select a current Explanation before the producer boundary is grounded.

---

# Unnecessary abstractions

This audit does not justify:

- a universal Candidate object;
- a generic Test object shared by every cognitive layer;
- a second Evidence relationship model;
- an Explanation score service;
- a separate adjudication store;
- a projection-owned standing;
- text or embedding matching between Hypotheses and Explanations;
- copying benchmark role labels or confidence constants into production;
- a new capability solely to persist comparable candidate sets.

The preferred future path remains extension of existing completed
`OrganizationalExplanation`, Prediction, and outcome contracts only if a
benchmark proves their semantic sufficiency.

---

# Recommended next step

Keep production unchanged and Phase 2 blocked.

The smallest useful next investigation is a benchmark-only implication
sufficiency gate:

1. use exact completed Explanation identity;
2. use existing Prediction Evaluation and canonical observed inputs;
3. supply no fixture-owned adjudication labels;
4. test whether current structured ancestry can prove a Prediction is a
   required and discriminating implication of one candidate;
5. require abstention whenever the implication is optional, shared,
   many-to-many, or only textually related;
6. compare the result with Runtime-only production replay;
7. identify the earliest missing producer rather than adding a shadow
   reasoning engine.

If that gate cannot derive the relationship from existing canonical inputs,
stop. Do not invent a score or production schema. Defer outcome-based
Explanation revision to the longitudinal learning phase and select a different
Discovery 2 implementation phase.

---

# Scorecard implications

This audit is architectural evidence, not benchmark improvement.

- **User Intelligence:** no measured change.
- **Organizational Intelligence:** no measured change; unsupported selection
  is explicitly prevented.
- **Collective Intelligence:** no measured change.
- **Determinism:** unchanged.
- **Runtime compatibility:** unchanged.
- **Production behavior:** unchanged.

The audit should not be reported as Explanation quality, adjudication, or
selection progress. Its value is preventing false ownership and preserving an
explicit unresolved state until a valid producer exists.

---

# Final classification

**NO VALID PRODUCER EXISTS — PHASE 2 MUST PRESERVE UNRESOLVED COMPETITION**
