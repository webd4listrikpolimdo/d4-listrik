-- ============================================================
-- 01-extensions-functions.sql — Extensions & Helper Functions
-- Run this first in Supabase SQL Editor
-- ============================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Trigger Function: Update 'updated_at' Timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Security Helper Function: Bypasses RLS to query user roles
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text 
LANGUAGE sql 
STABLE 
SECURITY DEFINER 
SET search_path = ''
AS $$ 
  SELECT role FROM public.profiles WHERE id = auth.uid(); 
$$;
