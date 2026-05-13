import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// POST /api/upload/dosen — Admin or Owner: Upload dosen profile photo
export async function POST(request: NextRequest) {
  try {
    const result = await requireAuth();
    if (result instanceof NextResponse) return result;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const dosenId = formData.get("dosen_id") as string | null;

    if (!file || !dosenId) {
      return NextResponse.json(
        { error: "file and dosen_id are required" },
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

    const user = result;

    // Owner check for dosen role
    if (user.role !== "admin") {
      const supabase = await createClient();
      const { data: dosen } = await supabase
        .from("dosen")
        .select("nidn")
        .eq("id", dosenId)
        .single();

      if (!dosen || dosen.nidn !== user.nidn) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    const supabase = await createClient();
    const ext = file.name.split(".").pop();
    const fileName = `${dosenId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("dosen")
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
      .from("dosen")
      .getPublicUrl(fileName);

    // Update dosen record with new photo URL
    await supabase
      .from("dosen")
      .update({ foto_url: urlData.publicUrl })
      .eq("id", dosenId);

    return NextResponse.json({
      url: urlData.publicUrl,
      message: "Photo uploaded successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
