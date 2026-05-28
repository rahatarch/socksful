import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { badRequest, forbidden } from "@/lib/auth";
import { getAdminUser } from "@/lib/server-auth";

const toCleanString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const normalizeProductUpdate = (value: unknown) => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const body = value as Record<string, unknown>;
  const updateData = {
    name: toCleanString(body.name),
    price: toCleanString(body.price).replace(/[^0-9]/g, ""),
    oldPrice: toCleanString(body.oldPrice).replace(/[^0-9]/g, ""),
    description: toCleanString(body.description),
    category: toCleanString(body.category),
    tag: toCleanString(body.tag),
    showIn: body.showIn === "gift-sets" ? "gift-sets" : "products",
    isFeatured: body.isFeatured === true,
    stock: Math.max(0, Math.floor(Number(body.stock) || 0)),
    image: toCleanString(body.image) || null,
  };

  if (!updateData.name || !updateData.price || !updateData.category) {
    return null;
  }

  return updateData;
};

/**
 * PATCH: Update an existing product
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
      return badRequest("Invalid product id");
    }

    const updateData = normalizeProductUpdate(await req.json());

    if (!updateData) {
      return badRequest("Valid name, price, and category are required");
    }

    const client = await clientPromise;
    const db = client.db("socksful_db");

    const result = await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error: unknown) {
    console.error("Update Product Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 },
    );
  }
}

/**
 * DELETE: Remove a product from the database
 */
export async function DELETE(
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
      return badRequest("Invalid product id");
    }

    const client = await clientPromise;
    const db = client.db("socksful_db");

    const result = await db
      .collection("products")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete Product Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
