export const SANDBOX_ORGANIZATION_ID = "sandbox-northstar-implementation-services-001";
export const SANDBOX_MANIFEST_VERSION = "1";
export const SANDBOX_VALIDATOR_VERSION = "1";
export const SANDBOX_PRIMARY_QUESTION = "Why are customer implementations taking longer?";
export const SANDBOX_CONTROL_AREA = "Community science volunteering participation";
export const SANDBOX_LIVE_ACCEPTANCE_STAGES = [
  "batch-1", "batch-2", "batch-3", "negative", "negative",
] as const;

export type SandboxBatchId = "batch-0" | "batch-1" | "batch-2" | "batch-3" | "batch-4" | "negative";
export type SandboxDocument = {
  id: string; batchId: SandboxBatchId; relativePath: string; version: string;
  sha256: string; effectiveAt: string; sourceType: "text/markdown";
  semanticRole: string; negativeControl: null | "exact-duplicate" | "formatting-only" | "irrelevant-external" | "unrelated" | "company-nonmaterial";
  duplicateOf?: string;
};

const doc = (id: string, batchId: SandboxBatchId, file: string, sha256: string, semanticRole: string, negativeControl: SandboxDocument["negativeControl"] = null, duplicateOf?: string): SandboxDocument => ({
  id, batchId, relativePath: `corpus/${batchId}/${file}`, version: "1", sha256,
  effectiveAt: ({"batch-0":"2026-01-05T09:00:00.000Z","batch-1":"2026-02-02T09:00:00.000Z","batch-2":"2026-03-02T09:00:00.000Z","batch-3":"2026-04-06T09:00:00.000Z","batch-4":"2026-05-04T09:00:00.000Z",negative:"2026-05-05T09:00:00.000Z"})[batchId],
  sourceType: "text/markdown", semanticRole, negativeControl, ...(duplicateOf ? { duplicateOf } : {}),
});

export const sandboxManifest = {
  version: SANDBOX_MANIFEST_VERSION,
  validatorVersion: SANDBOX_VALIDATOR_VERSION,
  organization: { id: SANDBOX_ORGANIZATION_ID, name: "Northstar Implementation Services Sandbox", industry: "Industrial automation implementation", website: "https://sandbox.invalid" },
  primaryQuestion: SANDBOX_PRIMARY_QUESTION,
  controlArea: SANDBOX_CONTROL_AREA,
  replayTimestamps: ["2026-01-05T09:00:00.000Z","2026-02-02T09:00:00.000Z","2026-03-02T09:00:00.000Z","2026-04-06T09:00:00.000Z","2026-05-04T09:00:00.000Z","2026-05-05T09:00:00.000Z"],
  batchOrder: ["batch-0","batch-1","batch-2","batch-3","batch-4","negative"] as SandboxBatchId[],
  sourceScope: `organization:${SANDBOX_ORGANIZATION_ID}:local-corpus:v1`,
  expectedStructuralBehavior: { batch1AuthorizedUnderstanding: "non-empty", batch2Evolution: "retained canonical history", batch3Uncertainty: "must not disappear without evidence", duplicateAdmission: "no duplicate source content", negativeMaterialChange: "none expected" },
  expectedInvariantAreas: [SANDBOX_CONTROL_AREA],
  resetOwnership: { runtimeFile: `${SANDBOX_ORGANIZATION_ID}.json`, checkpointFile: "checkpoints.json", receiptFile: "reset-receipt.json" },
  expectedTemporaryPaths: ["runtime", "output"],
  documents: [
    doc("foundation-overview","batch-0","company-overview.md","c5655516bbd735cb1995e400e737a9c1734cc623be8d66d12a80569b11575d1a","company context"),
    doc("foundation-governance","batch-0","operating-governance.md","815321bcfbee55591cc0d8d64cda13d06376368ae6b3f52baac9704daed56b01","governance context"),
    doc("initial-capacity","batch-1","capacity-summary.md","d21bec77243cccdb346b6c598569307adc2c3d6ed60a7a2c561646b05fbe62f3","competing capacity explanation"),
    doc("initial-customer-notes","batch-1","customer-and-planning-notes.md","785b009c8ca043538d3a04de4ee057ff75d64ff5131fc30b50ff44a322ae98d4","conflicting accounts"),
    doc("initial-status","batch-1","implementation-status.md","baddb57ac9d5335ada7d2268e9ce2d6d352ac441045d66419cfbaeec9d1855a0","incomplete operating picture"),
    doc("diagnostic-decision-path","batch-2","decision-path-analysis.md","892818c46cdad5857c6b10d49e6c7ec54a0adb8b11551fa2686298813fd157f9","diagnostic comparison"),
    doc("diagnostic-feasibility","batch-2","feasibility-cohort.md","51d088887d913054830a2d5e2e5befb2d60d3a3f8e11b1416dddf9f5babeb9e4","diagnostic comparison"),
    doc("constraint-policy","batch-3","approval-policy-constraint.md","0375cdc6b65029b34494f98a091444cdc7633db284f4df25fb99984bf532cac8","action constraint"),
    doc("contradictory-region","batch-3","contradictory-regional-review.md","707a1065d0538e30060ec9b4bb8e84d8775cf9a45a88822e4b9a57676483e2b1","credible counterevidence"),
    doc("outcome-pilot","batch-4","pilot-record-and-results.md","f7463f4f3b2d6ef273749df46995ad18371ad9b53ad5d218659f647ec0fe63a7","future outcome evidence"),
    doc("learning-retrospective","batch-4","pilot-retrospective.md","321ebae6c0f27a443b1a5ea767f460b5c94beb023d7aa1b3c184b0608030feca","future learning evidence"),
    doc("negative-community","negative","company-community-program.md","2b0557e63746d7945f97a66654e2fd5a38dbb8733ee9d734ffc305e009dc1383","company nonmaterial","company-nonmaterial"),
    doc("negative-duplicate","negative","exact-duplicate-capacity-summary.md","d21bec77243cccdb346b6c598569307adc2c3d6ed60a7a2c561646b05fbe62f3","duplicate invariant","exact-duplicate","initial-capacity"),
    doc("negative-unrelated","negative","facilities-note.md","b131b5f48dedb53d316180c1dff29d3727c137274f8786cb64b963fe988aff66","unrelated control","unrelated"),
    doc("negative-formatting","negative","formatting-only-capacity-summary.md","9006667af8ba3dcf6b57e414c7ac399bfa4e577ad3946a15cbe44f028d3f0fad","formatting-only revision","formatting-only","initial-capacity"),
    doc("negative-external","negative","industry-external.md","e35170b94b399c220a0acdb4284fb55aad403f483cdb50e91fc3960b430a579d","external irrelevant","irrelevant-external"),
  ] satisfies SandboxDocument[],
} as const;
