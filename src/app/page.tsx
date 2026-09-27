/**
 * ============================================================================
 *  Home — composes the portfolio sections
 * ============================================================================
 *
 * ── THIS IS A SERVER COMPONENT ──────────────────────────────────────────────
 * Note the absence of `"use client"`. This file does nothing interactive: it
 * imports sections and lays them out. Keeping it server-side means the page
 * shell and all static copy cost the browser zero JavaScript.
 *
 * Only `Hero` and `Navbar` are Client Components (they need scroll and pointer
 * hooks). Next.js turns each client import into its own small island of
 * interactivity rather than making the whole page client-side.
 *
 * ── INFORMATION ARCHITECTURE ────────────────────────────────────────────────
 * This mirrors the existing portfolio's own order, which is a sound funnel:
 *
 *   1. Hero        — who you are (the hook)
 *   2. Skills      — what you work with (the toolkit)
 *   3. Experience  — where you've applied it (credibility)
 *   4. Projects    — what you actually built (the evidence)
 *   5. Certificate — third-party recognition (external validation)
 *   6. Contact     — how to start a conversation (the invitation)
 *
 * Note that Skills and Certificate were NOT in the original brief but ARE in the
 * existing portfolio. They're kept because the Certificate is the single
 * strongest credibility item on the page, and the Skills section is where the
 * PHP / .NET / SQL Server split is explained.
 *
 * Every `id` below must match `navItems` in `src/data/data.ts` — both the navbar
 * anchors and `useActiveSection` resolve sections by id.
 * ============================================================================
 */

import { Hero } from "@/components/sections/hero";
import { Skills } from "@/components/sections/skills";
import { Experience } from "@/components/sections/experience";
import { Projects } from "@/components/sections/projects";
import { Certificate } from "@/components/sections/certificate";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Skills />
      <Experience />
      <Projects />
      <Certificate />
      <Contact />
    </>
  );
}
