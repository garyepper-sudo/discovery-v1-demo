# Duplicate Evidence Replay-Aware Cognition Entry

## Status

Implemented and validated under **DISCOVERY DUPLICATE EVIDENCE REPLAY-AWARE
COGNITION ENTRY AND CANONICAL UNDERSTANDING REVISION STABILITY 001**.

## Defect closed

A new authorized Product operation that contributed an exact duplicate of an
already admitted attribution could re-enter cognition despite introducing no
new canonical cognitive input. Repetition could therefore recompute
Understanding even though Evidence, admission, provenance, scope, and exact
ProductQuestion support were unchanged.

## Canonical behavior

The implementation preserves three distinct replay classes:

1. Exact operation replay returns its prior immutable operation result without
   a new Runtime write, event, investigation, or cognition pass.
2. A new operation whose complete prospective batch is an exact attribution
   replay for the same organization and ProductQuestion may append its bounded
   Product audit fact, but skips cognition and leaves canonical Understanding
   unchanged.
3. Existing Evidence with new admission, provenance, Source Binding, scope, or
   ProductQuestion support remains canonical input and enters cognition.

The Engine owns a non-persistent admission preflight built from the same
canonical Evidence and admission identity helpers used by execution. Product
integration owns the Class 2 entry guard and proves exact prior
ProductQuestion support from validated canonical operation records. A source
identifier alone is never sufficient. The execution-time owner remains
authoritative: its complete zero/one/many batch must match preflight identity,
disposition, provenance, scope, ordering, and cardinality before cognition can
be skipped. Runtime revision conflicts fail closed.

## Stability and controls

Repeated exact duplicates preserve the canonical composition sequence
`12 → 12 → 12`, composition revision identities, support sets,
confidence, coverage, stability, novelty, explanatory power, and ranking.
Fresh-process controls independently prove stable Explanation and composition
identities from identical Runtime bytes, Evidence, clock, and configuration.

New provenance, changed scope, new Source Binding, new Question support,
material Evidence, and contradictory Evidence all remain cognition-entering
controls. Canonical owners still derive Answer and Unknown change; the guard
does not force either result.

## Compatibility and boundaries

This change introduces no Runtime schema or migration and changes no canonical
Evidence, admission, Source Binding, Explanation, composition, confidence, or
historical revision identity. Existing operation records without the optional
cognition disposition remain readable. The retained Northstar Runtime is not
read or modified by the validators.

The preserved Leadership Conversation router remains noncanonical and
untouched. Its clean continuation must inject this integrated preflight into
canonical server composition, consume the actual operation-bound admission
batch, and retain the unchanged duplicate-Evidence assertion. This closure
does not implement generic Outcome routing, Decision promotion, route
promotion, connector access, or Production behavior.
