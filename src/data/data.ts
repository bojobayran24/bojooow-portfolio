/**
 * ============================================================================
 *  data.ts — SINGLE SOURCE OF TRUTH FOR ALL PORTFOLIO CONTENT
 * ============================================================================
 *
 * Every value in this file was extracted from the user's existing portfolio
 * (`portfolio-main/index.html` — the "Cyberpunk Analyst" static site). Nothing
 * here is invented; where the original brief asked for content that does not
 * appear in the source portfolio, it is called out with a `TODO` or a "NOT IN
 * SOURCE PORTFOLIO" note rather than silently fabricated.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The site is content-driven: components never hard-code copy, they import a
 * typed object from here. That means:
 *   1. You edit ONE file to update the site (no JSX spelunking).
 *   2. TypeScript validates every entry — a typo in a field name is a compile
 *      error, not a blank spot on the page.
 *   3. With no database or CMS, every page statically prerenders at build time.
 *
 * ── NUMBERS CROSS-CHECK ─────────────────────────────────────────────────────
 * The four hero stats are not hand-written marketing copy; they are DERIVED
 * from the `projects` array below (see the bottom of this file). The source
 * portfolio's own counters (20 / 14 / 5 / 1) reconcile exactly with the project
 * list, so `heroStats` is computed rather than typed. Add a project and the
 * hero updates itself — it can never drift out of sync.
 *
 * ── WHAT IS *NOT* IN THE SOURCE PORTFOLIO ───────────────────────────────────
 * The original brief mentioned TugmaAI (with a 190,000-word Tagalog dictionary
 * database) and the PSA systems "PICS" and "DSMS". NONE of those appear in the
 * source portfolio. They have deliberately been left OUT rather than invented.
 * See `OPEN_QUESTIONS` at the bottom for the full list.
 */

import {
  ArrowLeftRight,
  Award,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  Clock,
  Code2,
  Database,
  Dices,
  Flower2,
  Gauge,
  Globe,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MapPinned,
  MessagesSquare,
  Music4,
  Network,
  Pill,
  ReceiptText,
  Server,
  ShoppingCart,
  Truck,
  UserCog,
  Warehouse,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/* ==========================================================================
 * 1. PROFILE
 * ======================================================================== */

/**
 * Brand marks available to the social row.
 *
 * NOTE: lucide-react v1 removed ALL brand logos from its icon set, so these are
 * rendered by our own inline SVGs in `components/ui/brand-icons.tsx`. The union
 * is declared here so a typo in `socials` is a compile error.
 */
export type BrandName = "github" | "linkedin" | "x";

export interface SocialLink {
  label: string;
  /** The @handle or address shown next to the icon. */
  handle: string;
  href: string;
  brand: BrandName;
}

export const profile = {
  /** Display name from the source portfolio's logo, hero, and footer. */
  name: "Bojooow",
  /** Monogram fallback for the navbar when the logo image isn't rendered. */
  initials: "BJ",
  /** Primary professional identity, as titled in the source portfolio. */
  role: "Systems Analyst",
  /** The differentiator half of the positioning. */
  roleSecondary: "AI-Augmented Builder",
  age: 22,
  location: "Philippines",
  /** Current post — this is the headline credential, so it lives here. */
  currentPosition: "Administrative Officer II",
  currentEmployer: "Philippine Statistics Authority",
  currentDivision: "Human Resources Division",
  email: "bojobayran24@gmail.com",
  /** GitHub handle from the source portfolio's contact section. */
  githubHandle: "bojobayran24",
  tagline:
    "I analyze requirements, design solutions, and build systems with AI. Currently modernising HR operations at the Philippine Statistics Authority — turning manual, spreadsheet-driven processes into deployed, auditable web platforms.",
  /** Status pill in the hero. Set to null to hide it. */
  availability: "Open to opportunities & commissions",
  /** Their own tagline, used as the hero's typewriter line in the old site. */
  motto: "Analyzing requirements. Designing solutions. Building with AI.",
  /* ── ASSETS ──────────────────────────────────────────────────────────────
   * Copied out of the source portfolio into /public/images so `next/image` can
   * optimise and serve them. Sizes are declared in `imageSizes` below because
   * next/image needs intrinsic width/height (or `fill`) to reserve layout space
   * and prevent cumulative layout shift. */
  /* The BRIGHTENED variant of the artwork, not the original `logo.png`.
   *
   * The source mark is a dark navy galaxy (average luminance 85) that is
   * invisible on this site's near-black background — which is why the navbar
   * used to sit it on a white plate. `logo-mark.png` keeps the original alpha
   * channel and pushes the colour channels up (average luminance 146), so the
   * mark reads on dark and needs no plate behind it. The original file is left
   * in place in /public/images in case you want to re-tune the brightening. */
  logo: "/images/logo-mark.png",
  avatar: "/images/bojoow.jpg",
  /** Source-portfolio self-description, reused verbatim as the hero sub-line. */
  yearsOfExperience: "1",
} as const;

/**
 * Intrinsic dimensions of the local images. next/image requires these so it can
 * reserve the correct space before the file loads — otherwise the page reflows
 * as images arrive, which is the layout shift Lighthouse penalises.
 */
export const imageSizes = {
  logo: { width: 512, height: 512 },
  avatar: { width: 640, height: 640 },
  certificate: { width: 1600, height: 1200 },
} as const;

/* ==========================================================================
 * 2. NAVIGATION
 * --------------------------------------------------------------------------
 * Section list mirrors the source portfolio's own navbar, which is the right
 * information architecture for this content: it has a real Skills section and a
 * real Certificate section, neither of which appeared in the original brief.
 * ======================================================================== */

export interface NavItem {
  label: string;
  /** Must match a section's `id` in the page markup. */
  href: `#${string}`;
}

export const navItems = [
  { label: "Home", href: "#home" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Certificate", href: "#certificate" },
  { label: "Contact", href: "#contact" },
] satisfies NavItem[];

/**
 * A union of valid section ids, DERIVED from `navItems`.
 *
 * `infer` pulls "home" out of "#home", and indexing with `[number]["href"]`
 * unions across every array element. Because it's derived, adding a nav item can
 * never drift out of sync with the sections the scroll-spy looks for.
 */
export type SectionId = (typeof navItems)[number]["href"] extends `#${infer Id}`
  ? Id
  : never;



/* ==========================================================================
 * 3. HERO
 * ======================================================================== */

export interface HeadlineWord {
  text: string;
  accent?: boolean;
}

/**
 * The hero headline, split into discrete words so Framer Motion can stagger
 * them in individually (see `components/sections/hero.tsx`). Words flagged
 * `accent` get the animated gradient treatment.
 *
 * This restates the source portfolio's own typewriter line as a static
 * headline: "Analyzing requirements. Designing solutions. Building with AI."
 */
export const heroHeadline: HeadlineWord[] = [
  { text: "I" },
  { text: "analyze" },
  { text: "systems", accent: true },
  { text: "and" },
  { text: "build" },
  { text: "them" },
  { text: "with" },
  { text: "AI.", accent: true },
];

/** Rotating role lines. First two are the source portfolio's own titles. */
export const heroRoles: string[] = [
  "Systems Analyst",
  "AI-Augmented Builder",
  "Full-Stack Developer",
  "Automation Engineer",
];

export interface HeroStat {
  value: string;
  label: string;
}

/* `heroStats` is built further down the file — see section 7. It has to come
 * AFTER `projects`, because it is derived from them and JavaScript `const`
 * declarations are NOT hoisted into a usable state. Referencing
 * `projectCounts` from up here would throw a temporal-dead-zone
 * "Cannot access before initialization" error the moment the module loads. */

/* ==========================================================================
 * 4. SKILLS
 * --------------------------------------------------------------------------
 * Taken from the source portfolio's "Technical Stack" cards, enriched with the
 * technologies named in its project cards (which list far more than the six
 * skill tiles did — .NET, ASP.NET Core, SignalR, SQL Server, etc.).
 * ======================================================================== */

export interface SkillGroup {
  title: string;
  icon: LucideIcon;
  description: string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    title: "Backend & Data",
    icon: Database,
    description: "Server-side logic, schemas, and the queries that keep them honest.",
    skills: [
      "PHP",
      "MySQL",
      "C# / .NET 8.0",
      "ASP.NET Core",
      "Entity Framework Core",
      "SQL Server",
      "PDO",
      "SignalR",
    ],
  },
  {
    title: "Frontend & Interface",
    icon: Code2,
    description: "Interfaces that stay legible as the system behind them grows.",
    skills: [
      "HTML5 & CSS3",
      "JavaScript",
      "Responsive Design",
      "Web Audio API",
      "Dashboard UI",
    ],
  },
  {
    title: "AI & Analysis",
    icon: BrainCircuit,
    description: "Translating requirements into systems — and using AI to get there faster.",
    skills: [
      "Prompt Engineering",
      "AI-Augmented Development",
      "Systems Analysis",
      "Requirements Gathering",
      "Process Automation",
    ],
  },
  {
    title: "Platforms & Delivery",
    icon: Server,
    description: "Getting it live and keeping it up.",
    skills: [
      "WordPress & Elementor",
      "Cloudflare",
      "Namecheap / Stella Hosting",
      "Identity & Access Control",
      "Git",
    ],
  },
];

/**
 * Short capability strip used in the hero/skills intro. Kept deliberately small
 * — four items, each a one-liner.
 */
export interface Capability {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const capabilities: Capability[] = [
  {
    title: "Systems Analysis",
    description: "Requirements and workflows turned into a buildable spec.",
    icon: LayoutDashboard,
  },
  {
    title: "Full-Stack Delivery",
    description: "Database to interface, shipped and hosted.",
    icon: Server,
  },
  {
    title: "AI-Augmented Building",
    description: "AI in the workflow, not bolted on as a gimmick.",
    icon: Bot,
  },
  {
    title: "Process Automation",
    description: "Manual, spreadsheet-driven work replaced by systems.",
    icon: Network,
  },
];

/* ==========================================================================
 * 5. EXPERIENCE — powers the connecting timeline
 * ======================================================================== */

export interface Experience {
  id: string;
  company: string;
  /** Optional sub-unit inside a larger organisation. */
  department?: string;
  role: string;
  /** Employment type, shown as a chip. */
  type: string;
  /** Display string, verbatim from the source portfolio. */
  period: string;
  /** Numeric start year for sorting the timeline (oldest -> newest). */
  startYear: number;
  location: string;
  summary: string;
  /** Bullet achievements. */
  highlights: string[];
  stack: string[];
  /** Internal system acronyms shipped in this role, rendered as chips. */
  systems?: string[];
  /** Marks the timeline node as current, showing a pulsing indicator. */
  current?: boolean;
}

/**
 * Ordered oldest -> newest so the timeline flows in the same direction as the
 * scroll. Both entries are verbatim from the source portfolio's timeline.
 */
export const experiences: Experience[] = [
  {
    id: "reinmanpro",
    company: "ReinmanPro",
    role: "Web Content Editor",
    type: "Part-Time",
    period: "2025",
    startYear: 2025,
    location: "California, USA — Remote",
    summary:
      "Managed content and site updates for a US-based client, working directly in WordPress and Elementor with custom code where the page builder couldn't reach.",
    highlights: [
      "Orchestrated content management and site updates using WordPress and Elementor.",
      "Wrote custom HTML/CSS for precise design enhancements and responsive behaviour that the visual builder alone couldn't achieve.",
    ],
    stack: ["WordPress", "Elementor", "HTML", "CSS"],
  },
  {
    id: "psa",
    company: "Philippine Statistics Authority",
    department: "Human Resources Division",
    role: "Administrative Officer II",
    type: "Full-Time",
    period: "July 2026 — Present",
    startYear: 2026,
    location: "Quezon City, Philippines",
    summary:
      "Leads the development and implementation of automated systems that optimise data processing, streamline administrative workflows, and enhance operational efficiency across the division.",
    highlights: [
      "Designs and ships the division's internal HR platforms — attendance, leave, offboarding, recruitment, and payroll support.",
      "Replaced manual, spreadsheet-driven HR workflows with deployed, role-based web systems used daily by HR staff.",
      "Owns features end-to-end: requirements gathering, database schema, API layer, and the interfaces staff actually use.",
      "Recognised with a Certificate of Appreciation for exceptional initiative and technical skill in designing systems that improved office operations.",
    ],
    stack: ["PHP", "MySQL", "JavaScript", "HTML5 & CSS3"],
    systems: ["TAMS", "COLMS", "FOLMS", "EOS", "RSPS", "DTR Transmittal"],
    current: true,
  },
];

/* ==========================================================================
 * 6. PROJECTS
 * --------------------------------------------------------------------------
 * All 20 projects from the source portfolio, in their original order, with their
 * original status labels and copy.
 * ======================================================================== */

/**
 * Lifecycle state, normalised into a union so the UI can colour chips from a
 * lookup map instead of string-matching display text. The human-readable label
 * stays in `statusLabel` (verbatim from the source portfolio).
 */
export type ProjectStatus = "deployed" | "in-progress" | "ready";

/**
 * Which family a project belongs to. Lets the Projects section filter or group
 * without re-parsing titles.
 *   • "psa"      -> the HR platforms built for the Philippine Statistics Authority
 *   • "nexols"   -> client work for Nexols Tech (all live on real domains)
 *   • "product"  -> self-driven products (music, games, tools)
 *   • "academic" -> school / training builds
 */
export type ProjectGroup = "psa" | "nexols" | "product" | "academic";

/* TRANSITION NOTE — a `BentoSpan` type used to live here. It let individual
 * cards claim extra grid cells ("feature" = 2x2, "wide" = 2x1) so the grid
 * looked like a bento box.
 *
 * It was removed deliberately. The bento layout made the twenty cards
 * impossible to scan: the eye can't compare projects when the tiles are
 * different sizes, and the tall feature tile left a hole underneath the short
 * ones. Every card now claims exactly one cell, so the `span` field is gone
 * from `Project` below and the grid is `auto-rows-fr` (all rows equal height).
 *
 * Visual hierarchy is preserved — it just moved from LAYOUT to COLOUR: each
 * card carries an accent, and the flagship project carries a `featured` ring
 * instead of extra area. */

export interface ProjectMetric {
  value: string;
  label: string;
}

export interface Project {
  id: string;
  title: string;
  /** Short type label, e.g. "Enterprise HRIS". */
  category: string;
  /** One-sentence positioning statement. */
  tagline: string;
  /** Longer description, verbatim from the source portfolio. */
  description: string;
  status: ProjectStatus;
  /** Status text exactly as it appeared in the source portfolio. */
  statusLabel: string;
  group: ProjectGroup;
  /** Technology pills, verbatim from the source portfolio. */
  stack: string[];
  icon: LucideIcon;
  /**
   * Card accent key. Drives the icon chip tint, the hairline rule that lights
   * up along the top edge on hover, and the corner wash.
   *
   * Only the TWO brand hues. A third (the old pink) would reintroduce exactly
   * the rainbow problem the gradient rework removed — see the `--brand-violet`
   * note in globals.css. Two accents alternating across the grid read as
   * rhythm; three read as noise.
   */
  accent: "violet" | "cyan";
  /** Live URL where one exists; `null` renders the card as non-clickable. */
  href: string | null;
  /** Gets the flagship treatment (an accent ring) — no longer a bigger cell. */
  featured?: boolean;
  /** Short system acronym, for PSA platforms that have one. */
  acronym?: string;
}

export const projects: Project[] = [
  {
    id: "hr-logistics-attendance",
    title: "HR & Logistics Attendance System",
    category: "Enterprise HRIS",
    tagline: "Gate-to-gate attendance built for logistics operations.",
    description:
      "Enterprise HRIS with custom logic: gate-to-gate tracking, traffic compensation logic, and digital 201 file management for logistics.",
    status: "in-progress",
    statusLabel: "On-Going",
    group: "psa",
    stack: ["Enterprise HRIS", "Custom Logic"],
    icon: Warehouse,
    accent: "cyan",
    href: null,
  },
  {
    id: "cosw-jo-payroll",
    title: "COSW / JO Payroll Automation System",
    category: "Payroll Automation",
    tagline: "Payroll processing for contract-of-service and job-order personnel.",
    description:
      "Payroll dashboard for COSW/JO processing with DTR encoding, payroll computation, employee management, and audit log tracking.",
    status: "in-progress",
    statusLabel: "On-Going (50% Complete)",
    group: "psa",
    stack: ["PHP", "MySQL", "JavaScript"],
    icon: ReceiptText,
    accent: "violet",
    href: null,
  },
  {
    id: "mpire-studio",
    title: "Mpire Studio — Browser DAW",
    category: "Creative Tool",
    tagline: "A digital audio workstation that runs in the browser.",
    description:
      "Browser-based digital audio workstation with step sequencer, channel rack, mixer controls, and pattern arrangement for music production workflow.",
    status: "in-progress",
    statusLabel: "On-Going",
    group: "product",
    stack: ["HTML", "CSS", "JavaScript", "Web Audio API"],
    icon: Music4,
    accent: "violet",
    href: null,
  },
  {
    id: "mpire-website",
    title: "MPIRE Official Website",
    category: "Brand Site",
    tagline: "The official site for the Mpire Group rap brand.",
    description:
      "Official website for the Mpire Group Rap brand featuring artist highlights, track sections, navigation pages, and a modern music-focused landing experience.",
    status: "deployed",
    statusLabel: "Deployed",
    group: "product",
    stack: ["HTML", "CSS", "JavaScript", "PHP"],
    icon: Globe,
    accent: "violet",
    href: null,
  },
  {
    id: "plinko-game",
    title: "Plinko Game",
    category: "Web Game",
    tagline: "Physics-driven Plinko with risk controls and multiplier buckets.",
    description:
      "Web-based Plinko game with risk-level controls, ball drop mechanics, multiplier buckets, and a responsive neon-style game interface.",
    status: "deployed",
    statusLabel: "Deployed",
    group: "product",
    stack: ["PHP", "CSS", "JavaScript"],
    icon: Dices,
    accent: "cyan",
    href: null,
  },
  {
    id: "wellness-spa",
    title: "Wellness Spa Appointment System",
    category: "Scheduling Platform",
    tagline: "Production-ready booking with real scheduling constraints.",
    description:
      "Production-ready scheduling with buffer time logic, therapist specialisation, and overlap detection.",
    status: "in-progress",
    statusLabel: "On-Going",
    group: "product",
    stack: [".NET 8.0", "Entity Framework Core", "ASP.NET Identity"],
    icon: Flower2,
    accent: "violet",
    href: null,
  },
  {
    id: "usap-messenger",
    title: "U-sap Messenger",
    category: "Real-Time Messaging",
    tagline: "Chat with reactions and secure file sharing.",
    description:
      "Real-time messaging platform supporting 1:1 and group chats, message reactions, and secure file sharing, built on modern ASP.NET Core architecture.",
    status: "deployed",
    statusLabel: "Deployed",
    group: "product",
    stack: ["ASP.NET Core", "C#", "SignalR"],
    icon: MessagesSquare,
    accent: "violet",
    href: null,
  },
  {
    id: "aucs-med",
    title: "AUCS-MED Medicine Inventory System",
    category: "Inventory Platform",
    tagline: "Company-level medicine stock control and analytics.",
    description:
      "Company-level medicine inventory platform with stock monitoring, low-stock alerts, invoice history, and dashboard analytics for medical supply operations.",
    status: "deployed",
    statusLabel: "Deployed",
    group: "product",
    stack: ["CSS", "JavaScript", "PHP"],
    icon: Pill,
    accent: "cyan",
    href: null,
  },
  {
    id: "dcsa-portal",
    title: "DCSA Student Information Portal",
    category: "Student Records",
    tagline: "Records, reports, and audit logs with role-based access.",
    description:
      "Student information portal with dashboard analytics, student records management, reports, activity logs, and role-based administrator access controls.",
    status: "deployed",
    statusLabel: "Deployed",
    group: "academic",
    stack: ["ASP.NET Core", "C#", "SQL Server"],
    icon: GraduationCap,
    accent: "violet",
    href: null,
  },
  {
    id: "rsps",
    title: "Recruitment & Selection (RSPS)",
    category: "HR — Recruitment",
    tagline: "Applicant tracking, panel interviews, and selection ranking.",
    description:
      "Automated recruitment system featuring applicant tracking, panel interview management, and ranking & selection logic.",
    status: "in-progress",
    statusLabel: "On-Going",
    group: "psa",
    stack: ["HTML", "CSS", "JavaScript", "PHP"],
    icon: UserCog,
    accent: "violet",
    href: null,
    acronym: "RSPS",
  },
  {
    id: "tams",
    title: "Time & Attendance (TAMS)",
    category: "HR — Attendance",
    tagline: "DTR and punctuality monitoring with performance dashboards.",
    description:
      "DTR and punctuality monitoring system with performance dashboards, punctuality reports, and attendance analytics.",
    status: "deployed",
    statusLabel: "Deployed",
    group: "psa",
    stack: ["HTML", "CSS", "JavaScript", "PHP"],
    icon: Clock,
    accent: "cyan",
    href: null,
    acronym: "TAMS",
  },
  {
    id: "colms",
    title: "Central Office Leave System (COLMS)",
    category: "HR — Leave",
    tagline: "Leave credits and usage analytics for the Central Office.",
    description:
      "Leave management for the Central Office. Tracks leave credit records, usage analytics, and generates summary reports.",
    status: "deployed",
    statusLabel: "Deployed",
    group: "psa",
    stack: ["HTML", "CSS", "JavaScript", "PHP"],
    icon: CalendarCheck,
    accent: "violet",
    href: null,
    acronym: "COLMS",
  },
  {
    id: "folms",
    title: "Field Office Leave System (FOLMS)",
    category: "HR — Leave",
    tagline: "Leave management built specifically for Field Office operations.",
    description:
      "Dedicated leave management system designed specifically for Field Office operations and credit tracking.",
    status: "deployed",
    statusLabel: "Deployed",
    group: "psa",
    stack: ["HTML", "CSS", "JavaScript", "PHP"],
    icon: MapPinned,
    accent: "cyan",
    href: null,
    acronym: "FOLMS",
  },
  {
    id: "eos",
    title: "Employee Offboarding (EOS)",
    category: "HR — Separation",
    tagline: "Separation and clearance portal with automated clearances.",
    description:
      "HR separation and clearance portal featuring centralised monitoring, automated clearances, and leave credit computation.",
    status: "deployed",
    statusLabel: "Deployed",
    group: "psa",
    stack: ["HTML", "CSS", "JavaScript", "PHP"],
    icon: LogOut,
    accent: "violet",
    href: null,
    acronym: "EOS",
  },
  {
    id: "dtr-transmittal",
    title: "DTR Transmittal Monitoring",
    category: "HR — Records",
    tagline: "Track the transmittal and receipt of every DTR.",
    description:
      "Monitors transmittal and receipt of DTRs with receipt acknowledgement, status tracking, and history logs.",
    status: "deployed",
    statusLabel: "Deployed",
    group: "psa",
    stack: ["Tracking", "Logistics"],
    icon: ArrowLeftRight,
    accent: "violet",
    href: null,
  },
  {
    id: "coffee-pos",
    title: "POS System for Coffee Shop",
    category: "Point of Sale",
    tagline: "Sales, inventory, access control, and a self-service kiosk.",
    description:
      "Full-featured POS with inventory and sales tracking, user login access control, and a self-service kiosk ordering feature.",
    status: "ready",
    statusLabel: "Ready to Deploy",
    group: "product",
    stack: ["PHP", "MySQL", "JavaScript"],
    icon: ShoppingCart,
    accent: "cyan",
    href: null,
  },
  {
    id: "real-time-logistics",
    title: "Real-Time Logistics System",
    category: "Delivery Tracking",
    tagline: "Courier-style delivery tracking with a responsive UI.",
    description:
      "Real-time delivery tracking system similar to J&T Express with a responsive tracking interface.",
    status: "deployed",
    statusLabel: "Deployed",
    group: "product",
    stack: ["HTML", "CSS", "JavaScript"],
    icon: Truck,
    accent: "violet",
    href: null,
  },
  {
    id: "nexols-website",
    title: "Nexols Tech — Company Website",
    category: "Company Site",
    tagline: "Full backend ownership for a live IT company site.",
    description:
      "Official website of Nexols Tech IT company. Handled full backend development and system analysis while collaborating with the frontend lead. Deployed on a Namecheap domain via Stella hosting with Cloudflare integration for performance and security.",
    status: "deployed",
    statusLabel: "Deployed",
    group: "nexols",
    stack: ["PHP", "HTML", "CSS", "JavaScript"],
    icon: Building2,
    accent: "violet",
    href: "https://nexols.tech/",
  },
  {
    id: "nexols-dashboard",
    title: "Nexols CRM Dashboard",
    category: "Internal CRM",
    tagline: "The agency's internal CRM, hardened at the query layer.",
    description:
      "Internal CRM system for Nexols Tech. Built the full backend and core frontend features including PDO-secured queries, rate limiting, and other security hardening measures. Deployed on the same production stack as the main website.",
    status: "deployed",
    statusLabel: "Deployed",
    group: "nexols",
    stack: ["PHP", "HTML", "CSS", "JavaScript"],
    icon: Gauge,
    accent: "cyan",
    href: "https://dashboard.nexols.tech/",
  },
  {
    id: "nexols-client-portal",
    title: "Nexols Client Portal",
    category: "Client Portal",
    tagline: "Clients watch their commissions progress in real time.",
    description:
      "Client-facing portal connected to the Nexols CRM dashboard, allowing clients to monitor the progress of their commissioned systems in real time. Fully built — frontend and backend — as a solo project.",
    status: "deployed",
    statusLabel: "Deployed",
    group: "nexols",
    stack: ["PHP", "HTML", "CSS", "JavaScript"],
    icon: BriefcaseBusiness,
    accent: "violet",
    href: "https://client.nexols.tech/",
    featured: true,
  },
];

/* ==========================================================================
 * 7. DERIVED PROJECT COUNTS
 * --------------------------------------------------------------------------
 * Computed once at module load. Kept as a plain object (not a function) so the
 * values are identical on the server and the client — a function that
 * recalculated per render could in principle disagree and cause a hydration
 * mismatch.
 * ======================================================================== */

export const projectCounts = {
  total: projects.length,
  deployed: projects.filter((p) => p.status === "deployed").length,
  inProgress: projects.filter((p) => p.status === "in-progress").length,
  ready: projects.filter((p) => p.status === "ready").length,
} as const;

/**
 * The hero's credibility counters, DERIVED from `projects` rather than typed by
 * hand. The source portfolio's own numbers (20 / 14 / 5 / 1) reconcile exactly
 * with the list above, so there is no reason to duplicate them: add a project
 * and the hero updates itself. It is impossible for the two to drift apart.
 */
export const heroStats: HeroStat[] = [
  { value: String(projectCounts.total), label: "Total projects" },
  { value: String(projectCounts.deployed), label: "Deployed systems" },
  { value: String(projectCounts.inProgress), label: "Active builds" },
  { value: profile.yearsOfExperience, label: "Year in service" },
];

/* ==========================================================================
 * 8. PSA HR PLATFORM INDEX
 * --------------------------------------------------------------------------
 * The "PSA Systems Portfolio" card needs a compact index of acronyms, while the
 * full descriptions live in the `projects` array. Rather than duplicating the
 * copy, this array stores only a REFERENCE (`projectId`) — the UI looks up the
 * detail. One source of truth, zero drift.
 * ======================================================================== */

export interface PsaSystemRef {
  acronym: string;
  fullName: string;
  projectId: Project["id"];
}

export const psaSystems: PsaSystemRef[] = [
  { acronym: "TAMS", fullName: "Time & Attendance Management System", projectId: "tams" },
  { acronym: "COLMS", fullName: "Central Office Leave System", projectId: "colms" },
  { acronym: "FOLMS", fullName: "Field Office Leave System", projectId: "folms" },
  { acronym: "EOS", fullName: "Employee Offboarding System", projectId: "eos" },
  { acronym: "RSPS", fullName: "Recruitment & Selection", projectId: "rsps" },
  { acronym: "DTR", fullName: "Transmittal Monitoring", projectId: "dtr-transmittal" },
  { acronym: "COSW/JO", fullName: "Payroll Automation", projectId: "cosw-jo-payroll" },
  { acronym: "HRIS", fullName: "HR & Logistics Attendance", projectId: "hr-logistics-attendance" },
];

/* ==========================================================================
 * 9. CERTIFICATE
 * --------------------------------------------------------------------------
 * The source portfolio devotes a whole section to this, and it's the strongest
 * single piece of credibility on the page, so it gets first-class data.
 * ======================================================================== */

export interface Certificate {
  title: string;
  issuer: string;
  division: string;
  /** Award date, verbatim from the certificate image's caption. */
  date: string;
  /** Where it was awarded. */
  venue: string;
  signee: string;
  signeeTitle: string;
  description: string;
  image: string;
  alt: string;
}

export const certificate: Certificate = {
  title: "Certificate of Appreciation",
  issuer: "Philippine Statistics Authority (PSA)",
  division: "Human Resources Division",
  date: "January 27, 2026",
  venue: "PSA Headquarters, Diliman, Quezon City",
  signee: "CYNTHIA C. VALLESTEROS",
  signeeTitle: "Chief Administrative Officer, HRD",
  description:
    "Awarded for valuable contributions and dedication during On-the-Job Training at the PSA Headquarters, Diliman, Quezon City. Recognised for demonstrating exceptional initiative and technical skill in designing and developing programs and systems that improved office operations.",
  image: "/images/psa-certificate.jpg",
  alt: "PSA Certificate of Appreciation awarded to Bojooow",
};

/* ==========================================================================
 * 10. CONTACT
 * ======================================================================== */

/**
 * Only the channels that actually appeared in the source portfolio. No LinkedIn
 * or X profile was listed there, so none is invented here — add them to
 * `brandIcons` in `components/ui/brand-icons.tsx` if you create them.
 */
export const socials: SocialLink[] = [
  {
    label: "GitHub",
    handle: `@${profile.githubHandle}`,
    href: `https://github.com/${profile.githubHandle}`,
    brand: "github",
  },
];

export interface ContactChannel {
  label: string;
  value: string;
  href: string;
  icon: LucideIcon;
}

export const contactChannels: ContactChannel[] = [
  {
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
    icon: Server,
  },
  {
    label: "GitHub",
    value: `@${profile.githubHandle}`,
    href: `https://github.com/${profile.githubHandle}`,
    icon: Code2,
  },
  {
    label: "Location",
    value: profile.location,
    href: "#contact",
    icon: MapPinned,
  },
  {
    label: "Currently",
    value: `${profile.currentPosition}, ${profile.currentEmployer}`,
    href: "#experience",
    icon: Wrench,
  },
];

export const contactCopy = {
  eyebrow: "Contact",
  heading: "Ready to initialize a new project?",
  /** Verbatim tone from the source portfolio, kept because it's on-brand. */
  description:
    "Transmission channels are open. Whether you need a system designed, an existing one rescued, or a role filled — send a note and I'll get back to you.",
  note: "This form validates on the client and logs to the console. Wire it to an email service or a route handler when you're ready to go live.",
} as const;

/* ==========================================================================
 * 11. MISC
 * ======================================================================== */

/** Height of the fixed navbar; used for scroll offsets and anchor padding. */
export const NAV_HEIGHT_PX = 72;

/* NOTE — a `MOTION` token object (fast/base/slow durations plus a stagger
 * delay) used to live here, back when reveals played on their own clock and
 * needed a shared duration to stay consistent.
 *
 * Scrubbed animations have no duration to share, so the tokens lost their
 * meaning and were removed. The motion language now lives in `ScrollStage` as
 * three named presets (`rise`, `unfold`, `fade`) plus a `settle` point and a
 * stagger step — expressed in SCROLL PROGRESS rather than seconds. */

/** Icons/among decorative furniture for the certificate section badge. */
export const certificateBadgeIcon = Award;

/* ==========================================================================
 * 12. OPEN QUESTIONS
 * --------------------------------------------------------------------------
 * The original brief asked for content that does NOT exist in the source
 * portfolio. These were intentionally NOT fabricated. Confirm or drop each:
 *
 *   1. TUGMAAI — "lyric writing studio with AI coaching and a 190,000+ word
 *      Tagalog dictionary database". Not present anywhere in portfolio-main.
 *      (Mpire Studio is the only music project, and it's a browser DAW, not a
 *      lyric coach.)
 *
 *   2. PICS — "Personnel Placement & Complement System". Not present.
 *
 *   3. DSMS — not present under that acronym, and no unnamed system matches.
 *
 *   4. A NEXOLS EMPLOYMENT ROLE — the brief listed Nexols as a *role* in the
 *      timeline. In the source portfolio Nexols is project/client work
 *      (`group: "nexols"`), not an employer. The two real roles are PSA and
 *      ReinmanPro.
 *
 *   5. "6 web-based HR systems" — the source portfolio actually contains EIGHT
 *      PSA-related platforms: TAMS, COLMS, FOLMS, EOS, RSPS, DTR Transmittal,
 *      COSW/JO Payroll, and the HR & Logistics Attendance System. See
 *      `psaSystems`. The count was corrected to 8 rather than trimming two real
 *      projects to fit the brief.
 *
 * Send the details for 1–3 and they can be added in a single edit.
 * ======================================================================== */
