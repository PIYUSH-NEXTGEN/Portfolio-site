import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp, ArrowUpRight, Menu, MousePointerClick, Star, X } from 'lucide-react';
import { FaDiscord, FaGithub } from 'react-icons/fa6';
import { Analytics } from '@vercel/analytics/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { IntroSequence } from '@/components/intro/IntroSequence';
import { CursorSlash, NavKatana } from '@/components/Katana';
import { ModalBackdrop, useModalClose } from '@/components/Modal';
import GuidedTour, { startGuidedTour } from '@/components/GuidedTour';
import { DecorativeBranches } from '@/components/Decorations';
import { WanderingCat } from '@/components/WanderingCat';
import NotFound from '@/pages/NotFound';
import {
  achievements,
  CONTACT_INBOX,
  emptyProjectSlots,
  experience,
  projects,
  skills,
  socialLinks,
  type Project,
} from '@/data/portfolio-content';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import '@/index.css';

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

/* Hero portrait — fixed artwork (public/pfp.webp, a quality-90 WebP build of
   public/pfp.png at 480x482: 160KB -> 24KB with no visible change at the
   ~300px display size). The PNG is kept in public/ for the og:/twitter:
   preview only, since social scrapers still want a universally supported
   format. The click-to-upload / change-photo picker was removed, so the slot
   is a plain, non-interactive image: no file input, no empty "Your photo
   here" state. */
function HeroPhoto() {
  const photo = `${import.meta.env.BASE_URL}pfp.webp`;
  return (
    <div className="hero-photo-slot" data-testid="hero-photo-slot">
      <div className="hero-photo-filled">
        {/* Above the fold: load eagerly, tell the browser it is the priority
            image, and declare the sprite's true 480x482 size so the frame is
            reserved before a byte arrives. */}
        <img
          src={photo}
          alt="Piyush Baraskar — portrait"
          width={480}
          height={482}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  // Dismiss on Escape/outside press, and reset when desktop navigation takes over.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1100px)');
    const onResize = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', onResize);
    return () => desktop.removeEventListener('change', onResize);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);
  // Publish the measured header height so page-level decorations (branches,
  // katana) can clear the navbar even when the phone layout wraps it taller.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const sync = () => document.documentElement.style.setProperty('--nav-h', `${Math.round(header.getBoundingClientRect().height)}px`);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  const links = [['projects', 'Work'], ['skills', 'Skills'], ['experience', 'Experience'], ['contact', 'Contact']];
  return (
    <header ref={headerRef} className="nav sticky top-0 z-20" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <div className="section-wrap nav-inner">
        <div className="nav-socials" aria-label="Social links">
          {socialLinks.map(({ label, href, Icon, testId, color }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} data-testid={testId} className="social-link" style={{ '--brand': color } as CSSProperties}>
              <Icon size={18} />
            </a>
          ))}
        </div>
        <nav id="primary-navigation" className={`primary-navigation${open ? ' mobile-nav-open' : ''}`} aria-label="Primary navigation">
          {links.map(([id, label]) => (
            <a onClick={() => setOpen(false)} href={`#${id}`} className="nav-link text-[10px] font-medium uppercase tracking-[.17em] opacity-70 transition-opacity hover:opacity-100" key={id} data-testid={`link-nav-${id}`}>{label}</a>
          ))}
        </nav>
        <NavKatana />
        <a href="https://discord.gg/CSmrA5fbx9" target="_blank" rel="noopener noreferrer" aria-label="Join my community on Discord" className="nav-community button-primary inline-flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-[.12em] transition-transform" data-testid="link-header-discord">Join my community <FaDiscord size={14} /></a>
        <button ref={menuRef} type="button" onClick={() => setOpen(value => !value)} className="nav-menu-button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="primary-navigation" data-testid="button-mobile-menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="section-anchor section-wrap editorial-hero katana-hero grid min-h-[calc(100dvh-70px)] items-center gap-12 py-16 lg:grid-cols-[1.15fr_.85fr] lg:gap-16 lg:py-20">
      <div className="katana-hero-content">
        <Reveal className="hero-copy display max-w-[900px]" delay={80}><h1 className="m-0"><span className="block">PIYUSH BARASKAR</span></h1></Reveal>
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
        <Reveal className="hero-photo-wrap relative" delay={160}>
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

/* Auto-playing screenshot slideshow — crossfades one slide every 2 seconds.
   It sits below the fold, so the slides are loading="lazy" and the
   preload/decode pass waits until the card is on screen: a slideshow the
   visitor never scrolls to costs no bytes, and the five screenshots never
   compete with the hero image on first load. The interval only runs while the
   card is on screen, so it never causes background re-renders or idle work. */
const SLIDE_INTERVAL_MS = 2000;

function ImageSlideshow({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    /* Fetch AND decode every slide the moment the card is on screen so a
       switch is a clean instant cut — the browser never paints a half decoded
       image or the backdrop. */
    if (!onScreen) return;
    for (const src of images) {
      const img = new window.Image();
      img.src = src;
      img.decode?.().catch(() => {});
    }
  }, [onScreen, images]);
  useEffect(() => {
    const node = containerRef.current;
    if (!node || !('IntersectionObserver' in window)) {
      setOnScreen(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!onScreen) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % images.length), SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [onScreen, images.length]);
  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-[#121417]">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Screenshot ${i + 1} of ${images.length}`}
          loading="lazy"
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

function ProjectVisual({ accent, compact = false, images }: { accent: string; compact?: boolean; images?: string[] }) {
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

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { visible, closing, handleClose } = useModalClose(onClose);

  return (
    <ModalBackdrop
      visible={visible}
      closing={closing}
      onClose={handleClose}
      label={`${project.name} — project details`}
      panelTestId={`project-modal-panel-${project.number}`}
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
      <ProjectVisual accent={project.accent} images={project.images} />
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
    </ModalBackdrop>
  );
}

function ProjectCard({ project }: { project: Project }) {
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
        <ProjectVisual accent={project.accent} compact images={project.images} />
        <h3 className="display mt-4 text-2xl leading-tight">{project.name}</h3>
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
      <ProjectVisual accent="ink" compact />
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

function ResumeCard() {
  return (
    <div className="resume-sheet">
      <p className="py-10 text-center text-sm opacity-70" data-testid="text-resume-status">Uploading soon.....</p>
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

        <div className="mt-10 grid items-stretch gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-0 lg:divide-x lg:divide-current/15">
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

          <div className="flex flex-col lg:pl-12">
            <Reveal className="mono mb-3 text-[10px] uppercase tracking-[.15em] opacity-60">Resume</Reveal>
            <Reveal className="grid flex-1"><ResumeCard /></Reveal>
          </div>
        </div>

      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="section-anchor contact-section py-6">
      <div className="section-wrap contact-inner">
        <Reveal>
          <div className="max-w-[520px]"><h2 className="section-title section-title-sm display">Let’s build<br /><span>something useful</span></h2><p className="mt-5 max-w-[440px] text-sm leading-6 opacity-70">Have an idea worth building, a problem worth solving, or just want to talk tech? I’m always open to new ideas, collaborations, and interesting conversations.</p></div>
          <div className="mt-8 grid gap-8 md:grid-cols-2 lg:gap-7">
            <div className="border-t border-current/20 pt-5"><div className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Direct</div><div className="mt-4 grid gap-4"><div><div className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Email</div><a className="mt-2 inline-block text-sm hover:underline" href={`mailto:${CONTACT_INBOX}`} data-testid="link-contact-address">{CONTACT_INBOX}</a></div><div><div className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Availability</div><p className="mt-2 text-sm opacity-70" data-testid="text-availability">Open for freelancing, internships and full-time roles</p></div></div></div>
            <nav className="border-t border-current/20 pt-5" aria-label="Contact channels"><div className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Elsewhere</div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">{socialLinks.filter(({ contact }) => contact).map(({ label, href, Icon, testId }) => (<a key={label} href={href} target="_blank" rel="noopener noreferrer" className="group inline-flex w-fit items-center gap-2.5 text-sm" data-testid={testId.replace('link-nav-', 'link-contact-')}><span className="flex h-6 w-6 shrink-0 items-center justify-center border border-current/30 transition-colors group-hover:bg-current/5"><Icon size={12} /></span><span className="opacity-70 transition-opacity group-hover:opacity-100 group-hover:underline group-hover:underline-offset-4">{label}</span></a>))}</div></nav>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-current/10 pt-6 text-sm">
            <span className="opacity-70">Like the design?</span>
            <a
              href="https://github.com/PIYUSH-NEXTGEN/Portfolio-site"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium hover:underline hover:underline-offset-4"
              data-testid="link-star-repo"
            >
              <Star size={14} fill="none" aria-hidden="true" />
              Star the repo
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
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
  return (
    <>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
        <IntroSequence />
      </WouterRouter>
      <Analytics />
    </>
  );
}

export default App;
