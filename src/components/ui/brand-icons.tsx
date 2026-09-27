/**
 * ============================================================================
 *  brand-icons.tsx — GitHub / LinkedIn / X marks
 * ============================================================================
 *
 * ── WHY NOT LUCIDE REACT? ───────────────────────────────────────────────────
 * `lucide-react` v1 **removed every brand logo** from its icon set (previously
 * available as `Github`, `Linkedin`, `Twitter`, ...). If you upgrade lucide
 * and your build suddenly can't find `Github`, this is why — those exports no
 * longer exist.
 *
 * The options were:
 *   a) Pin lucide-react to 0.x forever.           -> blocks security fixes
 *   b) Add another icon package for 2 icons.      -> new dependency + payload
 *   c) Inline the two SVG paths ourselves.        -> ~1KB, zero deps  ✅
 *
 * We chose (c). Two icons is not worth a dependency, and the components below
 * are plain, hook-free functions, so they work in Server AND Client Components.
 *
 * ── WHY SVG `path` AND NOT AN ICON FONT ─────────────────────────────────────
 * Inline SVG scales losslessly, inherits `currentColor`, and is accessible
 * with no extra work. An icon font can't do any of those reliably.
 *
 * Path data: Simple Icons (CC0-1.0). Each is designed on a 24x24 grid, which
 * is the same grid lucide uses — so these visually match the lucide icons used
 * everywhere else in the UI.
 * ============================================================================
 */

import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared defaults for every brand mark.
 *
 * `fill="currentColor"` is the important bit: it means an icon inherits the
 * CSS `color` of its parent, so `<a className="text-muted-foreground
 * hover:text-brand">` recolours the logo on hover with no extra props.
 *
 * `aria-hidden` + `focusable={false}` keeps the decorative SVG out of the
 * accessibility tree — the accessible name belongs on the wrapping <a> or
 * <button>, not on the glyph itself.
 */
function BrandSvg({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={cn("size-4", className)}
      {...props}
    />
  );
}

export function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BrandSvg {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.52 11.52 0 0 1 3-.405c1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12Z" />
    </BrandSvg>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BrandSvg {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0Z" />
    </BrandSvg>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BrandSvg {...props}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153Zm-1.291 19.491h2.039L6.486 3.24H4.298l13.312 17.404Z" />
    </BrandSvg>
  );
}

/**
 * Lookup table so data-driven UIs can render a brand mark from a string.
 * `data.ts` stores `brand: "github" | "linkedin" | "x"`, and the footer/social
 * row does `<BrandIcon brand={link.brand} />`.
 *
 * Typing the keys as the union of the three names means TypeScript flags a
 * typo'd brand in `data.ts` instead of rendering nothing.
 */
export const brandIcons = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  x: XIcon,
} as const;

export type BrandName = keyof typeof brandIcons;

export function BrandIcon({
  brand,
  className,
}: {
  brand: BrandName;
  className?: string;
}) {
  const Icon = brandIcons[brand];
  return <Icon className={className} />;
}
