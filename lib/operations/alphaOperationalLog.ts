import "server-only";
import { AlphaContentSafeObservabilityOwner, alphaObservationDefaults, type AlphaObservabilityEmissionResult } from "../observability/alphaContentSafeObservabilityOwner";
import type { AlphaContentSafeObservabilityDraftV1 } from "../observability/alphaContentSafeObservabilityContracts";

export function createAlphaOperationalJsonOutputOwner(output:(line:string)=>void|Promise<void>):AlphaContentSafeObservabilityOwner{
  return new AlphaContentSafeObservabilityOwner({emit:event=>output(JSON.stringify(event))});
}

export function writeAlphaOperationalLog(input:Pick<AlphaContentSafeObservabilityDraftV1,"eventCategory"|"workflowStage"|"transitionCategory"|"outcomeCategory"|"failureCategory">&Partial<Pick<AlphaContentSafeObservabilityDraftV1,"roleCategory"|"occurrenceCategory"|"viewportCategory"|"latencyBucket"|"replayRecoveryCategory"|"protectedLoadCategory">>,owner=new AlphaContentSafeObservabilityOwner()):Promise<AlphaObservabilityEmissionResult>{
  return owner.observe({...alphaObservationDefaults,...input});
}
