# Role-Aware Living Organization Frontend Experience Architecture

## Status, scope, and promise

This document defines UX architecture only. It adds no route, component,
frontend implementation, or backend meaning. The organization-level boundary
is `ScopedProductProjection`; durable Question work remains bounded by
`ProductQuestionWorkspaceV2`.

The recurring promise is: **See what changed in the part of the organization
you are authorized to understand, know what needs attention and why, and
continue the right Question, decision, investigation, or review.**

The product is a living governed explanation—not a Runtime browser, score
dashboard, document search tool, workflow inspector, executive-only operating
system, or hierarchy-enforcement surface.

## Three candidate architectures

| Candidate | Strengths | Risks | Assessment |
|---|---|---|---|
| A — Question-centered workspace | Durable continuity; strong inquiry and Outcome lineage | Proactive change and cross-responsibility attention are hidden until a Question exists; organization state feels secondary | Excellent focused workflow, weak universal landing model |
| B — Living Organization dashboard | Immediate scope state; high discoverability; proactive change | Dashboard sprawl, score pressure, weak decision continuity, high density | Useful source model, wrong interaction metaphor |
| C — Attention Home plus focused workspaces | Fast orientation, progressive disclosure, Questions remain durable, one architecture across scopes, incremental build | Requires disciplined prioritization and continuity links | **Recommended** |

Candidate C yields the simplest high-utility implementation: one bounded Home
summary and five focused destinations. It does not invent prioritization
scores; ordering is presentation over already-disclosed kinds, uncertainty,
and canonical review requirements.

Across the full criteria: A has excellent longitudinal continuity but slower
time to proactive insight, weaker cross-responsibility discoverability, and a
deep mobile entry path; its focused workflow is accessible once entered. B has
fast initial discovery but the highest information overload, implementation
complexity, responsive-collapse risk, and screen-reader traversal cost. C has
the best recurring utility and time to understanding, retains Question and
history continuity, uses progressive list disclosure on mobile, and provides
the clearest heading/list landmarks for accessible navigation. C also scales
across responsibilities without duplicating navigation or increasing default
density.

## Information architecture

Primary navigation is identical for every role:

1. **Home** — attention and current scope orientation.
2. **Understanding** — current governed explanations, uncertainty, and safe contradictions.
3. **Questions** — entry to durable `ProductQuestionWorkspaceV2` workflows.
4. **Decisions** — decisions, calibration, Outcomes, and Learning.
5. **Investigations** — Evidence gaps and canonical investigation opportunities.
6. **History** — authorized material change, revisions, Outcomes, and Learning.

The persistent scope context shows scope name/type, current or historical mode,
evaluation time, and a scope-change affordance. A descriptive role may appear
as orientation but never changes content. Historical mode is a visible global
state with an exit-to-current action; current authorization still governs it.

Organization items may link to an existing Question or offer “Explore as a
Question”; the latter enters canonical Question creation and does not create a
Question inside the organization projection. Understanding provides context
for Decisions; Decisions link back only to safely disclosed Understanding and
Question refs. Evidence gaps explain missing meaning; investigations are
canonical opportunities to resolve them, not automatic assignments.

Return continuity uses a small “Back to Home / originating item” trail and
preserves scope, temporal mode, and list position. Attention entry may be a
server-provided deep link or user navigation; this architecture creates no
notification engine. Audit detail is a secondary drawer available only when
safe audit refs exist.

## Home hierarchy

The default landing view answers enough without reading every section:

1. **What needs attention** — calibration review requirements, material
   contradictions, risks, urgent uncertainty, and investigation opportunities.
2. **What changed** — material-change items and safe historical continuity.
3. **What Discovery understands** — a short list of current Understanding and
   Objective context.
4. **Decisions in context** — calibration summary when available.
5. **Unknowns to resolve** — Evidence gaps, open Questions, investigations.
6. **Outcomes and Learning** — recent safely projected Outcome/Learning context.
7. **Supported measures** — coherence and learning velocity only, subordinate
   to meaning rather than presented as a scoreboard.

Each section is a list, not a card grid. Desktop shows 3–5 rows; mobile shows
1–3. “View all” enters its workspace. Empty means “Nothing available in this
scope”; withheld never reveals hidden counts; unavailable describes a failed or
missing canonical source; insufficient says what safe information is needed;
unsupported names only explicitly supported-to-disclose capability absence.
Historical mode replaces current actions with “View revision” and “Return to
current.”

| Section | Product inputs | Primary action | Expansion |
|---|---|---|---|
| Attention | item kinds risk, contradiction, uncertainty, dependency, investigation; calibration `reviewRequired` | Open exact item/decision | safe reason, uncertainty, lineage |
| Changed | `material-change`, revision, temporal mode | Review change | prior authorized revision/history |
| Understands | `understanding`, `objective-context`, uncertainty | Open Understanding | support, contradiction, missing info |
| Decisions | calibration classification/axes | Review decision | axes, rationale, Outcome, audit |
| Unknowns | evidence-gap, open-question, investigation-opportunity | Continue Question/investigation | next Evidence and contribution eligibility |
| Outcomes/Learning | safe Outcome axis/history items | Review what happened | assumptions and authorized change |
| Measures | authorized metric results | Understand measure | method/lineage audit; never derive another metric |

## Major workspaces

### Home / Attention

- **Question:** What requires attention now, and what changed?
- **Boundary:** one `ScopedProductProjection`.
- **Hierarchy:** scope → attention → change → understanding → decisions → unknowns → Learning → measures.
- **Interactions:** open, filter by disclosed kind, switch current/history, continue canonical Question.
- **Blocked states:** use the semantic disposition system; projection-level
  withheld suppresses all child interpretation.
- **Desktop/mobile:** restrained two-column only when width permits; mobile is
  one ordered feed with sticky scope context.
- **Accessibility:** one H1, ordered headings, list semantics, focus return.

### Organizational Understanding

- **Question:** What does Discovery currently understand here, and where is it uncertain?
- **Boundary:** disclosed/abstracted projection items only.
- **Hierarchy:** concise Understanding → uncertainty → safe contradiction →
  support → related Objective/Question → history/audit.
- **Interactions:** open detail, expand rationale, follow safe links, create or
  continue a Question through its canonical workflow.
- **States:** no inferred hidden support; safely abstracted items show only the
  permitted existence statement.
- **Mobile:** list-to-detail navigation; audit is a separate sheet.
- **Accessibility:** prose headings, explicit “uncertain because” language,
  contradiction icons with text.

### Question Workspace

- **Question:** What are we trying to understand, and what governed work comes next?
- **Boundary:** existing `ProductQuestionWorkspaceV2`; no merge or redesign.
- **Relationship:** Home/Understanding/Decision deep links carry safe context
  refs into entry; Question completion returns to origin and current scope.
- **Interaction:** all workflow actions remain owned by the Question adapter.
- **Mobile/accessibility:** existing contract semantics; preserve step and
  focus on return.

### Decision Workspace

- **Question:** How does this exact decision relate to authorized intent,
  Evidence, constraints, authority, and Outcome?
- **Boundary:** `ScopedDecisionCalibrationProjection` rendered unchanged.
- **Hierarchy:** overall disposition → authority limitation → eight axes → safe
  rationale/uncertainty → missing information → Outcome/Learning → history → audit.
- **Interactions:** expand axes, inspect safe lineage, follow canonical review
  link when supplied, compare authorized historical projections. No approve,
  reject, execute, rank, escalate, or recompute action.
- **Mobile:** overall and authority first; axes as disclosure rows; audit last.
- **Accessibility:** full labels plus descriptions; no color-only status.

### Evidence Gaps and Investigations

- **Question:** What is missing, and what governed investigation could reduce uncertainty?
- **Boundary:** evidence-gap, open-question, investigation-opportunity items and
  scoped contribution disposition.
- **Hierarchy:** missing meaning → impact → next Evidence → opportunity →
  contribution eligibility → related Question/history.
- **Interactions:** open opportunity, continue Question, submit contribution
  only through existing governed boundary. Eligibility is not admission.
- **Mobile/accessibility:** one gap per screen; clear distinction between “can
  contribute” and “becomes Evidence.”

### Change and History

- **Question:** What changed, why, and what happened after action?
- **Boundary:** current/historical projection metadata and current-policy
  historical visibility.
- **Hierarchy:** revision timeline → material change → safe cause/support →
  Outcome → Learning/no-change Learning → audit.
- **Interactions:** select authorized revision, return current, follow related
  decision/Question. No reconstruction across withheld revisions.
- **Mobile/accessibility:** chronological list rather than horizontal chart;
  timestamps include text and timezone.

## Decision-calibration visual semantics

Use a calm classification label and one-sentence explanation—not a gauge.
Authority is a distinct first row. The remaining axes use label/value/
explanation rows with optional expansion. Group axes as **Permission**
(authority, experiment), **Strategic context** (relationship, challenge,
cross-scope), and **Practical evidence** (Evidence support, feasibility,
Outcome). Grouping changes layout only, never meaning.

| Classification | Human label | Tone/action |
|---|---|---|
| aligned-supported | Consistent with current intent and supported | Continue review; no approval implication |
| aligned-stale | Consistent, based on stale information | Refresh the named information |
| justified-divergence | Divergence supported by local Evidence | Review rationale, not obedience |
| unexplained-drift | Divergence without a current authorized explanation | Clarify or gather Evidence |
| ambiguous-strategic-intent | Strategic intent is unclear | Clarify intent before judging divergence |
| cross-scope-conflict | Local benefit conflicts with broader constraints | Review the disclosed conflict |
| local-infeasibility | Direction is consistent; local execution is constrained | Review canonical constraints |
| possible-strategy-invalidation | Local Evidence may challenge strategy | Governed review; no automatic revision |
| authorized-experiment | Bounded experiment is authorized | Show bounds and expected Outcome |
| unauthorized-action | Additional authority is required | Show authority limitation, not “bad decision” |
| insufficient-authorized-information | Not enough authorized information | Show safe missing axes |
| withheld | Assessment cannot be shown | No hidden rationale or count |
| unavailable | Assessment is not available | Offer retry/current source when applicable |

## Semantic disposition system

| Disposition | Label and icon guidance | Safe explanation | Audit |
|---|---|---|---|
| disclosed | “Available”; open-circle/check document icon | Explain visible meaning | safe refs available |
| safely-abstracted | “Limited view”; layered/veil icon | State only permitted abstraction | decision ref only |
| withheld | “Not shown”; shield icon | “This view cannot be shown for this scope” only when safe; never counts | usually none |
| unavailable | “Not available”; broken-link icon | Source/revision/value is unavailable, not restricted | safe failure ref if present |
| insufficient-authorized-information | “More information needed”; incomplete-circle icon | Name only safe missing categories | safe decisions only |
| unsupported | “Not supported”; outline tool icon | Capability is not produced; no placeholder value | none |

All patterns combine text, icon, shape, and `aria-label`; color is secondary.
Projection-level withheld shows a single neutral boundary and does not inspect
or expose child `unsupportedCapabilities`.

## Five role scenarios, one architecture

| Scenario | Likely scope and attention | Depth and continuity |
|---|---|---|
| Team lead | exact team; blockers, uncertainty, local gaps | concise Understanding; frequent investigation/change; team decisions |
| Manager | exact authorized team scope; dependencies, delivery change | more rationale and history; calibration with missing Outcome common |
| Director | department; cross-team dependencies and conflicts | comparative disclosed items, deeper history; cross-scope calibration |
| Functional executive | function; Objective context, strategy challenges, experiments | broad authorized Understanding, decision and Learning depth |
| Organization executive | organization; material change, uncertainty, Outcomes | broadest authorized scope, not superior truth; long history and calibration |

Ordering changes only because disclosed content differs. Components never test
role name. Both supported metrics may appear for any scenario only when their
canonical inputs are authorized.

## Semantic component inventory (19)

All components are reusable across roles and accept Product-safe contracts.

| Component | Purpose/input | Variants and behavior | Mobile/accessibility |
|---|---|---|---|
| Scope Context | scope, purpose, temporal mode | current/historical; scope action | sticky compact; announce changes |
| Attention Item | disclosed item/calibration review | risk/change/unknown/decision | list row; descriptive icon |
| Understanding Summary | Understanding item | disclosed/abstracted | two-line summary; heading link |
| What Changed | material-change/revision | current/historical | chronological; time text |
| Unknown | uncertainty/open-question | known gap/insufficient | explicit uncertainty language |
| Evidence Gap | evidence-gap item | actionable/unavailable | one primary next step |
| Investigation Opportunity | investigation item | open/related Question | eligibility text, not admission |
| Safe Contradiction | contradiction item | disclosed/abstracted | opposing-arrows plus label |
| Supported Metric | authorized metric result | disclosed/abstracted/unavailable/unsupported | value plus source; no chart required |
| Calibration Summary | classification | 13 bounded results | label + sentence, never gauge |
| Calibration Axis | axis result | disclosed/withheld/unavailable/insufficient | disclosure row; keyboard expand |
| Authority Limitation | authority/reviewRequired | authorized/additional/outside | prominent text, no severity red |
| Outcome Status | Outcome axis | observed/not observed/unavailable | concise status and timestamp |
| Learning Summary | safe history item | change/no-change | calm explanatory copy |
| Historical Revision | revision/temporal mode | visible/metadata-only/withheld | vertical timeline |
| Disclosure State | semantic disposition | six exact states | icon + label + description |
| Safe Lineage | safe refs | collapsed/expanded | audit-only list; copy affordance |
| Audit Detail | contract/audit refs | drawer/sheet | focus trap, monospace refs |
| Question Link | safe Question relationship | open/create/continue | preserves return context |

Loading uses stable skeleton rows with no guessed counts. Empty belongs to the
containing collection; semantic disposition components handle blocked content.

## Content and language system

Use calm, direct, qualified statements:

- Understanding: “Discovery currently understands…”
- Uncertainty: “This remains uncertain because…”
- Contradiction: “Authorized Evidence points in different directions.”
- Evidence gap: “More information is needed about…”
- Investigation: “An investigation could clarify…”
- Material change: “What changed since the prior authorized revision.”
- No-change Learning: “The review added context but did not change current Understanding.”
- Objective: “The authorized change this work is intended to advance.”
- Optimization Context: “The tradeoffs and constraints governing this Objective.”
- Outcome: “What was observed after the decision.”

Calls to action are “Review context,” “Clarify intent,” “Explore as a
Question,” “Continue investigation,” “View authorized history,” and “See safe
support.” Avoid “fix alignment,” “enforce,” “good/bad decision,” “low
performer,” or certainty claims. Classification labels use the table above.

## Progressive disclosure

- **Always visible:** scope/mode, headline, disposition, uncertainty, primary
  next step, authority limitation, overall calibration.
- **Expandable:** rationale, axes, alternatives already in Product output,
  constraints, safe support/contradiction, missing information, history.
- **Audit-only:** safe lineage, contract version, policy/authority/audit refs,
  revision IDs, exact timestamps.
- **Never delivered:** unauthorized content, restricted identities, hidden
  metric inputs, raw Runtime/cognition, credentials, protected relationships.

## Wireframe-level flows

```text
HOME  [Scope: Delivery team ▾] [Current | History]
  Navigation: Home · Understanding · Questions · Decisions · Investigations · History
  What needs attention (3 disclosed rows) → Detail
  What changed → History
  What Discovery understands → Understanding
  Decisions in context → Decision
  Unknowns to resolve → Investigation / Question
  Outcomes & Learning → History
  Supported measures → Measure detail
  Primary: Review first attention item · Expand: section lists · Audit: item detail only
```

```text
UNDERSTANDING LIST  [Scope: Delivery team] [Current]
  Disclosed rows → Open detail
  Limited view [safely abstracted; no removed fields]
  Not available / More information needed / Not supported [exact patterns]
  Primary: Open Understanding · History: authorized revisions · Audit: per row
```

```text
UNDERSTANDING DETAIL  [Scope: Delivery team] [Current]
  Headline + uncertainty
  Safe contradiction → Why it matters
  Support [expand] · Missing information [expand]
  Primary: Explore as a Question · Secondary: View authorized history
  Audit: safe lineage drawer · Blocked fields use exact disposition pattern
```

```text
DECISION DETAIL  [Scope: Delivery team] [Current | History]
  Overall: Justified divergence
  Authority: Authorized (separate)
  Why this assessment [safe rationale]
  Permission / Strategic context / Practical evidence [8 axis rows]
  Missing information | Outcome | Learning | History | Audit
  Primary: Review context · Withheld/unavailable/insufficient states never recomputed
```

```text
EVIDENCE GAP / INVESTIGATION  [Scope: Delivery team] [Current]
  What is missing → Why it matters → Next Evidence
  Investigation opportunity → Continue Question
  Contribution eligibility (not Evidence admission)
  Primary: Continue investigation · History: related changes · Audit: safe refs
  Unavailable/insufficient/withheld/unsupported use exact patterns
```

```text
CHANGE & HISTORY  [Scope: Delivery team] [Historical revision]
  [Return current]  Revision list ↓
  Material change → safe reason → Outcome → Learning/no-change
  Metadata-only / withheld revisions use exact disposition pattern
  Primary: View revision · Expand: safe rationale · Audit: revision refs/timestamps
```

```text
PARTIALLY WITHHELD  [Scope: Delivery team] [Current]
  Available Understanding
  Limited view [abstracted statement]
  Not shown [no hidden count/rationale]
  More information needed [safe missing categories]
  Not available and Not supported remain distinct
  Primary: Open available item · Audit only where safe refs exist
```

```text
MOBILE HOME  [Scope: Delivery team] [Current]
  Sticky scope/mode
  Attention (2) → Changed (2) → Understands (2)
  Decisions → Unknowns → Learning → Measures
  Bottom/compact navigation; no sideways dashboard
  Primary: first attention row · Expand: View all · Blocked states inline
```

```text
MOBILE DECISION  [Scope: Delivery team] [Current | History]
  Back | Decision
  Overall + Authority
  Why [expand]
  8 axis disclosure rows
  Outcome / History / Audit sheets
  Primary: Review context · Blocked axes keep exact disposition labels
```

Question continuity is a transition, not a tenth screen: an authorized
organization item opens the canonical `ProductQuestionWorkspaceV2`, then
returns to the originating scope/item with temporal mode and focus preserved.

## Visual direction

Use moderate density, strong typographic hierarchy, 4/8px-derived spacing,
lists for repeated meaning, and bordered surfaces only for focused summaries.
Reserve cards for one coherent object, not every row. Use a quiet neutral
palette with muted blue/teal/gold accents; never encode nuanced calibration as
traffic lights. Prefer text and short timelines over charts. Motion is limited
to 150–250ms disclosure/route continuity and respects reduced motion. Empty
states are compact and explanatory. At ≤820px collapse navigation and columns;
at ≤480px prioritize scope, headline, disposition, and one action. Meet WCAG
2.2 AA contrast, keyboard, focus, target-size, heading, live-region, and
non-color requirements. Existing Product Shell tokens/patterns are references;
legacy command-center visuals are not canonical.

## Fixture-first implementation sequence

| Step | Likely area | Fixtures | Validation / exit |
|---|---|---|---|
| 1 typed boundary | Product integration/view model | 6, 7, 8 | exact serialization; forbidden fields absent |
| 2 role-neutral fixtures | sample-data/product frontend | all 24 | fixtures instantiate production types |
| 3 scope shell | canonical Product Shell | 1–8 | same shell across five roles/modes |
| 4 Home | organization experience | 1–7 | useful above fold, semantic states distinct |
| 5 Understanding | list/detail | 1–8 | uncertainty/support/history render safely |
| 6 History | change/revision | 8, 24 | current authority and metadata-only states |
| 7 Gaps/investigations | focused workspace | 1, 2, 7 | eligibility separated from admission |
| 8 Metrics | measure component | 9–11 | only two IDs disclose; unsupported explicit |
| 9 Calibration | decision detail | 12–24 | producer values rendered unchanged |
| 10 disclosure system | shared semantics | 6–8, 11, 22–24 | six dispositions non-collapsing |
| 11 five-role QA | all workspaces | 1–5 | no role branches; explainable differences |
| 12 responsive/a11y | CSS and interaction | all | WCAG AA, keyboard, mobile flows |
| 13 server swap | server adapter | parity set | fixture/live serialized parity |
| 14 usability | research artifacts | representative states | users find attention and explain why |

## First implementation slice

The first slice now implements one role-neutral shell with exact Scope Context;
Home/Attention; one Understanding detail; one Decision detail; one Evidence
Gap/Investigation; one Change/History view; and all six disposition patterns.
Use fixture IDs
`RA-01`, `RA-02`, `RA-07`, `RA-08`, `RA-11`, `RA-12`, `RA-14`, `RA-22`,
`RA-23`, and `RA-24`. This proves two materially different roles, useful
attention, decision nuance, longitudinal truth, and safe blocked states.

All 24 fixtures are semantically validated and the ten named fixtures render
through the isolated development route `/role-aware-alpha/[fixtureId]`. The
canonical `/your-organization` route remains unchanged. Defer remaining role
breadth, full Question workflow redesign (none is authorized), live adapter
swap, notifications, high-fidelity motion, new metrics, and Production.

## Contract-gap assessment

No genuine Product contract gap blocks the required architecture. The
projection does not provide a universal attention rank, notification state,
safe contradicting refs as a separately named array, or a general Outcome/
Learning collection. The design does not invent them: Home uses bounded
section ordering, notification is deferred, contradiction/support appear only
through disclosed Product items/calibration safe lineage, and Outcome/Learning
appear only where present in calibration/history. These are **no gap** for the
required slice. The 24 frontend fixtures now exist and validate through the
existing projection shape, so the former fixture implementation gap is closed.
The live adapter swap and multi-user account provisioning remain deferred and
do not constitute a Product contract gap.
