import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createLog, getClientIp } from "@/lib/logging";

type Params = { params: Promise<{ kode: string }> };

// PUT /api/cpl/[kode] — Admin & Pegawai: Update CPL
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const result = await requireRole(["admin", "pegawai"]);
    if (result instanceof NextResponse) return result;

    const { kode } = await params;
    const body = await request.json();
    const { deskripsi, kategori } = body;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cpl")
      .update({ deskripsi, kategori: kategori !== undefined ? (kategori || null) : undefined })
      .eq("kode", kode)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await createLog({
      kategori: "cpl",
      aksi: "update",
      deskripsi: `Mengubah CPL: ${kode}`,
      data_sesudah: data,
      ip_address: getClientIp(request),
    });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/cpl/[kode] — Admin & Pegawai: Delete CPL
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const result = await requireRole(["admin", "pegawai"]);
    if (result instanceof NextResponse) return result;

    const { kode } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from("cpl")
      .delete()
      .eq("kode", kode);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await createLog({
      kategori: "cpl",
      aksi: "delete",
      deskripsi: `Menghapus CPL: ${kode}`,
      ip_address: getClientIp(_request),
    });

    return NextResponse.json({ message: "CPL deleted" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
