export const ADDENDUM_V3_VERSION = "organizational-understanding-gate2-permission-revocation-addendum-v3" as const;

export type FrozenPacketKind = "restricted" | "expanded";
export type CurrentAccess = "restricted" | "expanded" | "revoked";

export type FrozenPacketExpectation = {
  requestSha256: string;
  transcriptSha256: string;
  sourceCount: number;
};

// This is a content-safe immutable reference to Luna's pre-Astra freeze. The
// candidate-visible bodies and Luna's private basis intentionally remain out of
// the repository. Paths are supplied at execution time by the freeze owner.
export const FROZEN_PACKET_EXPECTATIONS: Record<FrozenPacketKind, FrozenPacketExpectation> = {
  restricted: {
    requestSha256: "752515657ef44b9e5a72a93b245100d07fa93285308483049c5c9d9bfccf4eb4",
    transcriptSha256: "539e9604b278d0794dcc04c335500b889415acff23820d0f5dbc8ebb48d73e8b",
    sourceCount: 6,
  },
  expanded: {
    requestSha256: "93adf92f51cb825a9fa32b1b0d4302a06195aa1b28bdad2012f8ad4b112b9bd6",
    transcriptSha256: "da9bbc67bf2a77f21a561c2513b6b0cad7b1c30f43926ee628cdfccf3d6f5ccc",
    sourceCount: 7,
  },
};

export const selectFrozenPacketForCurrentAccess = (access: CurrentAccess): FrozenPacketKind => (
  access === "expanded" ? "expanded" : "restricted"
);

export const REQUIRED_OUTPUT_FIELDS = [
  "decision_frame",
  "supported_options",
  "permitted_facts",
  "uncertainty",
  "information_needs",
  "recommendation_range",
  "executive_usefulness",
] as const;
