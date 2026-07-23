import { NextRequest, NextResponse } from "next/server";

import { ALPHA_ACCESS_COOKIE } from "../../../lib/alpha-access/session";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(
    new URL("/alpha-access?next=%2Falpha", request.url),
    303,
  );
  response.cookies.set({
    name: ALPHA_ACCESS_COOKIE,
    value: "",
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production" ||
      process.env.VERCEL === "1" ||
      process.env.VERCEL_ENV === "preview" ||
      process.env.VERCEL_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
