/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No basePath: this deployment's own root (/) is the application entry
  // point (root = login screen, redirects to /genel-bakis after auth).
  // When this app is later bridged onto dekor-tools.com/admin, the main
  // site's vercel.json rewrite should map /admin/:path* to this
  // deployment's /:path* (i.e. strip the /admin prefix in the rewrite
  // itself) rather than relying on basePath here — keeps this app's own
  // root usable both standalone and behind the future proxy.
};

export default nextConfig;
