"use client";

/**
 * ============================================================================
 *  useCanAnimate — "can this environment actually run an animation?"
 * ============================================================================
 *
 * ── THE FAILURE MODE THIS EXISTS TO PREVENT ─────────────────────────────────
 * Every scroll reveal on this site works by rendering content at `opacity: 0`
 * and animating it to 1. That is a bet: it assumes the animation will run.
 *
 * When the bet loses, the content is not merely "unanimated" — it is
 * PERMANENTLY INVISIBLE. A visitor sees empty sections and concludes the site
 * is broken. For a portfolio, whose whole job is showing work, that is the
 * worst failure available.
 *
 * And the bet loses in the real world more often than you'd think:
 *   • Embedded webviews and preview panes sometimes stop servicing
 *     `requestAnimationFrame` entirely — the page paints once, then freezes.
 *   • Aggressive battery savers throttle rAF hard.
 *   • Screenshot / automation / headless renderers frequently disable it.
 *
 * ── WHY THIS RETURNS "MAYBE" INSTEAD OF YES/NO ──────────────────────────────
 * The important design decision here is what the UNCERTAIN state does.
 *
 * The old design hid content immediately and asked for forgiveness later. This
 * hook inverts that: content stays VISIBLE until there is positive proof that
 * animation works. The three states are:
 *
 *   `null`  — not measured yet (server render, and the first ~120ms on the
 *             client). Callers must NOT hide anything.
 *   `true`  — frames ticked while the document was visible. Animation works.
 *             Only now is it safe to hide something and reveal it later.
 *   `false` — the document was visible and frames still didn't tick. This
 *             environment cannot animate; never hide anything.
 *
 * Anything other than `true` means "show the content". That is what makes the
 * page safe: the only path that can hide content is one that has proved it can
 * also bring it back.
 *
 * ── WHY MEASURING BEATS FEATURE-DETECTING ───────────────────────────────────
 * `typeof requestAnimationFrame === "function"` is true in EVERY environment
 * that fails here — including the one that prompted this hook. A feature test
 * answers "does the API exist", but the question is "does it ever fire". Only
 * running it answers that:
 *
 *   1. Start a rAF loop and count frames.
 *   2. Wait ~120ms. A healthy browser manages roughly 7 frames in that time.
 *   3. Two or more frames means animation works.
 *
 * The window is short on purpose. Callers act on the answer by hiding
 * below-the-fold content, and the sooner that happens the less chance anyone
 * notices the handoff.
 *
 * ── THE BACKGROUND-TAB TRAP ────────────────────────────────────────────────
 * Browsers deliberately PAUSE rAF in background tabs, so a low frame count
 * there means nothing at all. A user who opens the portfolio in a background
 * tab must not get a site stripped of its animations.
 *
 * So a zero count is only read as `false` when the document was visible for the
 * whole probe. If it wasn't, we conclude NOTHING (stay `null`, i.e. fail open)
 * and re-probe when the tab is next shown.
 * ============================================================================
 */

import { useEffect, useState } from "react";

/** Long enough for a loaded device to produce a few frames; short enough that
 *  the caller's decision lands almost immediately after paint. */
const PROBE_MS = 120;

/**
 * Deliberately low. We are not measuring frame RATE, only answering "does this
 * loop run at all". Set this near the healthy value (~7) and a briefly busy
 * device would be wrongly declared incapable.
 */
const MIN_TICKS = 2;

export function useCanAnimate(): boolean | null {
  const [canAnimate, setCanAnimate] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let timer = 0;
    let ticks = 0;

    /** Counting frames IS the test. If the loop never runs, `ticks` stays 0 and
     *  that absence is the signal — there is nothing to catch or poll. */
    const countFrames = () => {
      ticks += 1;
      raf = requestAnimationFrame(countFrames);
    };

    const probe = () => {
      if (cancelled) return;
      ticks = 0;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(countFrames);

      timer = window.setTimeout(() => {
        if (cancelled) return;
        cancelAnimationFrame(raf);

        /* A hidden document has rAF paused, so a low count here tells us
         * nothing about the environment. Conclude NOTHING and leave the state
         * at `null` — which keeps content visible — then try again when the tab
         * is shown. Reporting `false` here would strip animation from a
         * perfectly healthy browser. */
        if (document.visibilityState !== "visible") return;

        setCanAnimate(ticks >= MIN_TICKS);
      }, PROBE_MS);
    };

    /** Re-probe on regaining visibility, so a page opened in a background tab
     *  still gets its animations once it's actually on screen. */
    const handleVisibilityChange = () => {
      if (!cancelled && document.visibilityState === "visible") probe();
    };

    probe();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return canAnimate;
}
