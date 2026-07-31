import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isOnboardingTestOrganizationId } from "../../../../../lib/onboarding/testing";
import { createDevelopmentGoogleDriveOAuthService } from "../../../../../product/connectors/google-drive/liveOAuthService";

export const dynamic = "force-dynamic";
const CONTROLLED_FOLDER_NAME = "Discovery Connector Acceptance 001";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const authentication = await auth();
    if (!authentication.userId) {
      return NextResponse.json(
        { status: "denied", message: "Authentication required." },
        { status: 401 },
      );
    }
    const url = new URL(request.url);
    const organizationId = url.searchParams.get("organizationId") ?? "";
    const sourceId = url.searchParams.get("sourceId") ?? "";
    if (!isOnboardingTestOrganizationId(organizationId) || !sourceId) {
      return NextResponse.json(
        { status: "denied", message: "Exact development connector scope is required." },
        { status: 400 },
      );
    }
    const folders = await createDevelopmentGoogleDriveOAuthService().listAuthorizedFolders({
      userId: authentication.userId,
      organizationId,
      sourceId,
      exactFolderName: CONTROLLED_FOLDER_NAME,
    });
    console.info(JSON.stringify({
      diagnostic: "google-drive-list-folders",
      organizationId,
      sourceId,
      folderCount: folders.length,
      folders: folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        selected: folder.selected,
        parentCount: folder.parentIds.length,
        sharedDrive: Boolean(folder.driveId),
      })),
    }));
    return NextResponse.json({
      status: "ready",
      operation: "list-folders",
      organizationId,
      sourceId,
      folderCount: folders.length,
      folders: folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        selected: folder.selected,
        parentCount: folder.parentIds.length,
        sharedDrive: Boolean(folder.driveId),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message.includes("access denied") ? 403 : 400;
    return NextResponse.json(
      {
        status: status === 403 ? "denied" : "unavailable",
        message: status === 403
          ? "Organization or connector access denied."
          : "Google Drive folder diagnostics are unavailable.",
      },
      { status },
    );
  }
}
