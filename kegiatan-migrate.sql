-- ============================================================
-- SQL Migration: Create kegiatan and kegiatan_pending tables
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create kegiatan table
CREATE TABLE IF NOT EXISTS kegiatan (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama text NOT NULL,
  tanggal date NOT NULL,
  kategori text NOT NULL,
  deskripsi text,
  foto_urls jsonb DEFAULT '[]'::jsonb,
  lokasi text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create kegiatan_pending table
CREATE TABLE IF NOT EXISTS kegiatan_pending (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  submitted_by uuid NOT NULL,
  nama text NOT NULL,
  tanggal date NOT NULL,
  kategori text NOT NULL,
  deskripsi text,
  foto_urls jsonb DEFAULT '[]'::jsonb,
  lokasi text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status IN ('pending', 'approved', 'rejected')),
  catatan_admin text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

-- 3. Enable RLS
ALTER TABLE kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE kegiatan_pending ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for 'kegiatan'
CREATE POLICY "Public read kegiatan" ON kegiatan 
  FOR SELECT USING (true);

CREATE POLICY "Authorized roles manage kegiatan" ON kegiatan 
  FOR ALL USING (public.get_user_role() IN ('admin', 'pegawai', 'dosen'));

-- 5. Create policies for 'kegiatan_pending'
CREATE POLICY "Admins full access kegiatan_pending" ON kegiatan_pending 
  FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "Users read own pending kegiatan" ON kegiatan_pending 
  FOR SELECT USING (submitted_by = auth.uid());

CREATE POLICY "Users insert pending kegiatan" ON kegiatan_pending 
  FOR INSERT WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Users delete own pending kegiatan" ON kegiatan_pending 
  FOR DELETE USING (submitted_by = auth.uid() AND status = 'pending');
