// File Path: src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("socksful_db");

    // ইউজার অলরেডি আছে কি না চেক করা
    const existingUser = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    // ওটিপি জেনারেশন (৬ ডিজিট)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // ১০ মিনিট মেয়াদ

    // পাসওয়ার্ড এনক্রিপ্ট করা
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user",
      status: "Active",
      isVerified: false, // শুরুতে আনভেরিফাইড থাকবে
      otp,
      otpExpires,
      createdAt: new Date(),
    };

    // ডাটাবেজে সেভ করা (যদি আগে থেকে আনভেরিফাইড থাকে তবে আপডেট হবে)
    await db.collection("users").updateOne(
      { email: email.toLowerCase() },
      { $set: newUser },
      { upsert: true }
    );

    // ইমেইল পাঠানো
    try {
      await resend.emails.send({
        from: "SocksFul <onboarding@resend.dev>",
        to: email.toLowerCase(),
        subject: "Verify your SocksFul Account",
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb;">Welcome to SocksFul!</h2>
            <p>Your verification code is:</p>
            <h1 style="letter-spacing: 5px; font-size: 32px; color: #1d1d1f;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Resend Error:", emailError);
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
      email: email.toLowerCase(),
    });
  } catch (error: any) {
    console.error("Signup API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
