# SEO_FOUNDATION.md

**Sprint 2.5 — Foundation Cleanup.** Audit-only, nothing modified. Direct verification of every SEO surface across all 31 `.dc.html` files, extending the partial findings already logged in `docs/PROJECT_ANALYSIS.md` §10 and `docs/ARCHITECTURE_ROADMAP.md` Phase 9.

---

## 1. Page titles

**Only 9 of 31 files have a `<title>` tag at all**: Article, Authorized Dealers, B2B Portal, Become a Dealer, Dealer Profile, Online Payment, Newsroom, Partner Resources, Support. The other 22 pages — including **`Decor Home.dc.html`, the master reference page** — have **no `<title>` element whatsoever**. This is a significant, previously under-highlighted gap: even the homepage ships without a page title in the current prototype.

## 2. Meta descriptions

**Zero files contain a `<meta name="description">` tag.** Confirmed via direct search across all 31 files. This is a complete gap, not a partial one — no page in the current bundle has any meta description to carry forward or improve upon; every page's description must be authored from scratch during the Phase 9 (SEO) work in `docs/ARCHITECTURE_ROADMAP.md`.

## 3. Open Graph

**Only `Decor Home.dc.html` has any `og:*` tags** (confirmed, 1 of 31 files) — every other page, including high-value pages like Product Detail, Export, Become a Dealer, and Newsroom/Article, has no social-share preview metadata at all.

## 4. Twitter Cards

**Zero files contain any `twitter:*` meta tag.** No page has Twitter/X Card metadata today.

## 5. Schema opportunities (structured data)

**Zero files contain any `application/ld+json` block.** No structured data exists anywhere in the current bundle. Concrete opportunities once implemented (Phase 9):
- **Organization** schema — site-wide, once (Settings/company info model already documented in `docs/CMS_DATA_MODELS.md` §12).
- **Product** schema — Product Detail pages (name, image, description, brand, material, certifications map cleanly onto `schema.org/Product`).
- **Article** / **NewsArticle** schema — News articles (headline, datePublished, author, image already modeled in `docs/CMS_DATA_MODELS.md` §4).
- **BreadcrumbList** — any deep page, contingent on the Breadcrumbs component being built (currently doesn't exist — see `docs/COMPONENT_ARCHITECTURE.md` §12).
- **LocalBusiness/Organization + subOrganization** — potentially useful for Dealer Profile pages if dealers are to be individually discoverable.
- **FAQPage** — Support's FAQ content, if structured as actual Q/A pairs in the CMS (Support Articles model).

## 6. Canonical strategy

**Zero files contain a `<link rel="canonical">` tag.** No canonicalization exists today. This matters even for a single-locale site (protects against `?query` param duplication, trailing-slash variants, etc.) and becomes essential once multi-language routing (`docs/TRANSLATION_STRATEGY.md`) introduces `/en/...` and `/tr/...` variants of conceptually the same page.

## 7. hreflang strategy

Not applicable to the current single-locale prototype (no locale routing exists yet), but must be planned now since `docs/TRANSLATION_STRATEGY.md` commits to locale-prefixed routing (`/en/...`, `/tr/...`). Recommended approach once implemented: reciprocal `hreflang` tags on every localized page pointing to all its locale siblings, plus an `x-default` pointing at the `en` version (the documented source/default locale). This is a **documentation-only recommendation** — no locale routing exists yet to attach it to.

## 8. Future multilingual SEO

- Locale-aware canonical + hreflang (§6/§7) must ship together with the first additional locale (`tr`), not retrofitted later — adding a second locale without hreflang risks duplicate-content signals between `/en/` and `/tr/` pages that serve overlapping intent.
- Per-locale meta title/description (already modeled as 🌐 fields in `docs/CMS_DATA_MODELS.md`'s Pages/Products/News models) — translation is not just UI-string work, it's an SEO requirement too.
- Sitemap.xml should enumerate every locale variant of every URL, with hreflang annotations inside the sitemap itself (supported by the standard sitemap hreflang extension) once the CMS/routing exists.

## 9. Other findings relevant to SEO foundation

- **No `lang` attribute on `<html>` anywhere** — confirmed via direct check; every file opens with a bare `<html>` tag. This is both an SEO signal gap (search engines use `lang` to serve language-appropriate results) and an accessibility gap (screen readers rely on `lang` to select the correct pronunciation engine) — flagged in both this document and `docs/ACCESSIBILITY_AUDIT.md`.
- **Favicon coverage is inconsistent**: present in 24 of 31 files, missing from 8 (`Decor Complaint`, `Decor Career`, `Decor Contact`, `Decor Cookie Consent`, `Decor Hero Directions`, `Decor Footer`, `Decor Idea`, `Decor Search`). Three of these (Cookie Consent, Footer, Search, Hero Directions) are components/artifacts, not real pages, so their missing favicon is expected/irrelevant — but **Complaint, Career, Contact, and Idea are real, indexable pages missing a favicon link**, a genuine (if minor) gap.
- **Internal linking structure** (from `docs/PROJECT_STRUCTURE.md`'s site IA) is a reasonably healthy, shallow hierarchy (2–3 clicks from Home to any page) — a good foundation for crawlability once real URLs replace the current `.dc.html` filenames.

## 10. Overall SEO foundation assessment

The current prototype has **effectively zero working SEO infrastructure** beyond a single page's Open Graph tags and a `<title>` on fewer than a third of pages. This is expected for a visual design-tool export (per `docs/PROJECT_ANALYSIS.md`'s framing) but means Phase 9 of `docs/ARCHITECTURE_ROADMAP.md` (SEO) has a large, well-defined backlog rather than a handful of touch-ups: every page needs a title, description, canonical, and Open Graph/Twitter Card tags authored from the ground up, ideally driven by the `seo` embedded object already specified per-content-type in `docs/CMS_DATA_MODELS.md` (Products, News, Dealers, Pages) rather than hand-authored per page again.

No `<head>` content, meta tag, or page markup was modified to produce this document.
