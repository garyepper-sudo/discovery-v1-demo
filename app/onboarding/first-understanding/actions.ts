"use server";
import { redirect } from "next/navigation";
import { parseFirstUnderstandingForm } from "../../../lib/alpha-activation/founderFirstUnderstandingForm";
import { createFounderFirstUnderstandingApplicationServiceFromRequest } from "../../../lib/alpha-activation/founderFirstUnderstandingRequestComposition";

export async function submitFirstUnderstandingAction(data: FormData) {
 if (process.env.NODE_ENV === "production" || process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED !== "true") throw new Error("Founder Local Alpha is unavailable.");
 const input = await parseFirstUnderstandingForm(data);
 let service;
 try { service = await createFounderFirstUnderstandingApplicationServiceFromRequest(); }
 catch (error) { if (error instanceof Error && /participant/.test(error.message)) redirect("/onboarding/identity"); throw error; }
 try { return await service.apply(input); }
 finally { await service.close(); }
}
