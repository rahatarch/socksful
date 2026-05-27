import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

/**
 * POST: Verify the 6-digit OTP sent to the user's email
 * Marks the account as 'isVerified: true' and cleans up OTP data
 */
export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("socksful_db");

    // ১. ইউজার খুঁজে বের করা
    const user = await db.collection("users").findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ২. ওটিপি ম্যাচ করছে কি না চেক করা
    if (user.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 },
      );
    }

    // ৩. মেয়াদের সময় চেক করা
    if (new Date() > new Date(user.otpExpires)) {
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 400 },
      );
    }

    // ৪. অ্যাকাউন্ট ভেরিফাইড মার্ক করা এবং ওটিপি ডেটা মুছে ফেলা
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: { isVerified: true },
        $unset: { otp: "", otpExpires: "" }, // সিকিউরিটির জন্য ওটিপি রিমুভ করা
      },
    );

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
    };

    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully",
      user: userData,
    });

    // সেশন কুকি সেট করা (Middleware যাতে এটি রিড করতে পারে)
    response.cookies.set("socksful-session", JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // ৭ দিন
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("OTP Verification Error:", error);
    return NextResponse.json(
      { error: "An error occurred during verification" },
      { status: 500 },
    );
  }
}
