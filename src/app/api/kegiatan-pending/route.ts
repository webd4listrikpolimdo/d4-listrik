import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createLog, getClientIp } from "@/lib/logging";

// GET /api/kegiatan-pending — Admin: all pending; Dosen/Pegawai: own pending
export async function GET() {
  try {
    const result = await requireAuth();
    if (result instanceof NextResponse) return result;

    const user = result;
    const supabase = await createClient();

    let query = supabase
      .from("kegiatan_pending")
      .select("*")
      .order("created_at", { ascending: false });

    // Non-admin can only see their own pending items
    if (user.role !== "admin") {
      query = query.eq("submitted_by", user.id);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/kegiatan-pending — Dosen/Pegawai: Submit new kegiatan for approval
export async function POST(request: NextRequest) {
  try {
    const result = await requireAuth();
    if (result instanceof NextResponse) return result;

    const user = result;
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
      .from("kegiatan_pending")
      .insert({
        nama,
        tanggal,
        kategori,
        deskripsi: deskripsi || null,
        foto_urls: foto_urls || [],
        lokasi: lokasi || null,
        submitted_by: user.id,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await createLog({
      kategori: "kegiatan_pending",
      aksi: "create",
      deskripsi: `Mengajukan kegiatan baru: ${nama}`,
      data_sesudah: data,
      ip_address: getClientIp(request),
    });

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
