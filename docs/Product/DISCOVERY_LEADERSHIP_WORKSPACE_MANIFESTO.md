# Discovery Leadership Workspace Manifesto

**Status:** Canonical product strategy and architecture philosophy
**Scope:** Product direction only; this document authorizes no implementation

## Why Discovery exists

Discovery exists to reduce the cognitive cost of leadership.

Leadership repeatedly requires people to gather context, reconstruct what
changed, reconcile competing accounts, identify unknowns, prepare a discussion,
make a decision, communicate it, observe results, and learn. Most organizations
make each leader rebuild that understanding by hand. Discovery should make that
work progressively less expensive without weakening truth, authority, scope, or
judgment.

The product mission is:

> Every important leadership activity should begin with an already-prepared
> understanding.

Discovery does not ask leaders to become better record keepers. It makes them
more effective. When prepared work is materially better because Discovery has
better Organizational Understanding, leaders have a natural reason to validate,
correct, and extend that understanding. Contribution is a consequence of value,
not a prerequisite for receiving it.

## Organizational Understanding is the engine

Discovery retains one canonical, governed Organizational Understanding. It is
produced through the existing deterministic cognition, Runtime, Evidence,
lineage, governance, confidence, authorization, and learning owners.
`canonicalCompositions` remains the Product-visible Organizational
Understanding owner; Leadership Workspaces consume its governed Product
contracts and never raw Runtime cognition.

```text
Evidence
→ Organizational Understanding
→ Governance
→ Scoped Projection
→ Decision Support
→ Learning
```

Leadership Workspaces consume that engine. They do not become a second model,
new cognition layer, new persistence boundary, or new source of authority.
Prepared work may compress and organize authorized meaning, but it may not
reinterpret evidence, transfer confidence, infer permission, or conceal
material uncertainty.

## Leadership Workspaces are the product

Discovery is a Leadership Workspace: the environment in which leaders perform
recurring organizational work. It is not primarily enterprise search, AI chat,
dashboard software, or reporting software. Retrieval remains available as a
supporting capability; it is not the organizing experience.

The canonical product question becomes:

> What are you trying to accomplish?

Examples include preparing a staff meeting, preparing a one-on-one, composing a
weekly update, exploring a hiring or reorganization decision, preparing
quarterly planning, investigating an organizational issue, or reviewing
organizational change.

Product structure follows leadership cadence rather than a catalog of software
features:

- daily: briefs;
- weekly: staff meetings, one-on-ones, and executive updates;
- monthly: planning, budget, and cross-functional reviews;
- quarterly: strategy, roadmap, and organizational reviews;
- occasional: hiring, reorganization, prioritization, incident response, and
  organizational change.

Until customer research justifies expansion, only four universal workspace
families are canonical hypotheses:

1. **Brief** — What changed?
2. **Prepare** — Help me prepare.
3. **Explore** — Help me think.
4. **Capture** — Help Discovery remember.

These names describe product experiences, not new cognition or Runtime owners.

## Prepared Work Products

Prepared Work Products are the primary product manifestation of Organizational
Understanding. They are artifacts leaders already create: meeting preparation,
agendas, talking points, executive updates, weekly summaries, planning packets,
decision packets, and strategy packets.

They are not reports. A report ends at presentation. A Prepared Work Product
helps a leader perform an activity, preserves its authorized source and
uncertainty, and can feed governed decisions, outcomes, and learning through
existing canonical owners.

The future product contract must preserve:

- ownership by Product Workflow for bounded product composition;
- exact organization, user, scope, purpose, and source lineage;
- confidence on its existing exact owner, never on the packet as a whole;
- explicit unknowns, assumptions, contradictions, and abstentions;
- references to canonical Questions, Answers, Decisions, Outcomes, and Learning;
- versioned fixtures, validation, compatibility, and migration review;
- no independent persistence unless existing Runtime is proven insufficient.

No Prepared Work Product contract or implementation is authorized by this
manifesto.

## Decision Journey

Every future Decision Workspace follows one reusable journey:

```text
Context
→ Current Understanding
→ Unknowns
→ Assumptions
→ Contradictions
→ Relevant Evidence
→ Explore Alternatives
→ Decision
→ Expected Outcomes
→ Observed Outcomes
→ Learning
→ Improved Organizational Understanding
```

This is a product composition over existing owners. It does not replace the
Executive Decision pipeline, Objective and Optimization Context contracts,
Outcome review, learning, or the canonical cognitive pipeline.

## Decision Readiness

Decision Readiness is a first-class future product concept: whether enough
authorized understanding exists to responsibly make a specific organizational
decision. It considers evidence completeness, exact confidence, unknowns,
assumptions, contradictions, organizational coherence, and relevant
dependencies.

Decision Readiness is not a universal score, an approval, a recommendation, a
prediction of success, or permission to act. Its owner, contract, calibration,
scope behavior, abstention semantics, and validation remain architecture gaps.
Until those are proven, Decision Workspaces must not synthesize a readiness
value from counts or presentation state.

## Product flywheel

```text
Better Organizational Understanding
→ Better Prepared Work Products
→ Leaders save time
→ Leaders naturally validate or correct Discovery
→ Organizational Understanding improves
→ Prepared Work Products improve
→ Leaders save even more time
```

The flywheel is governed. Interaction, acceptance, or persistence alone never
grants organizational authority. Corrections and captures enter through
existing contribution, Evidence admission, decision, outcome, and learning
boundaries.

## Success and measurement

The product north star is reduction in the cognitive cost of leadership,
subject to truthful Organizational Understanding as the canonical fitness
function and governance as a hard constraint.

Evidence for that north star should include preparation time saved, prepared
work quality, meeting preparation quality, confidence calibration,
organizational understanding, decision quality, learning quality, and
organizational coherence. Activity, document volume, interface engagement, or
information retrieval alone is not success.

## Architecture review

### Already supported

- one canonical Organizational Understanding and deterministic cognition;
- Organization Runtime persistence and longitudinal memory;
- Evidence ancestry, confidence ownership, governance, and scoped projection;
- `ProductQuestion`, `ProductQuestionWorkspace`, Objective, Optimization
  Context, Decision, Outcome, and Learning owners;
- the canonical Product adapter and projection firewall;
- bounded product translation, abstention, and role-safe disclosure foundations.

### Requires extension

- a versioned Prepared Work Product projection and lifecycle contract;
- workspace composition that reuses `ProductQuestionWorkspace` rather than
  replacing it;
- an exact Decision Readiness contract and calibrated benchmark;
- cadence-aware initiation and capture semantics;
- explicit assumptions and expected-outcome presentation where existing owners
  can supply them;
- longitudinal, role-safe prepared-work quality and cognitive-cost measurement.

### Intentionally deferred

- workspace families beyond Brief, Prepare, Explore, and Capture;
- autonomous preparation or action;
- broad connector expansion;
- Environmental Intelligence;
- production routes, persistence, and UI implementation;
- industry-specific workspace variants.

### Primary risks

- turning workspaces into dashboards or document generators;
- creating a second Question, Decision, or work-item identity;
- treating preparation completeness as epistemic or decision confidence;
- using generated prose to conceal unknowns or missing authority;
- letting capture bypass Evidence admission or learning governance;
- optimizing time saved at the expense of truthfulness;
- expanding workspace types before repeated customer evidence exists.

## Validation program

Product brainstorming is frozen while this strategy is validated through:

1. leadership interviews focused on workflows, decision journeys, management
   cadence, preparation behavior, and synthesis burden;
2. a simulated organization with repeatable cadence and longitudinal change;
3. the multi-role governance benchmark;
4. one Prepared Work Product prototype using product-safe fixtures;
5. a Decision benchmark suite covering readiness, alternatives, expected and
   observed outcomes, learning, abstention, and negative controls.

Research should identify recurring work that Discovery can eliminate or
materially improve, not primarily collect feature requests.

## Phased direction

1. Complete backend readiness.
2. Complete the governance benchmark.
3. Define and validate the Prepared Work Product foundation.
4. Validate the universal Brief, Prepare, Explore, and Capture workspaces.
5. Define and validate Decision Workspaces.
6. Add Environmental Intelligence only after the preceding product hypotheses
   are supported.
7. Advance organizational learning after governed product use produces
   longitudinal evidence.

These are strategy gates, not implementation authorization or date
commitments.

## First validation slice

The post-field-audience owner-graph reconciliation selects `PIVOT-A` for the
first bounded validation slice. **DISCOVERY LEADERSHIP CONVERSATION
PREPARE-AND-CAPTURE VERTICAL SLICE 001** is development-only and explicitly
uses shared organization-wide preparation. It preserves `ProductQuestion` as
the long-lived anchor and defines the immutable Prepared Work Product snapshot
inside the slice.

This selection does not authorize implementation through this manifesto. The
slice must not claim material role differentiation, expose Evidence bodies,
persist field requirements or recipient grants, perform nested disclosure,
admit uploads autonomously, promote a route, or deploy. Full differentiated
activation remains dependent on the parallel governance program.

## Long-term direction

Discovery should become the place where important leadership activity begins
already prepared, proceeds with explicit evidence and uncertainty, and ends by
improving future Organizational Understanding. Over time, the system should
require less reconstruction from leaders, produce more useful prepared work,
and learn more safely from organizational outcomes.

The enduring architecture remains simple:

```text
one governed Organizational Understanding
→ many authorized Leadership Workspaces
→ better decisions and work
→ governed outcomes and learning
→ improved Organizational Understanding
```
