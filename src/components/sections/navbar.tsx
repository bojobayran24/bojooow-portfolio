"use client";

/**
 * ============================================================================
 *  Navbar — fixed, progressively glassmorphic, with scroll-spy
 * ============================================================================
 *
 * ── WHY `"use client"` ──────────────────────────────────────────────────────
 * This component uses `useState` (mobile menu open/closed), `useEffect` (via
 * `useActiveSection`), and Framer Motion's scroll hooks. None of those exist on
 * the server, so the module must be a Client Component.
 *
 * ── THE PROGRESSIVE BLUR, AND HOW IT'S CALCULATED ───────────────────────────
 * At the top of the page the bar is transparent — the hero shows through
 * untouched. As you scroll it darkens and blurs. That's driven by three
 * MotionValues derived from ONE scroll reading:
 *
 *   1. `useScroll().scrollY` -> raw scroll offset in px (0, 137, 402, ...).
 *
 *   2. `useTransform(scrollY, [0, 140], [0, 18])`
 *        -> maps scroll px onto a blur radius in px, LINEARLY, clamping at both
 *           ends. Concretely: at scrollY = 70 we're halfway through the input
 *           range, so we get halfway through the output range: 9px. Below 0 it
 *           stays 0; above 140 it stays 18.
 *
 *      The input range [0, 140] is roughly two navbar heights — responsive
 *      enough to feel immediate, long enough not to snap to full blur after a
 *      single wheel notch.
 *
 *   3. `useMotionTemplate` builds a STRING from those numbers. Template
 *      literals can't interpolate a MotionValue directly, so Framer Motion
 *      provides a tagged template that can. This:
 *
 *          useMotionTemplate`blur(${blurRadius}px) saturate(170%)`
 *
 *      produces a live `backdrop-filter` like `blur(9px) saturate(170%)` which
 *      updates without a React re-render.
 *
 * ── A PERFORMANCE NOTE WORTH KNOWING ────────────────────────────────────────
 * `backdrop-filter` is more expensive than animating `opacity`: the browser
 * re-samples everything behind the element. If you profile this on a slow
 * device and see scroll jank, the cheaper equivalent is a static
 * `backdrop-blur-xl` layer whose `opacity` ramps 0 -> 1. It looks nearly
 * identical, because the blurred content simply becomes more visible. We take
 * the literal-blur route because one fixed element at the top of the paint
 * order handles it comfortably.
 * ============================================================================
 */

import { useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { imageSizes, navItems, profile } from "@/data/data";
import { useActiveSection } from "@/hooks/use-active-section";
import { cn } from "@/lib/utils";

/**
 * Section ids for the scroll-spy, derived from the shared nav config so the two
 * can never drift apart. `href` is "#home"; `slice(1)` strips the "#".
 *
 * Declared at MODULE scope deliberately: `useActiveSection` takes `ids` as an
 * effect dependency, so a fresh array literal on every render would tear down
 * and rebuild its scroll listener constantly.
 */
const SECTION_IDS = navItems.map((item) => item.href.slice(1));

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /* Which section's heading has most recently crossed the reading line. */
  const activeSection = useActiveSection(SECTION_IDS);

  /* ── ONE SCROLL READING, THREE DERIVED VALUES ──────────────────────────── */
  const { scrollY } = useScroll();

  /** scroll px -> blur radius px, clamped linearly across a 140px band. */
  const blurRadius = useTransform(scrollY, [0, 140], [0, 18]);

  /** scroll px -> background opacity. 0 at the very top (fully see-through),
   *  0.72 once we're 140px down (readable, but still translucent glass). */
  const backgroundOpacity = useTransform(scrollY, [0, 140], [0, 0.72]);

  /** scroll px -> bottom hairline opacity, so the bar gains an edge that
   *  separates it from content scrolling underneath. */
  const borderOpacity = useTransform(scrollY, [0, 140], [0, 1]);

  /** Compose the live `backdrop-filter` string from the derived blur radius. */
  const backdropFilter = useMotionTemplate`blur(${blurRadius}px) saturate(170%)`;

  return (
    /* z-40 sits UNDER the scroll progress bar (z-70) so the gradient bar always
       stays visible above the glass. */
    <motion.header className="fixed inset-x-0 top-0 z-40">
      {/* ── BACKGROUND LAYER ──────────────────────────────────────────────
          Absolutely positioned and `aria-hidden` — it's decorative. Because we
          animate only `opacity` and `backdrop-filter` (never `height`,
          `padding`, or `top`), this never triggers layout. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-[var(--background)] backdrop-blur-md"
        style={{
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
          opacity: backgroundOpacity,
        }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-white/10"
        style={{ opacity: borderOpacity }}
      />

      {/* ── CONTENT LAYER ─────────────────────────────────────────────────── */}
      <nav
        aria-label="Primary"
        className="container-page relative flex h-18 items-center justify-between gap-4"
      >
        {/* ── BRAND ──────────────────────────────────────────────────────────
            The white plate is GONE, and the fix is in the asset rather than
            the markup. The original PNG was a dark navy mark (average
            luminance 85) that would have vanished on our near-black
            background — which is why it used to sit on a white chip.

            `public/images/logo-mark.png` is the same artwork with the same
            alpha channel, but the colour channels are pushed up (average
            luminance 85 -> 146). The mark now carries its own presence, and a
            violet `drop-shadow` supplies the halo the white plate used to
            fake.

            Why this beats the chip: a white rectangle is a foreign object in
            a dark UI. It pulls the eye to the container instead of the mark,
            and it only works standing still. A brightened transparent asset
            works at any size and over any backdrop. */}
        <a
          href="#home"
          className="group flex shrink-0 items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          aria-label={`${profile.name} — back to top`}
        >
          <span className="relative grid size-9 shrink-0 place-items-center">
            <Image
              src={profile.logo}
              alt=""
              width={imageSizes.logo.width}
              height={imageSizes.logo.height}
              /* `priority` because this image is above the fold in the fixed
                 header — it should not be lazy-loaded, or the logo would pop in
                 after the rest of the navbar has painted. */
              priority
              /* `drop-shadow` (not `box-shadow`) follows the ALPHA channel, so
                 the glow traces the galaxy mark's own silhouette instead of
                 drawing a rectangle around it. That's what makes a transparent
                 PNG read as if it were lit from within. */
              className="size-9 object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-transform duration-300 group-hover:scale-110"
            />
          </span>
          <span className="hidden text-sm font-medium tracking-tight sm:block">
            {profile.name}
            <span className="block text-[0.65rem] font-normal text-muted-foreground">
              {profile.role}
            </span>
          </span>
        </a>

        {/* ── DESKTOP LINKS ─────────────────────────────────────────────────
            Six links is a lot for a centred row, so the breakpoint is `lg`
            rather than `md`: below 1024px the hamburger takes over instead of
            the labels wrapping into an unreadable smear.

            A plain <a> is correct for same-page anchors. next/link is for
            client-side ROUTE navigation; using it for a hash link would ask the
            router to do work it doesn't need to do. */}
        <ul className="hidden items-center lg:flex">
          {navItems.map((item) => {
            const isActive = activeSection === item.href.slice(1);
            return (
              <li key={item.href} className="relative">
                <a
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "relative block rounded-full px-3 py-2 text-[0.82rem] transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {/* ── SHARED LAYOUT ANIMATION ─────────────────────────────
                      Both the pill and the underline use `layoutId`. When a
                      Motion component unmounts and another mounts elsewhere
                      with the SAME layoutId, Framer Motion doesn't see two
                      elements — it sees ONE element that moved, and animates
                      the gap.

                      That's why the highlight glides between links instead of
                      fading out here and fading in there. The mechanism is
                      FLIP: measure First, measure Last, Invert the transform,
                      then Play it forward. */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-white/6 ring-1 ring-white/10"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-underline"
                      /* The active-link underline: the same two-hue violet ->
                         cyan gradient as the progress bar, but with transparent
                         ends so the line dissolves into the bar rather than
                         stopping abruptly under the shorter labels. */
                      className="absolute inset-x-3 -bottom-px h-px bg-[linear-gradient(90deg,transparent,var(--brand-violet),var(--brand-cyan),transparent)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        {/* ── DESKTOP CTA ──────────────────────────────────────────────────── */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <a
            href="#contact"
            className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-white/6 px-4 text-sm font-medium ring-1 ring-white/12 transition-all hover:bg-white/10 hover:ring-white/20"
          >
            Let&apos;s talk
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* ── MOBILE / TABLET TOGGLE ───────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/6 ring-1 ring-white/12 transition-colors hover:bg-white/10 lg:hidden"
        >
          {/* The icon swap is a genuine mount/unmount, so AnimatePresence is the
              right tool: it keeps the outgoing icon mounted until its exit
              animation completes, enabling a cross-fade + rotate. */}
          <AnimatePresence initial={false} mode="wait">
            {isMenuOpen ? (
              <motion.span
                key="close"
                initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                transition={{ duration: 0.18 }}
              >
                <X className="size-4.5" />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
                transition={{ duration: 0.18 }}
              >
                <Menu className="size-4.5" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </nav>

      {/* ── MOBILE / TABLET PANEL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            className="container-page overflow-hidden pb-4 lg:hidden"
            /* Animating `height: auto` works in Framer Motion: it measures the
               target height, animates to it, then releases back to `auto`.
               Animating height does force layout on this subtree, which is
               acceptable for a menu opened a few times per session — and
               unavoidable if the panel should push content rather than overlay
               it. */
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="glass mt-2 rounded-2xl p-2">
              <ul className="flex flex-col">
                {navItems.map((item, index) => (
                  <motion.li
                    key={item.href}
                    /* Each row slides in from the left, offset by its index so
                       the list cascades downward. `delay` is derived from the
                       index rather than hard-coded per row. */
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + index * 0.04, duration: 0.3 }}
                  >
                    <a
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-colors",
                        activeSection === item.href.slice(1)
                          ? "bg-white/8 text-foreground"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                      )}
                    >
                      {item.label}
                      <ArrowUpRight className="size-3.5 opacity-50" />
                    </a>
                  </motion.li>
                ))}
              </ul>

              {/* Contact details have no other home on small screens, and this
                  is where a recruiter is most likely to want them. */}
              <div className="mt-1 border-t border-white/8 px-4 py-3">
                <p className="text-[0.7rem] text-muted-foreground">
                  {profile.currentPosition} · {profile.currentEmployer}
                </p>
                <a
                  href={`mailto:${profile.email}`}
                  className="mt-1 block truncate text-[0.7rem] text-brand-3 hover:underline"
                >
                  {profile.email}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
