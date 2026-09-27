"use client";

/**
 * ============================================================================
 *  useActiveSection — which section is the reader currently in?
 * ============================================================================
 * Powers the navbar's active-link highlight.
 *
 * ── WHY NOT IntersectionObserver? ───────────────────────────────────────────
 * The "obvious" implementation observes every section and picks the one with
 * the highest `intersectionRatio`. In practice that misbehaves on exactly the
 * page we're building:
 *
 *   • The hero is ~100vh tall, a project card is ~200px. A big section can be
 *     the one you're reading while a small one "wins" on ratio.
 *   • Multiple sections are often visible at once during a transition, and
 *     ratios cross over in the middle rather than at the boundaries.
 *   • Sections that aren't in the DOM yet (or are hidden) silently never fire.
 *
 * ── THE APPROACH USED HERE ──────────────────────────────────────────────────
 * Treat it as a reading-position question instead of a visibility question:
 *
 *     "Which section's top edge was the most recent one to cross
 *      a horizontal line placed just below the navbar?"
 *
 * Walk the sections in document order, keep the LAST one whose
 * `getBoundingClientRect().top` has passed that line, and that's the answer.
 * It's ~10 lines, has no crossover ambiguity, and behaves correctly regardless
 * of how tall any individual section is.
 *
 * ── PERFORMANCE ─────────────────────────────────────────────────────────────
 * `getBoundingClientRect()` forces the browser to flush pending layout, so
 * calling it on every scroll event for every section is a classic source of
 * scroll jank. Two guards:
 *
 *   1. The handler is wrapped in `requestAnimationFrame`, so we read layout at
 *      most once per painted frame no matter how many scroll events fire.
 *   2. `{ passive: true }` tells the browser we will never call
 *      `preventDefault()`, so it can keep scrolling on the compositor thread
 *      and won't wait for our JS.
 *
 * `setActive` with an unchanged string is a no-op in React (it bails out of
 * the re-render), so we also get free de-duplication.
 * ============================================================================
 */

import { useEffect, useState } from "react";

export function useActiveSection(
  /** Section ids in document order, without the leading "#". */
  ids: readonly string[],
  /**
   * How far down the viewport the "reading line" sits, in px. Should roughly
   * clear the fixed navbar so a section counts as active the moment its
   * heading is visible rather than when it touches the very top.
   */
  offset = 140,
): string | null {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    /* `raf` holds the id of a scheduled frame so we can cancel a pending one
     * when a newer scroll event arrives. Without this we'd queue a frame per
     * scroll event (dozens per second) instead of one per paint. */
    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let current: string | null = null;

        // Sections are in document order, so the last match is the innermost
        // / furthest-down one whose top has passed our line.
        for (const id of ids) {
          const element = document.getElementById(id);
          if (!element) continue;
          if (element.getBoundingClientRect().top <= offset) {
            current = id;
          }
        }

        /* Reaching the bottom of the page is a special case: the final
         * section is often shorter than the viewport, so its top may never
         * cross the line and it would be impossible to highlight. If we're
         * within a couple of px of the bottom, force the last section. */
        const scrolledToBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 2;
        if (scrolledToBottom) {
          current = ids.at(-1) ?? null;
        }

        setActiveSection(current);
      });
    };

    update(); // Run once on mount so the correct link is lit before any scroll.
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
    /* `ids` is expected to be a module-level constant (see `navItems`), so this
     * effect runs once. If you ever pass an inline array, wrap it in `useMemo`
     * at the call site or the listener will be torn down and rebuilt on every
     * render. */
  }, [ids, offset]);

  return activeSection;
}
