-- ============================================================
-- 04-rls-policies.sql — Row Level Security (RLS) Policies
-- Enables RLS on all tables and creates authorization rules.
-- Run this fourth after 03-triggers.sql
-- ============================================================

-- Enable RLS for all 24 tables
ALTER TABLE public.cpl ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpl_kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dosen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fasilitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karya ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karya_pending ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kegiatan_pending ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kontak ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kurikulum_aktif ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mata_kuliah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pegawai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prodi_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_pending ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sambutan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semester ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistik_lulusan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistik_mahasiswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visi_misi_tujuan ENABLE ROW LEVEL SECURITY;

-- 1. Policies for 'cpl'
CREATE POLICY "Public read cpl" ON public.cpl FOR SELECT USING (true);

-- 2. Policies for 'cpl_kategori'
CREATE POLICY "Public read cpl_kategori" ON public.cpl_kategori FOR SELECT USING (true);
CREATE POLICY "Admins full access cpl_kategori" ON public.cpl_kategori FOR ALL USING (public.get_user_role() = 'admin');

-- 3. Policies for 'developers'
CREATE POLICY "Public read developers" ON public.developers FOR SELECT USING (true);
CREATE POLICY "Admin insert developers" ON public.developers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update developers" ON public.developers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete developers" ON public.developers FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 4. Policies for 'dosen'
CREATE POLICY "Public read dosen" ON public.dosen FOR SELECT USING (true);
CREATE POLICY "Admins full access dosen" ON public.dosen FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Dosen update own data" ON public.dosen FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'dosen' AND nip = dosen.nip)
);

-- 5. Policies for 'fasilitas'
CREATE POLICY "Public read fasilitas" ON public.fasilitas FOR SELECT USING (true);
CREATE POLICY "Admin insert fasilitas" ON public.fasilitas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update fasilitas" ON public.fasilitas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete fasilitas" ON public.fasilitas FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 6. Policies for 'footer'
CREATE POLICY "Public read footer" ON public.footer FOR SELECT USING (true);
CREATE POLICY "Admin insert footer" ON public.footer FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update footer" ON public.footer FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete footer" ON public.footer FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 7. Policies for 'karya'
CREATE POLICY "Public read karya" ON public.karya FOR SELECT USING (true);
CREATE POLICY "Admins full access karya" ON public.karya FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Dosen manage own karya" ON public.karya FOR ALL USING (
  auth.uid() IN (
    SELECT p.id FROM public.profiles p 
    JOIN public.dosen d ON d.nip = p.nip 
    WHERE p.role = 'dosen' AND d.id = karya.dosen_id
  )
);

-- 8. Policies for 'karya_pending'
CREATE POLICY "Admins full access karya_pending" ON public.karya_pending FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Dosen insert pending" ON public.karya_pending FOR INSERT WITH CHECK (submitted_by = auth.uid());
CREATE POLICY "Dosen read own pending" ON public.karya_pending FOR SELECT USING (submitted_by = auth.uid());
CREATE POLICY "Dosen delete own pending" ON public.karya_pending FOR DELETE USING (submitted_by = auth.uid() AND status = 'pending');

-- 9. Policies for 'kegiatan'
CREATE POLICY "Public read kegiatan" ON public.kegiatan FOR SELECT USING (true);
CREATE POLICY "Authorized roles manage kegiatan" ON public.kegiatan FOR ALL USING (
  public.get_user_role() = ANY (ARRAY['admin', 'pegawai', 'dosen'])
);

-- 10. Policies for 'kegiatan_pending'
CREATE POLICY "Admins full access kegiatan_pending" ON public.kegiatan_pending FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Users insert pending kegiatan" ON public.kegiatan_pending FOR INSERT WITH CHECK (submitted_by = auth.uid());
CREATE POLICY "Users read own pending kegiatan" ON public.kegiatan_pending FOR SELECT USING (submitted_by = auth.uid());
CREATE POLICY "Users delete own pending kegiatan" ON public.kegiatan_pending FOR DELETE USING (submitted_by = auth.uid() AND status = 'pending');

-- 11. Policies for 'kontak'
CREATE POLICY "Public read kontak" ON public.kontak FOR SELECT USING (true);
CREATE POLICY "Admin insert kontak" ON public.kontak FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update kontak" ON public.kontak FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete kontak" ON public.kontak FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 12. Policies for 'kurikulum_aktif'
CREATE POLICY "Public read kurikulum" ON public.kurikulum_aktif FOR SELECT USING (true);
CREATE POLICY "Admins full access kurikulum" ON public.kurikulum_aktif FOR ALL USING (public.get_user_role() = 'admin');

-- 13. Policies for 'logo'
CREATE POLICY "Public read logo" ON public.logo FOR SELECT USING (true);
CREATE POLICY "Admin insert logo" ON public.logo FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update logo" ON public.logo FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete logo" ON public.logo FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 14. Policies for 'logs'
CREATE POLICY "Admins full access logs" ON public.logs FOR ALL USING (public.get_user_role() = 'admin');

-- 15. Policies for 'mata_kuliah'
CREATE POLICY "Public read mata_kuliah" ON public.mata_kuliah FOR SELECT USING (true);

-- 16. Policies for 'pegawai'
CREATE POLICY "Public read pegawai" ON public.pegawai FOR SELECT USING (true);
CREATE POLICY "Admin insert pegawai" ON public.pegawai FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update pegawai" ON public.pegawai FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete pegawai" ON public.pegawai FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 17. Policies for 'prodi_info'
CREATE POLICY "Public read prodi_info" ON public.prodi_info FOR SELECT USING (true);
CREATE POLICY "Admin insert prodi_info" ON public.prodi_info FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update prodi_info" ON public.prodi_info FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete prodi_info" ON public.prodi_info FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 18. Policies for 'profile_pending'
CREATE POLICY "Admins full access pending profile" ON public.profile_pending FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Users can insert own pending profile" ON public.profile_pending FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can read own pending profile" ON public.profile_pending FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own pending profile" ON public.profile_pending FOR UPDATE USING (user_id = auth.uid());

-- 19. Policies for 'profiles'
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admins full access profiles" ON public.profiles FOR ALL USING (public.get_user_role() = 'admin');

-- 20. Policies for 'sambutan'
CREATE POLICY "Public read sambutan" ON public.sambutan FOR SELECT USING (true);
CREATE POLICY "Admin full access sambutan" ON public.sambutan FOR ALL USING (public.get_user_role() = 'admin');

-- 21. Policies for 'semester'
CREATE POLICY "Public read semester" ON public.semester FOR SELECT USING (true);
CREATE POLICY "Admin insert semester" ON public.semester FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update semester" ON public.semester FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete semester" ON public.semester FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 22. Policies for 'statistik_lulusan'
CREATE POLICY "Public read statistik_lulusan" ON public.statistik_lulusan FOR SELECT USING (true);
CREATE POLICY "Admins full access statistik_lulusan" ON public.statistik_lulusan FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Pegawai full access statistik_lulusan" ON public.statistik_lulusan FOR ALL USING (public.get_user_role() = 'pegawai');

-- 23. Policies for 'statistik_mahasiswa'
CREATE POLICY "Public read statistik_mahasiswa" ON public.statistik_mahasiswa FOR SELECT USING (true);
CREATE POLICY "Admin insert statistik_mahasiswa" ON public.statistik_mahasiswa FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update statistik_mahasiswa" ON public.statistik_mahasiswa FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete statistik_mahasiswa" ON public.statistik_mahasiswa FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 24. Policies for 'visi_misi_tujuan'
CREATE POLICY "Public read visi_misi_tujuan" ON public.visi_misi_tujuan FOR SELECT USING (true);
CREATE POLICY "Admin insert visi_misi_tujuan" ON public.visi_misi_tujuan FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update visi_misi_tujuan" ON public.visi_misi_tujuan FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete visi_misi_tujuan" ON public.visi_misi_tujuan FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
