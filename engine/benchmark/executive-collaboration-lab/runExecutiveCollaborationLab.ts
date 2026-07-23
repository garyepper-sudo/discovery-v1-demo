import { executiveConversationScenarios } from "./executiveConversationScenarios";
import { runExecutiveConversationScenario } from "./runExecutiveConversationScenario";
import { scoreExecutiveConversation, COLLABORATION_WEIGHTS } from "./scoreExecutiveConversation";
import type { CollaborationDimension } from "./executiveConversationTypes";

export function runExecutiveCollaborationLab(scenarios = executiveConversationScenarios) {
  const results = scenarios.map((scenario) => { const run = runExecutiveConversationScenario(scenario); return { scenario, run, score: scoreExecutiveConversation(scenario, run) }; });
  const dimensions = Object.keys(COLLABORATION_WEIGHTS).reduce((acc, key) => { const dimension = key as CollaborationDimension; acc[dimension] = Math.round(results.reduce((sum,item)=>sum+item.score.dimensions[dimension],0)/results.length*100)/100; return acc; }, {} as Record<CollaborationDimension,number>);
  return { results, dimensions, overallScore: Math.round(results.reduce((sum,item)=>sum+item.score.score,0)/results.length*100)/100, criticalFailures: results.flatMap((item)=>item.score.criticalFailures.map((failure)=>({scenarioId:item.scenario.id,failure}))), warnings: results.flatMap((item)=>item.score.warnings.map((warning)=>({scenarioId:item.scenario.id,warning}))) };
}
