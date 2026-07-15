# Discovery Component Architecture

## Purpose

This document defines the canonical responsibilities of each top-level folder inside `components/`.

Every active component should have one clear home.

Folder ownership is determined by product responsibility, not by implementation history.

---

## cognition-lab/

Owns:

- internal cognition inspection
- engine experimentation
- reasoning diagnostics
- developer-only cognitive tools

Does not own:

- executive-facing production UI
- canonical Living Understanding presentation
- investigation workflow

---

## executive-v2/

Owns:

- canonical Executive Workspace
- executive application shell
- sidebar
- workspace header
- Understanding Canvas composition
- executive timeline
- executive navigation

Does not own:

- reasoning logic
- narrative generation
- reusable organism exploration
- investigation workflow

Status:

Canonical executive interface.

---

## executive/

Owns:

- executive narrative
- executive briefing language
- current theory storytelling
- “Since We Last Spoke”
- “Today’s Story”
- continued-learning communication

Does not own:

- the application shell
- navigation
- engine reasoning
- generic shared UI

Status:

Active executive communication subsystem.

---

## ExecutiveDashboard/

Owns:

- the previous dashboard-generation interface

Status:

Legacy UI generation.

Do not extend with new product work.

Review for removal only after confirming no active routes or imports depend on it.

---

## investigation/

Owns:

- evidence contribution
- investigation workflow
- investigation actions
- inspection drawers
- investigation prompts
- investigation-specific developer controls

Does not own:

- organizational understanding
- executive narrative
- Living Understanding rendering

---

## organism/

Owns:

- Living Understanding rendering
- organism preview
- organism explorer
- pattern visualization
- pattern inspection
- visual expression of understanding health

Does not own:

- engine cognition
- executive workspace layout
- evidence extraction
- investigation orchestration

Status:

Canonical Living Understanding UI subsystem.

Future rename candidate:

`living-understanding/`

---

## results/

Owns:

- investigation result presentation
- result summaries
- result-level navigation
- result composition

Does not own:

- engine result generation
- the executive application shell
- shared Living Understanding rendering

---

## trace/

Owns:

- reasoning trace presentation
- reasoning-path inspection
- evidence-to-understanding explanation
- developer and advanced-user reasoning views

Does not own:

- reasoning execution
- executive summaries
- generic result cards

---

## ui/

Owns:

- reusable presentation primitives
- buttons
- cards
- inputs
- modal foundations
- icons
- generic layout primitives

Does not own:

- product-specific business logic
- executive-specific composition
- investigation-specific behavior

Status:

Canonical shared UI layer.

Future rename candidate:

`shared/`

---

## understanding/

Owns:

- beliefs
- understanding cards
- stewardship summaries
- theory evolution presentation
- understanding-level explanations

Does not own:

- engine understanding synthesis
- Living Understanding rendering
- executive shell layout

---

## workspace/

Owns:

- organization-level workspace components
- organizational memory presentation
- longitudinal learning panels
- cognition inspection within the workspace

Does not own:

- engine runtime state
- executive narrative
- generic shared UI

---

## Root-Level Component Rule

The root of `components/` should contain no product components over time.

Existing root-level files are migration candidates.

They may be:

- moved into the correct canonical subsystem
- replaced by an existing canonical implementation
- deleted after reference and dependency verification

No new root-level component files should be created.

---

## Migration Rule

Before moving or deleting a component:

1. verify all imports
2. verify all render paths
3. inspect local relative dependencies
4. confirm the canonical replacement or destination
5. run `npm run build`
6. run `npm run typecheck`
7. manually test the affected screen
8. commit the subsystem separately

---

## Canonical Direction

The intended component structure is:

```text
components/
├── cognition-lab/
├── executive/
├── executive-v2/
├── ExecutiveDashboard/
├── investigation/
├── organism/
├── results/
├── trace/
├── ui/
├── understanding/
└── workspace/