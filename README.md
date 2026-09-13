# Ink Portfolio

A responsive personal portfolio for an ML & backend engineer, presented as a
tactile ink-and-paper editorial experience.

See `.env.example` for local environment variables (DB tooling only needs
`DATABASE_URL`).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080,
  override with `PORT`)
- `pnpm --filter @workspace/dual-theme-portfolio run dev` — run the portfolio
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
- API: Express 5 (health endpoint only: `GET /api/healthz`)
- Frontend: React + Vite + Tailwind CSS + Framer Motion + GSAP intro
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle for API), Vite (static site)

## Where things live

- `artifacts/dual-theme-portfolio/src/App.tsx` — portfolio content and
  section rendering
- `artifacts/dual-theme-portfolio/src/index.css` — theme tokens, responsive
  layout, motion, and visual treatments
- `artifacts/dual-theme-portfolio/public/` — only files referenced by the app
  (`cat.png`, `favicon.svg`, `katana*.png`, `pfp.png`, `resume.*`, `robots.txt`)
- `attached_assets/` — supplied visual references (source material, not served)

## Architecture decisions

- The site is frontend-only by design; all portfolio content is static and
  intentionally avoids backend dependencies. The Express server exists only for
  platform health checks and is not called by the site.
- The single visual direction is intentionally kept tactile and editorial, with
  paper texture, ink branches, red accents, and illustrated details.
- Decorative motion is subtle and respects the user's reduced-motion preference.

## Product

Visitors can explore Piyush Baraskar's work, capabilities, experience, and
contact details through a warm editorial presentation inspired by printed
portfolios and Japanese woodblock compositions.

## Gotchas

- The portfolio is the root preview artifact; use the managed
  `artifacts/dual-theme-portfolio: web` workflow instead of starting Vite
  directly.
- The app uses the artifact-provided `BASE_PATH` and `PORT` environment
  variables (with local defaults: `/` and `5173`).
- `mockup-sandbox` is a template/staging artifact and is intentionally not part
  of `pnpm run build` / `typecheck` verification.
