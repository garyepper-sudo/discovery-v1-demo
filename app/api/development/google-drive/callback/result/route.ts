import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  const authentication = await auth();
  if (!authentication.userId) {
    return NextResponse.json({ status: "denied", message: "Authentication required." }, { status: 401 });
  }
  const requested = new URL(request.url).searchParams.get("status");
  if (requested !== "connected") {
    return NextResponse.json(
      { status: "authorization-failed", message: "Google authorization result is unavailable." },
      { status: 400 },
    );
  }
  return NextResponse.json({
    status: "connected",
    message: "Google Drive authorization completed. This window can be closed.",
  });
}
