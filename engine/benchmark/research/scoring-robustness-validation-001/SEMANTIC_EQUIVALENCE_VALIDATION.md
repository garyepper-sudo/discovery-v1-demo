# Semantic Equivalence Validation

Agreement: **47.1%**

Maximum score variance: 0.156377

Mean score variance: 0.030990

Deterministic bootstrap 95% interval: [0.010948, 0.054007]

| Case | Dimension | Class | Score | Absolute variance | Result |
|---|---|---|---:|---:|---|
| paraphrase-plain | paraphrase | equivalent | 0.834538 | 0.156377 | FAIL — lexical-dependence |
| paraphrase-passive | paraphrase | equivalent | 0.969356 | 0.021558 | FAIL — lexical-dependence |
| ordering-reversed | ordering | equivalent | 0.990915 | 0.000000 | PASS |
| verbosity-concise | verbosity | equivalent | 0.990915 | 0.000000 | PASS |
| verbosity-expanded | verbosity | equivalent | 0.990915 | 0.000000 | PASS |
| terminology-plain | terminology | equivalent | 0.894767 | 0.096147 | FAIL — discovery-terminology-dependence |
| confidence-percentage-language | confidence | equivalent | 0.900000 | 0.090915 | FAIL — confidence-interpretation-failure |
| confidence-qualitative-language | confidence | equivalent | 0.989971 | 0.000943 | FAIL — confidence-interpretation-failure |
| evidence-order-reversed | evidence-ordering | equivalent | 0.990915 | 0.000000 | PASS |
| contradiction-endpoint-order | contradiction-ordering | equivalent | 0.990915 | 0.000000 | PASS |
| mechanism-plain | mechanism-wording | equivalent | 0.896538 | 0.094377 | FAIL — mechanism-interpretation-failure |
| uncertainty-inconclusive | uncertainty-wording | equivalent | 0.942386 | 0.048528 | FAIL — lexical-dependence |
| gap-plain | missing-evidence-wording | equivalent | 0.974248 | 0.016667 | FAIL — lexical-dependence |
| format-json-roundtrip | formatting | equivalent | 0.990915 | 0.000000 | PASS |
| anti-gaming-duplicates | anti-gaming | equivalent | 0.992241 | 0.001327 | FAIL — evaluator-bug |
| cross-treatment-discovery | cross-treatment | equivalent | 0.990915 | 0.000000 | PASS |
| cross-treatment-human | cross-treatment | equivalent | 0.990915 | 0.000000 | PASS |
| negative-agreement | negative-control | non-equivalent | 0.953415 | 0.037500 | PASS |
| negative-speculation | negative-control | non-equivalent | 0.953374 | 0.037541 | PASS |
| negative-hallucinated-confidence | negative-control | non-equivalent | 0.970005 | 0.020910 | PASS |
| negative-irrelevant-gap | negative-control | non-equivalent | 0.943295 | 0.047619 | PASS |
