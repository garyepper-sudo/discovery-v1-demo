import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FirstUnderstandingForm } from "./FirstUnderstandingForm";
import {createFounderFirstUnderstandingRequestComposition} from "../../../lib/alpha-activation/founderFirstUnderstandingRequestComposition";
import { lookupAuthenticatedParticipantFromRequest } from "../../../lib/auth/lookupAuthenticatedParticipantFromRequest";

export const dynamic="force-dynamic";
export default async function FirstUnderstandingPage(){
  if(process.env.NODE_ENV==="production"||process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED!=="true") redirect("/onboarding");
  const session=await auth(); if(!session.userId) redirect("/sign-in");
  const identityStatus=await lookupAuthenticatedParticipantFromRequest();
  if(identityStatus==="setup-required")redirect("/onboarding/identity");
  if(identityStatus==="unavailable")return <IdentityUnavailable/>;
  const request=await createFounderFirstUnderstandingRequestComposition().catch(()=>null);
  if(!request)return <IdentityUnavailable/>;
  await request.close();
  return <FirstUnderstandingForm/>;
}

function IdentityUnavailable(){return <main><h1>Discovery identity is temporarily unavailable</h1><p role="status">Discovery could not verify your existing setup. No identity was changed.</p></main>;}
