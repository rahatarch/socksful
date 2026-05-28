import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

/**
 * POST: Clear the secure session cookie
 * Used by the sign-out mechanism to terminate the server-side session.
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  clearSessionCookie(response);

  return response;
}
