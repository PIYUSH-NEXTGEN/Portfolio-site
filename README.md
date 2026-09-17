# Ink Portfolio

A responsive personal portfolio for an ML & backend engineer, presented as a
tactile ink-and-paper editorial experience.

See `.env.example` for local environment variables (DB tooling only needs
`DATABASE_URL`).

## Contact

The footer contact section is purely informational: a `mailto:` link that
opens the visitor's own mail app, availability, location, and social links.
There is no form, no sending option, and no server-side mail functionality.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080,
  override with `PORT`)
- `pnpm --filter @workspace/portfolio-site run dev` — run the portfolio
  preview (port 5173 locally; the Replit artifact runtime provides `PORT` and
  `BASE_PATH`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and
  Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only;
  needs `DATABASE_URL`)
- Required env for DB tooling only: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (health endpoint: `GET /api/healthz`)
- Frontend: React + Vite + Tailwind CSS + Framer Motion + anime.js intro
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle for API), Vite (static site)

## Where things live

- `artifacts/portfolio-site/src/App.tsx` — section components and
  theme-specific rendering
- `artifacts/portfolio-site/src/data/portfolio-content.tsx` — all static
  portfolio content (projects, skills, experience, links)
- `artifacts/portfolio-site/src/index.css` — theme tokens, responsive
  layout, motion, and visual treatments
- `artifacts/portfolio-site/public/` — only files referenced by the app:
  the artwork it renders as lossless WebP (`cat.webp`, `katana-hang.webp`,
  `katana-ink.webp`, `pfp.webp`, `resume-preview.webp`), plus `favicon.png`,
  `pfp.png` (the social/OG preview image, kept in PNG for scraper
  compatibility), `resume.pdf` and `robots.txt`
- `attached_assets/` — supplied visual references, kept as uploaded; the five
  bundled `lumen-screenshot-*.webp` files (lossless conversions of the supplied
  PNGs) are imported through the `@assets` alias

## Architecture decisions

- The site is fully static: all portfolio content, including the footer
  contact section, is rendered client-side with no server-side functions
  involved. The Express server exists only for platform health checks.
- The single visual direction is intentionally kept tactile and editorial, with
  paper texture, ink branches, red accents, and illustrated details.
- Decorative motion is subtle and respects the user's reduced-motion preference.
- Raster art ships as lossless WebP: each converted file is pixel-identical to
  its PNG source (alpha and RGB verified) while the decorative sprites, hero
  portrait, resume preview and project screenshots shed roughly half their
  bytes. The below-the-fold screenshots and resume preview are lazy-loaded, and
  the hero portrait keeps `width`/`height` plus `fetchPriority="high"` so it
  loads first without shifting the layout.

## Product

Visitors can explore Piyush Baraskar's work, capabilities, experience, and
contact details through a warm editorial presentation inspired by printed
portfolios and Japanese woodblock compositions.

## Gotchas

- The portfolio is the root preview artifact; use the managed
  `artifacts/portfolio-site: web` workflow instead of starting Vite
  directly.
- The app uses the artifact-provided `BASE_PATH` and `PORT` environment
  variables (with local defaults: `/` and `5173`).
- `mockup-sandbox` is a template/staging artifact and is intentionally not part
  of `pnpm run build` / `typecheck` verification.
