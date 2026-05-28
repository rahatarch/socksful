import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {
  buildSiteSettingsFromCatalog,
  getCategoriesForTarget,
  normalizeSiteSettings,
  type CategoryTarget,
} from "@/lib/site-settings";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedType = searchParams.get("type");
    const type: CategoryTarget =
      requestedType === "gift-sets" ? "gift-sets" : "products";

    const client = await clientPromise;
    const db = client.db("socksful_db");

    const settings = await db
      .collection("site_settings")
      .findOne({ type: "global_configs" });

    const normalizedSettings = settings
      ? normalizeSiteSettings(settings)
      : buildSiteSettingsFromCatalog({
          productCategories: await db
            .collection("products")
            .distinct("category", {
              $or: [{ showIn: "products" }, { showIn: { $exists: false } }],
            }),
          giftSetCategories: await db
            .collection("products")
            .distinct("category", {
              showIn: "gift-sets",
            }),
        });

    const categoryList = getCategoriesForTarget(
      normalizedSettings.categories,
      type,
    );

    const allLabel = type === "gift-sets" ? "All Sets" : "All";

    return NextResponse.json({
      success: true,
      data: [allLabel, ...categoryList],
    });
  } catch (error) {
    console.error("Category Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
