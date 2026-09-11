import { accountDisplayLabel } from "../../components/product-shell/ClerkSessionTerminationControl";
import { readFile } from "node:fs/promises";

function requireCondition(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const source = await readFile(new URL("../../components/product-shell/ClerkSessionTerminationControl.tsx", import.meta.url), "utf8");
  const onboarding = await readFile(new URL("../../app/onboarding/identity/IdentitySetup.tsx", import.meta.url), "utf8");
  const meetingHome = await readFile(new URL("../../app/product-alpha/meetings/[seriesAddress]/page.tsx", import.meta.url), "utf8");

  requireCondition(accountDisplayLabel("garyepper@gmail.com") === "garyepper@gmail.com", "primary email label must remain exact");
  requireCondition(accountDisplayLabel(undefined) === "Account unavailable", "missing primary email must fail closed");
  requireCondition(source.includes('redirectUrl: SIGNED_OUT_DESTINATION'), "sign-out must use the fixed destination");
  requireCondition(!source.includes("window.location.href"), "sign-out must not reuse a browser-supplied destination");
  requireCondition(source.includes("Switch account"), "switch-account control must be visible");
  requireCondition(onboarding.includes("Create a Discovery identity for {accountCopy}."), "setup copy must name the visible account");
  requireCondition(onboarding.includes("<ClerkSessionTerminationControl />"), "identity page must expose session controls in every state");
  requireCondition(meetingHome.includes("sessionControl={<ClerkSessionTerminationControl />}"), "Meeting Home must expose the account control");

  console.log(JSON.stringify({ validation: "founder-account-visibility-signout-v1", result: "PASS" }));
}

void main();
