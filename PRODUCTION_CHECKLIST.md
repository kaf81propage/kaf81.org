# Production Deployment Checklist

## ✅ Code Changes Completed

All URLs have been updated from `http://www.kaf81.org` to `https://kaf81.org`:
- ✅ All HTML files (index.html, contact.html, apply-online.html, apply.html, appeal.html, about.html, updates.html, payment.html, faq.html)
- ✅ sitemap.xml (updated to https and added apply-online.html)
- ✅ robots.txt (updated to https)

## 🔧 Required Changes

### 1. Supabase Configuration

#### A. Verify Tables Exist
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/bryrpynxoapfgdvexxrc
2. Verify these tables exist:
   - ✅ `contacts` table (for contact form)
   - ✅ `scholarship_applications` table (for scholarship application form)

#### B. Check Row Level Security (RLS) Policies

**For `contacts` table:**
```sql
-- Should have a policy allowing public inserts
CREATE POLICY "Allow public inserts" ON contacts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

**For `scholarship_applications` table:**
```sql
-- Should have a policy allowing public inserts
CREATE POLICY "Allow public inserts" ON scholarship_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

#### C. CORS Configuration (IMPORTANT)
Supabase allows requests from any origin by default, but verify:

1. Go to **Settings** → **API** in Supabase Dashboard
2. Check **CORS** settings (if available)
3. Ensure `https://kaf81.org` is allowed (or leave as default to allow all origins)

**Note:** Supabase REST API typically allows all origins by default, so this should work without changes. If you encounter CORS errors, you may need to:
- Check Supabase project settings
- Verify the anon key is correct
- Ensure RLS policies are properly configured

#### D. Verify API Credentials
The following credentials are already in the code:
- **Project URL**: `https://bryrpynxoapfgdvexxrc.supabase.co`
- **Anon Key**: `sb_publishable_hOjOChse12ZWcCTjLb-5nw_M-ocpfmQ`

These are correct and safe to use in production (anon keys are public by design).

### 2. GitHub Configuration

#### A. Verify Repository Settings
1. Go to: https://github.com/kaf81propage/kaf81.org/settings
2. Check **Pages** settings:
   - Source: Should be set to `main` branch
   - Custom domain: Should be set to `kaf81.org` (if using custom domain)

#### B. Custom Domain (if applicable)
If using GitHub Pages with custom domain:
1. Go to **Settings** → **Pages**
2. Under **Custom domain**, enter: `kaf81.org`
3. Check **Enforce HTTPS** (should be enabled)
4. Add DNS records as instructed by GitHub

#### C. Verify Files Are Committed
Ensure all updated files are committed and pushed:
```bash
git add .
git commit -m "Update URLs to https://kaf81.org for production"
git push origin main
```

### 3. Cloudflare Configuration

#### A. SSL/TLS Settings
1. Go to Cloudflare Dashboard: https://dash.cloudflare.com
2. Select your domain `kaf81.org`
3. Go to **SSL/TLS** → **Overview**
4. Ensure SSL/TLS encryption mode is set to **Full** or **Full (strict)**
   - **Full**: Encrypts end-to-end, allows self-signed certificates
   - **Full (strict)**: Encrypts end-to-end, requires valid certificate (recommended)

#### B. Always Use HTTPS
1. Go to **SSL/TLS** → **Edge Certificates**
2. Enable **Always Use HTTPS** (redirects all HTTP to HTTPS)
3. Enable **Automatic HTTPS Rewrites** (optional but recommended)

#### C. Page Rules (Optional but Recommended)
Create a page rule to force HTTPS:
1. Go to **Rules** → **Page Rules**
2. Create rule: `http://*kaf81.org/*`
3. Settings:
   - **Always Use HTTPS**: ON
   - **Forwarding URL**: `https://kaf81.org/$1` (301 Permanent Redirect)

#### D. Caching Settings
1. Go to **Caching** → **Configuration**
2. Set **Caching Level**: Standard
3. Enable **Browser Cache TTL**: Respect Existing Headers (or set to 4 hours)
4. For static assets (CSS, JS, images), you can set longer cache times

#### E. Security Settings
1. Go to **Security** → **Settings**
2. **Security Level**: Medium (recommended)
3. **Challenge Passage**: 30 minutes
4. Enable **Bot Fight Mode** (optional, free tier)

#### F. DNS Settings
Verify DNS records:
- **A Record**: `kaf81.org` → Points to GitHub Pages IP (or your hosting provider)
- **CNAME Record**: `www.kaf81.org` → Points to `kaf81.org` (if using www subdomain)
- Ensure **Proxy status** is **Proxied** (orange cloud) for Cloudflare protection

### 4. Testing Checklist

After deployment, test the following:

#### A. Form Functionality
- [ ] **Contact Form** (`contact.html`):
  - Fill out and submit the contact form
  - Check browser console for errors
  - Verify submission appears in Supabase `contacts` table
  - Check for CORS errors

- [ ] **Scholarship Application Form** (`apply-online.html`):
  - Fill out and submit the application form
  - Check browser console for errors
  - Verify submission appears in Supabase `scholarship_applications` table
  - Test IIT-BHU email validation (@itbhu.ac.in)
  - Test checkbox group validation

#### B. URL Redirects
- [ ] Visit `http://kaf81.org` → Should redirect to `https://kaf81.org`
- [ ] Visit `http://www.kaf81.org` → Should redirect to `https://kaf81.org` (if www is configured)
- [ ] All internal links work correctly
- [ ] No mixed content warnings (HTTP resources on HTTPS page)

#### C. SEO & Performance
- [ ] Verify sitemap.xml is accessible: `https://kaf81.org/sitemap.xml`
- [ ] Verify robots.txt is accessible: `https://kaf81.org/robots.txt`
- [ ] Check Google Search Console for indexing
- [ ] Run Lighthouse audit (aim for 100 in all categories)
- [ ] Test on mobile devices

#### D. Security
- [ ] HTTPS is enforced (no HTTP access)
- [ ] No console errors related to CORS
- [ ] Forms submit successfully
- [ ] No mixed content warnings

## 🐛 Troubleshooting

### Contact Form Not Working
1. **Check Browser Console**: Look for CORS errors or network errors
2. **Verify Supabase Credentials**: Check that URL and anon key are correct
3. **Check RLS Policies**: Ensure policies allow public inserts
4. **Test API Directly**: Use curl or Postman to test Supabase API
5. **Check Supabase Logs**: Go to Supabase Dashboard → Logs

### Scholarship Application Form Not Working
1. **Check Browser Console**: Look for JavaScript errors
2. **Verify Table Exists**: Check `scholarship_applications` table in Supabase
3. **Check RLS Policies**: Ensure policies allow public inserts
4. **Verify Field Names**: Ensure database column names match form field names
5. **Check Data Types**: Verify numeric fields accept the correct data types

### CORS Errors
If you see CORS errors in browser console:
1. **Check Supabase Settings**: Verify CORS is enabled (usually enabled by default)
2. **Verify Domain**: Ensure `https://kaf81.org` is allowed
3. **Check Headers**: Verify API requests include correct headers
4. **Contact Supabase Support**: If issues persist

### HTTPS Redirect Not Working
1. **Check Cloudflare Settings**: Verify "Always Use HTTPS" is enabled
2. **Check Page Rules**: Verify redirect rules are active
3. **Clear Browser Cache**: Try incognito mode
4. **Check DNS**: Ensure DNS is properly configured

## 📝 Notes

- **Supabase Anon Keys**: These are public by design and safe to include in client-side code
- **Security**: Data protection is handled by Row Level Security (RLS) policies, not by hiding keys
- **HTTPS**: Always use HTTPS in production for security and SEO
- **Testing**: Test forms thoroughly before announcing to users

## ✅ Final Verification

Before going live, ensure:
- [ ] All URLs use `https://kaf81.org`
- [ ] Forms submit successfully
- [ ] No console errors
- [ ] HTTPS redirects work
- [ ] Sitemap and robots.txt are accessible
- [ ] All pages load correctly
- [ ] Mobile responsiveness works
- [ ] Lighthouse scores are optimal

