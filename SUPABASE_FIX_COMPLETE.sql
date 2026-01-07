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
DROP POLICY IF EXISTS "Allow public inserts" ON public.contacts;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert_policy" ON public.contacts;
DROP POLICY IF EXISTS "Allow authenticated reads" ON public.contacts;
DROP POLICY IF EXISTS "Public can insert" ON public.contacts;

-- ============================================
-- STEP 4: Create INSERT policy for anonymous users
-- ============================================
CREATE POLICY "Allow public inserts" 
ON public.contacts
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ============================================
-- STEP 5: Grant table-level permissions
-- ============================================
GRANT INSERT ON TABLE public.contacts TO anon;
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

-- Verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'contacts';
-- Should return: contacts | true

-- Verify policy exists:
-- SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'contacts';
-- Should show: Allow public inserts | {anon,authenticated} | INSERT

-- Verify permissions:
-- SELECT grantee, privilege_type FROM information_schema.role_table_grants 
-- WHERE table_name = 'contacts' AND grantee = 'anon';
-- Should show: anon | INSERT

