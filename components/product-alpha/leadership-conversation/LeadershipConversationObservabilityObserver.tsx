"use client";
import { useEffect, useRef } from "react";
import { observeLeadershipConversationBrowserEventAction } from "../../../app/product-alpha/leadership-conversation/actions";
import type { AlphaContentSafeObservabilityEventV1 } from "../../../lib/observability/alphaContentSafeObservabilityContracts";

type BrowserObservation={stage:AlphaContentSafeObservabilityEventV1["workflowStage"];transition:AlphaContentSafeObservabilityEventV1["transitionCategory"];outcome:AlphaContentSafeObservabilityEventV1["outcomeCategory"];viewport:AlphaContentSafeObservabilityEventV1["viewportCategory"]};
export function LeadershipConversationObservabilityObserver({observation}: {observation:BrowserObservation|null}){
  const last=useRef<string|null>(null);
  useEffect(()=>{if(!observation)return;const key=JSON.stringify(observation);if(last.current===key)return;last.current=key;void observeLeadershipConversationBrowserEventAction(observation).catch(()=>{});},[observation]);
  return null;
}
