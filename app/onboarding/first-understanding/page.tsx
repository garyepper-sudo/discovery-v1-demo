import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FirstUnderstandingForm } from "./FirstUnderstandingForm";
import {createFounderFirstUnderstandingRequestComposition} from "../../../lib/alpha-activation/founderFirstUnderstandingRequestComposition";

export const dynamic="force-dynamic";
export default async function FirstUnderstandingPage(){
  if(process.env.NODE_ENV==="production"||process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED!=="true") redirect("/onboarding");
  const session=await auth(); if(!session.userId) redirect("/sign-in");
  const request=await createFounderFirstUnderstandingRequestComposition().catch(()=>null);
  if(!request)redirect("/onboarding/identity");
  await request.close();
  return <FirstUnderstandingForm/>;
}
