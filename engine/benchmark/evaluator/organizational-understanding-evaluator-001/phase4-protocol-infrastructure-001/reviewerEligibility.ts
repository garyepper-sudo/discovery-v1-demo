import { canonicalHash } from "../canonicalSerialization";
import { REVIEWER_ELIGIBILITY_VERSION, type ReviewerEligibilityAssessment, type ReviewerEligibilityInput } from "./contracts";

export function assessReviewerEligibility(input: ReviewerEligibilityInput): ReviewerEligibilityAssessment {
  const reasons = [
    !input.pseudonymous && "reviewer-not-pseudonymous",
    !input.trainingCompletionRef && "training-incomplete",
    !input.qualificationSetRef && "qualification-incomplete",
    !input.languageQualified && "language-qualification-missing",
    !input.reasoningLiteracyQualified && "reasoning-literacy-missing",
    !input.confidentialityAttestationId && "confidentiality-missing",
    !input.independenceAttestationId && "independence-attestation-missing",
    !input.conflictAttestationId && "conflict-attestation-missing",
    input.authoredGroundTruthCase && "ground-truth-author-conflict",
    input.unresolvedConflict && "unresolved-conflict",
    input.candidateGeneratorDeveloper && input.soleConfirmatoryAuthority && "candidate-generator-sole-authority",
    !input.organizationAuthorized && "organization-unauthorized",
    !input.packetAuthorized && "packet-unauthorized",
  ].filter((value): value is string => Boolean(value)).sort();
  const body = { ...input, assessmentVersion: REVIEWER_ELIGIBILITY_VERSION, disposition: reasons.length ? "ineligible" as const : "eligible" as const, reasons };
  const assessmentHash = canonicalHash(body);
  return { ...body, assessmentId: `reviewer-eligibility-${assessmentHash.slice(0, 24)}`, assessmentHash };
}

export function requireIndependentReviewers(assessments: ReviewerEligibilityAssessment[], minimum: number): void {
  if (assessments.length < minimum) throw new Error("Required reviewer count not met.");
  if (assessments.some((item) => item.disposition !== "eligible")) throw new Error("Ineligible reviewer rejected.");
  if (new Set(assessments.map((item) => item.reviewerId)).size !== assessments.length) throw new Error("Duplicate reviewer rejected.");
  if (new Set(assessments.map((item) => item.independenceAttestationId)).size !== assessments.length) throw new Error("Non-independent reviewer rejected.");
}
