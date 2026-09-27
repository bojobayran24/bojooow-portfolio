"use client";

/**
 * ============================================================================
 *  MotionProvider — one global switch for accessibility
 * ============================================================================
 *
 * Framer Motion's `<MotionConfig reducedMotion="user">` reads the OS-level
 * "Reduce Motion" preference and, when it's on, automatically:
 *
 *   • SKIPS transform animations  (translate / scale / rotate / skew)
 *   • SKIPS layout animations
 *   • STILL RUNS opacity animations
 *
 * That last point is the important one. A fade is not vestibularly
 * triggering — it doesn't imply self-motion — so keeping opacities animating
 * means the site still feels alive and, crucially, content still becomes
 * visible. If we killed opacity too, our `whileInView` reveals would leave
 * everything stuck at `opacity: 0`. That's the classic reduced-motion bug:
 * disabling motion accidentally hides the page.
 *
 * ── WHY A PROVIDER INSTEAD OF CHECKING IN EVERY COMPONENT ───────────────────
 * Doing this per-component means 20 copies of the same guard and 20 chances to
 * forget one. One provider makes the accessible path the default, so a new
 * animation added six months from now inherits the correct behaviour for free.
 *
 * ── SERVER / CLIENT BOUNDARY NOTE ───────────────────────────────────────────
 * This is a Client Component, but `{children}` is passed to it from a Server
 * Component (`app/layout.tsx`). That's legal and important: the children are
 * rendered on the server and handed over as already-serialised RSC payload.
 * Wrapping them in a client provider does NOT force them to become client
 * components — they keep their server-only advantages.
 * ============================================================================
 */

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    /* `"user"` = delegate to the OS setting. Other valid values:
     *   "always" -> always reduce
     *   "never"  -> never reduce (ignore the OS)
     * We also set a default spring-free ease curve here so every animation in
     * the app starts from the same motion language. */
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionConfig>
  );
}
