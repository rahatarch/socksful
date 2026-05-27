import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

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

    // ৪. পাসওয়ার্ড ভেরিফাই করা
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // ৫. সফল রেসপন্স এবং সিকিউর কুকি সেট করা
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
    };

    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully",
      user: userData,
    });

    // কুকি সেট করা (Middleware যাতে এটি রিড করতে পারে)
    response.cookies.set("socksful-session", JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // ৭ দিন
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "An error occurred during sign in" },
      { status: 500 },
    );
  }
}
