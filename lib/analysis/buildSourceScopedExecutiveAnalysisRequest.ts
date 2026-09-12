import {DEFAULT_SOURCE_SCOPED_ANALYSIS_TIMEOUT_MS,SOURCE_SCOPED_PROMPT_ID,SOURCE_SCOPED_SCHEMA_ID,assertSourceScopedModelConfiguration,assertSourceScopedPacket,sourceScopedDigest,sourceScopedStable,type SourceScopedCitationV1,type SourceScopedModelConfigurationV1,type SourceScopedPacketV1,type SourceScopedRequestV1,type SourceScopedSectionsV1} from "./sourceScopedExecutiveAnalysisContracts";
const sectionNames=["whatMattersNow","whyItMatters","competingExplanations","whatChanged","decisions","notDecided","commitments","openQuestions","contradictions","evidenceUncertainty","modelUncertainty","organizationalDisagreement","attention","whatWouldChangeAssessment"] as const;
const exact=(value:unknown,keys:readonly string[])=>Boolean(value&&typeof value==="object"&&!Array.isArray(value)&&Object.keys(value).sort().join("\0")===[...keys].sort().join("\0"));
const citation={type:"object",additionalProperties:false,required:["sourceAlias","startLine","endLine"],properties:{sourceAlias:{type:"string"},startLine:{type:"integer",minimum:1},endLine:{type:"integer",minimum:1}}};
const item={type:"object",additionalProperties:false,required:["statement","citations","factCheck"],properties:{statement:{type:"string"},citations:{type:"array",minItems:1,items:citation},factCheck:{type:"string",enum:["PASS","HUMAN REVIEW REQUIRED"]}}};
export const sourceScopedOutputSchema={type:"object",additionalProperties:false,required:["sections"],properties:{sections:{type:"object",additionalProperties:false,required:[...sectionNames],properties:Object.fromEntries(sectionNames.map(name=>[name,{type:"array",items:item}]))}}} as const;

type ProviderCitationV1={sourceAlias:string;startLine:number;endLine:number};
type ProviderItemV1={statement:string;citations:ProviderCitationV1[];factCheck:"PASS"|"HUMAN REVIEW REQUIRED"};
export const MAX_PROVIDER_SAFE_QUESTION_LENGTH=4000;

function numbered(body:string){return body.split("\n").map((line,index)=>`${index+1}: ${line}`).join("\n");}

/** The internal packet remains local. This request-scoped map is constructed
 * only after its existing authorization and integrity checks have succeeded. */
export function projectProviderSafeSourceScopedRequest(request:SourceScopedRequestV1){
  const question=request.question.normalize("NFC").trim(),forbidden=[request.packet.organizationId,request.packet.subjectId,request.packet.questionId,request.packet.seriesId,request.packet.occurrenceId,...request.packet.sources.flatMap(source=>[source.sourceId,source.sourceVersion,source.bodyDigest,source.title])];
  if(!question||question.length>MAX_PROVIDER_SAFE_QUESTION_LENGTH||forbidden.some(value=>value&&question.includes(value)))throw new Error("Provider question is unavailable.");
  const aliases=new Map<string,{sourceId:string;sourceVersion:string;bodyDigest:string;sourcePacketDigest:string;lineCount:number}>();
  const sources=[...request.packet.sources].map((source,index)=>{
    const sourceAlias=`Source ${String.fromCharCode(65+index)}`,lineCount=source.body.split("\n").length;
    if(aliases.has(sourceAlias))throw new Error("Provider source aliases are invalid.");
    aliases.set(sourceAlias,{sourceId:source.sourceId,sourceVersion:source.sourceVersion,bodyDigest:source.bodyDigest,sourcePacketDigest:request.packet.packetDigest,lineCount});
    return{sourceAlias,body:numbered(source.body)};
  });
  const rehydrate=(value:unknown):SourceScopedSectionsV1=>{
    if(!exact(value,["sections"]))throw new Error("Provider candidate is invalid.");
    const external=(value as {sections:unknown}).sections;
    if(!exact(external,sectionNames))throw new Error("Provider candidate is invalid.");
    const restored=Object.fromEntries(sectionNames.map(name=>{
      const items=(external as Record<string,unknown>)[name];
      if(!Array.isArray(items))throw new Error("Provider candidate is invalid.");
      return[name,items.map(item=>{
        if(!exact(item,["statement","citations","factCheck"])||typeof (item as {statement?:unknown}).statement!=="string"||!Array.isArray((item as {citations?:unknown}).citations)||!((item as {citations:unknown[]}).citations).length||!(["PASS","HUMAN REVIEW REQUIRED"] as string[]).includes((item as {factCheck?:unknown}).factCheck as string))throw new Error("Provider candidate is invalid.");
        const seenPassages=new Set<string>(),citations=(item as {citations:unknown[]}).citations.flatMap(citation=>{
          if(!exact(citation,["sourceAlias","startLine","endLine"]))throw new Error("Provider citation is invalid.");
          const {sourceAlias,startLine,endLine}=citation as ProviderCitationV1,source=aliases.get(sourceAlias);
          if(!source||!Number.isSafeInteger(startLine)||!Number.isSafeInteger(endLine)||startLine<1||endLine<startLine||endLine>source.lineCount)throw new Error("Provider citation is invalid.");
          const passage=`${sourceAlias}\u0000${startLine}\u0000${endLine}`;
          if(seenPassages.has(passage))return[];
          seenPassages.add(passage);
          const internal:SourceScopedCitationV1={sourceId:source.sourceId,sourceVersion:source.sourceVersion,bodyDigest:source.bodyDigest,sourcePacketDigest:source.sourcePacketDigest,startLine,endLine};
          return[internal];
        });
        return{statement:(item as ProviderItemV1).statement,citations,factCheck:(item as ProviderItemV1).factCheck};
      })];
    }));
    return restored as SourceScopedSectionsV1;
  };
  return{providerInput:{schemaVersion:"1",question:{text:question},sources},rehydrate};
}

export function sourceScopedModelConfiguration(input:{providerFamily:string;model:string;timeoutMs?:number}):SourceScopedModelConfigurationV1{const base={contractVersion:"1" as const,providerFamily:input.providerFamily,model:input.model,reasoning:"high" as const,maxOutputTokens:25000 as const,timeoutMs:input.timeoutMs??DEFAULT_SOURCE_SCOPED_ANALYSIS_TIMEOUT_MS,store:false as const,tools:[] as [],schemaId:SOURCE_SCOPED_SCHEMA_ID,promptId:SOURCE_SCOPED_PROMPT_ID},configuration={...base,configurationDigest:sourceScopedDigest(base)};assertSourceScopedModelConfiguration(configuration);return configuration;}
export function buildSourceScopedExecutiveAnalysisRequest(input:{packet:SourceScopedPacketV1;question:string;configuration:SourceScopedModelConfigurationV1}):{request:SourceScopedRequestV1;requestBytes:string}{assertSourceScopedPacket(input.packet);assertSourceScopedModelConfiguration(input.configuration);const prompt="Produce compact executive working analysis grounded only in the supplied sources. Preserve competing explanations; distinguish evidence uncertainty, model uncertainty, and organizational disagreement. Do not infer authority or invent decisions, commitments, owners, dates, metrics, or causal certainty. Every material claim requires exact supplied citations. Mark mechanically unverified claims HUMAN REVIEW REQUIRED.";const base={contractVersion:"1" as const,packet:{...input.packet,sources:[...input.packet.sources].sort((a,b)=>a.effectiveAt.localeCompare(b.effectiveAt)||a.sourceId.localeCompare(b.sourceId))},question:input.question,configuration:input.configuration,prompt,promptDigest:sourceScopedDigest(prompt),schemaDigest:sourceScopedDigest(sourceScopedOutputSchema)};const request={...base,requestDigest:sourceScopedDigest(base)};return{request,requestBytes:sourceScopedStable(request)};}
