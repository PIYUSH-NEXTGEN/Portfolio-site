import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ArrowUpRight, Award, Brain, ChevronDown, Code2, Flag, Rocket, Sparkles, Terminal, Trophy, UsersRound, Wrench, type LucideIcon } from 'lucide-react';
import { FallingLeaves, ScrollToTop, socialLinks } from '@/App';
import { CursorSlash, NavKatana } from '@/components/Katana';
import { DecorativeBranches } from '@/components/Decorations';
import { WanderingCat } from '@/components/WanderingCat';

/* ── Dummy data ────────────────────────────────────────────────────────
   A (fictional for now) five-year programming journey. Each milestone
   carries a category so the filter tabs can slice the timeline, and an
   expandable body with details, tags and a fun "receipt" stat. */

type Category = 'origins' | 'learning' | 'building' | 'wins';

interface Milestone {
  id: string;
  year: string;
  chapter: string;
  category: Category;
  title: string;
  blurb: string;
  details: string;
  tags: string[];
  stat?: { value: string; label: string };
  Icon: LucideIcon;
}

const categoryMeta: Record<Category, { label: string }> = {
  origins: { label: 'Origins' },
  learning: { label: 'Learning' },
  building: { label: 'Building' },
  wins: { label: 'Wins' },
};

const milestones: Milestone[] = [
  {
    id: 'hello-world',
    year: '2021',
    chapter: 'Chapter 01',
    category: 'origins',
    title: 'Hello, world.',
    blurb: 'A borrowed laptop, a Python tutorial tab, and a print statement that quietly changed everything.',
    details: 'It started with print("hello world") and a stubborn curiosity. The first program was trivial; the feeling was not. Somewhere between syntax errors at 1 AM and the terminal finally cooperating, a hobby quietly turned into a direction.',
    tags: ['Python', 'Curiosity'],
    stat: { value: '1', label: 'line of code that started it all' },
    Icon: Terminal,
  },
  {
    id: 'dsa-grind',
    year: '2022',
    chapter: 'Chapter 02',
    category: 'learning',
    title: 'The algorithm grind',
    blurb: 'Data structures, sleep-deprived contests, and the slow joy of green "Accepted".',
    details: 'Arrays became linked lists, recursion became second nature, and brute force became a bad word. Grinded problems daily, learned to think in time complexity, and discovered that most hard problems are just ten easy ones stacked badly.',
    tags: ['DSA', 'C++', 'LeetCode'],
    stat: { value: '500+', label: 'problems solved and counting' },
    Icon: Brain,
  },
  {
    id: 'first-project',
    year: '2022',
    chapter: 'Chapter 03',
    category: 'building',
    title: 'First real project',
    blurb: 'A scrappy CLI tool that automated my own homework — and hooked me on shipping.',
    details: 'Not pretty, not scalable, but MINE. It scraped, sorted and scheduled better than I ever did by hand. The lesson that stuck: software is most magical when it erases boring work you were about to do anyway.',
    tags: ['Automation', 'APIs'],
    stat: { value: '3 hrs/week', label: 'of homework erased forever' },
    Icon: Code2,
  },
  {
    id: 'web-era',
    year: '2023',
    chapter: 'Chapter 04',
    category: 'building',
    title: 'The web development era',
    blurb: 'React on the front, Node in the back — the first full-stack app deployed to a real URL.',
    details: 'Learned what "it works on my machine" costs when the database is remote and the timezone is UTC. Built auth, dashboards and a deployment pipeline from scratch. The internet gained one more corner that was shaped exactly how I wanted it.',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    stat: { value: '1st', label: 'production URL I actually owned' },
    Icon: Rocket,
  },
  {
    id: 'hackathon',
    year: '2023',
    chapter: 'Chapter 05',
    category: 'wins',
    title: 'First hackathon podium',
    blurb: '48 hours, 3 pizzas, one working demo — and a top-10 finish that proved the addiction.',
    details: 'Scoped ruthlessly, demoed confidently, slept never. Watching judges click through something we built from nothing in a single weekend rewired my brain: momentum beats perfection, and a demo is worth a hundred roadmaps.',
    tags: ['Hackathon', 'Teamwork', 'Rapid prototyping'],
    stat: { value: 'Top 10', label: 'finish out of 120+ teams' },
    Icon: Trophy,
  },
  {
    id: 'ml-deepdive',
    year: '2024',
    chapter: 'Chapter 06',
    category: 'learning',
    title: 'Machine learning deep-dive',
    blurb: 'From NumPy arrays to neural networks — training models until the loss curves behaved.',
    details: 'Went down the full stack of ML: data cleaning rituals, feature engineering folklore, backpropagation math, and the humility of a validation set. Learned that a model is only as honest as the data it was fed.',
    tags: ['TensorFlow', 'scikit-learn', 'Pandas'],
    stat: { value: '12+', label: 'models trained, most of them badly' },
    Icon: Sparkles,
  },
  {
    id: 'community',
    year: '2024',
    chapter: 'Chapter 07',
    category: 'building',
    title: 'Founded a builder community',
    blurb: 'Started a community where members learn by building — from Python fundamentals to real ML systems.',
    details: 'Realised the fastest way to learn is to teach, so I opened the doors. Weekly build sessions, code reviews, project showcases. Watching someone else ship their first project because of a nudge I gave is the best leaderboard there is.',
    tags: ['Leadership', 'Mentoring', 'Teaching'],
    stat: { value: '100+', label: 'builders learning in public' },
    Icon: UsersRound,
  },
  {
    id: 'backend-focus',
    year: '2025',
    chapter: 'Chapter 08',
    category: 'building',
    title: 'Backend engineering focus',
    blurb: 'FastAPI, Pydantic, Postgres, Docker — fell in love with systems measured in uptime.',
    details: 'Designed typed APIs, wrangled migrations, profiled slow queries and learned to love a good health check. Backend work taught me restraint: the best system is the one nobody has to think about, including me at 3 AM.',
    tags: ['FastAPI', 'PostgreSQL', 'Docker'],
    stat: { value: '99.9%', label: 'uptime ambition, humbly held' },
    Icon: Wrench,
  },
  {
    id: 'oss-pr',
    year: '2025',
    chapter: 'Chapter 09',
    category: 'wins',
    title: 'First open-source PR merged',
    blurb: 'A tiny fix in a library I use daily — merged upstream. Contributing finally felt real.',
    details: 'Read someone else’s codebase for three nights, wrote a four-line fix, argued politely in the PR thread, and saw the green merge. Open source stopped being a word on a resume and became an address I know how to walk to.',
    tags: ['Open source', 'Git', 'Code review'],
    stat: { value: '#1', label: 'PR merged into the wild' },
    Icon: Award,
  },
  {
    id: 'now',
    year: '2026',
    chapter: 'Chapter 10 — now',
    category: 'building',
    title: 'ML & Backend Engineer — current chapter',
    blurb: 'CS student building at the intersection of ML and backend engineering. Still shipping, still curious.',
    details: 'Right now: designing data-driven systems, scalable APIs and intelligent applications from the ground up — and writing this portfolio. The next chapters are unwritten on purpose. Check back soon; the pace hasn’t slowed.',
    tags: ['Go', 'LLMs', 'Systems design'],
    stat: { value: '∞', label: 'chapters left to write' },
    Icon: Flag,
  },
];

const journeyStats = [
  { value: 5, suffix: '+', label: 'years writing code' },
  { value: 20, suffix: '+', label: 'projects shipped' },
  { value: 500, suffix: '+', label: 'problems solved' },
  { value: 1, suffix: '', label: 'community founded' },
];

const filters: Array<{ id: Category | 'all'; label: string }> = [
  { id: 'all', label: 'Everything' },
  { id: 'origins', label: 'Origins' },
  { id: 'learning', label: 'Learning' },
  { id: 'building', label: 'Building' },
  { id: 'wins', label: 'Wins' },
];
/* Local reveal-on-scroll (same pattern as the home page). */
function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`${visible ? 'reveal' : 'opacity-0 translate-y-4'} ${className}`} style={{ animationDelay: `${delay}ms` }}>{children}</div>;
}

/* Count-up number that starts when scrolled into view. */
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const finish = () => setValue(to);
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const duration = 1400;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(to * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [to]);
  return <span ref={ref}>{value}{suffix}</span>;
}

/* ── Timeline pieces ─────────────────────────────────────────────────── */

function MilestoneCard({ milestone, open, onToggle, index }: { milestone: Milestone; open: boolean; onToggle: () => void; index: number }) {
  const { Icon } = milestone;
  return (
    <article className={`journey-card ${open ? 'journey-card-open' : ''}`} data-testid={`milestone-${milestone.id}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="journey-card-trigger" data-testid={`button-milestone-${milestone.id}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mono flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] uppercase tracking-[.16em] opacity-60">
              <span className="text-[#c84d3d] opacity-100">{milestone.year}</span>
              <span>{milestone.chapter}</span>
              <span className="border border-current/40 px-1.5 py-0.5">{categoryMeta[milestone.category].label}</span>
            </div>
            <h3 className="display mt-2 text-lg leading-snug">{milestone.title}</h3>
            <p className="mt-1.5 max-w-[420px] text-[13px] leading-6 opacity-70">{milestone.blurb}</p>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center border border-current/30 bg-[#f6f0e2] text-[#c84d3d]"><Icon size={16} /></span>
            <ChevronDown size={15} className="journey-chevron opacity-50" />
          </div>
        </div>
      </button>
      <div className="journey-detail">
        <div className="journey-detail-inner">
          <div className="journey-detail-content border-t border-dashed border-current/20">
            <p className="pt-3 text-[13px] leading-6 opacity-75">{milestone.details}</p>
            {milestone.stat && (
              <div className="mt-3 inline-flex items-baseline gap-2 border border-current/25 bg-white/40 px-3 py-2">
                <span className="serif text-xl text-[#c84d3d]">{milestone.stat.value}</span>
                <span className="mono text-[9px] uppercase tracking-[.14em] opacity-60">{milestone.stat.label}</span>
              </div>
            )}
            <div className="skills-tags mt-3">
              {milestone.tags.map((tag) => <span key={tag} className="skills-tag">{tag}</span>)}
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">Milestone {index + 1}</span>
    </article>
  );
}
/* ── Page ────────────────────────────────────────────────────────────── */

function Journey() {
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [spineProgress, setSpineProgress] = useState(0);
  const spineRef = useRef<HTMLDivElement>(null);

  /* Scroll-linked spine: fills from the top as the viewport centre passes
     through the timeline, like ink soaking down a page. */
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const node = spineRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const anchor = window.innerHeight * 0.45;
      const passed = Math.min(Math.max(anchor - rect.top, 0), rect.height);
      setSpineProgress(rect.height > 0 ? passed / rect.height : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const visible = milestones.filter((m) => filter === 'all' || m.category === filter);

  return (
    <main className="site-shell theme-editorial paper-noise">
      <CursorSlash />
      <DecorativeBranches />
      <FallingLeaves />
      <WanderingCat />
      <ScrollToTop />

      <header className="nav sticky top-0 z-20">
        <div className="section-wrap flex min-h-[68px] flex-nowrap items-center justify-between gap-3 py-2 sm:gap-4">
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2" aria-label="Social links">
            {socialLinks.map(({ label, href, Icon, testId, color }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} data-testid={testId} className="social-link" style={{ '--brand': color } as CSSProperties}>
                <Icon size={18} />
              </a>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <NavKatana />
            <Link href="/" className="button-primary flex items-center gap-2 whitespace-nowrap px-3 py-2 text-[10px] font-semibold uppercase tracking-[.12em]" data-testid="link-back-home">
              <ArrowLeft size={13} /> Back to home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="section-anchor section-wrap py-14 lg:py-20">
        <Reveal>
          <div className="mono text-[10px] uppercase tracking-[.2em] opacity-60">The story so far · 2021 — present</div>
          <h1 className="section-title display mt-4">
            Every expert was<br /><span className="serif normal-case">once a beginner.</span>
          </h1>
          <div className="journey-rule-draw mt-7 h-px w-full origin-left bg-current opacity-30" aria-hidden="true" />
          <p className="mt-7 max-w-[520px] text-sm leading-7 opacity-70">
            Five years of borrowed laptops, compile errors, small wins and stubborn curiosity —
            drawn as one long line from <span className="serif italic">print("hello world")</span> to
            production systems. Click any chapter to open it.
          </p>
        </Reveal>
        <Reveal className="journey-stats mt-12" delay={150}>
          {journeyStats.map((stat) => (
            <div key={stat.label} className="journey-stat">
              <div className="journey-stat-number serif">
                <CountUp to={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mono mt-2 text-[9px] uppercase tracking-[.15em] opacity-60">{stat.label}</div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Filter tabs */}
      <section className="section-wrap">
        <Reveal>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-current/20 pb-1" role="tablist" aria-label="Filter milestones">
            {filters.map(({ id, label }) => {
              const count = id === 'all' ? milestones.length : milestones.filter((m) => m.category === id).length;
              const active = filter === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => { setFilter(id); setOpenId(null); }}
                  className={`journey-tab ${active ? 'journey-tab-active' : ''}`}
                  data-testid={`button-journey-tab-${id}`}
                >
                  {label} <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* Interactive timeline */}
      <section className="section-wrap py-14">
        <div ref={spineRef} className="journey-timeline" style={{ '--journey-progress': spineProgress } as CSSProperties}>
          <div className="journey-spine" aria-hidden="true">
            <span className="journey-spine-fill" />
          </div>
          {visible.map((milestone, index) => (
            <Reveal key={`${filter}-${milestone.id}`} delay={index * 70}>
              <div className={`journey-row ${index % 2 === 0 ? 'journey-row-even' : 'journey-row-odd'}`}>
                <span className="journey-node" style={{ '--node-delay': `${index * 70 + 150}ms` } as CSSProperties} aria-hidden="true">
                  <milestone.Icon size={14} />
                </span>
                <MilestoneCard
                  milestone={milestone}
                  index={index}
                  open={openId === milestone.id}
                  onToggle={() => setOpenId(openId === milestone.id ? null : milestone.id)}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Philosophy band */}
      <section className="border-y border-current/20 py-20">
        <Reveal>
          <div className="section-wrap max-w-[780px] text-center">
            <div className="mono text-[10px] uppercase tracking-[.2em] opacity-60">Philosophy</div>
            <p className="serif mt-5 text-2xl italic leading-snug sm:text-3xl">
              “First solve the problem. Then write the code.<br className="hidden sm:block" />
              Then refactor the code. Then teach someone else.”
            </p>
            <div className="mono mt-6 text-[10px] uppercase tracking-[.16em] opacity-55">— the rule I keep re-learning</div>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="section-anchor section-wrap py-20 text-center">
        <Reveal>
          <h2 className="section-title display">
            The journey continues.<br /><span className="serif normal-case">Write the next chapter with me.</span>
          </h2>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className="button-primary inline-flex items-center gap-3 px-5 py-3 text-[11px] font-semibold uppercase tracking-[.16em]" data-testid="link-journey-home">
              Back to the work <ArrowUpRight size={14} />
            </Link>
            <a href="mailto:alex.morgan@example.com" className="inline-flex items-center gap-3 border border-current/40 px-5 py-3 text-[11px] font-semibold uppercase tracking-[.16em] transition-colors hover:bg-current/5" data-testid="link-journey-contact">
              Say hello <ArrowUpRight size={14} />
            </a>
          </div>
        </Reveal>
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




