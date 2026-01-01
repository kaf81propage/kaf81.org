-- Fix RLS Policy for Contacts Table
-- Run this in Supabase SQL Editor to fix the 401 Unauthorized error

-- Step 1: Check if RLS is enabled
-- (Should return: contacts | enabled)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'contacts';

-- Step 2: Drop existing policy if it exists (to recreate it)
DROP POLICY IF EXISTS "Allow public inserts" ON contacts;

-- Step 3: Create the correct policy that allows anonymous inserts
CREATE POLICY "Allow public inserts" ON contacts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Step 4: Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'contacts';

-- Step 5: Grant necessary permissions (if not already granted)
GRANT INSERT ON TABLE contacts TO anon;
GRANT INSERT ON TABLE contacts TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 6: Verify table permissions
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'contacts';

