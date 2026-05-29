import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// GET /api/mata-kuliah — Public: List all mata kuliah
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mata_kuliah")
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

// POST /api/mata-kuliah — Admin & Pegawai: Create new mata kuliah
export async function POST(request: NextRequest) {
  try {
    const result = await requireRole(["admin", "pegawai"]);
    if (result instanceof NextResponse) return result;

    const body = await request.json();
    const { kode, nama, sks, semester, jenis, deskripsi } = body;

    if (!kode || !nama || !sks || !semester) {
      return NextResponse.json(
        { error: "kode, nama, sks, and semester are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mata_kuliah")
      .insert({
        kode,
        nama,
        sks,
        semester,
        jenis: jenis || null,
        deskripsi: deskripsi || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
