import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// POST /api/upload/hero — Admin & Pegawai: Upload hero background image to heroBackground bucket
export async function POST(request: NextRequest) {
  try {
    const result = await requireRole(["admin", "pegawai"]);
    if (result instanceof NextResponse) return result;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "file is required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Use admin client for storage upload (bypasses storage policies)
    const adminSupabase = createAdminClient();
    const ext = file.name.split(".").pop();
    const fileName = `hero-bg-${Date.now()}.${ext}`;

    // Convert File to Buffer for Node.js compatibility
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await adminSupabase.storage
      .from("heroBackground")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Upload gagal: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = adminSupabase.storage
      .from("heroBackground")
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: urlData.publicUrl,
      message: "Hero background uploaded successfully",
    });
  } catch (err) {
    console.error("Upload hero background error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
