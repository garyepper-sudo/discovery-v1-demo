import { registerHooks } from "node:module";

const asModule = source => `data:text/javascript,${encodeURIComponent(source)}`;
const clerk = asModule('export async function auth(){return {userId:globalThis.__discoveryFounderMeetingHomeUserId??"user_founder_route_validation"}}');
const navigation = asModule('export function notFound(){const error=new Error("NEXT_NOT_FOUND");error.code="NEXT_NOT_FOUND";throw error} export function redirect(destination){const error=new Error(`NEXT_REDIRECT:${destination}`);error.code="NEXT_REDIRECT";throw error} export function usePathname(){return "/product-alpha/meetings/founder-route-validation"}');
const founder = asModule('export async function createFounderMeetingHomeComposition(address){return globalThis.__discoveryFounderMeetingHomeComposition(address)}');
const meetingPackActions = asModule('export async function addMeetingPackPrivateNoteAction(){return null}export async function buildMeetingPackAction(){return null}export async function generateSourceScopedExecutiveAnalysisAction(){return {result:{status:"ineligible"}}}export async function refreshMeetingPackDraftAction(){return null}export async function saveMeetingPackAction(){return null}export async function shareMeetingPerspectiveAction(){return []}');
const composer = asModule('export function composeChiefFirstPrepareViewFromWorkspace(){return globalThis.__discoveryFounderMeetingHomePrepare}');
const shell = asModule('import React from "react";export default function DiscoveryShell(props){return React.createElement("div",null,props.children)}');
const sandbox = asModule('globalThis.__discoverySandboxMeetingHomeLoads=(globalThis.__discoverySandboxMeetingHomeLoads??0)+1;export default function SandboxMeetingHome(){return null}');
const serverOnly = asModule("export default undefined");

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "@clerk/nextjs/server") return { url: clerk, shortCircuit: true };
    if (specifier === "next/navigation") return { url: navigation, shortCircuit: true };
    if (specifier === "server-only") return { url: serverOnly, shortCircuit: true };
    if (specifier.endsWith("/founderMeetingHomeComposition")) return { url: founder, shortCircuit: true };
    if (specifier.endsWith("/product-alpha/leadership-conversation/actions")) return { url: meetingPackActions, shortCircuit: true };
    if (specifier.endsWith("/chiefLeadershipPreparationComposer")) return { url: composer, shortCircuit: true };
    if (specifier.endsWith("/product-shell/DiscoveryShell")) return { url: shell, shortCircuit: true };
    if (specifier === "./SandboxMeetingHome") return { url: sandbox, shortCircuit: true };
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith("data:text/javascript,")) return { format: "module", source: decodeURIComponent(url.slice(url.indexOf(",") + 1)), shortCircuit: true };
    if (url.endsWith(".module.css")) return { format: "module", source: "export default new Proxy({}, {get:(_target,key)=>String(key)});", shortCircuit: true };
    return nextLoad(url, context);
  },
});
