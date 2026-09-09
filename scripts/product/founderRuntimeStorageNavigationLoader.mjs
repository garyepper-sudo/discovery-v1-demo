import { registerHooks } from "node:module";

const navigation = `data:text/javascript,${encodeURIComponent('export function usePathname(){return "/product-alpha/meetings/opaque-address";}')}`;
const serverOnly = "data:text/javascript,export default undefined";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/navigation") return { url: navigation, shortCircuit: true };
    if (specifier === "server-only") return { url: serverOnly, shortCircuit: true };
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url === navigation) return { format: "module", source: decodeURIComponent(url.slice(url.indexOf(",") + 1)), shortCircuit: true };
    if (url === serverOnly) return { format: "module", source: "export default undefined", shortCircuit: true };
    if (url.endsWith(".module.css")) return { format: "module", source: "export default new Proxy({}, {get:(_target,key)=>String(key)});", shortCircuit: true };
    return nextLoad(url, context);
  },
});
