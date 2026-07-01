# ADMIN_PANEL_MODULES.md

**Documentation only — no implementation in this sprint.** Module list for the Admin Panel introduced in Phase 3 of `ARCHITECTURE_ROADMAP.md`, built on top of the data models in `CMS_DATA_MODELS.md`.

---

## Dashboard

- At-a-glance summary: recent content changes, pending dealer applications, pending complaints/idea submissions, published vs. draft counts per content type.
- Quick links into each module below.
- Surfaces any active `maintenanceMode` state (Settings) prominently.

## Products

- List/search/filter Products by category, family, status.
- Create/edit form matching the Products data model exactly (spec rows, certifications, image gallery, downloads, related products).
- Bulk actions: publish/unpublish/archive.
- Enforces required 🌐 fields per active language before allowing publish.

## Dealers

- List/search/filter by tier, country, status.
- **Application review workflow:** incoming Become-a-Dealer submissions land here as `status: pending`; an editor/reviewer approves (→ `active`, dealer becomes publicly listed) or rejects (with a note, per an audit-log entry).
- Map-position editor (lat/lng) for the distributor map used on Export/Authorized Dealers.

## Orders (future)

- Placeholder module scaffolded but not built in early phases — reserved for a future e-commerce/ordering capability referenced by B2B Portal/Online Payment pages.
- When built: order list, status pipeline, payment status, linked dealer/customer record.
- Explicitly out of scope until a business decision is made to sell online; documented here only so the data model and nav slot exist ahead of time.

## News

- List/search/filter articles by category, status, publish date.
- Category and color-mapping are configuration, not per-article fields (matches `news-data.js`'s `CATEGORY_COLORS` constant) — Admin exposes category management as a small fixed list, not free-text.
- Rich-text editor constrained to the block set defined for News body content.
- Related-articles picker (or "auto-derive by category" toggle).

## Media Library

- Central upload/browse/search for all `Media` records.
- **Automatic optimization pipeline on upload** (resize, format conversion to AVIF/WebP + fallback, multiple `srcset` widths) — editors never manually pre-optimize images, per §17 of `CLAUDE.md`.
- Enforces `altText` as a required field before an asset can be attached to published content.
- Shows "used in" references (derived) so editors don't delete in-use assets unknowingly.

## Downloads

- Upload/manage datasheets, manuals, catalogs, price lists, brand assets.
- `restrictedTo: dealer-only` toggle, tied into whatever auth-gating exists for the dealer-only Partner Resources content.
- Version history (superseding an old datasheet with a new one without breaking existing links).

## Certificates

- Manage ISO/CE/etc. certificate records, issue/expiry dates, and their source files (via Downloads).
- Assign certificates to specific products or mark company-wide.
- Expiry-date warnings surfaced on the Dashboard as certificates approach expiration.

## SEO

- Per-page/per-content-type override of `metaTitle`, `metaDescription`, canonical URL, OG image, and structured-data fields.
- Sitemap/robots.txt status and last-generated timestamp.
- Flags pages missing required SEO fields (closing the audit's finding that only Home currently has Open Graph tags).

## Users

- Admin-panel user accounts (distinct from any future public-facing dealer/customer accounts).
- Invite/deactivate users; assign to one or more Roles.

## Roles

- Predefined roles at minimum: **Admin** (full access), **Editor** (content CRUD, no user/settings management), **Dealer Manager** (Dealers module + dealer application review only), **Viewer** (read-only, for stakeholders/reporting).
- Custom roles composable from the granular Permissions list (below), for future flexibility.

## Permissions

- Granular, per-module CRUD permissions (e.g. `products.create`, `products.publish`, `dealers.approve`, `settings.edit`) that Roles are composed from.
- Every content mutation is attributed to a user and role at time of action, feeding the audit log referenced in `CLAUDE.md` §20.

## Analytics

- Surfaces traffic/engagement data (from whatever analytics provider is wired up in Phase 10) directly in Admin — page views, top products, top search queries, dealer-application conversion — without requiring editors to leave the panel.
- Read-only in early phases; not a data-entry module.

## Settings

- Single form (or set of forms) editing the `Settings` singleton model: site name, company info, social links, default SEO, analytics IDs, cookie-consent configuration, active languages, maintenance mode.
- Changes here are high-blast-radius (site-wide) — should require the Admin role specifically, not Editor.

---

## Cross-module notes

- **Every module shares one publishing workflow** (`draft` / `published` / `archived`, per §9 of `CMS_DATA_MODELS.md`) for a consistent editor experience.
- **Every mutation across every module is audit-logged** (who, what, when, before/after) — a hard requirement given this site's B2B/export credibility positioning; content integrity matters to the brand.
- **The Admin UI itself must not expose raw HTML/CSS editing** anywhere (Products, News, Pages, Support Articles) — rich-text fields use a constrained block editor mapped onto already-designed components, enforcing the CMS Strategy principle in `CLAUDE.md` §19 that editors cannot break the frozen visual system.
