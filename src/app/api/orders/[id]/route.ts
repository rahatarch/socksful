import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    const client = await clientPromise;
    const db = client.db("socksful_db");

    await db
      .collection("orders")
      .updateOne({ _id: new ObjectId(id) }, { $set: { status: status } });

    return NextResponse.json({ success: true, message: "Status updated" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Update failed" },
      { status: 500 },
    );
  }
}
