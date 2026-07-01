# MOTION_SYSTEM.md

**Sprint 2.5 — Foundation Cleanup.** Audit-only, no animation modified. Documents every motion category requested for this sprint and recommends a unified system, building on the motion findings already logged in `docs/PROJECT_ANALYSIS.md` §7, `docs/ARCHITECTURE_AUDIT.md`, and `docs/COMPONENT_ARCHITECTURE.md`.

---

## 1. Hover animations

- **Buttons:** `transform:translateY(-Npx)` lift + colored box-shadow-glow appears across all ~6 button class families (`.dkr-btn`, `.ck-btn`, `.ft-btn`, `.mapbtn`, `.pcta`, `.cta-arrow`), each with its own hand-authored transition timing (`.25s`–`.4s` range, no shared value).
- **Cards:** `translateY(-6px to -10px)` + border/shadow change on hover, independently implemented across all 12+ card families (see `docs/CSS_ARCHITECTURE.md` §4).
- **Nav dropdown items:** `.nav-drop-item:hover` triggers a background tint, the `.ndi-tick` red tick growing from 0 to 16px width, and label color shift to full white — consistent across all 28 files with dropdowns.
- **Nav caret rotation:** `.nav-drop:hover .nav-caret{transform:rotate(180deg)}` — consistent, simple, low-risk.

## 2. Button transitions

Standard pattern: `transition: transform .25-.4s ease, box-shadow .25-.4s ease` (sometimes `background`/`border-color` added for ghost variants). Timing values cluster around `.3s`/`.28s`/`.25s` (see `docs/DESIGN_TOKEN_SYSTEM.md` §8) without a single shared "button transition" value — each family's authors picked a close-but-not-identical number.

## 3. Slider / carousel transitions

- **Home's hero banner carousel:** `aria-roledescription="carousel"`, JS-driven pause-on-hover/resume, progress-dot navigation, prev/next controls — the only JS-orchestrated carousel in the bundle (see `docs/COMPONENT_ARCHITECTURE.md` §5).
- **`.fam-grid` mobile carousel:** pure CSS `scroll-snap-type:x mandatory` + `scroll-snap-align:center`, no JS — a fundamentally different, simpler mechanism from the hero carousel (see §19 of `COMPONENT_ARCHITECTURE.md`; these should remain two separate systems, not be unified into one generic carousel abstraction).
- **Product Detail's lightbox/gallery:** uses dedicated `lbFade`/`lbIn` keyframes (fade + scale-in) for image transitions — a third, distinct motion pattern from either carousel above.

## 4. Search animations

Search (`Decor Search.dc.html`) has its own dedicated keyframes, `srchFade` (backdrop fade-in) and `srchPop` (panel scale/translate-in) — confirmed via direct grep, not shared with any other overlay/modal pattern in the bundle. This is a reasonable, self-contained motion treatment but represents another independent implementation of the general "overlay enter" pattern that Cookie Consent and Product Detail's lightbox each also reimplement separately (`lbFade`/`lbIn` for the lightbox) rather than sharing one `<OverlayTransition>` treatment.

## 5. Dropdown animations

`.nav-drop-panel` transitions `opacity .28s ease, transform .28s cubic-bezier(.2,.7,.2,1), visibility .28s` from `translateY(10px)` (hidden) to `translateY(14px)` (visible) on hover — consistent across all 28 files with dropdowns, using the project's signature `cubic-bezier(.2,.7,.2,1)` premium easing curve (documented in `project/CLAUDE.md`'s hover interaction language). This is one of the most consistently-implemented motion patterns in the entire bundle — low risk, high confidence for direct componentization.

## 6. Scroll animations

- **`[data-reveal]` rise+fade-on-scroll:** present in 28 of 31 files. **Confirmed contradiction (carried forward from `docs/PROJECT_ANALYSIS.md` §7):** the master reference `Decor Home.dc.html` and `Decor Privacy.dc.html` both start `[data-reveal]` at `opacity:0`, directly contradicting `project/CLAUDE.md`'s own documented rule that entrances must be transform-only and never start at `opacity:0`. This remains unresolved and is flagged again here since it's squarely a motion-system concern.
- **`.bp-scan` scan-line sweep**, **`.bp-glint` twinkling dots**, **`.bp-particle` drifting particles**, **`.bp-live` breathing opacity** — the blueprint motion layer, present with varying coverage (28/28/28/18 files respectively per `docs/ARCHITECTURE_AUDIT.md`), all driven by CSS `@keyframes` running continuously (not scroll-triggered) once a dark section is in view — technically an "ambient" animation layer, not a scroll-driven one, despite living alongside scroll-reveal content.
- **`.seam-guide`/`.seam-wrap`** structural section-transition system (5+ files, naming split — see prior audits) includes scan-line and datum-marker motion tied to the transition zone between sections.

## 7. Hero effects

- **Rotating banner carousel** (Home only) — see §3.
- **Red diagonal slash panel** (Home only) — three stacked `clip-path` polygon layers with a JS-driven parallax `transform: translate(calc(var(--px,0) * Npx), 0)`, transitioning smoothly (`.4s ease`) as the bound `--px` custom property changes. This is the **highest-fidelity-risk motion effect in the entire bundle** (see `docs/COMPONENT_ARCHITECTURE.md` §6) — both because it's a one-off implementation with nothing to cross-check against, and because the parallax binding mechanism (whatever sets `--px` — likely a pointer-move or scroll listener in Home's component script) has not yet been traced in full.
- **`.des-atmos` conic sweep** (`dkrSpinSlow`, 13 files) — slow rotating blue+red conic gradient used as ambient atmosphere on signature dark sections (Export globe, etc.).

## 8. Motion coverage & consistency summary

| Pattern | Files | Consistency |
|---|---|---|
| `.bp-live`/`.bp-scan`/`.bp-glint` | 28/31 | High — same keyframe names/timing intent everywhere present |
| `.bp-particle` | 18/31 | **Gap** — a third of pages with the other blueprint classes lack particles |
| `.seam-guide` / `.seam-wrap` | 5 + a few (naming split) | **Inconsistent naming**, same concept |
| `.des-atmos` | 13/31 | Partial — reasonable if intentionally limited to "signature" sections, unconfirmed |
| `data-reveal` | 28/31 | High presence, but **contradicts its own documented rule** on 2+ files (likely more, unverified) |
| `prefers-reduced-motion` | **31/31 (72 total blocks)** | **Full coverage — the strongest, most consistent motion practice in the whole bundle** |
| Footer's parallel `.ft-*` system | 1 (by design, footer-only) | Functionally duplicates `.bp-*` under a different name |

## 9. Recommended unified motion system (not implemented)

- **One shared keyframe set** replacing the 52 distinct names found in `docs/ARCHITECTURE_AUDIT.md` — canonical `breathe`, `scan`, `twinkle`, `drift`, `pulse` keyframes used by both the page-level blueprint layer and the footer (retiring the separate `ft-*`/`dkrFt*` set).
- **One shared "overlay enter" transition** (fade + scale/translate-in) used by Search, Cookie Consent, and Product Detail's lightbox instead of three independent implementations (`srchFade`/`srchPop`, Cookie Consent's own, `lbFade`/`lbIn`).
- **One shared hover-lift utility** (`translateY` + shadow) parameterized by color (red/dark/blue glow) for buttons and cards alike, replacing the ~18 independent implementations found across `docs/CSS_ARCHITECTURE.md` §3/§4.
- **Resolve the `opacity:0` vs. transform-only contradiction as a deliberate decision, not a silent fix** — this is explicitly called out as a decision point in `CLAUDE.md` §9 and `docs/COMPONENT_EXTRACTION_PLAN.md` Phase 3; restated here as this sprint's motion-specific finding.
- **Keep the hero carousel and `.fam-grid` scroll-snap carousel as two distinct systems** — do not force a single generic carousel abstraction over both, since their underlying mechanisms (JS-orchestrated vs. pure-CSS) are genuinely different.
- **Preserve `prefers-reduced-motion` coverage exactly as-is** — this is the one motion area with zero findings against it; any unified system must carry this forward at 100% coverage, not regress it while consolidating keyframes.

No animation, transition, or timing value was changed to produce this document.
