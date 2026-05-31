import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/pegawai — Public: Get all pegawai
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pegawai")
      .select("id, nama, nip, foto_url, email, telepon, program_studi, pendidikan_terakhir")
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/pegawai — Admin only: Create pegawai + auth user
export async function POST(request: NextRequest) {
  try {
    const result = await requireRole(["admin"]);
    if (result instanceof NextResponse) return result;

    const body = await request.json();
    const { nama, nip, foto_url, email, password, telepon, program_studi, pendidikan_terakhir } = body;

    if (!nama || !nip) {
      return NextResponse.json({ error: "nama and nip are required" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    let authUserId: string | null = null;

    // Create auth user if email + password provided
    if (email && password) {
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }

      authUserId = authData.user.id;

      // Create profile with pegawai role
      const { error: profileError } = await adminClient.from("profiles").insert({
        id: authUserId,
        role: "pegawai",
        full_name: nama,
      });

      if (profileError) {
        // Rollback created auth user
        await adminClient.auth.admin.deleteUser(authUserId);
        return NextResponse.json({ error: `Gagal membuat profil: ${profileError.message}. Pastikan constraint role 'pegawai' sudah ditambahkan ke database.` }, { status: 400 });
      }
    }

    // Insert pegawai record using same ID if auth was created
    const insertData: any = {
      nama,
      nip,
      foto_url: foto_url || null,
      email: email || null,
      telepon: telepon || null,
      program_studi: program_studi || "D4 Teknik Listrik",
      pendidikan_terakhir: pendidikan_terakhir || null,
    };
    if (authUserId) {
      insertData.id = authUserId;
    }

    const { data, error } = await adminClient
      .from("pegawai")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      if (authUserId) {
        // Rollback profile and auth user
        await adminClient.from("profiles").delete().eq("id", authUserId);
        await adminClient.auth.admin.deleteUser(authUserId);
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
