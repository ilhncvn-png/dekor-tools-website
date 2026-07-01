# PROJECT_BOARD.md

Simple sprint-level board for the Dekor Tools website rebuild. Updated at the start/end of each sprint.

---

## DONE

- **Sprint 1 — Architecture Foundation**: development constitution (`CLAUDE.md`), structural audit, 10-phase roadmap, folder architecture plan, CMS data models, admin panel modules, API strategy, translation strategy, performance targets.
- **Sprint 2 — Component Architecture**: full component inventory (`docs/COMPONENT_ARCHITECTURE.md`) and 7-phase extraction plan (`docs/COMPONENT_EXTRACTION_PLAN.md`) — documentation only, no code changed.
- **Sprint 2.5 — Foundation Cleanup**: design-token audit, CSS architecture audit, responsive audit, motion audit, SEO foundation audit, accessibility audit, and a prioritized foundation roadmap categorizing every finding by when it's safe to act on — documentation only, no code changed.

## IN PROGRESS

- **Sprint 3 — Shared Layout System Extraction**: first real code sprint. Extracted a shared `Decor Header.dc.html` component (nav/dropdowns/search-trigger/mobile-toggle-button) and wired it into the 6 pages using the JS-toggle mobile menu (Home, Newsroom, Support, Become a Dealer, Contact, Career) via the project's existing `<dc-import>` mechanism. The 6 pages using the CSS-checkbox mobile menu (Products, Category, Product Detail, Manufacturing, Export, About) are queued for a follow-up pass — see the Sprint 3 report for the specific technical reason (CSS sibling-selector coupling between the checkbox and its `.mobile-menu` needs a verified children-slot approach first). Footer, Search, and Cookie Consent were already shared via the prototype's own tooling — no work needed there. No commit has been made; changes await approval.

## NEXT

- **Sprint 4 — Hero and Visual System Extraction**
- **Sprint 5 — Product System Extraction**
- **Sprint 6 — Content Systems**
- **Sprint 7 — React / Next.js Migration**
- **Sprint 8 — CMS**
- **Sprint 9 — Admin Panel**
- **Sprint 10 — Deployment**
