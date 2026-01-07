-- Diagnostic Queries for Contacts Table
-- Run these queries one by one in Supabase SQL Editor to diagnose the 401 error

-- 1. Check if table exists and RLS status
SELECT 
  tablename, 
  rowsecurity as rls_enabled,
  schemaname
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'contacts';

-- Expected result: contacts | true | public
-- If rowsecurity is false, RLS is not enabled (this is the problem!)

-- 2. Check all policies on contacts table
SELECT 
  policyname,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'contacts';

-- Expected result: Should show at least one policy with cmd = 'INSERT' and roles including 'anon'

-- 3. Check table permissions
SELECT 
  grantee, 
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'contacts' AND grantee IN ('anon', 'authenticated');

-- Expected result: Should show INSERT privilege for anon and/or authenticated

-- 4. Check schema permissions
SELECT 
  grantee,
  privilege_type
FROM information_schema.usage_privileges 
WHERE object_schema = 'public' AND grantee IN ('anon', 'authenticated');

-- Expected result: Should show USAGE privilege for anon and authenticated

-- 5. Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'contacts' 
ORDER BY ordinal_position;

-- Expected result: Should show columns: id, full_name, email, mobile, message, created_at

