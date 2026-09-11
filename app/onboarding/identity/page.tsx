import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { resolveFounderAuthorizedMeetingContinuation } from "../../../lib/alpha-activation/founderAuthorizedMeetingContinuation";
import { lookupAuthenticatedParticipantFromRequest } from "../../../lib/auth/lookupAuthenticatedParticipantFromRequest";
import { IdentitySetup } from "./IdentitySetup";

export const dynamic = "force-dynamic";

export default async function AuthenticatedParticipantIdentitySetupPage() {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");
  const initialStatus = await lookupAuthenticatedParticipantFromRequest();
  const continuation = initialStatus === "ready"
    ? await resolveFounderAuthorizedMeetingContinuation()
    : null;
  return <IdentitySetup initialStatus={initialStatus} continuation={continuation} />;
}
