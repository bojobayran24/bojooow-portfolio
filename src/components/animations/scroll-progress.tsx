"use client";

/**
 * ============================================================================
 *  ScrollProgress — the glowing gradient bar pinned to the top of the viewport
 * ============================================================================
 *
 * ── WHY THIS FILE HAS TO BE `"use client"` ──────────────────────────────────
 * Next.js renders components on the SERVER by default ("React Server
 * Components"). Server Components cannot ship JavaScript to the browser, so
 * they can't hold state, use effects, or read browser APIs.
 *
 * Framer Motion's hooks (`useScroll`, `useSpring`) all rely on `useEffect`,
 * `useRef` and direct DOM measurement — none of which exist on the server. The
 * `"use client"` directive at the top of the file marks this module *and
 * everything it imports* as a Client Component: Next.js will bundle it, send
 * it to the browser, and it renders during SSR too (producing the initial
 * HTML) then "hydrates" on the client.
 *
 * Cost of `"use client"`: this component ships JS. So we keep the boundary as
 * low in the tree as possible — only the bar is interactive, not the whole
 * page. Sections that are pure content stay Server Components.
 * ============================================================================
 */

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  /* ── 1. READ THE SCROLL POSITION ──────────────────────────────────────────
   * `useScroll()` with NO arguments measures the whole document.
   *
   * What it returns: an object of MotionValues. `scrollYProgress` is a
   * normalized 0 → 1 value:
   *
   *     0   = at the very top of the page
   *     0.5 = halfway down
   *     1   = scrolled to the bottom
   *
   * Internally Framer Motion computes it as roughly:
   *     scrollY / (documentHeight - viewportHeight)
   * and it stays in sync using a passive `scroll` listener plus a rAF loop, so
   * reading it never causes a React re-render.
   *
   * THE KEY INSIGHT: a MotionValue is NOT React state. Updating it does not
   * re-render the component. Framer Motion writes the new value straight to
   * the DOM node's style, so a 60fps scroll tracking costs zero React work.
   * That's why we can drive animation from scroll without perf worries.
   */
  const { scrollYProgress } = useScroll();

  /* ── 2. SMOOTH THE VALUE ──────────────────────────────────────────────────
   * Raw `scrollYProgress` is a 1:1 mirror of the scrollbar — it jitters when
   * you flick the wheel, and on trackpads it can be spiky.
   *
   * `useSpring` wraps a MotionValue in a simple spring so the bar lags very
   * slightly behind the real position and eases into place. The returned value
   * is still a MotionValue, so it's still render-free.
   *
   * The three options are the whole physics of the spring:
   *   • stiffness  → how hard it pulls toward the target. Higher = snappier.
   *   • damping    → how much it resists. Too low and it visibly overshoots.
   *   • restDelta  → the distance from target at which it stops updating.
   *                  0.001 is 0.1% of page height — below perceptual threshold,
   *                  so we stop burning frames when it's essentially settled.
   */
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  /* ── 3. HONOUR THE USER'S MOTION PREFERENCE ───────────────────────────────
   * `useReducedMotion()` returns `true` when the OS reports
   * "Reduce Motion" (see the accessibility block in globals.css for the why).
   *
   * Design decision: a scroll progress indicator is INFORMATION, not
   * decoration — removing it entirely would make the page worse for those
   * users. So instead of hiding it we drop the spring and use the raw 1:1
   * value: the bar still tracks the page exactly, it just never animates
   * independently of the user's own scrolling. That's the correct trade-off.
   */
  const prefersReducedMotion = useReducedMotion();
  const progress = prefersReducedMotion ? scrollYProgress : smoothProgress;

  return (
    /* `aria-hidden` because this is purely decorative — a screen reader gains
       nothing from being told the page is 43% scrolled. */
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-70 h-0.5"
    >
      {/* Layer A — the blurred halo. Sits behind the crisp bar and bleeds
          outward to create the "glowing" look without an SVG filter.

          The gradient is TWO stops (violet -> cyan). It used to be three
          (violet -> pink -> cyan), and that third hue is the entire reason
          the bar read as a rainbow: on a 2px strip, three saturated colours
          are all on screen at once, so the eye sees a spectrum rather than a
          blend. Two hues cannot do that. */}
      <motion.div
        /* ── 4. DRIVE THE ANIMATION WITHOUT REACT ──────────────────────────
         * Passing a MotionValue to `style` is what makes this free: Framer
         * Motion subscribes to the value and writes `transform: scaleX(...)`
         * directly onto the node. No setState, no re-render, no reconciliation.
         *
         * Why `scaleX` instead of animating `width`?
         *   • Changing `width` forces the browser to run LAYOUT every frame
         *     (recalculating geometry for the bar and its siblings).
         *   • `transform` is handled by the COMPOSITOR — the GPU can scale an
         *     already-painted layer. No layout, no paint.
         * This distinction is the single biggest performance win available in
         * scroll animation, which is why every scroll effect in this project
         * animates `transform` or `opacity` and nothing else.
         *
         * `origin-left` (CSS `transform-origin: left`) is essential: scaling
         * grows the element from its anchor point. With the default centre
         * origin the bar would appear to grow outward from the middle. */
        style={{ scaleX: progress }}
        className="absolute inset-0 origin-left bg-[linear-gradient(90deg,var(--brand-violet),var(--brand-cyan))] blur-[7px]"
      />

      {/* Layer B — the crisp bar on top of the halo. */}
      <motion.div
        style={{ scaleX: progress }}
        className="absolute inset-0 origin-left rounded-r-full bg-[linear-gradient(90deg,var(--brand-violet),var(--brand-cyan))]"
      />
    </div>
  );
}
