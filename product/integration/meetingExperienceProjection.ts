export type MeetingStatusProjectionV1={phase:"Prepare"|"Meet"|"Confirm outcomes"|"Continue";status:"Needs preparation"|"Update needed"|"Pack ready"|"In progress"|"Review needed"|"Ready to close"|"Preparing next occurrence";nextAction:string;phaseIndex:0|1|2|3};
export function projectMeetingStatus(input:{currentStep:string;hasPack:boolean;hasStalePack?:boolean;hasReviewedCompletion:boolean;hasClosure:boolean;hasSuccessor:boolean;reviewDispositionsComplete?:boolean}):MeetingStatusProjectionV1{
  if(input.hasStalePack)return{phase:"Prepare",status:"Update needed",nextAction:"Rebuild from current context",phaseIndex:0};
  if(input.hasSuccessor)return input.hasPack?{phase:"Prepare",status:"Pack ready",nextAction:"Review pack and start",phaseIndex:0}:{phase:"Prepare",status:"Needs preparation",nextAction:"Build pack",phaseIndex:0};
  if(input.hasClosure)return{phase:"Continue",status:"Preparing next occurrence",nextAction:"Continue",phaseIndex:3};
  if(input.hasReviewedCompletion)return{phase:"Confirm outcomes",status:"Ready to close",nextAction:"Close and continue",phaseIndex:2};
  if(["review","capture"].includes(input.currentStep))return input.currentStep==="review"?{phase:"Confirm outcomes",status:"Review needed",nextAction:input.reviewDispositionsComplete?"Ready to finalize reviewed carry-forward":"Review proposed updates",phaseIndex:2}:{phase:"Meet",status:"In progress",nextAction:"Capture what happened",phaseIndex:1};
  if(!["prepare","freeze","set-up"].includes(input.currentStep))return{phase:"Meet",status:"In progress",nextAction:"Capture what happened",phaseIndex:1};
  return input.hasPack?{phase:"Prepare",status:"Pack ready",nextAction:"Review pack and start",phaseIndex:0}:{phase:"Prepare",status:"Needs preparation",nextAction:"Build pack or start without one",phaseIndex:0};
}
