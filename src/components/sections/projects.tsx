"use client";

/**
 * ============================================================================
 *  Projects — filterable, uniform card grid
 * ============================================================================
 */

import { useState } from "react";
import { ArrowUpRight, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/sections/section-heading";
import {
  projectCounts,
  projects,
  type Project,
  type ProjectGroup,
} from "@/data/data";

type Filter = "all" | ProjectGroup;

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All Systems" },
  { value: "psa", label: "PSA HR" },
  { value: "nexols", label: "Nexols" },
  { value: "product", label: "Products" },
  { value: "academic", label: "Academic" },
];

/**
 * Status chip colours.
 */
const statusStyles: Record<Project["status"], string> = {
  deployed: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25",
  "in-progress": "bg-brand/10 text-brand ring-brand/25",
  ready: "bg-brand-3/10 text-brand-3 ring-brand-3/25",
};

/** The dot inside each status chip, so state is legible without reading. */
const statusDots: Record<Project["status"], string> = {
  deployed: "bg-emerald-400",
  "in-progress": "bg-brand",
  ready: "bg-brand-3",
};

/**
 * Per-accent styling, grouped so a card never has to know which Tailwind
 * classes belong together.
 */
const accentStyles: Record<
  Project["accent"],
  { chip: string; wash: string; glow: string }
> = {
  violet: {
    chip: "bg-brand/12 text-brand ring-brand/25",
    wash: "bg-[radial-gradient(circle,color-mix(in_oklab,var(--brand-violet)_34%,transparent),transparent_70%)]",
    glow: "hover:shadow-[0_30px_70px_-32px_color-mix(in_oklab,var(--brand-violet)_90%,transparent)]",
  },
  cyan: {
    chip: "bg-brand-3/12 text-brand-3 ring-brand-3/25",
    wash: "bg-[radial-gradient(circle,color-mix(in_oklab,var(--brand-cyan)_34%,transparent),transparent_70%)]",
    glow: "hover:shadow-[0_30px_70px_-32px_color-mix(in_oklab,var(--brand-cyan)_90%,transparent)]",
  },
};

/* ==========================================================================
 * ProjectCard
 * ======================================================================== */

function ProjectCard({ project }: { project: Project }) {
  const accent = accentStyles[project.accent];
  const isLink = Boolean(project.href);

  const card = (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.012))] p-5",
        "transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-white/18",
        accent.glow,
        project.featured && "border-brand/25 ring-1 ring-brand/20",
      )}
    >
      {/* ── LIT TOP EDGE ──────────────────────────────────────────────────── */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]"
      />

      {/* ── ACCENT WASH ───────────────────────────────────────────────────── */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-20 -right-16 size-44 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100",
          accent.wash,
        )}
      />

      {/* ── HEADER ROW: icon chip + status ────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105",
            accent.chip,
          )}
        >
          <project.icon className="size-5" />
        </span>

        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.62rem] font-medium tracking-wide uppercase ring-1",
            statusStyles[project.status],
          )}
        >
          <span
            aria-hidden="true"
            className={cn("size-1.5 rounded-full", statusDots[project.status])}
          />
          {project.statusLabel}
        </span>
      </div>

      {/* ── TITLE + CATEGORY ────────────────────────────────────────────────── */}
      <h3 className="font-display mt-4 line-clamp-2 text-[0.95rem] leading-snug font-medium tracking-tight">
        {project.title}
        {project.acronym && (
          <span className="ml-2 align-middle font-mono text-[0.62rem] font-normal text-muted-foreground">
            {project.acronym}
          </span>
        )}
      </h3>

      <p className="mt-1.5 font-mono text-[0.6rem] tracking-[0.16em] text-brand-3 uppercase">
        {project.category}
      </p>

      {/* ── BODY COPY ───────────────────────────────────────────────────────── */}
      <p className="mt-3 line-clamp-2 text-[0.8rem] leading-relaxed text-foreground/75">
        {project.tagline}
      </p>

      <p className="mt-2 line-clamp-4 text-[0.72rem] leading-relaxed text-muted-foreground/70">
        {project.description}
      </p>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <div className="mt-auto pt-5">
        <ul className="flex flex-wrap gap-1.5 border-t border-white/8 pt-3.5">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="rounded-md bg-white/6 px-2 py-0.5 font-mono text-[0.6rem] text-muted-foreground ring-1 ring-white/8"
            >
              {tech}
            </li>
          ))}
        </ul>

        {project.href && (
          <span className="mt-3 inline-flex items-center gap-1 text-[0.72rem] font-medium text-brand-3 transition-transform duration-300 group-hover:translate-x-0.5">
            View live site
            <ArrowUpRight className="size-3.5" />
          </span>
        )}
      </div>
    </article>
  );

  return (
    <div className="group h-full">
      {isLink ? (
        <a
          href={project.href as string}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          {card}
        </a>
      ) : (
        card
      )}
    </div>
  );
}

/* ==========================================================================
 * Projects
 * ======================================================================== */

export function Projects() {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  const visibleProjects =
    activeFilter === "all"
      ? projects
      : projects.filter((project) => project.group === activeFilter);

  return (
    <section id="projects" className="container-page scroll-mt-24 py-24">
      <SectionHeading
        eyebrow="Projects"
        title="Professional & Academic Projects"
        description="Everything from the source portfolio, kept in order — internal HR platforms for the PSA, client work for Nexols, and self-driven products."
      />

      {/* ── FILTER BAR ──────────────────────────────────────────────────────── */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;
          const count =
            filter.value === "all"
              ? projectCounts.total
              : projects.filter((p) => p.group === filter.value).length;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              aria-pressed={isActive}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm transition-all duration-300",
                isActive
                  ? "bg-[linear-gradient(100deg,var(--brand-violet),var(--brand-cyan))] font-medium text-white shadow-[0_10px_26px_-12px_color-mix(in_oklab,var(--brand-violet)_80%,transparent)]"
                  : "bg-white/6 text-muted-foreground ring-1 ring-white/10 hover:bg-white/10 hover:text-foreground",
              )}
            >
              {filter.label}
              <span
                className={cn(
                  "font-mono text-[0.65rem]",
                  isActive ? "text-white/80" : "text-muted-foreground/70",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── THE GRID ────────────────────────────────────────────────────────── */}
      <div className="mt-10 grid gap-4 sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-3">
        {visibleProjects.map((project) => (
          <div key={project.id} className="h-full">
            <ProjectCard project={project} />
          </div>
        ))}
      </div>

      <p className="mt-10 flex flex-wrap items-center justify-center gap-2 text-center text-xs text-muted-foreground/70">
        <Layers className="size-3.5" />
        {projectCounts.deployed} deployed · {projectCounts.inProgress} in progress ·{" "}
        {projectCounts.ready} ready to deploy — from the source portfolio
        {projects.some((p) => p.featured) && (
          <>
            <span className="mx-1 h-3 w-px bg-white/15" />
            <span className="text-brand font-medium">ringed cards</span> are the flagship builds
          </>
        )}
      </p>
    </section>
  );
}
