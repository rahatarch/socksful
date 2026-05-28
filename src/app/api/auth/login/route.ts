import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { setSessionCookie, type SessionUser } from "@/lib/auth";

/**
 * POST: Authenticate user credentials
 * Checks email and hashed password against MongoDB 'users' collection
 */
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // ১. ভ্যালিডেশন চেক
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("socksful_db");

    // ২. ইউজার খুঁজে বের করা
    const user = await db.collection("users").findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // ৩. ইউজারের স্ট্যাটাস চেক (অ্যাডমিন ব্যান করেছে কি না)
    if (user.status === "Banned") {
      return NextResponse.json(
        { error: "This account has been restricted. Contact support." },
        { status: 403 },
      );
    }

    // ৪. ইমেইল ভেরিফিকেশন চেক
    if (user.isVerified === false) {
      return NextResponse.json(
        { error: "Please verify your email before signing in." },
        { status: 403 },
      );
    }

    // ৫. পাসওয়ার্ড ভেরিফাই করা
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // ৬. সফল রেসপন্স এবং signed secure কুকি সেট করা
    const userData: SessionUser = {
      id: user._id.toString(),
      name: String(user.name),
      email: String(user.email).toLowerCase().trim(),
      role: user.role === "admin" ? "admin" : "user",
    };

    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully",
      user: userData,
    });

    setSessionCookie(response, userData);

    return response;
  } catch (error: unknown) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "An error occurred during sign in" },
      { status: 500 },
    );
  }
}
