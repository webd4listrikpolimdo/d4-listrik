import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// GET /api/galeri — Public: List all galeri items
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("galeri")
      .select("*")
      .order("updated_at", { ascending: false });

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

// POST /api/galeri — Admin only: Create galeri item
export async function POST(request: NextRequest) {
  try {
    const result = await requireRole(["admin"]);
    if (result instanceof NextResponse) return result;

    const body = await request.json();
    const { judul, deskripsi, tanggal, kategori, foto_urls } = body;

    if (!judul || !tanggal || !kategori) {
      return NextResponse.json(
        { error: "judul, tanggal, and kategori are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("galeri")
      .insert({
        judul,
        deskripsi: deskripsi || null,
        tanggal,
        kategori,
        foto_urls: foto_urls || [],
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
