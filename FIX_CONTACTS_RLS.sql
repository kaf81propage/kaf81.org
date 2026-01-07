-- FIX CONTACTS TABLE RLS - Run this in Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/bryrpynxoapfgdvexxrc/sql

-- 1. Drop ALL existing policies
DROP POLICY IF EXISTS "Allow public inserts" ON public.contacts;
DROP POLICY IF EXISTS "Allow anon inserts" ON public.contacts;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert_anon" ON public.contacts;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert_policy" ON public.contacts;

-- 2. Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 3. Create simple INSERT policy for anon
CREATE POLICY "contacts_insert_anon" 
ON public.contacts
FOR INSERT
TO anon
WITH CHECK (true);

-- 4. Grant permissions
GRANT INSERT ON TABLE public.contacts TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Done! Test your contact form now.

