import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createLog, getClientIp } from "@/lib/logging";

// GET /api/statistik — Public: Get stats summary + per-level breakdown + per-year lulusan
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Fetch active semester
    const { data: activeSemester } = await supabase
      .from("semester")
      .select("id, jenis, tahun_akademik, is_aktif")
      .eq("is_aktif", true)
      .single();

    const semesterId = request.nextUrl.searchParams.get("semester_id");
    let selectedSemester = activeSemester;
    let semesterNotFound = false;

    if (semesterId) {
      const { data: targetSem } = await supabase
        .from("semester")
        .select("id, jenis, tahun_akademik, is_aktif")
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
        .select("id, semester_id, semester_level, total_mahasiswa_aktif")
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
      .select("id, tahun, jumlah_lulusan")
      .order("tahun", { ascending: true });

    const lulusanList = lulusanRows || [];
    const totalLulusan = lulusanList.reduce(
      (sum: number, row: any) => sum + (row.jumlah_lulusan || 0),
      0
    );

    // Fetch active prodi info name
    const { data: prodiData } = await supabase
      .from("prodi_info")
      .select("nama")
      .eq("id", 1)
      .single();
    const prodiName = prodiData?.nama || "D4 Teknik Listrik";

    // Fetch dosen + galeri + mata_kuliah counts
    const [dosenResult, dosenHomebaseResult, galeriResult, karyaResult, mataKuliahResult] = await Promise.all([
      supabase.from("dosen").select("id", { count: "exact", head: true }),
      supabase.from("dosen").select("id", { count: "exact", head: true }).ilike("program_studi", prodiName),
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
      .select("id, jenis, tahun_akademik, is_aktif")
      .order("tahun_akademik", { ascending: false });

    return NextResponse.json({
      active_semester: activeSemester || null,
      selected_semester: selectedSemester || null,
      semester_not_found: semesterNotFound,
      total_mahasiswa_aktif: totalMahasiswaAktif,
      total_lulusan: totalLulusan,
      lulusan_per_tahun: lulusanList,
      total_dosen: dosenResult.count ?? 0,
      total_dosen_homebase: dosenHomebaseResult.count ?? 0,
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

    await createLog({
      kategori: "statistik",
      aksi: "update",
      deskripsi: `Mengubah statistik mahasiswa per tingkat`,
      data_sesudah: per_level,
      ip_address: getClientIp(request),
    });

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

    await createLog({
      kategori: "statistik",
      aksi: "create",
      deskripsi: `Menambahkan data lulusan tahun ${tahun}: ${jumlah_lulusan} orang`,
      data_sesudah: data,
      ip_address: getClientIp(request),
    });

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

    await createLog({
      kategori: "statistik",
      aksi: "delete",
      deskripsi: `Menghapus data lulusan ID: ${lulusanId}`,
      ip_address: getClientIp(request),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
