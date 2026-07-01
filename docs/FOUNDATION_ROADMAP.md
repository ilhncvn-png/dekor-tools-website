# FOUNDATION_ROADMAP.md

**Sprint 2.5 — Foundation Cleanup.** Prioritizes every finding from this sprint's six audits (`DESIGN_TOKEN_SYSTEM.md`, `CSS_ARCHITECTURE.md`, `RESPONSIVE_SYSTEM.md`, `MOTION_SYSTEM.md`, `SEO_FOUNDATION.md`, `ACCESSIBILITY_AUDIT.md`) plus the performance audit (folded into this document — see §0, no dedicated file was requested for it). Every item below is categorized by **when it is safe to act on**, not by importance alone — a high-priority item may still be "DO NOT TOUCH" until the right phase arrives.

---

## 0. Performance audit (Task 5 — folded in here)

Extends `docs/PERFORMANCE_TARGETS.md` (Sprint 1, which set targets) with specific opportunities found this sprint:

- **Lazy loading:** only 1 of 31 files uses `loading="lazy"` anywhere (confirmed in Sprint 1 research, re-affirmed). Every other below-the-fold image is eagerly loaded.
- **Image optimization:** all 59 `<img>` tags lack `width`/`height`; the 3 real photos (`uploads/001-003.png`) are ~2MB each, unoptimized PNG; brand logos are 2503×2804px PNGs serving a ~50–75px display need.
- **SVG optimization:** all icons are inline SVG (good — no icon-font weight), but none were checked in this pass for unnecessary precision/unused metadata/editor cruft that vector-export tools often leave behind (e.g. redundant `<defs>`, excess decimal precision in path data) — worth a pass with an SVG minifier once componentized.
- **Font loading:** two families (Archivo, IBM Plex Mono) loaded from Google Fonts CDN with `preconnect` + `display=swap` on every page — reasonable as-is, but self-hosting would remove an external network dependency (already recommended in `docs/PERFORMANCE_TARGETS.md`).
- **Preloading:** no `<link rel="preload">` found anywhere for hero images or critical fonts — a real opportunity once real hero imagery replaces today's CSS-drawn placeholders.
- **Code splitting:** not applicable to the current prototype (no bundler exists) but is a hard requirement once the framework decision (Phase 1 of `docs/ARCHITECTURE_ROADMAP.md`) is made — the distributor map, rich-text editors, and any charting/analytics widgets should be dynamically imported, not bundled into the initial page load, as already specified in `docs/PERFORMANCE_TARGETS.md`.
- **Future bundle optimization:** the current `support.js`/`unpkg.com` runtime dependency (React/ReactDOM/Babel fetched live) must not carry into the real build — this is the single largest performance liability in the current bundle, and it disappears automatically once real componentization/framework migration happens rather than needing separate remediation.

---

## SAFE NOW

Changes that could theoretically be made without any risk to visual output, framework choice, or CMS design — but note **this sprint's rules explicitly forbid making any of them now**; they're listed here as the category for a future, explicitly-scoped "housekeeping" pass, not as an invitation to act:

1. Fix Home's redundant 780px nav-collapse rule (1180px already wins; removing the dead rule changes nothing visually).
2. Add `lang="en"` to every `<html>` tag (pure metadata addition, zero visual effect).
3. Add missing `<title>` tags to the 22 pages that lack one (content addition, zero visual effect, closes the biggest SEO gap found).
4. Add missing `<meta name="description">` to all 31 pages (same — content only).
5. Add favicon links to Complaint, Career, Contact, and Idea (the 4 real pages missing one).
6. Resolve the 3 `href="#"` placeholder links to real targets.
7. Add explicit `width`/`height` (or `aspect-ratio`) to the 59 `<img>` tags that lack them (measurable from the actual rendered images; adding dimensions that match current rendered size changes nothing visually, only prevents future CLS).
8. Add `loading="lazy"` to below-the-fold images site-wide.

## SAFE DURING COMPONENT EXTRACTION (Sprint 3, per `docs/COMPONENT_EXTRACTION_PLAN.md`)

Changes that require touching the same markup being extracted anyway, so they should ride along with that work rather than being done separately:

9. Add `<main>` landmark around each page's primary content (found on zero of 31 pages — the single most consequential accessibility gap in this sprint).
10. Add keyboard/`:focus-within` equivalents to the hover-only nav dropdowns (Phase 1 of the extraction plan already covers Header/Nav — do this there).
11. Reconcile the dual mobile-menu mechanism (checkbox vs. JS toggle) into one implementation (already scoped in Phase 1 of the extraction plan).
12. Fix Article's missing desktop NEWSROOM dropdown (already scoped in Phase 1).
13. Consolidate the ~6 button class families into one `<Button>` component with variants (Phase 2 of the extraction plan) — diff hover/shadow values first per that plan's own risk note.
14. Add `role="dialog"`/`aria-modal`/focus-trap to Search, Cookie Consent, and Product Detail's lightbox (Phase 1 for the first two, later for the lightbox per the extraction plan).
15. Convert `<a onClick>` instances that don't genuinely navigate into `<button>` elements — do this per-component as each is extracted, not as a bulk pass (141 instances need individual review, per `ACCESSIBILITY_AUDIT.md` §3).
16. Consolidate the ~12 card class families into one `<Card>` component (Phase 4/6 of the extraction plan, per component type).
17. Add a real, on-brand focus style for nav links/buttons/cards beyond the browser default (natural to add while componentizing each).
18. Consolidate the 52 duplicate `@keyframes` names into one shared motion vocabulary, including retiring Footer's parallel `.ft-*` system (natural to do while extracting Header/Footer in Phase 1, per `MOTION_SYSTEM.md` §9).
19. Introduce the unified design-token set (`docs/DESIGN_TOKEN_SYSTEM.md`'s recommendation) as each component is extracted — token adoption should happen component-by-component with visual verification, never as a single bulk sweep.
20. Consolidate near-duplicate breakpoints (920/980/1080px cluster; 560/620/640/680/720/760/780/860/920/960/980/1080px long tail) into a named scale — **only** after visually verifying each affected page, per `RESPONSIVE_SYSTEM.md` §4's explicit risk note.
21. Rebuild spec-table content as a real semantic `<table>` (Phase 7 of the extraction plan — flagged there as a rebuild, not a port).
22. Build the new `<Breadcrumbs>` component (Phase 2) — net-new, needs design sign-off on visual treatment since nothing exists to extract from.

## SAFE DURING REACT MIGRATION (or whichever framework is chosen — Phase 1 exit criterion of `docs/ARCHITECTURE_ROADMAP.md`)

Changes that only make sense once a real framework/build pipeline exists:

23. Remove the `support.js`/`unpkg.com` runtime dependency entirely (React/ReactDOM/Babel fetched live) — replaced by the framework's own compiled bundle.
24. Implement code splitting / dynamic imports for the distributor map, rich-text editor, and any analytics/chart widgets.
25. Migrate Google Fonts to self-hosted, subsetted font files with proper preload of the critical weight.
26. Implement `<link rel="preload">` for the true LCP hero image once real photography replaces CSS-drawn placeholders.
27. Convert the `.fam-grid` mobile scroll-snap carousel and Home's hero carousel into real components (framework-native), verified on real touch devices per `COMPONENT_EXTRACTION_PLAN.md` Phase 3/4.
28. Adopt mobile-first (`min-width`) media queries site-wide, replacing the current desktop-first cascade — a structural change best done alongside a full component rewrite, not retrofitted onto the existing `.dc.html` files.
29. Reprocess the 3 real photos and logo assets into responsive, modern-format (AVIF/WebP) variants via the future Media Library pipeline.

## SAFE DURING CMS (Phase 2 of `docs/ARCHITECTURE_ROADMAP.md`)

Changes that depend on real content/data existing, not just component structure:

30. Populate per-page/per-content-type meta title, description, canonical URL, Open Graph, and Twitter Card fields from the `seo` embedded object already modeled in `docs/CMS_DATA_MODELS.md` (Products, News, Dealers, Pages) — this supersedes the "SAFE NOW" quick-fix in item 3/4 once the CMS exists; the quick fix is a stopgap, the CMS-driven version is the real fix.
31. Implement JSON-LD structured data (Organization, Product, Article, BreadcrumbList) driven by CMS content.
32. Implement locale-aware canonical + hreflang tags once multi-language routing exists (`docs/TRANSLATION_STRATEGY.md`).
33. Generate sitemap.xml (with hreflang annotations) from real CMS routes/content.
34. Wire the Media Library's automatic image-optimization pipeline (resize/format-convert/generate `srcset`) so editors never manually pre-optimize uploads.

## DO NOT TOUCH

Everything the sprint's own rules protect, restated explicitly so no future sprint accidentally treats these as fair game:

35. **Any color, hex value, or rgba value** — even the confirmed near-duplicate near-blacks (`#0E0F11`/`#0b0c0e`/`#0a0c0f`/`#11171d`) must be resolved by design review, not automated merging, since some may be intentional.
36. **Any font-size, clamp() curve, line-height, or font-weight value** — the 90 near-duplicate type-scale curves must be consolidated by deliberate design decision per step, never by averaging or silent substitution.
37. **Any spacing/padding/gap value**, including the finding that the actual most-used section-padding curve differs from `CLAUDE.md`'s documented token — resolve via design review, not code.
38. **The 1180px nav-collapse breakpoint** — confirmed universal and load-bearing; never change this value.
39. **Any animation duration, timing function, or keyframe percentage** — even where consolidation seems safe (e.g. `.3s` vs `.28s`), visual/frame verification is required before any change, and no change happens until Sprint 3+.
40. **The red diagonal hero panel's `clip-path` polygon coordinates and parallax binding** — the single highest visual-fidelity-risk item across all audits to date; touch only with full pixel-diff verification at multiple scroll/pointer positions, and only during its scoped Phase 3 extraction step.
41. **Any z-index value** — even though no formal scale exists, changing values now (before a full audit of stacking contexts across all 31 pages) risks silent visual breakage (overlapping/hidden elements) that would not show up in a simple diff.
42. **Anything in `project/CLAUDE.md`** — the canonical, frozen design-system reference; this sprint's `CLAUDE.md` explicitly defers to it and it must never be edited to match code, only the reverse.

---

## How to use this document

When any future sprint proposes a change, first find it (or its category) in the lists above. If it's not listed, don't assume it's safe — extend this document with the new finding and its category before acting, per the AI Development Rules in `CLAUDE.md` §25.
