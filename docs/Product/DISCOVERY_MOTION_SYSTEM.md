# Discovery Motion System

## 1. Status and Authority

**Status:** Canonical product guidance for Discovery motion.

This document governs how approved Discovery interactions communicate change
through motion. It is for product designers, frontend engineers,
accessibility reviewers, test authors, and Codex.

The authority order is:

1. `PRODUCT_CANON.md` governs product identity.
2. `DISCOVERY_DESIGN_LANGUAGE.md` governs experience behavior.
3. the Experience Alpha canonical specification governs the journey;
4. detailed scene specifications govern scene behavior;
5. `DISCOVERY_UI_SYSTEM.md` governs visual hierarchy;
6. `DISCOVERY_COMPONENT_LIBRARY.md` governs component semantics;
7. this document governs motion behavior;
8. approved mockups govern resolved visual execution.

Motion may clarify an approved interaction. It may not invent a state,
transition, cognitive event, causal relationship, progress claim, or product
capability. Where an approved mockup conflicts with a higher authority, the
higher authority prevails and the conflict must be recorded.

Reduced motion is an equal implementation, not a degraded mode. Every
meaningful transition defined here requires a non-motion equivalent.

Labels used below:

- **Locked requirement** — required by existing canon.
- **Recommended default** — the preferred implementation until product
  validation provides better evidence.
- **Illustrative example** — guidance, not a production contract.
- **Unresolved decision** — requires design or product validation.

## 2. Purpose

Discovery motion makes changes in understanding legible. It communicates:

- state change;
- causal sequence;
- hierarchy;
- continuity between revisions;
- the bounded effect of a user contribution;
- qualified changes in confidence;
- the emergence of contradictions and unknowns;
- the emergence or weakening of relationships;
- movement from a consequential question to a Living Understanding.

Motion must not communicate:

- artificial intelligence “thinking”;
- token generation;
- generic or fabricated progress;
- excitement, achievement, or gamification;
- urgency unsupported by consequence;
- activity volume as learning;
- certainty unsupported by the underlying projection.

The test is simple: if removing an animation changes what a user believes
Discovery knows, the same meaning must already exist in text, structure, and
state.

## 3. Motion Principles

### 3.1 Motion explains change

**Rationale:** Discovery visualizes changes in understanding, not activity.

**Implementation implication:** Animate only between named semantic states and
keep the before/after meaning inspectable.

**Common violation:** Animating a feed because new records arrived.

### 3.2 The Understanding moves; chrome remains quiet

**Rationale:** The Living Understanding is the primary user-facing object.

**Implementation implication:** Reserve meaningful motion for synthesis,
unknown, contradiction, relationship, learning, contribution, and follow
state. Navigation and surfaces use only brief functional transitions.

**Common violation:** Animated sidebars, ambient backgrounds, or moving cards
competing with the Understanding.

### 3.3 Meaning appears before mechanics

**Rationale:** A user needs to know what changed before seeing how the
interface rearranges.

**Implementation implication:** Make the changed statement or label available
at the start of a transition; reveal supporting mechanics afterward.

**Common violation:** Drawing a relationship line before explaining the
relationship.

### 3.4 Continuity is more important than spectacle

**Rationale:** A Living Understanding should feel historically continuous.

**Implementation implication:** Preserve a stable visual anchor when language,
confidence, or supporting material changes.

**Common violation:** Replacing an entire scene with a dramatic reveal that
forces the user to reconstruct context.

### 3.5 Motion is interruptible

**Rationale:** Reading and user agency take precedence over choreography.

**Implementation implication:** Focus, disclosure, input, pause, skip, route
navigation, and reduced-motion preference can end or bypass a sequence.

**Common violation:** Locking controls until an animation finishes.

### 3.6 Motion never delays comprehension

**Rationale:** Reading burden includes waiting.

**Implementation implication:** Content is usable immediately; transitions
finish within the restrained duration bands.

**Common violation:** A long intro animation before the synthesis is readable.

### 3.7 Motion is never the sole state indicator

**Rationale:** Motion is not reliably perceived by every user.

**Implementation implication:** Pair every transition with persistent text,
structure, iconography where helpful, and accessible state.

**Common violation:** Using movement alone to show that an explanation
weakened.

### 3.8 Reduced motion preserves meaning

**Rationale:** Accessibility may change presentation, never product meaning.

**Implementation implication:** Replace spatial or temporal motion with
immediate state replacement, labels, a change summary, focus, or a visible
before/now comparison.

**Common violation:** Removing the change explanation when animation is off.

### 3.9 Loading communicates purposeful learning

**Rationale:** Waiting must remain truthful and tied to the approved objective.

**Implementation implication:** Show the last stable Understanding and a
bounded status such as the source category currently being examined.

**Common violation:** A spinner labeled “Discovery is thinking.”

### 3.10 Confidence movement remains qualified

**Rationale:** Confidence is epistemic, not a performance score.

**Implementation implication:** Update direction, reason, and limitation
together; visual emphasis remains secondary to synthesis language.

**Common violation:** A celebratory gauge rising to a larger number.

### 3.11 Contradictions emerge with equal dignity

**Rationale:** Contradictory evidence is part of understanding, not an error.

**Implementation implication:** Introduce contradictions calmly, at the same
reading level as support, with their effect stated.

**Common violation:** Flashing red, shaking, pulsing, or alert sounds.

### 3.12 Contributions create bounded visible effects

**Rationale:** User stewardship should be consequential without implying that
authority overwrites evidence.

**Implementation implication:** Show what Discovery heard, what changed, what
remained unchanged, and whether the effect is provisional.

**Common violation:** Morphing the entire Understanding immediately after an
unsupported assertion.

### 3.13 Scene transitions preserve orientation

**Rationale:** The nine-scene journey is one inquiry, not nine disconnected
pages.

**Implementation implication:** Preserve organization and Understanding
identity, move focus to the new scene heading, and maintain browser history.

**Common violation:** Resetting scroll and context without naming the next
question.

### 3.14 Repeated motion becomes quieter

**Rationale:** Repetition should reduce attention cost.

**Implementation implication:** The first meaningful emergence may use the
standard band; repeated rows, events, or revisions use fast transitions or
immediate replacement.

**Common violation:** Replaying a staggered sequence on every return.

### 3.15 No simulated typing or token streaming

**Rationale:** Discovery is not a chatbot and must not expose provider-shaped
theater.

**Implementation implication:** Present bounded, complete semantic units.

**Common violation:** Revealing a synthesis character by character.

## 4. Motion Taxonomy

| Type | Meaning | Recommended use |
| --- | --- | --- |
| Entrance | A meaningful object becomes available | first synthesis, contradiction, relationship |
| Exit | An object is no longer in the active view | dismissed disclosure or superseded transient UI; never erase history |
| Expansion | More detail becomes visible | evidence, rationale, limitation |
| Collapse | Detail recedes without being lost | progressive disclosure |
| Replacement | A semantic value changes in place | synthesis revision, state label |
| Reordering | Priority changes | meaningful-change ordering with explicit reason |
| Progress | A bounded approved sequence advances | Learning events only |
| Semantic state change | Meaning changes without route change | confidence, follow, restricted, provisional |
| Scene transition | The governing question changes | Ask through Home |
| Focus transition | Reading or action focus moves | route entry, inline expansion, recovery |
| Confirmation | A bounded action was accepted | contribution received, Follow state |
| Error recovery | Stable content remains while an action recovers | retry, preserved input, stale projection |

Reordering is permitted only when priority rules are explicit in the view
model. Motion does not decide priority.

## 5. Duration System

These are recommended defaults, not implemented tokens:

| Band | Range | Permitted use |
| --- | --- | --- |
| Immediate | 0–80ms | pressed state, focus styling, reduced-motion replacement |
| Fast | 120–180ms | hover, disclosure icon, small confirmation, repeated changes |
| Standard | 200–300ms | expansion, replacement, semantic entrance |
| Deliberate | 320–500ms | first Understanding evolution, before/now transition |
| Narrative | 500–800ms | rare scene-level continuity where multiple semantic steps must be read in order |

No single required reading action should wait for a narrative transition.
Sequences must not become cinematic. Total choreography should be no longer
than the content needs to become understandable and must be interruptible.

## 6. Easing System

Illustrative roles:

| Role | Suggested curve | Use |
| --- | --- | --- |
| Standard entrance | `cubic-bezier(.2,.8,.2,1)` | calm reveal and expansion |
| Standard exit | `cubic-bezier(.4,0,1,1)` | brief removal of transient UI |
| Emphasis | `cubic-bezier(.16,1,.3,1)` | restrained semantic change |
| Spatial movement | `cubic-bezier(.22,1,.36,1)` | anchored layout movement |
| Crossfade | linear or standard | language replacement |

Spring behavior is not a default. If future testing demonstrates that spring
physics improve spatial continuity, they must be critically damped, contain no
bounce or overshoot, and respect reduced motion. Playful bounce is prohibited.

## 7. Signature Motion Patterns

### Understanding emergence

The original question remains visible as the first bounded Understanding
appears. The objective arrives before supporting scope. The current synthesis
enters as a complete unit, not streamed text. Confidence and unknown follow as
qualification, not as a score reveal.

Reduced motion: immediate replacement plus “Discovery’s current
understanding” and a visible boundary statement.

### Understanding evolution

During Learn:

1. preserve the prior synthesis as the perceptual anchor;
2. introduce the Learning Event’s meaning;
3. replace or crossfade only changed language;
4. identify the difference in text;
5. update contradiction, unknown, or relationship state explicitly;
6. update confidence secondarily with reason;
7. preserve the prior revision in history.

Unchanged content does not animate. History is never rewritten.

### Confidence change

Show direction, reason, and qualification together. A concise change label may
appear before the updated qualitative state. Numeric interpolation is not a
default and must not make confidence resemble a KPI.

Example: “Confidence strengthened because the pattern appeared across two
independent contexts. Causality remains uncertain.”

### Contradiction emergence

Use a standard entrance or immediate reveal. The label “Contradiction,” its
statement, and its effect become available together. Do not flash, shake,
pulse, use an alert role by default, or push supporting evidence out of view.

### Unknown narrowing or expansion

Preserve the prior unknown long enough to compare it with the new boundary.
Name whether the unknown became more specific, was partially resolved, or
expanded. Increased uncertainty is a valid learning outcome.

### Relationship emergence

Make the explanatory language available first. A line, adjacency, or spatial
connection may then appear. Directionality and causal qualification remain
textual. Decorative graph movement is prohibited.

### Contribution effect

Use a three-part bounded transition:

1. “Discovery heard” — interpreted contribution;
2. “This changed” — accepted or provisional effect;
3. “This remains” — unchanged synthesis, contradiction, or limitation.

The effect preview must not imply durable acceptance before the action
completes.

### Follow confirmation

The Follow action resolves into a quiet persistent state label and a concise
statement of future stewardship. It may use a fast opacity or border
transition. It must not resemble a subscription conversion, achievement, or
celebration.

### Return reveal

Reveal the single most important meaningful change first. Secondary changes
remain visible after the primary story is understandable. Do not animate every
followed Understanding.

### Home learning brief

Use editorial sequencing: greeting/context, meaningful learning summary,
dominant change, followed Understandings, then Ask entry. Avoid tile stagger,
animated counts, or dashboard loading patterns.

## 8. Scene-Level Motion

The current product-component canon names the journey Ask → Orient → Plan →
Learn → Understand → Respond → Follow → Return → Home. Detailed Alpha scene
files still name Examine and Challenge or Confirm separately and treat Return
as the returning homepage. Until those specifications are reconciled,
`Respond` is the product-level composition for examination and stewardship
paths, and `Home` is the persistent destination expressed by the Return
specification. This mapping does not authorize combining or deleting detailed
behavior.

| Scene | Entry | Primary interaction | State transition | Exit | Prohibited |
| --- | --- | --- | --- | --- | --- |
| Ask | immediate, sparse focus on the question | input acknowledgement only | submitted question remains as anchor | objective begins to appear | typing simulation, animated examples |
| Orient | question persists; objective appears | inline refinement with stable scope | revised fields identify what changed | approved objective remains visible | onboarding stepper, configuration animation |
| Plan | learning purpose before source rows | include/limit/exclude changes update summary in place | expected effect updates only from fixture/view model | approved plan becomes stable | connector-logo parade, progress promise |
| Learn | last stable Understanding first | manual or bounded event progression | event meaning precedes evolution | ready state names why | AI theater, source-count counters |
| Understand | synthesis available immediately | disclosure and Examine action | confidence/unknown/contradiction changes are qualified | identity and current revision persist | hero reveal that blocks reading |
| Respond | active question and Understanding remain | response path expands inline | effect preview → accepted/provisional result | unchanged elements persist | survey transitions, thumbs animation |
| Follow | current Understanding remains hero | Follow changes to persistent state | future-learning scope appears | route preserves identity | confetti, subscription animation |
| Return | dominant change first | examine or continue learning | before/now is explicit | Home context remains available | notification-feed cascade |
| Home | editorial brief appears in reading order | choose dominant item or Ask | selected Understanding carries into next scene | meaningful context persists | animated dashboard tiles |

## 9. Loading and Waiting

Preferred hierarchy:

1. keep the last stable Understanding visible;
2. state the bounded operation;
3. name the approved source category or learning stage when known;
4. provide pause, skip, or retry where the scene permits;
5. distinguish waiting from confirmed learning.

Permitted examples:

- “Preparing the approved learning plan.”
- “Examining the selected source category.”
- “The current Understanding remains unchanged while this source is
  unavailable.”

Avoid spinners as the only indicator, skeleton overload, simulated typing,
generic “AI is thinking,” and looping sparkle animation. A spinner may
supplement a short action when labeled, but it never represents cognition.
Loading must not fabricate progress percentages, event completion, or source
work.

## 10. Auto-Advance and User Control

Auto-advance is allowed only in deterministic Learn sequences where:

- the next state is already available;
- the transition does not imply live cognitive work;
- the content remains readable;
- pause, resume, skip, and manual progression are present;
- focus or interaction pauses the sequence;
- the view does not advance while a disclosure is open;
- assistive technology receives restrained, meaningful announcements.

All other scene changes require explicit user action. Focus moves to the new
scene heading after navigation. Skipping changes presentation timing, not the
underlying semantic result.

## 11. Reduced Motion

| Meaning | Reduced-motion parity |
| --- | --- |
| Synthesis change | immediate replacement plus persistent “Changed from…” summary or before/now |
| Confidence change | updated label plus reason and direction text |
| Contradiction emergence | immediate visible section with semantic heading |
| Relationship emergence | immediate textual relationship; static connector optional |
| Scene transition | immediate route render and focus on heading |
| Progress | explicit event index/state and manual controls |
| Confirmation | immediate persistent state plus one restrained announcement |

Use `prefers-reduced-motion` as the default signal and provide product control
only if future research demonstrates a need. Reduced motion must preserve
order, reading position where possible, and all actions.

## 12. Accessibility

- Meet WCAG 2.2 AA requirements applicable to motion, focus, status, and
  interaction.
- Avoid flashing and any sequence exceeding applicable flash thresholds.
- Avoid large unrequested spatial movement and continuous movement that can
  trigger vestibular symptoms.
- Never encode state in motion alone.
- Use live regions only for completed, material user-relevant changes.
- Move focus after route transitions and deliberate inline mode changes, not
  after every animation.
- Keyboard input can pause or interrupt progression.
- Screen-reader summaries identify what changed and what remained stable.
- Preserve reading position during inline updates unless the user explicitly
  navigates.
- Never auto-scroll without user control.

## 13. Motion Tokens

Illustrative names:

```css
--ds-duration-instant: 60ms;
--ds-duration-fast: 150ms;
--ds-duration-standard: 240ms;
--ds-duration-deliberate: 400ms;
--ds-duration-narrative: 640ms;
--ds-ease-standard: cubic-bezier(.2, .8, .2, 1);
--ds-ease-emphasis: cubic-bezier(.16, 1, .3, 1);
--ds-ease-exit: cubic-bezier(.4, 0, 1, 1);
--ds-motion-distance-sm: 4px;
--ds-motion-distance-md: 12px;
```

These examples do not add tokens to the repository. Final values require
high-fidelity prototype and accessibility validation.

## 14. Component Motion Matrix

| Component | Default pattern | Persistent meaning | Reduced motion |
| --- | --- | --- | --- |
| UnderstandingHero | calm complete-unit entrance | identity, synthesis, status | immediate render |
| CurrentSynthesis | anchored replacement | before/now or change summary | immediate replacement |
| ConfidenceSummary | secondary label/value transition | direction, reason, limitation | text update |
| PrimaryUnknown | standard entrance/change | unknown, importance, next learning | immediate section |
| MeaningfulContradiction | calm entrance | contradiction and effect | immediate section |
| UnderstandingRelationship | explanation then optional connector | relationship and qualification | static text |
| LearningEvent | bounded step transition | learned/changed/remains | explicit event state |
| UnderstandingEvolution | deliberate anchored comparison | prior and current revision | before/now |
| ResponseEffectPreview | preview-to-result replacement | heard/changed/unchanged | immediate result |
| FollowState | quiet confirmation | following state and meaning | immediate state |
| MostImportantChange | primary editorial reveal | change, cause, consequence | immediate content |
| Disclosure | fast expansion/collapse | `aria-expanded`, heading | immediate show/hide |
| Action | immediate pressed/focus | label and state | same |
| ErrorState | stable content plus calm error entrance | failure, safety, recovery | immediate error |

## 15. Testing Expectations

Motion implementation must include:

- reduced-motion parity tests;
- keyboard interruption and pause tests;
- focus-order and post-transition focus tests;
- deterministic start/end animation-state tests;
- semantic before/after assertions;
- preservation of last stable content during loading and error;
- no reliance on fragile millisecond-only assertions;
- visual review at desktop, tablet, and mobile sizes;
- screen-reader review of material updates;
- verification that no motion implies unsupported progress.

Prefer testing semantic state and eventual presentation over internal animation
frames.

## 16. Anti-Patterns

Discovery motion must not use:

1. simulated typing;
2. token streaming;
3. pulsing AI indicators;
4. sparkle loops;
5. bouncing controls;
6. confetti;
7. dramatic confidence gauges;
8. flashing contradictions;
9. shaking contradictions;
10. animated activity logs presented as learning;
11. ornamental parallax;
12. gratuitous stagger;
13. long intro animation;
14. motion that blocks reading;
15. auto-scroll without control;
16. hidden motion-only changes;
17. continuous background movement;
18. loading animations that imply unsupported progress;
19. animated KPI counters;
20. card hover movement on non-interactive content;
21. excessive spring physics;
22. bounce or overshoot;
23. route transitions that reset orientation;
24. desktop motion copied directly to mobile;
25. forced auto-advance;
26. transition sequences longer than the content requires;
27. animation used to conceal latency;
28. fading uncertainty before it can be read;
29. reordering without an explicit semantic priority;
30. animating unchanged content;
31. celebratory Follow or contribution effects;
32. relationship lines before explanatory language;
33. numeric confidence interpolation without rationale;
34. skeletons that resemble fabricated final content;
35. live-region announcements for every visual step.

## 17. Open Decisions

1. Exact token values require prototype accessibility and usability review.
2. Whether any Learning sequence auto-advances remains unresolved in the
   detailed Alpha specifications.
3. Whether numeric confidence appears is unresolved; motion cannot decide it.
4. The approved representation of Understanding relationships is unresolved.
5. The detailed scene naming conflict—Examine and Challenge-or-Confirm versus
   the product-level Respond composition, and Return versus Home—requires
   canonical reconciliation before route implementation.
6. Whether a mature animation library is needed requires an implementation
   spike; the current repository has none.
7. The threshold at which repeated motion becomes immediate requires user
   testing.

## 18. Definition of Done

A motion implementation is complete when:

- it represents an approved semantic state transition;
- it preserves the Living Understanding as the visual anchor;
- the changed meaning, cause, and remaining uncertainty are legible;
- it is interruptible and does not delay comprehension;
- reduced-motion behavior has full semantic parity;
- keyboard, focus, and screen-reader behavior are verified;
- deterministic tests assert before and after states;
- no animation implies AI thinking, unsupported progress, urgency, or
  success;
- responsive behavior is intentionally designed;
- the implementation uses approved view-model state and does not perform
  cognition.
