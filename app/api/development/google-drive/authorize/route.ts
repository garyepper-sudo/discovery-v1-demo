import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  GOOGLE_DRIVE_DEVELOPMENT_PURPOSE,
  isGoogleDriveDevelopmentOrganizationEligible,
  type GoogleDriveDevelopmentPurpose,
} from "../../../../../product/connectors/google-drive/developmentEligibility";
import { createDevelopmentGoogleDriveOAuthService } from "../../../../../product/connectors/google-drive/liveOAuthService";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const authentication = await auth();
    if (!authentication.userId) {
      return NextResponse.json({ status: "denied", message: "Authentication required." }, { status: 401 });
    }
    const url = new URL(request.url);
    const organizationId = url.searchParams.get("organizationId") ?? "";
    const purpose = (url.searchParams.get("purpose") ?? GOOGLE_DRIVE_DEVELOPMENT_PURPOSE) as GoogleDriveDevelopmentPurpose;
    if (!isGoogleDriveDevelopmentOrganizationEligible({
      organizationId,
      userId: authentication.userId,
      purpose,
    })) {
      return NextResponse.json(
        { status: "denied", message: "Exact development connector scope is required." },
        { status: 400 },
      );
    }
    const authorization = await createDevelopmentGoogleDriveOAuthService(undefined, { purpose })
      .beginAuthorization({ userId: authentication.userId, organizationId });
    return NextResponse.redirect(authorization.authorizationUrl, 302);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google Drive authorization unavailable.";
    const status = message.includes("configuration is incomplete") ? 503
      : message.includes("access denied") ? 403
        : 400;
    return NextResponse.json({ status: "authorization-failed", message }, { status });
  }
}
