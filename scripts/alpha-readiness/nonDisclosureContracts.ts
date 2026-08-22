export const AR1A_CONTRACT_VERSION = "1" as const;

export type SafeObservation = {
  contractVersion: "1";
  caseId: string;
  resultCategory: string;
  publicResult: unknown;
  durableInventory: Record<string, number>;
  ownerInvocations: Record<string, number>;
  protectedBodyReads: number;
  replayCategory: string;
  safeDigests: string[];
};

export type OracleResult = {
  contractVersion: "1";
  equal: boolean;
  earliestDivergence: string | null;
  differingPaths: string[];
  permittedDifferingPaths: string[];
  unexpectedDifferingPaths: string[];
  controlDigest: string;
  counterfactualDigest: string;
};

export type ThreatCase = {
  contractVersion: "1";
  caseId: string;
  dimension: string;
  ownerPath: string;
  permittedDifference: string;
  expected: "equal" | "different" | "blocked-product-defect";
};
