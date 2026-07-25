# Discovery 2 Phase 8A — Runtime-backed Your Organization

**Status:** Partial Runtime integration
**Scope:** Product data-source and view-model integration only

## Existing-route audit

`/your-organization` already loaded a persisted `OrganizationRuntime` through
`loadProductOrganization()`. The remaining fixture-era boundary was the
workspace view model: its primary insight and confidence were derived from the
assessment-owned `currentUnderstandings` compatibility view, and the page did
not expose canonical compositions, completed Explanations, or explicit missing
Runtime support.

Phase 8A adds a read-only Runtime adapter and keeps the existing workspace,
navigation, interaction modes, and visual language.

## Display mapping

| Displayed section | Runtime owner | Phase 8A source | Availability |
| --- | --- | --- | --- |
| Current Organizational Understanding | Canonical Organizational Understanding | `organizationalUnderstandingState.canonicalCompositions` resolved to referenced completed Explanations | Partial: canonical composition is available prospectively, but the current completed-Explanation contract has no required human-readable claim text |
| Top Organizational Explanations | Completed Organizational Explanations | `memory.organizationalExplanations` | Partial: historical records often carry title/summary; current canonical type does not require display prose |
| Supporting Evidence | Evidence | completed-Explanation Evidence references | Runtime not yet available: canonical Evidence bodies are not persisted in Organization Runtime |
| Remaining Uncertainty | Organizational Uncertainty and completed Explanations | `memory.organizationalUncertainty`, Explanation `uncertainty` | Available when produced |
| Relevant Conditions | Organizational Conditions | `memory.organizationalConditions` | Available |
| Current Organizational State | Organizational State | `memory.organizationalState` | Available |
| Investigation Opportunities | Investigation Opportunities | `memory.investigationOpportunities` | Available |
| Recent Changes | Learning Events and Understanding Evolution | `memory.learningEvents`, Understanding evolution history | Available |
| Model Evolution | Understanding and Theory Evolution | `memory.understandingEvolution`, `memory.theoryEvolution` | Available when produced |

The adapter never substitutes benchmark or research objects. Missing canonical
content is rendered exactly as `Runtime not yet available`.

## Product behavior

- Existing page structure and interaction modes remain.
- Primary insights now prefer canonical composition and completed-Explanation
  inputs instead of `currentUnderstandings`.
- The page adds a compact Runtime-details region using the existing workspace
  visual system.
- Confidence is no longer borrowed from the assessment-derived compatibility
  view; it is unavailable until canonical Understanding owns an appropriate
  product-safe value.
- The adapter is pure and does not persist or mutate Runtime.

## Validation

`npm run validate:organization-experience` verifies:

- existing organization experience behavior;
- canonical composition and completed-Explanation resolution;
- explicit Evidence unavailability;
- Organizational State, investigation, change, and evolution mapping;
- deterministic repeated output;
- persisted Atlas Runtime replay;
- no Runtime mutation.

## Missing Runtime capabilities

1. Required human-readable semantic content owned by completed Explanations or
   canonical Organizational Understanding.
2. Persisted canonical Evidence bodies or a governed Evidence retrieval
   boundary.
3. Canonical Understanding confidence suitable for product projection.
4. An activated disclosure-decision producer for application enforcement.

No new cognition or owner was invented to close these gaps.
