import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createLog, getClientIp } from "@/lib/logging";

// GET /api/fasilitas — Public
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("fasilitas")
      .select("id, nama, deskripsi, foto_urls, kepala_lab, no_ruangan")
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/fasilitas — Admin/Pegawai
export async function POST(request: NextRequest) {
  try {
    const result = await requireRole(["admin", "pegawai"]);
    if (result instanceof NextResponse) return result;

    const body = await request.json();
    const { nama, deskripsi, foto_urls, kepala_lab, no_ruangan } = body;

    if (!nama) {
      return NextResponse.json({ error: "nama is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("fasilitas")
      .insert({
        nama,
        deskripsi: deskripsi || null,
        foto_urls: foto_urls || [],
        kepala_lab: kepala_lab || null,
        no_ruangan: no_ruangan || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await createLog({
      kategori: "fasilitas",
      aksi: "create",
      deskripsi: `Menambahkan fasilitas: ${nama}`,
      data_sesudah: data,
      ip_address: getClientIp(request),
    });

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
