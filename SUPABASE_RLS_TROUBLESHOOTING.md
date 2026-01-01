# Supabase RLS Policy Fix - 401 Unauthorized Error

## Problem

Getting `401 Unauthorized` error with message:
```
"new row violates row-level security policy for table \"contacts\""
```

This means the Row Level Security (RLS) policy is blocking the INSERT operation.

## Quick Fix

Run the SQL commands in `SUPABASE_RLS_FIX.sql` in your Supabase SQL Editor:

1. Go to: https://supabase.com/dashboard/project/bryrpynxoapfgdvexxrc/sql
2. Click **New query**
3. Copy and paste all SQL from `SUPABASE_RLS_FIX.sql`
4. Click **Run**

## Step-by-Step Fix (Alternative)

If you prefer to run commands individually:

### 1. Drop and Recreate the Policy

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Allow public inserts" ON contacts;

-- Create new policy with correct syntax
CREATE POLICY "Allow public inserts" ON contacts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

### 2. Grant Table Permissions

```sql
-- Grant INSERT permission to anonymous and authenticated users
GRANT INSERT ON TABLE contacts TO anon;
GRANT INSERT ON TABLE contacts TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
```

### 3. Verify RLS is Enabled

```sql
-- Check if RLS is enabled (should return 'enabled')
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'contacts';
```

### 4. Verify Policy Exists

```sql
-- Check policies on contacts table
SELECT policyname, roles, cmd, with_check
FROM pg_policies 
WHERE tablename = 'contacts';
```

## Common Issues and Solutions

### Issue 1: Policy Doesn't Exist

**Symptom:** No policies shown in the query result

**Solution:** Create the policy using the SQL above

### Issue 2: Policy Syntax is Wrong

**Symptom:** Policy exists but still getting 401 error

**Solution:** Drop and recreate the policy with correct syntax:
```sql
DROP POLICY IF EXISTS "Allow public inserts" ON contacts;

CREATE POLICY "Allow public inserts" ON contacts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

### Issue 3: Missing Table Permissions

**Symptom:** Policy exists but INSERT is denied

**Solution:** Grant INSERT permission:
```sql
GRANT INSERT ON TABLE contacts TO anon;
GRANT INSERT ON TABLE contacts TO authenticated;
```

### Issue 4: Schema Permissions Missing

**Symptom:** Cannot access the table at all

**Solution:** Grant schema usage:
```sql
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
```

## Complete Working Setup

Here's the complete SQL that should work:

```sql
-- Enable RLS (if not already enabled)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policy
DROP POLICY IF EXISTS "Allow public inserts" ON contacts;

-- Create INSERT policy for anonymous users
CREATE POLICY "Allow public inserts" ON contacts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Grant permissions
GRANT INSERT ON TABLE contacts TO anon;
GRANT INSERT ON TABLE contacts TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON TABLE contacts TO authenticated; -- Optional: for viewing in dashboard
```

## Verify Everything Works

After running the fix:

1. Go to your website's contact form
2. Fill out and submit the form
3. Check the browser console - should see success
4. Go to Supabase Table Editor and verify the new row appears

## Testing the API Directly

You can test the API directly using curl:

```bash
curl -X POST 'https://bryrpynxoapfgdvexxrc.supabase.co/rest/v1/contacts' \
  -H "apikey: sb_publishable_hOjOChse12ZWcCTjLb-5nw_M-ocpfmQ" \
  -H "Authorization: Bearer sb_publishable_hOjOChse12ZWcCTjLb-5nw_M-ocpfmQ" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "mobile": "1234567890",
    "message": "Test message"
  }'
```

If this returns a 201 Created status, the policy is working correctly.

## Still Not Working?

If you're still getting errors after following these steps:

1. **Check Supabase Logs:**
   - Go to: https://supabase.com/dashboard/project/bryrpynxoapfgdvexxrc/logs
   - Check API logs for detailed error messages

2. **Verify API Key:**
   - Make sure you're using the `anon` key, not the `service_role` key
   - Check in: Settings → API → anon public key

3. **Check Table Structure:**
   - Verify the table exists: https://supabase.com/dashboard/project/bryrpynxoapfgdvexxrc/editor
   - Check column names match exactly: full_name, email, mobile, message, created_at

4. **Check RLS Status:**
   - In Table Editor, click on the contacts table
   - Go to the "Policies" or "RLS" tab
   - Verify RLS is enabled and policies are active

