# DEVELOPMENT_ROADMAP.md — Decor (Dekor Tools) Website Redesign

This is a **proposed** phased plan based on the findings in `PROJECT_ANALYSIS.md` and `PROJECT_STRUCTURE.md`. No implementation has started; nothing in `project/` has been touched. Sequencing/scope should be confirmed with the user before any code is written, per the README's own instruction ("if anything is ambiguous, ask the user to confirm before you start implementing").

---

## Phase 0 — Required reading & scoping (before writing any code)

1. Read `project/Decor Home.dc.html` in full — it is the master design reference; every visual/interaction pattern used elsewhere in the site originates here.
2. Read `project/Decor Privacy.dc.html` in full — the README states the user had this file open when triggering the handoff, so it is likely the actual first target to implement, not necessarily Home.
3. **Open question to confirm with the user:** which page(s) are the actual near-term implementation target — the whole 28-page site, or just the page the user was viewing (Privacy) plus its shared Header/Footer/Search/Cookie-Consent? Scope this explicitly before starting; don't assume "build everything."
4. Confirm target stack (React/Next.js, Vue, Astro, plain component-based static — the visual language doesn't dictate this) and confirm whether real photography/renders will be supplied or need sourcing (currently only 3 non-logo images exist in `uploads/`).
5. Decide whether to delete/relocate the unrelated `_ds/` folder from the working tree to avoid future confusion (it's inert today but not part of this project).

---

## Phase 1 — Foundation: tokens + shared components

Because every color/spacing/font value across all 31 files is hardcoded inline (no CSS custom properties exist), and Header/Nav/Footer/Search/Cookie-Consent markup is duplicated verbatim across up to 28 files, foundation work should happen once, not per-page:

1. **Design tokens** — extract the verified palette/type values from `PROJECT_ANALYSIS.md` §9 into real tokens (CSS custom properties or theme file, per the team's own web coding-style rules): `--color-*` (near-black `#0E0F11`, red `#D32027`, blue `#0095DA`, mist/concrete/border/steel/muted grays), `--font-display: 'Archivo'`, `--font-mono: 'IBM Plex Mono'`, spacing scale, the 13 observed breakpoints rationalized down to a sane responsive scale (1180px nav-collapse is load-bearing; the others are candidates for consolidation).
2. **Shared Header/Nav component** — real dropdown menus (`SALES▾ / NEWSROOM▾ / ABOUT▾ / SUPPORT▾ / CONTACT▾`) with genuine keyboard/focus support (hover-only interaction in the source has no confirmed keyboard equivalent — needs a real accessible implementation, not a port), and a single, consistent mobile-menu mechanism (the source actually splits ~14/14 between a CSS-only checkbox pattern and a JS `toggleMenu()` pattern — pick one for the real component rather than treating either half as canonical). While building, fix the confirmed nav parity bug where `Decor Article.dc.html`'s desktop nav is missing the NEWSROOM dropdown that its own mobile menu includes.
3. **Shared Footer component** (port from `Decor Footer.dc.html`, including its independent `.ft-*` motion classes) with the Cookie Consent banner as a nested/global component.
4. **Shared Search component** (port from `Decor Search.dc.html`).
5. **Button + Card component consolidation** — reconcile the half-dozen parallel button classes (`.dkr-btn`, `.ck-btn`, `.ft-btn`, `.mapbtn`, `.pcta`, etc.) and card classes (`.spec-card`, `.ncard`, `.dl-card`, `.cat-card`, etc.) into one real component API with variants, rather than porting each page-specific class 1:1.
6. **Form field components** (`.f-input/.f-select/.f-area/.f-file` pattern) with real client + server validation, since none of the source forms have a backend (`CLAUDE.md`: "submit swaps to an inline success panel (no backend)"). Note Career's wizard currently reinvents its own `.wiz-*` classes instead of `.f-*` — consolidate it onto the real shared form components rather than porting its separate naming forward. Also note `Decor Contact.dc.html` has no form at all today (it only links to Complaint) — confirm with the user whether Contact should gain a real inquiry form or stay link-only.

---

## Phase 2 — Motion / Decor Experience System

1. Implement the blueprint motion classes (`.bp-live`, `.bp-scan`, `.bp-glint`, `.bp-particle`, `data-reveal`) as real, reusable CSS/JS (IntersectionObserver-driven reveal, respecting `prefers-reduced-motion`), matching the team's own performance rule to animate only compositor-friendly properties (`transform`/`opacity`, never layout properties).
2. Implement the `.seam-guide` structural section-transition system properly — it currently only exists (under that exact class name) on 5 of 31 source pages (Home, About, Our Story, R&D Center, Quality & Sustainability); Newsroom/Article implement the same concept under a different name (`.seam-wrap`). Reconcile these into one real component and extend the pattern to every other page as it's built, per `CLAUDE.md`'s "permanent, governs every page" rule — this is real net-new/consolidation work, not a straight port.
3. **Resolve a direct contradiction before building this:** `CLAUDE.md` mandates transform-only entrances that never start at `opacity:0`, but the master reference `Decor Home.dc.html` (and `Decor Privacy.dc.html`) both literally start `[data-reveal]` at `opacity:0`. Decide explicitly which behavior to implement — the documented rule (safer for environments that freeze animations) or the master file's actual behavior — rather than silently inheriting whichever is read first, and apply that decision consistently across every page.

---

## Phase 3 — Page-by-page implementation

Suggested build order, front-loading the highest-value/most-referenced pages and the pages explicitly called out by the handoff:

1. **Decor Privacy** (README's designated starting point) + shared Header/Footer/Search/Cookie-Consent from Phase 1.
2. **Decor Home** (master reference; includes the only working hero-banner CMS pattern — `bannerData()` — decide whether to generalize this into a shared hero component or keep it Home-only).
3. **Products flow**: Products → Category → Product Detail (1033 lines, the most complex non-Home page — likely has significant interactive state: filters, image gallery, spec tables).
4. **Sales section**: Authorized Dealers, Partner Resources, B2B Portal, Online Payment, Dealer Profile, Become a Dealer (670 lines, has its own multi-section form).
5. **About section** (5 sub-pages sharing nav/footer/DES): About hub, Our Story, Vision & Mission, R&D Center, Quality & Sustainability.
6. **Career** (664 lines) — the most complex form in the bundle: 6-step wizard, drag-and-drop file upload, per-step validation, review step. Budget real backend/file-storage work here, not just UI port.
7. **Newsroom + Article** — port `news-data.js` as real content data (or migrate to a real CMS/data source), implement filter chips + hash-based pre-filtering + article gallery/lightbox.
8. **Export** (645 lines) — interactive distributor map + animated KPIs; check whether the "map" is CSS/SVG-only or needs a real mapping library.
9. **Manufacturing, Support, Contact, Complaint, Idea** — remaining content/form pages.
10. **Legal pages**: Cookies, Terms, Sitemap (Privacy already done in step 1) — low interactivity, low risk, can be batched together.

Exclude `Decor Hero Directions.dc.html` from this list entirely — it is a discarded design-exploration artifact, not a page to implement.

---

## Phase 4 — Content & assets

1. Source or commission real photography/renders — only 3 non-logo images exist in the entire source bundle (`uploads/001-003.png`, used exclusively in Home's featured-product carousel: a roller/frame shot, a production-floor shot, and a world-export-map shot), each ~2 MB/unoptimized/no responsive sizing. Everything else across all 31 pages is CSS-drawn placeholder art per the source's own labeling convention ("IMAGE SLOT"). Budget real width/height attributes and lazy-loading for every image as it's built — none of the 59 `<img>` tags in the source carry explicit dimensions, and only one file uses `loading="lazy"`.
2. Verify factual claims before publishing — `CLAUDE.md` itself flags: "Facts (from public company data — verify certs/dealer terms before publishing)" for founding date, facility size, export country count, contact details, product family names.
3. Decide on a real CMS or data layer for: news articles (currently `news-data.js`, a static JS module), the hero banner rotation (`bannerData()`), dealer directory entries, and job listings — all currently hardcoded.

---

## Phase 5 — Testing & QA (per the team's own web testing rules)

1. **Visual regression** at 320/768/1024/1440px per page/component, both the hero and any scrollytelling-style sections; compare against the `project/screenshots/` folder as historical reference where relevant, understanding those are AI-design-tool captures, not a formal baseline.
2. **Accessibility**: automated checks + keyboard navigation (especially the nav dropdowns, mobile menu, Export's region-hover distributor map, and Article's gallery/lightbox — all confirmed mouse-only in the source with no keyboard equivalent) + `role="dialog"`/`aria-modal` on overlay surfaces (Search palette, Product Detail's share/search/lightbox modals, Cookie Consent — none of which have this today) + reduced-motion verification + contrast checks (the dark near-black/steel-gray palette needs explicit contrast validation against WCAG AA). Also add missing per-page `<head>` hygiene the source lacks: Open Graph tags (present only on Home in the source) and favicons (missing from 8 of 31 source files).
3. **Performance**: Lighthouse/CWV targets per the team's standard budgets; watch bundle size specifically because the source pattern of "huge inline style blocks repeated per page" is exactly what the team's performance rules warn against — real components should collapse this into shared CSS.
4. **Cross-browser + responsive**: standard matrix (Chrome/Firefox/Safari; 320–1920px), paying particular attention to the 1180px nav-collapse breakpoint since it's the single most load-bearing responsive rule found in the source.
5. **Forms E2E**: Contact, Complaint, Idea, Become a Dealer application, and especially the Career 6-step wizard (file upload, multi-step state, validation) need real end-to-end coverage since none of this logic previously executed outside the Claude Design canvas.

---

## Open questions to raise with the user before proceeding

- Confirmed scope: full 28-page rebuild, or a smaller slice starting with Privacy/Home?
- Target framework/stack?
- Is real photography being supplied, or does content sourcing need to be scoped as its own workstream?
- Is a real CMS required for News/Dealers/Careers/Hero banners, or should these stay as static data files for now?
- Should the `_ds/` unrelated design-system folder be removed from this working directory?
