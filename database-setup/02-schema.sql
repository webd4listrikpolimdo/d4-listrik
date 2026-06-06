-- ============================================================
-- 02-schema.sql — Database Schema Definition
-- Creates all tables, constraints, and relationships.
-- Run this second after 01-extensions-functions.sql
-- ============================================================

-- 1. Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('admin', 'dosen', 'pegawai')),
  full_name text,
  nip text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Table: dosen
CREATE TABLE IF NOT EXISTS public.dosen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  nip text NOT NULL UNIQUE,
  foto_url text,
  jabatan text,
  pangkat text,
  email text,
  telepon text,
  bidang_keahlian text[],
  program_studi text DEFAULT 'D4 Teknik Listrik',
  pendidikan_terakhir text,
  social_media jsonb NOT NULL DEFAULT '{}'::jsonb,
  visibility_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Table: cpl_kategori
CREATE TABLE IF NOT EXISTS public.cpl_kategori (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nama text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Table: cpl
CREATE TABLE IF NOT EXISTS public.cpl (
  kode text PRIMARY KEY,
  deskripsi text NOT NULL,
  kategori text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Table: developers
CREATE TABLE IF NOT EXISTS public.developers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  nim text NOT NULL,
  role text NOT NULL,
  initials text NOT NULL,
  bg text NOT NULL,
  gradient text NOT NULL,
  link text,
  urutan integer,
  foto_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Table: fasilitas
CREATE TABLE IF NOT EXISTS public.fasilitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  deskripsi text,
  foto_urls jsonb DEFAULT '[]'::jsonb,
  kepala_lab text,
  no_ruangan text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Table: footer (Single-row configuration)
CREATE TABLE IF NOT EXISTS public.footer (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  deskripsi text,
  copyright text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Table: karya
CREATE TABLE IF NOT EXISTS public.karya (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dosen_id uuid REFERENCES public.dosen(id) ON DELETE CASCADE,
  jenis text NOT NULL,
  judul text NOT NULL,
  tahun integer NOT NULL,
  deskripsi text,
  metadata jsonb,
  foto_urls jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 9. Table: karya_pending (Lecturer submission approval queue)
CREATE TABLE IF NOT EXISTS public.karya_pending (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dosen_id uuid REFERENCES public.dosen(id) ON DELETE CASCADE,
  submitted_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  jenis text NOT NULL,
  judul text NOT NULL,
  tahun integer NOT NULL,
  deskripsi text,
  metadata jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  catatan_admin text,
  foto_urls jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

-- 10. Table: kegiatan
CREATE TABLE IF NOT EXISTS public.kegiatan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  tanggal date NOT NULL,
  kategori text NOT NULL,
  deskripsi text,
  foto_urls jsonb DEFAULT '[]'::jsonb,
  lokasi text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 11. Table: kegiatan_pending (Events submission queue)
CREATE TABLE IF NOT EXISTS public.kegiatan_pending (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nama text NOT NULL,
  tanggal date NOT NULL,
  kategori text NOT NULL,
  deskripsi text,
  foto_urls jsonb DEFAULT '[]'::jsonb,
  lokasi text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  catatan_admin text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

-- 12. Table: kontak
CREATE TABLE IF NOT EXISTS public.kontak (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  nilai text NOT NULL,
  link text,
  icon text,
  urutan integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 13. Table: kurikulum_aktif (Single-row configuration)
CREATE TABLE IF NOT EXISTS public.kurikulum_aktif (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nama text NOT NULL,
  deskripsi text,
  berlaku_sejak text,
  file_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 14. Table: logo (Single-row configuration)
CREATE TABLE IF NOT EXISTS public.logo (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  file_url text NOT NULL,
  alt_text text DEFAULT 'Logo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 15. Table: logs (Audit trail)
CREATE TABLE IF NOT EXISTS public.logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  user_name text,
  kategori text NOT NULL,
  aksi text NOT NULL,
  deskripsi text NOT NULL,
  data_sebelum jsonb,
  data_sesudah jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 16. Table: mata_kuliah
CREATE TABLE IF NOT EXISTS public.mata_kuliah (
  kode text PRIMARY KEY,
  nama text NOT NULL,
  sks integer NOT NULL,
  semester integer NOT NULL CHECK (semester BETWEEN 1 AND 8),
  jenis text,
  deskripsi text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 17. Table: pegawai
CREATE TABLE IF NOT EXISTS public.pegawai (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  nip text NOT NULL UNIQUE,
  foto_url text,
  email text,
  telepon text,
  program_studi text DEFAULT 'D4 Teknik Listrik',
  pendidikan_terakhir text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 18. Table: prodi_info (Single-row configuration)
CREATE TABLE IF NOT EXISTS public.prodi_info (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nama text NOT NULL,
  nama_alternatif text,
  nama_kampus text NOT NULL,
  deskripsi text,
  hero_bg_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 19. Table: profile_pending (Profile approval workflow)
CREATE TABLE IF NOT EXISTS public.profile_pending (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('dosen', 'pegawai')),
  data jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejected_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 20. Table: sambutan
CREATE TABLE IF NOT EXISTS public.sambutan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dosen_id uuid REFERENCES public.dosen(id) ON DELETE SET NULL,
  kutipan text NOT NULL,
  kategori text NOT NULL UNIQUE CHECK (kategori IN ('kajur', 'kaprodi')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 21. Table: semester
CREATE TABLE IF NOT EXISTS public.semester (
  id text PRIMARY KEY,
  jenis text NOT NULL CHECK (jenis IN ('ganjil', 'genap')),
  tahun_akademik text NOT NULL,
  is_aktif boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 22. Table: statistik_lulusan (Single-row configuration)
CREATE TABLE IF NOT EXISTS public.statistik_lulusan (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  tahun integer NOT NULL,
  jumlah_lulusan integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 23. Table: statistik_mahasiswa
CREATE TABLE IF NOT EXISTS public.statistik_mahasiswa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id text NOT NULL REFERENCES public.semester(id) ON DELETE CASCADE,
  semester_level integer NOT NULL CHECK (semester_level BETWEEN 1 AND 8),
  total_mahasiswa_aktif integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (semester_id, semester_level)
);

-- 24. Table: visi_misi_tujuan
CREATE TABLE IF NOT EXISTS public.visi_misi_tujuan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kategori text NOT NULL CHECK (kategori IN ('visi', 'misi', 'tujuan')),
  konten text NOT NULL,
  urutan integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
