# TRANSLATION_STRATEGY.md

**Documentation only — no implementation in this sprint.** All copy in the current frozen prototype is English; this document plans how multi-language support is layered in without ever requiring a redesign.

---

## Languages

| Locale | Code | Role |
|---|---|---|
| English | `en` | **Source/default language.** All current prototype copy, and the CMS's canonical source-of-truth locale — every new content item is authored in EN first. |
| Turkish | `tr` | **First additional locale.** Dekor's home market (Gebze/Kocaeli, İstanbul); highest business priority for translation once the CMS exists. |
| Future locales | TBD (candidates: Arabic, German, French, Spanish, Russian — informed by the "exports to 60 countries" reach) | Added by inserting a new `Languages` record (see `CMS_DATA_MODELS.md` §10) and populating translations — **no code changes required** to add a locale, by design. |

Routing approach: locale-prefixed paths (`/en/products/...`, `/tr/urunler/...`) is the recommended default — it's SEO-friendly (distinct indexable URLs per locale), works with static-generation-friendly frameworks, and avoids cookie/session-based locale ambiguity for first-time visitors. Slugs themselves may be localized (e.g. `/tr/urunler` instead of `/tr/products`) if desired — the Pages/Products/Categories models already carry a `slug` field that can be locale-aware.

## Key naming convention

- **Dot-namespaced by feature/domain, not by page.** Example: `nav.products`, `nav.about.ourStory`, `product.spec.material`, `dealer.form.step1.title`, `common.cta.becomeADealer`.
- **Shared/common strings live under a `common.*` namespace** (buttons, generic CTAs, footer legal links) so they're translated once and reused everywhere — directly addressing the audit's finding that button/CTA copy is currently duplicated per page.
- **Never key by literal English text** (`"Become a Dealer"` as a key) — always a stable semantic key (`common.cta.becomeADealer`) so the English source string can change without breaking every other locale's reference.
- **Pluralization and interpolation** follow the chosen i18n library's standard convention (e.g. ICU MessageFormat) rather than ad hoc string concatenation.

## Namespace strategy

Namespaces map to the folder structure in `FOLDER_ARCHITECTURE.md`'s `src/i18n/` and to the feature folders in `src/features/`:

```
common          shared UI strings: nav, footer, buttons, form labels, legal links
home            Home-page-specific copy (hero banners, featured sections)
products        Products/Category/Product Detail
dealers         Sales section: Authorized Dealers, Partner Resources, B2B Portal,
                Online Payment, Dealer Profile, Become a Dealer
news            Newsroom + Article chrome (category labels, filters, sort labels)
                — actual article body content lives in the News CMS model, not
                translation files, since it's per-article editorial content
about           About hub + 5 sub-pages
career          Career listing + application wizard
support         Support hub + Complaint + Idea forms
contact         Contact page
legal           Privacy, Terms, Cookies, Sitemap
export          Export program page
manufacturing   Manufacturing page
admin           Admin Panel UI strings (separate namespace — admin users may have
                a different locale preference than the public site's visitor)
```

**Rule:** CMS-authored *content* (product descriptions, news articles, page sections) is never stored in translation-key files — it lives in the CMS as 🌐-marked fields per locale (see `CMS_DATA_MODELS.md`). Translation-key files are reserved for **UI chrome**: navigation labels, buttons, form labels, error messages, static legal boilerplate that isn't editorially managed.

## Fallback behavior

- If a 🌐 CMS field is missing for the active locale, fall back to the record's `fallbackLocale` (Settings/Languages model) — default EN — rather than rendering a blank field. Surface this as a visible warning in Admin so editors know translation work is outstanding, never silently ship a mixed-language page to visitors without at least a fallback.
- UI-chrome translation keys missing for a locale should fall back to `en` at build/runtime and log a warning in development — never render a raw key name (`nav.products`) to an end user.

## Process

- New content is authored in `en` first (source language), then queued for `tr` translation (and future locales) via the Admin Panel's per-field translation status (not built in this sprint — flagged here as an Admin Panel enhancement for Phase 3 to consider).
- UI-chrome translation keys are added alongside the English string whenever a new component ships; missing-locale keys should fail CI (or at minimum warn loudly) once more than one locale is live, so translation debt doesn't silently accumulate.
- No page's layout, spacing, or component structure may change to accommodate a locale (e.g. longer Turkish/German strings) — components must be built to gracefully wrap/scale text within the frozen visual grid, per the "pixel-identical" mandate governing this entire project phase. Flag any string that visibly breaks a component's layout as a translation-length issue to fix in copy, not a license to redesign the component.
