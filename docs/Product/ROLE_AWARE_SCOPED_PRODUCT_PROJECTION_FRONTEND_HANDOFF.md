# Role-Aware Scoped Product Projection Frontend Handoff

## Status and boundary

The multi-role backend is ready for fixture-first frontend experience work.
The sole organization-level meaning boundary is
`readScopedOrganizationalProductProjection` in
`product/integration/scopedOrganizationalProductProjection.ts`.

The request supplies an authenticated user ID, exact organization ID, and a
server-resolved `ScopedGovernanceContext`. Authorization occurs before the
single `ScopedProjectionRepository.readAuthorizedSource` call. Denied and
cross-organization requests perform zero reads. The response is the versioned
`ScopedProductProjection`; it contains scoped Product items, authorized metric
results, an optional `ScopedDecisionCalibrationProjection` or explicit
unavailable disposition, safe lineage, audit refs, and temporal metadata. It
contains no raw Runtime. The frontend performs no authorization.

## One-model and role-neutrality rule

```text
canonical Evidence and cognition
→ one canonical Organizational Understanding model
→ scoped governance and disclosure
→ authorized metrics and decision calibration
→ scoped Product projection
→ frontend renderer
```

Every role uses the same adapter and `projectScopedDecisionCalibration`
producer. Role labels grant no authority and create no truth model. Material
differences derive only from recipient, exact authorized/requested scope,
purpose, sensitivity, visible Evidence and Understanding, canonical
constraints, and current/historical mode.

## Supported content

The frontend may render scoped Understanding; material change; uncertainty;
open questions; missing information; Evidence gaps; investigations; safe
contradictions; relevant Objective and Optimization Context; canonical
Organizational Understanding coherence; canonical Organizational Learning
Profile learning velocity; decision-calibration axes and overall disposition;
justified divergence; sufficiently established unexplained drift; ambiguous
intent; cross-scope conflict; local infeasibility; possible strategy
invalidation; authorized bounded experiment; authority limitation; current and
historical visibility; safe lineage; and audit references.

Supported metric IDs are:

- `organizational-understanding.coherence`
- `organizational-learning.learning-velocity`

Unsupported metric IDs remain:

- `organizational-understanding.confidence`
- `organizational-understanding.freshness`
- `organizational-understanding.health`
- `organizational-learning.understanding-growth`
- `organizational-learning.memory-growth`
- `organizational-learning.trend-ranking`

The frontend must not invent universal confidence, freshness, composite
health, growth, trend ranking, alignment, conformity, hierarchy, or management
scores; approval beyond canonical authority; non-canonical recommendations;
strategy changes; or explanations based on hidden inputs.

## Semantic dispositions

Render `disclosed`, `safely-abstracted`, `withheld`, `unavailable`,
`insufficient-authorized-information`, and `unsupported` as distinct states.
Never collapse them into one empty state or infer drift from absence.

## Decision calibration presentation

Render, without recomputation, the eight axes: authority, strategic
relationship, Evidence support, local feasibility, cross-scope effect,
strategy-challenge potential, experiment status, and Outcome status. Render
the producer-owned overall classification, safe reason codes, safe lineage,
uncertainty, missing information, existing review requirement, temporal mode,
and audit refs. Do not infer hidden rationale, initiate escalation, approve,
execute, mutate, override, rank, or score.

## Five-role fixture matrix

| Scenario | Authorized scope | Expected utility | Metrics | Calibration | Same adapter |
|---|---|---|---|---|---|
| Team lead | exact team | local Understanding, blockers, gaps, investigations | coherence; learning velocity when authorized | team-scoped; broader/restricted meaning withheld | yes |
| Manager | exact team/managed scope grant | priorities, dependencies, uncertainty, safe change | same two canonical metrics | exact visible decision context; unavailable Outcome allowed | yes |
| Director | exact department | department Understanding and cross-team dependencies | same two canonical metrics | cross-scope conflict only when disclosed | yes |
| Functional executive | exact function | function change, Objective context, investigations | same two canonical metrics | strategy challenge and experiment only with complete lineage | yes |
| Organization executive | exact organization | organization Understanding, change, uncertainty | same two canonical metrics | organization-scoped axes; authority remains separate from alignment | yes |

Differences in withheld and unavailable examples must be created through actual
scope, sensitivity, lineage, authority, and missing canonical inputs—not role
labels.

## Required fixture states

Fixtures must instantiate the actual nested production contracts:

1. useful team projection
2. useful manager projection
3. useful director projection
4. useful functional-executive projection
5. useful organization-executive projection
6. no authorized information
7. partially withheld projection
8. historical projection after revocation
9. supported coherence
10. supported learning velocity
11. unsupported metric
12. aligned-supported decision
13. aligned-stale decision
14. justified divergence
15. unexplained drift
16. ambiguous strategic intent
17. cross-scope conflict
18. local infeasibility
19. possible strategy invalidation
20. authorized experiment
21. unauthorized action
22. insufficient decision information
23. withheld decision calibration
24. unavailable Outcome

Orientation-only and label-only fixtures do not satisfy these states.

## Frontend implementation status and remaining sequence

The fixture-backed first slice is implemented at
`/role-aware-alpha/[fixtureId]`. All 24 fixtures are semantically validated;
the approved ten-fixture first slice renders through one role-neutral shell,
navigation, presentation mapper, and semantic component system. Home,
Understanding, Decision, Investigation, History, and all six dispositions are
present. Only coherence and learning velocity are supported. No backend
semantics changed and `/your-organization` remains unchanged. Three distinct
Clerk development identities are provisioned as CEO, Director, and Manager in
the same sandbox organization through explicit server-side scopes and
operations; role titles grant no authority. The authenticated development live
adapter is wired at `/development/role-aware-live`, with one Runtime read for
authorized requests and zero projection/Runtime reads for denied, revoked, or
cross-organization requests. It uses the same mapper and component system,
contains no fixture fallback, and returns 404 in Production.

1. Add the typed read boundary and serialized-contract validation.
2. Build a role-neutral fixture adapter from production contract types.
3. Establish the scoped experience shell and exact scope context display.
4. Build the “What needs attention” overview.
5. Add Organizational Understanding list and detail.
6. Add change and authorized history experiences.
7. Add Evidence-gap and investigation experiences.
8. Add supported metric presentation and explicit unsupported states.
9. Add decision-calibration panel and detail without recomputation.
10. Add withheld, unavailable, insufficient, abstracted, and unsupported states.
11. Validate responsive behavior and accessibility.
12. Swap fixtures for the canonical server read without changing semantics.

Steps 1–12 are represented by the validated fixture and development-live
slices. Multi-user access, live Manager revocation/restoration/reset, and
three-account session isolation are complete. The retained Northstar Runtime
has no canonical scope references or populated scoped Product inputs, so the UI
correctly renders bounded absence. Source-to-scope correction and renewed
material-differentiation acceptance are next; route promotion remains deferred.

## Six-gap closure matrix

| Gap | Production owner | Focused validator | Checks | Status | Frontend implication |
|---|---|---|---:|---|---|
| GAP-MR-001 scoped disclosure | scoped governance context + scoped Understanding disclosure | `validateMultiRoleFoundationalGovernanceContracts.ts` | 22 disclosure | closed | render only disclosed/abstracted fields |
| GAP-MR-002 historical visibility/revocation | historical scoped visibility + current governance context | same validator | 11 historical | closed | current authorization governs historical views |
| GAP-MR-003 contribution/admission | scoped contribution + canonical Evidence admission | same validator | 15 contribution | closed | contribution never implies Evidence authority |
| GAP-MR-004 scoped Product projection | `readScopedOrganizationalProductProjection` | `validateAuthorizedMetricLineageAndScopedProjection.ts` | 20 projection | closed | one canonical renderer boundary |
| GAP-MR-005 authorized metric lineage | `evaluateAuthorizedMetricLineage` | same validator | 18 metric | closed | render only supported authorized metrics |
| GAP-MR-006 decision calibration | `projectScopedDecisionCalibration` | `validateScopedDecisionCalibrationProjection.ts` | 32 focused | closed | render axes/classification; never recompute |

The unchanged frozen benchmark remains the historical oracle that motivated
these production corrections. It is not rewritten to erase its historical gap
records.
