// Pre-install guard: cross-platform replacement for the previous
// `sh -c '...'` script so `pnpm install` also works on Windows.
// Intent is preserved: delete stale lockfiles and force pnpm as the manager.
import fs from 'fs';

for (const stale of ['package-lock.json', 'yarn.lock']) {
  try {
    fs.unlinkSync(stale);
  } catch {
    // ignore missing files
  }
}

const userAgent = process.env.npm_config_user_agent ?? '';
if (!/pnpm\//.test(userAgent)) {
  console.error('Use pnpm instead');
  process.exit(1);
}