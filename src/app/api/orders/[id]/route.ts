import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { badRequest, forbidden } from "@/lib/auth";
import { getAdminUser } from "@/lib/server-auth";

const VALID_STATUSES = new Set([
  "Pending",
  "Confirmed",
  "Delivered",
  "Canceled",
]);

interface OrderItem {
  id: string;
  quantity: number;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminUser(req);

    if (!admin) {
      return forbidden();
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return badRequest("Invalid order id");
    }

    const { status } = await req.json();

    if (!VALID_STATUSES.has(status)) {
      return badRequest("Invalid order status");
    }

    const client = await clientPromise;
    const db = client.db("socksful_db");
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const orders = db.collection("orders");
        const order = await orders.findOne(
          { _id: new ObjectId(id) },
          { session },
        );

        if (!order) {
          throw new Error("Order not found");
        }

        if (order.status === status) {
          return;
        }

        await orders.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status, updatedAt: new Date() } },
          { session },
        );

        if (status === "Canceled" && order.status !== "Canceled") {
          const items = Array.isArray(order.items)
            ? (order.items as OrderItem[])
            : [];
          await Promise.all(
            items
              .filter((item) => ObjectId.isValid(item.id) && item.quantity > 0)
              .map((item) =>
                db
                  .collection("products")
                  .updateOne(
                    { _id: new ObjectId(item.id) },
                    { $inc: { stock: item.quantity } },
                    { session },
                  ),
              ),
          );
        }
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json({ success: true, message: "Status updated" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: message === "Order not found" ? 404 : 500 },
    );
  }
}
