import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { badRequest, forbidden } from "@/lib/auth";
import { getAdminUser } from "@/lib/server-auth";

type ProductPlacement = "products" | "gift-sets";

const toCleanString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const normalizePlacement = (value: unknown): ProductPlacement =>
  value === "gift-sets" ? "gift-sets" : "products";

const normalizeProductPayload = (value: unknown) => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const body = value as Record<string, unknown>;
  const name = toCleanString(body.name);
  const price = toCleanString(body.price).replace(/[^0-9]/g, "");
  const category = toCleanString(body.category);
  const stock = Math.max(0, Math.floor(Number(body.stock) || 0));

  if (!name || !price || !category) {
    return null;
  }

  return {
    name,
    price,
    oldPrice: toCleanString(body.oldPrice).replace(/[^0-9]/g, ""),
    description: toCleanString(body.description),
    category,
    tag: toCleanString(body.tag),
    showIn: normalizePlacement(body.showIn),
    isFeatured: body.isFeatured === true,
    stock,
    image: toCleanString(body.image) || null,
    color: toCleanString(body.color) || "bg-gray-50/50",
  };
};

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
  } catch (error: unknown) {
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
    const admin = await getAdminUser(req);

    if (!admin) {
      return forbidden();
    }

    const body = await req.json();
    const normalizedProduct = normalizeProductPayload(body);

    if (!normalizedProduct) {
      return badRequest("Valid name, price, and category are required");
    }

    const client = await clientPromise;
    const db = client.db("socksful_db");

    // Clean data and add timestamps
    const product = {
      ...normalizedProduct,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("products").insertOne(product);

    return NextResponse.json({
      success: true,
      message: "Product published successfully",
      productId: result.insertedId,
    });
  } catch (error: unknown) {
    console.error("Create Product Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 },
    );
  }
}
