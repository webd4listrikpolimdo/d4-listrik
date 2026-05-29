-- ===================================================
-- MIGRATE statistik_lulusan: single-row → per-year
-- Run this in Supabase SQL Editor
-- ===================================================

-- 1. Drop old table
DROP TABLE IF EXISTS statistik_lulusan;

-- 2. Create new per-year table
CREATE TABLE statistik_lulusan (
  id serial PRIMARY KEY,
  tahun integer NOT NULL UNIQUE,
  jumlah_lulusan integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. Enable RLS
ALTER TABLE statistik_lulusan ENABLE ROW LEVEL SECURITY;

-- 4. Public read access
CREATE POLICY "Public read statistik_lulusan" ON statistik_lulusan
  FOR SELECT USING (true);

-- 5. Admin full access
CREATE POLICY "Admins full access statistik_lulusan" ON statistik_lulusan
  FOR ALL USING (public.get_user_role() = 'admin');

-- 6. Pegawai full access
CREATE POLICY "Pegawai full access statistik_lulusan" ON statistik_lulusan
  FOR ALL USING (public.get_user_role() = 'pegawai');

-- 7. (Optional) Seed some sample data
-- INSERT INTO statistik_lulusan (tahun, jumlah_lulusan) VALUES
--   (2020, 45),
--   (2021, 52),
--   (2022, 60),
--   (2023, 55),
--   (2024, 48);
