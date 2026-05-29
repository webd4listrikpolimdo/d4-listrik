import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// GET /api/statistik — Public: Get stats summary + per-level breakdown + per-year lulusan
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Fetch active semester
    const { data: activeSemester } = await supabase
      .from("semester")
      .select("*")
      .eq("is_aktif", true)
      .single();

    const semesterId = request.nextUrl.searchParams.get("semester_id");
    let selectedSemester = activeSemester;
    let semesterNotFound = false;

    if (semesterId) {
      const { data: targetSem } = await supabase
        .from("semester")
        .select("*")
        .eq("id", semesterId)
        .single();
      
      if (targetSem) {
        selectedSemester = targetSem;
      } else {
        selectedSemester = null;
        semesterNotFound = true;
      }
    }

    // Fetch per-level stats for selected semester
    let perLevel: any[] = [];
    let totalMahasiswaAktif = 0;

    if (selectedSemester) {
      const { data: levelData } = await supabase
        .from("statistik_mahasiswa")
        .select("*")
        .eq("semester_id", selectedSemester.id)
        .order("semester_level", { ascending: true });

      perLevel = levelData || [];
      totalMahasiswaAktif = perLevel.reduce(
        (sum: number, row: any) => sum + (row.total_mahasiswa_aktif || 0),
        0
      );
    }

    // Fetch per-year lulusan
    const { data: lulusanRows } = await supabase
      .from("statistik_lulusan")
      .select("*")
      .order("tahun", { ascending: true });

    const lulusanList = lulusanRows || [];
    const totalLulusan = lulusanList.reduce(
      (sum: number, row: any) => sum + (row.jumlah_lulusan || 0),
      0
    );

    // Fetch dosen + galeri + mata_kuliah counts
    const [dosenResult, galeriResult, karyaResult, mataKuliahResult] = await Promise.all([
      supabase.from("dosen").select("id", { count: "exact", head: true }),
      supabase.from("galeri").select("id", { count: "exact", head: true }),
      supabase
        .from("karya")
        .select("jenis, foto_urls")
        .in("jenis", ["publikasi", "penelitian", "pengabdian", "bukuAjar"]),
      supabase.from("mata_kuliah").select("kode", { count: "exact", head: true }),
    ]);

    const virtualGaleriCount = (karyaResult.data || []).filter(
      (k: any) => k.foto_urls && k.foto_urls.length > 0
    ).length;

    // Fetch all semesters
    const { data: semestersList } = await supabase
      .from("semester")
      .select("*")
      .order("tahun_akademik", { ascending: false });

    return NextResponse.json({
      active_semester: activeSemester || null,
      selected_semester: selectedSemester || null,
      semester_not_found: semesterNotFound,
      total_mahasiswa_aktif: totalMahasiswaAktif,
      total_lulusan: totalLulusan,
      lulusan_per_tahun: lulusanList,
      total_dosen: dosenResult.count ?? 0,
      total_galeri: (galeriResult.count ?? 0) + virtualGaleriCount,
      total_mata_kuliah: mataKuliahResult.count ?? 0,
      per_level: perLevel,
      semesters: semestersList || [],
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/statistik — Admin/Pegawai: Update per-level counts
export async function PUT(request: NextRequest) {
  try {
    const result = await requireRole(["admin", "pegawai"]);
    if (result instanceof NextResponse) return result;

    const body = await request.json();
    const { per_level } = body;

    const supabase = await createClient();

    // Update per-level student counts
    if (Array.isArray(per_level)) {
      for (const item of per_level) {
        if (item.id && item.total_mahasiswa_aktif !== undefined) {
          await supabase
            .from("statistik_mahasiswa")
            .update({ total_mahasiswa_aktif: item.total_mahasiswa_aktif })
            .eq("id", item.id);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/statistik — Admin/Pegawai: Add a lulusan year entry
export async function POST(request: NextRequest) {
  try {
    const result = await requireRole(["admin", "pegawai"]);
    if (result instanceof NextResponse) return result;

    const body = await request.json();
    const { tahun, jumlah_lulusan } = body;

    if (!tahun || jumlah_lulusan === undefined) {
      return NextResponse.json({ error: "tahun and jumlah_lulusan are required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("statistik_lulusan")
      .insert({ tahun, jumlah_lulusan })
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

// DELETE /api/statistik?lulusan_id=123 — Admin/Pegawai: Delete a lulusan year entry
export async function DELETE(request: NextRequest) {
  try {
    const result = await requireRole(["admin", "pegawai"]);
    if (result instanceof NextResponse) return result;

    const lulusanId = request.nextUrl.searchParams.get("lulusan_id");
    if (!lulusanId) {
      return NextResponse.json({ error: "lulusan_id is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("statistik_lulusan")
      .delete()
      .eq("id", parseInt(lulusanId));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
