-- QUICK FIX for Contacts Table RLS Error
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/bryrpynxoapfgdvexxrc/sql
-- Copy and paste the entire script, then click "Run"

-- Step 1: Drop all existing policies on contacts table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'contacts'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.contacts', r.policyname);
    END LOOP;
END $$;

-- Step 2: Ensure RLS is enabled
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Step 3: Create INSERT policy for anonymous users (this is what's needed for public forms)
CREATE POLICY "contacts_insert_anon" 
ON public.contacts
FOR INSERT
TO anon
WITH CHECK (true);

-- Step 4: Grant necessary permissions
GRANT INSERT ON TABLE public.contacts TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Step 5: Verify (run these separately if needed)
-- SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'contacts' AND schemaname = 'public';
-- Should show: contacts_insert_anon | {anon} | INSERT

