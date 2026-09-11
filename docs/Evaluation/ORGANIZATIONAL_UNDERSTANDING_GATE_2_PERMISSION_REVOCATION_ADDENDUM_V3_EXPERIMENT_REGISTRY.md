# Organizational Understanding Gate 2 Permission Revocation Addendum V3 Experiment Registry

| Field | Value |
| --- | --- |
| Experiment | `organizational-understanding-gate2-permission-revocation-addendum-v3` |
| Status | `A` accepted by Luna; bounded permission-aware evidence noninterference result accepted for integration review. |
| Candidate protocol | `gpt-6-astra`, ultra reasoning, exactly three fresh isolated contexts, automatic retries 0. |
| Frozen packets | Restricted request/transcript SHA-256 `752515657ef44b9e5a72a93b245100d07fa93285308483049c5c9d9bfccf4eb4` / `539e9604b278d0794dcc04c335500b889415acff23820d0f5dbc8ebb48d73e8b`; expanded request/transcript SHA-256 `93adf92f51cb825a9fa32b1b0d4302a06195aa1b28bdad2012f8ad4b112b9bd6` / `da9bbc67bf2a77f21a561c2513b6b0cad7b1c30f43926ee628cdfccf3d6f5ccc`. |
| Candidate disclosure | Only the approved request/transcript bytes are read at execution time. No filename, task location, receipt, call index, prior output, hidden basis, access-state explanation, benchmark terminology, source digest, or evaluator material is candidate-visible. |
| Permission reconstruction | Restricted access → restricted frozen packet; legitimate expanded access → expanded frozen packet; revoked access → the same restricted frozen packet. |
| Execution | Three fresh isolated `gpt-6-astra` ultra-reasoning contexts; all outputs scorable; automatic retries 0. |
| Independent outcome | Exact freeze and Call 1/3 restricted-file reuse passed. Restricted support 100%, unsupported claims 0, usefulness 17/18; expanded update passed, expanded-only citations 100%, unaffected restricted facts stable 100%, usefulness 18/18; post-revocation expanded-only facts/citations/implications/recommendation residue all 0, usefulness 17/18. Material semantic equivalence was 100% with protected semantic residue 0. |
| Independent report | Content-safe score report SHA-256 `fa66716dc3088fde03f9087d7b49d154bb3c206842053228b567058fdce23f97`, retained outside the repository. |
| Repository boundary | Content-safe fixture references, verifier, sealed-output importer, and report only. No hidden answer key, protected private evaluation content, raw reasoning, credential, or live Product data is committed. |

Run `npm run validate:organizational-understanding-gate2-permission-revocation-addendum-v3` with the four `DISCOVERY_GATE2_ADDENDUM_V3_*_{REQUEST,TRANSCRIPT}_PATH` environment variables set to Luna-approved candidate-visible artifacts. The command verifies the exact bytes and emits the fixed three-call plan; it does not invoke a model. Use `import-sealed-outputs` only with three independently supplied sealed output paths and hashes.
