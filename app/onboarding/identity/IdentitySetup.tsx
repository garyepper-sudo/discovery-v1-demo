"use client";
import { useState } from "react";
import type { AuthenticatedParticipantLookupStatus } from "../../../lib/auth/authenticatedParticipantIdentityRecognition";
import { completeDiscoveryIdentitySetup } from "./actions";

export function IdentitySetup({
  initialStatus,
}: {
  initialStatus: AuthenticatedParticipantLookupStatus;
}) {
  const [state, setState] = useState<"idle" | "working" | "ready" | "unavailable">(
    initialStatus === "ready"
      ? "ready"
      : initialStatus === "unavailable"
        ? "unavailable"
        : "idle",
  );
  const submit = async () => {
    setState("working");
    setState((await completeDiscoveryIdentitySetup()).status);
  };

  if (state === "ready") {
    return (
      <main>
        <h1>Your Discovery identity is ready.</h1>
        <p>Organization and meeting access are managed separately.</p>
      </main>
    );
  }
  if (state === "unavailable") {
    return (
      <main>
        <h1>Discovery identity is temporarily unavailable</h1>
        <p role="status">Discovery could not verify your existing setup. No identity was changed.</p>
      </main>
    );
  }
  return (
    <main>
      <h1>Complete your Discovery setup</h1>
      <p>You are signed in.</p>
      <p>Discovery will establish your private participant identity so your organization and meeting access can be granted separately.</p>
      <p>This does not grant access to any organization, meeting, or source.</p>
      <button type="button" disabled={state === "working"} onClick={submit}>
        {state === "working" ? "Preparing…" : "Continue"}
      </button>
    </main>
  );
}
