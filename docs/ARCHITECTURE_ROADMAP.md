# ARCHITECTURE_ROADMAP.md

Ten-phase roadmap from the current frozen visual prototype to a fully CMS-driven, multi-language, production website. Each phase is scoped to be independently shippable; no phase requires redesigning or altering the frozen visual output established in `Design Freeze v1.0`.

---

## Phase 1 — Architecture

**Goal:** the foundation this sprint documents.
- Development constitution (`CLAUDE.md`), structural audit, this roadmap, folder architecture plan, CMS data models, admin module plan, API strategy, translation strategy, performance targets.
- Confirm target framework/stack (React/Next.js, Vue/Nuxt, Astro, or other — see open question in `docs/DEVELOPMENT_ROADMAP.md`).
- Confirm hosting/deployment target (informs Phase 10).
- **Exit criteria:** all Sprint 1 documents reviewed and approved; framework decision made; no code migrated yet.

## Phase 2 — CMS

**Goal:** stand up the content backend before any admin UI or page migration.
- Select and provision a CMS approach (headless CMS product vs. custom-built) per `docs/CMS_DATA_MODELS.md`.
- Implement the 12 data models (Products, Categories, Dealers, News, Certificates, Downloads, Videos, Support Articles, Pages, Languages, Media, Settings) as real schemas/collections.
- Seed data from the prototype's existing hardcoded content (Home's featured products, Export's distributor nodes, `news-data.js`'s articles, Career's job listings, Search's demo index) — this is real content migration, not placeholder generation.
- Build the API layer described in `docs/API_STRATEGY.md` on top of the CMS.
- **Exit criteria:** every content type has a working schema and seeded data; API endpoints return real data; no frontend pages consume it yet.

## Phase 3 — Admin

**Goal:** give editors a real interface to manage the content modeled in Phase 2.
- Implement the modules documented in `docs/ADMIN_PANEL_MODULES.md`: Dashboard, Products, Dealers, Orders (future), News, Media Library, Downloads, Certificates, SEO, Users, Roles, Permissions, Analytics, Settings.
- Authentication + role-based access control (Admin / Editor / Dealer-manager / Viewer at minimum).
- Media Library enforces image-optimization rules automatically on upload (§17 of `CLAUDE.md`).
- **Exit criteria:** an editor can create/update/publish content of every type without touching code; permissions enforced; audit log active.

## Phase 4 — Products

**Goal:** replace the static Products/Category/Product Detail pages with CMS-driven equivalents, pixel-identical to the frozen design.
- Migrate `Decor Products.dc.html`, `Decor Category.dc.html`, `Decor Product Detail.dc.html` to real templates rendering CMS data via the Product/Category data models.
- Implement product filtering/search within the category grid using real data instead of the prototype's hardcoded arrays.
- Visual regression check against the frozen prototype at all standard breakpoints before merge.
- **Exit criteria:** Products section is fully CMS-driven; visually identical to the frozen design; admin can add/edit/remove products without a deploy.

## Phase 5 — Dealers

**Goal:** replace Sales-section static pages with CMS-driven dealer data.
- Migrate Authorized Dealers, Partner Resources, B2B Portal, Online Payment, Dealer Profile, Become a Dealer to real templates on the Dealer data model.
- Become a Dealer's multi-step application form gets a real backend (submission storage, notification, no more "no backend" inline-success-only behavior).
- **Exit criteria:** dealer directory and profiles are CMS-driven; application form submissions are captured and manageable in Admin.

## Phase 6 — News

**Goal:** replace `news-data.js` and the static Newsroom/Article pages with the real News data model.
- Migrate Newsroom (filter/search/sort) and Article (hash-routed detail) to real routing (e.g. `/news/[slug]`) backed by the News CMS model.
- Preserve the existing category system (News/Trade Shows/Training Academy/Company Life) and its color coding exactly.
- **Exit criteria:** editors can publish/update/unpublish articles from Admin; category filtering and article detail pages work identically to the frozen prototype.

## Phase 7 — Support

**Goal:** replace the static Support page and related Complaint/Idea forms with CMS-driven content and real submission handling.
- Support Articles data model powers the FAQ/help content.
- Complaint and Idea forms gain real backends (storage + notification), matching the pattern established in Phase 5 for Become a Dealer.
- Certificates and Downloads modules (Admin) feed the Support page's document library.
- **Exit criteria:** Support content, certificates, and downloads are all CMS-managed; forms submit to a real destination.

## Phase 8 — Search

**Goal:** replace the prototype's hardcoded `SINDEX` demo search with a real, CMS-data-backed search.
- Index Products, News, Support Articles, Pages, and Dealers.
- Preserve the existing ⌘K/Ctrl+K overlay UX exactly (`Decor Search.dc.html`'s visual/interaction design is frozen; only the data source changes).
- **Exit criteria:** search returns real, live results across all content types; no visual change to the search UI.

## Phase 9 — SEO

**Goal:** close the SEO gaps identified in the audit (Open Graph only on Home, missing favicons on 8 pages, no structured data) and formalize an ongoing SEO system.
- Per-page meta (title, description, canonical, OG/Twitter Card) driven by the Pages/Products/News data models, not hardcoded.
- JSON-LD structured data: Organization (site-wide), Product (Product Detail), Article (News Article), BreadcrumbList (all deep pages).
- Sitemap.xml and robots.txt generation from real routes/content.
- SEO module in Admin (Phase 3) lets editors override per-page meta without a deploy.
- **Exit criteria:** every real page has complete, correct meta and structured data; Lighthouse SEO score ≥ target (see `docs/PERFORMANCE_TARGETS.md`).

## Phase 10 — Deployment

**Goal:** production-grade hosting, CI/CD, monitoring, and analytics.
- CI pipeline: build, type-check, lint, automated visual regression against the frozen baseline, accessibility checks.
- CDN-backed static/hybrid hosting appropriate to the chosen framework (Phase 1 decision).
- Analytics integration (per `project/CLAUDE.md`'s eventual analytics needs) with privacy-consent gating tied to the existing Cookie Consent component.
- Monitoring: uptime, Core Web Vitals field data (not just lab/Lighthouse), error tracking.
- **Exit criteria:** production deployment is automated, monitored, and repeatable; rollback path exists; multi-language routing (from the Translation Strategy) is live in production if scoped for this launch.

---

## Cross-cutting notes

- **Multi-language** is not its own numbered phase — per `docs/TRANSLATION_STRATEGY.md`, i18n infrastructure should be introduced during Phase 2 (CMS) so every content model is locale-aware from the start, rather than retrofitted later. Locale rollout (adding TR content) can happen incrementally across Phases 4–9 as each section is migrated.
- **Visual parity is a hard gate on every phase.** No phase in this roadmap is complete until its migrated pages are confirmed pixel-identical (or intentionally, explicitly approved as different) to the `Design Freeze v1.0` baseline.
- **Phases are sequential by dependency, not strictly by calendar.** Phases 4–8 (Products/Dealers/News/Support/Search) may be parallelized across workstreams once Phases 1–3 (Architecture/CMS/Admin) are complete, since they depend on the same foundation but not on each other.
