import { registerHooks } from "node:module";

const asModule = source => `data:text/javascript,${encodeURIComponent(source)}`;
const clerk = asModule('export async function auth(){return {userId:"user_founder_route_validation"}}');
const navigation = asModule('export function notFound(){const error=new Error("NEXT_NOT_FOUND");error.code="NEXT_NOT_FOUND";throw error} export function redirect(destination){const error=new Error(`NEXT_REDIRECT:${destination}`);error.code="NEXT_REDIRECT";throw error} export function usePathname(){return "/product-alpha/meetings/founder-route-validation"}');
const founder = asModule('export async function resolveFounderFirstUnderstandingMeetingHome(address,supplied){return globalThis.__discoveryFounderMeetingHomeResult(address,supplied)}');
const addContext = asModule('import React from "react";export function FounderAddGovernedContextForm(){return React.createElement("div",{"data-add-context":"eligible"},"Add governed context") }');
const recovery = asModule('import React from "react";export function FounderAddContextRecovery(){return React.createElement("div",{"data-context-recovery":"eligible"},"Finish context refresh") }');
const sandbox = asModule('globalThis.__discoverySandboxMeetingHomeLoads=(globalThis.__discoverySandboxMeetingHomeLoads??0)+1;export default function SandboxMeetingHome(){return null}');
const serverOnly = asModule("export default undefined");

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "@clerk/nextjs/server") return { url: clerk, shortCircuit: true };
    if (specifier === "next/navigation") return { url: navigation, shortCircuit: true };
    if (specifier === "server-only") return { url: serverOnly, shortCircuit: true };
    if (specifier.endsWith("/founderFirstUnderstandingMeetingHome")) return { url: founder, shortCircuit: true };
    if (specifier.endsWith("/FounderAddGovernedContextForm")) return { url: addContext, shortCircuit: true };
    if (specifier.endsWith("/FounderAddContextRecovery")) return { url: recovery, shortCircuit: true };
    if (specifier === "./SandboxMeetingHome") return { url: sandbox, shortCircuit: true };
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith("data:text/javascript,")) return { format: "module", source: decodeURIComponent(url.slice(url.indexOf(",") + 1)), shortCircuit: true };
    if (url.endsWith(".module.css")) return { format: "module", source: "export default new Proxy({}, {get:(_target,key)=>String(key)});", shortCircuit: true };
    return nextLoad(url, context);
  },
});
