-- ===================================================
-- STATISTIK MAHASISWA TABLE
-- Run this in Supabase SQL Editor
-- ===================================================

-- 1. Create table (single-row, like kurikulum_aktif)
create table statistik_mahasiswa (
  id integer primary key default 1,
  total_mahasiswa_aktif integer not null default 0,
  total_lulusan integer not null default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  constraint single_row_statistik check (id = 1)
);

-- 2. Enable RLS
alter table statistik_mahasiswa enable row level security;

-- 3. Public read access
create policy "Public read statistik" on statistik_mahasiswa
  for select using (true);

-- 4. Admin full access
create policy "Admins full access statistik" on statistik_mahasiswa
  for all using (public.get_user_role() = 'admin');

-- 5. Insert initial data
INSERT INTO statistik_mahasiswa (id, total_mahasiswa_aktif, total_lulusan)
VALUES (1, 420, 1200);
