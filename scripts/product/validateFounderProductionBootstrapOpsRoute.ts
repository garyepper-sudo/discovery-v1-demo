import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function main(): Promise<void> {
  const source = await readFile(path.join(process.cwd(), "app/api/ops/bootstrap-founder/route.ts"), "utf8");
  const checks: string[] = [];
  const check = (statement: string, value: unknown) => { assert.ok(value, statement); checks.push(statement); };
  check("route is server-only and Node runtime", source.includes('import "server-only"') && source.includes('export const runtime = "nodejs"'));
  check("route requires its dedicated bootstrap secret before Clerk or provisioner use", source.indexOf("if (!authorized(request))") < source.indexOf("clerkSubject = await founderSubject()") && source.indexOf("if (!authorized(request))") < source.indexOf("bootstrapProductionDesignPartner({"));
  check("secret comparison is constant-time and diagnostics never serialize secrets", source.includes("timingSafeEqual") && !/DISCOVERY_FOUNDER_BOOTSTRAP_SECRET[^\n]*Response\.json/u.test(source) && source.includes("FOUNDER_BOOTSTRAP_DIAGNOSTIC") && !source.includes("console.error"));
  check("route delegates to the canonical production provisioner", source.includes("bootstrapProductionDesignPartner({") && !source.includes("postgres(") && !source.includes("INSERT INTO"));
  check("route uses the authorized identity, question, exact series, and five new source keys", source.includes("garyepper@gmail.com") && source.includes("Weekly SignalGrid Launch Readiness Review") && source.includes("Should Asterline keep the October 15 launch date") && (source.match(/founder-synthetic:/gu) ?? []).length === 1 && (source.match(/SYNTHETIC TEST DATA — ASTERLINE SOFTWARE/gu) ?? []).length === 5);
  check("route has no fixture identity or development derivation", !source.includes("fixture-organization") && !source.includes("fixture-source") && !source.includes("founder-" + "FirstUnderstanding"));
  check("route accepts no request body and returns only content-safe receipt fields", source.includes('content-length") ?? "0") !== "0"') && source.includes("sourceBodiesReturned: false") && source.includes("secretReturned: false"));
  check("route returns bounded stage diagnostics only after authorization", source.indexOf("if (!authorized(request))") < source.indexOf("const correlationId = randomUUID()") && source.includes("CLERK_SUBJECT_RESOLUTION") && source.includes("diagnosticResponse"));
  check("canonical provisioner serializes concurrent operation identity", (await readFile(path.join(process.cwd(), "product/integration/productionDesignPartnerBootstrap.ts"), "utf8")).includes("pg_advisory_lock"));
  console.log(`RESULT PASS founder-production-bootstrap-ops-route checks=${checks.length}`);
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
