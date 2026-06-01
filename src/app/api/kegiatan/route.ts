import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createLog, getClientIp } from "@/lib/logging";

// GET /api/kegiatan — Public: Get all approved kegiatan items
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("kegiatan")
      .select("*")
      .order("tanggal", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/kegiatan — Admin only: Create approved kegiatan item directly
export async function POST(request: NextRequest) {
  try {
    const result = await requireRole(["admin"]);
    if (result instanceof NextResponse) return result;

    const body = await request.json();
    const { nama, tanggal, kategori, deskripsi, foto_urls, lokasi } = body;

    if (!nama || !tanggal || !kategori) {
      return NextResponse.json(
        { error: "Nama, tanggal, dan kategori wajib diisi." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("kegiatan")
      .insert({
        nama,
        tanggal,
        kategori,
        deskripsi: deskripsi || null,
        foto_urls: foto_urls || [],
        lokasi: lokasi || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await createLog({
      kategori: "kegiatan",
      aksi: "create",
      deskripsi: `Menambahkan kegiatan: ${nama}`,
      data_sesudah: data,
      ip_address: getClientIp(request),
    });

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
