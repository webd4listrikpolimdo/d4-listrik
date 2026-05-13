import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// GET /api/kurikulum — Public: Get kurikulum_aktif, mata_kuliah, cpl
export async function GET() {
  try {
    const supabase = await createClient();

    const [kurikulumRes, mataKuliahRes, cplRes] = await Promise.all([
      supabase.from("kurikulum_aktif").select("*").eq("id", 1).single(),
      supabase.from("mata_kuliah").select("*").order("semester").order("kode"),
      supabase.from("cpl").select("*").order("kode"),
    ]);

    if (kurikulumRes.error) {
      return NextResponse.json(
        { error: kurikulumRes.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      kurikulum: kurikulumRes.data,
      mata_kuliah: mataKuliahRes.data || [],
      cpl: cplRes.data || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/kurikulum — Admin only: Update kurikulum_aktif info
export async function PUT(request: NextRequest) {
  try {
    const result = await requireRole(["admin"]);
    if (result instanceof NextResponse) return result;

    const body = await request.json();
    const { nama, deskripsi, berlaku_sejak, file_url } = body;

    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (nama !== undefined) updateData.nama = nama;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (berlaku_sejak !== undefined) updateData.berlaku_sejak = berlaku_sejak;
    if (file_url !== undefined) updateData.file_url = file_url;

    const { data, error } = await supabase
      .from("kurikulum_aktif")
      .update(updateData)
      .eq("id", 1)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
