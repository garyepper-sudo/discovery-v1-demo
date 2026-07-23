import { NextRequest, NextResponse } from "next/server";

import {
  ALPHA_ACCESS_COOKIE,
  ALPHA_SESSION_MAX_AGE_SECONDS,
  alphaAccessConfigured,
  createAlphaSession,
  passwordsMatch,
  safeAlphaPath,
  secureAlphaCookie,
} from "../../../lib/alpha-access/session";

const FAILED_ATTEMPT_DELAY_MS = 650;

function noStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const next = safeAlphaPath(String(formData.get("next") ?? ""));
  const configuredPassword = process.env.ALPHA_ACCESS_PASSWORD ?? "";
  const secret = process.env.ALPHA_SESSION_SECRET ?? "";
  const valid =
    alphaAccessConfigured() &&
    (await passwordsMatch(password, configuredPassword));

  if (!valid) {
    await new Promise((resolve) => setTimeout(resolve, FAILED_ATTEMPT_DELAY_MS));
    const accessUrl = new URL("/alpha-access", request.url);
    accessUrl.searchParams.set("next", next);
    accessUrl.searchParams.set("error", "invalid");
    return noStore(NextResponse.redirect(accessUrl, 303));
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set({
    name: ALPHA_ACCESS_COOKIE,
    value: await createAlphaSession(secret),
    httpOnly: true,
    secure: secureAlphaCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: ALPHA_SESSION_MAX_AGE_SECONDS,
  });
  return noStore(response);
}
