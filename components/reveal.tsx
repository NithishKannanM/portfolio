"use client";

import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { fadeUp, stagger, still, viewport } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Scroll-triggered entrance. Every section on the site uses this so the
 * whole page settles with one rhythm.
 *
 * With reduced motion the element renders in its final state immediately —
 * it is never left hidden or mid-transition.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "header";
}) {
  const reduce = useReducedMotion();
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
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  delay?: number;
  as?: "div" | "ul" | "section";
}) {
  const reduce = useReducedMotion();
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

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduce = useReducedMotion();
  const Component = m[as];

  return (
    <Component data-reveal className={className} variants={reduce ? still : fadeUp}>
      {children}
    </Component>
  );
}
