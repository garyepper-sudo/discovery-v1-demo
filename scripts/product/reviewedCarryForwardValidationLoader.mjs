import { createRequire, registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

const unavailableHeaders = `data:text/javascript,${encodeURIComponent(`export function cookies(){throw new Error("next/headers is unavailable in the reviewed carry-forward filesystem validator");}export function headers(){throw new Error("next/headers is unavailable in the reviewed carry-forward filesystem validator");}`)}`;
const unavailableClerk = `data:text/javascript,${encodeURIComponent(`export async function auth(){return {userId:process.env.DISCOVERY_SANDBOX_CEO_USER_ID??"user_validationceo",sessionId:"reviewed-carry-forward-validation"};}`)}`;
const require = createRequire(import.meta.url);
const ordinaryReact = pathToFileURL(require.resolve("react")).href;
const validationNavigation = `data:text/javascript,${encodeURIComponent(`export function useRouter(){return globalThis.__reviewedCarryForwardRouter??{refresh(){}};}`)}`;
const founderValidationComposition = `data:text/javascript,${encodeURIComponent(`
const compositionUrl=${JSON.stringify(pathToFileURL(process.cwd()+"/product/integration/leadershipConversationServerComposition.ts").href)};
export async function createFounderMeetingHomeComposition(seriesAddress){
  const raw=process.env.REVIEWED_FINALIZATION_ACTION_CONTEXT;
  if(!raw)throw new Error("Founder Meeting Home validation context is unavailable.");
  const input=JSON.parse(raw);
  if(input.unauthenticated)throw new Error("Validation actor unavailable.");
  if(seriesAddress!==input.seriesAddress)throw new Error("Meeting is unavailable.");
  const {createLeadershipConversationServerCompositionForValidation}=await import(compositionUrl);
  const state=globalThis.__reviewedFinalizationValidationState??={closeCalls:0,projectionReads:0,sourceReads:0,protectedReadsAfterClose:0,completionFaultCalls:0,closed:false};
  const observed=(kind)=>{if(kind==="artifact")state.projectionReads+=1;else state.sourceReads+=1;if(state.closed)state.protectedReadsAfterClose+=1;};
  const server=createLeadershipConversationServerCompositionForValidation({...input.roots,userId:input.userId,organizationId:input.organizationId,analysisTransport:async()=>{state.providerRequests=(state.providerRequests??0)+1;throw new Error("Provider disabled for action validation");},onProtectedArtifactRead(){observed("artifact");if(input.projectionFailure||input.projectionAfter!==undefined&&state.projectionReads>input.projectionAfter||input.routeProjectionFailure&&(state.routeCalls??0)>=3)throw new Error("validation-finalization-projection-failure");},onProtectedSourceContentRead(){observed("source");},...((input.completionFailure||input.routeFailureAt)?{workflowFaultInjector:{beforeReviewedRoute(){state.routeCalls=(state.routeCalls??0)+1;if(state.routeCalls===input.routeFailureAt)throw new Error("validation-route-failure");},afterClaim(){if(input.completionFailure){state.completionFaultCalls+=1;throw new Error("validation-finalization-before-publication");}}}}:{})});
  return{server,request:{consumerId:input.userId},meeting:{organizationId:input.organizationId,questionId:input.questionId,occurrenceId:input.conversationId,seriesId:input.seriesId},close:async()=>{state.closed=true;state.closeCalls+=1;if(input.closeFailure)throw new Error("validation-finalization-close-failure");}};
}`)}`;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/headers") return { url: unavailableHeaders, shortCircuit: true };
    if (specifier === "@clerk/nextjs/server") return { url: unavailableClerk, shortCircuit: true };
    if (specifier === "react") return { url: ordinaryReact, shortCircuit: true };
    if (specifier === "next/navigation") return { url: validationNavigation, shortCircuit: true };
    if (specifier.endsWith("/founderMeetingHomeComposition")) return { url: founderValidationComposition, shortCircuit: true };
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url === unavailableHeaders || url === unavailableClerk || url === validationNavigation || url === founderValidationComposition) return { format: "module", source: decodeURIComponent(url.slice(url.indexOf(",") + 1)), shortCircuit: true };
    return nextLoad(url, context);
  },
});
