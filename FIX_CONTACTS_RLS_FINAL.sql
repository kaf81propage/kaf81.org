-- ============================================
-- COMPREHENSIVE FIX FOR CONTACTS TABLE RLS
-- ============================================
-- This script fixes the 401 Unauthorized error caused by RLS policy violations
-- Run this entire script in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bryrpynxoapfgdvexxrc/sql
--
-- This script is idempotent - safe to run multiple times
-- ============================================

-- ============================================
-- STEP 1: Ensure the contacts table exists
-- ============================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(created_at DESC);

-- Add table comment
COMMENT ON TABLE public.contacts IS 'Contact form submissions from KAF81 website';

-- ============================================
-- STEP 2: Enable Row Level Security
-- ============================================
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Drop ALL existing policies (clean slate)
-- ============================================
-- Drop all possible policy names that might exist
DROP POLICY IF EXISTS "Allow public inserts" ON public.contacts;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.contacts;
DROP POLICY IF EXISTS "Allow anon inserts" ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert_policy" ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert_anon" ON public.contacts;
DROP POLICY IF EXISTS "Allow authenticated reads" ON public.contacts;
DROP POLICY IF EXISTS "Public can insert" ON public.contacts;
DROP POLICY IF EXISTS "Enable insert for anon" ON public.contacts;
DROP POLICY IF EXISTS "Enable insert for authenticated" ON public.contacts;

-- Drop any remaining policies using dynamic SQL
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'contacts' 
        AND schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.contacts', r.policyname);
    END LOOP;
END $$;

-- ============================================
-- STEP 4: Create INSERT policy for anonymous users
-- ============================================
-- This policy allows anonymous users (public) to insert into the contacts table
-- This is required for the contact form to work
CREATE POLICY "Allow anon inserts" 
ON public.contacts
FOR INSERT
TO anon
WITH CHECK (true);

-- Optional: Also allow authenticated users to insert (if they use the form while logged in)
CREATE POLICY "Allow authenticated inserts" 
ON public.contacts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- STEP 5: Grant necessary permissions
-- ============================================
-- Grant INSERT permission on table to anon role
GRANT INSERT ON TABLE public.contacts TO anon;

-- Grant INSERT permission on table to authenticated role
GRANT INSERT ON TABLE public.contacts TO authenticated;

-- Grant USAGE on schema (required for accessing the table)
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Optional: Allow authenticated users to read (for viewing submissions in dashboard)
GRANT SELECT ON TABLE public.contacts TO authenticated;

CREATE POLICY "Allow authenticated reads" 
ON public.contacts
FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- STEP 6: Verification Queries
-- ============================================
-- Run these queries separately to verify the setup:

-- 6.1: Check RLS is enabled
-- Expected: contacts | true | public
SELECT 
  tablename, 
  rowsecurity as rls_enabled,
  schemaname
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'contacts';

-- 6.2: Check policies exist
-- Expected: Should show at least one INSERT policy for 'anon'
SELECT 
  policyname,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'contacts' AND schemaname = 'public'
ORDER BY policyname;

-- 6.3: Check table permissions
-- Expected: Should show INSERT privilege for anon and authenticated
SELECT 
  grantee, 
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'contacts' 
  AND table_schema = 'public'
  AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- 6.4: Check schema permissions
-- Expected: Should show USAGE privilege for anon and authenticated
SELECT 
  grantee,
  privilege_type
FROM information_schema.usage_privileges 
WHERE object_schema = 'public' 
  AND grantee IN ('anon', 'authenticated')
ORDER BY grantee;

-- 6.5: Check table structure
-- Expected: Should show columns: id, full_name, email, mobile, message, created_at
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'contacts' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- DONE!
-- ============================================
-- After running this script:
-- 1. Test the contact form on your website
-- 2. Verify the submission appears in Supabase Table Editor
-- 3. Check browser console for any remaining errors
-- ============================================

