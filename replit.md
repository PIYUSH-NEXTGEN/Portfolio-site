# Ink Portfolio

A responsive personal portfolio for a full-stack developer and creative technologist, presented as a tactile ink-and-paper editorial experience.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080,
  override with `PORT`)
- `pnpm --filter @workspace/portfolio-site run dev` — run the portfolio preview
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite + Tailwind CSS + Framer Motion + anime.js

## Where things live

- `artifacts/portfolio-site/src/App.tsx` — section components and theme-specific rendering
- `artifacts/portfolio-site/src/data/portfolio-content.tsx` — all static portfolio content (projects, skills, experience, links)
- `artifacts/portfolio-site/src/index.css` — theme tokens, responsive layout, motion, and visual treatments
- `attached_assets/` — supplied visual references; the five bundled `lumen-screenshot-*.png` files are imported through the `@assets` alias

## Architecture decisions

- The site is frontend-only by design; all portfolio content is static and intentionally avoids backend dependencies.
- The single visual direction is intentionally kept tactile and editorial, with paper texture, ink branches, red accents, and illustrated details.
- Decorative motion is subtle and respects the user's reduced-motion preference.

## Product

Visitors can explore Piyush Baraskar's work, capabilities, experience, and contact details through a warm editorial presentation inspired by printed portfolios and Japanese woodblock compositions.

## User preferences

- Keep the portfolio frontend-only with static data until the user asks for backend functionality.
- Keep the page as one cohesive ink-and-paper art direction; do not reintroduce a second grid theme unless explicitly requested.

## Gotchas

- The portfolio is the root preview artifact; use the managed `artifacts/portfolio-site: web` workflow instead of starting Vite directly.
- The app uses the artifact-provided `BASE_PATH` and `PORT` environment variables.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
