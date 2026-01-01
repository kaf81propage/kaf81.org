# Supabase Database Setup Instructions for KAF81 Contact Form

Follow these instructions to set up the database table in your Supabase project at: https://supabase.com/dashboard/project/bryrpynxoapfgdvexxrc

## Step 1: Create the Contacts Table

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/bryrpynxoapfgdvexxrc
2. Navigate to **SQL Editor** from the left sidebar
3. Click **New query**
4. Copy and paste the following SQL code:

```sql
-- Create contacts table for KAF81 contact form submissions
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- Add a comment to the table
COMMENT ON TABLE contacts IS 'Contact form submissions from KAF81 website';
```

5. Click **Run** to execute the query
6. Verify the table was created by going to **Table Editor** and checking for the `contacts` table

## Step 2: Enable Row Level Security (RLS)

1. Go to **Table Editor** in the left sidebar
2. Click on the `contacts` table
3. Click on the **Security** tab (or find RLS settings)
4. Enable **Row Level Security** toggle
5. Alternatively, run this SQL in the SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
```

## Step 3: Create RLS Policy for Public Inserts

Since the contact form needs to allow public submissions (inserts only), create a policy that allows anyone to insert into the table:

1. Go to **SQL Editor** again
2. Create a new query
3. Copy and paste this SQL:

```sql
-- Create policy to allow public inserts (form submissions)
CREATE POLICY "Allow public inserts" ON contacts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Optional: Create policy to allow authenticated users to read (if you want to view submissions in dashboard)
CREATE POLICY "Allow authenticated reads" ON contacts
  FOR SELECT
  TO authenticated
  USING (true);
```

4. Click **Run** to execute

**Note:** The first policy allows anonymous users (public) to submit the contact form. The second policy is optional and allows authenticated users (you) to read/view submissions in the Supabase dashboard.

## Step 4: Get Your Supabase Credentials

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click on **API** in the settings menu
3. Find the following values:
   - **Project URL**: Something like `https://bryrpynxoapfgdvexxrc.supabase.co`
   - **anon public key**: This is your public/anonymous key (starts with `eyJ...`)

## Step 5: Update the Contact Form Configuration

Update the `contact.html` file with your Supabase credentials:

1. Open `contact.html` in your editor
2. Find the script section near the top (around line 35-40)
3. Update the configuration:

```javascript
<script>
  // Configure Supabase connection
  window.SUPABASE_URL = 'https://bryrpynxoapfgdvexxrc.supabase.co'; // Replace with your Project URL
  window.SUPABASE_ANON_KEY = 'your-anon-key-here'; // Replace with your anon public key
</script>
```

Replace:
- `https://bryrpynxoapfgdvexxrc.supabase.co` with your actual Project URL from Step 4
- `your-anon-key-here` with your actual anon public key from Step 4

## Step 6: Test the Contact Form

1. Open your website's contact page
2. Fill out the contact form
3. Submit the form
4. Check the `contacts` table in Supabase **Table Editor** to verify the submission was saved

## Table Schema Summary

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for each submission |
| full_name | TEXT | NOT NULL | Submitter's full name |
| email | TEXT | NOT NULL | Submitter's email address |
| mobile | TEXT | NOT NULL | Submitter's mobile/phone number |
| message | TEXT | NOT NULL | The message content |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Timestamp when submission was created |

## Security Notes

- **Public inserts are enabled** - Anyone can submit the contact form (this is intentional)
- **No public reads** - Only authenticated users can view submissions (prevents data exposure)
- The `anon` key is safe to use in frontend code - it only allows inserts due to RLS policies
- Never expose your `service_role` key in frontend code

## Troubleshooting

### Form submissions not saving?
- Check browser console for errors
- Verify RLS policies are created and enabled
- Verify Supabase URL and anon key are correct in `contact.html`
- Check Supabase logs in **Logs** section of dashboard

### Can't see the table?
- Go to **Table Editor** and refresh
- Verify the SQL query ran successfully (check SQL Editor history)

### Permission errors?
- Ensure RLS is enabled on the table
- Verify the "Allow public inserts" policy exists and is active
- Check that you're using the `anon` key, not the `service_role` key

## Next Steps (Optional Enhancements)

1. **Email notifications**: Set up email notifications when new contacts are submitted (using Supabase Edge Functions)
2. **Data validation**: Add additional constraints or triggers for email format validation
3. **Spam protection**: Consider adding rate limiting or CAPTCHA
4. **Export functionality**: Create a view or function to export contacts as CSV

