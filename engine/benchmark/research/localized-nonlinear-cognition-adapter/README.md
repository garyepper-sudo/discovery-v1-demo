# Localized Nonlinear Cognition Research Adapter

This benchmark-only adapter maps the immutable results of Localized Nonlinear
Cognition Experiment 001 into the Organizational Understanding Research
Framework.

It reads:

```text
engine/benchmark/localized-nonlinear-cognition-experiment-001/RESULTS.json
```

It writes:

```text
RESULT.json
RESEARCH_REPORT.md
```

The adapter copies existing numerical measures, attaches stable source-artifact
references, and adds bounded qualitative research interpretations. It does not
rerun or rescore the source experiment.

Future adapters should follow the same narrow pattern:

1. preserve the native experiment result as the source of truth;
2. validate every referenced artifact or JSON pointer;
3. distinguish direct measurements from derived interpretations;
4. mark unsupported dimensions `not-measured`;
5. report all readiness gates;
6. produce exactly one canonical research decision;
7. avoid shared runners, production types, or synthetic aggregate scores.

Run:

```bash
npm run benchmark:research:localized-nonlinear-adapter
```
