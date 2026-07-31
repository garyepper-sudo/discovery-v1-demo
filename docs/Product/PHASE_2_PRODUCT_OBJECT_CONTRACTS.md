# Discovery Phase 2 Product Object Contracts

**Status:** Canonical contract specification; implementation remains gated
**Conceptual authority:** [ORGANIZATIONAL_UNDERSTANDING_MODEL.md](./ORGANIZATIONAL_UNDERSTANDING_MODEL.md)
**Acceptance authority:** [PHASE_2_PRODUCT_ACCEPTANCE_SPEC.md](./PHASE_2_PRODUCT_ACCEPTANCE_SPEC.md)
**Architecture:** [CANONICAL_PRODUCT_ARCHITECTURE.md](./CANONICAL_PRODUCT_ARCHITECTURE.md)

## 1. Purpose, authority, and boundary

This document governs the Phase 2 product objects that inspect, qualify,
improve, test, or revise organizational understanding. It resolves product
semantics where current canon is sufficient and explicitly gates decisions
that still require implementation review or benchmark evidence.

Lower-level object architecture, implementation, and presentation may refine
this contract but may not contradict it. This document does not change Runtime
schemas, create cognition, activate Production behavior, or make an internal
engine artifact a product object merely because names are similar.

> Organizational understanding is Discovery's conceptual persistent state.
> Phase 2 product objects are governed operations and records that inspect,
> qualify, improve, test, or revise that state.

```text
Organizational Understanding
        ↓
Question
        ↓
Answer
        ↓
Confidence and Unknowns
        ↓
Confidence-Improvement Operation
        ↓
Recommendation
        ↓
Decision
        ↓
Outcome
        ↓
Learning Event
        ↓
Insight
        ↓
Updated Organizational Understanding
```

This is a product workflow and relationship model. It does not replace the
canonical internal cognitive chain.

## 2. Current object audit

| Object | Existing implementation | Contract status | Governing conclusion |
|---|---|---|---|
| Answer | `ProductAnswer` / `ProductAnswerAbstention` selection plus version-2 immutable Answer events and operation receipts | `canonical-existing` Phase 2A | Derived current projection and immutable version reference; no independent Answer body store |
| Confidence | Exact Answer-owned immutable snapshot inside each eligible Answer version | `canonical-existing` Phase 2A | Customer confidence remains Answer-owned and immutable within an Answer version |
| Unknown | ProductQuestion-history-owned version-2 lifecycle events and derived current projection | `canonical-existing` Phase 2B | Stable Question-scoped identity; additive lifecycle; no independent Unknown store |
| Confidence-Improvement Operation | `ProductImprovementAction` projection and `ProductQuestionImprovementHistoryEntry` receipt | `partially-implemented` | Preserve upstream investigation authority; complete request/receipt lineage before promotion |
| Recommendation | Runtime `ExecutiveRecommendation` and communication projections | `partially-implemented` | A Phase 2 product Recommendation is not the engine artifact and needs Question-scoped lifecycle completion |
| Decision | Durable `ExecutiveDecisionRecord` and Product Workflow draft/projection | `canonical-existing` engine owner; product composition partial | Reuse the canonical Decision pipeline and complete product operations |
| Outcome | Durable `ExecutiveReview`; `ProductOutcomeReview` projection | `canonical-existing` engine owner; product composition partial | Outcome observations remain distinct from Learning |
| Learning Event | Durable `ExecutiveLearning`; Question history link | `canonical-existing` engine owner; product composition partial | Reuse canonical learning and permit explicit no-change receipts |
| Insight | `ProductInsight` projection and Question history reference; several internal insight artifacts | `partially-implemented` | Product Insight requires qualified emission identity and lifecycle without promoting internal artifacts |

Name equivalence never transfers authority. In particular:

- `ExecutiveRecommendation` is not automatically a Product Recommendation.
- `ExecutiveReview` is the current canonical Outcome-review owner.
- `ExecutiveLearning` is the current canonical learning record; a generic
  Question event is not itself Learning.
- engine, executive, Product Workflow, and presentation Insights have distinct
  contracts.
- source, Evidence, explanation, mechanism, Answer, Recommendation, Decision,
  and human confidence remain separately scoped.

## 3. Shared contract rules

Every Phase 2 object has exactly one organization owner. Question-relative
objects retain exact `ProductQuestion` identity. Creation, mutation, retrieval,
and projection require exact authorization before Runtime or source access.
Derived objects inherit the disclosure restrictions of their ancestry and may
not leak restricted meaning through paraphrase, confidence, Recommendations,
or Insights.

Evidence remains content-addressed. Repository revision is provenance and
freshness lineage, not independent corroboration. Duplicate Evidence and
replayed operations may not inflate confidence or create duplicate downstream
objects.

Historical versions are immutable. Current pointers and projections advance by
supersession, resolution, retirement, or revocation—not overwrite. Every
durable transition must be attributable, idempotent, reloadable, and
replayable.

Competing explanations remain distinct until admitted Evidence discriminates.
No-change is a valid explicit result. Absence of support may produce no Answer,
no customer confidence, no Recommendation, no revision, or no Insight.

Freshness is object-relative and may consider source recency, organizational
volatility, accessibility, supersession, expected validation cadence, and
Outcome timing. No universal decay rate is authorized.

Human or governed authority owns Decisions. Discovery may recommend,
communicate, and learn; it may not silently commit an intervention.

## 4. Answer contract

### Purpose and definition

An Answer gives an authorized user Discovery's current truthful response to
one exact durable Question. It is a Question-relative product projection, not a
search result, document summary, internal explanation, or complete
organizational model.

### Scope, authority, ownership, and identity

- **Scope:** one organization, Question, canonical source revision, and Answer
  version.
- **Authority:** Product Workflow selects the Answer from authorized canonical
  cognition after relevance, support, and discrimination gates.
- **Ownership:** the organization owns the product history; the canonical
  selection operation owns creation.
- **Stable identity:** organization ID + Question ID + canonical source
  identity + selected canonical revision.
- **Version inputs:** a material change to selected meaning, evidence basis,
  alternatives, or Answer-owned confidence.
- Mutable display wording or a timestamp alone may not establish identity.

### Persistence and lifecycle

The current contract is a **derived projection with a durable immutable version
reference and confidence snapshot** in ProductQuestion history. Existing
historical resolution must reconstruct the exact authorized retained revision;
current content may not substitute when history is unavailable.

Allowed result states are:

- `supported`: one selected response passes all gates;
- `competing`: a bounded response may describe distinct plausible
  explanations without selecting an unsupported winner;
- `targeted_abstention`: the exact limitation and next discriminating need are
  stated;
- `unsupported`: no customer Answer exists.

`ProductAnswerAbstention` is an operation result, not a customer Answer
version. Unsupported is the absence of an Answer, not an Answer subtype.

An Answer is created only from admitted authorized Evidence and eligible
canonical meaning. Search results alone cannot create it. A material new
selection supersedes the current Answer pointer while prior references remain
immutable. Retirement occurs when the Question is archived, authorization
removes current projection, or canonical support is invalidated. Answers do
not merge across Questions; competing explanations remain components of one
Question-relative result rather than separate Questions or silently merged
Answers.

### Relationships, provenance, freshness, and permissions

Every Answer references its Question, canonical source/revision, admitted
Evidence basis, alternatives, confidence snapshot, limiter, and applicable
improvement operation. Freshness changes may change current eligibility or
create a new version but never rewrite a historical Answer.

Only an authorized projection may expose Answer meaning. If its supporting
ancestry cannot be disclosed safely, return a bounded permitted projection or
no Answer.

### Replay, failure, and customer projection

Retries with the same identity inputs return the same version reference.
Reload preserves current and historical identity. Failure produces targeted
abstention or unsupported—not adjacent meaning, inferred confidence, or a
generic Answer.

The customer projection contains the bounded conclusion, why it matters,
Answer-owned confidence when present, discriminating Evidence, unresolved or
weakened alternatives, principal limiter, and best next improvement. Raw
cognition IDs and objects remain internal.

### Acceptance criteria and current gap

- exact Question relevance and organization isolation pass;
- duplicate Evidence does not create a new version or confidence gain;
- historical content resolves from the exact retained revision;
- competing explanations and null-confidence abstention survive reload;
- unauthorized and stale-current states fail closed;
- replay produces no duplicate history.

Phase 2A implements the contract through version-2
`product-question-answer-event` records in Runtime `memory.events`. Version-1
Question Answer references remain readable through the mixed-history reader.
Any future change to a separate durable Answer body requires version, fixture,
migration, rollback, and Runtime review under `GAP-A-018`.

## 5. Confidence contract

### Purpose and definition

Customer Confidence expresses the quality of evidential justification for one
exact Answer version. It is not truth probability, model probability, document
count, engagement, source volume, or confidence in the whole organization.

### Scope, authority, identity, and persistence

- **Scope:** organization + Question + exact Answer version.
- **Authority:** Product Workflow projects the canonical support and limiters;
  no frontend computes it.
- **Ownership:** the Answer owns customer Confidence.
- **Identity:** the owning Answer version; Confidence has no independent
  customer identity.
- **Persistence:** immutable snapshot/reference within the durable Answer
  history entry, with a derived current projection.

Confidence requires a customer Answer. Targeted abstention and unsupported
states have `null` customer Confidence. Internal source reliability, Evidence
confidence, explanation or mechanism support, executive Recommendation
confidence, Decision confidence, and human confidence retain their own owners
and may not be copied into Answer Confidence.

### Lifecycle and update rules

Confidence is created with an eligible Answer version. It cannot mutate within
that version. Materially changed justification produces a new Answer version
and Confidence snapshot. Supersession does not erase earlier values.

Contradictions, unresolved alternatives, freshness, volatility, source access,
and evidence independence may limit Confidence. Duplicate Evidence cannot
increase it. Outcomes may justify a later Answer revision but cannot rewrite
historical Confidence.

### Failure, projection, and acceptance

Projection exposes level, nullable score, meaning, principal limiter, and
authoritative source. It must explain limitations without exposing restricted
ancestry. Unknown or unavailable justification fails closed to no customer
Confidence.

Acceptance requires exact Answer ownership, null Confidence without an Answer,
no cross-Question transfer, duplicate resistance, historical immutability,
authorization, deterministic replay, and reload survival.

No separate durable Confidence object is authorized for Phase 2A. A future
independent confidence lifecycle requires explicit governance evidence.

## 6. Unknown contract

### Purpose and definition

An Unknown is a specific, bounded limitation preventing stronger understanding.
It is not a generic request for more data, a hidden error, an unresolved
internal object exposed directly, or proof that no useful understanding exists.

Allowed categories are:

- missing Evidence;
- missing relationship;
- unresolved contradiction;
- competing-explanation discrimination gap;
- measurement gap;
- authority or ownership gap;
- freshness gap;
- scope or permission gap;
- Outcome-validation gap;
- unsupported assumption.

### Scope, authority, identity, and persistence

- **Scope:** one organization and one Question initially; a future governed
  relationship may link equivalent Unknowns across Questions without merging
  identity.
- **Authority:** Product Workflow translates authorized canonical gaps and
  limiters; users may contribute clarifying information but do not directly
  assert canonical resolution.
- **Ownership:** organization-owned, creation-operation-authored.
- **Proposed identity:** organization + Question + category + authoritative
  target relationship + canonical ancestry. Display text alone is forbidden.
- **Persistence:** versioned ProductQuestion events in Runtime `memory.events`,
  as fixed in Section 19. This supplies a durable event-backed lifecycle
  without a separate Unknown store.

### Lifecycle

Proposed states are `open → targeted → resolved`, with `reopened`,
`superseded`, and `retired` transitions. Resolution requires admitted Evidence,
a governed Outcome, restored authority/access, or canonical reevaluation that
addresses the exact limitation. The prior open state remains replayable.
Unknowns do not expire merely because time passes; freshness may instead
supersede or reopen them.

Priority remains an upstream investigation decision. Expected value must cite
the canonical investigation opportunity and may remain unknown. Permissions
inherit from all ancestry; restricted Unknown meaning must be redacted or
omitted.

### Failure, projection, and acceptance

The customer sees category, bounded question/gap, why it limits understanding,
and the authorized best next step. Generic “more data is needed,” ambiguous
identity merges, and cross-Question contamination fail closed.

Acceptance requires stable identity, exact scope, duplicate suppression,
authorized resolution/reopen, immutable history, linkage to one improvement
target, reload/replay, and no disclosure leakage.

## 7. Confidence-Improvement Operation contract

### Purpose and definition

The Confidence-Improvement Operation identifies and, only when authorized,
initiates the highest-value safe next step for resolving a target Unknown or
improving discrimination. The canonical product name remains
`ProductImprovementAction` until a separately reviewed contract rename.

It may:

- inspect existing Evidence more deeply;
- search another authorized source;
- request a document;
- ask a person;
- run a comparison;
- collect a measurement;
- monitor over time;
- test an explanation through a Decision;
- wait for an Outcome;
- explicitly report that no safe operation is available.

### Scope, authority, identity, and persistence

- **Scope:** organization + Question + target Unknown/investigation opportunity.
- **Authority:** canonical investigation ranking supplies priority and expected
  gain; Product Workflow translates and a user authorizes execution.
- **Ownership:** Discovery owns the proposal; the user owns consent to external
  acquisition or action.
- **Identity:** target + canonical opportunity identity + action type + bounded
  source scope.
- **Persistence:** proposal is a derived projection; initiation/completion is a
  durable operation receipt in Question improvement history.

### Lifecycle

`proposed → authorized → initiated → completed`, with `unavailable`,
`declined`, `failed`, and `no_change` terminal receipts. A materially new
opportunity supersedes the proposal, not completed receipts.

Expected understanding or discrimination gain is an estimate from the
canonical owner, never a guarantee or frontend calculation. Cost, delay,
burden, source permissions, and governance risk may make an operation
unavailable. Unrestricted autonomous acquisition remains deferred.

The completion receipt links exact later admitted Evidence, Outcome, revised
Answer, changed Confidence, or explicit no-change. Missing or inaccessible
Evidence does not fabricate completion.

Acceptance requires preserved ranking, exact target linkage, user
confirmation, source authorization, idempotent execution, Evidence ancestry,
no-change receipt, and no autonomous or cross-organization action.

## 8. Recommendation contract

### Purpose and definition

A Recommendation is a governed proposal for action based on current
understanding, the exact Answer and Confidence when present, Unknowns,
competing explanations, organizational objective, constraints, and
permissions. It is not a Decision, command, raw `ExecutiveRecommendation`, or
automatic consequence of an Answer.

Permitted product types include `investigate`, `acquire_evidence`, `monitor`,
`communicate`, `decide`, `bounded_test`, `mitigate`, `defer`, and `no_action`.

### Scope, authority, identity, and persistence

- **Scope:** one organization and normally one Question; affected scope must be
  explicit.
- **Authority:** existing canonical Recommendation cognition informs Product
  Workflow; Product Workflow determines customer eligibility and language.
- **Ownership:** Discovery owns the proposal; a human or governed authority
  owns approval.
- **Proposed identity:** organization + Question + canonical recommendation
  source/revision + action target.
- **Persistence:** current Recommendation may be projected from Runtime, but a
  Phase 2 Recommendation lifecycle and Decision ancestry require a durable
  version reference/event. This remains implementation work under
  `GAP-A-011`.

### Lifecycle

`proposed → available → accepted | declined | expired | superseded | retired`.
Acceptance may lead to one or more Decisions, but creates none automatically.
An authorized user may record a Decision without a Discovery Recommendation;
the system must not invent one.

Recommendations preserve supporting Evidence, Confidence scope, alternatives,
Unknowns, assumptions, risks, constraints, applicability window, and
supersession ancestry. Material input change may supersede them. Repeated
wording changes may not cause churn.

Expiration and cross-Question reuse remain later product-design questions
under existing gaps. Customer projection exposes the action, rationale,
assumptions, risks, uncertainty, owner of approval, and current applicability.

Acceptance requires complete input ancestry, no automatic Decision,
idempotent versioning, safe expiration/supersession, permission inheritance,
alternative preservation, reload, and no Recommendation when constraints make
it unsafe.

## 9. Decision contract

### Purpose and definition

A Decision is a durable human- or governance-owned commitment, intervention,
deliberate test, deferment, or no-action choice made in the context of current
organizational understanding. It is not a Recommendation or an engine-selected
strategy.

The canonical owner remains `ExecutiveDecisionRecord` and its existing
pipeline. Product Workflow uses `ProductDecisionDraft` and `ProductDecision`
projections rather than creating another Decision store.

### Scope, identity, persistence, and ownership

- **Scope:** organization, source Question and Answer where applicable,
  decision-maker, and governed intervention.
- **Authority:** an authorized human/governance operation drafts and commits;
  the canonical Decision service persists it.
- **Identity:** canonical Decision record ID plus idempotent submission ID;
  mutable title is not identity.
- **Persistence:** durable canonical record with Question history reference.
- **Ownership:** accountable human/governed decision-maker; Discovery retains
  authorship only for a cited Recommendation.

### Lifecycle and immutability

The existing canonical lifecycle is preserved:

`draft → decided → in-progress → completed`, with `cancelled` as an explicit
terminal state and archival handled by the owning workflow where supported.

The Product acceptance vocabulary `Draft → Active → Implemented → Observed →
Completed → Archived` maps to, but does not replace, canonical engine states.
A later contract review must approve any persisted vocabulary change.

After commitment, original rationale, accepted assumptions and risks,
Recommendation ancestry, Answer/Confidence context, expected Outcomes,
success criteria, decision-maker, and decision time are immutable. Amendments
are additive events under Section 19; implementation remains incomplete and
must not be simulated by overwriting. Cancellation and supersession preserve
the original record.

A Decision may accept, modify, reject, defer, or bypass a Recommendation. It
may test an explanation, acquire Evidence, mitigate risk, or act despite
explicit uncertainty. It records the understanding available at commitment
and never rewrites rationale after Outcomes arrive.

Acceptance requires exact human authority, immutable commitment context,
idempotent commit, authorized projection, Question/Answer ancestry,
expected-Outcome identity, cancellation/supersession preservation, and reload.

## 10. Outcome contract

### Purpose and definition

An Outcome is durable Evidence about what happened after a Decision,
intervention, or governed monitored event. It is not Learning and does not
directly rewrite understanding.

The current canonical record is `ExecutiveReview`, containing
`ExecutiveObservedOutcome` comparisons. `ProductOutcomeReview` is its bounded
customer projection.

Under the current Phase 2 contract, a product Outcome requires a canonical
Decision. An observation without a Decision remains Evidence until a separately
governed monitored-event Outcome contract exists.

### Scope, authority, identity, and persistence

- **Scope:** organization + Decision + expected Outcome + observation event.
- **Authority:** an authorized review operation records supplied observations;
  canonical review services validate and persist them.
- **Ownership:** source system or human supplies the observation; the
  organization owns the review record.
- **Identity:** canonical review ID and Decision/expected-Outcome ancestry;
  observation text or timestamp alone is insufficient.
- **Persistence:** durable canonical review record plus Question history
  reference.

### Lifecycle

`pending → observed → reviewed`, with bounded results `working`,
`not_working`, `mixed`, `inconclusive`, and `too_early` in product projection.
One Decision may have multiple time- or expectation-scoped Outcomes.

Partial, delayed, missing, or ambiguous observations remain explicit.
Corrections require a new attributable correction/review event that supersedes
the current projection; the original record remains immutable. Correction
semantics require a pre-implementation contract before mutation support.

Outcome freshness follows event time, retrieval/recording time, expected
horizon, source access, and supersession. Human attestations and connected
source Evidence retain distinct lineage.

Acceptance requires expected-versus-observed comparison, exact Decision
ancestry, mixed/inconclusive support, duplicate submission suppression,
correction ancestry, authorization, reload, and no automatic model revision.

## 11. Learning Event contract

### Purpose and definition

A Learning Event is a durable record of how organizational understanding
changed—or explicitly did not change—after admitted Evidence, a Decision, or
an Outcome was evaluated. Stored documents, searches, clicks, activity, and
summaries are not Learning.

The canonical owner is `ExecutiveLearning`, composed from authorized canonical
review and Runtime state. Product Question history records the linkage.

### Scope, authority, identity, and persistence

- **Scope:** organization + evaluation operation + prior understanding
  revision + relevant Evidence/Decision/Outcome.
- **Authority:** the canonical learning service creates and saves Learning;
  frontends and Product Workflow only project it.
- **Ownership:** canonical operation-authored, organization-owned.
- **Identity:** canonical learning ID derived through the owning operation and
  exact ancestry; timestamp alone is not identity.
- **Persistence:** durable canonical record/event.

### Lifecycle and semantics

A Learning Event is append-only and final once recorded. A later correction
creates a new event that references the corrected or superseded event.
Multiple Learning Events may stem from one Outcome only when they address
distinct authorized evaluations and are independently idempotent.

The current canonical `ExecutiveLearning` owner requires exact Outcome-review
ancestry. External admitted Evidence may revise canonical understanding and
produce an Answer change receipt, but it does not become an
`ExecutiveLearning` record without a separately governed learning operation.
Outcome-based Learning requires the exact Outcome ancestry. It may change
explanation strength, Confidence in a new Answer version, Unknown state,
Recommendation applicability, conditions, mechanisms, or Insight eligibility.

An explicit `no_justified_change` event is required when a completed learning
operation finds no warranted revision. Current `ExecutiveLearning` does not
fully encode this product semantic; adding it requires a versioned contract
review rather than a fabricated change.

The event preserves prior and resulting revision references, exact reason,
Evidence/Decision/Outcome ancestry, permissions, and applied-at identity.
Rollback is a new corrective event, never deletion.

Acceptance requires before/after lineage, no-change semantics, immutable
history, exact Outcome or Evidence ancestry, idempotent application, permission
inheritance, reload/replay, and no Learning from activity alone.

## 12. Insight contract

### Purpose and definition

An Insight is a meaningful, evidence-grounded change in organizational
understanding that is useful beyond restating one source or one Answer. It is
not every model update, a summary, novelty of wording, an internal engine
insight, or an unsupported surprise.

### Scope, authority, identity, and persistence

- **Scope:** one organization and an explicit Question, Decision, team, or
  authorized organizational scope.
- **Authority:** existing quality-gated Product Workflow projection may emit
  an Insight from canonical Learning/understanding; users may challenge or
  annotate but cannot self-author canonical Discovery Insight.
- **Ownership:** operation-authored, organization-owned.
- **Proposed identity:** organization + qualified understanding change +
  authoritative prior/current revision ancestry + affected scope.
- **Persistence:** product projection plus immutable ProductQuestion-linked
  emission and lifecycle events defined in Section 19. Implementation remains
  incomplete under `GAP-A-015`.

### Lifecycle

`candidate → qualified → emitted`, with `challenged`, `revised`,
`superseded`, and `retired`. A low-confidence Insight may exist only when its
uncertainty is explicit and qualification still demonstrates material utility.
Re-emergence creates a new version linked to the prior retired Insight.

Qualification requires prior and new understanding, responsible Evidence,
Learning Events or Outcomes, scope, relevance, uncertainty, implications, and
lineage. Cross-silo and nonlinear candidates remain subject to permission,
novelty, and benchmark gates. Wording variation and duplicate Learning cannot
create duplicate Insights.

Any customer Confidence shown with an Insight is a reference to the exact
source Answer's Confidence and may appear only when that Answer lineage exists.
Insight does not own an independent customer confidence layer. Otherwise the
Insight exposes bounded uncertainty without a customer confidence value.

Users may challenge or annotate a projected Insight. Saving or promoting a
user-authored statement does not make it a canonical Discovery Insight.

No final mathematical threshold is established here. Qualification threshold,
challenge resolution, and organization-wide projection require focused
benchmark or product-contract work.

Acceptance requires material-change evidence, prior/current lineage,
duplicate suppression, permission-safe projection, challenge/retirement
history, reload, and explicit no-Insight when qualification fails.

## 13. Cross-object relationship model

| Source | Relationship | Target |
|---|---|---|
| `ProductQuestion` | requests | `ProductAnswer` or abstention result |
| Evidence | supports, opposes, or discriminates | Answer or canonical explanation |
| Answer | owns | customer Confidence |
| Answer | exposes | competing explanations |
| Answer / abstention | identifies | Unknowns |
| Unknown | is targeted by | Confidence-Improvement Operation |
| Confidence-Improvement Operation | may produce | admitted Evidence or explicit no-change receipt |
| Organizational understanding | informs | Recommendation |
| Recommendation | may lead to | Decision |
| Decision | declares | expected Outcome |
| Decision | may test | explanation or mechanism |
| Outcome | evaluates | Decision expectation |
| Outcome | may trigger | Learning Event |
| Learning Event | revises or preserves | organizational understanding |
| Learning Event | may qualify | Insight |
| Insight | projects | meaningful understanding change |

No relationship implies automatic creation of its target.

## 14. Persistence decision matrix

| Object | Durable record | Durable event/reference | Derived projection | Ephemeral operation | Current status | Proposed Phase 2 contract |
|---|---:|---:|---:|---:|---|---|
| Answer | No independent store | Version-2 immutable Answer event | Yes | Selection | Phase 2A implemented | Keep event-backed version projection; reconsider separate storage only with migration evidence |
| Confidence | No independent object | Immutable Answer-version snapshot | Yes | Recalculation during Answer selection | Phase 2A implemented | Immutable per Answer version |
| Unknown | No independent store | Version-2 immutable lifecycle events | Yes | Explicit typed candidate and authorized operation | Phase 2B implemented | Keep event-backed lifecycle projection |
| Improvement Operation | No | Partial receipt | Proposal | Execution | Partially implemented | Derived proposal plus durable request/completion receipt |
| Recommendation | Runtime current artifact; no complete product lifecycle | Not complete | Yes | Eligibility | Partially implemented | Durable version reference/event required for Decision ancestry |
| Decision | Yes, `ExecutiveDecisionRecord` | Question link/amendments | Yes | Drafting | Canonical existing | Reuse existing durable owner |
| Outcome | Yes, `ExecutiveReview` | Question link/correction | Yes | Review operation | Canonical existing | Reuse owner; add correction contract before support |
| Learning Event | Yes, `ExecutiveLearning` | Question link/correction | Yes | Evaluation | Canonical existing | Reuse owner; version explicit no-change semantics |
| Insight | No separate Product Insight store | ProductQuestion-linked emission/lifecycle event | Yes | Qualification | Partially implemented | Persist the immutable emitted product body and ancestry in the versioned event |

## 15. Identity decision matrix

| Object | Stable identity inputs | Version inputs | Scope | Supersession rule | Idempotency-key basis |
|---|---|---|---|---|---|
| Answer | organization, Question, canonical source and revision | selected meaning, basis, alternatives, Confidence | Question | new eligible version advances current pointer | Question + canonical source/revision |
| Confidence | owning Answer version | none within version | Answer | superseded only with Answer | Answer ID/version |
| Unknown | organization, Question, category, target, ancestry | changed target or canonical basis | Question initially | resolve/reopen/supersede; never overwrite | proposed Unknown identity inputs |
| Improvement Operation | Question, Unknown/opportunity, action and source scope | materially changed opportunity | Question/Unknown | new proposal supersedes; receipts remain | target + opportunity + action scope |
| Recommendation | Question, canonical source/revision, action target | support, constraints, applicability | Question/organization | explicit expiry or supersession | source/revision + target |
| Decision | canonical record and submission identity | additive amendment only | organization/Question | new Decision or amendment references prior | organization + submission ID |
| Outcome | review identity, Decision, expected Outcome | correction/review event | Decision/expectation | correction supersedes current projection | Decision + bounded observation submission |
| Learning Event | owning evaluation and exact ancestry | corrective event only | organization/revision | later event references prior | evaluation + prior revision + ancestry |
| Insight | qualified change, prior/current revisions, scope | challenge, revision, re-emergence | explicit authorized scope | new version references prior | qualified change ancestry + scope |

No identity uses a secret, timestamp alone, or mutable display wording alone.

## 16. Permission matrix

Exact role names remain governed by the existing access system; this matrix
uses capability descriptions and does not invent roles.

| Object | May create | May mutate | May view | Inherited restrictions | Redacted projection | Revocation |
|---|---|---|---|---|---|---|
| Answer | Authorized canonical Product Workflow operation | Supersession only through same authority | Authorized Question viewers | Question, Evidence, canonical source | Only if meaning cannot leak restricted facts | Current projection denied; history preserved |
| Confidence | Answer selection authority | Never within version | Same as Answer | Complete Answer basis | Bounded level/limiter only when safe | Same as Answer |
| Unknown | Authorized Product Workflow gap projection | Canonical resolution/reopen authority | Authorized affected scope | All gap ancestry | Category/limiter only when safe | Hidden or redacted; lineage preserved |
| Improvement Operation | Canonical proposer; authorized user initiates | Owning operation records status | Authorized Question participants | Target Unknown and source scope | Safe unavailable state permitted | Unexecuted authority removed; receipt retained |
| Recommendation | Canonical recommendation/Product Workflow authority | Owning service supersedes/expires | Authorized affected scope | All supporting ancestry | Bounded action only when non-leaking | Current applicability removed; history retained |
| Decision | Authorized human/governance operation | Owner/governed lifecycle authority | Authorized Decision scope | Cited Question, Answer, Recommendation | Bounded existence/status where policy permits | Access changes; record and audit remain |
| Outcome | Authorized observer/review operation | Correction only through owning service | Authorized Decision/review scope | Decision and Outcome Evidence | Bounded result only when safe | Current access changes; source lineage retained |
| Learning Event | Canonical learning operation | Corrective event only | Authorized resulting scope | Evidence, Decision, Outcome, prior state | No-change or bounded change only when safe | Projection changes; canonical audit retained |
| Insight | Canonical quality-gated operation | Challenge/revise/retire through owner | Authorized affected scope | All contributing ancestry | Only if no restricted meaning is inferable | Current projection denied/redacted; lineage retained |

## 17. Lifecycle compatibility

The contracts compose safely under these rules:

- Answer supersession never changes the original Decision rationale.
- Confidence changes only through a new Answer version.
- Unknown resolution preserves the prior open state.
- Recommendation expiry does not invalidate a Decision that cited it.
- Decision completion does not require a binary Outcome; mixed and
  inconclusive are valid.
- Outcome correction creates new review and potentially new Learning ancestry
  without rewriting the original.
- Learning may record no justified model change.
- Insight retirement leaves underlying historical Evidence valid.
- revocation changes current projection, not historical lineage.
- reload preserves all stable relationships and current pointers.

The additive lifecycle contracts for Unknowns, Recommendations, Decision
amendments, Outcome corrections, no-change Learning, and Insight retirement
are fixed in Section 19. Insight qualification thresholds remain benchmark
gated. Implementation may not improvise beyond these contracts.

## 18. Acceptance scenarios

| Scenario | Required result |
|---|---|
| Supported Answer | One current Answer and Answer-owned Confidence; evidence independence; alternatives preserved; no duplicate inflation |
| Targeted abstention | No supported Answer or customer Confidence; explicit Unknown; one highest-value safe discrimination operation |
| Unknown resolution | Same governed identity resolves or is explicitly superseded; history remains; Answer/Confidence may advance |
| Recommendation without Decision | Recommendation may exist; no Decision is automatically created |
| Human Decision without Recommendation | Authorized Decision is accepted with captured understanding/rationale; no fictional Recommendation |
| Outcome validates expectation | Outcome is recorded; Learning may strengthen understanding; Insight only if qualified |
| Outcome contradicts expectation | Decision remains immutable; Learning may weaken/revise; Unknown or alternative may reopen |
| Mixed Outcome | Partial Learning and remaining uncertainty; no forced binary result |
| Duplicate Outcome | No duplicate Outcome, Learning, or Insight |
| Restricted Evidence | Full permitted projection only to authorized users; safe redaction or omission otherwise |
| Stale Answer | Historical Answer remains; current eligibility/freshness changes; targeted acquisition may be proposed |
| No-change Learning | Explicit no-change Learning receipt; no Insight or confidence inflation |

For every object, focused acceptance must cover stable identity, organization
and parent scope, authorization, creation gates, valid transitions,
idempotency, supersession, reload/replay, provenance, freshness, duplicate
suppression, no-change, customer projection, and truthful failure.

### Validator-ready lifecycle scenarios

| Contract | Required deterministic scenarios |
|---|---|
| Unknown | exact replay creates no duplicate; same wording/different target remains distinct; different wording/same target retains lineage; resolve and reopen preserve history; cross-Question contamination is zero; unauthorized projection fails closed |
| Recommendation | identical proposal replay is idempotent; a new understanding revision may create one new version; expiry preserves history; acceptance creates no Decision; stale/superseded versions cannot appear current |
| Decision amendment | rationale remains byte-stable; clerical correction is additive; implementation amendment advances only the current projection; material commitment change requires explicit supersession/new Decision; duplicate request creates no amendment |
| Outcome correction | original Outcome reloads unchanged; correction references the exact prior version; duplicate correction is idempotent; current projection advances; prior Learning remains; corrective Learning may be emitted once |
| No-change Learning | evaluation receipt exists; understanding revision remains unchanged; no Insight or Confidence gain occurs; replay creates no duplicate; no-change is distinguishable from absent evaluation |
| Insight retirement/re-emergence | retirement preserves history and removes current projection; wording-only duplicate cannot re-emerge; materially new support may create one linked version; permissions remain inherited; repeated qualification is idempotent |

## 19. Resolved pre-implementation lifecycle decisions

### 19.1 Unknown identity and events

An Unknown is durably owned by ProductQuestion history. Its lineage identity
is:

`organization + Question + category + typed stable target + source ancestry`.

The target descriptor is a typed reference to a relationship, explanation,
measure, authority, Outcome, scope, or canonical object. Display wording is
descriptive only. Unknowns never merge across Questions in Phase 2.

The ProductQuestion event contract adds:

- `unknown_opened`;
- `unknown_targeted`;
- `unknown_resolved`;
- `unknown_reopened`;
- `unknown_superseded`;
- `unknown_retired`.

Every event contains Unknown ID, organization and Question IDs, category,
stable target descriptor, source ancestry, operation ID, actor/authority,
occurred-at time, reason, and—where applicable—resolution references or the
superseded Unknown ID. `unknown_reopened` is an additive event that returns the
current projection to `open`; it is not a new lineage.

Resolution requires an explicit reference to admitted Evidence, Outcome,
Decision, or governed determination. Absence from a later projection never
resolves an Unknown.

### 19.2 Recommendation identity, versions, and expiration

A Product Recommendation lineage identity is:

`organization + Question + typed action target + organizational objective`.

A version identity adds the exact understanding/Answer revision, Unknown set,
constraint set, and proposed action contract. Prose wording and timestamps are
not identity. Identical inputs and operation ID return the same version.

ProductQuestion history owns immutable Recommendation version and lifecycle
events:

- `recommendation_proposed`;
- `recommendation_available`;
- `recommendation_accepted`;
- `recommendation_declined`;
- `recommendation_expired`;
- `recommendation_superseded`;
- `recommendation_retired`.

The current Recommendation is derived from the latest authorized,
non-terminal version. Expiration requires an explicit validity condition:
source freshness exceeded, Answer superseded, target Unknown resolved,
objective or constraint changed, Decision already committed, or an explicit
valid-through condition reached. Elapsed time alone is insufficient.

Acceptance records user intent only. It does not create a Decision. Existing
`ExecutiveRecommendation` remains canonical cognition input and is referenced
as ancestry; it is not the durable Product Recommendation version.

### 19.3 Decision amendments

The committed `ExecutiveDecisionRecord` is immutable. The current save-by-ID
replacement behavior may continue only for pre-commit draft handling; it may
not amend a committed record.

An additive `decision_amendment_recorded` Runtime event contains Decision ID,
amendment ID, deterministic request/operation ID, amendment type, actor,
occurred-at time, reason, changed implementation fields, and prior amendment
reference. ProductQuestion history may link the event but does not own the
Decision.

Allowed amendments clarify implementation detail, change owner or timing,
revise execution scope without changing the commitment, or add/revise expected
Outcome administration. Clerical correction records both prior and corrected
values. Cancellation is a terminal amendment. A material change to the
intervention, governing rationale, or accepted commitment requires a new
Decision with explicit `supersedesDecisionId`.

The current Decision projection composes the original record plus ordered
authorized amendments. Original rationale, Answer and Confidence context,
Unknowns, Recommendation ancestry, assumptions, expected Outcomes, owner, and
commitment time remain historically available.

### 19.4 Outcome corrections

Outcome lineage identity is:

`organization + Decision + expected Outcome target + observation scope`.

An observation version adds the canonical review/observation operation and
supporting Evidence version. A correction creates a new `ExecutiveReview`
version with a new ID and explicit `correctsReviewId`; it never replaces the
prior review.

The corrected version preserves correction operation ID, reason, supporting
Evidence, actor/authority, recorded time, effective observation time, and
validation status. Allowed reasons are clerical correction, additional
measurement, source replacement, validation-status change, completion of a
partial Outcome, or dispute/invalidation.

The current Outcome projection selects the latest authorized valid version in
the lineage. Earlier Learning remains immutable. A correction may trigger a
new corrective Learning Event that cites both Outcome versions.

### 19.5 Explicit no-change Learning

`ExecutiveLearning` gains an explicit versioned evaluation result:

- `change`;
- `no_change`;
- `insufficient_discrimination`;
- `blocked`.

Every result references the triggering Evidence/Outcome/Decision, prior
understanding revision, evaluation operation, evaluated explanations or
mechanisms, reason, resulting understanding reference, permission ancestry,
actor/authority, and learned-at time.

For `no_change`, the prior and resulting understanding reference are equal. It
creates no new Confidence, Recommendation, Insight, corroboration, or Scorecard
gain. `insufficient_discrimination` records completed evaluation without a
justified selection. `blocked` records that evaluation could not complete and
must state the authorization, availability, or governance reason. No event
means no evaluation; it must not be projected as no-change.

The existing `executiveLearning` Runtime collection remains the owner. Legacy
records without a result adapt to `change` only because their existing
creation contract required produced organizational knowledge; the adapter
must preserve the original bytes.

### 19.6 Insight retirement and re-emergence

An emitted Product Insight requires an immutable ProductQuestion-linked
`insight_emitted` event containing lineage ID, version ID, qualification
operation ID, prior/current understanding references, supporting Learning,
Outcome and Evidence ancestry, affected scope, uncertainty, implications, and
permission ancestry. Headline wording is not identity.

Additive lifecycle events are:

- `insight_challenged`;
- `insight_revised`;
- `insight_retired`;
- `insight_reemerged`.

Retirement preserves the emitted version and cites one or more reasons:
supersession, invalidated Evidence, changed permission scope, lost material
relevance, contradictory Outcome, duplicate/non-novel qualification, or ended
organizational condition. Retired Insights are absent from current projection
but remain replayable.

Re-emergence requires materially new Evidence or Learning, a new successful
qualification operation, a new version ID, and an explicit link to the retired
lineage. Wording-only variation fails qualification. Insight owns no customer
Confidence; it may expose inherited uncertainty and an exact source Answer
Confidence reference only when that Answer ancestry exists.

### Lifecycle event table

| Object | Event | Creates new version | Changes current projection | Historical record preserved |
|---|---|---:|---:|---:|
| Unknown | opened | Yes, lineage version 1 | Yes | Yes |
| Unknown | targeted/resolved/reopened/retired | Additive event | Yes | Yes |
| Unknown | superseded | New target lineage when material | Yes | Yes |
| Recommendation | proposed/available | Yes | Yes when available | Yes |
| Recommendation | accepted/declined/expired/retired | Additive event | Yes | Yes |
| Recommendation | superseded | Yes | Yes | Yes |
| Decision | amendment/correction/cancellation | Additive amendment | Yes | Yes |
| Decision | material supersession | New Decision | Yes | Yes |
| Outcome | correction | New Review version | Yes | Yes |
| Learning | change/no-change/insufficient/blocked | New evaluation record | Change only when justified | Yes |
| Insight | emitted/revised/re-emerged | New Insight version | Yes | Yes |
| Insight | challenged/retired | Additive event | Yes | Yes |

### Resolved identity and idempotency table

| Object | Lineage identity | Version/event identity | Idempotency basis |
|---|---|---|---|
| Unknown | organization + Question + category + typed target + ancestry | lineage + lifecycle operation | organization + Question + Unknown + operation ID |
| Recommendation | organization + Question + action target + objective | lineage + understanding revision + action/constraint contract | lineage + version inputs + operation ID |
| Decision amendment | immutable Decision ID | Decision + amendment type + operation ID | Decision + deterministic request ID |
| Outcome correction | organization + Decision + expected target + observation scope | lineage + new review/observation operation + prior version | lineage + correction operation ID |
| Learning evaluation | organization + trigger + prior understanding revision | evaluation operation + result + exact ancestry | trigger + prior revision + operation ID |
| Insight | organization + qualified semantic change + affected scope | lineage + qualification operation + supporting revisions | lineage + qualification operation ID |

### Persistence owner table

| Object | Durable owner | Derived projection | New storage owner required |
|---|---|---|---:|
| Unknown | Versioned ProductQuestion events in Runtime `memory.events` | Current Question Unknowns | No |
| Recommendation | Versioned ProductQuestion events with canonical Recommendation ancestry | Current applicable Recommendation | No |
| Decision amendment | Additive Decision amendment event in Runtime `memory.events`; original `ExecutiveDecisionRecord` unchanged | Current Decision | No |
| Outcome correction | New linked version in existing `executiveReviews` | Current Outcome review | No |
| No-change Learning | Existing `executiveLearning` collection with versioned result | Current learning/change projection | No |
| Insight lifecycle | Versioned ProductQuestion-linked Insight events in Runtime `memory.events` | Current authorized Insights | No |

### Contract and migration matrix

| Decision | Current records readable | Additive contract version needed | Data migration needed |
|---|---:|---:|---:|
| Unknown events | Yes | ProductQuestion event reader/writer v2 | No; dual-version reader |
| Recommendation events | Yes | ProductQuestion event reader/writer v2 | No; dual-version reader |
| Decision amendments | Yes | Decision amendment event v1 and current-projection adapter | No |
| Outcome corrections | Yes | ExecutiveReview v2 with optional correction ancestry; legacy adapter | No |
| No-change Learning | Yes | ExecutiveLearning v2 result/ancestry; legacy adapter | No |
| Insight lifecycle | Yes | Product Insight event v1; current-projection adapter | No |

ProductQuestion version 1 events remain immutable and readable. Version 2
readers must compose both versions in deterministic order. Writers emit only
the new version after promotion. Unknown and Recommendation event additions
must not be silently introduced under schema version 1.

## 20. Implementation sequence and kill criteria

| Stage | Dependencies | Acceptance gate | Persistence | UI allowed | Kill criteria |
|---|---|---|---|---|---|
| 1. Answer — COMPLETE | Existing Question, Evidence, relevance and historical resolver | 14 deterministic scenarios plus live abstention replay passed | Version-2 Answer events plus mixed reader | No frontend change | Requires duplicate Answer store, relevance weakening, or history substitution |
| 2. Answer Confidence — Phase 2A minimum COMPLETE | Exact Answer version | ownership, limiter, duplicate/freshness controls passed | Immutable snapshot inside Answer version | No frontend change | Independent confidence authority or confidence without Answer |
| 3. Unknown — COMPLETE | ProductQuestion event v2 contract | 18 identity, lifecycle, resolution, authorization, replay, and isolation scenarios passed | Versioned ProductQuestion events | No | Generic gaps, cross-Question merge, or inferred resolution |
| 4. Improvement Operation | Unknown and canonical investigation opportunity | ranking, consent, receipt, no-change | Durable operation receipt | After backend acceptance | Autonomous action or recomputed expected gain |
| 5. Recommendation | Current understanding, constraints, ProductQuestion event v2 | ancestry, expiry, no automatic Decision | Versioned ProductQuestion events | After backend acceptance | Answer-only recommendation or parallel engine owner |
| 6. Decision | Recommendation optional; canonical Decision owner | human authority, immutable rationale, idempotent commit | Existing durable record | After product operation passes | New Decision store or rationale overwrite |
| 7. Outcome | Decision and ExecutiveReview v2 correction ancestry | mixed/inconclusive, correction, duplicate, reload | Existing durable review collection | After backend acceptance | Outcome directly mutates understanding |
| 8. Learning Event | Evidence/Outcome, prior revision, ExecutiveLearning v2 result | before/after, explicit no-change, replay | Existing durable learning collection | After backend acceptance | activity treated as Learning or history rewrite |
| 9. Insight | Learning/understanding change, Product Insight events, qualification research | novelty, materiality, permissions, duplicate/retirement | Product Insight events in Runtime events | After benchmark and backend gates | every update emits Insight or threshold lacks evidence |
| 10. End-to-end replay | All preceding gates | Workflow and Phase 2 acceptance, reload, ancestry, governance | Existing canonical owners only | Promotion review only | any duplicate authority, lineage loss, disclosure leak, or fabricated certainty |

## 21. Open questions and deferrals

### Pre-implementation

The six lifecycle decisions in Section 19 are resolved. Each implementation
must still complete its specified contract-version, dual-reader, fixture,
migration, and rollback review before changing code.

### Phase 2 benchmark research

- Insight materiality and novelty qualification;
- scoped OUI aggregation across Question, person, team, and organization;
- expected understanding/discrimination value calibration;
- permission-safe shared projections using restricted ancestry;
- freshness/volatility operational profiles.

### Later product design

- Recommendation applicability across Questions;
- user challenge and annotation workflows;
- multi-user contribution and perspective presentation;
- organization-wide Insight distribution.

### Deferred

- unrestricted autonomous Evidence acquisition;
- automatic organization-wide visibility;
- a universal numeric confidence object;
- cross-Question identity merging;
- final mathematical Insight threshold without benchmark evidence.

## 22. Promotion rule

No Phase 2 object is promoted because its TypeScript type exists or a similarly
named engine artifact is available. Promotion requires its object acceptance
gate, Product Governance validation, organization and permission isolation,
fixture/live parity where applicable, deterministic replay, migration and
rollback review, Capability Survival, and measurable improvement in
organizational understanding without Scorecard guardrail regression.
