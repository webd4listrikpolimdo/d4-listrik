import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// GET /api/dosen — Public: List all dosen
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("dosen")
      .select("*")
      .order("nama");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/dosen — Admin only: Create new dosen
export async function POST(request: NextRequest) {
  try {
    const result = await requireRole(["admin"]);
    if (result instanceof NextResponse) return result;

    const body = await request.json();
    const { id, nama, nidn, foto_url, jabatan, pangkat, email, telepon, bidang_keahlian, program_studi, pendidikan_terakhir } = body;

    if (!id || !nama || !nidn) {
      return NextResponse.json(
        { error: "id, nama, and nidn are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("dosen")
      .insert({
        id,
        nama,
        nidn,
        foto_url: foto_url || null,
        jabatan: jabatan || null,
        pangkat: pangkat || null,
        email: email || null,
        telepon: telepon || null,
        bidang_keahlian: bidang_keahlian || [],
        program_studi: program_studi || "D4 Teknik Listrik",
        pendidikan_terakhir: pendidikan_terakhir || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
