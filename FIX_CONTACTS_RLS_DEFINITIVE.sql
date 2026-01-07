-- ============================================
-- DEFINITIVE FIX FOR CONTACTS TABLE RLS
-- ============================================
-- This script completely resets and recreates the RLS policy
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bryrpynxoapfgdvexxrc/sql
-- ============================================

-- Step 1: Drop ALL existing policies on contacts table
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

-- Step 2: Ensure RLS is enabled
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Step 3: Grant necessary permissions (ensure they exist)
GRANT INSERT ON TABLE public.contacts TO anon;
GRANT INSERT ON TABLE public.contacts TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 4: Create INSERT policy for anon role (most permissive)
-- Using 'public' role to catch all anonymous requests
CREATE POLICY "Allow anon inserts" 
ON public.contacts
FOR INSERT
TO public
WITH CHECK (true);

-- Step 5: Also create a specific anon policy (backup)
CREATE POLICY "Allow anonymous inserts" 
ON public.contacts
FOR INSERT
TO anon
WITH CHECK (true);

-- Step 6: Create policy for authenticated users
CREATE POLICY "Allow authenticated inserts" 
ON public.contacts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Step 7: Verify the policies were created
SELECT 
    policyname,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'contacts' AND schemaname = 'public'
ORDER BY policyname;

-- Step 8: Verify permissions
SELECT 
    grantee, 
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'contacts' 
  AND table_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY grantee, privilege_type;

-- ============================================
-- DONE! Test your contact form now.
-- ============================================

