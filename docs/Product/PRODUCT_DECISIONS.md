# Discovery Product Decisions

## DEC-PROD-049 — Personas are governed application roles over one Organizational Understanding

- **Decision:** Discovery is the governed system through which an organization
  improves and changes its understanding. Its durable Product event is a
  governed change in Organizational Understanding or a justified, explicitly
  recorded non-change. Chief, Counsel, Operator, and Scout are governed
  application roles over one shared platform substrate; they are not separate
  agents, models, memories, truth stores, or authorization owners.
- **Product thesis:** Internally, Discovery is the governed system through which
  an organization changes its mind. This never means Discovery autonomously
  determines organizational truth. Rejected contributions remain rejected,
  disagreement and uncertainty may remain justified, and new information may
  correctly produce no canonical change.
- **Application roles:** Chief maintains attention, continuity, memory, what
  matters now, and consequential cognitive-commit boundaries; Counsel tests
  consequential theories, assumptions, strategies, and choices, represents
  competing explanations, and makes reconsideration conditions explicit;
  Operator connects choices to execution, signals, Outcomes, and Learning while
  preserving Decision authority; Scout detects material environmental change
  or missing Evidence and recommends targeted acquisition. A role name grants
  no authority.
- **Shared substrate:** All roles compose the existing Objective, Optimization
  Context, `ProductQuestion`, Source Content, Evidence, canonical cognition,
  Organizational Understanding, confidence, uncertainty, freshness,
  volatility, projection, Product Workflow, Prepared Work, Draft, Decision,
  Outcome, Learning, lineage, provenance, authorization, and governance owners.
  No persona-specific copy is permitted.
- **Alpha:** The first governed Leadership Conversation is Chief-led,
  Counsel-enhanced, minimally closed by Operator, and keeps Scout latent or
  bounded to uncertainty-linked acquisition recommendations. It remains one
  coherent `Set up → Prepare → Freeze → Capture → Review → What Changed →
  Prepare Again` workflow, not four products or an “AI executive team.”
- **Roadmap:** Alpha Leadership Conversation precedes Decision Learning,
  Strategy Integrity, State Transfer/New-Leader Understanding, Scout and
  Environmental Intelligence, and later composed application hypotheses.
- **Authority boundary:** No persona may mutate canonical Organizational
  Understanding outside an existing authorized operation. Generated persona
  output is not Evidence, Product Decision Draft is not Decision, and the
  conceptual cross-persona loop authorizes no external monitoring, autonomous
  action, hidden mutation, Production access, or implementation.
- **Status:** Canonical Product direction; documentation-only. Existing
  implementation and promotion gates remain controlling.

## DEC-PROD-050 — Contemporaneous Epistemic History is a first-class temporal substrate

- **Decision:** Contemporaneous Epistemic History is a first-class platform
  capability and a compounding strategic asset of Discovery. It preserves the
  authentic governed state and transitions known at a historical cutoff beneath
  every application role. It is not a fifth persona, transcript archive,
  Decision-provenance alias, separate memory system, reconstructed narrative,
  or new Organizational Understanding owner.
- **Invariant:** No later knowledge may alter the historical record of what was
  understood, uncertain, disputed, expected, accepted, rejected, or left
  unresolved at an earlier governed moment.
- **Three-state distinction:** Current Organizational Understanding is the
  present governed state. Contemporaneous Epistemic History is an immutable
  owner-backed historical package or exact canonical references frozen at the
  relevant moment. Retrospective Analysis is a later derived interpretation,
  labeled with its later basis and versions, and may never overwrite or
  impersonate the contemporaneous record.
- **Non-reconstruction:** Current reasoning over old documents, current
  Understanding substituted for an earlier revision, later Evidence or
  Outcomes applied before the cutoff, or a newer model, rubric, prompt,
  evaluator, or algorithm silently applied to old inputs cannot be presented as
  contemporaneous history.
- **Owner boundary:** The minimum foundation must reuse existing immutable
  snapshot, receipt, revision, history, Product Workflow, lineage,
  authorization, and governance owners. This decision creates no new semantic
  owner and authorizes no implementation.
- **Sequencing:** Establish the minimum historical foundation before substantial
  Chief, Counsel, Operator, or Scout behavior depends on historical semantics.
  The paused P2 current-access/history/reuse/Prepare Again work remains a
  distinct active technical-governance successor and must be reconciled rather
  than treated as complete.
- **Status:** Canonical strategic and architectural direction;
  implementation, Product surface, and promotion remain deferred.

## Northstar preparation-time lineage fixture provisioning

The Northstar preparation-time fixture uses an explicit server-only coordinator and existing canonical owners. Canonical local Source Binding owns source identity and scope; Governed Source Content owns exact bytes and immutable versions; canonical cognition and Runtime evolution own material and Organizational Understanding. The coordinator returns a target-independent immutable seed of owner-issued references and owns no semantic record. Runtime-digest aliases are not provenance, positive authorization is not stored in the seed, and P2 resumes only after this separate prerequisite is independently reviewed.

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
  Northstar replay and retained-Runtime reconstruction now pass. Populating the
  live adapter's scoped Product source from that canonical state remains deferred.

## DEC-PROD-034 — Investigation-local Evidence labels are qualified before canonical admission

- **Decision:** Preserve V3 investigation-local Evidence IDs unchanged, but
  derive an organization-bound, normalized-content `canonical-evidence:v2`
  identity before canonical scope admission. Version-2 admission identity uses
  that canonical identity rather than the local label.
- **Reason:** Separate investigations can both emit `E1`; using that label as
  organization-wide identity creates false admission and Runtime ancestry.
- **Deduplication:** Exact and formatting-only equivalent Evidence content
  retains one canonical identity; materially changed content and the same
  content in different organizations remain distinct. Multiple legitimate
  sources retain separate binding provenance.
- **Compatibility:** Historical v1 objects remain immutable. Ambiguous legacy
  local-label resolution fails closed, with no automatic rewrite or migration.
- **Boundary:** Investigation fingerprints, source/version identity, Evidence
  meaning, cognition, scope, authorization, disclosure, metrics, calibration,
  recommendations, and Product meaning do not change.
- **Status:** Implemented, synthetic-validated, and preserved through the
  deterministic Northstar reconstruction and retained-Runtime reload.

## DEC-PROD-035 — Recipient-scoped nested disclosure is governed before projection

- **Decision:** Select Model 2: recipient-audience governance resolves first;
  canonical Organizational Understanding disclosure owns recipient-specific
  claim and nested-field dispositions before projection.
- **Evidence:** 52 cases, five models, and 27 direct/combined-inference leakage
  channels produced a complete deterministic 7,020-cell matrix.
- **Boundary:** `composition.scope` remains subject scope. Source/Evidence scope
  remains provenance. Role and default-scope labels grant no authority.
- **Ordering:** Audience governance (D), forward lineage (C), then nested-field
  disclosure/projection contracts (B).
- **Compatibility:** Historical Runtimes remain immutable and fail closed
  without hidden existence signals.
- **Status:** Benchmark PASS; primary F, secondary B/C/D. Production unchanged;
  material role differentiation remains open.

## DEC-PROD-036 — Audience authority is a separate assignment-bound grant

- **Decision:** A versioned `RecipientAudienceGrant` bound to an exact current
  access-assignment identity and revision owns recipient-audience authority.
- **Coverage:** Exact scope and explicitly proven descendants only. Ancestors,
  siblings, initiatives without exact grants, missing relations, and
  cross-organization references fail closed.
- **Boundary:** Version 1 is limited to canonical Organizational Understanding,
  operation `receive`, and governed purpose `organizational-understanding`.
- **Lifecycle:** Immutable revisions; revoked or stale grants do not reactivate
  after access restoration. Future issuance requires explicit administrative
  authority and separate persistence.
- **Status:** Additive shadow contract and pure evaluator implemented and
  validated; no migration, live wiring, grant seeding, or Product change.

## DEC-PROD-037 — Audience-lineage production requires explicit audience semantics

- **Decision:** No production model is selected. A lineage producer may retain
  subject and provenance scope, but may not reinterpret composition,
  Explanation, source, or Evidence scope as a recipient-audience requirement
  without an explicit field-owned requirement or governed derivation rule.
- **Evidence:** The accounting-corrected oracle executes 20 truthful behavioral
  scenarios against five benchmark-only policies (100 exact cells), plus 58
  invariant assertions, six wrapper-only neutrality invariants, and four
  tamper validations. Every model violates at least one mandatory ownership or
  safety invariant. The sole repeated normalized input is an enumerated
  normalization-equivalence pair; unjustified repeats are zero. Both earlier
  digests and the original Model C result are superseded.
- **Accounting boundary:** Scenario-wrapper, raw producer-input, normalized
  producer-input, model-evaluation-input, producer-output, and model-output
  identities are separately stable-digested. Role, recipient, default scope,
  grants, presentation, case identity, and assertion metadata never enter a
  producer-input digest.
- **Version boundary:** `OrganizationalExplanation` has no explicit revision and
  its producer does not establish immutable identity as the version boundary.
  Lineage must record this as unresolved; it may not synthesize a revision.
- **Scope closure:** Source scope resolves from exact source bindings. Evidence
  scope resolves from the exact attribution. Their values may coincide because
  current attribution is derived from bindings, but their resolution paths and
  fields remain distinct. Every referenced binding must resolve exactly.
- **Compatibility:** The corrected contract remains pure, shadow-only, and
  unpersisted. No Runtime, grant, disclosure, projection, or Product behavior
  changed.
- **Affected gap and phase:** `GAP-B-014`, Phase 5 connected understanding.
- **Ordering:** Field audience-requirement governance is the earliest owner
  because the executed owner graph identifies it as an actionable root whose
  blocked-field set strictly contains every other actionable root's set.
  Completed Explanation immutable-version ownership derives as separate after
  failing shared semantic, mutation, production, version, and validation-owner
  checks. Condition/investigation production remains deferred because
  investigation references are downstream of unresolved condition scope.
- **Oracle integrity:** Final review found the earlier owner/task conclusion was
  still constant. Version 4 now derives normalized findings, graph, dominance,
  combined-task boundedness, registry key, and next task in one integrity-
  digested decision. Alternate-finding controls change or null the selection;
  missing registry entries fail closed.
- **Status:** Oracle correction A; producer classification F; hold for multiple
  producer gaps.

## DEC-PROD-038 — Organizational Understanding is the engine; Leadership Workspaces are the product

- **Decision:** Discovery's product north star is reducing the cognitive cost
  of leadership. The canonical experience begins with “What are you trying to
  accomplish?” and organizes recurring work through the initial Brief,
  Prepare, Explore, and Capture workspace hypotheses. Prepared Work Products
  become the intended primary manifestation of Organizational Understanding.
- **Reason:** Leaders repeatedly reconstruct context before meetings,
  planning, decisions, communication, and review. Discovery can create greater
  value by preparing that work from governed understanding than by centering
  dashboards, reports, retrieval, or chat.
- **Architecture boundary:** `ProductQuestion` remains the canonical long-lived
  product object; `ProductQuestionWorkspace` remains the canonical frontend
  boundary. Runtime, cognition, governance, authorization, Evidence, scope,
  confidence, Decision, Outcome, and Learning owners do not change. Workspaces
  and Prepared Work Products are compositions over those owners.
- **Alternatives considered:** Continue a retrieval-first product; make a
  dashboard or AI chat the primary surface; introduce a new workspace truth or
  persistence owner; expand immediately into industry-specific workspaces.
- **Why rejected:** These alternatives center access or presentation rather
  than leadership work, duplicate authority, or outpace customer evidence.
- **Consequences:** Product brainstorming is frozen while leadership workflow,
  governance, Prepared Work Product, and Decision Journey validation proceeds.
  Decision Readiness requires its own bounded contract and may not be inferred
  as a universal score. Environmental Intelligence remains a separate deferred
  model. No implementation, route, persistence, Runtime, or contract change is
  authorized by this decision.
- **Affected gaps:** `GAP-B-019`, `GAP-B-020`, `GAP-D-005`, `GAP-D-006`.
- **Affected roadmap:** Leadership Workspace strategy phases 1–7.
- **Status:** Active strategy decision; validation required before
  implementation.

## DEC-PROD-039 — Direct field-audience issuance security is a shadow governance primitive

- **Decision:** Accept the directly validated, content-addressed field-audience
  approval-policy, authorization, receipt-construction, and historical-validation
  chain as a shadow-only governance primitive.
- **Boundary:** The contract is unpersisted and unused by live Product code.
  Authority, approval, authorization, historical receipt, and current requirement
  lifecycle remain distinct. No Runtime, disclosure, projection, communication,
  presentation, route, or Product behavior changes.
- **Research separation:** Comparative ownership and temporal-model research is
  preserved on
  `research/field-audience-requirement-comparative-model-temporal-preservation-001`.
  It is noncanonical, establishes no accepted model or readiness result, and is
  not a closure gate.
- **Validation:** 47 direct-security cases, caller-control rejection,
  deterministic replay, and order invariance pass with classification A.
- **Next review:** `DISCOVERY POST-FIELD-AUDIENCE DIRECT-SECURITY GOVERNANCE
  OWNER-GRAPH RECONCILIATION 001` determines the next exact owner; no successor
  is canonized by this decision.

## DEC-PROD-040 — Pivot to shared Leadership Conversation validation while governance continues in parallel

- **Decision:** Accept `OWNER-GRAPH-B` and `PIVOT-A — PIVOT NOW`. No unique
  governance successor exists because the remaining actionable roots are
  independently governed and incomparable for the immediate target. Discovery
  will next validate a development-only, organization-wide Leadership
  Conversation Prepare-and-Capture vertical slice.
- **Product boundary:** `ProductQuestion` remains the long-lived workflow
  anchor. The future slice consumes the authorized
  `OrganizationalUnderstandingProjection` and introduces a versioned immutable
  Prepared Work Product only as a non-authoritative Product Workflow artifact.
  Upload interpretation creates proposals; only human-approved proposals may
  enter canonical Evidence or Product Workflow owners.
- **Authorization boundary:** The first slice is explicitly **Shared
  organization-wide preparation**. It makes no material CEO, Director, or
  Manager differentiation claim, exposes no Evidence bodies, and activates no
  field requirements, recipient grants, or nested disclosure.
- **Governance consequence:** Administrative persistence, completed Explanation
  immutable versions, Condition scope, confidence, uncertainty, contradiction,
  and evolution lineage remain open parallel roots. Full differentiated
  activation remains blocked by their downstream lineage, disclosure,
  abstraction, integration, and security-acceptance chain.
- **Implementation boundary:** This decision authorizes the next bounded
  Product-validation task, not route promotion or deployment. No new cognition,
  Runtime, organization identity, Question identity, Decision identity,
  confidence, or Evidence-authority owner is authorized.
- **Immediate task:** `DISCOVERY LEADERSHIP CONVERSATION PREPARE-AND-CAPTURE
  VERTICAL SLICE 001`.
- **Evidence:**
  [`POST_FIELD_AUDIENCE_OWNER_GRAPH_RECONCILIATION_001.md`](./POST_FIELD_AUDIENCE_OWNER_GRAPH_RECONCILIATION_001.md).
- **Affected gaps:** `GAP-B-019`, `GAP-D-005`; material role differentiation
  remains open under `GAP-B-014`.
- **Status:** Canonical Product-validation direction; implementation has not
  begun.

## DEC-PROD-041 — Canonize the ProductQuestion-anchored Leadership Conversation Prepare/Capture loop

- **Decision:** Canonize one generic Leadership Conversation contract and one
  deterministic recurring cross-functional Northstar acceptance scenario as
  Discovery's first Product wedge. The loop is Prepare → converse → Capture →
  human review → canonical admission → governed learning → truthful change or
  no-change → better future preparation.
- **Product laws:** Discovery prepares before requesting contribution, never
  starts from a blank page, creates no unnecessary documentation work, keeps
  human conversation human, captures understanding change rather than notes,
  never promotes uploads automatically, preserves existing canonical owners,
  uses progressive disclosure, preserves architectural simplicity, and earns
  expansion through evidence.
- **Identity and ownership:** `ProductQuestion` remains the long-lived anchor.
  `PreparedWorkProduct` is a bounded versioned Product Workflow artifact, not
  cognition, Evidence, Decision, authority, disclosure, confidence, or a second
  Question. Conversation uploads receive exact source receipts and create typed
  proposals; no generic Takeaway owner exists.
- **Human and Runtime boundary:** Approval is distinct from canonical admission;
  admission is distinct from Runtime evolution; evolution is distinct from an
  Organizational Understanding change. Uploaded prose and approval never
  directly mutate Runtime.
- **First-slice boundary:** Development-only shared organization-wide semantics;
  one stateful Question-centered workspace; no role differentiation, Evidence
  bodies, field-audience persistence, recipient grants, nested disclosure,
  route promotion, Production, connectors, transcription, Decision Readiness,
  or autonomous action.
- **Persistence boundary:** Question, context, Prepared Work Product versions,
  edits, frozen snapshot, source receipt, proposals, dispositions, admission
  receipts, Capture events, change receipt, and future-preparation linkage must
  survive deterministic reset/replay. Implementation planning must choose a
  bounded Product Workflow store and may not use Organization Runtime as
  generic document storage.
- **Evidence:**
  [`DISCOVERY_LEADERSHIP_CONVERSATION_PRODUCT_CONSTITUTION.md`](./DISCOVERY_LEADERSHIP_CONVERSATION_PRODUCT_CONSTITUTION.md),
  [`LEADERSHIP_CONVERSATION_PREPARE_CAPTURE_SPEC_001.md`](./LEADERSHIP_CONVERSATION_PREPARE_CAPTURE_SPEC_001.md), and
  [`LEADERSHIP_CONVERSATION_CONFLICT_REGISTER_001.md`](./LEADERSHIP_CONVERSATION_CONFLICT_REGISTER_001.md).
- **Affected gaps:** `GAP-B-019`, `GAP-D-005`; `GAP-B-014` remains open.
- **Architecture:** No architecture change. Existing canonical owners are
  composed and remain authoritative.
- **Status:** Canonical. Its governed exact Source Content prerequisite is
  implemented and validated; the Leadership Conversation implementation is
  preserved outside canonical main pending safe continuation.

## DEC-PROD-042 — Product Decision drafts are non-authoritative Product Workflow records

- **Decision:** Own versioned `ProductDecisionDraft` revisions and immutable
  operation receipts in Product Workflow while preserving the existing
  Executive Decision pipeline as the sole owner of actual Decisions.
- **Persistence:** Draft revisions are typed immutable events in authorized
  Organization Runtime event persistence. This use of Runtime storage is not
  Runtime cognition evolution and grants no organizational authority.
- **Operation boundary:** Create, revise, and read require exact authorization,
  deterministic identity, complete request-bound idempotency, optimistic
  concurrency, linear append-only history, and exact Question/Answer ancestry.
  Malformed, cross-organization, ambiguous, duplicate, or branched histories
  fail closed.
- **Receipt boundary:** A successful operation returns an immutable receipt
  re-derived from the actually persisted event. Exact replay returns the
  original canonical receipt; conflicting key reuse is rejected.
- **Projection boundary:** The ProductQuestion workspace may disclose active or
  superseded draft state as available, unavailable, or withheld. It does not
  interpret Runtime internals or create a Decision.
- **Exclusions:** No Decision promotion, actual Decision creation, Outcome
  creation or routing, cognition evolution, route promotion, connector access,
  or Production activity is authorized.
- **Evidence:**
  [`DISCOVERY_PRODUCT_DECISION_DRAFT_OPERATION_AND_IMMUTABLE_RECEIPT_001.md`](./DISCOVERY_PRODUCT_DECISION_DRAFT_OPERATION_AND_IMMUTABLE_RECEIPT_001.md).
- **Affected gap:** `GAP-A-012` remains open for promotion and commit through
  the existing Executive Decision pipeline.
- **Architecture:** No architecture change; existing Product Workflow, Runtime,
  ProductQuestion, authorization, and Executive Decision owners are composed.
- **Status:** Canonical bounded draft prerequisite implemented and validated.

## DEC-PROD-043 — Canonical local Source Bindings use the existing lineage owner and Runtime index

- **Decision:** Register, resolve, revoke, and restore local Source Bindings
  through the existing canonical scope-lineage owner. Persist canonical state
  only in `OrganizationRuntime.memory.canonicalScopeLineageIndex` and immutable
  operation records in existing Runtime events.
- **Compatibility:** Index version 2 retains the complete canonical topology.
  Historical version-1 indexes remain readable and are not rewritten or given
  invented topology; new governed local operations fail closed without v2
  topology.
- **Operation boundary:** Exact scoped authorization precedes Runtime access.
  Deterministic identity, request-bound idempotency, optimistic concurrency,
  immutable availability successors, and integrity-checked receipts are
  required.
- **Exclusions:** Source Content retains bytes and content facts only. Product
  Workflow retains receipt references only. Registration creates no Evidence,
  admission, cognition, Understanding change, connector behavior, or route.
- **Evidence:**
  [`DISCOVERY_CANONICAL_LOCAL_SOURCE_BINDING_REGISTRATION_PERSISTENCE_AND_IMMUTABLE_RECEIPT_001.md`](./DISCOVERY_CANONICAL_LOCAL_SOURCE_BINDING_REGISTRATION_PERSISTENCE_AND_IMMUTABLE_RECEIPT_001.md).
- **Affected gap:** `GAP-B-019` remains open for the complete Leadership
  Conversation slice; its fresh-process local Source Binding prerequisite is
  resolved.

## DEC-PROD-044 — Leadership Conversation routes through actual canonical owners

- **Decision:** Accept the development-only, ProductQuestion-anchored
  Leadership Conversation Prepare–Capture–Prepare slice and its typed canonical
  owner router under `GAP-B-019`.
- **Composition:** Canonical server composition constructs authorization,
  repositories, services, adapters, clock, and deterministic helpers internally.
  Route and React boundaries cannot supply canonical identities, receipts,
  revisions, change classifications, or dependency objects.
- **Owner boundary:** Evidence uses the exact operation-bound zero/one/many
  admission result; Decision Draft, Unknown, and follow-up Question routes use
  their actual existing owner results. Typed Product receipts record only the
  routing fact and grant no new authority.
- **Replay boundary:** Exact Class 2 duplicate Evidence skips cognition and
  leaves Understanding unchanged; material Evidence continues through
  cognition. Idempotent re-entry creates no duplicate canonical or Product
  Workflow records.
- **Proof:** Three fresh processes persist, reload, and cryptographically bind
  preparation, freeze, Source Binding, Source Content, upload, proposal,
  disposition, actual-owner routing, and future preparation artifacts.
- **Exclusions:** No generic Outcome routing, Decision promotion, role
  differentiation, field-audience activation, route promotion, Production,
  connector, or Google Drive activity.
- **Evidence:**
  [`DISCOVERY_LEADERSHIP_CONVERSATION_TYPED_CANONICAL_OWNER_ROUTING_AND_SERVER_COMPOSITION_001.md`](./DISCOVERY_LEADERSHIP_CONVERSATION_TYPED_CANONICAL_OWNER_ROUTING_AND_SERVER_COMPOSITION_001.md).
- **Affected gap:** `GAP-B-019` is resolved as `GAP-R-012` for the bounded development slice;
  Production hardening and customer validation remain separate.
- **Architecture:** No architecture change; existing canonical owners remain
  authoritative.
- **Status:** Canonical bounded implementation, independently validated.
- **Architecture:** No new owner or repository; existing scope lineage and
  Runtime persistence are composed.
- **Status:** Canonical bounded prerequisite implemented and validated.

## DEC-PROD-045 — Governed cognition admits only source-bound Evidence

- **Decision:** Governed `runDiscoveryV3` cognition constructs its Evidence
  population only from source-bound `evidenceSources` and supplies that same
  ordered collection to canonical admission.
- **Framing boundary:** Company, website, industry, ProductQuestion, and
  investigation context remain non-Evidence framing. They receive no Evidence,
  Source Binding, admission, material-support, or governance-lineage identity.
- **Compatibility:** The deterministic governed case is 16/16 with zero
  framing Evidence and zero missing material references. Legacy ungoverned
  Engine behavior remains compatible at 21 records.
- **Admission result:** All sixteen eligible governed records produce the
  existing `admitted` disposition. `partially-admitted` remains supported but
  is not fabricated from framing omissions.
- **Architecture:** No canonical identity, owner, Runtime schema, Explanation,
  Product, frontend, or material-support policy changes.
- **Evidence:**
  [`DISCOVERY_CANONICAL_MATERIAL_EVIDENCE_ORIGIN_ADMISSION_ENVELOPE_COMPLETENESS_AND_EXPLANATION_LINEAGE_RECONCILIATION_001.md`](./DISCOVERY_CANONICAL_MATERIAL_EVIDENCE_ORIGIN_ADMISSION_ENVELOPE_COMPLETENESS_AND_EXPLANATION_LINEAGE_RECONCILIATION_001.md).
- **Status:** Canonical prerequisite implemented and independently validated.

## DEC-PROD-046 — Current eligibility follows immutable Understanding lineage and precedes Product cognition

- **Decision:** Keep cross-operation canonical ancestry immutable and pure.
  Resolve current disclosure eligibility through one explicit server-owned
  Understanding-domain operation before the scoped Product projection.
- **Owner boundary:** Existing Source Binding and scoped-authorization owners
  retain availability, revocation, subject, purpose, scope, sensitivity, and
  temporal authority. The eligibility operation only composes their current
  results with immutable material ancestry; Product and personas own none of
  those decisions.
- **Result:** The version-1 result is `eligible`, `withheld`, or `unavailable`.
  Any unavailable material branch takes precedence over a proven withheld
  branch; ambiguity never becomes eligibility.
- **Projection boundary:** The authorized projection verifies exact
  organization, subject, purpose, scope digest, sensitivity, evaluation time,
  authorization-context revision, canonical Understanding revision, and result
  integrity. Only an eligible result can reach Product cognition.
- **Revocation:** Current Source Binding or subject revocation is re-resolved
  without rewriting Theory, Explanation, composition, or ancestry history.
  Historical incomplete Runtime state is denied rather than migrated or
  treated as authorized.
- **Proof:** Four fresh processes exercise actual Runtime evolution, canonical
  admission, Theory and Explanation owners, composition, authorized projection,
  persisted revocation, reload, candidate validation, and repository CAS loss.
- **Evidence:**
  [`DISCOVERY_CANONICAL_UNDERSTANDING_LINEAGE_TO_CURRENT_ELIGIBILITY_COMPOSITION_AND_REVOCATION_OWNER_BOUNDARY_001.md`](./DISCOVERY_CANONICAL_UNDERSTANDING_LINEAGE_TO_CURRENT_ELIGIBILITY_COMPOSITION_AND_REVOCATION_OWNER_BOUNDARY_001.md).
- **Architecture:** Additive versioned governance composition; no Runtime schema,
  cognition owner, identity owner, authorization owner, or frontend contract is
  introduced.
- **Status:** Canonical bounded implementation, independently validated.

## DEC-PROD-047 — New material Explanations require operation-bound canonical lineage

- **Decision:** A governed Product contribution uses a server-derived operation
  context and an Engine-owned version-1 mapping envelope. Every new material
  Explanation must persist the deterministic union of direct current-operation
  Evidence lineage and inherited canonical Theory ancestry.
- **Owner boundary:** Product commits only the routing/operation result and
  envelope digest. Engine owners retain Evidence, admission, mapping, Theory
  ancestry, Explanation lineage, cognition, and Runtime authority.
- **Failure boundary:** Missing, ambiguous, stale, foreign, cyclic, or
  incomplete material lineage fails before composition construction and
  Runtime replacement. Product success is recorded only after canonical
  Runtime CAS succeeds.
- **Current governance:** Immutable lineage is resolved through the existing
  current-eligibility owner before scoped authorized projection and Product
  cognition. Historical pre-lineage state remains unavailable.
- **Proof:** Independent cryptographic oracles and thirteen fresh processes
  cover actual persistence, reload, revocation, candidate failure, CAS loss,
  and deterministic retry.
- **Evidence:**
  [`DISCOVERY_CANONICAL_EXPLANATION_OPERATION_BOUND_MATERIAL_LINEAGE_COMPLETENESS_AND_VALIDATOR_RECONCILIATION_001.md`](./DISCOVERY_CANONICAL_EXPLANATION_OPERATION_BOUND_MATERIAL_LINEAGE_COMPLETENESS_AND_VALIDATOR_RECONCILIATION_001.md).
- **Architecture:** Additive governed composition; canonical identities,
  top-level Runtime schema, authorization owners, Product frontend, and routes
  are unchanged.
- **Status:** Canonical bounded implementation, independently reviewed.

## DEC-PROD-048 — Protected Product artifact bodies use owner-specific split persistence

- **Decision:** Persist the bodies of exactly four protected Product artifact
  classes—Prepared Work, frozen snapshot, What Changed, and Product Decision
  Draft—through their existing canonical owners. Persist only content-free
  identity, lifecycle, governance, lineage, integrity, and body-reference
  metadata in Product Workflow or Runtime records.
- **Owner boundary:** The neutral protected-body repository owns immutable
  bytes and exact identity-to-body references only. Prepared Work and frozen
  snapshot remain Leadership Conversation Product owners; What Changed remains
  canonical materialization output; Product Decision Draft remains the Draft
  owner. The repository does not own artifact semantics, authorization,
  current access, revisions, workspace composition, or history.
- **Commit boundary:** Each body is staged durably before its canonical owner
  CAS. Same identity and same body is exact replay; same identity and different
  body fails closed. A failed owner CAS can leave an unreachable staged blob
  but cannot expose a committed artifact without a durable body reference.
- **Derived-state boundary:** `ProductQuestionWorkspace` and Leadership History
  remain derived, non-persisted projections. Workflow reuse and materialization
  stage receipts remain content-free records. Legacy combined body-bearing
  records fail closed rather than being silently migrated.
- **Disclosure boundary:** Persistence grants no access. Current authorization,
  metadata inspection, protected body reads, delivery, history/reuse, and
  Prepare Again remain the separately gated successor and are not implemented
  by this decision.
- **Affected gap:** `GAP-B-019`; this closes the bounded owner-specific split-
  persistence prerequisite without promoting the development route.
- **Architecture:** No architecture change. Existing Product artifact owners,
  Runtime CAS owners, Product Workflow CAS, and authorization owners remain
  authoritative.
- **Status:** Canonical bounded prerequisite implemented and validated.

## DEC-PROD-051 — Product artifact delivery reauthorizes current access before protected-body reads

- **Decision:** Deliver Prepared Work, frozen snapshots, What Changed, and
  Product Decision Draft bodies only after metadata-only inspection and a
  fresh, integrity-bound current-access decision. A permitted delivery performs
  exactly one intended protected-body read; every denied branch performs zero.
- **Owner boundary:** Existing Source Binding, authority, policy, eligibility,
  projection, artifact, and protected-body owners remain authoritative.
  Product orchestration composes their results but owns no permission,
  cognition, material lineage, or historical truth.
- **Draft publication:** Every new split-body Product Decision Draft binds
  completed owner-backed inspection metadata, protected-body identity,
  immutable Northstar material lineage, receipt, event, idempotency state, and
  Draft-stage receipt through the existing Draft owner CAS. No second CAS or
  post-write repair is permitted.
- **Reuse and Prepare Again:** Current-authorized artifact history and derived
  workspace projections remain non-persistent. Seven-state Prepare Again
  reauthorizes every predecessor and proves denied material has zero influence
  on successor publication.
- **Recovery:** Canonical mutation, Draft, and Product Workflow stages retain
  truthful committed/pending results. Exact retry reloads durable receipts and
  never reruns cognition or duplicates an owner record.
- **Historical limit:** This decision does not implement contemporaneous
  epistemic checkpoints or retrospective historical reconstruction; that
  remains `GAP-B-021`.
- **Affected gap:** `GAP-B-019` bounded delivery successor.
- **Architecture:** Additive composition through existing owners; no Runtime
  schema, canonical cognition, Decision authority, or persisted workspace
  change.
- **Status:** Bounded current-access delivery implemented and validated; the
  separate historical-foundation limit remains explicit.

## DEC-PROD-052 — Canonical Organizational Understanding owns confidence and uncertainty revisions

- **Decision:** Confidence and uncertainty are immutable epistemic revision
  semantics of canonical Organizational Understanding under stable semantic
  identity. The exact scoped mutation operation is
  `organizational-understanding:revise-confidence-uncertainty`.
- **Reason:** A changed confidence assessment must update current canonical
  state without manufacturing a new conclusion or a second confidence owner.
- **Consequences:** Same conclusion with changed confidence or uncertainty
  creates a new predecessor-bound revision, owner event and receipt through one
  Runtime CAS. Conclusion change remains separately governed. Basis-only
  changes are not authorized by this operation.
- **Compatibility:** Historical records remain readable without fabricated
  confidence history or retained-Runtime migration.
- **Affected gap:** `GAP-B-021`, first prerequisite only.
- **Status:** Implemented for independent review; lifecycle linkage remains
  unimplemented.

## DEC-PROD-053 — Executive History current access is an exact-record disclosure decision

- **Decision:** A content-free Executive History access owner binds immutable
  Review and Learning identities to versioned shared policies. Observed Outcome
  access inherits the exact parent Review binding; Learning has its own binding.
- **Authorization:** `leadership-history:read`, organization membership, persona,
  current assignment, and governed scope are prerequisites, never final record
  grants. The exact binding and current policy revision make the final decision.
- **Disclosure:** Every semantic read authorizes before loading Runtime. Missing,
  pending, stale, expired, revoked, cross-organization, wrong-parent, and
  mismatched-purpose requests are indistinguishably inaccessible.
- **Lifecycle:** Binding creation is pending until its existing semantic owner
  commits. Post-CAS activation failure is explicitly recoverable without
  repeating semantic creation. Revocation changes current disclosure only;
  restoration is append-only and historical Review/Learning remains immutable.
- **Persistence:** Local filesystem and deployed Blob repositories persist stable,
  integrity-bound, CAS-protected policy/binding history across process restart.
  Filesystem replacement uses per-organization inter-process exclusion and
  expected-revision comparison under the lock; exact replay may return the
  persisted winner, while divergent or forked writers fail closed. No Review,
  Outcome, Learning, Evidence, Runtime, or cognition body is stored.
- **Projection:** Server composition may emit only the versioned, deterministic,
  body-free safe projection after successful authorization and owner load.
  Inaccessible missing and denied states serialize identically.
- **Legacy:** Existing unbound history is inaccessible. Reads never manufacture
  bindings; any future registration requires a separately governed operation.
- **Affected gaps:** bounded prerequisite for `GAP-C-004` and `GAP-B-021`.
- **Architecture:** Additive disclosure owner; existing Review, Outcome, Learning,
  Runtime, scoped-governance, and Product owners remain authoritative.
- **Status:** Implemented for independent review. The preserved L1 candidate is
  neither accepted nor corrected and requires post-integration reconciliation.

## DEC-PROD-054 — Prepared Work publication carries body-free governed material lineage

- **Decision:** Preparation and freeze publish a versioned, body-free material
  lineage envelope obtained from the canonical Northstar preparation-lineage
  owner. The envelope binds the exact organization, Question, scope, purpose,
  sensitivity, Source Binding, Source Content revision, Evidence basis, and
  projection basis used for the artifact.
- **Authority:** The server resolves and validates lineage after scoped
  authorization. Callers cannot supply, replace, broaden, or repair lineage,
  and fixture composition cannot become the canonical owner.
- **Atomicity:** Protected body persistence may be staged first, but the
  Prepared Work header and its complete lineage publish together through the
  existing Product Workflow CAS. Freeze validates the published preparation
  lineage and retargets it to the immutable checkpoint in the same freeze CAS.
- **Disclosure:** Headers, events, idempotency records, and frontend-safe
  metadata contain identifiers and digests only. Source Content and Evidence
  bodies, Runtime cognition, grants, and authorization objects remain behind
  their canonical owners.
- **Compatibility:** Legacy Prepared Work remains readable, but missing or
  incomplete lineage cannot establish current access, historical eligibility,
  reuse authority, or checkpoint completeness.
- **Affected gap:** bounded prerequisite for `GAP-B-021`.
- **Status:** Implemented for independent review; it does not itself complete
  historical checkpoint lifecycle linkage.

## DEC-PROD-055 — Product Workflow owns bounded content-free Historical Checkpoint relationships

## DEC-PROD-056 — Preserve semantic richness and compress mechanical variety

**Status:** Accepted — roadmap and governance decision; implementation not begun.

Discovery will keep canonical semantic owners independent while converging
repeated infrastructure toward a thin waist of canonical record references,
exact-record access evaluation, governed operations, typed relationships,
permission-aware projections, and provider adapters. Shared protocols cannot
erase owner-specific lifecycle, authority, confidence, lineage, persistence,
or revocation semantics.

Ordinary capabilities default to Projection, Workflow composition, or Derived
Analysis. New canonical records require durable semantic-state and lifecycle
proof. New platform primitives require independently approved repeated
consumers and executable conformance. Both require explicit proof that
composition is insufficient and expected Product value exceeds enduring
architecture cost. Scores are heuristic; invariants are gates.

The near-term Product remains the narrow Chief-led Alpha over shared
Organizational Understanding. Counsel, Operator, and Scout participate only in
bounded roles; they do not create autonomous agents, persona-specific truth, or
parallel organizational memory. Architecture-compression implementation is
separately authorized work and is not implied by this decision.

### Thin-waist invariant freeze

The thin waist is the smallest stable set of feature-independent mechanical
invariants through which domain-owned capabilities compose safely. An invariant
does not imply one shared implementation, repository, service, data model, or
migration. Existing domain implementations remain valid when they satisfy the
same narrow contract and preserve owner-specific validation.

The frozen invariant set is:

1. exact organization confinement and organization-scoped addressability;
2. authorization and current-access evaluation before protected loading;
3. absent/foreign/denied non-disclosure at safe boundaries;
4. permission-aware, body-safe projection;
5. canonical owner-issued identity plus version, revision, digest, lineage,
   and immutable provenance rules;
6. trustworthy persistence with atomic replacement and expected-revision
   conflict protection;
7. same-input idempotent replay, different-input collision rejection, and
   deterministic reconstruction;
8. authenticated governed-operation identity and immutable result receipts;
9. real-process concurrency, restart, and residue validation.

Historical relationships, checkpoint meaning, Source Binding, publication
proof, Product Workflow transitions, domain events and receipts, confidence,
Evidence, Decision, Outcome, Learning, and valid semantic transitions remain
domain-owned. Chief, Counsel, Operator, Scout, Prepare, Freeze, Capture, Review,
What Changed, Prepare Again, private working state, and instrumentation remain
above the waist.

Admission requires either two independently valuable capability consumers or a
hard first-use necessity for organization confinement, authorization,
non-disclosure, identity, lineage, replay, concurrency, or consistency. The
security exception must identify the exact failure prevented and may not be
used as general architecture discretion. Repeated code and neatness are
insufficient. Every candidate must exclude Product/persona/meeting semantics,
preserve domain validation, expose a narrow stable contract, and demonstrate
positive feature value after implementation, migration, validation,
governance, review, and coupling costs.

Accepting an invariant does not promote shared code. Any permanent shared
implementation still requires frozen objectives and baseline, a feature-value
hypothesis and cost model, negative controls, benchmark or equivalent evidence,
independent review, explicit human authorization, and canonical integration.
Existing owners are not migrated without concrete Product need, a bounded
owner-specific plan, semantic/regression proof, and positive value. Broader
waist expansion is frozen through the initial design-partner Alpha unless real
user evidence identifies a repeated need or a hard invariant gap.
- **Decision:** Product Workflow owns only content-free lifecycle relationships from frozen Leadership Conversation checkpoints to Product Decision Draft, Executive Review, observed Outcome through its owning Review, and Executive Learning.
- **Access:** Publication and current read independently resolve current access to the checkpoint and exact linked endpoint. Exact scope is required and containment is non-authoritative.
- **Persistence:** Relationship, immutable receipt, typed event, request fingerprint, and idempotency result commit in one inter-process-safe Product Workflow CAS.
- **Authority:** Relationships grant no endpoint authority and do not promote Drafts, Decisions, Reviews, Outcomes, Learning, or Understanding ownership.
- **Disclosure:** Lists are body-free and detail authorizes before exact protected loads; inaccessible and absent relationships are indistinguishable at the safe projection boundary.
- **Exclusions:** Authoritative Decision linkage, expected Outcome/signal, supersession, universal graphs, ordinary frontend delivery, and Architecture Compression remain deferred.

## DEC-PROD-057 — Chief Alpha activates through one recurring meeting and explicit private contribution

**Status:** Accepted — canonical Alpha activation and initial design-partner
boundary.

- **Activation:** One authorized user, one recurring consequential meeting, and
  one material `ProductQuestion` are the minimum wedge. First-session utility
  precedes organizational administration or contribution requests.
- **Initial user:** One VP, Director, or executive. VP Sales is the leading
  design context, while Product contracts and acceptance remain
  industry-agnostic.
- **Composition:** Three-minute preparation, private working state, two-minute
  closure, and the mandatory second cycle reuse existing Prepared Work,
  Product Workflow, contribution, Historical Checkpoint, Decision Draft,
  Outcome, Learning, and current-access owners.
- **Privacy:** Private reasoning remains private Product working state unless
  intentionally selected for governed submission. It has no Evidence,
  Understanding, Decision, Learning, employee-evaluation, or authorization
  authority by itself.
- **History:** Intelligent carry-forward composes exact prior checkpoints and
  existing lifecycle owners. It creates no `CarryForward`, Meeting Brief, or
  user-truth owner.
- **Acceptance:** Two cycles around the same meeting and Question must show the
  second preparation is materially better because authorized context from the
  first was preserved.
- **Ethics:** Discovery creates asymmetric preparedness through authorized
  Evidence, continuity, and better reasoning—not asymmetric access to truth,
  surveillance, colleague scoring, loyalty prediction, or manipulation.
- **Sequence:** The complete two-occurrence loop is `Activate → Prepare →
  Private Working → Intentional Contribution → Freeze → Capture → Review → What
  Changed → Prepare Again`.
- **Chief behavior:** Chief organizes attention around consequential change,
  material uncertainty, contradiction, and unresolved commitments. It states
  what is unknown and may recommend bounded Evidence acquisition through the
  existing selector; it may not imply certainty, initiate acquisition, or
  create an autonomous chief-of-staff authority.
- **Readiness:** The roadmap's Alpha Control Tower is a status projection over
  canonical gates, not a dashboard or owner. Initial numeric thresholds remain
  proposed and require human approval before they become acceptance criteria.
- **Sequencing:** Candidate-1 controlled reconstruction precedes any HSS-ONE
  resumption. The Discovery-on-Discovery loop is parallel and non-blocking.
