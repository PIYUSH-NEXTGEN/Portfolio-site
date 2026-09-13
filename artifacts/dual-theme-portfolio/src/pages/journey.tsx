import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { FallingLeaves } from '@/App';
import { CursorSlash } from '@/components/Katana';
import { DecorativeBranches } from '@/components/Decorations';
import { WanderingCat } from '@/components/WanderingCat';

function Journey() {
  return (
    <main className="site-shell theme-editorial paper-noise">
      <CursorSlash />
      <DecorativeBranches />
      <FallingLeaves />
      <WanderingCat />
      <header className="nav sticky top-0 z-20">
        <div className="section-wrap flex min-h-[68px] flex-nowrap items-center justify-between gap-3 py-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[.17em] opacity-70 transition-opacity hover:opacity-100" data-testid="link-back-home">
            <ArrowLeft size={14} />
            Back to home
          </Link>
          <div className="flex-shrink-0 items-center gap-2 sm:gap-3">
            <span className="flex h-8 w-8 items-center justify-center border border-current font-mono text-[10px] font-bold">PB</span>
          </div>
        </div>
      </header>
      <section id="journey" className="section-anchor border-t border-current/20 py-16">
        <div className="section-wrap grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
          <div className="mono mb-4 text-[10px] uppercase tracking-[.2em] opacity-60">04 / Journey</div>
          <h2 className="section-title display">The long<br /><span className="serif normal-case">version.</span></h2>
          <p className="mt-7 max-w-[280px] text-sm leading-6 opacity-65">A non-linear path through engineering, design, and the quiet discipline of finishing.</p>
          <div className="divide-y divide-current/20 border-y border-current/20">
            {[
              ['2024 — now', 'Independent / creative technologist', 'Building selected digital products with people who care about the details.'],
              ['2022 — 2024', 'TechNova / frontend developer', 'Led a small interface team, shipped a design system, and made performance a feature.'],
              ['2020 — 2022', 'Westmark Studio / engineer', 'Built commerce and editorial experiences for ambitious independent brands.'],
              ['2016 — 2020', 'B.Tech in Computer Science', 'The beginning: too many side projects, not enough sleep, a useful foundation.'],
            ].map(([date, role, description]) => (
              <div key={date} className="grid gap-3 py-6 sm:grid-cols-[.28fr_.72fr]">
                <div className="mono text-[10px] uppercase tracking-[.13em] opacity-60">{date}</div>
                <div>
                  <h3 className="display text-lg">{role}</h3>
                  <p className="mt-2 max-w-[470px] text-sm leading-6 opacity-65">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="footer border-t border-current/15 py-7">
        <div className="section-wrap footer-inner flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center border border-current font-mono text-[10px] font-bold">PB</span>
            <span className="text-xs opacity-70">Piyush Baraskar — ML & Backend Engineer</span>
          </div>
          <div className="mono text-[9px] uppercase tracking-[.15em] opacity-55">© 2026 / made with care</div>
        </div>
      </footer>
    </main>
  );
}

export default Journey;
