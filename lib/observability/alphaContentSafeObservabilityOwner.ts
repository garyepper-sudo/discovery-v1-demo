import { ALPHA_OBSERVABILITY_SCHEMA_VERSION, alphaBuildCategory, assertAlphaContentSafeObservabilityEventV1, type AlphaContentSafeObservabilityDraftV1, type AlphaContentSafeObservabilityEventV1 } from "./alphaContentSafeObservabilityContracts";

export type AlphaContentSafeObservabilitySink={emit(event:AlphaContentSafeObservabilityEventV1):void|Promise<void>};
export type AlphaObservabilityEmissionResult="emitted"|"disabled"|"rejected"|"sink-failed";

export class AlphaContentSafeObservabilityOwner{
  private sequence=0;
  constructor(private readonly sink?:AlphaContentSafeObservabilitySink,private readonly runOrdinal=1){if(!Number.isSafeInteger(runOrdinal)||runOrdinal<1||runOrdinal>1000)throw new Error("Alpha observability run is invalid.");}
  async observe(draft:AlphaContentSafeObservabilityDraftV1):Promise<AlphaObservabilityEmissionResult>{
    const event={schemaVersion:ALPHA_OBSERVABILITY_SCHEMA_VERSION,...draft,buildCategory:alphaBuildCategory(),sequence:this.sequence+1,correlation:`run-${this.runOrdinal}` as const};
    try{assertAlphaContentSafeObservabilityEventV1(event);}catch{return"rejected";}
    this.sequence+=1;if(!this.sink)return"disabled";
    try{await this.sink.emit(event);return"emitted";}catch{return"sink-failed";}
  }
}

export const alphaObservationDefaults={roleCategory:"not-applicable",occurrenceCategory:"not-applicable",viewportCategory:"not-applicable",latencyBucket:"not-measured",replayRecoveryCategory:"none",failureCategory:"none",protectedLoadCategory:"not-applicable"} as const;
