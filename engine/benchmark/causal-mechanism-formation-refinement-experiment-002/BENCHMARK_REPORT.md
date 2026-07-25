# Causal Mechanism Formation Refinement Experiment 002 — Benchmark Report

## Executive Summary

Classification:

```text
A — Safe Generalization Demonstrated
```

Within the controlled grammar and topology matrix, the causal-formation
contract generalized without mechanism false positives. All 24 positive cases
qualified, all 12 controls remained unqualified, and explicit linear regression
performance remained intact. This is evidence for a wider benchmark contract,
not authorization for production adoption.

## Regression Results

All four explicit linear controls qualified with correct linear topology. The
prior insufficient-Evidence pattern remained unqualified. Mechanism precision
remained `1.00`.

## Implicit Linear Results

All six implicit linear cases formed the expected edges and qualified. Every
edge used two distinct support forms: temporal plus intervention response, or
cross-case contrast plus repeated transition. Temporal-only control edges
remained `supported-but-ambiguous` and could not qualify. Held-out implications
retained path-specific outcomes.

## Branching Results

All four explicit and three implicit branching cases preserved a shared
mediator, two independently supported branches, branch-specific lineage, one
implication per leaf, and branch-specific falsification. The one-strong-branch
control retained its valid path but did not invent or qualify the unsupported
branch.

## Converging Results

All four explicit and three implicit convergence cases preserved distinct
upstream contributors, a shared mediator, and a downstream path. Registered
implications named the supported contributors. Driver-removal ablations removed
the corresponding contribution rather than retaining it. The unsupported-driver
control preserved valid edges but did not qualify the extra contributor.

## Negative Controls

Zero of twelve controls qualified. Correlation, temporal sequence, common cause,
reverse causality, selection bias, repeated weak association, and dense
connectivity remained unresolved or rejected. False branching and convergence
could expose valid local edges without falsely satisfying topology
qualification.

## Alternative and Confounder Analysis

Evidence-authored alternatives were retained for comparison. Explicit
common-cause, reverse-causality, and selection-bias flags rejected or downgraded
candidates. Intervention response and controlled contrast counted as stronger
support than temporal order; temporal order alone never qualified.

## Counterfactuals

- Removing one implicit support form downgraded affected edges.
- Temporal reversal and common-cause addition rejected qualification.
- Branch removal preserved the remaining branch.
- Unsupported branches and drivers were excluded.
- Driver removal changed convergence membership.
- Redundancy did not add structural completeness.
- Complementarity preserved or completed the missing structure.
- Lineage removal prevented grounded qualification.
- Noise did not change topology.

Full per-case and per-ablation records appear in `RESULTS.json`.

## Recoverability

Linear candidates exposed path-specific predictions. Branching candidates
exposed branch-specific predictions and leverage points. Converging candidates
exposed contributor-sensitive predictions and contributor-specific leverage.
Qualified structures provided success and falsification signals. No production
Prediction or Intervention was created.

## Scores

| Measure | Result |
|---|---:|
| Mechanism precision | 1.00 |
| Mechanism recall | 1.00 |
| Mechanism false positives | 0 |
| Positive qualifications | 24/24 |
| Negative qualifications | 0/12 |
| Explicit linear | 4/4 |
| Implicit linear | 6/6 |
| Explicit branching | 4/4 |
| Explicit convergence | 4/4 |
| Implicit branching | 3/3 |
| Implicit convergence | 3/3 |

The controlled fixture result must not be generalized to unrestricted language.

## Determinism and leakage

Repeated execution and reversed scenario, Evidence, and silo ordering were
byte-identical. Production artifacts, implicit edges, topology, alternatives,
implications, falsification, guidance, counterfactuals, and `RESULTS.json`
remained stable.

Producer modules contain no scoring imports, future imports, semantic case IDs,
topology lookup, expected edge lookup, or scenario-specific rule. Nodes and
edges trace to raw Evidence and benchmark-local artifact identities.

## Minimal Safe Generalized Contract

The widest demonstrated contract is:

> Preserve the Experiment 001 explicit-linear standard; admit an implicit edge
> only when at least two independent fixed support forms agree and one is
> stronger than temporal order; classify topology from graph degree; require an
> incoming path before branching and a downstream path after convergence;
> preserve edge-level lineage; exclude unsupported branches and contributors;
> qualify only after alternative and confounder checks; register topology-aware
> implications and falsification before future Evidence.

## Architectural Recommendation

**Read-only candidate producer audit.** The controlled result is strong enough
to audit a production proposal boundary, but not to implement it. Before any
production adoption, independent natural-language fixtures must demonstrate
the same precision without bounded benchmark phrasing, alternative support must
be calibrated, and canonical regressions must remain unchanged.

## Required Final Answers

1. Explicit linear performance preserved: **yes, 4/4**.
2. Implicit mediation inferred safely: **yes within the bounded multi-signal grammar**.
3. Sufficient patterns: **temporal plus intervention response; contrast plus repeated transition**.
4. Misleading patterns: **temporal-only, correlation, shared context, selection-biased repetition**.
5. Temporal-only false positives: **none qualified**.
6. Explicit branching qualifies: **yes, 4/4**.
7. Explicit convergence qualifies: **yes, 4/4**.
8. Implicit branching/convergence qualifies: **yes, 3/3 each under bounded rules**.
9. Unsupported branches excluded: **yes**.
10. Unsupported contributors excluded: **yes**.
11. Branch-specific implications: **yes**.
12. Contributor-sensitive implications: **yes**.
13. Confounders and reverse causality detected: **yes when explicitly evidenced**.
14. Recall exceeded `0.75`: **yes, `1.00`**.
15. Precision acceptable: **yes, `1.00` mechanism precision**.
16. Prior false positive unqualified: **yes**.
17. Primary bottleneck: **unrestricted implicit-language interpretation and calibrated confounder adjudication**.
18. One unified producer safe: **only within this controlled contract**.
19. Minimal contract: **multi-signal edges plus structural topology and strict abstention**.
20. Next step: **read-only producer audit**.
21. Production requires independent-language replication, calibrated
    alternatives, stable canonical regressions, complete lineage, and no
    precision regression.
