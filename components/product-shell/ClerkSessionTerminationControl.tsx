"use client";

import { useClerk } from "@clerk/nextjs";
import { useState } from "react";

import { veilProtectedPage } from "./ProtectedPageLifecycleGuard";

const SIGNED_OUT_DESTINATION = "/your-organization";

export default function ClerkSessionTerminationControl() {
  const clerk = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function terminateSession() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    veilProtectedPage();
    try {
      await clerk.signOut();
      window.location.replace(SIGNED_OUT_DESTINATION);
    } catch {
      window.location.replace(window.location.href);
    }
  }

  return (
    <button
      type="button"
      disabled={isSigningOut}
      onClick={terminateSession}
    >
      {isSigningOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
