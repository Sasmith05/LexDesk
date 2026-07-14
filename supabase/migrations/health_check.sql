-- =============================================================================
-- health_check table
-- =============================================================================
-- Purpose:
--   Provides a lightweight, publicly readable table used exclusively by the
--   GitHub Actions keep-alive workflow to ping the Supabase REST API every
--   6 hours and prevent the free-tier project from being auto-paused.
--
-- Security:
--   - Row Level Security (RLS) is ENABLED on this table.
--   - Only SELECT is allowed for the anon role (public/unauthenticated).
--   - No INSERT, UPDATE, or DELETE is permitted via the anon key.
--   - The table contains no sensitive data (a single static row with a
--     timestamp).
--
-- Instructions:
--   1. Open your Supabase Dashboard -> SQL Editor.
--   2. Paste this entire file and click "Run".
--   3. Confirm the table appears under Table Editor with RLS enabled.
-- =============================================================================

-- Create the table (idempotent; skips if it already exists)
CREATE TABLE IF NOT EXISTS public.health_check (
    id         SERIAL      PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security so no data leaks even if schema is discovered
ALTER TABLE public.health_check ENABLE ROW LEVEL SECURITY;

-- Drop the policy first if it exists (makes this script re-runnable)
DROP POLICY IF EXISTS "allow_anon_select" ON public.health_check;

-- Allow anonymous (unauthenticated) users to SELECT rows only.
-- This is the minimum permission needed for the keep-alive ping.
CREATE POLICY "allow_anon_select"
    ON public.health_check
    FOR SELECT
    TO anon
    USING (true);

-- Insert a single seed row so the query returns data (not an empty array)
-- ON CONFLICT DO NOTHING makes this safe to run multiple times.
INSERT INTO public.health_check (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Confirm setup
SELECT
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename  = 'health_check';
