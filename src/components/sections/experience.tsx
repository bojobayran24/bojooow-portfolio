import { SectionHeading } from "@/components/sections/section-heading";
import { ExperienceTimeline } from "@/components/sections/experience-timeline";
import { experiences } from "@/data/data";

/**
 * ── WHY THIS FILE IS SO SMALL ───────────────────────────────────────────────
 * The Experience section is split in two, on purpose:
 *
 *   experience.tsx           (this file) — SERVER component. A heading and the
 *                                          data import. Zero JavaScript.
 *   experience-timeline.tsx  — CLIENT component. The scrubbed rail and the
 *                              scrubbed cards.
 *
 * The reason the split happens at the timeline rather than here is a ref.
 * `useScroll({ target })` needs to attach a ref to the list element it
 * measures, and refs cannot cross the server/client boundary — so the list's
 * markup has to live inside the client component. Everything that does NOT need
 * that ref stays on the server.
 *
 * `experiences` is plain serializable data (strings and arrays of strings), so
 * passing it across the boundary costs a structured clone and nothing more.
 *
 * Note there is no `"use client"` above. If you add an interactive element to
 * this section later, prefer a small client component over flipping this file —
 * once a file is a client component, everything it renders joins it.
 */
export function Experience() {
  return (
    <section id="experience" className="container-page scroll-mt-24 py-24">
      <SectionHeading
        eyebrow="Experience"
        title="Work Experience"
        description="Two roles, one through-line: taking manual processes and turning them into deployed, automated systems."
      />

      <ExperienceTimeline items={experiences} />
    </section>
  );
}
