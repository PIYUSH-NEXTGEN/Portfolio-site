# Ink Portfolio

A responsive personal portfolio for an ML & backend engineer, presented as a
tactile ink-and-paper editorial experience.

See `.env.example` for local environment variables (DB tooling only needs
`DATABASE_URL`).

## Contact form

The "Send a note" form in `artifacts/dual-theme-portfolio/src/App.tsx` is a
two-step OTP-verified flow with no `mailto:` send path, no page reload, and no
Web3Forms involvement. Step 1 posts `{ email }` to `POST /api/send-otp`, which
emails the visitor a 6-digit code via Resend and returns a stateless
HMAC-signed token (held client-side). Step 2 posts `{ token, code, message }`
to `POST /api/verify-and-send`, which verifies the token/code and forwards the
message to the inbox via Resend (`reply_to` = visitor email). Both endpoints
live in `artifacts/dual-theme-portfolio/api/` and auto-deploy as Vercel
serverless functions. The footer "Direct > Email" block stays a plain `mailto:`
convenience link that opens the visitor's own mail app.

Setup:

1. In Vercel (portfolio project) set `RESEND_API_KEY` (from the resend.com API
   Keys page), `FROM_EMAIL=onboarding@resend.dev` (Resend's free shared sender,
   no domain verification needed), `OTP_SIGNING_SECRET` (generate via
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`),
   and `CONTACT_DESTINATION_EMAIL` (inbox receiving verified messages).
2. Redeploy. The frontend needs no keys — it just calls same-origin `/api/*`.

| Variable | Where | Required | Purpose |
| --- | --- | --- | --- |
| `RESEND_API_KEY` | Vercel (server) | Yes | Resend API key for sending OTP + contact emails. |
| `FROM_EMAIL` | Vercel (server) | Yes | Sender identity (`onboarding@resend.dev` on the free tier). |
| `OTP_SIGNING_SECRET` | Vercel (server) | Yes | 64-char hex secret for HMAC-signing OTP tokens. |
| `CONTACT_DESTINATION_EMAIL` | Vercel (server) | Yes | Inbox receiving verified contact messages. |

Tradeoff (stated plainly): rate limiting is an in-memory per-instance Map (3
OTP requests / IP / 15 min, 5 verifications / IP / hour), so it resets on each
serverless cold start/deploy. Accepted for a low-traffic portfolio form; the
signed-token design keeps everything stateless with no database.

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

- The site is static except for the OTP contact flow: all portfolio content is
  static, plus two stateless Vercel functions under
  `artifacts/dual-theme-portfolio/api/` (`send-otp`, `verify-and-send`) that
  send mail via Resend. The Express server exists only for platform health
  checks and is never called by the contact form.
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
