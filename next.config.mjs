/** @type {import('next').NextConfig} */
// This Next.js app is the legacy ("v2") portfolio, served under /v2.
// The new "Zahin Universe" design lives at the root (see /home + deploy workflow).
const BASE_PATH = '/v2'

const nextConfig = {
  output: 'export',
  basePath: BASE_PATH,
  // Exposed to client code so raw asset paths (e.g. canvas-loaded images that
  // next/image does not auto-prefix) can resolve correctly under the base path.
  env: {
    NEXT_PUBLIC_BASE_PATH: BASE_PATH,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
