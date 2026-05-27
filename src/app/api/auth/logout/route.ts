import { NextResponse } from "next/server";

/**
 * POST: Clear the secure session cookie
 * Used by the sign-out mechanism to terminate the server-side session.
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  // কুকি রিমুভ করা (Expiration set to past)
  response.cookies.set("socksful-session", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
