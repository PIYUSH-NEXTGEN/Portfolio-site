import { Link } from 'wouter';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="site-shell theme-editorial paper-noise min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-current/20 p-6 text-center">
        <div className="flex mb-4 items-center justify-center gap-2">
          <AlertCircle className="h-8 w-8 text-[#c84d3d]" aria-hidden="true" />
          <h1 className="display text-2xl">
            404 Page Not Found
          </h1>
        </div>

        <p className="mt-4 text-sm opacity-70">
          This page wandered off the paper. Let’s get you back.
        </p>
        <Link href="/" className="button-primary mt-6 inline-flex items-center gap-2 px-5 py-3 text-[11px] font-semibold uppercase tracking-[.16em]" data-testid="link-not-found-home">
          Back to home
        </Link>
      </div>
    </div>
  );
}
