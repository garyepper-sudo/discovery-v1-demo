import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { IdentitySetup } from "./IdentitySetup";
export default async function AuthenticatedParticipantIdentitySetupPage(){const session=await auth();if(!session.userId)redirect("/sign-in");return <IdentitySetup/>;}
