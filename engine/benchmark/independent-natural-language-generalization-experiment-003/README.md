# Independent Natural Language Generalization Experiment 003

## Objective

This benchmark attempts to falsify the causal-formation capability demonstrated
in Refinement Experiment 002. It evaluates the exact unchanged producer against
substantially different organizational language. It does not improve, tune, or
patch the producer.

## Experimental boundary

Every scenario begins with raw distributed Evidence and runs through the same
unchanged production-shadow cognition path. The candidate producer is imported
directly from Experiment 002. Registration occurs before scoring truth is used.

The additive regression corpus replays all 36 controlled Experiment 002 cases.
The independent-language corpus contains:

- 24 positive variants across six causal families;
- 9 difficult negative controls;
- 10 writing styles;
- 6 industries;
- 24 terminology sets.

Styles include executive email, Slack, meeting notes, customer interviews,
board summaries, standups, finance commentary, HR observations, operational
reports, and fragmented bullets. Language includes direct and indirect claims,
hedging, political blame, incomplete statements, pronouns, shorthand, passive
voice, and limited sarcasm.

## Independence limitation

The corpus was independently phrased for this evaluation and does not reuse the
controlled benchmark grammar. It was not collected from independently recruited
human authors. The benchmark therefore tests language-form independence, not
population-level human-author independence.

## Evaluation

The harness measures qualification precision and recall, topology and mediator
recovery, alternative/implication/falsification recovery, writing-style,
industry, and terminology invariance, confidence calibration, and deterministic
ordering. Baselines include best silo, generic summarization, and Full Canonical
Combined production cognition.

## Run

```bash
npx tsx engine/benchmark/independent-natural-language-generalization-experiment-003/runIndependentNaturalLanguageGeneralizationExperiment003.ts
```

## Interpretation rule

The controlled regression must pass. Any natural-language loss is diagnosed,
not repaired. Passing negative controls cannot compensate for failure to recover
positive cases.
