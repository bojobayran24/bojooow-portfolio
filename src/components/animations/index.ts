/**
 * Barrel file for the animation kit.
 *
 * WHY: sections then import from one predictable path —
 *     import { ScrollStage } from "@/components/animations";
 * instead of reaching into individual files. If we later split or rename a
 * module, only this file changes.
 *
 * ── THERE USED TO BE THREE REVEAL PRIMITIVES HERE ───────────────────────────
 * `FadeIn` (one element, `whileInView`), `ScrollReveal` + `ScrollRevealItem`
 * (a group, driven by the `useInView` hook and a boolean). All three were
 * TRIGGERED: they waited for an element to cross a line and then played a
 * fixed-duration animation on their own clock.
 *
 * They have been replaced by a single `ScrollStage`, which is SCRUBBED: its
 * animation progress is the scroll position itself, so scrolling up rewinds it.
 * The old variants survive as presets — `"fade"` is FadeIn, `"rise"` is the
 * group item, and passing a `stagger` slot reproduces the cascade that
 * `ScrollRevealItem` used to get from its parent.
 *
 * Keeping one primitive instead of three means one place to reason about the
 * visibility guarantee, one place to tune the motion language, and no chance of
 * a section quietly using the mechanism that behaves differently from its
 * neighbours.
 *
 * NOTE: every module re-exported here starts with `"use client"`. Importing
 * this barrel from a Server Component is fine — it simply pulls in client
 * boundaries at those points.
 */

export { MotionProvider } from "./motion-provider";
export { ScrollProgress } from "./scroll-progress";
export {
  ScrollStage,
  type ScrollStageProps,
  type StageVariant,
} from "./scroll-stage";
/** Exposed for components that need to gate their own motion the same way. */
export { useCanAnimate } from "./use-can-animate";
