-- Migration: 20260710_0000_init_supabase_users.sql
-- Description: Tahap 1 Migrasi - Menggunakan JSONB untuk Dual-Write

CREATE TABLE users (
    telegram_id VARCHAR PRIMARY KEY,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);