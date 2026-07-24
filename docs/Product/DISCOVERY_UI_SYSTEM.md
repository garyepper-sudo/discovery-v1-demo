# Discovery UI System

## 1. Status and Authority

**Status:** Canonical UI foundation
**Scope:** Reusable visual and interaction rules
**Production readiness:** Not implied
**Intended readers:** Product designers, engineers, researchers, reviewers, and
Codex

This document translates the Discovery Design Language into reusable UI rules.
The deterministic fixture-backed Discovery Experience Alpha illustrates those
rules in one application-specific experience. Alpha specifications and mockups
govern Alpha composition and behavior; they do not define reusable platform UI
authority. This document does not redesign the experience or resolve product
questions left open by the scene specifications.

Authority order:

1. `docs/Product/PRODUCT_CANON.md` governs product identity.
2. `docs/Architecture/Canon/DISCOVERY_PLATFORM_PRINCIPLES.md` governs platform
   boundaries.
3. Shared Organizational Intelligence, the Organization Experience Canon, and
   applicable architecture canon govern their named platform, application, and
   technical domains.
4. `docs/Product/DISCOVERY_DESIGN_LANGUAGE.md` governs interaction philosophy.
5. This document governs reusable visual and interaction rules.
6. `docs/Product/DISCOVERY_COMPONENT_LIBRARY.md` governs reusable component
   responsibilities beneath this system.
7. Application specifications, including the Alpha specifications, govern
   application-specific composition and behavior.
8. Approved high-fidelity mockups govern resolved application visual intent.
9. Implementation follows the authorities above; existing code is evidence of
   present behavior, not automatic canon.

`docs/Product/DISCOVERY_MOTION_SYSTEM.md` is authoritative for motion timing
and easing. `docs/Product/DISCOVERY_COPY_GUIDE.md` is authoritative for
detailed copy, voice, terminology, labels, confidence wording, uncertainty
language, action wording, and error and empty-state language. This UI System
governs their placement, hierarchy, density, visibility, truncation, and other
presentation constraints; it does not maintain a competing language standard.
`docs/Product/DISCOVERY_VIEW_MODEL_ARCHITECTURE.md` governs canonical
product-facing presentation contracts.

`docs/Architecture/DISCOVERY_FRONTEND_ARCHITECTURE.md` governs routing,
server/client boundaries, directory and module placement, data loading,
organization identity propagation, orchestration, and frontend integration
structure. This UI System governs only how prepared information is presented;
it does not govern how data is loaded, where domain logic runs, how
`organizationId` is propagated, how routes are implemented, how server and
client responsibilities are divided, or how application orchestration is
structured. This UI System depends on these sibling authorities and does not
duplicate them.

When approved mockups and this system appear to conflict, preserve the mockup's
composition and intent, then clarify the reusable rule before implementation.
Implementation may not independently reinterpret an unresolved product
decision. Material deviation requires validated user research or benchmark
evidence, documented rationale, and updates to affected canon.

## 2. Purpose

The UI system exists to make Discovery recognizably itself across every scene
without requiring each designer or engineer to invent a visual language.

It prevents:

- screen-by-screen inconsistency;
- generic enterprise-SaaS drift;
- excessive chrome and card grids;
- metric-first hierarchy;
- unexplained confidence displays;
- dashboard proliferation;
- inaccessible or theatrical motion;
- inconsistent semantic colors and copy;
- arbitrary responsive behavior;
- implementation invention by engineers or Codex.

This is not a component library, token implementation, Figma specification,
motion system, or general design-system textbook.

## 3. Core UI Principles

Each principle below is locked unless explicitly identified otherwise.

### 3.1 The Understanding is always the hero

**Statement:** The current Understanding, its question, or its meaningful change
must receive the strongest visual emphasis.

**Rationale:** Discovery creates value through evolving organizational meaning,
not through controls, metrics, sources, or navigation.

**Implementation implication:** Give the synthesis or active understanding
objective the primary reading position and widest typographic range.

**Common violation:** A large navigation shell, KPI row, or action panel
visually dominates the synthesis.

### 3.2 Meaning before metrics

**Statement:** Explain what changed and why before showing a number.

**Rationale:** Confidence, counts, and movement have no value without semantic
context.

**Implementation implication:** Pair every material metric with a plain-language
meaning and rationale.

**Common violation:** A gauge or percentage becomes the first thing the user
sees.

### 3.3 One screen, one question

**Statement:** Every scene has one governing user question.

**Rationale:** A coherent inquiry reduces cognitive load and makes action
obvious.

**Implementation implication:** Secondary sections must support the governing
question rather than become parallel destinations.

**Common violation:** A screen simultaneously asks the user to interpret,
configure, connect sources, and decide.

### 3.4 Understanding before action

**Statement:** Action follows sufficient orientation.

**Rationale:** Prominent controls without meaning make Discovery feel
transactional and encourage premature commitment.

**Implementation implication:** Place the primary action after or beside the
minimum synthesis, uncertainty, or plan needed to judge it.

**Common violation:** A bright “Approve” button appears before the user can see
what is being approved.

### 3.5 Whitespace is functional

**Statement:** Whitespace separates meaning, establishes pace, and replaces
unnecessary containers.

**Rationale:** Reading is expensive. Space makes hierarchy legible without
adding chrome.

**Implementation implication:** Prefer vertical rhythm and alignment over a
bordered card for every conceptual group.

**Common violation:** Empty space is compressed to fit more cards above the
fold.

### 3.6 Complexity is earned

**Statement:** Density increases only as the Understanding and user's task
justify it.

**Rationale:** First use begins sparse; evidence examination can become richer.

**Implementation implication:** Ask is extremely sparse, while detailed
reasoning and evidence disclosure may contain deeper progressive layers.

**Common violation:** Persistent navigation and a dense workspace appear before
the first Understanding creates value.

### 3.7 Progressive disclosure is the default

**Statement:** Show meaning first and allow deliberate movement into
qualification, reasoning, evidence, and trace.

**Rationale:** Detail must remain available without becoming the default reading
burden.

**Implementation implication:** Preserve one stable synthesis while expanding
details inline or in a clearly related secondary region.

**Common violation:** Hide material uncertainty while exposing decorative
detail.

### 3.8 Confidence requires rationale

**Statement:** Confidence is never a standalone badge, score, gauge, or color.

**Rationale:** Trust comes from knowing what strengthens and limits the current
Understanding.

**Implementation implication:** Display a qualitative label and explanation;
numeric confidence remains an unresolved default.

**Common violation:** “81%” appears without evidence, limitation, or change
reason.

### 3.9 Contradictions receive equal dignity

**Statement:** Contradicting evidence is not styled as a system failure or
buried beneath supporting evidence.

**Rationale:** Visible disagreement improves calibration and trust.

**Implementation implication:** Give contradictions a named, readable section
with consequence and next question.

**Common violation:** Contradiction is a red error badge or visually dimmed
footnote.

### 3.10 Unknowns are first-class

**Statement:** A material unknown is displayed as a valuable learning
opportunity.

**Rationale:** Discovery must be honest about uncertainty and purposeful about
what it learns next.

**Implementation implication:** State the unknown, why it matters, and the
information most likely to reduce it.

**Common violation:** “More data needed” appears as generic empty-state copy.

### 3.11 Learning is shown through change

**Statement:** Learning is a before-and-after change in understanding with a
cause and qualification.

**Rationale:** Activity, processing, source counts, and elapsed time are not
learning.

**Implementation implication:** Show what strengthened, weakened, emerged,
remained stable, or became more uncertain.

**Common violation:** An activity log or progress bar is presented as model
improvement.

### 3.12 Contributions are stewardship

**Statement:** Users confirm, challenge, qualify, or add context to an
Understanding; they do not rate an AI answer.

**Rationale:** Human input matters without becoming automatic truth.

**Implementation implication:** Use structured response paths and preview the
possible effect.

**Common violation:** Thumbs-up/down, “Was this correct?”, or gamified feedback.

### 3.13 Motion explains state change

**Statement:** Motion preserves continuity and reveals meaningful change.

**Rationale:** Motion should explain the living Understanding, not simulate AI.

**Implementation implication:** Animate changed meaning sparingly; keep chrome
stable.

**Common violation:** Token streaming, typewriter text, pulsing AI graphics, or
decorative stagger.

### 3.14 Calmness is a product capability

**Statement:** Discovery protects attention through restraint, prioritization,
and predictable behavior.

**Rationale:** Executive-grade trust is incompatible with alert pressure and
visual noise.

**Implementation implication:** Use few accents, one primary action, limited
badges, and no manufactured urgency.

**Common violation:** Notification dots, urgency colors, and animated counters
compete for attention.

### 3.15 Editorial before operational

**Statement:** Discovery reads first as a coherent editorial synthesis and only
then as an operational tool.

**Rationale:** The interface should recede behind meaning.

**Implementation implication:** Typography, sequence, and whitespace establish
hierarchy before controls or containers.

**Common violation:** A generic SaaS control panel frames every scene.

### 3.16 Controls recede until needed

**Statement:** The strongest control appears only when it advances the current
question.

**Rationale:** Persistent control density overwhelms meaning and invites
premature action.

**Implementation implication:** Secondary controls use quiet text, disclosure,
or row actions.

**Common violation:** Every available action receives a filled button.

## 4. Experience Density Model

| Scene | Governing question | Density | Navigation | Above the fold | Container guidance |
| --- | --- | --- | --- | --- | --- |
| Ask | What would you like Discovery to understand? | Extremely sparse | Minimal or hidden | question, support, input, one action | continuous surface; input may be bounded |
| Orient | Did Discovery understand what I am trying to learn? | Sparse editorial | Minimal | original question, interpreted objective, orientation, continue | at most one orientation surface |
| Plan | How should Discovery improve this Understanding? | Structured, not configurational | Quiet | expected change, recommended sources, plan action | continuous list or restrained sections; card treatment remains mockup-led |
| Learn | How is the Understanding changing? | Alive, sequential | Available but secondary | current state, active learning event, meaningful change | timeline plus optional summary |
| Understand | What does Discovery currently understand? | Narrative synthesis | Earned | title, status, synthesis, confidence rationale, largest unknown, action | hero remains uncontained |
| Respond | How does this compare with what I see? | Focused collaborative | Quiet | synthesis context, response paths, effect preview | selectable rows; no survey modal |
| Follow | Should Discovery keep learning? | Calm and ceremonial | Quiet | meaning of following, future learning, one commitment | whitespace increases; motion decreases |
| Return | What changed while I was away? | Prioritized editorial | Persistent if earned | learning summary, most important change, next action | narrative change sections |
| Home | What deserves attention now? | Curated, not comprehensive | Persistent | meaningful learning, active Understandings, primary inquiry | no dashboard grid |

Navigation is earned after the first Understanding exists. Persistent navigation
must never become the organizing metaphor. The first viewport contains the
minimum complete answer to the scene's question, not every available section.

Cards are justified when an item has its own selection, expansion, comparison,
or status boundary. Sections remain uncontained when hierarchy and whitespace
are sufficient.

## 5. Layout System

Semantic rules are locked. Numeric values below are **recommended defaults**
pending final high-fidelity token approval.

### Widths

| Token role | Recommended default | Use |
| --- | ---: | --- |
| viewport container | 1440px maximum | broad application frame |
| scene container | 1200px maximum | most desktop scenes |
| wide evidence layout | 1280px maximum | evidence, reasoning, or Learn split views |
| editorial reading width | 720px | synthesis, rationale, long copy |
| compact reading width | 600px | prompts, explanations, confirmation |
| narrow control width | 480px | short forms and focused decisions |

Never stretch prose simply because the viewport is wide. Primary prose should
usually remain within 55–75 characters per line.

### Breakpoints

Recommended:

- wide desktop: `≥ 1280px`;
- desktop: `1024–1279px`;
- tablet: `768–1023px`;
- mobile: `< 768px`;
- compact mobile: `< 480px`.

Breakpoints respond to hierarchy and reading order, not device labels alone.

### Gutters and page padding

- wide desktop: 64–96px;
- desktop: 48–72px;
- tablet: 32–48px;
- mobile: 20–24px;
- compact mobile: 16–20px.

### Vertical rhythm

- scene opening: 64–96px desktop, 40–64px mobile;
- major section separation: 64–80px desktop, 40–56px mobile;
- related section separation: 32–48px;
- content group separation: 16–24px.

### Columns

One column is the default. Use split layouts only when the secondary region
improves comparison or preserves context:

- Learn: event sequence plus current Understanding summary;
- detailed examination within Understand: reasoning/evidence plus a contextual
  rail;
- Plan: source recommendations plus a plan summary, if the approved mockup uses
  it;
- Return/Home: primary change plus a restrained secondary region.

The primary column must remain dominant. Side rails are allowed only for
context, qualification, or actions that benefit from persistence. They must not
become metric stacks.

### Sticky behavior

Sticky desktop actions are allowed when a long review culminates in one stable
decision. They must not obscure content or introduce a second primary action.

On mobile, a bottom action region may be sticky when:

- the action is the clear culmination of the scene;
- the label remains accurate throughout the scroll;
- safe-area insets are respected;
- users can still reach all content and errors;
- the region does not cover focused fields or disclosures.

## 6. Spacing System

Canonical proposed scale:

| Token | Value | Typical role |
| --- | ---: | --- |
| `space-0` | 0 | explicit reset |
| `space-1` | 4px | icon/text micro alignment |
| `space-2` | 8px | tightly related metadata |
| `space-3` | 12px | control internals |
| `space-4` | 16px | standard control/component gap |
| `space-5` | 24px | content group |
| `space-6` | 32px | component separation |
| `space-7` | 48px | related sections |
| `space-8` | 64px | major sections |
| `space-9` | 80px | scene pacing |
| `space-10` | 96px | large editorial opening |

Use 4–12px for micro relationships, 12–16px inside controls, 16–32px within
components, 32–64px between sections, and 64–96px between scene-level ideas.

Mobile usually reduces scene and section spacing by one step, not component
legibility. Whitespace should replace borders or cards whenever proximity and
alignment already communicate the grouping.

The current implementation's `--ds-space-*` variables use an 8px-forward scale.
Migration should add missing 4px, 12px, 80px, and 96px roles without changing
existing screens implicitly.

## 7. Typography System

The editorial serif/sans relationship is locked. Exact production families
remain unresolved.

- Serif: Living Understanding titles, synthesis, meaningful learning, and
  editorial statements.
- Sans: controls, body, metadata, labels, navigation, evidence detail, and
  operational text.
- Numeric forms: tabular numerals when values must compare.

Current code frequently uses Georgia plus Inter/system sans. This demonstrates
the relationship but does not canonize those final families.

| Role | Purpose | Desktop size | Mobile size | Weight / line height | Line length |
| --- | --- | ---: | ---: | --- | --- |
| display / hero | one consequential question or learning statement | 48–64px | 36–48px | regular; 1.02–1.12; tight tracking | 8–14 words preferred |
| page title | scene orientation | 36–48px | 30–38px | regular/medium; 1.1–1.2 | ≤ 28 characters where possible |
| Understanding title | durable user-facing orientation | 34–44px | 28–36px | serif regular; 1.1–1.2 | ≤ 2 lines |
| synthesis headline | current meaning | 28–36px | 23–29px | serif regular; 1.25–1.4 | 45–65 characters |
| section heading | major supporting idea | 22–28px | 20–24px | regular/medium; 1.25 | ≤ 2 lines |
| card/row heading | selectable or bounded item | 18–22px | 17–20px | medium; 1.3 | ≤ 2 lines |
| primary body | explanation and narrative | 16–18px | 16–18px | regular; 1.55–1.7 | 55–75 characters |
| secondary body | qualification and supporting context | 14–16px | 14–16px | regular; 1.5–1.65 | 55–75 characters |
| metadata | time, source class, status detail | 12–14px | 12–14px | regular/medium; 1.4 | short |
| label / eyebrow | restrained semantic category | 11–12px | 11–12px | semibold; 1.3; +0.08–0.14em | ≤ 3 words preferred |
| numeric emphasis | comparison only | 24–40px | 22–32px | regular/medium; 1.1 | always labeled |
| button text | action | 14–16px | 15–16px | medium/semibold; 1.2 | verb-led |

Avoid all-caps prose, extreme tracking, oversized confidence numbers, and
shrinking type to fit density. Responsive typography uses `clamp()` or discrete
roles; hierarchy must survive, not merely scale down.

## 8. Color System

Semantic roles are locked. Exact color values are **proposed defaults** pending
final visual approval.

| Role | Proposed reference | Meaning and use | Prohibited use |
| --- | --- | --- | --- |
| primary navy | `#101828` | primary ink, deep application frame, executive gravity | generic status meaning |
| interactive violet | `#6757D9` | primary action, focus-adjacent interactive emphasis | evidence strength or truth |
| interactive blue | `#356AE6` | links, selected relationships, secondary interaction | “safe” or “correct” |
| surface primary | `#F7F6F2` | calm editorial canvas | status signaling |
| surface elevated | `#FFFFFF` | focused bounded task or selected region | wrapping every section |
| border | `#D9DDE5` | restrained grouping and control affordance | primary hierarchy |
| text primary | `#101828` | essential meaning | disabled state |
| text secondary | `#475467` | explanation and qualification | hidden limitations |
| text muted | `#667085` | metadata and low-priority context | essential body text |
| strengthening | `#2F7D67` | explanation gained support | “true,” success, or good outcome |
| contradiction | `#9A5B37` | supported tension requiring examination | error or failure |
| weakening | `#8A6073` | explanation lost support | bad organizational performance |
| relationship | `#4169A8` | meaningful connection emerged or strengthened | causal proof |
| uncertainty / unknown | `#796728` | unresolved material question | warning without consequence |
| stable | `#5D6B78` | no material Understanding change | healthy or complete |
| focus | `#6D5CE7` | keyboard focus ring | decoration |
| disabled | `#98A2B3` | unavailable control with reason where needed | hidden action |

Dark-theme equivalents may be required by approved mockups. Current
implementation tokens (`--ds-bg`, `--ds-surface`, `--ds-gold`,
`--ds-text`, and status colors) are legacy compatibility inputs, not locked
semantic mappings. A future token migration must map roles explicitly and
validate contrast rather than mechanically rename values.

Canonical rules:

- green does not mean true;
- orange does not mean error;
- confidence increase does not mean organizational improvement;
- contradiction must not look like system failure;
- stable does not mean healthy;
- lower confidence is not inherently bad;
- color is never the only indicator;
- text, icon/shape where useful, and an accessible name accompany semantic
  color;
- normal text meets WCAG AA contrast (4.5:1), large text and essential graphical
  elements meet applicable AA thresholds.

## 9. Surface, Border, Radius, and Shadow System

### Surface hierarchy

1. Page/canvas: continuous editorial field.
2. Inset: quiet contextual or editable region.
3. Elevated: focused selection, temporary panel, or high-value bounded task.
4. Semantic callout: contradiction, unknown, restriction, or meaningful change
   with its own interpretive responsibility.

A card is justified when content is independently selectable, expandable,
comparable, movable, or stateful. Whitespace and dividers are preferred for
narrative sections.

### Recommended radii

- `radius-sm`: 6px, compact controls;
- `radius-md`: 10px, inputs and bounded rows;
- `radius-lg`: 16px, focused surfaces;
- `radius-xl`: 24px, rare scene-level panels;
- `radius-pill`: 999px, only compact status or action forms whose shape aids
  recognition.

Final radius scale remains unresolved. Current implementation uses 12–32px
radii and should not be treated as canonical.

### Borders and dividers

- base: 1px neutral border;
- emphasized: 1px semantic or interactive border;
- dividers: 1px, lower contrast than control boundaries;
- selected state: border plus surface and explicit state text;
- focus: separate visible focus ring, never border-color alone.

### Shadows

- none: default;
- low: subtle elevation for menus, sticky actions, or focus;
- medium: temporary drawer/dialog only;
- high: discouraged and reserved for true modal separation.

Avoid deep shadow stacks, glowing cards, decorative containers, excessive
rounded rectangles, and equal visual weight across all information.

## 10. Iconography

Icons are simple, geometric, calm, and primarily outlined. Recommended stroke:
1.5–2px with rounded joins/caps where appropriate.

Sizes:

- 16px inline;
- 20px standard control;
- 24px primary row/action;
- 32px rare empty-state or semantic illustration.

Rules:

- functional icons require an accessible label; visible text remains default;
- status icons pair with text and color;
- decorative icons are hidden from assistive technology;
- mobile icons never replace ambiguous labels solely to save space;
- use one library or internally coherent set once approved;
- do not mix filled, outlined, and illustrative styles casually.

Avoid brains, neural networks, robot heads, generic pipelines, magical wands,
and sparkle overload.

The Discovery star/compass mark represents orientation, inquiry, and meaningful
discovery. Use it for brand identity, rare Discovery-authored moments, and
orientation—not as a bullet, loading indicator, status icon, or decoration on
every card.

## 11. Controls and Interaction Hierarchy

| Control | Treatment | Use |
| --- | --- | --- |
| primary action | one filled or strongly emphasized control | advances the governing question |
| secondary action | outlined or quiet surface | valid alternative path |
| tertiary action | text or icon-plus-text | refinement, back, cancel, learn more |
| destructive/caution | explicit language and restrained caution styling | irreversible or materially sensitive action |
| text link | inline, underlined or clearly interactive | related detail/navigation |
| disclosure | labeled row with state indicator | expand reasoning/evidence |
| selectable row | entire row target, explicit selected state | plan source or response path |
| segmented choice | only 2–4 mutually exclusive compact choices | scope/state mode |
| input/textarea | visible label, boundary, help/error association | question or contribution |
| badge | rare compact lifecycle/semantic label | not a substitute for explanation |
| toggle | immediate reversible binary preference only | not a multi-state policy choice |
| follow state | quiet durable state plus meaning | stewardship, not notification gamification |
| confidence detail | disclosure linked to rationale | never an unexplained badge |
| scope control | explicit current scope and change path | never hidden in a generic filter icon |

Inline editing must preserve the original value, provide cancel, expose
validation, and avoid silently changing canonical meaning.

Buttons should be prominent only when the user has enough context to act.
Action styling must not overpower the Understanding.

## 12. Core Semantic Visual States

| State | Meaning | Visual treatment | Wording | Prohibited interpretation |
| --- | --- | --- | --- | --- |
| current synthesis | Discovery's best current meaning | primary editorial type, open space | “Discovery currently understands…” | final answer |
| confidence | degree of support | qualitative label plus rationale disclosure | “Moderate because…” | truth probability or success |
| strengthening | support increased | subtle strengthening marker and before/after | “Additional evidence strengthened…” | good news |
| weakening | support decreased | equal prominence, weakening marker | “This explanation weakened because…” | system failure |
| contradiction | supported conflict | distinct calm callout, not error red | “A contradiction emerged…” | bad data |
| unknown | material unresolved question | exploratory callout and next learning | “Discovery does not yet know…” | generic missing data |
| relationship | supported connection | labeled link/line with explanation | “Meaningfully connected…” | causality |
| learning recommendation | best next uncertainty reduction | quiet recommendation with expected gain | “Investigate next because…” | mandatory task |
| meaningful change | warranted model change | narrative before/after | “What changed / why” | activity update |
| followed | user chose continued stewardship | quiet durable label | “Following” | notification subscription |
| stable | no material change | neutral treatment | “Remains stable” | healthy or complete |
| more uncertain | new evidence widened uncertainty | visible qualification | “Confidence decreased because…” | degradation |
| needs context | current evidence insufficient | calm request and purpose | “This would clarify…” | onboarding failure |
| restricted evidence | content/use not available | permitted explanation and next path | “This evidence is unavailable for this purpose” | confirmation that protected evidence exists |
| provisional | early, reviewable interpretation | label, lighter emphasis, explicit next evidence | “Early interpretation” | settled conclusion |

Every state has an accessible text equivalent and cannot depend on position,
shape, color, or animation alone.

## 13. Data Visualization Rules

Use visualization only when it makes a material relationship easier to
understand than concise prose.

Permitted:

- Understanding evolution over time;
- before/after comparison;
- confidence movement with explanation;
- relationship emergence or change;
- historical change when narrative alone is insufficient.

Required:

- clear title and explanatory narrative;
- explicit units, time, scale, and uncertainty;
- accessible table or textual alternative;
- no implied causality beyond evidence;
- semantic states labeled directly;
- stable comparison baseline.

Discouraged or prohibited:

- generic KPI dashboards;
- document, event, or activity counts presented as value;
- decorative charts;
- unlabeled sparklines;
- traffic-light dashboards;
- organization health scores without validated meaning;
- gauges without rationale;
- charts that imply causal direction;
- visualization merely to occupy space.

## 14. Responsive System

### Desktop

Use spacious left-aligned reading layouts. Split only when comparison or
persistent context materially helps. Navigation may be persistent after it is
earned.

### Tablet

Stack secondary regions beneath the primary narrative. Preserve hierarchy,
labels, and comfortable line length. Do not squeeze a desktop side rail.

### Mobile

Canonical reading priority:

1. governing question or meaningful change;
2. current synthesis;
3. confidence rationale or material uncertainty;
4. primary action;
5. contradiction/risk where material;
6. progressively disclosed detail.

Mobile is recomposed, not shrunk. Multi-column comparisons become labeled
sequences. Sticky actions use safe areas. Bottom navigation remains an open
decision.

Minimum touch target: 44×44px; 48px is recommended for primary controls.
Truncation is prohibited for synthesis, uncertainty, contradiction, action
labels, and error text. Secondary metadata may truncate only with an accessible
full-value path.

Disclosure that opens beside content on desktop normally opens inline or as a
focused full-width layer on mobile. Focus returns to the trigger on close.

## 15. Accessibility

Canonical requirements:

- WCAG 2.2 AA contrast;
- full keyboard operation;
- visible, consistent `:focus-visible` treatment;
- semantic heading order;
- programmatic labels and descriptions;
- logical DOM and reading order matching visual hierarchy;
- live-region announcements for material dynamic state changes;
- reduced-motion parity;
- no color-only or animation-only meaning;
- 44×44px minimum touch targets;
- errors linked to fields and announced;
- user input preserved after validation or network failure;
- zoom to 200% and text resizing without loss of content or function;
- readable line lengths and paragraph rhythm;
- pause, stop, or skip for timed/auto-advancing learning;
- focus moves to the new scene heading after a scene transition;
- focus is not stolen for background learning changes;
- before/after and confidence movement expressed in text;
- restricted-state explanations avoid inaccessible hidden context.

## 16. Motion Principles Summary

Motion explains change. The Understanding changes; the chrome remains stable.

Prohibited:

- simulated typing;
- token streaming;
- generic AI processing animation;
- decorative looping movement;
- unnecessary stagger;
- animated neural networks;
- celebratory effects;
- motion-only meaning.

The Discovery Motion System is authoritative for duration bands, easing,
motion tokens, and reduced-motion equivalents. This UI System defines only the
visual hierarchy and semantic state that motion must preserve; it does not
maintain a second motion scale.

Reduced motion replaces transformation with instant state plus restrained
opacity where acceptable, subject to the Motion System's canonical guidance.

## 17. Copy and Voice Interface Rules

Prefer:

- Understanding;
- learning;
- evidence;
- current synthesis;
- contradiction;
- unknown;
- meaningful change;
- what changed;
- why it matters;
- what Discovery is trying to understand next.

Avoid in normal user-facing UI:

- processing;
- ingestion;
- model output;
- AI-generated;
- confidence score;
- dashboard;
- monitor;
- alerts;
- pipeline;
- final answer;
- complete;
- root cause, unless evidence genuinely supports causality.

Copy distinguishes evidence, interpretation, recommendation, human decision,
and observed outcome. It leads with meaning and qualifies uncertainty beside the
claim. Technical language is reserved for authorized diagnostic views.

## 18. Screen-Level Application

### Ask

- **Question:** What would you like Discovery to understand?
- **Hero:** consequential question and natural-language input.
- **Density:** extremely sparse.
- **Primary action:** Begin understanding.
- **Avoid:** chatbot framing, setup, source upload, persistent navigation.
- **Primitives:** editorial hero, labeled textarea/input, quiet examples, one
  action.

### Orient

- **Question:** Did Discovery understand what I am trying to learn?
- **Hero:** interpreted Understanding objective.
- **Density:** sparse editorial.
- **Primary action:** Continue with this Understanding.
- **Avoid:** configuration form, confident answer, scope-card grid.
- **Primitives:** preserved question, objective, scope groups, unknown,
  qualitative confidence.

### Plan

- **Question:** How should Discovery improve this Understanding?
- **Hero:** expected Understanding change and deliberate learning plan.
- **Density:** structured.
- **Primary action:** Begin learning / approved mockup label.
- **Avoid:** connector marketplace, mandatory sources, promised confidence.
- **Primitives:** source recommendation row, expected-gain label, scope control,
  limitation, plan summary.

### Learn

- **Question:** How is the Understanding changing?
- **Hero:** active meaningful learning event and current Understanding.
- **Density:** alive but sequential.
- **Primary action:** pause/examine/continue as context requires.
- **Avoid:** AI animation, token stream, generic progress bar, activity theater.
- **Primitives:** event timeline, change annotation, confidence rationale,
  contradiction, before/after.

### Understand

- **Question:** What does Discovery currently understand?
- **Hero:** Living Understanding title and synthesis.
- **Density:** narrative.
- **Primary action:** Examine why Discovery believes this.
- **Avoid:** analytics card around synthesis, metric-first confidence,
  hidden contradiction.
- **Primitives:** synthesis hero, status, confidence rationale, unknown,
  contradiction, meaningful change, relationship.

### Respond

- **Question:** How does this Understanding compare with what you see?
- **Hero:** synthesis context plus stewardship invitation.
- **Density:** focused collaborative.
- **Primary action:** submit the selected contribution path.
- **Avoid:** feedback survey, thumbs, generic modal, executive input as truth.
- **Primitives:** response-path rows, structured input, effect preview,
  resulting state.

### Follow

- **Question:** Should Discovery keep learning about this?
- **Hero:** meaning and future of following.
- **Density:** calm and ceremonial.
- **Primary action:** Follow this Understanding, then Finish per approved flow.
- **Avoid:** notification subscription framing, confetti, settings overload.
- **Primitives:** follow commitment, meaningful-change explanation, future
  learning preview, quiet confirmation.

### Return

- **Question:** What did Discovery learn while I was away?
- **Hero:** meaningful-learning summary and most important change.
- **Density:** prioritized editorial.
- **Primary action:** view the most important changed Understanding.
- **Avoid:** notification center, daily report, manufactured novelty.
- **Primitives:** learning summary, narrative change, before/after,
  recommendation, followed row.

### Home

- **Question:** What deserves attention now?
- **Hero:** current highest-value learning or inquiry.
- **Density:** curated and adaptive.
- **Primary action:** depends on the most valuable active lifecycle step.
- **Avoid:** equal-weight modules, KPI wall, activity feed, navigation as hero.
- **Primitives:** meaningful learning, Living Understanding, current unknown,
  one primary interaction, quiet navigation.

## 19. Implementation Tokens

Token roles below are **proposed architecture**, not an implementation change.

```css
/* layout */
--ds-layout-max: 90rem;
--ds-layout-scene: 75rem;
--ds-layout-wide: 80rem;
--ds-layout-reading: 45rem;
--ds-layout-compact: 37.5rem;
--ds-layout-rail: 18rem;

/* spacing */
--ds-space-1: 0.25rem;
--ds-space-2: 0.5rem;
--ds-space-3: 0.75rem;
--ds-space-4: 1rem;
--ds-space-5: 1.5rem;
--ds-space-6: 2rem;
--ds-space-7: 3rem;
--ds-space-8: 4rem;
--ds-space-9: 5rem;
--ds-space-10: 6rem;

/* typography */
--ds-font-editorial: <approved-serif-stack>;
--ds-font-interface: <approved-sans-stack>;
--ds-type-display: clamp(3rem, 5vw, 4rem);
--ds-type-understanding: clamp(2.125rem, 4vw, 2.75rem);
--ds-type-synthesis: clamp(1.4375rem, 3vw, 2.25rem);
--ds-type-body: 1rem;
--ds-leading-body: 1.65;

/* semantic color */
--ds-color-canvas: <approved-value>;
--ds-color-surface-primary: <approved-value>;
--ds-color-surface-elevated: <approved-value>;
--ds-color-border: <approved-value>;
--ds-color-text-primary: <approved-value>;
--ds-color-text-secondary: <approved-value>;
--ds-color-text-muted: <approved-value>;
--ds-color-interactive-primary: <approved-value>;
--ds-color-focus: <approved-value>;
--ds-semantic-strengthening: <approved-value>;
--ds-semantic-weakening: <approved-value>;
--ds-semantic-contradiction: <approved-value>;
--ds-semantic-unknown: <approved-value>;
--ds-semantic-relationship: <approved-value>;
--ds-semantic-stable: <approved-value>;

/* form and surface */
--ds-border-width: 1px;
--ds-radius-sm: 0.375rem;
--ds-radius-md: 0.625rem;
--ds-radius-lg: 1rem;
--ds-radius-xl: 1.5rem;
--ds-shadow-low: <approved-value>;
--ds-shadow-medium: <approved-value>;

/* layers */
--ds-layer-base: 0;
--ds-layer-sticky: 10;
--ds-layer-popover: 30;
--ds-layer-dialog: 50;
--ds-layer-toast: 70;
```

Layer values express ordering categories; components must not invent arbitrary
z-index escalation.

Compatibility:

- current `--ds-*` names may be retained where their semantics match;
- global colors named only by appearance or generic success/warning/danger must
  migrate to semantic roles;
- legacy dark-shell and gold tokens require an explicit mapping;
- migration must be incremental and visually regression-tested;
- no global token replacement is authorized by this document.

## 20. Anti-Patterns

Discovery must not use:

1. Dashboard-first layouts.
2. Metric-card proliferation.
3. Unexplained confidence gauges.
4. Decorative charts.
5. Generic AI animation.
6. Token streaming or simulated typing.
7. Gradient spectacle.
8. Equal-weight cards.
9. Dense sidebars before value exists.
10. Activity logs presented as learning.
11. Source or document counts presented as product value.
12. Green as correct or true.
13. Orange/red contradiction styling as system error.
14. Overconfident or absolute copy.
15. Badge proliferation.
16. Unnecessary modal workflows.
17. Hidden limitations or uncertainty.
18. Dense tables when narrative is clearer.
19. Buttons that overpower the synthesis.
20. Unsupported urgency.
21. Generic empty states.
22. Technical implementation language in normal UI.
23. Smaller typography merely to fit more.
24. Uncontrolled prose line length.
25. Missing or low-contrast focus states.
26. Mobile layouts that only shrink desktop.
27. Cards around every section.
28. Deep shadow stacks and glowing panels.
29. Navigation as the product's organizing metaphor.
30. Chatbot landing-page conventions.
31. Configuration before meaningful value.
32. Decorative network or brain imagery.
33. Confidence increase presented as organizational improvement.
34. Stable state presented as healthy or complete.
35. Contradiction hidden to simplify the story.
36. User confirmation treated as proof.
37. Provider output styled as unquestionable truth.
38. Animation-only model change.
39. Truncated synthesis or uncertainty on mobile.
40. Decisions or Initiatives inserted into the Understanding flow without
    product approval.

## 21. Review Checklist

### For designers

- What is the one question this screen answers?
- Is the Understanding visually primary?
- Does meaning precede metrics and action?
- Can 15–20% of the chrome be removed?
- Is whitespace doing work before another card is added?
- Is confidence explained?
- Are contradictions and unknowns visible with equal dignity?
- Does the scene density match its journey stage?
- Is any chart decorative?
- Does the experience resemble generic enterprise SaaS?
- Does the mobile design preserve reading order rather than shrink desktop?
- Is an unresolved scene decision being invented?

### For engineers

- Do semantic roles map to tokens rather than local arbitrary values?
- Is DOM order coherent without CSS?
- Are focus, keyboard, labels, errors, and dynamic announcements complete?
- Does reduced motion preserve all meaning and function?
- Are touch targets at least 44×44px?
- Are prose widths controlled?
- Is every semantic state represented by text, not color alone?
- Does the implementation preserve input and focus through errors/transitions?
- Are sticky regions safe on small-height and mobile viewports?
- Did existing code get mistaken for canon?

### For reviewers

- Does the screen lead with meaning rather than mechanics?
- Is there one primary action?
- Are metrics semantically justified?
- Can the user explain what changed and why?
- Is user authority distinct from Discovery's interpretation?
- Does Governance cover confidence, counts, absence, refusal, and provider
  output—not just body text?
- Is the interface honest about prototype versus production behavior?
- Has visual fidelity been assessed against the approved mockup?

### For Codex

- Did I read the Product Canon, Design Language, UI System, relevant scene
  specification, approved mockup, and current implementation?
- Did I change only authorized files?
- Did I preserve unrelated dirty work?
- Did I avoid resolving an open design decision?
- Did I use existing semantic tokens/components where valid?
- Did I avoid creating a new product object or architecture?
- Did I validate desktop, tablet, mobile, keyboard, focus, reduced motion, and
  semantic states?
- Did I report existing validation failures accurately?

## 22. Open Decisions

The following remain unresolved and require design approval or validated
research:

1. Final production serif and sans font families.
2. Final exact color values and whether the approved experience supports one or
   multiple themes.
3. Whether numeric confidence is displayed by default.
4. Final radius scale.
5. Final shadow values.
6. Final desktop sidebar width and the point at which persistent navigation is
   earned.
7. Final tablet and mobile navigation, including bottom navigation.
8. Exact icon library and any custom semantic icons.
9. Final focus-ring color, width, and offset within the approved palette.
10. Whether Plan uses cards, bordered sections, or a continuous list.
11. Whether Learn uses one column or a learning-plus-summary split.
12. Default disclosure depth for contradictions, confidence rationale, and
    evidence.
13. Final primary-action shape and placement across scenes.
14. Exact dark/light semantic token mappings.
15. Which proposed UI transitions require application-specific clarification
    within the existing `DISCOVERY_MOTION_SYSTEM.md` contract.

Scene-specific open decisions remain owned by their specifications and are not
repeated or resolved here.

## 23. Definition of Done

The UI foundation is complete when it:

- guides consistent implementation across all nine canonical scenes;
- preserves approved mockup composition and visual intent;
- prevents generic SaaS and dashboard drift;
- clearly separates locked semantic roles, recommended defaults, and unresolved
  decisions;
- supports WCAG 2.2 AA interaction and responsive reading;
- gives the Component Library and Motion System a stable semantic basis;
- preserves the Design Language, Platform Principles, Governance, Runtime, and
  cognitive boundaries;
- does not redesign Experience Alpha;
- does not claim production readiness;
- changes no production architecture or behavior.

This document itself implements none of the tokens, components, motion,
responsive behavior, or scene designs it defines.
