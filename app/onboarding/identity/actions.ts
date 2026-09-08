"use server";
import { registerAuthenticatedParticipantFromRequest } from "../../../lib/auth/registerAuthenticatedParticipantFromRequest";
export async function completeDiscoveryIdentitySetup(): Promise<{ status: "ready" | "unavailable" }> { return registerAuthenticatedParticipantFromRequest(); }
