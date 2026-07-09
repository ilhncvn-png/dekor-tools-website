/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Mounted at dekor-tools.com/admin via a Vercel Multi-Zones rewrite from
  // the static site's vercel.json (this app is deployed as its own,
  // separate Vercel project — the static site's zero-config deployment is
  // never touched). `basePath` makes every internal <Link>, router push,
  // and Next.js-managed asset path automatically resolve under /admin
  // without editing any page or component — do not hand-prefix hrefs
  // elsewhere in the app instead of relying on this.
  basePath: '/admin',
};

export default nextConfig;
