import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

/**
 * POST: Handles image uploads to Cloudinary
 * Receives a FormData with a 'file' field
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Use the Cloudinary utility to upload
    const result = (await uploadImage(file)) as any;

    return NextResponse.json({
      success: true,
      url: result.secure_url,
    });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
