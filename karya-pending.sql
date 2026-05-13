-- ===================================================
-- KARYA PENDING TABLE (Approval Workflow)
-- Run this in Supabase SQL Editor
-- ===================================================

-- 1. Create table
create table karya_pending (
  id uuid default uuid_generate_v4() primary key,
  dosen_id uuid references dosen(id) on delete cascade,
  submitted_by uuid references auth.users on delete set null,
  jenis text not null check (jenis in ('publikasi','penelitian','pengabdian','bukuAjar','hki','sertifikasi')),
  judul text not null,
  tahun integer not null,
  deskripsi text,
  metadata jsonb,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  catatan_admin text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  reviewed_at timestamp with time zone
);

-- 2. Enable RLS
alter table karya_pending enable row level security;

-- 3. Public read for admin
create policy "Admins full access karya_pending" on karya_pending
  for all using (public.get_user_role() = 'admin');

-- 4. Dosen can read own pending submissions
create policy "Dosen read own pending" on karya_pending
  for select using (submitted_by = auth.uid());

-- 5. Dosen can insert pending submissions
create policy "Dosen insert pending" on karya_pending
  for insert with check (submitted_by = auth.uid());

-- 6. Dosen can delete own pending (only if still pending)
create policy "Dosen delete own pending" on karya_pending
  for delete using (submitted_by = auth.uid() and status = 'pending');
