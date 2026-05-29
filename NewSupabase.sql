-- ============================================================
-- NewSupabase.sql — Full migration from current schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ============================================================
-- PART 1: MODIFY EXISTING TABLES
-- ============================================================

-- 1a. dosen — add updated_at
ALTER TABLE dosen ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 1b. galeri — add updated_at
ALTER TABLE galeri ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 1c. karya — add updated_at
ALTER TABLE karya ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 1d. karya_pending — add updated_at
ALTER TABLE karya_pending ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 1e. kurikulum_aktif — add created_at, updated_at
ALTER TABLE kurikulum_aktif ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE kurikulum_aktif ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 1f. mata_kuliah — add deskripsi, created_at, updated_at
ALTER TABLE mata_kuliah ADD COLUMN IF NOT EXISTS deskripsi text;
ALTER TABLE mata_kuliah ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE mata_kuliah ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 1g. cpl — add created_at, updated_at
ALTER TABLE cpl ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE cpl ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 1h. profiles — add created_at
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();


-- ============================================================
-- PART 2: DROP OLD statistik_mahasiswa
-- ============================================================

DROP TABLE IF EXISTS statistik_mahasiswa;


-- ============================================================
-- PART 3: CREATE NEW TABLES
-- ============================================================

-- 3a. fasilitas
CREATE TABLE IF NOT EXISTS fasilitas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama text NOT NULL,
  deskripsi text,
  foto_urls jsonb DEFAULT '[]'::jsonb,
  kepala_lab text,
  no_ruangan text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3b. pegawai
CREATE TABLE IF NOT EXISTS pegawai (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 3c. semester
CREATE TABLE IF NOT EXISTS semester (
  id text PRIMARY KEY,                -- e.g. 'ga2526', 'ge2526'
  jenis text NOT NULL CHECK (jenis IN ('ganjil', 'genap')),
  tahun_akademik text NOT NULL,       -- e.g. '2025/2026'
  is_aktif boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3d. statistik_mahasiswa (new version, linked to semester level)
CREATE TABLE IF NOT EXISTS statistik_mahasiswa (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  semester_id text NOT NULL REFERENCES semester(id) ON DELETE CASCADE,
  semester_level integer NOT NULL CHECK (semester_level BETWEEN 1 AND 8), -- e.g. 1, 3, 5, 7 (ganjil) or 2, 4, 6, 8 (genap)
  total_mahasiswa_aktif integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (semester_id, semester_level)
);

-- 3d_new. statistik_lulusan (single-row configuration table for alumni count)
CREATE TABLE IF NOT EXISTS statistik_lulusan (
  id integer PRIMARY KEY DEFAULT 1,
  total_lulusan integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3e. visi_misi_tujuan
CREATE TABLE IF NOT EXISTS visi_misi_tujuan (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  kategori text NOT NULL CHECK (kategori IN ('visi', 'misi', 'tujuan')),
  konten text NOT NULL,
  urutan integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3f. prodi_info (single-row config)
CREATE TABLE IF NOT EXISTS prodi_info (
  id integer PRIMARY KEY DEFAULT 1,
  nama text NOT NULL,
  nama_alternatif text,
  nama_kampus text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3g. akreditasi
CREATE TABLE IF NOT EXISTS akreditasi (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lembaga text NOT NULL,
  peringkat text NOT NULL,
  nomor_sk text,
  tanggal_sk date,
  masa_berlaku date,
  is_aktif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3h. footer (single-row config)
CREATE TABLE IF NOT EXISTS footer (
  id integer PRIMARY KEY DEFAULT 1,
  deskripsi text,
  copyright text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3i. kontak (flexible rows — admin can add more)
CREATE TABLE IF NOT EXISTS kontak (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama text NOT NULL,
  nilai text NOT NULL,
  link text,
  icon text,               -- react-icons name, e.g. 'FaInstagram', 'HiPhone'
  urutan integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3j. logo (single-row config)
CREATE TABLE IF NOT EXISTS logo (
  id integer PRIMARY KEY DEFAULT 1,
  file_url text NOT NULL,
  alt_text text DEFAULT 'Logo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3k. sambutan_kajur (single-row, references dosen)
CREATE TABLE IF NOT EXISTS sambutan_kajur (
  id integer PRIMARY KEY DEFAULT 1,
  dosen_id uuid NOT NULL REFERENCES dosen(id) ON DELETE RESTRICT,
  kutipan text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- PART 4: AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables that have updated_at
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'dosen', 'galeri', 'karya', 'karya_pending',
      'kurikulum_aktif', 'mata_kuliah', 'cpl', 'profiles',
      'fasilitas', 'pegawai', 'semester', 'statistik_mahasiswa',
      'statistik_lulusan', 'visi_misi_tujuan', 'prodi_info',
      'akreditasi', 'footer', 'kontak', 'logo', 'sambutan_kajur'
    ])
  LOOP
    -- Drop existing trigger if any (safe re-run)
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', tbl);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      tbl
    );
  END LOOP;
END;
$$;


-- ============================================================
-- PART 5: ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all new tables
ALTER TABLE fasilitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pegawai ENABLE ROW LEVEL SECURITY;
ALTER TABLE semester ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistik_mahasiswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistik_lulusan ENABLE ROW LEVEL SECURITY;
ALTER TABLE visi_misi_tujuan ENABLE ROW LEVEL SECURITY;
ALTER TABLE prodi_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE akreditasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer ENABLE ROW LEVEL SECURITY;
ALTER TABLE kontak ENABLE ROW LEVEL SECURITY;
ALTER TABLE logo ENABLE ROW LEVEL SECURITY;
ALTER TABLE sambutan_kajur ENABLE ROW LEVEL SECURITY;

-- Public read access for all new tables (website visitors can view)
CREATE POLICY "Public read fasilitas" ON fasilitas FOR SELECT USING (true);
CREATE POLICY "Public read pegawai" ON pegawai FOR SELECT USING (true);
CREATE POLICY "Public read semester" ON semester FOR SELECT USING (true);
CREATE POLICY "Public read statistik_mahasiswa" ON statistik_mahasiswa FOR SELECT USING (true);
CREATE POLICY "Public read statistik_lulusan" ON statistik_lulusan FOR SELECT USING (true);
CREATE POLICY "Public read visi_misi_tujuan" ON visi_misi_tujuan FOR SELECT USING (true);
CREATE POLICY "Public read prodi_info" ON prodi_info FOR SELECT USING (true);
CREATE POLICY "Public read akreditasi" ON akreditasi FOR SELECT USING (true);
CREATE POLICY "Public read footer" ON footer FOR SELECT USING (true);
CREATE POLICY "Public read kontak" ON kontak FOR SELECT USING (true);
CREATE POLICY "Public read logo" ON logo FOR SELECT USING (true);
CREATE POLICY "Public read sambutan_kajur" ON sambutan_kajur FOR SELECT USING (true);

-- Admin-only write access (insert, update, delete) for all new tables
CREATE POLICY "Admin insert fasilitas" ON fasilitas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update fasilitas" ON fasilitas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete fasilitas" ON fasilitas FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin insert pegawai" ON pegawai FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update pegawai" ON pegawai FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete pegawai" ON pegawai FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin insert semester" ON semester FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update semester" ON semester FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete semester" ON semester FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin insert statistik_mahasiswa" ON statistik_mahasiswa FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update statistik_mahasiswa" ON statistik_mahasiswa FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete statistik_mahasiswa" ON statistik_mahasiswa FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin insert statistik_lulusan" ON statistik_lulusan FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update statistik_lulusan" ON statistik_lulusan FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete statistik_lulusan" ON statistik_lulusan FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin insert visi_misi_tujuan" ON visi_misi_tujuan FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update visi_misi_tujuan" ON visi_misi_tujuan FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete visi_misi_tujuan" ON visi_misi_tujuan FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin insert prodi_info" ON prodi_info FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update prodi_info" ON prodi_info FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete prodi_info" ON prodi_info FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin insert akreditasi" ON akreditasi FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update akreditasi" ON akreditasi FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete akreditasi" ON akreditasi FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin insert footer" ON footer FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update footer" ON footer FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete footer" ON footer FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin insert kontak" ON kontak FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update kontak" ON kontak FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete kontak" ON kontak FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin insert logo" ON logo FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update logo" ON logo FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete logo" ON logo FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin insert sambutan_kajur" ON sambutan_kajur FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin update sambutan_kajur" ON sambutan_kajur FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin delete sambutan_kajur" ON sambutan_kajur FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);


-- ============================================================
-- PART 6: SEED DATA
-- ============================================================

-- Seed first semester
INSERT INTO semester (id, jenis, tahun_akademik, is_aktif)
VALUES ('ga2526', 'ganjil', '2025/2026', true)
ON CONFLICT (id) DO NOTHING;

-- Seed statistik for first semester (Levels 1, 3, 5, 7 for ganjil)
INSERT INTO statistik_mahasiswa (semester_id, semester_level, total_mahasiswa_aktif) VALUES
  ('ga2526', 1, 0),
  ('ga2526', 3, 0),
  ('ga2526', 5, 0),
  ('ga2526', 7, 0)
ON CONFLICT (semester_id, semester_level) DO NOTHING;

-- Seed statistik_lulusan
INSERT INTO statistik_lulusan (id, total_lulusan)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- Seed prodi_info
INSERT INTO prodi_info (id, nama, nama_alternatif, nama_kampus)
VALUES (1, 'D4 Teknik Listrik', 'Sarjana Terapan Teknik Listrik', 'Politeknik Negeri Manado')
ON CONFLICT (id) DO NOTHING;

-- Seed footer
INSERT INTO footer (id, deskripsi, copyright)
VALUES (1, 'Program Studi D4 Teknik Listrik - Politeknik Negeri Manado', '© 2025 D4 Teknik Listrik - Politeknik Negeri Manado')
ON CONFLICT (id) DO NOTHING;

-- Seed logo (update the URL to your actual logo)
INSERT INTO logo (id, file_url, alt_text)
VALUES (1, '', 'Logo D4 Teknik Listrik')
ON CONFLICT (id) DO NOTHING;

-- Seed default kontak entries
INSERT INTO kontak (nama, nilai, link, icon, urutan) VALUES
  ('Alamat', 'Jl. Politeknik, Manado', NULL, 'FaMapMarkerAlt', 1),
  ('Email', 'teknik.listrik@polimdo.ac.id', 'mailto:teknik.listrik@polimdo.ac.id', 'FaEnvelope', 2),
  ('Telepon', '(0431) 123456', 'tel:+620431123456', 'FaPhone', 3);
