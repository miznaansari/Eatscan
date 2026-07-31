import { NextResponse } from "next/server";
import { processAndUploadImage } from "@/lib/r2";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folderType = formData.get("type") || "menuItem";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = file.name || "image";
    const result = await processAndUploadImage(buffer, folderType, filename);

    return NextResponse.json({
      success: true,
      url: result.primaryUrl,
      urls: result.urls,
    });
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process and upload image to R2" }, { status: 500 });
  }
}
