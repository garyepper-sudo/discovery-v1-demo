# Discovery Product Decisions

## ProductQuestionWorkspace version 2 is derived and non-persistent

**Decision:** Add deterministic workflow orientation, semantic actions, blocked reasons, and fixture parity as a version-2 projection around the unchanged version-1 workspace. Do not persist a workflow aggregate or let the frontend infer Product meaning from nulls.

**Reason:** Existing canonical owners express the required semantics, while version 1 does not compose later workflow stages for a frontend. The additive Product Confidence Improvement local-operation result now supplies the previously missing real-operation state without making candidate types executable by themselves.

## Local existing-Evidence inspection remains Product Confidence Improvement work

**Decision:** Implement only `inspect-existing-evidence` as a canonical local read-only operation. It requires an exact current governed V3 authorize receipt and separate execution authority, then records a version-1 immutable result and the existing version-1 Outcome observation.

**Reason:** This closes the bounded Product workflow without activating the selector, broadening `compare-existing-evidence`, creating Evidence from a comparison summary, or introducing another operation store.

**Status:** Canonical decision log
**Architecture:** [CANONICAL_PRODUCT_ARCHITECTURE.md](./CANONICAL_PRODUCT_ARCHITECTURE.md)

Each decision below is active unless explicitly superseded by a later entry.
Changing one requires the process in
[PRODUCT_GOVERNANCE.md](./PRODUCT_GOVERNANCE.md).

## DEC-PROD-001 — Question is the canonical product object

- **Decision:** `ProductQuestion` is the stable object around which product
  work, history, decisions, outcomes, learning, and insights compose.
- **Reason:** Users improve an understanding over time rather than consume
  isolated cognition runs.
- **Alternatives considered:** Investigation-as-product; dashboard state;
  transient chat session.
- **Why rejected:** They fragment identity and longitudinal learning.
- **Consequences:** Product capabilities require Question lineage.
- **Status:** Active.

## DEC-PROD-002 — Backend owns product meaning

- **Decision:** Product Workflow chooses answers, evidence, uncertainty,
  actions, change meaning, outcome meaning, and insight eligibility.
- **Reason:** Meaning must remain consistent across clients.
- **Alternatives considered:** Frontend composition; client-specific summaries.
- **Why rejected:** They duplicate reasoning and cause semantic drift.
- **Consequences:** Frontends consume complete contracts.
- **Status:** Active.

## DEC-PROD-003 — Frontend is a renderer

- **Decision:** Frontend owns presentation and interaction only.
- **Reason:** Thin clients preserve truthfulness and portability.
- **Alternatives considered:** React view builders reading Runtime or cognition.
- **Why rejected:** They cross the projection firewall.
- **Consequences:** The canonical boundary is `ProductQuestionWorkspace`.
- **Status:** Active.

## DEC-PROD-004 — Answer owns customer confidence

- **Decision:** Confidence applies to the exact selected `ProductAnswer`.
- **Reason:** Conditions, recommendations, predictions, and evidence counts
  have different epistemic meanings.
- **Alternatives considered:** One workspace confidence score.
- **Why rejected:** It creates ambiguity and false transfer.
- **Consequences:** Confidence source and limiter remain explicit.
- **Status:** Active.

## DEC-PROD-005 — Abstention beats generic advice

- **Decision:** Unsupported Answers and recommendations abstain.
- **Reason:** Precision and trust are more valuable than apparent coverage.
- **Alternatives considered:** Generic templates; lower thresholds.
- **Why rejected:** They manufacture utility.
- **Consequences:** Coverage expands only through better evidence or validated
  reasoning.
- **Status:** Active.

## DEC-PROD-006 — Product contracts are versioned

- **Decision:** Frontend-facing product contracts declare a version.
- **Reason:** Fixtures, live adapters, migrations, and clients require a stable
  compatibility boundary.
- **Alternatives considered:** Implicit TypeScript compatibility.
- **Why rejected:** Runtime behavior and deployed clients outlive source types.
- **Consequences:** Every contract change receives version review.
- **Status:** Active.

## DEC-PROD-007 — Runtime remains canonical persistence

- **Decision:** Durable Questions use existing Runtime persistence and
  append-only product events.
- **Reason:** Organization identity, memory, replacement, and isolation already
  exist.
- **Alternatives considered:** Product database; Question-specific store.
- **Why rejected:** They duplicate persistence and authority.
- **Consequences:** Product events reference canonical objects.
- **Status:** Active.

## DEC-PROD-008 — Product projection firewall is mandatory

- **Decision:** Product presentation cannot import engine or Runtime internals
  to determine meaning.
- **Reason:** Authority and presentation must remain separate.
- **Alternatives considered:** Compatibility builders as permanent product
  dependencies.
- **Why rejected:** They make semantic survival ungovernable.
- **Consequences:** Cross-boundary imports fail validation.
- **Status:** Active.

## DEC-PROD-009 — Determinism is a product requirement

- **Decision:** Equal authorized inputs produce equal product outputs and
  lifecycle ordering.
- **Reason:** Replay, audit, testing, and trust require reproducibility.
- **Alternatives considered:** Unbounded generative translation.
- **Why rejected:** It weakens validation and lineage.
- **Consequences:** Customer language uses bounded deterministic adaptation.
- **Status:** Active.

## DEC-PROD-010 — Organization isolation is end-to-end

- **Decision:** Authorization precedes Runtime retrieval and organization
  identity survives every product boundary.
- **Reason:** Cross-organization influence is a disclosure failure.
- **Alternatives considered:** Global defaults and post-retrieval filtering.
- **Why rejected:** They fail closed too late.
- **Consequences:** Fixtures and live adapters validate isolation.
- **Status:** Active.

## DEC-PROD-011 — Manual evidence precedes automated retrieval

- **Decision:** Manual upload and paste remain the first supported acquisition
  modes.
- **Reason:** They allow product validation before connector governance.
- **Alternatives considered:** Immediate Drive, Slack, or email access.
- **Why rejected:** Authorization, scope, revocation, and retention were not
  proven.
- **Consequences:** Connected search limitations are disclosed truthfully.
- **Status:** Active.

## DEC-PROD-012 — Model projection is truthful and bounded

- **Decision:** `ProductModelState` exposes only supported coverage, coherence,
  freshness, trustworthiness, tensions, and growth.
- **Reason:** Runtime update time and internal maturity are not customer
  freshness or model quality.
- **Alternatives considered:** Dashboard health score; inferred freshness.
- **Why rejected:** They overstate knowledge.
- **Consequences:** Unknown remains unknown and contradictions can weaken state.
- **Status:** Active.

## DEC-PROD-013 — Avatar consumes ProductModelState only

- **Decision:** Any organizational-model avatar reads `ProductModelState`, not
  cognition or Runtime.
- **Reason:** Visual expression must not invent model psychology.
- **Alternatives considered:** Animation driven by engine object counts.
- **Why rejected:** Counts do not establish completeness or trust.
- **Consequences:** Avatar behavior remains a presentation mapping.
- **Status:** Active.

## DEC-PROD-014 — Existing architecture must fail before a new primitive

- **Decision:** New primitives require benchmark or product evidence that the
  architecture in
  [CANONICAL_PRODUCT_ARCHITECTURE.md](./CANONICAL_PRODUCT_ARCHITECTURE.md)
  cannot express the workflow.
- **Reason:** Composition gaps have repeatedly appeared as architecture gaps.
- **Alternatives considered:** Introduce a new layer for every product concept.
- **Why rejected:** It duplicates ownership.
- **Consequences:** Research remains non-authoritative until promoted.
- **Status:** Active.

## DEC-PROD-015 — Exact-Question relevance gates every Answer

- **Decision:** Product Workflow emits a `ProductAnswer` only when the selected
  supported explanation materially covers the exact `ProductQuestion` and its
  requested relationship.
- **Reason:** Strong evidence for an adjacent organizational issue is not an
  answer to the user's Question.
- **Alternatives considered:** Blend relevance into confidence; lower
  confidence for adjacent answers; let the frontend repair the wording.
- **Why rejected:** Each alternative transfers or obscures epistemic meaning
  and can display authoritative confidence for an unrelated conclusion.
- **Consequences:** Failed relevance produces a Question-specific abstention,
  no customer-facing confidence, and a Question-aligned improvement action.
- **Affected gap:** `GAP-A-004`.
- **Status:** Active.

## DEC-PROD-016 — One canonical adapter owns frontend product integration

- **Decision:** Future frontend reads and supported mutations use
  `CanonicalProductWorkspaceAdapter`, which returns Product Workflow contracts
  after authorization and canonical Runtime composition.
- **Reason:** Fixture, shadow, new, and adopted Questions require one boundary
  that preserves identity, lineage, relevance, and confidence ownership.
- **Alternatives considered:** Permanent legacy view builders; frontend Runtime
  inspection; separate fixture/live adapters.
- **Why rejected:** Each creates semantic branches or duplicate ownership.
- **Consequences:** Legacy presentation remains a temporary active-route
  compatibility path only. Legacy Question adoption is deterministic, and
  historical Answer content fails closed unless the exact retained source
  resolves.
- **Affected gaps:** `GAP-A-001`, `GAP-A-002`, `GAP-A-003`.
- **Status:** Active.

## DEC-PROD-017 — Prove the frontend against product-safe fixtures first

- **Decision:** The first canonical frontend proof runs at the isolated
  `/product-alpha` review route and receives version-1 Product Workflow and
  approved integration contracts through one fixture adapter.
- **Reason:** Complete state, interaction, responsive, accessibility, and
  semantic-firewall review should precede live sandbox wiring.
- **Alternatives considered:** Replace `/your-organization`; import fixture
  catalogs directly into components; build a frontend view-model layer.
- **Why rejected:** They would risk active-route regression, scattered data
  ownership, or duplicate product meaning.
- **Consequences:** Components remain thin renderers. Switching to the
  canonical adapter is an adapter-boundary change, while Production promotion
  and permanent route naming remain separate review decisions.
- **Affected phase:** Phase 3.0.
- **Status:** Active.

## DEC-PROD-018 — Bind live frontend proof only through the canonical adapter

- **Decision:** `/product-alpha` may select `live-sandbox` only inside the
  validated onboarding-development environment. Its server boundary derives
  Clerk identity, validates exact `onb-dev-*` scope, authorizes before Runtime
  retrieval, and delegates all reads and writes to
  `CanonicalProductWorkspaceAdapter`.
- **Reason:** Real Question persistence and evidence updates must prove the
  Phase 3.0 component contract without creating a second semantic path.
- **Alternatives considered:** Client Runtime access; onboarding submission;
  legacy projection fallback; active-route replacement.
- **Why rejected:** Each weakens isolation, duplicates workflow ownership, or
  changes the already active product route.
- **Consequences:** Fixture remains the default, live failures never fall back,
  and only product-safe workspace contracts cross the server boundary.
- **Affected phase:** Phase 3.1.
- **Status:** Active.

## DEC-PROD-019 — External credentials have a dedicated secure owner

- **Decision:** Product-owned connectors persist encrypted OAuth credentials
  outside Organization Runtime. Product-safe connection metadata is separate
  from tokens; exact source passages enter cognition only through canonical
  evidence admission.
- **Reason:** Credentials are operational authority, not organizational memory.
  Runtime must preserve Evidence ancestry without becoming a secret store.
- **Alternatives considered:** Store tokens in Runtime; trust client tokens;
  create a connector-specific Answer path.
- **Why rejected:** They expose secrets, authorize too late, or duplicate
  cognition and Product Workflow.
- **Consequences:** Authorization precedes retrieval, revocation deletes local
  credentials and disables current access, historical lineage remains, and
  `ProductQuestionWorkspace` version 1 does not change.
- **Affected gaps:** `GAP-A-006`–`GAP-A-010`, `GAP-A-016`, `GAP-B-001`,
  `GAP-B-004`, `GAP-B-010`.
- **Status:** Active.

## DEC-PROD-020 — Development Runtime recovery restores identity, not history

- **Decision:** A validated onboarding-development operation may restore one
  missing filesystem Runtime shell for an exact existing authorized
  `onb-dev-*` organization using explicit operator-supplied organization
  metadata and separately persisted operational recovery lineage.
- **Reason:** The historical onboarding request ID establishes onboarding
  lineage but is not a permanent prerequisite of an already-created canonical
  organization identity. Ephemeral local Runtime loss must not require a new
  organization or fabricated history.
- **Alternatives considered:** Reconstruct the onboarding request ID; infer
  metadata from connector records; manually write Runtime JSON; create a new
  organization.
- **Why rejected:** These alternatives are unavailable, transfer authority to
  the wrong store, bypass canonical persistence, or change identity.
- **Consequences:** Recovery is development-only, authorization-first,
  filesystem-only, idempotent, and empty. It restores no Evidence, Questions,
  cognition, decisions, outcomes, learning, or insights. Production and
  onboarding behavior remain unchanged.
- **Affected gap:** `GAP-A-017`.
- **Status:** Active.

## DEC-PROD-021 — Connector Evidence identity is content-addressed

- **Decision:** Governed connectors separate stable external-source identity,
  repository source-version identity, bounded passage identity, canonical
  content-addressed Evidence identity, and organization/Question-scoped
  admission identity.
- **Reason:** Repository-native revisions can change without a material
  extracted-content change. Treating revision identity as Evidence identity
  duplicates cognition and inflates apparent corroboration.
- **Alternatives considered:** Ignore repository revisions; admit every
  revision and filter downstream; merge distinct external source records.
- **Why rejected:** They lose provenance, permit duplicate authority, or erase
  distinct source lineage.
- **Consequences:** New revisions remain visible to freshness and citations.
  Unchanged normalized content is not readmitted. Material changes create a
  new content version without deleting historical source-version lineage.
- **Affected gaps:** `GAP-A-008`, `GAP-A-010`, `GAP-B-004`, `GAP-B-010`.
- **Status:** Active.

## DEC-PROD-022 — Phase 2 optimizes for organizational understanding

- **Decision:** All product work after Phase 1.1 is governed by
  [PHASE_2_PRODUCT_ACCEPTANCE_SPEC.md](./PHASE_2_PRODUCT_ACCEPTANCE_SPEC.md).
  It must improve individual or collective organizational understanding rather
  than optimize for Answer production or workflow completion.
- **Reason:** Governed retrieval is valuable only when authorized Evidence
  improves truthful understanding and supports better decisions and learning.
- **Alternatives considered:** Maximize Answer coverage; optimize engagement;
  implement each downstream stage independently.
- **Why rejected:** These alternatives reward fabricated certainty, activity,
  or disconnected features rather than the product's organizational-learning
  purpose.
- **Consequences:** Confidence remains Answer-owned; Unknowns and competing
  explanations remain lineage-preserving product projections; recommendations,
  decisions, outcomes, learning, and Insights reuse existing authoritative
  owners. New or changed contracts still require version and migration review.
- **Affected phase:** Phase 2 and all later product phases.
- **Affected gaps:** `GAP-A-005`, `GAP-A-011`–`GAP-A-015`.
- **Status:** Active.

## DEC-PROD-023 — Organizational understanding has one canonical conceptual model

- **Decision:** Adopt
  [ORGANIZATIONAL_UNDERSTANDING_MODEL.md](./ORGANIZATIONAL_UNDERSTANDING_MODEL.md)
  as the canonical conceptual definition of organizational understanding.
  Questions, Answers, confidence, Recommendations, Decisions, Outcomes,
  Learning, and Insights inspect, improve, test, or revise that state through
  their existing authoritative owners.
- **Reason:** The concept was distributed across the Discovery Scorecard,
  research framework, product architecture, Runtime compatibility contracts,
  and workflow specifications. A single model is required to prevent Answer
  production, content volume, engagement, or a legacy numeric composite from
  becoming a substitute objective.
- **Alternatives considered:** Leave the definition distributed; make the
  legacy Runtime score the governing definition; define a new cognitive or
  persistence primitive.
- **Why rejected:** Distribution permits semantic drift. The legacy numeric
  object is a compatibility representation rather than product authority. A
  new primitive would duplicate existing canonical owners without evidence.
- **Consequences:** Product acceptance must identify whose scoped
  understanding improved and how. The Discovery Scorecard remains measurement
  authority, Product Architecture remains ownership authority, Runtime remains
  technical persistence authority, and existing cognition remains unchanged.
- **Affected phase:** Phase 2 and all later product phases.
- **Affected gaps:** `GAP-A-018`, `GAP-D-004`, and existing lifecycle,
  permission, freshness, and learning gaps.
- **Status:** Active.

## DEC-PROD-024 — Phase 2 product objects reuse mixed canonical persistence

- **Decision:** Adopt
  [PHASE_2_PRODUCT_OBJECT_CONTRACTS.md](./PHASE_2_PRODUCT_OBJECT_CONTRACTS.md)
  as the governing Phase 2 object contract. Answer and customer Confidence
  remain derived current projections backed by immutable ProductQuestion
  version references and confidence snapshots. Decision, Outcome review, and
  Learning reuse their existing durable canonical owners. Unknown,
  Recommendation lifecycle, correction/amendment events, and Insight
  qualification remain gated where a complete contract or benchmark does not
  yet exist.
- **Reason:** Existing architecture deliberately separates durable canonical
  records, event-backed lineage, operation receipts, and customer projections.
  Making every Phase 2 concept independently durable would duplicate authority
  and persistence.
- **Alternatives considered:** Create one new durable store for all Phase 2
  objects; treat all objects as recomputed projections; equate similarly named
  engine artifacts with product contracts.
- **Why rejected:** A parallel store violates Runtime and product ownership.
  Projection-only treatment loses required Decision, Outcome, and Learning
  history. Name equivalence would transfer semantics and confidence across
  boundaries.
- **Consequences:** Each object must pass its own identity, lifecycle,
  permission, lineage, idempotency, replay, and failure gates. No implementation
  may improvise an unresolved lifecycle. Runtime changes, if later proven
  necessary, require separate version and migration review.
- **Affected phase:** Phase 2 object-by-object implementation.
- **Affected gaps:** `GAP-A-011`–`GAP-A-015`, `GAP-A-018`, `GAP-B-004`,
  `GAP-B-005`, `GAP-B-012`–`GAP-B-014`, `GAP-D-004`.
- **Status:** Active.

## DEC-PROD-025 — Phase 2 lifecycle changes are additive and versioned

- **Decision:** Adopt the six lifecycle resolutions in
  [PHASE_2_PRODUCT_OBJECT_CONTRACTS.md](./PHASE_2_PRODUCT_OBJECT_CONTRACTS.md):
  Question-owned versioned events for Unknowns and Product Recommendations;
  additive amendment events for committed Decisions; linked
  `ExecutiveReview` versions for Outcome correction; a typed
  `ExecutiveLearning` evaluation result including explicit no-change; and
  ProductQuestion-linked emission/lifecycle events for Insights.
- **Reason:** Phase 2 requires stable identity, current projection, historical
  replay, and permission inheritance without rewriting existing records or
  creating a universal object store.
- **Alternatives considered:** Mutate current records in place; add the new
  event types silently to ProductQuestion schema version 1; create one new
  Phase 2 database/store; infer lifecycle changes from disappearance in a
  projection.
- **Why rejected:** These approaches corrupt history, break version
  interpretation, duplicate Runtime authority, or make resolution and
  no-change indistinguishable from omission.
- **Consequences:** ProductQuestion events require a version-2 dual-reader
  implementation for Unknown and Recommendation events. Decision amendments
  use additive Runtime events. Outcome and Learning receive additive versioned
  contract fields with legacy adapters. Insight emission and lifecycle use
  ProductQuestion-linked events. Existing records remain readable and require
  no destructive data migration.
- **Affected phase:** Phase 2A and later Phase 2 object implementations.
- **Affected gaps:** `GAP-A-011`–`GAP-A-015`, `GAP-A-018`.
- **Status:** Active.

## DEC-PROD-026 — Product Recommendations declare one primary purpose

- **Decision:** Discovery has two Product Recommendation purposes:
  `improve-understanding` and `advance-organizational-objective`. An
  Understanding Recommendation is the product-facing projection of an exact
  Phase 2C Confidence-Improvement proposal; its existing operation lifecycle
  remains execution and persistence authority. An Objective Recommendation
  requires an eligible Objective and disclosed Optimization Context. Every
  Recommendation has exactly one primary purpose; other value is represented
  only through typed secondary effects.
- **Reason:** Recommendation Optimization Experiment 001 found that safe
  objective-free actions were reversible understanding improvements, not
  business actions. Conflating the two purposes would let learning value bypass
  objective requirements or turn possible business value into an unsupported
  claim.
- **Alternatives considered:** Rename all Confidence-Improvement internals;
  use one ambiguous Product Recommendation category; infer purpose from action
  wording; introduce a third dual-purpose category.
- **Why rejected:** Renaming would rewrite stable internal semantics. Ambiguous
  or wording-derived purpose weakens eligibility. A third category permits
  secondary value to bypass the primary-purpose boundary.
- **Consequences:** Understanding Recommendation projection is additive and
  non-persistent. Objective Recommendation eligibility is read-only and
  fail-closed. Objective generation, Objective and Optimization Context
  persistence, Recommendation lifecycle activation, and Decision creation
  remain unimplemented.
- **Affected phase:** Phase 2C.2 and later Recommendation work.
- **Affected gaps:** `GAP-A-011`, `GAP-A-018`.
- **Status:** Active.

## DEC-PROD-027 — Objective and Optimization Context are the minimum business recommendation inputs

- **Decision:** Future Objective Recommendation eligibility composes an exact
  Organizational Understanding revision, one active authoritative Objective
  version, and Objective-specific Optimization Context. Objective authority is
  separate from epistemic confidence. Organizational and environmental facts,
  including operating condition, execution capacity, volatility, and risk
  capacity, remain in Organizational Understanding. Optimization Context owns
  governed preferences and references those facts. No separate Operating
  Context object is introduced.
- **Reason:** Phase 2D Experiment 001 covered 41 deterministic scenarios. The
  structured three-input architecture reached `1.000` synthetic disposition
  coverage. A separate Operating Context object added zero accuracy and reduced
  the complexity-adjusted score from `0.800` to `0.600`.
- **Alternatives considered:** Objective only; loose parameters; separate
  Operating Context; objective-first; understanding-first; universal defaults.
- **Why rejected:** They omitted authority, conflict, alternatives, governance,
  information value, or duplicated evidence-grounded state.
- **Consequences:** Both prerequisite contracts are designed and implemented
  together as separate immutable version histories in existing Runtime product
  events. The canonical adapter enforces organization authorization before
  Runtime access and requires injected exact-scope authority and reference
  resolution for writes. Existing Runtimes require no migration or backfill.
  Live authority-policy mapping, Objective discovery, Objective Recommendation
  generation, and frontend interaction remain unimplemented. Adaptive
  elicitation remains subject to live validation.
- **Affected phase:** Phase 2D and later Recommendation work.
- **Affected gaps:** `GAP-A-011`, `GAP-A-018`.
- **Status:** Active; Phase 2D.1 contract implementation complete.

## DEC-PROD-028 — Organizational Objective discovery is governed, hybrid, and adaptive

- **Decision:** Future Objective discovery will compose authorized declarations,
  admitted evidence, decisions, strategy, metrics, and Organizational
  Understanding conditions into temporary non-authoritative hypotheses. It
  will ask only the highest-value material clarification, separate authority
  from confidence, preserve conflict, and create a governed Objective only
  after exact scope and authority are confirmed. Material change triggers
  revalidation, never silent replacement.
- **Reason:** Objective Discovery Experiment 001 compared seven architectures
  across 42 deterministic scenarios. The governed hybrid preserved all material
  hypotheses and eliminated false governance after authority gating, while
  single-source inference lost conflict, currency, or authority. Adaptive
  elicitation matched full-questionnaire fixture correctness with substantially
  lower synthetic burden.
- **Alternatives considered:** Direct declaration; evidence, decision, strategy,
  or KPI inference; hypotheses without authority separation; fixed interview;
  full questionnaire.
- **Why rejected:** A statement is not necessarily authorized, observed behavior
  cannot establish authority, KPIs may be proxies, single sources miss conflict,
  and fixed or exhaustive interviews either miss material ambiguity or impose
  unnecessary burden.
- **Consequences:** Declared and observed objective signals are not new durable
  objects. Hypotheses remain non-authoritative projections. The implementation
  contract must define exact authority resolution, deterministic question
  selection, version creation, revalidation, permissions, and fail-closed
  behavior before persistence or Objective Recommendation generation.
- **Affected phase:** Phase 2D prerequisite research and later Objective contract
  implementation.
- **Affected gaps:** `GAP-A-011`, `GAP-A-018`.
- **Status:** Active research-backed design decision; implementation pending.

## DEC-PROD-029 — Material Information Acquisition is a non-persistent governed selector

- **Decision:** Product Workflow generalizes the existing Phase 2C proposal
  boundary into one read-only Material Information Acquisition selector. It
  compares action envelopes supplied by existing owners after authorization,
  governance, consent, scope, owner-availability, and safety gates. It returns
  one selected action, a preserved material tie, stopping, or abstention.
- **Reason:** Material Information Acquisition Experiment 001 compared ten
  strategies across 32 deterministic scenarios. The governed hybrid achieved
  `1.000` bounded choice and governance integrity and outperformed fixed,
  always-ask/search/measure/survey/experiment, information-gain-only, and
  organizational-value-only strategies.
- **Alternatives considered:** Separate selectors by action domain; a universal
  scalar utility; fixed priority rules; authorization as a score; a persistent
  planner; selector-owned execution and receipts.
- **Why rejected:** Separate selectors duplicate comparison logic. A universal
  scalar hides material tradeoffs. Authorization and governance cannot be
  compensated by value. Persistence or execution ownership would duplicate
  existing ProductQuestion, connector, Decision, Outcome, Evidence, and
  cognition lifecycles.
- **Consequences:** The selector uses bounded ordinal dimensions, dominance,
  explicit ties, truthful missing-value behavior, and sequential recomputation.
  Existing action owners retain initiation, cancellation, completion, failure,
  and receipts. No Runtime object or generic selection event is introduced.
  Calibration and focused validators are required before implementation.
- **Affected phase:** Post-Phase 2C research-to-product calibration.
- **Affected gaps:** `GAP-B-018`; autonomous execution remains `GAP-D-002`.
- **Implementation record:** Safe inactive shadow infrastructure and one
  owner-specific candidate-envelope/outcome-readiness path are implemented.
  Product Confidence Improvement retains future complete envelopes in its own
  version-3 events and observed outcomes in its own version-1 event family;
  historical version-2 receipts remain incomplete. No generic selector receipt,
  execution port, frontend path, or Production activation was added.
- **Status:** Active; selector activation remains blocked pending independent,
  outcome-backed live calibration.

## DEC-PROD-030 — Scoped governance is shared context, not role-owned truth

- **Decision:** Direct and derived Understanding disclosure, current-policy
  historical visibility, and Product Evidence contribution share one
  deterministic server-resolved governance context. It binds exact
  organization, subject, scope, operation/purpose, sensitivity, time, temporal
  mode, and current authority. Role labels and reporting hierarchy do not
  authorize access, promote contributions, or establish Evidence quality.
- **Reason:** The canonical multi-role benchmark supported one-model/multiple
  projection architecture but found incomplete scoped disclosure, historical
  visibility, and contribution contracts (GAP-MR-001 through GAP-MR-003).
- **Alternatives considered:** Role-specific models; frontend filtering;
  creation-time historical authorization; cached projection IDs as access;
  contribution that directly appends Evidence; hierarchy-based promotion.
- **Why rejected:** Each alternative duplicates truth or authorization,
  permits derived leakage, weakens revocation, or bypasses canonical Evidence
  and Runtime owners.
- **Consequences:** Scoped disclosure evaluates safe lineage before
  serialization. Historical reads re-evaluate current authority without
  rewriting history. Contribution evaluation creates no Evidence candidate,
  performs no admission, and causes no autonomous propagation. No Runtime
  migration is required. Product projection, authorized metric lineage, and
  decision-calibration projection remain separate open work.
- **Affected phase:** Discovery 2 production integration.
- **Affected gaps:** GAP-B-012 through GAP-B-014 and benchmark dependencies
  GAP-MR-001 through GAP-MR-006.
- **Status:** Active; foundational contracts implemented, downstream projection
  work blocked.

## DEC-PROD-031 — Metric inputs are authorized before scoped Product projection

- **Decision:** Product projection may disclose a precomputed canonical metric
  only after a server-resolved producer/version and every semantic input pass
  the shared scoped-governance and disclosure owners. The bounded metric result
  retains safe input lineage and separately evaluates value, count, delta,
  trend, rank, absence, and combination side channels. One Product-owned
  server adapter composes authorized Understanding items and metric results for
  every recipient without role-name authorization branches.
- **Reason:** The canonical multi-role benchmark identified incomplete
  recipient-authorized metric lineage (`GAP-MR-005`) as the dependency blocking
  a useful scoped Product projection (`GAP-MR-004`).
- **Alternatives considered:** Compute global metrics then filter; expose raw
  Runtime for frontend filtering; add role-specific formulas or models; treat
  missing lineage as unavailable; implement decision calibration in the same
  adapter.
- **Why rejected:** Those approaches permit restricted side channels, duplicate
  truth or metric ownership, collapse withheld into unavailable, or make the
  frontend responsible for governance and decision meaning.
- **Consequences:** Existing Organizational Understanding coherence and
  Organizational Learning Profile learning velocity are supported only when
  their exact canonical inputs and result side channels are authorized.
  Freshness, universal confidence, composite health, growth, and trend-ranking
  remain unsupported where the existing producer cannot safely accept scoped
  lineage without changing meaning. The adapter performs authorization before
  one bounded repository read, returns no raw Runtime, and records decision
  calibration as unsupported.
- **Ownership:** Canonical metric producers retain formulas and values; shared
  scoped governance owns eligibility; Product integration owns the
  non-persistent projection contract.
- **Persistence:** None. Existing Runtime remains canonical and no migration is
  required.
- **Affected phase:** Discovery 2 production integration.
- **Affected gaps:** GAP-MR-004 and GAP-MR-005 are production-closed by focused
  validation; GAP-MR-006 remains open.
- **Status:** Active backend contract; frontend implementation deferred.

## DEC-PROD-032 — Decision calibration is a governed advisory Product projection

- **Decision:** One distinct Product-owned producer projects an exact decision
  against exact server-resolved Objective and Optimization Context revisions,
  authority, Evidence, constraints, dependencies, experiment authority, and
  Outcome through the shared scoped-disclosure owner. It evaluates authority,
  strategic relationship, Evidence support, local feasibility, cross-scope
  effect, strategy-challenge potential, experiment status, and Outcome status
  independently before deriving a bounded calibration classification.
- **Reason:** `GAP-MR-006` showed that existing decision orchestration,
  comparison, ranking, recommendation, recording, lifecycle, and longitudinal
  judgment owners did not own recipient-safe scoped calibration meaning.
- **Alternatives considered:** A role-specific decision engine; a global
  analysis filtered after computation; an alignment score; hierarchy as truth;
  adding calibration logic to the adapter; changing decision ranking or
  recommendation semantics.
- **Why rejected:** Those alternatives duplicate canonical meaning, permit
  derived disclosure leakage, conflate authority with correctness, or make a
  transport boundary responsible for decision semantics.
- **Consequences:** The projection truthfully distinguishes aligned support,
  explicit staleness, justified divergence, sufficiently established
  unexplained drift, ambiguous intent, cross-scope conflict, local
  infeasibility, possible strategy invalidation, bounded experiment, and
  unauthorized action. Missing or protected meaning remains insufficient,
  withheld, or unavailable. It never scores, approves, rejects, executes,
  escalates, recommends, or mutates. Historical evaluation reuses current
  authorization and exact immutable revision references.
- **Ownership:** Existing decision, Objective, Optimization Context, Evidence,
  Outcome, Understanding, constraint, and authority owners retain canonical
  meaning. Product integration owns only the non-authoritative projection;
  the scoped Product adapter is its unchanged consumer.
- **Persistence:** None. No Runtime contract or migration changes.
- **Affected phase:** Discovery 2 production integration.
- **Affected gaps:** GAP-MR-006 production-closed; GAP-MR-001 through
  GAP-MR-005 remain closed. All six benchmark gaps have production-owner
  traceability.
- **Status:** Active backend contract; role-aware frontend may render this
  projection but must not recompute calibration.

## DEC-PROD-033 — Scope lineage is separate, immutable provenance

- **Decision:** Represent scope with a versioned organization topology,
  append-only source bindings, immutable Evidence attributions, and an additive
  derived-lineage index. Keep these objects outside existing source, Evidence,
  admission, investigation-fingerprint, and cognitive-object identities.
- **Reason:** `GAP-B-014` requires scope-aware Product inputs, while the legacy
  free-form source/Evidence scope string cannot retain typed multi-scope or
  revision lineage.
- **Boundary:** Scope grants no authority, changes no sensitivity, and does not
  imply containment-based disclosure. Existing scoped governance and
  disclosure remain authoritative.
- **Compatibility:** Explicit legacy compatibility can resolve only to the
  exact organization root. Non-root use fails closed without structured
  lineage.
- **Persistence:** The Runtime memory contract gains one optional additive
  index. No migration or identity rewrite is required.
- **Affected phase:** Discovery 2 production integration.
- **Status:** Canonical contracts and production propagation are implemented.
  Evidence admission resolves immutable attribution; Runtime evolution derives
  and persists lineage; scoped Product selection consumes producer output.
  Northstar population and replay remain deferred.
