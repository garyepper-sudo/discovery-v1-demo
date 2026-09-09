"use server";
import {parseFounderAddGovernedContextForm} from "../../../../lib/alpha-activation/founderAddGovernedContextForm";
import {normalizeFounderAddGovernedContextActionForm} from "../../../../lib/alpha-activation/founderAddGovernedContextTransport";
import {createFounderAddGovernedContextApplicationServiceFromRequest} from "../../../../lib/alpha-activation/founderFirstUnderstandingRequestComposition";

export type FounderAddContextActionState={status:"idle"|"success"|"error";sourceCount:number|null;destination:string|null;message:string|null};

export async function addFounderGovernedContextAction(seriesAddress:string,_previous:FounderAddContextActionState,data:FormData):Promise<FounderAddContextActionState>{
 if(process.env.NODE_ENV==="production"||process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED!=="true")return{status:"error",sourceCount:null,destination:null,message:"Adding governed context is unavailable."};
 let input;try{input=await parseFounderAddGovernedContextForm(normalizeFounderAddGovernedContextActionForm(data));}catch(error){return{status:"error",sourceCount:null,destination:null,message:error instanceof Error?error.message:"Check the selected files and purposes."};}
 let service;try{service=await createFounderAddGovernedContextApplicationServiceFromRequest();}catch{return{status:"error",sourceCount:null,destination:null,message:"Adding governed context is unavailable."};}
 try{const result=await service.apply(seriesAddress,input);if(result.status==="applied"||result.status==="replayed")return{status:"success",sourceCount:result.sourceCount,destination:result.meetingHomeDestination,message:null};return{status:"error",sourceCount:null,destination:null,message:result.status==="conflict"?"The selected context conflicts with the current preparation.":"Some lawful source work may already be saved. Submit the exact same files and purposes to continue."};}
 finally{await service.close();}
}
