import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createLog, getClientIp } from "@/lib/logging";

export async function POST(request: NextRequest) {
  try {
    const result = await requireAuth();
    if (result instanceof NextResponse) return result;

    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Log the logout event
    const ipAddress = getClientIp(request);
    await createLog({
      kategori: "auth",
      aksi: "logout",
      deskripsi: `User ${result.full_name || result.email} berhasil keluar dari dashboard`,
      ip_address: ipAddress,
      user: {
        id: result.id,
        email: result.email,
        full_name: result.full_name,
      },
    });

    return NextResponse.json({ message: "Logged out successfully" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
