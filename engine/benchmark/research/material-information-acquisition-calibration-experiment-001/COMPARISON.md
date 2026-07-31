# Calibration Comparison

The runner emits exact per-strategy and holdout metrics. Baselines cover current Phase 2C ranking, fixed priority, information-only, organizational-value-only, lowest burden, and a human-style heuristic. Treatments cover the contract order and the contract with governed stopping.

Calibration and validation fixtures are separate from 24 held-out scenarios. Attribute, ordering, stopping, tie, and incomparability challenges in holdout prevent tuning against the same examples. Ten sequential scenarios prove that every prior candidate becomes stale after a revision and that no action is repeated or preplanned.

On holdout, strategy H reached 1.000 correct selection, strategy G 0.958, and the Phase 2C baseline 0.708. The governed combination was the only tested stopping rule with 1.000 precision and 1.000 recall. The contract and information-first orders both reached 1.000; the contract order is retained because it preserves relevance and reliability as explicit tie-breakers rather than reducing the comparison to information alone.

The synthetic result supports a live shadow—not production action selection—because fixture counterfactuals cannot establish real organizational value or user burden.
