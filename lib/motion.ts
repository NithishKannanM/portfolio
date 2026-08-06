import type { Transition, Variants } from "motion/react";

/**
 * Single source of truth for motion. Nothing in this codebase should
 * hand-tune an easing or duration — import from here so the whole site
 * moves with one character. Mirrors the --ease-out-expo / --dur-* custom
 * properties in app/globals.css; keep the two in sync.
 */

export const ease = [0.22, 1, 0.36, 1] as const; // expo-out

export const dur = {
  fast: 0.16,
  base: 0.28,
  slow: 0.52,
} as const;

export const transition: Transition = { duration: dur.base, ease };

/** Standard entrance: rise and resolve. Distance is small on purpose —
 *  instruments settle, they don't fly in. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition },
};

/** Parent for staggered lists. Children use `fadeUp`. */
export const stagger = (staggerChildren = 0.05, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

/** Panels wipe open from their top edge rather than scaling. */
export const panelReveal: Variants = {
  hidden: { opacity: 0, clipPath: "inset(0 0 100% 0)" },
  show: {
    opacity: 1,
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: dur.slow, ease },
  },
};

/** Shared viewport config so every section triggers at the same point. */
export const viewport = { once: true, margin: "-12% 0px -12% 0px" } as const;

/**
 * Reduced-motion variants. `useMotionVariants` in components/motion-provider
 * swaps these in so animated elements land on their final state with no
 * movement — never on a hidden or half-rendered one.
 */
export const still: Variants = {
  hidden: { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" },
  show: { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", transition: { duration: 0 } },
};
