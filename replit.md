# Dual Theme Portfolio

A responsive personal portfolio that lets visitors switch between two distinct art directions while keeping one shared portfolio story.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/dual-theme-portfolio run dev` — run the portfolio preview
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
- Frontend: React + Vite + Tailwind CSS + Framer Motion

## Where things live

- `artifacts/dual-theme-portfolio/src/App.tsx` — shared portfolio content and theme-specific rendering
- `artifacts/dual-theme-portfolio/src/index.css` — theme tokens, responsive layout, motion, and visual treatments
- `attached_assets/` — supplied visual references

## Architecture decisions

- The site is frontend-only by design; all portfolio content is static and intentionally avoids backend dependencies.
- The two visual directions share content and anchors so switching themes preserves context and scroll position.
- Theme choice is persisted in local storage so returning visitors keep their preferred art direction.
- Both themes use the same semantic section structure while allowing independent visual language and responsive composition.

## Product

Visitors can explore Alex Morgan's work, capabilities, experience, and contact details through either a warm editorial presentation or a crisp technical-grid presentation. The theme switcher is accessible, animated, and works without page reloads.

## User preferences

- Keep the portfolio frontend-only with static data until the user asks for backend functionality.
- Preserve the two themes as clearly different art directions rather than collapsing them into a generic color toggle.

## Gotchas

- The portfolio is the root preview artifact; use the managed `artifacts/dual-theme-portfolio: web` workflow instead of starting Vite directly.
- The app uses the artifact-provided `BASE_PATH` and `PORT` environment variables.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
