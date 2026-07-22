import type { JudgmentLabOutput, SyntheticEvidenceArtifact, SyntheticOrganizationSpec } from "./contracts";

export type MetamorphicRelation =
  | "document-order"
  | "duplicate-evidence"
  | "evidence-removal"
  | "terminology-change"
  | "department-renaming"
  | "industry-substitution";

export type MetamorphicCase = {
  id: string;
  relation: MetamorphicRelation;
  artifacts: SyntheticEvidenceArtifact[];
  organization: SyntheticOrganizationSpec;
  removedArtifactIds: string[];
};

export type MetamorphicExpectation = "invariant" | "sensitive";

export type MetamorphicResult = {
  caseId: string;
  relation: MetamorphicRelation;
  expectation: MetamorphicExpectation;
  changed: boolean;
  passed: boolean;
  baselineSignature: string;
  variantSignature: string;
};

export const metamorphicExpectations: Record<MetamorphicRelation, MetamorphicExpectation> = {
  "document-order": "invariant",
  "duplicate-evidence": "invariant",
  "evidence-removal": "sensitive",
  "terminology-change": "invariant",
  "department-renaming": "invariant",
  "industry-substitution": "invariant",
};

const replace = (value: string, replacements: Record<string, string>): string =>
  Object.entries(replacements).reduce(
    (result, [source, target]) => result.replace(new RegExp(`\\b${source}\\b`, "gi"), target),
    value,
  );

export function buildMetamorphicCase(params: {
  relation: MetamorphicRelation;
  artifacts: SyntheticEvidenceArtifact[];
  organization: SyntheticOrganizationSpec;
  decisiveEvidenceIds?: string[];
}): MetamorphicCase {
  const { relation } = params;
  let artifacts = params.artifacts.map((artifact) => ({ ...artifact }));
  let organization = { ...params.organization };
  let removedArtifactIds: string[] = [];

  if (relation === "document-order") artifacts.reverse();
  if (relation === "duplicate-evidence" && artifacts[0]) {
    artifacts.push({ ...artifacts[0], id: `${artifacts[0].id}-duplicate`, title: `${artifacts[0].title} duplicate` });
  }
  if (relation === "evidence-removal") removedArtifactIds = [...(params.decisiveEvidenceIds ?? [])].sort();
  if (relation === "terminology-change") artifacts = artifacts.map((artifact) => ({ ...artifact, content: replace(artifact.content, { approval: "authorization", escalation: "referral" }) }));
  if (relation === "department-renaming") artifacts = artifacts.map((artifact) => ({ ...artifact, content: replace(artifact.content, { Finance: "Business Control", Operations: "Delivery", Product: "Portfolio" }) }));
  if (relation === "industry-substitution") organization = { ...organization, industry: "Substituted benchmark industry" };

  return { id: `metamorphic-${relation}`, relation, artifacts, organization, removedArtifactIds };
}

export function stableJudgmentSignature(output: JudgmentLabOutput): string {
  return JSON.stringify({
    dominantUnderstanding: output.dominantUnderstanding,
    primaryConstraint: output.primaryConstraint,
    causalMechanisms: output.causalMechanisms,
    recommendation: output.recommendation,
    confidence: output.confidence,
    uncertainty: output.uncertainty,
  });
}

export function evaluateMetamorphicRelation(params: {
  testCase: MetamorphicCase;
  baseline: JudgmentLabOutput;
  variant: JudgmentLabOutput;
}): MetamorphicResult {
  const expectation = metamorphicExpectations[params.testCase.relation];
  const baselineSignature = stableJudgmentSignature(params.baseline);
  const variantSignature = stableJudgmentSignature(params.variant);
  const changed = baselineSignature !== variantSignature;

  return {
    caseId: params.testCase.id,
    relation: params.testCase.relation,
    expectation,
    changed,
    passed: expectation === "invariant" ? !changed : changed,
    baselineSignature,
    variantSignature,
  };
}
