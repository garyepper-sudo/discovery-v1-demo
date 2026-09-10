import assert from "node:assert/strict";
import { FounderAddContextReconciliationApplicationService } from "../../lib/alpha-activation/founderAddContextReconciliationApplicationService";

type Result={status:"dry-run"|"applied";sourceWrites:number;scopeWrites:number;preparedWorkWrites:number;sourceCount:number};
class Owners {
  calls:boolean[]=[];
  constructor(private readonly plans:Result[]) {}
  async reconcileAddContext(_address:string,apply:boolean){this.calls.push(apply);const plan=this.plans[apply?1:0]??this.plans[0]!;return plan;}
  async close(){}
}
const plan=(scopeWrites:number,preparedWorkWrites:number):Result=>({status:"dry-run",sourceWrites:0,scopeWrites,preparedWorkWrites,sourceCount:5});

async function main(){
 let checks=0;
 const pending=new Owners([plan(1,1),{...plan(1,1),status:"applied"}]);
 const service=new FounderAddContextReconciliationApplicationService(pending as never);
 assert.deepEqual(await service.project("2mjUlX61y_lU76Z0g7Oh2O1G"),{status:"available",sourceCount:5});checks++;
 assert.deepEqual(await service.apply("2mjUlX61y_lU76Z0g7Oh2O1G"),{status:"applied",sourceCount:5,meetingHomeDestination:"/product-alpha/meetings/2mjUlX61y_lU76Z0g7Oh2O1G"});assert.deepEqual(pending.calls,[false,false,true]);checks+=2;
 const complete=new Owners([plan(0,0)]),replay=new FounderAddContextReconciliationApplicationService(complete as never);
 assert.deepEqual(await replay.project("2mjUlX61y_lU76Z0g7Oh2O1G"),{status:"not-needed",sourceCount:5});assert.equal((await replay.apply("2mjUlX61y_lU76Z0g7Oh2O1G")).status,"replayed");assert.deepEqual(complete.calls,[false,false]);checks+=3;
 const unsafe=new Owners([{...plan(2,1)}]),blocked=new FounderAddContextReconciliationApplicationService(unsafe as never);
 assert.deepEqual(await blocked.apply("2mjUlX61y_lU76Z0g7Oh2O1G"),{status:"unavailable"});assert.deepEqual(unsafe.calls,[false]);checks+=2;
 const failed={reconcileAddContext:async()=>{throw new Error("ambiguous")},close:async()=>undefined};
 assert.deepEqual(await new FounderAddContextReconciliationApplicationService(failed as never).project("2mjUlX61y_lU76Z0g7Oh2O1G"),{status:"unavailable"});checks++;
 console.log(`RESULT PASS authenticated-add-context-reconciliation checks=${checks} source-writes=0 replay-writes=0 ambiguity=fail-closed`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
