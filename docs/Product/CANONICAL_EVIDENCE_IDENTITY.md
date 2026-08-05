# Canonical Evidence Identity

Status: version 2 identity contract for canonical scope-lineage admission.

`V3Evidence.id` remains deterministic only within one investigation execution. Labels such as `E1` are local references and must never be treated as organization-wide Evidence identity.

Before canonical admission, Discovery now derives an organization-bound `canonical-evidence:v2` identity from normalized Evidence-record content. The normalization is Unicode NFKC plus collapsed whitespace. It preserves existing content-addressed behavior: materially different content is distinct, exact duplicates and formatting-only equivalents share canonical Evidence identity, and identical content in different organizations remains isolated.

`evidence-admission:v2` binds the exact organization, canonical Evidence identity, and canonical scope-lineage admission owner. It never derives from a local Evidence label, array position, filename, transport ID, role, scope, sensitivity, or presentation text. Repeated admission is idempotent.

An immutable Evidence scope attribution records the v2 identity version, exact canonical Evidence and admission IDs, all local Evidence IDs as provenance only, exact source-binding revisions, and the topology revision. Multiple legitimate sources for the same canonical Evidence retain all source bindings on one attribution, including sources admitted in later calls. Runtime-derived lineage translates local support references to canonical Evidence IDs before persistence and fails closed when one local label could resolve to multiple canonical ancestries.

Historical v1 attribution IDs remain immutable and readable when unambiguous. Ambiguous legacy local-ID resolution fails closed; there is no in-place upgrade or migration. Investigation-local IDs, investigation fingerprints, source identities, source versions, Evidence meaning, cognition, scope, authorization, disclosure, metrics, calibration, and recommendations are unchanged.

The focused validator includes cross-investigation, duplicate, formatting-only, multi-source, cross-organization, changed-content, malformed-local-ID, Runtime ancestry, scope-isolation, and protected-canary cases. Northstar bindings and replay are not part of this correction.
