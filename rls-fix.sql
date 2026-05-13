-- ===================================================
-- RLS FIX v2: Safe to run multiple times
-- ===================================================

-- 1. Helper function (bypasses RLS)
create or replace function public.get_user_role()
returns text language sql stable security definer set search_path = ''
as $$ select role from public.profiles where id = auth.uid() $$;

-- 2. Drop ALL policies (old names + new names)
do $$
declare
  r record;
begin
  -- Drop all policies on profiles
  for r in (select policyname from pg_policies where tablename = 'profiles' and schemaname = 'public') loop
    execute format('drop policy if exists %I on profiles', r.policyname);
  end loop;
  -- Drop all policies on dosen
  for r in (select policyname from pg_policies where tablename = 'dosen' and schemaname = 'public') loop
    execute format('drop policy if exists %I on dosen', r.policyname);
  end loop;
  -- Drop all policies on karya
  for r in (select policyname from pg_policies where tablename = 'karya' and schemaname = 'public') loop
    execute format('drop policy if exists %I on karya', r.policyname);
  end loop;
  -- Drop all policies on galeri
  for r in (select policyname from pg_policies where tablename = 'galeri' and schemaname = 'public') loop
    execute format('drop policy if exists %I on galeri', r.policyname);
  end loop;
  -- Drop all policies on kurikulum_aktif
  for r in (select policyname from pg_policies where tablename = 'kurikulum_aktif' and schemaname = 'public') loop
    execute format('drop policy if exists %I on kurikulum_aktif', r.policyname);
  end loop;
  -- Drop all policies on mata_kuliah
  for r in (select policyname from pg_policies where tablename = 'mata_kuliah' and schemaname = 'public') loop
    execute format('drop policy if exists %I on mata_kuliah', r.policyname);
  end loop;
  -- Drop all policies on cpl
  for r in (select policyname from pg_policies where tablename = 'cpl' and schemaname = 'public') loop
    execute format('drop policy if exists %I on cpl', r.policyname);
  end loop;
end $$;

-- 3. Recreate all policies

-- Profiles
create policy "Users can read own profile" on profiles for select using (id = auth.uid());
create policy "Users can update own profile" on profiles for update using (id = auth.uid());
create policy "Admins full access profiles" on profiles for all using (public.get_user_role() = 'admin');

-- Dosen
create policy "Public read dosen" on dosen for select using (true);
create policy "Admins full access dosen" on dosen for all using (public.get_user_role() = 'admin');
create policy "Dosen update own data" on dosen for update using (auth.uid() in (select id from profiles where role = 'dosen' and nidn = dosen.nidn));

-- Karya
create policy "Public read karya" on karya for select using (true);
create policy "Admins full access karya" on karya for all using (public.get_user_role() = 'admin');
create policy "Dosen manage own karya" on karya for all using (auth.uid() in (select p.id from profiles p join dosen d on d.nidn = p.nidn where p.role = 'dosen' and d.id = karya.dosen_id));

-- Galeri
create policy "Public read galeri" on galeri for select using (true);
create policy "Admins full access galeri" on galeri for all using (public.get_user_role() = 'admin');

-- Kurikulum
create policy "Public read kurikulum" on kurikulum_aktif for select using (true);
create policy "Admins full access kurikulum" on kurikulum_aktif for all using (public.get_user_role() = 'admin');
create policy "Public read mata_kuliah" on mata_kuliah for select using (true);
create policy "Public read cpl" on cpl for select using (true);
