"use client";

import { SignIn, useClerk } from "@clerk/nextjs";
import { useState } from "react";

export const SANDBOX_SIGN_IN_PATH = "/development/sandbox-sign-in";
export const CHIEF_V1_PATH = "/product-alpha/leadership-conversation";

export async function terminateSandboxSession(input: {
  signOut(): Promise<void>;
  replace(destination: string): void;
  currentLocation: string;
}): Promise<"signed-out" | "reload-required"> {
  try {
    await input.signOut();
    input.replace(SANDBOX_SIGN_IN_PATH);
    return "signed-out";
  } catch {
    input.replace(input.currentLocation);
    return "reload-required";
  }
}

export function SandboxSignInClient() {
  return (
    <SignIn
      routing="path"
      path={SANDBOX_SIGN_IN_PATH}
      forceRedirectUrl={CHIEF_V1_PATH}
      withSignUp={false}
    />
  );
}

export function SandboxSignOutClient() {
  const clerk = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    await terminateSandboxSession({
      signOut: () => clerk.signOut(),
      replace: (destination) => window.location.replace(destination),
      currentLocation: window.location.href,
    });
  }

  return (
    <button type="button" disabled={isSigningOut} onClick={signOut}>
      {isSigningOut ? "Signing out…" : "Sign out and choose a sandbox user"}
    </button>
  );
}
