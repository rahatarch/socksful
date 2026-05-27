import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

/**
 * GET: Fetch all products from the database
 * Used by Home, Collections, and Admin Inventory pages
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("socksful_db");

    const products = await db
      .collection("products")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    console.error("Fetch Products Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

/**
 * POST: Create a new product
 * Triggered from the Admin Add Product modal
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("socksful_db");

    // Clean data and add timestamps
    const product = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("products").insertOne(product);

    return NextResponse.json({
      success: true,
      message: "Product published successfully",
      productId: result.insertedId,
    });
  } catch (error: any) {
    console.error("Create Product Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 },
    );
  }
}
