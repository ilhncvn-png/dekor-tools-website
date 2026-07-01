# ACCESSIBILITY_AUDIT.md

**Sprint 2.5 — Foundation Cleanup.** Audit-only, nothing modified. Extends the accessibility findings already logged in `docs/PROJECT_ANALYSIS.md` §10 and `docs/COMPONENT_ARCHITECTURE.md`/`CLAUDE.md` §13 with direct, quantified verification across all 31 files.

---

## 1. Heading hierarchy

- **28 of 31 files have an `<h1>`.** The 3 without one (`Decor Cookie Consent`, `Decor Footer`, `Decor Search`) are the component fragments, not real pages — appropriate, since a fragment shouldn't own a page-level heading; verify this holds once these are extracted as real components rather than full HTML documents (a `<h1>` absence is only correct in a fragment context, not in a standalone page).
- Deeper hierarchy correctness (whether `<h2>` follows `<h1>` without skipping to `<h3>`, whether every section has exactly one appropriate heading level) was **not exhaustively verified per page in this pass** — flagged as a follow-up check to run per-page during Sprint 3 component extraction, when each page's heading structure will be re-authored anyway.

## 2. Landmark regions (semantic HTML)

Direct counts across all 31 files:

| Landmark | Count | Assessment |
|---|---|---|
| `<header>` | 28 | Present everywhere expected |
| `<nav>` | 28 | Present everywhere expected |
| `<main>` | **0** | **Missing from every single page** — a real, systemic gap |
| `<footer>` | 1 | Correct — only the Footer component itself uses it; other pages import it |
| `<section>` | 100 | Heavily used for content blocks |
| `<article>` | **0** | Not used anywhere, including Newsroom/Article pages where it would be semantically appropriate |
| `<aside>` | **0** | Not used anywhere |

**The absence of `<main>` on every page is the single most consequential finding in this audit.** Screen-reader users rely on the `main` landmark to skip repeated nav/header content and jump straight to page content — without it, every page forces assistive-technology users to tab or navigate through the full header/nav on every page load. This should be treated as a correction to make during componentization (adding `<main>` around each page's primary content), not a pattern to preserve.

## 3. Button semantics

**104 real `<button>` elements** vs. **141 `<a>` elements carrying an `onClick` handler** — confirming a real, quantified semantic mismatch: a majority of "click to trigger an action" elements in the bundle are anchor tags rather than buttons. Where an `<a onClick>` genuinely navigates (has a meaningful `href`), this is fine; where it's used purely to trigger JS behavior (toggle a menu, open a modal, submit a step) with no real navigation target, it should be a `<button>` — screen readers and keyboard users get different, less appropriate affordances from a link than a button in that case. **This needs a per-instance review during componentization**, not a bulk conversion, since some of the 141 may be legitimate navigation.

## 4. Link semantics

- **Only 3 `href="#"` placeholder links found** across the entire bundle — a small, manageable number to resolve (each should become either a real anchor target, a `<button>`, or a real href) during componentization.
- External links (`target="_blank"`) were previously confirmed (Sprint 1 research) to consistently carry `rel="noopener"` — no gap found there.

## 5. Focus states

- **Only 12 explicit `:focus` CSS rules exist across all 31 files** — concentrated on form fields (`.wiz-input:focus`, `.f-input:focus`-equivalent patterns), which correctly pair `outline:none` with a replacement `border-color` + `box-shadow` red focus ring (confirmed via direct inspection: `.wiz-input,.wiz-select,.wiz-area{...outline:none...}` is always paired with a matching `:focus` rule restoring visible focus via border/shadow — this is a legitimate, accessible pattern, not a violation).
- **`outline:none` appears in 12 files, exactly matching the 12 `:focus` rule count** — meaning every instance of removing the default outline in this codebase does pair with a replacement focus style. **This is a genuinely well-handled pattern, not a bug** — worth calling out as a strength (see final report).
- **Everything else (nav links, buttons, cards, dropdown items) has no custom focus style at all** — these fall back to the browser's default focus outline, which is accessible but visually inconsistent with the frozen design system's dark, high-contrast aesthetic (a default blue browser outline on a near-black background may have poor contrast in some browsers/OS themes). Not a violation, but a gap worth closing with an intentional, on-brand focus style during componentization.

## 6. Keyboard navigation

- **Confirmed mouse-only interactions** (carried forward from Sprint 1 research, re-flagged here): Export's region-hover distributor map, and Article's gallery/lightbox thumbnails — neither has a confirmed keyboard-operable equivalent in the current markup.
- **Nav dropdowns are hover-triggered** (`.nav-drop:hover .nav-drop-panel`) with no confirmed `:focus-within` equivalent found in the CSS — meaning keyboard users tabbing through nav links may not be able to open a dropdown panel at all today. This is a significant, previously under-emphasized finding: **the entire SALES/NEWSROOM/ABOUT/SUPPORT/CONTACT navigation may not be keyboard-accessible in its current form.**
- **Zero `tabindex` attributes found anywhere** in the bundle — not necessarily a problem (native interactive elements don't need one), but combined with the hover-only dropdown finding above, it suggests keyboard interaction was not a design consideration in the current prototype.

## 7. ARIA opportunities

Current ARIA usage is sparse but not absent: 58 `aria-label` occurrences, 52 `aria-hidden` (likely decorative SVG icons, appropriate use), 2 `aria-roledescription` (both on the hero carousel, appropriate), 1 `aria-checked` (a toggle/switch), plus single instances of `role="switch"`, `role="region"`, `role="group"`. **No `role="dialog"`/`aria-modal` anywhere** — confirmed absent from Search, Cookie Consent, and Product Detail's lightbox, all of which behave as overlay/modal surfaces. This is one of the clearest, most actionable ARIA gaps: these three surfaces need `role="dialog"` + `aria-modal="true"` + focus-trap behavior added during their respective extraction phases (Phase 1 for Search/Cookie Consent, later for the lightbox).

## 8. Color contrast

Not independently re-measured in this pass (would require rendering/computing actual contrast ratios, not just reading source) — carried forward as an open item from `docs/PROJECT_ANALYSIS.md`/`CLAUDE.md` §13: the dark near-black + steel-gray (`#5A6066`) text combination needs explicit WCAG AA contrast verification before Sprint 3 componentization locks in any color-token decisions. Flagged here as a **required check**, not yet performed, rather than a pass/fail finding.

## 9. Images

Re-confirmed from prior audits: all 59 `<img>` tags in the bundle lack explicit `width`/`height` — a CLS and (indirectly) accessibility-adjacent issue (screen-reader/assistive-tech users on slow connections experience unpredictable layout shift alongside sighted users). `alt` text coverage was found to be present on the large majority of images in earlier review, though not re-audited exhaustively field-by-field in this pass.

## 10. `lang` attribute

Confirmed absent from every `<html>` tag in the bundle (see also `docs/SEO_FOUNDATION.md` §9) — a real accessibility gap since screen readers use `lang` to select correct pronunciation rules, not just an SEO signal.

---

## Summary of confirmed findings (this sprint's new evidence)

| Finding | Severity | Status |
|---|---|---|
| No `<main>` landmark on any page | **High** | New finding this sprint |
| Nav dropdowns are hover-only, no confirmed keyboard/focus-within equivalent | **High** | New finding this sprint |
| No `role="dialog"`/`aria-modal` on Search/Cookie Consent/lightbox | Medium | Carried forward, re-confirmed |
| 141 `<a onClick>` vs. 104 `<button>` — likely semantic mismatch in some subset | Medium | New quantified finding this sprint |
| No `lang` attribute on `<html>` anywhere | Medium | New finding this sprint |
| Only 3 `href="#"` placeholder links | Low | New finding this sprint — small, easy fix |
| Focus states removed via `outline:none` without replacement | **None found** — every instance is correctly paired with a `:focus` replacement | Confirmed as a strength, not a gap |
| Mouse-only Export map / Article gallery | Medium | Carried forward, re-confirmed |
| Zero `<img>` width/height | Medium (CLS + a11y-adjacent) | Carried forward |
| Color contrast (dark palette) | Unknown | Not yet measured — required check flagged |

No HTML, CSS, or JS was modified to produce this document.
