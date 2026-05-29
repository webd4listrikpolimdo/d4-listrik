-- ============================================================
-- SQL Migration: Enable RLS and Create policies for kegiatan
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Enable RLS
ALTER TABLE kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE kegiatan_pending ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Public read kegiatan" ON kegiatan;
DROP POLICY IF EXISTS "Authorized roles manage kegiatan" ON kegiatan;
DROP POLICY IF EXISTS "Admins full access kegiatan_pending" ON kegiatan_pending;
DROP POLICY IF EXISTS "Users read own pending kegiatan" ON kegiatan_pending;
DROP POLICY IF EXISTS "Users insert pending kegiatan" ON kegiatan_pending;
DROP POLICY IF EXISTS "Users delete own pending kegiatan" ON kegiatan_pending;

-- 3. Create policies for 'kegiatan'
CREATE POLICY "Public read kegiatan" ON kegiatan 
  FOR SELECT USING (true);

CREATE POLICY "Authorized roles manage kegiatan" ON kegiatan 
  FOR ALL USING (public.get_user_role() IN ('admin', 'pegawai', 'dosen'));

-- 4. Create policies for 'kegiatan_pending'
CREATE POLICY "Admins full access kegiatan_pending" ON kegiatan_pending 
  FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "Users read own pending kegiatan" ON kegiatan_pending 
  FOR SELECT USING (submitted_by = auth.uid());

CREATE POLICY "Users insert pending kegiatan" ON kegiatan_pending 
  FOR INSERT WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Users delete own pending kegiatan" ON kegiatan_pending 
  FOR DELETE USING (submitted_by = auth.uid() AND status = 'pending');
