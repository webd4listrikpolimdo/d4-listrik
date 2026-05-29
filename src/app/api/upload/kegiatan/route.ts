import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// POST /api/upload/kegiatan — Admin, Pegawai, Dosen: Upload kegiatan photo to galeri bucket inside kegiatan folder
export async function POST(request: NextRequest) {
  try {
    const result = await requireRole(["admin", "pegawai", "dosen"]);
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

    // Use admin client to bypass storage policies
    const adminSupabase = createAdminClient();
    const ext = file.name.split(".").pop();
    const fileName = `kegiatan/kegiatan-${Date.now()}.${ext}`;

    // Convert File to Buffer for Node.js compatibility
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await adminSupabase.storage
      .from("galeri")
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
      .from("galeri")
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: urlData.publicUrl,
      message: "Kegiatan photo uploaded successfully",
    });
  } catch (err) {
    console.error("Upload kegiatan photo error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
