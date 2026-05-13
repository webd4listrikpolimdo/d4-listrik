import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// POST /api/upload/galeri — Admin only: Upload gallery image
export async function POST(request: NextRequest) {
  try {
    const result = await requireRole(["admin"]);
    if (result instanceof NextResponse) return result;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const galeriId = formData.get("galeri_id") as string | null;

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

    const supabase = await createClient();
    const ext = file.name.split(".").pop();
    const prefix = galeriId || "gallery";
    const fileName = `${prefix}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("galeri")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from("galeri")
      .getPublicUrl(fileName);

    // If galeri_id is provided, append the URL to the galeri's foto_urls array
    if (galeriId) {
      const { data: galeri } = await supabase
        .from("galeri")
        .select("foto_urls")
        .eq("id", galeriId)
        .single();

      if (galeri) {
        const updatedUrls = [...(galeri.foto_urls || []), urlData.publicUrl];
        await supabase
          .from("galeri")
          .update({ foto_urls: updatedUrls })
          .eq("id", galeriId);
      }
    }

    return NextResponse.json({
      url: urlData.publicUrl,
      message: "Image uploaded successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
