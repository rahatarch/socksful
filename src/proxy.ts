import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (session.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
