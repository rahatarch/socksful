import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { badRequest, forbidden } from "@/lib/auth";
import { getAdminUser } from "@/lib/server-auth";

/**
 * PATCH: Update customer status (Ban/Unban)
 * Used by the Admin Customers page
 */
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
      return badRequest("Invalid customer id");
    }

    const { status } = await req.json();

    if (status !== "Active" && status !== "Banned") {
      return badRequest("Status must be Active or Banned");
    }

    const client = await clientPromise;
    const db = client.db("socksful_db");

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Customer status updated to ${status}`,
    });
  } catch (error: unknown) {
    console.error("Update Customer API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update customer status" },
      { status: 500 },
    );
  }
}
