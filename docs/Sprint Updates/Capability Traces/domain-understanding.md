# Capability Trace — Domain Understanding

Generated: 2026-07-10T23:27:22.408Z

## Search Terms

- `Domain Understanding`
- `domainUnderstanding`
- `DomainUnderstanding`
- `domain-understanding`
- `domain understanding`

## Pipeline Summary

| Layer | Status | Matches |
|---|:---:|---:|
| Engine | ✅ Found | 18 |
| Runtime | ✅ Found | 12 |
| Executive | ❌ Not found | 0 |
| Projection | ❌ Not found | 0 |
| UI | ❌ Not found | 0 |
| API | ❌ Not found | 0 |
| Simulation | ❌ Not found | 0 |
| Benchmark | ❌ Not found | 0 |
| Other | ❌ Not found | 0 |

## Detailed Matches

### Engine

#### `engine/v3/understanding/synthesizeUnderstanding.ts`

- Line 4 · **unknown** · matched `domainUnderstanding`
  - `OrganizationalDomainUnderstanding,`
- Line 11 · **unknown** · matched `domainUnderstanding`
  - `createDefaultDomainUnderstandings,`
- Line 321 · **unknown** · matched `domainUnderstanding`
  - `function buildDomainUnderstanding(params: {`
- Line 326 · **unknown** · matched `domainUnderstanding`
  - `}): OrganizationalDomainUnderstanding {`
- Line 329 · **definition** · matched `domainUnderstanding`
  - `const domainUnderstandings = understandings.filter(`
- Line 333 · **unknown** · matched `domainUnderstanding`
  - `const score = computeScore(domainUnderstandings);`
- Line 335 · **read** · matched `domainUnderstanding`
  - `const strongest = [...domainUnderstandings].sort(`
- Line 342 · **unknown** · matched `domainUnderstanding`
  - `domainUnderstandings.some((item) => item.id === id)`
- Line 365 · **unknown** · matched `domainUnderstanding`
  - `new Set(domainUnderstandings.flatMap((item) => item.beliefIds))`
- Line 368 · **unknown** · matched `domainUnderstanding`
  - `new Set(domainUnderstandings.flatMap((item) => item.themeIds))`
- Line 371 · **unknown** · matched `domainUnderstanding`
  - `new Set(domainUnderstandings.flatMap((item) => item.mechanismIds))`
- Line 374 · **unknown** · matched `domainUnderstanding`
  - `new Set(domainUnderstandings.flatMap((item) => item.contradictionIds))`
- Line 377 · **unknown** · matched `domainUnderstanding`
  - `new Set(domainUnderstandings.flatMap((item) => item.evidenceIds))`
- Line 381 · **unknown** · matched `domainUnderstanding`
  - `missingInformation: createMissingInformation(domainUnderstandings),`
- Line 383 · **unknown** · matched `domainUnderstanding`
  - `new Set(domainUnderstandings.flatMap((item) => item.openQuestions))`
- Line 386 · **unknown** · matched `domainUnderstanding`
  - `relatedUnderstandingIds: domainUnderstandings.map((item) => item.id),`
- Line 408 · **unknown** · matched `domainUnderstanding`
  - `? createDefaultDomainUnderstandings(now)`
- Line 410 · **unknown** · matched `domainUnderstanding`
  - `buildDomainUnderstanding({`

### Runtime

#### `engine/v3/runtime/organizationalUnderstandingState.ts`

- Line 109 · **unknown** · matched `domainUnderstanding`
  - `export type OrganizationalDomainUnderstanding = {`
- Line 193 · **unknown** · matched `domainUnderstanding`
  - `domains: OrganizationalDomainUnderstanding[];`
- Line 236 · **unknown** · matched `domainUnderstanding`
  - `export function createEmptyDomainUnderstanding(params: {`
- Line 240 · **unknown** · matched `domainUnderstanding`
  - `}): OrganizationalDomainUnderstanding {`
- Line 268 · **unknown** · matched `domainUnderstanding`
  - `export function createDefaultDomainUnderstandings(now: string): OrganizationalDomainUnderstanding[] {`
- Line 270 · **unknown** · matched `domainUnderstanding`
  - `createEmptyDomainUnderstanding({`
- Line 275 · **unknown** · matched `domainUnderstanding`
  - `createEmptyDomainUnderstanding({`
- Line 280 · **unknown** · matched `domainUnderstanding`
  - `createEmptyDomainUnderstanding({`
- Line 285 · **unknown** · matched `domainUnderstanding`
  - `createEmptyDomainUnderstanding({`
- Line 290 · **unknown** · matched `domainUnderstanding`
  - `createEmptyDomainUnderstanding({`
- Line 295 · **unknown** · matched `domainUnderstanding`
  - `createEmptyDomainUnderstanding({`
- Line 397 · **unknown** · matched `domainUnderstanding`
  - `domains: createDefaultDomainUnderstandings(params.now),`

## Interpretation

This report is a structural search, not proof of full product integration.

A capability should be marked connected only after verifying:

1. where it is created,
2. where it is persisted,
3. where it is projected,
4. where it is displayed,
5. and whether the active product path actually uses it.
