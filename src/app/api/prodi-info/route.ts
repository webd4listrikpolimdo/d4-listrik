import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createLog, getClientIp } from "@/lib/logging";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prodi_info")
      .select("id, nama, nama_alternatif, nama_kampus, deskripsi, hero_bg_url")
      .eq("id", 1)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data || null);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const result = await requireRole(["admin", "pegawai"]);
    if (result instanceof NextResponse) return result;

    const data = await request.json();
    const supabase = await createClient();

    const { error } = await supabase
      .from("prodi_info")
      .upsert({ id: 1, ...data });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await createLog({
      kategori: "config",
      aksi: "update",
      deskripsi: `Memperbarui informasi umum Program Studi`,
      data_sesudah: data,
      ip_address: getClientIp(request),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
