# Discovery 2 Sequential Implementation Program

**Status:** Canonical execution program
**Scope:** Discovery 2 production implementation sequencing
**Authority:** Execution order, gates, rollback boundaries, and completion
criteria for Discovery 2

---

# Purpose

This document translates Discovery's validated architecture into a sequential
engineering program.

It does not redefine Product Canon, Shared Organizational Intelligence,
Structured Organizational Reasoning, Organization Runtime, Governance, the
Universal Intelligence Lifecycle, or any cognitive object. If this program
conflicts with the canon governing one of those domains, the domain canon
governs and this program must be corrected.

The program begins from the established production boundary:

- completed Organizational Explanations exist with stable identity and
  structured ancestry;
- completed Explanations remain `unadjudicated`;
- competing Explanation adjudication is benchmark validated;
- production Explanations preserve the Phase 1 candidate-specific
  `supports`, `opposes`, and `shared` Evidence roles;
- Conditions attach Explanation identities after Condition scoring;
- Executive Assessment consumes earlier Seed-based judgments;
- authority, persistence, and disclosure are distinct;
- current production authority transitions remain partly implicit.

Discovery 2 is an integration program. It is not a new architecture campaign.

The permanent project-level optimization and promotion framework for every
phase in this program is:

```text
DISCOVERY_SCORECARD.md
```

---

# Implementation philosophy

## Benchmark first

Every production change starts with a deterministic baseline, a named measured
deficiency, and a shadow or isolated replay. A benchmark authorizes a bounded
implementation target; it does not authorize adjacent architecture.

Implementation proceeds through:

```text
baseline
→ production replay
→ earliest responsible boundary
→ shadow comparison
→ one narrow production change
→ focused regression
→ complete regression
→ release checkpoint
```

## Preserve determinism

Stable identity, stable ordering, order-independent replay, bounded confidence,
and byte-stable repeated output are release requirements. Nondeterministic
providers may contribute only through existing bounded contracts with schema
validation and deterministic fallback.

## Minimize architectural complexity

Prefer extending an existing production object, relationship, producer, or
consumer. Do not create a new universal object, service, store, lifecycle, or
capability merely to make the design more symmetrical.

## Extend before expanding

Each phase must prove that the responsibility cannot be represented safely by
the current object and owner before proposing a new abstraction. Candidate
Ecology remains benchmark evidence, not a production subsystem.

## Preserve one organizational truth boundary

Organization Runtime remains the canonical technical persistence boundary.
Applications consume and contribute through canonical cognition. Providers,
projections, applications, and benchmark adapters do not own organizational
truth.

## Separate responsibilities

The program preserves these distinctions:

- Evidence ancestry versus comparative evidential role;
- persistence versus cognitive authority;
- cognitive validity versus disclosure eligibility;
- organizational understanding versus application projection;
- benchmark evidence versus production behavior;
- architectural inference versus implemented capability.

## Make migrations additive and reversible

New fields begin as optional, readers tolerate their absence, and existing
Runtime records remain loadable. A phase may not require destructive Runtime
rewrites. Backfill must be deterministic, replayable, and independently
verifiable before a new field becomes required.

## Use one canonical scorecard

Before implementation, every phase must state its **Expected Score Impact**
across the five scores defined by `DISCOVERY_SCORECARD.md`.

After focused and complete benchmark validation, every phase must state its
**Observed Score Impact** and **Regression Analysis**. Local benchmark results
must remain traceable through Capability Health to the scorecard decision.

This requirement applies to every benchmark gate and completion review in this
program. The program does not define numerical weights or replace local
pass/fail criteria.

---

# Program invariants

Every phase must preserve:

1. organization identity;
2. Evidence identity and provenance;
3. contradiction ancestry;
4. existing cognitive object identity unless the phase explicitly governs that
   identity;
5. deterministic replay and deterministic ordering;
6. bounded confidence;
7. Runtime load compatibility;
8. tenant and organization isolation;
9. existing fallback behavior;
10. the separation of cognition, Governance, projection, and application
    responsibilities.

A phase stops if it requires a new cognitive primitive that its benchmark did
not prove necessary.

---

# Sequential implementation phases

## Phase 0 — Program baseline and release harness

### Objective

Freeze the accepted production and benchmark baseline used to evaluate every
Discovery 2 phase.

### Architectural rationale

The benchmark campaign established the architecture, but implementation still
needs one reproducible release comparison. Without a fixed baseline, later
movement cannot be attributed to a bounded production change.

### Production changes

None.

### Affected Runtime objects

None. Canonical Atlas and Northstar Runtime fixtures remain read-only
validation inputs.

### Affected capabilities

No capability behavior changes. The existing Capability Registry and
architecture validation remain authoritative.

### Migration strategy

No migration.

### Benchmark gates

- record the exact baseline commands, scores, hashes, fixture hashes, accepted
  warnings, and accepted architecture findings;
- require repeated-run and reversed-order equality where supported;
- distinguish passing checks from accepted pre-existing failures.

### Rollback criteria

Not applicable. If baseline reproduction fails, stop the program and restore
the last known clean validation state before beginning Phase 1.

### Completion criteria

- one reproducible baseline manifest exists;
- canonical fixtures are unchanged after execution;
- current accepted architecture status is recorded accurately;
- no production behavior changes.

### Documentation updates

Update project state and the benchmark handoff with the baseline identifier.
Do not regenerate architecture artifacts unless separately required.

---

## Phase 1 — Comparative Evidence roles on completed Explanations

**Status:** Complete — active in normal forward Runtime evolution

The canonical production contract for this phase is:

```text
COMPARATIVE_EVIDENCE_ROLES_CONTRACT.md
```

### Objective

Preserve the minimum deterministic, candidate-specific role that existing
Evidence plays when completed Organizational Explanations are compared.

### Architectural rationale

Production already preserves Explanation ancestry. Ancestry answers where an
Explanation came from; it cannot tell an adjudicator whether the same Evidence
supports, opposes, discriminates among, corroborates, revises, or is shared by
specific alternatives. This is the smallest missing production boundary.

### Production changes

- extend the existing completed-Explanation construction boundary or its
  existing structured relationships to retain comparative Evidence roles;
- derive roles only from canonical structured inputs;
- preserve existing Evidence and Explanation identities;
- do not add a new Evidence object, candidate object, reasoning pipeline, or
  universal role engine;
- do not change adjudication, Conditions, State, Assessment, recommendations,
  or projections in this phase.

The exact field location is an implementation decision. The preferred shape is
an additive extension to an existing Explanation relationship or ancestry
contract, not a new top-level cognitive primitive.

### Affected Runtime objects

- `OrganizationRuntime.memory.organizationalExplanations`;
- existing completed `OrganizationalExplanation` relationship or ancestry
  representation;
- existing Explanation completion failures only if role formation cannot be
  completed safely.

No other Runtime object should change.

### Affected capabilities

- CAP-UND-003 Organizational Theory Formation, only if its existing structured
  output is the earliest valid role source;
- existing completed-Explanation construction at the judgment boundary;
- CAP-MEM-001 Organizational Runtime Persistence for additive compatibility.

No new Capability Registry entry is expected.

### Migration strategy

1. add optional role data;
2. load old Runtime records without role data;
3. deterministically derive roles during a normal replay when structured
   ancestry is sufficient;
4. leave a role absent rather than infer it lexically;
5. require forward and backward serialization compatibility;
6. do not bulk-rewrite canonical Runtime fixtures.

### Benchmark gates

- exact candidate targeting;
- source independence;
- shared-source recognition;
- exact `supports`, `opposes`, and `shared` role correctness;
- explicit exclusion of discrimination, decisive falsification,
  counterfactual, outcome, and rule-out semantics;
- contradiction preservation;
- duplicate and irrelevant Evidence invariance;
- reversed Evidence and source order equality;
- repeated-run byte equality;
- stable Evidence, Explanation, and organization identities;
- unchanged Conditions through Executive Projection.

### Rollback criteria

Roll back if:

- role assignment requires lexical matching or expected-answer labels;
- existing identities change;
- role order affects output;
- duplicate records create additional independent support;
- any downstream production output changes;
- old Runtime records cannot be loaded unchanged.

### Completion criteria

- completed Explanations expose the minimum validated role information;
- missing roles remain explicit absence, not guessed meaning;
- production output outside the Explanation contract is unchanged;
- all focused and complete regressions pass;
- no new universal abstraction is introduced.

### Documentation updates

Update the Cognitive Object Model, Cognitive Flow Map, Runtime validation,
capability audit, project state, and next-chat handoff with the exact owner and
migration behavior.

### Completion report

Production owner:

```text
completeOrganizationalExplanations()
```

Implemented contract:

- optional nested `comparativeEvidenceRoles`;
- bounded Evidence identity and direct `contradicts` relationship context;
- deterministic `supports`, `opposes`, and `shared`;
- normal forward materialization through `evolveOrganizationRuntime()`;
- historical missing-field compatibility;
- no bulk Runtime migration;
- no downstream consumer.

Focused benchmark:

```text
Comparative Evidence Roles Production Gate — 20/20 PASS
```

Runtime validation confirms normal field materialization, stable identity,
unchanged downstream output, deterministic replay, and organization isolation.
A representative forward evolution produced explicit empty role collections
because its completed Seeds had no qualifying direct Seed Evidence references;
the focused production benchmark separately validates non-empty assignments.

Scorecard:

```text
Expected
Organizational Understanding  no immediate measurable movement
User Intelligence             unchanged
Collective Intelligence       unchanged
Governance Integrity          unchanged or newly supported
System Sustainability         unchanged

Observed
Organizational Understanding  representation enabled; not yet scored
User Intelligence             unchanged
Collective Intelligence       unchanged
Governance Integrity          explicit traceable semantics newly supported;
                              not yet numerically measurable
System Sustainability         unchanged
```

Regression disposition: no unacceptable Governance Integrity or System
Sustainability regression. Phase 1 is complete. Phase 2 remains separately
gated.

---

## Phase 2 — Completed Explanation adjudication

**Status:** Conditional responsibility; contract designed; production
activation blocked

The canonical production contract and current missing-semantic gate are
defined by:

```text
COMPLETED_EXPLANATION_ADJUDICATION_CONTRACT.md
```

### Objective

Apply the validated competing-Explanation adjudication policy to production
completed Explanations while preserving alternatives, abstention, revision,
and deterministic identity.

### Architectural rationale

Adjudication is already validated in benchmark shadow. It may enter production
only after Phase 1 supplies equivalent structured comparative roles without
fixture-owned labels.

### Production changes

- adapt the validated adjudication policy to production completed
  Explanations;
- extend existing Explanation viability, confidence, or revision information
  only as required by the validated policy;
- preserve losing and unresolved Explanations;
- support abstention when Evidence does not justify a leader;
- do not change downstream consumers in this phase.

### Affected Runtime objects

- `OrganizationRuntime.memory.organizationalExplanations`;
- existing Explanation history or revision representation, if already
  available and sufficient;
- no Condition, State, Assessment, recommendation, or application object.

### Affected capabilities

- completed-Explanation construction and evaluation within the existing
  Understanding/Judgment ownership boundary;
- CAP-MEM-001 for durable, compatible persistence;
- CAP-LRN-001 only if existing revision behavior is explicitly reused, not
  duplicated.

### Migration strategy

Existing `unadjudicated` Explanations remain valid. Adjudication occurs on
replay or new evidence; no historical leader is fabricated. New disposition
data is additive until complete replay and rollback validation pass.

### Benchmark gates

- parity with the validated `34/34` shadow behaviors;
- exact competing sets and leader identity;
- correct abstention;
- correct confidence direction;
- contradiction and counterevidence preservation;
- reversed-order and repeated-run equality;
- no unrelated Explanation movement;
- unchanged downstream production output.

### Rollback criteria

Roll back if production inputs cannot reproduce the shadow result, a loser is
deleted, abstention is suppressed, confidence becomes unbounded, or downstream
behavior changes before authorization.

### Completion criteria

- production Explanations can be adjudicated deterministically;
- the authority state is explicit and reproducible;
- alternatives and uncertainty remain available;
- no downstream consumer has changed;
- old Runtime records remain loadable.

### Documentation updates

Record the canonical adjudication owner, lifecycle transitions, persistence
behavior, and the continuing downstream non-consumption boundary.

### Contract decision

Current production can identify comparable Explanations and preserve
`supports`, `opposes`, and `shared` structure. It cannot canonically derive
discrimination, falsification, rule-out, counterfactual comparison, or
Explanation-targeted observed-outcome confirmation or weakening.

The `34/34` completed-Explanation shadow depends on benchmark-owned forms of
those semantics and benchmark-owned confidence constants. Phase 2 must not
copy them into production.

Production implementation is blocked pending a structured,
candidate-relative Explanation test-result contract with an existing canonical
producer. Until that contract exists, completed Explanations remain
`unadjudicated`, unresolved alternatives are preserved, and no leader,
confidence, rank, or viability transition is authorized.

### Sequential-program amendment

Unresolved competition is a valid state of organizational understanding.
Adjudication is conditional rather than a universal prerequisite for reusable
Organizational Understanding.

A completed Explanation may contribute to one bounded Understanding shadow
while remaining `unadjudicated`, provided the shadow preserves every relevant
alternative and exact ancestry, distinguishes `supports`, `opposes`, and
`shared`, makes uncertainty explicit, and creates no rank, selection,
candidate-relative confidence, falsification, rule-out, outcome confirmation,
or authority transition.

Phase 2 adjudication may activate only when a canonical producer supplies a
structured candidate-relative result. That result may eventually arise from a
candidate-specific test or experiment, a required
Explanation-to-Prediction implication, an intervention response, an observed
outcome, or later contradiction or longitudinal Evidence. Phase 7 is the most
likely owner of longitudinal outcome-based testing and revision, but
adjudication is not permanently assigned to Phase 7 if an earlier canonical
producer later satisfies the Phase 2 gate.

---

## Phase 3 — One unadjudicated Explanation-aware understanding consumer

**Status:** Read-only, non-authoritative CAP-UND-006 shadow complete;
classification A; canonical production consumption not activated

### Objective

Evaluate whether exactly one existing Organizational Understanding boundary
can use completed, unadjudicated Explanations to improve reusable
organizational understanding without selecting or ranking an Explanation.

### Architectural rationale

Production value is not established when cognition is merely persisted.
One narrow shadow may test whether exact ancestry, comparative Evidence roles,
preserved alternatives, and explicit uncertainty improve useful
Organizational Understanding without waiting for unsupported adjudication.
The shadow is an explicit exception to the former strict Phase 2 dependency;
it does not claim that Phase 2 is complete.

### Production changes

1. implement one deterministic shadow at the CAP-UND-006 Organizational
   Understanding boundary;
2. consume completed Explanations as read-only inputs;
3. use only stable identity, scope, ancestry, `supports`, `opposes`, `shared`,
   and explicit unresolved state;
4. compare the shadow with the current assessment-derived Understanding path;
5. persist nothing and leave canonical output unchanged;
6. preserve exact fallback by removing or disabling the shadow;
7. do not broaden consumption or activate a new owner in the same change.

Executive Assessment remains downstream in the target architecture and must
not become the owner of universal organizational truth.

### Affected Runtime objects

- `organizationalExplanations` as a read-only input;
- no Runtime write;
- no change to `organizationalUnderstandingState`, `executiveAssessment`, or
  any other persisted object;
- no new top-level Runtime object.

### Affected capabilities

- CAP-UND-006 Executive Understanding Synthesis as the sole shadow boundary;
- existing Explanation producer as an upstream dependency;
- no CAP-UND-005 ownership or behavior change;
- no new capability.

### Migration strategy

No migration. Historical Explanations without comparative roles remain valid
and must be represented as role data unavailable, not as explicit empty
support or resolved competition. The shadow writes nothing, and removal
requires no Runtime repair or historical backfill.

### Benchmark gates

- measurable improvement in at least one Organizational Understanding research
  dimension, reported as a positive hypothesis until observed;
- exact comparable sets, ancestry, role assignments, and unresolved
  alternatives;
- explicit distinction between unavailable role data and present empty roles;
- no rank, leader, candidate-relative confidence, viability movement,
  falsification, rule-out, counterfactual discrimination, outcome
  confirmation, or candidate-specific missing-Evidence prescription;
- repeated and reversed-order byte equality;
- organization isolation, duplicate resistance, and irrelevant-Evidence
  invariance;
- zero Runtime writes and byte-identical canonical output;
- no regression in Judgment, Decision, Evolution, Simulation, communication,
  or interaction suites;
- fallback output exactly matches the previous production baseline;
- Runtime replay and serialization equality.

### Rollback criteria

Remove or disable the shadow if semantic improvement is absent, any production
output moves, alternatives or ancestry are lost, unavailable roles are
misrepresented, unsupported authority semantics appear, determinism fails, or
fallback equality is lost.

### Completion criteria

- one CAP-UND-006 shadow reads unadjudicated completed Explanations;
- a measured Organizational Understanding improvement is demonstrated;
- canonical Understanding, Executive Assessment, Runtime, recommendation,
  projection, and application output remain unchanged;
- fallback restores the previous output exactly;
- no consumer activation, persistence, or application migration occurs;
- User Intelligence, Collective Intelligence, and Local Understanding Utility
  remain unclaimed.

### Observed result

The focused deterministic gate passed all 15 required scenarios and classified
the shadow:

```text
A — Shadow demonstrates bounded Understanding improvement
```

The result demonstrates bounded improvement in reusable Explanation
traceability, Evidence integration, unresolved-alternative preservation, and
uncertainty representation. It does not complete Phase 2, activate the shadow,
change the canonical Understanding producer, or authorize Phase 4. The shadow
is not invoked by Runtime and persists nothing.

Expected Scorecard effect:

```text
Organizational Understanding  + hypothesis only
User Intelligence             unchanged
Collective Intelligence       unchanged
Governance Integrity          protected
System Sustainability         unchanged
```

Deferred semantics:

- candidate-relative confidence;
- ranking, leader, or preferred Explanation selection;
- viability transitions and weakening as an authority state;
- falsification, rule-out, and counterfactual discrimination;
- observed-outcome confirmation;
- required Explanation-to-Prediction implications;
- candidate-specific missing-Evidence prescriptions;
- structural retirement;
- longitudinal Explanation revision and adjudication history;
- application disclosure behavior.

### Documentation updates

Record the shadow benchmark, unchanged ownership, unchanged canonical output,
rollback boundary, and whether the hypothesis earned a later activation
proposal.

---

## Phase 4 — Understanding ownership convergence

**Completion status:** Phase 4C complete; Classification A. Category A
reference-only composition is the canonical production owner. Existing
assessment-derived outputs remain as bounded compatibility views while
consumers migrate.

### Objective

Move remaining relevant understanding composition onto the proven Explanation
boundary without creating parallel organizational truth.

### Architectural rationale

Phase 3 proves one consumer. Only then can Discovery reconcile the current
Assessment-derived final Understanding with the platform rule that Executive
Assessment is a downstream projection.

For this amended sequence, “proves one consumer” meant that the Phase 3 shadow
had to demonstrate measurable Organizational Understanding improvement and
pass all noninterference gates. That prerequisite was satisfied before Phase
4C activation; the shadow itself did not activate or replace the canonical
consumer.

The Phase 4B compatibility shadow demonstrated stable composition and revision
identity, exact Explanation membership, reference-based trace resolution,
historical compatibility, application independence, and no duplicated
Explanation ownership. It did not demonstrate Category A derivation of current
assessment, recommendation, communication, projection, or product semantics.
Those outputs remained byte-identical only through a temporary adapter
classified as a legacy assumption.

Phase 4C accepted that bounded adapter as the migration boundary rather than
as a second truth owner. Canonical compositions now persist once in
Organizational Understanding State; Executive Assessment consumes them while
retaining its existing output contract, and `currentUnderstandings` remains a
deprecated compatibility view. The ownership gate passes `14/14` with exact
rollback and downstream noninterference.

### Production changes

- trace remaining Seed-judgment and assessment-derived understanding paths;
- migrate one producer-consumer edge at a time;
- make Organizational Understanding reusable by executive and future
  applications;
- retain application-specific Assessment and communication composition;
- remove duplicate reasoning only after exact fallback and migration evidence.

### Affected Runtime objects

- `organizationalUnderstandingState`;
- `executiveAssessment` as a downstream consumer;
- `organizationalExplanations` as the authoritative explanatory input;
- no new organizational truth store.

### Affected capabilities

- CAP-UND-006 Executive Understanding Synthesis, with its ownership language
  updated if necessary;
- CAP-UND-005 Executive Assessment as a downstream consumer;
- related projection capabilities only as unchanged consumers.

### Migration strategy

Use consumer-by-consumer dual reads. Preserve stored identities and add
compatibility adapters at the boundary. Remove legacy composition only after
all canonical consumers have moved and historical Runtime replay passes.

### Benchmark gates

- organizational-understanding semantic fidelity;
- executive Assessment equivalence or justified improvement;
- no duplicate reasoning;
- exact projection fallback;
- historical Runtime replay;
- application-independent reuse in at least one non-executive test fixture,
  without adding a new application.

### Rollback criteria

Roll back a consumer independently if meaning changes outside the validated
scope, executive outputs lose required information, or shared Understanding
becomes coupled to application wording.

### Completion criteria

- Organizational Understanding has one canonical composition owner;
- Executive Assessment is demonstrably downstream;
- no application creates independent organizational truth;
- legacy duplicate composition is removed or explicitly deprecated.

### Documentation updates

Update Product Canon references, Shared Organizational Intelligence, the
Cognitive Architecture Index, capability ownership, and Runtime validation.

### Phase 4C result

Classification A. Organizational Understanding has one canonical composition
owner, completed Explanations retain explanatory truth, and Executive
Assessment is downstream. Compatibility adapters remain intentionally until
their consumers migrate; they do not constitute parallel organizational
truth.

---

## Phase 5 — Explicit authority transitions and Contribution Validation

**Status:** Phases 5A and 5B complete. Explicit authority transitions and the
disclosure/revocation enforcement contract are active. Application enforcement
and durable revocation remain blocked; Phase 6 remains blocked.

### Objective

Make existing source admission, cognitive promotion, persistence eligibility,
and disclosure enforcement explicit at their current boundaries.

### Architectural rationale

The benchmark campaign established Contribution Validation as an
architectural responsibility and showed that persistence, authority, and
disclosure cannot be collapsed. This phase operationalizes those distinctions
without creating a second reasoning system.

### Production changes

- define explicit decisions at existing contribution, promotion, persistence,
  provider, and projection boundaries;
- connect those boundaries to the canonical Governance decision model;
- preserve epistemic lineage separately from governance lineage;
- fail closed for security-sensitive ambiguity;
- do not make Governance infer organizational truth.

### Affected Runtime objects

Runtime may retain stable references needed to reproduce cognitive lineage.
Governance authority, policy, membership, and temporal permission do not move
into Organization Runtime. No parallel organizational truth store is created.

### Affected capabilities

- CAP-PER-001 Evidence Ingestion;
- CAP-MEM-001 Runtime Persistence;
- existing provider and projection boundaries;
- existing cognition capabilities as governed consumers, not policy owners.

### Migration strategy

Introduce observe-only decisions first, compare them with current behavior,
then enforce one boundary at a time. Existing permitted behavior remains the
fallback only where doing so is safe. Security-sensitive denial cannot fall
back open.

### Benchmark gates

- Contribution Validation cases;
- strict noninterference and permitted sanitized influence;
- purpose limitation;
- source, claim, identity, and aggregation sensitivity;
- revocation and context-exit behavior;
- multi-turn inference and triangulation resistance;
- no change to cognition when the same Evidence is permitted;
- reproducible decisions across policy versions.

### Rollback criteria

Stop enforcement if boundaries disagree, Governance changes cognitive meaning,
denied data reaches cognition or a provider, historical truth is rewritten, or
revocation cannot invalidate future use.

### Completion criteria

- every implemented boundary has one decision authority and one enforcement
  owner;
- contribution, persistence, authority, and disclosure are auditable and
  distinct;
- permitted cognition is unchanged;
- denied or sanitized paths meet noninterference requirements.

### Documentation updates

Update Governance Architecture, Object Model, Behavioral Model, security and
tenancy references, Runtime boundaries, and capability traces.

### Phase 5A result

Classification A. The existing completed-Explanation and canonical
Organizational Understanding boundary now records separate, deterministic
decisions for contribution admission, cognitive use, canonical composition
eligibility, persistence eligibility, authority disposition, and disclosure
eligibility. Authority is not inferred from persistence, confidence,
recommendation, rank, adjudication, permissions, or policy.

This is not the completion of full Phase 5 Governance enforcement. Disclosure
remains explicitly unevaluated at the application boundary, and no permission,
purpose, revocation, policy-version, provider-enforcement, or scoped-cognition
contract was introduced. Those responsibilities remain sequentially gated.

### Phase 5B result

The minimum production disclosure contract is implemented and passes its
focused `14/14` gate. An already-resolved decision may disclose or suppress
authorized canonical compositions for an exact organization and consumer.
Withholding and revocation affect future reads only; canonical truth,
provenance, historical Runtime, and prior disclosure history remain unchanged.

Activation is blocked because no canonical production owner currently resolves
consumer disclosure decisions or persists append-only revocation history.
Applications and projections may not infer eligibility. Phase 5B introduces no
permissions, membership, policy engine, Governance Control Plane, provider
integration, or Intelligence Scope.

---

## Phase 6 — Bounded Intelligence Scope implementation

### Objective

Support one bounded organizational context as a governed view into the same
Organizational Intelligence.

### Architectural rationale

Scopes require working authority and disclosure enforcement. They cannot
precede Phase 5 and must not create nested Runtimes or context-specific
reasoning engines.

### Production changes

- implement one validated scope boundary using existing organization identity,
  cognition, and Runtime;
- apply context and purpose to contribution, retrieval, reasoning eligibility,
  and projection;
- preserve local meaning and prevent unsupported generalization;
- allow only validated sanitized influence across the boundary.

### Affected Runtime objects

Existing objects may receive bounded context references only where required.
No second Runtime, intelligence store, or scope-specific cognitive object is
introduced.

### Affected capabilities

Existing Perception, Understanding, Memory, and projection capabilities remain
the owners. Governance supplies eligibility decisions; applications supply
scope-specific interaction and vocabulary.

### Migration strategy

Start with one organization and one bounded context. Existing organization-wide
behavior remains unchanged when no scope is supplied. Add no generalized
cross-scope synthesis in this phase.

### Benchmark gates

- contextual claim validity;
- generalization discipline;
- local noninterference;
- sanitized influence;
- membership revocation and context exit;
- organization isolation;
- path, contradiction, duplicate-derivation, and processing-growth limits.

### Rollback criteria

Disable scoped operation if it creates independent truth, changes unscoped
behavior, leaks restricted Evidence, loses local contradiction, or exhibits
unbounded context complexity.

### Completion criteria

- one bounded scope operates through existing cognition and Runtime;
- unscoped behavior remains identical;
- visibility and cognitive truth remain distinct;
- no cross-scope synthesis is implied.

### Documentation updates

Update Shared Organizational Intelligence, Governance, Runtime validation, and
the application contract using the first scope.

---

## Phase 7 — Longitudinal outcome revision

### Objective

Use existing decisions, predictions, experiments, reviews, and outcomes to
revise completed Explanations and Organizational Understanding over time.

Phase 7 may produce structured candidate-relative testing and revision
Evidence when exact Explanation-to-implication ancestry exists. It does not
automatically adjudicate every Explanation, and unresolved competition remains
valid when outcomes do not discriminate.

### Architectural rationale

Discovery becomes more intelligent only when later outcomes can strengthen,
weaken, contradict, or leave prior understanding unchanged. This phase closes
the validated learning loop after Explanation authority and Governance are
stable.

### Production changes

- connect existing outcome evaluation to completed Explanation revision;
- preserve prior versions and ancestry;
- distinguish observed association from demonstrated causality;
- reuse existing belief, prediction, and learning behavior;
- do not introduce a universal lifecycle object.

### Affected Runtime objects

- existing prediction evaluations and reflections;
- executive decision records, work, review, and outcome records;
- organizational Explanations, Beliefs, and Understanding history;
- organizational learning profile.

### Affected capabilities

- CAP-ADP-001 Prediction Outcome Evaluation;
- CAP-PRD-002 Prediction Reflection;
- CAP-LRN-001 Organizational Belief Evolution;
- CAP-LRN-002 Organizational Learning Profile;
- existing Explanation and Understanding producers.

### Migration strategy

New outcome links apply prospectively. Historical outcomes are linked only when
stable identities and sufficient provenance exist; absence remains explicit.
All revisions are additive and reconstructable.

### Benchmark gates

- correct strengthening, weakening, contradiction, and no-change behavior;
- temporal ordering and replay determinism;
- no retrospective fabrication;
- preserved historical versions;
- bounded confidence;
- stable unrelated cognition;
- decision and prediction identity continuity.

### Rollback criteria

Stop if correlation is promoted to causality, prior cognition is overwritten,
outcome timing changes replay, unrelated Explanations move, or historical
reconstruction fails.

### Completion criteria

- at least one end-to-end outcome revises existing Understanding correctly;
- every revision is traceable to prior cognition and observed outcome;
- unchanged outcomes do not create artificial learning;
- the learning profile reflects the same canonical event.

### Documentation updates

Update the Universal Intelligence Lifecycle, Learning and Adaptation
architecture, Object Model, Runtime validation, and longitudinal benchmark
baseline.

---

## Phase 8 — Application projection and Alpha integration

**Status:** Phase 8A partial Runtime-backed `Your Organization` integration
complete as an explicitly authorized product-validation exception. It does not
activate Phase 6 or resume broader Phase 5 Governance.

### Objective

Expose shared Organizational Understanding through existing application
experiences and connect one deterministic Alpha lifecycle to Runtime-backed
production objects.

### Architectural rationale

Applications come last because they consume cognition; they do not establish
its truth or authority. Projection should expose validated intelligence without
recreating reasoning.

### Production changes

- migrate one application workflow at a time to canonical view models;
- connect the Alpha lifecycle to existing Runtime objects and actions;
- preserve application-specific interaction, copy, and progressive disclosure;
- keep reasoning, confidence, Governance, and persistence out of UI code;
- retain fixture fallback until Runtime-backed parity is proven.

### Affected Runtime objects

Read and write only through existing application and Runtime contracts for
Understandings, recommendations, decisions, simulations, work, outcomes, and
learning. No UI-owned persistence is introduced.

### Affected capabilities

Existing Executive Projection, Executive Communication, decision, simulation,
conversation, and product interaction capabilities remain canonical owners.
No application-specific cognition is added.

### Migration strategy

Use route- or experience-level opt-in, view-model parity snapshots, and
fixture-backed rollback. Migrate one complete lifecycle before a second
application or domain.

### Benchmark gates

- Product Interaction Boundary;
- Living Interaction Loop;
- Executive Collaboration, Decision, Simulation, and Communication;
- exact view-model projection;
- Governance disclosure correctness;
- end-to-end Runtime identity continuity;
- accessibility, performance, and deterministic rendering.

### Rollback criteria

Return the experience to the existing fixture or projection path if UI code
reasons, Runtime identity is recreated, private meaning is exposed,
application output diverges without a canonical producer change, or the
complete lifecycle cannot be replayed.

### Completion criteria

- one full application lifecycle consumes and contributes through canonical
  Runtime and cognition;
- no duplicate truth or reasoning exists in the application;
- a participant can see what changed, why, how certain Discovery is, and what
  remains unknown;
- fixture fallback can be retired only after production parity.

### Documentation updates

Update Product Canon implementation status, frontend and view-model
architecture, Alpha specifications, Runtime validation, project state, and
deployment handoff.

### Phase 8A result

The existing route already loaded persisted Runtime, but its primary view model
depended on the assessment-derived `currentUnderstandings` compatibility view.
Phase 8A adds a read-only adapter for canonical compositions, completed
Explanations, uncertainty, Conditions, Organizational State, investigation
opportunities, learning changes, and model evolution.

The integration is partial. Canonical Evidence bodies are not persisted, and
the completed-Explanation contract does not require human-readable claim
prose. Those sections report `Runtime not yet available`. No cognition,
Runtime schema, capability, benchmark object, research object, or product
interaction architecture was added.

---

# Dependency graph

```text
Phase 0  Baseline and release harness
   ↓
Phase 1  Comparative Evidence roles
   ↓
Phase 2  Conditional completed Explanation adjudication
   ├── blocked until canonical candidate-relative Evidence exists
   ↓ explicit authorized exception
Phase 3  Unadjudicated Explanation-aware Understanding shadow
   ↓
Phase 4  Understanding ownership convergence
   ↓
Phase 5  Authority and Contribution Validation
   ↓
Phase 6  One bounded Intelligence Scope
   ↓
Phase 7  Longitudinal outcome revision
   ↓
Phase 8  Application projection and Alpha integration
```

The production chain is intentionally serial. Each phase changes the evidence
available to the next phase or establishes the boundary required to enforce it.

## Work that may proceed in parallel

After the preceding phase contract is frozen, the following supporting work
may run in parallel:

- focused benchmark fixtures and scoring;
- migration dry-run tooling;
- observability and comparison reports;
- documentation updates;
- application view-model parity fixtures for a later authorized phase;
- performance and context-complexity measurement.

Parallel work must not modify the production owner before its phase is
authorized.

## Work that may not be parallelized

- Phase 2 production adjudication before Phase 1 role parity;
- Phase 3 canonical production consumption before either Phase 2 authority is
  reproducible or the unadjudicated shadow independently earns a later
  activation proposal;
- Phase 4 ownership convergence before one consumer proves value;
- Phase 6 scoped cognition before Phase 5 Governance enforcement;
- Phase 8 Runtime-backed application integration before its cognitive and
  disclosure contracts are stable.

Phase 7 benchmark preparation may begin after Phase 3, but production outcome
revision must wait until Phases 4 and 5 establish canonical understanding and
authority boundaries.

---

# Production boundaries

## Production implementation

Production implementation changes canonical objects, producers, consumers,
Runtime persistence, Governance enforcement, or application behavior. It
requires a migration plan, fallback, focused regression, complete regression,
and documentation update.

## Benchmark-only work

Benchmark-only work may construct fixtures, adapters, shadows, scorers, and
comparison reports. It must not persist to Runtime, mutate canonical fixtures,
become an application dependency, or be represented as a platform capability.

## Architectural inference

Architectural inference explains the smallest likely owner or contract
suggested by evidence. It does not authorize a schema, capability, service,
store, or lifecycle.

Current inferences include:

- comparative roles likely belong on an existing structured relationship;
- a common authority vocabulary may coexist with object-specific lifecycles;
- Contribution Validation spans several boundaries rather than one universal
  filter.

Each remains provisional until its implementation phase proves the boundary.

## Future research

The following remain outside this program until a measured production need
authorizes them:

- universal candidate objects or Candidate Ecology infrastructure;
- generalized cross-scope synthesis;
- autonomous intelligence acquisition;
- new AI providers or agent architecture;
- a second Runtime or shared-intelligence store;
- self-modifying cognition or architecture;
- generalized connector orchestration;
- historical Mechanism merge, split, retirement, reactivation, and
  supersession unless a phase benchmark requires them.

---

# Validation strategy

## Deterministic benchmark gates

Every phase requires:

- repeated-run byte equality;
- reversed-input equality where input ordering is not semantic;
- stable organization and cognitive object identities;
- deterministic tie-breaking and ordering;
- bounded confidence;
- duplicate, irrelevant, and unrelated-change invariance;
- explicit abstention where Evidence is insufficient;
- deterministic fallback equality.

## Runtime validation

Every Runtime-affecting phase requires:

- old Runtime load compatibility;
- new Runtime round-trip equality;
- organization isolation;
- canonical Atlas and Northstar fixture hash preservation unless a separately
  approved migration owns them;
- no benchmark persistence;
- no hidden application or provider writes;
- history and ancestry reconstruction.

## Migration validation

Each migration must prove:

- additive introduction before required use;
- deterministic backfill where backfill is warranted;
- explicit absence where derivation is unsafe;
- forward and backward reader compatibility;
- idempotence;
- dry-run reporting;
- bounded rollback;
- no identity regeneration.

## Regression validation

Each phase runs:

1. the focused phase benchmark;
2. the earliest upstream producer regression;
3. every downstream canonical benchmark;
4. Ground Truth and semantic-trace checks;
5. Operating Model Evolution;
6. Executive Decision and order independence;
7. Executive Simulation;
8. Executive Collaboration and communication;
9. Evidence provenance and independence;
10. cognition validation;
11. architecture validation;
12. typecheck and build;
13. `git diff --check`.

Accepted pre-existing failures must be reported, not repaired opportunistically
or represented as passing.

---

# Discovery 2 success criteria

Discovery 2 succeeds when intelligence improves at three connected levels
without creating separate intelligence systems.

## User Intelligence

User Intelligence is the useful, governed understanding available to one
authorized participant in the current context.

Measure:

- relevance to the participant's stated objective;
- semantic fidelity and explanatory clarity;
- visible uncertainty, contradiction, and provenance;
- usefulness of the next question, decision, or action;
- continuity across interactions;
- correct scope and disclosure;
- time and reading required to reach warranted understanding;
- trust calibration rather than confidence inflation.

Success means a participant can understand what Discovery believes, why,
within what scope, how certain it is, and what would change the conclusion.

## Organizational Intelligence

Organizational Intelligence is the quality and durability of Discovery's
governed Organization Model.

Measure:

- Ground Truth and causal fidelity;
- Evidence provenance and independent corroboration;
- competing Explanation preservation and adjudication;
- contradiction retention and belief revision;
- stable identity and historical reconstruction;
- reduction in unresolved material uncertainty;
- correct outcome-based strengthening, weakening, and no-change;
- reuse across applications without duplicate truth;
- deterministic evolution over time.

Success means new governed Evidence and outcomes improve the Organization Model
without erasing context, alternatives, lineage, or prior state.

## Collective Intelligence

Collective Intelligence is the additional useful understanding created when
multiple authorized contributions are combined without treating volume,
seniority, or access as truth.

Measure:

- independent-source contribution versus duplicate repetition;
- preservation of local and conflicting perspectives;
- valid cross-participant corroboration;
- resistance to cumulative inference and triangulation;
- permitted sanitized influence without raw-data leakage;
- purpose-limited contribution and retrieval;
- value gained from additional participants or contexts;
- context-complexity, duplicate-derivation, contradiction-growth, and
  processing-growth bounds.

Success means the combined understanding is more useful than isolated
contributions while remaining contextual, governed, explainable, and
non-coercive.

## Program-level success

The program is complete when:

- completed Explanations have explicit, evidence-grounded production authority;
- Organizational Understanding has one canonical composition owner;
- Executive Assessment and applications consume rather than recreate that
  understanding;
- Contribution Validation and Governance enforce distinct authority and
  disclosure boundaries;
- one bounded scope and one longitudinal outcome loop work through existing
  cognition and Runtime;
- one application lifecycle is Runtime-backed end to end;
- User, Organizational, and Collective Intelligence improve on deterministic
  benchmarks without accepted-regression debt;
- no unnecessary universal abstraction has been introduced.

---

# Smallest meaningful Phase 1

The smallest production step is:

> Add optional, deterministic comparative Evidence-role information to
> existing completed Organizational Explanations, with no downstream consumer.

Its boundary is deliberately narrow:

- one existing producer;
- one existing persisted object;
- no new cognitive primitive;
- no adjudication activation;
- no Condition, State, Assessment, recommendation, projection, or application
  change;
- old Runtime compatibility;
- exact fallback through role absence;
- focused role-formation benchmark plus complete regression.

This creates meaningful progress because it removes the only identified
production-data gap blocking the already validated completed-Explanation
adjudication. It minimizes risk because it changes representation before
authority or behavior.

If comparative roles cannot be derived from canonical structured inputs, Phase
1 ends without a production change. Discovery must not substitute lexical
inference, hidden labels, or a new universal abstraction.

---

# Program governance

Each phase requires separate authorization. A phase review must report:

1. baseline;
2. measured deficiency;
3. exact production owner;
4. migration and fallback;
5. focused and complete validation;
6. changed Runtime and capability contracts;
7. rollback readiness;
8. documentation synchronization;
9. remaining deferred work.
10. Expected Score Impact;
11. Observed Score Impact;
12. Regression Analysis and guardrail disposition under
    `DISCOVERY_SCORECARD.md`.

Completion of one phase authorizes planning for the next phase. It does not
authorize implementation of the next phase.
