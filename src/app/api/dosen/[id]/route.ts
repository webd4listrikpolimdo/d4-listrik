import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

// GET /api/dosen/[id] — Public: Get single dosen with all karya
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: dosen, error } = await supabase
      .from("dosen")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !dosen) {
      return NextResponse.json(
        { error: "Dosen not found" },
        { status: 404 }
      );
    }

    // Fetch all karya for this dosen
    const { data: karya } = await supabase
      .from("karya")
      .select("*")
      .eq("dosen_id", id)
      .order("tahun", { ascending: false });

    return NextResponse.json({ ...dosen, karya: karya || [] });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/dosen/[id] — Admin or Owner: Update dosen profile
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const result = await requireAuth();
    if (result instanceof NextResponse) return result;

    const { id } = await params;
    const user = result;

    // Admin can edit any dosen, dosen can only edit their own
    if (user.role !== "admin") {
      const supabase = await createClient();
      const { data: dosen } = await supabase
        .from("dosen")
        .select("nidn")
        .eq("id", id)
        .single();

      if (!dosen || dosen.nidn !== user.nidn) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { nama, foto_url, jabatan, pangkat, email, telepon, bidang_keahlian, program_studi, pendidikan_terakhir } = body;

    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminSupabase = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (nama !== undefined) updateData.nama = nama;
    if (foto_url !== undefined) updateData.foto_url = foto_url;
    if (jabatan !== undefined) updateData.jabatan = jabatan;
    if (pangkat !== undefined) updateData.pangkat = pangkat;
    if (email !== undefined) updateData.email = email;
    if (telepon !== undefined) updateData.telepon = telepon;
    if (bidang_keahlian !== undefined) updateData.bidang_keahlian = bidang_keahlian;
    if (program_studi !== undefined) updateData.program_studi = program_studi;
    if (pendidikan_terakhir !== undefined) updateData.pendidikan_terakhir = pendidikan_terakhir;

    const { data, error } = await adminSupabase
      .from("dosen")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/dosen/[id] — Admin only: Delete dosen + cascade karya
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const result = await requireRole(["admin"]);
    if (result instanceof NextResponse) return result;

    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from("dosen")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Dosen deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
