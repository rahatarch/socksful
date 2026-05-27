import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

/**
 * GET: Fetch all customers for the Admin Panel
 * Includes a join logic to count total orders per customer from the 'orders' collection
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("socksful_db");

    // ১. সব ইউজারদের তুলে আনা (পাসওয়ার্ড বাদ দিয়ে)
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    // ২. প্রতিটি ইউজারের মোট অর্ডার সংখ্যা বের করার জন্য এগ্রিগেশন
    const orderCounts = await db
      .collection("orders")
      .aggregate([
        {
          $group: {
            _id: { $toLower: "$customer.email" },
            totalOrders: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // ৩. ইউজার ডেটার সাথে অর্ডার কাউন্ট মার্জ করা
    const customers = users.map((user) => {
      const orderData = orderCounts.find(
        (oc) => oc._id === user.email.toLowerCase().trim(),
      );
      return {
        ...user,
        id: user._id,
        totalOrders: orderData ? orderData.totalOrders : 0,
      };
    });

    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    console.error("Fetch Customers API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer list" },
      { status: 500 },
    );
  }
}
