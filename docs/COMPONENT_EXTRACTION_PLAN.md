# COMPONENT_EXTRACTION_PLAN.md

**Sprint 2 — Component Architecture.** This defines *when* and *how* each component candidate from `docs/COMPONENT_ARCHITECTURE.md` should be extracted in a future sprint. **No extraction happens in this sprint** — this is a sequencing plan only, to be executed once the framework decision (Phase 1 exit criterion in `docs/ARCHITECTURE_ROADMAP.md`) is made.

## Ground rules for every phase (non-negotiable, all phases)

1. **Visual parity is the acceptance criterion, not a nice-to-have.** Every extracted component must be screenshot-diffed against its current `.dc.html` source at 320/768/1024/1440px before merge, per the team's web-testing rules.
2. **Extract structure first, fix confirmed bugs during the same change, not before or after.** Where `docs/ARCHITECTURE_AUDIT.md`/`COMPONENT_ARCHITECTURE.md` names a confirmed bug (e.g. Article's missing NEWSROOM dropdown), the extraction PR is the place to fix it — call it out explicitly in the PR description.
3. **Never merge two visually-different implementations into one component silently.** If two pages' "same" component differ in an unreviewed way, stop and confirm intent before consolidating (see Support's `.sup-card`/`.sup-tile` ambiguity, or Product cards' three variants).
4. **One phase, one PR (or small PR set) at a time.** Do not start Phase N+1 extraction until Phase N is merged and visually verified — this keeps the risk surface small and rollback easy.
5. **No phase touches typography, color, spacing, motion timing, or layout values.** Extraction changes *where code lives*, never *what it produces on screen*.

---

## Phase 1 — Header, Footer, Search

**Includes:** Header/Nav shell, Dropdown menus, Mobile menu trigger, Footer (+ its independent `.ft-*` motion system reconciled into the shared motion layer), Search Command Center, Cookie Consent banner.

**Why first:** highest duplication count (nav repeated across 28 files), and Footer/Search/Cookie-Consent are *already* componentized in the prototype's own `<dc-import>` mechanism — this phase has the most existing structural support and the least ambiguity.

**Specific fixes to apply during this phase (not before):**
- Resolve Article's missing desktop NEWSROOM dropdown.
- Converge the dual mobile-menu mechanism (checkbox vs. JS toggle) on one implementation.
- Reconcile Footer's `.ft-*` motion classes into the shared `.bp-*`-equivalent motion layer.

**Exit criteria:** one `<Header>`, one `<Footer>`, one `<SearchOverlay>`, one `<CookieConsentBanner>` used by every migrated page; zero remaining page-level duplicate nav/footer markup for any page touched in this phase; visual diff clean at all 4 standard breakpoints.

---

## Phase 2 — Buttons, Breadcrumbs, CTA sections

**Includes:** `<Button>` (consolidating `.dkr-btn`/`.ck-btn`/`.ft-btn`/`.mapbtn`/`.pcta`/`.cta-arrow`/`.share-btn`/`.icon-btn`/`.carbtn`/`.lb-btn`), `<CTASection>`, and **new** `<Breadcrumbs>` (does not exist in the current prototype — see note below).

**Why second:** simple, low structural risk, and unlocks consistent CTA usage for every later phase (Hero, Product, Forms all embed buttons/CTAs).

**Specific work required:**
- Diff all button-family hover/shadow/color values against each other **before** consolidating, to distinguish true duplicates (merge) from intentional variants (keep as named `variant` props).
- Breadcrumbs has **no existing implementation to extract from** — this is new UI work, not a port. Do not build it ad hoc; confirm the visual treatment with whoever owns design before shipping, since nothing in the frozen design system currently specifies it.

**Exit criteria:** one `<Button>` component covering every confirmed variant; one `<CTASection>` used wherever the pattern currently repeats under different class names; `<Breadcrumbs>` built and design-approved (used only where new nested routing needs it — not retrofitted onto every page).

---

## Phase 3 — Hero sections and the red diagonal system

**Includes:** `<HeroSection>` shell (rotating + static variants), Home's banner carousel logic (pause/resume/progress-dots), and — extracted **last** within this phase — the red diagonal slash panel (`clip-path` polygons + JS parallax binding).

**Why third:** meaningfully more complex than Phases 1–2 (generalizing a carousel that only exists on one page today), so it's sequenced after the team has practice doing visual-parity verification on simpler components.

**Specific risk mitigation:**
- Build and verify the **static-hero variant first** (used by the majority of pages), then the **rotating variant** (Home only), before touching the diagonal slash panel.
- For the diagonal slash panel: preserve `clip-path` polygon coordinates character-for-character; trace the `--px` custom-property parallax binding from Home's component script exactly; verify with pixel-diff screenshots at multiple scroll/pointer positions (not a single static screenshot), and confirm `prefers-reduced-motion` disables the parallax transform, not just slows it.

**Exit criteria:** every migrated page's hero renders from `<HeroSection>`; Home's carousel behavior (autoplay, pause-on-hover, progress dots, keyboard control) is verified equivalent or better than the prototype; the diagonal slash panel is pixel-identical across at least 3 scroll positions and 2 viewport widths.

---

## Phase 4 — Product cards and product family cards

**Includes:** `<ProductCard variant="featured|grid|related">` (consolidating `.prodc`/`.pcard`/`.rcard`/`.feat-card`), `<ProductFamilyCard>` + `<FamilyGrid>` (consolidating Home's `.dkr-fam`/`.fam-*` and Category's `.cat-card` where they represent the same underlying concept), and the `.fam-grid` mobile scroll-snap carousel.

**Why fourth:** depends on the Products/Categories CMS data shape being settled (from Sprint 1's `CMS_DATA_MODELS.md`) even though this phase itself ships no CMS — components should be built to accept that data shape from day one so Phase 4 of the architecture roadmap (real Products CMS integration) is a drop-in later, not a rewrite.

**Specific work required:**
- Confirm with design whether the three current product-card visual treatments (`prodc`/`pcard`/`rcard`+`feat-card`) are intentionally distinct densities (→ become named variants) or drift to converge (→ pick one, get explicit sign-off) — do not decide unilaterally.
- Verify `.fam-grid`'s scroll-snap behavior on a real touch device, not just a resized desktop browser window.

**Exit criteria:** `<ProductCard>` and `<ProductFamilyCard>` used everywhere the current class families appear; variant decisions documented in this file (append a note); mobile scroll-snap carousel verified on-device.

---

## Phase 5 — Forms

**Includes:** `<FormField>` (consolidating `.f-*` and Career's `.wiz-*`), `<MultiStepForm>` wrapper (Become a Dealer, Career), file-upload/drag-and-drop zones, per-step validation, review-step assembly.

**Why fifth, deliberately after four simpler phases:** this is the highest functional-complexity group in the entire plan — real client-side state and logic, not just markup — so it's sequenced once the team has extraction experience from Phases 1–4.

**Specific work required:**
- Trace Career's component class (state, `addEdu()/addExp()/addLang()`, `next()/prev()/submit()`, drag/drop handlers) in full before attempting extraction — a markup-only port will silently drop functionality.
- Decide and document whether `.wiz-*` is retired in favor of `.f-*` (recommended, closes a confirmed rule violation) or kept as a deliberate dense-wizard variant.
- Since **no form in the current prototype has a real backend** (all swap to an inline success panel), this phase's scope is the *frontend component* only — real submission handling is separately scoped in Architecture Roadmap Phases 5 (Dealers) and 7 (Support), not this component-extraction phase.

**Exit criteria:** one `<FormField>` component family used by every form; Become a Dealer and Career both run on a shared `<MultiStepForm>` wrapper; Contact's current no-form status is either preserved intentionally or flagged as a scope decision for the product owner (per the open question already logged in `docs/DEVELOPMENT_ROADMAP.md`).

---

## Phase 6 — News, Dealer, Support cards

**Includes:** `<NewsCard>`, `<DealerCard>`, `<SupportCard>` / `<SupportTile>` (pending the two-variant confirmation below), `<CertificateBadge>`.

**Specific work required:**
- Resolve the `.dlcard` naming collision in `Decor Product Detail.dc.html` by reading its actual usage in context — confirm it is **not** a dealer card before reusing the `<DealerCard>` name for it; if it's unrelated (e.g. a download card), name it separately.
- Confirm whether Support's `.sup-card` and `.sup-tile` are two deliberate variants of the same concept or two different components entirely, by direct visual/markup comparison, before deciding on one vs. two components.

**Exit criteria:** `<NewsCard>` used by Newsroom and Article's related-articles section from one shared implementation; `<DealerCard>` used consistently with the naming collision resolved; Support's card/tile question answered and documented.

---

## Phase 7 — Tables and technical product sections

**Includes:** `<SpecTable>` (new semantic build, not a port — see below) and any remaining technical/spec-heavy sections not covered by earlier phases (e.g. Product Detail's CAD-drawing/spec-row areas, Export's technical documents section).

**Why last:** depends on Phase 4 (Products) and Phase 5 (Forms, for any spec-adjacent inputs) being stable, and because it is the one item in this entire plan that is a **rebuild rather than a pure extraction** — no `<table>` element or dedicated table styling exists anywhere in the current codebase; spec content today is styled `<div>` rows.

**Specific work required:**
- Build `<SpecTable rows={[{label, value}]}>` as a genuinely semantic table (or ARIA-grid equivalent), matching the current div-based visual output pixel-for-pixel while correcting the underlying markup to be accessible — per the team's semantic-HTML-first standard.
- Scope this phase's effort accordingly in planning — it will take longer per component than Phases 1–6 because there is no direct 1:1 markup to lift.

**Exit criteria:** every existing "spec table"-shaped content block renders through `<SpecTable>`, is screen-reader-navigable as a real table, and is visually indistinguishable from the current div-based implementation.

---

## What happens after Phase 7

Once all seven phases are complete, `project/` (the `.dc.html` source) is retired from active rendering per `docs/FOLDER_ARCHITECTURE.md`'s planned `project/` → `design-reference/` rename — kept as the permanent pixel-reference baseline, never deleted, per that document's guidance. This plan does not schedule that rename; it is a Sprint 3+ decision once extraction is proven complete and verified page-by-page.
