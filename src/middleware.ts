import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware: The Gatekeeper
 * Intercepts requests to /admin routes and validates the 'socksful-session' cookie.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ১. চেক করা হচ্ছে রিকোয়েস্টটি কি /admin রুটের জন্য কি না
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("socksful-session")?.value;

    // ২. যদি কুকি না থাকে, তবে ইউজার লগইন করা নেই
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    try {
      // ৩. কুকি থেকে ইউজার ডেটা পার্স করা
      const user = JSON.parse(sessionCookie);

      // ৪. রোল চেক করা (শুধুমাত্র admin পারমিশন পাবে)
      if (user.role !== "admin") {
        // অ্যাডমিন না হলে হোমপেজে পাঠিয়ে দেওয়া
        return NextResponse.redirect(new URL("/", request.url));
      }

      // ৫. ইউজার অ্যাডমিন হলে রিকোয়েস্টটি চলতে দেওয়া
      return NextResponse.next();
    } catch (error) {
      // কুকি ডেটা করাপ্টেড হলে লগইন পেজে পাঠানো
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  // অ্যাডমিন রুট না হলে রিকোয়েস্টটি সাধারণভাবে চলতে দেওয়া
  return NextResponse.next();
}

/**
 * Matcher: মিডলওয়্যারটি কোন কোন পাথে কাজ করবে তা নির্ধারণ করে।
 * আমরা শুধুমাত্র /admin এবং তার নিচের পাথগুলোকে মনিটর করব।
 */
export const config = {
  matcher: ["/admin/:path*"],
};
