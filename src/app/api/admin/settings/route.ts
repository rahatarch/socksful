import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { forbidden } from "@/lib/auth";
import { getAdminUser } from "@/lib/server-auth";
import {
  buildSiteSettingsFromCatalog,
  normalizeSiteSettings,
} from "@/lib/site-settings";

// GET: Fetch global categories and tags
export async function GET(request: Request) {
  try {
    const admin = await getAdminUser(request);

    if (!admin) {
      return forbidden();
    }

    const client = await clientPromise;
    const db = client.db("socksful_db");

    const settings = await db
      .collection("site_settings")
      .findOne({ type: "global_configs" });

    if (!settings) {
      const [productCategories, giftSetCategories, tags] = await Promise.all([
        db.collection("products").distinct("category", {
          $or: [{ showIn: "products" }, { showIn: { $exists: false } }],
        }),
        db.collection("products").distinct("category", {
          showIn: "gift-sets",
        }),
        db.collection("products").distinct("tag"),
      ]);

      const fallbackSettings = buildSiteSettingsFromCatalog({
        productCategories,
        giftSetCategories,
        tags,
      });

      return NextResponse.json({
        success: true,
        ...fallbackSettings,
      });
    }

    const normalizedSettings = normalizeSiteSettings(settings);

    return NextResponse.json({
      success: true,
      ...normalizedSettings,
    });
  } catch (error) {
    console.error("Settings Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Database error" },
      { status: 500 },
    );
  }
}

// POST: Update global categories and tags
export async function POST(request: Request) {
  try {
    const admin = await getAdminUser(request);

    if (!admin) {
      return forbidden();
    }

    const body = await request.json();
    const settings = normalizeSiteSettings(body);
    const client = await clientPromise;
    const db = client.db("socksful_db");

    await db.collection("site_settings").updateOne(
      { type: "global_configs" },
      {
        $set: {
          categories: settings.categories,
          tags: settings.tags,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          type: "global_configs",
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );

    return NextResponse.json({
      success: true,
      message: "Settings synced successfully",
      ...settings,
    });
  } catch (error) {
    console.error("Settings Update Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 },
    );
  }
}
