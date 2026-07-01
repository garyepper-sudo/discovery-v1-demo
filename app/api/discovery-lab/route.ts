import { NextResponse } from "next/server";
import { runDiscovery } from "../../../engine";
import { runDiscoveryV2 } from "../../../engine/v2";
import { runDiscoveryV3 } from "../../../engine/v3";
import { buildUnderstanding } from "../../../engine/understandingObject";

export async function POST(req: Request) {
  const body = await req.json();

  const input = {
    company: body.company || "",
    website: body.website || "",
    industry: body.industry || "",
    question: body.question || "",
    context: body.messyInput || body.context || "",
  };

  const result = await runDiscovery(input);
  const understandingObject = buildUnderstanding(result);
  const v2 = runDiscoveryV2(input);

  console.log("Discovery V2:", v2);

  const v3 = runDiscoveryV3(input);

  console.log("Discovery V3:", v3);

  return NextResponse.json({
    ...result,
    understandingObject,
    v2,
    v3,
  });
}