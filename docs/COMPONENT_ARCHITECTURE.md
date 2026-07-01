# COMPONENT_ARCHITECTURE.md

**Sprint 2 — Component Architecture.** Documentation only: this file catalogs reusable component candidates in the current, frozen HTML/CSS/JS bundle. No components are extracted, no files are modified, no visual output changes as a result of this document. Builds directly on `docs/ARCHITECTURE_AUDIT.md` (Sprint 1) with a deeper, component-by-component pass over the specific candidates requested for this sprint.

Legend for "current duplicated code locations": file names are `project/Decor <Name>.dc.html` unless noted as a shared `<dc-import>` component.

---

## 1. Header / Navigation

- **Purpose:** primary site navigation — brand mark, top-level links, dropdown menus (Sales/Newsroom/About/Support/Contact), Become a Dealer CTA, mobile menu trigger.
- **Appears on:** all 28 real pages (duplicated inline markup, not shared via `<dc-import>` — the only nav-adjacent pieces that *are* shared are Search and Cookie Consent, see below).
- **Duplicated code:** byte-for-byte identical `<nav>` block + `.nav-drop*` CSS repeated in every one of the 28 files. Two different mobile-toggle mechanisms coexist across pages (~14 CSS-only `#navtoggle` checkbox, ~14 JS `toggleMenu()`), not a clean split by page type.
- **Future reusable structure:** `<Header>` composed of `<Logo>`, `<NavLinks>`, `<NavDropdown>` (see below), `<BecomeADealerCTA>`, `<MobileMenuTrigger>`.
- **Props/data needed later:** `activeRoute` (for current-page highlighting, not present in prototype today), `locale` (Sprint-1 translation strategy), `isScrolled` (drives the "solid on scroll" nav treatment), `dealerCtaHref`.
- **Risks before extraction:** the confirmed **nav parity bug** (`Decor Article.dc.html`'s desktop nav is missing the NEWSROOM dropdown present in its own mobile menu) must be resolved as part of extraction, not silently ported. The dual mobile-toggle mechanism must converge on one implementation — decide during extraction, don't carry both forward.
- **Recommended order:** **First** (Phase 1) — highest duplication count, zero visual ambiguity (markup is otherwise consistent), unblocks every other page-level extraction.

## 2. Dropdown menus

- **Purpose:** hover-triggered panels under SALES / NEWSROOM / ABOUT / SUPPORT / CONTACT nav items — dark glass panel, 2px red top border, icon-tick + label + description per item.
- **Appears on:** 28 of 31 files (`.nav-drop` / `.nav-drop-panel` / `.nav-drop-item` / `.ndi-tick` / `.nav-caret`), consistent structure everywhere it's present.
- **Duplicated code:** identical CSS block (`.nav-drop-panel{...}`, hover states) repeated per file; only the *content* (which links appear) varies by dropdown.
- **Future reusable structure:** `<NavDropdown label items={[{label, description, href}]} />` — a single generic component, data-driven, nested inside `<Header>`.
- **Props/data needed later:** `label`, `caretColor` (currently always blue), `items: {label, description, href}[]`, `width` (panels vary 248–306px depending on content).
- **Risks before extraction:** none significant — this is one of the most internally consistent patterns in the whole bundle. The only real risk is accidentally normalizing the Article nav-parity bug *into* the shared component instead of fixing it during extraction.
- **Recommended order:** **First**, alongside Header (Phase 1) — they're structurally inseparable.

## 3. Search Command Center

- **Purpose:** ⌘K/Ctrl+K full-screen search overlay — backdrop, input, grouped results (products/categories/pages/PDFs/news/careers/support/FAQ).
- **Appears on:** `Decor Search.dc.html`, imported via `<dc-import name="Decor Search" hint-size="0,0">` on the same 28 pages as the footer. Already the **most componentized** surface in the bundle (via the prototype's own `<dc-import>` mechanism).
- **Duplicated code:** none at the page level — it's a single source file. Internal duplication: its own `.srch-*` class namespace duplicates form-field styling that exists elsewhere as `.f-*`.
- **Future reusable structure:** `<SearchOverlay>` (trigger + backdrop + focus-trap) containing `<SearchInput>` + `<SearchResultGroup category items>`.
- **Props/data needed later:** live query string, debounced search results per category (backed by the real Search API endpoint from `docs/API_STRATEGY.md` in a later phase — hardcoded `SINDEX` demo data today), `noResults`/`hasResults` state, keyboard nav (arrow keys/`Enter`) — not confirmed present in the prototype and should be added, not assumed.
- **Risks before extraction:** none structural (already a clean single-file component); the only issue is functional — no `role="dialog"`/`aria-modal` today, and the input lacks an explicit `aria-label`. Extraction is the right moment to add both.
- **Recommended order:** **First** (Phase 1) — it's already isolated and self-contained, lowest-risk extraction in the entire audit.

## 4. Footer

- **Purpose:** closing CTA banner + identity/contact + 4 nav columns + company metrics + social row + "live status" strip + legal bar + credits. Also hosts the Cookie Consent banner.
- **Appears on:** `Decor Footer.dc.html`, imported via `<dc-import>` on 28 of 31 pages. Already componentized in the prototype's own tooling.
- **Duplicated code:** none at the page level (single source file). Internally: a **fully parallel, independent copy** of the blueprint motion system under an `.ft-*` prefix (`.ft-live/.ft-scan/.ft-glint/.ft-particle` + 7 dedicated `dkrFt*` keyframes) rather than reusing the page-level `.bp-*` classes/keyframes.
- **Future reusable structure:** `<Footer>` composed of `<FooterCTA>`, `<FooterNavColumns>`, `<FooterMetrics>`, `<FooterSocial>`, `<FooterLegalBar>`, with `<CookieConsentBanner>` nested/portal-rendered from within it (matching current `<dc-import>` nesting).
- **Props/data needed later:** nav column links (from Settings/Pages models), `companyInfo` (Settings model — founding year, facility size, export country count), social links (Settings model), legal links (Pages/legal model).
- **Risks before extraction:** reconcile the `.ft-*` motion duplication into the shared `<BlueprintMotionLayer>` (§9 candidate below) during extraction rather than preserving it as a second implementation.
- **Recommended order:** **First** (Phase 1) — already isolated, same tier as Header/Search.

## 5. Hero sections

- **Purpose:** page-opening section — eyebrow, headline, subheadline, CTAs, background treatment. On Home specifically, a CMS-ready rotating banner (`aria-roledescription="carousel"`, pause/resume on hover, prev/next/progress-dot nav).
- **Appears on:** every page has *some* hero, but implementation is not shared — Home has the only rotating/multi-banner hero; every other page (Manufacturing, Export, Career, Contact, About family, Product Detail, etc.) hard-codes a single static hero inline.
- **Duplicated code:** hero-section CSS (headline clamp() sizing, eyebrow styling, CTA row layout) is re-implemented per page rather than sharing a base `<HeroSection>` shell, even though the visual pattern (eyebrow → headline → sub → CTAs) repeats almost everywhere.
- **Future reusable structure:** `<HeroSection variant="rotating|static" banners? eyebrow headline subheadline ctaPrimary ctaSecondary background>` — one shell component, with Home passing an array of banners and every other page passing a single banner-shaped object.
- **Props/data needed later:** matches the Hero/banner fields already documented in `CLAUDE.md` §"Hero banner system" and `CMS_DATA_MODELS.md`'s Pages model `sections` block: `eyebrow🌐, headline🌐, subheadline🌐, ctaPrimary{text,link}, ctaSecondary{text,link}, productCode, backgroundStyle, technicalLabels, accentDetail`.
- **Risks before extraction:** the rotating-banner logic (pause/resume, progress dots, autoplay timing) only exists on Home today — generalizing it to a shared component is genuinely new engineering work, not a straight port; scope this carefully so a "shared hero" doesn't silently force every static-hero page into carousel behavior it never had.
- **Recommended order:** **Phase 3** (after Header/Footer/Search and Buttons/Breadcrumbs/CTA) — meaningful complexity, but not blocking earlier phases.

## 6. Red diagonal hero panel

- **Purpose:** the layered diagonal red slash treatment behind/within the Home hero — three stacked `clip-path: polygon(...)` divs (`#9c1419` at 50% opacity, `#D32027` at 92% opacity, a faint white sliver), each with a subtle parallax `transform: translate(calc(var(--px,0) * Npx), 0)` tied to pointer/scroll position.
- **Appears on:** confirmed **only in `Decor Home.dc.html`** (lines ~896–898) — not a site-wide pattern despite reading as a signature brand device. `Decor Hero Directions.dc.html` also contains diagonal/clip-path exploration, but that file is a discarded moodboard (see `docs/PROJECT_ANALYSIS.md`), not a real page to extract from.
- **Duplicated code:** none — single occurrence, so no duplication risk, but also no existing second implementation to cross-check pixel values against if extraction introduces a bug.
- **Future reusable structure:** `<DiagonalSlashPanel layers={[{color, opacity, clipPath, parallaxFactor}]} />` — parameterize the three polygon layers and parallax factors exactly as they exist today.
- **Props/data needed later:** `layers[].clipPath` (exact polygon coordinates must be preserved character-for-character), `layers[].color`, `layers[].opacity`, `layers[].parallaxFactor`, `reducedMotion` (must disable the parallax transform, not just slow it).
- **Risks before extraction:** **highest visual-fidelity risk in this entire audit.** `clip-path: polygon(...)` values are extremely sensitive to rounding/unit changes; the parallax transform depends on a CSS custom property (`--px`) set by JS on pointer/scroll — the binding mechanism must be traced exactly (from Home's component script) before extraction, or the slash will visibly misalign. Recommend extracting this **after** general hero componentization (§5) is stable, and verifying with a direct pixel-diff screenshot at multiple scroll/pointer positions, not just a static screenshot.
- **Recommended order:** **Phase 3**, but the *last* item within that phase — do it once the team has practice doing visual-parity verification on two lower-risk hero extractions first.

## 7. Product cards

- **Purpose:** individual product summary tile — image, name, code, material/spec teaser, link to detail.
- **Appears on:** **three different implementations found, not one**: `.prodc` (Home's featured-product carousel only), `.pcard` (Category and Products listing pages), `.rcard`/`.feat-card` (Product Detail's "related products" section). These are visually similar but independently coded.
- **Duplicated code:** hover-lift + border/shadow-accent interaction reimplemented three times under three class names with no shared base.
- **Future reusable structure:** `<ProductCard variant="featured|grid|related" product={Product} />` — one component consuming the Products CMS model (`docs/CMS_DATA_MODELS.md` §1), with `variant` controlling layout density, not a different component per page.
- **Props/data needed later:** `productCode, name, thumbnail, shortDescription, material, href` — all already modeled in `CMS_DATA_MODELS.md`.
- **Risks before extraction:** confirming which of the three current visual treatments is "canonical" requires a design decision (or explicit sign-off that all three are intentionally different densities) before consolidating — don't silently pick one and call the others regressions.
- **Recommended order:** **Phase 4**, alongside product family cards (below) — they share data dependencies (Products/Categories models).

## 8. Product family cards

- **Purpose:** the family/category-level cards on Home (`.dkr-fam`, `.fam-chip`, `.fam-code`, `.fam-dot`, `.fam-render`/`.fam-render-img`) presented in a responsive `.fam-grid` that collapses to a horizontal scroll-snap carousel below 640px (`flex; overflow-x:auto; scroll-snap-type:x mandatory`).
- **Appears on:** `Decor Home.dc.html` only, confirmed via grep — not reused on Products/Category pages, which use `.cat-card` instead for a conceptually similar purpose.
- **Duplicated code:** the family-card visual idiom and `.cat-card` (Category page's own card) are not shared despite representing the same underlying "product family" concept from two different pages.
- **Future reusable structure:** `<ProductFamilyCard family={Category} />` rendered inside a `<FamilyGrid>` shell that owns the responsive grid→scroll-snap-carousel behavior, consumed by both Home and the Products/Category listing.
- **Props/data needed later:** `family.name, family.code, family.description, family.heroImage` — matches Categories model (`CMS_DATA_MODELS.md` §2).
- **Risks before extraction:** the scroll-snap mobile behavior (`.fam-grid` at ≤640px) must be preserved exactly — verify on a real touch device, not just resized desktop browser, since `-webkit-overflow-scrolling:touch` and snap behavior can differ from simulated viewports.
- **Recommended order:** **Phase 4**, together with Product cards.

## 9. Certification cards

- **Purpose:** ISO/CE/etc. certificate display — badge icon + name, shown in a small grid, typically near the end of a trust-building section.
- **Appears on:** confirmed via `.cert-badge`, `.dkr-cert`, `.dkr-cert-ico` classes; primarily Home's "WHY-DEKOR"/certifications section and the Support page's certificate library.
- **Duplicated code:** limited (few occurrences), but the Support page's certificate list and Home's cert badges are not visibly sharing a component today.
- **Future reusable structure:** `<CertificateBadge certificate={Certificate} />` — consumes the Certificates CMS model (`CMS_DATA_MODELS.md` §5) directly, including expiry-date awareness for a future "verified current" indicator (not in the current static prototype, worth flagging as a nice CMS-era enhancement, not a Sprint 2 task).
- **Risks before extraction:** low — small, self-contained visual unit.
- **Recommended order:** **Phase 6**, alongside Support-section extraction (they're contextually coupled on the Support page).

## 10. CTA sections

- **Purpose:** full-width call-to-action bands (e.g. Footer's closing CTA, Online Payment's `.pay-cta`, generic `.pcta`/`.b-ctas` groupings, `.cta-arrow` link style).
- **Appears on:** most pages in some form; class names are page-specific (`pay-cta`, `pcta`, `b-ctas`) rather than a single shared pattern.
- **Duplicated code:** the "headline + one or two buttons, centered, on a dark or red background" pattern repeats across at least 6–8 pages under different class names.
- **Future reusable structure:** `<CTASection headline🌐 subheadline🌐 ctaPrimary ctaSecondary background="dark|red|light" />`.
- **Props/data needed later:** matches the CTA shape already used in the Hero/banner model (`ctaPrimary{text,link}`, `ctaSecondary{text,link}`) — same shape, reusable across Hero and standalone CTA sections.
- **Risks before extraction:** low-to-medium — mostly a naming/consolidation exercise, not a structural risk, since the visual pattern is already consistent even where class names differ.
- **Recommended order:** **Phase 2**, alongside Buttons and Breadcrumbs — simple, low-risk, high duplication-removal value.

## 11. Forms

- **Purpose:** all data-entry surfaces: Contact-adjacent Complaint, Idea, Become a Dealer (large multi-section application), Career (6-step wizard with file upload), Online Payment, Category (filter-adjacent, not a submission form).
- **Appears on:** `.f-input`/`.f-select`/`.f-area`/`.f-file` (+ `.f-label`) genuinely reused across 7 files, **but** Career reinvents its own `.wiz-*` set instead of reusing `.f-*` — a confirmed, direct violation of the prototype's own "reuse these classes" rule (see `docs/ARCHITECTURE_AUDIT.md` §5). Newsroom's similarly-named `.nf-*` are unrelated filter controls, not a form. **`Decor Contact.dc.html` has no form at all** — it only links to Complaint.
- **Duplicated code:** field-styling (red focus ring, label treatment) is duplicated between `.f-*` and `.wiz-*` rather than shared.
- **Future reusable structure:** `<FormField type="text|select|textarea|file" label🌐 name required error />`, plus a `<MultiStepForm steps>` wrapper for Become a Dealer and Career specifically (progress bar, step validation, review step — already a real, if page-specific, pattern in Career's component class).
- **Props/data needed later:** field-level `{label, name, type, required, options?, accept?}`; step-level `{title, hint, fields[]}` for wizards; submission target (real backend per Phase 5/7 of `ARCHITECTURE_ROADMAP.md` — none exists today, all forms currently swap to an inline success panel with no backend).
- **Risks before extraction:** **highest functional-complexity item in this list** — Career's drag-and-drop file zones, per-step validation, and review-step data assembly are genuinely complex client-side logic (not just markup) that must be traced from its component class carefully; a naive markup-only extraction will silently drop functionality. Also decide during extraction whether to unify `.wiz-*` into `.f-*` (recommended) or keep them distinct variants of one shared component.
- **Recommended order:** **Phase 5** — deliberately placed after simpler, lower-risk extractions (Header/Footer/Search, Buttons/CTA, Heroes, Product cards) so the team has extraction experience before tackling the most complex component group.

## 12. Breadcrumbs

- **Purpose:** requested as a component candidate to catalog.
- **Appears on:** **not found anywhere in the current codebase.** Direct search (`grep -li "breadcrumb"` across all 31 files) returned zero matches. This is a **net-new component**, not an extraction candidate — there is no existing prototype implementation to preserve or diff against.
- **Future reusable structure:** `<Breadcrumbs items={[{label, href}]} />`, likely needed once real nested routing exists (Category → Product Detail, About hub → sub-pages, Support → article).
- **Risks before extraction:** none (nothing to extract). Flag for the team: since it doesn't exist today, adding it in a real build is a **new UI element**, not a port — it will need its own design-system-consistent styling decided in collaboration with whoever owns visual design, not invented ad hoc during componentization.
- **Recommended order:** not part of the extraction phases below (nothing to extract) — tracked here for completeness per the sprint's requested audit scope; revisit as new functionality in a later sprint if navigation depth grows.

## 13. Buttons

- **Purpose:** primary/secondary/ghost call-to-action controls, site-wide.
- **Appears on:** essentially every page, under **at least six parallel class families**: `.dkr-btn` (`-red`/`-dark`/`-ghost`/`-ghostlight`), `.ck-btn` (Cookie Consent's own `-ghost`/`-link`/`-red`), `.ft-btn` (Footer's own `-ghost`/`-red`), `.mapbtn`, `.pcta`, `.cta-arrow`, `.share-btn`, `.icon-btn`, `.carbtn`, `.lb-btn`.
- **Duplicated code:** the hover-lift + colored-shadow-glow interaction is reimplemented per family rather than shared — the single most fragmented component category in the entire bundle by class-name count.
- **Future reusable structure:** `<Button variant="primary|dark|ghost|ghostLight|link" icon? size?>` — one component covering every variant found; page-specific families (`ck-`, `ft-`, `mapbtn`, etc.) all map onto this one component with a variant prop.
- **Props/data needed later:** `variant, size, icon, href|onClick, disabled`.
- **Risks before extraction:** low visual risk per-instance, but **high consolidation-scope risk** — six+ families need their exact hover/shadow/color values diffed against each other to confirm which are true visual duplicates (safe to merge) vs. intentionally distinct variants (must become named variants, not deleted). Do this comparison carefully before extraction, not during.
- **Recommended order:** **Phase 2**, first item — highest count, well-understood pattern, unlocks consistent CTAs everywhere else.

## 14. News cards

- **Purpose:** newsroom article summary tile — category tag/color, title, excerpt, date, image.
- **Appears on:** `Decor Newsroom.dc.html` (`.ncard`, `.ncard-acc`, `.ncard-bp`, `.ncard-img`, `.ncard-imginner`, `.ncard-read`, `.ncard-scan`) and referenced from `Decor Article.dc.html`'s "related articles" section.
- **Duplicated code:** internally consistent within Newsroom (one class family), but Article's related-articles cards may reimplement rather than reuse — worth confirming exact markup match during extraction rather than assuming.
- **Future reusable structure:** `<NewsCard article={NewsArticle} />` consuming the News CMS model (`CMS_DATA_MODELS.md` §4), including the category-color mapping (`CATEGORY_COLORS` from `news-data.js`) as a fixed presentation constant.
- **Props/data needed later:** `title🌐, excerpt🌐, category, categoryColor, publishDate, heroImage, slug`.
- **Risks before extraction:** low — well-contained, single-page origin.
- **Recommended order:** **Phase 6**, alongside Dealer and Support cards.

## 15. Dealer cards

- **Purpose:** dealer summary tile (directory listing) and dealer profile teaser.
- **Appears on:** `.dl-card`/`.dl-card-acc` (Authorized Dealers / Become a Dealer context) and a separately-named `.dlcard` (Product Detail's own usage — a naming collision worth noting: `.dlcard` in Product Detail is unrelated to dealer cards, it's Product Detail's own local abbreviation, likely for a "download card" — **verify exact meaning by reading the component script before assuming it's a dealer card**, since class-name grep alone is ambiguous here).
- **Duplicated code:** to be confirmed during extraction — flagged as a **naming-collision risk**, not a confirmed duplication, since `.dlcard` appears in a page (Product Detail) with no dealer content.
- **Future reusable structure:** `<DealerCard dealer={Dealer} />` consuming the Dealers CMS model (`CMS_DATA_MODELS.md` §3).
- **Props/data needed later:** `companyName, logo, tier, country, region, phone, email, slug`.
- **Risks before extraction:** the `.dlcard` naming collision above must be resolved by reading source before extraction — don't assume grep hits are all the same component.
- **Recommended order:** **Phase 6**, alongside News and Support cards.

## 16. Support sections

- **Purpose:** Support hub's tiles/cards — downloads, certificates, catalogs, warranty, FAQ (`.sup-card`/`.sup-card-acc`/`.sup-card-icon`, `.sup-tile`/`.sup-tile-acc`/`.sup-tile-arrow`/`.sup-tile-icon`, `.sup-dl`, `.sup-pop`, `.sup-search`, `.sup-bp`).
- **Appears on:** `Decor Support.dc.html` only — largest single-page class-name surface found in the entire bundle (11 distinct `sup-*` classes), suggesting Support has several genuinely different card/tile treatments within one page rather than one repeated pattern.
- **Duplicated code:** internal to the page; `.sup-card` and `.sup-tile` appear to be two different visual treatments for what may be conceptually similar content — confirm intent (two deliberate variants vs. accidental drift) before consolidating.
- **Future reusable structure:** likely **two** components, not one: `<SupportCard>` and `<SupportTile>`, until proven otherwise by reading the actual page markup difference in detail during extraction.
- **Props/data needed later:** maps to Support Articles, Certificates, and Downloads CMS models depending on which `sup-*` variant backs which content type.
- **Risks before extraction:** medium — the two-variant ambiguity above needs resolving with actual side-by-side inspection, not assumption, before componentizing.
- **Recommended order:** **Phase 6**, alongside News/Dealer/Certification cards.

## 17. Cookie banner

- **Purpose:** consent banner — accept/reject/manage-preferences controls.
- **Appears on:** `Decor Cookie Consent.dc.html`, imported only from within `Decor Footer.dc.html` — already the smallest, most isolated component in the bundle (100 lines).
- **Duplicated code:** none (single source); its own `.ck-*` button/card namespace duplicates concepts covered by the shared Button/Card components once those exist.
- **Future reusable structure:** `<CookieConsentBanner categories preferences onAccept onReject onManagePreferences />`, using the shared `<Button>` component internally rather than its own `.ck-btn` variants.
- **Props/data needed later:** consent categories/config (Settings model's `cookieConsentConfig`), links to Privacy/Cookies pages.
- **Risks before extraction:** none significant — smallest, most self-contained candidate in the whole audit.
- **Recommended order:** **Phase 1**, alongside Header/Footer/Search — trivial to extract cleanly early and get a "win" before tackling harder components.

## 18. Tables

- **Purpose:** requested as a component candidate (e.g. product spec tables, comparison tables).
- **Appears on:** **no literal `<table>` element or dedicated table-style class (`.spec-table`, `.dtable`, etc.) found anywhere in the current codebase** — direct search confirmed zero matches. Product Detail's "spec table" content (mentioned in `docs/PROJECT_ANALYSIS.md`) is implemented as styled `<div>` rows, not a semantic `<table>`.
- **Future reusable structure:** `<SpecTable rows={[{label, value}]} />` — should be built as a **semantic** table (`<table>`/`<th>`/`<td>` or an ARIA-grid equivalent) in the real implementation, correcting the current non-semantic div-based approach rather than porting it as-is (per the team's semantic-HTML-first coding standard).
- **Risks before extraction:** this is effectively a **rebuild, not an extraction** — the current div-based rows must be visually matched pixel-for-pixel while the underlying markup becomes semantically correct, which is more work than a pure extraction and needs explicit scoping.
- **Recommended order:** **Phase 7**, together with technical/product sections it's coupled to.

## 19. Sliders / carousels

- **Purpose:** requested as a component candidate — covers both the Home hero's rotating-banner carousel (see §5) and the `.fam-grid` scroll-snap horizontal carousel on mobile (see §8).
- **Appears on:** confirmed in exactly these two places; no other slider/carousel pattern exists elsewhere in the bundle (Product Detail's gallery is a lightbox/thumbnail-grid pattern, not a continuously-scrolling carousel — verify this distinction during extraction rather than conflating the two).
- **Duplicated code:** none — the two carousel instances are independent implementations (hero uses JS pause/resume/progress-dot state; `.fam-grid` uses pure CSS scroll-snap) and should likely **remain two different components** (`<BannerCarousel>` vs. a scroll-snap behavior baked into `<FamilyGrid>`), not force-unified into one generic carousel abstraction.
- **Risks before extraction:** low for `.fam-grid` (pure CSS, easy to verify); medium for the hero carousel (autoplay timing, pause-on-hover, and accessibility — `aria-roledescription="carousel"` is present today but full keyboard control should be verified/added during extraction).
- **Recommended order:** covered under **Phase 3** (hero carousel, with Hero sections) and **Phase 4** (`.fam-grid`, with Product family cards) respectively — not a standalone phase.

---

## Summary table: recommended extraction order

| Order | Components | Phase (see `COMPONENT_EXTRACTION_PLAN.md`) |
|---|---|---|
| 1 | Header, Nav, Dropdown menus, Search, Footer, Cookie banner | Phase 1 |
| 2 | Buttons, Breadcrumbs (net-new), CTA sections | Phase 2 |
| 3 | Hero sections, Red diagonal hero panel, hero carousel | Phase 3 |
| 4 | Product cards, Product family cards, `.fam-grid` carousel | Phase 4 |
| 5 | Forms (including Career's multi-step wizard) | Phase 5 |
| 6 | News cards, Dealer cards, Support sections, Certification cards | Phase 6 |
| 7 | Tables (rebuild), remaining technical/product sections | Phase 7 |

## Highest-risk components (flagged for extra care during future extraction)

1. **Red diagonal hero panel** — `clip-path` polygon precision + JS-driven parallax binding; single occurrence, no cross-check available.
2. **Forms / Career wizard** — genuine client-side logic complexity (multi-step state, drag-and-drop, validation), not just markup.
3. **Dealer card `.dlcard` naming collision** — must be read and confirmed, not assumed from class name alone.
4. **Tables** — effectively a rebuild (div-rows → semantic table) rather than a pure extraction.
5. **Support sections' two-variant ambiguity** (`.sup-card` vs `.sup-tile`) — needs manual confirmation of intent before consolidating.
