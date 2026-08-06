# Scoring Robustness Validation 001

Independent evaluator validation for `GAP-D-005`.

This package imports the frozen evaluator read-only and measures whether it
scores meaning rather than wording, order, verbosity, terminology, formatting,
or treatment identity. It does not execute a comparative benchmark, modify the
evaluator, score Discovery superiority, or alter either prior validation.

All required thresholds are fail-closed. A failed validator intentionally exits
nonzero and prohibits External Comparative Validation 002.

