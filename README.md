# Piyush Baraskar  Portfolio

This is my personal portfolio website, showcasing my projects, skills, experience,
and the work I'm building as an ML & backend engineer.

**Like the design? Give the [repo a star ☆](https://github.com/PIYUSH-NEXTGEN/Portfolio-site)!**
It means a lot and helps others discover the project.

## Make it your own

Want to use this portfolio as a starting point? Fork the repository, set it up on
your device, and customize it with your own content.

### Prerequisites

- [Node.js](https://nodejs.org/) 24 LTS
- Git
- pnpm 10 — install it with:

  ```sh
  npm install -g pnpm@10
  ```

Use **pnpm** to install this project's dependencies; the workspace enforces it.

### 1. Fork and clone

Click **Fork** on [this repository](https://github.com/PIYUSH-NEXTGEN/Portfolio-site).
On your fork, select **Code** and copy its HTTPS clone URL. Run `git clone`
followed by that URL, then enter the cloned directory:

```sh
cd Portfolio-site
```

Run the remaining commands from this repository root.

### 2. Install dependencies

```sh
pnpm install
```

> **Platform note:** The workspace currently excludes several native build
> packages for macOS, ARM, and Linux musl environments. If you're using one of
> those platforms, remove only the matching platform-exclusion overrides from
> `pnpm-workspace.yaml`, then run `pnpm install` again. Keep the security settings
> and version overrides intact.

### 3. Start the development server

```sh
pnpm --filter @workspace/portfolio-site run dev
```

Open **http://localhost:5173** in your browser. Changes to the source files will
appear as you develop.

The portfolio is a static frontend: you don't need an API server, database,
API keys, or an `.env` file to run it. The default port is `5173` and the default
base path is `/`. For a custom environment, set `PORT` and `BASE_PATH` in your
shell before starting Vite.

### 4. Customize your portfolio

Paths below are relative to the repository root:

| File or folder | What to update |
| --- | --- |
| `artifacts/portfolio-site/src/data/portfolio-content.tsx` | Projects, skills, experience, achievements, social links, and email address |
| `artifacts/portfolio-site/src/App.tsx` | Name, introduction, section copy, and page components |
| `artifacts/portfolio-site/src/index.css` | Colors, typography, layout, and visual effects |
| `artifacts/portfolio-site/public/` | Profile images, favicon, and decorative artwork |
| `artifacts/portfolio-site/index.html` | Page title and social preview metadata |
| `attached_assets/` | Project screenshots and other imported assets |

Replace my personal information, images, and project details with your own before
publishing.

### 5. Check and build

Typecheck the portfolio:

```sh
pnpm --filter @workspace/portfolio-site run typecheck
```

Create a production build:

```sh
pnpm --filter @workspace/portfolio-site run build
```

The static output is generated in `artifacts/portfolio-site/dist/public/`.

Preview that build locally:

```sh
pnpm --filter @workspace/portfolio-site run serve
```

Open **http://localhost:5173**. Stop the development server first if it is still
using that port.

## Tech stack

- **React 19 + TypeScript** — UI components and type safety
- **Vite 7** — development server and production builds
- **Tailwind CSS 4 + custom CSS** — responsive styling and ink-and-paper visuals
- **Framer Motion + anime.js** — animations and intro sequence
- **Wouter** — client-side routing
- **Lucide React + React Icons** — icons
- **pnpm workspaces** — package management and workspace organization

## A little credit :)

If you use this design or build your portfolio from this project, please add a
small credit in your portfolio with a link back here:

> Inspired by [Piyush Baraskar Portfolio](https://github.com/PIYUSH-NEXTGEN/Portfolio-site) :)

Thanks for checking out my work, and don't forget to star the repo if you like
it!
