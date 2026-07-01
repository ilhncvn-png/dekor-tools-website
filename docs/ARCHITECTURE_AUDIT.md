# ARCHITECTURE_AUDIT.md — Sprint 1 Structural Audit

**Scope:** identify reusable components, duplicated code, shared sections, repeated styles, and technical debt in the current (frozen) visual codebase, to inform Sprint 2+ componentization. **No refactoring was performed** — this is a findings report only, consistent with the sprint's documentation-only mandate. Every finding below is carried forward from the verified evidence in [`docs/PROJECT_ANALYSIS.md`](PROJECT_ANALYSIS.md) and re-organized here for architecture planning.

---

## 1. Reusable components already identified (candidates for real extraction)

| Candidate component | Current source | Notes |
|---|---|---|
| `<Header>` / `<Nav>` | Duplicated inline markup across 28 pages | Not currently shared via any mechanism — highest-value extraction target |
| `<Footer>` | `project/Decor Footer.dc.html`, imported via `<dc-import>` on 28 pages | Already conceptually shared in the prototype's own tooling — closest thing to a "real" component today |
| `<Search>` | `project/Decor Search.dc.html`, imported via `<dc-import>` on 28 pages | Same as Footer — already conceptually componentized |
| `<CookieConsent>` | `project/Decor Cookie Consent.dc.html`, imported only by Footer | Small, self-contained, easy first extraction |
| `<HeroBanner>` (CMS-ready) | `Decor Home.dc.html` only | Rotating banner pattern exists only on Home; needs generalizing if other pages need CMS-driven heroes |
| `<Button>` | 6 parallel class families (`.dkr-btn`, `.ck-btn`, `.ft-btn`, `.mapbtn`, `.pcta`, `.cta-arrow`) | Needs consolidation into one component with variants, not 1:1 extraction |
| `<Card>` | ~12+ parallel class families (`.spec-card`, `.ncard`, `.dl-card`, `.cat-card`, `.prodc`, `.rcard`, `.ofc-card`, `.val-card`, `.ben-card`, `.b2-card`, `.appcard`, `.ch-card`, `.ck-card`, `.logi-card`) | Same visual idiom (hover-lift + border/shadow accent) reimplemented per section |
| `<FormField>` (input/select/textarea/file) | `.f-input`/`.f-select`/`.f-area`/`.f-file` (7 files) + Career's separate `.wiz-*` set + Newsroom's unrelated `.nf-*` filters + Search's `.srch-*` + Cookie Consent's `.ck-*` | Real consolidation opportunity — see §3 |
| `<NavDropdown>` | `.nav-drop`/`.nav-drop-panel`/`.nav-drop-item` — consistent across 28 files | Good extraction candidate, markup is already consistent |
| `<SeamTransition>` | `.seam-guide` (5 files: Home, About, Our Story, RD Center, Quality & Sustainability) + `.seam-wrap` (Newsroom, Article — same concept, different name) | Needs name reconciliation before extraction |
| `<BlueprintMotionLayer>` (`.bp-live`/`.bp-scan`/`.bp-glint`/`.bp-particle`) | Re-declared independently in every file's own `<helmet>` | High-value shared-stylesheet extraction — pure duplication, zero page-specific variation needed |

## 2. Duplicated code (quantified)

- **Inline `style="..."` attributes:** counted directly — range from 15 (tiny Cookie Consent fragment) to **521 in `Decor Home.dc.html`** and **327 in `Decor Product Detail.dc.html`**; most substantive pages sit at 90–230. This is the single largest source of duplication in the codebase — every color/spacing/typography value is repeated per element rather than driven by shared CSS or tokens.
- **Nav markup:** byte-for-byte identical `<nav>` block (dropdown structure, mobile burger, CSS) repeated across 28 files rather than shared.
- **Motion keyframes:** **52 distinct `@keyframes` names** found across the bundle, several of which are functionally duplicate implementations of the same effect under different names (e.g. Footer's `dkrFtBreathe`/`dkrFtScan`/`dkrFtTwinkle`/`dkrFtDrift`/`dkrFtPulse` are a full parallel copy of the page-level `bpLive`/`bpScan`/`bpGlint`/`bpDrift` system, just namespaced `ft-` instead of `bp-`).
- **Font-loading `<link>` block:** the identical Google Fonts preconnect + stylesheet `<link>` trio is repeated in every file's `<helmet>` rather than centralized.
- **Google-Fonts + base reset CSS:** near-identical `* { box-sizing: border-box; }`-style resets repeated per file.

## 3. Shared sections (already conceptually shared, worth preserving the intent of)

- **Footer + Cookie Consent + Search** are the only three surfaces the prototype's own tooling treats as importable, reusable components (via `<dc-import>`). This is a strong signal from the original design process about what the team already considered "shared" — Sprint 2 should treat these as the first and highest-confidence extraction targets.
- **About section** (5 sub-pages: About hub, Our Story, Vision & Mission, R&D Center, Quality & Sustainability) shares nav/footer/DES consistently and is the most internally consistent multi-page section in the bundle — a good reference for how a real "section" of CMS-driven pages should share layout.
- **Newsroom + Article** share a real data dependency (`news-data.js`) — this is the closest thing to a working "content model" already in the prototype and should map directly onto the News CMS data model (see `docs/CMS_DATA_MODELS.md`).

## 4. Repeated styles (beyond component-level duplication)

- **Color/spacing/typography values** are hardcoded per element everywhere; no CSS custom properties exist in the project layer at all (only in the unrelated, ignored `_ds/` folder). Every one of the palette values documented in `project/CLAUDE.md` is repeated as a literal hex string dozens to hundreds of times across the 31 files.
- **`clamp()` values** for section padding and hero/heading type scale are repeated verbatim (e.g. `clamp(64px,9vw,128px)`) rather than defined once.
- **Button hover-lift + shadow-glow interaction** (`transform:translateY(-Npx)` + colored box-shadow) is reimplemented per button-family rather than shared.
- **Card hover-lift** (`translateY(-6 to -10px)` + border/shadow change) is reimplemented per card-family rather than shared.

## 5. Technical debt (architecture-relevant, not visual)

1. **Runtime dependency on a proprietary template interpreter.** Every page requires `support.js`, which itself lazy-loads React/ReactDOM/Babel from `unpkg.com` at runtime purely to interpret the `{{ }}`/`<sc-for>`/`<sc-if>`/`<dc-import>` template format. None of this survives into the real build — it is 100% replaced by whatever real framework Sprint 2 selects.
2. **No design tokens.** Zero CSS custom properties exist at the project level — this blocks any theming, dark/light variant work, or CMS-driven style control until tokens are introduced (§8 of `CLAUDE.md`).
3. **No componentization at the framework level.** Aside from the three `<dc-import>`-based fragments, there is no code-level component reuse — everything else is copy-paste-and-modify.
4. **Inconsistent mobile-menu mechanism.** Roughly 14/31 files use a CSS-only checkbox toggle, 14/31 use a JS `toggleMenu()` state pattern — these need to converge on one real implementation.
5. **Confirmed bugs to fix during (not before) componentization, not preserve:**
   - `Decor Article.dc.html`'s desktop nav is missing the NEWSROOM dropdown present in its own mobile menu.
   - `Decor Home.dc.html` has two conflicting nav-collapse breakpoints (780px inline vs. 1180px in `<helmet>`) targeting the same selector.
   - `[data-reveal]` starts at `opacity:0` in Home and Privacy, contradicting the documented motion rule.
   - Career's wizard reinvents `.wiz-*` form classes instead of reusing `.f-*`, a direct violation of the prototype's own stated reuse rule.
6. **No accessibility scaffolding.** No `role="dialog"`/`aria-modal` on any overlay; several mouse-only interactions (Export's map hover, Article's gallery); zero `<img>` dimensions; inconsistent favicon/OG-tag coverage across pages.
7. **No build tooling, no tests, no tokens, no lint config** exist anywhere in the project — all of this is net-new infrastructure work for Sprint 2, not something to migrate.
8. **Unrelated inert content in the repo** (`project/_ds/ilk-hecem-design-system-.../`) — a different, unrelated kindergarten-branding design system bound into this workspace. Confirmed unreferenced by any `.dc.html` file. Recommend removing it from the working tree in a future housekeeping commit (out of scope for this sprint, since this sprint makes no file changes to `project/`).

## 6. What this audit does NOT do (explicitly out of scope for Sprint 1)

- No files were moved, renamed, merged, or deleted.
- No CSS was extracted, consolidated, or rewritten.
- No components were created in code.
- No visual output was touched in any way.

This report exists purely to inform the sequencing and scope of Sprint 2 (Architecture implementation) and beyond, per the roadmap in [`docs/ARCHITECTURE_ROADMAP.md`](ARCHITECTURE_ROADMAP.md).
