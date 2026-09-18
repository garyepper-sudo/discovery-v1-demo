import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { clerkClient } from "@clerk/nextjs/server";
import { bootstrapProductionDesignPartner } from "../../../../product/integration/productionDesignPartnerBootstrap";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const OPERATION_ID = "founder-production-smoke:asterline-software-synthetic-test:v1";
const OCCURRED_AT = "2026-09-18T04:00:00.000Z";
const FOUNDER_EMAIL = "garyepper@gmail.com";
const QUESTION = "Should Asterline keep the October 15 launch date, delay it, or limit the release to a controlled pilot—and what must be resolved before leadership can decide?";
const PROMOTION_PROVENANCE = "Human-approved promotion from Asterline synthetic validation fixture for founder production smoke.";
const sources = [
  ["01_strategy_and_launch_brief.txt", "SYNTHETIC TEST DATA — ASTERLINE SOFTWARE\nStrategy and Launch Brief: proposed target October 15 2026; no final decision has been made. Options are general release, controlled pilot, or delay."],
  ["02_sales_and_customer_evidence.txt", "SYNTHETIC TEST DATA — ASTERLINE SOFTWARE\nAtlas $420k renewal is due November 1 and Customer Success marks Atlas at risk. Atlas would consider a 30-day controlled pilot if scheduled export is available and security review is complete."],
  ["03_product_and_engineering_readiness.txt", "SYNTHETIC TEST DATA — ASTERLINE SOFTWARE\nProduct and Engineering Readiness: feature complete is reported, Engineering readiness is 92%, and 200-user p95 is 3.8 seconds against a sub-two-second GA target."],
  ["04_security_support_and_finance.txt", "SYNTHETIC TEST DATA — ASTERLINE SOFTWARE\nSecurity, Support, and Financial Constraints: SEC-31 and SEC-44 remain medium findings; support recommends a pilot of no more than 3 customers; renewals total $730k and the October general-release versus pilot difference is approximately $30k."],
  ["05_decisions_commitments_and_open_questions.txt", "SYNTHETIC TEST DATA — ASTERLINE SOFTWARE\nDecisions, Commitments, Assumptions, and Open Questions: C-01 by September 26, C-02 by October 7, C-03 retest by October 10, C-04 ask Atlas by September 12, C-05 runbooks by September 30."],
] as const;

function privateResponse(status: number, body: string): Response {
  return new Response(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" } });
}

function authorized(request: Request): boolean {
  const expected = process.env.DISCOVERY_FOUNDER_BOOTSTRAP_SECRET;
  const supplied = request.headers.get("authorization");
  if (!expected || expected.length < 32 || !supplied?.startsWith("Bearer ")) return false;
  const expectedHash = createHash("sha256").update(expected).digest();
  const suppliedHash = createHash("sha256").update(supplied.slice("Bearer ".length)).digest();
  return timingSafeEqual(expectedHash, suppliedHash);
}

async function founderSubject(): Promise<string | undefined> {
  const users = await (await clerkClient()).users.getUserList({ emailAddress: [FOUNDER_EMAIL], limit: 2 });
  const matches = users.data.filter(user => user.emailAddresses.some(email => email.emailAddress.toLocaleLowerCase("en-US") === FOUNDER_EMAIL));
  return matches.length === 1 ? matches[0]!.id : undefined;
}

export async function POST(request: Request): Promise<Response> {
  if (process.env.VERCEL_ENV !== "production" || process.env.NODE_ENV !== "production") return privateResponse(404, "Not found.");
  if (!authorized(request)) return privateResponse(401, "Unauthorized.");
  if ((request.headers.get("content-length") ?? "0") !== "0") return privateResponse(400, "Invalid request.");
  try {
    const clerkSubject = await founderSubject();
    if (!clerkSubject) return privateResponse(503, "Founder identity unavailable.");
    const receipt = await bootstrapProductionDesignPartner({
      contractVersion: "1", clerkSubject,
      organization: { creationKey: OPERATION_ID, displayName: "Asterline Software — Synthetic Test", provenance: "Founder synthetic production bootstrap executed through authorized ops-only Vercel runtime path." },
      operationId: OPERATION_ID, occurredAt: OCCURRED_AT, productQuestion: QUESTION,
      meetingExternalKey: "weekly-signalgrid-launch-readiness-review", meetingTitle: "Weekly SignalGrid Launch Readiness Review", meetingPurpose: QUESTION,
      cadenceLabel: "Weekly", role: "Founder", preparationScopeExternalKey: "founder-synthetic-asterline-v1",
      sources: sources.map(([externalKey, body]) => ({ externalKey: `founder-synthetic:${externalKey}`, mediaType: "text/plain" as const, bytes: new TextEncoder().encode(body) })),
    });
    return Response.json({ status: "PROVISIONED_OR_REPLAYED", organizationId: receipt.organizationId, participantRef: receipt.participantRef, productQuestionId: receipt.productQuestionId, meetingSeriesId: receipt.seriesId, meetingAddress: receipt.meetingAddress, occurrenceId: receipt.occurrenceId, preparationScopeId: receipt.preparationScopeId, preparedWorkProductVersionId: receipt.preparedWorkProductVersionId, governedSourceCount: receipt.sourceCount, promotionProvenance: PROMOTION_PROVENANCE, secretReturned: false, sourceBodiesReturned: false }, { headers: { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" } });
  } catch {
    return privateResponse(409, "Founder bootstrap failed closed.");
  }
}

export async function GET(): Promise<Response> { return privateResponse(404, "Not found."); }
