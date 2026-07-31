import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse, type NextFetchEvent } from "next/server";

import {
  ALPHA_ACCESS_COOKIE,
  safeAlphaPath,
  verifyAlphaSession,
} from "./lib/alpha-access/session";
import { isYourOrganizationAlphaActivationEnabled } from "./lib/alpha-activation/config";
import { onboardingTestEnvironmentEnabled } from "./lib/environment/discoveryEnvironment";
import { productionRouteDisposition } from "./lib/production-route-policy";

const protectedAlphaPath = /^\/alpha(?:\/|$)/;
const protectedAlphaAsset =
  /^\/_next\/static\/(?:chunks|css)\/app\/alpha(?:\/|$)/;
const activatedYourOrganizationPath = /^\/your-organization(?:\/|$)/;
const inactiveDesignPartnerSurface =
  /^\/(?:ask|brief|decisions|experiment|organizations|research|discovery-v1|executive-decision|api\/(?:analyze|discovery-lab|executive-decision|executive-decision-record|executive-scenario|product-interaction))(?:\/|$)/;
const onboardingTestSurface =
  /^\/(?:onboarding|discovery-v1|your-organization|organizations|product-alpha|api\/(?:discovery-lab|product-alpha|development\/(?:google-drive|current-identity)))(?:\/|$)/;

function protectedHeaders(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.append("Vary", "Cookie");
  return response;
}

function requestId(request: NextRequest): string {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}

const protectActivatedYourOrganization = clerkMiddleware(async (auth, request) => {
  await auth.protect();
  const headers = new Headers(request.headers);
  headers.set("x-discovery-request-id", requestId(request));
  return protectedHeaders(NextResponse.next({ request: { headers } }));
});

async function legacyAlphaMiddleware(request: NextRequest) {
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
    const accessUrl = request.nextUrl.clone();
    accessUrl.pathname = "/alpha-access";
    accessUrl.search = "";
    accessUrl.searchParams.set(
      "next",
      safeAlphaPath(`${request.nextUrl.pathname}${request.nextUrl.search}`),
    );
    return protectedHeaders(NextResponse.redirect(accessUrl));
  }

  if (request.nextUrl.pathname === "/alpha") {
    const alphaUrl = request.nextUrl.clone();
    alphaUrl.pathname = "/alpha/ask";
    alphaUrl.search = "";
    return protectedHeaders(NextResponse.redirect(alphaUrl));
  }

  return protectedHeaders(NextResponse.next());
}

export async function middleware(
  request: NextRequest,
  event?: NextFetchEvent,
): Promise<NextResponse> {
  const activationEnabled = isYourOrganizationAlphaActivationEnabled();
  if (
    onboardingTestEnvironmentEnabled() &&
    onboardingTestSurface.test(request.nextUrl.pathname)
  ) {
    if (!event) {
      return new NextResponse("Authentication boundary unavailable.", {
        status: 503,
      });
    }
    const response = await protectActivatedYourOrganization(request, event);
    if (!response) {
      return new NextResponse("Authentication required.", { status: 401 });
    }
    return response instanceof NextResponse
      ? response
      : new NextResponse(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
  }
  if (
    productionRouteDisposition({
      pathname: request.nextUrl.pathname,
      activationEnabled,
    }) === "not-found"
  ) {
    return protectedHeaders(new NextResponse("Not found.", { status: 404 }));
  }
  if (
    activationEnabled &&
    activatedYourOrganizationPath.test(request.nextUrl.pathname)
  ) {
    if (!event) {
      return new NextResponse("Authentication boundary unavailable.", {
        status: 503,
      });
    }
    const response = await protectActivatedYourOrganization(request, event);
    if (!response) {
      return new NextResponse("Authentication required.", { status: 401 });
    }
    return response instanceof NextResponse
      ? response
      : new NextResponse(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
  }
  if (
    activationEnabled &&
    inactiveDesignPartnerSurface.test(request.nextUrl.pathname)
  ) {
    return protectedHeaders(new NextResponse("Not available in the bounded Alpha.", {
      status: 404,
    }));
  }
  return legacyAlphaMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/onboarding/:path*",
    "/alpha/:path*",
    "/your-organization/:path*",
    "/ask/:path*",
    "/brief/:path*",
    "/decisions/:path*",
    "/experiment/:path*",
    "/organizations/:path*",
    "/research/:path*",
    "/discovery-v1/:path*",
    "/product-alpha/:path*",
    "/executive-decision/:path*",
    "/cognition-lab/:path*",
    "/discovery-lab/:path*",
    "/api/analyze/:path*",
    "/api/discovery-lab/:path*",
    "/api/executive-decision/:path*",
    "/api/executive-decision-record/:path*",
    "/api/executive-scenario/:path*",
    "/api/product-interaction/:path*",
    "/api/product-alpha/:path*",
    "/api/development/google-drive/:path*",
    "/api/development/current-identity",
    "/_next/static/chunks/app/alpha/:path*",
    "/_next/static/css/app/alpha/:path*",
  ],
};
