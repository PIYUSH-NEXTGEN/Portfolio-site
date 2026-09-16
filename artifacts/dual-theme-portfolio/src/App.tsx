import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowUp, ArrowUpRight, Code2, Database, Menu, MousePointerClick, Settings, X } from 'lucide-react';
import { MatplotlibIcon, SeabornIcon } from './components/BrandIcons';
import { SiCplusplus, SiFastapi, SiGo, SiJavascript, SiLeetcode, SiMysql, SiNumpy, SiPandas, SiPeerlist, SiPostgresql, SiPydantic, SiPython, SiPytorch, SiRender, SiScikitlearn, SiSqlalchemy, SiTensorflow, SiTypescript, SiVercel } from 'react-icons/si';
import { FaDev, FaDiscord, FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { ErrorBoundary } from '@/components/error-boundary';
import { IntroSequence } from '@/components/intro/IntroSequence';
import { CursorSlash, NavKatana } from '@/components/Katana';
import GuidedTour, { startGuidedTour } from '@/components/GuidedTour';
import { DecorativeBranches } from '@/components/Decorations';
import { WanderingCat } from '@/components/WanderingCat';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import lumenShot1 from '@assets/1-lumen.png';
import lumenShot2 from '@assets/2-lumen.png';
import lumenShot3 from '@assets/3-lumen.png';
import lumenShot4 from '@assets/4-lumen.png';
import lumenShot5 from '@assets/5-lumen.png';
import '@/index.css';

const projects = [
  {
    number: '01',
    name: 'LUMEN',
    kind: 'Image analysis tool',
    description: 'A command-line and API-based image analysis tool for quality metrics, channel statistics, dominant colours, and exact-hash duplicate detection.',
    stack: ['Python', 'NumPy', 'Pandas', 'Pillow', 'Pydantic', 'Typer', 'FastAPI', 'PostgreSQL', 'SQLAlchemy', 'React + Vite', 'pytest'],
    accent: 'blue',
    url: 'https://lumen-image-analyzer.vercel.app/',
    github: 'https://github.com/PIYUSH-NEXTGEN/LUMEN',
    year: '2026',
    details: [
      '**LUMEN** is a full-stack image analysis platform that processes images through a unified Python pipeline to extract **quality, statistical, color, exposure, and duplicate-detection insights**. It evolved from a CLI tool into a complete system with a **FastAPI REST API, PostgreSQL persistence, and React dashboard** for interactive analysis and history.',
    ],
    capabilities: [
      'Performs brightness, contrast, sharpness, colorfulness, entropy, exposure, dominant-color, channel statistics, and histogram analysis, with **SHA-256 exact duplicate detection**.',
      'Supports searchable image history, detailed reports, side-by-side comparisons, **CSV/JSON exports**, and parallel folder processing using multiple CPU processes.',
      'Includes **API authentication, validation, rate limiting, automated testing**, and a modular architecture separating processing, API, database, and frontend layers.',
    ],
    images: [lumenShot1, lumenShot2, lumenShot3, lumenShot4, lumenShot5],
  },
];

/* Reserved card slots — kept in the grid but empty until the next project ships. */
const emptyProjectSlots = 1;

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/PIYUSH-NEXTGEN', Icon: FaGithub, testId: 'link-nav-github', color: '#24292e' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/piyush-baraskar-994ab6337', Icon: FaLinkedin, testId: 'link-nav-linkedin', color: '#0077b5' },
  { label: 'X (Twitter)', href: 'https://x.com/Piyush_NextGen', Icon: FaXTwitter, testId: 'link-nav-x', color: '#000000' },
  { label: 'Peerlist', href: 'https://peerlist.io/piyush_nextgen', Icon: SiPeerlist, testId: 'link-nav-peerlist', color: '#00aa45' },
  { label: 'LeetCode', href: 'https://leetcode.com/u/Piyush_NextGen/', Icon: SiLeetcode, testId: 'link-nav-leetcode', color: '#ffa116' },
  { label: 'dev.to', href: 'https://dev.to/piyushnextgen', Icon: FaDev, testId: 'link-nav-devto', color: '#000000' },
];

const skills = [
  {
    title: 'Programming Languages',
    items: [
      { name: 'Python', Icon: SiPython },
      { name: 'Go', Icon: SiGo },
      { name: 'JavaScript', Icon: SiJavascript },
      { name: 'TypeScript', Icon: SiTypescript },
      { name: 'C++', Icon: SiCplusplus },
    ],
  },
  {
    title: 'Machine Learning',
    items: [
      { name: 'NumPy', Icon: SiNumpy },
      { name: 'Pandas', Icon: SiPandas },
      { name: 'Matplotlib', Icon: MatplotlibIcon },
      { name: 'Seaborn', Icon: SeabornIcon },
      { name: 'scikit-learn', Icon: SiScikitlearn },
      { name: 'TensorFlow', Icon: SiTensorflow },
      { name: 'PyTorch', Icon: SiPytorch },
    ],
  },
  {
    title: 'Backend',
    items: [
      { name: 'FastAPI', Icon: SiFastapi },
      { name: 'Pydantic', Icon: SiPydantic },
    ],
  },
  {
    title: 'Databases',
    items: [
      { name: 'MySQL', Icon: SiMysql },
      { name: 'PostgreSQL', Icon: SiPostgresql },
      { name: 'SQLAlchemy', Icon: SiSqlalchemy },
    ],
  },
  {
    title: 'Deployment',
    items: [
      { name: 'Render', Icon: SiRender },
      { name: 'Vercel', Icon: SiVercel },
    ],
  },
];

const experience = [
  {
    date: '2025 — 2029',
    role: 'B.Tech in Computer Science',
    description: <>Technocrats Institute of Technology</>,
  },
  {
    date: '2025 — Present',
    role: 'Independent ML & Backend Developer',
    description: <>Building practical applications across machine learning, backend systems, APIs, databases, and frontend development, with a focus on developing software end to end.</>,
  },
  {
    date: '2025 — Present',
    role: 'Founder & Lead, Nextgen Programmers',
    description: <>Built and lead a worldwide programming community of <strong className="font-semibold">700+ active members</strong>, creating a space for developers to learn, collaborate, and grow together.</>,
  },
  {
    date: 'May 2026 — Jun 2026',
    role: 'GSSOC Contributor',
    description: <>Merged <strong className="font-semibold">9 pull requests</strong> while contributing to open source projects during GirlScript Summer of Code 2026.</>,
  },
];

const achievements = [
  { key: 'community-lead', title: 'Community Lead', detail: <>Founded and lead a programming community where curious builders learn, collaborate, and build together.</> },
  {
    key: 'hackathon-finalist',
    title: <><span className="font-sans">3×</span> Hackathon Finalist</>,
    detail: <>Reached the finals in three hackathons, building and presenting technical solutions under competitive constraints.</>,
  },
  {
    key: 'gssoc-2026',
    title: <>Top <span className="font-sans">4%</span> · GSSOC <span className="font-sans">2026</span></>,
    detail: <>Ranked <strong className="font-semibold">2,525th among 47,951 participants</strong>, placing in the top 4% of contributors.</>,
  },
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

/* Hero portrait — fixed artwork (public/pfp.png). The click-to-upload /
   change-photo picker was removed, so the slot is a plain, non-interactive
   image: no file input, no empty "Your photo here" state. */
function HeroPhoto() {
  const photo = `${import.meta.env.BASE_URL}pfp.png`;
  return (
    <div className="hero-photo-slot" data-testid="hero-photo-slot">
      <div className="hero-photo-filled">
        <img src={photo} alt="Piyush Baraskar — portrait" loading="eager" decoding="async" />
      </div>
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
  const links = [['projects', 'Work'], ['skills', 'Skills'], ['experience', 'Experience'], ['contact', 'Contact']];
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
        <nav id="primary-navigation" className={`${open ? 'mobile-nav-open absolute left-4 right-4 top-full flex flex-col items-start gap-4 border border-current bg-[var(--paper,#ece4d3)] p-5 shadow-lg md:static md:flex md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none lg:gap-8' : 'hidden md:flex'} items-center gap-5 md:gap-6 lg:gap-8`} aria-label="Primary navigation">
          {links.map(([id, label]) => (
            <a onClick={() => setOpen(false)} href={`#${id}`} className="nav-link text-[10px] font-medium uppercase tracking-[.17em] opacity-70 transition-opacity hover:opacity-100" key={id} data-testid={`link-nav-${id}`}>{label}</a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <NavKatana />
          <a href="https://discord.gg/CSmrA5fbx9" target="_blank" rel="noopener noreferrer" aria-label="Join my community on Discord" className="button-primary hidden items-center gap-2 whitespace-nowrap px-3 py-2 text-[10px] font-semibold uppercase tracking-[.12em] transition-transform sm:flex" data-testid="link-header-discord">Join my community <FaDiscord size={14} /></a>
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
        <Reveal className="editorial-hero-copy mt-8 max-w-[480px] text-[16px] leading-7 opacity-75" delay={160}>
          <strong className="mono block text-[12px] uppercase tracking-[.18em]">ML &amp; BACKEND ENGINEER</strong>
          <span className="mono block text-[12px] uppercase tracking-[.18em] mt-2">CS 2029</span>
          <span className="mt-5 block" id="hero-description">Building at the intersection of Machine Learning and Backend Engineering.<br />Developing end to end software across machine learning, backend systems, databases, APIs, and frontend development.</span>
        </Reveal>
        <Reveal className="mt-9 flex flex-wrap items-center gap-3" delay={240}>
          <button type="button" onClick={() => startGuidedTour()} className="tour-cta button-primary magnetic-button inline-flex items-center gap-3 px-6 py-3.5 text-[12px] font-bold uppercase tracking-[.18em]" data-testid="button-hero-tour">Give me tour !! <MousePointerClick size={15} className="hero-tour-icon" /></button>
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

/* Renders **bold** spans inside project copy so emphasis survives as plain data */
function renderBold(text: string): ReactNode {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part));
}

/* Auto-playing screenshot slideshow — crossfades one slide every 2 seconds */
function ImageSlideshow({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    /* Fetch AND decode every slide up front so a switch is a clean instant
       cut — the browser never paints a half decoded image or the backdrop. */
    for (const src of images) {
      const img = new window.Image();
      img.src = src;
      img.decode?.().catch(() => {});
    }
  }, [images]);
  useEffect(() => {
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % images.length), 2000);
    return () => window.clearInterval(timer);
  }, [images.length]);
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#121417]">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Screenshot ${i + 1} of ${images.length}`}
          decoding="async"
          draggable={false}
          className={`absolute inset-0 h-full w-full object-cover ${i === index ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden="true">
        {images.map((src, i) => (
          <span key={src} className={`h-1 w-1 rounded-full bg-white transition-opacity duration-300 ${i === index ? 'opacity-95' : 'opacity-35'}`} />
        ))}
      </div>
    </div>
  );
}

function ProjectVisual({ accent, year, compact = false, images }: { accent: string; year: string; compact?: boolean; images?: string[] }) {
  const background = accent === 'coral' ? '#d5c3ad' : accent === 'gold' ? '#d7d5bd' : accent === 'blue' ? '#bdccd0' : '#c9ced0';
  if (images && images.length > 0) {
    return (
      <div className={`project-visual project-visual-slideshow relative aspect-[2/1] w-full overflow-hidden border border-current/20 ${compact ? '' : 'mb-5'}`}>
        <ImageSlideshow images={images} />
      </div>
    );
  }
  if (compact) {
    return (
      <div className="project-visual relative overflow-hidden border border-current/20" style={{ backgroundColor: background, height: '7rem' }}>
        <div className="absolute bottom-2 left-3 right-3 top-2 border border-current/25 bg-black/10 p-2.5">
          <div className="mb-2 flex gap-1"><span className="h-1 w-1 rounded-full bg-current" /><span className="h-1 w-1 rounded-full bg-current opacity-35" /><span className="h-1 w-1 rounded-full bg-current opacity-15" /></div>
          <div className="grid h-8 grid-cols-[.8fr_1.2fr] gap-2">
            <div className="border border-current/15 p-1.5"><div className="h-1.5 w-1/2 bg-current/40" /><div className="mt-1.5 h-3 w-full bg-current/15" /></div>
            <div className="border border-current/15 p-1.5"><div className="h-1.5 w-1/3 bg-current/40" /><div className="mt-1.5 flex h-3 items-end gap-1">{[35, 60, 42, 78, 50, 88, 63].map((h, i) => <span key={i} className="flex-1 bg-current/35" style={{ height: `${h}%` }} />)}</div></div>
          </div>
        </div>
      </div>
    );
  }
  return <div className="project-visual relative mb-5 overflow-hidden border border-current/20 p-4" style={{ backgroundColor: background, height: '13rem' }}>
    <div className="absolute bottom-5 left-5 right-5 top-4 border border-current/25 bg-black/10 p-3">
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
        <div className="mb-1 flex justify-end">
          <button
            type="button"
            className="project-modal-close"
            onClick={handleClose}
            aria-label="Close project details"
            data-testid={`button-project-modal-close-${project.number}`}
          >
            <X size={16} />
          </button>
        </div>
        <ProjectVisual accent={project.accent} year={project.year} images={project.images} />
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {project.stack.map(tag => <span className="mono border border-current/30 px-2.5 py-1.5 text-[11px] font-semibold opacity-90" key={tag}>{tag}</span>)}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="button-primary inline-flex items-center gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-[.15em] hover:underline hover:underline-offset-4" data-testid={`link-project-live-${project.number}`}>Live site <ArrowUpRight size={13} /></a>
          <a href={project.github} target="_blank" rel="noopener noreferrer" className="button-quiet inline-flex items-center gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-[.15em] hover:underline hover:underline-offset-4" data-testid={`link-project-github-${project.number}`}>GitHub <FaGithub size={13} /></a>
        </div>
        <h3 className="display mt-5 text-3xl tracking-[-.04em]">{project.name}</h3>
        {project.details.map((para) => <p key={para.slice(0, 32)} className="mt-3 text-[15px] leading-7 opacity-85">{renderBold(para)}</p>)}
        <ul className="project-highlights mt-3">
          {project.capabilities.map((item) => (
            <li key={item} className="flex items-start gap-1.5 text-[14px] leading-6 opacity-80">
              <span className="shrink-0" aria-hidden="true">•</span>
              <span>{renderBold(item)}</span>
            </li>
          ))}
        </ul>
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
        className="project-card project-card-compact katana-card flex h-full flex-col p-5"
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
        <ProjectVisual accent={project.accent} year={project.year} compact images={project.images} />
        <h3 className="display mt-4 text-2xl font-semibold leading-tight tracking-[-.02em]">{project.name}</h3>
        <span className="katana-card-line" aria-hidden="true" />
        <p className="mb-4 mt-2 text-[15px] font-medium leading-7 opacity-80">{project.description}</p>
        <span className="project-open-cta mono mt-auto flex items-center justify-center gap-2 border border-current/20 py-2 text-[9px] uppercase tracking-[.15em] opacity-60">
          Open project <ArrowUpRight size={12} />
        </span>
      </article>
      {open && createPortal(<ProjectModal project={project} onClose={handleClose} />, document.body)}
    </>
  );
}

/* Reserved slot — a quiet, non-interactive card kept empty until the next project ships. */
function EmptyProjectCard() {
  return (
    <article className="project-card project-card-compact katana-card flex h-full flex-col p-5" aria-hidden="true">
      <ProjectVisual accent="ink" year="" compact />
      <div className="flex flex-1 items-center justify-center">
        <span className="mono text-[9px] uppercase tracking-[.16em] opacity-30">Coming soon</span>
      </div>
    </article>
  );
}

function Projects() {
  return (
    <section id="projects" className="section-anchor border-t border-current/20 py-14">
      <div className="section-wrap">
        <Reveal className="mb-12 flex items-end gap-5"><div><h2 className="section-title section-title-sm display">A few things<br /><span>I’ve made.</span></h2></div></Reveal>
        <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:gap-5">
          {projects.map((project, index) => <Reveal key={project.name} delay={index * 80} className="h-full"><ProjectCard project={project} /></Reveal>)}
          {Array.from({ length: emptyProjectSlots }, (_, i) => (
            <Reveal key={`empty-slot-${i}`} delay={(projects.length + i) * 80} className="h-full"><EmptyProjectCard /></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section id="skills" className="section-anchor border-t border-current/20 py-14">
      <div className="section-wrap">
        <Reveal className="mb-12">
          <div><h2 className="section-title section-title-sm display">Tech stack<br /><span>I work with.</span></h2></div>
        </Reveal>
        <Reveal>
          <div className="divide-y divide-current/10 border-t border-current/10">
            {skills.map((group) => (
              <div key={group.title} className="skill-group grid gap-2 py-5 sm:grid-cols-[170px_1fr] sm:gap-8">
                <div className="mono flex items-center gap-2 text-[10px] font-medium uppercase leading-5 tracking-[.13em] opacity-85 sm:pt-1">
                  <span>{group.title}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  {group.items.map((item) => (
                    <span key={item.name} className="inline-flex items-center gap-2">
                      <item.Icon size={16} className="shrink-0" />
                      <span className="whitespace-nowrap font-medium">{item.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ResumeModal({ resumeImg, resumePdf, onClose }: { resumeImg: string; resumePdf: string; onClose: () => void }) {
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
      aria-label="Full resume"
    >
      <div className="project-modal-panel resume-modal-panel" data-testid="resume-modal-panel" onClick={(event) => event.stopPropagation()}>
        <div className="flex shrink-0 items-start justify-between gap-4">
          <div className="mono text-[10px] uppercase tracking-[.2em] opacity-60">Resume — full page</div>
          <button
            type="button"
            className="project-modal-close"
            onClick={handleClose}
            aria-label="Close resume"
            data-testid="button-resume-modal-close"
          >
            <X size={16} />
          </button>
        </div>
        <img src={resumeImg} alt="Piyush Baraskar — full resume" className="resume-modal-img" data-testid="img-resume-full" />
        <div className="resume-modal-actions">
          <a href={resumePdf} target="_blank" rel="noopener noreferrer" className="resume-download" data-testid="link-resume-download">
            Download PDF <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}

function ResumeCard() {
  const [open, setOpen] = useState(false);
  const base = import.meta.env.BASE_URL;
  const resumePdf = `${base}resume.pdf`;
  const resumeImg = `${base}resume-1.png`;
  return (
    <div className="resume-card">
      <div className="resume-sheet">
        <div className="resume-unroll">
          <div className="resume-unroll-frame">
            <img src={resumeImg} alt="Piyush Baraskar — resume" loading="lazy" data-testid="img-resume" />
          </div>
          <div className="resume-fold" aria-hidden="true" />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="resume-toggle"
        aria-haspopup="dialog"
        data-testid="button-resume-toggle"
      >
        <span>View resume</span>
        <ArrowUpRight size={13} />
      </button>

      {open && createPortal(<ResumeModal resumeImg={resumeImg} resumePdf={resumePdf} onClose={() => setOpen(false)} />, document.body)}
    </div>
  );
}

function Experience() {
  return (
    <section id="experience" className="section-anchor border-t border-current/20 py-10">
      <div className="section-wrap">
        <Reveal className="mb-8">
          <div>
            <h2 className="section-title section-title-sm display">The record<br /><span>I’m building.</span></h2>
            <p className="mt-5 max-w-[440px] text-sm leading-6 opacity-70">My experience, the programming community I’ve built, and the opportunities that have shaped my journey so far and resume.</p>
          </div>
        </Reveal>

        <Reveal className="mono mb-3 text-[10px] uppercase tracking-[.15em] opacity-60">Experience</Reveal>
        <div className="divide-y divide-current/20 border-y border-current/20">
          {experience.map(({ date, role, description }) => (
            <div key={role} className="grid gap-2 py-4 sm:grid-cols-[.28fr_.72fr]">
              <div className="mono text-[10px] font-medium uppercase leading-5 tracking-[.13em] opacity-85">{date}</div>
              <div>
                <h3 className="display text-lg">{role}</h3>
                <p className="mt-1.5 max-w-[470px] text-sm leading-6 opacity-65">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid items-start gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-0 lg:divide-x lg:divide-current/15">
          <div className="lg:pr-12">
            <Reveal className="mono mb-3 text-[10px] uppercase tracking-[.15em] opacity-60">Achievements</Reveal>
            <Reveal>
              <div className="divide-y divide-current/10 border-t border-current/10">
                {achievements.map(({ key, title, detail }) => (
                  <div key={key} className="achievement-row py-4">
                    <h3 className="display text-lg">{title}</h3>
                    <p className="mt-1.5 max-w-[470px] text-sm leading-6 opacity-65">{detail}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="lg:pl-12">
            <Reveal className="mono mb-3 text-[10px] uppercase tracking-[.15em] opacity-60">Resume</Reveal>
            <Reveal><ResumeCard /></Reveal>
          </div>
        </div>

      </div>
    </section>
  );
}

const CONTACT_INBOX = 'piyush.intech@gmail.com';

function Contact() {
  return (
    <section id="contact" className="section-anchor contact-section py-6">
      <div className="section-wrap contact-inner">
        <Reveal>
          <div className="max-w-[520px]"><h2 className="section-title section-title-sm display">Let’s build<br /><span>something useful</span></h2><p className="mt-5 max-w-[440px] text-sm leading-6 opacity-70">Have an idea worth building, a problem worth solving, or just want to talk tech? I’m always open to new ideas, collaborations, and interesting conversations.</p></div>
          <div className="mt-8 grid gap-8 md:grid-cols-2 lg:gap-7">
            <div className="border-t border-current/20 pt-5"><div className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Direct</div><div className="mt-4 grid gap-4"><div><div className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Email</div><a className="mt-2 inline-block text-sm hover:underline" href={`mailto:${CONTACT_INBOX}`} data-testid="link-contact-address">{CONTACT_INBOX}</a></div><div><div className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Availability</div><p className="mt-2 text-sm opacity-70" data-testid="text-availability">Open for freelancing, internships and full-time roles</p></div></div></div>
            <nav className="border-t border-current/20 pt-5" aria-label="Contact channels"><div className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Elsewhere</div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">{socialLinks.filter(({ label }) => label === 'LinkedIn' || label === 'X (Twitter)').map(({ label, href, Icon, testId }) => (<a key={label} href={href} target="_blank" rel="noreferrer" className="group inline-flex w-fit items-center gap-2.5 text-sm" data-testid={testId.replace('link-nav-', 'link-contact-')}><span className="flex h-6 w-6 shrink-0 items-center justify-center border border-current/30 transition-colors group-hover:bg-current/5"><Icon size={12} /></span><span className="opacity-70 transition-opacity group-hover:opacity-100 group-hover:underline group-hover:underline-offset-4">{label}</span></a>))}</div></nav>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Home() {
  return <main className="site-shell theme-editorial paper-noise"><CursorSlash /><DecorativeBranches /><FallingLeaves /><WanderingCat /><Header /><Hero /><Projects /><Skills /><Experience /><Contact /><ScrollToTop /><GuidedTour /></main>;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /><IntroSequence /></WouterRouter>;
}

export default App;
