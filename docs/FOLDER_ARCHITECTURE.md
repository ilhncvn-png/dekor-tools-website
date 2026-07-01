# FOLDER_ARCHITECTURE.md

**Planning only — no files are migrated by this document.** This describes the target folder structure for the real (Phase 2+) codebase, to be adopted once the framework decision (see `docs/ARCHITECTURE_ROADMAP.md` Phase 1) is confirmed and migration begins. Organized by feature/domain, per the team's web coding-style convention, not by file type.

---

## Target structure

```
dekor-tools-website/
├── CLAUDE.md                        constitution (this repo's root — unchanged location)
├── README.md
├── .gitignore
│
├── docs/                            architecture & planning docs (this sprint's output lives here)
│   ├── PROJECT_ANALYSIS.md
│   ├── PROJECT_STRUCTURE.md
│   ├── DEVELOPMENT_ROADMAP.md
│   ├── ARCHITECTURE_ROADMAP.md
│   ├── ARCHITECTURE_AUDIT.md
│   ├── FOLDER_ARCHITECTURE.md       (this file)
│   ├── CMS_DATA_MODELS.md
│   ├── ADMIN_PANEL_MODULES.md
│   ├── API_STRATEGY.md
│   ├── TRANSLATION_STRATEGY.md
│   ├── PERFORMANCE_TARGETS.md
│   ├── SPRINT_1_REPORT.md
│   └── CHANGELOG.md
│
├── design-reference/                 RENAME of current project/ once migration begins
│   ├── CLAUDE.md                     visual/design-system rules (unchanged, still canonical)
│   ├── *.dc.html                     kept as read-only visual reference during migration
│   ├── news-data.js                  becomes CMS seed data (Phase 6), original kept for reference
│   ├── uploads/                      real photos — migrated into the Media Library (Phase 3)
│   └── screenshots/                  historical design-review captures — archived, not shipped
│
├── src/ (or app/, framework-dependent)
│   ├── components/                   shared, reusable UI components — one folder per component
│   │   ├── ui/                       primitives: Button, Card, FormField, Badge, Tooltip...
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── button.module.css (or styled/tailwind, per framework decision)
│   │   │   │   └── Button.test.tsx
│   │   │   ├── Card/
│   │   │   └── FormField/
│   │   ├── layout/                   Header, Nav, NavDropdown, Footer, MobileMenu
│   │   ├── search/                   SearchOverlay, SearchResultGroup
│   │   ├── motion/                   BlueprintLayer, SeamTransition, RevealOnScroll
│   │   └── cookie-consent/           CookieConsentBanner
│   │
│   ├── features/                     one folder per domain/section — matches CMS content types
│   │   ├── products/
│   │   │   ├── components/           ProductCard, ProductGallery, ProductSpecTable...
│   │   │   ├── pages/ (or routes/)   ProductsPage, CategoryPage, ProductDetailPage
│   │   │   └── api/                  data-fetching hooks/functions scoped to products
│   │   ├── dealers/
│   │   ├── news/
│   │   ├── export/
│   │   ├── about/
│   │   ├── career/
│   │   ├── support/
│   │   ├── contact/
│   │   └── legal/                    Privacy, Terms, Cookies, Sitemap
│   │
│   ├── admin/                        Admin Panel app (Phase 3) — may be a separate deployable
│   │   ├── modules/                  one folder per module (see ADMIN_PANEL_MODULES.md)
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── dealers/
│   │   │   ├── news/
│   │   │   ├── media-library/
│   │   │   ├── downloads/
│   │   │   ├── certificates/
│   │   │   ├── seo/
│   │   │   ├── users/
│   │   │   ├── roles-permissions/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   └── shared/                   admin-only layout/components, distinct from public site UI
│   │
│   ├── hooks/                        shared custom hooks (useDebounce, useReducedMotion, useScrollProgress...)
│   ├── lib/                          framework-agnostic utilities (formatDate, cn/classnames, api-client)
│   ├── styles/                       design tokens + global styles
│   │   ├── tokens.css                 (or theme.ts) — colors, type scale, spacing, breakpoints (§6-8 of CLAUDE.md)
│   │   ├── typography.css
│   │   ├── motion.css                 shared keyframes (consolidating the 52 duplicate names found in the audit)
│   │   └── global.css
│   ├── i18n/                          translation infrastructure (see TRANSLATION_STRATEGY.md)
│   │   ├── en/
│   │   ├── tr/
│   │   └── config.ts
│   ├── types/                         shared TypeScript types/interfaces (content models, API responses)
│   └── cms/                           CMS client/schema layer (see CMS_DATA_MODELS.md, API_STRATEGY.md)
│       ├── schemas/                    one file per content model
│       └── client.ts
│
├── public/                            static assets served as-is (favicons, robots.txt, fonts if self-hosted)
│   ├── fonts/                          if self-hosting Archivo/IBM Plex Mono (see PERFORMANCE_TARGETS.md)
│   ├── images/                         optimized, responsive image sets (replaces uploads/ at runtime)
│   └── videos/                         reserved for future use (none exist today)
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/                            Playwright, per the team's testing rules — visual regression at 320/768/1024/1440px
```

---

## Notes on the transition

- **`project/` → `design-reference/`** is a *rename*, not a deletion — the original `.dc.html` files remain in the repository as the canonical pixel-reference during migration, so every componentized page can be diffed against its source. They are retired from active use only once every page in a section has been migrated and visually verified (per phase, in `ARCHITECTURE_ROADMAP.md`).
- **`assets`, `uploads`, `images`, `videos`, `fonts`** stay version-controlled per the `.gitignore` rules already established — nothing about this folder plan changes what's tracked vs. ignored.
- **Documentation-only sprints** (like this one) only ever touch `docs/` and the root `CLAUDE.md` — this is why Sprint 1 could be completed without proposing any changes to `project/` or `src/` (which doesn't exist yet).
- **No migration happens until Sprint 2 begins and the framework decision (Phase 1 exit criterion) is made.** This document is the target to build toward, not an instruction to move files now.
