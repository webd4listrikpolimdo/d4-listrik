import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// GET /api/dosen — Public: List all dosen
export async function GET() {
  try {
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
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

// POST /api/dosen — Admin only: Create new dosen + auth account
export async function POST(request: NextRequest) {
  try {
    const result = await requireRole(["admin"]);
    if (result instanceof NextResponse) return result;

    const body = await request.json();
    const {
      nama,
      nidn,
      foto_url,
      jabatan,
      pangkat,
      email,
      password,
      telepon,
      bidang_keahlian,
      program_studi,
      pendidikan_terakhir,
    } = body;

    if (!nama || !nidn) {
      return NextResponse.json(
        { error: "nama and nidn are required" },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password are required to create a dosen account" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password harus minimal 6 karakter" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // 1. Create auth user in Supabase Auth
    const { data: authData, error: authError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm the email
        user_metadata: { full_name: nama, nidn },
      });

    if (authError) {
      return NextResponse.json(
        { error: `Gagal membuat akun: ${authError.message}` },
        { status: 400 }
      );
    }

    const authUserId = authData.user.id;

    // 2. Create profile row (links auth user to role + nidn)
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .insert({
        id: authUserId,
        role: "dosen",
        full_name: nama,
        nidn,
      });

    if (profileError) {
      // Rollback: delete the auth user if profile creation fails
      await adminSupabase.auth.admin.deleteUser(authUserId);
      return NextResponse.json(
        { error: `Gagal membuat profil: ${profileError.message}` },
        { status: 400 }
      );
    }

    // 3. Create dosen row using the auth user's UUID as the dosen id
    const { data, error } = await adminSupabase
      .from("dosen")
      .insert({
        id: authUserId,
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
      // Rollback: delete profile and auth user
      await adminSupabase.from("profiles").delete().eq("id", authUserId);
      await adminSupabase.auth.admin.deleteUser(authUserId);
      return NextResponse.json(
        { error: `Gagal menyimpan data dosen: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ...data, auth_user_id: authUserId },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/dosen error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
