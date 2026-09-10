import "server-only";
import type {FounderAddGovernedContextInput} from "./founderAddGovernedContextForm";
import {FounderFirstUnderstandingOwnerBundle} from "./founderFirstUnderstandingOwnerBundle";

export type FounderAddGovernedContextResult={status:"applied"|"replayed";sourceCount:number;meetingHomeDestination:string}|{status:"unavailable"|"conflict"|"retry-required"};

/** Request-local composition only. Source, scope, and Prepared Work durability
 * remain with their existing canonical owners. */
export class FounderAddGovernedContextApplicationService{
 constructor(private readonly owners:FounderFirstUnderstandingOwnerBundle){}
 async apply(seriesAddress:string,input:FounderAddGovernedContextInput):Promise<FounderAddGovernedContextResult>{
  try{
   const plan=await this.owners.planAddContext(seriesAddress,input.sources);
   await this.owners.admitSources(plan.questionId);
   const scope=await this.owners.registerSuccessorScope(plan.questionId);
   const prepared=await this.owners.recordSuccessorPreparation();
   const current=await this.owners.rereadAddContextResult();return{status:plan.replayed||!scope.committed||prepared.replayed?"replayed":"applied",sourceCount:current.sourceCount,meetingHomeDestination:`/product-alpha/meetings/${seriesAddress}`};
  }catch(error){const message=error instanceof Error?error.message:"",code=error&&typeof error==="object"&&"code" in error?String(error.code):"";if(code==="conflict"||/conflict|idempotency|immutable|duplicate/iu.test(message))return{status:"conflict"};if(code==="unavailable"||["EACCES","EPERM","ECONNREFUSED","ENOTFOUND"].includes(code)||/unavailable|denied|configuration|setup is required/iu.test(message))return{status:"unavailable"};return{status:"retry-required"};}
 }
 close(){return this.owners.close();}
}
