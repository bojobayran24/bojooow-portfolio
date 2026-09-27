/**
 * ============================================================================
 *  RootLayout — the shell every page renders inside
 * ============================================================================
 *
 * ── SERVER COMPONENT BY DEFAULT ─────────────────────────────────────────────
 * There is no `"use client"` here, and that's deliberate. `layout.tsx` runs on
 * the server, so:
 *   • the font setup and metadata below cost the browser zero JavaScript
 *   • `{children}` stays server-rendered
 *
 * The interactive pieces (`MotionProvider`, `ScrollProgress`, `Navbar`) are
 * Client Components that this Server Component *imports and composes*. That's
 * the pattern to reach for: keep the boundary at the leaf, not at the root.
 * Next.js renders them on the server for the initial HTML, then hydrates just
 * those islands in the browser.
 * ============================================================================
 */

import type { Metadata } from "next";
import { Fira_Code, Inter, Space_Grotesk } from "next/font/google";
import { MotionProvider, ScrollProgress } from "@/components/animations";
import { Navbar } from "@/components/sections/navbar";
import { profile } from "@/data/data";
import "./globals.css";

/* ==========================================================================
 * FONTS
 * --------------------------------------------------------------------------
 * `next/font/google` downloads the font files AT BUILD TIME and self-hosts
 * them from your own domain. Compared with a plain <link> to Google Fonts:
 *
 *   • no third-party DNS lookup, no render-blocking request to Google
 *   • no layout shift, because Next injects `size-adjust`-tuned fallbacks
 *   • no privacy leak to a third party
 *
 * Each loader emits a CSS custom property (`variable`) which `globals.css`
 * maps into Tailwind's `--font-sans` / `--font-mono` / `--font-display` theme
 * tokens, so `font-display` is a real utility class.
 * ======================================================================== */

/* The three faces below are the ones the EXISTING portfolio already uses
 * (see its <link> to fonts.googleapis.com), so the redesign carries the brand's
 * typography forward rather than replacing it. */

/** Body copy — Inter, the original portfolio's body face. */
const interBody = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Display face — Space Grotesk, the original's heading face. Geometric with a
 * slightly mechanical edge, which is what gives the hero its "engineered" feel.
 * Reserved for h1/h2 and big numbers only; at body sizes it gets hard to read,
 * so it is deliberately NOT wired to `font-sans`.
 */
const spaceGroteskDisplay = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  /* Trim the variable-font weight axis to what we actually use. Fewer
     instances downloaded and a smaller subset. */
  weight: ["500", "600", "700"],
});

/** Mono — Fira Code, the original's code face. Used for eyebrow labels, stats,
 *  and anything that should read as "machine output". */
const firaCode = Fira_Code({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

/* ==========================================================================
 * METADATA
 * --------------------------------------------------------------------------
 * Next.js reads this exported object and generates the <head> tags. Using the
 * Metadata API instead of hand-written <meta> JSX means the server can stream
 * them and search engines/crawlers see them in the initial HTML.
 * ======================================================================== */

export const metadata: Metadata = {
  /* Matches the existing portfolio's own <title> format closely enough to keep
   * search/social continuity: "<name> | <role> & <second role>". */
  title: {
    default: `${profile.name} | ${profile.role} & ${profile.roleSecondary}`,
    template: `%s | ${profile.name}`,
  },
  description: profile.tagline,
  keywords: [
    "Bojooow",
    "Systems Analyst",
    "AI-Augmented Builder",
    "Full-Stack Developer",
    "PHP",
    "ASP.NET Core",
    "Philippine Statistics Authority",
  ],
  authors: [{ name: profile.name }],
  /* The favicon is the existing portfolio's logo, so the browser tab matches
   * the brand rather than showing the default Next.js mark. */
  icons: { icon: profile.logo },
  openGraph: {
    title: `${profile.name} | ${profile.role} & ${profile.roleSecondary}`,
    description: profile.tagline,
    type: "website",
  },
};

/* ==========================================================================
 * LAYOUT
 * ======================================================================== */

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      /* ── WHY `dark` IS HARD-CODED ─────────────────────────────────────────
       * This site is dark-only by design. Putting `dark` on <html> activates
       * every `dark:` variant in shadcn/ui's components, and the `.dark` token
       * block in globals.css supplies the palette. No theme-toggle flash, no
       * hydration mismatch, no `next-themes` dependency for a single theme. */
      className={`dark ${interBody.variable} ${spaceGroteskDisplay.variable} ${firaCode.variable} h-full antialiased`}
      /* ── NEXT.JS 16 SPECIFIC ─────────────────────────────────────────────
       * globals.css sets `scroll-behavior: smooth` on <html>, which gives us
       * smooth anchor scrolling during nav clicks.
       *
       * Next.js used to override that during SPA route transitions so a new
       * page would jump to the top instantly instead of slowly gliding. In
       * Next.js 16 that override is OFF by default. This attribute opts back
       * into it, giving us the best of both:
       *   • navigating to a new route  -> instant scroll to top (snappy)
       *   • clicking an in-page anchor -> smooth glide to the section
       * Without it, route changes would animate a long smooth scroll. */
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col">
        {/* ── SKIP LINK ───────────────────────────────────────────────────────
            The first focusable element on the page. Keyboard users can hit Tab
            once and jump straight past the navbar into the content. It's
            visually hidden (`sr-only`) until it receives focus, at which point
            `not-sr-only` + the focus: utilities reveal it. Cheap to add, and
            the difference between a site that's usable and one that isn't for
            anyone navigating by keyboard. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-black"
        >
          Skip to content
        </a>

        {/* MotionProvider must wrap everything that animates, so the global
            reduced-motion policy reaches every Motion component. */}
        <MotionProvider>
          {/* Fixed, top-most, purely decorative scroll indicator. */}
          <ScrollProgress />

          {/* Fixed glass navbar. Rendered once here rather than per page so it
              survives route changes without re-mounting or re-animating. */}
          <Navbar />

          {/* `id="main-content"` matches the skip link above. */}
          <main id="main-content" className="flex flex-1 flex-col">
            {children}
          </main>
        </MotionProvider>
      </body>
    </html>
  );
}
