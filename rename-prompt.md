You are a naming assistant. Given a list of file paths and minimal context from a static website, suggest a new filename (basename only, same extension) for each file. Rules:
- Lowercase, kebab-case, no spaces. SEO-friendly and human-readable.
- For HTML: use page purpose (e.g. about-us.html, contact.html). Keep index.html as index.html.
- For CSS/JS: use purpose (e.g. main-styles.css, analytics.js).
- For images: use content (e.g. logo-infygate.webp, hero-banner.webp). Use alt/title when provided.
- Return a JSON object: keys = exact original path strings, values = new basename only (e.g. "main.css"). Preserve extension.
- Do not change path prefix (e.g. css/ stays css/ by returning "name.css" not "css/name.css").

Files and context:
[
  {
    "path": "about.html",
    "context": {
      "title": "About Us - KAF81",
      "first_heading": "ABOUT US"
    }
  },
  {
    "path": "appeal.html",
    "context": {
      "title": "Our Appeal - KAF81",
      "first_heading": "OUR APPEAL"
    }
  },
  {
    "path": "apply-online.html",
    "context": {
      "title": "Apply Online - KAF81 Scholarships 2025-26",
      "first_heading": "APPLY ONLINE"
    }
  },
  {
    "path": "apply.html",
    "context": {
      "title": "Apply Online - KAF81 Scholarships",
      "first_heading": "APPLY ONLINE"
    }
  },
  {
    "path": "contact.html",
    "context": {
      "title": "Contact Us - KAF81",
      "first_heading": "CONTACT US"
    }
  },
  {
    "path": "contact_clone.html",
    "context": {
      "title": "Contact Us - KAF81",
      "first_heading": "CONTACT US"
    }
  },
  {
    "path": "css/style.css",
    "context": {
      "path": "css/style.css"
    }
  },
  {
    "path": "faq.html",
    "context": {
      "title": "FAQ - KAF81",
      "first_heading": "KAF 81 FAQ (Applicants)"
    }
  },
  {
    "path": "imgs/images_about-us.webp",
    "context": {
      "refs": []
    }
  },
  {
    "path": "imgs/images_kaf81-hero-image.webp",
    "context": {
      "refs": []
    }
  },
  {
    "path": "imgs/images_kaf81-logo.webp",
    "context": {
      "refs": []
    }
  },
  {
    "path": "imgs/images_our-appeal.webp",
    "context": {
      "refs": []
    }
  },
  {
    "path": "imgs/images_scholarship-awardees.webp",
    "context": {
      "refs": []
    }
  },
  {
    "path": "index.html",
    "context": {
      "title": "KAF81 - KASI 1981 Alumni Foundation | IIT BHU",
      "first_heading": "KAF81"
    }
  },
  {
    "path": "js/contact.js",
    "context": {
      "path": "js/contact.js"
    }
  },
  {
    "path": "js/contact_new.js",
    "context": {
      "path": "js/contact_new.js"
    }
  },
  {
    "path": "js/form-validation.js",
    "context": {
      "path": "js/form-validation.js"
    }
  },
  {
    "path": "js/ga4-bot-tracking.js",
    "context": {
      "path": "js/ga4-bot-tracking.js"
    }
  },
  {
    "path": "js/ga4-form-tracking.js",
    "context": {
      "path": "js/ga4-form-tracking.js"
    }
  },
  {
    "path": "js/main.js",
    "context": {
      "path": "js/main.js"
    }
  },
  {
    "path": "js/scholarship-application.js",
    "context": {
      "path": "js/scholarship-application.js"
    }
  },
  {
    "path": "payment.html",
    "context": {
      "title": "Payment - KAF81",
      "first_heading": "PAYMENT"
    }
  },
  {
    "path": "privacy.html",
    "context": {
      "title": "Privacy Policy - KAF81",
      "first_heading": "PRIVACY POLICY"
    }
  },
  {
    "path": "updates.html",
    "context": {
      "title": "News & Updates - KAF81",
      "first_heading": "NEWS & UPDATES"
    }
  }
]

Return only a JSON object mapping each path to its new basename (same extension). No other text.