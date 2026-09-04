import { createHash } from "node:crypto";

export const LABEL = "SYNTHETIC MODEL-MEDIATED BENCHMARK — NOT CUSTOMER OR PRODUCTION EVIDENCE";
export const VERSION = "model-mediated-compounding/v1";
export const CONDITIONS = ["A", "B", "C", "D"] as const;
export const QUALITIES = ["100", "95", "90", "80", "stale-biased"] as const;
export const OUTPUT_KINDS = ["decision","non-decision","commitment","question","unknown","assumption","contradiction","competing-explanation","material-change","other"] as const;
export const OUTPUT_STATUSES = ["canonical","nonauthoritative","uncertain","disputed","rejected","superseded","unresolved","explicitly-not-decided"] as const;
export type Condition = typeof CONDITIONS[number];
export type ReviewQuality = typeof QUALITIES[number];
export type OutputKind = typeof OUTPUT_KINDS[number];
export type OutputStatus = typeof OUTPUT_STATUSES[number];

export const stable = (value: unknown): string => Array.isArray(value) ? `[${value.map(stable).join(",")}]` : value && typeof value === "object" ? `{${Object.entries(value as Record<string, unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${JSON.stringify(k)}:${stable(v)}`).join(",")}}` : JSON.stringify(value);
export const sha256 = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");

export interface DerivedPacket {
  schemaVersion: "model-mediated-execution-packet/v1";
  requestId: string; sourcePacketId: string; graderPacketId: string;
  scenarioPseudonym: string; seed: number; cycle: number; contextBudget: number;
  condition: Condition; reviewQuality: ReviewQuality; inputTokenEstimate: number;
  request: { system: string; user: string; schema: typeof MEETING_OUTPUT_SCHEMA };
}
export interface MeetingOutput {
  schemaVersion: "meeting-preparation-output/v1";
  items: Array<{statement:string;kind:OutputKind;status:OutputStatus;sourceRefs:string[];owner:string|null;deadline:string|null;priority:1|2|3}>;
  agenda:Array<{topic:string;priority:1|2|3;basisSourceRefs:string[]}>;
  questions:Array<{question:string;basisSourceRefs:string[];discriminatesBetween:string[]}>;
  followThrough:Array<{action:string;owner:string|null;deadline:string|null;expectedOutcome:string|null;sourceRefs:string[]}>;
}

const str={type:"string"} as const, nullable={anyOf:[str,{type:"null"}]} as const;
export const MEETING_OUTPUT_SCHEMA={
  name:"meeting_preparation_output_v1",strict:true,schema:{type:"object",additionalProperties:false,required:["schemaVersion","items","agenda","questions","followThrough"],properties:{
    schemaVersion:{const:"meeting-preparation-output/v1"},
    items:{type:"array",maxItems:40,items:{type:"object",additionalProperties:false,required:["statement","kind","status","sourceRefs","owner","deadline","priority"],properties:{statement:str,kind:{enum:OUTPUT_KINDS},status:{enum:OUTPUT_STATUSES},sourceRefs:{type:"array",maxItems:12,items:str},owner:nullable,deadline:nullable,priority:{enum:[1,2,3]}}}},
    agenda:{type:"array",maxItems:12,items:{type:"object",additionalProperties:false,required:["topic","priority","basisSourceRefs"],properties:{topic:str,priority:{enum:[1,2,3]},basisSourceRefs:{type:"array",maxItems:12,items:str}}}},
    questions:{type:"array",maxItems:12,items:{type:"object",additionalProperties:false,required:["question","basisSourceRefs","discriminatesBetween"],properties:{question:str,basisSourceRefs:{type:"array",maxItems:12,items:str},discriminatesBetween:{type:"array",maxItems:4,items:str}}}},
    followThrough:{type:"array",maxItems:12,items:{type:"object",additionalProperties:false,required:["action","owner","deadline","expectedOutcome","sourceRefs"],properties:{action:str,owner:nullable,deadline:nullable,expectedOutcome:nullable,sourceRefs:{type:"array",maxItems:12,items:str}}}}
  }}
} as const;

export const SYSTEM_INSTRUCTION = `Prepare a concise meeting brief using only the supplied synthetic authorized context. Treat opaque source references as citations, never as answer keys. Distinguish canonical, nonauthoritative, uncertain, disputed, rejected, superseded, unresolved, and explicitly-not-decided states. Do not infer missing facts or expose private reasoning. Return only schema-valid JSON.`;

export const PROVIDER_MANIFEST={schemaVersion:"model-mediated-provider-manifest/v1",provider:"OpenAI Responses API",requestedModel:"gpt-5.6-sol",requiredReturnedModel:"gpt-5.6-sol",promptTemplateVersion:"model-mediated-meeting-preparation/v1",outputSchemaVersion:"meeting-preparation-output/v1",store:false,tools:[],temperature:0,topP:"provider-default-1",seed:"unsupported",maxOutputTokens:1024,truncation:"disabled",serviceTier:"default",timeoutMs:180000,concurrency:4,automaticSemanticRetries:0,transportResumeAttempts:1,requestCount:1920,inputTokenEstimate:1844550,conservativeInputTokenCeiling:2500000,outputTokenCeiling:1966080,inputPriceUsdPerMillion:4,cachedInputPriceUsdPerMillion:.4,cacheWriteInputPriceUsdPerMillion:5,outputPriceUsdPerMillion:20,reasoningTokensIncludedInOutputTokens:true,pricingSource:"OpenAI official API pricing supplied by frozen provider specialist",pricingAsOf:"2026-09-03",costFormula:"(uncached_input*4 + cached_input*.4 + cache_write_input*5 + output_tokens*20) / 1e6; reasoning_tokens are not billed twice",projectedMaximumChargeUsd:49.321600000000004,projectedMaximumChargeMicros:49321600,projectedMaximumIncludingEligibleResumesMicros:49321600,authorizedChargeCeilingUsd:49.3216,authorizedChargeCeilingMicros:49321600,costAccountingUnit:"integer microdollars",perClaimConservativeReservationUsd:5,judgeRequests:0} as const;
