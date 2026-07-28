"use client";

import { useClerk } from "@clerk/nextjs";
import { useState } from "react";

const SIGNED_OUT_DESTINATION = "/your-organization";

export default function ClerkSessionTerminationControl() {
  const clerk = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function terminateSession() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    try {
      await clerk.signOut();
      window.location.replace(SIGNED_OUT_DESTINATION);
    } catch {
      setIsSigningOut(false);
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
