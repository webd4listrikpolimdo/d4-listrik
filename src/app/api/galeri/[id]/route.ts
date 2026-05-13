import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

// GET /api/galeri/[id] — Public: Get single galeri item
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("galeri")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Galeri item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/galeri/[id] — Admin only: Update galeri item
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const result = await requireRole(["admin"]);
    if (result instanceof NextResponse) return result;

    const { id } = await params;
    const body = await request.json();
    const { judul, deskripsi, tanggal, kategori, foto_urls } = body;

    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (judul !== undefined) updateData.judul = judul;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (tanggal !== undefined) updateData.tanggal = tanggal;
    if (kategori !== undefined) updateData.kategori = kategori;
    if (foto_urls !== undefined) updateData.foto_urls = foto_urls;

    const { data, error } = await supabase
      .from("galeri")
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

// DELETE /api/galeri/[id] — Admin only: Delete galeri item
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const result = await requireRole(["admin"]);
    if (result instanceof NextResponse) return result;

    const { id } = await params;
    const supabase = await createClient();

    // Optionally delete associated images from storage
    const { data: galeri } = await supabase
      .from("galeri")
      .select("foto_urls")
      .eq("id", id)
      .single();

    if (galeri?.foto_urls?.length) {
      // Extract file paths from URLs and delete from storage
      const paths = galeri.foto_urls
        .map((url: string) => {
          const match = url.match(/\/storage\/v1\/object\/public\/galeri\/(.+)/);
          return match ? match[1] : null;
        })
        .filter(Boolean);

      if (paths.length > 0) {
        await supabase.storage.from("galeri").remove(paths);
      }
    }

    const { error } = await supabase
      .from("galeri")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Galeri item deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
