# Role-Aware Living Organization Frontend State Matrix

## Contract and rules

These 24 IDs map one-for-one to the canonical handoff states. Every fixture
must construct the actual nested `ScopedProductProjection`,
`ScopedProductProjectionItem`, `AuthorizedMetricResult`, and/or
`ScopedDecisionCalibrationProjection` shape named in **Contract proof**.
Role is test orientation only. `readScopedOrganizationalProductProjection` and
the same view-model adapter serve every row.

Abbreviations: U = Understanding; C = change/history; D = decision; G = gap;
I = investigation; M = measures; Q = Questions. Metrics: COH = canonical
coherence; LV = canonical learning velocity. “—” means the contract expresses
no such field; it never means hidden or zero.

## Experience matrix

| ID / canonical state | Role scenario / authorized scope | Landing; visible sections | Primary message | Primary / secondary action | Expected transition | Responsive |
|---|---|---|---|---|---|---|
| RA-01 useful team projection | team lead / exact team | Home; attention,U,G,I,C,M | “Here is what changed and needs attention in your team.” | Open attention / explore Question | U or I detail; return Home | top 2 attention, stacked |
| RA-02 useful manager projection | manager / exact managed-team grant | Home; attention,U,D,G,C,M | “Dependencies and uncertainty need review.” | Review decision / view change | D detail; preserve scope | decision follows attention |
| RA-03 useful director projection | director / exact department | Home; attention,U,dependencies,D,C,M | “Cross-team dependencies shape this scope.” | Review dependency / history | U detail or History | collapse dependency summaries |
| RA-04 useful functional-executive projection | functional executive / exact function | Home; attention,U,objective,D,I,C,M | “Function-level intent and change are visible.” | Review strategy context / investigation | D or I detail | objective context condensed |
| RA-05 useful organization-executive projection | organization executive / exact organization | Home; attention,U,D,I,C,M | “Organization-wide change and uncertainty are visible.” | Review attention / history | exact detail | no extra executive navigation |
| RA-06 no authorized information | any / denied scope | boundary state only | “This scope cannot be shown.” | Choose authorized scope / — | organization selection | full-width neutral state |
| RA-07 partially withheld projection | manager / exact team | Home; disclosed U plus limited/not-shown states | “Some authorized meaning is available; other meaning is not shown.” | Open available U / disclosure help | U detail | no hidden count |
| RA-08 historical projection after revocation | former recipient / exact historical request, current denied | History boundary | “This historical view is not available under current access.” | Return current / choose scope | current Home | no timeline inference |
| RA-09 supported coherence | any authorized / exact scope | Home M or Measure detail | “How internally coherent current Understanding is.” | Understand measure / audit | Measure detail | value + label, no chart required |
| RA-10 supported learning velocity | any authorized / exact scope | Home M or Measure detail | “How canonical organizational learning is progressing.” | Understand measure / audit | Measure detail | value + source |
| RA-11 unsupported metric | any / exact scope | M unsupported row | “This measure is not supported.” | Learn what is supported / — | supported measure list | no placeholder/gauge |
| RA-12 aligned-supported decision | manager / exact team | D detail; summary, authority, axes, Outcome | “Consistent with current intent and supported.” | Review context / history | axis or History | summary + authority first |
| RA-13 aligned-stale decision | team lead / exact team | D detail | “Consistent, but based on stale information.” | Refresh named information / history | G/I or History | stale text, no freshness score |
| RA-14 justified divergence | manager / exact team | D detail | “Local divergence is supported by authorized Evidence.” | Review rationale / safe support | axis/support detail | never red/green |
| RA-15 unexplained drift | director / exact department | D detail | “No current authorized explanation was found.” | Clarify or gather Evidence / history | G/I or History | qualification always visible |
| RA-16 ambiguous intent | functional executive / exact function | D detail | “Strategic intent is not clear enough to assess divergence.” | Clarify intent / Objective context | Q or objective detail | no drift label |
| RA-17 cross-scope conflict | director / exact department | D detail | “Local benefit conflicts with a disclosed broader constraint.” | Review conflict / dependency | axis/U detail | conflict text wraps |
| RA-18 local infeasibility | manager / exact team | D detail | “Direction is consistent; local constraints block execution.” | Review constraints / investigate | axis/I detail | feasibility distinct from alignment |
| RA-19 possible strategy invalidation | functional executive / exact function | D detail | “Local Evidence may require strategy review.” | Review safe Evidence / history | support or History | advisory label explicit |
| RA-20 authorized experiment | team lead / exact team | D detail; bounds and expected Outcome | “A bounded experiment is authorized.” | Review bounds / Outcome plan | axis/Outcome | bounds before rationale |
| RA-21 unauthorized action | any / exact requested scope | D detail; authority first | “Additional authority is required.” | Review authority requirement / context | safe authority detail | no “bad decision” styling |
| RA-22 insufficient decision information | manager / exact team | D detail; missing axes | “More authorized information is needed.” | View safe missing information / investigate | G/I | missing list before axes |
| RA-23 withheld decision calibration | any / exact scope | D limited boundary | “This assessment cannot be shown for this scope.” | Return to decisions / — | D list | no classification/rationale |
| RA-24 unavailable Outcome | manager / exact team | D detail; calibration plus Outcome unavailable | “The decision can be assessed; an Outcome is not available.” | Review calibration / return later | axis detail | Outcome remains separate |

## Semantic and contract-proof matrix

| ID | Calibration | Metrics | Abstracted | Withheld | Unavailable | Insufficient | Unsupported | History | Contract proof |
|---|---|---|---|---|---|---|---|---|---|
| RA-01 | optional disclosed/unavailable | COH,LV when disclosed | none required | restricted risk omitted/neutral | absent kinds explicit | item uncertainty only | unsupported IDs if returned | current + safe revisions | projection available; ≥4 disclosed item kinds; exact team scope |
| RA-02 | disclosed or Outcome unavailable | COH,LV | none required | restricted items | optional Outcome | safe missing info | unsupported metric rows | current | projection items + calibration union |
| RA-03 | cross-scope only if disclosed | COH,LV | none required | out-of-scope items | absent kinds | unresolved broader effect | unsupported metric | current/history | department `requestedScope`; dependency item |
| RA-04 | challenge/experiment with lineage | COH,LV | none required | restricted strategy | absent Outcome possible | missing context axis | unsupported metric | current/history | function scope; objective-context + calibration |
| RA-05 | organization-scoped | COH,LV | none required | protected items | missing canonical sections | missing lineage | unsupported metric | longest authorized history | organization scope; same projection type |
| RA-06 | null; never inspect child | — | suppressed with children | projection `disposition=withheld` | — | — | child metadata suppressed | none | `emptyProjection`; zero repository reads |
| RA-07 | only if independently safe | disclosed only | limited item: disposition only; no title/summary/lineage | item count remains null; no refs | `unavailableKinds` | per-item/metric state | explicit only | safe revisions | disclosed + safely-abstracted items; withheld count null |
| RA-08 | null/suppressed | — | metadata-only only when historical owner permits | current authority denied | historical content unavailable | fail-closed policy | — | revoked | historical visibility fail-closed; zero unsafe content |
| RA-09 | — | COH disclosed with value | possible value-withheld metric existence | input failure would withhold | null value unavailable | lineage missing state | — | temporal ref when historical | AuthorizedMetricResult exact supported ID/producer |
| RA-10 | — | LV disclosed with value | possible value-withheld metric existence | input failure would withhold | null value unavailable | lineage missing state | — | temporal ref when historical | AuthorizedMetricResult exact supported ID/producer |
| RA-11 | — | explicit `unsupported-metric` | — | — | — | — | named unsupported ID | current | AuthorizedMetricResult disposition/reason; no value |
| RA-12 | aligned-supported; 8 axes | optional COH,LV | none | none in result | Outcome may be not-observed | none required | — | current | classification + disclosed axes + safe lineage |
| RA-13 | aligned-stale | optional | none | none | Outcome optional | — | freshness remains unsupported | current/history | Evidence axis `explicitly-stale`; no derived freshness |
| RA-14 | justified-divergence | optional | none | none | Outcome optional | — | — | current | divergent strategy + current-supported Evidence + complete lineage |
| RA-15 | unexplained-drift | optional | none | forbidden as cause | Outcome optional | negative search complete | — | current | divergent + insufficient-evidence semantic value + explicit search complete |
| RA-16 | ambiguous-strategic-intent | optional | none | none | — | safe context uncertainty | — | current | strategic axis `ambiguous`; precedence before drift |
| RA-17 | cross-scope-conflict | optional | none | hidden broader facts omitted | — | — | — | current | cross-scope axis `material-conflict` disclosed |
| RA-18 | local-infeasibility | optional | none | hidden constraints omitted | — | — | — | current | strategic consistent + feasibility constrained/infeasible |
| RA-19 | possible-strategy-invalidation | optional | none | hidden Evidence omitted | — | — | — | current/history | challenge axis + current mixed/contradicted Evidence, full lineage |
| RA-20 | authorized-experiment | optional | none | hidden bounds forbidden | Outcome not yet observed allowed | incomplete refs fail | — | current | authority + experiment axes; canonical authorization/bounds/expected Outcome refs |
| RA-21 | unauthorized-action | optional | none | none required | — | — | — | current | authority outside/requires additional; strategic may remain consistent |
| RA-22 | insufficient-authorized-information | optional | none | not reclassified as drift | optional axes | `missingAuthorizedInformation` nonempty | — | current/historical | missing required axis/ref/lineage disposition |
| RA-23 | withheld | optional hidden | no safe abstraction permitted in this fixture | all axis values/lineage cleared | — | — | — | none exposed | protected combination or withheld disclosure; classification only if safe boundary permits |
| RA-24 | any supported non-Outcome classification | optional | none | none required | Outcome axis `unavailable` | — | — | current | missing Outcome signal creates unavailable axis without changing supported classification |

## Disposition acceptance assertions

1. No fixture derives content from role name.
2. Projection-level withheld suppresses all child interpretation.
3. Safely abstracted fixtures contain no title, summary, value, or lineage that
   the production contract removed.
4. Unavailable never implies restricted; withheld never implies absent.
5. Insufficient never receives a speculative classification.
6. Unsupported metrics contain no fabricated value or proxy.
7. Decision fixtures serialize the producer-owned classification and axes
   unchanged.
8. Historical fixtures re-evaluate current authorization.
9. Every fixture excludes Runtime, cognition, credentials, connector state,
   hidden identities, and hidden counts.

## First-slice fixture set

The first vertical slice requires RA-01, RA-02, RA-07, RA-08, RA-11, RA-12,
RA-14, RA-22, RA-23, and RA-24. Exit requires actual production-type
construction, serializer canaries, two role orientations with no role branch,
all six dispositions, responsive states, and keyboard/focus validation.

## Gap register

| Need | Current expression | Classification |
|---|---|---|
| Home attention ordering | bounded kind/section ordering; no numeric rank | no gap |
| Notifications | no canonical notification state; deferred | no gap for required slice |
| Separate contradicting-reference list | safe contradiction items and disclosed safe lineage only | no gap; content design constraint |
| General Outcome/Learning feed | only calibration/history when represented | no gap; do not fabricate |
| Concrete 24 fixture objects | not implemented in this architecture task | fixture implementation gap for next task |

No genuine Product contract gap blocks the required experience architecture.
