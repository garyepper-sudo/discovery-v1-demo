# Discovery Startup Snapshot

**Phase boundary:** architecture discovery is substantially complete for the complete backend workflow vision. The current phase is contract implementation and product validation.

Discovery is a governed organizational learning and intelligence system. It continuously improves organizational understanding, then supports governed action through objectives, context, decisions, outcomes, and learning.

## Canonical loops

```text
Current Organizational Understanding
→ material uncertainty
→ governed learning action
→ authorized information
→ Evidence admission
→ updated Organizational Understanding
```

```text
Organizational Understanding + governed Organizational Objective
+ Optimization Context + meaningful alternatives
→ Objective Recommendation → Decision → Outcome → Learning
→ updated Organizational Understanding
```

Understanding Recommendations improve what the organization knows. Objective Recommendations improve what the organization is trying to achieve. They are distinct purposes with distinct eligibility.

## Status

Implemented and committed: governed Google Drive retrieval; durable Questions; Answer lifecycle and Answer-owned Confidence; Unknown identity/lifecycle; Confidence-Improvement authorization and receipts; Understanding Recommendations; dual Recommendation purpose and Objective Recommendation eligibility.

Designed and benchmark-supported, not implemented: Objective and Optimization Context persistence; Objective Discovery; Objective Recommendation generation; Material Information Acquisition; bounded Recommendation forecasting.

Material Information Acquisition passed synthetic calibration but requires read-only live shadow calibration before implementation. Generalized burden, value, reliability, cost, delay, and stopping remain uncalibrated in real workflows.

`/product-alpha` is an isolated fixture/live development sandbox through the canonical adapter. It is not the final UX, not daily-use ready, and not promoted. `/your-organization` remains the existing compatibility experience. Final frontend wiring follows completion and acceptance of the backend workflow.

Local OAuth credentials, connector state, development Runtime, Clerk state, and PostgreSQL values remain external and uncommitted. No Production or Atlas change is part of this handoff.

## Immediate work

1. Implement Organizational Objective and Optimization Context contracts together.
2. In parallel, run read-only Material Information Acquisition live shadow calibration.
3. Do not begin Objective Recommendation generation or final frontend wiring yet.
