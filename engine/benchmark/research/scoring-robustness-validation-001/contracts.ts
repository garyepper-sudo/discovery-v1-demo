import type { CaseScore, ComparativeTreatmentOutput } from "../external-comparative-validation-001/types";

export type RobustnessDimension =
  | "paraphrase" | "ordering" | "verbosity" | "terminology"
  | "confidence" | "evidence-ordering" | "contradiction-ordering"
  | "mechanism-wording" | "uncertainty-wording" | "missing-evidence-wording"
  | "formatting" | "anti-gaming" | "cross-treatment" | "negative-control";

export type FailureClass =
  | "lexical-dependence" | "formatting-dependence" | "ordering-dependence"
  | "verbosity-dependence" | "discovery-terminology-dependence"
  | "confidence-interpretation-failure" | "contradiction-interpretation-failure"
  | "mechanism-interpretation-failure" | "evaluator-bug" | "unknown";

export type RobustnessCase = {
  id: string;
  dimension: RobustnessDimension;
  semanticClass: "equivalent" | "non-equivalent";
  output: ComparativeTreatmentOutput;
  expectedEquivalentToBaseline: boolean;
  expectedDirection?: "lower";
  failureClass: FailureClass;
};

export type RobustnessCaseResult = {
  id: string;
  dimension: RobustnessDimension;
  semanticClass: RobustnessCase["semanticClass"];
  baselineScore: number;
  score: number;
  absoluteVariance: number;
  passed: boolean;
  failureClass: FailureClass | null;
  scoreDetail: CaseScore;
};

