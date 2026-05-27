import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// ১. নতুন অর্ডার তৈরি করা (কাস্টমার সাইড)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("socksful_db");

    const order = {
      ...body,
      status: "Pending", // 'New' থেকে পরিবর্তন করে 'Pending' করা হয়েছে
      createdAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(order);

    // ২. ইনভেন্টরি স্টক কমানো (Stock Decrement)
    if (body.items && Array.isArray(body.items)) {
      const stockUpdates = body.items.map((item: any) =>
        db.collection("products").updateOne(
          { _id: new ObjectId(item.id) },
          { $inc: { stock: -Math.abs(item.quantity) } }
        )
      );
      await Promise.all(stockUpdates);
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      orderId: result.insertedId,
    });
  } catch (error: any) {
    console.error("Order API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save order" },
      { status: 500 },
    );
  }
}

// ২. অর্ডার তুলে আনা
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    const client = await clientPromise;
    const db = client.db("socksful_db");

    const filter = email
      ? { "customer.email": { $regex: new RegExp(`^${email.trim()}$`, "i") } }
      : {};

    const orders = await db
      .collection("orders")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
