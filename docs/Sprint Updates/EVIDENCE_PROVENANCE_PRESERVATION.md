# Evidence Provenance Preservation

## Outcome

CAP-PER-001 now accepts an optional structured evidence-source envelope and
preserves source provenance on each resulting `V3Evidence` record. The change
is information-preserving only: canonical cognition and all downstream
confidence, ranking, contradiction, condition, assessment, recommendation, and
simulation behavior remain unchanged.

## Repository Safety

- Branch: `sprint-79-organization-experience`
- Starting commit: `5bee35a827a51b5aadf9d33b83d5ba89457396f9`
- Starting staged files: none
- The pre-existing decisive-evidence ablation and evidence-sensitivity
  production design remain available.
- Ground Truth remains `75 / 100`.
- Canonical Atlas and Northstar fixtures were not modified.
- Executive Decision Lab isolation remains present.
- Sprint 110 files were not modified by this sprint.
- Pre-existing generated artifacts, Runtime files, documentation, benchmark
  experiments, provider output, and `Does` were left outside this sprint.

## Final Input Contract

`InvestigationInput` may now include:

```ts
evidenceSources?: Array<{
  sourceId: string;
  sourceType?: string;
  observedAt?: string;
  reliability?: number;
  content: string;
}>;
```

Legacy `context: string` remains required and retains its existing ingestion
behavior. When both forms are supplied, legacy context lines are formed first,
followed by structured sources in caller order. Each non-empty structured
content line becomes a distinct evidence record. Generated evidence IDs remain
the record identities and are assigned deterministically across the combined
sequence.

## Provenance Semantics

- `sourceId` identifies the originating source, not an evidence record.
  Multiple records and exact copies may therefore share one `sourceId`;
  independent sources retain distinct IDs.
- `sourceType` is an extensible caller-defined string. Structured input defaults
  to the existing generic `user` behavior when it is omitted.
- `observedAt` preserves a supplied valid date-time string. It is not used for
  recency weighting.
- `reliability` preserves a finite value in the inclusive range `[0, 1]`. It is
  not used in evidence confidence.
- Blank source identity causes the structured entry to be omitted. Invalid
  optional `observedAt` or `reliability` values are omitted deterministically.
- No semantic deduplication, grouping, weighting, or evidence-count change was
  introduced.

## Files Changed

Production:

- `engine/types.ts`
- `engine/v3/types.ts`
- `engine/v3/evidence.ts`
- `engine/v3/index.ts`

Benchmark-local:

- `engine/benchmark/judgment-lab/atlasIndustrialProvenancePilot.ts`
- `engine/benchmark/judgment-lab/validateEvidenceProvenancePreservation.ts`
- `engine/benchmark/judgment-lab/validateJudgmentLabProvenance.ts`

Documentation:

- `docs/Sprint Updates/EVIDENCE_PROVENANCE_PRESERVATION.md`

## Legacy Parity

The focused ingestion regression compares the full legacy evidence objects to
the captured pre-sprint snapshot. It passed byte-equivalent object comparison.
Calling ingestion with an omitted structured-source argument and with an empty
structured-source array also produces identical legacy output.

Result: `11 / 11 PASS`.

## Structured Provenance Regression

The focused regression confirms:

- shared source identity with distinct evidence-record IDs;
- independent A04 and A11-style source identities;
- exact reliability preservation without confidence change;
- exact observed-time preservation;
- source-type preservation;
- deterministic invalid-metadata handling;
- deterministic caller-order behavior and explicitly reversed input behavior.

Result: `11 / 11 PASS`.

## Judgment Lab Provenance Fixture

The benchmark-local fixture supplies structured provenance for the Atlas
Industrial baseline and the exact-duplicate, weakened, stale, and contradictory
variants. It demonstrates:

- exact duplicates can share one source identity;
- independent evidence retains distinct source identity;
- weakened evidence carries lower reliability;
- stale evidence carries an older observation time;
- contradictory evidence retains independent source identity.

For every variant, a structured run and its legacy context equivalent produced
the same canonical cognitive and substantive Runtime result after removing only
the newly preserved provenance fields. The focused fixture passed `16 / 16`.

## Canonical Validation

- Ground Truth, sequential run 1: `75 / 100`
- Ground Truth, sequential run 2: `75 / 100`
- Decisive-evidence ablation, two sequential runs: byte-identical
- Judgment Lab framework: `15 / 15 PASS`
- Judgment Lab expansion: `15 / 15 PASS`
- Executive Decision Lab: `39 / 39 PASS`
- Decision order independence: `PASS`
- Atlas canonical understanding: `100%`
- Operating Model Evolution: `14 / 14 PASS`
- Production evolution replay: `7 / 8`, with the existing deferred historical
  overwrite finding unchanged
- Executive Simulation: `PASS`
- Cognition validation: `PASS` (`32` capabilities)
- Typecheck: `PASS`
- Build: `PASS`, with six existing React Hook dependency warnings
- `git diff --check`: `PASS`

Two initially parallelized stateful checks collided through shared benchmark
Runtime files. Their outputs were discarded, and the required Ground Truth and
Decision order-independence checks were rerun sequentially with the expected
stable results above.

## Downstream Reasoning

The structured/legacy fixture proves that existing reasoning output is
unchanged when the source content is identical. This sprint does not consume
`sourceId`, `sourceType`, `observedAt`, or `reliability` in any downstream
producer. Evidence confidence, Signal and Theme support, contradiction
behavior, mechanism inference, beliefs, theories, conditions, executive
assessment, recommendations, and simulations are unchanged.

## Runtime and Schema Impact

No Runtime contract, persistence schema, migration, or Runtime producer was
changed. `V3Evidence` already participates in the existing persisted
understanding state, so its optional fields survive there through the existing
object serialization path without a new Runtime field or migration. Legacy
records contain no added undefined keys.

## Recommended Next Benchmark Experiment

Run one benchmark-only source-aware aggregation experiment using this fixture:
compare record-count support with unique-`sourceId` support across the baseline,
exact-duplicate, weakened, stale, and contradictory variants. Measure whether
source-aware support corrects duplicate corroboration without yet changing
production weighting. Keep reliability and observed-time policies separately
measured so any later production repair remains narrow and benchmark-earned.
