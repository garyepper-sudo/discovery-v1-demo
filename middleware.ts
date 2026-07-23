import { NextRequest, NextResponse } from "next/server";

import {
  ALPHA_ACCESS_COOKIE,
  safeAlphaPath,
  verifyAlphaSession,
} from "./lib/alpha-access/session";

const protectedAlphaPath = /^\/alpha(?:\/|$)/;
const protectedAlphaAsset =
  /^\/_next\/static\/(?:chunks|css)\/app\/alpha(?:\/|$)/;

function protectedHeaders(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.append("Vary", "Cookie");
  return response;
}

export async function middleware(request: NextRequest) {
  if (
    !protectedAlphaPath.test(request.nextUrl.pathname) &&
    !protectedAlphaAsset.test(request.nextUrl.pathname)
  ) {
    return NextResponse.next();
  }

  const secret = process.env.ALPHA_SESSION_SECRET;
  const password = process.env.ALPHA_ACCESS_PASSWORD;
  const token = request.cookies.get(ALPHA_ACCESS_COOKIE)?.value;
  const authenticated =
    Boolean(secret && password) &&
    (await verifyAlphaSession(token, secret ?? ""));

  if (!authenticated) {
    const accessUrl = new URL("/alpha-access", request.url);
    accessUrl.searchParams.set(
      "next",
      safeAlphaPath(`${request.nextUrl.pathname}${request.nextUrl.search}`),
    );
    return protectedHeaders(NextResponse.redirect(accessUrl));
  }

  return protectedHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/alpha/:path*",
    "/_next/static/chunks/app/alpha/:path*",
    "/_next/static/css/app/alpha/:path*",
  ],
};
