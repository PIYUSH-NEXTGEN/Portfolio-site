# Ink Portfolio

A responsive personal portfolio for an ML & backend engineer, presented as a
tactile ink-and-paper editorial experience.

See `.env.example` for local environment variables (DB tooling only needs
`DATABASE_URL`).

## Contact form

The "Send a note" form in `artifacts/dual-theme-portfolio/src/App.tsx` posts
JSON directly from the browser to `https://api.web3forms.com/submit` — no
`mailto:` send path, no page reload, no backend endpoint of ours involved.
Payload: `access_key` (from `VITE_WEB3FORMS_KEY`), `subject`, `from_name`,
`email`, `message`, plus an empty `botcheck` honeypot field that Web3Forms
auto-rejects when filled. The form keeps client-side checks (email format,
10-char minimum) as first-pass UX; Web3Forms validates and rate-limits
server-side.

Setup (free, ~10 minutes, no account signup):

1. Go to https://web3forms.com, enter `piyush_in_tech@gmail.com`, and
   copy the access key they email you. (Use that inbox — the key is bound to
   it.)
2. Set `VITE_WEB3FORMS_KEY=<your-key>` for the portfolio (local `.env` for
   dev, hosting env var for production) and rebuild/redeploy. Until the key
   is set, the form shows "not configured yet" and asks visitors to email
   directly.
3. Optional: if spam becomes a problem, enable reCAPTCHA/hCaptcha from the
   Web3Forms dashboard — no code changes needed.

| Variable | Where | Required | Purpose |
| --- | --- | --- | --- |
| `VITE_WEB3FORMS_KEY` | Portfolio (Vite) | Yes | Web3Forms access key. Public. Free tier: 250 submissions/month. |

Tradeoff (stated plainly): this trusts Web3Forms with form traffic instead
of owning the full pipeline. If you ever need full control, the upgrade path
is a server-side endpoint (Resend + Turnstile + rate limiting) — the commented
`RESEND_API_KEY` / `TURNSTILE_SECRET_KEY` entries in `.env.example` are kept
for that future.

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
- API: Express 5 (health endpoint: `GET /api/healthz`)
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
  platform health checks — the contact form posts directly from the browser to
  Web3Forms and never calls our API.
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
