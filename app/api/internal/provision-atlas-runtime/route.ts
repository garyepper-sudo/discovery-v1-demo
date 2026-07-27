import { createHash, timingSafeEqual } from "node:crypto";

import postgres from "postgres";
import { getVercelOidcToken } from "@vercel/oidc";

import { requireDiscoveryDatabaseUrl } from "../../../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../../../db/governance/postgresRepositories";
import { createOrganizationRuntimeRepository } from "../../../../engine/v3/runtime";
import {
  provisionAlphaAccess,
  provisionOrganizationRuntime,
} from "../../../../lib/alpha-provisioning/provisionDesignPartner";
import { boundedVercelOidcEvidence } from "../../../../lib/alpha-provisioning/vercelOidcEvidence";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ORGANIZATION_ID = "atlas-manufacturing-simulation";
const CONSUMER_ID = "user_3H5yQgEI6LpgRv7CeNoZsRGvu3p";
const OPERATOR_ID = "discovery-alpha-operator";
const RUNTIME_SHA256 =
  "8c3ad0b42c53f7027d3f0cb0a12457e84a25c03063b4c6a47d14a8fe23bef5fa";
const MAX_RUNTIME_BYTES = 4_000_000;

function disabled(): Response {
  return new Response("Not found.", {
    status: 404,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function authorized(request: Request): boolean {
  const expected = process.env.DISCOVERY_PROVISIONING_OPERATION_SECRET;
  const supplied = request.headers.get("x-discovery-provisioning-secret");
  if (!expected || !supplied) return false;
  const expectedHash = createHash("sha256").update(expected).digest();
  const suppliedHash = createHash("sha256").update(supplied).digest();
  return timingSafeEqual(expectedHash, suppliedHash);
}

function exactHeader(request: Request, name: string, expected: string): boolean {
  return request.headers.get(name) === expected;
}

export async function POST(request: Request): Promise<Response> {
  if (
    process.env.VERCEL_ENV !== "production" ||
    process.env.DISCOVERY_PROVISIONING_OPERATION_ENABLED !== "true"
  ) {
    return disabled();
  }
  if (!authorized(request)) {
    return new Response("Unauthorized.", { status: 401 });
  }
  if (
    !exactHeader(request, "x-discovery-organization-id", ORGANIZATION_ID) ||
    !exactHeader(request, "x-discovery-consumer-id", CONSUMER_ID) ||
    !exactHeader(request, "x-discovery-operator-id", OPERATOR_ID) ||
    !exactHeader(request, "x-discovery-runtime-sha256", RUNTIME_SHA256)
  ) {
    return new Response("Invalid provisioning scope.", { status: 400 });
  }
  const idempotencyKey = request.headers.get("x-discovery-idempotency-key");
  if (
    !idempotencyKey ||
    idempotencyKey.length > 200 ||
    !/^[a-zA-Z0-9:_-]+$/.test(idempotencyKey)
  ) {
    return new Response("Invalid idempotency key.", { status: 400 });
  }
  if (new URL(request.url).searchParams.get("mode") === "diagnostic") {
    try {
      const token = await getVercelOidcToken();
      const oidc = boundedVercelOidcEvidence(token, {
        environment: "production",
        projectId: process.env.VERCEL_PROJECT_ID,
      });
      const repository = createOrganizationRuntimeRepository();
      const runtimePresent = await repository.exists(ORGANIZATION_ID);
      return Response.json({
        validation: "production-blob-oidc-diagnostic",
        result: "PASS",
        vercelEnvironment: process.env.VERCEL_ENV,
        projectId: process.env.VERCEL_PROJECT_ID,
        deploymentIdHash: process.env.VERCEL_DEPLOYMENT_ID
          ? createHash("sha256")
              .update(process.env.VERCEL_DEPLOYMENT_ID)
              .digest("hex")
              .slice(0, 12)
          : null,
        oidc,
        blobStoreId: process.env.BLOB_STORE_ID,
        runtimeObject:
          runtimePresent
            ? "EXACT_OBJECT_PRESENT_CONFLICT"
            : "EXACT_OBJECT_ABSENT_NO_CONFLICT",
        runtimeContentsReturned: false,
        rawTokenReturned: false,
      });
    } catch (error) {
      const provider = error as {
        name?: string;
        status?: number;
        statusCode?: number;
        code?: string;
      };
      return Response.json({
        validation: "production-blob-oidc-diagnostic",
        result: "FAIL",
        vercelEnvironment: process.env.VERCEL_ENV,
        requestContextTokenDetected: Boolean((
          globalThis as typeof globalThis & {
            [key: symbol]: { get?: () => { headers?: Record<string, string> } };
          }
        )[Symbol.for("@vercel/request-context")]?.get?.()?.headers?.[
          "x-vercel-oidc-token"
        ]),
        environmentTokenDetected: Boolean(process.env.VERCEL_OIDC_TOKEN),
        blobStoreId: process.env.BLOB_STORE_ID,
        error: {
          class: provider.name ?? "Error",
          status: provider.status ?? provider.statusCode ?? null,
          code: provider.code ?? null,
        },
        rawTokenReturned: false,
      }, { status: 502 });
    }
  }
  const operation = request.headers.get("x-discovery-provisioning-operation");
  if (operation === "access") {
    const sql = postgres(requireDiscoveryDatabaseUrl("administration"), { max: 1 });
    const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
    try {
      const receipt = await provisionAlphaAccess({
        organizationId: ORGANIZATION_ID,
        consumerId: CONSUMER_ID,
        actor: OPERATOR_ID,
        idempotencyKey,
        repository: createOrganizationRuntimeRepository(),
        accessRepository: new PostgresAlphaAccessRecordRepository(sql),
      });
      console.info(JSON.stringify({
        event: "alpha-access-provisioning-completed",
        requestId,
        organizationId: receipt.organizationId,
        consumerId: receipt.consumerId,
        operatorId: OPERATOR_ID,
        accessRecordId: receipt.accessRecordId,
      }));
      return Response.json({
        result: receipt.result,
        requestId,
        organizationId: receipt.organizationId,
        consumerId: receipt.consumerId,
        accessRecordId: receipt.accessRecordId,
        runtimeWritten: false,
        activationChanged: false,
      });
    } catch {
      console.error(JSON.stringify({
        event: "alpha-access-provisioning-failed",
        requestId,
        organizationId: ORGANIZATION_ID,
        operatorId: OPERATOR_ID,
      }));
      return new Response("Access provisioning failed closed.", { status: 409 });
    } finally {
      await sql.end();
    }
  }
  if (operation !== "runtime") {
    return new Response("Invalid provisioning operation.", { status: 400 });
  }
  if (request.headers.get("content-type") !== "application/json") {
    return new Response("Runtime must be canonical JSON.", { status: 415 });
  }
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_RUNTIME_BYTES) {
    return new Response("Runtime exceeds bounded upload size.", { status: 413 });
  }

  const runtimeBytes = new Uint8Array(await request.arrayBuffer());
  if (runtimeBytes.length === 0 || runtimeBytes.length > MAX_RUNTIME_BYTES) {
    return new Response("Runtime upload is empty or too large.", { status: 413 });
  }

  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const receipt = await provisionOrganizationRuntime({
      organizationId: ORGANIZATION_ID,
      actor: OPERATOR_ID,
      idempotencyKey,
      expectedRuntimeSha256: RUNTIME_SHA256,
      runtimeBytes,
      repository: createOrganizationRuntimeRepository(),
    });
    console.info(JSON.stringify({
      event: "alpha-runtime-provisioning-completed",
      requestId,
      organizationId: receipt.organizationId,
      operatorId: OPERATOR_ID,
      runtimeSha256: receipt.runtimeSha256,
    }));
    return Response.json({
      result: receipt.result,
      requestId,
      organizationId: receipt.organizationId,
      runtimeBackend: receipt.runtimeBackend,
      runtimeSha256: receipt.runtimeSha256,
      runtimeRevision: receipt.runtimeRevision,
      backupId: receipt.backupId ?? null,
      accessWritten: false,
      activationChanged: false,
    });
  } catch {
    console.error(JSON.stringify({
      event: "alpha-runtime-provisioning-failed",
      requestId,
      organizationId: ORGANIZATION_ID,
      operatorId: OPERATOR_ID,
    }));
    return new Response("Runtime provisioning failed closed.", { status: 409 });
  }
}

export async function GET(): Promise<Response> {
  return disabled();
}
