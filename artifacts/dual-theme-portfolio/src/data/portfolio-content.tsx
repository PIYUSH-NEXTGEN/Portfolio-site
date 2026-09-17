import type { ComponentType, ReactNode } from 'react';
import {
  SiCplusplus,
  SiFastapi,
  SiGo,
  SiJavascript,
  SiLeetcode,
  SiMysql,
  SiNumpy,
  SiPandas,
  SiPeerlist,
  SiPostgresql,
  SiPydantic,
  SiPython,
  SiPytorch,
  SiRender,
  SiScikitlearn,
  SiSqlalchemy,
  SiTensorflow,
  SiTypescript,
  SiVercel,
} from 'react-icons/si';
import { FaDev, FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { MatplotlibIcon, SeabornIcon } from '@/components/BrandIcons';

/* Project screenshots: lossless WebP builds of the supplied attached_assets
   PNGs (pixel-identical, full 1901px width, ~2.6x smaller) that Vite
   fingerprints and bundles. */
import lumenShot1 from '@assets/lumen-screenshot-1.webp';
import lumenShot2 from '@assets/lumen-screenshot-2.webp';
import lumenShot3 from '@assets/lumen-screenshot-3.webp';
import lumenShot4 from '@assets/lumen-screenshot-4.webp';
import lumenShot5 from '@assets/lumen-screenshot-5.webp';

/**
 * All static portfolio content lives here; the section components in
 * src/App.tsx only render it. Icon components are referenced (not string
 * names) so the data stays tree-shakeable and type-safe.
 */

export interface SocialLink {
  label: string;
  href: string;
  Icon: ComponentType<{ size?: number }>;
  testId: string;
  color: string;
  /** Shown again in the contact section's "Elsewhere" list. */
  contact?: boolean;
}

export interface Project {
  number: string;
  name: string;
  description: string;
  stack: string[];
  accent: string;
  url: string;
  github: string;
  details: string[];
  capabilities: string[];
  images: string[];
}

export interface SkillGroup {
  title: string;
  items: Array<{ name: string; Icon: ComponentType<{ size?: number; className?: string }> }>;
}

export interface ExperienceEntry {
  date: string;
  role: string;
  description: ReactNode;
}

export interface Achievement {
  key: string;
  title: ReactNode;
  detail: ReactNode;
}

export const CONTACT_INBOX = 'piyush.intech@gmail.com';

export const socialLinks: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/PIYUSH-NEXTGEN', Icon: FaGithub, testId: 'link-nav-github', color: '#24292e' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/piyush-baraskar-994ab6337', Icon: FaLinkedin, testId: 'link-nav-linkedin', color: '#0077b5', contact: true },
  { label: 'X (Twitter)', href: 'https://x.com/Piyush_NextGen', Icon: FaXTwitter, testId: 'link-nav-x', color: '#000000', contact: true },
  { label: 'Peerlist', href: 'https://peerlist.io/piyush_nextgen', Icon: SiPeerlist, testId: 'link-nav-peerlist', color: '#00aa45' },
  { label: 'LeetCode', href: 'https://leetcode.com/u/Piyush_NextGen/', Icon: SiLeetcode, testId: 'link-nav-leetcode', color: '#ffa116' },
  { label: 'dev.to', href: 'https://dev.to/piyushnextgen', Icon: FaDev, testId: 'link-nav-devto', color: '#000000' },
];

export const projects: Project[] = [
  {
    number: '01',
    name: 'LUMEN',
    description: 'A command-line and API-based image analysis tool for quality metrics, channel statistics, dominant colours, and exact-hash duplicate detection.',
    stack: ['Python', 'NumPy', 'Pandas', 'Pillow', 'Pydantic', 'Typer', 'FastAPI', 'PostgreSQL', 'SQLAlchemy', 'React + Vite', 'pytest'],
    accent: 'blue',
    url: 'https://lumen-image-analyzer.vercel.app/',
    github: 'https://github.com/PIYUSH-NEXTGEN/LUMEN',
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
export const emptyProjectSlots = 1;

export const skills: SkillGroup[] = [
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

export const experience: ExperienceEntry[] = [
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

export const achievements: Achievement[] = [
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