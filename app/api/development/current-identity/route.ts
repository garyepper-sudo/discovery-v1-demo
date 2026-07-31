import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { validateOnboardingTestEnvironment } from "../../../../lib/environment/discoveryEnvironment";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const environment = validateOnboardingTestEnvironment();
    if (environment.environment !== "development") {
      return NextResponse.json(
        { authenticated: false, message: "Development identity diagnostic unavailable." },
        { status: 404 },
      );
    }
    await auth.protect();
    const authentication = await auth();
    if (!authentication.userId) {
      return NextResponse.json(
        { authenticated: false, message: "Authentication required." },
        { status: 401 },
      );
    }
    return NextResponse.json({
      authenticated: true,
      userId: authentication.userId,
      environment: "development",
    });
  } catch {
    return NextResponse.json(
      { authenticated: false, message: "Development identity diagnostic unavailable." },
      { status: 404 },
    );
  }
}
