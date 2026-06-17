/**
 * Base path helper for the legacy (/v2) portfolio.
 *
 * This app is served under `basePath: '/v2'` (see next.config.mjs). Next.js auto-
 * prefixes the base path for `next/link` and for optimized `_next/image` URLs, but
 * with `output: 'export'` + `images.unoptimized` it does NOT prefix raw image `src`
 * values. Any absolute asset path (e.g. "/images/foo.png") must therefore be passed
 * through `withBasePath()` so it resolves under /v2 instead of the site root.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function withBasePath(path: string): string {
  if (!path) return path
  // Leave absolute URLs (CDN icons, data URIs) untouched.
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path
  return path.startsWith("/") ? `${BASE_PATH}${path}` : path
}
