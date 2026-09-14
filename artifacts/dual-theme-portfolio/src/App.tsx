import { type CSSProperties, type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, Boxes, Brain, ChevronDown, Code2, Database, Medal, Menu, Settings, Trophy, UsersRound, X } from 'lucide-react';
import { SiLeetcode, SiPeerlist } from 'react-icons/si';
import { FaDev, FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { ErrorBoundary } from '@/components/error-boundary';
import { IntroSequence } from '@/components/intro/IntroSequence';
import { CursorSlash, NavKatana } from '@/components/Katana';
import GuidedTour from '@/components/GuidedTour';
import { BambooDecoration, DecorativeBranches } from '@/components/Decorations';
import { WanderingCat } from '@/components/WanderingCat';
import NotFound from '@/pages/not-found';
import Journey from '@/pages/journey';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import '@/index.css';

const projects = [
  {
    number: '01',
    name: 'Kintsugi',
    kind: 'Product dashboard',
    description: 'A calm operations cockpit for teams turning messy inputs into decisions they can trust.',
    stack: ['React', 'Node.js', 'Postgres'],
    accent: 'coral',
    url: 'https://kintsugi.vercel.app',
    github: 'https://github.com/PIYUSH-NEXTGEN/kintsugi',
    year: '2026',
    details: 'Kintsugi turns scattered signals — tickets, deploys, incidents — into one calm cockpit. Every metric is annotated, decisions are traceable, and nothing ships without its story attached.',
    highlights: ['Unified incident and deploy timeline', 'Annotated metrics with review threads', 'Keyboard-first ops workflow'],
  },
  {
    number: '02',
    name: 'Akari Commerce',
    kind: 'Commerce platform',
    description: 'A faster, more human storefront system for independent makers and small-batch goods.',
    stack: ['Next.js', 'Stripe', 'Prisma'],
    accent: 'gold',
    url: 'https://akari-commerce.vercel.app',
    github: 'https://github.com/PIYUSH-NEXTGEN/akari-commerce',
    year: '2026',
    details: 'Akari replaces cookie-cutter storefronts with a builder that respects the maker’s eye. Checkout feels like a conversation, not a funnel, and inventory stays honest in real time.',
    highlights: ['Headless storefront builder', 'One-tap Stripe checkout flow', 'Real-time inventory sync'],
  },
  {
    number: '03',
    name: 'Sora Studio',
    kind: 'Creative tool',
    description: 'A collaborative workspace that gives creative teams a shared surface for early ideas.',
    stack: ['TypeScript', 'WebSockets', 'Figma'],
    accent: 'blue',
    url: 'https://sora-studio.vercel.app',
    github: 'https://github.com/PIYUSH-NEXTGEN/sora-studio',
    year: '2026',
    details: 'Sora is a shared canvas for early creative chaos. Moodboards, references and rough sketches live on one surface that syncs live across the room — no save button required.',
    highlights: ['Live multi-user canvas', 'Moodboard and reference boards', 'Versioned sketch history'],
  },
  {
    number: '04',
    name: 'Mono API',
    kind: 'Developer tool',
    description: 'A lightweight API layer that makes complex workflows legible, observable, and quick.',
    stack: ['Go', 'GraphQL', 'Docker'],
    accent: 'ink',
    url: 'https://mono-api.vercel.app',
    github: 'https://github.com/PIYUSH-NEXTGEN/mono-api',
    year: '2026',
    details: 'Mono wraps complex workflows in a single legible API — typed contracts, automatic logging, and a query graph that shows exactly what ran, when, and why.',
    highlights: ['Typed contract layer', 'Automatic request tracing', 'One-command Docker deploy'],
  },
];

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/PIYUSH-NEXTGEN', Icon: FaGithub, testId: 'link-nav-github', color: '#24292e' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/piyush-baraskar-994ab6337', Icon: FaLinkedin, testId: 'link-nav-linkedin', color: '#0077b5' },
  { label: 'X (Twitter)', href: 'https://x.com/Piyush_NextGen', Icon: FaXTwitter, testId: 'link-nav-x', color: '#000000' },
  { label: 'Peerlist', href: 'https://peerlist.io/piyush_nextgen', Icon: SiPeerlist, testId: 'link-nav-peerlist', color: '#00aa45' },
  { label: 'LeetCode', href: 'https://leetcode.com/u/Piyush_NextGen/', Icon: SiLeetcode, testId: 'link-nav-leetcode', color: '#ffa116' },
  { label: 'dev.to', href: 'https://dev.to/piyushnextgen', Icon: FaDev, testId: 'link-nav-devto', color: '#000000' },
];

const skills = [
  { title: 'Programming Languages', icon: Code2, detail: 'Python, Golang, SQL, JS/TS, C++', anim: 'wiggle' },
  { title: 'Libraries', icon: Boxes, detail: 'NumPy, Pandas, Matplotlib, Seaborn, Scikit-learn, TensorFlow', anim: 'slide' },
  { title: 'Backend', icon: Settings, detail: 'FastAPI, Pydantic', anim: 'spin' },
  { title: 'Databases', icon: Database, detail: 'MySQL, PostgreSQL, SQL alchemy', anim: 'revolve' },
  { title: 'Deployment', icon: ArrowUpRight, detail: 'Render, Vercel', anim: 'glide' },
  { title: 'Machine Learning & AI', icon: Brain, detail: 'Supervised, Unsupervised, Neural Networks, Data analysis', anim: 'pulse' },
];

const experience = [
  ['2025 — now', 'Independent / ML & Backend Engineer', 'Building data-driven systems, scalable APIs, and intelligent applications from the ground up.'],
  ['2024 — now', 'Programming community / founder & lead', 'Founded a community where members learn by building — from Python fundamentals to shipping real ML and backend projects.'],
  ['2024 — 2029', 'B.Tech in Computer Science', 'Technocrats Institute of Technology — the foundation behind the APIs, models, and all-night debug sessions.'],
];

const achievements = [
  { Icon: Trophy, title: 'Community lead', detail: 'Founded a programming community where curious builders learn, build, and ship together.' },
  { Icon: Medal, title: 'Full-stack ML', detail: 'Shipped ML-powered APIs end-to-end with FastAPI, Pydantic validation, and TensorFlow.' },
  { Icon: UsersRound, title: 'Hands-on builder', detail: 'Delivered 4+ production-minded projects across ML and backend engineering.' },
];

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

function FallingLeaves() {
  return (
    <div className="falling-leaves" aria-hidden="true">
      {Array.from({ length: 14 }, (_, index) => <span className={`falling-leaf falling-leaf-${index + 1}`} key={index} />)}
    </div>
  );
}

export { FallingLeaves, socialLinks, ScrollToTop };

/* Scroll-to-top: a small ink disc that slides up from the corner once you've
   scrolled into the page, and glides the viewport back to the top smoothly. */
function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll back to top"
      title="Back to top"
      data-testid="button-scroll-top"
      className={`scroll-top-button ${visible ? 'scroll-top-visible' : ''}`}
    >
      <ArrowUp size={15} />
    </button>
  );
}

function HeroPhoto() {
  const defaultPhoto = `${import.meta.env.BASE_URL}pfp.png`;
  const [photo, setPhoto] = useState<string | null>(defaultPhoto);
  const objectUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    // Local preview only: reject non-images / >2MB so one bad file cannot
    // exhaust memory or break the hero layout.
    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPhoto(url);
  };

  return (
    <div className="hero-photo-slot" data-testid="hero-photo-slot">
      {photo ? (
        <button
          type="button"
          className="hero-photo-filled"
          onClick={() => inputRef.current?.click()}
          aria-label="Change hero photo"
          title="Click to change photo"
        >
          <img
            src={photo}
            alt="Piyush Baraskar — portrait"
            loading="eager"
            decoding="async"
            onError={() => setPhoto(null)}
          />
        </button>
      ) : (
        <button
          type="button"
          className="hero-photo-empty"
          onClick={() => inputRef.current?.click()}
          data-testid="button-hero-photo-upload"
        >
          <span className="hero-photo-icon" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.5-3.5a1.5 1.5 0 0 0-2 0L6 21" /></svg>
          </span>
          <span className="mono hero-photo-title">Your photo here</span>
          <span className="hero-photo-sub">Click to upload — portrait works best</span>
          <span className="mono hero-photo-hint">JPG / PNG</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        aria-label="Upload hero photo"
        data-testid="input-hero-photo"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          // Reset so choosing the same file twice still fires onChange.
          event.target.value = '';
        }}
      />
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  // Escape closes the mobile menu; keeps keyboard users in control.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  const links = [['about', 'About'], ['projects', 'Work'], ['skills', 'Skills'], ['experience', 'Experience'], ['contact', 'Contact']];
  return (
    <header className="nav sticky top-0 z-20">
      <div className="section-wrap flex min-h-[68px] flex-nowrap items-center justify-between gap-3 py-2 sm:gap-4">
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2" aria-label="Social links">
          {socialLinks.map(({ label, href, Icon, testId, color }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} data-testid={testId} className="social-link" style={{ '--brand': color } as CSSProperties}>
              <Icon size={18} />
            </a>
          ))}
        </div>
        <nav id="primary-navigation" className={`${open ? 'mobile-nav-open absolute left-4 right-4 top-[64px] flex flex-col items-start gap-4 border border-current bg-[var(--paper,#ece4d3)] p-5 shadow-lg md:static md:flex md:flex-row md:items-center md:gap-5 md:border-0 md:bg-transparent md:p-0 md:shadow-none lg:gap-7' : 'hidden md:flex'} items-center gap-5 md:gap-5 lg:gap-7`} aria-label="Primary navigation">
          {links.map(([id, label]) => (
            <a onClick={() => setOpen(false)} href={`#${id}`} className="nav-link text-[10px] font-medium uppercase tracking-[.17em] opacity-70 transition-opacity hover:opacity-100" key={id} data-testid={`link-nav-${id}`}>{label}</a>
          ))}
          <Link href="/journey" onClick={() => setOpen(false)} className="nav-link flex items-center gap-1 text-[10px] font-medium uppercase tracking-[.17em] text-[#c84d3d] opacity-90 transition-opacity hover:opacity-100" data-testid="link-nav-journey-route">Journey <ArrowUpRight size={11} /></Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <NavKatana />
          <a href="#contact" className="button-primary hidden items-center gap-2 whitespace-nowrap px-3 py-2 text-[10px] font-semibold uppercase tracking-[.12em] transition-transform sm:flex" data-testid="link-header-contact">Start a project <ArrowUpRight size={13} /></a>
          <button type="button" onClick={() => setOpen(!open)} className="flex h-9 w-9 shrink-0 items-center justify-center border border-current md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="primary-navigation" data-testid="button-mobile-menu">
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="section-anchor section-wrap editorial-hero katana-hero grid min-h-[calc(100dvh-70px)] items-center gap-12 py-16 lg:grid-cols-[1.15fr_.85fr] lg:gap-16 lg:py-20">
      <div className="katana-hero-content">
        <Reveal className="hero-copy display max-w-[900px]" delay={80}><span className="block">PIYUSH BARASKAR</span></Reveal>
        <Reveal className="editorial-hero-copy mt-8 max-w-[480px] text-[15px] leading-7 opacity-75" delay={160}>
          <strong className="mono block text-[10px] uppercase tracking-[.18em]">ML &amp; BACKEND ENGINEER</strong>
          <span className="mono block text-[10px] uppercase tracking-[.18em] mt-2">CS 2029</span>
          <span className="mono block text-[10px] uppercase tracking-[.18em]">TECHNOCRATS INSTITUTE OF TECHNOLOGY</span>
          <span className="mono block text-[10px] uppercase tracking-[.18em] mt-2">BASED IN BHOPAL, INDIA</span>
          <span className="mt-3 block">Building at the intersection of Machine Learning and Backend Engineering.<br />Developing end to end software across machine learning, backend systems, databases, APIs, and frontend development, with a focus on building practical, data driven applications from the ground up.</span>
        </Reveal>
        <Reveal className="mt-9 flex flex-wrap items-center gap-3" delay={240}>
          <a href="#projects" className="button-primary magnetic-button inline-flex items-center gap-3 px-5 py-3 text-[11px] font-semibold uppercase tracking-[.16em]" data-testid="link-hero-work">View selected work <ArrowDown size={14} /></a>
          <a href="#about" className="button-quiet magnetic-button inline-flex items-center gap-3 px-5 py-3 text-[11px] font-semibold uppercase tracking-[.16em]" data-testid="link-hero-about">Read the story <ArrowRight size={14} /></a>
        </Reveal>
      </div>
      <div className="katana-hero-photo">
        <Reveal className="hero-photo-wrap relative min-h-[240px] sm:min-h-[320px]" delay={160}>
          <HeroPhoto />
        </Reveal>
      </div>
    </section>
  );
}

function ProjectVisual({ accent, year, compact = false }: { accent: string; year: string; compact?: boolean }) {
  const background = accent === 'coral' ? '#d5c3ad' : accent === 'gold' ? '#d7d5bd' : accent === 'blue' ? '#bdccd0' : '#c9ced0';
  if (compact) {
    return (
      <div className="project-visual relative overflow-hidden border border-current/20" style={{ backgroundColor: background, height: '4.5rem' }}>
        <div className="absolute left-3 top-2 mono text-[9px] opacity-60">PREVIEW / {year}</div>
        <div className="absolute bottom-1.5 left-3 right-3 top-7 border border-current/25 bg-black/10 p-2">
          <div className="mb-1.5 flex gap-1"><span className="h-1 w-1 rounded-full bg-current" /><span className="h-1 w-1 rounded-full bg-current opacity-35" /><span className="h-1 w-1 rounded-full bg-current opacity-15" /></div>
          <div className="grid h-5 grid-cols-[.8fr_1.2fr] gap-1.5">
            <div className="border border-current/15 p-1"><div className="h-1 w-1/2 bg-current/40" /><div className="mt-1 h-2 w-full bg-current/15" /></div>
            <div className="border border-current/15 p-1"><div className="h-1 w-1/3 bg-current/40" /><div className="mt-1 flex h-2 items-end gap-1">{[35, 60, 42, 78, 50, 88, 63].map((h, i) => <span key={i} className="flex-1 bg-current/35" style={{ height: `${h}%` }} />)}</div></div>
          </div>
        </div>
      </div>
    );
  }
  return <div className="project-visual relative mb-5 overflow-hidden border border-current/20 p-4" style={{ backgroundColor: background, height: '13rem' }}>
    <div className="absolute left-4 top-4 mono text-[9px] opacity-60">PREVIEW / {year}</div>
    <div className="absolute bottom-5 left-5 right-5 top-12 border border-current/25 bg-black/10 p-3">
      <div className="mb-3 flex gap-1"><span className="h-1.5 w-1.5 rounded-full bg-current" /><span className="h-1.5 w-1.5 rounded-full bg-current opacity-35" /><span className="h-1.5 w-1.5 rounded-full bg-current opacity-15" /></div>
      <div className="grid h-20 grid-cols-[.8fr_1.2fr] gap-2"><div className="border border-current/15 p-2"><div className="h-2 w-1/2 bg-current/40" /><div className="mt-3 h-8 w-full bg-current/15" /></div><div className="border border-current/15 p-2"><div className="h-2 w-1/3 bg-current/40" /><div className="mt-3 flex h-8 items-end gap-1">{[35, 60, 42, 78, 50, 88, 63].map((height, index) => <span key={index} className="flex-1 bg-current/35" style={{ height: `${height}%` }} />)}</div></div></div>
    </div>
  </div>;
}

function ProjectModal({ project, onClose }: { project: (typeof projects)[number]; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const closingRef = useRef(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    window.setTimeout(() => closeRef.current(), 240);
  };

  return (
    <div
      className={`project-modal-backdrop ${visible ? 'project-modal-backdrop-open' : ''} ${closing ? 'project-modal-closing' : ''}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name} — project details`}
    >
      <div
        className="project-modal-panel"
        data-testid={`project-modal-panel-${project.number}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="project-modal-close"
          onClick={handleClose}
          aria-label="Close project details"
          data-testid={`button-project-modal-close-${project.number}`}
        >
          <X size={16} />
        </button>
        <ProjectVisual accent={project.accent} year={project.year} />
        <div className="mono mt-4 text-[9px] uppercase tracking-[.15em] opacity-60">{project.number} / {project.kind} / {project.year}</div>
        <h3 className="display mt-2 text-3xl tracking-[-.04em]">{project.name}</h3>
        <p className="mt-3 text-sm leading-6 opacity-80">{project.description}</p>
        <p className="mt-3 text-sm leading-6 opacity-70">{project.details}</p>
        <ul className="project-highlights mt-4">
          {project.highlights.map((item) => (
            <li key={item} className="flex items-start gap-1.5 text-[11px] leading-4 opacity-80">
              <span className="shrink-0 text-[#c84d3d]" aria-hidden="true">✦</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.map(tag => <span className="mono border border-current/20 px-2 py-1 text-[9px] opacity-70" key={tag}>{tag}</span>)}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-dashed border-current/20 pt-4">
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="button-primary inline-flex items-center gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-[.15em]" data-testid={`link-project-live-${project.number}`}>Live site <ArrowUpRight size={13} /></a>
          <a href={project.github} target="_blank" rel="noopener noreferrer" className="button-quiet inline-flex items-center gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-[.15em]" data-testid={`link-project-github-${project.number}`}>GitHub <FaGithub size={13} /></a>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    requestAnimationFrame(() => cardRef.current?.focus());
  };
  return (
    <>
      <article
        ref={cardRef}
        className="project-card project-card-compact katana-card"
        data-testid={`card-project-${project.number}`}
        onClick={handleOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleOpen();
          }
        }}
        tabIndex={0}
        role="button"
        aria-haspopup="dialog"
        aria-label={`Open ${project.name} project details`}
      >
        <div className="mb-2 flex items-center justify-between mono text-[9px] opacity-60">
          <span>{project.number}</span>
          <span className="flex items-center gap-1">{project.kind}<ChevronDown size={12} className="project-card-chevron" /></span>
        </div>
        <ProjectVisual accent={project.accent} year={project.year} compact />
        <h3 className="display mt-3 text-lg tracking-[-.04em]">{project.name}</h3>
        <span className="katana-card-line" aria-hidden="true" />
        <p className="mt-2 line-clamp-2 text-xs leading-5 opacity-70">{project.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.stack.map(tag => <span className="mono border border-current/20 px-2 py-1 text-[9px] opacity-70" key={tag}>{tag}</span>)}
        </div>
        <span className="project-open-cta mono mt-4 flex items-center justify-center gap-2 border border-current/20 py-2 text-[9px] uppercase tracking-[.15em] opacity-60">
          Open project <ArrowUpRight size={12} />
        </span>
      </article>
      {open && createPortal(<ProjectModal project={project} onClose={handleClose} />, document.body)}
    </>
  );
}

function Projects() {
  return (
    <section id="projects" className="section-anchor border-t border-current/20 py-16">
      <div className="section-wrap">
        <Reveal className="mb-12 flex items-end gap-5"><div><div className="mono mb-4 text-[10px] uppercase tracking-[.2em] opacity-60">02 / PROJECTS</div><h2 className="section-title display">A few things<br /><span>I’ve made.</span></h2></div></Reveal>
        <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project, index) => <Reveal key={project.name} delay={index * 80}><ProjectCard project={project} /></Reveal>)}
        </div>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section id="skills" className="section-anchor border-t border-current/20 py-16">
      <div className="section-wrap">
        <Reveal className="mb-12">
          <div><div className="mono mb-4 text-[10px] uppercase tracking-[.2em] opacity-60">03 / TECHNICAL SKILLS</div><h2 className="section-title display">Tech stack<br /><span>I work with.</span></h2></div>
        </Reveal>
        <div className="skills-grid">
          {skills.map(({ title, icon: Icon, detail, anim }, index) => (
            <Reveal key={title} delay={index * 70} className="skills-cell">
              <div className="skills-card group">
                <div className="skills-card-top">
                  <span className={`skills-icon skill-anim-${anim}`}><Icon size={20} strokeWidth={1.6} /></span>
                  <span className="mono skills-index">0{index + 1}</span>
                </div>
                <h3 className="display skills-title">{title}</h3>
                <div className="skills-tags">
                  {detail.split(', ').map((tag) => (
                    <span key={tag} className="mono skills-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResumeCard() {
  const [open, setOpen] = useState(false);
  const base = import.meta.env.BASE_URL;
  const resumePdf = `${base}resume.pdf`;
  const resumeImg = `${base}resume-1.png`;
  return (
    <div className={`resume-card ${open ? 'resume-card-open' : ''}`}>
      <div className="resume-sheet">
        <div className="resume-sheet-top">
          <div className="mono text-[9px] uppercase tracking-[.15em] opacity-55">{open ? 'Full resume' : 'Resume — preview'}</div>
          <div className="mono text-[9px] uppercase tracking-[.15em] opacity-55">PDF · 1 page</div>
        </div>

        <div className={`resume-unroll ${open ? 'resume-unroll-open' : ''}`}>
          <div className="resume-unroll-frame">
            <img src={resumeImg} alt="Piyush Baraskar — resume" loading="lazy" data-testid="img-resume" />
          </div>
          <div className="resume-fold" aria-hidden="true" />
        </div>

        <div className={`resume-expand ${open ? 'resume-expand-open' : ''}`} aria-hidden={!open}>
          <div className="overflow-hidden">
            <div className="resume-roll">
              <a href={resumePdf} target="_blank" rel="noopener noreferrer" className="resume-download" data-testid="link-resume-download" tabIndex={open ? 0 : -1}>
                Download PDF <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="resume-toggle"
        aria-expanded={open}
        data-testid="button-resume-toggle"
      >
        <span>{open ? 'Close resume' : 'View resume'}</span>
        <ChevronDown size={13} className={open ? 'rotate-180' : ''} />
      </button>
    </div>
  );
}

function Experience() {
  return (
    <section id="experience" className="section-anchor border-t border-current/20 py-12">
      <div className="section-wrap">
        <Reveal className="mb-8">
          <div>
            <div className="mono mb-3 text-[10px] uppercase tracking-[.2em] opacity-60">04 / EXPERIENCE, ACHIEVEMENTS &amp; COMMUNITY</div>
            <h2 className="section-title display">The record<br /><span>I’m building.</span></h2>
            <p className="mt-5 max-w-[440px] text-sm leading-6 opacity-70">Experience, a few things I’m proud of, the programming community I lead — and a resume sheet that fills in as the next chapter lands.</p>
          </div>
        </Reveal>

        <Reveal className="mono mb-3 text-[10px] uppercase tracking-[.15em] opacity-60">Experience</Reveal>
        <div className="divide-y divide-current/20 border-y border-current/20">
          {experience.map(([date, role, description]) => (
            <div key={date} className="grid gap-2 py-4 sm:grid-cols-[.28fr_.72fr]">
              <div className="mono text-[10px] uppercase tracking-[.13em] opacity-60">{date}</div>
              <div>
                <h3 className="display text-lg">{role}</h3>
                <p className="mt-1.5 max-w-[470px] text-sm leading-6 opacity-65">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Reveal className="mono mb-3 text-[10px] uppercase tracking-[.15em] opacity-60">Achievements</Reveal>
          <div className="grid items-stretch gap-4 sm:grid-cols-3">
            {achievements.map(({ Icon, title, detail }, index) => (
              <Reveal key={title} delay={index * 90} className="achievement-card">
                <div className="flex items-center gap-3">
                  <span className="achievement-icon"><Icon size={18} strokeWidth={1.6} /></span>
                  <span className="mono skills-index">0{index + 1}</span>
                </div>
                <h3 className="display text-lg mt-3">{title}</h3>
                <p className="mt-1.5 text-sm leading-5 opacity-70">{detail}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <Reveal className="mono mb-3 text-[10px] uppercase tracking-[.15em] opacity-60">Resume</Reveal>
          <Reveal><ResumeCard /></Reveal>
        </div>

        <Reveal className="mt-12 flex justify-center" delay={120}>
          <Link href="/journey" className="button-primary magnetic-button inline-flex items-center gap-3 px-5 py-3 text-[11px] font-semibold uppercase tracking-[.16em]" data-testid="button-view-journey">View journey <ArrowRight size={14} /></Link>
        </Reveal>
      </div>
    </section>
  );
}

function Contact() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent'>('idle');

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Frontend-only site: no backend to receive mail, so validate locally and
    // hand off to the visitor's mail client instead of a dead POST.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;
    if (message.trim().length < 10) return;
    window.location.href = `mailto:alex.morgan@example.com?subject=${encodeURIComponent('Portfolio contact')}&body=${encodeURIComponent(`From: ${email.trim()}\n\n${message.trim()}`)}`;
    setStatus('sent');
  };

  return (
    <section id="contact" className="section-anchor contact-section border-t border-current/20 py-24">
      <BambooDecoration />
      <div className="section-wrap contact-inner">
        <Reveal className="grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div><div className="mono mb-6 text-[10px] uppercase tracking-[.2em] opacity-60">04 / Get in touch</div><h2 className="section-title display">Let’s make<br /><span>something useful.</span></h2><p className="mt-7 max-w-[440px] text-sm leading-7 opacity-70">Have a project in mind, a team that needs a thoughtful pair of hands, or just a good question? I’m always up for a conversation.</p>
            <form onSubmit={onSubmit} className="mt-8 grid max-w-[440px] gap-3" aria-label="Contact form">
              <label className="grid gap-1 text-left"><span className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Your email</span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" className="border border-current/30 bg-transparent px-3 py-2 text-sm" data-testid="input-contact-email" /></label>
              <label className="grid gap-1 text-left"><span className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Message (min 10 chars)</span><textarea required minLength={10} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What would you like to build?" rows={4} className="border border-current/30 bg-transparent px-3 py-2 text-sm" data-testid="input-contact-message" /></label>
              <button type="submit" className="button-primary mt-2 inline-flex items-center gap-3 px-5 py-3 text-[11px] font-semibold uppercase tracking-[.16em]" data-testid="button-contact-send">Send an email <ArrowUpRight size={14} /></button>
              {status === 'sent' && <p role="status" className="text-sm opacity-70">Opening your mail client — I’ll reply soon.</p>}
            </form>
          </div>
          <div className="grid content-end gap-5 border-l border-current/20 pl-6 sm:pl-10"><div><div className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Email</div><a className="mt-2 inline-block text-sm hover:underline" href="mailto:alex.morgan@example.com" data-testid="link-contact-address">alex.morgan@example.com</a></div><div><div className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Availability</div><p className="mt-2 text-sm opacity-70">Open to select freelance and full-time roles</p></div></div>
        </Reveal>
      </div>
    </section>
  );
}

function Home() {
  return <main className="site-shell theme-editorial paper-noise"><CursorSlash /><DecorativeBranches /><FallingLeaves /><WanderingCat /><Header /><Hero /><Projects /><Skills /><Experience /><Contact /><ScrollToTop /><GuidedTour /></main>;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/journey" component={Journey} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /><IntroSequence /></WouterRouter>;
}

export default App;
