/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Mounted at dekor-tools.com/admin via the main site's vercel.json
  // rewrite (Vercel Multi-Zones pattern) — that rewrite PRESERVES the
  // /admin prefix when proxying to this deployment (does not strip it),
  // because basePath here makes every generated asset URL, <Link>, and
  // router.push/replace target automatically resolve under /admin. This
  // was verified live, not assumed: without basePath this app emits
  // unprefixed absolute asset paths (confirmed via curl against the
  // standalone deployment — e.g. "/_next/static/chunks/...", no /admin),
  // which would 404 once viewed through the /admin proxy since the
  // browser would request dekor-tools.com/_next/... (no match on any
  // /admin/* rewrite rule). basePath is what fixes that at the source.
  //
  // This app's own standalone URL (https://<project>.vercel.app) now
  // requires the /admin prefix too — e.g. .../admin/genel-bakis, not
  // .../genel-bakis — that's an accepted tradeoff for correct proxying.
  basePath: '/admin',
};

export default nextConfig;
