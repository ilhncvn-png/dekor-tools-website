# PERFORMANCE_TARGETS.md

**Documentation only — no implementation in this sprint.** Targets and strategy for the real build, grounded in the team's standing web-performance rules and the specific gaps found in `docs/PROJECT_ANALYSIS.md`/`docs/ARCHITECTURE_AUDIT.md`.

---

## Core Web Vitals targets

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| INP (Interaction to Next Paint) | < 200ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| FCP (First Contentful Paint) | < 1.5s |
| TBT (Total Blocking Time) | < 200ms |

## Lighthouse goals

- Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95 on all key pages (Home, Products listing, Product Detail, Export, Become a Dealer, Newsroom, Article).
- Run against production-equivalent builds, not dev servers, as part of CI (Phase 10).

## Bundle budget

| Page type | JS budget (gzipped) | CSS budget |
|---|---|---|
| Landing-type pages (Home, About, Export) | < 150KB | < 30KB |
| App-like pages (Admin Panel, Search results, Product filtering) | < 300KB | < 50KB |
| Microsite/legal pages (Privacy, Terms, Cookies, Sitemap) | < 80KB | < 15KB |

**Explicit non-goal to eliminate:** the current prototype's `support.js` fetches React 18.3.1, ReactDOM 18.3.1, and Babel Standalone 7.29.0 from `unpkg.com` at runtime just to interpret its own template format — none of that weight or runtime dependency carries into the real build, which ships its own compiled, tree-shaken bundle per the framework decision in Phase 1.

## Image strategy

- Every image ships with explicit `width`/`height` (or `aspect-ratio`) — closes the audit's finding that **zero of the prototype's 59 `<img>` tags** carry dimensions today, a direct CLS risk.
- Modern formats (AVIF/WebP) with a fallback; responsive `srcset`/`sizes` for anything not a fixed-size icon/logo.
- `loading="lazy"` below the fold by default; `loading="eager"` + `fetchpriority="high"` reserved for the true LCP element only (typically the hero image/banner) — closes the audit's finding that only 1 of 31 prototype pages uses `loading="lazy"` anywhere.
- The three existing real photos (`uploads/001-003.png`, ~2MB each) must be reprocessed (resized, compressed, multi-format-encoded) before reuse — never shipped at prototype weight.
- Brand logo assets (currently 2503×2804px PNGs serving a ~50–75px display need) migrate to SVG or a properly sized/optimized raster set via the Media Library pipeline (`ADMIN_PANEL_MODULES.md`).

## Font loading

- Continue with the two existing families only (Archivo, IBM Plex Mono) — no new fonts without a design-system change.
- Evaluate self-hosting (vs. the prototype's Google Fonts CDN dependency) to remove an external network dependency and enable better `font-display`/preload control; if self-hosted, subset to the weights actually used (400/500/600/700/800/900 Archivo, 400/500/600 IBM Plex Mono) and preload only the most critical weight/style (typically the heading weight used above the fold).
- `font-display: swap` in all cases, matching current prototype behavior.

## Caching

- Static assets (images, fonts, compiled JS/CSS) served with long-lived immutable cache headers plus content-hashed filenames, via CDN (Phase 10).
- API responses (Phase 2 CMS reads) cached at the edge/CDN layer where content doesn't change per-request (product listings, published articles), with cache invalidation triggered by Admin publish actions.
- Stale-while-revalidate pattern for content that updates occasionally but shouldn't block rendering (news listings, dealer directory).

## Lazy loading

- Images/video below the fold: `loading="lazy"` / IntersectionObserver-driven mount, not scroll-handler-driven (per the team's animation-performance rule against scroll-handler churn).
- Heavy, non-critical libraries (map rendering for the distributor map, rich-text editor in Admin, chart/analytics widgets) dynamically imported rather than bundled into the initial page load — e.g. `const map = await import('./distributor-map')`.
- Below-the-fold sections that carry their own motion/blueprint layer only initialize their animation observers once scrolled near-viewport, not on initial page load for the entire page.

## Accessibility (performance-adjacent targets)

- WCAG 2.2 AA site-wide (full detail in `CLAUDE.md` §13) — tracked here because Lighthouse Accessibility score is a CI gate, not just a manual audit item.
- Automated checks (axe-core or equivalent) run in CI on every PR touching components or pages.
- Manual keyboard-navigation and reduced-motion verification required before any component ships, per the team's web-testing rules.

## Core Web Vitals monitoring (production, Phase 10)

- Lab data (Lighthouse in CI) catches regressions before merge; **field data** (real-user CWV, via whatever analytics/RUM provider is selected in Phase 10) is the source of truth for production performance, since lab conditions don't capture real device/network diversity across the site's international B2B/export audience.
- Alert thresholds tied to the targets table above; a regression that breaches a target is treated as a release-blocking bug, not a backlog item.
