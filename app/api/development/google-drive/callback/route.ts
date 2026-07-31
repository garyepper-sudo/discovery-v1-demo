import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createDevelopmentGoogleDriveOAuthService } from "../../../../../product/connectors/google-drive/liveOAuthService";
import { GoogleDriveOAuthStateError } from "../../../../../product/connectors/google-drive/service";

export const dynamic = "force-dynamic";

function boundedError(error: unknown): { status: string; message: string; code: number } {
  const message = error instanceof Error ? error.message : "";
  if (error instanceof GoogleDriveOAuthStateError) {
    return {
      status: error.reason === "expired" ? "expired-state" : "invalid-state",
      message: error.reason === "expired"
        ? "Google authorization expired. Start again."
        : "Google authorization state is invalid.",
      code: 400,
    };
  }
  if (message.includes("Expired")) return { status: "expired-state", message: "Google authorization expired. Start again.", code: 400 };
  if (message.includes("Invalid") || message.includes("mismatched") || message.includes("already used")) {
    return { status: "invalid-state", message: "Google authorization state is invalid.", code: 400 };
  }
  if (message.includes("configuration is incomplete")) {
    return { status: "configuration-missing", message, code: 503 };
  }
  if (message.includes("access denied")) {
    return { status: "denied", message: "Organization access denied.", code: 403 };
  }
  return { status: "authorization-failed", message: "Google authorization could not be completed.", code: 400 };
}

export async function GET(request: Request): Promise<NextResponse> {
  let stateDiagnostic: Awaited<
    ReturnType<ReturnType<typeof createDevelopmentGoogleDriveOAuthService>["diagnoseAuthorizationState"]>
  > | null = null;
  try {
    const authentication = await auth();
    if (!authentication.userId) {
      return NextResponse.json({ status: "denied", message: "Authentication required." }, { status: 401 });
    }
    const url = new URL(request.url);
    const stateValue = url.searchParams.get("state") ?? "";
    if (url.searchParams.get("error")) {
      if (!stateValue) {
        return NextResponse.json(
          { status: "invalid-state", message: "Google authorization state is invalid." },
          { status: 400 },
        );
      }
      const service = createDevelopmentGoogleDriveOAuthService();
      const state = service.inspectAuthorizationState(stateValue);
      stateDiagnostic = await service.diagnoseAuthorizationState({
        userId: authentication.userId,
        organizationId: state.organizationId,
        state: stateValue,
      });
      await service.rejectAuthorization({
        userId: authentication.userId,
        organizationId: state.organizationId,
        state: stateValue,
      });
      return NextResponse.json(
        { status: "denied", message: "Google authorization was denied." },
        { status: 400 },
      );
    }
    const code = url.searchParams.get("code") ?? "";
    if (!code || !stateValue) {
      return NextResponse.json(
        { status: "authorization-failed", message: "Google callback parameters are incomplete." },
        { status: 400 },
      );
    }
    const service = createDevelopmentGoogleDriveOAuthService();
    const state = service.inspectAuthorizationState(stateValue);
    stateDiagnostic = await service.diagnoseAuthorizationState({
      userId: authentication.userId,
      organizationId: state.organizationId,
      state: stateValue,
    });
    if (state.userId !== authentication.userId) {
      return NextResponse.json(
        { status: "invalid-state", message: "Google authorization state is invalid." },
        { status: 400 },
      );
    }
    const source = await service.completeAuthorization({
      userId: authentication.userId,
      organizationId: state.organizationId,
      state: stateValue,
      code,
    });
    return NextResponse.json({
      status: "connected",
      source: {
        id: source.id,
        organizationId: source.organizationId,
        accountLabel: source.accountLabel,
        authorizationStatus: source.status,
        grantedScopes: source.grantedScopes,
        authorizationExpiresAt: source.authorizationExpiresAt,
      },
    });
  } catch (error) {
    if (error instanceof GoogleDriveOAuthStateError) {
      console.warn(JSON.stringify({
        diagnostic: "google-drive-oauth-state",
        statePresent: stateDiagnostic?.statePresent ?? true,
        encodingValid: stateDiagnostic?.encodingValid ?? error.reason !== "encoding-invalid",
        signatureValid: stateDiagnostic?.signatureValid
          ?? !["encoding-invalid", "signature-invalid"].includes(error.reason),
        expired: stateDiagnostic?.expired ?? error.reason === "expired",
        userMatch: stateDiagnostic?.userMatch ?? false,
        organizationMatch: stateDiagnostic?.organizationMatch ?? false,
        alreadyConsumed: stateDiagnostic?.alreadyConsumed ?? error.reason === "already-consumed",
        finalResult: "invalid",
        reason: error.reason,
      }));
    }
    const bounded = boundedError(error);
    return NextResponse.json(
      { status: bounded.status, message: bounded.message },
      { status: bounded.code },
    );
  }
}
