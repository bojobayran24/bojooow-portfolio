import { SectionHeading } from "@/components/sections/section-heading";
import { capabilities, skillGroups } from "@/data/data";

export function Skills() {
  return (
    <section id="skills" className="container-page scroll-mt-24 py-24">
      <SectionHeading
        eyebrow="Skills"
        title="Technical Stack"
        description="The toolkit I reach for when requirements turn into systems — schemas and server logic on one side, interfaces staff actually use on the other."
      />

      {/* ── CAPABILITY STRIP ───────────────────────────────────────────────── */}
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {capabilities.map((capability) => (
          <div key={capability.title} className="h-full">
            <div className="glass h-full rounded-2xl p-5">
              <capability.icon className="size-5 text-brand-3" />
              <h3 className="mt-3 text-sm font-medium">{capability.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {capability.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {skillGroups.map((group) => (
          <div key={group.title} className="h-full">
            <article className="glass h-full rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/6 ring-1 ring-white/10">
                  <group.icon className="size-5 text-brand" />
                </span>
                <h3 className="font-display text-base font-medium">{group.title}</h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {group.description}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full bg-white/6 px-3 py-1 text-xs text-muted-foreground ring-1 ring-white/10"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
