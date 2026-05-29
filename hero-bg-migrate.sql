-- ============================================================
-- SQL Migration: Add columns to prodi_info
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Alter prodi_info table to add missing fields
ALTER TABLE prodi_info ADD COLUMN IF NOT EXISTS deskripsi text;
ALTER TABLE prodi_info ADD COLUMN IF NOT EXISTS hero_bg_url text;
