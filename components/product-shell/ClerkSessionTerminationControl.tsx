"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useState } from "react";

import { veilProtectedPage } from "./ProtectedPageLifecycleGuard";

const SIGNED_OUT_DESTINATION = "/sign-in";

export function accountDisplayLabel(
  primaryEmail: string | null | undefined,
): string {
  return primaryEmail?.trim() || "Account unavailable";
}

export function useVerifiedPrimaryEmail(): string | null | undefined {
  const { isLoaded, user } = useUser();
  if (!isLoaded) {
    return undefined;
  }
  return user?.primaryEmailAddress?.emailAddress ?? null;
}

export default function ClerkSessionTerminationControl() {
  const clerk = useClerk();
  const primaryEmail = useVerifiedPrimaryEmail();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function terminateSession() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    veilProtectedPage();
    try {
      await clerk.signOut({ redirectUrl: SIGNED_OUT_DESTINATION });
    } catch {
      window.location.replace(SIGNED_OUT_DESTINATION);
    }
  }

  return (
    <section aria-label="Signed-in account">
      <span>Signed in as</span>
      <strong>{accountDisplayLabel(primaryEmail)}</strong>
      <div>
        <button
          type="button"
          disabled={isSigningOut}
          onClick={terminateSession}
        >
          {isSigningOut ? "Signing out…" : "Sign out"}
        </button>
        <button
          type="button"
          disabled={isSigningOut}
          onClick={terminateSession}
        >
          Switch account
        </button>
      </div>
    </section>
  );
}
