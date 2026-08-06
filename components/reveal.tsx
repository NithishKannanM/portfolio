"use client";

import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { createElement } from "react";

import { fadeUp, stagger, still, viewport } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Scroll-triggered entrance. Every section on the site uses this so the whole
 * page settles with one rhythm.
 *
 * With reduced motion the element renders in its final state immediately — it
 * is never left hidden or mid-transition.
 *
 * `priority` opts out entirely and renders plain markup. Use it for anything
 * that can be the LCP element — Motion server-renders `initial="hidden"` as
 * inline `opacity: 0`, so an above-the-fold reveal defers the largest paint
 * until hydration finishes. That measured ~3.2s of render delay under
 * Lighthouse's mobile CPU throttling. Below-the-fold reveals are unaffected,
 * since off-screen elements are never LCP candidates.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  priority = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "header";
  priority?: boolean;
}) {
  const reduce = useReducedMotion();

  if (priority) {
    return createElement(as, { className }, children);
  }

  const Component = m[as];

  return (
    <Component
      data-reveal
      className={className}
      variants={reduce ? still : fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      transition={reduce ? { duration: 0 } : { delay }}
    >
      {children}
    </Component>
  );
}

/**
 * Parent for staggered children. Pair with <RevealItem>. Used for project
 * grids, skill rows, and the metric strip.
 */
export function RevealGroup({
  children,
  className,
  gap = 0.05,
  delay = 0,
  as = "div",
  priority = false,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  delay?: number;
  as?: "div" | "ul" | "section";
  priority?: boolean;
}) {
  const reduce = useReducedMotion();

  if (priority) {
    return createElement(as, { className: cn(className) }, children);
  }

  const Component = m[as];

  return (
    <Component
      data-reveal
      className={cn(className)}
      variants={reduce ? still : stagger(gap, delay)}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      {children}
    </Component>
  );
}

/**
 * Child of RevealGroup. Inherits the parent's `show`/`hidden` state, so it
 * must match its parent's `priority` setting — a plain group can't drive
 * animated children.
 */
export function RevealItem({
  children,
  className,
  as = "div",
  priority = false,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
  priority?: boolean;
}) {
  const reduce = useReducedMotion();

  if (priority) {
    return createElement(as, { className }, children);
  }

  const Component = m[as];

  return (
    <Component data-reveal className={className} variants={reduce ? still : fadeUp}>
      {children}
    </Component>
  );
}
