# API_STRATEGY.md

**Documentation only — no implementation in this sprint.** Defines the future REST API surface backing the CMS (`CMS_DATA_MODELS.md`), Admin Panel (`ADMIN_PANEL_MODULES.md`), and eventual third-party integrations. Endpoint shapes are indicative; adjust to the concrete CMS/framework chosen in Phase 1.

---

## Conventions

- **Versioned base path:** `/api/v1/...` — never break v1 consumers silently; introduce `/api/v2/` for breaking changes.
- **Resource naming:** lowercase-plural-kebab, matching `CLAUDE.md` §11 (`/products`, `/dealers`, `/news-articles`, `/support-articles`).
- **Locale handling:** either a `?locale=tr` query param or an `Accept-Language` header, resolved server-side against the `Languages` model's `isActive`/`fallbackLocale` — every public read endpoint must support this.
- **Response envelope** (per the team's own API-response-format pattern):
  ```json
  {
    "success": true,
    "data": { /* ... */ },
    "error": null,
    "meta": { "total": 120, "page": 1, "limit": 20 }
  }
  ```
- **Auth:** public read endpoints are unauthenticated; all write endpoints (and any dealer-only-restricted reads) require a bearer token issued to Admin Panel sessions, validated against Roles/Permissions.
- **Validation:** every write endpoint validates its payload against a schema (e.g. Zod, matching the team's TypeScript coding-style rule) derived directly from the corresponding `CMS_DATA_MODELS.md` model — no ad hoc validation per route.

---

## Public (read) endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/v1/products` | list, filterable by `category`, `family`, paginated |
| `GET /api/v1/products/:slug` | single product detail |
| `GET /api/v1/categories` | list |
| `GET /api/v1/categories/:slug` | single category + its products |
| `GET /api/v1/dealers` | list, filterable by `country`, `tier`, `productFocus` — powers Authorized Dealers + Export's distributor map |
| `GET /api/v1/dealers/:slug` | single dealer profile |
| `GET /api/v1/news` | list, filterable by `category`, `year`, sortable — powers Newsroom |
| `GET /api/v1/news/:slug` | single article + related articles |
| `GET /api/v1/support-articles` | list, filterable by `category` |
| `GET /api/v1/support-articles/:slug` | single article |
| `GET /api/v1/certificates` | list, filterable by `appliesTo`/`relatedProducts` |
| `GET /api/v1/downloads` | list, filterable by `fileType`, `category`; dealer-only items excluded unless authenticated as a dealer session |
| `GET /api/v1/videos` | list, filterable by `relatedProduct` |
| `GET /api/v1/pages/:slug` | generic page content (About family, legal pages, Manufacturing, Export, Contact) |
| `GET /api/v1/search?q=` | unified search across products/news/support/dealers/pages — backs Phase 8 |
| `GET /api/v1/settings` | public-safe subset of Settings (company info, social links) — never exposes analytics IDs or internal config |
| `GET /api/v1/languages` | active locales for the locale switcher |

## Write endpoints (Admin-authenticated)

| Endpoint | Purpose |
|---|---|
| `POST /api/v1/products` / `PATCH /api/v1/products/:id` / `DELETE /api/v1/products/:id` | full CRUD, permission-gated (`products.create`/`edit`/`delete`) |
| `POST /api/v1/products/:id/publish` | explicit publish action (separate from generic edit, for audit clarity) |
| Same CRUD + publish pattern for: `categories`, `dealers`, `news`, `support-articles`, `certificates`, `downloads`, `videos`, `pages` | consistent shape across content types |
| `PATCH /api/v1/dealers/:id/status` | dealer application approve/reject workflow (`pending`→`active`/`inactive`) |
| `POST /api/v1/media` (multipart upload) | triggers the optimization pipeline described in `ADMIN_PANEL_MODULES.md` |
| `DELETE /api/v1/media/:id` | blocked if `usedIn` is non-empty, unless forced with confirmation |
| `GET/PATCH /api/v1/settings` | Settings singleton, Admin-role only |
| `GET/POST/PATCH/DELETE /api/v1/users`, `/roles`, `/permissions` | user/access management |
| `GET /api/v1/audit-log` | read-only, paginated, filterable by user/module/date |
| `GET /api/v1/analytics/*` | read-only proxy/aggregation from the Phase 10 analytics provider |

## Form-submission endpoints (public write, narrow scope)

| Endpoint | Purpose |
|---|---|
| `POST /api/v1/dealer-applications` | Become a Dealer multi-step form → creates a `Dealer` record with `status: pending` |
| `POST /api/v1/complaints` | Submit Your Complaint form |
| `POST /api/v1/ideas` | "I Have an Idea" form |
| `POST /api/v1/career-applications` | Career wizard submission (file uploads via a pre-signed upload flow, not inline in the JSON payload) |
| `POST /api/v1/contact` (if Contact gains a real form per the open question in `DEVELOPMENT_ROADMAP.md`) | general inquiry |

All form-submission endpoints: rate-limited, validated client- and server-side, and protected against abuse (honeypot/light anti-abuse per the team's own forms security rule — no heavy-handed CAPTCHA by default).

---

## Non-goals for this sprint

- No endpoint is implemented.
- No authentication provider is selected yet (deferred to Phase 2/3 implementation).
- No rate-limiting infrastructure is provisioned yet.

This document exists so Phase 2 (CMS) and Phase 3 (Admin) implementation has an agreed contract to build against, and so frontend migration work (Phases 4–8) can be planned against stable endpoint shapes ahead of time.
