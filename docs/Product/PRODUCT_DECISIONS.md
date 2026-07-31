# Discovery Product Decisions

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
