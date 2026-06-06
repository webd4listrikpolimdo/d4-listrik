-- ============================================================
-- 05-storage.sql — Storage Buckets and Policies
-- Registers public buckets and configures access control.
-- Run this fifth after 04-rls-policies.sql
-- ============================================================

-- 1. Register Buckets in Supabase Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('galeri', 'galeri', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('logo', 'logo', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('dosen', 'dosen', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('pegawai', 'pegawai', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('kurikulum', 'kurikulum', true, 10485760, ARRAY['application/pdf']),
  ('heroBackground', 'heroBackground', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 2. Configure Storage RLS Policies
-- Note: Supabase storage objects are managed in the storage.objects table.

-- Drop existing storage policies if they exist to avoid conflict on re-runs
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Full Access" ON storage.objects;

-- Policy A: Allow anyone to view public files in these buckets
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('galeri', 'logo', 'dosen', 'pegawai', 'kurikulum', 'heroBackground')
  );

-- Policy B: Allow Admins to manage all objects in these buckets
CREATE POLICY "Admin Full Access" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id IN ('galeri', 'logo', 'dosen', 'pegawai', 'kurikulum', 'heroBackground')
    AND (SELECT public.get_user_role()) = 'admin'
  )
  WITH CHECK (
    bucket_id IN ('galeri', 'logo', 'dosen', 'pegawai', 'kurikulum', 'heroBackground')
    AND (SELECT public.get_user_role()) = 'admin'
  );
