import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ kode: string }> };

// PUT /api/mata-kuliah/[kode] — Admin only: Update mata kuliah
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const result = await requireRole(["admin"]);
    if (result instanceof NextResponse) return result;

    const { kode } = await params;
    const body = await request.json();
    const { nama, sks, semester, jenis } = body;

    const supabase = await createClient();
    const updateData: Record<string, unknown> = {};
    if (nama !== undefined) updateData.nama = nama;
    if (sks !== undefined) updateData.sks = sks;
    if (semester !== undefined) updateData.semester = semester;
    if (jenis !== undefined) updateData.jenis = jenis;

    const { data, error } = await supabase
      .from("mata_kuliah")
      .update(updateData)
      .eq("kode", kode)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/mata-kuliah/[kode] — Admin only: Delete mata kuliah
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const result = await requireRole(["admin"]);
    if (result instanceof NextResponse) return result;

    const { kode } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from("mata_kuliah")
      .delete()
      .eq("kode", kode);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Mata kuliah deleted" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
