# CLAUDE.md — Dekor Tools Website: Development Constitution

**Status:** Sprint 1 — Architecture Foundation
**Applies to:** every future contributor, human or AI, working on this repository
**Supersedes nothing visual:** this document governs *how the codebase is built*, not *how the site looks*. For the frozen visual/design system rules (colors, type, motion, nav content, brand assets), see [`project/CLAUDE.md`](project/CLAUDE.md) — that file remains the single source of truth for visual design and **must not be contradicted** by anything below.

> **The website is visually complete as of `Design Freeze v1.0`.** Nothing in this document authorizes a redesign, a layout change, a spacing change, a color change, a typography change, or an animation change. Every rule below exists to make the *next* phase (CMS, Admin Panel, multi-language, integrations) buildable without ever touching what's already frozen.

---

## 1. Project Vision

Dekor (Dekor Tools) is a 60-year-old Turkish manufacturer (Hasdemir brothers, 1964; part of Hassan Group) of professional painting, plaster/render, spatula/scraper, measurement, insulation, and surface-prep tools, exporting to 60+ countries. The website's job is to project **industrial precision and export-grade credibility** to three audiences: B2B dealers/distributors evaluating a partnership, professional tradespeople researching product specs, and press/partners tracking company news.

The current codebase is a **pixel-complete visual prototype** (a Claude Design handoff bundle — see `docs/PROJECT_ANALYSIS.md` for the full audit) that must now be turned into a **real, maintainable, content-manageable product** without losing a single pixel of what was designed. This sprint (Sprint 1) builds the architectural foundation — conventions, documentation, and planning — that all following sprints (CMS, Admin, Products, Dealers, News, Support, Search, SEO, Deployment) will build on top of.

## 2. Brand Philosophy

"Apple precision · Porsche confidence · Leica restraint." The brand voice is **engineering, not marketing** — confident through specificity (real specs, real certs, real numbers), not through hype language. Every visual and interaction decision should read as *deliberate and understated*, never decorative or trend-driven. This philosophy is permanent and applies equally to any new CMS-driven content: copy, imagery, and admin-authored pages must maintain the same restrained, technical tone the static prototype established.

## 3. UI Principles

- **Structure over decoration.** Section transitions are built from layout (overlap + seam-guide datum lines), never gradients, fades, blur, glow, or vignettes — this is a **permanent, non-negotiable rule** inherited from `project/CLAUDE.md`.
- **One accent, one technical color.** Red (`#D32027`) is the only emotional/action color; blue (`#0095DA`) is reserved exclusively for technical/blueprint/engineering signifiers. Neither may become a second CTA color or a decorative fill.
- **Density with restraint.** Information-rich (spec tables, cert grids, KPI counters) but never cluttered — whitespace and grid discipline carry the "premium industrial" feel.
- **Every dark section breathes.** The blueprint motion layer (`.bp-live/.bp-scan/.bp-glint/.bp-particle`) is a brand signature, not decoration to be trimmed for convenience.

## 4. UX Principles

- **B2B-first navigation.** Dealer/partner journeys (Become a Dealer, B2B Portal, Export) are always one click from the primary nav — never buried.
- **Progressive disclosure on complex forms.** The Career application and Become a Dealer forms are multi-step by design; new CMS-driven forms should follow the same wizard pattern rather than long single-page forms.
- **No dead ends.** Every page must resolve to a next action (related content, CTA, or nav) — this applies to future CMS-authored pages too; the CMS must not allow publishing a page with no exit path.
- **Content authors are not designers.** Once the CMS exists, editors must not be able to break the visual system (see §19 CMS Strategy) — the admin UI constrains input to what the design system already supports.

## 5. Visual Language

Premium industrial: near-black (`#0E0F11`) and white/mist surfaces alternate for cinematic pacing; Decor red for action, corporate blue for technical/engineering markers only; hairline borders, sharp 2–3px radii, 4px colored top-accent bars on cards; tinted/dark shadows, never soft pastel. Full palette, exact hex values, and usage rules are canonical in `project/CLAUDE.md` §"Design system" — **do not restate or fork these values elsewhere; always reference that file.**

## 6. Grid System

- **Container:** max-width 1280px, centered.
- **Section padding:** vertical `clamp(64px, 9vw, 128px)`, horizontal `clamp(20px, 5vw, 64px)` — fluid, not fixed breakpoint steps.
- **Column grids:** predominantly 12-column conceptual grid expressed via CSS Grid/Flexbox per section (the prototype does not use a literal `.col-*` utility grid — component-level grids are defined per section). When componentizing (Sprint 2+), extract a shared `<Grid>`/`<Container>` primitive that reproduces these exact clamp() values rather than inventing new spacing.
- **Breakpoints (verified from the current prototype, do not silently change):** 560, 620, 640, 680, 720, 760, 780, 860, 920, 960, 980, 1080, **1180 (nav-collapse, load-bearing)**. All are `max-width` (desktop-first cascade) in the current prototype. See "Responsive Rules" (§13) for the forward-looking decision on this.

## 7. Typography Rules

- **Two families only:** Archivo (display/body, weights 400–900, headings at 700–900 with `-0.03em` tracking) and IBM Plex Mono (eyebrows, product codes, stats, labels — uppercase, wide tracking). No third family may be introduced without a design-system change request handled outside this codebase.
- **Fluid type only** — sizes are `clamp()`-based (e.g. hero `clamp(44px,6.6vw,88px)`), never fixed px jumps at breakpoints. Any componentized type scale must preserve the existing clamp() curves exactly.
- **Body text never below ~14px**; large/hero text is never allowed to look "small" at any viewport — this is a hard floor, not a suggestion.

## 8. Color Rules

Canonical values live in `project/CLAUDE.md` (near-black `#0E0F11`, charcoal `#1A1C1F`/`#16181b`, footer `#0a0b0c`, mist `#F4F5F6`, concrete `#E6E8EB`, border `#E2E5E9`, steel `#5A6066`, muted `#8A9097`, Decor red `#D32027` / dark-bg eyebrow `#ff7a72`, corporate blue `#0095DA`). Architecture rule for this sprint and beyond:
- These values must be extracted into **design tokens** (CSS custom properties or a theme object, depending on the chosen framework) during Sprint 2 componentization — never re-hardcoded per new component.
- No new color may be introduced anywhere in the codebase (CMS admin UI included) without updating `project/CLAUDE.md` first — this file governs code architecture, not color authority.

## 9. Motion Rules

Inherited in full from `project/CLAUDE.md`'s "Decor Motion Language" and "Decor Experience System" sections — blueprint breathing/scan/glint/particle classes, seam-guide structural transitions, transform-only entrances, `prefers-reduced-motion` support everywhere. Architecture-specific additions for this sprint:
- **Known drift to resolve, not copy:** the current prototype's `[data-reveal]` rule in `Decor Home.dc.html` and `Decor Privacy.dc.html` starts at `opacity:0`, contradicting the documented "never opacity-from-0" rule (see `docs/PROJECT_ANALYSIS.md` §7). When componentizing motion in Sprint 2, implement the **documented rule** (transform-only, resting state visible), not the literal prototype behavior — flag this decision in the PR that introduces the shared reveal component.
- **`.seam-guide` vs `.seam-wrap` naming drift** (Home/About family vs. Newsroom/Article) must be reconciled into one shared class/component when componentized — pick one name, do not carry both forward.
- Motion keyframes must live in one shared stylesheet/module once componentized — never re-declared per page as the prototype currently does (52 duplicate keyframe names found in the audit).

## 10. Component Standards

- **One canonical component per concept.** The prototype currently has ~6 parallel button systems (`.dkr-btn`, `.ck-btn`, `.ft-btn`, `.mapbtn`, `.pcta`, `.cta-arrow`) and a dozen card variants (`.spec-card`, `.ncard`, `.dl-card`, `.cat-card`, etc.) — see `docs/ARCHITECTURE_AUDIT.md`. Sprint 2 must consolidate these into a small set of real components (`<Button variant="primary|ghost|dark">`, `<Card variant="spec|news|dealer|product">`, etc.) that reproduce every existing visual variant pixel-for-pixel.
- **Shared components are shared code, not shared copy-paste.** Header/Nav, Footer, Search, Cookie Consent must become real reusable components (framework-appropriate: React components, Vue components, or template partials) — never duplicated markup per page again.
- **No component may alter visual output** when first extracted. A component extraction PR's only acceptable diff is *structural* (props, file location); a visual diff tool (see §14 Responsive Rules / testing) must confirm pixel parity before merge.
- **Props over page-specific overrides.** If a card needs a variant, it takes a `variant` prop — it does not get a new sibling class named after the page it first appeared on.

## 11. Naming Conventions

- **Components:** PascalCase (`ProductCard`, `DealerMap`, `NavDropdown`).
- **Files:** match component name (`ProductCard.tsx` + co-located `product-card.css` or CSS module, per the team's file-organization convention — one component, one folder).
- **CSS classes (if not using CSS-in-JS/modules):** kebab-case, namespaced by component, not by page (`product-card__title`, not `pc-home-title`).
- **CMS content types / API resources:** lowercase-plural-kebab (`products`, `dealers`, `news-articles`, `support-articles`).
- **i18n keys:** dot-namespaced by feature, not by page — see §20 Translation Strategy.
- **Booleans:** `is`/`has`/`should`/`can` prefixes. **Constants:** `UPPER_SNAKE_CASE`. **Hooks (if React):** `use` prefix.
- Retire prototype-era per-surface prefixes (`dkr-`, `ck-`, `ft-`, `ncard-`, `wiz-`) as each area is componentized — do not extend them into new code.

## 12. Folder Structure

The **target** structure is documented in full in [`docs/FOLDER_ARCHITECTURE.md`](docs/FOLDER_ARCHITECTURE.md). Summary principle: organize by **feature/domain**, not by file type (components/hooks/lib/styles at the top level, then feature folders inside — matching the team's established web coding-style convention). **No files are migrated in Sprint 1** — this is planning only; migration happens in Sprint 2 once the target framework is confirmed.

## 13. Accessibility Standards

Target: **WCAG 2.2 AA** minimum, site-wide, including all future CMS-authored content.
- Every interactive control (nav dropdowns, mobile menu, search palette, lightbox/gallery, distributor map hotspots) must have a full keyboard path and visible focus state — the audit found several mouse-only interactions in the prototype (Export's region-hover map, Article's gallery) that **must** gain keyboard equivalents during componentization, not be carried forward as-is.
- All modals/overlays (Search, Cookie Consent, Product Detail lightbox) must use proper `role="dialog"` / `aria-modal="true"` and focus-trap behavior once componentized — the prototype has none of this today.
- All images require meaningful `alt` text (empty `alt=""` only for confirmed decorative images) and explicit `width`/`height` (or aspect-ratio) — the prototype's 59 `<img>` tags currently have zero dimensions, a real CLS/a11y gap to close, not preserve.
- Color contrast must be verified against the real palette (dark near-black + steel-gray text) at AA level for every new component before merge.
- Respect `prefers-reduced-motion` everywhere — already well-covered in the prototype; do not regress this.

## 14. Responsive Rules

- **Decision for this codebase going forward: mobile-first `min-width` media queries**, replacing the prototype's desktop-first `max-width`-only cascade (zero `min-width` queries exist today — a deliberate, not accidental, choice to correct going forward, since mobile-first is more robust against override bugs like the Home 780px/1180px nav-breakpoint conflict found in the audit).
- **1180px remains the canonical nav-collapse breakpoint** — do not change this value; it's visually load-bearing (matches the frozen design).
- Standard visual-regression test breakpoints: **320, 768, 1024, 1440px** (per the team's web-testing rules), in addition to spot-checks at the prototype's finer-grained breakpoints (560–1080) wherever a component's layout genuinely changes at those widths.
- Every new component must be built fluid (`clamp()`/`%`/`fr`) by default, matching the prototype's existing fluid-first approach — fixed-breakpoint layout should be the exception, not the default.

## 15. Performance Targets

Full targets and strategy are in [`docs/PERFORMANCE_TARGETS.md`](docs/PERFORMANCE_TARGETS.md). Headline commitments: Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1), Lighthouse ≥ 90 across categories on key pages, JS bundle budget < 150KB gzipped for landing-type pages. The prototype's current runtime dependency on fetching React/ReactDOM/Babel from `unpkg.com` at request time (`support.js`) is explicitly **not** carried into the real build — the real site ships its own optimized bundle.

## 16. SEO Standards

Full plan in the roadmap and future SEO phase (Phase 9). Baseline architecture requirements starting now: every page template must support per-page `<title>`, meta description, canonical URL, Open Graph/Twitter Card tags, and JSON-LD structured data (Organization, Product, Article, BreadcrumbList as applicable) — the prototype currently only has Open Graph tags on the Home page and is missing favicons on 8 of 31 files; both are gaps to close via the template layer, not per-page copy-paste, once real templates exist.

## 17. Image Optimization

- All real photography must ship as responsive images (`srcset`/`sizes` or framework-native image component) in modern formats (AVIF/WebP with a fallback), explicit dimensions, and `loading="lazy"` below the fold / `fetchpriority="high"` only for the true LCP hero image.
- The three existing real photos (`uploads/001-003.png`, ~2MB each, unoptimized) must be reprocessed (resized, compressed, modern-format-encoded) before reuse in the real build — never shipped at their current prototype weight.
- Brand logo PNGs (currently 2503×2804px serving a ~50–75px display need) should be replaced with SVG or a correctly-sized/optimized raster set once the CMS/media pipeline exists.

## 18. Multi-language Strategy

Full strategy in [`docs/TRANSLATION_STRATEGY.md`](docs/TRANSLATION_STRATEGY.md). Headline: EN is the source language for the current prototype copy; TR is the first additional locale (the company's home market); architecture must support N additional locales without code changes (locale-driven routing + externalized content, not hardcoded per-language page variants).

## 19. CMS Strategy

Full strategy in [`docs/CMS_DATA_MODELS.md`](docs/CMS_DATA_MODELS.md). Headline principles:
- **The CMS constrains authors to the existing design system** — it does not expose raw HTML/CSS editing to content editors (matching UX Principle in §4). Rich-text fields are limited to a curated block set that maps onto existing, already-designed components.
- **Content is decoupled from presentation.** Every page/content type stores structured data (see data models doc); the frontend renders it through the existing frozen visual components — the CMS never stores markup that bypasses the design system.
- **Existing hardcoded data becomes the CMS's first seed data**, not something rebuilt from scratch: Home's featured-products array, Export's distributor nodes, `news-data.js`'s articles, Search's demo index, and Career's job listings all map directly onto the data models documented for this sprint.

## 20. Admin Panel Strategy

Full module list in [`docs/ADMIN_PANEL_MODULES.md`](docs/ADMIN_PANEL_MODULES.md). Headline principles: role-based access control from day one (Admin / Editor / Dealer-manager / Viewer, minimum), an audit log on all content mutations, and a media library that enforces the image-optimization rules in §17 automatically on upload (no manually-optimized-then-uploaded workflow required from editors).

## 21. Git Workflow

- **Trunk-based with short-lived feature branches.** `main` is always deployable and, after Sprint 1, always visually frozen unless a change is an explicit, reviewed design update.
- One logical change per commit; one feature/fix per branch/PR.
- Every PR that touches any page, component, or style must include a visual-regression check (see §13/§14 testing) confirming no unintended pixel diff, given the "pixel-identical" constraint governing this entire project phase.
- Documentation-only sprints (like this one) are committed separately from any code change, never mixed in the same commit.

## 22. Branch Strategy

- `main` — production-equivalent, always deployable, visually frozen except approved design changes.
- `develop` (optional, adopt if the team wants a staging integration branch before Sprint 2 begins) — integration branch for in-progress architecture/CMS work before it's ready for `main`.
- `feature/<phase>-<short-description>` — e.g. `feature/cms-products-model`, `feature/admin-dashboard-shell`. Branch names should reference the roadmap phase (see `docs/ARCHITECTURE_ROADMAP.md`) they belong to.
- `fix/<short-description>` for bug fixes; `docs/<short-description>` for documentation-only changes (like this sprint).
- No direct commits to `main` once Sprint 2 (CMS) implementation begins — all changes via PR + review, per the team's own code-review standards.

## 23. Commit Standards

Conventional commits: `<type>: <description>`, types `feat, fix, refactor, docs, test, chore, perf, ci` (per the team's existing git-workflow rule). Additional rule specific to this project's pixel-freeze constraint: any commit that could plausibly affect visual output must state explicitly in its body whether it was visually verified (e.g. `Verified: no visual diff, screenshot-compared at 320/768/1024/1440px`).

## 24. Coding Standards

- Follow the team's existing TypeScript/JavaScript and web coding-style rules in full (explicit types on public APIs, immutable updates, no `any` in application code, Zod for input validation at boundaries, no `console.log` in production code, files 200–400 lines typical/800 max, functions under ~50 lines, no nesting beyond 4 levels).
- Design tokens as CSS custom properties (§8/§6/§7) — never hardcoded values in new component code, even though the prototype is entirely hardcoded today.
- Semantic HTML first; no generic `<div>` stacks where a semantic element exists — this is a real gap to close relative to the current prototype, not a pattern to preserve.
- Every new shared component ships with its accessibility behavior (§13) and a responsive implementation (§14) in the same PR — not as follow-up work.

## 25. AI Development Rules

Binding for any AI agent (Claude Code or otherwise) working in this repository:

1. **Never redesign, restyle, re-space, retype, recolor, re-animate, or re-layout anything** without an explicit, scoped user instruction to do so — the default assumption for any task in this repo is "preserve pixel output."
2. **Read `project/CLAUDE.md` before touching any visual code** — it is the canonical design-system reference and takes precedence over inference from the HTML.
3. **Read the relevant `docs/*.md` architecture document before starting CMS/Admin/API/translation work** — do not re-derive data models, folder structure, or API shapes ad hoc; extend the documented plan, and update the doc in the same PR if the plan needs to change.
4. **Never invent new design tokens, colors, spacing values, or fonts.** If a new value seems needed, stop and ask — do not guess and hardcode.
5. **Componentization must be visually verifiable.** Any PR that extracts a shared component must include a description of how visual parity was confirmed (screenshot diff, manual comparison at the four standard breakpoints, etc.).
6. **Never commit without being asked**, and never push to `main`/remote without explicit instruction, per the team's standing git-safety rules.
7. **Ask before assuming scope.** If a task could reasonably mean "just this page" or "the whole site," ask rather than guessing the larger scope.
8. **Treat `docs/PROJECT_ANALYSIS.md`'s findings as ground truth for what currently exists** — don't re-audit from scratch when the answer is already documented; do re-verify if the codebase has since changed.
