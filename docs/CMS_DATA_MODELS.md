# CMS_DATA_MODELS.md

**Documentation only — no implementation in this sprint.** Field types are indicative (framework/CMS-agnostic); adjust to the concrete CMS chosen in Phase 2 of `ARCHITECTURE_ROADMAP.md`. Every model below is designed to be **locale-aware from day one** (see `TRANSLATION_STRATEGY.md`) — fields marked 🌐 are translatable per-locale; fields without the marker are locale-independent (shared across all languages).

Relationships use `→` to mean "references."

---

## 1. Products

| Field | Type | Notes |
|---|---|---|
| `id` | string (slug or UUID) | stable identifier, used in URLs |
| `productCode` 🌐-independent | string | e.g. CAD/spec code shown in mono eyebrow — matches prototype's `productCode` pattern |
| `name` 🌐 | string | |
| `slug` | string | URL segment, locale-aware if URLs are localized |
| `category` | reference → Categories | one primary category |
| `family` | enum | Painting · Plaster & Render · Spatulas & Scrapers · Measurement · Insulation · Surface Prep (from `project/CLAUDE.md`'s product families) |
| `shortDescription` 🌐 | text | used in cards/listings |
| `description` 🌐 | rich text (constrained block set, §19 of `CLAUDE.md`) | full PDP body |
| `material` 🌐 | string | shown in spec rows (matches prototype's `p.material`) |
| `specs` | array of `{ label🌐, value🌐 }` | spec table rows |
| `certifications` | array → Certificates | |
| `images` | array → Media | ordered gallery |
| `cadDrawing` | reference → Media (optional) | technical drawing asset |
| `video` | reference → Videos (optional) | |
| `downloads` | array → Downloads | datasheets, manuals |
| `relatedProducts` | array → Products | |
| `status` | enum: draft / published / archived | |
| `publishDate` | datetime | |
| `seo` | embedded SEO object (see Pages model) | |

## 2. Categories

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `name` 🌐 | string | |
| `slug` | string | |
| `family` | enum (same list as Products.family) | |
| `description` 🌐 | text | |
| `heroImage` | reference → Media | |
| `parentCategory` | reference → Categories (optional) | supports nested categories if needed later |
| `products` | array → Products (derived/queried, not stored) | |
| `sortOrder` | integer | |

## 3. Dealers

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `companyName` | string | |
| `slug` | string | for Dealer Profile pages |
| `logo` | reference → Media | |
| `tier` | enum: authorized / premium / distributor (adjust to real business tiers) | |
| `country` | string (ISO code) | |
| `region` | string 🌐 | |
| `address` 🌐 | text | |
| `coordinates` | `{ lat, lng }` | for map display |
| `phone` | string | |
| `email` | string | |
| `website` | url (optional) | |
| `description` 🌐 | text | dealer profile bio |
| `productFocus` | array → Categories (optional) | which families this dealer specializes in |
| `status` | enum: pending / active / inactive | drives Admin's Dealers module workflow |
| `applicationData` | embedded object | captured from the Become a Dealer multi-step form (Phase 5) — firmographics, requested territory, etc. |
| `seo` | embedded SEO object | for public Dealer Profile pages |

## 4. News

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `slug` | string | matches prototype's hash-routed `#<slug>` pattern, becomes a real route in Phase 6 |
| `title` 🌐 | string | |
| `category` | enum: News · Trade Shows · Training Academy · Company Life | matches `news-data.js`'s `CATEGORIES`; color mapping (`CATEGORY_COLORS`) stays a presentation constant, not per-article data |
| `excerpt` 🌐 | text | listing-card summary |
| `body` 🌐 | rich text | |
| `heroImage` | reference → Media | |
| `gallery` | array → Media (optional) | |
| `author` | string (optional) | |
| `publishDate` | date | drives `formatDate()`-equivalent display and Newsroom's year/sort filters |
| `relatedArticles` | array → News (optional, else derived by category) | |
| `status` | enum: draft / published / archived | |
| `seo` | embedded SEO object | |

## 5. Certificates

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `name` 🌐 | string | e.g. ISO 9001, CE |
| `issuingBody` | string | |
| `issueDate` | date | |
| `expiryDate` | date (optional) | |
| `file` | reference → Downloads | the actual certificate PDF/image |
| `appliesTo` | enum: company-wide / product-specific | |
| `relatedProducts` | array → Products (if product-specific) | |
| `displayOn` | array of page references (Support, Product Detail, Export documents, etc.) | |

## 6. Downloads

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `title` 🌐 | string | |
| `file` | reference → Media (binary asset, PDF/DOC/etc.) | |
| `fileType` | enum: datasheet / manual / catalog / price-list / certificate / brand-asset | matches Partner Resources' "price lists, catalogs & brand assets" content |
| `category` | reference → Categories (optional) | |
| `restrictedTo` | enum: public / dealer-only | supports Partner Resources' dealer-gated content |
| `fileSizeBytes` | integer | for display ("2.3 MB") |
| `version` | string (optional) | |
| `updatedAt` | datetime | |

## 7. Videos

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `title` 🌐 | string | |
| `description` 🌐 | text (optional) | |
| `source` | enum: hosted / youtube / vimeo | prototype has zero real videos today — this model is net-new infrastructure |
| `url` or `fileRef` | string / reference → Media | |
| `thumbnail` | reference → Media | poster frame — required for LCP/CLS discipline (§17 of `CLAUDE.md`) |
| `durationSeconds` | integer | |
| `relatedProduct` | reference → Products (optional) | for "product video" sections on Product Detail |
| `captions` | reference → Media (VTT, optional but recommended for a11y) | |

## 8. Support Articles

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `title` 🌐 | string | |
| `slug` | string | |
| `body` 🌐 | rich text | |
| `category` | enum: FAQ / warranty / usage-guide / troubleshooting (adjust as needed) | |
| `relatedProducts` | array → Products (optional) | |
| `relatedDownloads` | array → Downloads (optional) | |
| `sortOrder` | integer | for FAQ ordering |
| `status` | enum: draft / published | |

## 9. Pages

Generic model for static/marketing pages (About, Our Story, Vision & Mission, R&D Center, Quality & Sustainability, Manufacturing, Export, Contact, legal pages) whose structure is mostly fixed sections rather than free-form content.

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `slug` | string | |
| `title` 🌐 | string | |
| `template` | enum | identifies which frozen page layout to render (e.g. `about-hub`, `story`, `vision-mission`, `manufacturing`, `export`, `legal`) — content fills the template, it does not redefine layout |
| `sections` | array of typed section blocks (constrained set matching existing designed sections — hero, spec-grid, timeline, KPI-counters, etc.) | this is the mechanism that satisfies the "CMS constrains authors to the design system" rule (§19 of `CLAUDE.md`) |
| `seo` | embedded SEO object: `{ metaTitle🌐, metaDescription🌐, canonicalUrl, ogImage, structuredData }` | |
| `status` | enum: draft / published | |
| `updatedAt` | datetime | |

## 10. Languages

| Field | Type | Notes |
|---|---|---|
| `code` | string (ISO 639-1, e.g. `en`, `tr`) | primary key |
| `label` | string | display name, e.g. "English", "Türkçe" |
| `isDefault` | boolean | EN is default per `TRANSLATION_STRATEGY.md` |
| `isActive` | boolean | lets Admin stage a locale before public launch |
| `direction` | enum: ltr / rtl | future-proofing, all current/planned locales are ltr |
| `fallbackLocale` | reference → Languages (optional) | e.g. a future locale could fall back to EN for missing strings |

## 11. Media

Central asset model backing every `reference → Media` field above.

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `altText` 🌐 | string | required for non-decorative images (§13 of `CLAUDE.md`) |
| `type` | enum: image / video / document | |
| `originalFile` | binary/URL | |
| `optimizedVariants` | array of `{ format, width, url }` | AVIF/WebP + fallback, multiple widths for `srcset` (§17) |
| `width` / `height` | integer | required — the current prototype's biggest a11y/CLS gap is exactly this missing data |
| `focalPoint` | `{ x, y }` (optional) | for smart cropping in responsive variants |
| `tags` | array of string | for Media Library search/filtering |
| `usedIn` | derived list of referencing content (computed, not stored) | helps editors avoid deleting in-use assets |

## 12. Settings

Singleton model for site-wide configuration.

| Field | Type | Notes |
|---|---|---|
| `siteName` 🌐 | string | |
| `companyInfo` | embedded object: founding year, HQ address, facility size, export country count, phone, email | maps to the facts in `project/CLAUDE.md` — flagged there as needing verification before publishing |
| `socialLinks` | `{ instagram, linkedin, youtube, tiktok }` | matches footer's existing social row |
| `defaultSeo` | embedded SEO object | fallback for pages without page-specific SEO |
| `analyticsIds` | `{ gaId, otherProviders }` | wired up in Phase 10 (Deployment) |
| `cookieConsentConfig` | object | categories, default states, links to Privacy/Cookies pages |
| `maintenanceMode` | boolean | |
| `activeLanguages` | array → Languages | drives which locale switcher options appear site-wide |

---

## Cross-model notes

- **Seed data mapping (Phase 2 exit criterion):** Home's hardcoded featured-products array → Products; Export's 12 hardcoded distributor nodes → Dealers; `news-data.js`'s `ARTICLES` → News; Career's job listings → a future `JobListings` model (not requested in this sprint's scope, flagged here for completeness since Career is a documented page); Search's `SINDEX` demo entries → derived/generated from the real models above, not stored separately.
- **Every 🌐 field must have a value for every active Language** (§10) — the CMS should block publishing a page/product/article with missing required translations in an active locale, rather than silently falling back.
- **`status` fields** are consistent (`draft`/`published`/`archived` or similar) across content types to support one unified Admin publishing workflow (see `ADMIN_PANEL_MODULES.md`).
