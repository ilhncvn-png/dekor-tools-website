# CSS_ARCHITECTURE.md

**Sprint 2.5 — Foundation Cleanup.** Audit-only, no CSS modified. Documents the current CSS architecture's duplication patterns across all 31 `.dc.html` files, building on `docs/ARCHITECTURE_AUDIT.md` (Sprint 1) and `docs/COMPONENT_ARCHITECTURE.md` (Sprint 2) with CSS-specific measurement.

---

## 1. Overall shape of the CSS

- **No external stylesheet exists anywhere in the project.** All styling is either (a) inline `style="..."` attributes, or (b) a single `<style>` block per file inside its `<helmet>`, used only for rules that can't be expressed inline (hover states, pseudo-elements, `@keyframes`, `@media` queries).
- **32 `<style>` blocks total** (one per file, including the two component fragments Footer/Search and the Hero Directions artifact) — confirms zero shared stylesheet.
- **6,631 total inline `style="..."` attributes** across the bundle — this is the dominant styling mechanism by a wide margin, not the `<style>` blocks.

## 2. Duplicated utility classes

- **Blueprint motion utility classes** (`.bp-live`, `.bp-scan`, `.bp-glint`, `.bp-particle`, `data-reveal`) are independently re-declared in **every file's own `<style>` block** rather than defined once — confirmed in `docs/ARCHITECTURE_AUDIT.md`; re-verified here as a CSS-authoring pattern, not just a component-duplication issue. This means a single motion-timing tweak today requires editing up to 28 files.
- **Footer's parallel motion system** (`.ft-live`/`.ft-scan`/`.ft-glint`/`.ft-particle` + 7 dedicated `dkrFt*` keyframes) duplicates the same utility concept under a different prefix rather than reusing `.bp-*`.
- **52 distinct `@keyframes` names** found across the bundle (confirmed in Sprint 1's audit) — several are functionally identical effects (breathing, scanning, twinkling, drifting) reimplemented per surface (page-level `bp-` prefix vs. footer's `ft-` prefix vs. several page-specific names like `cadPulse`, `respScan`, `pcScan`, `wizIn`) rather than one shared utility vocabulary.

## 3. Repeated button styles

At least **six parallel class families** implement the same "raised, colored, hover-lift" button pattern: `.dkr-btn` (`-red`/`-dark`/`-ghost`/`-ghostlight`), `.ck-btn` (Cookie Consent's own set), `.ft-btn` (Footer's own set), `.mapbtn`, `.pcta`, `.cta-arrow`, plus smaller one-off variants (`.share-btn`, `.icon-btn`, `.carbtn`, `.lb-btn`). Each family re-declares its own hover transform/shadow rules rather than sharing one base. This is the single largest CSS-duplication opportunity identified across two sprints of auditing (see `docs/COMPONENT_ARCHITECTURE.md` §13).

## 4. Repeated card styles

**12+ card class families** (`.spec-card`, `.ncard` family, `.dl-card`/`.dlcard`, `.cat-card`, `.prodc`/`.pcard`/`.rcard`/`.feat-card`, `.ofc-card`, `.val-card`, `.ben-card`, `.b2-card`, `.appcard`, `.ch-card`, `.ck-card`, `.logi-card`, `.sup-card`/`.sup-tile`) each independently implement the same core interaction idiom: hover-lift (`translateY(-6px to -10px)`) + border-color or shadow change on hover. No shared base card style/mixin exists — every family owns its own copy of this idiom's CSS.

## 5. Repeated section spacing

Confirmed in `docs/DESIGN_TOKEN_SYSTEM.md` §5: the documented section-padding token (`clamp(64px,9vw,128px)` per `project/CLAUDE.md`) is actually implemented as **at least 10 distinct near-duplicate `clamp()` curves** across the bundle, each hand-typed per section rather than referencing one shared value. This is a direct CSS-architecture consequence of having no shared stylesheet or token file — every section's padding was authored independently.

## 6. Repeated grids

`display:grid` appears **111 times**. `grid-template-columns` shows real, likely-intentional variety for different content densities (`repeat(auto-fit,minmax(150-330px,1fr))` across a dozen distinct minmax widths for different card sizes) — this variety is probably legitimate, not pure drift, since different sections show genuinely different content shapes. However, `auto-fit` vs. `auto-fill` is used inconsistently for visually similar-looking grids (both appear at nearly identical minmax widths in different files), suggesting these decisions weren't made against a shared rule and should be reconciled into one `<Grid columns minWidth mode="fit|fill">` component during extraction rather than preserved as ad hoc per-section choices.

Two responsive-override patterns recur frequently and are worth naming as utilities once componentized: `grid-template-columns:1fr !important` (47×, single-column mobile collapse) and `grid-template-columns:1fr 1fr !important` (18×, two-column mobile/tablet collapse) — both rely on `!important` to override a desktop-first base rule, a direct consequence of the project's max-width-only, desktop-first responsive strategy (see `docs/RESPONSIVE_SYSTEM.md`).

## 7. Repeated typography styles

- Only **one dedicated "eyebrow" class name found** (`.b-eyebrow`, single occurrence) despite the eyebrow/mono-label pattern (small uppercase IBM Plex Mono label with wide tracking, often paired with a short red tick rule) appearing visually dozens of times across the bundle — nearly every other instance is a one-off inline `style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:...` repeated by hand rather than a shared class. This is a clear, low-risk extraction candidate: a single `.eyebrow`/`<Eyebrow>` utility would consolidate a huge number of the 1,616 instances of `font-size:11px` documented in `docs/DESIGN_TOKEN_SYSTEM.md`.
- Heading styles (Archivo, 700–900 weight, negative letter-spacing) are consistently authored inline per heading rather than via a shared `.h1`/`.h2`-style utility class, contributing directly to the 90 distinct `clamp()` font-size curves found in the token audit.

## 8. Repeated transitions

- `transition: ... .3s ease` (and near-variants at `.28s`/`.25s`) recur as the de facto "standard" interactive transition across buttons, cards, nav dropdowns, and form fields — but each declaration is authored inline/per-rule rather than via one shared transition utility or custom property, which is why the token audit found 20 distinct duration values instead of a clean 2–3-step scale.
- Hover-lift transforms (`transform:translateY(-Npx)`) are paired with individually-authored shadow transitions per component family (see §3/§4) rather than a shared `.hoverable`/`.liftOnHover` utility.

## 9. What this means architecturally

The project currently has **zero CSS abstraction layer** — no shared stylesheet, no utility-class system, no CSS custom properties, no preprocessor, no CSS-in-JS. Every visual repetition identified above exists purely because the prototype was authored page-by-page with copy-paste-and-modify as the primary reuse mechanism. This is expected and appropriate for a design-tool export (per `docs/PROJECT_ANALYSIS.md`'s framing of this bundle), but it means **any future componentization work (Sprint 3+) is also, by necessity, the first time this project will have shared CSS at all** — there is no existing partial system to build on top of; the token system (`docs/DESIGN_TOKEN_SYSTEM.md`) and component library (`docs/COMPONENT_ARCHITECTURE.md`) must be built from scratch, informed by (but not copy-pasted from) the patterns documented here.

No CSS was modified to produce this document.
