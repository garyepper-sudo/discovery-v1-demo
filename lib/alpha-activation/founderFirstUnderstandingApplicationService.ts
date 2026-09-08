import "server-only";
import { FounderFirstUnderstandingOwnerBundle } from "./founderFirstUnderstandingOwnerBundle";
import type { FirstUnderstandingInput } from "./founderFirstUnderstandingForm";
export type FounderFirstUnderstandingApplyResult = { status: "applied" | "replayed"; meetingHomeDestination: string } | { status: "unavailable" | "conflict" | "retry-required" };
/** No durable orchestration state: exact owner results are reconstructed. */
export class FounderFirstUnderstandingApplicationService {
 constructor(private readonly owners: FounderFirstUnderstandingOwnerBundle) {}
 plan(input: FirstUnderstandingInput) { return this.owners.plan(input); }
 preview(input: FirstUnderstandingInput) { return this.plan(input); }
 async apply(input: FirstUnderstandingInput): Promise<FounderFirstUnderstandingApplyResult> {
  try {
   await this.plan(input);
   const bootstrap = await this.owners.applyBootstrap();
   await this.owners.applyAccess();
   await this.owners.admitSources(bootstrap.productQuestionId);
   await this.owners.registerScope(bootstrap.productQuestionId);
   const meeting = await this.owners.provisionMeeting();
   const meetingHomeDestination = await this.owners.destination(bootstrap.productQuestionId, meeting.seriesId);
   return { status: bootstrap.result === "BOOTSTRAP_REPLAYED" ? "replayed" : "applied", meetingHomeDestination };
  } catch (error) {
   const message=error instanceof Error?error.message:"",code=error&&typeof error==="object"&&"code" in error?String(error.code):"";
   if(code==="conflict"||/conflict|idempotency|immutable/iu.test(message))return {status:"conflict"};
   if(code==="unavailable"||["EACCES","EPERM","ECONNREFUSED","ENOTFOUND"].includes(code)||/unavailable|denied|configuration|setup is required/iu.test(message))return {status:"unavailable"};
   return {status:"retry-required"};
  }
 }
 close() { return this.owners.close(); }
}
