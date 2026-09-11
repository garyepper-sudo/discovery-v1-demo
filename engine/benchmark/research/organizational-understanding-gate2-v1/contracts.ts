export const GATE_2_VERSION = "organizational-understanding-gate2-v1" as const;

export const CANDIDATE_FIELDS = [
  "currentState",
  "options",
  "materialClaims",
  "institutionalDistinctions",
  "mechanisms",
  "mechanismTests",
  "informationAcquisition",
  "commitments",
  "unknowns",
  "executiveAssessment",
] as const;

export type CandidateField = (typeof CANDIDATE_FIELDS)[number];
export type Citation = { sourceLabel: string; lineStart: number; lineEnd: number };
export type CandidateItem = {
  statement: string;
  epistemicStatus: string;
  applicableTime: string;
  confidence: string;
  citations: Citation[];
};
export type CandidateOutput = Record<CandidateField, CandidateItem[]>;

export type SourceFixture = {
  sourceId: string;
  recordedAt: string;
  knownAt: string;
  lines: string[];
};
export type SourceSelection = { sourceId: string; lineNumbers?: number[] };
export type PublicScenario = {
  scenarioId: string;
  question: string;
  timeHorizon: { from: string; asOf: string };
  governedContext: {
    objectives: string[];
    decisionRights: string;
    escalationRequirements: string;
    reversibilityConstraint: string;
    institutionalContext: string;
  };
  sourceSelections: SourceSelection[];
};
export type WorldFixture = { worldId: string; sources: SourceFixture[]; scenarios: PublicScenario[] };

export type ModelRequest = {
  instruction: string;
  question: string;
  timeHorizon: { from: string; asOf: string };
  governedContext: PublicScenario["governedContext"];
  authorizedSources: Array<{
    label: `Source-${string}`;
    recordedAt: string;
    knownAt: string;
    lines: Array<{ line: number; text: string }>;
  }>;
  outputContract: "gate2-structured-candidate/v1";
};
export type AuthorizedPacket = {
  contractVersion: typeof GATE_2_VERSION;
  packetId: string;
  worldId: string;
  scenarioId: string;
  sourcePacketDigest: string;
  modelRequest: ModelRequest;
};
export type ExtractiveBaseline = {
  packetId: string;
  sourcePacketDigest: string;
  chronology: Array<{ sourceLabel: string; knownAt: string; passages: Citation[] }>;
  explicitRequirements: Citation[];
  observations: Citation[];
  commitments: Citation[];
  contradictions: Citation[];
};
export type StructuralEvaluation = {
  citationSupport: number;
  unsupportedClaims: number;
  unauthorizedCitations: number;
  malformedItems: number;
  valid: boolean;
};
