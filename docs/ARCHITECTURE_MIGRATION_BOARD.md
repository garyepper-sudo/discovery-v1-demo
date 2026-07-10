# Discovery Architecture Migration Board

## Status Legend

- KEEP
- MOVE
- MERGE
- ARCHIVE
- DELETE
- REVIEW

---

## Components

| Current | Canonical Home | Status |
|---|---|---|
| `components/organism/` | Living Understanding | KEEP |
| `components/executive-v2/` | Executive Workspace | KEEP |
| `components/results/` | Results Workspace | REVIEW |
| `components/workspace/` | Organizational Workspace | KEEP |
| `components/trace/` | Reasoning Trace | KEEP |
| `components/ui/` | Shared UI | KEEP |
| `components/understanding/` | Understanding Components | KEEP |
| `components/investigation/` | Investigation Experience | KEEP |
| `components/executive/` | Legacy Executive Experience | REVIEW |
| `components/ExecutiveDashboard/` | Legacy Executive Dashboard | REVIEW |
| `components/cognition-lab/` | Internal Cognition Lab | KEEP |

---

## Legacy Root Components

| Current | Canonical Home | Status |
|---|---|---|
| `components/UnderstandingOrganism.tsx` | `components/organism/` | REVIEW |
| `components/OrganismViewer.tsx` | `components/organism/` | REVIEW |
| `components/OrganismPreview.tsx` | `components/organism/` | REVIEW |
| `components/LivingOrganismCanvas.tsx` | `components/organism/` | REVIEW |
| `components/BeliefCard.tsx` | `components/understanding/` | REVIEW |
| `components/StewardshipBrief.tsx` | `components/understanding/` | REVIEW |
| `components/UnderstandingCard.tsx` | `components/understanding/` | REVIEW |
| `components/UnderstandingTimeline.tsx` | `components/understanding/` | REVIEW |
| `components/InvestigationNarrative.tsx` | `components/investigation/` | REVIEW |
| `components/InspectionDrawer.tsx` | `components/investigation/` | REVIEW |
| `components/EvidencePrompt.tsx` | `components/investigation/` | REVIEW |
| `components/ActionPanel.tsx` | `components/investigation/` | REVIEW |
| `components/DeveloperPanel.tsx` | `components/investigation/` | REVIEW |
| `components/Hero.tsx` | Executive or legacy landing experience | REVIEW |
| `components/PrivateWorkspace.tsx` | Workspace | REVIEW |
| `components/Organism.tsx` | Legacy home-screen organism | REVIEW |
| `components/types.ts` | Canonical shared type location | REVIEW |

No file in this section may be archived until all imports and render paths are verified.

---

## Executive UI

| Current | Canonical Home | Status |
|---|---|---|
| `components/executive-v2/ExecutiveWorkspace.tsx` | Executive Workspace | KEEP |
| `components/executive-v2/ExecutiveExperience.tsx` | Executive Workspace | KEEP |
| `components/executive-v2/sidebar/` | Executive Workspace | KEEP |
| `components/executive-v2/understanding/` | Executive Living Understanding | KEEP |
| `components/executive/` | Legacy Executive Experience | REVIEW |
| `components/ExecutiveDashboard/` | Legacy Executive Dashboard | REVIEW |

The Executive V2 workspace is the current canonical executive shell unless active imports prove otherwise.

---

## Living Understanding UI

| Current | Canonical Home | Status |
|---|---|---|
| `components/organism/UnderstandingOrganism.tsx` | Living Understanding inspector | KEEP |
| `components/organism/OrganismViewer.tsx` | Living Understanding explorer | KEEP |
| `components/organism/OrganismPreview.tsx` | Living Understanding preview | KEEP |
| `components/organism/LivingOrganismCanvas.tsx` | Living Understanding renderer | KEEP |
| `components/executive-v2/understanding/UnderstandingOrganism.tsx` | Executive projection | KEEP |
| `components/executive/LivingUnderstandings.tsx` | Legacy or alternate expression | REVIEW |

Future naming may replace “Organism” with “Living Understanding,” but renaming should happen only after imports and responsibilities are consolidated.

---

## Engine Domains to Keep

These folders already represent clear architectural responsibilities:

- `engine/v3/runtime/`
- `engine/v3/model/`
- `engine/v3/semantic/`
- `engine/v3/meaning/`
- `engine/v3/understanding/`
- `engine/v3/entities/`
- `engine/v3/functional/`
- `engine/v3/phenomena/`
- `engine/v3/executive/`
- `engine/v3/expression/`
- `engine/v3/compression/`
- `engine/v3/capabilities/`
- `engine/v3/cognition/`
- `engine/v3/concepts/`

Status: KEEP

---

## Engine Root Files to Review

These files remain active but may eventually belong inside canonical domain folders:

- `engine/v3/beliefs.ts`
- `engine/v3/themeRelationships.ts`
- `engine/v3/evidence.ts`
- `engine/v3/evidenceRelationships.ts`
- `engine/v3/evidenceWeighting.ts`
- `engine/v3/dialectic.ts`
- `engine/v3/workspace.ts`
- `engine/v3/delta.ts`
- `engine/v3/causal.ts`
- `engine/v3/mechanism.ts`
- `engine/v3/hypotheses.ts`
- `engine/v3/emergence.ts`
- `engine/v3/organismState.ts`
- `engine/v3/priority.ts`
- `engine/v3/types.ts`
- `engine/v3/understandingSynthesizer.ts`
- `engine/v3/confidencePropagation.ts`
- `engine/v3/reasoningGraph.ts`
- `engine/v3/evidenceNetwork.ts`
- `engine/v3/evidenceGraph.ts`
- `engine/v3/observations.ts`
- `engine/v3/explanations.ts`
- `engine/v3/contradictions.ts`
- `engine/v3/understanding.ts`
- `engine/v3/understandingObject.ts`
- `engine/v3/signals.ts`
- `engine/v3/themes.ts`
- `engine/v3/index.ts`

Status: REVIEW

No engine file should move during the first component-cleanup phase.

---

## Legacy Engine Generations

| Current | Canonical Status | Action |
|---|---|---|
| `engine/archive/v1/` | Historical archive | KEEP |
| root `engine/*.ts` files | Legacy engine generation | REVIEW |
| `engine/v2/` | Legacy engine generation | REVIEW |
| `engine/v3/` | Current canonical engine | KEEP |
| `engine/benchmark/` | Validation and fitness testing | KEEP |

The repository should ultimately make V3 visibly canonical while preserving older generations only where they are still required.

---

## Documentation

| Current | Status |
|---|---|
| `docs/CANONICAL_ARCHITECTURE.md` | KEEP |
| `docs/ARCHITECTURE_MIGRATION_BOARD.md` | KEEP |
| `docs/ORGANISM_ARCHITECTURE.md` | REVIEW for Living Understanding terminology |
| `docs/ENGINE_MAP.md.` | REVIEW filename and relevance |
| `docs/Archive/` | KEEP |
| remaining architecture and cognition documents | REVIEW incrementally |

---

## Migration Order

1. Verify and consolidate duplicate root components.
2. Consolidate the Living Understanding UI.
3. Review legacy executive component generations.
4. Review results, workspace, and understanding overlap.
5. Consolidate shared component types.
6. Review legacy engine generations.
7. Reorganize active V3 root files only after dependencies are mapped.
8. Update architecture documentation after each completed subsystem.

---

## Migration Rules

Nothing moves until:

1. all imports are verified
2. all render paths are verified
3. the canonical replacement exists
4. TypeScript passes
5. the production build passes
6. the relevant screen is manually tested

Each migration should affect one subsystem only.

Each successful subsystem migration should be committed separately.

Archived files must remain outside active component and engine folders.

Runtime-generated files must not be included in architecture commits.