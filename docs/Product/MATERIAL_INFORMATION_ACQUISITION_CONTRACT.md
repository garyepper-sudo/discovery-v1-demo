# Discovery Material Information Acquisition Contract

**Status:** Candidate-envelope and owner outcome-readiness infrastructure implemented; selector remains inactive and calibration-insufficient
**Contract version:** Design candidate 2
**Phase:** Research-to-Product, after Phase 2C and before production promotion
**Owner:** Product Workflow comparison; candidate and outcome truth remain with existing action owners
**Research evidence:** [MATERIAL_INFORMATION_ACQUISITION_RESEARCH_CANON.md](../Research/MATERIAL_INFORMATION_ACQUISITION_RESEARCH_CANON.md)

## 1. Purpose and canonical definition

Material Information Acquisition is:

> A governed, read-only selection capability that chooses the next eligible
> information-producing action expected to provide the greatest net material
> improvement in organizational understanding or downstream decision quality.

It compares, chooses, explains, and stops. It does not execute.

It is not the action, execution service, authorization authority, Evidence
admission authority, Unknown lifecycle owner, Objective Recommendation,
Decision, autonomous planner, or universal utility function.

The inactive selector generalizes the read-only proposal responsibility already defined
for Phase 2C `ProductImprovementAction`. Product Workflow is its single owner.
The result is recomputed from current authorized projections and is never
persisted independently.

The initial participating owner is Product Confidence Improvement. It now
projects a complete version-1 candidate envelope from structured owner inputs,
retains that immutable envelope in future version-3 human-choice events, and
records separately versioned owner outcome observations. Historical version-2
receipts remain valid and explicitly incomplete. This readiness infrastructure
does not activate selection, execution, connectors, or frontend behavior.

No Organization Runtime container, repository, database, or migration schema
changed. Product Workflow event contracts evolved additively through governed
v3 and outcome-observation events.

## 2. Existing-state ownership audit

| Concern | Existing owner | Maturity | Selector relationship |
| --- | --- | --- | --- |
| Material uncertainty and investigation priority | Canonical cognition; Product Unknown lifecycle preserves exact Question-scoped identity | Canonical / Phase 2B implemented | Read exact current projection; never recreate or reprioritize cognition |
| Candidate Understanding Recommendation | Product Workflow `ProductImprovementAction` and `ProductUnderstandingRecommendation` projection | Phase 2C implemented | Existing selector/projection boundary to generalize |
| Existing-Evidence inspection and comparison | Product Workflow proposal; canonical Evidence and cognition own meaning | Partial; inspect operation live-proven | Candidate owner supplies eligibility and estimate |
| Authorized connected-source search | Connector service and canonical adapter after exact authorization | Google Drive implemented and live-proven | Candidate envelope references operation; selector cannot search |
| Document request | Phase 2C action taxonomy; human/source workflow | Specified, execution unimplemented | Eligible only when an exact owner and target are available |
| Human question | Product interaction/onboarding surfaces plus exact authenticated identity | Partial | Contact/answer consent is action-specific; selector cannot impersonate or contact |
| Survey | No canonical execution owner | Deferred | Comparison shape supported; ineligible until an owner exists |
| Measurement | Decision/Outcome and connected-source owners where an exact measure exists | Partial / otherwise deferred | Owner supplies measure, cost, delay, reliability, and consent |
| Experiment | Existing Decision pipeline may own an explicitly committed experiment | Partial; no generic experiment service | Selector may propose only reversible, governed candidates from that owner |
| Monitoring | ProductQuestion monitoring state; continuous monitoring remains `GAP-C-005` | Partial / deferred | No autonomous monitor creation |
| Waiting for Outcome | Executive Decision and Review/Learning pipeline | Canonical; product operation incomplete | Outcome owner supplies due state and timing |
| Authorization | Canonical user/organization authorization and source/action policy | Canonical | Hard gate before comparison and again before execution |
| Execution | Action-specific connector, interaction, Decision, Review, or future governed owner | Distributed intentionally | Never transferred to selector |
| Cancellation, partial completion, failure | Action-specific lifecycle owner | Partial by action | Selector only marks its projection stale |
| Evidence admission | Canonical Evidence boundary and cognition | Canonical | Completed information has no authority until admitted |
| Understanding update | Canonical cognition and Runtime | Canonical | Read only after update; never mutate |
| Proposal authorization receipt | Product Confidence Improvement operation event | Implemented | Historical version-2 receipts remain incomplete; future governed choices use additive version-3 events with exact envelope lineage |
| Search/completion/no-change receipts | Connector or action-specific operation owner | Implemented for search and Phase 2C authorization; partial elsewhere | Referenced after execution; not duplicated |

### Resolved ownership collisions

- Investigation ranking remains upstream; the selector ranks acquisition
  actions for one exact material uncertainty and does not rank Unknowns.
- Expected canonical confidence gain remains upstream when supplied. The
  selector may derive bounded comparative information contribution but cannot
  replace that estimate or create Answer Confidence.
- Product Workflow owns selection language; action owners own execution facts.
- Authorization determines eligibility; it is never blended into value.
- Evidence admission and Understanding update remain downstream canonical
  owners even when the selector proposed the acquisition.

### Open implementation gaps

Survey execution, generic measurement acquisition, generalized experiment
execution, cancellation, and continuous monitoring do not yet have complete
product operation owners. Their action types remain valid contract shapes but
are ineligible until exact owners exist.

## 3. Input contract

```ts
type MaterialInformationAcquisitionInput = {
  contractVersion: "1";
  organizationId: string;
  questionId: string;
  understandingRevisionRef: string;
  materialUncertainty: {
    unknownId: string;
    unknownVersionRef: string;
    status: "open" | "targeted";
    investigationOpportunityRef: string | null;
  };
  purpose:
    | "improve-understanding"
    | "resolve-objective-ambiguity"
    | "resolve-optimization-ambiguity"
    | "improve-recommendation-eligibility"
    | "evaluate-decision"
    | "await-learning";
  candidates: MaterialAcquisitionCandidate[];
  budgetContext: MaterialAcquisitionBudgetContext;
  authorizationContextRef: string;
  governanceContextRefs: string[];
  evaluatedAt: string;
};
```

Essential fields are exact organization, Question, Understanding revision,
current Unknown version/status, purpose, candidates, bounded budgets,
authorization/governance references, and evaluation time.

`investigationOpportunityRef` is optional because objective or optimization
ambiguity may originate from an authorized product contract rather than a
canonical investigation opportunity. It must be present whenever upstream
investigation priority or expected gain is claimed.

The input references projections. It creates no copy of Understanding,
Unknowns, Objectives, permissions, Evidence, or Runtime state.

## 4. Common candidate envelope

```ts
type MaterialAcquisitionActionType =
  | "inspect-existing-evidence"
  | "compare-existing-evidence"
  | "search-authorized-source"
  | "ask-authorized-person"
  | "request-document"
  | "recommend-survey"
  | "recommend-measurement"
  | "recommend-experiment"
  | "monitor-signal"
  | "wait-for-outcome"
  | "stop"
  | "abstain";

type Estimate<T> =
  | {
      state: "available";
      value: T;
      sourceRef: string;
      qualification: string;
      maturity:
        | "synthetic"
        | "fixture-backed"
        | "owner-provided"
        | "outcome-calibrated";
    }
  | { state: "unknown"; reason: string }
  | { state: "not-applicable" }
  | { state: "permission-withheld" }
  | { state: "owner-unimplemented" }
  | { state: "unreliable"; reason: string }
  | { state: "deferred-until-execution" }
  | { state: "intentionally-undisclosed"; policyRef: string };

type MaterialAcquisitionCandidate = {
  candidateId: string;
  actionType: MaterialAcquisitionActionType;
  actionOwnerRef: string;
  target: { kind: string; targetRef: string; organizationId: string };
  uncertaintyRef: string;
  materialEffectTargets: Array<
    "unknown" | "answer" | "objective" | "recommendation" | "decision"
  >;
  eligibility: {
    ownerAvailable: boolean;
    targetAccessible: boolean;
    executionAvailable: boolean;
    authorizationSatisfied: boolean;
    governanceAllowed: boolean;
    consentState: "not-required" | "required" | "granted" | "declined" | "unknown";
    reasonCodes: string[];
  };
  expectedInformationContribution: Estimate<"low" | "moderate" | "high">;
  expectedOrganizationalRelevance: Estimate<"low" | "moderate" | "high">;
  expectedDiscriminationGain: Estimate<"low" | "moderate" | "high">;
  burden: Estimate<"low" | "moderate" | "high">;
  cost: Estimate<"none" | "low" | "moderate" | "high">;
  delay: Estimate<"immediate" | "short" | "material" | "unknown">;
  reliability: Estimate<"low" | "moderate" | "high">;
  existingEvidenceQuality: Estimate<"low" | "moderate" | "high">;
  reversibility: Estimate<"reversible" | "partially-reversible" | "irreversible">;
  stoppingCondition: string;
  expectedEvidenceLineage: {
    sourceKind: string;
    sourceScopeRef: string;
    admissionRequired: true;
  } | null;
};
```

The shared envelope is a comparison contract. It does not force connector,
survey, measurement, experiment, human-contact, or Outcome owners into one
execution contract.

Candidate identity is deterministic from organization, Question, current
Understanding revision, exact Unknown version, action type, action owner, and
target. It is projection identity, not durable lifecycle identity.

## 5. Attribute-ownership matrix

| Attribute | Canonical owner | Read | Derive | Persist |
| --- | --- | ---: | ---: | ---: |
| Organization and Question identity | ProductQuestion / authorization boundary | Yes | No | No |
| Understanding revision | Organizational Understanding projection | Yes | No | No |
| Unknown identity, version, status | Product Unknown lifecycle | Yes | No | No |
| Investigation priority | Canonical investigation opportunity | Yes | No | No |
| Purpose | Requesting Product Workflow operation | Yes | Validate only | No |
| Action type and owner | Action-specific owner registry/contract | Yes | No | No |
| Exact target and accessibility | Action owner plus authorization | Yes | Compose | No |
| Authorization | Authorization layer | Yes | No | No |
| Governance prohibition | Governance/policy owner | Yes | No | No |
| Consent requirement/state | Action-specific execution owner | Yes | No | No |
| Source reliability | Evidence/source or measure owner | Yes | Bounded ordinal projection | No |
| Existing Evidence quality | Canonical Evidence/Understanding projection | Yes | Bounded comparison only | No |
| Upstream expected confidence gain | Canonical investigation opportunity | Yes | No | No |
| Expected information contribution | Product Workflow selector | Inputs | Yes, qualified ordinal | No |
| Expected discrimination gain | Canonical opportunity when present; otherwise selector from owned inputs | Yes | Qualified ordinal | No |
| Expected organizational relevance | Selector with exact Question/Objective/Decision context | Inputs | Yes, qualified ordinal | No |
| User burden | Action owner; selector may estimate only when disclosed | Yes | Qualified ordinal | No |
| Monetary/API/operational cost | Action owner or exact budget policy | Yes | Normalize only | No |
| Delay | Action/Outcome owner | Yes | Normalize only | No |
| Reversibility and disruption | Action or Decision owner | Yes | Normalize only | No |
| Budget limits | Question request, action owner, Optimization Context, or governance policy according to concern | Yes | Remaining allowance only | No |
| Action eligibility | Action owner + authorization + governance + consent | Yes | Compose as hard gate | No |
| Dominance, tie, and comparison result | Product Workflow selector | Inputs | Yes | No |
| Explanation | Product Workflow selector from comparison trace | Inputs | Yes | No |
| Action initiation | Action-specific execution owner | No | No | No |
| Cancellation and partial completion | Action-specific lifecycle owner | Read after event | No | No |
| Completion/no-change/failure receipt | Existing operation owner | Yes | No | No |
| Evidence admission | Canonical Evidence boundary | Read result | No | No |
| Understanding update | Canonical cognition | Read later revision | No | No |

No material attribute has two authoritative owners. Where the selector derives
an ordinal projection, it must retain all source references and qualification.

## 6. Hard eligibility gates

An action is removed before comparison when any of these apply:

- organization or Question scope does not match exactly;
- Understanding revision or Unknown version is stale;
- Unknown is resolved, retired, or superseded;
- action owner is unavailable or unimplemented;
- target is inaccessible;
- authorization is absent, denied, or expired;
- governance prohibits the action or stakeholder impact;
- required consent is absent, unknown, or declined;
- execution capability is unavailable;
- action type is unsupported;
- minimum owner-defined reliability is absent or failed;
- harm, privacy exposure, operational disruption, or irreversibility exceeds
  policy;
- required budget is unavailable or exhausted.

Ineligible actions receive no low score. They are not candidates. The result
may explain their exclusion without disclosing protected details.

Proposal eligibility never implies execution consent. Authorization to view,
search, contact, survey, measure, experiment, disrupt operations, or spend is
separate and action-specific.

## 7. Missing-value behavior

| Missing state | Contract behavior |
| --- | --- |
| Truly unknown | Preserve unknown; block comparison when material, otherwise disclose and lower confidence in ranking |
| Not applicable | Remove dimension from that candidate without benefit or penalty |
| Permission-withheld | Candidate is ineligible; do not disclose protected value |
| Owner unimplemented | Candidate is ineligible |
| Unreliable estimate | Preserve limitation; candidate cannot dominate on that dimension |
| Deferred until execution | Permitted only for post-execution facts, never eligibility, consent, material cost, or harm |
| Intentionally undisclosed | Apply policy gate; disclose only that ranking is bounded |

Missing authorization, governance, consent, scope, owner, target, reliability
minimum, material cost, or material harm blocks eligibility. Missing estimates
on non-safety dimensions can produce a tie, one discriminating context
question, or abstention. Favorable defaults are prohibited.

## 8. Net material comparison

The canonical model is ordinal and lexicographic, not a scalar utility.
Information contribution and discrimination gain form one epistemic-benefit
comparison; they are not added as independent value and cannot double-count the
same expected effect:

1. Apply all eligibility gates.
2. Remove actions whose information cannot materially affect Understanding,
   eligibility, a Recommendation, Decision, or Learning state.
3. Remove strictly dominated actions: no better on any material benefit or
   constraint and worse on at least one, without a compensating distinction.
4. Compare information contribution, organizational relevance, and
   discrimination against reliability and existing Evidence quality.
5. Compare burden, cost, delay, reversibility, and disruption under their exact
   budgets and policies.
6. Select only when one candidate materially dominates after these comparisons.
7. Preserve material ties and incomparable candidates.

Raw uncertainty reduction ranks low when it cannot change current meaning or a
governed downstream choice.

### Clear winner

One eligible candidate materially dominates and becomes `selected-action`.

### Material tie

Preserve every tied candidate. Explain the tradeoff. Ask one preference or
context question only when its answer can materially distinguish them.

### Incomparable candidates

Return the bounded comparison and either one discriminating question or
`abstain/incomparable-actions`. Never invent the missing value.

Input order and wording cannot break ties. Stable canonical identifiers provide
deterministic ordering only for display, never winner fabrication.

## 9. Budgets and stopping

No universal organization settings object is introduced.

| Budget | Owner |
| --- | --- |
| Question/contact burden | Question-specific acquisition request and user consent |
| Money, API usage, connector scope | Action owner plus governance policy |
| Elapsed time and urgency | Question/Decision context; preference may come from Optimization Context |
| Operational disruption and experiment risk | Decision/action owner and governance policy |
| Privacy exposure | Authorization and source policy |
| Survey fatigue | Survey owner plus participant consent policy |
| Evidence/review volume | Question request and review-capacity policy |

`OptimizationContext` may supply governed preferences for Objective-related
comparison but cannot override hard authorization, consent, safety, or owner
budgets.

Stopping is valid when Understanding is sufficient; no action has sufficient
net material value; gain is below burden/cost; uncertainty cannot affect a
governed choice; a current Outcome must arrive first; authorization is
unavailable; remaining sources are unreliable; budget is exhausted; or the
user declines. There is no universal numeric threshold. A stop requires the
governed combination of exact sufficiency, a declared material-effect target,
reliability, and burden/cost in the current context. Until live calibration
exists, borderline comparisons preserve a tie or abstain rather than applying
a favorable default.

## 10. Result contract

```ts
type MaterialInformationAcquisitionResult =
  | {
      kind: "selected-action";
      selectionId: string;
      selected: MaterialAcquisitionCandidateProjection;
      alternatives: MaterialAcquisitionAlternativeProjection[];
      explanation: MaterialAcquisitionExplanation;
    }
  | {
      kind: "material-tie";
      selectionId: string;
      candidates: MaterialAcquisitionCandidateProjection[];
      discriminatingQuestion: string | null;
      explanation: MaterialAcquisitionExplanation;
    }
  | {
      kind: "stop";
      selectionId: string;
      reason:
        | "understanding-sufficient"
        | "insufficient-net-value"
        | "awaiting-outcome"
        | "budget-exhausted"
        | "remaining-actions-unreliable"
        | "user-declined";
      explanation: MaterialAcquisitionExplanation;
    }
  | {
      kind: "abstain";
      selectionId: string;
      reason:
        | "no-authorized-action"
        | "governance-blocked"
        | "missing-material-input"
        | "incomparable-actions"
        | "selector-unsupported";
      explanation: MaterialAcquisitionExplanation;
    };
```

`selectionId` is a deterministic projection identifier, not a durable receipt.
Every explanation names the uncertainty, why this action/now, why material
alternatives did not win, expected contribution, limitations, authorization or
consent still required, and stopping condition.

## 11. Execution, receipts, and cancellation

The selector never initiates or cancels work.

- Historical Phase 2C version-2 authorization receipts remain valid but do not
  imply a complete candidate envelope. Future governed Product Confidence
  Improvement choices retain the exact owner-projected envelope in additive
  version-3 events.
- Owner-specific outcome observations distinguish authorization, decline,
  start, cancellation, completion, failure, information production, Evidence
  admission, and exact Unknown/Answer/Understanding revisions. They make no
  causal-improvement claim from completion alone.
- Connector search receipts own source scope, retrieval, citations, and
  completion.
- Decision/experiment and Outcome/Review owners retain their receipts.
- Future survey, measurement, document-request, contact, and monitoring owners
  must define their own initiation, cancellation, partial completion, failure,
  and no-change receipts before becoming eligible.
- Evidence admission records exact admitted lineage. A completion receipt alone
  never resolves an Unknown or updates Understanding.

A durable generic selection receipt is currently unjustified. A future optional
snapshot may be referenced by a Decision for exact rationale replay only if
existing proposal and action receipts prove insufficient. It must never own an
action lifecycle.

Authorized-but-not-initiated, cancelled, partial, unavailable, superseded, or
no-longer-useful actions remain owned by their action lifecycle. The selector
simply stops projecting a stale candidate after current-state recomputation.

## 12. Sequential re-evaluation

```text
select one action
→ obtain exact action-specific authorization/consent
→ action owner executes
→ completion/no-change/failure receipt
→ canonical Evidence admission where applicable
→ canonical Understanding update or explicit no-change
→ invalidate every prior candidate projection
→ recompute from the new revision
```

No autonomous multi-step plan is produced. A second action is selected only
after the prior result is evaluated. Explicitly independent actions still
require separate selection, authorization, execution ownership, and receipts.

## 13. Calibration boundary

Ordinal rules may begin in fixtures for eligibility, hard gates, dominance,
ties, obvious burden/cost bands, and deterministic stopping. Before production,
live and outcome-backed validation must calibrate:

- expected information contribution and discrimination;
- expected organizational relevance;
- user burden and acceptance;
- cost and delay estimates;
- source/action reliability;
- stopping thresholds;
- ranking and paraphrase stability;
- actual Unknown reduction;
- later Answer, Recommendation, and Decision-quality effects.

Synthetic scores, confidence-gain points, or ordinal labels are never presented
as probabilities, guarantees, monetary value, or calibrated utility.

## 14. Practical workflows

### Weekly seller survey

For compensation versus lead-quality uncertainty, authorized CRM inspection
and period comparison dominate while they can discriminate. A weekly survey is
eligible only after existing Evidence is insufficient, the survey owner exists,
participant consent is valid, burden and cost fit policy, and the expected
contribution is material. The result proposes the survey and its stopping
condition; it creates no survey.

### Objective ambiguity

Strategy and Decision inspection may create hypotheses but cannot establish
authority. Asking an authorized leader wins when it is the only action able to
resolve governing meaning. A vague Objective never becomes active by ease or
frequency.

### Awaiting Outcome

When a committed Decision already tests the uncertainty and an authorized
Outcome is due within the material horizon, waiting may dominate duplicate
collection. If delay would destroy value, a governed measurement may win.

### No valuable action

When eligible actions cannot change Understanding or a downstream choice,
return `stop/insufficient-net-value`. When no action is authorized or safely
comparable, return the appropriate abstention.

## 15. Validator-ready acceptance scenarios

1. Existing authorized Evidence dominates a survey.
2. Existing Evidence is exhausted and a low-burden survey wins.
3. Survey burden exceeds expected value.
4. High-value authorized-person question wins.
5. Person contact without consent is ineligible.
6. Unauthorized search target is removed before comparison.
7. Reliable measurement loses when delay is materially excessive.
8. Informative irreversible or unsafe experiment is ineligible.
9. Waiting for a governed Outcome wins.
10. Waiting loses when delay worsens material value.
11. Sufficient Understanding returns stop.
12. All actions governance-blocked returns abstain.
13. Materially tied actions remain tied.
14. Strictly dominated action is excluded.
15. Missing material values yield bounded incomparability.
16. Low-quality Evidence need not be exhausted first.
17. Repeated user question has no new value.
18. Objective ambiguity selects authority resolution.
19. Optimization ambiguity selects one material preference question.
20. Understanding revision change makes all candidates stale.
21. Unknown resolution before authorization invalidates selection.
22. Exhausted budget returns stop.
23. User decline returns stop without action.
24. Completed action with no new Evidence preserves the Unknown unless
    canonical reevaluation resolves it.
25. Duplicate Evidence does not create improvement.
26. New but immaterial information creates no false update.
27. Material information may change Answer eligibility only through canonical
    Product Workflow.
28. Material information may change Objective Recommendation eligibility only
    through exact Objective/Optimization contracts.
29. Restricted stakeholder impact is governance-gated.
30. Paraphrases preserve selection.
31. Candidate input ordering preserves result and display ordering.
32. Organization and Question isolation fail closed.
33. No autonomous follow-on action occurs.
34. Selection creates no Runtime write.
35. Existing Phase 2C receipt remains execution-authorization owner.
36. Unsupported future action type fails safely.

## 16. Promotion and kill gates

Promotion requires focused fixtures for all scenarios above, calibration
evidence, exact owner availability for every enabled action, no Runtime write
during selection, authorization before any protected read, and no duplicate
receipt or lifecycle authority.

Stop implementation if the selector must duplicate Unknown/Evidence ownership,
action types cannot share the envelope, execution ownership becomes ambiguous,
authorization becomes a score, missing values require favorable defaults, a
universal scalar becomes necessary, autonomous planning is required, or
existing receipts cannot preserve auditability.
