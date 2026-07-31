import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isOnboardingTestOrganizationId } from "../../../../../lib/onboarding/testing";
import { createDevelopmentGoogleDriveOAuthService } from "../../../../../product/connectors/google-drive/liveOAuthService";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const authentication = await auth();
    if (!authentication.userId) {
      return NextResponse.json({ status: "denied", message: "Authentication required." }, { status: 401 });
    }
    const organizationId = new URL(request.url).searchParams.get("organizationId") ?? "";
    if (!isOnboardingTestOrganizationId(organizationId)) {
      return NextResponse.json(
        { status: "denied", message: "An exact onboarding development organization is required." },
        { status: 400 },
      );
    }
    const authorization = await createDevelopmentGoogleDriveOAuthService()
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
