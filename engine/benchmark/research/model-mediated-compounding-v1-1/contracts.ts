import {createHash} from "node:crypto";
import {OUTPUT_KINDS,OUTPUT_STATUSES,PROVIDER_MANIFEST,stable} from "../model-mediated-compounding-v1/contracts";
export const V11_VERSION="model-mediated-compounding/v1.1" as const;
export const V11_OUTPUT_VERSION="meeting-preparation-output/v1.1" as const;
export const V11_SCHEMA_NAME="meeting_preparation_output_v1_1" as const;
export const digest=(value:string|Buffer)=>createHash("sha256").update(value).digest("hex");
const string={type:"string"} as const,nullableString={anyOf:[{type:"string"},{type:"null"}]} as const;
export const V11_OUTPUT_SCHEMA={
  name:V11_SCHEMA_NAME,strict:true,schema:{type:"object",additionalProperties:false,
    required:["schemaVersion","items","agenda","questions","followThrough"],properties:{
      schemaVersion:{type:"string",enum:[V11_OUTPUT_VERSION]},
      items:{type:"array",maxItems:40,items:{type:"object",additionalProperties:false,required:["statement","kind","status","sourceRefs","owner","deadline","priority"],properties:{statement:string,kind:{type:"string",enum:OUTPUT_KINDS},status:{type:"string",enum:OUTPUT_STATUSES},sourceRefs:{type:"array",maxItems:12,items:string},owner:nullableString,deadline:nullableString,priority:{type:"integer",enum:[1,2,3]}}}},
      agenda:{type:"array",maxItems:12,items:{type:"object",additionalProperties:false,required:["topic","priority","basisSourceRefs"],properties:{topic:string,priority:{type:"integer",enum:[1,2,3]},basisSourceRefs:{type:"array",maxItems:12,items:string}}}},
      questions:{type:"array",maxItems:12,items:{type:"object",additionalProperties:false,required:["question","basisSourceRefs","discriminatesBetween"],properties:{question:string,basisSourceRefs:{type:"array",maxItems:12,items:string},discriminatesBetween:{type:"array",maxItems:4,items:string}}}},
      followThrough:{type:"array",maxItems:12,items:{type:"object",additionalProperties:false,required:["action","owner","deadline","expectedOutcome","sourceRefs"],properties:{action:string,owner:nullableString,deadline:nullableString,expectedOutcome:nullableString,sourceRefs:{type:"array",maxItems:12,items:string}}}}
    }
  }
} as const;
export const V11_SCHEMA_DIGEST=digest(stable(V11_OUTPUT_SCHEMA));
export const V11_PROVIDER_MANIFEST={...PROVIDER_MANIFEST,schemaVersion:"model-mediated-provider-manifest/v1.1-pilot",outputSchemaVersion:V11_OUTPUT_VERSION,transportResumeAttempts:0,previousV1Attempts:16,maximumV11Attempts:192,maximumCumulativeAttempts:208,maximumRemainingResumeAttempts:0,resumePolicy:"prohibited",requestCount:192,concurrency:4,projectedMaximumChargeUsd:4.679084,projectedMaximumChargeMicros:4_679_084,projectedMaximumIncludingEligibleResumesMicros:4_679_084,authorizedChargeCeilingUsd:6,authorizedChargeCeilingMicros:6_000_000,perClaimConservativeReservationUsd:undefined,obsoleteExecutionCeilings:[] as never[]} as const;
export type V11Output={schemaVersion:typeof V11_OUTPUT_VERSION;items:Array<{statement:string;kind:typeof OUTPUT_KINDS[number];status:typeof OUTPUT_STATUSES[number];sourceRefs:string[];owner:string|null;deadline:string|null;priority:1|2|3}>;agenda:Array<{topic:string;priority:1|2|3;basisSourceRefs:string[]}>;questions:Array<{question:string;basisSourceRefs:string[];discriminatesBetween:string[]}>;followThrough:Array<{action:string;owner:string|null;deadline:string|null;expectedOutcome:string|null;sourceRefs:string[]}>};
