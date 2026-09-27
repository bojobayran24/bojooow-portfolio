"use client";

/**
 * ============================================================================
 *  Hero — animated entrance + scroll-driven parallax
 * ============================================================================
 *
 * ── THE MOST IMPORTANT ANIMATION DECISION IN THIS FILE ──────────────────────
 * Should the hero use `animate` or `whileInView`?
 *
 *   `animate`      — plays immediately on mount. Correct for content that is
 *                    ALREADY on screen when the page loads.
 *   `whileInView`  — plays when the element scrolls into view. Correct for
 *                    content further down the page.
 *
 * The hero is above the fold, so `animate` is the semantically right choice.
 * Using `whileInView` here would fire the reveal instantly on load while still
 * paying for an IntersectionObserver we don't need.
 *
 * Rule of thumb for the rest of the site: above the fold -> `animate`,
 * below the fold -> `whileInView`.
 *
 * ── USING `useScroll` WITH A `target` (SCROLL-LINKED, NOT SCROLL-TRIGGERED) ──
 * So far we've seen two kinds of Framer Motion animation:
 *
 *   • TRIGGERED — `whileInView`, `animate` on mount. Fires once, at a moment.
 *   • LINKED    — the animation's progress IS the scroll position, every frame.
 *
 * This section is LINKED. We bind `useScroll` to the hero element itself:
 *
 *     useScroll({ target: sectionRef, offset: ["start start", "end start"] })
 *
 * `offset` is the part that needs decoding. Each of the two strings reads as
 * "<elementEdge> <viewportEdge>":
 *
 *     "start start" -> progress 0: the element's TOP meets the viewport's TOP
 *     "end start"   -> progress 1: the element's BOTTOM meets the viewport's TOP
 *
 * So `scrollYProgress` runs 0 -> 1 over exactly the distance it takes the hero
 * to scroll completely off the top of the screen.
 *
 * ── WHY THAT BEATS RAW `scrollY` ────────────────────────────────────────────
 * Raw scrollY depends on where the element sits in the document and how tall
 * the page is. `scrollYProgress` against a target is NORMALIZED to that
 * element's own geometry, so the effect behaves identically whether the page
 * is 4 screens or 40. It's the difference between "offset by 300px" (which
 * breaks the moment you add a section above) and "40% of the way out".
 * ============================================================================
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import { useCanAnimate } from "@/components/animations";
import {
  heroHeadline,
  heroRoles,
  heroStats,
  imageSizes,
  profile,
} from "@/data/data";

/* ==========================================================================
 * TUNING CONSTANTS — the shared motion vocabulary for this section
 * ======================================================================== */

/** Easing: `[x1, y1, x2, y2]` is a cubic-bezier. This one starts fast and
 *  settles slowly, which reads as confident rather than floaty. It matches the
 *  app-wide default set in `MotionProvider`. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Orchestration for the headline. The PARENT's `visible` variant carries the
 *  timing; children only describe their own start/end states. See the
 *  variant-propagation notes in `components/animations/scroll-reveal.tsx`. */
const headlineContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const headlineWord: Variants = {
  hidden: {
    opacity: 0,
    y: 36,
    /* These two create a "card tilting up into place" feel.
     * `transformPerspective` supplies the depth — without it a rotateX looks
     * like a flat vertical squash. Putting it on the animated element itself
     * (rather than a parent `perspective`) keeps the effect self-contained. */
    transformPerspective: 900,
    rotateX: -55,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.85, ease: EASE_OUT },
  },
};

/* ==========================================================================
 * RoleRotator — cycles through `heroRoles`
 * ======================================================================== */

function RoleRotator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % heroRoles.length),
      2600,
    );
    /* CRITICAL CLEANUP. Without this the interval keeps firing after unmount
     * (and React's dev-mode double-mount would leave two timers running). */
    return () => clearInterval(timer);
  }, []);

  return (
    /* `mode="wait"` makes AnimatePresence finish the EXIT of the outgoing line
     * before starting the ENTER of the incoming one. Without it both are
     * mounted at once and overlap. `key` is how AnimatePresence identifies
     * which child is leaving — it must be unique per item. */
    <span className="relative inline-grid overflow-hidden align-bottom">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={heroRoles[index]}
          className="text-gradient font-semibold"
          initial={{ y: "0.9em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-0.9em", opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
        >
          {heroRoles[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ==========================================================================
 * Hero
 * ======================================================================== */

export function Hero() {
  /* `useScroll({ target })` needs a real element to measure, so this ref is
   * attached to both the hook and the <section>. */
  const sectionRef = useRef<HTMLElement>(null);

  /** `true` when the OS reports "Reduce Motion". */
  const prefersReducedMotion = useReducedMotion();

  /* ── THE ENTRANCE ANIMATIONS FAIL OPEN ──────────────────────────────────
   * Every animated element below starts at `opacity: 0`. That is safe only if
   * the animation runs. In an environment where `requestAnimationFrame` never
   * ticks — some embedded webviews — "fade in" silently becomes "never appear",
   * and the hero renders half empty.
   *
   * `useCanAnimate` measures whether frames actually tick, and `entrance` is
   * true only once that is PROVEN. Until then every element below passes
   * `initial={false}` instead of its hidden state.
   *
   * `initial={false}` is Framer Motion's "skip to the end" flag: the element
   * renders at its `animate` values with nothing to interpolate. So the fallback
   * is not a fade that happens instantly — there is no animation at all, and
   * the content is simply there. In a healthy browser `entrance` flips to true
   * within a frame or two of paint, which is early enough that the entrance
   * still looks identical. */
  const canAnimate = useCanAnimate();
  const entrance = canAnimate === true;

  /* ── SCROLL-LINKED PROGRESS: 0 -> 1 as the hero exits the top ──────────── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /* ── DERIVED PARALLAX VALUES ──────────────────────────────────────────────
   * Every value below derives from that ONE progress reading, so the section
   * can never disagree with itself about how far we've scrolled.
   *
   * Read each line as: "map progress from [inputRange] onto [outputRange]".
   * Outside the input range the value is clamped (held at the nearest end),
   * which is why scrolling back up retraces the effect exactly.
   *
   *   contentY       0 -> 110px  moves DOWN, in the same direction as the page
   *                              but slower, so it lags -> classic depth cue.
   *   contentOpacity 1 -> 0 over the first 65% of the exit. Holding full
   *                              opacity until 0.65 means the text isn't
   *                              visibly faded the moment you start scrolling.
   *   contentScale   1 -> 0.96   a subtle recede; any more reads as a zoom.
   *   orbY           0 -> -130px the orbs move UP, OPPOSITE to the content.
   *                              Opposing motion between layers is what
   *                              actually sells depth — same-direction motion
   *                              at different speeds is a far weaker cue.
   */
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
  const orbOneY = useTransform(scrollYProgress, [0, 1], [0, -130]);
  const orbTwoY = useTransform(scrollYProgress, [0, 1], [0, -70]);

  /* ── POINTER SPOTLIGHT ────────────────────────────────────────────────────
   * A soft light that follows the cursor. Two details keep it cheap:
   *
   *  1. `useMotionValue` updates WITHOUT re-rendering React. We write the
   *     pointer position straight into these values.
   *
   *  2. The radial gradient is STATIC CSS. Only the element's `x`/`y`
   *     transform changes. Animating a transform is compositor work;
   *     re-generating a radial-gradient string every frame would be paint work
   *     on a full-viewport layer. Same visual, roughly an order of magnitude
   *     cheaper.
   *
   * `useSpring` on each axis gives the light inertia so it trails the cursor
   * instead of feeling welded to it.
   */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const spotlightX = useSpring(pointerX, { stiffness: 120, damping: 25, mass: 0.4 });
  const spotlightY = useSpring(pointerY, { stiffness: 120, damping: 25, mass: 0.4 });

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    /* A light chasing the cursor is exactly the kind of decorative motion
     * reduced-motion users opted out of, so we bail out at the source. */
    if (prefersReducedMotion) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    /* `clientX/Y` are viewport-relative, but the spotlight is positioned
     * relative to the section, so convert by subtracting the section's own
     * top-left corner. */
    pointerX.set(event.clientX - bounds.left);
    pointerY.set(event.clientY - bounds.top);
  }

  /* Splitting a headline into animated spans is hostile to screen readers
   * (some announce each span separately), so the <h1> carries the full
   * sentence in `aria-label` and the animated markup is hidden from the
   * accessibility tree. */
  const headlineText = heroHeadline.map((word) => word.text).join(" ");

  return (
    <section
      id="home"
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      /* `isolate` creates a new stacking context so the negative-z decorative
         layers below can't slip behind the page background.
         `overflow-hidden` stops the orbs from causing a horizontal scrollbar.
         `pt-32` clears the fixed navbar.

         The section is a COLUMN flex container: a flexible content area that
         centres itself, followed by the scroll cue in normal flow. An earlier
         version absolutely positioned the cue at `bottom-7`, which overlapped
         the stats panel whenever the content grew taller than the viewport.
         Keeping it in flow makes overlap structurally impossible — the section
         simply grows instead. */
      className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden pt-24 pb-16"
    >
      {/* ==================================================================
          LAYER 1 — BACKDROP (decorative only)
          Everything here is `aria-hidden` and `pointer-events-none`: it must
          never intercept clicks nor appear in the accessibility tree.
         ================================================================== */}

      {/* Blueprint grid, dissolved at the edges by the mask utility so it
          fades into the background instead of ending in a hard line. */}
      <div
        aria-hidden="true"
        className="bg-grid mask-fade-edges pointer-events-none absolute inset-0 -z-30"
      />

      {/* Brand gradient wash bleeding down from the top of the page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-20 h-[36rem] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_oklab,var(--brand-violet)_28%,transparent),transparent)]"
      />

      {/* ── FLOATING ORBS ────────────────────────────────────────────────────
          Each orb uses TWO nested elements because it needs two independent
          transforms:
            • the OUTER motion.div carries scroll parallax (`style={{ y }}`) —
              it must be scroll-linked, so it's Framer Motion.
            • the INNER div carries the idle drift (`animate-float-slow`) — it's
              decorative and perpetual, so it's a CSS keyframe, running off the
              main thread for free.
          Nesting is the trick: it stops the two animations from fighting over
          one `transform` property. */}
      <motion.div
        aria-hidden="true"
        style={{ y: prefersReducedMotion ? 0 : orbOneY }}
        className="pointer-events-none absolute -z-20 top-[12%] -left-[10%]"
      >
        <div className="animate-float-slow size-[26rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--brand-violet)_38%,transparent),transparent_70%)] blur-3xl" />
      </motion.div>

      <motion.div
        aria-hidden="true"
        style={{ y: prefersReducedMotion ? 0 : orbTwoY }}
        className="pointer-events-none absolute right-[-8%] bottom-[8%] -z-20"
      >
        <div className="animate-float size-[22rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--brand-cyan)_30%,transparent),transparent_70%)] blur-3xl" />
      </motion.div>

      {/* ── POINTER SPOTLIGHT ────────────────────────────────────────────────
          Structure matters here. The OUTER div is parked at the section's
          top-left corner and uses a Tailwind `-translate-1/2` to re-centre the
          light on that corner (translating by half the element's own size).
          The INNER motion.div then translates by the pointer offset.

          Why two elements? Because Framer Motion owns the `transform` property
          of whatever element you pass `x`/`y` to. If we put the centring
          translate and the pointer translate on the SAME element, one would
          overwrite the other. Separate elements, separate transforms. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 -z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block"
      >
        <motion.div
          style={{ x: spotlightX, y: spotlightY }}
          className="size-[34rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--brand-violet)_18%,transparent),transparent_65%)] blur-2xl"
        />
      </div>

      {/* ==================================================================
          LAYER 2 — CONTENT
          A single motion.div applies all three content parallax values.
         ================================================================== */}
      <motion.div
        /* `flex-1` claims all the free vertical space and `justify-center`
           centres the content inside it, so the block is optically centred
           when there's room and simply grows when there isn't. */
        className="container-page relative flex flex-1 flex-col items-center justify-center"
        /* With reduced motion we drop the transforms at the source. MotionConfig
           would strip the animation *transition*, but a MotionValue bound to
           `style` is written inline every frame regardless — so the guard has
           to live here. Opacity is kept: it's not vestibularly triggering, and
           removing it would break the fade-out. */
        style={
          prefersReducedMotion
            ? { opacity: contentOpacity }
            : { y: contentY, opacity: contentOpacity, scale: contentScale }
        }
      >
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          {/* ── AVATAR ──────────────────────────────────────────────────────
              Carried over from the original portfolio, which led its hero with
              a graduation photo. The rotating conic-gradient ring is pure CSS:
              a conic gradient on an absolutely positioned sibling, rotated by
              the `orbit` keyframe. No JS, no main-thread cost.

              Two elements again, for the same reason as the orbs — the ring
              owns `transform: rotate()` via CSS, the photo owns nothing, so
              they can't fight over one transform property. */}
          <motion.div
            initial={entrance ? { opacity: 0, scale: 0.85 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
            className="relative mb-5"
          >
            {!prefersReducedMotion && (
              <span
                aria-hidden="true"
                /* `-inset-[3px]` makes the ring slightly larger than the photo,
                   which is what produces the halo edge rather than a hard rim.
                   `blur-[3px]` softens it into a glow. */
                /* A PALINDROME conic gradient — it starts and ends on violet,
                   so the 360deg sweep has no visible seam where the gradient
                   wraps. The old version added pink as a third stop, which on
                   a thin ring is both a rainbow and a visible join. */
                className="animate-orbit absolute -inset-[3px] rounded-full bg-[conic-gradient(from_0deg,var(--brand-violet),var(--brand-cyan),var(--brand-violet))] opacity-80 blur-[3px]"
              />
            )}
            <Image
              src={profile.avatar}
              /* Empty alt + `aria-hidden` on the wrapper would hide it, but this
                 photo IS meaningful (it's the person), so it gets a real alt.
                 `priority` because it's above the fold — lazy-loading it would
                 make the face pop in late. */
              alt={profile.name}
              width={imageSizes.avatar.width}
              height={imageSizes.avatar.height}
              priority
              className="relative size-20 rounded-full object-cover ring-2 ring-[var(--background)]"
            />
          </motion.div>

          {/* ── AVAILABILITY BADGE ──────────────────────────────────────── */}
          {profile.availability && (
            <motion.div
              initial={entrance ? { opacity: 0, y: 16 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 }}
              className="glass mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-muted-foreground"
            >
              {/* Two stacked dots: a pulsing halo plus a solid core. The halo
                  uses the CSS `pulse-glow` keyframe from globals.css. */}
              <span className="relative grid size-1.5 place-items-center">
                <span className="animate-pulse-glow absolute inline-flex size-2.5 rounded-full bg-emerald-400" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
              </span>
              {profile.availability}
              <span className="mx-0.5 h-3 w-px bg-white/15" />
              <MapPin className="size-3" />
              {profile.location}
              <span className="mx-0.5 h-3 w-px bg-white/15" />
              {/* Their age was a deliberate part of the original hero, so it
                  stays — just moved down in visual priority. */}
              {profile.age} yrs
            </motion.div>
          )}

          {/* ── HEADLINE ──────────────────────────────────────────────────── */}
          <h1
            aria-label={headlineText}
            /* The clamp() is doing real work: 2.2rem is the mobile floor, 6.4vw
               is the fluid middle, 4.2rem is the desktop ceiling. Using vw
               rather than a fixed size means the headline scales with the
               viewport instead of forcing the hero taller than the screen on
               smaller laptops. */
            className="font-display text-[clamp(2.2rem,6.4vw,4.2rem)] leading-[1.06] font-semibold tracking-tight text-balance"
          >
            <motion.span
              aria-hidden="true"
              className="inline-flex flex-wrap justify-center gap-x-[0.28em] gap-y-1"
              variants={headlineContainer}
              /* `false` disables the mount animation for the whole subtree, so
                 the words paint at their `visible` state instead of waiting to
                 be staggered in. See the `entrance` note above. */
              initial={entrance ? "hidden" : false}
              animate="visible"
            >
              {heroHeadline.map((word, index) => (
                <motion.span
                  /* Word text alone isn't guaranteed unique, so the index is
                   * appended to keep the React key stable and unique. */
                  key={`${word.text}-${index}`}
                  variants={headlineWord}
                  /* `inline-block` is REQUIRED. CSS ignores transforms on
                   * inline elements, so without it the rotateX/translateY in
                   * the variant would silently do nothing. */
                  className="inline-block will-change-transform"
                >
                  {word.accent ? (
                    <span className="text-gradient font-bold">{word.text}</span>
                  ) : (
                    word.text
                  )}
                  {/* A LITERAL TRAILING SPACE, and it is not cosmetic.
                   *
                   * The `gap-x` on the parent spaces the words visually, but a
                   * CSS gap is not a character — it exists nowhere in the DOM.
                   * Without this, `h1.textContent` is literally
                   * "IanalyzesystemsandbuildthemwithAI.", which is what search
                   * engines index and what you'd get when copy-pasting the
                   * headline.
                   *
                   * A trailing space inside an inline-block is collapsed during
                   * layout, so this changes the rendering by exactly zero
                   * pixels while making the text content correct. */}
                  {" "}
                </motion.span>
              ))}
            </motion.span>
          </h1>

          {/* ── ROTATING ROLE LINE ──────────────────────────────────────── */}
          <motion.p
            initial={entrance ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.75 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-x-2 text-base text-muted-foreground sm:text-lg"
          >
            <RoleRotator />
            <span className="text-muted-foreground/70">
              at {profile.currentEmployer}
            </span>
          </motion.p>

          {/* ── TAGLINE ───────────────────────────────────────────────────── */}
          <motion.p
            initial={entrance ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.85 }}
            className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground text-pretty sm:text-base"
          >
            {profile.tagline}
          </motion.p>

          {/* ── CALLS TO ACTION ───────────────────────────────────────────── */}
          <motion.div
            initial={entrance ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.95 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
          >
            <a
              href="#projects"
              /* The primary CTA reuses the SAME two-stop violet -> cyan
                 gradient as the progress bar, so the strongest button on the
                 page and the scroll indicator are visibly the same material.
                 A glow (not a flat fill) is what stops it looking like a
                 generic SaaS button on a dark page. */
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-[linear-gradient(100deg,var(--brand-violet),var(--brand-cyan))] px-6 text-sm font-medium text-white shadow-[0_10px_30px_-10px_color-mix(in_oklab,var(--brand-violet)_75%,transparent)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              View my work
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="#contact"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white/6 px-6 text-sm font-medium ring-1 ring-white/12 transition-colors hover:bg-white/10 hover:ring-white/20"
            >
              Get in touch
            </a>
          </motion.div>

          {/* ── STATS ─────────────────────────────────────────────────────── */}
          <motion.dl
            initial={entrance ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: 1.05 }}
            /* Four stats now (derived from the project list), so the grid goes
               2 -> 4 columns rather than 1 -> 3, which would strand an orphan
               on a second row at tablet width and add ~70px of height. */
            className="mt-8 grid w-full max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/8 sm:grid-cols-4"
          >
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                /* `gap-px` on the parent (plus an opaque-ish background on the
                   container) is how you draw 1px dividers without borders: each
                   cell paints its own background, and the parent's tint shows
                   through the single-pixel gaps between them. */
                className="flex flex-col items-center gap-1 bg-background/60 px-4 py-4 backdrop-blur-sm sm:px-5"
              >
                {/* `order-*` puts the value visually first while keeping the
                    semantically correct <dt> (term) before <dd> (definition)
                    in the DOM — required markup order, desired visual order. */}
                <dt className="order-2 text-center text-[0.65rem] tracking-wide text-muted-foreground uppercase">
                  {stat.label}
                </dt>
                <dd className="order-1 font-display text-2xl font-semibold tracking-tight text-brand-3 sm:text-3xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </motion.div>
    </section>
  );
}
