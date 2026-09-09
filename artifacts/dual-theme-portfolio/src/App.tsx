import { type ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowDown, ArrowRight, ArrowUpRight, Boxes, Code2, Cpu, Layers3, Menu, Terminal, X } from 'lucide-react';
import { SiLeetcode, SiPeerlist } from 'react-icons/si';
import { FaDev, FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { ErrorBoundary } from '@/components/error-boundary';
import { CursorSlash, HeroKatana, SlashDivider } from '@/components/Katana';
import { BambooDecoration, DecorativeBranches } from '@/components/Decorations';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import '@/index.css';

const queryClient = new QueryClient();

const projects = [
  {
    number: '01',
    name: 'Kintsugi',
    kind: 'Product dashboard',
    description: 'A calm operations cockpit for teams turning messy inputs into decisions they can trust.',
    stack: ['React', 'Node.js', 'Postgres'],
    accent: 'coral',
  },
  {
    number: '02',
    name: 'Akari Commerce',
    kind: 'Commerce platform',
    description: 'A faster, more human storefront system for independent makers and small-batch goods.',
    stack: ['Next.js', 'Stripe', 'Prisma'],
    accent: 'gold',
  },
  {
    number: '03',
    name: 'Sora Studio',
    kind: 'Creative tool',
    description: 'A collaborative workspace that gives creative teams a shared surface for early ideas.',
    stack: ['TypeScript', 'WebSockets', 'Figma'],
    accent: 'blue',
  },
  {
    number: '04',
    name: 'Mono API',
    kind: 'Developer tool',
    description: 'A lightweight API layer that makes complex workflows legible, observable, and quick.',
    stack: ['Go', 'GraphQL', 'Docker'],
    accent: 'ink',
  },
];

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com', Icon: FaGithub, testId: 'link-nav-github' },
  { label: 'LinkedIn', href: 'https://linkedin.com', Icon: FaLinkedin, testId: 'link-nav-linkedin' },
  { label: 'X (Twitter)', href: 'https://x.com', Icon: FaXTwitter, testId: 'link-nav-x' },
  { label: 'Peerlist', href: 'https://peerlist.io', Icon: SiPeerlist, testId: 'link-nav-peerlist' },
  { label: 'LeetCode', href: 'https://leetcode.com', Icon: SiLeetcode, testId: 'link-nav-leetcode' },
  { label: 'dev.to', href: 'https://dev.to', Icon: FaDev, testId: 'link-nav-devto' },
];

const skills = [
  { title: 'Languages', icon: Code2, detail: 'TypeScript, JavaScript, Python, Go, SQL, HTML, CSS' },
  { title: 'Frontend', icon: Layers3, detail: 'React, Next.js, Vite, Tailwind CSS, Framer Motion, accessibility' },
  { title: 'Backend', icon: Terminal, detail: 'Node.js, Express, REST APIs, GraphQL, Postgres, Prisma, WebSockets' },
  { title: 'Libraries & Tools', icon: Boxes, detail: 'React Query, Zod, React Hook Form, Recharts, Git, GitHub, VS Code, Figma' },
  { title: 'Machine Learning', icon: Cpu, detail: 'Python, scikit-learn, TensorFlow, data pipelines, model evaluation, prompt engineering' },
  { title: 'Deployment & DevOps', icon: ArrowUpRight, detail: 'Docker, CI/CD, Linux, Vercel, Replit, monitoring, env management' },
];

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = document.querySelector(`[data-reveal="${delay}-${className.slice(0, 8)}"]`);
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
  }, [className, delay]);
  return <div data-reveal={`${delay}-${className.slice(0, 8)}`} className={`${visible ? 'reveal' : 'opacity-0 translate-y-4'} ${className}`} style={{ animationDelay: `${delay}ms` }}>{children}</div>;
}

function FallingLeaves() {
  return (
    <div className="falling-leaves" aria-hidden="true">
      {Array.from({ length: 14 }, (_, index) => <span className={`falling-leaf falling-leaf-${index + 1}`} key={index} />)}
    </div>
  );
}

function HeroPhoto() {
  const defaultPhoto = `${import.meta.env.BASE_URL}image.png`;
  const [photo, setPhoto] = useState<string | null>(defaultPhoto);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
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
          <img src={photo} alt="Profile photo" />
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
        accept="image/*"
        className="hidden"
        aria-label="Upload hero photo"
        data-testid="input-hero-photo"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [['about', 'About'], ['projects', 'Work'], ['skills', 'Skills'], ['experience', 'Journey'], ['contact', 'Contact']];
  return (
    <header className="nav sticky top-0 z-20">
      <div className="section-wrap flex min-h-[68px] flex-nowrap items-center justify-between gap-3 py-2 sm:gap-4">
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2" aria-label="Social links">
          {socialLinks.map(({ label, href, Icon, testId }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} data-testid={testId} className="social-link">
              <Icon size={15} />
            </a>
          ))}
        </div>
        <nav className={`${open ? 'mobile-nav-open absolute left-4 right-4 top-[64px] flex flex-col items-start gap-4 border border-current bg-[var(--paper,#ece4d3)] p-5 shadow-lg md:static md:flex md:flex-row md:items-center md:gap-5 md:border-0 md:bg-transparent md:p-0 md:shadow-none lg:gap-7' : 'hidden md:flex'} items-center gap-5 md:gap-5 lg:gap-7`} aria-label="Primary navigation">
          {links.map(([id, label]) => (
            <a onClick={() => setOpen(false)} href={`#${id}`} className="nav-link text-[10px] font-medium uppercase tracking-[.17em] opacity-70 transition-opacity hover:opacity-100" key={id} data-testid={`link-nav-${id}`}>{label}</a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a href="#contact" className="button-primary hidden items-center gap-2 whitespace-nowrap px-3 py-2 text-[10px] font-semibold uppercase tracking-[.12em] transition-transform sm:flex" data-testid="link-header-contact">Start a project <ArrowUpRight size={13} /></a>
          <button type="button" onClick={() => setOpen(!open)} className="flex h-9 w-9 shrink-0 items-center justify-center border border-current md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">
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
      <HeroKatana />
      <div className="katana-hero-content">
        <Reveal className="mb-8" delay={0}><div className="mono flex items-center gap-3 text-[10px] uppercase tracking-[.2em] opacity-65"><span className="h-2 w-2 bg-current" /> Full-stack developer <span className="opacity-40">/</span> creative technologist</div></Reveal>
        <Reveal className="hero-copy display max-w-[900px]" delay={80}><span className="block">Digital craft</span><span className="serif block normal-case tracking-[-.05em]">built with</span><span className="block text-[.86em]">intent.</span></Reveal>
        <Reveal className="editorial-hero-copy mt-8 max-w-[480px] text-[15px] leading-7 opacity-75" delay={160}>
          <strong className="mono block text-[10px] uppercase tracking-[.18em] opacity-75">Alex Morgan</strong>
          <span className="mt-3 block">I build thoughtful web experiences, blending code, design, and curiosity to solve real problems for real people.</span>
        </Reveal>
        <Reveal className="mt-9 flex flex-wrap items-center gap-3" delay={240}>
          <a href="#projects" className="button-primary magnetic-button inline-flex items-center gap-3 px-5 py-3 text-[11px] font-semibold uppercase tracking-[.16em]" data-testid="link-hero-work">View selected work <ArrowDown size={14} /></a>
          <a href="#about" className="button-quiet magnetic-button inline-flex items-center gap-3 px-5 py-3 text-[11px] font-semibold uppercase tracking-[.16em]" data-testid="link-hero-about">Read the story <ArrowRight size={14} /></a>
        </Reveal>
        <Reveal className="mt-14 flex items-center gap-4 text-xs opacity-60" delay={320}>
          <span className="mono text-[10px] uppercase tracking-[.18em]">Based in Bengaluru, India</span><span className="h-px w-14 bg-current" /><span className="mono text-[10px] uppercase tracking-[.18em]">Available for select work</span>
        </Reveal>
      </div>
      <Reveal className="hero-photo-wrap relative min-h-[300px] overflow-hidden sm:min-h-[380px]" delay={160}>
        <HeroPhoto />
      </Reveal>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="section-anchor border-t border-current/20 py-24">
      <div className="section-wrap grid gap-12 lg:grid-cols-[.9fr_1.1fr]">
        <Reveal><div className="mono mb-4 text-[10px] uppercase tracking-[.2em] opacity-60">02 / About me</div><h2 className="section-title display max-w-[420px]">Turning ideas into <span className="serif normal-case">interactive</span> experiences.</h2></Reveal>
        <div className="grid gap-10 sm:grid-cols-[1.2fr_.8fr]">
          <Reveal delay={100}><p className="serif text-3xl leading-[1.08]">I’m Alex Morgan, a full-stack developer who likes the space between a rough idea and the moment it becomes useful.</p><p className="mt-6 max-w-[520px] text-sm leading-7 opacity-70">For the last 4+ years, I’ve worked across product teams and small studios — shaping systems, shipping interfaces, and asking the slightly annoying questions that make a product clearer.</p></Reveal>
          <Reveal delay={180} className="border-l border-current/20 pl-5"><div className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Currently</div><p className="mt-3 text-sm leading-6">Independent<br />building useful things<br /><span className="opacity-55">open to good collaborations</span></p><div className="mono mt-10 text-[10px] uppercase tracking-[.15em] opacity-60">Focus</div><p className="mt-3 text-sm leading-6 opacity-70">Interfaces, systems,<br />and thoughtful tooling</p></Reveal>
        </div>
      </div>
    </section>
  );
}

function ProjectVisual({ accent }: { accent: string }) {
  const background = accent === 'coral' ? '#d5c3ad' : accent === 'gold' ? '#d7d5bd' : accent === 'blue' ? '#bdccd0' : '#c9ced0';
  return <div className="relative mb-5 h-44 overflow-hidden border border-current/20 p-4" style={{ backgroundColor: background }}>
    <div className="absolute left-4 top-4 mono text-[9px] opacity-60">PREVIEW / 2026</div>
    <div className="absolute bottom-5 left-5 right-5 top-12 border border-current/25 bg-black/10 p-3">
      <div className="mb-3 flex gap-1"><span className="h-1.5 w-1.5 rounded-full bg-current" /><span className="h-1.5 w-1.5 rounded-full bg-current opacity-35" /><span className="h-1.5 w-1.5 rounded-full bg-current opacity-15" /></div>
      <div className="grid h-20 grid-cols-[.8fr_1.2fr] gap-2"><div className="border border-current/15 p-2"><div className="h-2 w-1/2 bg-current/40" /><div className="mt-3 h-8 w-full bg-current/15" /></div><div className="border border-current/15 p-2"><div className="h-2 w-1/3 bg-current/40" /><div className="mt-3 flex h-8 items-end gap-1">{[35,60,42,78,50,88,63].map((height, index) => <span key={index} className="flex-1 bg-current/35" style={{ height: `${height}%` }} />)}</div></div></div>
    </div>
  </div>;
}

function Projects() {
  return (
    <section id="projects" className="section-anchor border-t border-current/20 py-24">
      <div className="section-wrap">
        <SlashDivider />
        <Reveal className="mb-12 flex items-end justify-between gap-5"><div><div className="mono mb-4 text-[10px] uppercase tracking-[.2em] opacity-60">03 / Selected work</div><h2 className="section-title display">A few things<br /><span className="serif normal-case">I’ve made.</span></h2></div><a href="#contact" className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] opacity-65 transition-opacity hover:opacity-100 sm:flex" data-testid="link-all-projects">Have a project in mind? <ArrowUpRight size={14} /></a></Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project, index) => <Reveal key={project.name} delay={index * 80}><article className="project-card katana-card h-full p-4" data-testid={`card-project-${project.number}`}><div className="mb-3 flex items-center justify-between mono text-[9px] opacity-60"><span>{project.number}</span><span>{project.kind}</span></div><ProjectVisual accent={project.accent} /><h3 className="display text-xl tracking-[-.04em]">{project.name}</h3><span className="katana-card-line" aria-hidden="true" /><p className="mt-3 min-h-[72px] text-xs leading-5 opacity-70">{project.description}</p><div className="mt-4 flex flex-wrap gap-1.5">{project.stack.map(tag => <span className="mono border border-current/20 px-2 py-1 text-[9px] opacity-70" key={tag}>{tag}</span>)}</div><a href="#contact" className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.15em] opacity-75 hover:opacity-100" data-testid={`link-project-${project.number}`}>Discuss a build <ArrowUpRight size={13} /></a></article></Reveal>)}
        </div>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section id="skills" className="section-anchor border-t border-current/20 py-24">
      <div className="section-wrap">
        <Reveal className="mb-12 grid gap-6 md:grid-cols-[.65fr_1.35fr]">
          <div>
            <div className="mono mb-4 text-[10px] uppercase tracking-[.2em] opacity-60">04 / Capabilities</div>
            <h2 className="section-title display">Tech stack<br /><span className="serif normal-case">I work with.</span></h2>
          </div>
          <p className="max-w-[400px] self-end text-sm leading-7 opacity-70">A practical stack for shipping end-to-end — from language fundamentals to production deploys and ML experiments.</p>
        </Reveal>
        <div className="skills-grid">
          {skills.map(({ title, icon: Icon, detail }, index) => (
            <Reveal key={title} delay={index * 70} className="skills-cell">
              <div className="skills-card group">
                <div className="skills-card-top">
                  <span className="skills-icon"><Icon size={20} strokeWidth={1.6} /></span>
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

function Experience() {
  return (
    <section id="experience" className="section-anchor border-t border-current/20 py-24">
      <div className="section-wrap grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
        <Reveal><div className="mono mb-4 text-[10px] uppercase tracking-[.2em] opacity-60">05 / Journey</div><h2 className="section-title display">The long<br /><span className="serif normal-case">version.</span></h2><p className="mt-7 max-w-[280px] text-sm leading-6 opacity-65">A non-linear path through engineering, design, and the quiet discipline of finishing.</p></Reveal>
        <div className="divide-y divide-current/20 border-y border-current/20">{[['2024 — now', 'Independent / creative technologist', 'Building selected digital products with people who care about the details.'], ['2022 — 2024', 'TechNova / frontend developer', 'Led a small interface team, shipped a design system, and made performance a feature.'], ['2020 — 2022', 'Westmark Studio / engineer', 'Built commerce and editorial experiences for ambitious independent brands.'], ['2016 — 2020', 'B.Tech in Computer Science', 'The beginning: too many side projects, not enough sleep, a useful foundation.']].map(([date, role, description], index) => <Reveal key={date} delay={index * 80}><div className="grid gap-3 py-6 sm:grid-cols-[.28fr_.72fr]"><div className="mono text-[10px] uppercase tracking-[.13em] opacity-60">{date}</div><div><h3 className="display text-lg">{role}</h3><p className="mt-2 max-w-[470px] text-sm leading-6 opacity-65">{description}</p></div></div></Reveal>)}</div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="section-anchor contact-section border-t border-current/20 py-24">
      <BambooDecoration />
      <div className="section-wrap contact-inner">
        <Reveal className="grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div><div className="mono mb-6 text-[10px] uppercase tracking-[.2em] opacity-60">06 / Get in touch</div><h2 className="section-title display">Let’s make<br /><span className="serif normal-case">something useful.</span></h2><p className="mt-7 max-w-[440px] text-sm leading-7 opacity-70">Have a project in mind, a team that needs a thoughtful pair of hands, or just a good question? I’m always up for a conversation.</p><a href="mailto:alex@example.com" className="button-primary mt-8 inline-flex items-center gap-3 px-5 py-3 text-[11px] font-semibold uppercase tracking-[.16em]" data-testid="link-contact-email">Send an email <ArrowUpRight size={14} /></a></div>
          <div className="grid content-end gap-5 border-l border-current/20 pl-6 sm:pl-10"><div><div className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Email</div><a className="mt-2 inline-block text-sm hover:underline" href="mailto:alex@example.com" data-testid="link-contact-address">alex.morgan@example.com</a></div><div><div className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Availability</div><p className="mt-2 text-sm opacity-70">Open to select freelance and full-time roles</p></div></div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return <footer className="footer border-t border-current/15 py-7"><div className="section-wrap footer-inner flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center border border-current font-mono text-[10px] font-bold">AM</span><span className="text-xs opacity-70">Alex Morgan — full-stack developer & creative technologist</span></div><div className="mono text-[9px] uppercase tracking-[.15em] opacity-55">© 2026 / made with care</div></div></footer>;
}

function Home() {
  return <main className="site-shell theme-editorial paper-noise"><CursorSlash /><DecorativeBranches /><FallingLeaves /><Header /><Hero /><About /><Projects /><Skills /><Experience /><Contact /><Footer /></main>;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;