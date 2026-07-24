# Discovery Experience Alpha

# Scene One Specification — Ask

**Status:** Detailed Alpha interaction specification — implemented selectively
**Version:** 0.1
**Experience stage:** Curiosity
**Implemented Alpha route:** `/alpha/ask` (`/alpha` redirects here)
**Primary objective:** Help the user express a consequential organizational question with minimal friction.
**Next scene:** Orient

This document preserves detailed Alpha design intent. The current prototype
implements it selectively with deterministic fixtures and local interaction
state; it does not persist the question to Organization Runtime or invoke live
cognition, AI interpretation, or retrieval.

---

# 1. Scene Purpose

Scene One establishes the entire relationship between the user and Discovery.

The experience must immediately communicate:

> Discovery begins with what the user is trying to understand.

It must not feel like:

* software setup;
* a search engine;
* a chatbot landing page;
* a document-ingestion tool;
* an analytics dashboard;
* an onboarding wizard.

The user should feel that they are beginning a thoughtful inquiry into their organization.

The scene should create curiosity without being vague, theatrical, or decorative.

---

# 2. Primary User Outcome

The user enters a consequential organizational question and submits it.

The scene is successful when the user believes:

* Discovery is centered on their problem;
* they do not need to know how Discovery works;
* they can begin without configuring the product;
* natural language is sufficient;
* the question can be refined later.

The user should be able to begin within several seconds of arriving.

---

# 3. Primary Discovery Outcome

Discovery receives enough information to create an initial Understanding objective.

The input does not need to be perfectly phrased.

Discovery will interpret and bound the question in Scene Two.

The purpose of Scene One is expression, not specification.

---

# 4. Emotional Objective

The emotional state should move from:

```text
Uncertainty

↓

Curiosity

↓

Readiness
```

The user should think:

> This starts with the issue I actually care about.

They should not yet feel:

* trust in an answer;
* confidence in Discovery’s reasoning;
* excitement about technical capability.

Those emotions belong later in the journey.

---

# 5. Primary Screen Message

## Headline

> What would you like Discovery to understand?

This language is canonical for Experience Alpha.

Do not replace it with:

* What can I help you with?
* Ask Discovery anything.
* What are you working on?
* What would you like to analyze?
* What question do you have?
* How can Discovery help?

The word **understand** is essential.

It frames Discovery as building persistent meaning rather than producing a disposable answer.

---

# 6. Supporting Copy

## Default supporting copy

> Start with a question, concern, or part of the organization you want to understand more clearly.

This copy should appear directly below the headline.

It should be visually secondary.

## Optional contextual line

For users entering an existing organization:

> Discovery will use what it already knows before recommending anything new.

This line may appear below the primary supporting copy when meaningful organizational context already exists.

It should not appear during a completely empty demonstration state unless the prototype explicitly represents prior organizational knowledge.

---

# 7. Page Structure

The page contains five visual regions:

```text
Application frame

Primary question area

Natural-language input

Prompt assistance

Quiet contextual footer
```

The primary question area and input should dominate the page.

The page must not feel divided into multiple cards or modules.

---

# 8. Desktop Layout

## 8.1 Viewport assumption

Primary design viewport:

```text
1440 × 900
```

The layout must remain usable down to:

```text
1024 × 700
```

without requiring horizontal scrolling.

## 8.2 Application frame

The first-use experience should use a restrained application frame.

Allowed:

* small Discovery wordmark;
* organization name, when already known;
* subtle user menu;
* help or accessibility entry.

Do not show the complete product navigation before the first Understanding exists.

The frame should not compete with the question.

## 8.3 Header placement

The Discovery wordmark appears:

* top-left;
* aligned to the page grid;
* visually quiet;
* without a large logo treatment;
* without a marketing navigation bar.

Recommended desktop position:

```text
Top: 28–36 px
Left: 36–48 px
```

## 8.4 Main content container

The primary content should sit slightly above the vertical center of the viewport.

It should not be perfectly centered, which can make the experience feel like a generic search page.

Recommended container:

```text
Maximum width: 880 px
Preferred content width: 760–820 px
Left alignment: centered within viewport
Top offset: approximately 22–28% of viewport height
```

The content itself remains left-aligned.

## 8.5 Main content order

```text
Eyebrow, when required

Headline

Supporting copy

Question input

Primary action

Prompt assistance

Privacy or scope reassurance
```

The eyebrow should normally be omitted.

An existing-organization state may use:

> Begin a new Understanding

This must remain small and secondary.

---

# 9. Responsive Layout

## 9.1 Tablet

For widths between approximately 768 and 1023 pixels:

* maintain left-aligned content;
* reduce page margins;
* keep the input full width;
* allow example prompts to wrap;
* preserve whitespace above the headline;
* do not introduce a drawer or sidebar.

Recommended horizontal margin:

```text
32 px
```

## 9.2 Mobile

For widths below approximately 768 pixels:

* use a single-column layout;
* place the wordmark near the top;
* reduce the headline size while preserving hierarchy;
* allow the input to grow vertically;
* place the primary action below the input;
* display example prompts as vertically stacked text actions or horizontally scrollable chips only when accessibility remains clear.

Recommended horizontal margin:

```text
20–24 px
```

The page must remain usable with the on-screen keyboard visible.

The primary action must not become inaccessible beneath the keyboard.

## 9.3 Small-height displays

When viewport height is limited:

* reduce upper whitespace before reducing font size;
* keep the headline visible;
* keep the input and primary action in the initial viewport where practical;
* allow example prompts to move below the fold.

The user’s ability to begin takes priority over showcasing prompt examples.

---

# 10. Typography Roles

Exact font families should be defined by the future visual system.

This specification defines roles and hierarchy.

## 10.1 Headline

Role:

```text
Display / Primary Question
```

Characteristics:

* calm;
* high legibility;
* medium or regular weight;
* no exaggerated boldness;
* compact enough to remain one or two lines;
* no decorative gradient text.

Suggested desktop range:

```text
48–60 px
Line height: 1.05–1.15
```

Suggested mobile range:

```text
34–42 px
```

## 10.2 Supporting copy

Role:

```text
Body / Secondary
```

Suggested desktop range:

```text
17–20 px
Line height: 1.45–1.6
```

Suggested mobile range:

```text
16–18 px
```

## 10.3 Input text

Role:

```text
Body / Primary Input
```

Suggested range:

```text
18–22 px
Line height: 1.4–1.55
```

The entered question should feel substantial, not like text in a utility field.

## 10.4 Prompt examples

Role:

```text
Label or Small Body / Interactive Secondary
```

Suggested range:

```text
14–16 px
```

Examples should be clearly interactive without appearing as primary calls to action.

---

# 11. Spacing Model

The final values should follow the product spacing scale.

The relative relationships are canonical.

## 11.1 Headline to supporting copy

Moderate spacing.

The two elements should read as one thought.

Recommended:

```text
16–20 px
```

## 11.2 Supporting copy to input

Generous spacing.

This separates explanation from action.

Recommended:

```text
32–40 px
```

## 11.3 Input to primary action

The action may be:

* embedded visually at the lower-right edge of the input on wide displays; or
* placed directly beneath the input.

For Alpha, a separate button below the input is safer and clearer.

Recommended:

```text
16–20 px
```

## 11.4 Primary action to prompt assistance

Recommended:

```text
28–36 px
```

## 11.5 Prompt-assistance items

Recommended gap:

```text
8–12 px
```

They should feel grouped but not compressed.

---

# 12. Question Input

## 12.1 Component type

Use an auto-growing multiline text area.

Do not use:

* a one-line search field;
* a command palette;
* a chat composer with attachment controls;
* a rich-text editor;
* a form with several fields.

## 12.2 Default size

Desktop:

```text
Minimum height: 120–144 px
Maximum automatic height before scrolling: 260–320 px
```

Mobile:

```text
Minimum height: 112–128 px
```

## 12.3 Placeholder

> Describe what you are trying to understand…

The placeholder should disappear once the user begins typing.

Do not rotate or animate placeholder examples.

## 12.4 Initial focus

On first-use desktop experiences:

* place keyboard focus in the input after page readiness;
* preserve a clearly visible focus state;
* do not steal focus after the user interacts elsewhere.

On mobile:

* do not automatically open the software keyboard unless testing shows that behavior is welcome;
* a user tap may initiate focus.

## 12.5 Input behavior

The input:

* accepts natural language;
* preserves punctuation and line breaks;
* trims accidental leading and trailing whitespace on submission;
* prevents submission of whitespace-only content;
* does not rewrite the user’s words before Scene Two;
* preserves the submitted question visibly during transition.

## 12.6 Recommended length

The interface should support concise or detailed questions.

Suggested soft guidance:

```text
20–500 characters
```

Do not show a character count by default.

Show a character limit only when the user approaches it.

## 12.7 Maximum length

Prototype maximum:

```text
1,000 characters
```

This is an experience limit, not a canonical platform limit.

---

# 13. Primary Action

## Label

> Begin understanding

Do not use:

* Submit
* Search
* Analyze
* Generate
* Ask
* Continue
* Start AI
* Build model

## Enabled state

The action becomes enabled when the normalized input contains meaningful non-whitespace text.

A single character may technically enable it, but validation may intercept inputs that cannot form a meaningful objective.

## Disabled state

The disabled state must remain legible.

It should not appear broken or hidden.

## Loading state

After activation, the button label changes to:

> Understanding your question…

The action becomes temporarily unavailable.

A restrained progress indicator may appear within the action.

Do not use:

* a percentage;
* a long loading sequence;
* language implying full analysis;
* animated AI sparkle effects.

---

# 14. Keyboard Behavior

## Desktop

* `Tab` moves through interactive elements in visual order.
* `Shift + Tab` reverses order.
* `Command/Ctrl + Enter` submits from the multiline input.
* Plain `Enter` creates a new line.
* `Escape` does not clear the input.
* The primary action remains available through keyboard focus.

A brief helper may appear below the input after typing begins:

> Press ⌘ Enter to begin

On non-Mac platforms:

> Press Ctrl Enter to begin

Do not show both simultaneously.

## Mobile

A keyboard action labeled similarly to “Go” or “Done” may submit when supported, but the visible primary action must remain available.

---

# 15. Prompt Assistance

## 15.1 Purpose

Prompt assistance demonstrates the appropriate level and form of inquiry.

It must not turn the page into a template picker.

## 15.2 Label

> Examples

or:

> You might begin with

The second is warmer but more visually prominent.

Use one, not both.

## 15.3 Canonical Alpha examples

* Why has engineering delivery slowed?
* What is making cross-functional work difficult?
* Why are customers leaving during onboarding?
* How healthy is our decision-making process?

## 15.4 Interaction

Selecting an example:

* places the full example into the input;
* moves focus to the input;
* does not submit automatically;
* allows editing before submission.

The interaction must be reversible through ordinary editing.

## 15.5 Presentation

Examples may appear as:

* understated text buttons;
* restrained chips;
* a two-column list on wide screens.

Avoid:

* icon-heavy cards;
* illustrations;
* bright borders;
* carousel behavior;
* labels such as “Popular” or “Recommended.”

---

# 16. Quiet Reassurance

Below the examples, the scene may include one sentence that reduces setup anxiety.

Recommended copy:

> You can refine the question before Discovery begins learning.

Alternative for existing organizations:

> Discovery will begin with what it already knows and explain what additional information may help.

Do not make broad privacy or security claims in this scene unless the claims are already supported by the product.

Do not display legal copy prominently.

---

# 17. Visual Treatment

## 17.1 Overall composition

The scene should feel:

* spacious;
* deliberate;
* calm;
* substantive;
* unfinished in the productive sense that the user’s question completes it.

## 17.2 Surfaces

Prefer one continuous page surface.

The input may use a distinct surface, but it should not look like a dashboard card.

Avoid nested containers.

## 17.3 Borders

Use borders sparingly.

The input requires a visible boundary or surface distinction.

The default border must remain visible enough for accessibility.

## 17.4 Shadows

Avoid large floating shadows.

A restrained elevation effect may be used for focus, but not to make the input look like a chat box floating above the product.

## 17.5 Decorative graphics

Do not add:

* abstract AI imagery;
* network diagrams;
* brain illustrations;
* glowing orbs;
* animated particles;
* organizational charts;
* stock photography;
* product screenshots;
* gradients used solely for spectacle.

Whitespace and typography should carry the experience.

---

# 18. Color Semantics

Scene One should use a narrow color range.

At this stage, the interface does not yet need to communicate:

* confidence;
* uncertainty severity;
* contradictions;
* growth;
* evidence strength.

Those semantic colors should not be introduced prematurely.

Use color for:

* primary text;
* secondary text;
* interactive emphasis;
* focus;
* validation;
* surface distinction.

The primary action may use the strongest interaction color.

The page should remain visually calm.

---

# 19. Motion Specification

## 19.1 Page arrival

Allowed:

* subtle opacity transition;
* slight upward settling of the main content;
* restrained input focus transition.

Suggested duration:

```text
200–350 ms
```

The user should not wait for staged content reveals.

## 19.2 Example selection

When an example fills the input:

* the text appears immediately or through a very short fade;
* focus moves to the input;
* the input may subtly emphasize its active state.

Do not simulate typing.

## 19.3 Submission

Submission should feel like the question is being carried forward, not discarded.

Recommended sequence:

1. Primary action enters loading state.
2. Prompt examples and reassurance gently recede.
3. The entered question remains visible.
4. The question input surface simplifies into a read-only question statement.
5. Scene Two content emerges beneath or around the preserved question.
6. The page settles into the Orient state.

This should feel like a transformation within one inquiry, not a route change to a separate tool.

Suggested total duration:

```text
500–900 ms
```

## 19.4 Reduced motion

When reduced motion is enabled:

* remove positional movement;
* use immediate state changes or short opacity changes;
* preserve the submitted question;
* do not auto-scroll unnecessarily.

---

# 20. Transition to Scene Two

## 20.1 Persistent element

The submitted question must remain visible in Scene Two.

Example:

> Why has engineering productivity slowed?

It becomes the source question above the interpreted objective.

## 20.2 Transitional copy

During the brief interpretation state:

> Understanding your question…

This state should last only long enough to communicate intentional interpretation.

For the deterministic prototype, suggested duration:

```text
500–1,200 ms
```

Do not create an extended fake thinking sequence.

## 20.3 Scene Two arrival

The first message in Scene Two is:

> Here is how I understand what you are trying to learn.

The interpreted Understanding objective then appears.

## 20.4 History behavior

Using browser back from Scene Two should return to Scene One with the original question preserved.

Refreshing after submission may restore the current deterministic scene state during the prototype.

---

# 21. Validation and Error States

## 21.1 Empty submission

Do not allow submission.

The action remains disabled.

If submission is triggered through an unexpected method, show:

> Describe what you would like Discovery to understand.

Place the message near the input.

## 21.2 Input too vague

Examples:

* Help
* Business
* Problems
* Tell me everything

Discovery should not reject the user harshly.

Recommended message:

> Add a little more context so Discovery can identify what you are trying to understand.

The input retains the user’s text and focus.

## 21.3 Input too long

Recommended message:

> Start with the central question. You can add more context in the next step.

The interface should preserve all entered text.

## 21.4 Unsupported or malformed input

For content that does not appear to express an organizational understanding objective:

> Frame this as something you want to understand about the organization, its work, or its outcomes.

Do not mention AI prompt quality.

## 21.5 Prototype failure

When the deterministic transition cannot continue:

> Discovery couldn’t begin this Understanding.

Secondary explanation:

> Your question has been preserved. Try again.

Actions:

* Try again
* Edit question

Do not use generic:

> Something went wrong.

## 21.6 Offline state

When applicable:

> Discovery needs a connection to begin this Understanding.

Preserve the question.

---

# 22. Existing-User Variant

A returning user creating an additional Understanding may see a slightly more contextual version.

## Headline

> What would you like Discovery to understand next?

## Supporting copy

> Begin with the question or organizational issue that matters now.

The rest of the interaction remains consistent.

Existing Understandings should not appear as dashboard content around the input.

A small link may allow the user to return home.

---

# 23. Pre-Populated Variant

Discovery may be opened from another part of the product with an initial question already supplied.

Example:

> Why does decision ownership repeatedly appear in delivery delays?

In this state:

* populate the input;
* allow editing;
* do not submit automatically;
* keep the primary action available;
* indicate the source context only when it helps interpretation.

Example contextual label:

> Based on Engineering Productivity

This label should remain quiet and removable from the scope.

---

# 24. Accessibility Contract

## 24.1 Semantic structure

Use:

* one page-level heading;
* a properly associated text-area label;
* descriptive button labels;
* semantic lists for examples where appropriate;
* an `aria-live` region for validation and transition status.

## 24.2 Input label

The visible headline may not be sufficient as the programmatic input label.

Recommended accessible label:

> What would you like Discovery to understand?

## 24.3 Focus order

1. Discovery wordmark or skip link, where applicable
2. Main question input
3. Begin understanding
4. Example prompts
5. Secondary contextual actions
6. User menu or help

The order may vary slightly if the application frame precedes main content, but the main input should remain quickly reachable.

## 24.4 Error announcement

Validation errors must:

* be announced;
* be associated with the input;
* not remove the user’s content;
* not rely on color alone.

## 24.5 Focus after submission

When Scene Two becomes ready, focus should move to the Scene Two primary heading or interpreted objective.

Do not leave focus on a removed button.

## 24.6 Touch targets

Interactive targets must meet minimum accessible dimensions.

Suggested minimum:

```text
44 × 44 px
```

---

# 25. Component Hierarchy

The first implementation should use a restrained component model.

```text
AskScene
├── ExperienceFrame
│   ├── DiscoveryMark
│   └── OptionalUserControl
├── AskIntro
│   ├── AskHeadline
│   └── AskSupportingCopy
├── UnderstandingQuestionForm
│   ├── UnderstandingQuestionInput
│   ├── InputGuidance
│   ├── ValidationMessage
│   └── BeginUnderstandingAction
├── QuestionExamples
│   ├── QuestionExamplesLabel
│   └── QuestionExampleAction[]
└── AskReassurance
```

Avoid creating abstractions that imply a broader design system before repeated patterns exist.

---

# 26. Experience State Contract

The prototype state for Scene One should resemble:

```ts
type AskSceneStatus =
  | "idle"
  | "editing"
  | "validating"
  | "submitting"
  | "failed";

interface AskSceneState {
  status: AskSceneStatus;
  question: string;
  selectedExampleId: string | null;
  validationError:
    | "empty"
    | "too-vague"
    | "too-long"
    | "unsupported"
    | null;
  submissionError: string | null;
}
```

The scene should emit an intent resembling:

```ts
interface BeginUnderstandingIntent {
  originalQuestion: string;
  initiatedAt: string;
  source: "manual" | "example" | "contextual";
  sourceContextId?: string;
}
```

This is an experience-layer contract.

It must not be treated as a new cognitive or Runtime contract.

---

# 27. Deterministic Alpha Data

The canonical Alpha question is:

> Why has engineering productivity slowed?

The prototype should also support the four visible examples.

All example questions should enter the same experience structure, but only the canonical Alpha question needs the complete downstream mocked story for the first implementation.

For noncanonical examples, the prototype may either:

* continue using a clearly labeled demonstration path; or
* return the user to the canonical demonstration question.

Preferred approach:

Support the canonical question fully and allow other examples to demonstrate Scene One input behavior without falsely implying complete downstream coverage.

---

# 28. Analytics Events

Analytics should remain product-focused and minimal.

Suggested events:

```text
ask_scene_viewed
ask_question_started
ask_example_selected
ask_question_submitted
ask_question_validation_failed
ask_question_submission_failed
```

Suggested properties:

* question length;
* source type;
* example identifier;
* time to first input;
* time to submission;
* validation error type.

Do not record raw organizational questions in analytics by default.

Raw question storage must follow future privacy and governance requirements.

For the mocked Alpha, analytics may be disabled or represented only through local development logging.

---

# 29. Quality Checks

Before Scene One is approved, confirm:

1. The first visible product action is expressing a question.
2. The page does not resemble a dashboard.
3. The page does not resemble a generic AI chatbot.
4. The input is clearly capable of accepting natural language.
5. The user does not need to select a template.
6. The user does not need to connect a source.
7. The primary action uses “Begin understanding.”
8. Example prompts support rather than dominate.
9. The submitted question remains visible during transition.
10. The transition communicates interpretation rather than analysis.
11. Keyboard-only completion works.
12. Reduced-motion behavior remains coherent.
13. Mobile users can submit while the keyboard is open.
14. Validation preserves the user’s text.
15. The scene contains one primary idea.

---

# 30. Acceptance Criteria

## Functional

* The user can enter a multiline question.
* The input auto-grows within defined limits.
* The primary action remains disabled for empty input.
* The user can select and edit an example prompt.
* The user can submit using the visible action.
* The user can submit using the platform-appropriate keyboard shortcut.
* Invalid input produces specific guidance.
* Submission preserves the original question.
* Successful submission advances deterministically to Scene Two.
* Browser-back behavior preserves the question.
* The scene can be reset for repeated demonstrations.

## Visual

* The headline is the strongest visual element.
* The input is the second strongest element.
* The page uses generous whitespace.
* Full product navigation is absent during first use.
* Example prompts remain visually secondary.
* No decorative AI imagery appears.
* The page works across desktop, tablet, and mobile widths.
* The interface does not depend on animation for comprehension.

## Product

* The user understands that Discovery begins with a question.
* The user understands that the question can be refined.
* The user is not asked for data before Discovery interprets the objective.
* The scene does not expose implementation mechanics.
* The scene supports the emotional transition from curiosity to readiness.
* The experience feels like the beginning of a persistent Understanding rather than a request for a one-time answer.

---

# 31. Prototype Review Script

A reviewer should be able to complete the following sequence:

1. Open the first-use experience.
2. Identify the primary action without instruction.
3. Read the examples.
4. Select:

   > Why has engineering delivery slowed?
5. Edit it to:

   > Why has engineering productivity slowed?
6. Submit using the keyboard.
7. Observe the question remain visible.
8. Arrive at the interpreted Understanding objective.
9. Navigate back.
10. Confirm the original question remains.
11. Submit an intentionally vague question.
12. Confirm specific, nonpunitive guidance appears.
13. Repeat the flow with reduced motion enabled.
14. Repeat the flow at a mobile viewport.

Any confusion during this script should be treated as a product defect.

---

# 32. Open Decisions

The following decisions should be resolved during high-fidelity design, not by Codex during implementation:

1. Whether the primary action sits beneath the input or partially within its surface.
2. Whether example prompts appear as text actions or restrained chips.
3. Whether the Discovery wordmark includes an icon.
4. Whether first-use desktop automatically focuses the input.
5. Whether the contextual reassurance appears before or after prompt examples.
6. Whether the transition to Scene Two occurs within one route or through shallow route state.
7. Whether users may save an unfinished question.
8. Whether a returning user sees “understand next” or the canonical first-use headline.
9. The final input-height behavior on small mobile screens.
10. The exact visual treatment of the read-only submitted question in Scene Two.

These decisions must remain consistent with the Discovery Design Language.

---

# 33. Codex Implementation Boundary

Codex may implement:

* the scene;
* deterministic state;
* responsive behavior;
* accessible interaction;
* example selection;
* validation;
* transitions;
* mocked progression to Scene Two;
* component-level tests.

Codex must not:

* redesign the scene;
* introduce a dashboard;
* add connector setup;
* add file upload;
* create a chatbot thread;
* add AI branding effects;
* modify Runtime;
* modify cognition;
* modify Governance;
* create production retrieval behavior;
* create new canonical architecture contracts;
* persist raw questions to production storage;
* invent additional product navigation.

Any ambiguity should be resolved in favor of this specification and the canonical Discovery Design Language.

---

# 34. Definition of Done

Scene One is complete when:

* it is visually polished;
* it behaves correctly across supported viewports;
* it is keyboard accessible;
* reduced motion works;
* all required states are testable;
* the submitted question transforms naturally into Scene Two;
* the interaction feels calm and deliberate;
* no implementation mechanics are visible;
* the user can begin without instruction;
* no production architecture changed.

The final review question is:

> Does this feel like the beginning of Discovery understanding something important, or merely like another piece of software asking for input?

Only the first outcome is acceptable.
