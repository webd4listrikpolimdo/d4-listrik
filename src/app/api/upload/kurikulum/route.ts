import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// POST /api/upload/kurikulum — Admin only: Upload PDF to kurikulum bucket
export async function POST(request: NextRequest) {
  try {
    const result = await requireRole(["admin"]);
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
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const fileName = `kurikulum-${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("kurikulum")
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
      .from("kurikulum")
      .getPublicUrl(fileName);

    // Update kurikulum_aktif with the new file URL
    await supabase
      .from("kurikulum_aktif")
      .update({ file_url: urlData.publicUrl })
      .eq("id", 1);

    return NextResponse.json({
      url: urlData.publicUrl,
      message: "PDF uploaded successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
