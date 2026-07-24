# Evidence-Sensitive Organizational Judgment — Production Design

Date: 2026-07-23
Branch: `sprint-79-organization-experience`
Commit: `5bee35a827a51b5aadf9d33b83d5ba89457396f9`

## Repository safety

This is a design sprint. It adds one benchmark-local feasibility adapter and
this report. It does not change production cognition, Runtime behavior,
canonical schemas, pipeline ordering, ranking, confidence, contradiction
handling, recommendations, simulations, product behavior, canonical fixtures,
benchmark scoring, the capability registry, or capability ownership.

At startup:

- staged files: none;
- decisive-evidence ablation: available;
- benchmark checkpoint: available;
- Executive Decision Lab isolation and order regression: available;
- tracked Atlas and Northstar fixtures: unchanged;
- Sprint 110 files: dirty before this sprint and not edited;
- prior benchmark investigations and unrelated work: left unstaged.

## Current evidence-model audit

### Canonical input boundary

`InvestigationInput` contains `company`, `website`, `industry`, `question`, and
one unstructured `context` string. Judgment Lab artifact metadata is rendered
as text inside that context. It is not passed as structured evidence
provenance.

`buildEvidence(context)` splits the complete input on newlines. Every non-empty
line becomes an independent `V3Evidence` record with an order-derived ID
(`E1`, `E2`, ...). Artifact headings, author lines, timestamps, reliability
labels, and the artifact body therefore become separate peer evidence records.

### Field inventory

| Semantic field | Canonical location | Status |
| --- | --- | --- |
| evidence record ID | `V3Evidence.id` | populated, but order-derived; unique record identity only |
| artifact ID | none | benchmark text only; lost as structure |
| stable source ID | none | missing |
| source type | `V3Evidence.source` | populated only as generic `"user"`; not actual source type |
| originating document/message | none | benchmark title and type exist only as separate text lines |
| author/participant | none | benchmark author exists only as a text line and may become an extracted entity |
| source timestamp | none | benchmark `createdAt` exists only as text |
| ingestion timestamp | Runtime metadata | available for the investigation, not individual evidence |
| reliability | none on `V3Evidence` | benchmark fixture only; the text-derived confidence heuristic does not consume it structurally |
| confidence | `V3Evidence.confidence` | populated from sentence type, length, numeric content, and hedging |
| scope | absent on `V3Evidence` | introduced later on some cognitive objects; not evidence provenance |
| duplicate/equivalence | `V3EvidenceRelationship.type = "duplicates"` | derivable by lexical overlap, but no equivalence group or source identity |
| contradiction source/target | relationship source and target IDs | available for pairwise lexical relationships |
| contradiction opposing evidence | `V3Contradiction.opposingEvidenceIds` | available but inconsistently meaningful; often overlaps the complete evidence set |
| contradiction target claim/object | none | missing |
| independence | none | missing |
| evidence ancestry | evidence ID arrays across downstream objects | broadly populated, but ancestry terminates at unstable line-level IDs |
| diagnostic strength | none | partially approximated by numeric/text specificity and relationship types |
| recency relevance | none | missing after context flattening |

### Identity distinctions

- **Unique record identity:** present as `V3Evidence.id`.
- **Stable underlying source identity:** absent.
- **Semantic duplication:** pairwise `duplicates` relationships are available.
- **Independent corroboration:** not represented.

Different evidence IDs must therefore not be interpreted as independent
sources, but current support formulas frequently do exactly that.

### Existing unused weighting helper

`engine/v3/evidenceWeighting.ts` calculates source reliability, specificity,
corroboration, and contradiction penalties. It is not called by the canonical
pipeline. It infers reliability from text/source vocabulary and calculates
corroboration from counts of related evidence, so it cannot supply stable
source independence even if connected unchanged.

It is a utility, not a separate capability owner.

## Producer and consumer trace

| Boundary | Current behavior | Count/aggregation | Provenance behavior |
| --- | --- | --- | --- |
| Input → Evidence | context split by newline | every line becomes evidence | artifact metadata flattened; ID depends on line order |
| Evidence → relationship network | all record pairs compared lexically | duplicate/support/contradiction edges counted independently | pair IDs retained; no source group |
| Evidence → Observations | evidence, Signal, and Theme observations composed | identical statements deduped; max confidence; evidence IDs unioned | dedupe is statement-level, not source-level |
| Evidence → Signals | keyword/rule matches | average confidence plus up to `0.18` raw-count support bonus | different IDs count; source independence unavailable |
| Evidence/Signals → Themes | matched evidence | raw evidence count contributes up to `0.35`; average confidence plus strength bonus | duplicate records can increase support and stability |
| Evidence/Themes → Contradictions | special rules, polarity, longitudinal markers, questions | average related evidence confidence plus bonuses | `opposingEvidenceIds` exists; target claim/object absent |
| Themes/network → V3 mechanisms | evidence and relationship subsets | confidence includes raw relationship and evidence-count bonuses | a `duplicates` relationship can increase network support |
| V3 confidence propagation | evidence relationships adjust evidence, mechanisms, beliefs | `supports`, `duplicates`, and `extends` all add the same support lift | explicit defect: duplicates are treated as corroboration |
| Runtime observations/Phenomena → organizational mechanisms | IDs and counts consolidated | unique record IDs and support counts | line IDs survive, source groups do not |
| Mechanisms/beliefs → theories | confidence and support arrays | unique object IDs, averages, coverage | upstream quality cannot be recovered |
| Cognition → Conditions | keyword matching across concepts, beliefs, mechanisms, theories, evolution | averages object confidence; breadth is object count; continuity boost | no direct evidence-quality input |
| Conditions → organizational state | condition rank functions | condition confidence, strength, severity, connectivity | ranks already-amplified condition objects |
| State/conditions → Executive Assessment | conditions reranked; confidence averages condition confidence, strength, and state confidence | average | no evidence source, recency, reliability, or independence input |

### Earliest loss boundaries

1. **Stable source identity:** lost at `InvestigationInput.context` →
   `buildEvidence`; it never becomes a field.
2. **Reliability:** lost at the same boundary. `"Reliability: high"` becomes an
   unrelated evidence line; the artifact body gets text-derived confidence.
3. **Recency:** lost at the same boundary. The source date and staleness label
   are separate evidence lines.
4. **Duplicate independence:** first becomes wrong in Signal/Theme raw-count
   bonuses and is explicitly reinforced in `confidencePropagation.ts`, where
   `duplicates` is counted as support.
5. **Contradiction target:** pairwise relationship endpoints exist, but
   `detectContradictions` composes theme-level or generic evidence sets without
   a stable target claim/object. A credible opposing result can therefore
   change upstream weights without becoming a targeted contradiction.
6. **Diagnostic strength:** numeric specificity affects line confidence, but
   controlled discrimination between explanations has no canonical
   representation. It becomes indistinguishable from generic relevant support
   before Signal and Theme aggregation.
7. **Downstream confidence:** Conditions and Executive Assessment faithfully
   average their inputs, but those inputs already contain raw-count and
   provenance-loss effects.

## Ownership analysis

### Evidence Ingestion — `CAP-PER-001`

Proposed owner of stable source identity, source reliability, and source
timestamp.

- already receives all source material;
- already owns `V3Evidence`;
- is the only boundary early enough to preserve provenance rather than infer it
  later;
- downstream consumers already use evidence IDs and can remain compatible with
  optional provenance;
- does not duplicate another capability;
- architecture risk: medium because `InvestigationInput` and `V3Evidence` are
  canonical contracts;
- migration risk: medium to high unless fields are optional and legacy context
  input remains valid.

### Organizational Observation Inference — `CAP-PER-002`

Consumer, not primary provenance owner.

- receives evidence ancestry;
- owns organization-level observations;
- can aggregate by source only if CAP-PER-001 supplies source identity;
- should preserve provenance groups, not invent them;
- architecture risk: low after ingestion migration;
- migration risk: low with optional fields.

### Signal and Theme inference

Owner of source-aware support aggregation within its existing outputs.

- already calculates count bonuses and average confidence;
- can replace record count with independent-source count once provided;
- must not own source identity or reliability policy;
- architecture risk: medium because ranking can change;
- migration risk: low for new investigations, unknown for historical results.

### Contradiction handling

Owner of explicit opposition semantics.

- already receives evidence, Themes, previous evidence, and pairwise
  relationships;
- already owns `V3Contradiction.evidenceIds` and `opposingEvidenceIds`;
- should populate supporting and opposing sides specifically rather than
  inventing a new object;
- cannot safely do so until stable provenance and claim comparison survive
  ingestion;
- architecture risk: medium;
- migration risk: low for ephemeral V3 results, higher for persisted historical
  interpretations.

### Organizational Mechanism Inference — `CAP-UND-001`

Consumer and propagation owner.

- already owns mechanism evidence support and confidence;
- should consume source-aware support without recreating provenance;
- raw support counts and duplicate network edges must not regain influence;
- architecture risk: medium;
- migration risk: medium because mechanism confidence is persistent.

### Theory validation and Condition inference — `CAP-UND-003` / `CAP-UND-004`

Consumers of quality-adjusted upstream confidence.

- should not independently rescore raw evidence;
- existing averaging can remain if upstream confidence is calibrated;
- condition breadth may eventually need independent-support semantics, but no
  change is justified before the ingestion experiment;
- architecture risk: high if changed prematurely.

### Executive Assessment — `CAP-UND-005`

Final consumer, not evidence-weighting owner.

- it correctly ranks and averages condition/state inputs;
- adding evidence policy here would duplicate cognition and hide the earliest
  defect;
- no direct change is recommended;
- architecture and migration risk would be high.

## Minimum semantic requirements

1. Every evidence record must retain a stable ID for its originating document,
   message, interview, or other source.
2. Multiple records from the same source form one independence group unless a
   producer can demonstrate independent origin.
3. Support bonuses must use independent groups, not evidence-record count.
4. Reliability must weight the source contribution before Signals and Themes.
5. Source time must remain available. Recency policy must be claim-sensitive;
   stale evidence remains historical evidence rather than disappearing.
6. Exact and semantic duplicates must not create independent support.
7. Contradictions must separate the supporting side, opposing side, and target
   claim/object when deterministically available.
8. Diagnostic strength must be derived from existing specificity,
   comparison, explanation, and contradiction relationships; it must not be an
   arbitrary user-entered truth score.
9. Confidence must aggregate bounded independent contributions and targeted
   opposition, with deterministic ordering and explicit explanation.
10. Evidence IDs and ancestry must remain intact even when contribution is
    grouped or capped.

## Design options

### Option A — source-aware support aggregation

Group support by stable source identity and use the strongest bounded
contribution per group.

- likely files: `engine/types.ts`, `engine/v3/types.ts`,
  `engine/v3/evidence.ts`, `engine/v3/signals.ts`, `engine/v3/themes.ts`,
  `engine/v3/confidencePropagation.ts`;
- objects: `InvestigationInput`, `V3Evidence`, existing evidence ID arrays;
- schema impact: required, because stable source identity is absent;
- Runtime impact: avoidable if provenance remains investigation-local initially;
- improves: exact duplication, record-count inflation, some context-removal
  behavior;
- does not solve: reliability, recency, targeted contradiction, controlled
  reversal by itself;
- determinism: high if grouping key is supplied and sorting is stable;
- reversibility: high with optional fields and legacy fallback;
- size: medium;
- risk: collapsing legitimate independent sources if grouping is inferred from
  text rather than supplied.

### Option B — weighted evidence contribution

Carry structured reliability and observed time into existing Signal, Theme,
and mechanism support calculations.

- likely files: `engine/types.ts`, `engine/v3/types.ts`,
  `engine/v3/evidence.ts`, `engine/v3/signals.ts`, `engine/v3/themes.ts`,
  `engine/v3/mechanism.ts`;
- objects: `V3Evidence`, existing confidence-bearing outputs;
- schema impact: required;
- Runtime impact: avoidable initially;
- improves: weakened, stale, removal, and sparse/high-quality distinctions;
- does not solve: duplicates or explicit opposition;
- determinism: high with fixed evaluation time and explicit recency policy;
- reversibility: high with optional fields;
- size: medium;
- risk: broad underconfidence and excessive recency bias.

### Option C — targeted contradiction propagation

Use existing evidence relationships and `opposingEvidenceIds` to distinguish
the supported claim from the evidence that opposes it.

- likely files: `engine/v3/evidenceRelationships.ts`,
  `engine/v3/contradictions.ts`, `engine/v3/confidencePropagation.ts`,
  `engine/v3/mechanism.ts`;
- objects: existing `V3EvidenceRelationship` and `V3Contradiction`;
- schema impact: potentially avoidable for evidence-to-evidence targets, but a
  claim/object target would require an optional field;
- Runtime impact: none for a V3-only pilot;
- improves: credible contradiction and competing-explanation preservation;
- does not solve: duplicate, reliability, recency, removal;
- determinism: high;
- reversibility: high;
- size: small to medium;
- risk: false opposition from lexical antonyms and over-penalization.

### Option D — combined minimum intervention

Introduce optional provenance fields, group support by source, weight by
reliability/recency, and propagate targeted opposition.

- likely files: the union of A–C, plus ingestion callers;
- schema impact: required;
- Runtime impact: avoidable initially, but historical comparability remains a
  concern;
- potentially improves every ablation path;
- diagnostic reversal still depends on valid semantic discrimination;
- determinism: achievable;
- reversibility: medium;
- size: large;
- risk: too many interacting changes to attribute benchmark movement safely.

Option D is not recommended as the first experiment.

## Benchmark-local feasibility

`evidenceSensitivityDesignFeasibility.ts` models all four choices without
feeding simulated scores back into cognition.

Key normalized support results:

| Scenario | Raw count | Source-aware | Weighted | Targeted opposition | Combined |
| --- | ---: | ---: | ---: | ---: | ---: |
| baseline | 1.80 | 1.80 | 1.80 | 1.80 | 1.80 |
| weakened | 1.80 | 1.80 | 0.72 | 1.80 | 0.72 |
| stale | 1.80 | 1.80 | 0.81 | 1.80 | 0.81 |
| contradicted | 2.65 | 2.65 | 2.65 | 0.95 | 0.95 |
| duplicated | 3.60 | 1.80 | 3.60 | 3.60 | 1.80 |
| irrelevant | 1.80 | 1.80 | 1.80 | 1.80 | 1.80 |

Interpretation:

- Option A faithfully demonstrates the arithmetic of neutralizing exact copies.
- Option B directionally demonstrates reliability and recency weighting.
- Option C directionally demonstrates target-specific weakening.
- Option D demonstrates arithmetic compatibility only.

The adapter supplies `stableSourceId`, reliability, staleness, opposition, and
diagnostic strength from benchmark metadata. Those semantics do not exist on
canonical `V3Evidence`, and the scores never reenter production cognition.
Therefore this is a feasibility boundary test, not proof that any option is
production-ready.

The controlled reversal cannot be simulated faithfully by post-processing:
the required discriminator must influence canonical Evidence, Signals,
Themes, mechanisms, Conditions, and ranking. Any adapter that directly changes
the selected condition would bypass the behavior under investigation.

## Cross-benchmark risk

| Surface | Principal risk |
| --- | --- |
| Ground Truth | priority/support balance could change; must remain 75 or improve semantically without keyword-only movement |
| Atlas canonical | dominant condition and 100% canonical score may move |
| Executive Decision Lab | recommendation stability and confidence responses could change |
| Evolution Lab | new evidence weighting may alter longitudinal continuity |
| Production replay | must not conceal or compound historical overwrite |
| Executive Simulation | recommendation identity/confidence must remain stable unless upstream evidence legitimately changes |
| Organizational Intelligence | source identity intersects future scope and visibility policy; do not treat provenance as authorization |
| Executive Collaboration | altered Runtime conclusions could affect responses; Sprint 110 must remain separate |
| contradiction-heavy organizations | risk of over-penalization and chronic underconfidence |
| sparse-evidence organizations | one high-quality source must remain usable without a corroboration requirement |
| evidence-rich organizations | source grouping must prevent volume dominance without suppressing independent confirmation |
| longitudinal organizations | stale evidence must remain history; newer evidence should not automatically erase it |
| duplicated documents/messages | false corroboration must fall while ancestry remains complete |

Additional risks:

- unstable source grouping if IDs are inferred from text;
- treating two authors quoting one report as independent;
- treating two genuinely independent observations as duplicates;
- excessive time decay for persistent organizational facts;
- changed tie-breaking and loss of deterministic ordering;
- historical Runtime incompatibility if optional provenance becomes mandatory;
- false contradiction targets from lexical opposition alone.

## Selected future production experiment

### Optional structured evidence-provenance envelope at Evidence Ingestion

Extend `CAP-PER-001` in one backward-compatible vertical slice so a caller may
provide structured source blocks while legacy `context` remains valid.

Minimum optional fields:

```text
sourceId
sourceType
observedAt
reliability
```

Each produced `V3Evidence` keeps its unique record ID and also retains those
source fields. Multiple evidence records from one source share `sourceId`.
No Runtime persistence, downstream confidence formula, contradiction formula,
Condition ranking, or Executive Assessment change belongs in this first
experiment.

Expected files:

- `engine/types.ts`
- `engine/v3/types.ts`
- `engine/v3/evidence.ts`
- one focused Evidence Ingestion regression
- Judgment Lab provenance fixture/adapter

Expected immediate ablation improvement:

- the pipeline can distinguish exact duplicate records from independent A04
  and A11 sources;
- weakened and stale variants become structurally distinguishable;
- ancestry can reach a stable originating source;
- no claim is made yet that downstream judgment will respond correctly.

Why this is the smallest safe experiment:

- all broader options require these semantics;
- CAP-PER-001 is the established owner;
- optional fields preserve existing callers;
- keeping the first experiment at ingestion makes migration behavior and
  determinism independently testable;
- it avoids mixing source preservation with confidence-policy changes.

Rollback conditions:

- legacy context output changes when structured sources are absent;
- evidence record ordering becomes nondeterministic;
- source identity differs across repeated ingestion;
- Atlas or Ground Truth output changes before downstream consumption is
  authorized;
- Runtime receives new persisted fields;
- source IDs are derived from mutable text when a stable caller ID exists.

Intentionally out of scope:

- confidence formulas;
- recency decay formula;
- source-group aggregation policy;
- contradiction penalties;
- diagnostic-strength scoring;
- Condition or Executive Assessment ranking;
- Runtime migration;
- historical backfill;
- governance or authorization semantics;
- Sprint 110.

## Classification

**C — SCHEMA OR RUNTIME MIGRATION REQUIRED**

More precisely, a backward-compatible canonical input and `V3Evidence` schema
migration is required; a Runtime migration is not yet required.

The production deficiency is proven and the ownership boundary is clear, but
the minimum semantics do not exist in the current canonical input or evidence
object. Implementing weighting first would infer provenance from text, create
unstable grouping, or duplicate CAP-PER-001 responsibility downstream.

## Exactly one next action

Authorize the optional structured evidence-provenance envelope experiment at
`CAP-PER-001`, with legacy-input equivalence and zero downstream behavior
change as hard gates.
