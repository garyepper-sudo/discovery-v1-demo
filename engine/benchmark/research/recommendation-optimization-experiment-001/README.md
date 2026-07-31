# Recommendation Optimization Experiment 001

## Status

Benchmark-only research. This directory is not exported by production code and
does not implement the Product Recommendation lifecycle.

## Question

What is the smallest input that permits a coherent, trustworthy Product
Recommendation while holding organizational understanding constant?

## Isolation

The experiment uses eight synthetic organizations, fixture-owned understanding,
objective, action, constraint, and optimization inputs. It performs no Runtime,
ProductQuestion, connector, frontend, persistence, or Production operation.
Executive Recommendation, Simulation, and Optimization artifacts informed the
vocabulary but are not mutated or promoted.

## Design

- Six organizational situations and two negative controls.
- Conditions A–L cover unknown, inferred, confirmed, conflicting, wrong, and
  corrected objectives plus one-parameter sensitivity.
- Understanding-first, objective-first, balanced, and custom Lab profiles.
- Fixed platform invariants: authorization, governance, evidence integrity,
  truthful uncertainty, immutable history, isolation, no fabricated Confidence,
  no automatic Decision, and no unsupported forecast certainty.
- Qualitative forecasts only, with explicit basis, dependencies, failure modes,
  and disconfirming signals.

## Result

Overall classification:

**C — Default optimizer can recommend without explicit objective in bounded
cases.**

The objective-free output is limited to reversible, low-cost, low-risk
understanding improvement using existing authorized Evidence. It is a
Confidence-Improvement Operation, not a business Recommendation.

### Phase 2C.2 taxonomy clarification

The safe objective-free outputs are now canonically named **Understanding
Recommendations**: non-persistent product projections of the existing
Confidence-Improvement proposals. They are not Objective Recommendations.
This clarification does not change the original synthetic scores or historical
classification. It makes explicit the two-purpose taxonomy supported by the
experiment; real organizational validation remains absent.

A business Recommendation requires at least:

1. fixed authorized organizational understanding;
2. one explicit objective, confirmed for high-stakes or irreversible action;
3. disclosed default optimization context;
4. material constraints and permissions;
5. action alternatives with evidence and tradeoff ancestry.

Low-confidence inferred objectives require confirmation. High-confidence
inference supports only conditional, reversible, bounded recommendations and
must remain visible. Conflicting objectives require comparison or priority
confirmation. Correcting an objective changes the Recommendation without
changing understanding.

The balanced optimizer is the strongest general baseline because it preserves
understanding value and reversibility without ignoring confirmed objective
progress. Risk tolerance, reversibility, evidence requirements, speed, cost,
and time horizon are materially relevant only when they alter action
eligibility or ranking. Cosmetic or non-material changes must not create a new
Recommendation identity.

Safe forecast dimensions are qualitative direction, bounded magnitude,
dependencies, failure modes, reversibility, learning value, and downside
exposure. Numeric outcome size, probability, timing precision, and causal effect
remain unsupported and deferred.

## Limitations

Results come from deterministic synthetic fixture grammar. Scores demonstrate
internal coherence and safety behavior, not external validity, causal accuracy,
or willingness to pay. No real user, organization, Recommendation, Decision, or
Outcome was used. Forecast calibration remains ordinal and must not be treated
as Production performance.

## Supported next step

**DESIGN BOTH OBJECTIVE AND OPTIMIZATION CONTEXT CONTRACTS**

This is a design recommendation only. Neither contract is implemented here.
