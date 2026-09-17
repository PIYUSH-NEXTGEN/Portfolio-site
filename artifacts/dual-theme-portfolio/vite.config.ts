import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

const rawPort = process.env.PORT;

// PORT/BASE_PATH come from the Replit artifact runtime. Default them locally
// so `pnpm build` / `vite build` also works on a plain checkout.
const port = rawPort === undefined ? 5173 : Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const rawBasePath = process.env.BASE_PATH ?? '/';
/* BASE_PATH is meant to be a URL path like "/preview". When the dev server is
   launched through a shell that mangles leading-slash arguments (MSYS/Git Bash
   converts them to Windows paths like "/Program Files/Git/..."), the value
   arrives as a filesystem path. Vite would then bake that into every asset
   URL (favicon, images) and everything 404s — so fall back to "/" instead. */
const basePath = /^[\w./-]*$/.test(rawBasePath) ? rawBasePath : '/';

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
    // Local dev convenience: forward /api to the API server (Vite on :5173,
    // API on :8080). In production the platform serves /api alongside the
    // static site, so no proxy is needed. VITE_API_BASE_URL still overrides
    // the proxy target when set.
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
