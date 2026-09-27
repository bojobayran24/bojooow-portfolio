/**
 * ============================================================================
 *  lib/utils.ts — shared, dependency-free helpers
 * ============================================================================
 *
 * ── `cn` — THE ONE UTILITY EVERY COMPONENT NEEDS ────────────────────────────
 * `cn` joins class names conditionally AND de-duplicates conflicting Tailwind
 * utilities. That second half is the part people underestimate:
 *
 *     cn("px-2 py-4", "px-6")   // -> "py-4 px-6"   (px-2 was dropped)
 *
 * Plain string concatenation would have produced `px-2 py-4 px-6`, which does
 * not behave the way you'd expect: both `px-2` and `px-6` land in the class
 * attribute and CSS source order — not class-attribute order — decides which
 * wins. That makes component overrides feel random.
 *
 * `cn` solves it, which is what lets every component in `components/ui` accept
 * a `className` prop and let the call site override its defaults predictably:
 *
 *     <Card className="bg-brand/10" />
 *
 * ── WHY THIS FILE JUST RE-EXPORTS ───────────────────────────────────────────
 * shadcn/ui v4 generates components that import `cn` from the `cn` package
 * (a compiled replacement for the old `clsx` + `tailwind-merge` pair — faster
 * and smaller). We re-export it here so application code has one stable import
 * path — `@/lib/utils` — that matches the project's architecture. If the
 * underlying implementation ever changes, only this file changes.
 *
 * ── WHAT BELONGS IN /src/lib ────────────────────────────────────────────────
 * Pure functions with no React and no side effects. Anything that needs hooks,
 * state, or the DOM belongs in `/src/hooks` instead (see
 * `hooks/use-active-section.ts`).
 * ============================================================================
 */

export { cn } from "cn";
