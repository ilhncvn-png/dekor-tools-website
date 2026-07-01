# DESIGN_TOKEN_SYSTEM.md

**Sprint 2.5 — Foundation Cleanup.** Audit-only: documents every raw value currently in use across the 31 `.dc.html` files (counted directly via grep, not estimated) and recommends a unified token system. **No tokens are implemented in this sprint.**

---

## 1. Colors

**Canonical palette** (from `project/CLAUDE.md`, confirmed still dominant by usage count): white `#fff` (1029×), Decor red `#D32027` (672×), corporate blue `#0095DA` (487×), near-black `#0E0F11` (365×), steel `#5A6066` (135×), border `#E2E5E9` (120×), black `#000` (99×), dark-bg eyebrow red `#ff7a72` (81×), muted `#8A9097` (70×), panel `#16181b` (61×), mist `#F4F5F6` (42×).

**Duplication/drift found — near-black has at least 5 distinct hex values in circulation** where the design system specifies one:
| Value | Count | Likely role |
|---|---|---|
| `#0E0F11` | 365 | canonical near-black (`CLAUDE.md`) |
| `#0e0f11` | 11 | same color, inconsistent case |
| `#0b0c0e` | 20 | a slightly different near-black, used for hero backgrounds |
| `#0a0c0f` | 13 | another near-black variant |
| `#11171d` | 10 | another near-black-adjacent variant |

**Additional undocumented grays in circulation** (not listed in `CLAUDE.md`'s palette but used repeatedly): `#C7CCD1` (49×), `#3a4045` (32×), `#F0F2F4` (29×), `#ECEEF1` (29×), `#9aa1a8` (16×), `#2b2f34` (15×), `#EEF0F2` (14×), `#0a0c0f`/`#26292d`/`#1d2730`/`#11171d` (10× each). These read as intermediate shades between the documented tokens (e.g. between steel `#5A6066` and border `#E2E5E9`) rather than new brand colors — likely legitimate interpolated shades, but currently **hardcoded ad hoc rather than derived from a scale**.

**Rare/likely-unintentional outliers:** `#8d1115` (21×, a darker red — possibly a pressed/active state of `#D32027` never formalized as a token), `#1F8A5B` (7×, matches the "Training Academy green" news category color from `CLAUDE.md`), `#3fae6b` (4×, close to but not identical to `#1F8A5B` — worth confirming whether this is an unintentional near-duplicate of the Training Academy green).

**RGBA usage:** heavy reliance on `rgba(255,255,255, N)` (white at 20+ distinct opacity steps: .03/.04/.05/.06/.08/.1/.12/.16/.3/.4/.45/.5/.55/.6/.7/.8/.85) and `rgba(0,149,218,N)`/`rgba(211,32,39,N)` (blue/red at similarly fragmented opacity steps) rather than a fixed opacity scale — see §9.

**Recommendation (not implemented):** define one canonical set of color tokens (`--color-near-black`, `--color-steel`, `--color-red`, `--color-red-active` (formalizing `#8d1115` if confirmed intentional), `--color-blue`, plus the neutral gray scale actually observed in use) and a small fixed **alpha scale** (e.g. 4/8/12/16/24/35/45/55/70/85%) that every `rgba()` usage maps onto, rather than the ~30+ ad hoc opacity values found today.

## 2. Typography scale (font sizes)

**129 distinct `font-size` values found** (90 of which are `clamp()` fluid expressions). This is the single most fragmented token category in the audit.

Fixed (non-fluid) sizes, most-used: 11px (1616×, by far the dominant mono-label size), 15px (268×), 12px (227×), 10px (178×), 16px (156×), 8px (139×), 9px (87×), 9.5px (83×), 13px (75×), 14px (66×), 15.5px (37×), 20px (35×), 12.5px (33×). Half-pixel values (9.5px, 12.5px, 15.5px, 10.5px, 14.5px, 16.5px, 13.5px, 8.5px, 11.5px) appear **21 times total across 8 distinct half-step values** — almost certainly unintentional drift from a design tool's fractional export rather than deliberate half-pixel steps in a type scale.

Fluid (`clamp()`) sizes: 90 unique curves, many near-duplicates of each other, e.g. hero-scale headings alone use `clamp(34px,6vw,72px)`, `clamp(40px,6.4vw,86px)`, `clamp(46px,8vw,112px)` — three different curves all serving what appears to be the same "large section headline" role on different pages. Mid-scale headings show the same pattern: `clamp(28px,3.8vw,50px)`, `clamp(30px,4vw,52px)`, `clamp(28px,3.6vw,46px)`, `clamp(28px,4vw,54px)`, `clamp(28px,3.4vw,46px)`, `clamp(30px,4.5vw,54px)`, `clamp(30px,3.4vw,46px)`, `clamp(28px,3.8vw,48px)` — **eight distinct curves for what is very likely one intended "H2" role**, each reinvented per page/section rather than shared.

**Recommendation (not implemented):** define a fixed type scale of ~8–10 named steps (e.g. `--text-xs` through `--text-hero`), each with one canonical `clamp()` curve, and migrate every near-duplicate curve onto the nearest canonical step during Sprint 3+ componentization — **do not average or "fix" these values now**, since a wrong choice would visibly change text size; this must be a deliberate, reviewed decision per step, not an automated sweep.

## 3. Font weights

Clean and consistent — only **6 distinct values in use**: 900 (192×), 800 (110×), 700 (176×), 600 (211×), 500 (35×), 300 (1× — a single outlier, worth confirming intentional vs. a typo, since `project/CLAUDE.md` documents 700–900 for headings and doesn't mention 300 anywhere). This is the **cleanest token category found** — a `--font-weight-*` set of 5 values (400/500/600/700/800/900, treating the single 300 instance as a flagged outlier to review, not a token) would capture current usage with almost no drift.

## 4. Line heights

**31 distinct values found**, dominated by `1` (296×, used for tight mono labels/eyebrows), then 1.6 (57×), 1.75 (28×), 1.35 (28×), 1.55 (27×), 1.2 (27×), 1.02 (19×), 1.5 (16×). Long tail of single-use or near-duplicate values (0.86, 0.88, 0.9, 0.92, 0.94, 0.95, 0.96, 0.98 all appear as distinct values, almost certainly meant to be the same "tight display heading" line-height reinvented per instance). Recommend consolidating to ~5 named steps (`--leading-tight` ~0.9–1, `--leading-snug` ~1.2, `--leading-normal` ~1.5–1.6, `--leading-relaxed` ~1.7–1.8), reviewing the sub-1 cluster together since those are most likely unintentional drift rather than deliberate distinct values.

## 5. Spacing values

**Section vertical padding** (documented in `CLAUDE.md` as `clamp(64px,9vw,128px)`) actually appears as **at least 10 distinct near-duplicate curves** in practice: `clamp(64px,9vw,120px)` (16×, most common), `clamp(56px,7vw,104px)` (7×), `clamp(64px,9vw,130px)` (6×), `clamp(64px,9vw,128px)` (6× — the literal documented value, a minority usage), `clamp(72px,9vw,128px)` (5×), `clamp(72px,9vw,120px)` (5×), `clamp(56px,8vw,110px)` (5×), `clamp(56px,8vw,100px)` (5×), plus several more single-digit-count variants. **The documented token is not actually the most-used value** — a real finding worth flagging to whoever owns the design system.

**Horizontal section padding** is more consistent: `clamp(20px,5vw,64px)` appears as the second component of nearly every padding shorthand found above — this half of the token is genuinely unified already.

**Gap values:** 3px (626×, likely a specific tight-gap use, e.g. icon-to-label), 6px (160×), 12px (124×), 10px (92×), 8px (73×), 14px (73×), 18px (59×), 22px (50×, matches the documented nav-link gap), 16px (43×), 13px (35×), plus a long tail down to 1px. Broadly consistent with an implicit 2px-multiple scale (2/4/6/8/10/12/13/14/16/18/20/22/24...) but never formalized as one.

**Container/content max-widths:** `1280px` (111×, the documented site container — consistently used, a strong point), `1180px` (36×, the nav-collapse breakpoint reused as a content width in some contexts), then a long tail of content-specific widths (540, 920, 680, 780, 760, 560, 880, 980, 720, 520, 1080, 1000, 820px) that likely represent genuine per-content-block sizing (e.g. article body width vs. form width vs. card-grid width) rather than drift — worth cataloging as a small set of named "content-width" tokens rather than assuming they should collapse to one value.

**Recommendation (not implemented):** formalize a spacing scale (base unit ~2px, steps at minimum 2/4/6/8/10/12/14/16/18/20/22/24/32/40/48/56/64px) and a small set of named section-padding and content-width tokens — but treat the "which clamp() curve is canonical" decision for section padding as a design-review question, not an engineering one, since `CLAUDE.md`'s documented value is a minority of actual usage.

## 6. Border radius

**Cleanest structural token besides font-weight** — only 8 distinct values: `2px` (313×, dominant — matches the "sharp, industrial, 2-3px radius" design rule exactly), `50%` (129×, circles/avatars/dots), `3px` (112×), `4px` (14×, matches documented card top-accent-bar thickness, not radius — worth double-checking these aren't conflated), `999px` (8×, pill shapes), `5px`/`6px`/`11px` (single-digit counts, likely outliers to review). Recommend `--radius-sharp: 2px`, `--radius-soft: 3px`, `--radius-pill: 999px`, `--radius-circle: 50%` as the token set, with the 5/6/11px instances flagged for review as probable drift.

## 7. Shadows

**77 distinct `box-shadow` values found** — highly fragmented, though the top few account for meaningful reuse: `0 14px 36px rgba(211,32,39,.5)` (29×, red glow — likely the canonical "red CTA hover shadow"), `0 0 8px rgba(0,149,218,.8)` (28×, blue glow — likely the canonical "blueprint marker glow"), `0 26px 64px rgba(0,0,0,.55)` (27×, dark dropdown/panel shadow), `0 12px 34px rgba(211,32,39,.4)` (12×, a lighter variant of the red glow), `0 10px 34px rgba(0,0,0,.35)` (9×). Beyond the top 5, the long tail (72 more distinct values) is mostly one-off variations in blur radius or opacity of the same 3–4 conceptual shadows (red glow, blue glow, dark elevation, focus ring). Recommend consolidating to ~4–5 named shadow tokens (`--shadow-elevation-sm/md/lg`, `--shadow-glow-red`, `--shadow-glow-blue`, `--shadow-focus-red`) covering the great majority of real usage.

## 8. Animation durations & transition timings

**Transition durations:** 20 distinct values in use, from `.15s` to `1.5s`, with `.3s` (287×), `.25s` (175×), `.4s` (100×), `.5s` (84×), `.28s` (81×) as the top 5 — these read as roughly "fast / base / slow" intent reimplemented with slightly different numbers each time (e.g. `.3s` vs `.28s` vs `.25s` are very likely meant to be the same "base transition speed"). **Animation durations** (from `animation:` shorthand, i.e. the blueprint motion keyframes): 11s (31×, breathing), 6s (29×, twinkle), 18s (24×, scan), 9s (20×, another breathing variant), 60s (10×), plus a long tail — broadly consistent with the documented ~11s breathe / 16–22s scan / 6s twinkle language in `CLAUDE.md`, though not perfectly uniform.

**Recommendation (not implemented):** a `--duration-fast` (~0.2s), `--duration-base` (~0.3s), `--duration-slow` (~0.5s) transition scale, plus fixed `--motion-breathe`, `--motion-scan`, `--motion-twinkle`, `--motion-drift` durations matching the values `CLAUDE.md` already documents — this closes real drift (`.3s`/`.28s`/`.25s` converging to one base value) without touching perceptible timing in any way that would fail a pixel/frame-accurate visual diff, since these differences are generally imperceptible at these magnitudes. **Still requires visual verification before any real implementation**, per this sprint's own pixel-identical mandate — documented as a recommendation only.

## 9. Opacity values

At least 20 distinct static `opacity:` values found (`0`, `1`, `.85`, `.7`, `.55`, `.12`, `.5`, `.9`, `.6`, `.4`, `.92`, `.45`, `.3`, `.18`, `.16`, plus a few single-use outliers), on top of the RGBA-embedded alpha fragmentation noted in §1. These two systems (standalone `opacity` and embedded `rgba()` alpha) currently use **different, uncoordinated value sets** — e.g. opacity uses `.55` while the closest rgba alpha step is `.5` or `.6`. Recommend one shared alpha/opacity scale used by both mechanisms (see §1 recommendation).

## 10. Z-index values

**16 distinct values in use, with no documented layering system**: 0, 1, 2, 3, 4, 5, 6, 60, 80, 99, 100, 120, 130, 140, 150, 200. The low values (0–6) appear to be local stacking within a single section (blueprint motion layers sit at z-index 1, content above at 2–3, etc.) — reasonable as-is. The jump to 60/80/99/100/120–200 appears to correspond to nav dropdowns, mobile menu, search overlay, and modal-like surfaces, but **there is no documented, centrally-defined z-index scale** — a new overlay added later could easily collide with an existing value. Recommend formalizing a named scale (e.g. `--z-content: 1-10`, `--z-nav: 100`, `--z-dropdown: 60`, `--z-overlay: 150`, `--z-modal: 200`) mapped onto current real usage, without changing any current stacking behavior.

## 11. Breakpoints

Confirmed (carried forward from `docs/PROJECT_ANALYSIS.md`, still accurate): **560, 620, 640, 680, 720, 760, 780, 860, 920, 960, 980, 1080, 1180px**, all `max-width`, zero `min-width` queries anywhere. **1180px is the canonical, load-bearing nav-collapse breakpoint** and must never change. The remaining 12 values are section/component-specific fluid-layout adjustments — see `docs/RESPONSIVE_SYSTEM.md` for the full breakpoint-by-breakpoint audit.

---

## Overall recommendation: one unified token system (not implemented this sprint)

A single token source (CSS custom properties, framework-agnostic) covering:
- **Color:** ~10 base colors + one shared alpha scale (replacing ~30+ ad hoc rgba opacity values)
- **Type:** ~9 fluid type-scale steps (replacing 90 clamp() curves) + weight scale (already clean, 5 values) + line-height scale (~5 named steps, replacing 31 values)
- **Space:** one spacing scale (~16 steps) + named section-padding and content-width tokens
- **Radius:** 4 tokens (already nearly clean)
- **Shadow:** 5 named tokens (replacing 77 values)
- **Motion:** 3 transition-duration tokens + 4 named animation-duration tokens
- **Z-index:** 1 named layering scale (replacing 16 ad hoc values)
- **Breakpoints:** the 13 existing values, formalized as named breakpoint constants, with 1180px flagged as immutable

This system should be **built and adopted incrementally during Sprint 3+ component extraction** (per `docs/COMPONENT_EXTRACTION_PLAN.md`), never as a single bulk find-and-replace — each value's migration to a token must be visually verified individually, since several near-duplicate values found here may turn out to be intentional (e.g. the content-width tail, the two distinct near-blacks) rather than drift, and only a human/design review can make that call reliably.
