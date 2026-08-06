"use client";

import { LazyMotion, domAnimation } from "motion/react";
import type { ReactNode } from "react";

/**
 * Loads only the DOM animation feature set (~15kb instead of the full
 * bundle). `strict` makes `motion.div` throw so we can't accidentally
 * pull the whole library back in — every component must use `m.div`.
 *
 * Layout animations are deliberately not loaded: nothing on this site
 * needs them, and they'd double the bundle.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
