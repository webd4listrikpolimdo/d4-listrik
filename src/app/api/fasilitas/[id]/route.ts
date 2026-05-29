import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/fasilitas/[id] — Admin/Pegawai
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await requireRole(["admin", "pegawai"]);
    if (result instanceof NextResponse) return result;

    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (body.nama !== undefined) updateData.nama = body.nama;
    if (body.deskripsi !== undefined) updateData.deskripsi = body.deskripsi;
    if (body.foto_urls !== undefined) updateData.foto_urls = body.foto_urls;
    if (body.kepala_lab !== undefined) updateData.kepala_lab = body.kepala_lab;
    if (body.no_ruangan !== undefined) updateData.no_ruangan = body.no_ruangan;

    const { data: currentFasilitas } = await supabase
      .from("fasilitas")
      .select("foto_urls")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("fasilitas")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Compare and delete any removed files
    if (currentFasilitas?.foto_urls && Array.isArray(currentFasilitas.foto_urls)) {
      const newUrls = new Set(data?.foto_urls || []);
      const removedUrls = currentFasilitas.foto_urls.filter((url: string) => !newUrls.has(url));

      if (removedUrls.length > 0) {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const adminSupabase = createAdminClient();
        const fileNames = removedUrls.map((url: string) => {
          const parts = url.split("/storage/v1/object/public/galeri/");
          return parts.length > 1 ? parts[1] : null;
        }).filter(Boolean) as string[];

        if (fileNames.length > 0) {
          await adminSupabase.storage.from("galeri").remove(fileNames);
        }
      }
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/fasilitas/[id] — Admin/Pegawai
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await requireRole(["admin", "pegawai"]);
    if (result instanceof NextResponse) return result;

    const { id } = await params;
    const supabase = await createClient();

    // Fetch foto_urls before deleting
    const { data: currentFasilitas } = await supabase
      .from("fasilitas")
      .select("foto_urls")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("fasilitas").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Delete all attached photos from storage
    if (currentFasilitas?.foto_urls && Array.isArray(currentFasilitas.foto_urls) && currentFasilitas.foto_urls.length > 0) {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const adminSupabase = createAdminClient();
      const fileNames = currentFasilitas.foto_urls.map((url: string) => {
        const parts = url.split("/storage/v1/object/public/galeri/");
        return parts.length > 1 ? parts[1] : null;
      }).filter(Boolean) as string[];

      if (fileNames.length > 0) {
        await adminSupabase.storage.from("galeri").remove(fileNames);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
