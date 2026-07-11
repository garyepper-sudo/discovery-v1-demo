export type VerificationStatus = "pass" | "fail";

export type ArchitectureCheck = {
  capabilityId: string;
  capabilityName: string;
  category:
    | "producer"
    | "runtime"
    | "executive"
    | "dependency"
    | "atlas"
    | "benchmark"
    | "operating-system";
  status: VerificationStatus;
  message: string;
  detail?: string;
};

export type ArchitectureVerificationReport = {
  generatedAt: string;
  checks: ArchitectureCheck[];
  passedChecks: number;
  failedChecks: number;
  integrityScore: number;
};