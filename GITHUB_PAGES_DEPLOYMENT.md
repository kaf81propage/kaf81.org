# GitHub Pages Deployment Guide for KAF81 Website

This guide explains how to deploy the KAF81 static website to GitHub Pages using GitHub Actions.

## Prerequisites

- A GitHub repository: `kaf81propage/kaf81.org`
- Repository access with push permissions
- GitHub Pages enabled in repository settings

## Deployment Method

We're using **GitHub Actions** for automated deployment. The workflow is configured in `.github/workflows/deploy.yml`.

### Option Chosen: Direct Configuration (Option 1)

We're using **Option 1: Direct Configuration** because:
- The Supabase anon key is designed to be public (client-side safe)
- Simpler workflow (no secret injection needed)
- Faster deployment (no template processing)
- Industry standard for static sites with public API keys

## Setup Instructions

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/kaf81propage/kaf81.org
2. Click on **Settings** tab
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select:
   - **Source**: `GitHub Actions`
5. Save the changes

### Step 2: Verify Workflow File

The workflow file `.github/workflows/deploy.yml` should already be in your repository. It:
- Triggers on pushes to the `main` branch
- Can be manually triggered via "Run workflow" button
- Automatically deploys all static files to GitHub Pages

### Step 3: Push to Main Branch

Once you push your code to the `main` branch:

```bash
git add .
git commit -m "Initial commit for GitHub Pages deployment"
git push origin main
```

### Step 4: Monitor Deployment

1. Go to the **Actions** tab in your repository
2. You should see a workflow run titled "Deploy to GitHub Pages"
3. Click on it to see the deployment progress
4. Once complete (green checkmark), your site will be live

### Step 5: Access Your Website

Your website will be available at:
- `https://kaf81propage.github.io/kaf81.org/`

Or if you have a custom domain configured:
- `https://www.kaf81.org/` (or your custom domain)

## GitHub Secrets (NOT REQUIRED)

**You do NOT need to add any secrets** for this deployment because:

1. The Supabase anon key is **public by design** - it's safe to include in client-side code
2. Row Level Security (RLS) policies in Supabase protect your data
3. The anon key can only perform operations allowed by your RLS policies

### When Would You Need Secrets?

You would only need secrets if:
- You want to keep credentials out of the repository for organizational policy
- You're using a service role key (which should NEVER be in client-side code)
- You need different credentials for different environments

**For this project, secrets are NOT necessary.**

## Workflow Details

The deployment workflow (`.github/workflows/deploy.yml`):

- **Triggers**: 
  - Automatic: On push to `main` branch
  - Manual: Via GitHub Actions UI (workflow_dispatch)

- **Steps**:
  1. Checks out the repository code
  2. Configures GitHub Pages
  3. Uploads all files as an artifact
  4. Deploys to GitHub Pages

- **Permissions**:
  - `contents: read` - Read repository content
  - `pages: write` - Write to GitHub Pages
  - `id-token: write` - Required for GitHub Pages deployment

## Custom Domain Setup (Optional)

If you want to use a custom domain (e.g., `www.kaf81.org`):

1. Go to repository **Settings** → **Pages**
2. Under **Custom domain**, enter your domain
3. Follow GitHub's instructions to configure DNS:
   - Add CNAME record pointing to `kaf81propage.github.io`
   - Or add A records (IPs provided by GitHub)
4. Enable **Enforce HTTPS** once DNS is configured

## Troubleshooting

### Workflow Fails

- Check the **Actions** tab for error messages
- Ensure GitHub Pages is enabled with source set to "GitHub Actions"
- Verify the workflow file syntax is correct

### Site Not Updating

- Check if the workflow completed successfully
- GitHub Pages can take a few minutes to update
- Clear browser cache or try incognito mode
- Check the deployment status in **Settings** → **Pages**

### 404 Errors

- Verify `index.html` exists in the root directory
- Check that file paths use relative URLs (not absolute)
- Ensure all files are committed and pushed

### Contact Form Not Working

- Verify Supabase credentials are correctly set in `contact.html`
- Check browser console for JavaScript errors
- Verify Supabase table and RLS policies are set up correctly
- Check Supabase project is active and accessible

## Manual Deployment

If you prefer manual deployment without GitHub Actions:

1. Go to repository **Settings** → **Pages**
2. Under **Source**, select a branch (e.g., `main`) and folder (`/ (root)`)
3. Save changes
4. GitHub will automatically deploy from the selected branch

However, using GitHub Actions (current setup) is recommended as it provides:
- Better control over deployment process
- Deployment history and logs
- Ability to add custom build steps in the future

## Files Included in Deployment

All files in the repository root are deployed:
- All `.html` files
- `css/` directory and stylesheets
- `js/` directory and JavaScript files
- `images/` directory and image assets
- `sitemap.xml`
- `robots.txt`
- `favicon.ico` and favicon files

## Updating the Website

To update your website:

1. Make changes to files locally
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "Update website content"
   git push origin main
   ```
3. GitHub Actions will automatically deploy the changes
4. Wait 1-2 minutes for deployment to complete
5. Visit your site to verify changes

## Performance Tips

- Images are already optimized
- CSS and JavaScript are minification-ready (if needed in future)
- Lazy loading is enabled for images
- Fonts are loaded efficiently with `display=swap`
- All assets use relative paths for faster loading

## Security Notes

- Supabase anon key in `contact.html` is safe to be public
- RLS policies protect your database from unauthorized access
- No sensitive data is exposed in client-side code
- All form submissions go through Supabase RLS security

## Support

If you encounter issues:
1. Check GitHub Actions logs in the **Actions** tab
2. Review Supabase setup in `SUPABASE_SETUP.md`
3. Verify all file paths are correct
4. Check browser console for JavaScript errors

