import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createLog, getClientIp } from "@/lib/logging";

// GET /api/cpl — Public: List all CPL
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cpl")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/cpl — Admin & Pegawai: Create new CPL
export async function POST(request: NextRequest) {
  try {
    const result = await requireRole(["admin", "pegawai"]);
    if (result instanceof NextResponse) return result;

    const body = await request.json();
    const { kode, deskripsi, kategori } = body;

    if (!kode || !deskripsi) {
      return NextResponse.json(
        { error: "kode and deskripsi are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cpl")
      .insert({ kode, deskripsi, kategori: kategori || null })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await createLog({
      kategori: "cpl",
      aksi: "create",
      deskripsi: `Menambahkan CPL: ${kode}`,
      data_sesudah: data,
      ip_address: getClientIp(request),
    });

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
