-- Complete Fix for Contacts Table - 401 Unauthorized Error
-- Run this entire script in Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/bryrpynxoapfgdvexxrc/sql

-- Step 1: Ensure the contacts table exists (create if it doesn't)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public inserts" ON contacts;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON contacts;
DROP POLICY IF EXISTS "contacts_insert_policy" ON contacts;

-- Step 4: Create the correct INSERT policy for anonymous users
CREATE POLICY "Allow public inserts" ON contacts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Step 5: Grant necessary table permissions
GRANT INSERT ON TABLE contacts TO anon;
GRANT INSERT ON TABLE contacts TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 6: Optional - Allow authenticated users to read (for viewing in dashboard)
GRANT SELECT ON TABLE contacts TO authenticated;

-- Drop existing read policy if it exists, then create new one
DROP POLICY IF EXISTS "Allow authenticated reads" ON contacts;

CREATE POLICY "Allow authenticated reads" ON contacts
  FOR SELECT
  TO authenticated
  USING (true);

-- Step 7: Verify the setup
-- Run these queries separately to verify:

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'contacts';
-- Should return: contacts | enabled

-- Check policies exist
SELECT policyname, roles, cmd, with_check
FROM pg_policies 
WHERE tablename = 'contacts';
-- Should show at least one INSERT policy

-- Check permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'contacts';
-- Should show INSERT for anon and authenticated

