import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { setSessionCookie, type SessionUser } from "@/lib/auth";

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
      email: String(email).toLowerCase().trim(),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.status === "Banned") {
      return NextResponse.json(
        { error: "This account has been restricted. Contact support." },
        { status: 403 },
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: "This account is already verified" },
        { status: 400 },
      );
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

    const userData: SessionUser = {
      id: user._id.toString(),
      name: String(user.name),
      email: String(user.email).toLowerCase().trim(),
      role: user.role === "admin" ? "admin" : "user",
    };

    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully",
      user: userData,
    });

    setSessionCookie(response, userData);

    return response;
  } catch (error: unknown) {
    console.error("OTP Verification Error:", error);
    return NextResponse.json(
      { error: "An error occurred during verification" },
      { status: 500 },
    );
  }
}
