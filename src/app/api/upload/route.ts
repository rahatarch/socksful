import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { badRequest, forbidden } from "@/lib/auth";
import { getAdminUser } from "@/lib/server-auth";

/**
 * POST: Handles image uploads to Cloudinary
 * Receives a FormData with a 'file' field
 */
export async function POST(req: Request) {
  try {
    const admin = await getAdminUser(req);

    if (!admin) {
      return forbidden();
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return badRequest("No file provided");
    }

    if (!file.type.startsWith("image/")) {
      return badRequest("Only image files are allowed");
    }

    if (file.size > 5 * 1024 * 1024) {
      return badRequest("Image must be smaller than 5MB");
    }

    // Use the Cloudinary utility to upload
    const result = await uploadImage(file);

    if (!result.secure_url) {
      return NextResponse.json(
        { success: false, error: "Upload failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      url: result.secure_url,
    });
  } catch (error: unknown) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 },
    );
  }
}
