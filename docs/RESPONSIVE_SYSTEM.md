# RESPONSIVE_SYSTEM.md

**Sprint 2.5 — Foundation Cleanup.** Audit-only, no responsive behavior modified. Verifies Desktop/Laptop/Tablet/Mobile behavior across the current bundle and documents breakpoint usage precisely (file counts confirmed via grep, not estimated).

---

## 1. Breakpoint inventory (confirmed usage counts)

All `@media` queries in the bundle are `max-width` — **zero `min-width` queries exist anywhere**, confirming a desktop-first, cascading-override responsive strategy (carried forward from `docs/PROJECT_ANALYSIS.md`, re-verified here).

| Breakpoint | Files using it | Likely role |
|---|---|---|
| **1180px** | **28 of 31** | **Canonical, load-bearing nav-collapse breakpoint** — universal, must never change |
| **920px** | 18 | Strong secondary breakpoint — reads as the de facto "tablet" step (two-column grid collapses, mid-size layout adjustments) |
| 560px, 680px, 780px | 10 each | Common "mobile" adjustments (single-column collapse, font-size steps) |
| 980px | 8 | Minor layout adjustment tier, close to 920/1080 — possible redundancy to review |
| 720px, 760px | 6 each | Section-specific mobile tweaks |
| 620px | 5 | Section-specific |
| 1080px | 5 | Close to both 920px and 1180px — possible redundant intermediate step |
| 860px | 4 | Section-specific |
| 640px, 960px | 3 each | Narrowest usage — likely single-section, single-page adjustments |

**Observation:** 920px and 1180px together account for the large majority of meaningful layout changes; the remaining 11 breakpoints are mostly narrow, page/section-specific fine-tuning rather than a deliberate, shared responsive scale. 980px/1080px sitting so close to 920px/1180px is worth a design-side review during Sprint 3+ to confirm whether they're intentionally distinct steps or accidental near-duplicates (e.g. a designer nudging a breakpoint by 60–100px in one file without updating others).

## 2. Desktop (≥1180px)

Full nav (`.dkr-navlinks`) visible, dropdowns hover-triggered, multi-column grids at their widest `minmax()` step. This is the "designed-first" viewport — every page's primary layout is authored for this range and other breakpoints are overrides against it (consistent with the desktop-first/max-width-only strategy). No issues found specific to this tier.

## 3. Laptop (~920–1180px)

This is the tier where the **920px breakpoint** does most of the real work — grid column counts typically step down here (e.g. 4-column → 2 or 3-column), and some type-scale `clamp()` curves reach their mid-range values. **Risk found:** because 920px and 1180px are independently authored per file rather than from a shared scale, some pages may apply their "laptop" adjustment slightly before or after others hit nav-collapse at 1180px, creating a brief window (920–1180px) where different pages' layouts feel inconsistent in density relative to each other. Not a bug in any single page, but a cross-page consistency risk worth checking visually across a representative page sample before Sprint 3 componentization locks in a single shared breakpoint set.

## 4. Tablet (~680–920px)

Handled by a cluster of close breakpoints (760/780/860/920px) that likely represent several different pages' independent attempts at the same "tablet" adjustment. **Hidden layout risk identified:** with 4 distinct, closely-spaced breakpoints all doing conceptually the same job, a future shared breakpoint token (per `docs/DESIGN_TOKEN_SYSTEM.md`) that consolidates them to one value (e.g. 780px) could shift layout timing by up to 140px for whichever pages currently use 860px or 920px — this must be visually verified per page before consolidating, not assumed safe by default.

## 5. Mobile (≤680px)

Handled by 560/620/640/680px, plus the universal 1180px nav-collapse (mobile inherits the nav-collapsed state from well above true mobile widths, which is intentional — the mobile menu covers the full laptop-to-phone range, not just phone widths). Specific mobile-only patterns confirmed:
- `.fam-grid` (Home's product-family grid) switches to a horizontal scroll-snap carousel at ≤640px (`overflow-x:auto; scroll-snap-type:x mandatory`).
- Grid collapses to single/double column via `grid-template-columns:1fr !important` (47 occurrences) or `:1fr 1fr !important` (18 occurrences) — both `!important`-based overrides, a direct symptom of the desktop-first authoring approach (see `docs/CSS_ARCHITECTURE.md` §6).
- Connector/divider lines rotate orientation at ≤760px (e.g. `.dlr-jline{transform:rotate(90deg)}`) — a deliberate, working adaptation, not a bug.

## 6. Duplicated media queries

Beyond the breakpoint-value duplication in §1, the actual *rule bodies* inside `@media` blocks show the same pattern as the rest of the CSS architecture (`docs/CSS_ARCHITECTURE.md`): each file's `@media(max-width:1180px){...}` block independently re-declares `.dkr-navlinks{display:none !important}` / `.dkr-burger{display:flex !important}` rather than sharing one nav-responsive rule — confirmed present in the same form across all 28 files that have it.

## 7. Inconsistent breakpoints (confirmed instance)

**`Decor Home.dc.html` itself contains two different nav-collapse breakpoints targeting the same selector** (carried forward from `docs/PROJECT_ANALYSIS.md`, re-confirmed in this audit): an inline rule at 780px earlier in the file's cascade, and the standard `<helmet>`-level rule at 1180px later in the cascade, both targeting `.dkr-navlinks{display:none}`. The 1180px rule wins today only because CSS cascade order favors the later declaration — this is fragile (a future edit that reorders the file's `<style>` block could silently break Home's nav-collapse behavior) and should be flagged for correction (not fixed) — removing the redundant 780px rule is a same-file, zero-visual-risk change once componentization begins, since 1180px already governs the actual behavior.

## 8. Hidden layout risks

1. **The 920/980/1080/1180px cluster** (§1) risks accidental collision or unintended overlap if any one value is adjusted in isolation during future work — treat all four as related and cross-check together, not independently.
2. **`!important`-heavy mobile overrides** (§5/§6) make it harder to introduce a shared grid/spacing component later without carefully checking specificity — a naive componentized `<Grid>` that doesn't also apply `!important` at the right breakpoint could silently fail to override a desktop-first base style inherited from elsewhere.
3. **No `min-width` queries exist**, meaning there is no verified "mobile is the true default" baseline anywhere in the bundle — every mobile presentation today is an override of a desktop base, which is workable but riskier to refactor safely than a mobile-first base would be (an override that fails to fire silently falls back to desktop styling on a small screen, rather than failing safe).
4. **Touch-specific behavior** (`.fam-grid`'s `-webkit-overflow-scrolling:touch` + scroll-snap) has only been verified by reading CSS, not by testing on a real touch device — flagged in `docs/COMPONENT_EXTRACTION_PLAN.md` Phase 4 as needing on-device verification before extraction.

## 9. Recommendation (not implemented)

- Adopt a mobile-first (`min-width`) responsive strategy going forward (already recommended in `CLAUDE.md` §14), replacing the current max-width-only cascade.
- Consolidate the 13 raw breakpoints into a smaller named scale (candidate: `sm 560 / md 780 / lg 920 / xl 1180`, absorbing the closely-spaced outliers 620/640/680/720/760/860/960/980/1080 into the nearest named step) — **only after** visually verifying each affected page at both its current breakpoint and the proposed consolidated one, per the risk noted in §4.
- Fix Home's redundant 780px nav-collapse rule during Sprint 3 componentization of the Header (already scoped as a "specific fix to apply" in `docs/COMPONENT_EXTRACTION_PLAN.md` Phase 1).
- Keep 1180px exactly as-is — it is correct, universal, and load-bearing.

No responsive behavior, breakpoint value, or layout was changed to produce this document.
