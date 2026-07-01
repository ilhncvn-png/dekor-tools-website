# Decor (DEKOR) Website — Project Rules

**The homepage `Decor Home.dc.html` is the MASTER design reference for the entire ecosystem.**
Every new/edited page must match it exactly on: design language, spacing system, grid
alignment, typography hierarchy, color balance, interaction patterns, and brand identity.
When in doubt, open the homepage and copy the pattern rather than inventing a new one.

## Pages (keep nav + footer identical across all)
`Decor Home` · `Decor Products` · `Decor Manufacturing` · `Decor About` ·
`Decor Contact` · `Decor Complaint` (Submit Your Complaint) · `Decor Career` ·
`Decor Idea` (I Have an Idea). Export is the dedicated `Decor Export.dc.html` page (cinematic world-map hero, interactive distributor map, animated KPIs, why-partner cards, export-process timeline, export documents, OEM/private-label, logistics, export stories, final CTA).
`Decor Become a Dealer` = the dealer-onboarding page (hero · why-partner benefit cards ·
requirement spec cards · 6-step process timeline · 7-section application form · final CTA ·
export-team contact). The shared **Become a Dealer** red nav/mobile/footer CTA and all
in-page dealer CTAs now point to `Decor Become a Dealer.dc.html` (no longer `#dealers`).
ABOUT is a 5-page section: `Decor About` (landing/chapter hub) · `Decor Our Story` ·
`Decor Vision Mission` · `Decor RD Center` · `Decor Quality Sustainability` — all share
nav/footer and the Decor Experience System. Reach them via the ABOUT nav dropdown.
NEWSROOM is a 2-page section: `Decor Newsroom` (landing — hero, category filter chips
All/News/Trade Shows/Training Academy/Company Life, search + year + sort, editorial card
grid) · `Decor Article` (premium article — hero image, meta, share, body, gallery+lightbox,
related, prev/next, back). Both pull from the shared `news-data.js` module (`ARTICLES`,
`CATEGORIES`, `CATEGORY_COLORS`, `formatDate`); article is opened via `Decor Article.dc.html#<slug>`.
Category colors: News red `#D32027`, Trade Shows blue `#0095DA`, Training Academy green
`#1F8A5B`, Company Life gold `#B8851F`. Reach via the ABOUT dropdown (NEWSROOM) + footer.
Old categories map: Announcements→News, Trainings→Training Academy, Trade Shows→Trade Shows,
Organizations→Company Life (dealer meetings, factory visits, events, awards, social, stories).

## Nav system (shared, on every page)
Order: PRODUCTS · MANUFACTURING · EXPORT · SALES▾ · NEWSROOM▾ · ABOUT▾ · SUPPORT▾ ·
CONTACT▾ · | · **Become a Dealer** (red button). Compact mono links: 11px,
letter-spacing 1.6px, gap 22px. **ABOUT and CONTACT are premium dropdowns** (`.nav-drop` /
`.nav-drop-panel`): dark glass panel, 2px red top border, mono label + description per item
and a red `.ndi-tick` that grows on hover; blue `▾` caret rotates. **NEWSROOM is a
first-class dropdown** (between SALES and ABOUT, 300px) = LATEST NEWS (#news), TRADE SHOWS
(#trade-shows), TRAINING ACADEMY (#training-academy), COMPANY LIFE (#company-life); the
Newsroom landing reads the hash on load to pre-filter. ABOUT panel = ABOUT DEKOR,
OUR STORY, VISION & MISSION, R&D CENTER, QUALITY & SUSTAINABILITY, CAREER, I HAVE
AN IDEA (306px wide; NEWSROOM is NOT here anymore). CONTACT panel
= CONTACT, SUBMIT YOUR COMPLAINT.
Collapses to a full-screen mobile menu at `max-width:1180px` (Home uses the JS toggle;
inner pages use a CSS-only `#navtoggle` checkbox + `.mobile-menu`). Forms use `.f-input`/
`.f-select`/`.f-area`/`.f-file` with a red focus ring; submit swaps to an inline success
panel (no backend). Reuse these classes — don't reinvent.

## Design system (premium industrial — Direction B "Forged" + Direction A grid)
- **Colors:** near-black `#0E0F11`, charcoal `#1A1C1F` / panel `#16181b`, footer `#0a0b0c`;
  light surfaces white `#fff`, mist `#F4F5F6`, concrete `#E6E8EB`, border `#E2E5E9`;
  steel text `#5A6066`, muted `#8A9097`.
- **Power accent (primary):** Decor red `#D32027` — CTAs, diagonal hero slash, headline
  punctuation, active states, section eyebrows on light bg (`#ff7a72` for eyebrows on dark bg).
- **Secondary technical color:** corporate blue `#0095DA` — ONLY for blueprint/grid lines,
  technical markers, export-map nodes/arcs, engineering labels, small UI indicators
  (counters, scroll dot, nav-arrow hover). Never a primary CTA or large fill.
- **Type:** display + body = **Archivo** (700–900 for headings, tight tracking
  `-0.03em`); technical eyebrows, product codes, stats, labels = **IBM Plex Mono**
  (uppercase, wide tracking). Min slide/large text never tiny; body ~14–19px.
- **Layout:** max-width 1280px; section padding `clamp(64px,9vw,128px)` vertical,
  `clamp(20px,5vw,64px)` horizontal. Hairline borders, 2–3px radius (sharp, industrial),
  4px colored top-accent bar on cards. Tinted/dark shadows, no soft pastel.
- **Rhythm:** alternate dark and light sections for cinematic pacing.
- **Motion:** scroll-reveal (rise+fade), animated counters, hover lift on cards
  (`translateY(-8px)`), product-image zoom, mono eyebrow with a short red tick rule.
  IMPORTANT: drive entrances with **@keyframes transform-only** (or JS), never opacity
  that starts at 0 — resting state must be visible so content survives any environment
  that freezes animations. Respect `prefers-reduced-motion`.
- **Interaction patterns to reuse:** fixed nav that turns solid on scroll, FAQ accordion,
  filterable product grid, carousel with mono prev/next + progress, region-hover map.

## Brand / logo (single source of truth — never redraw or recolor)
- Official assets: `uploads/decor_logo_white.png`, `uploads/decor_logo_color.png`,
  `uploads/decor_logo_black.png` (stacked wordmark + diamond, ~square).
- Dark background → **white**; light background → **color** or **black**; pick best contrast
  on photos. Nav ~46px tall, footer ~56px, mobile menu ~74px. Favicon = color logo.
- Replace any placeholder logo with the correct official asset automatically.

## Hero banner system (CMS-ready)
Hero is a rotating banner module. Each banner = one admin record in `bannerData()` with:
`id · order · active · publishDate · eyebrow/headline · subheadline · ctaPrimary{text,link}
· ctaSecondary{text,link} · productCode · imageLabel (desktop/mobile image slot) ·
backgroundStyle (bg + gridColor) · technicalLabels · accentDetail`. Render loops over
active banners sorted by order. Keep this structure for easy CMS/admin wiring later.

## Decor Motion Language (PERMANENT — applies to every page automatically)
The site must feel quietly *alive* through engineering precision — never flashy/decorative.
Apple precision · Porsche confidence · Leica restraint.
- **Living blueprint:** every dark blueprint-grid overlay gets `.bp-live` (slow ~11s opacity
  "breathing"). Sprinkle `.bp-scan` (a slow blue `#0095DA` scan line, 16–22s), `.bp-glint`
  (twinkling intersection dots), and `.bp-particle` (drifting micro-particles) into signature
  dark sections (hero, manufacturing, final CTA, future dark sections). All blue, all subtle,
  `z-index:1` behind content, `pointer-events:none`.
- **Scroll:** sections come alive on entry via the existing `[data-reveal]` rise+fade with
  staggered detail — handcrafted, never dramatic.
- **Hover:** product/engineering objects transform blueprint→premium render with premium easing
  (`cubic-bezier(.2,.7,.2,1)`), staggered spec chips, pulsing blue markers, lift + soft shadow.
- **Spec cards (`.spec-card`):** the WHY-DEKOR pattern — white industrial specification cards
  with a `.spec-accent` top bar (scaleX-draws on reveal), `.spec-bp` blueprint overlay (fades
  in on hover), a line-art engineering icon, a CAD code chip + number, material/testing
  annotation rows, a `.why-draw` precision track ending in a pulsing `.spec-node`, and a process
  `.spec-chip`. Reuse for any "engineering commitments / spec" grid.
- **Architectural section transitions (NO gradients/fades — permanently forbidden):** between a
  light section and the next dark one, NEVER a hard cut AND never a gradient/black-fade/white-fade/
  fog/smoke/blur/glow/vignette/shadow/overlay transition. Build the connection ONLY from structure:
  pull the next section up over the previous one by ~100–150px (negative `margin-top` + `z-index`),
  and run continuous vertical `.seam-guide` lines at matching x (e.g. 16/50/84%) that cross the
  crisp edge — they descend (`bottom:0`) out of the light section and continue (`top:0`) into the
  dark one at the same x, with the blueprint grid aligned and a small `DATUM · SECTION x` marker.
  The seam edge stays crisp and intentional (a blueprint datum), never softened. If a visitor
  notices a transition *effect*, it is wrong — the best transition is invisible structural flow.
  (The old `.arch-bridge`/`.des-bridge` gradient bridges are deprecated; replace them with this
  overlap+guide pattern as pages are touched.)
- **Rules:** motion never competes with content; blue only for engineering activity (scan/
  glints/markers/CAD), red stays the emotional power color; ALWAYS honor `prefers-reduced-motion`
  (motion-language keyframes are disabled there) and keep resting state fully visible (entrances
  transform-only, never opacity-from-0). Keyframes live in `<helmet>`; reuse the `.bp-*` classes.

## Decor Experience System (DES) — PERMANENT, governs every page
The site is ONE continuous cinematic industrial film, never a stack of separate blocks.
Four layers always work together: (1) Decor Design Language, (2) Decor Motion Language,
(3) Section Transition System, (4) Information Architecture (homepage inspires / dedicated
pages tell the full story).
- **Never cut between sections, and NEVER fade between them.** Gradients, black/white fades, fog,
  smoke, blur, glow, vignette, shadow- and overlay-transitions are permanently forbidden site-wide.
  Connect adjacent sections with STRUCTURE only: layout overlap (next section pulled up ~100–150px
  via negative `margin-top` + `z-index`), continuous `.seam-guide` vertical lines crossing the edge
  at matching x, aligned blueprint grid, and editorial spacing. The boundary may be a crisp
  blueprint datum line, but never a soft/faded one.
- **Color storytelling (bg carries narrative, doesn't just separate):** dark =
  engineering / precision / manufacturing / technology / export-infrastructure;
  white = clarity / products / transparency; red = action / growth / dealer network.
- **Atmosphere:** `.des-atmos` (slow `dkrSpinSlow` conic blue+red sweep, `z-index:0`,
  `pointer-events:none`) adds optical depth to signature dark sections (e.g. the export
  globe). Reuse the `.bp-*` and `.des-*` classes; honor `prefers-reduced-motion`.
- Homepage = premium trailer (concise, curiosity-driven previews that link out);
  dedicated pages = full documentary. Apply this split as pages are built: Products,
  Export, About, Dealer Network, Sustainability.

## Build conventions
- Single `.dc.html` per page; load fonts in `<helmet>`, inline styles only, helper
  classes in `<helmet>` only for hover/keyframes. English copy.
- Reuse the exact nav + footer markup from the homepage on every page.
- Imagery: intentional labeled placeholder panels (mono product codes, "IMAGE SLOT");
  swap real photos later. CSS/abstract industrial visuals where possible.
- The bound İlk Hecem (kindergarten) design system is intentionally **ignored** for this
  project — its adherence warnings are expected.

## Facts (from public company data — verify certs/dealer terms before publishing)
Founded 1964 (Hasdemir brothers), part of Hassan Group; Gebze/Kocaeli · İstanbul;
21,000 m² facility; 400+ products; exports to 60 countries / 4 continents;
phone +90 262 658 30 10; export@dekortools.com. Product families: Painting, Plaster &
Render, Spatulas & Scrapers, Measurement, Insulation, Surface Prep.
