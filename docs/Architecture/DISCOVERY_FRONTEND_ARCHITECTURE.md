# Discovery Frontend Architecture

## 1. Status and Authority

**Status:** Canonical frontend-structure guidance for the Discovery Experience
Alpha and its incremental production integration.

This document is for frontend engineers, product engineers, designers,
accessibility specialists, test authors, and Codex. It works beneath the
Product Canon and the Experience Alpha specifications and alongside:

- `DISCOVERY_UI_SYSTEM.md`;
- `DISCOVERY_COMPONENT_LIBRARY.md`;
- `DISCOVERY_MOTION_SYSTEM.md`;
- `DISCOVERY_COPY_GUIDE.md`;
- `DISCOVERY_VIEW_MODEL_ARCHITECTURE.md`;
- the broader Discovery system architecture.

It governs frontend structure. It does not govern or redesign cognition,
Runtime, Executive Projection, Governance, organizational memory, or
Capability Registry behavior. Approved mockups govern resolved visual
execution when they do not conflict with higher canon.

Labels:

- **Locked requirement** — required by existing canon.
- **Recommended target** — preferred direction; not an immediate migration.
- **Compatibility consideration** — current repository evidence to preserve or
  address.
- **Unresolved decision** — requires explicit approval or validation.

## 2. Goals

- Build the approved Experience Alpha faithfully.
- Preserve the Living Understanding as the primary user-facing object.
- Keep Runtime out of components and browser bundles.
- Support deterministic mocked development.
- Support scene-by-scene production integration.
- Preserve accessibility and reduced-motion parity.
- Minimize accidental complexity.
- Use mature libraries for commodity infrastructure when a demonstrated need
  justifies them.
- Keep custom code focused on Discovery-specific meaning.
- Enable responsive, calm, motion-rich interaction.
- Maintain deterministic testability.
- Support future organization and Understanding scale without premature
  infrastructure.
- Preserve historical orientation across the journey.

## 3. Non-Goals

- Redesigning the product or approved Alpha screens.
- Replacing the cognitive architecture or Runtime.
- Building generic workflow or project-management software.
- Defining production connector architecture.
- Introducing global client state without demonstrated cross-scene need.
- Turning Discovery into a single-page dashboard.
- Rebuilding commodity infrastructure.
- Exposing Runtime to the browser.
- Integrating every engine capability at once.
- Solving hypothetical scale, localization, or multi-application concerns now.
- Replacing the current technology stack without compelling evidence and
  approval.

## 4. Current Stack Assessment

Observed from the repository on 23 July 2026:

| Concern | Current evidence |
| --- | --- |
| Framework | Next.js `14.2.18`, React `18.3.1`, React DOM `18.3.1` |
| Routing | App Router under `app/`; product routes in `app/(product)` |
| Rendering | Server components by default; explicit `"use client"` islands |
| Language | TypeScript `5.7.2`, strict mode, no emit |
| Styling | global CSS plus colocated CSS Modules; no CSS framework |
| Icons | `lucide-react` |
| Product organization | `components/product-shell`, with scene-like experience folders and `data` builders |
| Server/client boundary | `loadProductOrganization.ts` imports `server-only`; ProductWorkspace loads and projects; interactive experiences are client components |
| Data loading | synchronous server-side Runtime loading by organization ID; search parameters carry `organizationId`; API routes handle mutations |
| View models | named `*ExperienceView` types and builder return types in `components/product-shell/data` |
| Tests | script-driven TypeScript validators and canonical engine benchmarks; no component test runner or browser E2E package is declared |
| Accessibility | semantic landmarks, navigation labels, focusable native controls, ARIA in some product-shell components; no declared automated accessibility dependency |
| Motion | CSS capabilities only; no animation library declared |
| Forms/schema | local React form state and manual request validation patterns; no external form or schema library declared |
| Component harness | no Storybook or equivalent declared |
| Dependency philosophy | small dependency set; custom code carries current Discovery-specific behavior |

Current routes are executive-workspace routes (`/your-organization`, `/ask`,
`/research`, `/decisions`, `/experiment`, `/brief`, `/organizations`) rather
than the approved Alpha scene route model. The current shell uses Insights,
Think, Decide, Experiment, and Brief navigation and presents model-health
metrics. It is implementation evidence, not Alpha product canon.

## 5. Architectural Principles

1. Server-first by default.
2. Client components are earned by interaction.
3. Runtime remains server-side.
4. View models cross the UI boundary.
5. Scene compositions own orchestration.
6. Semantic components remain presentation-focused.
7. Durable and ephemeral state remain separate.
8. URL carries durable navigation identity where appropriate.
9. Mock and production adapters share product contracts.
10. Accessibility is architectural, not a finishing pass.
11. Motion is driven by semantic state.
12. Progressive disclosure reduces reading and client complexity.
13. Commodity capability uses mature libraries when justified.
14. Custom code represents Discovery-specific meaning.
15. No global state without a demonstrated cross-scene need.
16. Stable content remains available during loading and recovery.
17. Historical revisions are never reconstructed from component state.

## 6. Layer Model

```text
Routes
  ↓
Scene loaders
  ↓
Product services
  ↓
Repositories / Runtime boundary OR fixture repository
  ↓
Canonical product projection
  ↓
Scene adapter
  ↓
Serializable scene view model
  ↓
Scene composition
  ↓
Semantic components
  ↓
Primitives and client interaction islands

User intent
  ↓
Action handler
  ↓
Product service / repository
  ↓
Durable result
  ↓
Revalidated projection
```

Dependency direction is downward only. Fixtures substitute at the repository /
projection source, not inside components. Tests may observe any boundary but
must not introduce a benchmark-only production architecture.

### Layer responsibilities

- **Routes:** identity, navigation entry, metadata, route-level errors.
- **Scene loaders:** load source state and select the scene adapter.
- **Product services:** coordinate product actions without performing
  cognition.
- **Projection adapters:** translate canonical source meaning into product
  semantics.
- **Scene view models:** exact serializable scene contract.
- **Scene compositions:** hierarchy and interaction orchestration.
- **Semantic components:** present canonical Discovery meaning.
- **Primitives:** quiet reusable interaction and layout behavior.
- **Client islands:** local input, disclosure, animation, and focus.
- **Action handlers:** validate intent, invoke durable behavior, and return a
  structured result.
- **Repositories:** isolate Runtime, fixtures, or later persistence.

## 7. Recommended Directory Structure

Recommended target, adapted to the existing App Router and product shell:

```text
app/
  (product)/
    understand/
      new/
      [understandingRef]/
        orient/
        plan/
        learn/
        understand/
        respond/
        follow/
        return/
    home/

components/
  discovery/
    primitives/
    understanding/
    learning/
    reasoning/
    stewardship/
    home/
    scenes/

product/
  services/
  projections/
  view-models/
  actions/
  repositories/
  fixtures/
  scenarios/

engine/
  ...
```

Compatibility considerations:

- the repository already uses `components/product-shell` and
  `components/product-shell/data`;
- immediate movement is not required;
- existing production experiences must not be renamed into Alpha contracts;
- Alpha may begin in a contained directory and share approved primitives;
- a directory move without behavior value is not a sprint objective.

Exact route and directory names remain unresolved until the scene naming and
identity model are approved.

## 8. Routing Architecture

### Canonical behavior

- Organization identity must remain canonical and explicit.
- Understanding identity must be stable across scenes and refreshes.
- First use enters Ask without requiring a fabricated Understanding ID.
- After creation, routes carry an opaque Understanding reference.
- Return visits may deep-link to the current or a historical revision where
  permitted.
- Browser Back returns to the prior scene/state without losing submitted
  context.
- Refresh reconstructs the scene from durable state or deterministic fixture
  scenario, not transient component state.
- Missing, malformed, unsafe, unavailable, or unauthorized identity produces a
  bounded route state.
- Route guards run server-side and must not reveal protected existence.

### Parameters

- **Recommended default:** path parameters for durable resource identity and
  scene; query parameters for optional, shareable presentation such as an
  approved comparison revision.
- Do not place sensitive input, source identity, contribution text, or access
  decisions in the URL.
- The current implementation uses `organizationId` as a search parameter and
  validates it server-side. Preserve canonical organization identity behavior
  during migration; changing path/query ownership requires an explicit
  decision.

Navigation should recede behind the active Understanding and scene question.
It must preserve focus and orientation, not mimic a workflow stepper.

## 9. Server and Client Boundaries

### Server-side

- load Runtime or deterministic fixture;
- resolve organization and Understanding identity;
- perform access checks through canonical boundaries;
- handle sensitive sources;
- construct product projection and initial scene view model;
- execute durable state operations;
- sanitize errors;
- select deterministic scenario state.

### Client-side

- hold local unsent input;
- open and close disclosure;
- manage selections before submission;
- run state-driven animation;
- pause/resume presentation controls;
- apply safe optimistic visual state;
- manage focus and keyboard interaction;
- display structured pending, result, and error states.

Minimize client boundaries by placing `"use client"` at the smallest
interactive composition that needs hooks or browser APIs. Do not hydrate an
entire scene merely because one disclosure or input is interactive.

## 10. Data Flow

```text
Runtime or fixture
  → product projection
  → scene adapter
  → serialized scene view model
  → scene composition
  → semantic components
  → user intent
  → action handler
  → durable or scripted change
  → refreshed projection
```

Prototype path:

```text
immutable fixture → scripted scenario repository → same scene adapter contract
```

Production path:

```text
server-only Runtime/repository → authorized product projection → scene adapter
```

Components do not know which path supplied the contract.

## 11. Prototype Mode

Interactive Prototype Alpha uses:

- deterministic fixture repository;
- explicit named scenario selection;
- immutable baseline states;
- scripted semantic transitions;
- no engine calls;
- no Runtime mutation;
- production-quality components;
- real semantic HTML and accessibility;
- real responsive behavior;
- real reduced-motion behavior;
- realistic but truthful loading and recovery states;
- no fabricated live reasoning or continuous learning claims.

Prototype controls are visibly development-only and excluded from product
meaning. Scenario transitions produce complete view models. Later production
adapters replace the fixture repository and action implementation, not the
scene or semantic components.

## 12. Runtime Integration Mode

Future integration should:

- load Runtime server-side;
- compose from existing Executive Projection where it preserves the required
  meaning;
- use explicit product projection adapters for missing Alpha semantics;
- translate user actions into canonical commands;
- revalidate the affected scene after durable changes;
- limit optimistic behavior to reversible presentation state;
- integrate one scene/capability at a time;
- preserve the last stable projection during failures;
- use immutable historical revisions;
- distinguish unavailable, restricted, stale, and error states.

No direct browser Runtime access is permitted. Runtime integration does not
authorize new cognitive or persistence objects.

## 13. State Architecture

### Durable organizational state

Runtime-backed evidence, observations, cognitive objects, executive
projections, organizational memory, and revisions. Server-side only.

### Durable product state

Follow state, saved contributions, approved objective, active Understanding
identity, and approved plan only when canonical production contracts exist.

### URL state

Organization, Understanding, scene, and safe optional comparison/scope.

### Server request state

Loading, error, access, staleness, identity resolution, and projection
availability.

### Client interaction state

Disclosure, selection, unsent composition, focus, pause, and animation progress.

### Session-only prototype state

Scripted scenario progression and development controls. It never becomes
organizational truth.

Client component state is never the authoritative organizational model or
historical record.

## 14. Data Fetching and Mutation

Grounded in Next.js App Router:

- initial scenes load in server components;
- action handling may use route handlers or framework server actions after an
  explicit implementation decision;
- durable actions validate identity and authorization server-side;
- successful actions revalidate or redirect to a fresh projection;
- pending UI preserves the last stable Understanding and user input;
- commands use stable intent and idempotency where duplicate submission could
  create durable state;
- stale projections are labeled, not silently treated as current;
- route and scene error boundaries preserve safe recovery;
- the browser never loads or writes Runtime files directly.

No external fetch/state library is justified by current evidence.

## 15. Caching and Freshness

- Static UI assets, immutable fixtures, and immutable historical revisions may
  be cached.
- Current Understanding, access state, Follow state, contribution result, and
  active Learning state are dynamic or explicitly revalidated.
- Organization identity is resolved per request through the canonical
  boundary.
- Home and Return summaries include an `asOf` time and comparison window.
- Durable actions invalidate affected current projections.
- Stale data remains usable only with a visible stale explanation.
- Fixture caching is deterministic and cannot leak scenario state across
  users or tests.

Do not introduce distributed caching, event buses, or complex client caches
before measured need.

## 16. Component Architecture

Follow the Component Library:

- primitives own quiet generic behavior;
- semantic components present Discovery meaning;
- scene compositions answer one governing question;
- interaction islands own local browser behavior;
- component props are explicit view models;
- dependencies flow from scene to semantics to primitives;
- no component imports Runtime, repositories, or cognitive producers;
- do not create screen-specific generic widgets merely to reproduce a mockup;
- avoid nested cards and dashboard grids.

## 17. Styling Architecture

- Retain CSS Modules and global token definitions as the current compatible
  strategy.
- Use UI System tokens for spacing, typography, color, surfaces, borders,
  radii, and semantic states.
- Prefer semantic variants over arbitrary per-screen colors.
- Avoid one-off values where an approved token exists.
- Implement responsive behavior at the component and scene contracts defined
  by the UI System.
- Implement `prefers-reduced-motion` parity.
- Do not redefine confidence, contradiction, unknown, or access color in
  individual components.
- Migrate existing styles gradually; no CSS framework is justified.

## 18. Motion Architecture

- Animation state comes from scene/component semantic state.
- CSS transitions and keyframes are preferred for simple opacity, transform,
  disclosure, and focus-safe changes.
- JavaScript orchestration is reserved for ordered Understanding evolution
  where CSS cannot preserve interruption and semantic sequencing.
- Reduced-motion behavior is designed with every transition.
- Transitions cancel or complete safely on new state, focus, navigation, or
  user control.
- Tests assert semantic start/end states, not fragile timing.
- Data adapters contain no animation logic.

The repository has no animation dependency. Current Alpha requirements can
begin with CSS and small React state transitions. An external library requires
a measured need—such as interruptible shared-layout continuity—plus an ADR and
approval. Do not add one during prototype foundation work.

## 19. Copy Architecture

- Centralize stable canonical labels where reuse prevents drift.
- Keep short contextual labels with the semantic component when their meaning
  is invariant.
- Project dynamic organizational claims, rationales, limitations, and error
  effects through view models.
- Never expose raw engine terminology.
- Keep copy structures localization-ready by avoiding sentence fragments
  assembled across components, but do not add premature localization
  infrastructure.
- Components do not hard-code provider errors, stack traces, or technical
  storage language.
- Follow the Copy Guide for every scene state.

## 20. Accessibility Architecture

- Use semantic document structure and one clear scene heading.
- Provide a skip link to the main Understanding content.
- Move focus to the scene heading after route transitions.
- Preserve logical DOM order independent of desktop layout.
- All interactions work by keyboard.
- Use native forms, buttons, radios, and disclosures before custom controls.
- Use live regions only for completed material changes.
- Associate errors with fields and provide a scene-level error summary where
  needed.
- Preserve unsent input after action failure.
- Honor reduced-motion preferences with semantic parity.
- Maintain at least 44×44px touch targets.
- Test zoom, reflow, contrast, screen readers, keyboard, focus visibility, and
  motion preferences.

Accessibility is a release criterion for each scene, not Sprint I cleanup.

## 21. Error Architecture

Error scopes:

- **Route-level:** missing or unsafe organization/Understanding identity.
- **Scene-load:** projection unavailable or failed.
- **Action:** contribution, Follow, plan change, or progression failed.
- **Restricted evidence:** meaning or source cannot be disclosed.
- **Stale data:** last stable projection is available but not current.
- **Partial projection:** some semantic content is unavailable.
- **Unavailable source context:** evidence meaning remains with an explicit
  boundary where permitted.
- **Prototype scenario:** fixture or transition is invalid.

Every error identifies:

1. what failed;
2. what remains stable;
3. whether durable state changed;
4. whether input was preserved;
5. the recovery action.

Errors are structured view models and sanitized at the server boundary.

## 22. Performance Architecture

Optimize perceived comprehension:

- render the initial scene and current Understanding server-side;
- split code by route and earn client islands;
- minimize serialized data and hydration;
- load fonts without blocking meaning or causing layout shift;
- use responsive images only where approved mockups require imagery;
- animate opacity and transform where possible;
- reserve layout space for stable transitions;
- progressively disclose long evidence and history;
- preserve readable line length for long synthesis text;
- paginate or incrementally reveal large histories when proven necessary;
- use virtualization only after measurement shows actual rendering cost.

Do not sacrifice clarity to hypothetical scale.

## 23. Security and Privacy Boundaries

- No secrets, provider keys, Runtime files, or raw restricted evidence enter
  client bundles.
- Server projection applies canonical access decisions before serialization.
- Access states are explicit.
- Client identifiers are opaque and safe.
- Validate and bound user input server-side; preserve it safely on recoverable
  failure.
- Sensitive contributions use canonical handling indicators and do not enter
  logs by default.
- Do not claim governance enforcement that does not exist.
- Avoid logging Understanding text, evidence, or contribution contents unless
  an approved operational need and policy exist.
- Sanitize errors and source metadata.

This document does not replace Governance or security canon.

## 24. Testing Architecture

### Layers

- primitive interaction tests;
- semantic component state tests;
- scene composition tests;
- adapter and projection tests;
- route identity/error tests;
- accessibility automation plus manual review;
- responsive visual tests;
- reduced-motion tests;
- end-to-end journey tests;
- deterministic fixture and scenario tests;
- production Runtime integration tests later.

### Signature journeys

1. Ask through Orient.
2. Plan source inclusion, limitation, and exclusion.
3. Learn Understanding evolution.
4. Understand and examine the current explanation.
5. Respond with a bounded contribution effect.
6. Follow.
7. Return to one meaningful change.
8. Home to a new Ask.

Tests assert meaning, historical preservation, access safety, focus, and
determinism—not only screenshots.

## 25. Component Harness

### Need

The component canon contains many semantic states, responsive variants,
motion/reduced-motion pairs, and access/error cases. A harness will materially
reduce scene-driven duplication and improve review.

### Storybook

Benefits: mature isolated stories, accessibility integrations, interaction
tests, viewport controls, documentation, and visual-regression ecosystem.

Costs: dependencies, configuration, separate build surface, maintenance, and
possible pressure to treat components as generic inventory.

### Minimal Next.js development harness

Benefits: uses the current stack, small initial cost, real App Router/CSS
behavior.

Costs: custom scenario navigation, weaker addon ecosystem, and risk of
building commodity tooling.

### Recommendation

Before Sprint A implementation, run a bounded decision spike comparing current
Storybook compatibility with a minimal Next.js harness. Prefer Storybook if it
works cleanly with the repository and the team will use accessibility and
visual-review capabilities. Otherwise use a temporary minimal harness. Do not
install either until approved.

## 26. Observability

Frontend observability may cover:

- route, scene-load, action, and projection failures;
- Core Web Vitals and interaction latency;
- accessibility regressions in CI;
- completion of approved Alpha journey steps for usability research;
- prototype scenario failures.

Use aggregated, purpose-limited events. Avoid invasive behavioral surveillance,
raw question/contribution logging, keystroke capture, or unapproved product
analytics. This section does not canonize success metrics.

## 27. Incremental Implementation Plan

### Sprint A — Foundation

- **Objective:** establish route shell, approved tokens/primitives, fixture
  repository, view-model types, scenario runner, and harness decision.
- **Exclude:** Runtime integration and scene redesign.
- **Validate:** deterministic fixtures, accessibility foundations, responsive
  shell, no Runtime imports.

### Sprint B — Ask and Orient

- Build sparse Ask and bounded Orient from deterministic contracts.
- Validate question preservation, refinement, focus, and error recovery.

### Sprint C — Plan

- Build source recommendations and scope controls.
- Validate permission language, expected-gain qualification, and deterministic
  plan updates.

### Sprint D — Learn

- Build Learning Events and Understanding evolution.
- Validate semantic change, interruption, reduced motion, and immutable
  history.

### Sprint E — Understand and Examine

- Build hero, synthesis, confidence, unknown, contradiction, relationships,
  and progressive reasoning.
- Validate under-one-minute comprehension and evidence disclosure.

### Sprint F — Respond

- Build response paths, contribution composer, effect preview/result, and
  sensitive state.
- Validate preserved evidence and bounded contribution effect.

### Sprint G — Follow and Return

- Build quiet Follow and dominant-change Return.
- Validate Follow meaning and no manufactured novelty.

### Sprint H — Home

- Build editorial learning brief, followed Understandings, and Ask entry.
- Validate hierarchy and absence of dashboard behavior.

### Sprint I — Accessibility, responsive, and motion hardening

- Cross-scene manual and automated review. This strengthens, not postpones,
  accessibility already required in each sprint.

### Sprint J — Executive usability testing

- Test comprehension, trust, challenge, Follow intent, reading burden, and
  return curiosity. Revise before production integration.

### Later — Runtime integration scene by scene

- Replace fixture adapters only where canonical production meaning exists.

## 28. Runtime Integration Sequence

1. Ask interpretation.
2. Orient projection.
3. Learning plan.
4. Learning Events.
5. Understanding projection.
6. Contribution handling.
7. Follow state.
8. Return summary.
9. Home prioritization.

This sequence follows the user journey, exposes missing contracts early, keeps
regression scope narrow, and prevents UI components from becoming temporary
Runtime adapters. Each step retains fixture fallback until its production
projection is validated.

## 29. Migration Assessment

### Retain

- Next.js App Router, React, TypeScript strict mode.
- Server components by default.
- `server-only` Runtime loading pattern.
- Canonical organization ID resolution and validation.
- CSS Modules and existing token-compatible CSS.
- Lucide iconography where it matches the UI System.
- Server-side `build*ExperienceView` projection direction.
- Script-based deterministic subsystem validations.

### Adapt

- `ProductWorkspace` into smaller scene-loader/orchestration boundaries.
- Existing view builders into explicit product projection and scene adapters.
- `CurrentUnderstanding`, Organization Model, disclosure, and recommendation
  patterns only where their semantics match the Component Library.
- Current organization-ID query parameter without breaking identity.
- API route mutation patterns into stable product action intents.
- Current shell into a quieter Alpha route frame if approved designs require
  it.

### Replace

- Current executive dashboard/navigation hierarchy for the Alpha journey.
- Model Health metric blocks and dashboard-first compositions within Alpha.
- Loose `Record<string, unknown>` field discovery as a long-term scene
  contract.
- Builder `ReturnType` aliases where canonical named view models are needed.
- Whole-scene client components where only small interaction islands are
  necessary.

### Defer

- Deleting or migrating current production workspace routes.
- Durable Alpha Runtime objects.
- Production connectors and retrieval.
- Global state, caching infrastructure, virtualization, localization, and
  microfrontends.
- Component-harness installation.
- External animation library.

No rewrite is authorized by this assessment.

## 30. Dependency Policy

Custom code exists only for Discovery-specific meaning or where a mature
library cannot meet a demonstrated need.

| Need | Current recommendation |
| --- | --- |
| Animation | begin with CSS/React; evaluate a library only for proven orchestration needs |
| Accessibility primitives | prefer native HTML; evaluate mature headless primitives for genuinely complex widgets |
| Forms | native forms/local state first; add a library only after repeated complexity |
| Schema validation | evaluate a mature schema library when production action/view-model boundaries justify it |
| Component harness | bounded Storybook-versus-Next harness decision |
| Visual regression | adopt with the selected harness after stable mockups |
| State management | no global library without measured cross-scene need |

No dependency is added by this document.

## 31. Architecture Decision Records

Potential future ADRs:

- component harness;
- animation library;
- canonical URL identity model;
- server action versus route-handler transport;
- prototype fixture repository and scenario runner;
- view-model versioning;
- relation between Product Projection and Executive Projection;
- automated import-boundary enforcement.

Create an ADR only when a decision is imminent and repository conventions
support it.

## 32. Anti-Patterns

1. Runtime imports in UI components.
2. Client-side cognitive inference.
3. One global dashboard page.
4. One giant client component.
5. Generic global state by default.
6. Duplicated scene data shapes.
7. Direct repository access in components.
8. Transport types used as component props.
9. Uncontrolled `useEffect` data flows.
10. Client-side access-control inference.
11. Style values invented per screen.
12. Component-level confidence calculation.
13. Activity logs treated as learning.
14. Modal-heavy navigation.
15. Nested cards.
16. Hydration of unnecessary data.
17. Whole-Runtime serialization.
18. Loading represented only by a spinner.
19. Route transitions that lose focus.
20. Desktop layout merely shrunk for mobile.
21. Reduced motion treated as removal without meaning replacement.
22. Hard-coded dynamic copy variants.
23. Inaccessible custom controls.
24. Optimistic cognition updates without reconciliation.
25. Client state used as historical truth.
26. Fixture data unlike production view models.
27. Nondeterministic prototype transitions.
28. Replacing the current stack without evidence.
29. Building commodity authentication.
30. Building commodity form infrastructure.
31. Adding dependencies during documentation work.
32. Premature microfrontends.
33. Premature event buses.
34. Premature distributed caching.
35. Rewriting current architecture before prototype validation.
36. Connecting every engine capability at once.
37. Route parameters containing sensitive contribution text.
38. Provider calls from client components.
39. Animation logic inside adapters.
40. Access restrictions represented by hidden DOM alone.
41. Production behavior controlled by development fixture state.
42. Navigation modeled as a gamified stepper.
43. Copy assembled from sentence fragments across layers.
44. Error boundaries that erase the last stable Understanding.
45. Silent fallback from restricted to absent.

## 33. Review Checklist

### Route author

- Are organization and Understanding identities safe and stable?
- Does refresh reconstruct the scene?
- Are route errors bounded and non-leaking?
- Does focus move correctly?

### Scene author

- Does the scene answer one governing question?
- Does it receive one explicit scene view model?
- Is the Understanding the hierarchy anchor?
- Are loading, error, restriction, and reduced motion complete?

### Component author

- Is the component semantic or a quiet primitive?
- Does it avoid Runtime, repositories, cognition, and access inference?
- Is local state genuinely ephemeral?
- Are keyboard and responsive behaviors tested?

### Adapter author

- Is every field traceable?
- Are confidence and priority translated, not invented?
- Are contradiction, unknown, history, and access preserved?
- Is output serializable and deterministic?

### Reviewer

- Can fixtures and future production adapters share the contract?
- Is the client boundary smaller than the scene?
- Does error recovery preserve stable meaning and input?
- Has a dependency or abstraction been earned?

### Codex

- Reproduce approved artifacts; do not redesign.
- Preserve current stack and architecture unless explicitly authorized.
- Make the smallest scene-bounded change.
- Run typecheck, build, and subsystem validation.
- Do not commit or push unless separately instructed.

## 34. Open Decisions

1. Canonical Alpha route paths and whether scene is encoded in path or safe
   query state.
2. Respond versus Examine / Challenge-or-Confirm scene naming.
3. Return as a distinct scene versus a state within Home.
4. URL ownership of organization identity beyond the current query parameter.
5. Component harness choice.
6. Whether any motion requirement earns an external animation library.
7. Route handlers versus server actions for Alpha action intents.
8. Exact fixture repository and scenario-selection mechanism.
9. View-model versioning before production integration.
10. How Product Projection composes with existing Executive Projection.
11. Automated enforcement of Runtime import boundaries.
12. Durable production contracts for Understanding revisions, contributions,
    Follow state, and learning plans.

## 35. Definition of Done

A frontend scene is architecturally complete when:

- it faithfully implements an approved scene and visual artifact;
- it renders server-first from an explicit serialized view model;
- Runtime and sensitive sources remain server-side;
- the scene composition owns hierarchy and semantic components own
  presentation;
- client islands contain only earned interaction state;
- fixture and production paths can share the contract;
- identity, browser history, refresh, and deep-link behavior are defined;
- loading, error, stale, partial, empty, and restricted states preserve stable
  meaning;
- accessibility, responsive behavior, focus, and reduced motion are verified;
- actions are stable intents with safe recovery;
- deterministic tests cover the scene journey;
- no new cognition, governance, Runtime object, unsupported claim, dependency,
  or product concept was introduced.
