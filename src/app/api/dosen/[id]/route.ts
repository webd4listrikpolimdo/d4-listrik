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
    const { nama, foto_url, jabatan, pangkat, email, telepon, bidang_keahlian, program_studi, pendidikan_terakhir, password } = body;

    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminSupabase = createAdminClient();

    const authUpdates: any = {};
    if (password) {
      if (user.role !== "admin") {
        return NextResponse.json({ error: "Hanya admin yang dapat mengubah password staf." }, { status: 403 });
      }
      if (password.length < 6) {
        return NextResponse.json({ error: "Password harus minimal 6 karakter." }, { status: 400 });
      }
      authUpdates.password = password;
    }

    if (email) {
      if (user.role !== "admin") {
        return NextResponse.json({ error: "Hanya admin yang dapat mengubah email staf." }, { status: 403 });
      }
      authUpdates.email = email;
      authUpdates.email_confirm = true;
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await adminSupabase.auth.admin.updateUserById(id, authUpdates);
      if (authError) {
        return NextResponse.json({ error: `Gagal memperbarui data auth: ${authError.message}` }, { status: 400 });
      }
    }

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

    const { data: currentDosen } = await adminSupabase
      .from("dosen")
      .select("foto_url")
      .eq("id", id)
      .single();

    const { data, error } = await adminSupabase
      .from("dosen")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (currentDosen?.foto_url && currentDosen.foto_url !== data.foto_url) {
      const parts = currentDosen.foto_url.split("/storage/v1/object/public/dosen/");
      if (parts.length > 1) {
        const fileName = parts[1];
        await adminSupabase.storage.from("dosen").remove([fileName]);
      }
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("PUT /api/dosen/[id] failed:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
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
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminClient = createAdminClient();

    // Fetch foto_url before deleting record
    const { data: dosen } = await adminClient
      .from("dosen")
      .select("foto_url")
      .eq("id", id)
      .single();

    // 1. Delete dosen record
    const { error } = await adminClient
      .from("dosen")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Clean up photo from storage
    if (dosen?.foto_url) {
      const parts = dosen.foto_url.split("/storage/v1/object/public/dosen/");
      if (parts.length > 1) {
        const fileName = parts[1];
        await adminClient.storage.from("dosen").remove([fileName]);
      }
    }

    // 2. Delete profile record
    await adminClient.from("profiles").delete().eq("id", id);

    // 3. Delete auth user
    await adminClient.auth.admin.deleteUser(id);

    return NextResponse.json({ message: "Dosen deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
