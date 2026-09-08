import { type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowDown, ArrowRight, ArrowUpRight, Boxes, Code2, Cpu, ExternalLink, Github, Layers3, Linkedin, Mail, MapPin, Menu, PenTool, Terminal, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
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

const skills = [
  { title: 'Frontend', icon: Code2, detail: 'React, Next.js, TypeScript, HTML, CSS, accessibility, motion' },
  { title: 'Backend', icon: Terminal, detail: 'Node.js, Express, Postgres, GraphQL, REST APIs, systems thinking' },
  { title: 'Tools', icon: Boxes, detail: 'Git, GitHub, VS Code, Docker, Figma, Linux, CI/CD' },
  { title: 'Design / others', icon: PenTool, detail: 'Product direction, prototyping, visual systems, facilitation' },
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

function EditorialPortrait() {
  return (
    <div className="editorial-portrait editorial-only" aria-label="Ink portrait illustration of Alex Morgan">
      <svg viewBox="0 0 300 270" role="img" aria-hidden="true">
        <path className="portrait-wash" d="M59 233 C42 198 57 164 46 130 C35 96 55 59 90 55 C107 30 144 32 165 48 C202 47 219 80 208 111 C236 144 213 191 180 206 C156 220 132 250 93 244Z" />
        <path className="portrait-hair" d="M72 190 C45 153 48 101 80 65 C107 34 153 42 179 72 C159 65 145 80 137 96 C120 93 102 111 99 140 C95 170 104 193 121 211 C98 216 80 207 72 190Z" />
        <path className="portrait-face" d="M126 92 C155 84 185 101 188 130 C193 169 166 192 137 184 C115 179 104 157 108 130 C111 111 116 99 126 92Z" />
        <path className="portrait-line" d="M132 119 C146 111 166 113 177 124 M162 143 C169 146 176 145 180 141 M139 162 C152 168 165 165 172 157 M113 101 C120 92 131 87 143 87" />
        <path className="portrait-ink" d="M48 239 C91 219 128 230 174 212 C193 205 210 190 226 166 M51 247 C90 233 123 242 167 224" />
        <circle className="portrait-sun" cx="218" cy="76" r="37" />
      </svg>
      <div className="portrait-caption mono">ALEX / 01</div>
    </div>
  );
}

function EditorialFuji() {
  return (
    <div className="editorial-fuji editorial-only">
      <svg viewBox="0 0 400 190" aria-hidden="true">
        <path className="mountain-back" d="M0 178 L74 124 L118 145 L177 80 L233 135 L285 111 L347 151 L400 118 L400 190 L0 190Z" />
        <path className="mountain-front" d="M0 183 L81 143 L128 163 L197 79 L269 165 L314 143 L400 177 L400 190 L0 190Z" />
        <path className="mountain-snow" d="M197 79 L178 111 L191 106 L197 119 L208 106 L220 119 L215 96Z" />
        <path className="mountain-ink" d="M17 172 C83 147 116 169 170 133 M232 166 C291 147 331 170 388 153" />
      </svg>
      <div className="fuji-label mono">BENGALURU / INDIA</div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [['about', 'About'], ['projects', 'Work'], ['skills', 'Skills'], ['experience', 'Journey'], ['contact', 'Contact']];
  return (
    <header className="nav sticky top-0 z-20">
      <div className="section-wrap flex min-h-[70px] items-center justify-between gap-5">
        <a href="#top" className="flex items-center gap-3" data-testid="link-home">
          <span className="flex h-9 w-9 items-center justify-center border border-current font-mono text-xs font-bold">AM</span>
          <span className="hidden text-xs font-semibold tracking-[.13em] sm:block">ALEX MORGAN <span className="font-mono opacity-50">/ 26</span></span>
        </a>
        <nav className={`${open ? 'absolute left-4 right-4 top-[66px] flex flex-col border border-current bg-[var(--paper,#ece4d3)] p-4 shadow-lg md:static md:flex md:flex-row md:border-0 md:bg-transparent md:p-0 md:shadow-none' : 'hidden md:flex'} items-center gap-5`} aria-label="Primary navigation">
          {links.map(([id, label]) => (
            <a onClick={() => setOpen(false)} href={`#${id}`} className="text-[10px] font-medium uppercase tracking-[.17em] opacity-70 transition-opacity hover:opacity-100" key={id} data-testid={`link-nav-${id}`}>{label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href="#contact" className="button-primary hidden items-center gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-[.12em] transition-transform sm:flex" data-testid="link-header-contact">Start a project <ArrowUpRight size={13} /></a>
          <button type="button" onClick={() => setOpen(!open)} className="flex h-9 w-9 items-center justify-center border border-current md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="section-anchor section-wrap editorial-hero grid min-h-[calc(100dvh-70px)] items-center gap-12 py-16 lg:grid-cols-[1.15fr_.85fr] lg:gap-16 lg:py-20">
      <div>
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
      <Reveal className="hero-art relative min-h-[410px] overflow-hidden sm:min-h-[520px]" delay={160}>
        <div className="editorial-hero-panel editorial-only">
          <div className="editorial-panel-index mono">01 / 06</div>
          <div className="editorial-panel-menu mono">
            <span>01&nbsp; Featured projects</span><span>02&nbsp; About me</span><span>03&nbsp; Skills</span><span>04&nbsp; Experience</span><span>05&nbsp; Get in touch</span>
          </div>
          <EditorialFuji />
          <div className="editorial-panel-meta mono">CODE / DESIGN<br />BUILD / REPEAT<br />— A MORGAN, 2026</div>
        </div>
      </Reveal>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="section-anchor border-t border-current/20 py-24">
      <div className="section-wrap grid gap-12 lg:grid-cols-[.85fr_1.15fr]">
        <Reveal><div className="mono mb-4 text-[10px] uppercase tracking-[.2em] opacity-60">02 / About me</div><h2 className="section-title display max-w-[420px]">Turning ideas into <span className="serif normal-case">interactive</span> experiences.</h2><EditorialPortrait /></Reveal>
        <div className="grid gap-10 sm:grid-cols-[1.2fr_.8fr]">
          <Reveal delay={100}><p className="serif text-3xl leading-[1.08]">I’m Alex Morgan, a full-stack developer who likes the space between a rough idea and the moment it becomes useful.</p><p className="mt-6 max-w-[520px] text-sm leading-7 opacity-70">For the last 4+ years, I’ve worked across product teams and small studios — shaping systems, shipping interfaces, and asking the slightly annoying questions that make a product clearer.</p></Reveal>
          <Reveal delay={180} className="border-l border-current/20 pl-5"><div className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Currently</div><p className="mt-3 text-sm leading-6">Independent<br />building useful things<br /><span className="opacity-55">open to good collaborations</span></p><div className="mt-10 mono text-[10px] uppercase tracking-[.15em] opacity-60">Find me</div><div className="mt-3 flex gap-3"><a className="icon-link" href="https://github.com" target="_blank" rel="noreferrer" aria-label="Alex on GitHub" data-testid="link-github"><Github size={18} /></a><a className="icon-link" href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="Alex on LinkedIn" data-testid="link-linkedin"><Linkedin size={18} /></a><a className="icon-link" href="mailto:alex@example.com" aria-label="Email Alex" data-testid="link-email-about"><Mail size={18} /></a></div></Reveal>
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
        <Reveal className="mb-12 flex items-end justify-between gap-5"><div><div className="mono mb-4 text-[10px] uppercase tracking-[.2em] opacity-60">03 / Selected work</div><h2 className="section-title display">A few things<br /><span className="serif normal-case">I’ve made.</span></h2></div><a href="#contact" className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] opacity-65 transition-opacity hover:opacity-100 sm:flex" data-testid="link-all-projects">Have a project in mind? <ArrowUpRight size={14} /></a></Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project, index) => <Reveal key={project.name} delay={index * 80}><article className="project-card h-full p-4" data-testid={`card-project-${project.number}`}><div className="mb-3 flex items-center justify-between mono text-[9px] opacity-60"><span>{project.number}</span><span>{project.kind}</span></div><ProjectVisual accent={project.accent} /><h3 className="display text-xl tracking-[-.04em]">{project.name}</h3><p className="mt-3 min-h-[72px] text-xs leading-5 opacity-70">{project.description}</p><div className="mt-4 flex flex-wrap gap-1.5">{project.stack.map(tag => <span className="mono border border-current/20 px-2 py-1 text-[9px] opacity-70" key={tag}>{tag}</span>)}</div><a href="#contact" className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.15em] opacity-75 hover:opacity-100" data-testid={`link-project-${project.number}`}>Discuss a build <ArrowUpRight size={13} /></a></article></Reveal>)}
        </div>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section id="skills" className="section-anchor border-t border-current/20 py-24">
      <div className="section-wrap">
        <Reveal className="mb-12 grid gap-6 md:grid-cols-[.65fr_1.35fr]"><div><div className="mono mb-4 text-[10px] uppercase tracking-[.2em] opacity-60">04 / Capabilities</div><h2 className="section-title display">Tools for<br /><span className="serif normal-case">making.</span></h2></div><p className="max-w-[400px] self-end text-sm leading-7 opacity-70">I’m most useful when the brief is still a little fuzzy. I bring structure to the unknown, then build the smallest thing that can teach us more.</p></Reveal>
        <div className="grid border-l border-t border-current/20 sm:grid-cols-2 lg:grid-cols-4">{skills.map(({ title, icon: Icon, detail }, index) => <Reveal key={title} delay={index * 80} className="border-b border-r border-current/20"><div className="group min-h-[205px] p-5 transition-colors hover:bg-current/[.05]"><Icon size={24} strokeWidth={1.4} /><h3 className="mt-12 display text-lg">{title}</h3><p className="mt-3 text-xs leading-5 opacity-65">{detail}</p></div></Reveal>)}</div>
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
    <section id="contact" className="section-anchor border-t border-current/20 py-24">
      <div className="section-wrap">
        <Reveal className="grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div><div className="mono mb-6 text-[10px] uppercase tracking-[.2em] opacity-60">06 / Get in touch</div><h2 className="section-title display">Let’s make<br /><span className="serif normal-case">something useful.</span></h2><p className="mt-7 max-w-[440px] text-sm leading-7 opacity-70">Have a project in mind, a team that needs a thoughtful pair of hands, or just a good question? I’m always up for a conversation.</p><a href="mailto:alex@example.com" className="button-primary mt-8 inline-flex items-center gap-3 px-5 py-3 text-[11px] font-semibold uppercase tracking-[.16em]" data-testid="link-contact-email">Send an email <ArrowUpRight size={14} /></a></div>
          <div className="grid content-end gap-5 border-l border-current/20 pl-6 sm:pl-10"><div><div className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Email</div><a className="mt-2 inline-block text-sm hover:underline" href="mailto:alex@example.com" data-testid="link-contact-address">alex.morgan@example.com</a></div><div><div className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Location</div><p className="mt-2 flex items-center gap-2 text-sm"><MapPin size={14} /> Bengaluru, India</p></div><div><div className="mono text-[10px] uppercase tracking-[.15em] opacity-60">Elsewhere</div><div className="mt-3 flex gap-4"><a className="icon-link" href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" data-testid="link-contact-github"><Github size={18} /></a><a className="icon-link" href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" data-testid="link-contact-linkedin"><Linkedin size={18} /></a><a className="icon-link" href="https://x.com" target="_blank" rel="noreferrer" aria-label="X" data-testid="link-contact-x"><ExternalLink size={17} /></a></div></div></div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return <footer className="footer border-t border-current/15 py-7"><div className="section-wrap flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center border border-current font-mono text-[10px] font-bold">AM</span><span className="text-xs opacity-70">Alex Morgan — full-stack developer & creative technologist</span></div><div className="mono text-[9px] uppercase tracking-[.15em] opacity-55">© 2026 / made with care</div></div></footer>;
}

function Home() {
  return <main className="site-shell theme-editorial paper-noise"><FallingLeaves /><Header /><Hero /><About /><Projects /><Skills /><Experience /><Contact /><Footer /></main>;
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