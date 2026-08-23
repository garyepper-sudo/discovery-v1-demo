import "server-only";
import { AlphaContentSafeObservabilityOwner, alphaObservationDefaults, type AlphaObservabilityEmissionResult } from "../observability/alphaContentSafeObservabilityOwner";
import type { AlphaContentSafeObservabilityDraftV1 } from "../observability/alphaContentSafeObservabilityContracts";
import { createAlphaTelemetryComposition } from "../telemetry/alphaTelemetryComposition";

export function createAlphaOperationalJsonOutputOwner(output:(line:string)=>void|Promise<void>):AlphaContentSafeObservabilityOwner{
  return new AlphaContentSafeObservabilityOwner({emit:event=>output(JSON.stringify(event))});
}

export async function writeAlphaOperationalLog(input:Pick<AlphaContentSafeObservabilityDraftV1,"eventCategory"|"workflowStage"|"transitionCategory"|"outcomeCategory"|"failureCategory">&Partial<Pick<AlphaContentSafeObservabilityDraftV1,"roleCategory"|"occurrenceCategory"|"viewportCategory"|"latencyBucket"|"replayRecoveryCategory"|"protectedLoadCategory">>,owner=new AlphaContentSafeObservabilityOwner(),telemetryScope?:{organizationScope:string}):Promise<AlphaObservabilityEmissionResult>{
  const draft={...alphaObservationDefaults,...input};
  if(!telemetryScope)return owner.observe(draft);
  let captured:import("../observability/alphaContentSafeObservabilityContracts").AlphaContentSafeObservabilityEventV1|undefined;
  const scopedOwner=new AlphaContentSafeObservabilityOwner({emit:event=>{captured=event;}}),result=await scopedOwner.observe(draft),composition=createAlphaTelemetryComposition();
  if(captured&&composition){const event=captured;void composition.ready.then(()=>composition.telemetry.observe(telemetryScope.organizationScope,event)).catch(()=>{});}
  return result;
}
