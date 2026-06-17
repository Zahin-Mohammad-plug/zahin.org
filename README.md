# zahin.org

My personal portfolio website. The live site serves three versions side by side:

| Path | Version | What it is |
|------|---------|------------|
| [`/`](https://zahin.org/) | **Zahin Universe** (current) | An interactive, scroll-driven "fall through space" portfolio. Static HTML + a small runtime. Source in [`home/`](home/). |
| [`/v2/`](https://zahin.org/v2/) | Next.js portfolio | The previous site — Next.js + TypeScript + Tailwind. Source in [`app/`](app/) + [`components/`](components/). |
| [`/v1/`](https://zahin.org/v1/) | Original | The first site — plain HTML/CSS/JS. Source in [`v1/`](v1/). |

## Current site — "Zahin Universe" (`/`)

A single self-contained experience that scrolls through four "depths" (About → Passions → Projects → Stack). It lives in [`home/`](home/):

- `home/index.html` — the page
- `home/support.js` — the runtime (loads React + Babel from CDN at runtime; no build step)
- `home/public/` — image assets

Because it's static and has no build step, you can preview it by serving the folder directly:

```bash
cd home && python3 -m http.server 8099   # then open http://localhost:8099
```

## Legacy site — Next.js portfolio (`/v2`)

The Next.js app at the repo root is now served under the `/v2` base path. Sections: About, Projects, Stack, Passions, with dark/light theming.

```bash
pnpm install
pnpm dev      # http://localhost:3000/v2
pnpm build    # static export to ./out (configured with basePath: '/v2')
```

> Note: `basePath: '/v2'` is set in [`next.config.mjs`](next.config.mjs). Because images are unoptimized in static export, raw and `next/image` `src` values are passed through `withBasePath()` ([`lib/base-path.ts`](lib/base-path.ts)) so assets resolve under `/v2`.

## Deployment

Deploys automatically to GitHub Pages via GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) on every push to `main`. The workflow:

1. Builds the Next.js app → `./out` (base path `/v2`).
2. Assembles the published tree:
   - `home/` → site root (`/`)
   - `out/` → `/v2/`
   - `v1/` → `/v1/`
   - plus `CNAME` and `.nojekyll`
3. Uploads the assembled `deploy/` directory as the Pages artifact.
