import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { lookupAuthenticatedParticipantFromRequest } from "../../../lib/auth/lookupAuthenticatedParticipantFromRequest";
import { IdentitySetup } from "./IdentitySetup";

export const dynamic = "force-dynamic";

export default async function AuthenticatedParticipantIdentitySetupPage() {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");
  const initialStatus = await lookupAuthenticatedParticipantFromRequest();
  return <IdentitySetup initialStatus={initialStatus} />;
}
