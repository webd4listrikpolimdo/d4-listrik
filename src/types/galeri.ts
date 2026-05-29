export interface GaleriItem {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal: string; // YYYY-MM-DD
  kategori: "fasilitas" | "tridharma" | "kegiatan";
  foto: string[]; // URL dari Supabase Storage atau path lokal
  warna: string; // gradient color for placeholder/fallback
  subLabel?: string; // e.g. "Publikasi", "Penelitian" — for karya items in galeri
  updated_at?: string; // ISO timestamp for sorting by most recently updated
}
