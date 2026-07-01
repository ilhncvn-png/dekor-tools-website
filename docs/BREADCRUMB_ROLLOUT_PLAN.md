# BREADCRUMB_ROLLOUT_PLAN.md

**Sprint 3 — Shared Layout System Extraction.** Documentation only — no breadcrumb markup was added to any page this sprint, per the sprint's instruction to document rollout candidates rather than implement them (breadcrumbs are not currently duplicated shared markup, so there is nothing to "purely extract").

---

## Pages with breadcrumbs today

**None.** Direct verification (`grep -li "breadcrumb" *.dc.html` across all 31 files) returns zero matches. There is no existing breadcrumb implementation, duplicated or otherwise, anywhere in the current codebase. This was already flagged in `docs/COMPONENT_ARCHITECTURE.md` §12 during Sprint 2 — re-confirmed here before this sprint's extraction work, unchanged.

## Pages missing breadcrumbs

All 28 real pages lack breadcrumbs. The pages where breadcrumbs would add the most navigational value (deep, nested, or cross-linked content) are:

| Page | Depth from Home | Breadcrumb value |
|---|---|---|
| Decor Product Detail.dc.html | Home → Products → Category → Product Detail | High — deepest, most-nested content type |
| Decor Category.dc.html | Home → Products → Category | High |
| Decor Article.dc.html | Home → Newsroom → Article | High — matches the site's own hash-based category/article navigation |
| Decor Dealer Profile.dc.html | Home → Sales → Authorized Dealers → Dealer Profile | Medium-high |
| Decor Our Story.dc.html / Vision Mission / RD Center / Quality Sustainability | Home → About → (sub-page) | Medium — About hub already provides this context via its own landing page |
| Decor Support.dc.html (deep-linked sections: #downloads, #faq, etc.) | Home → Support → (section) | Low — same page, anchor-based, not a true page hierarchy |
| Decor Products.dc.html, Decor Manufacturing.dc.html, Decor Export.dc.html | Home → (page) | Low — only one level deep, breadcrumb would be redundant with the nav itself |

## Recommended rollout

Since breadcrumbs are net-new UI (not an extraction of existing duplicated code), rollout should happen **after**, not during, this sprint's layout extraction — specifically once real nested routing exists (Sprint 7, React/Next.js migration) rather than being retrofitted onto the current flat `.dc.html` file structure. Recommended order when that time comes:

1. **Product Detail + Category** (Phase 4 of `docs/COMPONENT_EXTRACTION_PLAN.md` — Product cards/family cards) — highest navigational value, and this phase already touches these pages' shared structure.
2. **Article** (Phase 6 — News/Dealer/Support cards) — same reasoning, natural to add while that phase is already touching Newsroom/Article.
3. **Dealer Profile** (also Phase 6).
4. **About sub-pages** (Our Story, Vision & Mission, R&D Center, Quality & Sustainability) — lower priority since the About hub page already orients visitors; add opportunistically.
5. Single-level pages (Products, Manufacturing, Export, Support, Contact, Career, legal pages) — do not need breadcrumbs; skip.

## Risk level

**Low technical risk, but zero-reuse value in the current codebase.** Because no breadcrumb markup exists anywhere to extract or consolidate, building `<Breadcrumbs>` is 100% new design + engineering work, not a safe mechanical extraction like Header/Footer/Search. Two risks to flag explicitly before implementation begins in a future sprint:

1. **No existing visual treatment to match.** Whoever implements this must get explicit design sign-off on typography, spacing, and separator styling — inventing it ad hoc during engineering work would violate this project's "do not redesign" constraint by introducing a new, undesigned UI pattern.
2. **URL/slug structure isn't stable yet.** The current site uses flat `.dc.html` filenames, not a real nested URL scheme — breadcrumb `href`s built against today's flat structure would need to be rebuilt again once Sprint 7's routing migration happens. Building breadcrumbs before that migration risks throwaway work.

**Recommendation: defer breadcrumb implementation until Sprint 7 (React/Next.js migration) or later**, once real nested routes exist, rather than building it against the current flat file structure.
