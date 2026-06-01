import { createClient } from "@/lib/supabase/server";
import { requireRole, requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createLog, getClientIp } from "@/lib/logging";

type Params = { params: Promise<{ id: string }> };

// PUT /api/kegiatan-pending/[id] — Admin only: Approve or Reject
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const result = await requireRole(["admin"]);
    if (result instanceof NextResponse) return result;

    const { id } = await params;
    const body = await request.json();
    const { action, catatan_admin } = body; // action: 'approve' | 'reject'

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "action must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch the pending submission
    const { data: pending, error: fetchError } = await supabase
      .from("kegiatan_pending")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !pending) {
      return NextResponse.json({ error: "Data pengajuan tidak ditemukan" }, { status: 404 });
    }

    if (pending.status !== "pending") {
      return NextResponse.json({ error: "Pengajuan ini sudah pernah ditinjau" }, { status: 400 });
    }

    if (action === "approve") {
      // Insert into kegiatan table
      const { error: insertError } = await supabase
        .from("kegiatan")
        .insert({
          nama: pending.nama,
          tanggal: pending.tanggal,
          kategori: pending.kategori,
          deskripsi: pending.deskripsi,
          foto_urls: pending.foto_urls || [],
          lokasi: pending.lokasi,
        });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 400 });
      }
    }

    // Update pending status
    const { data, error: updateError } = await supabase
      .from("kegiatan_pending")
      .update({
        status: action === "approve" ? "approved" : "rejected",
        catatan_admin: catatan_admin || null,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Enforce max 100 reviewed/riwayat entries in kegiatan_pending table
    const { data: reviewedData } = await supabase
      .from("kegiatan_pending")
      .select("id")
      .neq("status", "pending")
      .order("reviewed_at", { ascending: false });

    if (reviewedData && reviewedData.length > 100) {
      const idsToDelete = reviewedData.slice(100).map(item => item.id);
      if (idsToDelete.length > 0) {
        await supabase.from("kegiatan_pending").delete().in("id", idsToDelete);
      }
    }

    await createLog({
      kategori: "kegiatan_pending",
      aksi: action === "approve" ? "approve" : "reject",
      deskripsi: `${action === "approve" ? "Menyetujui" : "Menolak"} pengajuan kegiatan: ${pending.nama}`,
      data_sebelum: pending,
      data_sesudah: data,
      ip_address: getClientIp(request),
    });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/kegiatan-pending/[id] — Admin or owner: Cancel/Delete pending entry
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const result = await requireAuth();
    if (result instanceof NextResponse) return result;

    const { id } = await params;
    const user = result;
    const supabase = await createClient();

    // Fetch to check ownership and status
    const { data: pending } = await supabase
      .from("kegiatan_pending")
      .select("submitted_by, status, foto_urls")
      .eq("id", id)
      .single();

    if (!pending) {
      return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
    }

    // Only admin or owner (if still pending) can delete
    if (user.role !== "admin") {
      if (pending.submitted_by !== user.id || pending.status !== "pending") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const { error } = await supabase
      .from("kegiatan_pending")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Delete files from storage if not approved (so they are not used by the main kegiatan table)
    if (pending.status !== "approved" && pending.foto_urls && Array.isArray(pending.foto_urls) && pending.foto_urls.length > 0) {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const adminSupabase = createAdminClient();
      const fileNames = pending.foto_urls.map((url: string) => {
        const parts = url.split("/storage/v1/object/public/galeri/");
        return parts.length > 1 ? parts[1] : null;
      }).filter(Boolean) as string[];

      if (fileNames.length > 0) {
        await adminSupabase.storage.from("galeri").remove(fileNames);
      }
    }

    await createLog({
      kategori: "kegiatan_pending",
      aksi: "delete",
      deskripsi: `Menghapus pengajuan kegiatan ID: ${id}`,
      data_sebelum: pending,
      ip_address: getClientIp(_request),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
