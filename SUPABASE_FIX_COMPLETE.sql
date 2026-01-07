-- COMPLETE FIX for Contacts Table - Run this entire script
-- This will fix all common issues causing 401 Unauthorized errors

-- ============================================
-- STEP 1: Create table if it doesn't exist
-- ============================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
DROP POLICY IF EXISTS "contacts_insert_policy" ON public.contacts;
DROP POLICY IF EXISTS "Allow authenticated reads" ON public.contacts;
DROP POLICY IF EXISTS "Public can insert" ON public.contacts;
DROP POLICY IF EXISTS "Enable insert for anon" ON public.contacts;
DROP POLICY IF EXISTS "Enable insert for authenticated" ON public.contacts;

-- Drop all policies using a more aggressive approach
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'contacts' AND schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.contacts', r.policyname);
    END LOOP;
END $$;

-- ============================================
-- STEP 4: Create INSERT policy for anonymous users
-- ============================================
-- Create policy for anon role (Supabase anonymous/unauthenticated users)
-- This is the primary policy needed for public form submissions
CREATE POLICY "Allow anon inserts" 
ON public.contacts
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy for authenticated users (if they need to submit)
CREATE POLICY "Allow authenticated inserts" 
ON public.contacts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- STEP 5: Grant table-level permissions
-- ============================================
-- Grant to anon role (Supabase anonymous/unauthenticated users)
-- This is required for public form submissions
GRANT INSERT ON TABLE public.contacts TO anon;
-- Grant to authenticated role (for logged-in users if needed)
GRANT INSERT ON TABLE public.contacts TO authenticated;

-- ============================================
-- STEP 6: Grant schema-level permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================
-- STEP 7: Optional - Allow authenticated users to read
-- ============================================
GRANT SELECT ON TABLE public.contacts TO authenticated;

CREATE POLICY "Allow authenticated reads" 
ON public.contacts
FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- VERIFICATION QUERIES (run these separately to verify)
-- ============================================

-- 1. Verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contacts';
-- Expected: contacts | true

-- 2. Verify policies exist:
-- SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'contacts' AND schemaname = 'public';
-- Expected: Should show at least:
--   - "Allow anon inserts" | {anon} | INSERT
--   - "Allow authenticated inserts" | {authenticated} | INSERT

-- 3. Verify table permissions:
-- SELECT grantee, privilege_type FROM information_schema.role_table_grants 
-- WHERE table_schema = 'public' AND table_name = 'contacts' AND grantee IN ('anon', 'authenticated');
-- Expected: Should show INSERT for both anon and authenticated

-- 4. Verify schema permissions:
-- SELECT grantee, privilege_type FROM information_schema.usage_privileges 
-- WHERE object_schema = 'public' AND grantee IN ('anon', 'authenticated');
-- Expected: Should show USAGE for both anon and authenticated

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. Run this entire script in Supabase SQL Editor:
--    https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
-- 2. Replace YOUR_PROJECT_ID with your actual Supabase project ID
-- 3. After running, test the contact form to verify it works
-- 4. If you still get 401 errors, check the verification queries above

