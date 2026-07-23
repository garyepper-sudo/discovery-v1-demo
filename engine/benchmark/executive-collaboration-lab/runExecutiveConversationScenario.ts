import { runDiscoveryV3 } from "../../v3";
import { evolveOrganizationRuntime } from "../../v3/runtime";
import { saveExecutiveDecisionRecord } from "../../v3/decisions/saveExecutiveDecisionRecord";
import { buildAskExperienceView } from "../../../components/product-shell/data/buildAskExperienceView";
import { buildSessionImpact } from "../../../components/product-shell/data/buildSessionImpact";
import { createLeadershipDecisionRecord } from "../../../components/product-shell/data/createLeadershipDecisionRecord";
import type { SessionEntry } from "../../../components/product-shell/shared/InteractionSession";
import type { ExecutiveConversationInterpreter, ExecutiveConversationTurn as ConversationContextTurn } from "../../conversation";
import type { ConversationAction, ExecutiveConversationRun, ExecutiveConversationScenario } from "./executiveConversationTypes";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const concepts = (message: string, groups: string[][]) => groups.filter((group) => group.some((item) => normalized(message).includes(normalized(item)))).map((group) => group[0]);

function withFixedClock<T>(timestamp: string, operation: () => T): T {
  const RealDate = Date;
  const realRandom = Math.random;
  class FixedDate extends RealDate { constructor(value?: string | number | Date) { super(value === undefined ? timestamp : value); } static now() { return new RealDate(timestamp).getTime(); } }
  globalThis.Date = FixedDate as DateConstructor;
  Math.random = () => 0.107;
  try { return operation(); } finally { globalThis.Date = RealDate; Math.random = realRandom; }
}

export async function runExecutiveConversationScenario(
  scenario: ExecutiveConversationScenario,
  interpreter: ExecutiveConversationInterpreter | null = null,
): Promise<ExecutiveConversationRun> {
  let runtime = clone(scenario.initialRuntime);
  const initial = clone(runtime);
  const sessionEntries: SessionEntry[] = [];
  const trace: ExecutiveConversationRun["trace"] = [];
  const hardFailures: string[] = [];
  const fixedTimestamp = "2026-07-23T00:00:00.000Z";
  const recentConversation: ConversationContextTurn[] = [];

  const executiveTurns = scenario.turns.filter((turn) => turn.speaker === "executive");
  for (const [index, turn] of executiveTurns.entries()) {
    let interpretation = null;
    if (interpreter) {
      try {
        interpretation = await interpreter.interpret({
          currentMessage: turn.message,
          recentConversation: recentConversation.slice(-6),
          runtime,
        });
      } catch {
        interpretation = null;
      }
    }
    const providerObservation = interpreter && "lastObservation" in interpreter
      ? (interpreter as { lastObservation: import("../../conversation").ProviderConversationObservation | null }).lastObservation
      : null;
    const ask = buildAskExperienceView(runtime, interpretation);
    const response = [ask.question?.text, ask.answer?.headline, ask.answer?.summary].filter(Boolean).join(" ");
    const durableWrites: ConversationAction[] = [];
    if (turn.action === "brainstorm" || turn.action === "run-experiment") sessionEntries.push({ id: `${scenario.id}-${index}-provisional`, action: turn.action === "brainstorm" ? "brainstorm" : "stress-test", kind: "discussion", label: turn.message, status: "provisional" });
    if (turn.action === "save-evidence") {
      const company = runtime.metadata.name ?? scenario.organizationId;
      runtime = withFixedClock(fixedTimestamp, () => evolveOrganizationRuntime({ runtime, result: runDiscoveryV3({ company, website: "", industry: "", question: "What does this executive evidence change?", context: turn.message }), input: { company, website: "", industry: "", question: "What does this executive evidence change?", context: turn.message } }));
      durableWrites.push("save-evidence"); sessionEntries.push({ id: `${scenario.id}-${index}-saved`, action: "save-insight", kind: "observation", label: turn.message, status: "saved" });
    }
    if (turn.action === "open-decision") {
      const interactionId = `${scenario.id}-decision`;
      const record = createLeadershipDecisionRecord({ organizationId: scenario.organizationId, interactionId, consideration: turn.message, whyNow: "Explicitly opened during the executive conversation.", targetConditionIds: ["condition-decision-flow"], createdAt: fixedTimestamp });
      runtime = saveExecutiveDecisionRecord({ runtime, record });
      durableWrites.push("open-decision"); sessionEntries.push({ id: `${scenario.id}-decision`, action: "create-decision", kind: "decision", label: turn.message, status: "saved" });
    }
    trace.push({ turn: index + 1, executiveMessage: turn.message, action: turn.action, interpretation, providerObservation, discoveryResponse: response, questionCount: (response.match(/\?/g) ?? []).length, recognizedConcepts: concepts(response, scenario.expected.requiredConcepts), challenged: interpretation?.recommendedConversationalAction === "challenge" || /uncertain|alternative|rather than|not enough|evidence|clarif/i.test(response), recommendationPresent: turn.action === "run-experiment" || turn.action === "open-decision", durableWrites });
    recentConversation.push(
      { speaker: "executive", message: turn.message },
      { speaker: "discovery", message: response },
    );
  }

  const impact = buildSessionImpact(sessionEntries);
  const decisionDelta = runtime.memory.executiveDecisionRecords.length - initial.memory.executiveDecisionRecords.length;
  const investigationDelta = runtime.metadata.investigationCount - initial.metadata.investigationCount;
  if (scenario.expected.prohibitedDurableWrites.some((action) => trace.some((item) => item.durableWrites.includes(action)))) hardFailures.push("provisional content persisted as truth");
  if (!scenario.turns.some((turn) => turn.action === "open-decision") && decisionDelta > 0) hardFailures.push("decision created without explicit executive action");
  if (runtime.metadata.organizationId !== scenario.organizationId) hardFailures.push("organization identity loss");
  if (impact.durable.length !== decisionDelta + investigationDelta) hardFailures.push("fabricated Runtime change in Session Impact");
  return { scenarioId: scenario.id, organizationId: scenario.organizationId, trace, finalRuntime: runtime, sessionImpact: { durable: impact.durable.map((item) => ({ action: item.action, label: item.label })), provisional: impact.provisional.map((item) => ({ action: item.action, label: item.label })) }, runtimeDiff: { decisionDelta, investigationDelta, unrelatedAreasPreserved: JSON.stringify((runtime.memory as any).organizationalConditions?.find((item: any) => item.id === "condition-knowledge")) === JSON.stringify((initial.memory as any).organizationalConditions?.find((item: any) => item.id === "condition-knowledge")) }, hardFailures };
}
