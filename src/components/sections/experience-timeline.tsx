import { Check } from "lucide-react";
import type { Experience as ExperienceEntry } from "@/data/data";

/* ==========================================================================
 * TimelineItem
 * ======================================================================== */

function TimelineItem({
  item,
}: {
  item: ExperienceEntry;
}) {
  return (
    <div className="relative mb-10 pl-12 last:mb-0">
      {/* ── THE NODE ────────────────────────────────────────────────────────
          `-translate-x-1/2` recentres the 12px box on the 1px rail, so the dot
          is visually ON the line rather than beside it. */}
      <span className="absolute top-2 left-4 grid size-3 -translate-x-1/2 place-items-center">
        <span className="absolute size-2.5 rounded-full bg-brand" />
        {item.current && (
          <span className="animate-pulse-glow absolute size-2.5 rounded-full bg-brand-2" />
        )}
      </span>

      <article className="glass rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-medium sm:text-lg">{item.role}</h3>
            <p className="mt-1 text-sm text-brand-3">
              {item.company}
              {item.department ? ` · ${item.department}` : ""}
            </p>
          </div>
          <span className="rounded-full bg-white/6 px-3 py-1 text-xs text-muted-foreground ring-1 ring-white/10">
            {item.period}
          </span>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          {item.type} · {item.location}
        </p>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.summary}</p>

        <ul className="mt-4 space-y-2">
          {item.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2.5 text-sm text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-brand-3" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>

        {item.systems && (
          <div className="mt-5 flex flex-wrap gap-2">
            {item.systems.map((system) => (
              <span
                key={system}
                className="rounded-full bg-brand/10 px-3 py-1 font-mono text-xs text-brand ring-1 ring-brand/25"
              >
                {system}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/8 pt-4">
          {item.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-white/6 px-3 py-1 text-xs text-muted-foreground ring-1 ring-white/10"
            >
              {tech}
            </span>
          ))}
        </div>
      </article>
    </div>
  );
}

/* ==========================================================================
 * ExperienceTimeline
 * ======================================================================== */

export function ExperienceTimeline({ items }: { items: ExperienceEntry[] }) {
  return (
    <div className="relative mx-auto mt-14 max-w-3xl">
      {/* ── THE RAIL ────────────────────────────────────────────────────────
          Reliable vibrant gradient track that's always visible. */}
      <span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-4 w-px bg-[linear-gradient(180deg,var(--brand-violet),var(--brand-cyan),transparent)]"
      />

      {items.map((item) => (
        <TimelineItem
          key={item.id}
          item={item}
        />
      ))}
    </div>
  );
}
