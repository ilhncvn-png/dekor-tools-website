# PROJECT_STRUCTURE.md — Decor (Dekor Tools) Website Redesign

Reference tree + file-by-file map. See `PROJECT_ANALYSIS.md` for narrative analysis and evidence; this file is the quick-lookup companion.

```
decor-tools-website-redesign/
│
├── README.md                          Claude Design handoff-bundle explainer (read first)
│
└── project/
    │
    ├── CLAUDE.md                      Design/system rules: nav order, color palette, type,
    │                                   motion language, hero-banner CMS shape, brand/logo rules
    │
    ├── news-data.js                   216 lines. Exports: ARTICLES, CATEGORIES,
    │                                   CATEGORY_COLORS, formatDate(). Consumed by
    │                                   Decor Newsroom.dc.html + Decor Article.dc.html
    │
    ├── support.js                     1,658 lines. GENERATED dc-runtime bundle.
    │                                   Parses <x-dc> templates, renders via window.React /
    │                                   window.ReactDOM (ambient globals, not bundled here).
    │                                   Loaded by every .dc.html via <script src="./support.js">
    │
    ├── .thumbnail                     Single WebP image (17.6 KB) — Claude Design project
    │                                   thumbnail, not a site asset
    │
    ├── uploads/                       8 files total: 3 brand logos + 3 REAL used photos
    │   ├── decor_logo_black.png        (used in Home's featured-product carousel only —
    │   ├── decor_logo_color.png         001/002/003 are not unused placeholders)
    │   ├── decor_logo_white.png
    │   ├── 001.png                     roller/frame product shot, ~2MB, no width/height attrs
    │   ├── 002.png                     production-floor shot, ~2MB
    │   └── 003.png                     world-export-map shot, ~2MB
    │
    ├── screenshots/                   132 files — despite .png extension, confirmed via `file`
    │                                   to be JPEG-encoded (924x540). Design-review/QA captures
    │                                   taken during the design process (not site assets)
    │
    ├── _ds/
    │   └── ilk-hecem-design-system-4786f705-c77a-4632-8ccf-b0e1ba1c98c3/
    │       ├── readme.md              UNRELATED bound design system (a different,
    │       ├── styles.css              unrelated "İlk Hecem" kindergarten project).
    │       ├── _ds_bundle.js           CLAUDE.md explicitly says this is "intentionally
    │       ├── _ds_manifest.json       ignored" here. Confirmed: zero .dc.html files
    │       ├── _adherence.oxlintrc.json reference any _ds/ path. Do not use its tokens.
    │       └── tokens/
    │           ├── colors.css
    │           ├── typography.css
    │           ├── spacing.css
    │           ├── effects.css
    │           └── fonts.css
    │
    └── *.dc.html  (31 files — see page map below)
```

No `package.json`, no lockfiles, no bundler/build config, no `node_modules`, no `.git` anywhere in the repo root or `project/`.

---

## Page / component map (31 `.dc.html` files)

Legend: **PAGE** = real navigable site page · **COMPONENT** = shared, imported via `<dc-import>` · **ARTIFACT** = design-exploration doc, not a real page.

| # | File | Type | Lines | Section | Notes |
|---|---|---|---|---|---|
| 1 | Decor Home.dc.html | PAGE | 1481 | Home | Master design reference (per CLAUDE.md); only page with `bannerData()` rotating hero |
| 2 | Decor Products.dc.html | PAGE | 347 | Products | Landing/overview |
| 3 | Decor Category.dc.html | PAGE | 386 | Products | Category listing |
| 4 | Decor Product Detail.dc.html | PAGE | 1033 | Products | Single product |
| 5 | Decor Manufacturing.dc.html | PAGE | 391 | Manufacturing | Facility page |
| 6 | Decor Export.dc.html | PAGE | 645 | Export | World-map hero, distributor map, KPIs, timeline |
| 7 | Decor Authorized Dealers.dc.html | PAGE | 359 | Sales | Dealer directory/finder |
| 8 | Decor Partner Resources.dc.html | PAGE | 325 | Sales | Price lists, catalogs, brand assets |
| 9 | Decor B2B Portal.dc.html | PAGE | 279 | Sales | Professional ordering platform |
| 10 | Decor Online Payment.dc.html | PAGE | 350 | Sales | Secure invoice payment |
| 11 | Decor Dealer Profile.dc.html | PAGE | 379 | Sales | Individual dealer profile |
| 12 | Decor Become a Dealer.dc.html | PAGE | 670 | Sales | Dealer onboarding + application form |
| 13 | Decor Newsroom.dc.html | PAGE | 367 | Newsroom | Landing — filter/search/sort + card grid |
| 14 | Decor Article.dc.html | PAGE | 410 | Newsroom | Single article (reads `#slug` hash) |
| 15 | Decor About.dc.html | PAGE | 321 | About | Landing/chapter hub (5-page section index) |
| 16 | Decor Our Story.dc.html | PAGE | 353 | About | Company story |
| 17 | Decor Vision Mission.dc.html | PAGE | 280 | About | Vision & mission |
| 18 | Decor RD Center.dc.html | PAGE | 342 | About | R&D center |
| 19 | Decor Quality Sustainability.dc.html | PAGE | 345 | About | Quality & sustainability |
| 20 | Decor Career.dc.html | PAGE | 664 | About | Job listings + 6-step application wizard |
| 21 | Decor Idea.dc.html | PAGE | 249 | About | "I Have an Idea" submission form |
| 22 | Decor Support.dc.html | PAGE | 431 | Support | Support center hub — downloads, certificates, catalogs, warranty, FAQ |
| 23 | Decor Contact.dc.html | PAGE | 408 | Contact | Office/factory contact info **only — no form** (delegates submission to Complaint) |
| 24 | Decor Complaint.dc.html | PAGE | 266 | Contact | "Submit Your Complaint" form |
| 25 | Decor Privacy.dc.html | PAGE | 234 | Legal | Privacy policy — README's designated first-read |
| 26 | Decor Cookies.dc.html | PAGE | 234 | Legal | Cookie policy |
| 27 | Decor Terms.dc.html | PAGE | 234 | Legal | Terms |
| 28 | Decor Sitemap.dc.html | PAGE | 234 | Legal/Meta | Sitemap page |
| 29 | Decor Footer.dc.html | COMPONENT | 306 | Shared | Imported by 28 pages; itself imports Cookie Consent |
| 30 | Decor Search.dc.html | COMPONENT | 155 | Shared | Search overlay, imported by 28 pages |
| 31 | Decor Cookie Consent.dc.html | COMPONENT | 100 | Shared | Imported only by Footer |
| — | Decor Hero Directions.dc.html | ARTIFACT | 153 | N/A | Discarded hero-direction moodboard, `design_doc_mode="canvas"` — exclude from sitemap |

**Real page count: 28.** Components: 3 (Footer, Search, Cookie Consent). Artifacts: 1 (Hero Directions).

---

## Cross-file dependency graph

```
Every real PAGE
  ├── <script src="./support.js">           (dc-runtime — needs window.React/ReactDOM)
  ├── <dc-import name="Decor Footer">  ─────► Decor Footer.dc.html
  │                                             └── <dc-import name="Decor Cookie Consent"> ─► Decor Cookie Consent.dc.html
  └── <dc-import name="Decor Search">  ─────► Decor Search.dc.html

Decor Newsroom.dc.html  ──uses──► news-data.js  (ARTICLES, CATEGORIES, CATEGORY_COLORS, formatDate)
Decor Article.dc.html   ──uses──► news-data.js  (reads location.hash to pick article slug)

All pages ──inline <link>──► fonts.googleapis.com (Archivo + IBM Plex Mono)
```

No page imports `_ds/` anything. No page loads React/ReactDOM itself (ambient dependency only, unmet in this export).

---

## Site information architecture (as linked via `<a href>`)

```
Home
├── Products ── Category ── Product Detail
├── Manufacturing
├── Export
├── Sales ▾
│   ├── Authorized Dealers
│   ├── Partner Resources
│   ├── B2B Portal
│   ├── Online Payment
│   ├── Dealer Profile
│   └── Become a Dealer  (also the site-wide red CTA target)
├── Newsroom ▾ (#news / #trade-shows / #training-academy / #company-life)
│   └── Article (#<slug>)
├── About ▾
│   ├── About (hub)
│   ├── Our Story
│   ├── Vision & Mission
│   ├── R&D Center
│   ├── Quality & Sustainability
│   ├── Career
│   └── Idea ("I Have an Idea")
├── Support ▾
├── Contact ▾
│   ├── Contact
│   └── Complaint
└── Legal / footer-only
    ├── Privacy
    ├── Cookies
    ├── Terms
    └── Sitemap
```
