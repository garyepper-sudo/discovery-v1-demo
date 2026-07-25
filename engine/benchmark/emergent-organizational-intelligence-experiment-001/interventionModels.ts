const interventions: Record<string, string> = {
  "operating-model-mismatch": "standardize-commercial-product-boundary",
  "priority-churn": "stabilize-priority-commitments",
  "exception-reinforcement-loop": "price-and-govern-exceptions",
  "maintenance-deferral-chain": "restore-reliability-investment",
  "handoff-ownership-gap": "assign-cross-functional-acceptance-owner",
};

export function interventionForMechanism(
  mechanismId: string | undefined,
): string | undefined {
  return mechanismId ? interventions[mechanismId] : undefined;
}
