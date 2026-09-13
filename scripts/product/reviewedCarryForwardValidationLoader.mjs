import { createRequire, registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

const unavailableHeaders = `data:text/javascript,${encodeURIComponent(`export function cookies(){throw new Error("next/headers is unavailable in the reviewed carry-forward filesystem validator");}export function headers(){throw new Error("next/headers is unavailable in the reviewed carry-forward filesystem validator");}`)}`;
const unavailableClerk = `data:text/javascript,${encodeURIComponent(`export async function auth(){return {userId:process.env.DISCOVERY_SANDBOX_CEO_USER_ID??"user_validationceo",sessionId:"reviewed-carry-forward-validation"};}`)}`;
const require = createRequire(import.meta.url);
const ordinaryReact = pathToFileURL(require.resolve("react")).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/headers") return { url: unavailableHeaders, shortCircuit: true };
    if (specifier === "@clerk/nextjs/server") return { url: unavailableClerk, shortCircuit: true };
    if (specifier === "react") return { url: ordinaryReact, shortCircuit: true };
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url === unavailableHeaders || url === unavailableClerk) return { format: "module", source: decodeURIComponent(url.slice(url.indexOf(",") + 1)), shortCircuit: true };
    return nextLoad(url, context);
  },
});
