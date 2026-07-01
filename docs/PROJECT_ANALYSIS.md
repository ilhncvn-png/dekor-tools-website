# PROJECT_ANALYSIS.md — Decor (Dekor Tools) Website Redesign

Analysis-only report. No project files were modified to produce this document.

---

## 0. What this bundle actually is

This is a **Claude Design (claude.ai/design) handoff bundle**, not a production codebase and not plain static HTML. Every `*.dc.html` file is a self-contained *design-tool document*:

- It embeds a proprietary custom element `<x-dc>` wrapping a template (HTML with `{{ expression }}` mustache-style bindings) plus a `<script data-dc-script>`-style JS **class component** (`class Component extends DCLogic { ... state ... render(){ return {...bindings} } }`) that supplies those bindings.
- `support.js` (1,658 lines) is a **generated runtime** — its own header says: *"GENERATED from dc-runtime/src/*.ts — do not edit. Rebuild with `cd dc-runtime && bun run build`."* Corrected finding (verified by direct read): it does **not** merely assume `window.React` already exists — it **lazy-loads React 18.3.1, ReactDOM 18.3.1, and Babel Standalone 7.29.0 from `unpkg.com` at runtime, each pinned with an SRI hash**, then uses them to parse `<x-dc>` templates (`{{ }}` interpolation, `<sc-for>`, `<sc-if>`) and transpile/mount each page's `DCLogic`-based component class. It also implements a `postMessage` bridge back to a parent frame — this is the live hot-reload/preview channel used inside the Claude Design canvas editor, not something a shipped site needs.
- Cross-page composition uses a custom `<dc-import name="..." hint-size="...">` tag (e.g. `<dc-import name="Decor Footer" hint-size="100%,820px">`), not `<iframe>`, not a JS router, not server-side includes.

**Practical consequence:** opening a `.dc.html` file in a plain browser **will actually attempt to boot** — `support.js` fetches React/ReactDOM/Babel from `unpkg.com` over the network and interprets the template — but this depends on live internet access to `unpkg.com`, pulls ~3 external framework bundles per page load purely to interpret a prototype format, and several interactive surfaces (postMessage-driven preview features, the design-canvas bridge) simply have no counterpart outside that canvas. This matches the project's own `CLAUDE.md`/`README.md` guidance: **recreate the visual design pixel-perfectly in real code; do not attempt to ship this bundle's runtime as-is.**

---

## 1. Project structure

```
decor-tools-website-redesign/               (repo root — not a git repo)
├── README.md                                 handoff-bundle explainer for coding agents
└── project/                                  the actual "Decor Tools Website Redesign" export
    ├── CLAUDE.md                              extensive design/system rules (nav, colors, motion, DES)
    ├── *.dc.html  (31 files)                  one design-tool doc per page/component (see §4)
    ├── news-data.js                           216 lines — shared newsroom data module
    ├── support.js                             1,658 lines — GENERATED dc-runtime bundle (React-based template parser/renderer)
    ├── .thumbnail                              single WebP image, project thumbnail (17.6 KB)
    ├── uploads/                                5 real image assets (see §6)
    ├── screenshots/                            ~100 PNG design-review screenshots (not site assets)
    └── _ds/ilk-hecem-design-system-.../         UNRELATED bound design system (see below) — explicitly ignored
```

No `package.json`, no bundler config (webpack/vite/etc.), no `node_modules`, no build scripts anywhere in the repo. This is a flat, dependency-free export.

**The `_ds/` folder is not part of this project.** It contains tokens (`typography.css`, `spacing.css`, `colors.css`, `effects.css`, `fonts.css`), a `styles.css`, a `_ds_bundle.js`, and a `readme.md` belonging to an **"İlk Hecem" (kindergarten) design system** — a different, unrelated Claude Design project that happens to be bound into this workspace. `project/CLAUDE.md` explicitly states it is "intentionally ignored for this project — its adherence warnings are expected." Verified: no `.dc.html` file references any `_ds/` path (`grep -rl "_ds" *.dc.html` → no matches). **Do not treat `_ds/` tokens as canon for this build.**

---

## 2. Technologies used

- **Markup/style authoring:** hand-written inline HTML + inline `style="..."` attributes throughout (near-zero external CSS files); page-level `<style>` blocks live only inside each file's `<helmet>` for keyframes/hover/pseudo-class rules that can't be expressed inline.
- **Templating:** Claude Design's proprietary `<x-dc>` + `{{ }}` mustache binding system, backed by a `DCLogic`-based JS "component" class per page (state, `render()`, event handler methods).
- **Runtime dependency:** React + ReactDOM, but only as **ambient globals** (`window.React`, `window.ReactDOM`) consumed by `support.js` — never imported/loaded as a script in any `.dc.html`. Confirms this bundle cannot self-render outside the Claude Design canvas.
- **Fonts:** Google Fonts only — `Archivo` (weights 400/500/600/700/800/900) and `IBM Plex Mono` (weights 400/500/600), loaded identically on every page via `<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@...&family=IBM+Plex+Mono:wght@...&display=swap">` plus `preconnect` hints to `fonts.googleapis.com`/`fonts.gstatic.com`.
- **Icons:** 100% inline `<svg>` — every one of the 30 files that contain icons uses inline SVG; there is **no icon font or icon CDN** (no Font Awesome, no Lucide script, etc.).
- **No other CDN scripts** of any kind were found (`grep` across all `.dc.html` for `<script src="https?://...">` returned nothing beyond the Google Fonts `<link>` tags).
- **No build tooling** in the shipped bundle itself (the `support.js` header references an internal `dc-runtime` bun-based build pipeline, but that pipeline is not included here — only its compiled output).

---

## 3. Reusable / shared components

### Header / Nav
- Defined inline and duplicated per-page (not via `<dc-import>` for nav — only Footer, Search, and Cookie Consent use `<dc-import>`). Structure is consistent across pages: fixed `<nav>` bar, `backdrop-filter: blur(...)`, order **PRODUCTS · MANUFACTURING · EXPORT · SALES▾ · NEWSROOM▾ · ABOUT▾ · SUPPORT▾ · CONTACT▾ · Become a Dealer (red button)**.
- Dropdowns use `.nav-drop` / `.nav-drop-panel` / `.nav-drop-item` / `.ndi-tick` / `.nav-caret` — hover-triggered (`.nav-drop:hover .nav-drop-panel{opacity:1;...}`), dark glass panel with a 2px red top border. Present in 28 of 31 files.
- **Correction — the mobile-toggle mechanism is not a clean "Home = JS, inner pages = checkbox" split, as `CLAUDE.md` claims.** Direct verification shows it's roughly an even split across inner pages: **14 files** use a CSS-only `#navtoggle` checkbox + `.mobile-menu` (About, Category, Cookies, Manufacturing, Export, Privacy, Quality & Sustainability, RD Center, Our Story, Product Detail, Terms, Products, Vision & Mission, Sitemap), and **14 files** use the same JS `toggleMenu()`/`sc-if value="{{ menu }}"` pattern as Home (Authorized Dealers, B2B Portal, Article, Become a Dealer, Complaint, Career, Contact, Newsroom, Dealer Profile, Idea, Partner Resources, Online Payment, Support, plus Home itself). Either mechanism is a reasonable pattern to build for real (a real component should pick one, not carry both forward) — but don't assume the "Home vs. rest" story when deciding which pages to use as a mobile-menu reference.
- The hamburger button markup itself uses `<button onClick="{{ toggleMenu }}" class="dkr-burger">` — a template binding that requires the `dc-runtime`/Babel-compiled component class to resolve (see §0); the corresponding component logic (`toggleMenu:()=>this.setState({menu:!this.state.menu})`) is real and present in the JS class per page, so this is a legitimate interaction to reimplement, just not something that "already works" if you strip out `support.js`.
- **Nav parity bug found:** `Decor Article.dc.html`'s **desktop** nav is missing the standalone NEWSROOM dropdown entirely (goes PRODUCTS→MANUFACTURING→EXPORT→SALES→ABOUT→SUPPORT→CONTACT), even though its **mobile** menu still lists NEWSROOM. Flag this as a bug to fix, not a pattern to replicate, when Article is implemented.
- **Breakpoint conflict inside `Decor Home.dc.html` itself:** the file has two different nav-collapse breakpoints targeting the same `.dkr-navlinks{display:none}` selector — an inline rule at 780px earlier in the file and a `<helmet>` rule at 1180px later in the cascade (the later one wins, but this is fragile and shouldn't be ported as-is).

### Footer
`Decor Footer.dc.html` is the genuine, single-source **shared footer component** — every real page pulls it in via `<dc-import name="Decor Footer" hint-size="100%,820px"></dc-import>` (confirmed present in 28/31 files; the only files without it are Footer itself, Search, Cookie Consent, and Hero Directions — see §4 for why). Footer file contains its own `<helmet>` with dedicated keyframes (`dkrFtBreathe`, `dkrFtScan`, `dkrFtTwinkle`, `dkrFtDrift`, `dkrFtPulse`, `dkrFtWord`, `dkrFtLabel`) and classes (`.ft-wrap`, `.ft-live`, `.ft-scan`, `.ft-glint`, `.ft-particle`, `.ft-coord`, `.ft-dot`), independent of the `.bp-*` blueprint classes used elsewhere.

### Search
`Decor Search.dc.html` is also a **shared, imported component** (`<dc-import name="Decor Search">`, present in the same 28/31 pages as the footer) — a search overlay/panel with bindings for `query`, `onQuery`, `noResults`, `hasResults`, `resultLabel`.

### Cookie Consent
`Decor Cookie Consent.dc.html` is imported **only once**, from inside `Decor Footer.dc.html` (`<dc-import name="Decor Cookie Consent">`) — i.e. it is a footer-level global banner component, not a per-page import. 100 lines, self-contained.

### Hero / banner system
The CMS-style rotating hero banner (records with fields like `eyebrow/h1/h2/sub/cta1/cta1link/cta2/cta2link/productCode/imageLabel/bg/gridColor/markerColor`, matching the shape `CLAUDE.md` describes) **only exists on `Decor Home.dc.html`** — confirmed via `grep -l "bannerData"` returning a single file. It is not a shared, reusable module — every other page hard-codes its own single hero markup inline. **Correction:** there is no literal function named `bannerData()` to copy — the banner array lives inline inside the page's `Component.renderVals()`/state, looped with `<sc-for list="{{ banners }}">`, with prev/next/pause/resume handlers and a progress-bar/dot nav. Treat the "CMS-ready hero" language in `CLAUDE.md` as directionally accurate but Home-page-only today, not something already generalized or literally named `bannerData()`.

`Decor Hero Directions.dc.html` (153 lines) is **not a real site page** — it is a design-exploration/moodboard artifact (`<meta name="design_doc_mode" content="canvas">`, heading "Hero Directions", body text "Three distinct visual languages for the homepage. Pick one... and I'll build out the full immersive site from it."). It shows 3 discarded hero directions (Direction A "Engineered", etc.) and should be treated as historical design reference only, excluded from the real page inventory.

### Buttons
No single canonical button class — several parallel systems coexist across pages: `.dkr-btn` (`.dkr-btn-red`, `.dkr-btn-dark`, `.dkr-btn-ghost`, `.dkr-btn-ghostlight`) is the most common primary system; plus page-local variants `.ck-btn` (`.ck-ghost`, `.ck-link`, `.ck-red`) on Career, `.ft-btn` (`.ft-btn-ghost`, `.ft-btn-red`) in the footer, `.mapbtn`, `.pay-cta`, `.pcta`, `.cta-arrow`, `.share-btn`, `.icon-btn`, `.carbtn`, `.lb-btn`. **Risk:** button styling is not a single reusable component — a real component library should consolidate these.

### Cards
Similarly fragmented: `.spec-card` (the "WHY-DEKOR" engineering spec card described in `CLAUDE.md`, confirmed only in `Decor Home.dc.html`, 9 occurrences — **not present in Manufacturing or Product Detail**, contradicting the "reuse for any spec grid" claim), plus `.cat-card`, `.dl-card`/`.dl-card-acc`, `.ncard`/`.ncard-acc`/`.ncard-bp`/`.ncard-img`/`.ncard-read`/`.ncard-scan` (newsroom cards), `.entry-card`, `.feat-card`, `.ben-card`, `.b2-card`, `.appcard`, `.ch-card`, `.ck-card`, `.logi-card`. Each page family invented its own card class rather than sharing one.

### Forms
`.f-input` / `.f-select` / `.f-area` / `.f-file` (plus an undocumented `.f-label`, the red-focus-ring form field classes described in `CLAUDE.md`) are consistently used in exactly **7 files**: Authorized Dealers, Complaint, Become a Dealer, Category, Idea, Online Payment, Newsroom. But usage is genuinely uneven — `Decor Become a Dealer.dc.html` has 22 `.f-input`/4 `.f-select`/27 `.f-label` (the large 7-section application form `CLAUDE.md` describes), while `Decor Online Payment.dc.html` has only 3 `.f-input` and **no** `.f-select`/`.f-area`/`.f-file` at all.
- **`Decor Contact.dc.html` has no form whatsoever** — verified directly: zero `<input>`/`<select>`/`<textarea>`/`<form>` tags anywhere in the file. It is purely an office/phone/email/department-links page that hands off all actual message submission to `Decor Complaint.dc.html`. Don't assume "Contact" implies a message form when scoping that page.
- **`Decor Career.dc.html`'s 6-step application wizard reinvents its own `.wiz-input`/`.wiz-select`/`.wiz-area`/`.wiz-chip`/`.wiz-drop` classes instead of reusing `.f-*`** — a direct, confirmed violation of `CLAUDE.md`'s own "Reuse these classes — don't reinvent" rule. The wizard itself is real and complex: drag-and-drop file zones, a progress bar, per-step validation state, and a review step, driven by the page's own `DCLogic` component class (`this.state`, `addEdu()/addExp()/addLang()`, `next()/prev()/submit()`).
- `Decor Newsroom.dc.html`'s similarly-named `.nf-input`/`.nf-select` are unrelated **filter** controls (search/year/sort), not a submission form — a naming coincidence with `.f-*`, not a real relationship.
- Other components invent their own local form-adjacent namespaces too: Search uses `.srch-*`, Cookie Consent uses `.ck-*`. Consolidating all of these into one real form-field component is worthwhile scope for Phase 1 of implementation.

---

## 4. Full page list (31 `.dc.html` files)

| File | Lines | Purpose |
|---|---|---|
| Decor Home.dc.html | 1481 | Master homepage — "premium trailer," rotating hero banner, all major sections previewed |
| Decor Product Detail.dc.html | 1033 | Single product page |
| Decor Become a Dealer.dc.html | 670 | Dealer-onboarding: hero, benefit cards, requirement specs, 6-step timeline, 7-section application form, export-team contact |
| Decor Career.dc.html | 664 | Careers — job listings + 6-step application wizard with file upload |
| Decor Export.dc.html | 645 | Export program — world-map hero, distributor map, KPIs, timeline, documents, OEM/private-label |
| Decor Support.dc.html | 431 | Support/FAQ/help page |
| Decor Article.dc.html | 410 | Single newsroom article (hero image, meta, share, gallery/lightbox, related, prev/next) |
| Decor Contact.dc.html | 408 | Contact form + info |
| Decor Manufacturing.dc.html | 391 | Manufacturing/facility page |
| Decor Category.dc.html | 386 | Product category listing |
| Decor Dealer Profile.dc.html | 379 | Individual dealer profile page |
| Decor Newsroom.dc.html | 367 | Newsroom landing — filters (All/News/Trade Shows/Training Academy/Company Life), search, year, sort, card grid |
| Decor Authorized Dealers.dc.html | 359 | Dealer directory/finder |
| Decor Our Story.dc.html | 353 | About sub-page: company story |
| Decor Online Payment.dc.html | 350 | Sales sub-page: online invoice payment |
| Decor Products.dc.html | 347 | Products landing/overview |
| Decor Quality Sustainability.dc.html | 345 | About sub-page: quality & sustainability |
| Decor RD Center.dc.html | 342 | About sub-page: R&D center |
| Decor Partner Resources.dc.html | 325 | Sales sub-page: price lists, catalogs, brand assets |
| Decor About.dc.html | 321 | About landing/chapter hub (5-page section index) |
| Decor Vision Mission.dc.html | 280 | About sub-page: vision & mission |
| Decor B2B Portal.dc.html | 279 | Sales sub-page: professional ordering platform |
| Decor Complaint.dc.html | 266 | "Submit Your Complaint" form |
| Decor Idea.dc.html | 249 | "I Have an Idea" submission form |
| Decor Privacy.dc.html | 234 | Legal: privacy policy |
| Decor Cookies.dc.html | 234 | Legal: cookie policy |
| Decor Sitemap.dc.html | 234 | Sitemap page |
| Decor Terms.dc.html | 234 | Legal: terms |
| Decor Search.dc.html | 155 | **Shared component** — search overlay, imported by 28 pages |
| Decor Hero Directions.dc.html | 153 | **Design artifact, not a real page** — moodboard of 3 discarded hero directions |
| Decor Footer.dc.html | 306 | **Shared component** — footer (imports Cookie Consent), pulled into 28 pages |
| Decor Cookie Consent.dc.html | 100 | **Shared component** — cookie banner, imported only by Footer |

Effective real-page count: **28** (31 files minus Footer, Search, and Hero Directions, which are components/artifacts rather than standalone pages a user navigates to directly).

---

## 5. Routing

There is no client-side router and no server. Navigation is entirely **plain anchor links between static files**: `<a href="Decor Products.dc.html">`, etc. — every nav item, footer link, and in-page CTA points at a literal `Decor X.dc.html` filename.

Hash fragments are used for **in-page pre-filtering**, not routing to different content: e.g. `Decor Newsroom.dc.html#news`, `#trade-shows`, `#training-academy`, `#company-life` (Newsroom reads `location.hash` on load to pre-select a filter chip), and `Decor Article.dc.html#<slug>` (Article reads the hash to decide which article record from `news-data.js`'s `ARTICLES` array to render). This confirms `CLAUDE.md`'s description of the Newsroom/Article hash convention.

Shared components are pulled into a host page via the design-tool-only `<dc-import name="...">` tag (§0), not routing.

---

## 6. Assets

**Images (`project/uploads/`, 8 files):**
- `decor_logo_black.png`, `decor_logo_color.png`, `decor_logo_white.png` — the three canonical logo variants (`CLAUDE.md`: dark bg → white, light bg → color or black, favicon = color). Verified oversized for their use: e.g. `decor_logo_white.png` is 2503×2804px / 90 KB despite rendering at ~46–75px tall in nav/footer/mobile.
- **Correction:** `001.png`, `002.png`, `003.png` are **real, used photographs, not unused placeholders** — verified via `file` (1448×1086 and 1254×1254 RGB PNGs, ~2 MB each) and via grep confirming they're referenced by exact path (`uploads/001.png` etc.) inside `Decor Home.dc.html`'s hardcoded featured-product carousel data: 001 = a roller/frame product shot, 002 = a production-floor shot, 003 = a world-export-map shot. None carry `width`/`height` attributes or `loading="lazy"`.
- Across all 31 files there are **59 `<img>` tags total, and zero of them have explicit `width`/`height` attributes** — layout relies on inline `style="height:Npx"` alone (no matching width), a real CLS risk once real imagery replaces today's CSS-drawn panels. Only **one file**, `Decor Product Detail.dc.html`, uses `loading="lazy"` anywhere in the entire bundle.

Beyond these 3 real photos, **the overwhelming majority of "imagery"** across all 31 pages is not real photography — it's CSS-drawn abstract industrial visuals and explicitly labeled placeholder panels (mono product codes, "IMAGE SLOT" text), per `CLAUDE.md`'s own build convention. Any real build must source/produce real photography for hero banners, most product shots, manufacturing facility, dealer/team photos, etc. — the 3 existing photos cover only Home's carousel.

**Icons:** 100% inline SVG (§2), consistent 1.7–2px stroke weight — no external icon assets to migrate.

**Fonts:** Google Fonts CDN only — Archivo (400–900) + IBM Plex Mono (400–600), `display=swap`. No self-hosting, no subsetting; most (not all) declarations do chain a generic `sans-serif` fallback after `'Archivo'`, but there's no metric-matched fallback.

**Videos:** none found — no `<video>` tags anywhere. Product Detail's "product video" section is simulated with a play/pause state toggle over a static placeholder panel, not a real embed.

**Other:** `project/.thumbnail` — confirmed via `file` to be a genuine WebP image (17.6 KB), the Claude Design project thumbnail (not a site asset). `project/screenshots/` — **132 files** (not ~100 as a rough listing suggested), and despite the `.png` extension, `file` confirms they are actually **JPEG-encoded** (924×540, JFIF) — design-review/QA screenshots taken during the Claude Design session (filenames like `01-about.png`, `home-hero.png`, `share-modal.png`). Useful as historical visual reference only; don't ship them or trust the `.png` extension for tooling that inspects magic bytes.

---

## 7. Animation / motion system actually found in code

The "Decor Motion Language" described at length in `CLAUDE.md` is **substantially implemented but not universally applied**:

- `.bp-live` (breathing blueprint grid), `.bp-scan` (blue scan line), `.bp-glint` (twinkling dots), `data-reveal` (scroll-reveal rise+fade): each appears in **28 of 31 files** — effectively universal across real pages. Missing only from Cookie Consent, Hero Directions, Footer, and Search (the non-page components/artifacts), which is expected.
- `.bp-particle` (drifting micro-particles): appears in only **18 of 31 files** — a real gap; roughly a third of pages that have the other blueprint classes lack particles.
- `.des-atmos` (conic blue+red sweep, `dkrSpinSlow`): only **13 files** — this is meant for "signature dark sections" per `CLAUDE.md`, so partial coverage may be intentional, but it's worth confirming which pages were supposed to get it and didn't.
- `.seam-guide` (the "no gradients/fades, ever — structural section transitions only" system, described as **permanent and governing every page**): found in only **5 files** — `Decor Home`, `Decor About`, `Decor Our Story`, `Decor RD Center`, `Decor Quality Sustainability`. This is a significant gap versus the CLAUDE.md claim that this pattern is permanent/site-wide. Newsroom and Article implement the *same concept* (negative-margin overlap + "DATUM · SECTION" markers) but under a **different class name, `.seam-wrap`**, rather than reusing `.seam-guide` — so the pattern is somewhat more widespread than the raw class-name count suggests, just inconsistently named. Most other pages (Product Detail, Export, Career, Contact, Manufacturing, dealer pages, legal pages) do not yet use either variant.
- Footer has its own **independent, parallel animation system** (`dkrFtBreathe/dkrFtScan/dkrFtTwinkle/dkrFtDrift/dkrFtPulse/dkrFtWord/dkrFtLabel` → `.ft-live/.ft-scan/.ft-glint/.ft-particle/.ft-coord/.ft-dot`, plus `.ft-metric`/`.ft-social`/`.ft-statcell`) rather than reusing the page-level `.bp-*` keyframes — duplicated concept, different implementation, same visual intent. Across the whole bundle there are **52 distinct `@keyframes` names** (e.g. `dkrSpinSlow`, `dkrScan`, `bpDrift`, `cadDash`, `dkrMarquee`, `mapPing`, `wizIn`, `srchPop`...), confirming heavy per-file reinvention rather than a shared animation vocabulary.
- **Direct contradiction found, not just a gap:** `CLAUDE.md` states entrances must be "transform-only... never opacity that starts at 0 — resting state must be visible." But the actual `[data-reveal]` rule in **both `Decor Home.dc.html` and `Decor Privacy.dc.html`** literally starts `opacity:0` (e.g. `[data-reveal]{opacity:0;transform:translateY(34px);...}` in Home, `opacity:0;transform:translateY(30px)` in Privacy) — i.e. the master reference itself violates its own documented rule. Flag this explicitly during implementation: decide whether to follow the written rule (transform-only, safer for environments that freeze animations) or the master file's actual behavior, rather than silently copying whichever one gets read first.
- `prefers-reduced-motion` is genuinely well-covered: every sampled file (Home, Footer, Privacy, Career, Contact, Newsroom, Article, Cookie Consent, Search) pairs its motion classes with a matching `@media(prefers-reduced-motion:reduce){...animation:none !important...}` override.

---

## 8. Responsive system

Actual `@media` breakpoints found across the bundle (px values, ascending): **560, 620, 640, 680, 720, 760, 780, 860, 920, 960, 980, 1080, 1180**.

- **1180px** is the dominant, load-bearing breakpoint — it's the nav collapse point (`@media(max-width:1180px){.dkr-navlinks{display:none !important;}.dkr-burger{display:flex !important;}}`), consistent with `CLAUDE.md`'s statement that the mobile menu triggers at `max-width:1180px`. Note the earlier-noted conflict: `Decor Home.dc.html` also has an inline 780px rule targeting the same selector earlier in the cascade — the 1180px rule wins because it's declared later, but this dual-breakpoint pattern shouldn't be carried into a real implementation.
- All `@media` queries found are `max-width` only — **zero `min-width` queries exist anywhere** in the bundle, confirming this is a desktop-first/cascading-override responsive strategy, not mobile-first. Something to consciously decide on (mobile-first is generally more robust) rather than default-porting.
- The remaining breakpoints (560–1080) are page/section-specific fluid-layout adjustments (grid column collapses, orientation flips for connector lines, horizontal scroll-snap carousels below 640px, etc.) rather than a single shared breakpoint scale — there's no evidence of a small fixed set like 320/768/1024/1440 (the standard testing breakpoints from the team's own testing rules); the design instead leans on `clamp()`-based fluid sizing for most spacing/type (confirmed concrete values: hero type `clamp(44px,6.6vw,88px)`, section headers `clamp(30-46px,4-8vw,60-112px)`, section padding `clamp(20-64px,5-9vw,64-128px)` horizontal / `clamp(64px,9vw,128px)` vertical, matching `CLAUDE.md`'s spec precisely — though these are inlined per element, not defined as CSS custom properties anywhere in the files).
- No CSS custom properties / design tokens file exists in `project/` itself (confirmed: no `:root{--...}` token block found at the project level) — every color/spacing/font value is **hardcoded inline per element, repeated across all 31 files**. This is the single biggest maintainability risk in the bundle (see §11).

---

## 9. Design system tokens actually present

- **Colors** (hardcoded hex, repeated inline, matches `CLAUDE.md`): near-black `#0E0F11`, charcoal `#1A1C1F`/`#16181b`, footer `#0a0b0c`, white `#fff`, mist `#F4F5F6`, concrete `#E6E8EB`, border `#E2E5E9`, steel text `#5A6066`, muted `#8A9097`, Decor red `#D32027` (with dark-bg eyebrow variant `#ff7a72`), corporate blue `#0095DA`. All confirmed present verbatim in sampled files (Home, Career, Footer).
- **Typography:** Archivo (display/body, 700–900 weight for headings, `-0.03em` tracking) + IBM Plex Mono (eyebrows/codes/stats, uppercase, wide tracking) — confirmed as the only two font families loaded anywhere.
- **No token file / CSS variables** exist in `project/` — all of the above are inlined per-element style attributes, not `:root` custom properties. This contradicts the user's own global coding-style rule (design tokens as CSS custom properties) but is consistent with how Claude Design exports canvas designs (inline-first, tokens added later during real implementation).
- **The `_ds/ilk-hecem-design-system-.../tokens/*.css` files are unrelated** (different project, different domain — kindergarten branding) and are correctly un-referenced by any `.dc.html` file. Do not port those tokens into the real Decor build.

---

## 10. Technical risks

1. **The bundle depends on a live, runtime CDN fetch of React/ReactDOM/Babel from `unpkg.com`** (SRI-pinned, inside `support.js`) purely to interpret its own template format — this is fine for a Claude Design canvas preview but is not something to carry into a real build; nothing here is directly deployable, everything must be re-implemented in real markup/framework code.
2. **Extreme inline-style duplication**, quantified: `style="..."` attribute counts range from 15 (tiny Cookie Consent fragment) up to **521 in `Decor Home.dc.html`** and **327 in `Decor Product Detail.dc.html`**, with most substantive pages in the 90–230 range. Every color/spacing/typography value is repeated inline per element rather than driven by shared CSS. A single design change (e.g. a color tweak) currently requires editing up to 28 files by hand — a strong signal to build a real shared Header/Nav/Footer/token system immediately during implementation rather than porting the duplication forward.
3. **Motion-language coverage is inconsistent**, not "permanent and universal" as `CLAUDE.md` claims: `.seam-guide` only in 5/31 files (though Newsroom/Article implement the same idea as `.seam-wrap`), `.bp-particle` in 18/31, `.des-atmos` in 13/31, and the master reference (`Decor Home.dc.html`) itself contradicts the documented "never opacity-from-0" rule (§7). Implementers should not assume every page already has full, self-consistent motion coverage to copy from.
4. **Hero/banner CMS pattern exists only on Home**, and there's no literal `bannerData()` function to extract — it's inline in the page's render state. If the real product needs a CMS-manageable rotating hero everywhere, that's new work, not a port.
5. **No componentized card/button/form-field system** — many parallel, page-specific class families for buttons (`.dkr-btn`/`.ck-btn`/`.ft-btn`), cards (`.spec-card`/`.ncard`/`.dl-card`/`.cat-card`/`.prodc`/`.rcard`/`.ofc-card`/`.val-card`...), and forms (`.f-*` vs Career's own `.wiz-*` vs Newsroom's unrelated `.nf-*` vs Search's `.srch-*` vs Cookie Consent's `.ck-*`) — including a **confirmed violation of `CLAUDE.md`'s own "reuse these classes, don't reinvent" rule** by the Career wizard. These need real consolidation into one component library, not 1:1 porting.
6. **Real imagery is scarce and narrowly used** — only 3 non-logo photos exist (`uploads/001-003.png`, ~2 MB each, unoptimized, no responsive sizing), and they're only referenced from Home's product carousel. Every other page's imagery is CSS-drawn placeholder art. Photography/renders for hero banners, most products, manufacturing, dealers, and team pages is a hard dependency before the real site can look "real."
7. **Concrete, verified accessibility gaps**, not just a general "needs an audit" note: zero `role="dialog"`/`aria-modal` on any overlay (Search palette, Product Detail's share/search/lightbox modals, Cookie Consent banner); mouse-only interaction on Export's region-hover distributor map and Article's gallery/lightbox thumbnails (no keyboard equivalent); zero `<img>` tags anywhere carry `width`/`height` (CLS risk); Footer, Hero Directions, and Search have no `aria-label` usage at all, and Search's own input relies on placeholder text rather than a label. All of this needs explicit remediation during real implementation, per the team's own web accessibility/testing rules — don't assume the source got this right.
8. **Inconsistent per-page `<head>` hygiene**: Open Graph meta (`og:title`/`og:description`/`og:image`) exists on only Home — every inner page is missing social-share metadata; favicon (`<link rel="icon">`) is missing from 8 of 31 files (Career, Contact, Complaint, Cookie Consent, Hero Directions, Footer, Idea, Search).
9. **No tokens, no build tooling, no tests** exist in this bundle — CSS custom properties, bundling, linting, and automated testing are all net-new work for the real codebase, not something to carry over.
10. **`Decor Hero Directions.dc.html` is not a page** and must be excluded from the real site's page count/routing/sitemap — it's a discarded design-exploration artifact (three hero mockups: "Engineered" light, "Forged" dark/cinematic, "Editorial" split), never linked from any other file, confirming it was left in the export rather than intentionally included.
11. **`_ds/` folder is inert but present** — confirmed to be a wholly unrelated Turkish-kindergarten design system (different palette, type system, language, and component library), zero cross-references from any `.dc.html` file. Worth deleting or clearly separating from the real project directory once implementation starts, purely to avoid future confusion.
12. **Hardcoded, unverified content**: dealer/office addresses (Contact), job listings and search-index entries (Career, Search) are demo data; news articles (`news-data.js`) are explicitly placeholder content; export distributor nodes (Export, 12 hardcoded records) and Home's featured-products array (9 hardcoded records with codes/materials/certs) all need a real CMS or data layer, and `CLAUDE.md`'s own facts section flags founding date/facility size/export-country-count/contact details as needing verification before publishing.

---

## 11. Suggestions before development (non-binding, for the roadmap)

See `DEVELOPMENT_ROADMAP.md` for the phased plan. Summary of the top-level recommendation: **treat `Decor Home.dc.html` and `Decor Privacy.dc.html` as the two required first reads** (per `README.md`/`CLAUDE.md`), pick a real target stack (React/Next, Vue, or plain component-based static site — the visual language does not dictate the stack), extract a real design-token file from the hardcoded values in §9 before writing any component, and build Header/Nav/Footer/Search/Cookie-Consent as genuine shared components first since every page depends on them.
