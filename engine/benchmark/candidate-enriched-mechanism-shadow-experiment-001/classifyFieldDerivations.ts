import type { DerivedField, DerivationStatus } from "./types";

export function field(input: {
  statement?: string;
  artifactIds?: string[];
  evidenceIds?: string[];
  stage: string;
  rule: string;
  status: DerivationStatus;
  competing?: boolean;
  temporal?: boolean;
  crossSilo?: boolean;
}): DerivedField | undefined {
  if (!input.statement || input.status === "unavailable" || input.status === "unsupported") {
    return undefined;
  }
  return {
    statement: input.statement,
    artifactIds: [...(input.artifactIds ?? [])].sort(),
    evidenceIds: [...(input.evidenceIds ?? [])].sort(),
    productionStage: input.stage,
    derivationRule: input.rule,
    derivationStatus: input.status,
    competingInterpretations: input.competing ?? false,
    temporalOrderDependent: input.temporal ?? false,
    crossSiloDependent: input.crossSilo ?? false,
  };
}

export const safe = (value: DerivedField | undefined) =>
  value &&
  (value.derivationStatus === "explicit" ||
    value.derivationStatus === "deterministically-derived")
    ? value
    : undefined;
