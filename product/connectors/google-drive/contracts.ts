import type { ProductQuestionWorkspace, ProductSearchReceipt } from "../../workflow";

export const GOOGLE_DRIVE_CONNECTOR_VERSION = "1" as const;
export const GOOGLE_DRIVE_SCOPES = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/drive.readonly",
] as const;

export type GoogleDriveConnectionStatus =
  | "pending"
  | "connected"
  | "expired"
  | "revoked";

export type GoogleDriveAuthorizationRequest = {
  authorizationUrl: string;
  state: string;
  expiresAt: string;
};

export type GoogleDriveCredential = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string;
  scopes: string[];
};

export type GoogleDriveConnectedSource = {
  version: typeof GOOGLE_DRIVE_CONNECTOR_VERSION;
  id: string;
  organizationId: string;
  authorizingUserId: string;
  accountLabel: string;
  status: GoogleDriveConnectionStatus;
  grantedScopes: string[];
  authorizationExpiresAt: string;
  connectedAt: string;
  revokedAt: string | null;
};

export type GoogleDriveFolderSummary = {
  id: string;
  name: string;
  driveId: string | null;
  parentIds: string[];
  selected: boolean;
};

export type GoogleDriveConnectedFolder = {
  id: string;
  sourceId: string;
  organizationId: string;
  googleFolderId: string;
  displayName: string;
  driveId: string | null;
  includeNested: boolean;
  connectedAt: string;
  lastSynchronizedAt: string | null;
  synchronizationCursor: string | null;
  revokedAt: string | null;
  limitations: string[];
};

export type GoogleDriveFileRecord = {
  sourceIdentity: string;
  googleFileId: string;
  folderId: string;
  name: string;
  mimeType: string;
  revisionId: string;
  modifiedAt: string;
  digest: string | null;
  status: "accessible" | "removed" | "inaccessible" | "unsupported";
  lastSeenAt: string;
  extractedAt: string | null;
  extractionDigest: string | null;
  passageCount: number;
};

export type GoogleDrivePassage = {
  id: string;
  googleFileId: string;
  fileName: string;
  mimeType: string;
  revisionId: string;
  modifiedAt: string;
  extractedAt: string;
  location: string;
  content: string;
  contentDigest: string;
  legacyContentDigest?: string;
};

export type GoogleDriveSourceVersion = {
  id: string;
  sourceIdentity: string;
  googleFileId: string;
  revisionId: string;
  modifiedAt: string;
  observedAt: string;
  extractionDigest: string | null;
  passageIds: string[];
  contentDisposition: "initial" | "changed" | "unchanged" | "unsupported";
};

export type GoogleDriveSynchronizationReceipt = {
  sourceId: string;
  folderId: string;
  organizationId: string;
  synchronizedAt: string;
  newFiles: string[];
  changedFiles: string[];
  unchangedContentRevisionFiles: string[];
  changedContentRevisionFiles: string[];
  extractedForComparisonFiles: string[];
  unchangedFiles: string[];
  movedFiles: string[];
  removedFiles: string[];
  inaccessibleFiles: string[];
  unsupportedFiles: string[];
  cursor: string | null;
  limitations: string[];
};

export type GoogleDriveRankedPassage = {
  passage: GoogleDrivePassage;
  score: number;
  matchedTerms: string[];
};

export type GoogleDriveQuestionSearchResult = {
  receipt: ProductSearchReceipt;
  rankedResults: GoogleDriveRankedPassage[];
  admittedSourceIds: string[];
  workspace: ProductQuestionWorkspace;
};

export type GoogleDriveDisconnectionReceipt = {
  sourceId: string;
  organizationId: string;
  revokedAt: string;
  credentialDeleted: boolean;
  historicalLineagePreserved: boolean;
};

export type GoogleDriveConnectorMetadata = {
  sources: GoogleDriveConnectedSource[];
  folders: GoogleDriveConnectedFolder[];
  files: GoogleDriveFileRecord[];
  passages: GoogleDrivePassage[];
  sourceVersions: GoogleDriveSourceVersion[];
};
