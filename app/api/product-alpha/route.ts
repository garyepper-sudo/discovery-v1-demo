import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  mutateLiveSandbox,
  readLiveSandbox,
} from "../../../product/frontend/liveSandboxProductWorkspaceService";

function text(value: unknown, label: string, maximum = 500): string {
  if (typeof value !== "string" || !value.trim() || value.length > maximum) {
    throw new Error(`Invalid ${label}.`);
  }
  return value.trim();
}

async function identity() {
  const authentication = await auth();
  if (!authentication.userId) throw new Error("Authentication required.");
  return authentication.userId;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = await identity();
    return NextResponse.json(await readLiveSandbox({
      userId,
      organizationId: text(url.searchParams.get("organizationId"), "organization", 80),
      ...(url.searchParams.get("questionId")
        ? { questionId: text(url.searchParams.get("questionId"), "Question identity", 100) }
        : {}),
      adoptLegacy: url.searchParams.get("adoptLegacy") === "true",
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Live sandbox unavailable.";
    const status = message === "Authentication required." ? 401
      : message.includes("denied") ? 403
        : message.startsWith("Invalid") ? 400
          : 409;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await identity();
    const body = await request.json() as Record<string, unknown>;
    const organizationId = text(body.organizationId, "organization", 80);
    const idempotencyKey = text(body.idempotencyKey, "idempotency key", 120);
    const type = body.type;
    const command = type === "create"
      ? { type, question: text(body.question, "Question", 500), idempotencyKey } as const
      : type === "contribute"
        ? {
            type,
            questionId: text(body.questionId, "Question identity", 100),
            content: text(body.content, "information", 20_000),
            idempotencyKey,
          } as const
        : type === "archive"
          ? {
              type,
              questionId: text(body.questionId, "Question identity", 100),
              idempotencyKey,
            } as const
          : null;
    if (!command) throw new Error("Invalid live sandbox operation.");
    return NextResponse.json(await mutateLiveSandbox({
      userId,
      organizationId,
      command,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Live sandbox unavailable.";
    const status = message === "Authentication required." ? 401
      : message.includes("denied") ? 403
        : message.startsWith("Invalid") ? 400
          : 409;
    return NextResponse.json({ error: message }, { status });
  }
}
