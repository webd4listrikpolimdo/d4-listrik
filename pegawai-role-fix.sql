-- =========================================================================
-- FIX 1: Allow 'pegawai' role in profiles CHECK constraint
-- =========================================================================
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'dosen', 'pegawai'));

-- =========================================================================
-- FIX 2: Grant permission privileges to Supabase roles on all public tables
-- Run this in Supabase SQL Editor to resolve "permission denied" (42501)
-- =========================================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, service_role, authenticated, anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, authenticated, anon;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role, authenticated, anon;

-- Explicitly ensure default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role, authenticated, anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role, authenticated, anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, service_role, authenticated, anon;
