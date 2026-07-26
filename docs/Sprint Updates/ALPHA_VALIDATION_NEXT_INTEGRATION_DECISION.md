# Discovery Alpha Validation and Next Integration Decision

**Decision date:** 2026-07-25

**Sprint type:** Read-only reconstruction and product-integration decision

**Decision:** Build a bounded Organizational Understanding projection shadow
before any human-readable or active product projection

**Implementation status:** Superseded in scope by the source-preserving
projection shadow; see
`ORGANIZATIONAL_UNDERSTANDING_PROJECTION_SHADOW.md`

**Current milestone:** The source-preserving projection and inactive
compatibility adapter are complete as the Discovery Projection Foundation.
The next recommendation is now a read-only Product Communication and Priority
Contract Decision Sprint. This document does not authorize readable synthesis,
disclosure-decision production, or route activation.

## Repository State

### Git state

- Current branch: `sprint-79-organization-experience`
- Current HEAD: `e39be469bfbb02bf846546c515606d33110e5403`
- HEAD subject: `Canonize Discovery 2 foundation milestone`
- Milestone relationship: HEAD is the named milestone commit. There are no
  later commits.
- Initial working-tree state before this document was created: clean. This
  document itself remained untracked at the beginning of the projection shadow
  sprint.
- The read-only decision sprint changed only this decision document. It did not change
  production code, Runtime state, benchmarks, generated registries, or existing
  handoff documents.

### Reconstructed project state

Discovery is a governed shared organizational intelligence platform. The
Organization Runtime is the canonical technical persistence boundary. The
Organization Model is the living product representation, and the Operating
Model is its primary operational representation. The Executive Cognitive
Operating System is an application of this platform, not the universal owner
of organizational truth.

The current ownership path is:

```text
Evidence and upstream cognition
        ↓
Completed Organizational Explanations
        ↓
Canonical Organizational Understanding
        ↓
Authority and disclosure decisions
        ↓
Assessment, recommendation, research, simulation, and other applications
        ↓
Communication and projection
        ↓
Product experience
```

Completed Organizational Explanations own their structured claims, ancestry,
assumptions, comparative Evidence roles, viability, and Explanation-level
uncertainty. Canonical Organizational Understanding owns governed composition:
organization and scope, outcome identity, exact Explanation membership,
composition uncertainty, authority receipt, revision continuity, and reusable
organizational truth. It references Explanations and does not copy their
claims or ancestry. Executive Assessment is a downstream consumer. The
assessment-derived `currentUnderstandings` collection remains a bounded
compatibility view.

The Discovery 2 foundation contains:

- active deterministic comparative Evidence roles;
- production completed Explanations that remain `unadjudicated`;
- a validated but inactive completed-Explanation adjudication shadow;
- a validated unadjudicated Explanation-aware Understanding shadow;
- canonical Organizational Understanding ownership and historical
  compatibility;
- explicit authority-transition receipts;
- a fail-closed, read-only disclosure contract whose application activation
  remains blocked;
- the Phase 8A partial Runtime-backed `Your Organization` integration;
- DEPS reporting and the Organizational Understanding Research Framework.

The foundation does not contain a canonical candidate-relative test-result
producer, activated disclosure-decision producer, generalized Intelligence
Scope, production nonlinear cognition, persisted Evidence bodies suitable for
display, or complete product projection parity.

## Current Runtime-Backed Experience

### Data-flow map

```text
Persisted organization Runtime
  loadOrganizationRuntimeState(organizationId)
        ↓
Runtime memory
  canonicalCompositions
  organizationalExplanations
  organizationalUncertainty
  organizationalConditions
  organizationalState
  investigationOpportunities
  learning and evolution records
        ↓
buildRuntimeOrganizationView(runtime)
  selects the first composition
  resolves exact Explanation IDs
  extracts optional display strings
  de-duplicates and limits items
  emits explicit unavailable states
        ↓
buildUnifiedExecutiveWorkspaceView(runtime)
  makes canonical sections the primary insight source
  preserves compatibility-derived model, actions, and application panels
  explicitly withholds canonical confidence
        ↓
UnifiedExecutiveWorkspace
  top insight and Organization Model
  Think, Decide, Experiment, and Brief panels
  nine-card Runtime details region
        ↓
User-visible Your Organization workspace
```

Runtime loading is server-side and organization-ID scoped. A Runtime is
available to the product only when its identity is valid and it has at least
one investigation. The Phase 8A adapter is pure and does not mutate Runtime.
The persisted Atlas replay validator proves deterministic repeated loading and
projection.

### Authoritative source map

| Visible section | Authoritative source | Transformation and status | Action and persistence | Disclosure |
| --- | --- | --- | --- | --- |
| Today's top insight | First canonical composition, then its referenced completed Explanations | Uses optional `title`, `summary`, or `claim.statement`; canonical membership, but display text is usually unavailable in the production contract | Explore/Why links navigate to compatibility-backed experiences; no write from the insight itself | Not enforced; structurally represented only |
| Understanding percentage | Compatibility `currentUnderstandings` health/coherence | Derived compatibility metric, not canonical-composition confidence | Read-only | Not enforced |
| Confidence | None on the canonical path | Explicit `—` / `Runtime not yet available` | Read-only | Not applicable |
| Primary constraint and model graph | Compatibility organization experience and Conditions | Derived application projection | Links into existing workflows | Not enforced on canonical disclosure |
| Current Organizational Understanding | `canonicalCompositions` plus exact completed-Explanation membership | Canonical composition selection with optional string extraction | Read-only | Not enforced |
| Top Organizational Explanations | `organizationalExplanations` | Canonical records; optional string extraction | Read-only | Not enforced |
| Supporting Evidence | completed-Explanation `evidenceReferences` | Unavailable in production because completed Explanations carry Evidence IDs and Runtime does not persist display bodies/references | Read-only | Not enforced |
| Remaining Uncertainty | completed-Explanation uncertainty plus Organizational Uncertainty | Canonical/epistemic strings when present; no synthetic confidence | Read-only | Not enforced |
| Relevant Conditions | `organizationalConditions` | Canonical downstream cognition; optional name/title/summary extraction | Read-only | Not enforced |
| Current Organizational State | `organizationalState` | Canonical downstream cognition; summary and focus extraction | Read-only | Not enforced |
| Investigation Opportunities | `investigationOpportunities` | Canonical application cognition; question/topic extraction | Links to Research elsewhere; the detail card itself is read-only | Not enforced |
| Recent Changes | learning events plus Understanding evolution history | Derived chronological selection of latest strings | Read-only | Not enforced |
| Model Evolution | Understanding evolution plus Theory evolution | Derived chronological selection | Read-only | Not enforced |
| Think | Ask experience using compatibility, communication, uncertainty, and investigation records | Application projection; not yet grounded primarily in canonical compositions | Brainstorming is session-provisional and does not write Runtime; saved insight/context/challenge actions elsewhere run and persist a new investigation | Existing product path; no canonical disclosure decision |
| Decide | Decision application records and compatibility model context | Application cognition | `create-decision` persists an executive decision record with idempotent identity | Existing product path; no canonical disclosure decision |
| Experiment and Brief | Existing application projections | Compatibility/application data | Navigation to existing workflows | Existing product path; no canonical disclosure decision |

The UI is therefore mixed by design: canonical ownership now supplies the
primary insight and details boundary, while much of the useful prose, graph,
recommendation, and workflow context still comes from compatibility or
application-specific cognition. The page labels Runtime owners, but the
product does not yet explain this distinction in user language.

### What production Explanations can currently say

`completeOrganizationalExplanations()` produces a structured `claim` containing
scope, root Mechanism IDs, outcome references, and causal-relation family. It
also persists ancestry IDs, assumptions, optional comparative Evidence roles,
`viability: "unadjudicated"`, and uncertainty. The production type does not
require `title`, `summary`, or a prose claim statement.

The Phase 8A adapter searches for those optional prose fields anyway so that
historical or fixture records can display them. The product validator supplies
such fields in its fixture, but that does not make them part of the canonical
production contract. This is the principal reason the adapter can pass while
real canonical content remains unreadable.

## Local Understanding Utility Assessment

Local Understanding Utility is not currently measured for real product use.
It remains an optional benchmark-only profile below the Organizational
Understanding Index and before any User Intelligence claim. The following is
a qualitative implementation audit, not a score.

### Understanding Gain

**Current value:** The page can expose Conditions, Organizational State,
investigation questions, learning changes, and evolution that a user would
not easily assemble from raw organizational material. Exact canonical
Explanation membership and explicit ownership are meaningful trust
improvements over the previous compatibility-owned top insight.

**Limit:** The most important canonical cognition is often only an identity
graph. The user cannot infer a clear mental model from scope IDs, Mechanism
IDs, outcome IDs, or causal-family enums. The interface presents Explanations,
uncertainty, Conditions, and State as adjacent cards, but it does not
communicate their epistemic differences or causal relationship.

### Action Utility

**Current value:** The workspace offers brainstorming, research navigation,
decision creation, simulation, and briefing. Decision creation performs a
real idempotent Runtime write. Saved context, challenges, and insights in the
existing product path can run and persist a new investigation.

**Limit:** The canonical insight itself has no focused, traceable action
contract. “Explore insight” anchors to the details region, while “Why this
matters” opens Ask using the headline as a prompt. The Ask and Research
experiences then rely substantially on compatibility and executive
communication fields rather than a stable canonical Explanation projection.
Brainstorming remains correctly provisional, but the connection between the
displayed canonical truth and the next workflow is weak.

### Cognitive Load Reduction

**Current value:** The top insight creates a concise entry point, items are
bounded, unavailable content is explicit, and deeper Runtime content is
separated below the main workspace.

**Limit:** The details region is a flat nine-card, three-column inventory.
Every owner label is useful to an architect but reads as architecture leakage
to an Alpha user. Missing content receives the same visual weight as useful
content. The default experience does not consistently provide the canon's
desired sequence of concise understanding, main tension, change, uncertainty,
and next useful action.

### Continuity

**Current value:** Recent learning, Understanding evolution, and Theory
evolution are projected from Runtime rather than fabricated. Current and
historical records retain stable identity and provenance.

**Limit:** The page lists recent strings but does not compose a user-facing
before/after account. It does not clearly distinguish a changed canonical
composition from a changed compatibility Understanding, Condition, Theory, or
learning event. Current truth and prior learning are therefore present but not
yet legible as one evolving model.

### Trust Calibration

**Current value:** The product refuses to infer canonical confidence, invent
Evidence prose, or hide missing data. It preserves unresolved alternatives
and unadjudicated viability upstream. This is the strongest aspect of Phase
8A.

**Limit:** Evidence bodies and comparative roles are not product-visible.
Composition uncertainty is not projected explicitly. The difference between
canonical, derived, and compatibility content is visible mainly through
technical owner labels. Most importantly, the disclosure function is not
called because no production decision producer exists. The current page is an
authorized validation exception, not a production-ready disclosure path.

### Product coherence

The workspace begins to feel like a living Organization Model because it joins
insight, Conditions, State, actions, decisions, and evolution. Its strongest
current user value is the combination of honest unavailable states and
actionable investigation questions.

It still feels partly like a debug view attached to an established prototype.
The Runtime details grid exposes architecture objects rather than one
progressively disclosed account. The richest canonical cognition—structured
completed Explanations, exact composition, comparative Evidence roles,
uncertainty, and revision continuity—exists but is not productively expressed.

## Gap Classification

| Gap | Category | Rationale |
| --- | --- | --- |
| Completed Explanations have no required human-readable product projection | **C — Missing communication synthesis** | Canonical structured truth exists; readable synthesis is absent and must not be copied into its owner |
| No stable product object joining a canonical composition to concise Explanation projections | **B — Missing projection contract** | Membership exists, but the product-facing shape and fallback behavior are implicit in a generic adapter |
| Evidence bodies or safe excerpts are not available from persisted production Runtime | **A — Missing canonical cognition contract** | Product traceability cannot be derived from IDs alone; an upstream retrieval/persistence contract is required, though not necessarily on Understanding |
| Canonical composition uncertainty, unresolved alternatives, role availability, and Explanation viability are not expressed together | **B — Missing projection contract** | The structured source fields exist; product-safe semantics and labels do not |
| No valid canonical Understanding scalar confidence exists | **B — Missing projection contract** | The need is an honest multi-signal trust representation, not a new false scalar on canonical Understanding |
| Canonical insight actions do not retain a stable Explanation/composition handoff into Ask or Research | **D — Missing product interaction** | Workflows exist, but their context is not anchored to the displayed canonical cognition |
| No application disclosure-decision producer exists | **E — Missing governance activation** | The fail-closed enforcement function exists, but no caller can supply an authorized decision |
| Real-user Local Understanding Utility is absent | **F — Missing benchmark or measurement** | Phase 8A validates structure and replay, not bounded user utility |
| Runtime details are a flat technical inventory | **G — UI or information-architecture issue** | Hierarchy and terminology can improve without new cognition |
| Continuity is listed rather than narrated | **C — Missing communication synthesis** | Historical truth exists, but no bounded before/after synthesis makes it understandable |

## Candidate Comparison

| Candidate | Expected user value | Architectural fit | Governance readiness | Scope and measurement | Reversibility and risk |
| --- | --- | --- | --- | --- | --- |
| 1. Human-readable completed-Explanation projection | **Highest near-term:** makes the canonical top insight and reasoning intelligible | **Strong:** communication/projection consumes truth without owning it | Contract can be built and tested now; production activation remains gated | Bounded to one projection and one page; supports direct Local Understanding Utility comparison | Pure derivation is easy to remove; main risk is invented semantics |
| 2. Canonical Evidence projection readiness | High trust value, but incomplete without retrieval/persistence design | Requires an upstream Evidence retrieval or persistence contract | Raw Evidence increases disclosure sensitivity | Larger cross-layer scope; useful benchmark possible after contract design | Reversible display layer, but schema, retention, and leakage risks are material |
| 3. Understanding confidence and uncertainty projection | High trust value and avoids blank confidence | Strong if multi-signal and non-scalar; harmful if it invents a number | Existing fields can be projected, but disclosure still blocks exposure | Moderate scope; needs calibration and comprehension tests | Reversible, but high risk of false precision or ownership drift |
| 4. Disclosure-decision producer | Highest governance leverage and ultimately mandatory | Canonically necessary before broad exposure | This is the missing readiness itself; identity, policy, purpose, and scope remain unimplemented | Larger governance sprint with limited immediate Alpha utility | High consequence; premature policy design is difficult to reverse |
| 5. Runtime-backed Think/Ask | High interaction value | Risks consuming compatibility prose or writing provisional input too eagerly | Broader canonical access is not disclosure-ready | Multi-page/read-write scope; harder attribution | Product and authority regression risk is high |
| 6. Runtime-backed investigation/Research | High action and trust potential | Strong long-term fit with Evidence roles and uncertainty | Evidence disclosure and canonical context handoff are incomplete | Larger workflow plus retrieval/projection scope | Valuable but too broad for the next bounded sprint |
| 7. Improve `Your Organization` UI first | Moderate load reduction | Safe if purely presentational | Does not worsen governance, but cannot solve activation | Small and reversible; browser validation needed | Low risk, but rearranges unavailable or unreadable content |

Candidate 1 wins because it unlocks value already paid for in the canonical
architecture. It also creates the semantic foundation needed by Candidates 3,
6, and 7 without requiring new canonical truth, read/write workflow expansion,
or generalized governance design.

## Decision

### Original selected next sprint

**Completed Explanation Readable Projection for Your Organization**

The subsequent implementation brief narrowed this recommendation. The
authorized implementation is a source-preserving, non-narrative projection
shadow with no active UI integration. Readable synthesis remains communication
work and is not part of the projection compiler.

Build one pure, deterministic product-facing projection contract that converts
a canonical Organizational Understanding composition and its exact completed
Explanations into:

- a concise current-understanding headline;
- a short causal explanation grounded only in structured claim and ancestry;
- an explicit unresolved/unadjudicated status;
- the most material available uncertainty;
- a truthful traceability state, including whether comparative Evidence roles
  and displayable Evidence are available;
- one next useful investigation question when an existing canonical
  opportunity is linked or can be deterministically matched.

The projection must use controlled vocabulary and existing canonical labels.
It must abstain with `Runtime not yet available` when structured input cannot
support readable output. It must not use a model or free-form generator to
invent causal prose.

### Why this is highest value

Phase 8A already routes the most prominent product insight through canonical
composition membership. The missing value is not another cognitive layer; it
is translation. A stable readable projection turns a structurally correct but
often empty boundary into an intelligible Organization Model while preserving
the completed-Explanation and Understanding ownership split.

This is the smallest move expected to improve:

- **Local Understanding Utility:** clearer mental model, lower reading burden,
  visible uncertainty, and a useful next question;
- **User Intelligence:** users can understand what Discovery believes, why,
  and what remains unresolved;
- **product learning:** a bounded before/after Alpha comparison can test
  whether canonical projection improves comprehension and action selection;
- **architectural leverage:** the same projection can later support Ask,
  Research, briefs, and other applications without duplicating truth.

### Ownership

The new contract belongs in the product projection or communication layer. It
is not a field addition to `OrganizationalExplanation`,
`CanonicalUnderstandingComposition`, or `OrganizationalUnderstandingState`.
The projection is derived, replaceable, and non-authoritative.

### What remains unchanged

- Completed Explanations remain the owners of structured claims, ancestry,
  assumptions, comparative Evidence roles, viability, and uncertainty.
- Canonical Organizational Understanding remains reference-only composition
  truth and does not gain prose or a scalar confidence.
- Executive Assessment remains downstream.
- `currentUnderstandings` remains a compatibility view and must not become the
  source of the canonical readable projection.
- Explanation adjudication remains inactive and `unadjudicated` remains a
  valid visible state.
- Evidence IDs must not be rendered as Evidence content.
- No Runtime schema, producer, persistence, benchmark result, capability
  registry, or canonical pipeline layer changes.
- No new write path, AI-generated narrative, inferred confidence, or
  disclosure bypass.

### Production activation blocker

The projection may be implemented and validated against fixtures and persisted
Runtime, but it must not be treated as broadly production-eligible until an
application supplies a real, resolved
`OrganizationalUnderstandingDisclosureDecision` and calls the fail-closed
disclosure boundary. A withheld, revoked, mismatched, or absent decision must
produce no canonical projection.

This sprint should therefore either remain behind the current Alpha-validation
boundary or include a disabled-by-default consumer interface awaiting the
separately authorized disclosure-decision producer. It must not fabricate an
“eligible” decision in product code.

## Proposed Sprint Contract

### Objective

Make one canonical Organizational Understanding composition understandable to
an authorized Alpha user without changing canonical ownership or inventing
missing evidence, confidence, adjudication, or disclosure authority.

### Scope

- Define a typed, pure readable-Explanation projection.
- Resolve only exact Explanation IDs from one canonical composition.
- Deterministically verbalize supported structured fields.
- Represent `unadjudicated`, composition uncertainty, Explanation uncertainty,
  comparative-role availability, and absent Evidence content honestly.
- Integrate the projection into the top insight and one progressively
  disclosed reasoning region on `Your Organization`.
- Preserve explicit unavailable states.
- Add a focused deterministic validator with production-shaped fixtures and a
  persisted Runtime replay.
- Add a bounded baseline-versus-treatment Local Understanding Utility protocol.

### Non-goals

- No canonical prose field or scalar confidence.
- No Explanation adjudication or viability change.
- No Evidence-body persistence or retrieval.
- No disclosure policy, identity, membership, purpose, or scope design.
- No Ask, Research, Decisions, Experiment, Brief, or multi-page integration.
- No new cognition, Runtime mutation, capability, dependency, or generalized
  application framework.
- No visual redesign beyond the minimum hierarchy needed to consume the
  projection.

### Likely affected systems

- a new pure module under `components/product-shell/data/` or the existing
  executive communication/projection domain, selected after an ownership
  reuse audit;
- `components/product-shell/data/buildRuntimeOrganizationView.ts`;
- `components/product-shell/data/buildUnifiedExecutiveWorkspaceView.ts`;
- `components/product-shell/unified/UnifiedExecutiveWorkspace.tsx`;
- its module CSS only if required for progressive disclosure;
- `scripts/product/validateOrganizationExperience.ts` or one new focused
  product validator;
- the relevant sprint report, DEPS report, package command, and canonical
  product status after implementation.

No engine producer or Runtime contract should be affected.

### Required benchmark

The focused benchmark must compare the current Phase 8A output with the
readable projection using production-shaped canonical records that contain no
fixture-only `title`, `summary`, `claim.statement`, or `evidenceReferences`.
It must prove:

1. structured semantic fidelity;
2. no copied or invented canonical truth;
3. exact composition membership;
4. visible unadjudicated and uncertainty status;
5. honest Evidence-role and Evidence-content availability;
6. deterministic replay and reversed-input equality;
7. organization isolation;
8. unchanged Runtime bytes;
9. explicit abstention for insufficient inputs;
10. unchanged compatibility and downstream application behavior;
11. fail-closed output for absent, withheld, revoked, or mismatched disclosure
    decisions in the activation-ready consumer boundary.

The Local Understanding Utility protocol should use independent expected
answers to compare:

- Understanding Gain: correct identification of the causal claim and scope;
- Action Utility: selection of the relevant existing next investigation;
- Cognitive Load Reduction: less material required to answer the same
  questions;
- Continuity: correct recognition of current versus historical state when
  present;
- Trust Calibration: correct recognition of uncertainty, unadjudicated status,
  missing Evidence content, and absence of scalar confidence.

Results remain qualitative and benchmark-local. Missing observations remain
`not-measured`.

### DEPS expectations

Expected, not pre-claimed:

- Organizational Understanding: **Unchanged** unless a valid benchmark shows
  improved explanatory fidelity rather than display alone;
- User Intelligence: **Improved** only if the bounded utility comparison
  passes;
- Collective Intelligence: **Not Measured**;
- Governance Integrity: **Unchanged** if activation remains gated and
  fail-closed behavior passes;
- System Sustainability: **Improved** if one reusable pure projection replaces
  ad hoc optional-field probing without duplicate truth;
- Complexity: **Increased and justified** only if the projection stays bounded
  and replaceable;
- Product regression: **Unchanged**.

### Rollback boundary

Remove the new pure projection and restore the existing Phase 8A optional-field
adapter mapping. Runtime bytes, canonical objects, authority receipts,
disclosure contracts, compatibility views, and downstream applications remain
unchanged.

### Production activation conditions

1. Focused projection and Local Understanding Utility benchmarks pass.
2. `npm run validate:organization-experience`, `npm run typecheck`, and
   `npm run build` pass.
3. Relevant canonical downstream regressions pass.
4. A separately authorized production disclosure-decision producer exists.
5. The application invokes the existing fail-closed disclosure boundary
   before constructing the projection.
6. Revocation and organization/consumer mismatch suppress future projection
   without rewriting Runtime truth.
7. DEPS accepts the observed, not expected, movement.

## Deferred Work

- **Disclosure-decision producer:** mandatory before broad production
  activation, but deferred because it requires a separately authorized
  governance design rather than a product convenience default.
- **Evidence projection readiness:** deferred until Evidence retrieval,
  excerpting, provenance, retention, and disclosure have an explicit
  production contract.
- **Confidence and uncertainty projection:** the selected sprint includes
  status and uncertainty language, but a broader calibrated trust projection
  waits for evidence that users understand it without false precision.
- **Runtime-backed Think/Ask:** waits for a stable canonical readable
  projection and active disclosure enforcement.
- **Runtime-backed Investigation/Research:** waits for readable Explanations,
  safe Evidence access, canonical context handoff, and disclosure activation.
- **Broader `Your Organization` information architecture:** waits until the
  page has useful content to prioritize; the selected sprint may make only the
  minimum progressive-disclosure change.
- **Canonical Evidence bodies:** no schema or persistence change is authorized.
- **Completed-Explanation adjudication:** remains blocked on a canonical
  candidate-relative test-result producer.
- **Real-user Local Understanding Utility calibration:** the next sprint
  establishes a bounded benchmark; real Alpha-use evidence remains future
  product research.

## Validation for This Read-Only Sprint

Required validation:

- `git diff --check`
- `npm run typecheck`

No production code, benchmark behavior, Runtime fixture, generated registry,
or DEPS artifact is changed by this decision sprint.
