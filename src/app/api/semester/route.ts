import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createLog, getClientIp } from "@/lib/logging";

// GET /api/semester — Public: Get all semesters
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("semester")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/semester — Admin/Pegawai: Create new semester + auto-create statistik rows
export async function POST(request: NextRequest) {
  try {
    const result = await requireRole(["admin", "pegawai"]);
    if (result instanceof NextResponse) return result;

    const body = await request.json();
    const { id, jenis, tahun_akademik } = body;

    if (!id || !jenis || !tahun_akademik) {
      return NextResponse.json({ error: "id, jenis, and tahun_akademik are required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Create the semester
    const { data: semester, error: semError } = await supabase
      .from("semester")
      .insert({ id, jenis, tahun_akademik, is_aktif: false })
      .select()
      .single();

    if (semError) {
      return NextResponse.json({ error: semError.message }, { status: 400 });
    }

    // Auto-create 4 statistik_mahasiswa rows
    const levels = jenis === "ganjil" ? [1, 3, 5, 7] : [2, 4, 6, 8];
    const rows = levels.map((level) => ({
      semester_id: id,
      semester_level: level,
      total_mahasiswa_aktif: 0,
    }));

    const { error: statError } = await supabase
      .from("statistik_mahasiswa")
      .insert(rows);

    if (statError) {
      return NextResponse.json({ error: statError.message }, { status: 400 });
    }

    await createLog({
      kategori: "semester",
      aksi: "create",
      deskripsi: `Membuat semester baru: ${id} (${jenis} ${tahun_akademik})`,
      data_sesudah: semester,
      ip_address: getClientIp(request),
    });

    return NextResponse.json(semester, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/semester — Admin/Pegawai: Set a semester as active
export async function PUT(request: NextRequest) {
  try {
    const result = await requireRole(["admin", "pegawai"]);
    if (result instanceof NextResponse) return result;

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Semester id is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Deactivate all semesters
    await supabase.from("semester").update({ is_aktif: false }).neq("id", "");

    // Activate the selected one
    const { data, error } = await supabase
      .from("semester")
      .update({ is_aktif: true })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await createLog({
      kategori: "semester",
      aksi: "update",
      deskripsi: `Mengaktifkan semester: ${id}`,
      data_sesudah: data,
      ip_address: getClientIp(request),
    });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/semester?id=ga2526 — Admin/Pegawai: Delete a semester + its statistik rows
export async function DELETE(request: NextRequest) {
  try {
    const result = await requireRole(["admin", "pegawai"]);
    if (result instanceof NextResponse) return result;

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Semester id is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Prevent deleting active semester
    const { data: sem } = await supabase
      .from("semester")
      .select("is_aktif")
      .eq("id", id)
      .single();

    if (sem?.is_aktif) {
      return NextResponse.json(
        { error: "Tidak bisa menghapus semester yang sedang aktif" },
        { status: 400 }
      );
    }

    // Delete associated statistik_mahasiswa rows first
    await supabase.from("statistik_mahasiswa").delete().eq("semester_id", id);

    // Delete the semester
    const { error } = await supabase.from("semester").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await createLog({
      kategori: "semester",
      aksi: "delete",
      deskripsi: `Menghapus semester: ${id}`,
      ip_address: getClientIp(request),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
