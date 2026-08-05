import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  PROTECTED_PAGE_REVALIDATION_MESSAGE,
  requiresProtectedPageRevalidation,
} from "../../components/product-shell/ProtectedPageLifecycleGuard";

const read = (file: string) => readFile(file, "utf8");

async function main() {
  const [guard, signOut, route, middleware] = await Promise.all([
    read("components/product-shell/ProtectedPageLifecycleGuard.tsx"),
    read("components/product-shell/ClerkSessionTerminationControl.tsx"),
    read("app/development/role-aware-live/page.tsx"),
    read("middleware.ts"),
  ]);
  let checks = 0;
  const check = (condition: unknown, message: string) => {
    assert.ok(condition, message);
    checks += 1;
  };

  check(requiresProtectedPageRevalidation({ persisted: true, navigationType: "navigate", veiled: false }), "BFCache restoration revalidates");
  check(requiresProtectedPageRevalidation({ persisted: false, navigationType: "back_forward", veiled: false }), "history restoration revalidates");
  check(requiresProtectedPageRevalidation({ persisted: false, navigationType: "navigate", veiled: true }), "veiled document revalidates");
  check(!requiresProtectedPageRevalidation({ persisted: false, navigationType: "navigate", veiled: false }), "ordinary first navigation does not loop");
  check(PROTECTED_PAGE_REVALIDATION_MESSAGE === "Rechecking access…", "veil copy is generic");
  check(/replaceChildren\(\)/u.test(guard) && /\.inert = true/u.test(guard), "protected DOM is synchronously scrubbed and disabled");
  check(/addEventListener\("pagehide"/u.test(guard) && /addEventListener\("pageshow"/u.test(guard), "page lifecycle is guarded");
  check(/visibilitychange/u.test(guard) && /addEventListener\("freeze"/u.test(guard), "stale and frozen tabs are guarded");
  check(/window\.location\.replace\(window\.location\.href\)/u.test(guard), "restoration requires a hard server navigation");
  check(/veilProtectedPage\(\);[\s\S]*await clerk\.signOut\(\);[\s\S]*window\.location\.replace/u.test(signOut), "sign-out scrubs, awaits Clerk, and replaces history");
  check(/if \(isSigningOut\)/u.test(signOut), "duplicate sign-out is prevented");
  check(/ProtectedPageLifecycleGuard/u.test(route), "protected route uses the generic guard");
  check(/unstable_noStore/u.test(route) && /dynamic = "force-dynamic"/u.test(route), "route remains dynamic and no-store");
  check(/private, no-store, max-age=0/u.test(middleware) && /Vary/u.test(middleware), "middleware retains protected response policy");
  check(!/persona|roleDescription|scopeLabel/u.test(guard), "guard derives no authority from role or persona");

  console.log(JSON.stringify({
    validation: "protected-page-bfcache-history-isolation",
    result: "PASS",
    checks,
    simulated: { bfcache: "revalidate", backForward: "revalidate", firstNavigation: "render" },
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
