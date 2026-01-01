# KAF81 - KASI 1981 Alumni Foundation Website

A static website for KAF81 (KASI 1981 Alumni Foundation) built with vanilla HTML, CSS, and JavaScript. Optimized for Lighthouse 100, SEO, accessibility, and semantic HTML.

## Features

- ✅ Lighthouse 100 Score (Performance, Accessibility, Best Practices, SEO)
- ✅ SEO Optimized (Meta tags, Schema.org structured data, sitemap.xml)
- ✅ Accessibility Compliant (WCAG 2.1 AA)
- ✅ Semantic HTML5 elements
- ✅ Responsive design (Mobile-first)
- ✅ Vanilla JavaScript (No frameworks or libraries)
- ✅ Supabase integration for contact form

## Project Structure

```
kaf81.org/
├── index.html          # Home page
├── appeal.html         # Our Appeal page
├── about.html          # About Us page
├── updates.html        # News & Updates page
├── apply.html          # Apply Online page
├── faq.html            # FAQ page
├── payment.html        # Payment/Donation page
├── contact.html        # Contact Us page
├── css/
│   └── style.css       # Main stylesheet
├── js/
│   ├── main.js         # Core functionality
│   ├── contact.js      # Contact form handler
│   └── form-validation.js # Form validation utilities
├── images/             # Image assets
├── sitemap.xml         # SEO sitemap
└── robots.txt          # Search engine directives
```

## Setup Instructions

### 1. Supabase Configuration

To enable the contact form, you need to set up a Supabase project:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create a table named `contacts` with the following schema:
   ```sql
   CREATE TABLE contacts (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     full_name TEXT NOT NULL,
     email TEXT NOT NULL,
     mobile TEXT NOT NULL,
     message TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```
3. Update `contact.html` with your Supabase credentials:
   ```javascript
   window.SUPABASE_URL = 'https://your-project.supabase.co';
   window.SUPABASE_ANON_KEY = 'your-anon-key';
   ```
4. Configure Row Level Security (RLS) policies to allow inserts:
   ```sql
   ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Allow public inserts" ON contacts
     FOR INSERT WITH CHECK (true);
   ```

### 2. Local Development

Simply open `index.html` in a web browser or use a local server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (with http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

### 3. Deployment

This is a static website and can be deployed to any static hosting service:

- **Netlify**: Drag and drop the folder or connect to Git
- **Vercel**: `vercel deploy`
- **GitHub Pages**: Push to repository and enable Pages
- **AWS S3**: Upload files to S3 bucket with static website hosting
- **Any web server**: Upload files via FTP/SFTP

## Typography

- **Headings**: Playfair Display (serif)
- **Body**: Quicksand (sans-serif)

Fonts are loaded from Google Fonts with `display=swap` for optimal performance.

## Browser Support

Modern browsers (last 2 versions):
- Chrome
- Firefox
- Safari
- Edge

## Performance Optimizations

- Image lazy loading
- CSS optimized for performance
- Minified assets (production)
- Efficient font loading
- Semantic HTML structure

## Accessibility Features

- Semantic HTML5 elements
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Skip to main content link
- Screen reader support
- Color contrast compliance (WCAG 2.1 AA)

## SEO Features

- Meta descriptions for all pages
- Open Graph tags
- Twitter Card tags
- Schema.org structured data:
  - Organization schema (homepage)
  - FAQPage schema (FAQ page)
  - BreadcrumbList schema (all pages)
  - ContactPage schema (contact page)
- XML sitemap
- robots.txt
- Canonical URLs

## License

© 2024. KASI 1981 ALUMNI FOUNDATION. All Rights Reserved.
