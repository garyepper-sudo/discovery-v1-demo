import "server-only";

import { FounderFirstUnderstandingOwnerBundle } from "./founderFirstUnderstandingOwnerBundle";

export type FounderAddContextRecoveryProjection =
  | { status: "available"; sourceCount: number }
  | { status: "not-needed"; sourceCount: number }
  | { status: "unavailable" };

export type FounderAddContextRecoveryResult =
  | { status: "applied" | "replayed"; sourceCount: number; meetingHomeDestination: string }
  | { status: "unavailable" | "retry-required" };

/** A request-local adapter over the existing nonpublic reconciliation owner.
 * It owns neither source admission nor preparation persistence. */
export class FounderAddContextReconciliationApplicationService {
  constructor(private readonly owners: FounderFirstUnderstandingOwnerBundle) {}

  async project(seriesAddress: string): Promise<FounderAddContextRecoveryProjection> {
    try {
      const plan = await this.owners.reconcileAddContext(seriesAddress, false);
      return plan.scopeWrites === 0 && plan.preparedWorkWrites === 0
        ? { status: "not-needed", sourceCount: plan.sourceCount }
        : { status: "available", sourceCount: plan.sourceCount };
    } catch {
      return { status: "unavailable" };
    }
  }

  async apply(seriesAddress: string): Promise<FounderAddContextRecoveryResult> {
    try {
      const plan = await this.owners.reconcileAddContext(seriesAddress, false);
      if (plan.sourceWrites !== 0 || plan.scopeWrites > 1 || plan.preparedWorkWrites > 1) return { status: "unavailable" };
      if (plan.scopeWrites === 0 && plan.preparedWorkWrites === 0) return { status: "replayed", sourceCount: plan.sourceCount, meetingHomeDestination: `/product-alpha/meetings/${seriesAddress}` };
      const result = await this.owners.reconcileAddContext(seriesAddress, true);
      return { status: "applied", sourceCount: result.sourceCount, meetingHomeDestination: `/product-alpha/meetings/${seriesAddress}` };
    } catch {
      return { status: "retry-required" };
    }
  }

  close() { return this.owners.close(); }
}
