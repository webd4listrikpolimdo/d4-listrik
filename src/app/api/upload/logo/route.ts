import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// POST /api/upload/logo — Admin & Pegawai: Upload logo image to logo bucket
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

    const adminSupabase = createAdminClient();
    const supabase = await createClient();

    // 1. Fetch current logo from database to check for deletion
    const { data: current } = await supabase
      .from("logo")
      .select("file_url")
      .eq("id", 1)
      .single();

    // If current file is in galeri bucket, remove it from there
    if (current?.file_url) {
      const parts = current.file_url.split("/storage/v1/object/public/galeri/");
      if (parts.length > 1) {
        const fileName = parts[1];
        await adminSupabase.storage.from("galeri").remove([fileName]);
      }
    }

    // 2. Clear all existing files in the 'logo' bucket
    const { data: files } = await adminSupabase.storage
      .from("logo")
      .list();
    
    if (files && files.length > 0) {
      const fileNames = files.map(f => f.name);
      await adminSupabase.storage.from("logo").remove(fileNames);
    }

    // 3. Upload new logo to 'logo' bucket
    const ext = file.name.split(".").pop();
    const fileName = `logo-${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await adminSupabase.storage
      .from("logo")
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
      .from("logo")
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: urlData.publicUrl,
      message: "Logo uploaded successfully",
    });
  } catch (err) {
    console.error("Upload logo error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
