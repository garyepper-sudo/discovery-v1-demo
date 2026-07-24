# Discovery Design Language

Status: Canonical interaction philosophy

## Purpose

This document defines how Discovery should feel and behave as a product.

It guides UX, UI, interaction, navigation, motion, copy, information hierarchy,
and future product experiences. It is not a design system, component library,
visual specification, or new architecture.

The Product Canon defines what Discovery is. The Platform Principles define
what must remain true. The Universal Intelligence Lifecycle defines how
Discovery learns. This Design Language defines how users experience those
ideas.

This document is subordinate to the Product Canon, Discovery Platform
Principles, Shared Organizational Intelligence, the Organization Experience
Canon, and applicable architecture canon. It governs visual language,
interaction language, and information presentation. It does not govern product
identity, Runtime, cognition, Governance, or persistence.

Detailed motion behavior, timing, easing, motion tokens, disclosure motion, and
reduced-motion behavior are governed by
`docs/Product/DISCOVERY_MOTION_SYSTEM.md`. Detailed copy, voice, terminology,
labels, confidence wording, and uncertainty language are governed by
`docs/Product/DISCOVERY_COPY_GUIDE.md`.

When this document conflicts with a detailed product or architecture contract,
the more specific canonical contract governs.

## The intended feeling

Discovery should feel like a thoughtful research partner with a durable memory
of the organization:

- curious without being distracting;
- informed without pretending certainty;
- concise without becoming superficial;
- challenging without becoming adversarial;
- active without feeling autonomous;
- continuously learning without making the user manage the engine;
- trustworthy because it shows what changed, why it believes something, what it
  does not know, and what the user can do next.

After using Discovery, a user should think:

> I understand the situation more clearly, I know what remains uncertain, I
> know what I can do next, and I can see how our understanding will improve.

## Interaction philosophy

Discovery is an interaction product built around evolving organizational
understanding.

Every meaningful experience should connect four things:

```text
What are we trying to understand?
        ↓
What does Discovery currently understand?
        ↓
What can I do with or about it?
        ↓
What will Discovery learn next?
```

The interaction is the hero. Explanation supports action and stewardship; it
does not precede them as a presentation deck.

“Understanding” is the primary user-facing orientation, not a new technical
object. Depending on the workflow, it may be expressed as an insight, current
position, model state, question, contradiction, recommendation rationale, or
learning. The product should not expose internal cognitive objects merely to
make understanding feel tangible.

## Emotional journey

Every substantial experience should support this progression:

```text
Curiosity → Orientation → Clarity → Agency → Calibrated trust → Stewardship
```

### Curiosity

Begin with a consequential question, change, tension, or possibility. Curiosity
is not decorative mystery. It gives the user a reason to engage.

### Orientation

Show where the user is, which organizational context is active, what Discovery
currently understands, and why this matters now.

### Clarity

Distill the most useful meaning, the relevant uncertainty, and the causal or
evidentiary basis. Clarity does not mean removing contradiction.

### Agency

Make the next useful actions obvious: explore, challenge, add context,
investigate, decide, simulate, communicate, act, review, or wait.

### Calibrated trust

Let the user see why Discovery believes something, how confident it is, what
could change the conclusion, and what is unavailable. Trust comes from
calibration and traceability, not confident tone.

### Stewardship

Close the loop by showing how correction, action, outcome, or new evidence can
improve future understanding. The user should feel they are stewarding a living
organizational model, not configuring software.

Not every screen must display six labeled steps. The progression describes the
experience, not a wizard.

## Core interaction principles

### 1. Begin with the meaningful question

Every primary experience should make its purpose immediately legible:

- What should I know?
- What are we trying to understand?
- What should we investigate?
- What are we deciding?
- What should we stress test?
- What did we learn?
- How should we communicate or move the organization?

Do not begin with a generic welcome, feature explanation, or large informational
hero when the user can begin meaningful work.

### 2. Orient through current understanding

Show the current organizational position before asking the user to interpret
raw material. The user should understand the active context, current model
state, important change, and uncertainty.

The Living Organization Model or an appropriate scoped representation should
provide orientation where it materially helps. It is not decoration and should
not appear as a generic graph detached from the current interaction.

### 3. Treat understandings as living

An understanding can emerge, strengthen, weaken, be challenged, split, remain
contested, or be superseded through evidence and learning.

Show:

- what Discovery currently understands;
- what changed;
- what caused the change;
- current confidence and uncertainty;
- unresolved contradiction;
- what evidence or outcome could change it next.

Do not present an understanding as a static report or silently replace its
history.

### 4. Make unknowns actionable

Unknowns are first-class when they affect understanding or action. Express the
specific missing knowledge, its consequence, and the best next way to reduce
it.

Avoid generic disclaimers such as “more data is needed.” Prefer:

> We do not yet know whether delays come from decision ownership or execution
> capacity. Reviewing exception-handling decisions would distinguish them.

Unknowns should invite investigation, not manufacture anxiety.

### 5. Explain why without exposing the engine

Users need evidence, reasoning, scope, confidence, assumptions, contradiction,
and change history. They do not need internal type names, capability IDs,
provider prompts, Runtime fields, policy rules, or pipeline mechanics.

Expose a defensible rationale in human terms:

```text
Conclusion
  → Why it matters
  → Why Discovery believes it
  → Evidence and alternatives
  → Technical provenance only when operationally necessary
```

The engine remains invisible; accountability does not.

### 6. Retrieve in service of understanding

Retrieval begins after a question or understanding objective is clear. The
experience should not foreground search mechanics, connector volume, or source
inventory as the product's intelligence.

Show why a source is useful, what uncertainty it may reduce, and how it will be
governed. Do not encourage indiscriminate scanning or repeated processing of
unchanged material.

### 7. Make challenge a normal path

Every material understanding should support correction, qualification, or
challenge without framing disagreement as user error.

A challenge should clarify:

- what the user disputes;
- whether they are adding evidence, a hypothesis, or context;
- what Discovery changed or did not change;
- why;
- what remains unresolved.

Challenge improves the model only when warranted; authority alone does not make
an assertion true.

### 8. Preserve human authority

Clearly distinguish Discovery's understanding, recommendation, simulation,
suggestion, and prediction from a user's decision, commitment, action, and
review.

Use action language that reflects the boundary:

- “Explore the recommendation,” not “Approve Discovery's decision.”
- “Commit decision” only when the human is explicitly recording a commitment.
- “Discovery expects,” not “This will happen.”

Waiting, rejecting, or choosing another path can be legitimate actions.

### 9. Show learning as change with cause

Do not signal learning through vague claims, celebratory animation, or model
scores alone. Show a meaningful before-and-after:

```text
What Discovery understood
  → New evidence, correction, decision, or outcome
  → What changed
  → What remained stable
  → What this enables next
```

No-change is a valid result. “Discovery learned” should be reserved for a
warranted improvement in understanding, not every interaction.

### 10. Respect attention as a scarce resource

Reading is expensive. Default to the shortest representation that supports a
sound next step.

Reduce:

- repeated context;
- multiple cards saying the same thing;
- decorative metrics;
- jargon;
- long explanatory heroes;
- raw source lists before meaning;
- duplicated rationale across sections.

Preserve access to detail through progressive disclosure.

## Information hierarchy

Every primary experience should generally order information as:

```text
Current interaction or question
        ↓
Current understanding and material change
        ↓
Primary action or choice
        ↓
Uncertainty, risk, and alternatives
        ↓
Why Discovery believes this
        ↓
Evidence, history, and detailed provenance
```

This is a semantic hierarchy, not a mandated page template.

### One coherent narrative

A screen should tell one story. Supporting panels can provide different lenses,
but they should not compete as independent dashboards.

The user should not have to reconcile:

- one recommendation in a summary and another in a detail view;
- confidence values with different meanings;
- repeated explanations with subtle wording differences;
- model state and application state presented as separate truths.

### Signal relative importance honestly

Visual and spatial emphasis should correspond to executive or user value, not
data availability. A consequential uncertainty can deserve more prominence than
ten settled facts.

Do not make every card, metric, and action equally loud.

### Keep context visible, not repetitive

Users should know the active organization, context, objective, and relevant
model state. Keep them available through stable orientation rather than
restating them in every panel.

## Progressive disclosure

The default disclosure sequence is:

```text
Meaning
  → Action
  → Uncertainty and risk
  → Explanation
  → Supporting reasoning
  → Evidence and provenance
```

Progressive disclosure must not:

- hide material risk or uncertainty behind an optional control;
- conceal that access was denied or content was transformed;
- show a conclusion without a defensible explanation path;
- require experts to lose their place when moving between summary and detail;
- duplicate content at every depth.

Default-visible:

- the essential conclusion or question;
- why it matters;
- confidence or material uncertainty;
- the primary action;
- material risk;
- meaningful change.

On demand:

- alternative explanations;
- contradiction detail;
- evidence and source lineage;
- historical evolution;
- simulation assumptions;
- policy-safe provenance;
- implementation-level diagnostics for authorized operators.

## Copy principles

### Write for judgment

Copy should help a person understand and act. Prefer concrete organizational
language over system terminology.

Prefer:

> Decision ownership is delaying exception handling.

Avoid:

> A high-confidence mechanism object has been generated.

### Lead with the answer, then qualify it

State the useful meaning first. Put calibration beside it, not in a distant
disclaimer.

> Clarify who owns pricing exceptions. Confidence is moderate because regional
> escalation data is incomplete.

### Separate fact, inference, possibility, and recommendation

Language must show epistemic status:

- “The records show...” for supported observations;
- “Discovery believes...” for current synthesis;
- “This may indicate...” for a hypothesis;
- “Discovery recommends...” for an advised action;
- “You decided...” for a human commitment;
- “The outcome was...” for observed results.

### Be specific about uncertainty

Name what is uncertain and why it matters. Avoid false precision, generic
hedging, and confidence theater.

### Be direct without becoming absolute

Use calm, concise sentences. Avoid hype, anthropomorphic overclaiming,
gratuitous praise, urgency without evidence, and artificial certainty.

Discovery may say “I” in conversation when natural, but organizational claims
should remain attributable to Discovery's current understanding rather than a
performative personality.

### Make refusals useful and safe

When Governance denies or limits information, communicate the permitted next
step without confirming protected facts.

Prefer:

> I cannot use that information for this purpose. You can request an aggregate
> view or continue with the evidence available here.

Do not expose hidden source existence, identity, counts, policy internals, or
membership through refusal wording.

## Motion principles

Motion should communicate state change, causality, continuity, or spatial
relationship. It should never manufacture importance or simulate intelligence.

Use motion to:

- connect an action to its result;
- show an understanding being updated rather than replaced;
- preserve orientation during progressive disclosure;
- reveal how a model relationship changed;
- distinguish provisional work from committed state;
- acknowledge that a contribution was received, evaluated, or did not change
  understanding.

Motion should be:

- calm;
- brief;
- interruptible;
- reversible where the interaction is reversible;
- accessible under reduced-motion preferences;
- deterministic for the same state transition.

Avoid:

- constant ambient movement implying hidden activity;
- celebratory effects for routine model updates;
- animated confidence that suggests precision;
- graph motion unrelated to a real model change;
- loading theater;
- transitions that conceal content replacement or reset reading position.

## Understanding lifecycle interaction rules

The interface should distinguish these user-facing states without requiring
users to know internal architecture:

| State | User-facing meaning | Required interaction behavior |
| --- | --- | --- |
| Emerging | Discovery has early evidence but insufficient support | show what is known, what is provisional, and the best next contribution |
| Developing | A meaningful pattern is forming | allow explore, add context, and challenge; show confidence basis |
| Active | Understanding is useful for current work | connect it to decisions, research, experiments, and communication |
| Contested | Supported evidence disagrees | preserve alternatives and identify differentiating evidence |
| Strengthened | New evidence or outcomes increased support | show the specific change and what remained stable |
| Weakened | Contradiction or outcome reduced support | explain the revision without hiding prior confidence |
| Superseded | A later understanding better explains the situation | preserve lineage and direct users to the current view |
| Unchanged | New input did not warrant revision | acknowledge the input and explain why the model stayed stable |

These are interaction descriptions, not new Runtime or cognitive object states.

Users follow evolving understandings rather than static reports. “Follow” means
returning to a durable question or organizational meaning and seeing its
history, current state, unresolved uncertainty, related work, and learning. It
does not authorize a subscription object or notification system.

## Homepage philosophy

The homepage is the current front door to organizational learning, not a
dashboard of everything Discovery stores.

It should answer:

1. What is Discovery learning or what changed?
2. What should I understand now?
3. What needs my attention or contribution?
4. What can I do next?
5. How is the organization's understanding improving?

Above the fold, prioritize:

- the most valuable current interaction;
- an appropriate view of the Living Organization Model;
- a small number of surfaced understandings or uncertainties;
- clear primary actions;
- recent meaningful learning when present.

Do not lead with:

- feature navigation;
- exhaustive metrics;
- source ingestion status;
- generic product explanation;
- a wall of equal cards;
- an empty prompt without organizational context;
- activity presented as learning.

The homepage can change as understanding matures. Empty, emerging, developing,
active, and evolving organizations should not receive the same density or
claims.

## Relationship to the Universal Intelligence Lifecycle

The Design Language makes the seven-stage lifecycle understandable without
exposing it as a technical pipeline:

| Lifecycle stage | User experience |
| --- | --- |
| Frame | meaningful question plus current understanding |
| Prioritize | the uncertainty most worth reducing and why |
| Acquire | a bounded request for context, evidence, research, or observation |
| Interpret | Discovery explains emerging meaning and qualification |
| Integrate | users see what changed, stayed stable, or remains contested |
| Apply | understanding becomes a conversation, decision, simulation, experiment, brief, or action |
| Learn | outcomes and corrections create visible learning and the next question |

Applications may emphasize different stages, but should preserve continuity
between them. A Research experience should return learning to understanding; a
Decision experience should remain traceable to its frame and later outcome.

## Relationship to Governance

Governance should be felt as appropriate access, safe boundaries, and
trustworthy explanations—not as policy machinery.

The experience must:

- request context and purpose only when needed and explain why;
- never imply that organizational seniority grants unrestricted access;
- distinguish unavailable, denied, sanitized, aggregate, and metadata-only
  experiences where disclosure itself is permitted;
- prevent hidden evidence from influencing visible confidence, counts,
  suggestions, challenge, refusal language, or response availability;
- preserve historical understanding while reflecting current eligibility;
- give authorized users an audit or provenance path without exposing restricted
  information.

Governance must not become a blanket excuse for opaque answers. Explain the
permitted reason and next step without exposing protected facts.

## Relationship to the Platform Principles

This Design Language is the experiential expression of the Platform Principles:

- one Shared Organizational Intelligence appears as coherent cross-application
  understanding;
- one Runtime appears as continuity and stable history;
- cognition ownership appears as consistent reasoning;
- Governance ownership appears as reliable, purpose-aware disclosure;
- the Universal Intelligence Lifecycle appears as meaningful progression from
  uncertainty to learning;
- human authority appears as explicit challenge, choice, commitment, and
  review;
- reproducibility appears as “why,” provenance, history, and calibrated trust.

The Design Language cannot override a Platform Principle to improve visual
simplicity.

## Discovery should never

Discovery should never:

- begin a primary experience with a presentation about itself when useful work
  can begin;
- make the user infer where they are or what they can do;
- behave like a dashboard whose cards merely report stored information;
- ask users to feed the model without immediate, credible utility;
- confuse activity, ingestion, or animation with learning;
- present a static report as living understanding;
- manufacture certainty to make an answer feel decisive;
- hide material uncertainty, risk, contradiction, or access limitation;
- expose internal cognitive objects, capability IDs, prompts, policy rules,
  Runtime fields, or provider mechanics as the normal experience;
- show raw evidence before explaining its meaning unless the task is evidence
  review;
- retrieve or scan broadly without a bounded understanding objective;
- treat a senior user as entitled to restricted raw evidence;
- let provider wording change truth or disclosure;
- duplicate explanations across summary, detail, and workspace;
- turn disagreement into one bland consensus;
- imply that a recommendation is a human decision;
- celebrate a model update that did not materially improve understanding;
- use motion to imply that hidden intelligence is occurring;
- conceal historical revisions or silently rewrite prior outputs;
- trap the user in setup before demonstrating value.

## Implementation guidance

Before designing or building a material experience:

1. State the user's meaningful question in one sentence.
2. Identify the active lifecycle stage and how the user arrived there.
3. Identify the current organizational understanding that orients the
   interaction.
4. Name the primary action and the legitimate choice to do nothing.
5. Determine which uncertainty, risk, and contradiction must remain visible.
6. Define the shortest default narrative that supports sound judgment.
7. Define progressive-disclosure levels without duplicating content.
8. Identify which change or outcome will close the learning loop.
9. Confirm projection preserves canonical meaning.
10. Confirm Governance covers text, confidence, counts, absence, explanations,
    provider input, and fallback.
11. Test empty, emerging, contested, active, and no-change states.
12. Test whether the user receives value before contributing additional data.

Product validation should ask:

- Can a user say where they are, what Discovery understands, and what they can
  do within moments?
- Can they distinguish evidence, inference, recommendation, decision, and
  outcome?
- Can they find why Discovery believes something without reading everything?
- Can they challenge it and understand the effect?
- Can they see meaningful learning without being shown implementation?
- Does the experience remain useful when uncertainty is high or access is
  limited?

## Open questions

1. Which interaction representation best lets users follow an understanding
   across applications without creating a new canonical object?
2. How should the Living Organization Model adapt across individual, team,
   department, and organization contexts?
3. What is the minimum visible evidence needed for immediate trust at each
   confidence level?
4. How should contested understandings be summarized without privileging one
   perspective through layout?
5. Which learning changes merit proactive attention versus quiet history?
6. How should aggregate or sanitized disclosure be communicated without
   exposing the protected source or degrading meaning?
7. How can motion represent causal model change accessibly at scale?
8. How should the product distinguish “Discovery has not learned this” from
   “Discovery cannot disclose this” without creating a side channel?
9. Which cross-application navigation model preserves the user's question and
   context through the lifecycle?
10. How should individual and specialist experiences preserve standalone value
    while contributing to Shared Organizational Intelligence?

These questions require product research, prototypes, and benchmark evidence.
They do not authorize new architecture.

## Explicitly not implemented

This document defines interaction philosophy only. It adds no components,
tokens, colors, typography, CSS, motion implementation, Figma artifact,
Runtime field, cognitive behavior, Governance contract, Platform Principle,
route, UI, capability, or architecture.
