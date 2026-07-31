# Expected Explanation Discrimination Experiment 001

**Status:** Benchmark-only research

This experiment compares three deterministic Evidence-acquisition strategies
over shadow explanation spaces derived from existing Judgment Lab scenario
families:

1. highest confidence gain;
2. highest Expected Understanding Gain proxy;
3. highest Expected Explanation Discrimination.

Run:

```bash
npx tsx engine/benchmark/research/expected-explanation-discrimination-experiment-001/runExperiment.ts
```

The experiment imports no production cognition and modifies no existing
benchmark. Source benchmark scenario identities are retained in every result.
Candidate selection sees only preregistered cost, utility, confidence, and
predicted-outcome fields. Observed effects and correct explanations are hidden
from strategy scoring and used only by the evaluation harness.

See `RESEARCH_REPORT.md` for results, limitations, and the ownership
recommendation.
