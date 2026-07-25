# State-Dependent Causal Dynamics Experiment 001 — Benchmark Report

## Executive Summary

Classification:

```text
Static causal mechanisms remain the better supported model
```

The dynamic model improved held-out prediction and intervention targeting on
the five authored dynamic families, but falsely classified five of nine controls
as dynamic. The hypothesis therefore fails its precision gate. State-dependent
behavior remains promising but is not safely demonstrated.

## Positive-family results

| Family | Recovered behavior | Missing behavior |
|---|---|---|
| Customization → delivery variability | activated, threshold, amplified, saturated | none |
| Decision ambiguity → manager escalation | activated, threshold, amplified | none |
| Approval layers → decision latency | suppressed | none |
| Knowledge concentration → execution fragility | persistent | none |
| Exception volume → margin erosion | activated, threshold, saturated | amplified |

Dynamic-class precision within positive families was `1.00`; recall was
`0.923`. The missing amplification was appropriately conservative: upstream
volume and scarcity changed together, so the producer lacked an equal-upstream
contrast.

## Negative controls

Five controls were falsely labeled dynamic:

- static response → saturated;
- coincidental single jump → threshold and saturated;
- random fluctuation → threshold;
- false saturation → activated;
- false activation → threshold.

Correlation, common cause, reverse causality, and missing-state controls
abstained or were rejected.

Overall dynamic-edge precision was `0.50`, despite `1.00` edge recall. This
failure is decisive because elaborate response shapes cannot substitute for
repeated causal discrimination.

## Prediction

Mean absolute held-out error:

```text
Static model:  0.188
Dynamic model: 0.068
Improvement:   0.120
```

The dynamic model improved prediction in aggregate, especially under
suppression, persistence, and high-scarcity states. However, the same detection
rules overfit control fluctuations, so predictive improvement does not establish
a safe general model.

## Intervention targeting

The dynamic candidate recovered the varied state variable in `5/5` positive
families. This is more specific than targeting the static source node alone.
Because control precision failed, intervention improvement remains
benchmark-local and cannot support production targeting.

## Counterfactuals

- Removing activation flags removed activation classification.
- Removing high inhibiting states reduced the suppression evidence window.
- Reversing temporal order rejected dynamic interpretation.
- Duplicating Evidence did not change dynamic classes.
- Contradictory Evidence reduced confidence.

These tests passed, but they do not correct the control false positives.

## Thresholds, saturation, and adaptation

Threshold-like transitions were reproducible in intended positive families but
also appeared in random and coincidental controls. Saturation was reproduced in
two positives but also falsely detected in static and coincidental controls.
Historical persistence was correctly detected in one family without a control
false positive. More independent adaptation families are required before
calling adaptation a general dynamic law.

## Leakage and determinism

The producer contains no family lookup, expected-class import, held-out outcome,
or scoring-truth access. Every observation carries Evidence, artifact, and silo
lineage. Repeated runs and reversed scenario, Evidence, and silo order were
byte-identical.

## Final answers

1. **Static or state-dependent?** Static mechanisms remain better supported
   because dynamic specificity failed.
2. **Demonstrated classes:** None cleared the complete safety standard.
   Activation, amplification, suppression, threshold, saturation, and
   persistence showed positive-family signal.
3. **Unsupported:** Unknown behavior; safe general threshold and saturation
   discrimination; broad historical adaptation.
4. **Prediction improvement:** Yes, error improved by `0.120`.
5. **Intervention targeting improvement:** Yes on positives, but unsafe across controls.
6. **Threshold reproducibility:** Positive signal, insufficient specificity.
7. **Saturation reproducibility:** Positive signal, insufficient specificity.
8. **Activation reproducibility:** Positive signal, with a false-activation control failure.
9. **Historical adaptation:** One persistent family succeeded; generality not demonstrated.
10. **Consistent variables:** specialist utilization, executive workload,
    ownership clarity, historical adaptation, and resource scarcity in authored positives.
11. **Irrelevant variables:** controls did not establish reliable relevance;
    missing state correctly prevented inference.
12. **Prior emergence:** Dynamics may explain magnitude changes, but this run
    does not establish superiority over topology.
13. **Extend edges versus topology:** Not yet supported for production.
14. **Evidence state changes behavior:** Yes in controlled positives, not with
    adequate control precision.
15. **Insufficient state request:** Ask for repeated, temporally ordered
    observations at comparable upstream levels across both activating and
    inhibiting states, plus confounder and intervention-response evidence.

## Recommendation

Do not authorize production adoption. A further benchmark would need replicated
state contrasts, stronger coincidence/randomness rejection, and independent
held-out families before state-dependent edge behavior could supersede the
static model.
