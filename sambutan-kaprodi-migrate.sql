-- ============================================================
-- SQL Migration: Create sambutan_kaprodi table
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create sambutan_kaprodi table
CREATE TABLE IF NOT EXISTS sambutan_kaprodi (
  id integer PRIMARY KEY DEFAULT 1,
  dosen_id uuid NOT NULL REFERENCES dosen(id) ON DELETE RESTRICT,
  kutipan text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE sambutan_kaprodi ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
CREATE POLICY "Public read sambutan_kaprodi" ON sambutan_kaprodi 
  FOR SELECT USING (true);

CREATE POLICY "Admin insert sambutan_kaprodi" ON sambutan_kaprodi 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admin update sambutan_kaprodi" ON sambutan_kaprodi 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admin delete sambutan_kaprodi" ON sambutan_kaprodi 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- 4. Apply auto-update updated_at trigger
CREATE TRIGGER handle_updated_at_sambutan_kaprodi
  BEFORE UPDATE ON sambutan_kaprodi
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
