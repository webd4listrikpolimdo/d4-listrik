-- ============================================================
-- 03-triggers.sql — Apply updated_at Triggers
-- Run this after 02-schema.sql to apply auto-updating timestamps
-- ============================================================

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'cpl', 'developers', 'dosen', 'fasilitas', 'footer', 'karya', 
      'karya_pending', 'kegiatan', 'kegiatan_pending', 'kontak', 
      'kurikulum_aktif', 'logo', 'logs', 'mata_kuliah', 'pegawai', 
      'prodi_info', 'profile_pending', 'profiles', 'sambutan', 
      'semester', 'statistik_lulusan', 'statistik_mahasiswa', 
      'visi_misi_tujuan'
    ])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', tbl);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()',
      tbl
    );
  END LOOP;
END;
$$;
