# Open Scholarship Applications

## Overview
Switch the website to show that scholarship applications are OPEN by:
1. Removing access blocks from `apply-online.html` (redirects and SEO blocks)
2. Updating links to point to the application form page (`apply-online.html`)
3. Updating button text accordingly

## Files to Update

### 1. apply-online.html - Remove Access Blocks
- **Line 7**: Remove the meta refresh redirect: `<meta http-equiv="refresh" content="0; url=apply.html">`
- **Lines 21-24**: Remove the JavaScript redirect block (the comment and script tag)
- **Line 27**: Change meta robots tag from `noindex, nofollow` back to `index, follow`
- **Line 103** (Navigation): Change `href="apply.html"` back to `href="apply-online.html"`

### 2. robots.txt - Allow SEO Access
- **Line 3**: Remove the `Disallow: /apply-online.html` line

### 3. sitemap.xml - Add Back to Sitemap
- Add back the `<url>` entry for `apply-online.html` after the `apply.html` entry:
  ```xml
  <url>
    <loc>https://kaf81.org/apply-online.html</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  ```
  (Update the `<lastmod>` date to the current date)

### 4. index.html
- **Line 105** (Navigation): Change `href="apply.html"` to `href="apply-online.html"`
- **Line 120** (Hero button): 
  - Change `href="apply.html"` to `href="apply-online.html"`
  - Change button text from "Applications for KAF81 Scholarships for 2025-26 are now CLOSED. Click Here" to "Applications for KAF81 Scholarships for 2025-26 are now OPEN. Click Here"
- **Line 128** (Text link): Change `href="apply.html"` to `href="apply-online.html"`

### 5. contact.html
- **Line 97** (Navigation): Change `href="apply.html"` to `href="apply-online.html"`

### 6. appeal.html
- **Line 70** (Navigation): Change `href="apply.html"` to `href="apply-online.html"`
- **Line 92** (Text link): Change `href="apply.html"` to `href="apply-online.html"`

### 7. payment.html
- **Line 70** (Navigation): Change `href="apply.html"` to `href="apply-online.html"`

### 8. faq.html
- **Line 136** (Navigation): Change `href="apply.html"` to `href="apply-online.html"`

### 9. about.html
- **Line 70** (Navigation): Change `href="apply.html"` to `href="apply-online.html"`

### 10. updates.html
- **Line 70** (Navigation): Change `href="apply.html"` to `href="apply-online.html"`

## Verification Steps
1. Verify that `apply-online.html` is accessible (no redirects)
2. Check that homepage button links to apply-online.html
3. Check that all navigation menus link to apply-online.html
4. Verify button text says "OPEN"
5. Test that clicking links takes users to the application form
6. Verify robots.txt no longer blocks the page
7. Verify sitemap.xml includes apply-online.html
8. Test that search engines can access the page (check meta robots tag)

## Quick Reference
- **Target file**: `apply-online.html` (application form)
- **Button text**: "Applications for KAF81 Scholarships for 2025-26 are now OPEN. Click Here"
- **All links should point to**: `apply-online.html`

